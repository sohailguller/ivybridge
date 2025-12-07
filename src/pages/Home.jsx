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
      <section className="relative h-[85vh] flex items-center overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#00204E]/90 via-[#00204E]/40 to-black/20" />

        {/* Content - Centered for more impact like reference */}
        <div className="relative w-full px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-white mb-8 text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight font-serif drop-shadow-lg">
              Meet the Team Behind<br/>1,340+ Ivy League Acceptances
            </h1>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto mb-12 font-light drop-shadow-md">
              Book a free consultation today to learn how our mentorship model can help you achieve your dreams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#C90000] hover:bg-[#A00000] text-white rounded-none px-10 py-7 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => user ? navigate(createPageUrl("BrowseMentors")) : base44.auth.redirectToLogin(createPageUrl("BrowseMentors"))}>
                Find Your Mentor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-none px-10 py-7 text-lg font-medium bg-white/10 backdrop-blur-md border border-white/50 text-white hover:bg-white hover:text-[#00204E] transition-all duration-300"
                onClick={() => navigate(createPageUrl("ApplyAsMentor"))}>
                Become a Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Crimson Border Accent */}
      <div className="h-2 w-full bg-[#C90000]" />

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center divide-x divide-gray-100">
            <div>
              <div className="text-6xl font-serif text-[#C90000] font-bold mb-2">4.5x</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">ADMISSIONS RATE</div>
              <p className="text-gray-600 text-sm">Higher acceptance rate than the<br/>national average for Ivy League</p>
            </div>
            <div>
              <div className="text-6xl font-serif text-[#C90000] font-bold mb-2">100%</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">VERIFIED MENTORS</div>
              <p className="text-gray-600 text-sm">Every mentor is a verified current<br/>student at a top university</p>
            </div>
            <div>
              <div className="text-6xl font-serif text-[#C90000] font-bold mb-2">4.9/5</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">STUDENT RATING</div>
              <p className="text-gray-600 text-sm">Based on hundreds of sessions<br/>and student reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* They Got In Section */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#C90000] font-serif">
              They Got In. Your Child Can Too.
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Real students. Real results. The IvyBridge difference.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Accepted to", uni: "Stanford", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80", student: "Sarah C." },
              { name: "Accepted to", uni: "Harvard", img: "https://images.unsplash.com/photo-1519456264917-42d0aa2e0625?w=600&q=80", student: "Michael R." },
              { name: "Accepted to", uni: "Yale", img: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80", student: "Jessica L." },
            ].map((item, i) => (
              <div key={i} className="bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="text-center mb-4">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">{item.name}</div>
                  <div className="text-3xl font-serif font-bold text-[#C90000]">{item.uni}</div>
                </div>
                <div className="relative overflow-hidden aspect-[4/5] mb-4">
                  <img 
                    src={item.img} 
                    alt={item.student}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="font-serif text-lg font-medium text-[#00204E]">{item.student}</span>
                  <ArrowRight className="w-4 h-4 text-[#C90000]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Everything You Need Section (Mentors) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#C90000] font-serif">
              Everything Your Child Needs. All in One Place.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              We connect you with mentors who have walked the path before. They are the strategists, the cheerleaders, and the guides your child needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "David K.", role: "Harvard, Class of 2024", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80", bio: "Economics & Computer Science. Helped 15+ students get into Ivy League." },
              { name: "Emily T.", role: "Yale, Class of 2025", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80", bio: "English Literature. Expert in essay storytelling and interview prep." },
              { name: "James L.", role: "Princeton, Class of 2023", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80", bio: "Molecular Biology. Specialized in STEM applications and research portfolios." }
            ].map((mentor, i) => (
              <div key={i} className="group relative">
                <div className="aspect-[3/4] overflow-hidden mb-6 bg-gray-100">
                  <img 
                    src={mentor.img} 
                    alt={mentor.name}
                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-serif font-bold text-[#00204E] mb-1">{mentor.name}</h3>
                  <div className="text-[#C90000] font-medium mb-3 text-sm tracking-wide uppercase">{mentor.role}</div>
                  <p className="text-gray-600 leading-relaxed font-light">{mentor.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions Results Comparison */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-[#00204E] font-serif text-center">
            IvyBridge Student Admissions Results
          </h2>
          
          <div className="bg-white p-8 shadow-sm">
            <div className="grid grid-cols-3 border-b border-gray-200 pb-4 mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
              <div className="text-left">College</div>
              <div className="text-left">Average Rate</div>
              <div className="text-right text-[#C90000]">IvyBridge Rate</div>
            </div>
            
            {[
              { uni: "Harvard", avg: "3.4%", ivy: "15.2%" },
              { uni: "Stanford", avg: "3.9%", ivy: "16.5%" },
              { uni: "Yale", avg: "4.6%", ivy: "18.1%" },
              { uni: "Princeton", avg: "4.4%", ivy: "17.8%" },
              { uni: "Columbia", avg: "3.9%", ivy: "16.2%" },
              { uni: "UPenn", avg: "5.9%", ivy: "21.5%" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors items-center">
                <div className="font-serif text-lg text-[#00204E]">{row.uni}</div>
                <div className="text-gray-500">{row.avg}</div>
                <div className="text-right font-bold text-2xl text-[#C90000] font-serif">{row.ivy}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">*Based on internal data of IvyBridge students vs national averages.</p>
        </div>
      </section>





      {/* Pricing */}
      <section className="py-16 bg-white border-t-4 border-t-[#C90000]">
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold mb-4 text-[#00204E] font-serif">
              Invest in Your Future
            </h2>
            <p className="text-gray-600 text-lg">Transparent pricing for world-class guidance</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded p-8">
              <div className="text-center">
                <div className="text-lg font-serif text-[#00204E] mb-4">Monthly Guidance</div>
                <div className="text-5xl font-serif font-medium mb-2 text-[#00204E]">$425</div>
                <div className="text-gray-500 mb-6 font-light">per month</div>
                <div className="text-xs text-gray-500 mb-8 uppercase tracking-widest">12-month commitment</div>

                <ul className="space-y-3 text-left mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00204E] flex-shrink-0 mt-0.5" />
                    <span>Unlimited 1-on-1 messaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00204E] flex-shrink-0 mt-0.5" />
                    <span>Monthly video sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00204E] flex-shrink-0 mt-0.5" />
                    <span>Essay reviews & feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00204E] flex-shrink-0 mt-0.5" />
                    <span>Application milestone tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00204E] flex-shrink-0 mt-0.5" />
                    <span>Interview preparation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00204E] flex-shrink-0 mt-0.5" />
                    <span>Monthly progress reports</span>
                  </li>
                </ul>

                <Button
                  className="w-full bg-[#00204E] hover:bg-[#003060] text-white rounded-none py-6 text-lg"
                  onClick={() => navigate(createPageUrl("BrowseMentors"))}>
                  Get Started
                </Button>
              </div>
            </div>

            <div className="bg-[#00204E] text-white border-2 border-[#00204E] rounded p-8 relative shadow-2xl transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#C90000] text-white px-6 py-1 text-sm font-bold uppercase tracking-wider shadow-md">
                Most Popular
              </div>
              <div className="text-center">
                <div className="text-lg font-serif text-white/90 mb-4">Annual Access</div>
                <div className="text-5xl font-serif font-medium mb-2 text-white">$5,000</div>
                <div className="text-white/70 mb-6 font-light">one-time payment</div>
                <div className="text-xs text-white/60 mb-8 uppercase tracking-widest">Full Year Access • Best Value</div>

                <ul className="space-y-3 text-left mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#C90000] flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Unlimited 1-on-1 messaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#C90000] flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Monthly video sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#C90000] flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Essay reviews & feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#C90000] flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Application milestone tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#C90000] flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Interview preparation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#C90000] flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Monthly progress reports</span>
                  </li>
                </ul>

                <Button
                  className="w-full bg-[#C90000] hover:bg-[#A00000] text-white rounded-none py-6 text-lg border border-transparent hover:border-white/20 transition-all duration-300"
                  onClick={() => navigate(createPageUrl("BrowseMentors"))}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Split CTA Section */}
      <section className="bg-white">
        <div className="grid lg:grid-cols-2">
          {/* Left Content */}
          <div className="px-8 py-20 lg:p-24 flex flex-col justify-center bg-white order-2 lg:order-1">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-[#00204E] font-serif leading-[1.1]">
              Start Your<br/>Journey Now.
            </h2>
            <p className="text-xl text-gray-600 mb-6 font-light">
              A Year From Now, You'll Either Wish You Started Today or Be Glad You Did.
            </p>
            <p className="text-gray-500 mb-10 leading-relaxed max-w-md">
              The early bird gets the acceptance letter. Don't wait until it's too late to build your profile. Our mentors are ready to guide you every step of the way, from course selection to your final submission.
            </p>
            
            <Button
              className="w-fit bg-[#C90000] hover:bg-[#A00000] text-white rounded-none px-12 py-8 text-lg font-bold uppercase tracking-wider transition-all duration-300"
              onClick={() => navigate(createPageUrl("BrowseMentors"))}>
              Find Your Mentor
            </Button>
          </div>
          
          {/* Right Image */}
          <div className="relative h-[500px] lg:h-auto order-1 lg:order-2">
            <img 
              src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80" 
              alt="Students on campus" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>);

}