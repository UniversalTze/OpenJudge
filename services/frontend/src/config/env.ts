// Environment configuration
export const env = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
    ENVIRONMENT: import.meta.env.MODE || 'development',
    DEBUG: import.meta.env.VITE_DEBUG === 'true',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GA_ID,
  } as const;
  
  // API endpoints configuration
  export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
      VERIFY_EMAIL: '/auth/verify-email',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    
    // Problems
    PROBLEMS: {
      LIST: '/problems',
      DETAIL: (id: string) => `/problems/${id}`,
      SUBMIT: (id: string) => `/problems/${id}/submit`,
      TEST_CASES: (id: string) => `/problems/${id}/test-cases`,
      HINTS: (id: string) => `/problems/${id}/hints`,
      SOLUTIONS: (id: string) => `/problems/${id}/solutions`,
    },
    
    // Submissions
    SUBMISSIONS: {
      LIST: '/submissions',
      DETAIL: (id: string) => `/submissions/${id}`,
      USER_SUBMISSIONS: (userId: string) => `/users/${userId}/submissions`,
      PROBLEM_SUBMISSIONS: (problemId: string) => `/problems/${problemId}/submissions`,
      STATISTICS: '/submissions/statistics',
    },
    
    // Code Execution
    EXECUTION: {
      RUN: '/execute/run',
      TEST: '/execute/test',
      SUBMIT: '/execute/submit',
      STATUS: (id: string) => `/execute/status/${id}`,
    },
    
    // User Management
    USERS: {
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
      PREFERENCES: '/users/preferences',
      STATISTICS: '/users/statistics',
      ONBOARDING: '/users/onboarding',
    },
    
    // Admin (if needed)
    ADMIN: {
      USERS: '/admin/users',
      PROBLEMS: '/admin/problems',
      SUBMISSIONS: '/admin/submissions',
      ANALYTICS: '/admin/analytics',
    },
  } as const;
  
  // Feature flags
  export const FEATURES = {
    REAL_TIME_RESULTS: import.meta.env.VITE_FEATURE_REAL_TIME === 'true',
    CODE_COLLABORATION: import.meta.env.VITE_FEATURE_COLLABORATION === 'true',
    ADVANCED_ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
    DARK_MODE: import.meta.env.VITE_FEATURE_DARK_MODE !== 'false',
  } as const;
  
  // Validation
  if (env.ENVIRONMENT === 'production') {
    if (!env.API_BASE_URL.startsWith('https://')) {
      console.warn('API_BASE_URL should use HTTPS in production');
    }
  }