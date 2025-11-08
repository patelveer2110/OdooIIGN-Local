import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "../api/projects"
import { timesheetsApi } from "../api/timesheets"
import { expensesApi } from "../api/expenses"
import { useAuthStore } from "../store/auth"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

export function DashboardTeamPage() {
  const user = useAuthStore((s: any) => s.user)
  const { data: _projects = [] } = useQuery({ queryKey: ["projects"], queryFn: async () => (await projectsApi.getAll()).data })
  const { data: timesheets = [] } = useQuery({ queryKey: ["timesheets", user?.id], queryFn: async () => (await timesheetsApi.getAll({ user: user?.id || "" })).data, enabled: !!user?.id })
  const { data: expenses = [] } = useQuery({ queryKey: ["expenses", user?.id], queryFn: async () => (await expensesApi.getAll({ user: user?.id || "" as any })).data, enabled: !!user?.id })

  const todayHours = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return timesheets.filter((t: any) => t.workDate?.startsWith(today)).reduce((s: number, t: any) => s + (t.durationHours || 0), 0)
  }, [timesheets])

  const myTasksCount = 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Work</h1>
        <p className="text-gray-600">Welcome back{user?.fullName ? `, ${user.fullName}` : ""}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm">My Tasks</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{myTasksCount}</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Hours Logged Today</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{todayHours}</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Billable Hours</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">--</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Expenses Submitted</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{expenses.length}</p></CardContent></Card>
      </div>
    </div>
  )
}
export default DashboardTeamPage
