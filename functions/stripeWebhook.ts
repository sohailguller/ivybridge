import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@^14.14.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const signature = req.headers.get('stripe-signature');
        if (!signature) {
             return Response.json({ error: 'No signature' }, { status: 400 });
        }

        const body = await req.text();
        let event;

        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                endpointSecret
            );
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        // Initialize Base44 client with service role for admin operations
        const base44 = createClientFromRequest(req);
        
        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userId, mentorProfileId, planType } = session.metadata || {};

            if (userId && mentorProfileId) {
                console.log(`Processing successful payment for user ${userId}, mentor ${mentorProfileId}`);

                // 1. Create Subscription Record
                const startDate = new Date();
                const endDate = new Date();
                if (planType === 'monthly') {
                    endDate.setMonth(endDate.getMonth() + 1);
                } else {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }

                await base44.asServiceRole.entities.Subscription.create({
                    student_id: userId,
                    mentor_profile_id: mentorProfileId,
                    plan_type: planType,
                    amount: session.amount_total / 100, // Convert from cents
                    status: 'active',
                    stripe_subscription_id: session.subscription,
                    stripe_checkout_session_id: session.id,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    months_remaining: planType === 'monthly' ? 1 : 12
                });

                // 2. Update Mentor Stats (Total Students)
                const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: mentorProfileId });
                if (mentorProfiles.length > 0) {
                    const mentor = mentorProfiles[0];
                    await base44.asServiceRole.entities.MentorProfile.update(mentor.id, {
                        total_students: (mentor.total_students || 0) + 1
                    });
                }

                // 3. Create Notification for Student
                await base44.asServiceRole.entities.Notification.create({
                    user_id: userId,
                    type: 'subscription',
                    title: 'Subscription Active',
                    message: `You have successfully subscribed to mentorship!`,
                    link: '/StudentDashboard',
                    is_read: false
                });

                // 4. Create Notification for Mentor
                if (mentorProfiles.length > 0) {
                    const mentor = mentorProfiles[0];
                    await base44.asServiceRole.entities.Notification.create({
                        user_id: mentor.user_id,
                        type: 'subscription',
                        title: 'New Student',
                        message: `You have a new student subscription!`,
                        link: '/MentorDashboard',
                        is_read: false
                    });
                }
            }
        }

        return Response.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});