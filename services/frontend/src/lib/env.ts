export const env = {
  API_BASE_URL: import.meta.env.VITE_API_GATEWAY_URL ?? process.env.VITE_API_GATEWAY_URL ?? "blah!",
  ENV: import.meta.env.VITE_ENV as "local" | "production" ?? process.env.VITE_ENV as "local" | "production" ?? "blugh!",
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
