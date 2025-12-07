import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@^14.14.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Hardcoded price IDs from the user's catalog
const PRICES = {
    monthly: 'price_1SPAhYPVHYXDQ24FbMDRdZJc',
    annual: 'price_1SPAiCPVHYXDQ24FPps95Yw5'
};

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { mentorProfileId, planType } = await req.json();

        if (!mentorProfileId || !planType || !PRICES[planType]) {
            return Response.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        // Optional: Verify mentor exists
        const mentorProfiles = await base44.entities.MentorProfile.filter({ id: mentorProfileId });
        if (mentorProfiles.length === 0) {
             return Response.json({ error: 'Mentor not found' }, { status: 404 });
        }
        const mentorProfile = mentorProfiles[0];

        // Construct success/cancel URLs
        // Note: In production, these should be absolute URLs. 
        // Base44 environment usually provides the origin in headers or we can construct it.
        // For now, we'll assume the frontend handles the redirect, but Stripe needs absolute URLs.
        // We can use the Referer header to get the origin.
        const origin = req.headers.get('origin') || req.headers.get('referer');
        if (!origin) {
            return Response.json({ error: 'Could not determine origin for redirect URLs' }, { status: 400 });
        }

        // Clean trailing slash from origin
        const baseUrl = origin.replace(/\/$/, '');

        const successUrl = `${baseUrl}/StudentDashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/MentorProfile?id=${mentorProfileId}&payment_cancelled=true`;

        const session = await stripe.checkout.sessions.create({
            mode: planType === 'monthly' ? 'subscription' : 'payment',
            customer_email: user.email,
            line_items: [
                {
                    price: PRICES[planType],
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: user.id,
                mentorProfileId: mentorProfileId,
                planType: planType
            },
        });

        return Response.json({ url: session.url });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});