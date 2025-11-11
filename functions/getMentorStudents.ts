import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate the user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔐 Authenticated user:', user.id);

    // Get mentor profile
    let mentorProfile = null;
    
    if (user.mentor_profile_id) {
      const profiles = await base44.asServiceRole.entities.MentorProfile.filter({ 
        id: user.mentor_profile_id 
      });
      if (profiles.length > 0) {
        mentorProfile = profiles[0];
      }
    }
    
    if (!mentorProfile) {
      const profiles = await base44.asServiceRole.entities.MentorProfile.filter({ 
        user_id: user.id 
      });
      if (profiles.length > 0) {
        mentorProfile = profiles[0];
      }
    }

    if (!mentorProfile) {
      return Response.json({ 
        error: 'Mentor profile not found',
        students: []
      }, { status: 404 });
    }

    console.log('👨‍🏫 Mentor profile:', mentorProfile.id);

    // Get active subscriptions for this mentor (using service role)
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      mentor_profile_id: mentorProfile.id,
      status: 'active'
    });

    console.log(`📋 Found ${subscriptions.length} active subscriptions`);

    if (subscriptions.length === 0) {
      return Response.json({
        students: [],
        subscriptions: []
      });
    }

    // Extract student IDs
    const studentIds = subscriptions.map(s => s.student_id);
    console.log('🎯 Student IDs:', studentIds);

    // Fetch student user data using service role (bypasses permission restrictions)
    const students = await base44.asServiceRole.entities.User.filter({
      id: { $in: studentIds }
    });

    console.log(`👥 Found ${students.length} students`);

    return Response.json({
      students: students,
      subscriptions: subscriptions
    });

  } catch (error) {
    console.error('❌ Error in getMentorStudents:', error);
    return Response.json({ 
      error: error.message,
      students: [],
      subscriptions: []
    }, { status: 500 });
  }
});