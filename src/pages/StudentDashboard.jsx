import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  ExternalLink,
  Star
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatBox from "../components/dashboard/ChatBox";
import TaskList from "../components/dashboard/TaskList";
import ProgressTimeline from "../components/dashboard/ProgressTimeline";
import ReviewDialog from "../components/dashboard/ReviewDialog";
import ReportDialog from "../components/dashboard/ReportDialog";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      checkPaymentSuccess();
    }
  }, [user]);

  const checkPaymentSuccess = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');

    if (paymentSuccess === 'true') {
      setShowSuccessAlert(true);
      window.history.replaceState({}, '', window.location.pathname);
      
      const pendingSubs = await base44.entities.Subscription.filter({ 
        student_id: user.id, 
        status: "pending" 
      });
      
      for (const sub of pendingSubs) {
        await base44.entities.Subscription.update(sub.id, { status: 'active' });
      }
      
      queryClient.invalidateQueries(['my-subscriptions']);
    }
  };

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.account_type === "mentor") {
        navigate(createPageUrl("MentorDashboard"), { replace: true });
        return;
      }
      if (currentUser.role === "admin") {
        navigate(createPageUrl("AdminDashboard"), { replace: true });
        return;
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error("Auth error:", error);
      base44.auth.redirectToLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ['my-subscriptions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const subs = await base44.entities.Subscription.filter({ student_id: user.id });
      return subs || [];
    },
    enabled: !!user?.id,
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });

  const activeSub = subscriptions.find(s => s.status === "active");

  const { data: mentorProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['subscription-mentor-profiles', activeSub?.id],
    queryFn: async () => {
      if (!activeSub?.mentor_profile_id) return [];
      const profiles = await base44.entities.MentorProfile.filter({ id: activeSub.mentor_profile_id });
      return profiles || [];
    },
    enabled: !!activeSub?.mentor_profile_id,
    staleTime: 30000,
  });

  const mentor = mentorProfiles[0];

  const { data: mentorUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['mentor-user-data', mentor?.user_id],
    queryFn: async () => {
      if (!mentor?.user_id) return [];
      const users = await base44.entities.User.filter({ id: mentor.user_id });
      return users || [];
    },
    enabled: !!mentor?.user_id,
    staleTime: 30000,
  });

  const mentorUser = mentorUsers[0];

  const { data: tasks = [] } = useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await base44.entities.Task.filter({ student_id: user.id });
      return result || [];
    },
    enabled: !!user?.id,
    staleTime: 10000,
  });

  const { data: progressNotes = [] } = useQuery({
    queryKey: ['my-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await base44.entities.ProgressNote.filter({ student_id: user.id });
      return result || [];
    },
    enabled: !!user?.id,
    staleTime: 10000,
  });

  const { data: myReview } = useQuery({
    queryKey: ['my-review', activeSub?.id],
    queryFn: async () => {
      if (!activeSub || !user) return null;
      const reviews = await base44.entities.Review.filter({
        subscription_id: activeSub.id,
        student_id: user.id
      });
      return reviews[0] || null;
    },
    enabled: !!activeSub && !!user,
  });

  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE6C3A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-gray-200 rounded shadow-sm p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2 text-[#0D3B33]">Authentication Error</h2>
          <p className="text-gray-600 text-sm mb-4">
            Unable to load your account. Please try signing in again.
          </p>
          <Button
            onClick={() => base44.auth.redirectToLogin()}
            className="btn-primary text-white rounded"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (subsLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE6C3A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  if (!activeSub || !mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-gray-200 rounded shadow-sm p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              No Active Mentorship
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              You don't have an active mentorship yet. Browse our mentors to get started!
            </p>
            <Button
              className="btn-primary text-white rounded"
              onClick={() => navigate(createPageUrl("BrowseMentors"))}
            >
              Find a Mentor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-24">
        {showSuccessAlert && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>
                <strong>Payment successful!</strong> Your mentorship has been activated. Welcome to IvyBridge!
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold mb-1 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-600 text-sm">Track your progress and stay connected with your mentor</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-l-4 border-l-[#FE6C3A] border border-gray-200 rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-[#FE6C3A]" />
            </div>
            <div className="text-2xl font-bold mb-1 text-[#0D3B33]">{activeSub.months_remaining}</div>
            <div className="text-xs text-gray-600">Months Remaining</div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-[#0D3B33]" />
            </div>
            <div className="text-2xl font-bold mb-1 text-[#0D3B33]">{completedTasks.length}</div>
            <div className="text-xs text-gray-600">Tasks Completed</div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1 text-[#0D3B33]">Active</div>
            <div className="text-xs text-gray-600">Mentorship Status</div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1 text-[#0D3B33]">{pendingTasks.length}</div>
            <div className="text-xs text-gray-600">Pending Tasks</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm mb-6 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={mentor.profile_photo_url || mentorUser?.profile_photo_url} />
                <AvatarFallback className="bg-[#E6EFEA] text-xl text-[#0D3B33]">
                  {mentorUser?.full_name?.charAt(0) || usersLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0D3B33]" /> : '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>Your Mentor</h3>
                <p className="text-base text-gray-700 mb-1">
                  {usersLoading ? <Skeleton className="h-5 w-32" /> : (mentorUser?.full_name || 'Loading...')}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Badge className="bg-[#E6EFEA] text-[#0D3B33] border-0 text-xs">
                    {mentor.university}
                  </Badge>
                  <span>•</span>
                  <span>{mentor.major}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {mentor.calendly_link && (
                <Button
                  variant="outline"
                  className="rounded text-sm"
                  onClick={() => window.open(mentor.calendly_link, '_blank')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              )}
              <Button
                className="btn-primary text-white rounded text-sm"
                onClick={() => setActiveTab("chat")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Mentor
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Subscription Plan</p>
                <p className="text-base font-bold capitalize text-[#0D3B33]">{activeSub.plan_type} Plan</p>
                <p className="text-xs text-gray-500">
                  {activeSub.months_remaining} months remaining • Non-cancellable
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {!myReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded text-xs"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Write Review
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded text-xs text-gray-600"
                  onClick={() => setShowReportDialog(true)}
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Report Issue
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded p-1 shadow-sm">
            <TabsTrigger value="overview" className="rounded data-[state=active]:bg-[#FE6C3A] data-[state=active]:text-white text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded data-[state=active]:bg-[#FE6C3A] data-[state=active]:text-white text-sm">
              Chat
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded data-[state=active]:bg-[#FE6C3A] data-[state=active]:text-white text-sm">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded data-[state=active]:bg-[#FE6C3A] data-[state=active]:text-white text-sm">
              Progress
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded data-[state=active]:bg-[#FE6C3A] data-[state=active]:text-white text-sm">
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold flex items-center gap-2 text-[#0D3B33]">
                    <CheckCircle className="w-4 h-4 text-[#FE6C3A]" />
                    Your Tasks
                  </h3>
                </div>
                <div className="p-4">
                  <TaskList tasks={tasks.slice(0, 5)} studentView={true} />
                  {tasks.length > 5 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-3 text-sm"
                      onClick={() => setActiveTab("tasks")}
                    >
                      View All Tasks
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold flex items-center gap-2 text-[#0D3B33]">
                    <TrendingUp className="w-4 h-4 text-[#FE6C3A]" />
                    Recent Progress
                  </h3>
                </div>
                <div className="p-4">
                  <ProgressTimeline notes={progressNotes.slice(0, 3)} />
                  {progressNotes.length > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-3 text-sm"
                      onClick={() => setActiveTab("progress")}
                    >
                      View All Updates
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              {mentorUser ? (
                <ChatBox
                  currentUserId={user.id}
                  otherUserId={mentor.user_id}
                  otherUserName={mentorUser.full_name}
                  otherUserPhoto={mentor.profile_photo_url || mentorUser.profile_photo_url}
                  subscriptionId={activeSub.id}
                />
              ) : (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE6C3A] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading chat...</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-[#0D3B33]">All Tasks</h3>
              </div>
              <div className="p-4">
                <TaskList tasks={tasks} studentView={true} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-[#0D3B33]">Progress History</h3>
              </div>
              <div className="p-4">
                <ProgressTimeline notes={progressNotes} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-[#0D3B33]">Billing & Subscription</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Plan</p>
                      <p className="text-xl font-bold capitalize text-[#0D3B33]">{activeSub.plan_type}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-medium">{activeSub.start_date}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Date</p>
                      <p className="font-medium">{activeSub.end_date}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount Paid</p>
                      <p className="font-medium">${activeSub.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Months Remaining</p>
                      <p className="font-medium">{activeSub.months_remaining}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-sm">Payment History</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Initial Payment</p>
                          <p className="text-xs text-gray-600">{activeSub.start_date}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">${activeSub.amount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> For any billing questions or to update payment methods,
                    please contact support or manage your subscription through Stripe.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        subscription={activeSub}
        mentorProfile={mentor}
        mentorUser={mentorUser}
        currentUserId={user?.id}
        onReviewSubmitted={() => queryClient.invalidateQueries(['my-review', activeSub?.id])}
      />

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportedUserId={mentor?.user_id}
        reportedUserName={mentorUser?.full_name || 'Mentor'}
        reporterUserId={user?.id}
      />
    </div>
  );
}