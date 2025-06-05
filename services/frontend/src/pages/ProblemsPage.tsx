import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, CheckCircle, Eye } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/AuthContext";
import { DatabaseRecord, Problem } from "@/lib/problems";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/env";

const ProblemsPage = () => {
  const { user, updateUser, accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [problems, setProblems] = useState<Problem[]>([]);

  async function getProblems() {
    const response = await apiClient.get<DatabaseRecord[]>(API_ENDPOINTS.PROBLEMS.ALL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (response.success) {
      setProblems(
        response.data.map((problem) => ({
          ...problem,
          examples: JSON.parse(problem.examples || "[]"),
          test_cases: JSON.parse(problem.test_cases || "[]"),
        }))
      );
    } else {
      console.error("Failed to fetch problems:", response.message);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getProblems();
  }, [accessToken]);


  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);

  // Sort problems based on user experience level
  const sortedProblems = useMemo(() => {
    const experienceLevel = user.skill || "Beginner";

    const sorted = [...problems];

    if (experienceLevel === "Beginner") {
      // Easy first, then Medium, then Hard
      sorted.sort((a, b) => {
        const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      });
    } else if (experienceLevel === "Advanced") {
      // Hard first, then Medium, then Easy
      sorted.sort((a, b) => {
        const difficultyOrder = { Hard: 0, Medium: 1, Easy: 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      });
    }

    return sorted;
  }, [user]);

  useEffect(() => {
    let result = sortedProblems;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (problem) =>
          problem.problem_title.toLowerCase().includes(query) ||
          problem.topics.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by difficulty
    if (difficultyFilter && difficultyFilter !== "all") {
      result = result.filter((problem) => problem.difficulty === difficultyFilter);
    }

    setFilteredProblems(result);
  }, [searchQuery, difficultyFilter, sortedProblems]);

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("");
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Easy
          </Badge>
        );
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            Medium
          </Badge>
        );
      case "Hard":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Hard
          </Badge>
        );
      default:
        return null;
    }
  };

  const getExperienceMessage = () => {
    const experienceLevel = user?.skill || "Beginner";
    switch (experienceLevel) {
      case "Beginner":
        return "Problems are sorted with easier ones first to help you learn progressively.";
      case "Advanced":
        return "Problems are sorted with challenging ones first to match your expertise.";
      default:
        return "Problems are sorted in a balanced order to match your intermediate level.";
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full size-20 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Problem Set</h1>
        <p className="text-muted-foreground mb-2">
          Explore coding challenges with complete transparency - see all test cases!
        </p>
        <p className="text-sm text-primary">{getExperienceMessage()}</p>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Filters section */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 bg-background/50"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px] bg-background/50">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || difficultyFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Showing {filteredProblems.length} of {problems.length} problems
          </span>

          {/* Sample Result Link */}
          <Link
            to="/sample-problem-result"
            className="text-primary hover:underline flex items-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Sample Results
          </Link>
        </div>
      </div>

      {/* Problems list */}
      <div className="space-y-4">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem) => (
            <Card
              key={problem.problem_id}
              className="glass-card overflow-hidden hover:border-primary/50 transition-all"
            >
              <Link to={`/problem/${problem.problem_id}`} className="block">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {problem.problem_id}. {problem.problem_title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {problem.topics.map((tag) => (
                          <Badge key={tag} variant="secondary" className="font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>{getDifficultyBadge(problem.difficulty)}</div>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {problem.description.trim().slice(0, 150)}...
                  </p>
                </CardContent>
                <CardFooter className="bg-muted/20 py-3 px-6 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    All test cases visible • Language agnostic
                  </div>
                </CardFooter>
              </Link>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 glass-card rounded-xl">
            <h3 className="text-xl font-medium mb-2">No problems found</h3>
            <p className="text-muted-foreground mt-2 mb-6">Try adjusting your search criteria</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemsPage;
