
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
  DollarSign,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  Shield,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText,
  Calendar as CalendarIcon,
  ExternalLink as ExternalLinkIcon,
  GraduationCap
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [selectedMentorForPayout, setSelectedMentorForPayout] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutDescription, setPayoutDescription] = useState("");
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [mentorReviewDialogOpen, setMentorReviewDialogOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== "admin") {
        navigate(createPageUrl("Home"));
        return;
      }
      setUser(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const { data: pendingMentors = [] } = useQuery({
    queryKey: ['pending-mentors'],
    queryFn: () => base44.entities.MentorProfile.filter({ verification_status: "pending" }),
  });

  const { data: approvedMentors = [] } = useQuery({
    queryKey: ['approved-mentors-admin'],
    queryFn: () => base44.entities.MentorProfile.filter({ verification_status: "approved" }),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['all-reports'],
    queryFn: () => base44.entities.Report.list("-created_date"),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const approveMentorMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.MentorProfile.update(id, { verification_status: status });
      
      // If approving, also update the user's account_type to "mentor"
      if (status === "approved") {
        const profile = pendingMentors.find(m => m.id === id);
        if (profile) {
          await base44.entities.User.update(profile.user_id, { account_type: "mentor" });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-mentors']);
      queryClient.invalidateQueries(['approved-mentors-admin']);
      setSelectedMentor(null);
      setMentorReviewDialogOpen(false);
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Report.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-reports']);
      setSelectedReport(null);
    },
  });

  const createPayoutMutation = useMutation({
    mutationFn: async ({ mentorProfileId, amount, description }) => {
      const response = await base44.functions.invoke('createMentorPayout', {
        mentorProfileId,
        amount,
        description
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['approved-mentors-admin']);
      setPayoutDialogOpen(false);
      setSelectedMentorForPayout(null);
      setPayoutAmount("");
      setPayoutDescription("");
    },
  });

  const handleApproveMentor = async (mentorId, approve) => {
    await approveMentorMutation.mutateAsync({
      id: mentorId,
      status: approve ? "approved" : "rejected"
    });
  };

  const handleResolveReport = async (reportId, action) => {
    await updateReportMutation.mutateAsync({
      id: reportId,
      data: {
        status: "resolved",
        action_taken: action
      }
    });
  };

  const handleCreatePayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!selectedMentorForPayout.stripe_connect_id) {
      alert("This mentor hasn't connected their Stripe account yet");
      return;
    }

    setIsProcessingPayout(true);
    try {
      await createPayoutMutation.mutateAsync({
        mentorProfileId: selectedMentorForPayout.id,
        amount: parseFloat(payoutAmount),
        description: payoutDescription || "Monthly mentorship payout"
      });
      alert("Payout created successfully!");
    } catch (error) {
      alert(`Failed to create payout: ${error.message}`);
    } finally {
      setIsProcessingPayout(false);
    }
  };

  const calculateMentorEarnings = (mentorProfileId) => {
    const mentorSubs = subscriptions.filter(s => 
      s.mentor_profile_id === mentorProfileId && s.status === "active"
    );
    const totalRevenue = mentorSubs.reduce((sum, sub) => sum + sub.amount, 0);
    return totalRevenue * 0.7; // 70% goes to mentor
  };

  const getMentorUser = (userId) => allUsers.find(u => u.id === userId);

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const platformRevenue = totalRevenue * 0.3;
  const activeSubscriptions = subscriptions.filter(s => s.status === "active").length;
  const pendingReports = reports.filter(r => r.status === "pending").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B5C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage mentors, monitor activity, and oversee platform operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-[#FF6B5C] to-[#E55A4C] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 opacity-80" />
                {pendingMentors.length > 0 && (
                  <Badge className="bg-white text-[#FF6B5C]">{pendingMentors.length}</Badge>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">{approvedMentors.length}</div>
              <div className="text-sm opacity-90">Active Mentors</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-1">${platformRevenue.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Platform Revenue (30%)</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold mb-1">{activeSubscriptions}</div>
              <div className="text-sm text-gray-600">Active Subscriptions</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <AlertCircle className="w-8 h-8 text-orange-500" />
                {pendingReports > 0 && (
                  <Badge className="bg-red-100 text-red-800">{pendingReports}</Badge>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">{reports.length}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border rounded-2xl p-1 shadow-sm">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="mentors" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Mentor Applications
              {pendingMentors.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{pendingMentors.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payouts" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Payouts
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Reports
              {pendingReports > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{pendingReports}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-[#FF6B5C] data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pending Mentor Applications</span>
                    <Badge variant="outline">{pendingMentors.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingMentors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No pending applications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingMentors.slice(0, 5).map(mentor => {
                        const mentorUser = getMentorUser(mentor.user_id);
                        return (
                          <div key={mentor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={mentor.profile_photo_url} />
                                <AvatarFallback className="bg-[#B3E5FC]">
                                  {mentorUser?.full_name?.charAt(0) || 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{mentorUser?.full_name}</p>
                                <p className="text-sm text-gray-600">{mentor.university}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMentor(mentor);
                                setMentorReviewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Reports</span>
                    <Badge variant="outline">{pendingReports}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No reports filed</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.slice(0, 5).map(report => (
                        <div key={report.id} className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`text-xs ${
                              report.status === "pending" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}>
                              {report.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(report.created_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">{report.report_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{report.description}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 w-full"
                            onClick={() => setSelectedReport(report)}
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mentors">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Pending Mentor Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingMentors.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">All caught up!</p>
                    <p className="text-sm">No pending mentor applications to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingMentors.map(mentor => {
                      const mentorUser = getMentorUser(mentor.user_id);
                      return (
                        <Card key={mentor.id} className="border-2">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={mentor.profile_photo_url} />
                                  <AvatarFallback className="bg-[#B3E5FC] text-xl">
                                    {mentorUser?.full_name?.charAt(0) || 'M'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-lg font-bold">{mentorUser?.full_name}</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge>{mentor.university}</Badge>
                                    <Badge variant="outline">{mentor.year}</Badge>
                                    <Badge variant="outline">{mentor.major}</Badge>
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => {
                                  setSelectedMentor(mentor);
                                  setMentorReviewDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Review Application
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Mentor Payouts</CardTitle>
                <p className="text-sm text-gray-600">Manage monthly payouts to mentors (70% of revenue)</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mentor</TableHead>
                      <TableHead>University</TableHead>
                      <TableHead>Active Students</TableHead>
                      <TableHead>Earnings (70%)</TableHead>
                      <TableHead>Stripe Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedMentors.map(mentor => {
                      const mentorUser = getMentorUser(mentor.user_id);
                      const earnings = calculateMentorEarnings(mentor.id);
                      
                      return (
                        <TableRow key={mentor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={mentor.profile_photo_url} />
                                <AvatarFallback className="bg-[#B3E5FC]">
                                  {mentorUser?.full_name?.charAt(0) || 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{mentorUser?.full_name}</p>
                                <p className="text-xs text-gray-500">{mentorUser?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{mentor.university}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {mentor.total_students || 0}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-green-600">
                              ${earnings.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {mentor.stripe_connect_id ? (
                              <Badge className="bg-green-100 text-green-800">
                                Connected
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                Not Connected
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedMentorForPayout(mentor);
                                setPayoutAmount(earnings.toFixed(2));
                                setPayoutDialogOpen(true);
                              }}
                              disabled={!mentor.stripe_connect_id || earnings === 0 || createPayoutMutation.isPending}
                            >
                              Create Payout
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {approvedMentors.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No Active Mentors</p>
                    <p className="text-sm">Approve mentor applications to see them here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Trust & Safety Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Reported User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map(report => {
                      const reporter = allUsers.find(u => u.id === report.reporter_id);
                      const reported = allUsers.find(u => u.id === report.reported_user_id);
                      
                      return (
                        <TableRow key={report.id}>
                          <TableCell className="text-sm">
                            {new Date(report.created_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {report.report_type.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{reporter?.full_name || reporter?.email}</TableCell>
                          <TableCell className="text-sm">{reported?.full_name || reported?.email}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${
                              report.status === "pending" ? "bg-red-100 text-red-800" :
                              report.status === "resolved" ? "bg-green-100 text-green-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReport(report)}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="font-bold text-xl">${totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6B5C]" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Platform Share (30%)</span>
                      <span className="font-bold text-xl text-green-600">${platformRevenue.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Mentor Earnings (70%)</span>
                      <span className="font-bold text-xl">${(totalRevenue * 0.7).toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#B3E5FC]" style={{ width: '70%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Platform Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Total Mentors</span>
                    <span className="text-2xl font-bold">{approvedMentors.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Active Subscriptions</span>
                    <span className="text-2xl font-bold">{activeSubscriptions}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Total Users</span>
                    <span className="text-2xl font-bold">{allUsers.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Avg. Revenue per Subscription</span>
                    <span className="text-2xl font-bold">
                      ${subscriptions.length > 0 ? (totalRevenue / subscriptions.length).toFixed(0) : 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mentor Application Review Dialog */}
      {selectedMentor && (
        <Dialog open={mentorReviewDialogOpen} onOpenChange={setMentorReviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Mentor Application Review</DialogTitle>
              <DialogDescription>
                Review the complete application for {getMentorUser(selectedMentor.user_id)?.full_name}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Basic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Full Name</Label>
                      <p className="font-medium">{getMentorUser(selectedMentor.user_id)?.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Email</Label>
                      <p className="font-medium">{getMentorUser(selectedMentor.user_id)?.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">University</Label>
                      <p className="font-medium">{selectedMentor.university}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Year</Label>
                      <p className="font-medium">{selectedMentor.year}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs text-gray-600">Major</Label>
                      <p className="font-medium">{selectedMentor.major}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Photo */}
                {selectedMentor.profile_photo_url && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-sm mb-3">Profile Photo</h3>
                    <img 
                      src={selectedMentor.profile_photo_url} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}

                {/* Bio */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-sm mb-3">About</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMentor.bio}</p>
                </div>

                {/* Expertise Areas */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-sm mb-3">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.expertise_areas?.map((area, idx) => (
                      <Badge key={idx} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>

                {/* Personal Essays */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <h3 className="font-bold text-lg mb-2">Personal Essays</h3>
                  
                  <div>
                    <Label className="text-xs text-gray-600 font-semibold">Greatest Achievement</Label>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1 whitespace-pre-wrap">{selectedMentor.greatest_achievement}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600 font-semibold">Advice to Younger Self</Label>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1 whitespace-pre-wrap">{selectedMentor.advice_to_younger_self}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600 font-semibold">Dream Job</Label>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1">{selectedMentor.dream_job}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600 font-semibold">Why This Major?</Label>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1 whitespace-pre-wrap">{selectedMentor.why_major}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600 font-semibold">Lifetime Goal</Label>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1 whitespace-pre-wrap">{selectedMentor.lifetime_goal}</p>
                  </div>
                </div>

                {/* Verification Documents */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-lg mb-2">Verification & Setup</h3>
                  
                  {selectedMentor.transcript_url && (
                    <div>
                      <Label className="text-xs text-gray-600 font-semibold">Transcript</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open(selectedMentor.transcript_url, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Transcript
                        <ExternalLinkIcon className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-gray-600 font-semibold">Calendly Link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded flex-1 truncate">{selectedMentor.calendly_link}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedMentor.calendly_link, '_blank')}
                      >
                        <ExternalLinkIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Application Date */}
                <div className="text-xs text-gray-500 text-center">
                  Application submitted on {new Date(selectedMentor.created_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMentorReviewDialogOpen(false)}
                disabled={approveMentorMutation.isPending}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleApproveMentor(selectedMentor.id, false)}
                disabled={approveMentorMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleApproveMentor(selectedMentor.id, true)}
                disabled={approveMentorMutation.isPending}
              >
                {approveMentorMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Report Details Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>
                Review and take action on this report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <p className="font-medium">{selectedReport.report_type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Description:</span>
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <Badge className="ml-2">{selectedReport.status}</Badge>
                </div>
              </div>

              {selectedReport.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleResolveReport(selectedReport.id, "Dismissed as minor issue")}
                    disabled={updateReportMutation.isPending}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleResolveReport(selectedReport.id, "User warned")}
                    disabled={updateReportMutation.isPending}
                  >
                    Warn User
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payout Dialog */}
      {selectedMentorForPayout && (
        <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Payout</DialogTitle>
              <DialogDescription>
                Send payout to {getMentorUser(selectedMentorForPayout.user_id)?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mentor:</span>
                  <span className="font-medium">{getMentorUser(selectedMentorForPayout.user_id)?.full_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Students:</span>
                  <span className="font-medium">{selectedMentorForPayout?.total_students || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stripe Account:</span>
                  {selectedMentorForPayout.stripe_connect_id ? (
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Not Connected</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-amount">Payout Amount ($)</Label>
                <Input
                  id="payout-amount"
                  type="number"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-12 rounded-xl"
                  disabled={isProcessingPayout}
                />
                <p className="text-xs text-gray-500">
                  Calculated earnings based on 70% revenue share
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-description">Description (Optional)</Label>
                <Input
                  id="payout-description"
                  value={payoutDescription}
                  onChange={(e) => setPayoutDescription(e.target.value)}
                  placeholder="Monthly mentorship payout"
                  className="h-12 rounded-xl"
                  disabled={isProcessingPayout}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPayoutDialogOpen(false)}
                  disabled={isProcessingPayout}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleCreatePayout}
                  disabled={isProcessingPayout || !payoutAmount || parseFloat(payoutAmount) <= 0 || !selectedMentorForPayout.stripe_connect_id}
                >
                  {isProcessingPayout ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Send ${payoutAmount}
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Funds will be transferred to the mentor's connected Stripe account. 
                  It typically takes 2-3 business days to arrive in their bank account.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
