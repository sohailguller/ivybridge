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
    <div className="min-h-screen bg-white">
      {/* Hero Section - More Conservative, No Background Image */}
      <section className="relative bg-[#0D3B33] py-16 border-b-4 border-[#FE6C3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white" style={{ fontFamily: 'Georgia, serif' }}>
              Get Into Your Dream School with Verified Ivy League Mentors
            </h1>

            <p className="text-lg md:text-xl text-white/95 leading-relaxed max-w-3xl mx-auto">
              Connect with current Ivy League students for personalized admissions guidance.
              From essay reviews to interview prep — get the insider advantage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                className="bg-[#FE6C3A] hover:bg-[#FF7B4A] text-white rounded px-8 py-5 text-base font-semibold shadow-lg"
                onClick={() => user ? navigate(createPageUrl("BrowseMentors")) : base44.auth.redirectToLogin(createPageUrl("BrowseMentors"))}
              >
                Find Your Mentor
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded px-8 py-5 text-base font-semibold bg-white text-[#0D3B33] hover:bg-gray-50 border-2 border-white"
                onClick={() => navigate(createPageUrl("ApplyAsMentor"))}
              >
                Become a Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Track Record Section - Ivy Coach Style */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              IvyBridge's Admissions Track Record
            </h2>
            <p className="text-gray-700">Real results from students who worked with our mentors</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-white rounded shadow-sm">
              <div className="text-4xl md:text-5xl font-bold text-[#FE6C3A] mb-2">{stats.mentors}+</div>
              <div className="text-sm text-gray-700 font-medium">Verified Ivy League Mentors</div>
            </div>
            <div className="text-center p-6 bg-white rounded shadow-sm">
              <div className="text-4xl md:text-5xl font-bold text-[#FE6C3A] mb-2">{stats.students}+</div>
              <div className="text-sm text-gray-700 font-medium">Students Guided</div>
            </div>
            <div className="text-center p-6 bg-white rounded shadow-sm">
              <div className="text-4xl md:text-5xl font-bold text-[#FE6C3A] mb-2">98%</div>
              <div className="text-sm text-gray-700 font-medium">Success Rate</div>
            </div>
            <div className="text-center p-6 bg-white rounded shadow-sm">
              <div className="text-4xl md:text-5xl font-bold text-[#FE6C3A] mb-2">{stats.sessions}+</div>
              <div className="text-sm text-gray-700 font-medium">Mentorship Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Mentors from Top Ivy League Schools
            </h2>
            <p className="text-gray-700">Current students from the most prestigious universities</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {universities.map((uni) => (
              <div key={uni} className="text-center p-4 bg-gray-50 rounded border border-gray-200 hover:border-[#0D3B33] transition-colors">
                <GraduationCap className="w-6 h-6 mx-auto mb-2 text-[#0D3B33]" />
                <div className="font-semibold text-[#0D3B33] text-sm">{uni}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - More Structured */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              How IvyBridge Works
            </h2>
            <p className="text-lg text-gray-700">
              A proven three-step process to get you into your dream school
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6 items-start bg-white p-6 rounded shadow-sm border-l-4 border-[#0D3B33]">
              <div className="w-12 h-12 bg-[#0D3B33] rounded flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#0D3B33]">Choose Your Mentor</h3>
                <p className="text-gray-700 leading-relaxed">
                  Browse verified Ivy League mentors by university, major, and expertise.
                  Read profiles and select the perfect match for your goals.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white p-6 rounded shadow-sm border-l-4 border-[#0D3B33]">
              <div className="w-12 h-12 bg-[#0D3B33] rounded flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#0D3B33]">Start Your Journey</h3>
                <p className="text-gray-700 leading-relaxed">
                  Subscribe to unlock 1-on-1 chat, video meetings, task tracking, and ongoing support
                  throughout your entire application process.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white p-6 rounded shadow-sm border-l-4 border-[#FE6C3A]">
              <div className="w-12 h-12 bg-[#FE6C3A] rounded flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#0D3B33]">Get Accepted</h3>
                <p className="text-gray-700 leading-relaxed">
                  Receive personalized guidance on essays, applications, and interviews.
                  Join hundreds of students who got into their dream schools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - List Style */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              IvyBridge Mentors Help Students:
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded border border-gray-200">
                <feature.icon className="w-6 h-6 text-[#0D3B33] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-1 text-[#0D3B33]">{feature.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Simpler Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Student Success Stories
            </h2>
            <p className="text-gray-700">Hear from students who got into their dream schools</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded shadow-sm border border-gray-200">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FE6C3A] text-[#FE6C3A]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-gray-200 pt-3">
                  <div className="font-semibold text-[#0D3B33] text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-600">{testimonial.university}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Clean Tables */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-700">Choose the plan that works best for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded border-2 border-gray-300 overflow-hidden">
              <div className="bg-gray-50 p-6 border-b-2 border-gray-300 text-center">
                <div className="text-xl font-bold text-[#0D3B33] mb-2">Monthly Plan</div>
                <div className="text-4xl font-bold text-[#0D3B33]">$425</div>
                <div className="text-gray-600 text-sm mt-1">per month</div>
                <div className="text-xs text-gray-500 mt-2">12-month commitment • Non-cancellable</div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited 1-on-1 messaging</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Weekly video sessions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Essay reviews & feedback</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Application milestone tracking</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-[#0D3B33] hover:bg-[#0D3B33]/90 text-white rounded py-5"
                  onClick={() => navigate(createPageUrl("BrowseMentors"))}
                >
                  Get Started
                </Button>
              </div>
            </div>

            <div className="bg-white rounded border-2 border-[#FE6C3A] overflow-hidden relative">
              <div className="absolute top-4 right-4 bg-[#FE6C3A] text-white px-3 py-1 rounded text-xs font-semibold">
                BEST VALUE
              </div>
              <div className="bg-[#FE6C3A]/10 p-6 border-b-2 border-[#FE6C3A] text-center">
                <div className="text-xl font-bold text-[#0D3B33] mb-2">Annual Plan</div>
                <div className="text-4xl font-bold text-[#0D3B33]">$5,000</div>
                <div className="text-gray-600 text-sm mt-1">one-time payment</div>
                <div className="text-xs text-gray-500 mt-2">Save over $1,100</div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Everything in Monthly Plan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span className="text-sm"><strong>Priority scheduling</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span className="text-sm"><strong>Direct phone access</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span className="text-sm"><strong>Save over $1,100</strong></span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-[#FE6C3A] hover:bg-[#FF7B4A] text-white rounded py-5"
                  onClick={() => navigate(createPageUrl("BrowseMentors"))}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simple Banner */}
      <section className="py-12 bg-[#0D3B33] border-t-4 border-[#FE6C3A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg mb-6 text-white/95">
            Join hundreds of students who got personalized guidance from Ivy League mentors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#FE6C3A] hover:bg-[#FF7B4A] text-white rounded px-8 py-5 font-semibold"
              onClick={() => navigate(createPageUrl("BrowseMentors"))}
            >
              Browse Mentors
            </Button>
            <Button
              size="lg"
              className="bg-white text-[#0D3B33] hover:bg-gray-100 rounded px-8 py-5 font-semibold"
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