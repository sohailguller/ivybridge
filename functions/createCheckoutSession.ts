import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only students can subscribe
    if (user.account_type === 'mentor') {
      return Response.json({ error: 'Mentors cannot subscribe to other mentors' }, { status: 400 });
    }

    // Parse request
    const { mentorProfileId, planType } = await req.json();

    if (!mentorProfileId || !planType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get mentor profile
    const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: mentorProfileId });
    if (mentorProfiles.length === 0) {
      return Response.json({ error: 'Mentor not found' }, { status: 404 });
    }
    const mentorProfile = mentorProfiles[0];

    // Get mentor user for name
    const mentorUsers = await base44.asServiceRole.entities.User.filter({ id: mentorProfile.user_id });
    const mentorUser = mentorUsers[0];

    // Calculate dates and amount
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 12);

    let amount, monthsRemaining;
    if (planType === 'monthly') {
      amount = 425;
      monthsRemaining = 12;
    } else if (planType === 'annual') {
      amount = 5000;
      monthsRemaining = 12;
    } else {
      return Response.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Create subscription record with pending status
    const subscription = await base44.asServiceRole.entities.Subscription.create({
      student_id: user.id,
      mentor_profile_id: mentorProfileId,
      plan_type: planType,
      amount: amount,
      status: 'pending',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      months_remaining: monthsRemaining
    });

    console.log('Created pending subscription:', subscription.id);

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || user.email,
        metadata: {
          user_id: user.id,
          app: 'ivybridge'
        }
      });
      customerId = customer.id;
      
      // Update user with stripe customer ID
      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId
      });
      
      console.log('Created Stripe customer:', customerId);
    }

    // Setup checkout session configuration
    let lineItems, mode, subscriptionData;

    if (planType === 'monthly') {
      // Monthly recurring subscription
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Monthly Mentorship with ${mentorUser?.full_name || 'Mentor'}`,
            description: `12-month commitment • ${mentorProfile.university} • ${mentorProfile.major}`,
          },
          unit_amount: amount * 100,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
        },
        quantity: 1,
      }];
      mode = 'subscription';
      subscriptionData = {
        metadata: {
          subscription_id: subscription.id,
          student_id: user.id,
          mentor_profile_id: mentorProfileId,
          plan_type: planType,
        },
      };
    } else {
      // Annual one-time payment
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Annual Mentorship with ${mentorUser?.full_name || 'Mentor'}`,
            description: `12-month program • ${mentorProfile.university} • ${mentorProfile.major}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }];
      mode = 'payment';
    }

    // Determine origin for redirect URLs - use the request origin
    const requestUrl = new URL(req.url);
    const origin = requestUrl.origin;

    console.log('Creating checkout session with origin:', origin);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: mode,
      success_url: `${origin}/StudentDashboard?payment_success=true`,
      cancel_url: `${origin}/BrowseMentors`,
      metadata: {
        subscription_id: subscription.id,
        student_id: user.id,
        mentor_profile_id: mentorProfileId,
        plan_type: planType,
      },
      ...(subscriptionData && { subscription_data: subscriptionData }),
    });

    console.log('Created checkout session:', session.id);

    // Update subscription with checkout session ID
    await base44.asServiceRole.entities.Subscription.update(subscription.id, {
      stripe_checkout_session_id: session.id
    });

    return Response.json({
      sessionId: session.id,
      url: session.url,
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
});