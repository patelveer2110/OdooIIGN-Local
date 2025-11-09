import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "../api/projects"
import { invoicesApi } from "../api/invoices"
import { expensesApi } from "../api/expenses"
import { usersApi } from "../api/users"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10) // yyyy-mm-dd for <input type="date" />
}

// Safely coerce unknown number-ish values (Prisma.Decimal, string, number)
function toNum(v: any): number {
  if (v == null) return 0
  // Prisma.Decimal often serializes with toNumber()
  if (typeof v?.toNumber === "function") return Number(v.toNumber())
  return Number(v) || 0
}

export function DashboardAdminPage() {
  const queryClient = useQueryClient()

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
  })
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await invoicesApi.getAll()).data,
  })
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => (await expensesApi.getAll()).data,
  })
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await usersApi.getAll()).data,
  })

  // Only Admins & Managers can be selected as PM
  const managersAndAdmins = useMemo(() => {
    const norm = (r?: string) => (r || "").toUpperCase()
    return (users as any[]).filter((u) => ["ADMIN", "MANAGER"].includes(norm(u.role || u.userRole)))
  }, [users])

  // ✅ Coerce amounts to numbers before summing (prevents string concatenation)
  const totalRevenue = invoices.reduce((s: number, i: any) => s + toNum(i.totalAmount), 0)
  const totalExpenses = expenses.reduce((s: number, e: any) => s + toNum(e.amount), 0)

  // ---- Create Project UI state
  const [showCreate, setShowCreate] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    code: "",
    status: "PLANNING",                 // matches schema default, editable
    currency: "USD",                    // schema default is USD
    budgetAmount: "",                   // string input -> convert on submit
    projectManagerId: "",               // REQUIRED
    startDate: toISODate(new Date()),   // REQUIRED (yyyy-mm-dd)
    endDate: "",                        // optional
    billableFlag: true,                 // schema default true
    defaultHourlyRate: "",              // optional
    // projectType left to schema default TIME_AND_MATERIALS unless you expose it
  })

  // ---- Create Project mutation
  const createProject = useMutation({
    mutationFn: async () => {
      if (!newProject.projectManagerId) throw new Error("Please select a Project Manager")
      if (!newProject.startDate) throw new Error("Please choose a Start Date")

      const payload: any = {
        name: newProject.name.trim(),
        code: newProject.code.trim(),
        status: newProject.status,                   // PLANNING | ACTIVE | ON_HOLD | COMPLETED
        currency: newProject.currency || "USD",
        projectManagerId: newProject.projectManagerId,  // REQUIRED
        startDate: new Date(newProject.startDate).toISOString(), // REQUIRED ISO
        billableFlag: !!newProject.billableFlag,
      }

      // Optional numeric/date fields
      if (newProject.budgetAmount !== "") payload.budgetAmount = Number(newProject.budgetAmount)
      if (newProject.defaultHourlyRate !== "") payload.defaultHourlyRate = Number(newProject.defaultHourlyRate)
      if (newProject.endDate) payload.endDate = new Date(newProject.endDate).toISOString()

      return projectsApi.create(payload)
    },
    onSuccess: (res) => {
      const created = res.data
      // Optimistic list + revalidate to ensure it is persisted
      queryClient.setQueryData(["projects"], (old: any = []) => [created, ...old])
      queryClient.invalidateQueries({ queryKey: ["projects"] })

      // Reset form
      setNewProject({
        name: "",
        code: "",
        status: "PLANNING",
        currency: "USD",
        budgetAmount: "",
        projectManagerId: "",
        startDate: toISODate(new Date()),
        endDate: "",
        billableFlag: true,
        defaultHourlyRate: "",
      })
      setShowCreate(false)
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? err?.message ?? "Failed to create project")
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and financial KPIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Total Projects</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{projects.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Active Users</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{users.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Revenue Earned</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Total Expenses</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Projects</h2>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowCreate((s) => !s)}
          >
            {showCreate ? "Cancel" : "New Project"}
          </Button>
        </div>

        {/* Create Project Form */}
        {showCreate && (
          <div className="border rounded bg-gray-50 p-4 space-y-3 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
              <input
                className="border rounded px-2 py-1"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="Project Code"
                value={newProject.code}
                onChange={(e) => setNewProject((p) => ({ ...p, code: e.target.value }))}
              />
              <select
                className="border rounded px-2 py-1"
                value={newProject.status}
                onChange={(e) => setNewProject((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="PLANNING">PLANNING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
              <select
                className="border rounded px-2 py-1"
                value={newProject.currency}
                onChange={(e) => setNewProject((p) => ({ ...p, currency: e.target.value }))}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
              </select>
              <input
                className="border rounded px-2 py-1"
                placeholder="Budget Amount"
                type="number"
                value={newProject.budgetAmount}
                onChange={(e) => setNewProject((p) => ({ ...p, budgetAmount: e.target.value }))}
              />

              {/* Project Manager (REQUIRED) – only Admin/Manager */}
              <select
                className="border rounded px-2 py-1"
                value={newProject.projectManagerId}
                onChange={(e) => setNewProject((p) => ({ ...p, projectManagerId: e.target.value }))}
              >
                <option value="">Select Project Manager *</option>
                {managersAndAdmins.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {(u.fullName || u.name || u.email) + " — " + (u.role || u.userRole)}
                  </option>
                ))}
              </select>

              {/* Start / End Dates */}
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={newProject.startDate}
                onChange={(e) => setNewProject((p) => ({ ...p, startDate: e.target.value }))}
                title="Start Date *"
              />
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={newProject.endDate}
                onChange={(e) => setNewProject((p) => ({ ...p, endDate: e.target.value }))}
                title="End Date (optional)"
              />
            </div>

            {/* Optional advanced fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newProject.billableFlag}
                  onChange={(e) => setNewProject((p) => ({ ...p, billableFlag: e.target.checked }))}
                />
                Billable
              </label>
              <input
                className="border rounded px-2 py-1"
                placeholder="Default Hourly Rate (optional)"
                type="number"
                value={newProject.defaultHourlyRate}
                onChange={(e) => setNewProject((p) => ({ ...p, defaultHourlyRate: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => createProject.mutate()}
                disabled={
                  !newProject.name ||
                  !newProject.code ||
                  !newProject.projectManagerId ||
                  !newProject.startDate ||
                  createProject.isPending
                }
              >
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Close</Button>
            </div>
            <p className="text-xs text-gray-500">* required</p>
          </div>
        )}

        {/* Project list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
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
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }} />
                  </div>
                  {project.budgetAmount && (
                    <p className="text-xs text-gray-500">
                      Budget: ${toNum(project.budgetAmount).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardAdminPage
