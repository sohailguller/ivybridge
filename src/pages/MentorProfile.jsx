
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
  BookOpen,     // Added BookOpen icon
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function MentorProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const mentorId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

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

  // University background images mapping
  const universityImages = {
    Harvard: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    Yale: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=1200&q=80",
    Princeton: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&q=80",
    Columbia: "https://images.unsplash.com/photo-1555786750-7c3c2b9a6b0e?w=1200&q=80",
    Brown: "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=1200&q=80",
    Dartmouth: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    Cornell: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=1200&q=80",
    Penn: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80"
  };

  const personalQuestions = [
    {
      id: 'achievement',
      icon: Award,
      question: "What is your greatest achievement?",
      answer: mentor?.greatest_achievement
    },
    {
      id: 'advice',
      icon: Lightbulb,
      question: "What advice would you give to your younger self?",
      answer: mentor?.advice_to_younger_self
    },
    {
      id: 'dream',
      icon: Target,
      question: "What is your dream job?",
      answer: mentor?.dream_job
    },
    {
      id: 'major',
      icon: BookOpen,
      question: "Why did you choose your major?",
      answer: mentor?.why_major
    },
    {
      id: 'lifetime',
      icon: Heart,
      question: "What is one thing you hope to accomplish in your lifetime?",
      answer: mentor?.lifetime_goal
    }
  ];

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
  const universityBg = universityImages[mentor.university] || universityImages.Harvard;


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-24">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("BrowseMentors"))}
          className="mb-6 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Mentors
        </Button>

        {isMentor && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is how students see your profile. You cannot subscribe to your own profile.
            </p>
          </div>
        )}

        {/* Banner with University Image */}
        <div className="bg-white border border-gray-200 rounded shadow-sm mb-6 overflow-hidden">
          <div 
            className="h-32 bg-cover bg-center relative"
            style={{ 
              backgroundImage: `url(${universityBg})`,
              backgroundPosition: 'center 30%'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
          </div>

          <div className="p-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg ring-2 ring-gray-100">
                <AvatarImage src={mentor.profile_photo_url || mentorUser?.profile_photo_url} />
                <AvatarFallback className="bg-[#E6EFEA] text-4xl text-[#0D3B33]">
                  {mentorUser?.full_name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 bg-white rounded-lg">
                <h1 className="text-3xl font-bold mb-2 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                  {mentorUser?.full_name || 'Mentor'}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-lg">{mentor.university} • {mentor.year}</span>
                </div>
                <Badge className="bg-[#E6EFEA] text-[#0D3B33] border-0 mb-4">
                  {mentor.major}
                </Badge>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${
                        i < Math.round(averageRating)
                          ? 'fill-[#FE6C3A] text-[#FE6C3A]'
                          : 'text-gray-300'
                      }`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
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

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* About Me */}
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6 border-l-4 border-l-[#FE6C3A]">
              <h2 className="text-xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                About Me
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.bio}
              </p>
            </div>

            {/* Personal Questions - FAQ Style */}
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                Get to Know Me
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Click to read my responses to common questions
              </p>
              <div className="space-y-3">
                {personalQuestions.map((item) => {
                  if (!item.answer) return null;
                  const Icon = item.icon;
                  const isOpen = openFAQ === item.id;
                  
                  return (
                    <Collapsible
                      key={item.id}
                      open={isOpen}
                      onOpenChange={() => setOpenFAQ(isOpen ? null : item.id)}
                    >
                      <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#FE6C3A] transition-colors">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3 flex-1 text-left">
                              <div className="w-8 h-8 bg-[#E6EFEA] rounded-full flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-[#0D3B33]" />
                              </div>
                              <span className="font-semibold text-[#0D3B33] text-sm">
                                {item.question}
                              </span>
                            </div>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 bg-white border-t border-gray-200">
                            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                              {item.answer}
                            </p>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </div>

            {/* What You'll Get */}
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                What You'll Get
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited 1-on-1 messaging throughout your entire application process</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Weekly video meetings for personalized guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Detailed essay reviews and edits with tracked feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Strategic application planning and deadline management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Mock interviews and comprehensive interview preparation</span>
                </li>
              </ul>
            </div>

            {reviews.length > 0 && (
              <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
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

          <div className="space-y-6">
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
