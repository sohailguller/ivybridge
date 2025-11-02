import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Image as ImageIcon
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ApplyAsMentor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    university: "",
    major: "",
    year: "",
    bio: "",
    expertise_areas: [],
    profile_photo_url: "",
    transcript_url: "",
    calendly_link: ""
  });

  const [expertiseInput, setExpertiseInput] = useState("");
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

  const universities = ["Harvard", "Yale", "Princeton", "Columbia", "Brown", "Dartmouth", "Cornell", "Penn"];
  const years = ["Freshman", "Sophomore", "Junior", "Senior"];

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

  const addExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise_areas.includes(expertiseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise_areas: [...prev.expertise_areas, expertiseInput.trim()]
      }));
      setExpertiseInput("");
    }
  };

  const removeExpertise = (area) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.filter(a => a !== area)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Card className="max-w-md mx-4 rounded-3xl border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your application is now under review. We'll notify you via email once it's been approved.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF6B5C]/10 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-[#FF6B5C]" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Become a Mentor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your Ivy League experience and help aspiring students achieve their dreams
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="rounded-3xl border-0 shadow-xl">
          <CardHeader className="p-8 border-b">
            <CardTitle className="text-2xl">Mentor Application</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* University & Year */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>University *</Label>
                  <Select 
                    value={formData.university} 
                    onValueChange={(value) => setFormData({...formData, university: value})}
                    required
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map(uni => (
                        <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Select 
                    value={formData.year} 
                    onValueChange={(value) => setFormData({...formData, year: value})}
                    required
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Major */}
              <div className="space-y-2">
                <Label>Major / Field of Study *</Label>
                <Input
                  value={formData.major}
                  onChange={(e) => setFormData({...formData, major: e.target.value})}
                  placeholder="e.g., Computer Science, Economics, Biology"
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label>About You *</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell students about your background, achievements, and how you can help them. What makes you a great mentor?"
                  className="h-32 rounded-xl"
                  required
                />
                <p className="text-xs text-gray-500">Minimum 100 characters</p>
              </div>

              {/* Expertise Areas */}
              <div className="space-y-2">
                <Label>Areas of Expertise</Label>
                <div className="flex gap-2">
                  <Input
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    placeholder="e.g., Essay Writing, STEM Applications"
                    className="h-12 rounded-xl"
                  />
                  <Button type="button" onClick={addExpertise} className="btn-primary text-white rounded-xl">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.expertise_areas.map((area, idx) => (
                    <Badge key={idx} className="bg-[#B3E5FC]/30 text-[#222222] pr-1">
                      {area}
                      <button
                        type="button"
                        onClick={() => removeExpertise(area)}
                        className="ml-2 hover:bg-red-100 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Profile Photo */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#FF6B5C] transition-colors">
                  {formData.profile_photo_url ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={formData.profile_photo_url} 
                          alt="Profile" 
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="text-left">
                          <p className="font-medium">Photo uploaded</p>
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
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium mb-1">
                        {uploadingPhoto ? "Uploading..." : "Click to upload photo"}
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                    </label>
                  )}
                </div>
              </div>

              {/* Transcript */}
              <div className="space-y-2">
                <Label>University Transcript *</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#FF6B5C] transition-colors">
                  {formData.transcript_url ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#B3E5FC]/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-[#222222]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Transcript uploaded</p>
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
                      <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium mb-1">
                        {uploadingTranscript ? "Uploading..." : "Click to upload transcript"}
                      </p>
                      <p className="text-xs text-gray-500">PDF or image file required for verification</p>
                    </label>
                  )}
                </div>
              </div>

              {/* Calendly Link */}
              <div className="space-y-2">
                <Label>Calendly Link (Optional)</Label>
                <Input
                  value={formData.calendly_link}
                  onChange={(e) => setFormData({...formData, calendly_link: e.target.value})}
                  placeholder="https://calendly.com/your-link"
                  className="h-12 rounded-xl"
                />
                <p className="text-xs text-gray-500">
                  Add your Calendly link to let students book meetings with you
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.university || !formData.year || !formData.major || !formData.bio || !formData.transcript_url}
                  className="w-full btn-primary text-white rounded-xl h-14 text-lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-xs text-gray-500 mt-4">
                  By submitting, you agree to our Terms of Service and verify that all information provided is accurate.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}