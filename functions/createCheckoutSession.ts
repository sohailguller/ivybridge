import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  console.log('=== Creating Checkout Session ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      console.error('❌ User not authenticated');
      return Response.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }
    console.log('✓ User authenticated:', user.id, user.email);

    // Parse request body
    let body;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      body = JSON.parse(bodyText);
      console.log('Parsed body:', body);
    } catch (e) {
      console.error('❌ Failed to parse request body:', e);
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { mentorProfileId, planType } = body;
    
    if (!mentorProfileId || !planType) {
      console.error('❌ Missing required parameters');
      console.error('mentorProfileId:', mentorProfileId);
      console.error('planType:', planType);
      return Response.json({ error: 'Missing mentorProfileId or planType' }, { status: 400 });
    }
    console.log('✓ Request params validated');

    // Get mentor profile
    console.log('Fetching mentor profile:', mentorProfileId);
    const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: mentorProfileId });
    if (mentorProfiles.length === 0) {
      console.error('❌ Mentor profile not found:', mentorProfileId);
      return Response.json({ error: 'Mentor not found' }, { status: 404 });
    }
    const mentorProfile = mentorProfiles[0];
    console.log('✓ Mentor profile found:', mentorProfile.id, 'User:', mentorProfile.user_id);

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12);

    // Create subscription record with PENDING status
    console.log('Creating subscription record...');
    const subscriptionData = {
      student_id: user.id,
      mentor_id: mentorProfile.user_id,
      mentor_profile_id: mentorProfile.id,
      plan_type: planType,
      amount: planType === 'monthly' ? 425 : 5000,
      status: "pending",
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      months_remaining: 12
    };
    console.log('Subscription data:', subscriptionData);

    const subscription = await base44.asServiceRole.entities.Subscription.create(subscriptionData);
    console.log('✓ Subscription created:', subscription.id, 'Status: pending');

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      await base44.asServiceRole.entities.User.update(user.id, { stripe_customer_id: customerId });
      console.log('✓ Stripe customer created:', customerId);
    } else {
      console.log('✓ Using existing Stripe customer:', customerId);
    }

    // Setup pricing based on plan type
    const amount = planType === 'monthly' ? 42500 : 500000;
    const mode = planType === 'monthly' ? 'subscription' : 'payment';
    console.log('Stripe mode:', mode, 'Amount:', amount);
    
    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `IvyBridge ${planType === 'monthly' ? 'Monthly' : 'Annual'} Mentorship`,
          description: `Mentorship with ${mentorProfile.university} mentor - ${mentorProfile.major}`,
        },
        unit_amount: amount,
        ...(planType === 'monthly' ? { recurring: { interval: 'month' } } : {})
      },
      quantity: 1,
    }];

    // Get origin for redirect URLs
    const origin = req.headers.get('origin') || 'https://ivy-bridge-f5bb348d.base44.app';
    console.log('Origin:', origin);

    // Create Stripe checkout session
    console.log('Creating Stripe checkout session...');
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
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

    // Add subscription metadata for monthly plans
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
    console.log('✓ Stripe checkout session created:', session.id);
    console.log('✓ Checkout URL:', session.url);

    return Response.json({
      sessionId: session.id,
      url: session.url,
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('=== Checkout Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    return Response.json({ 
      error: error.message || 'Failed to create checkout session',
      details: error.stack
    }, { status: 500 });
  }
});