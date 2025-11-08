import client from "./client"

export interface DashboardAnalytics {
  activeProjects: number
  delayedTasks: number
  hoursLogged: number
  revenueEarned: number
  totalBudget: number
  projects: Array<{
    id: string
    name: string
    progress: number
    revenue: number
    cost: number
    profit: number
  }>
}

export interface ProjectAnalytics {
  revenue: number
  cost: number
  profit: number
  profitMargin: number
  billableHours: number
  nonBillableHours: number
  utilization: number
}

export const analyticsApi = {
  getDashboard: (from?: string, to?: string) =>
    client.get<DashboardAnalytics>("/api/v1/analytics/dashboard", {
      params: { from, to },
    }),
  getProjectSummary: (projectId: string) =>
    client.get<ProjectAnalytics>(`/api/v1/analytics/projects/${projectId}/summary`),
}

