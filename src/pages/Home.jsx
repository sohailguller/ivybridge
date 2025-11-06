
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
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/66f4ff229_Harvard-University-Campus.jpg)'
          }}
        />

        {/* Overlay */}

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/20">
              <Sparkles className="w-4 h-4" />
              Trusted by 500+ students worldwide
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white" style={{ fontFamily: 'Georgia, serif' }}>
              Get Into Your{" "}
              <span className="text-[#FE6C3A]">Dream School</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Connect with verified Ivy League mentors for personalized admissions guidance.
              From essay reviews to interview prep — get the insider advantage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="btn-primary text-white rounded-lg px-10 py-6 text-lg font-semibold shadow-xl"
                onClick={() => user ? navigate(createPageUrl("BrowseMentors")) : base44.auth.redirectToLogin(createPageUrl("BrowseMentors"))}
              >
                Find Your Mentor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg px-10 py-6 text-lg font-semibold bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20"
                onClick={() => navigate(createPageUrl("ApplyAsMentor"))}
              >
                Become a Mentor
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-12 pt-12">
              <div>
                <div className="text-4xl font-bold text-[#FE6C3A]">{stats.mentors}+</div>
                <div className="text-sm text-white/80">Ivy Mentors</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FE6C3A]">{stats.students}+</div>
                <div className="text-sm text-white/80">Students Helped</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FE6C3A]">98%</div>
                <div className="text-sm text-white/80">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Mentors from Top Ivy League Schools
            </h2>
            <p className="text-gray-600">Connect with current students from the most prestigious universities</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {universities.map((uni) => (
              <Card key={uni} className="card-hover border cursor-pointer bg-[#E6EFEA]/30">
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-[#0D3B33]" />
                    <div className="font-semibold text-[#0D3B33]">{uni}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#E6EFEA]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              How IvyBridge Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, proven process to get you into your dream school
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover bg-white rounded-2xl border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-[#0D3B33]/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-[#0D3B33]" />
                </div>
                <div className="text-2xl font-bold mb-4 text-[#0D3B33]">1. Choose Your Mentor</div>
                <p className="text-gray-600 leading-relaxed">
                  Browse verified Ivy League mentors by university, major, and expertise.
                  Read profiles and select the perfect match for your goals.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white rounded-2xl border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-[#0D3B33]/10 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-[#0D3B33]" />
                </div>
                <div className="text-2xl font-bold mb-4 text-[#0D3B33]">2. Start Your Journey</div>
                <p className="text-gray-600 leading-relaxed">
                  Subscribe to unlock 1-on-1 chat, video meetings, task tracking, and ongoing support
                  throughout your entire application process.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white rounded-2xl border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-[#FE6C3A]/10 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-[#FE6C3A]" />
                </div>
                <div className="text-2xl font-bold mb-4 text-[#0D3B33]">3. Get Accepted</div>
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
            <h2 className="text-4xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">Comprehensive tools and support for your college journey</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover bg-white rounded-2xl border shadow-md">
                <CardContent className="p-8">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-[#0D3B33]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-7 h-7 text-[#0D3B33]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-[#0D3B33]">{feature.title}</h3>
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
      <section className="py-20 bg-[#E6EFEA]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">Hear from students who got into their dream schools</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover bg-white rounded-2xl border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#FE6C3A] text-[#FE6C3A]" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-semibold text-[#0D3B33]">{testimonial.name}</div>
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
            <h2 className="text-4xl font-bold mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">Choose the plan that works best for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-hover rounded-2xl border shadow-md">
              <CardContent className="p-10">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-600 mb-2">Monthly Plan</div>
                  <div className="text-5xl font-bold mb-2 text-[#0D3B33]">$425</div>
                  <div className="text-gray-600 mb-6">per month</div>
                  <div className="text-sm text-gray-500 mb-8">12-month commitment • Non-cancellable</div>

                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                      <span>Unlimited 1-on-1 messaging</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                      <span>Weekly video sessions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                      <span>Essay reviews & feedback</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                      <span>Application milestone tracking</span>
                    </li>
                  </ul>

                  <Button
                    className="w-full btn-primary text-white rounded-lg py-6 text-lg"
                    onClick={() => navigate(createPageUrl("BrowseMentors"))}
                  >
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover rounded-2xl border-2 border-[#FE6C3A] shadow-xl relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-[#FE6C3A] text-white px-4 py-1 rounded-full text-sm font-medium">
                Save $1,100
              </div>
              <CardContent className="p-10">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-600 mb-2">Annual Plan</div>
                  <div className="text-5xl font-bold mb-2 text-[#0D3B33]">$5,000</div>
                  <div className="text-gray-600 mb-6">one-time payment</div>
                  <div className="text-sm text-gray-500 mb-8">12 months of mentorship • Best value</div>

                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                      <span>Everything in Monthly Plan</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                      <span><strong>Priority scheduling</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                      <span><strong>Direct phone access</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                      <span><strong>Save over $1,100</strong></span>
                    </li>
                  </ul>

                  <Button
                    className="w-full bg-[#FE6C3A] hover:bg-[#FF7B4A] text-white rounded-lg py-6 text-lg"
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
      <section className="py-20 bg-[#0D3B33] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of students who got personalized guidance from Ivy League mentors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="btn-primary text-white rounded-lg px-10 py-6 text-lg font-semibold"
              onClick={() => navigate(createPageUrl("BrowseMentors"))}
            >
              Browse Mentors
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 rounded-lg px-10 py-6 text-lg font-semibold"
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
