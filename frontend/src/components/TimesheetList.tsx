"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { timesheetsApi } from "@/api/timesheets"
import { tasksApi } from "@/api/tasks"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Plus, Check, X, Clock, DollarSign, Calendar } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { toast } from "@/hooks/use-toast"
import type { Timesheet } from "@/types"

export function TimesheetList({ projectId }: { projectId: string }) {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: timesheets = [] } = useQuery({
    queryKey: ["timesheets", projectId],
    queryFn: async () => {
      const res = await timesheetsApi.getAll({ project: projectId })
      return res.data
    },
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      try {
        const res = await tasksApi.getByProject(projectId)
        return res.data
      } catch {
        return []
      }
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Timesheet>) => timesheetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets", projectId] })
      setCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Timesheet logged successfully",
      })
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => timesheetsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets", projectId] })
      toast({
        title: "Success",
        description: "Timesheet approved",
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => timesheetsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets", projectId] })
      toast({
        title: "Success",
        description: "Timesheet rejected",
      })
    },
  })

  const canApprove = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER"

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Timesheets</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Log Time
            </Button>
          </DialogTrigger>
          <TimesheetDialog
            projectId={projectId}
            tasks={tasks}
            userHourlyRate={user?.defaultHourlyRate || 50}
            onSubmit={(data) => createMutation.mutate(data)}
            onClose={() => setCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </Dialog>
      </div>

      <div className="space-y-2">
        {timesheets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No timesheets logged yet</p>
            </CardContent>
          </Card>
        ) : (
          timesheets.map((ts) => (
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
                          {ts.durationHours}h @ ${ts.hourlyRate}/h
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(ts.workDate).toLocaleDateString()}</span>
                          {ts.taskId && (
                            <>
                              <span className="mx-1">•</span>
                              <span>Task: {tasks.find((t) => t.id === ts.taskId)?.title || "N/A"}</span>
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
                  <div className="flex flex-col gap-2 items-end">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${ts.amount.toLocaleString()}</p>
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function TimesheetDialog({
  projectId,
  tasks,
  userHourlyRate,
  onSubmit,
  onClose,
  isLoading,
}: {
  projectId: string
  tasks: any[]
  userHourlyRate: number
  onSubmit: (data: Partial<Timesheet>) => void
  onClose: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    workDate: new Date().toISOString().split("T")[0],
    durationHours: "",
    taskId: "",
    hourlyRate: userHourlyRate.toString(),
    billable: true,
    notes: "",
  })

  const calculatedAmount = formData.durationHours
    ? parseFloat(formData.durationHours) * parseFloat(formData.hourlyRate || "0")
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      projectId,
      taskId: formData.taskId || undefined,
      workDate: formData.workDate,
      durationHours: parseFloat(formData.durationHours),
      hourlyRate: parseFloat(formData.hourlyRate),
      billable: formData.billable,
      notes: formData.notes || undefined,
    })
    setFormData({
      workDate: new Date().toISOString().split("T")[0],
      durationHours: "",
      taskId: "",
      hourlyRate: userHourlyRate.toString(),
      billable: true,
      notes: "",
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Log Time</DialogTitle>
        <DialogDescription>Record time spent on this project</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workDate">Date *</Label>
            <Input
              id="workDate"
              type="date"
              value={formData.workDate}
              onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationHours">Duration (hours) *</Label>
            <Input
              id="durationHours"
              type="number"
              step="0.25"
              min="0.25"
              value={formData.durationHours}
              onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taskId">Task (Optional)</Label>
            <Select
              value={formData.taskId}
              onValueChange={(value) => setFormData({ ...formData, taskId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No task</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              required
            />
          </div>
        </div>

        {formData.durationHours && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Amount:</span>
              <span className="text-lg font-bold text-blue-600">${calculatedAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="What did you work on?"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="billable"
            checked={formData.billable}
            onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <Label htmlFor="billable" className="cursor-pointer">
            Mark as billable (can be added to invoice)
          </Label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? "Logging..." : "Log Time"}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
