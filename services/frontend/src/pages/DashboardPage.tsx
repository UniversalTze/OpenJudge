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
import { useState } from "react";
import SkillSlider from "@/components/Slider";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  // Sample data for code problem submissions
  const submissions = [
    {
      id: 1,
      problem: "Two Sum",
      status: "Correct",
      language: "Java",
      runtime: "68ms",
      memory: "44.2MB",
      submittedAt: "2024-01-15 14:30",
    },
    {
      id: 2,
      problem: "Reverse Linked List",
      status: "Correct",
      language: "Python",
      runtime: "32ms",
      memory: "16.1MB",
      submittedAt: "2024-01-15 13:45",
    },
    {
      id: 3,
      problem: "Valid Parentheses",
      status: "Incorrect",
      language: "Java",
      runtime: "-",
      memory: "-",
      submittedAt: "2024-01-15 12:20",
    },
    {
      id: 4,
      problem: "Binary Tree Inorder",
      status: "Incorrect",
      language: "Java",
      runtime: "-",
      memory: "-",
      submittedAt: "2024-01-15 11:15",
    },
    {
      id: 5,
      problem: "Merge Two Sorted Lists",
      status: "Correct",
      language: "Python",
      runtime: "40ms",
      memory: "14.8MB",
      submittedAt: "2024-01-15 10:30",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Correct":
        return <Badge className="bg-green-800 text-white hover:bg-green-100">Correct</Badge>;
      case "Incorrect":
        return <Badge variant="destructive">Incorrect</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [skillLevel, setSkillLevel] = useState(user?.skill || "Beginner");

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
                    <span className="flex items-center">
                      Save Details
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Code Problem Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Problem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead className="hidden sm:table-cell">Runtime</TableHead>
                      <TableHead className="hidden sm:table-cell">Memory</TableHead>
                      <TableHead className="hidden md:table-cell">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.problem}</TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{submission.language}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {submission.runtime}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {submission.memory}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {submission.submittedAt}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
