import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle,
  MessageSquare,
  Calendar,
  Shield,
  Star
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const videoRef = useRef(null);

  const handleTimeUpdate = () => {
    // Loop 0.4 seconds before end to avoid black screen at the end
    if (videoRef.current && videoRef.current.duration) {
      if (videoRef.current.currentTime >= videoRef.current.duration - 0.4) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }
  };
  
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
    { name: "Harvard", logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/e43613884_Untitleddesign6.png", className: "h-16 md:h-20" },
    { name: "Yale", logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/586f85967_Untitleddesign5.png", className: "h-16 md:h-20" },
    { name: "Princeton", logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/2b7b1186c_Untitleddesign1.png", className: "h-16 md:h-20" },
    { name: "Columbia", logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/efd381c88_Untitleddesign2.png", className: "h-16 md:h-20" },
    { name: "Brown", logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/ee520777c_Untitleddesign4.png", className: "h-16 md:h-20" },
    { name: "Dartmouth", logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/f54f5b94c_Untitleddesign3.png", className: "h-16 md:h-20" },
    { name: "Cornell", logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/af5470f99_Untitleddesign8.png", className: "h-16 md:h-20" },
    { name: "Penn", logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/af5778215_Untitleddesign7.png", className: "h-16 md:h-20" },
    { name: "Stanford", logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/700a17a11_Untitleddesign.png", className: "h-16 md:h-20" }
  ];

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

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-serif">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        
        body {
          font-family: 'Lato', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6, .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative h-screen flex items-end overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover transform -translate-x-1/2 -translate-y-1/2"
          >
            <source src="https://res.cloudinary.com/dihudketx/video/upload/v1765143452/copy_3DA13314-C273-4245-AFA8-1CCBE4594A58_ckciis.mp4" type="video/mp4" />
            <source src="https://res.cloudinary.com/dihudketx/video/upload/v1765143452/copy_3DA13314-C273-4245-AFA8-1CCBE4594A58_ckciis.mov" type="video/quicktime" />
          </video>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content - Bottom Left Aligned */}
        <div className="relative w-full px-6 md:px-12 lg:px-24 pb-20 md:pb-24">
          <div className="max-w-3xl">
            <h1 className="text-white mb-6 text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight font-serif drop-shadow-lg">
              Your Insider Path <br /> to the Ivy League
            </h1>

            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-xl mb-10 font-sans font-light drop-shadow-md">
              Don't just apply. Stand out. Get personalized 1-on-1 guidance from verified students who have already cracked the code.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-[#C90000] hover:bg-[#A00000] text-white rounded-none px-8 py-6 text-sm font-sans font-bold uppercase tracking-widest shadow-lg transition-all duration-300"
                onClick={() => user ? navigate(createPageUrl("BrowseMentors")) : base44.auth.redirectToLogin(createPageUrl("BrowseMentors"))}>
                Find Your Mentor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="rounded-none px-8 py-6 text-sm font-sans font-bold uppercase tracking-widest border border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300"
                onClick={() => navigate(createPageUrl("ApplyAsMentor"))}>
                Become a Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Ticker */}
      <div className="border-y border-gray-200 bg-[#fafafa] py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-gray-400">Mentors from</p>
        </div>
        <div className="overflow-hidden w-full">
          <div className="flex animate-scroll whitespace-nowrap items-center">
            {/* Duplicating enough times to ensure smooth loop on large screens */}
            {[...universities, ...universities, ...universities, ...universities, ...universities, ...universities].map((uni, idx) => (
              <div key={idx} className="inline-flex items-center mx-12 md:mx-16 shrink-0">
                <img 
                  src={uni.logo} 
                  alt={uni.name} 
                  className={`${uni.className} w-auto object-contain brightness-0 opacity-80 hover:opacity-100 transition-all duration-300`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
          will-change: transform;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* How It Works */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#800000] font-sans font-bold tracking-widest text-sm uppercase mb-3 block">The Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              Your Journey to Acceptance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              {
                step: "01",
                title: "Choose Your Mentor",
                desc: "Browse our curated network of verified Ivy League students. Filter by university, major, and expertise."
              },
              {
                step: "02",
                title: "Start the Partnership",
                desc: "Unlock direct access via chat and video calls. Build a roadmap and get real-time feedback."
              },
              {
                step: "03",
                title: "Craft Your Story",
                desc: "Submit an application that stands out. Walk into interviews with confidence and insider knowledge."
              }
            ].map((item, idx) => (
              <div key={idx} className="group p-8 border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-300 bg-white">
                <div className="text-6xl font-serif font-bold text-[#e0e0e0] group-hover:text-[#800000] transition-colors mb-6">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-4 font-serif">{item.title}</h3>
                <p className="text-gray-600 font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#f4f4f4] px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Everything You Need <br/>
              <span className="text-[#800000]">To Succeed</span>
            </h2>
            <p className="font-sans text-lg text-gray-600 mb-10 leading-relaxed">
              Comprehensive tools and support for your college journey, all in one place.
              Manage your applications, schedule meetings, and track your progress effortlessly.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 items-start group">
                  <div className="mt-1">
                    <feature.icon className="w-6 h-6 text-[#800000]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 font-serif group-hover:text-[#800000] transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 font-sans text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
            <div className="bg-gray-100 px-4 py-3 flex gap-2 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
            </div>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/61f59ec74_Screenshot2025-12-06at104504PM.png" 
              alt="Dashboard Preview" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Invest in Your Future</h2>
            <p className="text-gray-600 font-sans text-lg">Transparent pricing for world-class guidance</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Monthly */}
            <div className="border border-gray-200 p-10 hover:border-[#800000] transition-colors duration-300 bg-white group">
              <h3 className="text-3xl font-serif font-bold mb-2">Monthly</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold">$425</span>
                <span className="text-gray-500 font-sans">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 font-sans text-gray-700">
                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-[#800000]"/> Unlimited 1-on-1 messaging</li>
                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-[#800000]"/> Monthly video sessions</li>
                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-[#800000]"/> Essay reviews & feedback</li>
                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-[#800000]"/> 12-month commitment</li>
              </ul>
              <Button 
                onClick={() => navigate(createPageUrl("BrowseMentors"))}
                className="w-full bg-white text-[#1a1a1a] border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white rounded-none py-6 font-sans uppercase tracking-widest transition-all"
              >
                Get Started
              </Button>
            </div>

            {/* Annual */}
            <div className="border-2 border-[#1a1a1a] p-10 bg-[#1a1a1a] text-white relative transform md:-translate-y-4 shadow-xl">
              <div className="absolute top-0 right-0 bg-[#800000] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
                Best Value
              </div>
              <h3 className="text-3xl font-serif font-bold mb-2">Annual</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold">$5,000</span>
                <span className="text-gray-400 font-sans">/year</span>
              </div>
              <ul className="space-y-4 mb-10 font-sans text-gray-300">
                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-[#800000]"/> All Monthly features included</li>
                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-[#800000]"/> Priority mentor matching</li>
                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-[#800000]"/> Save $100 annually</li>
                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-[#800000]"/> Guaranteed placement</li>
              </ul>
              <Button 
                onClick={() => navigate(createPageUrl("BrowseMentors"))}
                className="w-full bg-[#800000] hover:bg-[#a00000] text-white border border-transparent rounded-none py-6 font-sans uppercase tracking-widest transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 bg-[#1a1a1a] text-white text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Ready to Start <br/> Your Journey?
          </h2>
          <p className="font-sans text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join hundreds of ambitious students who turned their Ivy League dreams into reality with personalized mentorship.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button 
              onClick={() => navigate(createPageUrl("BrowseMentors"))}
              className="bg-[#800000] hover:bg-[#a00000] text-white rounded-none px-16 py-8 text-xl font-sans tracking-widest uppercase transition-all duration-300 transform hover:-translate-y-1"
            >
              Find Your Mentor
            </Button>
            <Button 
              onClick={() => navigate(createPageUrl("ApplyAsMentor"))}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-black rounded-none px-16 py-8 text-xl font-sans tracking-widest uppercase"
            >
              Become a Mentor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}