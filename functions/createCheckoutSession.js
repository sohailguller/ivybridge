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
      return Response.json({ error: 'Missing required fields: mentorProfileId and planType' }, { status: 400 });
    }

    // Get mentor profile
    const mentorProfiles = await base44.entities.MentorProfile.filter({ id: mentorProfileId });
    if (mentorProfiles.length === 0) {
      return Response.json({ error: 'Mentor profile not found' }, { status: 404 });
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

    // Determine price and amount based on plan
    let amount, mode;
    let line_items;

    if (planType === 'monthly') {
      amount = 42500; // $425 in cents
      mode = 'subscription';
      
      // Create line items with inline price for monthly subscription
      line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'IvyBridge Monthly Mentorship',
            description: `12-month mentorship program with ${mentorProfile.university} mentor`,
          },
          unit_amount: amount,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }];
    } else if (planType === 'annual') {
      amount = 500000; // $5000 in cents
      mode = 'payment';
      
      // Create line items with inline price for one-time payment
      line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'IvyBridge Annual Mentorship',
            description: `12-month mentorship program with ${mentorProfile.university} mentor (Save $1,100)`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }];
    } else {
      return Response.json({ error: 'Invalid plan type. Must be "monthly" or "annual"' }, { status: 400 });
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get('origin') || 'https://ivy-bridge-f5bb348d.base44.app';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: line_items,
      mode: mode,
      success_url: `${origin}/StudentDashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/MentorProfile?id=${mentorProfileId}`,
      metadata: {
        user_id: user.id,
        mentor_profile_id: mentorProfileId,
        mentor_user_id: mentorProfile.user_id,
        plan_type: planType,
        amount: (amount / 100).toString()
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

    console.log('Checkout session created:', session.id, 'for user:', user.id, 'plan:', planType);

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