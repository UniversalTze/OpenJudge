import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { DatabaseRecord, Problem } from "@/lib/types";
import { API_ENDPOINTS } from "@/lib/env";
import { useAuth } from "@/components/AuthContext";
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";

const ProblemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"Java" | "Python">("Python");
  const [code, setCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHiddenTestCases, setShowHiddenTestCases] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "c3dafe" },
        { token: "keyword", foreground: "7aa2f7" },
        { token: "string", foreground: "9d7cd8" },
        { token: "number", foreground: "7dcfff" },
        { token: "comment", foreground: "5c6370" },
        { token: "type", foreground: "bb9af7" },
        { token: "function", foreground: "7aa2f7" },
        { token: "variable", foreground: "c3dafe" },
        { token: "multiline-comment", foreground: "5c6370" }, // multiline comments (gray)
      ],
      colors: {
        "editor.background": "#030711",
      },
    });
  };

  function determineType(
    type: "boolean" | "integer" | "string",
    language: "Java" | "Python"
  ): string {
    switch (type) {
      case "boolean":
        return language === "Java" ? "boolean" : "bool";
      case "integer":
        return language === "Java" ? "int" : "int";
      case "string":
        return language === "Java" ? "String" : "str";
      default:
        return "";
    }
  }

  async function getProblem() {
    const response = await apiClient.get<DatabaseRecord>(API_ENDPOINTS.PROBLEMS.ID(id), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (response.success) {
      setProblem({
        ...response.data,
        examples: JSON.parse(response.data.examples || "[]"),
        test_cases: JSON.parse(response.data.test_cases || "[]"),
      });
    } else {
      console.error("Failed to fetch problem:", response.message);
      toast.error("Problem not found or access denied.");
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getProblem();
  }, [accessToken]);

  function loadCodeFromLocalStorage(setCode: (value: string) => void): void {
    const code = localStorage.getItem(id);
    if (code !== null) {
      setCode(code);
    }
  }

  useEffect(() => {
    if (problem && language === "Java") {
      setCode(
        `/** \n * ${
          problem?.description
        }\n * \n */ \npublic class Solution {\n    public static ${determineType(
          problem.return_type,
          language
        )} ${
          problem?.function_name ?? "FunctionName"
        }(/*Insert*/) {\n        // Your code here\n    }\n}`
      );
    } else if (problem && language === "Python") {
      setCode(
        `def ${problem.function_name ?? "function_name"}("""Insert""") -> ${determineType(
          problem.return_type,
          language
        )}:\n    """${problem.description}"""\n    #...`
      );
    }
  }, [language, problem]);

  useEffect(() => {
    loadCodeFromLocalStorage(setCode);
  }, []);

  
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    } as T;
  }

  const saveCodeToLocalStorage = debounce((code: string) => {
    localStorage.setItem("code", code);
  }, 500);

  if (!problem) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Problem not found</h2>
        <Button onClick={() => navigate("/problems")}>Back to Problems</Button>
      </div>
    );
  }

  const handleCodeChange = (value: string) => {
    setCode(value);
    saveCodeToLocalStorage(value);
  };

  async function postSubmit() {
    setIsSubmitting(true);
    const response = await apiClient.post(API_ENDPOINTS.SUBMISSIONS.ALL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        problem_id: id,
        user_id: user?.id,
        language,
        code,
      }),
    });
    if (response.success) {
      toast.success("Code submitted successfully");
      setIsSubmitting(false);
      navigate("/submission-success");
    } else {
      console.error("Failed to submit problem:", response.message);
      toast.error("Failed to submit problem: " + response.message);
    }
    setIsLoading(false);
  }

  const handleSubmit = () => {
    postSubmit();
  };

  // Generate difficulty badge
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

  const visibleTestCases = problem.test_cases.filter((test) => !test.hidden);
  const hiddenTestCases = problem.test_cases.filter((test) => test.hidden);

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full size-20 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Back navigation */}
      <Button variant="ghost" onClick={() => navigate("/problems")} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Problems
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold">
                {problem.problem_id}. {problem.problem_title}
              </h1>
              {getDifficultyBadge(problem.difficulty)}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {problem.topics.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{problem.description}</p>
            </div>
          </div>

          <Tabs defaultValue="examples" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
            </TabsList>

            <TabsContent value="examples" className="space-y-4 py-4">
              {problem.examples.map((example, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex flex-col space-y-2">
                    <div>
                      <span className="font-medium text-sm">Input:</span>
                      <pre className="mt-1 bg-secondary/50 p-2 rounded overflow-x-auto font-code text-sm">
                        {example.input}
                      </pre>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Output:</span>
                      <pre className="mt-1 bg-secondary/50 p-2 rounded overflow-x-auto font-code text-sm">
                        {example.output}
                      </pre>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="font-medium text-sm">Explanation:</span>
                        <p className="mt-1 text-sm text-muted-foreground">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="constraints" className="py-4">
              <ul className="list-disc pl-6 space-y-2">
                {problem.constraints.map((constraint, index) => (
                  <li key={index} className="text-sm">
                    <code className="font-code bg-secondary/50 px-1.5 py-0.5 rounded">
                      {constraint}
                    </code>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="hints" className="py-4">
              {problem.hint ? (
                <div className="bg-accent/20 border border-accent/30 rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-accent-foreground mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Hint
                  </h3>
                  <p className="text-sm">{problem.hint}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No hints available for this problem.
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* Test Cases Section - The Key Feature! */}
          <div>
            <h3 className="font-medium mb-4 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Test Cases
              <Badge variant="secondary" className="ml-2 text-xs">
                Transparent Testing
              </Badge>
            </h3>

            {/* Visible Test Cases */}
            <div className="space-y-3 mb-4">
              {visibleTestCases.map((testCase, index) => (
                <div key={index} className="bg-secondary/30 rounded-md p-3 text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Test {index + 1}</span>
                    <span className="text-green-600 flex items-center">
                      <Unlock className="h-4 w-4 mr-1" />
                      Visible
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Input:</span>
                      <pre className="mt-1 bg-secondary/70 p-2 rounded overflow-x-auto font-code text-xs">
                        {testCase.input.toString()}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Expected:</span>
                      <pre className="mt-1 bg-secondary/70 p-2 rounded overflow-x-auto font-code text-xs">
                        {testCase.output.toString()}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden Test Cases Toggle - THE MAIN FEATURE */}
            {hiddenTestCases.length > 0 && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowHiddenTestCases(!showHiddenTestCases)}
                >
                  {showHiddenTestCases ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Hidden Test Cases
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show {hiddenTestCases.length} Hidden Test Cases
                      <Badge
                        variant="secondary"
                        className="ml-2 text-xs bg-primary/20 text-primary"
                      >
                        🔥 OpenJudge Exclusive
                      </Badge>
                    </>
                  )}
                </Button>

                {/* Hidden Test Cases */}
                {showHiddenTestCases && (
                  <div className="space-y-3">
                    <div className="bg-primary/10 border border-primary/20 rounded-md p-3 text-sm">
                      <div className="flex items-center text-primary font-medium mb-2">
                        <Lock className="h-4 w-4 mr-2" />
                        Hidden Test Cases - Usually Secret!
                      </div>
                      <p className="text-xs text-muted-foreground">
                        These test cases are typically hidden on other platforms like LeetCode.
                        OpenJudge shows them to help you learn and debug your solutions effectively.
                      </p>
                    </div>

                    {hiddenTestCases.map((testCase, index) => (
                      <div
                        key={index}
                        className="bg-primary/5 border border-primary/10 rounded-md p-3 text-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Hidden Test {index + 1}</span>
                          <span className="text-primary flex items-center">
                            <Lock className="h-4 w-4 mr-1" />
                            Hidden
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-xs text-muted-foreground">Input:</span>
                            <pre className="mt-1 bg-primary/10 p-2 rounded overflow-x-auto font-code text-xs">
                              {testCase.input.toString()}
                            </pre>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Expected:</span>
                            <pre className="mt-1 bg-primary/10 p-2 rounded overflow-x-auto font-code text-xs">
                              {testCase.output.toString()}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <div className="bg-secondary p-4 border-b flex justify-between items-center">
            <Select
              value={language}
              onValueChange={(v) => {
                if (v === "Java" || v === "Python") {
                  setLanguage(v);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>

          <div className="relative flex-grow code-editor-container">
            <Editor
              height="100%"
              key={language.toLowerCase()}
              defaultLanguage={language.toLowerCase()}
              defaultValue={
                language === "Java"
                  ? `/** \n * ${
                      problem?.description
                    }\n * \n */ \npublic class Solution {\n    public static ${determineType(
                      problem.return_type,
                      language
                    )} ${
                      problem?.function_name ?? "FunctionName"
                    }(/*Insert*/) {\n        // Your code here\n    }\n}`
                  : `def ${
                      problem.function_name ?? "function_name"
                    }("""Insert""") -> ${determineType(problem.return_type, language)}:\n    """${
                      problem.description
                    }"""\n    #...`
              }
              theme="custom-dark"
              beforeMount={handleBeforeMount}
              onChange={(value) => {
                handleCodeChange(value);
              }}
              options={{
                minimap: { enabled: false },
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 14,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;
