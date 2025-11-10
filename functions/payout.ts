import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { mentorId, amount } = await req.json();

    const profiles = await base44.asServiceRole.entities.MentorProfile.filter({ user_id: mentorId });
    if (profiles.length === 0) {
      return Response.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const mentorProfile = profiles[0];
    if (!mentorProfile.stripe_connect_id) {
      return Response.json({ error: 'No Stripe account' }, { status: 400 });
    }

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      destination: mentorProfile.stripe_connect_id,
      description: `Mentorship payout`,
      metadata: {
        mentor_id: mentorId,
        mentor_profile_id: mentorProfile.id
      }
    });

    return Response.json({
      success: true,
      transferId: transfer.id
    });

  } catch (error) {
    console.error('Payout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});