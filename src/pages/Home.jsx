import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  BookOpen
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
    { name: "Harvard", rate: "4.5%" },
    { name: "Stanford", rate: "3.9%" },
    { name: "Columbia", rate: "3.7%" },
    { name: "Yale", rate: "4.6%" },
    { name: "Brown", rate: "5.0%" },
    { name: "Princeton", rate: "5.8%" },
    { name: "Dartmouth", rate: "6.2%" },
    { name: "Cornell", rate: "8.7%" }
  ];

  const mentors = [
    {
      name: "Chad Faber",
      role: "Senior Mentor",
      bg: "Harvard '25",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80" 
    },
    {
      name: "Hannah Skaran",
      role: "Senior Mentor",
      bg: "Yale '24",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80"
    },
    {
      name: "Jose Magana",
      role: "Senior Mentor",
      bg: "Stanford '26",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80"
    },
    {
      name: "Susan Chan",
      role: "Senior Mentor",
      bg: "Princeton '25",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80"
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

        .ticker-wrap {
          width: 100%;
          overflow: hidden;
          background-color: #fff;
          padding-top: 1rem;
          padding-bottom: 1rem;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }

        .ticker {
          display: flex;
          animation: ticker 30s linear infinite;
        }

        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 md:px-12 lg:px-24 text-center max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight text-black">
          In the 2024/5 Early round, IvyBridge students earned admission to:
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 my-16 opacity-90">
          <div className="text-3xl md:text-4xl font-bold text-[#800000]">Harvard*</div>
          <div className="text-3xl md:text-4xl font-bold text-[#800000]">Stanford</div>
          <div className="text-3xl md:text-4xl font-bold text-[#800000]">Columbia</div>
          <div className="text-3xl md:text-4xl font-bold text-[#800000]">Yale</div>
          <div className="text-3xl md:text-4xl font-bold text-[#800000]">Princeton</div>
          <div className="text-3xl md:text-4xl font-bold text-[#800000]">MIT</div>
          <div className="text-3xl md:text-4xl font-bold text-[#800000]">Penn</div>
          <div className="text-3xl md:text-4xl font-bold text-[#800000]">Cornell*</div>
        </div>

        <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto mb-12 font-sans">
          The world's leading peer-to-peer college admissions platform. 
          Connect directly with verified mentors who have walked the path you want to take.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button 
            onClick={() => navigate(createPageUrl("BrowseMentors"))}
            className="bg-[#1a1a1a] text-white hover:bg-[#333] rounded-none px-10 py-6 text-lg font-sans tracking-wide uppercase"
          >
            Find Your Mentor
          </Button>
          <Button 
            onClick={() => navigate(createPageUrl("ApplyAsMentor"))}
            variant="outline"
            className="border-[#1a1a1a] text-[#1a1a1a] hover:bg-gray-50 rounded-none px-10 py-6 text-lg font-sans tracking-wide uppercase"
          >
            Become a Mentor
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#f9f9f9]">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-black uppercase tracking-widest">
            The IvyBridge Track Record
          </h2>
          <p className="text-center text-gray-500 font-sans mb-16 max-w-2xl mx-auto">
            Our mentors help students beat the odds. Compare the national acceptance rates with our students' success.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {universities.map((uni, idx) => (
              <div key={idx} className="text-center group cursor-default">
                <div className="text-sm font-sans font-bold text-gray-400 mb-2 uppercase tracking-wider">National Rate</div>
                <div className="text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#800000] transition-colors">
                  {uni.rate}
                </div>
                <div className="text-lg font-serif font-bold text-black border-t border-gray-200 pt-4 mt-2 inline-block min-w-[120px]">
                  {uni.name}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="font-sans text-sm text-gray-500 italic">
              * Based on verified acceptance letters from our mentor network's past mentees.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              IT’S NOT JUST ABOUT <br/>
              <span className="text-[#800000]">GRADES & SCORES</span>
            </h2>
            <div className="space-y-6 font-sans text-lg text-gray-700 leading-relaxed">
              <p>
                It’s about presenting compelling, truthful narratives in essays and activities that showcase a 
                <span className="font-bold text-black"> singular hook</span>, rather than well-roundedness.
              </p>
              <p>
                IvyBridge mentors help you avoid the common pitfalls of the college admissions process. 
                We don't just edit essays; we help you craft a story that admissions officers can't ignore.
              </p>
              
              <ul className="space-y-3 mt-8">
                {[
                  "Write compelling college essays that wow admissions officers",
                  "Demonstrate a singular hook rather than well-roundedness",
                  "Select the right universities to which to apply",
                  "Strategize on an Early Decision/Early Action plan"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#800000] flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#1a1a1a]"></div>
            <img 
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" 
              alt="Student studying" 
              className="relative z-10 w-full h-auto grayscale contrast-125"
            />
            <div className="absolute -bottom-8 -right-8 bg-white p-6 shadow-xl max-w-xs z-20 border border-gray-100 hidden md:block">
              <p className="font-serif italic text-xl">"They don't call us the Ivy Whisperers for nothing."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-20 bg-[#f4f4f4]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest">
              Meet Your Mentors
            </h2>
            <Link to={createPageUrl("BrowseMentors")} className="hidden md:flex items-center text-[#800000] font-sans font-bold hover:underline">
              View All Mentors <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {mentors.map((mentor, idx) => (
              <div key={idx} className="bg-white p-6 group hover:shadow-lg transition-all duration-300">
                <div className="mb-6 overflow-hidden">
                  <img 
                    src={mentor.img} 
                    alt={mentor.name}
                    className="w-full h-64 object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1 group-hover:text-[#800000] transition-colors">
                  {mentor.name}
                </h3>
                <p className="font-sans text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {mentor.bg}
                </p>
                <p className="font-serif text-gray-600 italic">
                  {mentor.role}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Link to={createPageUrl("BrowseMentors")} className="inline-flex items-center text-[#800000] font-sans font-bold hover:underline">
              View All Mentors <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog/News Section */}
      <section className="py-20 bg-white px-6 md:px-12">
        <div className="max-w-6xl mx-auto border-t-4 border-black pt-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-widest flex items-center gap-4">
              <BookOpen className="w-8 h-8" />
              The IvyBridge Daily
            </h2>
            <div className="mt-4 md:mt-0 font-serif italic text-xl text-gray-500">
              "Way To Tell It Like It Is, IvyBridge."
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Harvard GPA Requirements 2025",
                date: "December 6, 2024",
                img: "https://images.unsplash.com/photo-1590579491624-f98f36d4c763?w=500&q=80"
              },
              {
                title: "The Death of Affirmative Action",
                date: "November 28, 2024",
                img: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&q=80"
              },
              {
                title: "Why You Should Apply Early Decision",
                date: "November 15, 2024",
                img: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=500&q=80"
              }
            ].map((post, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="mb-4 overflow-hidden">
                  <img 
                    src={post.img} 
                    alt={post.title} 
                    className="w-full h-52 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#800000] transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="font-sans text-xs text-gray-400 uppercase tracking-widest">
                  {post.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 bg-[#1a1a1a] text-white text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            TOWARD THE CONQUEST <br/> OF ADMISSION
          </h2>
          <p className="font-sans text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            If you’re interested in IvyBridge's mentorship, 
            sign up today and we’ll match you with the perfect mentor.
          </p>
          <Button 
            onClick={() => navigate(createPageUrl("BrowseMentors"))}
            className="bg-[#800000] hover:bg-[#a00000] text-white rounded-none px-16 py-8 text-xl font-sans tracking-widest uppercase transition-all duration-300 transform hover:-translate-y-1"
          >
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
}