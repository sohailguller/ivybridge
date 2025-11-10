import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  console.log('=== Connecting Mentor Stripe Account ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      console.error('User not authenticated');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✓ User authenticated:', user.id);

    // Check if user is a mentor
    if (user.account_type !== "mentor" && !user.mentor_profile_id) {
      console.error('User is not a mentor');
      return Response.json({ error: 'Not authorized as mentor' }, { status: 403 });
    }
    console.log('✓ User is a mentor');

    // Get mentor profile
    const profiles = await base44.asServiceRole.entities.MentorProfile.filter({
      user_id: user.id
    });

    if (profiles.length === 0) {
      console.error('Mentor profile not found');
      return Response.json({ error: 'Mentor profile not found' }, { status: 404 });
    }

    const mentorProfile = profiles[0];
    console.log('✓ Mentor profile found:', mentorProfile.id);

    // Check if already connected
    if (mentorProfile.stripe_connect_id) {
      console.log('Already connected to Stripe:', mentorProfile.stripe_connect_id);
      return Response.json({
        alreadyConnected: true,
        accountId: mentorProfile.stripe_connect_id
      });
    }

    // Create Stripe Connect account
    console.log('Creating Stripe Connect account...');
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      metadata: {
        user_id: user.id,
        mentor_profile_id: mentorProfile.id
      }
    });
    console.log('✓ Stripe Connect account created:', account.id);

    // Save to mentor profile
    await base44.asServiceRole.entities.MentorProfile.update(mentorProfile.id, {
      stripe_connect_id: account.id
    });
    console.log('✓ Stripe Connect ID saved to mentor profile');

    // Create account link for onboarding
    const origin = req.headers.get('origin') || 'https://ivy-bridge-f5bb348d.base44.app';
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/MentorDashboard`,
      return_url: `${origin}/MentorDashboard?connect_success=true`,
      type: 'account_onboarding',
    });
    console.log('✓ Onboarding link created');

    return Response.json({
      accountId: account.id,
      onboardingUrl: accountLink.url
    });

  } catch (error) {
    console.error('=== Connect Stripe Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({ 
      error: error.message || 'Failed to connect Stripe account' 
    }, { status: 500 });
  }
});