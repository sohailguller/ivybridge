
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GraduationCap, 
  MessageSquare, 
  Calendar, 
  CheckCircle, 
  Star,
  TrendingUp,
  Shield,
  ArrowRight,
  Users,
  Award,
  Sparkles
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    mentors: 0,
    students: 0,
    sessions: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load stats
      const mentors = await base44.entities.MentorProfile.filter({ verification_status: "approved" });
      const subscriptions = await base44.entities.Subscription.list();
      
      setStats({
        mentors: mentors.length,
        students: subscriptions.length,
        sessions: subscriptions.length * 12
      });
    } catch (error) {
      // Not logged in
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: "1-on-1 Mentorship",
      description: "Direct access to current Ivy League students through secure messaging and video calls"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book sessions at your convenience with integrated calendar and meeting tools"
    },
    {
      icon: CheckCircle,
      title: "Task Management",
      description: "Stay organized with personalized to-do lists and application milestone tracking"
    },
    {
      icon: Shield,
      title: "Verified Mentors",
      description: "All mentors are verified current students with transcripts and university confirmation"
    }
  ];

  const universities = [
    "Harvard", "Yale", "Princeton", "Columbia", "Brown", "Dartmouth", "Cornell", "Penn"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      university: "Stanford → Harvard",
      text: "My mentor helped me craft a compelling personal statement that got me into Harvard. The guidance was invaluable!",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      university: "LA High School → Yale",
      text: "Having a current Yale student guide me through the process made all the difference. Highly recommend!",
      rating: 5
    },
    {
      name: "Priya Patel",
      university: "India → Columbia",
      text: "As an international student, IvyBridge gave me the insider perspective I needed to navigate US admissions.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FFF5F3] via-white to-[#F0F9FF] py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600')] opacity-5 bg-cover bg-center" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B5C]/10 rounded-full text-sm font-medium text-[#FF6B5C]">
                <Sparkles className="w-4 h-4" />
                Trusted by 500+ students worldwide
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Get Into Your{" "}
                <span className="text-[#FF6B5C]">Dream School</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with verified Ivy League mentors for personalized admissions guidance. 
                From essay reviews to interview prep — get the insider advantage.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="btn-primary text-white rounded-full px-8 py-6 text-lg"
                  onClick={() => user ? navigate(createPageUrl("BrowseMentors")) : base44.auth.redirectToLogin(createPageUrl("BrowseMentors"))}
                >
                  Find Your Mentor
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg border-2"
                  onClick={() => navigate(createPageUrl("ApplyAsMentor"))}
                >
                  Become a Mentor
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-[#FF6B5C]">{stats.mentors}+</div>
                  <div className="text-sm text-gray-600">Ivy Mentors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FF6B5C]">{stats.students}+</div>
                  <div className="text-sm text-gray-600">Students Helped</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FF6B5C]">98%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" 
                  alt="Students studying"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 card-hover">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#B3E5FC] rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#222222]" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">100% Verified</div>
                    <div className="text-sm text-gray-600">All mentors checked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Mentors from Top Ivy League Schools
            </h2>
            <p className="text-gray-600">Connect with current students from the most prestigious universities</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {universities.map((uni) => (
              <Card key={uni} className="card-hover border-2 cursor-pointer">
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-[#FF6B5C]" />
                    <div className="font-semibold">{uni}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-white to-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              How IvyBridge Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, proven process to get you into your dream school
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover bg-white rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[#FF6B5C]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-[#FF6B5C]" />
                </div>
                <div className="text-2xl font-bold mb-4">1. Choose Your Mentor</div>
                <p className="text-gray-600 leading-relaxed">
                  Browse verified Ivy League mentors by university, major, and expertise. 
                  Read profiles and select the perfect match for your goals.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[#B3E5FC]/50 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-[#222222]" />
                </div>
                <div className="text-2xl font-bold mb-4">2. Start Your Journey</div>
                <p className="text-gray-600 leading-relaxed">
                  Subscribe to unlock 1-on-1 chat, video meetings, task tracking, and ongoing support 
                  throughout your entire application process.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[#FF6B5C]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-[#FF6B5C]" />
                </div>
                <div className="text-2xl font-bold mb-4">3. Get Accepted</div>
                <p className="text-gray-600 leading-relaxed">
                  Receive personalized guidance on essays, applications, and interviews. 
                  Join hundreds of students who got into their dream schools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">Comprehensive tools and support for your college journey</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover bg-gradient-to-br from-white to-[#FAFAFA] rounded-3xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex gap-6">
                    <div className="w-16 h-16 bg-[#FF6B5C]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-8 h-8 text-[#FF6B5C]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-[#FFF5F3] to-[#F0F9FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">Hear from students who got into their dream schools</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover bg-white rounded-3xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#FF6B5C] text-[#FF6B5C]" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.university}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">Choose the plan that works best for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-hover rounded-3xl border-2 shadow-xl">
              <CardContent className="p-10">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-600 mb-2">Monthly Plan</div>
                  <div className="text-5xl font-bold mb-2">$425</div>
                  <div className="text-gray-600 mb-6">per month</div>
                  <div className="text-sm text-gray-500 mb-8">12-month commitment • Non-cancellable</div>
                  
                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
                      <span>Unlimited 1-on-1 messaging</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
                      <span>Weekly video sessions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
                      <span>Essay reviews & feedback</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
                      <span>Application milestone tracking</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full btn-primary text-white rounded-full py-6 text-lg"
                    onClick={() => navigate(createPageUrl("BrowseMentors"))}
                  >
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover rounded-3xl border-2 border-[#FF6B5C] shadow-xl relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-[#FF6B5C] text-white px-4 py-1 rounded-full text-sm font-medium">
                Save $1,100
              </div>
              <CardContent className="p-10">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-600 mb-2">Annual Plan</div>
                  <div className="text-5xl font-bold mb-2">$5,000</div>
                  <div className="text-gray-600 mb-6">one-time payment</div>
                  <div className="text-sm text-gray-500 mb-8">12 months of mentorship • Best value</div>
                  
                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
                      <span>Everything in Monthly Plan</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
                      <span><strong>Priority scheduling</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
                      <span><strong>Direct phone access</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
                      <span><strong>Save over $1,100</strong></span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full bg-[#FF6B5C] hover:bg-[#E55A4C] text-white rounded-full py-6 text-lg"
                    onClick={() => navigate(createPageUrl("BrowseMentors"))}
                  >
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#FF6B5C] to-[#E55A4C] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Join hundreds of students who got personalized guidance from Ivy League mentors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              className="bg-white text-[#FF6B5C] hover:bg-gray-50 rounded-full px-8 py-6 text-lg font-semibold"
              onClick={() => navigate(createPageUrl("BrowseMentors"))}
            >
              Browse Mentors
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg font-semibold"
              onClick={() => navigate(createPageUrl("ApplyAsMentor"))}
            >
              Become a Mentor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
