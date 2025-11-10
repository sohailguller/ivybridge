import Stripe from 'npm:stripe@16.14.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: '2024-11-20.acacia' });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }

    const body = await req.text();
    
    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Initialize Base44 client with service role for admin operations
    const base44 = createClientFromRequest(req);
    
    console.log('Webhook event type:', event.type);

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      console.log('Session metadata:', session.metadata);

      const subscriptionId = session.metadata.subscription_id;
      const userId = session.metadata.user_id;
      const mentorProfileId = session.metadata.mentor_profile_id;
      const stripeSubscriptionId = session.subscription;

      if (!subscriptionId) {
        console.error('No subscription_id in metadata');
        return Response.json({ error: 'Missing subscription_id' }, { status: 400 });
      }

      // Update the subscription to active
      try {
        await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
          status: 'active',
          stripe_subscription_id: stripeSubscriptionId || session.id
        });
        console.log('Subscription activated:', subscriptionId);

        // Update mentor's total students count
        if (mentorProfileId) {
          const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: mentorProfileId });
          if (mentorProfiles.length > 0) {
            const mentor = mentorProfiles[0];
            await base44.asServiceRole.entities.MentorProfile.update(mentorProfileId, {
              total_students: (mentor.total_students || 0) + 1
            });
            console.log('Mentor student count updated');
          }
        }

        // Send notification to student
        await base44.asServiceRole.entities.Notification.create({
          user_id: userId,
          type: 'subscription',
          title: 'Mentorship Activated!',
          message: 'Your mentorship subscription is now active. Start chatting with your mentor!',
          link: '/StudentDashboard'
        });

      } catch (error) {
        console.error('Error updating subscription:', error);
        return Response.json({ error: 'Failed to update subscription' }, { status: 500 });
      }
    }

    // Handle subscription created
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      console.log('Subscription metadata:', subscription.metadata);

      const subscriptionId = subscription.metadata.subscription_id;
      if (subscriptionId) {
        await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
          stripe_subscription_id: subscription.id,
          status: 'active'
        });
        console.log('Subscription status updated to active');
      }
    }

    // Handle subscription updated
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
        console.log('Subscription status updated to:', status);
      }
    }

    // Handle subscription deleted/cancelled
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      console.log('Subscription deleted:', subscription.id);
      
      const subscriptionId = subscription.metadata.subscription_id;
      if (subscriptionId) {
        await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
          status: 'cancelled'
        });
        console.log('Subscription marked as cancelled');
      }
    }

    // Handle successful payment (monthly)
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
          console.log('Payment processed, months remaining:', newMonthsRemaining);
        }
      }
    }

    // Handle failed payment
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      console.log('Payment failed for invoice:', invoice.id);
      
      // Send notification to customer
      const customer = await stripe.customers.retrieve(invoice.customer);
      if (customer.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: 'Payment Failed - IvyBridge',
          body: 'Your payment has failed. Please update your payment method to continue your mentorship.'
        });
      }
    }

    // Handle Connect account updates
    if (event.type === 'account.updated') {
      console.log('Stripe Connect account updated');
    }

    // Handle payout events
    if (event.type === 'payout.paid') {
      console.log('Payout paid:', event.data.object.id);
    }

    if (event.type === 'payout.failed') {
      console.log('Payout failed:', event.data.object.id);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});