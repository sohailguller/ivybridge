import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ProgressTimeline({ notes }) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No progress notes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notes.map((note, index) => (
        <div key={note.id} className="relative pl-8 pb-6 border-l-2 border-[#B3E5FC] last:border-l-0 last:pb-0">
          <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-[#FF6B5C] border-2 border-white shadow" />
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{note.month || format(new Date(note.created_date), 'MMMM yyyy')}</span>
              </div>
              <Badge className="bg-[#B3E5FC]/30 text-[#222222] border-0 text-xs">
                Progress Update
              </Badge>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">
              {note.note}
            </p>
            
            {note.achievements && note.achievements.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-semibold text-green-700 mb-2">✅ Achievements</div>
                <ul className="space-y-1">
                  {note.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-sm text-gray-600 pl-4">
                      • {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {note.areas_for_improvement && note.areas_for_improvement.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-orange-700 mb-2">🎯 Areas to Focus On</div>
                <ul className="space-y-1">
                  {note.areas_for_improvement.map((area, idx) => (
                    <li key={idx} className="text-sm text-gray-600 pl-4">
                      • {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}