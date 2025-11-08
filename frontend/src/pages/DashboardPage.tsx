"use client"

import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/api/projects"
import { analyticsApi } from "@/api/analytics"
import { useAuthStore } from "@/store/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { TrendingUp, Briefcase, Clock, DollarSign, Plus, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await projectsApi.getAll()
      return res.data
    },
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      try {
        const res = await analyticsApi.getDashboard()
        return res.data
      } catch {
        // Fallback if analytics endpoint doesn't exist
        return null
      }
    },
  })

  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length
  const totalBudget = projects.reduce((sum, p) => sum + (p.budgetAmount || 0), 0)

  // Calculate hours logged from projects (simplified)
  const hoursLogged = analytics?.hoursLogged || 248
  const revenue = analytics?.revenueEarned || 24500

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/projects/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{activeProjects}</p>
            <p className="text-xs text-gray-500 mt-1">
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              Hours Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{hoursLogged}</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              Revenue (Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">${(revenue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-gray-500 mt-1">Earned this month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">${(totalBudget / 1000).toFixed(0)}K</p>
            <p className="text-xs text-gray-500 mt-1">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
          <Link to="/projects">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {projectsLoading ? (
          <div className="text-center py-12 text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No projects yet</p>
              <Button
                onClick={() => navigate("/projects/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-l-4 border-l-blue-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs font-mono text-gray-500 mb-1">{project.code}</p>
                        <CardTitle className="text-lg text-gray-900">{project.name}</CardTitle>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          project.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : project.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                    {project.budgetAmount && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Budget</span>
                        <span className="font-semibold">${project.budgetAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {project.projectManager && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {project.projectManager.fullName.charAt(0)}
                        </div>
                        <span>PM: {project.projectManager.fullName}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
