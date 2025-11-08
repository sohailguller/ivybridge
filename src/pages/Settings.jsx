
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
    if (!file) return;
    
    setUploadingPhoto(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_photo_url: file_url }));
      
      // Auto-save the photo immediately
      await base44.auth.updateMe({ profile_photo_url: file_url });
      
      // Reload user data
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Photo upload error:", error);
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
      await base44.auth.updateMe({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        profile_photo_url: formData.profile_photo_url
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reload user data to reflect changes
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setFormData({
        full_name: updatedUser.full_name || "",
        phone_number: updatedUser.phone_number || "",
        profile_photo_url: updatedUser.profile_photo_url || ""
      });
    } catch (error) {
      console.error("Update profile error:", error);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-24">
        {/* Header */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold mb-1 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
            Account Settings
          </h1>
          <p className="text-gray-600 text-sm">Manage your profile and preferences</p>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 text-sm">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white border border-gray-200 rounded shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold flex items-center gap-2 text-[#0D3B33]">
              <User className="w-4 h-4" />
              Profile Information
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-3 pb-6 border-b border-gray-200">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.profile_photo_url} />
                  <AvatarFallback className="bg-[#E6EFEA] text-3xl text-[#0D3B33]">
                    {formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handlePhotoUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  <div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="rounded text-xs"
                      disabled={uploadingPhoto}
                      as="div"
                    >
                      {uploadingPhoto ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="w-3 h-3 mr-2" />
                          Change Photo
                        </>
                      )}
                    </Button>
                  </div>
                </label>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-sm">Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Your full name"
                  className="h-10 rounded"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label className="text-sm">Email</Label>
                <Input
                  value={user?.email}
                  disabled
                  className="h-10 rounded bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-sm">Phone Number</Label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                  className="h-10 rounded"
                />
              </div>

              {/* Account Type Badge */}
              <div className="space-y-2">
                <Label className="text-sm">Account Type</Label>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-medium capitalize">
                    {user?.account_type || 'Student'}
                  </div>
                  {user?.role === "admin" && (
                    <div className="px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded text-xs font-medium">
                      Admin
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full btn-primary text-white rounded h-10"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Settings Card */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-[#0D3B33]">Account Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                <div>
                  <p className="font-medium text-sm">Change Password</p>
                  <p className="text-xs text-gray-600">Update your account password</p>
                </div>
                <Button variant="outline" size="sm" className="rounded text-xs">
                  Update
                </Button>
              </div>

              {user?.account_type === "mentor" && (
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                  <div>
                    <p className="font-medium text-sm">Mentor Profile</p>
                    <p className="text-xs text-gray-600">View and edit your mentor profile</p>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="rounded text-xs"
                    onClick={() => navigate(createPageUrl("MentorDashboard"))}
                  >
                    View
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded">
                <div>
                  <p className="font-medium text-sm text-red-700">Sign Out</p>
                  <p className="text-xs text-red-600">Sign out of your account</p>
                </div>
                <Button 
                  variant="destructive"
                  size="sm"
                  className="rounded text-xs"
                  onClick={() => base44.auth.logout()}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
