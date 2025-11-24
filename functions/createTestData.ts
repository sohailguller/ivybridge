import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const { testKey, adminEmail, mentorEmail, studentEmail } = await req.json();

        // Validate testing key
        const validKey = Deno.env.get("TESTING_SECRET_KEY");
        if (!validKey || testKey !== validKey) {
            return Response.json({ error: 'Invalid testing key' }, { status: 401 });
        }

        const base44 = createClientFromRequest(req);
        
        // Get all users
        const users = await base44.asServiceRole.entities.User.list();
        const adminUser = users.find(u => u.email === adminEmail);
        const mentorUser = users.find(u => u.email === mentorEmail);
        const studentUser = users.find(u => u.email === studentEmail);

        if (!adminUser || !mentorUser || !studentUser) {
            return Response.json({ 
                error: 'One or more users not found. Please create them via dashboard first.',
                found: {
                    admin: !!adminUser,
                    mentor: !!mentorUser,
                    student: !!studentUser
                }
            }, { status: 404 });
        }

        // Update admin role
        await base44.asServiceRole.entities.User.update(adminUser.id, { role: 'admin' });

        // Create mentor profile if doesn't exist
        let mentorProfile;
        const existingProfiles = await base44.asServiceRole.entities.MentorProfile.filter({ user_id: mentorUser.id });
        
        if (existingProfiles.length > 0) {
            mentorProfile = existingProfiles[0];
        } else {
            mentorProfile = await base44.asServiceRole.entities.MentorProfile.create({
                user_id: mentorUser.id,
                university: "Harvard",
                major: "Computer Science",
                year: "Junior",
                bio: "Test mentor from Harvard. Passionate about helping students achieve their dreams. I've been through the application process and know what it takes to get into top schools.",
                expertise_areas: [
                    "Admissions Essay Writing & Editing",
                    "STEM Applications",
                    "Interview Preparation"
                ],
                greatest_achievement: "Getting accepted to Harvard and maintaining a 4.0 GPA while leading multiple student organizations.",
                advice_to_younger_self: "Start early, stay organized, and don't be afraid to ask for help. Your unique story matters more than perfect grades.",
                dream_job: "Software Engineer at a top tech company",
                why_major: "I've always loved solving complex problems and building things that make people's lives easier.",
                lifetime_goal: "To help 1000+ students get into their dream schools and make education more accessible.",
                verification_status: "approved",
                calendly_link: "https://calendly.com/test-mentor",
                stripe_connect_id: null,
                total_students: 1
            });

            // Update mentor user
            await base44.asServiceRole.entities.User.update(mentorUser.id, {
                account_type: 'mentor',
                mentor_profile_id: mentorProfile.id
            });
        }

        // Update student user
        await base44.asServiceRole.entities.User.update(studentUser.id, {
            account_type: 'student'
        });

        // Create subscription
        const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
            student_id: studentUser.id,
            mentor_profile_id: mentorProfile.id
        });

        let subscription;
        if (existingSubs.length > 0) {
            subscription = existingSubs[0];
        } else {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);

            subscription = await base44.asServiceRole.entities.Subscription.create({
                student_id: studentUser.id,
                mentor_profile_id: mentorProfile.id,
                plan_type: "monthly",
                amount: 425,
                status: "active",
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                months_remaining: 12,
                stripe_subscription_id: "test_sub_" + Date.now(),
                stripe_checkout_session_id: "test_cs_" + Date.now()
            });
        }

        // Create some tasks
        await base44.asServiceRole.entities.Task.create({
            subscription_id: subscription.id,
            student_id: studentUser.id,
            mentor_profile_id: mentorProfile.id,
            title: "Complete Common App Essay",
            description: "Write your main personal statement (650 words max). Focus on a defining moment or experience.",
            status: "in_progress",
            priority: "high",
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

        await base44.asServiceRole.entities.Task.create({
            subscription_id: subscription.id,
            student_id: studentUser.id,
            mentor_profile_id: mentorProfile.id,
            title: "Research Target Universities",
            description: "Create a list of 10-15 universities that match your profile and interests.",
            status: "pending",
            priority: "medium",
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

        // Create a progress note
        await base44.asServiceRole.entities.ProgressNote.create({
            subscription_id: subscription.id,
            mentor_profile_id: mentorProfile.id,
            student_id: studentUser.id,
            note: "Great progress this month! The student has shown excellent dedication to their essay writing and has made significant improvements.",
            month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            achievements: [
                "Completed first draft of personal statement",
                "Researched 12 universities",
                "Improved essay clarity and structure"
            ],
            areas_for_improvement: [
                "Work on making the essay more personal",
                "Start preparing for interviews",
                "Begin supplemental essays"
            ]
        });

        return Response.json({
            success: true,
            message: "Test data created successfully",
            users: {
                admin: { id: adminUser.id, email: adminUser.email, role: 'admin' },
                mentor: { id: mentorUser.id, email: mentorUser.email, account_type: 'mentor', mentor_profile_id: mentorProfile.id },
                student: { id: studentUser.id, email: studentUser.email, account_type: 'student' }
            },
            mentorProfile: { id: mentorProfile.id, university: mentorProfile.university },
            subscription: { id: subscription.id, status: subscription.status },
            instructions: {
                note: "Test data created. Users must still login via Base44 auth.",
                testingAuthEndpoint: "Use /testingAuth function with testKey and userEmail to fetch user data",
                loginInstructions: "Each user logs in with their email via Base44 authentication system"
            }
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});