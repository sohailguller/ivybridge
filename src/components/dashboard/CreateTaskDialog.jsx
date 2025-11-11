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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateTaskDialog({ open, onOpenChange, student, mentorProfileId, subscriptionId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium"
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.Task.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries(['mentor-tasks']);
      queryClient.invalidateQueries(['my-tasks']);
      onOpenChange(false);
      setFormData({ title: "", description: "", due_date: "", priority: "medium" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!student || !mentorProfileId) return;

    createTaskMutation.mutate({
      ...formData,
      student_id: student.id,
      mentor_profile_id: mentorProfileId,
      subscription_id: subscriptionId,
      status: "pending"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#0D3B33] text-xl font-bold">Create Task</DialogTitle>
          <DialogDescription className="text-gray-600">
            Assign a new task to {student?.full_name || 'student'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Task Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Complete essay draft"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Task details and instructions..."
              className="h-24 bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="low" className="text-gray-900">Low</SelectItem>
                  <SelectItem value="medium" className="text-gray-900">Medium</SelectItem>
                  <SelectItem value="high" className="text-gray-900">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Due Date</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary text-white"
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}