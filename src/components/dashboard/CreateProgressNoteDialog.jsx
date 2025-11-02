import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { X } from "lucide-react";

export default function CreateProgressNoteDialog({ open, onOpenChange, student, mentorId, subscriptionId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    note: "",
    month: "",
    achievements: [],
    areas_for_improvement: []
  });
  const [achievementInput, setAchievementInput] = useState("");
  const [improvementInput, setImprovementInput] = useState("");

  const createNoteMutation = useMutation({
    mutationFn: (noteData) => base44.entities.ProgressNote.create(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-progress']);
      setFormData({
        note: "",
        month: "",
        achievements: [],
        areas_for_improvement: []
      });
      onOpenChange(false);
    },
  });

  const addAchievement = () => {
    if (achievementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()]
      }));
      setAchievementInput("");
    }
  };

  const addImprovement = () => {
    if (improvementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        areas_for_improvement: [...prev.areas_for_improvement, improvementInput.trim()]
      }));
      setImprovementInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createNoteMutation.mutateAsync({
      subscription_id: subscriptionId,
      mentor_id: mentorId,
      student_id: student.id,
      ...formData
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Progress Note</DialogTitle>
          <DialogDescription>
            Document {student?.full_name}'s progress this month
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Month</Label>
            <Input
              value={formData.month}
              onChange={(e) => setFormData({...formData, month: e.target.value})}
              placeholder="e.g., January 2025"
            />
          </div>

          <div className="space-y-2">
            <Label>Progress Summary *</Label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              placeholder="Summarize the student's progress this month..."
              className="h-32"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Achievements</Label>
            <div className="flex gap-2">
              <Input
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                placeholder="Add an achievement..."
              />
              <Button type="button" onClick={addAchievement}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.achievements.map((achievement, idx) => (
                <Badge key={idx} className="bg-green-100 text-green-800 pr-1">
                  {achievement}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      achievements: prev.achievements.filter((_, i) => i !== idx)
                    }))}
                    className="ml-2 hover:bg-red-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Areas for Improvement</Label>
            <div className="flex gap-2">
              <Input
                value={improvementInput}
                onChange={(e) => setImprovementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImprovement())}
                placeholder="Add an area to work on..."
              />
              <Button type="button" onClick={addImprovement}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.areas_for_improvement.map((area, idx) => (
                <Badge key={idx} className="bg-orange-100 text-orange-800 pr-1">
                  {area}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      areas_for_improvement: prev.areas_for_improvement.filter((_, i) => i !== idx)
                    }))}
                    className="ml-2 hover:bg-red-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 btn-primary text-white"
              disabled={createNoteMutation.isPending || !formData.note}
            >
              {createNoteMutation.isPending ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}