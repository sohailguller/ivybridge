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
import ImageCropperDialog from "../components/ImageCropperDialog";

export default function ApplyAsMentor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const [calendlyError, setCalendlyError] = useState("");
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
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
      setFormData(prev => ({ ...prev, full_name: currentUser.full_name || "" }));

      // Check for existing mentor profile - first by mentor_profile_id, then by user_id
      let existingProfile = null;

      if (currentUser.mentor_profile_id) {
        const profiles = await base44.entities.MentorProfile.filter({ id: currentUser.mentor_profile_id });
        if (profiles.length > 0) {
          existingProfile = profiles[0];
        }
      }

      // Also check by user_id in case mentor_profile_id wasn't set
      if (!existingProfile) {
        const profilesByUserId = await base44.entities.MentorProfile.filter({ user_id: currentUser.id });
        if (profilesByUserId.length > 0) {
          existingProfile = profilesByUserId[0];
        }
      }

      if (existingProfile) {
        if (existingProfile.verification_status === "pending") {
          setIsSubmitted(true);
          return;
        }
        if (existingProfile.verification_status === "approved") {
          navigate(createPageUrl("MentorDashboard"));
          return;
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

  const validateCalendlyLink = (link) => {
    if (!link) return false;
    const calendlyRegex = /^https?:\/\/(www\.)?calendly\.com\/.+/i;
    return calendlyRegex.test(link);
  };

  const validateEmail = () => {
    return { valid: true, message: "" };
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setShowImageCropper(true);
    }
  };

  const handleImageCropSave = async (croppedBlob) => {
    setUploadingPhoto(true);
    setShowImageCropper(false);

    try {
      // Convert blob to file
      const croppedFile = new File([croppedBlob], "profile-photo.jpg", { type: "image/jpeg" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file: croppedFile });
      setFormData(prev => ({
        ...prev,
        profile_photo_url: file_url
      }));
    } catch (error) {
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      setSelectedImageFile(null);
    }
  };

  const handleFileUpload = async (file) => { // Removed `type` as it's now only for transcript
    if (!file) return;
    setUploadingTranscript(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        transcript_url: file_url
      }));
    } catch (error) {
      setError("Failed to upload transcript. Please try again.");
    } finally {
      setUploadingTranscript(false);
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

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleTextareaChange = (field, value) => {
    const wordCount = countWords(value);
    if (wordCount <= 250) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCalendlyChange = (value) => {
    setFormData(prev => ({ ...prev, calendly_link: value }));
    if (value && !validateCalendlyLink(value)) {
      setCalendlyError("Please enter a valid Calendly link (e.g., https://calendly.com/your-username)");
    } else {
      setCalendlyError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCalendlyLink(formData.calendly_link)) {
      setError("Please enter a valid Calendly link");
      setCalendlyError("Please enter a valid Calendly link (e.g., https://calendly.com/your-username)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { full_name, ...mentorData } = formData;

      // Update user's name if changed
      if (full_name && full_name !== user.full_name) {
        await base44.auth.updateMe({ full_name });
      }

      const profile = await base44.entities.MentorProfile.create({
        user_id: user.id,
        ...mentorData,
        verification_status: "pending",
        total_students: 0
      });

      await base44.auth.updateMe({
        mentor_profile_id: profile.id
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Application submission error:", error);
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNextSection = () => {
    switch(currentSection) {
      case 1:
        return formData.full_name && formData.university && formData.year && formData.major;
      case 2:
        return formData.bio.length >= 100 && formData.expertise_areas.length > 0;
      case 3:
        return formData.greatest_achievement && formData.advice_to_younger_self &&
               formData.dream_job && formData.why_major && formData.lifetime_goal;
      case 4:
        return formData.calendly_link && validateCalendlyLink(formData.calendly_link) && formData.transcript_url;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C90000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-gray-200 rounded shadow-sm p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-[#00204E]">
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Thank you for applying to become a mentor. We'll review your application and
              get back to you within 1-2 business days.
            </p>
            <Button
              className="w-full btn-primary text-white rounded"
              onClick={() => navigate(createPageUrl("Home"))}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-6 md:px-12 lg:px-24">
        <div className="text-center mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold mb-2 text-[#00204E]">
            Become a Mentor
          </h1>
          <p className="text-gray-600">
            Share your Ivy League experience and help aspiring students achieve their dreams
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((section) => (
              <div key={section} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  currentSection === section ? 'bg-[#C90000] text-white' :
                  currentSection > section ? 'bg-[#00204E] text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentSection > section ? <CheckCircle className="w-4 h-4" /> : section}
                </div>
                {section < 4 && (
                  <div className={`w-12 h-1 mx-2 ${currentSection > section ? 'bg-[#00204E]' : 'bg-gray-200'}`} />
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
              {currentSection === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold mb-1 text-[#00204E]">Basic Information</h2>
                    <p className="text-sm text-gray-600">Tell us about your university and academic background</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="e.g. Jane Doe"
                      className="h-10 rounded"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Your Email</Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="h-10 rounded bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      We'll use the email associated with your account
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
                            {uni.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              {currentSection === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold mb-1 text-[#00204E]">Your Expertise</h2>
                    <p className="text-sm text-gray-600">Select the areas where you can help students</p>
                  </div>

                  <div className="space-y-2">
                    <Label>About You * (Maximum 250 words)</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleTextareaChange('bio', e.target.value)}
                      placeholder="Tell students about your background, achievements, and how you can help them. What makes you a great mentor?"
                      className="h-32 rounded resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {countWords(formData.bio)}/250 words
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label>Areas of Expertise * (Select at least one)</Label>
                    {expertiseOptions.map((category, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-4">
                        <h3 className="font-semibold mb-3 text-sm text-[#00204E]">{category.category}</h3>
                        <div className="space-y-2">
                          {category.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-start space-x-2">
                              <Checkbox
                                id={`${idx}-${optIdx}`}
                                checked={formData.expertise_areas.includes(option)}
                                onCheckedChange={() => toggleExpertise(option)}
                                className="mt-0.5"
                              />
                              <label
                                htmlFor={`${idx}-${optIdx}`}
                                className="text-sm cursor-pointer leading-tight"
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
                          <Badge key={idx} className="bg-[#F3F4F6] text-[#00204E] border-0">
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

              {currentSection === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold mb-1 text-[#00204E]">Get Personal</h2>
                    <p className="text-sm text-gray-600">
                      Help students get to know you better with these thoughtful responses (250 words max each)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>What is your greatest achievement? * (Max 250 words)</Label>
                    <Textarea
                      value={formData.greatest_achievement}
                      onChange={(e) => handleTextareaChange('greatest_achievement', e.target.value)}
                      placeholder="Share an accomplishment you're proud of..."
                      className="h-24 rounded resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500">{countWords(formData.greatest_achievement)}/250 words</p>
                  </div>

                  <div className="space-y-2">
                    <Label>What advice would you give to your middle or high school self? * (Max 250 words)</Label>
                    <Textarea
                      value={formData.advice_to_younger_self}
                      onChange={(e) => handleTextareaChange('advice_to_younger_self', e.target.value)}
                      placeholder="If you could go back in time..."
                      className="h-24 rounded resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500">{countWords(formData.advice_to_younger_self)}/250 words</p>
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
                    <Label>Why did you choose your major? * (Max 250 words)</Label>
                    <Textarea
                      value={formData.why_major}
                      onChange={(e) => handleTextareaChange('why_major', e.target.value)}
                      placeholder="What drew you to your field of study?"
                      className="h-24 rounded resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500">{countWords(formData.why_major)}/250 words</p>
                  </div>

                  <div className="space-y-2">
                    <Label>What is one thing you hope to accomplish in your lifetime? * (Max 250 words)</Label>
                    <Textarea
                      value={formData.lifetime_goal}
                      onChange={(e) => handleTextareaChange('lifetime_goal', e.target.value)}
                      placeholder="Your biggest life goal or aspiration..."
                      className="h-24 rounded resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500">{countWords(formData.lifetime_goal)}/250 words</p>
                  </div>
                </div>
              )}

              {currentSection === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold mb-1 text-[#00204E]">Verification & Setup</h2>
                    <p className="text-sm text-gray-600">Upload required documents and set up your scheduling</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="border border-gray-200 rounded p-4 text-center hover:border-[#C90000] transition-colors">
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
                            onChange={handleImageSelect}
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
                    <div className="border border-gray-200 rounded p-4 text-center hover:border-[#C90000] transition-colors">
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
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                            className="hidden"
                            disabled={uploadingTranscript}
                          />
                          <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                          <p className="font-medium text-sm mb-1">
                            {uploadingTranscript ? "Uploading..." : "Click to upload transcript (optional)"}
                          </p>
                          <p className="text-xs text-gray-500">PDF or image file - optional for testing</p>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Calendly Link *</Label>
                    <Input
                      value={formData.calendly_link}
                      onChange={(e) => handleCalendlyChange(e.target.value)}
                      placeholder="https://calendly.com/your-username"
                      className={`h-10 rounded ${calendlyError ? 'border-red-500' : ''}`}
                      required
                    />
                    {calendlyError && (
                      <p className="text-xs text-red-600">{calendlyError}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Students will use this to book meetings with you. Create a free account at calendly.com
                    </p>
                  </div>
                </div>
              )}

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

      <ImageCropperDialog
        open={showImageCropper}
        onOpenChange={setShowImageCropper}
        imageFile={selectedImageFile}
        onSave={handleImageCropSave}
      />
    </div>
  );
}