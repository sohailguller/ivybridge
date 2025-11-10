import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mentorProfileId, planType } = await req.json();
    
    const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: mentorProfileId });
    if (mentorProfiles.length === 0) {
      return Response.json({ error: 'Mentor not found' }, { status: 404 });
    }
    const mentorProfile = mentorProfiles[0];

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12);

    const subscription = await base44.asServiceRole.entities.Subscription.create({
      student_id: user.id,
      mentor_id: mentorProfile.user_id,
      mentor_profile_id: mentorProfile.id,
      plan_type: planType,
      amount: planType === 'monthly' ? 425 : 5000,
      status: "pending",
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      months_remaining: 12
    });

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      await base44.asServiceRole.entities.User.update(user.id, { stripe_customer_id: customerId });
    }

    const amount = planType === 'monthly' ? 42500 : 500000;
    const mode = planType === 'monthly' ? 'subscription' : 'payment';
    
    const origin = req.headers.get('origin') || 'https://ivy-bridge-f5bb348d.base44.app';
    
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `IvyBridge ${planType === 'monthly' ? 'Monthly' : 'Annual'} Mentorship`,
            description: `Mentorship with ${mentorProfile.university} mentor`,
          },
          unit_amount: amount,
          ...(planType === 'monthly' ? { recurring: { interval: 'month' } } : {})
        },
        quantity: 1,
      }],
      mode: mode,
      success_url: `${origin}/StudentDashboard?payment_success=true`,
      cancel_url: `${origin}/MentorProfile?id=${mentorProfileId}`,
      metadata: {
        subscription_id: subscription.id,
        user_id: user.id,
        mentor_profile_id: mentorProfile.id,
        mentor_user_id: mentorProfile.user_id,
        plan_type: planType
      }
    };

    if (planType === 'monthly') {
      sessionConfig.subscription_data = {
        metadata: {
          subscription_id: subscription.id,
          user_id: user.id,
          mentor_profile_id: mentorProfile.id
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({
      url: session.url,
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});