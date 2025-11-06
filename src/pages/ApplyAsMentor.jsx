
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Upload, 
  CheckCircle, 
  ArrowRight,
  X,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ApplyAsMentor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  
  const [formData, setFormData] = useState({
    university: "",
    major: "",
    year: "",
    bio: "",
    expertise_areas: [],
    greatest_achievement: "",
    advice_to_younger_self: "",
    dream_job: "",
    why_major: "",
    lifetime_goal: "",
    profile_photo_url: "",
    transcript_url: "",
    calendly_link: ""
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingTranscript, setUploadingTranscript] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check if user already has a mentor profile
      if (currentUser.mentor_profile_id) {
        const profiles = await base44.entities.MentorProfile.filter({ id: currentUser.mentor_profile_id });
        if (profiles.length > 0) {
          const profile = profiles[0];
          if (profile.verification_status === "pending") {
            navigate(createPageUrl("MentorDashboard"));
          }
        }
      }
    } catch (error) {
      base44.auth.redirectToLogin(window.location.pathname);
    } finally {
      setIsLoading(false);
    }
  };

  const universities = [
    { name: "Harvard", domain: "harvard.edu" },
    { name: "Yale", domain: "yale.edu" },
    { name: "Princeton", domain: "princeton.edu" },
    { name: "Columbia", domain: "columbia.edu" },
    { name: "Brown", domain: "brown.edu" },
    { name: "Dartmouth", domain: "dartmouth.edu" },
    { name: "Cornell", domain: "cornell.edu" },
    { name: "Penn", domain: "upenn.edu" }
  ];

  const years = ["Freshman", "Sophomore", "Junior", "Senior"];

  const expertiseOptions = [
    { category: "Application Strategy", options: [
      "Admissions Essay Writing & Editing",
      "Personal Statement Development",
      "Supplemental Essays Guidance",
      "College List Strategy",
      "Application Storytelling & Positioning",
      "Portfolio Building"
    ]},
    { category: "Academic Preparation", options: [
      "STEM Applications",
      "Humanities & Social Sciences",
      "Business & Economics Applications",
      "Pre-Med / Life Sciences Track",
      "Research Project Mentorship",
      "Academic Competitions"
    ]},
    { category: "Testing & Credentials", options: [
      "SAT / ACT Prep",
      "TOEFL / IELTS Guidance",
      "AP / IB Exam Planning",
      "Subject-Specific Tutoring"
    ]},
    { category: "Extracurricular Development", options: [
      "Leadership & Club Building",
      "Research & Internships",
      "Community Service & Nonprofit Projects",
      "Startups & Entrepreneurship",
      "Creative Portfolios"
    ]},
    { category: "Interview & Soft Skills", options: [
      "Alumni / Admissions Interview Prep",
      "Communication & Public Speaking",
      "Networking & Email Etiquette",
      "Time Management & Productivity"
    ]},
    { category: "School-Specific Insight", options: [
      "Campus Culture & Fit",
      "International Student Transition",
      "Scholarship & Financial Aid Strategy"
    ]}
  ];

  const validateEmail = () => {
    if (!user?.email || !formData.university) return { valid: false, message: "" };
    
    const university = universities.find(u => u.name === formData.university);
    if (!university) return { valid: false, message: "" };
    
    const emailDomain = user.email.split('@')[1];
    if (emailDomain !== university.domain) {
      return { 
        valid: false, 
        message: `Your email (${user.email}) must be a ${university.name} email (@${university.domain}) to apply as a mentor from ${university.name}.`
      };
    }
    
    return { valid: true, message: "" };
  };

  const handleFileUpload = async (file, type) => {
    if (type === "photo") setUploadingPhoto(true);
    else setUploadingTranscript(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        [type === "photo" ? "profile_photo_url" : "transcript_url"]: file_url
      }));
    } catch (error) {
      setError(`Failed to upload ${type}. Please try again.`);
    } finally {
      if (type === "photo") setUploadingPhoto(false);
      else setUploadingTranscript(false);
    }
  };

  const toggleExpertise = (option) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.includes(option)
        ? prev.expertise_areas.filter(a => a !== option)
        : [...prev.expertise_areas, option]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email domain
    const emailValidation = validateEmail();
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create mentor profile
      const profile = await base44.entities.MentorProfile.create({
        user_id: user.id,
        ...formData,
        verification_status: "pending",
        total_students: 0
      });

      // Update user with mentor profile ID
      await base44.auth.updateMe({
        mentor_profile_id: profile.id,
        account_type: "mentor"
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("MentorDashboard"));
      }, 2000);
    } catch (error) {
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNextSection = () => {
    switch(currentSection) {
      case 1:
        return formData.university && formData.year && formData.major && validateEmail().valid;
      case 2:
        return formData.bio.length >= 100 && formData.expertise_areas.length > 0;
      case 3:
        return formData.greatest_achievement && formData.advice_to_younger_self && 
               formData.dream_job && formData.why_major && formData.lifetime_goal;
      case 4:
        return formData.profile_photo_url && formData.transcript_url && formData.calendly_link;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B5C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-gray-200 rounded shadow-sm p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-4">
              Your application is now under review. We'll notify you via email once it's been approved.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const emailValidation = validateEmail();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold mb-2 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
            Become a Mentor
          </h1>
          <p className="text-gray-600">
            Share your Ivy League experience and help aspiring students achieve their dreams
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((section) => (
              <div key={section} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  currentSection === section ? 'bg-[#FE6C3A] text-white' :
                  currentSection > section ? 'bg-[#0D3B33] text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentSection > section ? <CheckCircle className="w-4 h-4" /> : section}
                </div>
                {section < 4 && (
                  <div className={`w-12 h-1 mx-2 ${currentSection > section ? 'bg-[#0D3B33]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2 text-xs text-gray-600 px-2">
            <span>Basic Info</span>
            <span>Expertise</span>
            <span>About You</span>
            <span>Verification</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Section 1: Basic Information */}
              {currentSection === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold mb-1 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>Basic Information</h2>
                    <p className="text-sm text-gray-600">Tell us about your university and academic background</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Your University Email</Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="h-10 rounded bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      You must use your official university email (@harvard.edu, @yale.edu, etc.)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>University *</Label>
                    <Select 
                      value={formData.university} 
                      onValueChange={(value) => {
                        setFormData({...formData, university: value});
                        setError(null);
                      }}
                      required
                    >
                      <SelectTrigger className="h-10 rounded">
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map(uni => (
                          <SelectItem key={uni.name} value={uni.name}>
                            {uni.name} (@{uni.domain})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.university && !emailValidation.valid && (
                      <Alert className="mt-2 border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          {emailValidation.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    {formData.university && emailValidation.valid && (
                      <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                        <CheckCircle className="w-4 h-4" />
                        Email verified for {formData.university}
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Year *</Label>
                      <Select 
                        value={formData.year} 
                        onValueChange={(value) => setFormData({...formData, year: value})}
                        required
                      >
                        <SelectTrigger className="h-10 rounded">
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Major / Field of Study *</Label>
                      <Input
                        value={formData.major}
                        onChange={(e) => setFormData({...formData, major: e.target.value})}
                        placeholder="e.g., Computer Science, Economics"
                        className="h-10 rounded"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Expertise & Bio */}
              {currentSection === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold mb-1 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>Your Expertise</h2>
                    <p className="text-sm text-gray-600">Select the areas where you can help students</p>
                  </div>

                  <div className="space-y-2">
                    <Label>About You *</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell students about your background, achievements, and how you can help them. What makes you a great mentor?"
                      className="h-28 rounded"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {formData.bio.length}/100 characters minimum
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label>Areas of Expertise * (Select at least one)</Label>
                    {expertiseOptions.map((category, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-4">
                        <h3 className="font-semibold mb-3 text-sm text-[#0D3B33]">{category.category}</h3>
                        <div className="grid md:grid-cols-2 gap-2">
                          {category.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${idx}-${optIdx}`}
                                checked={formData.expertise_areas.includes(option)}
                                onCheckedChange={() => toggleExpertise(option)}
                              />
                              <label
                                htmlFor={`${idx}-${optIdx}`}
                                className="text-sm cursor-pointer"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {formData.expertise_areas.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-200 rounded">
                        <span className="text-sm font-medium w-full mb-1">Selected ({formData.expertise_areas.length}):</span>
                        {formData.expertise_areas.map((area, idx) => (
                          <Badge key={idx} className="bg-[#E6EFEA] text-[#0D3B33] border-0">
                            {area}
                            <button
                              type="button"
                              onClick={() => toggleExpertise(area)}
                              className="ml-1 hover:bg-red-100 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 3: Personal Essays */}
              {currentSection === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold mb-1 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>Get Personal</h2>
                    <p className="text-sm text-gray-600">
                      Help students get to know you better with these thoughtful responses
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>What is your greatest achievement? *</Label>
                    <Textarea
                      value={formData.greatest_achievement}
                      onChange={(e) => setFormData({...formData, greatest_achievement: e.target.value})}
                      placeholder="Share an accomplishment you're proud of..."
                      className="h-20 rounded"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What advice would you give to your middle or high school self? *</Label>
                    <Textarea
                      value={formData.advice_to_younger_self}
                      onChange={(e) => setFormData({...formData, advice_to_younger_self: e.target.value})}
                      placeholder="If you could go back in time..."
                      className="h-20 rounded"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What is your dream job? *</Label>
                    <Input
                      value={formData.dream_job}
                      onChange={(e) => setFormData({...formData, dream_job: e.target.value})}
                      placeholder="e.g., Software Engineer at Google, Investment Banker, Doctor"
                      className="h-10 rounded"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Why did you choose your major? *</Label>
                    <Textarea
                      value={formData.why_major}
                      onChange={(e) => setFormData({...formData, why_major: e.target.value})}
                      placeholder="What drew you to your field of study?"
                      className="h-20 rounded"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What is one thing you hope to accomplish in your lifetime? *</Label>
                    <Textarea
                      value={formData.lifetime_goal}
                      onChange={(e) => setFormData({...formData, lifetime_goal: e.target.value})}
                      placeholder="Your biggest life goal or aspiration..."
                      className="h-20 rounded"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Section 4: Verification Documents */}
              {currentSection === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold mb-1 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>Verification & Setup</h2>
                    <p className="text-sm text-gray-600">Upload required documents and set up your scheduling</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="border border-gray-200 rounded p-4 text-center hover:border-[#FE6C3A] transition-colors">
                      {formData.profile_photo_url ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={formData.profile_photo_url} 
                              alt="Profile" 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="text-left">
                              <p className="font-medium text-sm">Photo uploaded</p>
                              <p className="text-xs text-gray-500">Click to change</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({...formData, profile_photo_url: ""})}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0], "photo")}
                            className="hidden"
                            disabled={uploadingPhoto}
                          />
                          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                          <p className="font-medium text-sm mb-1">
                            {uploadingPhoto ? "Uploading..." : "Click to upload photo"}
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>University Transcript *</Label>
                    <div className="border border-gray-200 rounded p-4 text-center hover:border-[#FE6C3A] transition-colors">
                      {formData.transcript_url ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm">Transcript uploaded</p>
                              <p className="text-xs text-gray-500">Click to change</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({...formData, transcript_url: ""})}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e.target.files[0], "transcript")}
                            className="hidden"
                            disabled={uploadingTranscript}
                          />
                          <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                          <p className="font-medium text-sm mb-1">
                            {uploadingTranscript ? "Uploading..." : "Click to upload transcript"}
                          </p>
                          <p className="text-xs text-gray-500">PDF or image file required for verification</p>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Calendly Link *</Label>
                    <Input
                      value={formData.calendly_link}
                      onChange={(e) => setFormData({...formData, calendly_link: e.target.value})}
                      placeholder="https://calendly.com/your-link"
                      className="h-10 rounded"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Students will use this to book meetings with you. Create a free account at calendly.com
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
                  disabled={currentSection === 1}
                  className="rounded"
                >
                  Previous
                </Button>

                <div className="text-sm text-gray-500">
                  Section {currentSection} of 4
                </div>

                {currentSection < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentSection(currentSection + 1)}
                    disabled={!canProceedToNextSection()}
                    className="btn-primary text-white rounded"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !canProceedToNextSection()}
                    className="btn-primary text-white rounded"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
