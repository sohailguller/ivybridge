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

    // Only admins can trigger payouts
    if (user.role !== 'admin') {
      return Response.json({ error: 'Only admins can create payouts' }, { status: 403 });
    }

    const { mentorProfileId, amount, description } = await req.json();

    if (!mentorProfileId || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get mentor profile
    const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: mentorProfileId });
    if (mentorProfiles.length === 0) {
      return Response.json({ error: 'Mentor not found' }, { status: 404 });
    }
    const mentorProfile = mentorProfiles[0];

    if (!mentorProfile.stripe_connect_id) {
      return Response.json({ error: 'Mentor has not connected their Stripe account' }, { status: 400 });
    }

    // Create transfer to mentor's connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: mentorProfile.stripe_connect_id,
      description: description || `Payout for mentorship services`,
      metadata: {
        mentor_profile_id: mentorProfileId,
        mentor_user_id: mentorProfile.user_id
      }
    });

    // Get mentor user to send email
    const users = await base44.asServiceRole.entities.User.filter({ id: mentorProfile.user_id });
    if (users.length > 0) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: users[0].email,
        subject: 'IvyBridge - Payout Processed',
        body: `
          <h2>Payout Processed</h2>
          <p>A payout of $${amount.toFixed(2)} has been sent to your connected Stripe account.</p>
          <p>The funds should arrive in your bank account within 2-3 business days.</p>
          <p>Transfer ID: ${transfer.id}</p>
        `
      });
    }

    return Response.json({
      transferId: transfer.id,
      amount: amount,
      status: transfer.status
    });

  } catch (error) {
    console.error('Error creating payout:', error);
    return Response.json({ 
      error: error.message || 'Failed to create payout' 
    }, { status: 500 });
  }
});