"use client"

import { useState } from "react"
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

// FinancePanel intentionally not used in ProjectPage tabs
import { PurchaseOrdersPanel } from "@/components/PurchaseOrdersPanel"
import { VendorBillsPanel } from "@/components/VendorBillsPanel"
import { SalesOrderPanel } from "@/components/SalesOrderPanel"

import { ArrowLeft } from "lucide-react"

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()

  // --- Fetch Project ---
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => (await projectsApi.getById(projectId!)).data,
  })

  // --- Fetch Financials ---
  const { data: financials } = useQuery({
    queryKey: ["project-financials", projectId],
    queryFn: async () => (await projectsApi.getFinancials(projectId!)).data,
  })

  // --- Fetch Users (for assignment dropdown) ---
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await usersApi.getAll()).data,
  })

  // --- UI State ---
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigneeId: "",
    estimateHours: 2,
  })

  // --- Create Task Mutation ---
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

      console.log("📤 Creating task payload:", payload)
      return await tasksApi.create(projectId!, payload)
    },

    onSuccess: (res) => {
      const created = res.data
      console.log("✅ Task created:", created)

      // Optimistically update Kanban board
      queryClient.setQueryData(["tasks", projectId], (old: any = []) => [created, ...old])
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })

      // Reset form
      setNewTask({ title: "", description: "", assigneeId: "", estimateHours: 2 })
      setShowCreateTask(false)
    },

    onError: (err: any) => {
      console.error("❌ Task creation failed:", err.response?.data || err.message)
      alert(`Task creation failed: ${err.response?.data?.message || err.message}`)
    },
  })

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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Budget Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">65%</p>
            <p className="text-xs text-gray-500">$97.5K of $150K</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(financials?.revenue || 0) / 1000}K</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(financials?.cost || 0) / 1000}K</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${(financials?.profit || 0) / 1000}K
            </p>
            <p className="text-xs text-gray-500">
              {(financials?.profitMargin || 0).toFixed(1)}% margin
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
        </TabsList>

        <TabsContent value="tasks" className="p-4 space-y-4">
        {/* --- TASKS TAB ---
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Project Tasks</h2>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowCreateTask((s) => !s)}
            >
              {showCreateTask ? "Cancel" : "New Task"}
            </Button>
          </div>

          {showCreateTask && (
            <div className="border rounded bg-gray-50 p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((t) => ({ ...t, title: e.target.value }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((t) => ({ ...t, description: e.target.value }))
                  }
                />
                <select
                  className="border rounded px-2 py-1"
                  value={newTask.assigneeId}
                  onChange={(e) =>
                    setNewTask((t) => ({ ...t, assigneeId: e.target.value }))
                  }
                >
                  <option value="">Select Assignee</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.name || u.email}{" "}
                      {u.role ? `(${u.role})` : ""}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="border rounded px-2 py-1"
                  placeholder="Estimate Hours"
                  value={newTask.estimateHours}
                  onChange={(e) =>
                    setNewTask((t) => ({
                      ...t,
                      estimateHours: Number(e.target.value),
                    }))
                  }
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => createTaskMutation.mutate()}
                  disabled={!newTask.title || createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </div>
          )} */}

          {/* ✅ Kanban Board */}
          <TaskBoard projectId={projectId!} teamMembers={project.teamMembers} />
        </TabsContent>

        {/* --- TIMESHEETS TAB --- */}
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

        {/* --- DOCUMENTS TAB --- */}
        <TabsContent value="docs" className="p-4">
          <div className="space-y-4">
            <h4 className="font-semibold">Vendor Bills</h4>
            <div className="p-2 bg-gray-50 rounded">
              <VendorBillsPanel projectId={projectId!} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
