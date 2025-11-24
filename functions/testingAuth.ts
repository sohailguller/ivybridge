import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const { testKey, userEmail } = await req.json();

        // Validate testing key
        const validKey = Deno.env.get("TESTING_SECRET_KEY");
        if (!validKey || testKey !== validKey) {
            return Response.json({ error: 'Invalid testing key' }, { status: 401 });
        }

        // Use service role to fetch user data
        const base44 = createClientFromRequest(req);
        
        // Get the requested user
        const users = await base44.asServiceRole.entities.User.list();
        const user = users.find(u => u.email === userEmail);
        
        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Get additional user data
        let mentorProfile = null;
        let subscriptions = [];
        let tasks = [];
        let progressNotes = [];
        
        if (user.mentor_profile_id) {
            const profiles = await base44.asServiceRole.entities.MentorProfile.filter({ id: user.mentor_profile_id });
            mentorProfile = profiles[0];
        }
        
        if (user.account_type === 'student' || !user.account_type) {
            subscriptions = await base44.asServiceRole.entities.Subscription.filter({ student_id: user.id });
            tasks = await base44.asServiceRole.entities.Task.filter({ student_id: user.id });
            progressNotes = await base44.asServiceRole.entities.ProgressNote.filter({ student_id: user.id });
        }
        
        if (mentorProfile) {
            subscriptions = await base44.asServiceRole.entities.Subscription.filter({ mentor_profile_id: mentorProfile.id });
        }

        return Response.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                account_type: user.account_type,
                mentor_profile_id: user.mentor_profile_id
            },
            mentorProfile,
            subscriptions,
            tasks,
            progressNotes,
            instructions: {
                note: "This is testing data only. To interact with the app:",
                loginUrl: "Login via Base44 auth system with this email",
                dashboardUrl: user.role === 'admin' ? '/AdminDashboard' : 
                             user.account_type === 'mentor' ? '/MentorDashboard' : '/StudentDashboard'
            }
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});