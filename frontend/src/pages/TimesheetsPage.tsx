"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { timesheetsApi } from "@/api/timesheets"
import { projectsApi } from "@/api/projects"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, Check, X, Filter } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { toast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

export function TimesheetsPage() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")

  const { data: timesheets = [] } = useQuery({
    queryKey: ["timesheets"],
    queryFn: async () => {
      const res = await timesheetsApi.getAll()
      return res.data
    },
  })

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await projectsApi.getAll()
      return res.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => timesheetsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] })
      toast({
        title: "Success",
        description: "Timesheet approved",
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => timesheetsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] })
      toast({
        title: "Success",
        description: "Timesheet rejected",
      })
    },
  })

  const canApprove = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER"

  const filteredTimesheets = timesheets.filter((ts) => {
    const matchesSearch = searchTerm === "" || ts.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ts.status === statusFilter
    const matchesProject = projectFilter === "all" || ts.projectId === projectFilter
    return matchesSearch && matchesStatus && matchesProject
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
        <p className="text-gray-600 mt-1">View and manage all timesheet entries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search timesheets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timesheets List */}
      <div className="space-y-2">
        {filteredTimesheets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No timesheets found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTimesheets.map((ts) => {
            const project = projects.find((p) => p.id === ts.projectId)
            return (
              <Card key={ts.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {ts.durationHours}h @ ${ts.hourlyRate}/h = ${ts.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{new Date(ts.workDate).toLocaleDateString()}</span>
                            {project && (
                              <>
                                <span className="mx-1">•</span>
                                <Link
                                  to={`/projects/${project.id}`}
                                  className="text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  {project.name}
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {ts.notes && <p className="text-sm text-gray-600 mt-2 ml-13">{ts.notes}</p>}
                      <div className="flex items-center gap-2 mt-2 ml-13">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            ts.billable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ts.billable ? "Billable" : "Non-billable"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            ts.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : ts.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : ts.status === "SUBMITTED"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ts.status}
                        </span>
                        {ts.invoiced && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Invoiced</span>
                        )}
                      </div>
                    </div>
                    {canApprove && ts.status === "SUBMITTED" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(ts.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(ts.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

