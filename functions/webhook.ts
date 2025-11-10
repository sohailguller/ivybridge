import Stripe from 'npm:stripe@16.14.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const subscriptionId = session.metadata.subscription_id;
      const mentorProfileId = session.metadata.mentor_profile_id;

      await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
        status: 'active',
        stripe_subscription_id: session.subscription || session.id
      });

      if (mentorProfileId) {
        const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: mentorProfileId });
        if (mentorProfiles.length > 0) {
          const mentor = mentorProfiles[0];
          await base44.asServiceRole.entities.MentorProfile.update(mentorProfileId, {
            total_students: (mentor.total_students || 0) + 1
          });
        }
      }

      if (session.metadata.user_id) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: session.metadata.user_id,
          type: 'subscription',
          title: 'Mentorship Activated!',
          message: 'Your mentorship is now active.',
          link: '/StudentDashboard'
        });
      }

      if (session.metadata.mentor_user_id) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: session.metadata.mentor_user_id,
          type: 'subscription',
          title: 'New Student!',
          message: 'You have a new student.',
          link: '/MentorDashboard'
        });
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});