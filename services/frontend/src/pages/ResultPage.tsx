import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, ChevronLeft, Code } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useAuth } from "@/components/AuthContext";
import { Submission } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/env";
import { toast } from "sonner";

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [retrievingFeedback, setRetrievingFeedback] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function getSubmission() {
    const response = await apiClient.get<Submission>(API_ENDPOINTS.SUBMISSIONS.ID(id), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (response.success) {
      const submission = response.data;
      setSubmission(submission);
      setIsLoading(false);
    } else {
      console.error("Failed to fetch submission:", response.message);
      toast.error("Failed to fetch submission: " + response.message);
      navigate("/dashboard");
    }
  }

  useEffect(() => {
    getSubmission();
  }, [accessToken]);

  async function getFeedback() {
    if (!submission) return;

    setRetrievingFeedback(true);
    try {
      const response = await apiClient.get<string>(
        API_ENDPOINTS.SUBMISSIONS.AI(submission.submission_id),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      if (response.success) {
        setFeedback(response.data);
      } else {
        console.error("Failed to retrieve feedback:", response.message);
        toast.error("Failed to retrieve feedback: " + response.message);
      }
    } catch (error) {
      console.error("Error retrieving feedback:", error);
      toast.error("Error retrieving feedback: " + error);
    } finally {
      setRetrievingFeedback(false);
    }
  }

  if (isLoading || !submission) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full size-20 border-b-2 border-primary"></div>
      </div>
    );
  }

  const allPassed = submission.results.every((test) => test.passed);
  const passedCount = submission.results.filter((test) => test.passed).length;
  const sortedResults = submission.results.sort((a, b) => a.test_number - b.test_number);

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate("/problems")} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Problems
      </Button>

      <AnimatedSection animation="fade-in">
        <div className="glass-card rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Submission Results</h1>
            </div>
            <div
              className={`px-4 py-2 rounded-full flex items-center ${
                allPassed ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {allPassed ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">All Tests Passed</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    {passedCount} of {submission?.num_tests} Tests Passed
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Your Submission</h2>
              <div className="bg-gray-900 rounded-lg p-4 font-code text-sm overflow-auto w-full max-h-96">
                <pre className="text-white">
                  <code className="text-xs">{submission?.code}</code>
                </pre>
              </div>
            </div>

            <div>
              <div>
                <h2 className="text-lg font-medium mb-4">Performance</h2>
                <div className="glass-card p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Submission ID</p>
                      <p className="font-medium text-xs">{submission?.submission_id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Problem ID</p>
                      <p className="font-medium text-xs">{submission?.problem_id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Language</p>
                      <p className="font-medium text-xs">
                        {submission?.language === "java" ? "Java" : "Python"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Status</p>
                      <p className="font-medium text-xs">
                        {submission?.status === "passed"
                          ? "Passed"
                          : submission.status === "failed"
                          ? "Failed"
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {!allPassed && (
                <div className="h-full overflow-auto">
                  <h2 className="text-lg font-medium mb-4">AI Feedback</h2>
                  {feedback ? (
                    <div className="glass-card p-4 overflow-auto rounded-lg mb-4">
                      <p className="text-sm text-accent mb-2">{feedback.toString()}</p>
                    </div>
                  ) : (
                    <Button
                      className="w-full h-12"
                      disabled={retrievingFeedback}
                      onClick={getFeedback}
                    >
                      {retrievingFeedback ? (
                        <span className="animate-pulse">Getting AI Feedback 🚀...</span>
                      ) : (
                        "Get AI Feedback 🚀"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Test Results</h2>
            <div className="space-y-4">
              {sortedResults.map((test) => (
                <Card
                  key={test.test_number}
                  className={`border ${
                    test.passed ? "border-green-500/20" : "border-red-500/20"
                  } glass-card`}
                >
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center">
                      {test.passed ? (
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 mr-2 text-red-500" />
                      )}
                      <span>Test Case {test.test_number + 1}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Input:</p>
                        <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto max-h-20">
                          {test.inputs}
                        </pre>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Expected Output:</p>
                        <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto max-h-20">
                          {test.expected}
                        </pre>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Your Output:</p>
                        <pre
                          className={`p-2 rounded text-xs overflow-auto max-h-20 ${
                            test.passed ? "bg-green-500/10" : "bg-red-500/10"
                          }`}
                        >
                          {test.output ? test.output : "null"}
                        </pre>
                      </div>
                    </div>

                    {!test.passed && test.error && (
                      <div className="mt-4 bg-muted/30 p-3 rounded-md text-sm">
                        <p className="font-medium">Error:</p>
                        <p className="text-red-500">{test.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button asChild>
              <Link
                to={`/problems/${submission?.problem_id}?submission=${submission?.submission_id}`}
              >
                Edit Submission
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default ResultPage;
