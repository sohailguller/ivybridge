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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

export default function ReportDialog({ open, onOpenChange, reportedUserId, reportedUserName, relatedMessageId }) {
  const queryClient = useQueryClient();
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      // Not logged in
    }
  };

  const createReportMutation = useMutation({
    mutationFn: (reportData) => base44.entities.Report.create(reportData),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-reports']);
      setReportType("");
      setDescription("");
      onOpenChange(false);
      alert("Report submitted successfully. Our team will review it shortly.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to file a report");
      return;
    }

    await createReportMutation.mutateAsync({
      reporter_id: currentUser.id,
      reported_user_id: reportedUserId,
      report_type: reportType,
      description,
      related_message_id: relatedMessageId || undefined,
      status: "pending"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0D3B33] text-xl font-bold">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Report User
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Report {reportedUserName} for violating platform guidelines
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType} required>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="inappropriate_content" className="text-gray-900">Inappropriate Content</SelectItem>
                <SelectItem value="contact_sharing" className="text-gray-900">Sharing Personal Contact Info</SelectItem>
                <SelectItem value="harassment" className="text-gray-900">Harassment or Bullying</SelectItem>
                <SelectItem value="fraud" className="text-gray-900">Fraud or Scam</SelectItem>
                <SelectItem value="other" className="text-gray-900">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the issue..."
              className="h-32 bg-white border-gray-300 text-gray-900"
              required
            />
            <p className="text-xs text-gray-500">
              Please provide as much detail as possible to help us investigate
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> False reports may result in account suspension. 
              All reports are reviewed by our team within 24 hours.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => onOpenChange(false)}
              disabled={createReportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={createReportMutation.isPending || !reportType || !description}
            >
              {createReportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}