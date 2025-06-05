export const env = {
  API_BASE_URL: import.meta.env.VITE_API_GATEWAY_URL as string,
  ENV: import.meta.env.VITE_ENV as "local" | "production",
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
  },
} as const;
