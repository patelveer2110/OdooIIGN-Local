import { useMemo } from "react"
import { useQuery, useQueries } from "@tanstack/react-query"
import { projectsApi } from "@/api/projects"
import { tasksApi } from "@/api/tasks"
import { projectsApi as _projectsApi } from "@/api/projects" // alias if needed elsewhere
import { useAuthStore } from "@/store/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { TrendingUp, Briefcase, Clock, DollarSign } from "lucide-react"

// helper: nice $K format
function k(n: number) {
  if (!isFinite(n)) return "$0"
  return `$${(n / 1000).toFixed(1)}K`
}
// safe number
const num = (v: any) => {
  const n = Number(v)
  return isFinite(n) ? n : 0
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
  })

  const role = (user?.role || "").toUpperCase()
  const isTeam = role === "TEAM_MEMBER"
  const isPMOrAdmin = role === "PROJECT_MANAGER" || role === "ADMIN"

  // Visible projects:
  // for TEAM, try to filter by membership if project.teamMembers is present;
  // otherwise show all (fallback).
  const visibleProjects = useMemo(() => {
    if (!isTeam) return projects as any[]
    return (projects as any[]).filter((p) =>
      Array.isArray(p.teamMembers)
        ? p.teamMembers.some((m: any) => m.user?.id === user?.id || m.id === user?.id)
        : true,
    )
  }, [projects, isTeam, user?.id])

  const projectIds = useMemo(() => (visibleProjects as any[]).map((p) => p.id), [visibleProjects])

  // Fetch tasks per project (to compute progress + hours)
  const tasksQueries = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: ["tasks", pid],
      queryFn: async () => (await tasksApi.getByProject(pid)).data,
      enabled: projectIds.length > 0,
    })),
  })

  // Build a map: projectId -> tasks[]
  const tasksByProject: Record<string, any[]> = useMemo(() => {
    const map: Record<string, any[]> = {}
    projectIds.forEach((pid, idx) => {
      map[pid] = (tasksQueries[idx]?.data as any[]) || []
    })
    return map
  }, [projectIds, tasksQueries])

  // Compute hours logged (DONE tasks’ estimateHours)
  const totalHoursLogged = useMemo(() => {
    let total = 0
    for (const pid of projectIds) {
      const list = tasksByProject[pid] || []
      for (const t of list) {
        const isDone = (t.state || "").toUpperCase() === "DONE"
        if (!isDone) continue
        if (isTeam && t.assigneeId !== user?.id) continue
        total += num(t.estimateHours)
      }
    }
    return total
  }, [projectIds, tasksByProject, isTeam, user?.id])

  // Financials per project for Revenue KPI
  const finQueries = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: ["project-financials", pid],
      queryFn: async () => (await projectsApi.getFinancials(pid)).data,
      enabled: projectIds.length > 0,
    })),
  })

  const totalRevenue = useMemo(() => {
    return finQueries.reduce((sum, q) => sum + num(q.data?.revenue || 0), 0)
  }, [finQueries])

  // Card-level helpers (progress per project based on tasks)
  function projectProgress(pid: string) {
    const list = tasksByProject[pid] || []
    const total = list.reduce((s, t) => s + num(t.estimateHours), 0)
    const done = list
      .filter((t) => (t.state || "").toUpperCase() === "DONE")
      .reduce((s, t) => s + num(t.estimateHours), 0)
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
    return { pct, done, total }
  }

  const activeProjects = (visibleProjects as any[]).filter((p) => p.status === "ACTIVE").length
  const totalBudget = (visibleProjects as any[]).reduce((sum, p) => sum + num(p.budgetAmount), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.fullName}</p>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeProjects}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Total Hours Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHoursLogged}</p>
            <p className="text-xs text-gray-500">
              {isTeam ? "DONE hours on my tasks" : "DONE hours across all tasks"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue (Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{k(totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(totalBudget / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Projects</h2>
          {isPMOrAdmin && (
            <Button className="bg-blue-600 hover:bg-blue-700">New Project</Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(visibleProjects as any[]).map((project) => {
            const prog = projectProgress(project.id)
            return (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-mono text-gray-500">{project.code}</p>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          project.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{prog.pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${prog.pct}%` }}
                      />
                    </div>
                    {project.budgetAmount && (
                      <p className="text-xs text-gray-500">
                        Budget: ${num(project.budgetAmount).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {isTeam && (
        <TeamPanels tasksByProject={tasksByProject} userId={user?.id} />
      )}
    </div>
  )
}

// Optional: keep your previous “My Tasks / Profile” panel logic here.
// This stub keeps your layout; plug back your earlier component if needed.
function TeamPanels({ tasksByProject, userId }: { tasksByProject: Record<string, any[]>; userId?: string }) {
  const myTasks = useMemo(() => {
    const out: any[] = []
    Object.values(tasksByProject).forEach((arr) => {
      arr.forEach((t) => {
        if (t.assigneeId === userId) out.push(t)
      })
    })
    return out
  }, [tasksByProject, userId])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">My Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myTasks.length === 0 && <p className="text-sm text-gray-500">No tasks assigned yet.</p>}
          {myTasks.slice(0, 8).map((t: any) => (
            <div key={t.id} className="flex items-start justify-between border rounded-md p-3 bg-white">
              <div>
                <p className="font-medium">{t.title}</p>
                {t.description && <p className="text-sm text-gray-600 line-clamp-1">{t.description}</p>}
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">{t.state}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* You can re-add your Profile card here if desired */}
    </div>
  )
}
