
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatBox from "../components/dashboard/ChatBox";
import TaskList from "../components/dashboard/TaskList";
import ProgressTimeline from "../components/dashboard/ProgressTimeline";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    loadUser();
    checkPaymentSuccess();
  }, []);

  const checkPaymentSuccess = () => {
    // Check if user just completed payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    
    if (paymentSuccess === 'true') {
      setShowSuccessAlert(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      
      // Clear localStorage
      localStorage.removeItem('pending_subscription_id');
      localStorage.removeItem('mentor_profile_id');
    }
  };

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.account_type === "mentor") {
        navigate(createPageUrl("MentorDashboard"));
        return;
      }
      if (currentUser.role === "admin") {
        navigate(createPageUrl("AdminDashboard"));
        return;
      }
      setUser(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['my-subscriptions', user?.id],
    queryFn: () => base44.entities.Subscription.filter({ student_id: user.id, status: "active" }),
    enabled: !!user
  });

  const { data: mentorProfiles = [] } = useQuery({
    queryKey: ['subscription-mentors'],
    queryFn: async () => {
      if (subscriptions.length === 0) return [];
      const profiles = await base44.entities.MentorProfile.list();
      return profiles.filter(p => subscriptions.some(s => s.mentor_profile_id === p.id));
    },
    enabled: subscriptions.length > 0
  });

  const { data: mentorUsers = [] } = useQuery({
    queryKey: ['mentor-user-data'],
    queryFn: async () => {
      if (mentorProfiles.length === 0) return [];
      const users = await base44.entities.User.list();
      return users.filter(u => mentorProfiles.some(p => p.user_id === u.id));
    },
    enabled: mentorProfiles.length > 0
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: () => base44.entities.Task.filter({ student_id: user.id }),
    enabled: !!user
  });

  const { data: progressNotes = [] } = useQuery({
    queryKey: ['my-progress', user?.id],
    queryFn: () => base44.entities.ProgressNote.filter({ student_id: user.id }),
    enabled: !!user
  });

  const activeSub = subscriptions[0];
  const mentor = mentorProfiles.find(p => p.id === activeSub?.mentor_profile_id);
  const mentorUser = mentorUsers.find(u => u.id === mentor?.user_id);

  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B5C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!activeSub || !mentor) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md rounded-3xl border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-[#FF6B5C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-[#FF6B5C]" />
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              No Active Mentorship
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have an active mentorship yet. Browse our mentors to get started!
            </p>
            <Button 
              className="btn-primary text-white rounded-xl"
              onClick={() => navigate(createPageUrl("BrowseMentors"))}
            >
              Find a Mentor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>
                <strong>Payment successful!</strong> Your mentorship has been activated. Welcome to IvyBridge!
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-600">Track your progress and stay connected with your mentor</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-[#FF6B5C] to-[#E55A4C] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 opacity-80" />
              </div>
              <div className="text-3xl font-bold mb-1">{activeSub.months_remaining}</div>
              <div className="text-sm opacity-90">Months Remaining</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-[#FF6B5C]" />
              </div>
              <div className="text-3xl font-bold mb-1">{completedTasks.length}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <MessageSquare className="w-8 h-8 text-[#B3E5FC]" />
              </div>
              <div className="text-3xl font-bold mb-1">Active</div>
              <div className="text-sm text-gray-600">Mentorship Status</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-1">{pendingTasks.length}</div>
              <div className="text-sm text-gray-600">Pending Tasks</div>
            </CardContent>
          </Card>
        </div>

        {/* Mentor Info Card */}
        <Card className="rounded-3xl border-0 shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={mentor.profile_photo_url || mentorUser?.profile_photo_url} />
                  <AvatarFallback className="bg-[#B3E5FC] text-2xl">
                    {mentorUser?.full_name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Your Mentor</h3>
                  <p className="text-xl text-gray-700 mb-2">{mentorUser?.full_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge className="bg-[#B3E5FC]/30 text-[#222222] border-0">
                      {mentor.university}
                    </Badge>
                    <span>•</span>
                    <span>{mentor.major}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {mentor.calendly_link && (
                  <Button 
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => window.open(mentor.calendly_link, '_blank')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meeting
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
                <Button 
                  className="btn-primary text-white rounded-xl"
                  onClick={() => setActiveTab("chat")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Mentor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border rounded-2xl p-1 shadow-sm">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Chat
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#FF6B5C]" />
                    Your Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskList tasks={tasks.slice(0, 5)} studentView={true} />
                  {tasks.length > 5 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab("tasks")}
                    >
                      View All Tasks
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#FF6B5C]" />
                    Recent Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressTimeline notes={progressNotes.slice(0, 3)} />
                  {progressNotes.length > 3 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab("progress")}
                    >
                      View All Updates
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-0">
                <ChatBox 
                  currentUserId={user.id}
                  otherUserId={mentor.user_id}
                  otherUserName={mentorUser?.full_name}
                  otherUserPhoto={mentor.profile_photo_url || mentorUser?.profile_photo_url}
                  subscriptionId={activeSub.id}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList tasks={tasks} studentView={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Progress History</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTimeline notes={progressNotes} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
