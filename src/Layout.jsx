import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Menu,
  X,
  GraduationCap,
  LogOut,
  User,
  MessageSquare,
  LayoutDashboard,
  Users,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationCenter from "./components/NotificationCenter";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl("Home"));
  };

  const getDashboardUrl = () => {
    if (!user) return createPageUrl("Home");
    if (user.role === "admin") return createPageUrl("AdminDashboard");
    if (user.account_type === "mentor") return createPageUrl("MentorDashboard");
    return createPageUrl("StudentDashboard");
  };

  const navItems = user ? [
    { name: "Browse Mentors", path: createPageUrl("BrowseMentors") },
    { name: "Dashboard", path: getDashboardUrl() },
  ] : [
    { name: "Browse Mentors", path: createPageUrl("BrowseMentors") },
    { name: "Become a Mentor", path: createPageUrl("ApplyAsMentor") },
  ];

  // Ensure isHomePage handles root path correctly
  const homeUrl = createPageUrl("Home");
  const isHomePage = location.pathname === homeUrl || location.pathname === '/' || location.pathname === '';
  const isTransparent = isHomePage && !isScrolled;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

        :root {
          --primary: 215.4 100% 15.3%;
          --secondary: 210 40% 96.1%;
          --accent: 0 100% 39.4%;
          --background: 0 0% 100%;
          --text: 220 26% 17%;
          --foreground: 220 26% 17%;
          --primary-foreground: 0 0% 100%;
        }

        body {
          font-family: 'Lato', sans-serif;
          color: hsl(var(--text));
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: hsl(var(--primary));
        }

        .serif {
          font-family: 'Playfair Display', serif;
        }

        .btn-primary {
          background-color: hsl(var(--accent));
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(254, 108, 58, 0.2);
        }

        .btn-primary:hover {
          background-color: #FF7B4A;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(254, 108, 58, 0.3);
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(13, 59, 51, 0.1);
        }

        .section-padding {
          padding-top: 80px;
          padding-bottom: 80px;
        }

        @media (min-width: 768px) {
          .section-padding {
            padding-top: 100px;
            padding-bottom: 100px;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isTransparent 
          ? 'bg-transparent border-transparent py-2' 
          : 'bg-white/95 backdrop-blur-md border-b border-[#F3F4F6] shadow-sm py-0'
      }`}>
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className={`flex justify-between items-center transition-all duration-300 ${isTransparent ? 'h-24' : 'h-20'}`}>
            {/* Left: Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.path || idx}
                  to={item.path || "#"}
                  className={`font-medium transition-all duration-300 ${
                    isTransparent 
                      ? 'text-lg text-white/90 hover:text-white' 
                      : `text-base hover:text-[#00204E] ${location.pathname === item.path ? 'text-[#00204E] font-semibold' : 'text-[#00204E]/70'}`
                  }`}
                  >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Center: Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/65bfd119d_Untitleddesign3.png"
                alt="IvyBridge"
                className={`transition-all duration-300 ${isTransparent ? 'h-20 brightness-0 invert' : 'h-16'}`}
              />
            </Link>

            {/* Right: User Menu / Auth Buttons */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <NotificationCenter 
                        userId={user.id} 
                        triggerClassName={isTransparent ? "text-white hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className={`flex items-center gap-3 transition-all duration-300 ${
                            isTransparent ? 'text-white hover:bg-white/10' : 'text-[#00204E] hover:bg-[#F3F4F6]'
                          }`}>
                            <Avatar className={`transition-all duration-300 ${isTransparent ? 'w-10 h-10' : 'w-9 h-9'}`}>
                              <AvatarImage src={user.profile_photo_url} />
                              <AvatarFallback className="bg-[#F3F4F6] text-[#00204E] font-bold">
                                {user.full_name?.charAt(0) || user.email?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className={`font-medium transition-all duration-300 ${isTransparent ? 'text-lg' : 'text-base'}`}>
                              {user.full_name || user.email}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => navigate(getDashboardUrl())}>
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(createPageUrl("Settings"))}>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => base44.auth.redirectToLogin(location.pathname)}
                        className={`text-sm font-medium ${
                          isTransparent ? 'text-white hover:bg-white/10' : 'text-[#00204E] hover:bg-[#F3F4F6]'
                        }`}
                        >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => base44.auth.redirectToLogin(location.pathname)}
                        className={`${
                          isTransparent 
                            ? 'bg-white text-[#00204E] hover:bg-white/90' 
                            : 'bg-[#00204E] text-white hover:bg-[#00204E]/90'
                        } rounded-full px-6 font-medium transition-colors`}
                        >
                        Find a Mentor
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${
                isTransparent ? 'text-white hover:bg-white/10' : 'text-[#00204E] hover:bg-[#F3F4F6]'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#F3F4F6] bg-white">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-[#00204E]/5 text-[#00204E]'
                      : 'text-[#00204E]/70 hover:bg-[#F3F4F6]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <Link
                        to={getDashboardUrl()}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg text-sm font-medium text-[#00204E] hover:bg-[#F3F4F6]"
                      >
                        <LayoutDashboard className="w-4 h-4 inline mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        base44.auth.redirectToLogin(location.pathname);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-[#00204E] hover:bg-[#00204E]/90 text-white rounded-full font-medium"
                    >
                      Get Started
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className={`min-h-[calc(100vh-80px)] ${!isHomePage ? 'pt-24' : ''}`}>
        {children}
      </main>

      {/* Footer - relative z-10 ensures it covers fixed video background */}
      <footer className="relative z-10 bg-[#F3F4F6] border-t border-[#00204E]/10">
        <div className="w-full px-6 md:px-12 lg:px-24 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907e2e184793f3cf5bb348d/65bfd119d_Untitleddesign3.png"
                  alt="IvyBridge"
                  className="h-14 object-contain object-left"
                />
              </div>
              <p className="text-[#00204E]/70 leading-relaxed max-w-md text-sm">
                Connecting ambitious international students with verified Ivy League mentors
                for personalized admissions guidance and ongoing support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-[#00204E] text-sm">PLATFORM</h3>
              <ul className="space-y-2 text-[#00204E]/70 text-sm">
                <li><Link to={createPageUrl("BrowseMentors")} className="hover:text-[#C90000] transition-colors hover:underline">Find a Mentor</Link></li>
                <li><Link to={createPageUrl("ApplyAsMentor")} className="hover:text-[#C90000] transition-colors hover:underline">Become a Mentor</Link></li>
                <li>
                  <a 
                    href={location.pathname === createPageUrl("Home") ? "#how-it-works" : `${createPageUrl("Home")}#how-it-works`}
                    onClick={(e) => {
                      if (location.pathname === createPageUrl("Home")) {
                        e.preventDefault();
                        const element = document.getElementById('how-it-works');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    className="hover:text-[#C90000] transition-colors hover:underline cursor-pointer"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-[#00204E] text-sm">SUPPORT</h3>
              <ul className="space-y-2 text-[#00204E]/70 text-sm">
                <li><a href="mailto:contact@ivybridge.xyz" className="hover:text-[#C90000] transition-colors hover:underline">Help</a></li>
                <li><Link to={createPageUrl("TermsOfService")} className="hover:text-[#C90000] transition-colors hover:underline">Terms of Service</Link></li>
                <li><Link to={createPageUrl("PrivacyPolicy")} className="hover:text-[#C90000] transition-colors hover:underline">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#00204E]/10 mt-8 pt-6 text-center text-xs text-[#00204E]/50">
            © 2025 IvyBridge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}