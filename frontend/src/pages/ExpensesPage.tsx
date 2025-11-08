"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { expensesApi } from "@/api/expenses"
import { projectsApi } from "@/api/projects"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Receipt, Check, DollarSign, Filter } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { toast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

export function ExpensesPage() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState<string>("all")

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await expensesApi.getAll()
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
    mutationFn: (id: string) => expensesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      toast({
        title: "Success",
        description: "Expense approved",
      })
    },
  })

  const reimburseMutation = useMutation({
    mutationFn: (id: string) => expensesApi.reimburse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      toast({
        title: "Success",
        description: "Expense marked as reimbursed",
      })
    },
  })

  const canApprove = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER"
  const canReimburse = user?.role === "ADMIN" || user?.role === "FINANCE"

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = searchTerm === "" || exp.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === "all" || exp.projectId === projectFilter
    return matchesSearch && matchesProject
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-600 mt-1">View and manage all expense submissions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
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

      {/* Expenses List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No expenses found</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((exp) => {
            const project = projects.find((p) => p.id === exp.projectId)
            return (
              <Card key={exp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            ${exp.amount.toLocaleString()} {exp.currency}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{exp.category}</span>
                            <span className="mx-1">•</span>
                            <span>{new Date(exp.date).toLocaleDateString()}</span>
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
                      {exp.notes && <p className="text-sm text-gray-600 mt-2 ml-13">{exp.notes}</p>}
                      <div className="flex items-center gap-2 mt-2 ml-13">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            exp.billable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {exp.billable ? "Billable" : "Non-billable"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            exp.approved
                              ? "bg-green-100 text-green-800"
                              : exp.approved === false
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {exp.approved ? "Approved" : exp.approved === false ? "Rejected" : "Pending"}
                        </span>
                        {exp.reimbursed && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Reimbursed</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!exp.approved && canApprove && (
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(exp.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {exp.approved && !exp.reimbursed && canReimburse && (
                        <Button
                          size="sm"
                          onClick={() => reimburseMutation.mutate(exp.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Mark Reimbursed
                        </Button>
                      )}
                    </div>
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

