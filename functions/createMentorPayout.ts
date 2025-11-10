import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  console.log('=== Creating Mentor Payout ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user and check admin role
    const user = await base44.auth.me();
    if (!user) {
      console.error('User not authenticated');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      console.error('User is not an admin');
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    console.log('✓ Admin authenticated:', user.id);

    // Parse request body
    const { mentorId, amount } = await req.json();
    
    if (!mentorId || !amount) {
      console.error('Missing mentorId or amount');
      return Response.json({ error: 'Missing mentorId or amount' }, { status: 400 });
    }
    console.log('✓ Payout params:', { mentorId, amount });

    // Get mentor profile
    const profiles = await base44.asServiceRole.entities.MentorProfile.filter({ 
      user_id: mentorId 
    });

    if (profiles.length === 0) {
      console.error('Mentor profile not found');
      return Response.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const mentorProfile = profiles[0];
    console.log('✓ Mentor profile found:', mentorProfile.id);

    if (!mentorProfile.stripe_connect_id) {
      console.error('Mentor has no Stripe Connect account');
      return Response.json({ 
        error: 'Mentor has not connected their Stripe account' 
      }, { status: 400 });
    }
    console.log('✓ Stripe Connect ID:', mentorProfile.stripe_connect_id);

    // Create transfer to mentor's connected account
    console.log('Creating Stripe transfer...');
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: mentorProfile.stripe_connect_id,
      description: `Mentorship payout for ${new Date().toLocaleDateString()}`,
      metadata: {
        mentor_id: mentorId,
        mentor_profile_id: mentorProfile.id
      }
    });
    console.log('✓ Transfer created:', transfer.id);

    // Get mentor user for email
    const mentorUsers = await base44.asServiceRole.entities.User.filter({ 
      id: mentorId 
    });
    
    if (mentorUsers.length > 0 && mentorUsers[0].email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: mentorUsers[0].email,
        subject: 'Payout Processed - IvyBridge',
        body: `Your payout of $${amount.toFixed(2)} has been processed and will arrive in your account within 2-3 business days.`
      });
      console.log('✓ Email notification sent');
    }

    return Response.json({
      success: true,
      transferId: transfer.id,
      amount: amount,
      destination: mentorProfile.stripe_connect_id
    });

  } catch (error) {
    console.error('=== Payout Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({ 
      error: error.message || 'Failed to create payout' 
    }, { status: 500 });
  }
});