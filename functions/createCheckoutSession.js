import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2024-12-18.acacia',
});

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

    // Get mentor profile
    const mentorProfiles = await base44.entities.MentorProfile.filter({ id: mentorProfileId });
    if (mentorProfiles.length === 0) {
      return Response.json({ error: 'Mentor not found' }, { status: 404 });
    }
    const mentorProfile = mentorProfiles[0];

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_id: user.id,
          account_type: user.account_type
        }
      });
      customerId = customer.id;
      
      // Update user with customer ID
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    }

    // Determine price based on plan
    let priceId, amount, mode;
    if (planType === 'monthly') {
      // Use the monthly recurring price ID from your Stripe product catalog
      priceId = 'price_1SPAhYPVHYXDQ24FbMDRdZJc'; // $425/month
      amount = 425;
      mode = 'subscription';
    } else if (planType === 'annual') {
      // Use the one-time annual price ID from your Stripe product catalog
      priceId = 'price_1SPAiCPVHYXDQ24FPps95Yw5'; // $5000 one-time
      amount = 5000;
      mode = 'payment';
    } else {
      return Response.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${req.headers.get('origin')}/StudentDashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/MentorProfile?id=${mentorProfileId}`,
      metadata: {
        user_id: user.id,
        mentor_profile_id: mentorProfileId,
        mentor_user_id: mentorProfile.user_id,
        plan_type: planType,
        amount: amount.toString()
      },
      subscription_data: planType === 'monthly' ? {
        metadata: {
          user_id: user.id,
          mentor_profile_id: mentorProfileId,
          mentor_user_id: mentorProfile.user_id,
          plan_type: planType
        }
      } : undefined
    });

    return Response.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return Response.json({ 
      error: error.message || 'Failed to create checkout session' 
    }, { status: 500 });
  }
});