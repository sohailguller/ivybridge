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

    if (!mentorProfileId || !planType) {
      return Response.json({ error: 'Missing mentorProfileId or planType' }, { status: 400 });
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
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    }

    // Setup pricing
    let amount, mode, lineItems;
    
    if (planType === 'monthly') {
      amount = 42500;
      mode = 'subscription';
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'IvyBridge Monthly Mentorship',
            description: `Mentorship with ${mentorProfile.university} mentor`,
          },
          unit_amount: amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }];
    } else if (planType === 'annual') {
      amount = 500000;
      mode = 'payment';
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'IvyBridge Annual Mentorship',
            description: `12-month mentorship with ${mentorProfile.university} mentor`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }];
    } else {
      return Response.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Get origin for URLs
    const origin = req.headers.get('origin') || 'https://ivy-bridge-f5bb348d.base44.app';

    // Create checkout session
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: mode,
      success_url: `${origin}/StudentDashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/MentorProfile?id=${mentorProfileId}`,
      metadata: {
        user_id: user.id,
        mentor_profile_id: mentorProfileId,
        mentor_user_id: mentorProfile.user_id,
        plan_type: planType,
        amount: (amount / 100).toString()
      }
    };

    // Add subscription metadata for monthly plans
    if (planType === 'monthly') {
      sessionConfig.subscription_data = {
        metadata: {
          user_id: user.id,
          mentor_profile_id: mentorProfileId,
          mentor_user_id: mentorProfile.user_id,
          plan_type: planType
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create checkout' 
    }, { status: 500 });
  }
});