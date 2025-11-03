
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
  Users, 
  MessageSquare, 
  CheckCircle,
  DollarSign,
  Clock,
  AlertCircle,
  Plus,
  ExternalLink
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatBox from "../components/dashboard/ChatBox";
import CreateTaskDialog from "../components/dashboard/CreateTaskDialog";
import CreateProgressNoteDialog from "../components/dashboard/CreateProgressNoteDialog";
import StudentCard from "../components/dashboard/StudentCard";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const connectSuccess = urlParams.get('connect_success');
  const [user, setUser] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.account_type !== "mentor") {
        navigate(createPageUrl("StudentDashboard"));
        return;
      }
      setUser(currentUser);
      
      if (currentUser.mentor_profile_id) {
        const profiles = await base44.entities.MentorProfile.filter({ id: currentUser.mentor_profile_id });
        if (profiles.length > 0) {
          setMentorProfile(profiles[0]);
          
          if (profiles[0].verification_status === "pending") {
            // Show pending status
          }
        }
      }
    } catch (error) {
      base44.auth.redirectToLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['mentor-subscriptions', mentorProfile?.id],
    queryFn: () => base44.entities.Subscription.filter({ mentor_profile_id: mentorProfile.id, status: "active" }),
    enabled: !!mentorProfile
  });

  const { data: students = [] } = useQuery({
    queryKey: ['my-students'],
    queryFn: async () => {
      if (subscriptions.length === 0) return [];
      const users = await base44.entities.User.list();
      return users.filter(u => subscriptions.some(s => s.student_id === u.id));
    },
    enabled: subscriptions.length > 0
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['mentor-tasks', user?.id],
    queryFn: () => base44.entities.Task.filter({ mentor_id: user.id }),
    enabled: !!user
  });

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    try {
      const response = await base44.functions.invoke('connectMentorStripe', {});
      
      if (response.data.onboardingUrl) {
        window.location.href = response.data.onboardingUrl;
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      alert('Failed to connect Stripe. Please try again.');
    }
    setConnectingStripe(false);
  };

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const monthlyRevenue = totalRevenue * 0.7; // After 30% commission

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

  if (!mentorProfile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md rounded-3xl border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-6 text-[#FF6B5C]" />
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Complete Your Profile
            </h2>
            <p className="text-gray-600 mb-6">
              You need to complete your mentor application first.
            </p>
            <Button 
              className="btn-primary text-white rounded-xl"
              onClick={() => navigate(createPageUrl("ApplyAsMentor"))}
            >
              Apply as Mentor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mentorProfile.verification_status === "pending") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md rounded-3xl border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Application Under Review
            </h2>
            <p className="text-gray-600 mb-6">
              Your mentor application is currently being reviewed by our team. 
              We'll notify you via email once it's been approved.
            </p>
            <p className="text-sm text-gray-500">
              This usually takes 1-2 business days.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mentorProfile.verification_status === "rejected") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md rounded-3xl border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Application Not Approved
            </h2>
            <p className="text-gray-600 mb-6">
              Unfortunately, your mentor application was not approved at this time.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Mentor Dashboard
          </h1>
          <p className="text-gray-600">Manage your students and track your mentorship</p>
        </div>

        {/* Stripe Connect Success Alert */}
        {connectSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              ✓ Stripe account connected successfully! You can now receive payouts.
            </AlertDescription>
          </Alert>
        )}

        {/* Stripe Connect Warning */}
        {!mentorProfile.stripe_connect_id && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-orange-800">
                Connect your Stripe account to receive monthly payouts for your mentorship earnings.
              </span>
              <Button 
                size="sm" 
                onClick={handleConnectStripe}
                disabled={connectingStripe}
                className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
              >
                {connectingStripe ? "Connecting..." : "Connect Stripe"}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-[#FF6B5C] to-[#E55A4C] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 opacity-80" />
              </div>
              <div className="text-3xl font-bold mb-1">{students.length}</div>
              <div className="text-sm opacity-90">Active Students</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-1">${monthlyRevenue.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Your Earnings (70%)</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-[#FF6B5C]" />
              </div>
              <div className="text-3xl font-bold mb-1">{allTasks.length}</div>
              <div className="text-sm text-gray-600">Tasks Assigned</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <MessageSquare className="w-8 h-8 text-[#B3E5FC]" />
              </div>
              <div className="text-3xl font-bold mb-1">Active</div>
              <div className="text-sm text-gray-600">Profile Status</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border rounded-2xl p-1 shadow-sm">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Students
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#FF6B5C]" />
                      Your Students
                    </span>
                    <Badge>{students.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {students.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No students yet</p>
                    </div>
                  ) : (
                    students.map(student => (
                      <StudentCard 
                        key={student.id} 
                        student={student}
                        subscription={subscriptions.find(s => s.student_id === student.id)}
                        onSelect={() => {
                          setSelectedStudent(student);
                          setActiveTab("chat");
                        }}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Earnings Overview
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
                    <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 mb-2">Your Share (70%)</div>
                    <div className="text-3xl font-bold text-green-600">${monthlyRevenue.toFixed(2)}</div>
                  </div>
                  <div className="bg-[#B3E5FC]/20 rounded-2xl p-4">
                    <div className="text-sm font-medium mb-2">Payment Info</div>
                    <p className="text-xs text-gray-600">
                      Earnings are paid monthly via Stripe Connect. 
                      {mentorProfile.stripe_connect_id ? 
                        " Your account is connected." : 
                        " Connect your account above to receive payments."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map(student => {
                const subscription = subscriptions.find(s => s.student_id === student.id);
                const studentTasks = allTasks.filter(t => t.student_id === student.id);
                
                return (
                  <Card key={student.id} className="rounded-3xl border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={student.profile_photo_url} />
                          <AvatarFallback className="bg-[#B3E5FC] text-xl">
                            {student.full_name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{student.full_name}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Plan</span>
                          <Badge className="capitalize">{subscription?.plan_type}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tasks</span>
                          <span className="font-medium">{studentTasks.length} assigned</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Months left</span>
                          <span className="font-medium">{subscription?.months_remaining || 0}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-xl"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowTaskDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Task
                        </Button>
                        <Button 
                          className="flex-1 btn-primary text-white rounded-xl"
                          onClick={() => {
                            setSelectedStudent(student);
                            setActiveTab("chat");
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="chat">
            {selectedStudent ? (
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardContent className="p-0">
                  <ChatBox 
                    currentUserId={user.id}
                    otherUserId={selectedStudent.id}
                    otherUserName={selectedStudent.full_name}
                    otherUserPhoto={selectedStudent.profile_photo_url}
                    subscriptionId={subscriptions.find(s => s.student_id === selectedStudent.id)?.id}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">Select a student to start messaging</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        student={selectedStudent}
        mentorId={user?.id}
        subscriptionId={subscriptions.find(s => s.student_id === selectedStudent?.id)?.id}
      />
    </div>
  );
}
