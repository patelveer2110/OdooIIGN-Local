"use client"

import { useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "@/api/projects"
import { usersApi } from "@/api/users"
import { tasksApi } from "@/api/tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskBoard } from "@/components/TaskBoard"
import { TimesheetList } from "@/components/TimesheetList"
import { FinancePanel } from "@/components/FinancePanel"
import { Button } from "@/components/ui/button"
import { PurchaseOrdersPanel } from "@/components/PurchaseOrdersPanel"
import { VendorBillsPanel } from "@/components/VendorBillsPanel"
import { SalesOrderPanel } from "@/components/SalesOrderPanel"
import { ProjectAnalyticsPanel } from "@/components/ProjectAnalyticsPanel"
import { ArrowLeft } from "lucide-react"

function kFormat(n: number) {
  if (!isFinite(n)) return "0"
  return `$${(n / 1000).toFixed(1)}K`
}

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()

  // --- Fetch Project (includes tasks, timesheets, expenses per your service) ---
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => (await projectsApi.getById(projectId!)).data,
  })

  // --- Financials ---
  const { data: financials } = useQuery({
    queryKey: ["project-financials", projectId],
    queryFn: async () => (await projectsApi.getFinancials(projectId!)).data,
  })

  // --- Users (kept because you had them for task creation earlier) ---
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await usersApi.getAll()).data,
  })

  // --- Create Task (kept intact though UI is hidden in tabs; TaskBoard handles creation for allowed roles) ---
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigneeId: "",
    estimateHours: 2,
  })

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: newTask.title.trim(),
        description: newTask.description?.trim() || undefined,
        assigneeId: newTask.assigneeId?.trim() || undefined,
        estimateHours:
          newTask.estimateHours && !isNaN(Number(newTask.estimateHours))
            ? Number(newTask.estimateHours)
            : undefined,
        priority: "MEDIUM",
        state: "NEW",
      }
      return await tasksApi.create(projectId!, payload)
    },
    onSuccess: (res) => {
      const created = res.data
      queryClient.setQueryData(["tasks", projectId], (old: any = []) => [created, ...old])
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      setNewTask({ title: "", description: "", assigneeId: "", estimateHours: 2 })
      setShowCreateTask(false)
    },
    onError: (err: any) => {
      alert(`Task creation failed: ${err.response?.data?.message || err.message}`)
    },
  })

  // --- Project progress from tasks (total vs done) ---
  const progress = useMemo(() => {
    const tasks = (project?.tasks ?? []) as Array<{
      estimateHours?: number | null
      state?: string | null
    }>

    const toNum = (v: any) => {
      const n = Number(v)
      return isFinite(n) ? n : 0
    }

    const totalTaskHours = tasks.reduce((s, t) => s + toNum(t.estimateHours), 0)
    const completedHours = tasks
      .filter((t) => (t.state || "").toUpperCase() === "DONE")
      .reduce((s, t) => s + toNum(t.estimateHours), 0)

    const pct = totalTaskHours > 0 ? Math.min(100, Math.round((completedHours / totalTaskHours) * 100)) : 0

    return {
      pct,
      completedHours,
      totalTaskHours,
    }
  }, [project?.tasks])

  if (isLoading) return <div>Loading project...</div>
  if (!project) return <div>Project not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-sm text-gray-500">{project.code}</p>
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ✅ Project Progress based on task hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{progress.pct}%</p>
            <p className="text-xs text-gray-500">
              {progress.completedHours}h of {progress.totalTaskHours}h (DONE tasks)
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${progress.pct}%` }}
                aria-label="project progress"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kFormat(Number(financials?.revenue || 0))}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kFormat(Number(financials?.cost || 0))}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {kFormat(Number(financials?.profit || 0))}
            </p>
            <p className="text-xs text-gray-500">
              {(Number(financials?.profitMargin || 0)).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="bg-white rounded-lg border">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="sales-orders">Sales Orders</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="p-4 space-y-4">
          <TaskBoard projectId={projectId!} teamMembers={project.teamMembers} />
        </TabsContent>

        <TabsContent value="timesheets" className="p-4">
          <TimesheetList projectId={projectId!} />
        </TabsContent>

        <TabsContent value="sales-orders" className="p-4">
          <SalesOrderPanel projectId={projectId!} />
        </TabsContent>

        <TabsContent value="expenses" className="p-4">
          <div className="space-y-4">
            <h4 className="font-semibold">Purchase Orders</h4>
            <div className="p-2 bg-gray-50 rounded">
              <PurchaseOrdersPanel projectId={projectId!} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="p-4">
          <div className="space-y-4">
            <h4 className="font-semibold">Vendor Bills</h4>
            <div className="p-2 bg-gray-50 rounded">
              <VendorBillsPanel projectId={projectId!} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="p-4">
          <div className="space-y-4">
            <h4 className="font-semibold">Analytics</h4>
            <div className="p-2 bg-gray-50 rounded">
              <ProjectAnalyticsPanel projectId={projectId!} project={project} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
