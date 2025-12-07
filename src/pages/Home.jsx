import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Award,
  BookOpen,
  Users
} from "lucide-react";

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

  const universities = [
    "Harvard", "Yale", "Princeton", "Columbia", "Brown", "Dartmouth", "Cornell", "Penn", "Stanford", "MIT"
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a1a1a]">
      {/* 1. Hero Section - Ivy Coach Style: Clean, Text-Heavy, Authoritative */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif text-[#00204E] mb-8 leading-tight tracking-tight">
              The World's Premier College Admissions Practice
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
              We don't just edit essays. We craft the narratives that get students into the Ivy League and other elite universities.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                onClick={() => user ? navigate(createPageUrl("BrowseMentors")) : base44.auth.redirectToLogin(createPageUrl("BrowseMentors"))}
                className="bg-[#C90000] hover:bg-[#a10000] text-white text-lg font-medium px-10 py-7 rounded-none transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Find Your Mentor
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("ApplyAsMentor"))}
                className="border-2 border-[#00204E] text-[#00204E] hover:bg-[#00204E] hover:text-white text-lg font-medium px-10 py-7 rounded-none transition-all duration-300"
              >
                Join Our Network
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Social Proof / Ticker - Minimalist */}
      <section className="py-10 bg-[#00204E] border-y border-[#00204E]">
        <div className="container mx-auto px-6">
          <p className="text-center text-white/60 text-xs font-bold tracking-[0.2em] uppercase mb-6">
            Our students are accepted to
          </p>
          <div className="overflow-hidden relative">
             <div className="flex animate-scroll whitespace-nowrap">
              {[...universities, ...universities, ...universities].map((uni, idx) => (
                <div key={idx} className="inline-flex items-center mx-8 md:mx-12">
                  <span className="text-2xl md:text-3xl font-serif text-white opacity-90">{uni}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. The "Methodology" Section - Two Column Text & Image */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#00204E] mb-6 leading-tight">
                Data-Driven. <br/>
                Insider-Led. <br/>
                Results-Oriented.
              </h2>
              <div className="w-20 h-1 bg-[#C90000] mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6 font-light">
                At IvyBridge, we debunk the myths of the college admissions process. We replace conjecture with data and anxiety with strategy.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8 font-light">
                Our approach is simple yet radical: connect ambitious students directly with verified mentors who are currently walking the halls of the universities they dream of attending. No generic advice. Just real, actionable intelligence from the inside.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                  <div className="text-4xl font-bold text-[#C90000] font-serif mb-2">93%</div>
                  <div className="text-sm font-bold uppercase tracking-wider text-[#00204E]">Acceptance Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#C90000] font-serif mb-2">4.8/5</div>
                  <div className="text-sm font-bold uppercase tracking-wider text-[#00204E]">Student Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#00204E] z-0"></div>
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop" 
                alt="Ivy League Campus" 
                className="relative z-10 w-full h-auto shadow-xl grayscale-[20%]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Services Grid - Clean & Corporate */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-4xl font-bold font-serif text-[#00204E] mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 font-light text-lg">
              Tailored guidance for every stage of your academic journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 border border-gray-100 hover:border-[#00204E] transition-colors duration-300 bg-white shadow-sm hover:shadow-md">
              <BookOpen className="w-10 h-10 text-[#00204E] mb-6" />
              <h3 className="text-2xl font-serif font-bold text-[#00204E] mb-4">Application Strategy</h3>
              <p className="text-gray-600 leading-relaxed font-light mb-6">
                Craft a compelling narrative that connects your academic interests, extracurriculars, and personal story into a cohesive application theme.
              </p>
              <a href="#" className="text-[#C90000] font-bold text-sm uppercase tracking-wider group-hover:underline">Learn More</a>
            </div>

            <div className="group p-8 border border-gray-100 hover:border-[#00204E] transition-colors duration-300 bg-white shadow-sm hover:shadow-md">
              <Users className="w-10 h-10 text-[#00204E] mb-6" />
              <h3 className="text-2xl font-serif font-bold text-[#00204E] mb-4">1-on-1 Mentorship</h3>
              <p className="text-gray-600 leading-relaxed font-light mb-6">
                Direct access to students at your dream school. Get the unvarnished truth about campus culture, course loads, and what it really takes to get in.
              </p>
              <a href="#" className="text-[#C90000] font-bold text-sm uppercase tracking-wider group-hover:underline">Learn More</a>
            </div>

            <div className="group p-8 border border-gray-100 hover:border-[#00204E] transition-colors duration-300 bg-white shadow-sm hover:shadow-md">
              <Award className="w-10 h-10 text-[#00204E] mb-6" />
              <h3 className="text-2xl font-serif font-bold text-[#00204E] mb-4">Essay Editing</h3>
              <p className="text-gray-600 leading-relaxed font-light mb-6">
                Transform good essays into unforgettable ones. Our mentors know exactly what admissions officers are looking for in a Personal Statement.
              </p>
              <a href="#" className="text-[#C90000] font-bold text-sm uppercase tracking-wider group-hover:underline">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing / Call to Action - Split Layout */}
      <section className="bg-[#00204E] text-white overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-12 md:p-24 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              Ready to Defy the Odds?
            </h2>
            <p className="text-white/80 text-lg font-light leading-relaxed mb-10 max-w-md">
              The Ivy League is more competitive than ever. Don't leave your future to chance. Secure your advantage with IvyBridge today.
            </p>
            <div>
              <Button
                onClick={() => user ? navigate(createPageUrl("BrowseMentors")) : base44.auth.redirectToLogin(createPageUrl("BrowseMentors"))}
                className="bg-[#C90000] hover:bg-[#a10000] text-white text-lg font-medium px-12 py-8 rounded-none transition-all duration-300 shadow-xl"
              >
                Start Your Journey
              </Button>
            </div>
          </div>
          <div className="relative min-h-[400px] md:min-h-full">
            <img 
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop" 
              alt="University Library" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00204E] to-transparent"></div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}