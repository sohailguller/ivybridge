import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar } from "lucide-react";

export default function StudentCard({ student, subscription, onSelect }) {
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onSelect}
    >
      <Avatar className="w-12 h-12">
        <AvatarImage src={student.profile_photo_url} />
        <AvatarFallback className="bg-[#B3E5FC]">
          {student.full_name?.charAt(0) || 'S'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{student.full_name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge className="text-xs capitalize" variant="outline">{subscription?.plan_type}</Badge>
          <span>•</span>
          <span>{subscription?.months_remaining || 0} months left</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <MessageSquare className="w-4 h-4" />
      </Button>
    </div>
  );
}