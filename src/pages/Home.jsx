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
    }};
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
      <section className="relative h-screen flex items-end overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=dihudketx&public_id=AdobeStock_503416191_Video_4K_Preview_ii79ks&profile=cld-default&autoplay=true&loop=true&muted=true&controls=false"
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

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Content - Bottom Left Aligned */}
        <div className="relative w-full px-8 md:px-16 lg:px-20 pb-16 md:pb-20">
          <div className="max-w-4xl">
            <h1 className="text-white mb-5 text-4xl font-normal capitalize leading-tight md:text-5xl lg:text-6xl" style={{ fontFamily: 'Georgia, serif', fontWeight: 400, letterSpacing: '-0.02em' }}>GET INTO YOUR DREAM SCHOOL

            </h1>

            <p className="text-base md:text-lg text-white/95 leading-relaxed max-w-2xl mb-6" style={{ fontFamily: 'Georgia, serif' }}>Connect with verified mentors from top U.S. universities for personalized admissions guidance. From essay reviews to interview prep — get the insider advantage.


            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="btn-primary text-white rounded px-8 py-4 text-base font-semibold"
                onClick={() => user ? navigate(createPageUrl("BrowseMentors")) : base44.auth.redirectToLogin(createPageUrl("BrowseMentors"))}>

                Find Your Mentor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded px-8 py-4 text-base font-semibold bg-white/95 border-2 border-white text-[#0D3B33] hover:bg-white"
                onClick={() => navigate(createPageUrl("ApplyAsMentor"))}>

                Become a Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Orange Border Accent */}
      <div className="border-b-4 border-[#FE6C3A]" />

      {/* Track Record Section */}
      <section className="py-12 bg-gray-50">
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Our Track Record
            </h2>
            <p className="text-gray-600">Trusted by students worldwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded p-6 text-center">
              <div className="text-4xl font-bold text-[#0D3B33] mb-2">{stats.mentors}+</div>
              <div className="text-sm text-gray-600 font-medium">Verified Ivy League Mentors</div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-6 text-center">
              <div className="text-4xl font-bold text-[#0D3B33] mb-2">{stats.students}+</div>
              <div className="text-sm text-gray-600 font-medium">Students Successfully Guided</div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-6 text-center">
              <div className="text-4xl font-bold text-[#0D3B33] mb-2">98%</div>
              <div className="text-sm text-gray-600 font-medium">Client Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

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

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              How IvyBridge Works
            </h2>
            <p className="text-gray-600">A proven process to get you into your dream school</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded p-6 border-l-4 border-l-[#FE6C3A]">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#0D3B33]">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#0D3B33]">Choose Your Mentor</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Browse verified Ivy League mentors by university, major, and expertise.
                    Read profiles and select the perfect match for your goals.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded p-6 border-l-4 border-l-[#0D3B33]">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#0D3B33]">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#0D3B33]">Start Your Journey</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Subscribe to unlock 1-on-1 chat, video meetings, task tracking, and ongoing support
                    throughout your entire application process.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded p-6 border-l-4 border-l-[#FE6C3A]">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#0D3B33]">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#0D3B33]">Get Accepted</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive personalized guidance on essays, applications, and interviews.
                    Join hundreds of students who got into their dream schools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-600">Comprehensive tools and support for your college journey</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) =>
            <div key={index} className="bg-white border border-gray-200 rounded p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#0D3B33]/5 rounded flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-[#0D3B33]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-[#0D3B33]">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Success Stories
            </h2>
            <p className="text-gray-600">Hear from students who got into their dream schools</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) =>
            <div key={index} className="bg-white border border-gray-200 rounded p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) =>
                <Star key={i} className="w-4 h-4 fill-[#FE6C3A] text-[#FE6C3A]" />
                )}
                </div>
                <p className="text-gray-700 mb-4 italic text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="font-semibold text-sm text-[#0D3B33]">{testimonial.name}</div>
                  <div className="text-xs text-gray-600">{testimonial.university}</div>
                </div>
              </div>
            )}
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
                    <span>Weekly video sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Essay reviews & feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Application milestone tracking</span>
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
                <div className="text-xs text-gray-500 mb-6">12 months of mentorship • Best value</div>

                <ul className="space-y-3 text-left mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span>Everything in Monthly Plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span><strong>Priority scheduling</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span><strong>Direct phone access</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D3B33] flex-shrink-0 mt-0.5" />
                    <span><strong>Save over $1,100</strong></span>
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