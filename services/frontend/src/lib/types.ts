/* eslint-disable @typescript-eslint/no-explicit-any */

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
    input: string;
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

export interface DatabaseSubmission {
  submission_id: string;
  user_id: string;
  problem_id: string;
  language: string;
  code: string;
  num_tests: number;
  function_name: string;
  status: 'pending' | 'passed' | 'failed'
  results: Array<any>;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  submission_id: string;
  user_id: string;
  problem_id: string;
  language: "python" | "java";
  code: string;
  num_tests: number;
  function_name: string;
  status: 'pending' | 'passed' | 'failed'
  results: Array<{
    test_number: number;
    inputs: string;
    output: string;
    expected: string;
    passed: boolean;
    stdout: string;
    error: string;
    timestamp: string;
  }>
  created_at: string;
  updated_at: string;
}