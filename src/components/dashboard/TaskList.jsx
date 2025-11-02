import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle, 
  Circle, 
  Clock,
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";

export default function TaskList({ tasks, studentView = false }) {
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-tasks']);
      queryClient.invalidateQueries(['mentor-tasks']);
    },
  });

  const handleToggleStatus = async (task) => {
    if (!studentView) return;
    
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await updateTaskMutation.mutateAsync({
      id: task.id,
      data: { status: newStatus }
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress": return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No tasks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`p-4 rounded-xl border-2 transition-all ${
            task.status === "completed" 
              ? "bg-gray-50 border-gray-200" 
              : "bg-white border-gray-200 hover:border-[#FF6B5C]"
          }`}
        >
          <div className="flex items-start gap-3">
            {studentView && (
              <button
                onClick={() => handleToggleStatus(task)}
                className="mt-1"
              >
                {getStatusIcon(task.status)}
              </button>
            )}
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-semibold ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                  {task.title}
                </h4>
                <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
                  {task.priority}
                </Badge>
              </div>
              
              {task.description && (
                <p className={`text-sm mb-3 ${task.status === "completed" ? "text-gray-400" : "text-gray-600"}`}>
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}