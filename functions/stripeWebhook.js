import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@16.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'No signature found' }, { status: 400 });
    }

    // Get raw body
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

    // Initialize Base44 client with service role for database operations
    const base44 = createClientFromRequest(req);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Extract metadata
        const userId = session.metadata.user_id;
        const mentorProfileId = session.metadata.mentor_profile_id;
        const mentorUserId = session.metadata.mentor_user_id;
        const planType = session.metadata.plan_type;
        const amount = parseFloat(session.metadata.amount);

        // Calculate dates
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 12);
        
        // Create subscription in database
        await base44.asServiceRole.entities.Subscription.create({
          student_id: userId,
          mentor_id: mentorUserId,
          mentor_profile_id: mentorProfileId,
          plan_type: planType,
          amount: amount,
          status: "active",
          start_date: startDate,
          end_date: endDate.toISOString().split('T')[0],
          months_remaining: 12,
          stripe_subscription_id: session.subscription || session.id
        });

        // Update mentor's student count
        const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: mentorProfileId });
        if (mentorProfiles.length > 0) {
          const mentor = mentorProfiles[0];
          await base44.asServiceRole.entities.MentorProfile.update(mentorProfileId, {
            total_students: (mentor.total_students || 0) + 1
          });
        }

        // Send confirmation email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: session.customer_details.email,
          subject: 'Welcome to IvyBridge - Subscription Confirmed',
          body: `
            <h2>Welcome to IvyBridge!</h2>
            <p>Your ${planType} subscription has been confirmed.</p>
            <p>You can now access your mentor dashboard and start your journey.</p>
            <p>Visit your dashboard: ${req.headers.get('origin')}/StudentDashboard</p>
          `
        });

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Update subscription status in database if needed
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ 
          stripe_subscription_id: subscription.id 
        });

        if (subscriptions.length > 0) {
          const dbSubscription = subscriptions[0];
          await base44.asServiceRole.entities.Subscription.update(dbSubscription.id, {
            status: subscription.status === 'active' ? 'active' : subscription.status
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Mark subscription as cancelled
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ 
          stripe_subscription_id: subscription.id 
        });

        if (subscriptions.length > 0) {
          const dbSubscription = subscriptions[0];
          await base44.asServiceRole.entities.Subscription.update(dbSubscription.id, {
            status: 'cancelled'
          });

          // Decrease mentor's student count
          const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ 
            id: dbSubscription.mentor_profile_id 
          });
          if (mentorProfiles.length > 0) {
            const mentor = mentorProfiles[0];
            await base44.asServiceRole.entities.MentorProfile.update(mentor.id, {
              total_students: Math.max(0, (mentor.total_students || 0) - 1)
            });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        
        // Update subscription months_remaining if it's a recurring payment
        if (invoice.subscription) {
          const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ 
            stripe_subscription_id: invoice.subscription 
          });

          if (subscriptions.length > 0) {
            const dbSubscription = subscriptions[0];
            // Decrement months remaining
            await base44.asServiceRole.entities.Subscription.update(dbSubscription.id, {
              months_remaining: Math.max(0, (dbSubscription.months_remaining || 12) - 1)
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        // Send notification email about failed payment
        if (invoice.customer_email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: invoice.customer_email,
            subject: 'IvyBridge - Payment Failed',
            body: `
              <h2>Payment Failed</h2>
              <p>We were unable to process your recent payment for IvyBridge.</p>
              <p>Please update your payment method to continue your mentorship.</p>
              <p>Amount due: $${(invoice.amount_due / 100).toFixed(2)}</p>
            `
          });
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object;
        
        // Update mentor's Stripe Connect status if needed
        const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ 
          stripe_connect_id: account.id 
        });

        if (mentorProfiles.length > 0) {
          // You can track additional Connect account details here if needed
          console.log('Stripe Connect account updated:', account.id);
        }
        break;
      }

      case 'payout.paid': {
        const payout = event.data.object;
        console.log('Payout completed:', payout.id, 'Amount:', payout.amount / 100);
        // You could track payout history in a separate entity if needed
        break;
      }

      case 'payout.failed': {
        const payout = event.data.object;
        console.log('Payout failed:', payout.id, 'Reason:', payout.failure_message);
        // Notify admin or mentor about failed payout
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message || 'Webhook processing failed' 
    }, { status: 500 });
  }
});