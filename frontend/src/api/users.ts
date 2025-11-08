import client from "./client"
import type { User } from "@/types"

export const usersApi = {
  getAll: () => client.get<User[]>("/api/v1/users"),
  getById: (id: string) => client.get<User>(`/api/v1/users/${id}`),
  create: (data: Partial<User>) => client.post<User>("/api/v1/users", data),
  update: (id: string, data: Partial<User>) => client.put<User>(`/api/v1/users/${id}`, data),
  delete: (id: string) => client.delete(`/api/v1/users/${id}`),
}

