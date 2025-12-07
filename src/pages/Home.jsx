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
  Sparkles } from
"lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
  }];


  const universities = [
  "Harvard", "Yale", "Princeton", "Columbia", "Brown", "Dartmouth", "Cornell", "Penn", "Stanford"];


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
  }];


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-end overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=dihudketx&public_id=copy_1B6020D0-9018-4FE7-AA40-A66AFE768D32_alwvzo&profile=cld-default&autoplay=true&loop=true&muted=true&controls=false"
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto"
            style={{
              border: 'none',
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%) scale(1.5)',
              width: '177.77vh',
              height: '56.25vw',
              minWidth: '100%',
              minHeight: '100%'
            }}
            allow="autoplay; fullscreen" />

        </div>

        {/* Darker Gradient overlay for better text readability and premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B33]/90 via-[#0D3B33]/40 to-black/20" />

        {/* Content - Bottom Left Aligned */}
        <div className="relative w-full px-6 md:px-12 lg:px-24 pb-20 md:pb-32">
          <div className="max-w-3xl">
            <h1 className="text-white mb-6 text-5xl md:text-6xl lg:text-7xl font-normal leading-tight" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', textTransform: 'none' }}>
              Your Insider Path to the Ivy League
            </h1>

            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-10 font-light">
              Don't just apply. Stand out. Get personalized 1-on-1 guidance from verified students who have already cracked the code to Harvard, Yale, Princeton, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="btn-primary text-white rounded-sm px-10 py-7 text-lg font-medium shadow-xl hover:translate-y-[-2px] transition-transform"
                onClick={() => user ? navigate(createPageUrl("BrowseMentors")) : base44.auth.redirectToLogin(createPageUrl("BrowseMentors"))}>
                Find Your Mentor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-sm px-10 py-7 text-lg font-medium bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0D3B33] transition-colors"
                onClick={() => navigate(createPageUrl("ApplyAsMentor"))}>
                Become a Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Orange Border Accent */}
      <div className="border-b-4 border-[#FE6C3A]" />

      {/* Universities Ticker */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="w-full px-6 md:px-12">
          <p className="text-center text-sm text-gray-500 mb-8 tracking-wider">MENTORS FROM</p>
          <div className="overflow-hidden">
            <div className="flex animate-scroll whitespace-nowrap">
              {[...universities, ...universities, ...universities, ...universities].map((uni, idx) =>
              <div key={idx} className="inline-flex items-center mx-12">
                  <span className="text-3xl font-semibold text-[#0D3B33]">{uni}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>

      {/* How It Works - Redesigned */}
      <section className="py-24 bg-white">
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className="text-center mb-16">
            <span className="text-[#FE6C3A] font-bold tracking-widest text-sm uppercase mb-2 block">The Process</span>
            <h2 className="text-4xl md:text-5xl font-normal mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Your Journey to Acceptance
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">A structured, personalized approach designed to maximize your admissions chances.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
             {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 z-0"></div>

            <div className="relative z-10 text-center group">
              <div className="w-24 h-24 bg-white border-2 border-[#E6EFEA] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:border-[#FE6C3A] transition-colors duration-300">
                <span className="text-3xl font-bold text-[#0D3B33]">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#0D3B33]">Choose Your Mentor</h3>
              <p className="text-gray-600 leading-relaxed px-4">
                Browse our curated network of verified Ivy League students. Filter by university, major, and expertise to find the perfect role model who shares your dream.
              </p>
            </div>

            <div className="relative z-10 text-center group">
              <div className="w-24 h-24 bg-white border-2 border-[#E6EFEA] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:border-[#FE6C3A] transition-colors duration-300">
                <span className="text-3xl font-bold text-[#0D3B33]">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#0D3B33]">Start the Partnership</h3>
              <p className="text-gray-600 leading-relaxed px-4">
                Unlock direct access via chat and video calls. Build a roadmap, set milestones, and get real-time feedback on your essays and strategy.
              </p>
            </div>

            <div className="relative z-10 text-center group">
              <div className="w-24 h-24 bg-white border-2 border-[#E6EFEA] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:border-[#FE6C3A] transition-colors duration-300">
                <span className="text-3xl font-bold text-[#0D3B33]">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#0D3B33]">Craft Your Story</h3>
              <p className="text-gray-600 leading-relaxed px-4">
                Submit an application that truly stands out. With insider knowledge and personalized coaching, you'll walk into interviews with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Redesigned with Dashboard Image */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Side: Content & Features List */}
            <div className="lg:col-span-4">
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-normal mb-4 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                  Everything You Need to Succeed
                </h2>
                <p className="text-gray-600 text-lg">
                  Comprehensive tools and support for your college journey, all in one place.
                </p>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) =>
                  <div key={index} className="flex gap-4 items-center group">
                    <div className="w-10 h-10 bg-[#E6EFEA] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#FE6C3A] group-hover:text-white transition-colors duration-300">
                      <feature.icon className="w-5 h-5 text-[#0D3B33] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-base font-bold text-[#0D3B33]">{feature.title}</h3>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Dashboard Screenshot */}
            <div className="relative mt-12 lg:mt-0 lg:col-span-8">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#FE6C3A]/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#0D3B33]/5 rounded-full blur-3xl"></div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                {/* Dashboard Placeholder Image */}
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/674cccd3f_Screenshot2025-12-06at103331PM.png"
                  alt="Student Dashboard Interface"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Pricing */}
      <section className="py-16 bg-white border-t-4 border-t-[#FE6C3A]">
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600">Choose the plan that works best for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded p-8">
              <div className="text-center">
                <div className="text-base font-medium text-gray-600 mb-2">Monthly Plan</div>
                <div className="text-4xl font-bold mb-1 text-[#0D3B33]">$425</div>
                <div className="text-gray-600 mb-4">per month</div>
                <div className="text-xs text-gray-500 mb-6">12-month commitment • Non-cancellable</div>

                <ul className="space-y-3 text-left mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Unlimited 1-on-1 messaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Monthly video sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Essay reviews & feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Application milestone tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Interview preparation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Monthly progress reports</span>
                  </li>
                </ul>

                <Button
                  className="w-full btn-primary text-white rounded py-5"
                  onClick={() => navigate(createPageUrl("BrowseMentors"))}>

                  Get Started
                </Button>
              </div>
            </div>

            <div className="bg-white border-2 border-[#FE6C3A] rounded p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FE6C3A] text-white px-3 py-1 rounded text-xs font-medium">
                Best Value
              </div>
              <div className="text-center">
                <div className="text-base font-medium text-gray-600 mb-2">Annual Plan</div>
                <div className="text-4xl font-bold mb-1 text-[#0D3B33]">$5,000</div>
                <div className="text-gray-600 mb-4">one-time payment</div>
                <div className="text-xs text-gray-500 mb-6">12 months of mentorship • Save $100</div>

                <ul className="space-y-3 text-left mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Unlimited 1-on-1 messaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Monthly video sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Essay reviews & feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Application milestone tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Interview preparation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Monthly progress reports</span>
                  </li>
                </ul>

                <Button
                  className="w-full bg-[#FE6C3A] hover:bg-[#FF7B4A] text-white rounded py-5"
                  onClick={() => navigate(createPageUrl("BrowseMentors"))}>

                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0D3B33] text-white">
        <div className="w-full px-6 md:px-12 lg:px-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join hundreds of students who got personalized guidance from Ivy League mentors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="btn-primary text-white rounded px-8 py-5"
              onClick={() => navigate(createPageUrl("BrowseMentors"))}>

              Browse Mentors
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 rounded px-8 py-5"
              onClick={() => navigate(createPageUrl("ApplyAsMentor"))}>

              Become a Mentor
            </Button>
          </div>
        </div>
      </section>
    </div>);

}