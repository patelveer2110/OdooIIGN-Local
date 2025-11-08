import client from "./client"
import type { AuthResponse, User } from "@/types"

export const authApi = {
  signup: (email: string, password: string, fullName: string) =>
    client.post<AuthResponse>("/api/v1/auth/signup", { email, password, fullName }),
  login: (email: string, password: string) =>
    client.post<AuthResponse>("/api/v1/auth/login", { email, password }),
  logout: () => client.post("/api/v1/auth/logout"),
  forgotPassword: (email: string) => client.post("/api/v1/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    client.post("/api/v1/auth/reset-password", { token, password }),
}

