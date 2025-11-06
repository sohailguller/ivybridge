
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

  const { data: reviews = [] } = useQuery({
    queryKey: ['mentor-reviews', mentorId],
    queryFn: async () => {
      const allReviews = await base44.entities.Review.filter({
        mentor_profile_id: mentorId,
        is_published: true
      }, '-created_date');
      return allReviews;
    },
    enabled: !!mentorId
  });

  const { data: reviewStudents = [] } = useQuery({
    queryKey: ['review-students', reviews],
    queryFn: async () => {
      if (reviews.length === 0) return [];
      const studentIds = [...new Set(reviews.map(r => r.student_id))];
      const users = await base44.entities.User.list();
      return users.filter(u => studentIds.includes(u.id));
    },
    enabled: reviews.length > 0
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

      localStorage.setItem('pending_subscription_id', subscription.id);
      localStorage.setItem('mentor_profile_id', mentor.id);

      const stripeUrls = {
        monthly: `https://buy.stripe.com/test_eVqfZj1uJg5l50e0pH1Fe00`,
        annual: `https://buy.stripe.com/test_6oUcN78Xb8CT0JY4FX1Fe01`
      };

      window.location.href = stripeUrls[planType];

    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("There was an error starting your subscription. Please try again.");
      setIsSubscribing(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 5.0; // Default to 5.0 if no reviews

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
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12 w-full">
      <div className="max-w-7xl lg:max-w-screen-xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("BrowseMentors"))}
          className="mb-6 lg:mb-8 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Mentors
        </Button>

        {isMentor && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 lg:mb-8">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is how students see your profile. You cannot subscribe to your own profile.
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded shadow-sm mb-6 lg:mb-8 overflow-hidden">
          <div className="h-32 lg:h-40 bg-gradient-to-r from-[#0D3B33] to-[#1a5a4e]" />

          <div className="p-6 lg:p-8 -mt-16 lg:-mt-20">
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mb-6">
              <Avatar className="w-32 h-32 lg:w-40 lg:h-40 border-4 border-white shadow-sm">
                <AvatarImage src={mentor.profile_photo_url || mentorUser?.profile_photo_url} />
                <AvatarFallback className="bg-[#E6EFEA] text-4xl lg:text-5xl text-[#0D3B33]">
                  {mentorUser?.full_name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 lg:mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                  {mentorUser?.full_name || 'Mentor'}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-3 lg:mb-4">
                  <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span className="text-lg lg:text-xl">{mentor.university} • {mentor.year}</span>
                </div>
                <Badge className="bg-[#E6EFEA] text-[#0D3B33] border-0 mb-4 text-sm lg:text-base">
                  {mentor.major}
                </Badge>

                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 lg:w-6 lg:h-6 ${
                        i < Math.round(averageRating)
                          ? 'fill-[#FE6C3A] text-[#FE6C3A]'
                          : 'text-gray-300'
                      }`} />
                    ))}
                  </div>
                  <span className="text-sm lg:text-base text-gray-600">
                    {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>

            {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {mentor.expertise_areas.map((area, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6 lg:p-8 border-l-4 border-l-[#FE6C3A]">
              <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                About Me
              </h2>
              <p className="text-gray-700 lg:text-lg leading-relaxed whitespace-pre-line">
                {mentor.bio}
              </p>
            </div>

            {mentor.personal_statement && (
              <div className="bg-white border border-gray-200 rounded shadow-sm p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                  Personal Insights
                </h2>
                <p className="text-gray-700 lg:text-lg leading-relaxed whitespace-pre-line">
                  {mentor.personal_statement}
                </p>
              </div>
            )}

            {mentor.expertise_description && (
              <div className="bg-white border border-gray-200 rounded shadow-sm p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                  Expertise Areas
                </h2>
                <p className="text-gray-700 lg:text-lg leading-relaxed whitespace-pre-line">
                  {mentor.expertise_description}
                </p>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded shadow-sm p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                What You'll Get
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 lg:text-lg">Unlimited 1-on-1 messaging throughout your entire application process</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 lg:text-lg">Weekly video meetings for personalized guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 lg:text-lg">Detailed essay reviews and edits with tracked feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 lg:text-lg">Strategic application planning and deadline management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 lg:text-lg">Mock interviews and comprehensive interview preparation</span>
                </li>
              </ul>
            </div>

            {reviews.length > 0 && (
              <div className="bg-white border border-gray-200 rounded shadow-sm p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-6 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                  Student Reviews
                </h2>
                <div className="space-y-6">
                  {reviews.map((review) => {
                    const student = reviewStudents.find(s => s.id === review.student_id);
                    return (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={student?.profile_photo_url} />
                            <AvatarFallback className="bg-[#E6EFEA] text-[#0D3B33]">
                              {student?.full_name?.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-[#0D3B33]">{student?.full_name?.split(' ')[0] || 'Student'}</p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-[#FE6C3A] text-[#FE6C3A]'
                                        : 'text-gray-300'
                                    }`} />
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_date).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div className="bg-white border-2 border-[#FE6C3A] rounded shadow-sm p-6">
              <div className="text-center mb-4">
                <div className="text-sm font-medium text-gray-600 mb-1">Monthly Plan</div>
                <div className="text-3xl font-bold mb-1 text-[#0D3B33]">$425</div>
                <div className="text-sm text-gray-600 mb-2">per month</div>
                <div className="text-xs text-gray-500 mb-4">12-month commitment</div>
              </div>
              <Button
                onClick={() => handleSubscribe('monthly', 425)}
                disabled={isMentor}
                className="w-full btn-primary text-white rounded py-5 mb-3"
              >
                Subscribe Monthly
              </Button>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">Annual Plan</div>
                <div className="text-3xl font-bold mb-1 text-[#0D3B33]">$5,000</div>
                <div className="text-sm text-gray-600 mb-2">one-time payment</div>
                <div className="text-xs text-gray-500 mb-4">Save $1,100</div>
              </div>
              <Button
                onClick={() => handleSubscribe('annual', 5000)}
                disabled={isMentor}
                className="w-full bg-[#FE6C3A] hover:bg-[#FF7B4A] text-white rounded py-5"
              >
                Subscribe Annually
              </Button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded shadow-sm p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-[#0D3B33] mb-1">
                  {mentor.total_students || 0}
                </div>
                <div className="text-sm text-gray-600">Current Students</div>
              </div>
              <div className="border-t border-gray-200 pt-4 text-center">
                <div className="text-2xl font-bold mb-1 text-[#0D3B33]">{averageRating}</div>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${
                      i < Math.round(averageRating)
                        ? 'fill-[#FE6C3A] text-[#FE6C3A]'
                        : 'text-gray-300'
                    }`} />
                  ))}
                </div>
                <div className="text-xs text-gray-600">
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
