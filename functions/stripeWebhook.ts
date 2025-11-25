import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'npm:@base44/sdk@0.8.4';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    // Initialize Base44 client with service role (webhooks have no user context)
    const base44 = createClient({
      url: 'https://api.base44.com',
      appId: Deno.env.get('BASE44_APP_ID'),
      serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY'),
    });

    console.log('Webhook event received:', event.type);

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { subscription_id, student_id, mentor_profile_id } = session.metadata;

      console.log('Processing checkout.session.completed:', {
        subscription_id,
        student_id,
        mentor_profile_id,
        stripe_subscription_id: session.subscription,
        payment_intent: session.payment_intent
      });

      if (subscription_id && student_id && mentor_profile_id) {
        // Activate the subscription
        await base44.entities.Subscription.update(subscription_id, {
          status: 'active',
          stripe_subscription_id: session.subscription || session.payment_intent
        });

        console.log('Subscription activated:', subscription_id);

        // Count ALL active subscriptions for this mentor
        const allActiveSubscriptions = await base44.entities.Subscription.filter({
          mentor_profile_id: mentor_profile_id,
          status: 'active'
        });

        console.log(`Mentor ${mentor_profile_id} now has ${allActiveSubscriptions.length} active students`);

        // Update mentor profile with accurate student count
        await base44.entities.MentorProfile.update(mentor_profile_id, {
          total_students: allActiveSubscriptions.length
        });

        // Get mentor user ID for notification
        const mentorProfiles = await base44.entities.MentorProfile.filter({ id: mentor_profile_id });
        
        if (mentorProfiles.length > 0) {
          const mentorProfile = mentorProfiles[0];

          // Create notification for student
          await base44.entities.Notification.create({
            user_id: student_id,
            type: 'subscription',
            title: 'Mentorship Activated!',
            message: 'Your mentorship has been activated. Start chatting with your mentor now!',
            link: '/StudentDashboard'
          });

          // Create notification for mentor
          await base44.entities.Notification.create({
            user_id: mentorProfile.user_id,
            type: 'subscription',
            title: 'New Student!',
            message: 'You have a new student. Check your dashboard to get started!',
            link: '/MentorDashboard'
          });

          console.log('Notifications created for student and mentor');
        }

        console.log('Successfully processed checkout completion');
      } else {
        console.warn('Missing metadata in checkout session:', session.metadata);
      }
    }

    // Handle subscription created (for monthly recurring)
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      const { subscription_id } = subscription.metadata;
      
      console.log('Processing customer.subscription.created:', { subscription_id });
      
      if (subscription_id) {
        await base44.entities.Subscription.update(subscription_id, {
          stripe_subscription_id: subscription.id,
          status: 'active'
        });
        console.log('Subscription linked to Stripe:', subscription_id);
      }
    }

    // Handle subscription updated
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const { subscription_id } = subscription.metadata;
      
      console.log('Processing customer.subscription.updated:', { subscription_id, status: subscription.status });
      
      if (subscription_id && subscription.status === 'active') {
        await base44.entities.Subscription.update(subscription_id, {
          status: 'active'
        });
      }
    }

    // Handle subscription deleted/cancelled
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const { subscription_id, mentor_profile_id } = subscription.metadata;
      
      console.log('Processing customer.subscription.deleted:', { subscription_id });
      
      if (subscription_id) {
        await base44.entities.Subscription.update(subscription_id, {
          status: 'cancelled'
        });

        // Update mentor's student count
        if (mentor_profile_id) {
          const activeSubscriptions = await base44.entities.Subscription.filter({
            mentor_profile_id: mentor_profile_id,
            status: 'active'
          });
          
          await base44.entities.MentorProfile.update(mentor_profile_id, {
            total_students: activeSubscriptions.length
          });
        }
      }
    }

    // Handle successful invoice payment (monthly billing)
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      
      console.log('Processing invoice.payment_succeeded:', { invoice_id: invoice.id });
      
      if (invoice.subscription) {
        const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const { subscription_id } = stripeSubscription.metadata;
        
        if (subscription_id) {
          const subscriptions = await base44.entities.Subscription.filter({ id: subscription_id });
          if (subscriptions.length > 0) {
            const sub = subscriptions[0];
            
            // Decrease remaining months by 1
            const newMonthsRemaining = Math.max(0, (sub.months_remaining || 12) - 1);
            await base44.entities.Subscription.update(subscription_id, {
              months_remaining: newMonthsRemaining,
              status: newMonthsRemaining > 0 ? 'active' : 'completed'
            });
            
            console.log(`Updated subscription ${subscription_id}: ${newMonthsRemaining} months remaining`);
          }
        }
      }
    }

    // Handle failed payment
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      
      console.log('Processing invoice.payment_failed:', { customer_email: invoice.customer_email });
      
      await base44.integrations.Core.SendEmail({
        to: invoice.customer_email,
        subject: 'Payment Failed - IvyBridge',
        body: 'Your recent payment failed. Please update your payment method to continue your mentorship.'
      });
      
      console.log('Payment failed notification sent');
    }

    // Log Connect events
    if (event.type === 'account.updated') {
      console.log('Stripe Connect account updated:', event.data.object.id);
    }

    if (event.type === 'payout.paid') {
      console.log('Payout successful:', event.data.object.id);
    }

    if (event.type === 'payout.failed') {
      console.log('Payout failed:', event.data.object.id);
    }

    return Response.json({ received: true, event_type: event.type });

  } catch (error) {
    console.error('Webhook error:', error.message, error.stack);
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }
});