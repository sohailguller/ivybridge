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

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Crimson+Pro:wght@300;400;500;600&display=swap');

        :root {
          --primary: #0D3B33;
          --secondary: #E6EFEA;
          --accent: #FE6C3A;
          --background: #FAFAFA;
          --text: #222222;
        }

        body {
          font-family: 'Crimson Pro', Georgia, serif;
          color: var(--text);
          line-height: 1.7;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn-primary {
          background-color: var(--accent);
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
      <nav className="bg-white border-b border-[#E6EFEA] sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
        <div className="w-full px-6 md:px-12 lg:px-24">
          <div className="flex justify-between items-center h-20">
            {/* Left: Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-semibold transition-colors hover:text-[#FE6C3A] uppercase tracking-wider ${
                    location.pathname === item.path ? 'text-[#FE6C3A]' : 'text-[#0D3B33]'
                  }`}
                  style={{ fontFamily: 'Oswald, sans-serif' }}
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
                className="h-20"
              />
            </Link>

            {/* Right: User Menu / Auth Buttons */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <NotificationCenter userId={user.id} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="flex items-center gap-3 hover:bg-[#E6EFEA]">
                            <Avatar className="w-9 h-9 border-2 border-[#0D3B33]">
                              <AvatarImage src={user.profile_photo_url} />
                              <AvatarFallback className="bg-[#E6EFEA] text-[#0D3B33] font-bold">
                                {user.full_name?.charAt(0) || user.email?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold" style={{ fontFamily: 'Oswald, sans-serif' }}>{user.full_name || user.email}</span>
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
                        className="text-sm font-semibold hover:bg-[#E6EFEA] uppercase tracking-wider text-[#0D3B33]"
                        style={{ fontFamily: 'Oswald, sans-serif' }}
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => base44.auth.redirectToLogin(location.pathname)}
                        className="bg-[#FE6C3A] hover:bg-[#FF7B4A] text-white rounded-lg px-6 uppercase tracking-wider font-semibold"
                        style={{ fontFamily: 'Oswald, sans-serif' }}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#E6EFEA]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E6EFEA] bg-white">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider ${
                    location.pathname === item.path
                      ? 'bg-[#FE6C3A]/10 text-[#FE6C3A]'
                      : 'text-[#0D3B33] hover:bg-[#E6EFEA]'
                  }`}
                  style={{ fontFamily: 'Oswald, sans-serif' }}
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
                        className="block px-4 py-3 rounded-lg text-sm font-semibold text-[#0D3B33] hover:bg-[#E6EFEA] uppercase tracking-wider"
                        style={{ fontFamily: 'Oswald, sans-serif' }}
                      >
                        <LayoutDashboard className="w-4 h-4 inline mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 uppercase tracking-wider"
                        style={{ fontFamily: 'Oswald, sans-serif' }}
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
                      className="w-full bg-[#FE6C3A] hover:bg-[#FF7B4A] text-white rounded-lg uppercase tracking-wider font-semibold"
                      style={{ fontFamily: 'Oswald, sans-serif' }}
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
      <main className="min-h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#E6EFEA] border-t border-[#0D3B33]/10 mt-20">
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
              <p className="text-[#0D3B33]/70 leading-relaxed max-w-md text-sm">
                Connecting ambitious international students with verified Ivy League mentors
                for personalized admissions guidance and ongoing support.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-[#0D3B33] text-sm" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>PLATFORM</h3>
              <ul className="space-y-2 text-[#0D3B33]/70 text-sm">
                <li><Link to={createPageUrl("BrowseMentors")} className="hover:text-[#FE6C3A] transition-colors hover:underline">Find a Mentor</Link></li>
                <li><Link to={createPageUrl("ApplyAsMentor")} className="hover:text-[#FE6C3A] transition-colors hover:underline">Become a Mentor</Link></li>
                <li><Link to={createPageUrl("Home")} className="hover:text-[#FE6C3A] transition-colors hover:underline">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-[#0D3B33] text-sm" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>SUPPORT</h3>
              <ul className="space-y-2 text-[#0D3B33]/70 text-sm">
                <li><a href="#" className="hover:text-[#FE6C3A] transition-colors hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:text-[#FE6C3A] transition-colors hover:underline">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#FE6C3A] transition-colors hover:underline">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#0D3B33]/10 mt-8 pt-6 text-center text-xs text-[#0D3B33]/50">
            © 2025 IvyBridge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}