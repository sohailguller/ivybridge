import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  console.log('=== Checkout Session Request ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    let user;
    try {
      user = await base44.auth.me();
      console.log('User authenticated:', user.id);
    } catch (authError) {
      console.error('Auth failed:', authError);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { mentorProfileId, planType } = requestBody;

    if (!mentorProfileId || !planType) {
      console.error('Missing params:', { mentorProfileId, planType });
      return Response.json({ error: 'Missing mentorProfileId or planType' }, { status: 400 });
    }

    // Get mentor profile
    console.log('Fetching mentor profile:', mentorProfileId);
    const mentorProfiles = await base44.entities.MentorProfile.filter({ id: mentorProfileId });
    if (mentorProfiles.length === 0) {
      console.error('Mentor not found:', mentorProfileId);
      return Response.json({ error: 'Mentor not found' }, { status: 404 });
    }
    const mentorProfile = mentorProfiles[0];
    console.log('Mentor found:', mentorProfile.id);

    // Create the subscription record FIRST with pending status
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12);

    console.log('Creating subscription record...');
    const subscription = await base44.entities.Subscription.create({
      student_id: user.id,
      mentor_id: mentorProfile.user_id,
      mentor_profile_id: mentorProfile.id,
      plan_type: planType,
      amount: planType === 'monthly' ? 425 : 5000,
      status: "pending",
      start_date: startDate,
      end_date: endDate.toISOString().split('T')[0],
      months_remaining: 12,
      stripe_subscription_id: `pending_${Date.now()}_${user.id}`
    });
    console.log('Subscription created:', subscription.id);

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      console.log('Creating Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      console.log('Stripe customer created:', customerId);
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    } else {
      console.log('Using existing Stripe customer:', customerId);
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
      console.error('Invalid plan type:', planType);
      return Response.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Get origin for URLs
    const origin = req.headers.get('origin') || 'https://ivy-bridge-f5bb348d.base44.app';
    console.log('Using origin:', origin);

    // Create checkout session with subscription ID in metadata
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: mode,
      success_url: `${origin}/StudentDashboard?payment_success=true`,
      cancel_url: `${origin}/MentorProfile?id=${mentorProfileId}`,
      metadata: {
        user_id: user.id,
        subscription_id: subscription.id,
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
          subscription_id: subscription.id,
          mentor_profile_id: mentorProfileId,
          mentor_user_id: mentorProfile.user_id,
          plan_type: planType
        }
      };
    }

    console.log('Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('Stripe session created:', session.id);

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
    return Response.json({ 
      error: error.message || 'Failed to create checkout' 
    }, { status: 500 });
  }
});