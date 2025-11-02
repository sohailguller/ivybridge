import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Upload,
  Save,
  Camera
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    profile_photo_url: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name || "",
        phone_number: currentUser.phone_number || "",
        profile_photo_url: currentUser.profile_photo_url || ""
      });
    } catch (error) {
      base44.auth.redirectToLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_photo_url: file_url }));
    } catch (error) {
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await base44.auth.updateMe(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reload user data
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
    } catch (error) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B5C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Account Settings
          </h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="rounded-3xl border-0 shadow-xl mb-6">
          <CardHeader className="p-8 border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={formData.profile_photo_url} />
                  <AvatarFallback className="bg-[#B3E5FC] text-4xl">
                    {formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e.target.files[0])}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="rounded-xl"
                    disabled={uploadingPhoto}
                    onClick={(e) => e.preventDefault()}
                  >
                    {uploadingPhoto ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </>
                    )}
                  </Button>
                </label>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Your full name"
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={user?.email}
                  disabled
                  className="h-12 rounded-xl bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Account Type Badge */}
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-[#B3E5FC]/20 rounded-xl text-sm font-medium capitalize">
                    {user?.account_type || 'Student'}
                  </div>
                  {user?.role === "admin" && (
                    <div className="px-4 py-2 bg-[#FF6B5C]/20 text-[#FF6B5C] rounded-xl text-sm font-medium">
                      Admin
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full btn-primary text-white rounded-xl h-12"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Settings Card */}
        <Card className="rounded-3xl border-0 shadow-xl">
          <CardHeader className="p-8 border-b">
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </div>
                <Button variant="outline" className="rounded-xl">
                  Update
                </Button>
              </div>

              {user?.account_type === "mentor" && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">Mentor Profile</p>
                    <p className="text-sm text-gray-600">View and edit your mentor profile</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => navigate(createPageUrl("MentorDashboard"))}
                  >
                    View
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <p className="font-medium text-red-700">Sign Out</p>
                  <p className="text-sm text-red-600">Sign out of your account</p>
                </div>
                <Button 
                  variant="destructive" 
                  className="rounded-xl"
                  onClick={() => base44.auth.logout()}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}