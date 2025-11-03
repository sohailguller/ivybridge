
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  MapPin,
  Star,
  Calendar,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  Award,       // Added Award icon
  Lightbulb,   // Added Lightbulb icon
  Target,      // Added Target icon
  Heart,       // Added Heart icon
  BookOpen     // Added BookOpen icon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MentorProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const mentorId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      // Not logged in
    }
  };

  const { data: mentor, isLoading } = useQuery({
    queryKey: ['mentor-profile', mentorId],
    queryFn: async () => {
      const profiles = await base44.entities.MentorProfile.filter({ id: mentorId });
      return profiles[0];
    },
    enabled: !!mentorId
  });

  const { data: mentorUser } = useQuery({
    queryKey: ['mentor-user', mentor?.user_id],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: mentor.user_id });
      return users[0];
    },
    enabled: !!mentor?.user_id
  });

  const handleSubscribe = async (planType, amount) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    if (user.account_type === "mentor") {
      alert("Mentors cannot subscribe to other mentors. This platform is for mentors to guide students.");
      return;
    }

    setIsSubscribing(true);

    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 12);

      // Create pending subscription
      const subscription = await base44.entities.Subscription.create({
        student_id: user.id,
        mentor_id: mentor.user_id,
        mentor_profile_id: mentor.id,
        plan_type: planType,
        amount: amount,
        status: "pending",
        start_date: startDate,
        end_date: endDate.toISOString().split('T')[0],
        months_remaining: 12,
        stripe_subscription_id: `pending_${Date.now()}_${user.id}`
      });

      // Store for reference
      localStorage.setItem('pending_subscription_id', subscription.id);
      localStorage.setItem('mentor_profile_id', mentor.id);

      // Call checkout session function with metadata (NOT hardcoded payment links)
      const response = await base44.functions.invoke('createCheckoutSession', {
        mentorProfileId: mentor.id,
        planType: planType
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }

    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("There was an error starting your subscription. Please try again.");
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-64 w-full rounded-3xl mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Card className="max-w-md mx-4 rounded-3xl border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Mentor Not Found</h2>
            <p className="text-gray-600 mb-6">The mentor you're looking for doesn't exist.</p>
            <Button onClick={() => navigate(createPageUrl("BrowseMentors"))}>
              Browse Mentors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMentor = user?.account_type === "mentor";

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("BrowseMentors"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mentors
        </Button>

        {/* Mentor Alert */}
        {isMentor && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Note:</strong> As a mentor, you cannot subscribe to other mentors. This platform is designed for mentors to guide students.
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Card */}
        <Card className="rounded-3xl border-0 shadow-xl mb-8 overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-[#FF6B5C] to-[#E55A4C] relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200')] opacity-20 bg-cover bg-center" />
          </div>

          <CardContent className="p-8 -mt-16">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src={mentor.profile_photo_url || mentorUser?.profile_photo_url} />
                <AvatarFallback className="bg-[#B3E5FC] text-4xl">
                  {mentorUser?.full_name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                      {mentorUser?.full_name || 'Mentor'}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <GraduationCap className="w-5 h-5" />
                      <span className="text-lg">{mentor.university} • {mentor.year}</span>
                    </div>
                    <Badge className="bg-[#B3E5FC]/30 text-[#222222] border-0">
                      {mentor.major}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#FF6B5C] text-[#FF6B5C]" />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mentor.expertise_areas?.slice(0, 4).map((area, idx) => (
                    <Badge key={idx} variant="outline">
                      {area}
                    </Badge>
                  ))}
                  {mentor.expertise_areas?.length > 4 && (
                    <Badge variant="outline" className="text-gray-500">
                      +{mentor.expertise_areas.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* About Me */}
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  About Me
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {mentor.bio}
                </p>
              </CardContent>
            </Card>

            {/* Personal Insights */}
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  Get to Know Me
                </h2>
                <div className="space-y-6">
                  {mentor.greatest_achievement && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold mb-2 text-gray-900">My Greatest Achievement</div>
                        <p className="text-gray-600 leading-relaxed">{mentor.greatest_achievement}</p>
                      </div>
                    </div>
                  )}

                  {mentor.advice_to_younger_self && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold mb-2 text-gray-900">Advice to My Younger Self</div>
                        <p className="text-gray-600 leading-relaxed">{mentor.advice_to_younger_self}</p>
                      </div>
                    </div>
                  )}

                  {mentor.dream_job && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold mb-2 text-gray-900">My Dream Job</div>
                        <p className="text-gray-600 leading-relaxed">{mentor.dream_job}</p>
                      </div>
                    </div>
                  )}

                  {mentor.why_major && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold mb-2 text-gray-900">Why I Chose {mentor.major}</div>
                        <p className="text-gray-600 leading-relaxed">{mentor.why_major}</p>
                      </div>
                    </div>
                  )}

                  {mentor.lifetime_goal && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <div className="font-semibold mb-2 text-gray-900">My Lifetime Goal</div>
                        <p className="text-gray-600 leading-relaxed">{mentor.lifetime_goal}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expertise Areas */}
            {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                    Areas of Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise_areas.map((area, idx) => (
                      <Badge key={idx} className="bg-[#B3E5FC]/30 text-[#222222] border-0 py-2 px-4">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What You'll Get */}
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  What You'll Get
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: MessageSquare, title: "Unlimited 1-on-1 Messaging", desc: "Ask questions anytime and get personalized responses" },
                    { icon: Calendar, title: "Weekly Video Sessions", desc: "Regular check-ins to review progress and plan next steps" },
                    { icon: CheckCircle, title: "Essay Reviews", desc: "Detailed feedback on all your application essays" },
                    { icon: GraduationCap, title: "Application Strategy", desc: "Expert guidance on university selection and deadlines" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-12 h-12 bg-[#FF6B5C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-[#FF6B5C]" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1">{item.title}</div>
                        <div className="text-sm text-gray-600">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Cards */}
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Monthly Plan</h3>
                <div className="text-4xl font-bold mb-2">$425</div>
                <div className="text-sm text-gray-600 mb-4">per month</div>
                <div className="text-xs text-gray-500 mb-4">12-month commitment</div>
                <Button
                  className="w-full btn-primary text-white rounded-xl mb-2"
                  onClick={() => handleSubscribe("monthly", 425)}
                  disabled={isSubscribing || isMentor}
                >
                  {isSubscribing ? "Processing..." : "Subscribe Monthly"}
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2 border-[#FF6B5C] shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FF6B5C] text-white px-4 py-1 rounded-full text-xs font-medium">
                Best Value
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Annual Plan</h3>
                <div className="text-4xl font-bold mb-2">$5,000</div>
                <div className="text-sm text-gray-600 mb-4">one-time payment</div>
                <div className="text-xs text-green-600 font-medium mb-4">Save $1,100!</div>
                <Button
                  className="w-full bg-[#FF6B5C] hover:bg-[#E55A4C] text-white rounded-xl mb-2"
                  onClick={() => handleSubscribe("annual", 5000)}
                  disabled={isSubscribing || isMentor}
                >
                  {isSubscribing ? "Processing..." : "Subscribe Annually"}
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-[#FF6B5C]/5 to-[#B3E5FC]/10">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-[#FF6B5C] mb-1">
                    {mentor.total_students || 0}
                  </div>
                  <div className="text-sm text-gray-600">Current Students</div>
                </div>
                <div className="border-t border-gray-200 pt-4 text-center">
                  <div className="text-2xl font-bold mb-1">5.0</div>
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FF6B5C] text-[#FF6B5C]" />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">Average Rating</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
