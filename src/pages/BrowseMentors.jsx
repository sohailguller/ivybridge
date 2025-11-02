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
  MapPin, 
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
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Find Your Perfect Mentor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse verified Ivy League students ready to guide you through your admissions journey
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-lg rounded-3xl">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by major, expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200"
                />
              </div>
              
              <Select value={universityFilter} onValueChange={setUniversityFilter}>
                <SelectTrigger className="h-12 rounded-xl">
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
                <SelectTrigger className="h-12 rounded-xl">
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

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Showing {filteredMentors.length} mentors</span>
            </div>
          </CardContent>
        </Card>

        {/* Mentor Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-3xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-2xl font-bold mb-2">No mentors found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => {
              const user = getMentorUser(mentor.user_id);
              
              return (
                <Card 
                  key={mentor.id} 
                  className="card-hover rounded-3xl border-0 shadow-lg cursor-pointer overflow-hidden group"
                  onClick={() => navigate(createPageUrl(`MentorProfile?id=${mentor.id}`))}
                >
                  <CardContent className="p-0">
                    {/* Header Image */}
                    <div className="h-32 bg-gradient-to-br from-[#FF6B5C] to-[#E55A4C] relative">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800')] opacity-20 bg-cover bg-center" />
                    </div>

                    <div className="p-6 -mt-10">
                      {/* Avatar */}
                      <Avatar className="w-20 h-20 border-4 border-white shadow-lg mb-4">
                        <AvatarImage src={mentor.profile_photo_url || user?.profile_photo_url} />
                        <AvatarFallback className="bg-[#B3E5FC] text-2xl">
                          {user?.full_name?.charAt(0) || 'M'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <h3 className="text-xl font-bold mb-1">{user?.full_name || 'Mentor'}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <GraduationCap className="w-4 h-4" />
                        <span>{mentor.university} • {mentor.year}</span>
                      </div>

                      <Badge className="bg-[#B3E5FC]/30 text-[#222222] border-0 mb-4">
                        {mentor.major}
                      </Badge>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {mentor.bio}
                      </p>

                      {/* Expertise Tags */}
                      {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {mentor.expertise_areas.slice(0, 3).map((area, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 py-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{mentor.total_students || 0} students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#FF6B5C] text-[#FF6B5C]" />
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <Button className="w-full btn-primary text-white rounded-xl group-hover:shadow-lg transition-all">
                        View Profile
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}