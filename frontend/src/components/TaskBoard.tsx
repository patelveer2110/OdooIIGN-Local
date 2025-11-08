"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksApi } from "@/api/tasks"
import { usersApi } from "@/api/users"
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
import { Plus, Clock, User, AlertCircle, MessageSquare } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { toast } from "@/hooks/use-toast"
import type { Task } from "@/types"

const columns: Array<{ id: Task["state"]; label: string }> = [
  { id: "NEW", label: "New" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "BLOCKED", label: "Blocked" },
  { id: "DONE", label: "Done" },
]

const priorities: Array<Task["priority"]> = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

export function TaskBoard({ projectId }: { projectId: string }) {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const res = await tasksApi.getByProject(projectId)
      return res.data
    },
  })

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const res = await usersApi.getAll()
        return res.data
      } catch {
        return []
      }
    },
  })

  const moveMutation = useMutation({
    mutationFn: ({ taskId, state }: { taskId: string; state: Task["state"] }) =>
      tasksApi.move(taskId, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      toast({
        title: "Success",
        description: "Task moved successfully",
      })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Task>) => tasksApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      setCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Task created successfully",
      })
    },
  })

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetState: Task["state"]) => {
    if (draggedTask) {
      moveMutation.mutate({ taskId: draggedTask, state: targetState })
      setDraggedTask(null)
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading tasks...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Task Board</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <TaskDialog
            projectId={projectId}
            users={users}
            onSubmit={(data) => createMutation.mutate(data)}
            onClose={() => setCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.state === column.id)
          return (
            <div
              key={column.id}
              className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm text-gray-700">{column.label}</h3>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="cursor-move hover:shadow-md transition-all bg-white"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-3">
                      <p className="font-medium text-sm text-gray-900 mb-2">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span
                          className={`text-xs px-2 py-1 rounded border font-medium ${getPriorityColor(
                            task.priority,
                          )}`}
                        >
                          {task.priority}
                        </span>
                        {task.estimateHours && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimateHours}h
                          </span>
                        )}
                        {task.assignee && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.assignee.fullName.split(" ")[0]}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-gray-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">Drop tasks here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onUpdate={(data) => {
            // Update task logic
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}

function TaskDialog({
  projectId,
  users,
  onSubmit,
  onClose,
  isLoading,
}: {
  projectId: string
  users: any[]
  onSubmit: (data: Partial<Task>) => void
  onClose: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as Task["priority"],
    assigneeId: "",
    estimateHours: "",
    dueDate: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      estimateHours: formData.estimateHours ? parseFloat(formData.estimateHours) : undefined,
      dueDate: formData.dueDate || undefined,
      assigneeId: formData.assigneeId || undefined,
    })
    setFormData({
      title: "",
      description: "",
      priority: "MEDIUM",
      assigneeId: "",
      estimateHours: "",
      dueDate: "",
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogDescription>Add a new task to this project</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as Task["priority"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigneeId">Assignee</Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimateHours">Estimate (hours)</Label>
            <Input
              id="estimateHours"
              type="number"
              value={formData.estimateHours}
              onChange={(e) => setFormData({ ...formData, estimateHours: e.target.value })}
              min="0"
              step="0.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

function TaskDetailDialog({
  task,
  users,
  onClose,
  onUpdate,
}: {
  task: Task
  users: any[]
  onClose: () => void
  onUpdate: (data: Partial<Task>) => void
}) {
  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {task.description && <p className="text-gray-600">{task.description}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <p className="text-sm font-medium">{task.priority}</p>
            </div>
            <div>
              <Label>Status</Label>
              <p className="text-sm font-medium">{task.state}</p>
            </div>
            {task.assignee && (
              <div>
                <Label>Assignee</Label>
                <p className="text-sm font-medium">{task.assignee.fullName}</p>
              </div>
            )}
            {task.estimateHours && (
              <div>
                <Label>Estimate</Label>
                <p className="text-sm font-medium">{task.estimateHours} hours</p>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
