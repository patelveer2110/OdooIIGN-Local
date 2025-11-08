import client from "./client"
import type { Task } from "@/types"

export const tasksApi = {
  getByProject: (projectId: string) => client.get<Task[]>(`/api/v1/projects/${projectId}/tasks`),
  getById: (id: string) => client.get<Task>(`/api/v1/tasks/${id}`),
  create: (projectId: string, data: Partial<Task>) =>
    client.post<Task>(`/api/v1/projects/${projectId}/tasks`, data),
  update: (id: string, data: Partial<Task>) => client.put<Task>(`/api/v1/tasks/${id}`, data),
  move: (id: string, state: Task["state"]) => client.post(`/api/v1/tasks/${id}/move`, { state }),
  addComment: (id: string, comment: string) => client.post(`/api/v1/tasks/${id}/comments`, { comment }),
}

