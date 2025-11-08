import client from "./client"
import type { Expense } from "@/types"

export const expensesApi = {
  getAll: (filters?: Record<string, string>) =>
    client.get<Expense[]>("/api/v1/expenses", { params: filters }),
  getById: (id: string) => client.get<Expense>(`/api/v1/expenses/${id}`),
  create: (data: Partial<Expense>) => client.post<Expense>("/api/v1/expenses", data),
  approve: (id: string) => client.put(`/api/v1/expenses/${id}/approve`),
  reimburse: (id: string) => client.put(`/api/v1/expenses/${id}/reimburse`),
}

