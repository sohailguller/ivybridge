import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Save,
  Camera,
  CheckCircle,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    profile_photo_url: ""
  });

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      return await base44.auth.me();
    },
  });

  // Initialize form data only when user data first loads - FIX FOR PERSISTENCE
  useEffect(() => {
    if (user && !formData.full_name && !formData.phone_number) {
      setFormData({
        full_name: user.full_name || "",
        phone_number: user.phone_number || "",
        profile_photo_url: user.profile_photo_url || ""
      });
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setError(null);
    },
    onError: (err) => {
      console.error("Update error:", err);
      setError("Failed to update profile. Please try again.");
    }
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      setShowCropModal(true);
      setCrop({ x: 0, y: 0, scale: 1, rotation: 0 });
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImage = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      
      if (!canvas || !image) {
        resolve(null);
        return;
      }

      const ctx = canvas.getContext('2d');
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);

      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((crop.rotation * Math.PI) / 180);
      ctx.scale(crop.scale, crop.scale);
      
      const drawWidth = image.naturalWidth;
      const drawHeight = image.naturalHeight;
      
      ctx.drawImage(
        image,
        -drawWidth / 2 + crop.x,
        -drawHeight / 2 + crop.y,
        drawWidth,
        drawHeight
      );
      
      ctx.restore();

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropConfirm = async () => {
    setUploadingPhoto(true);
    setShowCropModal(false);
    setError(null);

    try {
      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) throw new Error("Failed to crop image");

      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: 'image/jpeg',
      });

      const { file_url } = await base44.integrations.Core.UploadFile({ file: croppedFile });
      
      setFormData(prev => ({ ...prev, profile_photo_url: file_url }));
      
      await base44.auth.updateMe({ profile_photo_url: file_url });
      
      queryClient.invalidateQueries(['current-user']);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Photo upload error:", err);
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      setImageSrc(null);
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Only send name and phone - not profile_photo_url
    updateProfileMutation.mutate({
      full_name: formData.full_name.trim(),
      phone_number: formData.phone_number.trim()
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE6C3A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    base44.auth.redirectToLogin();
    return null;
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

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm ml-2">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Information Card */}
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
              <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
                <Avatar className="w-24 h-24 border-4 border-gray-100">
                  <AvatarImage src={formData.profile_photo_url} />
                  <AvatarFallback className="bg-[#E6EFEA] text-3xl text-[#0D3B33]">
                    {formData.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  <label htmlFor="photo-upload">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="rounded text-xs"
                      disabled={uploadingPhoto}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('photo-upload').click();
                      }}
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
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Full Name</Label>
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                  placeholder="Your full name"
                  className="h-10 rounded"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="h-10 rounded bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone Number</Label>
                <Input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({...prev, phone_number: e.target.value}))}
                  placeholder="+1 (555) 123-4567"
                  className="h-10 rounded"
                />
              </div>

              {/* Account Type Badge */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Type</Label>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-medium capitalize">
                    {user.account_type || 'Student'}
                  </div>
                  {user.role === "admin" && (
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
                  disabled={updateProfileMutation.isPending}
                  className="w-full btn-primary text-white rounded h-10"
                >
                  {updateProfileMutation.isPending ? (
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

        {/* Account Actions Card */}
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
                <Button variant="outline" size="sm" className="rounded text-xs" disabled>
                  Update
                </Button>
              </div>

              {user.account_type === "mentor" && (
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

      {/* Image Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adjust Your Photo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                {imageSrc && (
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `translate(${crop.x}px, ${crop.y}px) scale(${crop.scale}) rotate(${crop.rotation}deg)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  />
                )}
              </div>
              
              {/* Circular overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 400 400">
                  <defs>
                    <mask id="circle-mask">
                      <rect width="400" height="400" fill="white" />
                      <circle cx="200" cy="200" r="150" fill="black" />
                    </mask>
                  </defs>
                  <rect width="400" height="400" fill="black" opacity="0.5" mask="url(#circle-mask)" />
                  <circle cx="200" cy="200" r="150" fill="none" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={crop.scale}
                  onChange={(e) => setCrop(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4" />
              </div>

              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={crop.rotation}
                  onChange={(e) => setCrop(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm w-12 text-right">{crop.rotation}°</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Horizontal</Label>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="1"
                    value={crop.x}
                    onChange={(e) => setCrop(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs">Vertical</Label>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="1"
                    value={crop.y}
                    onChange={(e) => setCrop(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCropModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm} className="btn-primary">
              Apply & Upload
            </Button>
          </DialogFooter>

          {/* Hidden canvas for cropping */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}