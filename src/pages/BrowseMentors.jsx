
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  GraduationCap,
  Star,
  Users,
  ArrowRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseMentors() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [majorFilter, setMajorFilter] = useState("all");

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ['approved-mentors'],
    queryFn: () => base44.entities.MentorProfile.filter({ verification_status: "approved" }),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['mentor-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: mentors.length > 0
  });

  const universities = ["Harvard", "Yale", "Princeton", "Columbia", "Brown", "Dartmouth", "Cornell", "Penn"];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = !searchQuery ||
      mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.major?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUniversity = universityFilter === "all" || mentor.university === universityFilter;
    const matchesMajor = majorFilter === "all" || mentor.major === majorFilter;

    return matchesSearch && matchesUniversity && matchesMajor;
  });

  const getMentorUser = (userId) => users.find(u => u.id === userId);

  const allMajors = [...new Set(mentors.map(m => m.major).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12 w-full">
      <div className="max-w-7xl lg:max-w-screen-xl xl:max-w-screen-2xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 lg:mb-12 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
            Find Your Perfect Mentor
          </h1>
          <p className="text-gray-600 lg:text-lg xl:text-xl">
            Browse verified Ivy League students ready to guide you through your admissions journey
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm mb-6 lg:mb-8 p-4 lg:p-6">
          <div className="grid md:grid-cols-4 gap-4 lg:gap-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by major, expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded border-gray-300"
              />
            </div>

            <Select value={universityFilter} onValueChange={setUniversityFilter}>
              <SelectTrigger className="h-10 rounded">
                <SelectValue placeholder="All Universities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities.map(uni => (
                  <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={majorFilter} onValueChange={setMajorFilter}>
              <SelectTrigger className="h-10 rounded">
                <SelectValue placeholder="All Majors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Majors</SelectItem>
                {allMajors.map(major => (
                  <SelectItem key={major} value={major}>{major}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm lg:text-base text-gray-600">
            <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Showing {filteredMentors.length} mentors</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded shadow-sm p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded shadow-sm p-12 lg:p-16 text-center">
            <Users className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl lg:text-2xl font-bold mb-2 text-[#0D3B33]">No mentors found</h3>
            <p className="text-gray-600 lg:text-lg">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
            {filteredMentors.map((mentor) => {
              const user = getMentorUser(mentor.user_id);

              return (
                <div
                  key={mentor.id}
                  className="bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => navigate(createPageUrl(`MentorProfile?id=${mentor.id}`))}
                >
                  <div className="h-24 lg:h-28 bg-gradient-to-r from-[#0D3B33] to-[#1a5a4e]" />

                  <div className="p-6 -mt-8">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-sm mb-4">
                      <AvatarImage src={mentor.profile_photo_url || user?.profile_photo_url} />
                      <AvatarFallback className="bg-[#E6EFEA] text-xl text-[#0D3B33]">
                        {user?.full_name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="text-lg lg:text-xl font-bold mb-1 text-[#0D3B33]">{user?.full_name || 'Mentor'}</h3>
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 mb-3">
                      <GraduationCap className="w-4 h-4" />
                      <span>{mentor.university} • {mentor.year}</span>
                    </div>

                    <Badge className="bg-[#E6EFEA] text-[#0D3B33] border-0 mb-3 text-xs">
                      {mentor.major}
                    </Badge>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {mentor.bio}
                    </p>

                    {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {mentor.expertise_areas.slice(0, 2).map((area, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {mentor.expertise_areas.length > 2 && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            +{mentor.expertise_areas.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-4 py-3 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{mentor.total_students || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#FE6C3A] text-[#FE6C3A]" />
                        ))}
                      </div>
                    </div>

                    <Button className="w-full btn-primary text-white rounded text-sm py-2">
                      View Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
