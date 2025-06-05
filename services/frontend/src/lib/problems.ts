export interface Problem {
  problem_id: string;
  problem_title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  test_cases: Array<{
    input: Array<any>;
    output: string;
    hidden: boolean;
  }>;
  return_type: "string" | "integer" | "boolean";
  function_name: string;
  hint: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseRecord {
  problem_id: string;
  problem_title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  description: string;
  examples: string;
  constraints: string[];
  test_cases: string;
  hint: string;
  return_type: "string" | "integer" | "boolean";
  function_name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeSubmission {
  problemId: string;
  language: string;
  code: string;
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  memoryUsed: number;
  error?: string;
}

export interface SubmissionResult {
  id: string;
  status: 'Pending' | 'Running' | 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  testResults: TestCaseResult[];
  executionTime: number;
  memoryUsed: number;
  score: number;
  totalScore: number;
  createdAt: string;
}