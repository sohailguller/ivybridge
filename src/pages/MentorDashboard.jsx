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
  ExternalLink,
  RefreshCw,
  FileText
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
      
      if (currentUser.account_type !== "mentor" && !currentUser.mentor_profile_id) {
        navigate(createPageUrl("StudentDashboard"));
        return;
      }
      setUser(currentUser);
      
      let profile = null;
      
      if (currentUser.mentor_profile_id) {
        const profiles = await base44.entities.MentorProfile.filter({ id: currentUser.mentor_profile_id });
        if (profiles.length > 0) {
          profile = profiles[0];
        }
      }
      
      if (!profile) {
        const profiles = await base44.entities.MentorProfile.filter({ user_id: currentUser.id });
        if (profiles.length > 0) {
          profile = profiles[0];
          try {
            await base44.auth.updateMe({ mentor_profile_id: profile.id });
          } catch (e) {
            console.log('Could not update mentor_profile_id:', e);
          }
        }
      }
      
      if (profile) {
        setMentorProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      base44.auth.redirectToLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const { data: studentData, isLoading: studentsLoading, error: studentsError, refetch: refetchStudents } = useQuery({
    queryKey: ['mentor-students-backend', mentorProfile?.id],
    queryFn: async () => {
      const response = await base44.functions.invoke('getMentorStudents', {});
      return response.data;
    },
    enabled: !!mentorProfile?.id,
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const students = studentData?.students || [];
  const subscriptions = studentData?.subscriptions || [];

  const { data: allTasks = [] } = useQuery({
    queryKey: ['mentor-tasks', mentorProfile?.id],
    queryFn: () => base44.entities.Task.filter({ mentor_profile_id: mentorProfile.id }),
    enabled: !!mentorProfile
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

  const handleRefresh = async () => {
    await Promise.all([
      refetchStudents(),
      queryClient.invalidateQueries(['mentor-tasks'])
    ]);
  };

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const monthlyRevenue = totalRevenue * 0.7;

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

  if (!mentorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-gray-200 rounded shadow-sm p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-3 text-[#0D3B33]">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              You need to complete your mentor application first.
            </p>
            <Button 
              className="btn-primary text-white rounded"
              onClick={() => navigate(createPageUrl("ApplyAsMentor"))}
            >
              Apply as Mentor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mentorProfile.verification_status === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-gray-200 rounded shadow-sm p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-[#0D3B33]">
              Application Under Review
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Your mentor application is currently being reviewed by our team. 
              We'll notify you via email once it's been approved.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              This usually takes 1-2 business days.
            </p>
            <Button 
              variant="outline"
              className="rounded"
              onClick={() => navigate(createPageUrl("Home"))}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mentorProfile.verification_status === "rejected") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-gray-200 rounded shadow-sm p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-3 text-[#0D3B33]">
              Application Not Approved
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Unfortunately, your mentor application was not approved at this time.
              Please contact support for more information.
            </p>
            <Button 
              variant="outline"
              className="rounded"
              onClick={() => navigate(createPageUrl("Home"))}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-6 md:px-12 lg:px-24">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1 text-[#0D3B33]">
                Mentor Dashboard
              </h1>
              <p className="text-gray-600 text-sm">Manage your students and track your mentorship</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={studentsLoading}
              className="rounded text-xs ml-4"
            >
              {studentsLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {connectSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 text-sm">
              ✓ Stripe account connected successfully! You can now receive payouts.
            </AlertDescription>
          </Alert>
        )}

        {!mentorProfile.stripe_connect_id && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertDescription className="flex items-center justify-between text-sm">
              <span className="text-orange-800">
                Connect your Stripe account to receive monthly payouts for your mentorship earnings.
              </span>
              <Button 
                size="sm" 
                onClick={handleConnectStripe}
                disabled={connectingStripe}
                className="bg-orange-600 hover:bg-orange-700 text-white ml-4 text-xs rounded"
              >
                {connectingStripe ? "Connecting..." : "Connect Stripe"}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-l-4 border-l-[#FE6C3A] border border-gray-200 rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-[#FE6C3A]" />
            </div>
            <div className="text-2xl font-bold mb-1 text-[#0D3B33]">{students.length}</div>
            <div className="text-xs text-gray-600">Active Students</div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1 text-[#0D3B33]">${monthlyRevenue.toFixed(0)}</div>
            <div className="text-xs text-gray-600">Your Earnings (70%)</div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-[#0D3B33]" />
            </div>
            <div className="text-2xl font-bold mb-1 text-[#0D3B33]">{allTasks.length}</div>
            <div className="text-xs text-gray-600">Tasks Assigned</div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1 text-[#0D3B33]">Active</div>
            <div className="text-xs text-gray-600">Profile Status</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded p-1 shadow-sm">
            <TabsTrigger value="overview" className="rounded data-[state=active]:bg-[#FE6C3A] data-[state=active]:text-white text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded data-[state=active]:bg-[#FE6C3A] data-[state=active]:text-white text-sm">
              Students
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded data-[state=active]:bg-[#FE6C3A] data-[state=active]:text-white text-sm">
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold flex items-center justify-between text-[#0D3B33]">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#FE6C3A]" />
                      Your Students
                    </span>
                    <Badge className="text-xs">{students.length}</Badge>
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {studentsLoading ? (
                    <div className="text-center py-6 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE6C3A] mx-auto mb-2"></div>
                      <p className="text-sm">Loading students...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="w-10 h-10 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No students yet</p>
                      <p className="text-sm">When students subscribe to your mentorship, they'll appear here</p>
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
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold flex items-center gap-2 text-[#0D3B33]">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Earnings Overview
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-[#0D3B33]">${totalRevenue.toFixed(2)}</div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 mb-1">Your Share (70%)</div>
                    <div className="text-2xl font-bold text-green-600">${monthlyRevenue.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <div className="text-sm font-medium mb-1">Payment Info</div>
                    <p className="text-xs text-gray-600">
                      Earnings are paid monthly via Stripe Connect. 
                      {mentorProfile.stripe_connect_id ? 
                        " Your account is connected." : 
                        " Connect your account above to receive payments."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No students yet</p>
                  <p className="text-sm">When students subscribe to your mentorship, they'll appear here</p>
                </div>
              ) : (
                students.map(student => {
                  const subscription = subscriptions.find(s => s.student_id === student.id);
                  const studentTasks = allTasks.filter(t => t.student_id === student.id);
                  
                  return (
                    <div key={student.id} className="bg-white border border-gray-200 rounded shadow-sm">
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={student.profile_photo_url} />
                            <AvatarFallback className="bg-[#E6EFEA] text-lg text-[#0D3B33]">
                              {student.full_name?.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate">{student.full_name}</h3>
                            <p className="text-xs text-gray-600 truncate">{student.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Plan</span>
                            <Badge className="capitalize text-xs">{subscription?.plan_type}</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Tasks</span>
                            <span className="font-medium">{studentTasks.length} assigned</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Months left</span>
                            <span className="font-medium">{subscription?.months_remaining || 0}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            className="flex-1 rounded text-xs h-8"
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowTaskDialog(true);
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Task
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 rounded text-xs h-8"
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowNoteDialog(true);
                            }}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Progress
                          </Button>
                          <Button 
                            className="w-full btn-primary text-white rounded text-xs h-8 mt-1"
                            onClick={() => {
                              setSelectedStudent(student);
                              setActiveTab("chat");
                            }}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat">
            {selectedStudent ? (
              <div className="bg-white border border-gray-200 rounded shadow-sm">
                <ChatBox 
                  currentUserId={user.id}
                  otherUserId={selectedStudent.id}
                  otherUserName={selectedStudent.full_name}
                  otherUserPhoto={selectedStudent.profile_photo_url}
                  subscriptionId={subscriptions.find(s => s.student_id === selectedStudent.id)?.id}
                />
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded shadow-sm">
                <div className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 text-sm">Select a student to start messaging</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateTaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        student={selectedStudent}
        mentorProfileId={mentorProfile?.id}
        subscriptionId={subscriptions.find(s => s.student_id === selectedStudent?.id)?.id}
      />

      <CreateProgressNoteDialog
        open={showNoteDialog}
        onOpenChange={setShowNoteDialog}
        student={selectedStudent}
        mentorProfileId={mentorProfile?.id}
        subscriptionId={subscriptions.find(s => s.student_id === selectedStudent?.id)?.id}
      />
    </div>
  );
}