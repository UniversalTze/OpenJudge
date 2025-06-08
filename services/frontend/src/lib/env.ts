export const env = {
  API_BASE_URL: import.meta.env.VITE_API_GATEWAY_URL ?? "http://apigatewayloadbalancer-198465570.us-east-1.elb.amazonaws.com",
  ENV: import.meta.env.VITE_ENV as "local" | "production" ?? "production",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    LOGOUT: "/logout",
    REFRESH: "/refresh",
    PROFILE: "/user",
    VERIFY_EMAIL: "/verify",
    FORGOT_PASSWORD: "/forgot",
    RESET_PASSWORD: "/reset",
  },

  PROBLEMS: {
    ALL: "/problems",
    ID: (id: string) => `/problems/${id}`,
  },

  SUBMISSIONS: {
    ALL: "/submission",
    ID: (id: string) => `/submission/${id}`,
    AI: (id: string) => `/submission/ai/${id}`,
  },
} as const;
