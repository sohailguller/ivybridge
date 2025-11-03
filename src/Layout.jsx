
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
    setUser(null); // Clear user state after logout
    navigate(createPageUrl("Home"));
  };

  const handleAuthAction = () => {
    // Base44 will handle the redirect automatically
    base44.auth.redirectToLogin();
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --primary: #FF6B5C;
          --secondary: #B3E5FC;
          --background: #FAFAFA;
          --text: #222222;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--text);
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 600;
        }
        
        .btn-primary {
          background-color: var(--primary);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background-color: #E55A4C;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(255, 107, 92, 0.25);
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B5C] to-[#E55A4C] rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                IvyBridge
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-[#FF6B5C] ${
                    location.pathname === item.path ? 'text-[#FF6B5C]' : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu / Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {!isLoading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={user.profile_photo_url} />
                            <AvatarFallback className="bg-[#B3E5FC] text-[#222222]">
                              {user.full_name?.charAt(0) || user.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{user.full_name || user.email}</span>
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
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        onClick={handleAuthAction}
                        className="text-sm font-medium"
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={handleAuthAction}
                        className="btn-primary text-white rounded-full px-6"
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
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-[#FF6B5C]/10 text-[#FF6B5C]'
                      : 'text-gray-600 hover:bg-gray-50'
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
                        className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4 inline mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        handleAuthAction();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full btn-primary text-white rounded-full"
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
      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B5C] to-[#E55A4C] rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                  IvyBridge
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                Connecting ambitious international students with verified Ivy League mentors 
                for personalized admissions guidance and ongoing support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to={createPageUrl("BrowseMentors")} className="hover:text-[#FF6B5C]">Find a Mentor</Link></li>
                <li><Link to={createPageUrl("ApplyAsMentor")} className="hover:text-[#FF6B5C]">Become a Mentor</Link></li>
                <li><Link to={createPageUrl("Home")} className="hover:text-[#FF6B5C]">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#FF6B5C]">Help Center</a></li>
                <li><a href="#" className="hover:text-[#FF6B5C]">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#FF6B5C]">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2025 IvyBridge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
