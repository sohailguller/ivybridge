import Stripe from 'npm:stripe@16.14.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: '2024-11-20.acacia' });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  console.log('=== Stripe Webhook Received ===');
  
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }

    const body = await req.text();
    
    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Initialize Base44 client with service role
    const base44 = createClientFromRequest(req);
    
    console.log('Event type:', event.type);

    // Handle checkout session completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout completed for session:', session.id);
      
      const subscriptionId = session.metadata.subscription_id;
      const mentorProfileId = session.metadata.mentor_profile_id;
      const stripeSubscriptionId = session.subscription;

      if (!subscriptionId) {
        console.error('No subscription_id in metadata');
        return Response.json({ error: 'Missing subscription_id' }, { status: 400 });
      }

      console.log('Activating subscription:', subscriptionId);

      // Update subscription to ACTIVE
      await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
        status: 'active',
        stripe_subscription_id: stripeSubscriptionId || session.id
      });
      console.log('✓ Subscription status: pending → active');

      // Increment mentor's total_students count
      if (mentorProfileId) {
        const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: mentorProfileId });
        if (mentorProfiles.length > 0) {
          const mentor = mentorProfiles[0];
          const newCount = (mentor.total_students || 0) + 1;
          await base44.asServiceRole.entities.MentorProfile.update(mentorProfileId, {
            total_students: newCount
          });
          console.log('✓ Mentor student count updated:', mentor.total_students, '→', newCount);
        }
      }

      // Send notification to student
      if (session.metadata.user_id) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: session.metadata.user_id,
          type: 'subscription',
          title: 'Mentorship Activated!',
          message: 'Your mentorship is now active. Start chatting with your mentor!',
          link: '/StudentDashboard'
        });
        console.log('✓ Student notification sent');
      }

      // Send notification to mentor
      if (session.metadata.mentor_user_id) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: session.metadata.mentor_user_id,
          type: 'subscription',
          title: 'New Student!',
          message: 'You have a new student. Check your dashboard to get started!',
          link: '/MentorDashboard'
        });
        console.log('✓ Mentor notification sent');
      }
    }

    // Handle subscription updates (for monthly plans)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      console.log('Subscription updated:', subscription.id);
      
      const subscriptionId = subscription.metadata.subscription_id;
      if (subscriptionId) {
        let status = 'active';
        if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
          status = 'cancelled';
        }
        
        await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
          status: status
        });
        console.log('✓ Subscription status updated to:', status);
      }
    }

    // Handle subscription deletion
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      console.log('Subscription deleted:', subscription.id);
      
      const subscriptionId = subscription.metadata.subscription_id;
      if (subscriptionId) {
        await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
          status: 'cancelled'
        });
        console.log('✓ Subscription marked as cancelled');
      }
    }

    // Handle monthly payment success
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const stripeSubscriptionId = invoice.subscription;
      
      if (stripeSubscriptionId) {
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ 
          stripe_subscription_id: stripeSubscriptionId 
        });
        
        if (subscriptions.length > 0) {
          const sub = subscriptions[0];
          const newMonthsRemaining = Math.max(0, (sub.months_remaining || 12) - 1);
          
          await base44.asServiceRole.entities.Subscription.update(sub.id, {
            months_remaining: newMonthsRemaining
          });
          console.log('✓ Payment processed, months remaining:', newMonthsRemaining);
        }
      }
    }

    // Handle failed payment
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      console.log('Payment failed for invoice:', invoice.id);
      
      const customer = await stripe.customers.retrieve(invoice.customer);
      if (customer.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: 'Payment Failed - IvyBridge',
          body: 'Your payment has failed. Please update your payment method to continue your mentorship.'
        });
        console.log('✓ Payment failure email sent');
      }
    }

    console.log('=== Webhook processed successfully ===');
    return Response.json({ received: true });

  } catch (error) {
    console.error('=== Webhook Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});