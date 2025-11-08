"use client"

import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/api/projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TaskBoard } from "@/components/TaskBoard"
import { TimesheetList } from "@/components/TimesheetList"
import { FinancePanel } from "@/components/FinancePanel"
import { ArrowLeft, Edit, FileText, DollarSign, Clock, Receipt, BarChart3, Link as LinkIcon } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { ExpenseList } from "@/components/ExpenseList"
import { ProjectLinksPanel } from "@/components/ProjectLinksPanel"

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await projectsApi.getById(projectId!)
      return res.data
    },
    enabled: !!projectId,
  })

  const { data: financials } = useQuery({
    queryKey: ["project-financials", projectId],
    queryFn: async () => {
      try {
        const res = await projectsApi.getFinancials(projectId!)
        return res.data
      } catch {
        return null
      }
    },
    enabled: !!projectId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Project not found</p>
        <Link to="/projects">
          <Button variant="ghost">Back to Projects</Button>
        </Link>
      </div>
    )
  }

  const progress = 45 // This would come from tasks completion
  const budgetUsage = project.budgetAmount
    ? ((financials?.cost || 0) / project.budgetAmount) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-sm text-gray-500 font-mono">{project.code}</p>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.description && <p className="text-gray-600 mt-1">{project.description}</p>}
          </div>
        </div>
        {(user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER") && (
          <Button
            onClick={() => navigate(`/projects/${projectId}/edit`)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Project
          </Button>
        )}
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Budget Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{budgetUsage.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              ${((financials?.cost || 0) / 1000).toFixed(1)}K of ${((project.budgetAmount || 0) / 1000).toFixed(1)}K
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${((financials?.revenue || 0) / 1000).toFixed(1)}K</p>
            <p className="text-xs text-gray-500 mt-1">Total earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">${((financials?.profit || 0) / 1000).toFixed(1)}K</p>
            <p className="text-xs text-gray-500 mt-1">
              {(financials?.profitMargin || 0).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Links Panel */}
      <ProjectLinksPanel projectId={projectId!} />

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="bg-white rounded-lg border">
        <TabsList className="grid w-full grid-cols-6 p-1">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="timesheets" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timesheets
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Finance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="p-6">
          <TaskBoard projectId={projectId!} />
        </TabsContent>

        <TabsContent value="timesheets" className="p-6">
          <TimesheetList projectId={projectId!} />
        </TabsContent>

        <TabsContent value="expenses" className="p-6">
          <ExpenseList projectId={projectId!} />
        </TabsContent>

        <TabsContent value="finance" className="p-6">
          <FinancePanel projectId={projectId!} />
        </TabsContent>

        <TabsContent value="analytics" className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Analytics</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Revenue vs Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-semibold text-green-600">${(financials?.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost</span>
                      <span className="font-semibold text-red-600">${(financials?.cost || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm font-medium">Profit</span>
                      <span className="font-bold text-blue-600">${(financials?.profit || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Profit Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{(financials?.profitMargin || 0).toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {(financials?.profitMargin || 0) >= 20
                      ? "Excellent"
                      : (financials?.profitMargin || 0) >= 10
                        ? "Good"
                        : "Needs attention"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="p-6">
          <div className="text-center text-gray-500 py-8">
            <LinkIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Documents & links panel</p>
            <p className="text-sm mt-2">Link SO, PO, Invoices, and Vendor Bills to this project</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
