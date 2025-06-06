import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import SkillSlider from "@/components/Slider";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/env";
import { DatabaseSubmission, Submission } from "@/lib/types";

export default function DashboardPage() {
  const { user, updateUser, accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [skillLevel, setSkillLevel] = useState(user?.skill || "Beginner");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  async function getSubmissions() {
    const response = await apiClient.get<DatabaseSubmission[]>(API_ENDPOINTS.SUBMISSIONS.ALL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (response.success) {
      setSubmissions(
        response.data.map((submission) => ({
          ...submission,
          language: submission.language === "java" ? "java" : "python",
          results: JSON.parse(submission.results),
        }))
      );
    } else {
      if (response.status != 404) {
        console.error("Failed to fetch problems:", response.message);
      }
    }
    setPageLoading(false);
  }

  useEffect(() => {
    getSubmissions();
  }, [accessToken]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await updateUser({
        firstName,
        lastName,
        skill: skillLevel,
        email,
      });

      if (!response || !response.success) {
        throw new Error(response.message || "Profile update failed");
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full size-20 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">First Name</Label>
                    <Input
                      id="signup-firstname"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Last Name</Label>
                    <Input
                      id="signup-lastname"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-background/50"
                      required
                    />
                  </div>
                </div>
                <SkillSlider skillLevel={skillLevel} setSkillLevel={setSkillLevel} />
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">Save Details</span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Card className="min-h-40 h-full w-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Code Problem Submissions</CardTitle>
          </CardHeader>
          {submissions.length === 0 ? (
              <p className="lg:mt-12 w-full text-muted-foreground text-left lg:text-center pt-0 lg:pt-6 p-6">No submissions found. Start coding to see your submissions here!</p>
          ) : (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Problem ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead className="md:table-cell">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.submission_id}>
                        <TableCell className="font-medium">{submission.problem_id}</TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{submission.language}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {submission.createdAt}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "passed":
      return <Badge className="bg-green-800 text-white hover:bg-green-100">Correct</Badge>;
    case "failed":
      return <Badge variant="destructive">Incorrect</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
