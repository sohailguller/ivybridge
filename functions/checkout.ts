import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// Your Stripe Price IDs from the product catalog
const PRICE_IDS = {
  monthly: 'price_1SPAhYPVHYXDQ24FbMDRdZJc',  // $425/month
  annual: 'price_1SPAiCPVHYXDQ24FPps95Yw5'    // $5000 one-time
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mentorProfileId, planType } = await req.json();
    
    if (!mentorProfileId || !planType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

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

    const priceId = PRICE_IDS[planType];
    const mode = planType === 'monthly' ? 'subscription' : 'payment';
    const origin = req.headers.get('origin') || 'https://ivy-bridge-f5bb348d.base44.app';
    
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
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
    console.error('Checkout error:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});