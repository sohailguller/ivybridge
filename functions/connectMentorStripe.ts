import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2024-12-18.acacia',
});

const connectClientId = Deno.env.get("STRIPE_CONNECT_CLIENT_ID");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a mentor
    if (user.account_type !== 'mentor') {
      return Response.json({ error: 'Only mentors can connect Stripe accounts' }, { status: 403 });
    }

    // Get mentor profile
    const mentorProfiles = await base44.entities.MentorProfile.filter({ user_id: user.id });
    if (mentorProfiles.length === 0) {
      return Response.json({ error: 'Mentor profile not found' }, { status: 404 });
    }
    const mentorProfile = mentorProfiles[0];

    // Check if already connected
    if (mentorProfile.stripe_connect_id) {
      return Response.json({ 
        message: 'Already connected',
        accountId: mentorProfile.stripe_connect_id 
      });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        user_id: user.id,
        mentor_profile_id: mentorProfile.id
      }
    });

    // Save Connect account ID
    await base44.entities.MentorProfile.update(mentorProfile.id, {
      stripe_connect_id: account.id
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get('origin')}/MentorDashboard?connect_refresh=true`,
      return_url: `${req.headers.get('origin')}/MentorDashboard?connect_success=true`,
      type: 'account_onboarding',
    });

    return Response.json({
      accountId: account.id,
      onboardingUrl: accountLink.url
    });

  } catch (error) {
    console.error('Error connecting Stripe account:', error);
    return Response.json({ 
      error: error.message || 'Failed to connect Stripe account' 
    }, { status: 500 });
  }
});