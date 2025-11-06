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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

export default function ReviewDialog({ open, onOpenChange, subscription, mentorProfile, mentorUser }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => base44.entities.Review.create(reviewData),
    onSuccess: async () => {
      queryClient.invalidateQueries(['mentor-reviews']);
      queryClient.invalidateQueries(['my-review']);
      
      // Create notification for mentor
      await base44.entities.Notification.create({
        user_id: mentorProfile.user_id,
        type: "system",
        title: "New Review Received",
        message: `You received a ${rating}-star review from a student!`,
        link: ""
      });
      
      setRating(5);
      setComment("");
      onOpenChange(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createReviewMutation.mutateAsync({
      subscription_id: subscription.id,
      student_id: subscription.student_id,
      mentor_id: subscription.mentor_id,
      mentor_profile_id: mentorProfile.id,
      rating,
      comment: comment.trim() || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            Share your experience with {mentorUser?.full_name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Your Rating</Label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "fill-[#FF6B5C] text-[#FF6B5C]"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {rating === 5 && "Excellent!"}
              {rating === 4 && "Great!"}
              {rating === 3 && "Good"}
              {rating === 2 && "Fair"}
              {rating === 1 && "Needs Improvement"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Your Review (Optional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience..."
              className="h-32"
            />
            <p className="text-xs text-gray-500">
              Your review will help other students choose the right mentor
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={createReviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary text-white"
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}