import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

export default function CreateProgressNoteDialog({ open, onOpenChange, student, mentorProfileId, subscriptionId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    note: "",
    month: "",
    achievements: [],
    areas_for_improvement: []
  });
  const [newAchievement, setNewAchievement] = useState("");
  const [newImprovement, setNewImprovement] = useState("");

  const createNoteMutation = useMutation({
    mutationFn: (noteData) => base44.entities.ProgressNote.create(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-progress']);
      onOpenChange(false);
      setFormData({
        note: "",
        month: "",
        achievements: [],
        areas_for_improvement: []
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!student || !mentorProfileId) return;

    createNoteMutation.mutate({
      ...formData,
      student_id: student.id,
      mentor_profile_id: mentorProfileId,
      subscription_id: subscriptionId
    });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement.trim()]
      });
      setNewAchievement("");
    }
  };

  const removeAchievement = (index) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index)
    });
  };

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setFormData({
        ...formData,
        areas_for_improvement: [...formData.areas_for_improvement, newImprovement.trim()]
      });
      setNewImprovement("");
    }
  };

  const removeImprovement = (index) => {
    setFormData({
      ...formData,
      areas_for_improvement: formData.areas_for_improvement.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#0D3B33] text-xl font-bold">Add Progress Note</DialogTitle>
          <DialogDescription className="text-gray-600">
            Document {student?.full_name || 'student'}'s progress and achievements
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Month</Label>
            <Input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({...formData, month: e.target.value})}
              placeholder="YYYY-MM"
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Progress Note *</Label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              placeholder="Describe the student's overall progress this period..."
              className="h-32 bg-white border-gray-300 text-gray-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Key Achievements</Label>
            <div className="flex gap-2">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Add an achievement..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                className="bg-white border-gray-300 text-gray-900"
              />
              <Button type="button" onClick={addAchievement} size="sm" className="btn-primary text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.achievements.map((achievement, idx) => (
                  <Badge key={idx} className="bg-green-100 text-green-800 border-0">
                    {achievement}
                    <button
                      type="button"
                      onClick={() => removeAchievement(idx)}
                      className="ml-1 hover:bg-red-100 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Areas for Improvement</Label>
            <div className="flex gap-2">
              <Input
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                placeholder="Add an area to improve..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImprovement())}
                className="bg-white border-gray-300 text-gray-900"
              />
              <Button type="button" onClick={addImprovement} size="sm" className="btn-primary text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.areas_for_improvement.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.areas_for_improvement.map((improvement, idx) => (
                  <Badge key={idx} className="bg-orange-100 text-orange-800 border-0">
                    {improvement}
                    <button
                      type="button"
                      onClick={() => removeImprovement(idx)}
                      className="ml-1 hover:bg-red-100 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={createNoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary text-white"
              disabled={createNoteMutation.isPending}
            >
              {createNoteMutation.isPending ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}