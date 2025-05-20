
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
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Play, ChevronLeft } from "lucide-react";

import { problems } from "@/data/problems";
import useLocalStorage from "@/hooks/useLocalStorage";

const ProblemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const problem = problems.find(p => p.id === id);
  
  const [language, setLanguage] = useState<string>("Python");
  const [code, setCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hook to save/retrieve code from localStorage
  const [savedCode, setSavedCode] = useLocalStorage<Record<string, Record<string, string>>>('saved-code', {});

  // Set initial code based on language or previously saved code
  useEffect(() => {
    if (!problem) return;

    const problemSavedCode = savedCode[problem.id] || {};
    
    if (language === 'Python') {
      setCode(problemSavedCode.python || 
        `def solution(nums):\n    # Write your Python solution here\n    pass\n\n# Example usage:\n# solution([1, 2, 3])`);
    } else if (language === 'Java') {
      setCode(problemSavedCode.java || 
        `class Solution {\n    public int[] solution(int[] nums) {\n        // Write your Java solution here\n        return new int[0];\n    }\n\n    // Example usage:\n    // public static void main(String[] args) {\n    //     Solution sol = new Solution();\n    //     sol.solution(new int[]{1, 2, 3});\n    // }\n}`);
    }
  }, [language, problem, savedCode]);

  // Save code when it changes
  useEffect(() => {
    if (!problem) return;
    
    // Debounced save to localStorage
    const timer = setTimeout(() => {
      const updatedSavedCode = { ...savedCode };
      
      if (!updatedSavedCode[problem.id]) {
        updatedSavedCode[problem.id] = {};
      }
      
      // Save based on current language
      updatedSavedCode[problem.id][language.toLowerCase()] = code;
      
      setSavedCode(updatedSavedCode);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [code, language, problem, savedCode, setSavedCode]);
  
  if (!problem) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Problem not found</h2>
        <Button onClick={() => navigate('/problems')}>Back to Problems</Button>
      </div>
    );
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      toast({
        title: "Code submitted successfully",
        description: "Your solution has been sent for evaluation.",
      });
      setIsSubmitting(false);
      navigate('/submission-success');
    }, 1500);
  };

  // Generate difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">Easy</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Medium</Badge>;
      case 'Hard':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">Hard</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container py-4">
      {/* Back navigation */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/problems')} 
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Problems
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold">{problem.id}. {problem.title}</h1>
              {getDifficultyBadge(problem.difficulty)}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {problem.tags.map((tag) => (
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
                    <code className="font-code bg-secondary/50 px-1.5 py-0.5 rounded">{constraint}</code>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="hints" className="py-4">
              {problem.solutionHint ? (
                <div className="bg-accent/20 border border-accent/30 rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-accent-foreground mr-2" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Hint
                  </h3>
                  <p className="text-sm">{problem.solutionHint}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hints available for this problem.</p>
              )}
            </TabsContent>
          </Tabs>

          <div>
            <h3 className="font-medium mb-2">Test Cases</h3>
            <div className="space-y-2">
              {problem.testCases.slice(0, 2).map((testCase, index) => (
                <div key={index} className="bg-secondary/30 rounded-md p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Test {index + 1}</span>
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Visible
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Input:</span>
                      <pre className="mt-1 bg-secondary/70 p-2 rounded overflow-x-auto font-code text-xs">
                        {testCase.input}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Expected:</span>
                      <pre className="mt-1 bg-secondary/70 p-2 rounded overflow-x-auto font-code text-xs">
                        {testCase.output}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
              {problem.testCases.length > 2 && (
                <Button variant="outline" className="w-full text-sm">
                  Show {problem.testCases.length - 2} More Test Cases
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <div className="bg-secondary p-4 border-b flex justify-between items-center">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {problem.languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center space-x-1"
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    <span>Submit</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="relative flex-grow code-editor-container">
            <textarea
              className="w-full h-full p-4 font-code text-sm resize-none bg-background border-none focus:outline-none"
              value={code}
              onChange={handleCodeChange}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;
