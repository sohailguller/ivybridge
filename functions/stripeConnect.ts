import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || (user.account_type !== "mentor" && !user.mentor_profile_id)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const profiles = await base44.asServiceRole.entities.MentorProfile.filter({ user_id: user.id });
    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const mentorProfile = profiles[0];

    if (mentorProfile.stripe_connect_id) {
      return Response.json({
        alreadyConnected: true,
        accountId: mentorProfile.stripe_connect_id
      });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      metadata: {
        user_id: user.id,
        mentor_profile_id: mentorProfile.id
      }
    });

    await base44.asServiceRole.entities.MentorProfile.update(mentorProfile.id, {
      stripe_connect_id: account.id
    });

    const origin = req.headers.get('origin') || 'https://ivy-bridge-f5bb348d.base44.app';
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/MentorDashboard`,
      return_url: `${origin}/MentorDashboard?connect_success=true`,
      type: 'account_onboarding',
    });

    return Response.json({
      accountId: account.id,
      onboardingUrl: accountLink.url
    });

  } catch (error) {
    console.error('Connect error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});