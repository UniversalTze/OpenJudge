export const env = {
  API_BASE_URL: import.meta.env.API_GATEWAY_URL as string,
  ENV: import.meta.env.ENV as "local" | "production",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/user",
    VERIFY_EMAIL: "/auth/verify",
    FORGOT_PASSWORD: "/auth/forgot",
    RESET_PASSWORD: "/auth/reset",
    AVATAR: "/auth/user/avatar",
  },

  PROBLEMS: {
    LIST: "/problems",
    DETAIL: (id: string) => `/problems/${id}`,
    SUBMIT: (id: string) => `/problems/${id}/submit`,
    TEST_CASES: (id: string) => `/problems/${id}/test-cases`,
    HINTS: (id: string) => `/problems/${id}/hints`,
    SOLUTIONS: (id: string) => `/problems/${id}/solutions`,
  },

  SUBMISSIONS: {
    LIST: "/submissions",
    DETAIL: (id: string) => `/submissions/${id}`,
    USER_SUBMISSIONS: (userId: string) => `/users/${userId}/submissions`,
    PROBLEM_SUBMISSIONS: (problemId: string) => `/problems/${problemId}/submissions`,
    STATISTICS: "/submissions/statistics",
  },
} as const;
