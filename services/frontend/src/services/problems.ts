import { apiClient, ApiResponse, PaginatedResponse } from './api';
import { API_ENDPOINTS } from '@/config/env';

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  testCases: Array<{
    input: string;
    output: string;
    hidden: boolean;
  }>;
  solutionHint?: string;
  languages: string[];
  statistics: {
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
  };
  lastAttempt?: {
    date: string;
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProblemFilters {
  difficulty?: string[];
  tags?: string[];
  status?: 'solved' | 'attempted' | 'not-attempted';
  search?: string;
}

export interface ProblemListParams extends ProblemFilters {
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'difficulty' | 'acceptance-rate' | 'created-at';
  sortOrder?: 'asc' | 'desc';
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

class ProblemsService {
  async getProblems(params: ProblemListParams = {}): Promise<PaginatedResponse<Problem>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    if (params.search) queryParams.search = params.search;
    if (params.difficulty?.length) queryParams.difficulty = params.difficulty.join(',');
    if (params.tags?.length) queryParams.tags = params.tags.join(',');
    if (params.status) queryParams.status = params.status;

    return apiClient.get<PaginatedResponse<Problem>>(
      API_ENDPOINTS.PROBLEMS.LIST,
      queryParams
    );
  }

  async getProblem(id: string): Promise<Problem> {
    const response = await apiClient.get<ApiResponse<Problem>>(
      API_ENDPOINTS.PROBLEMS.DETAIL(id)
    );
    return response.data;
  }

  async getTestCases(problemId: string): Promise<TestCaseResult[]> {
    const response = await apiClient.get<ApiResponse<TestCaseResult[]>>(
      API_ENDPOINTS.PROBLEMS.TEST_CASES(problemId)
    );
    return response.data;
  }

  async getHints(problemId: string): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(
      API_ENDPOINTS.PROBLEMS.HINTS(problemId)
    );
    return response.data;
  }

  async runCode(submission: CodeSubmission): Promise<SubmissionResult> {
    const response = await apiClient.post<ApiResponse<SubmissionResult>>(
      API_ENDPOINTS.EXECUTION.RUN,
      submission
    );
    return response.data;
  }

  async submitCode(submission: CodeSubmission): Promise<SubmissionResult> {
    const response = await apiClient.post<ApiResponse<SubmissionResult>>(
      API_ENDPOINTS.EXECUTION.SUBMIT,
      submission
    );
    return response.data;
  }

  async getSubmissionStatus(submissionId: string): Promise<SubmissionResult> {
    const response = await apiClient.get<ApiResponse<SubmissionResult>>(
      API_ENDPOINTS.EXECUTION.STATUS(submissionId)
    );
    return response.data;
  }

  // Get available programming languages
  async getLanguages(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/languages');
    return response.data;
  }

  // Get problem tags
  async getTags(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/problems/tags');
    return response.data;
  }
}

export const problemsService = new ProblemsService();