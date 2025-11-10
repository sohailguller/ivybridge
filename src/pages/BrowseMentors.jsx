import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  GraduationCap,
  Star,
  Users,
  ArrowRight,
  AlertCircle
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

  // Fetch both mentors and users IN PARALLEL
  const { data: mentors = [], isLoading: mentorsLoading, error } = useQuery({
    queryKey: ['approved-mentors'],
    queryFn: async () => {
      const result = await base44.entities.MentorProfile.filter({ verification_status: "approved" });
      return result || [];
    },
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users-list'],
    queryFn: async () => {
      const result = await base44.entities.User.list();
      return result || [];
    },
  });

  // Create a fast lookup map
  const userMap = React.useMemo(() => {
    const map = new Map();
    allUsers.forEach(user => map.set(user.id, user));
    return map;
  }, [allUsers]);

  const universities = ["Harvard", "Yale", "Princeton", "Columbia", "Brown", "Dartmouth", "Cornell", "Penn"];

  const universityImages = {
    Harvard: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    Yale: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=1200&q=80",
    Princeton: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&q=80",
    Columbia: "https://images.unsplash.com/photo-1555786750-7c3c2b9a6b0e?w=1200&q=80",
    Brown: "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=1200&q=80",
    Dartmouth: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    Cornell: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=1200&q=80",
    Penn: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80"
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = !searchQuery ||
      mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.major?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUniversity = universityFilter === "all" || mentor.university === universityFilter;
    const matchesMajor = majorFilter === "all" || mentor.major === majorFilter;
    return matchesSearch && matchesUniversity && matchesMajor;
  });

  const allMajors = [...new Set(mentors.map(m => m.major).filter(Boolean))];
  const isLoading = mentorsLoading || usersLoading;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-gray-200 rounded shadow-sm p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2 text-[#0D3B33]">Error Loading Mentors</h2>
          <p className="text-gray-600 text-sm mb-4">Please refresh the page.</p>
          <Button onClick={() => window.location.reload()} className="btn-primary text-white rounded">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-24">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
            Find Your Perfect Mentor
          </h1>
          <p className="text-gray-600">
            Browse verified Ivy League students ready to guide you through your admissions journey
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm mb-6 p-4">
          <div className="grid md:grid-cols-4 gap-4">
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

          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredMentors.length} mentors</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <Skeleton className="h-20 w-full" />
                <div className="px-6 pb-6">
                  <div className="-mt-12 mb-4">
                    <Skeleton className="w-24 h-24 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-40 mb-3" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded shadow-sm p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold mb-2 text-[#0D3B33]">No mentors found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => {
              const user = userMap.get(mentor.user_id);
              const universityBg = universityImages[mentor.university] || universityImages.Harvard;

              return (
                <div
                  key={mentor.id}
                  className="bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => navigate(createPageUrl(`MentorProfile?id=${mentor.id}`))}
                >
                  <div
                    className="h-20 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `url(${universityBg})`,
                      backgroundPosition: 'center 30%'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
                  </div>

                  <div className="px-6 pt-0 pb-6">
                    <div className="-mt-12 mb-4">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-lg ring-2 ring-gray-100">
                        <AvatarImage src={mentor.profile_photo_url || user?.profile_photo_url} />
                        <AvatarFallback className="bg-[#E6EFEA] text-2xl text-[#0D3B33]">
                          {user?.full_name?.charAt(0) || 'M'}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <h3 className="text-lg font-bold mb-1 text-[#0D3B33]">
                      {user?.full_name || 'Mentor'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
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