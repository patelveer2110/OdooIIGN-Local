import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { tasksApi } from "@/api/tasks"
import { usersApi } from "@/api/users"
import type { Task, User } from "@/types"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"

export function TaskBoard({
  projectId,
  teamMembers,
}: {
  projectId: string
  teamMembers?: User[]
}) {
  const queryClient = useQueryClient()
  const columns: Task["state"][] = ["NEW", "IN_PROGRESS", "BLOCKED", "DONE"]

  // Tasks
  const { data: tasks = [], isFetching } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => (await tasksApi.getByProject(projectId)).data,
  })

  // Current user (for role-based permissions)
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await usersApi.getMe()).data,
  })
  const role = (me?.role ?? "").toUpperCase()
  const canChangeAssignee = role === "ADMIN" || role === "PROJECT_MANAGER"
  const canCreateTask = canChangeAssignee // same rule

  // All users (assignment list)
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await usersApi.getAll()).data,
  })
  const assignableUsers: User[] = (users as User[]) ?? []

  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [dragTaskId, setDragTaskId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    assigneeId: "",
    priority: "MEDIUM",
    estimateHours: 1,         // 👈 default estimate
    state: "NEW",
  })

  // Group by state
  const grouped = useMemo(() => {
    const map: Record<Task["state"], Task[]> = {
      NEW: [],
      IN_PROGRESS: [],
      BLOCKED: [],
      DONE: [],
    }
    for (const t of tasks as Task[]) map[t.state].push(t)
    return map
  }, [tasks])

  // Move between columns
  const moveMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: Task["state"] }) =>
      tasksApi.move(id, state),
    onMutate: async ({ id, state }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] })
      const prev = queryClient.getQueryData<Task[]>(["tasks", projectId]) || []
      queryClient.setQueryData<Task[]>(["tasks", projectId], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, state } : t)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks", projectId], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  })

  // Update task (assignee change etc.)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      tasksApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  })

  // Create task (always NEW) — guard by role
  const createMutation = useMutation({
    mutationFn: (data: Partial<Task>) => {
      if (!canCreateTask) {
        return Promise.reject(new Error("Only Admin/Manager can create tasks"))
      }

      // normalize the payload (ensure estimateHours is a number when provided)
      const estimate =
        data.estimateHours === undefined || data.estimateHours === null || data.estimateHours === ("" as any)
          ? undefined
          : Number(data.estimateHours)

      return tasksApi.create(projectId, { ...data, estimateHours: estimate, state: "NEW" })
    },
    onSuccess: (res) => {
      const created = res.data
      queryClient.setQueryData(["tasks", projectId], (old: any = []) => [created, ...old])
      setShowCreate(false)
      setNewTask({
        title: "",
        description: "",
        assigneeId: "",
        priority: "MEDIUM",
        estimateHours: 1,
        state: "NEW",
      })
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
    },
  })

  // DnD
  function onDragStart(e: React.DragEvent, taskId: string) {
    setDragTaskId(taskId)
    e.dataTransfer.setData("text/plain", taskId)
  }
  function onDrop(_e: React.DragEvent, targetState: Task["state"]) {
    const id = dragTaskId
    setDragTaskId(null)
    if (!id) return
    moveMutation.mutate({ id, state: targetState })
  }

  // Helpers
  const userLabel = (u: Partial<User>) => u.fullName || (u as any).name || u.email || "Unknown"
  const filteredUsers = assignableUsers.filter((u) =>
    userLabel(u).toLowerCase().includes(assigneeFilter.toLowerCase()),
  )

  function handleAssigneeChange(taskId: string, newAssigneeId: string) {
    if (!canChangeAssignee) return
    updateMutation.mutate({
      id: taskId,
      data: { assigneeId: newAssigneeId || undefined },
    })
  }

  return (
    <div className="space-y-3">
      {/* Top bar: New Task visible ONLY for Admin/Manager */}
      <div className="flex items-center justify-end gap-3">
        {canCreateTask && (
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowCreate((s) => !s)}
          >
            {showCreate ? "Cancel" : "+ New Task"}
          </Button>
        )}
      </div>

      {/* Create form visible ONLY for Admin/Manager */}
      {canCreateTask && showCreate && (
        <div className="border rounded bg-white p-3">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              className="border rounded px-2 py-1"
              placeholder="Task Title"
              value={newTask.title || ""}
              onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
            />

            <input
              className="border rounded px-2 py-1 md:col-span-2"
              placeholder="Description"
              value={newTask.description || ""}
              onChange={(e) => setNewTask((t) => ({ ...t, description: e.target.value }))}
            />

            <select
              className="border rounded px-2 py-1"
              value={newTask.priority || "MEDIUM"}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, priority: e.target.value as Task["priority"] }))
              }
            >
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Task["priority"][]).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* 👇 Estimate Hours */}
            <input
              className="border rounded px-2 py-1"
              type="number"
              min={0}
              step={0.5}
              placeholder="Estimate (hrs)"
              value={(newTask.estimateHours as number | string | undefined) ?? ""}
              onChange={(e) =>
                setNewTask((t) => ({
                  ...t,
                  estimateHours: e.target.value === "" ? ("" as any) : Number(e.target.value),
                }))
              }
              title="Estimated effort in hours"
            />

            {/* Assignee picker — enabled only for Admin/Manager */}
            <select
              className={`border rounded px-2 py-1 ${!canChangeAssignee ? "opacity-70 cursor-not-allowed" : ""}`}
              title={canChangeAssignee ? "Select assignee" : "Only Admin/Manager can assign a user"}
              disabled={!canChangeAssignee}
              value={newTask.assigneeId || ""}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, assigneeId: e.target.value || undefined }))
              }
            >
              <option value="" disabled>
                Select assignee
              </option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {userLabel(u)} {(u as any).role ? `(${(u as any).role})` : ""}
                </option>
              ))}
            </select>

            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => createMutation.mutate(newTask)}
              disabled={!newTask.title || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      )}

      {isFetching && <p className="text-xs text-gray-400">Refreshing tasks...</p>}

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div
            key={column}
            className="bg-gray-50 rounded-lg p-4 min-h-[300px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, column)}
          >
            <h3 className="font-semibold mb-4 text-sm text-gray-700">
              {column.replace("_", " ")}
            </h3>
            <div className="space-y-3">
              {grouped[column].map((task) => (
                <Card
                  key={task.id}
                  className="hover:shadow-md cursor-move"
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                >
                  <CardContent className="p-3 space-y-2">
                    <p className="font-medium text-sm">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          task.priority === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : task.priority === "MEDIUM"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Assignee dropdown — disabled for team members */}
                      <select
                        className={`text-xs border rounded px-1 py-0.5 ${!canChangeAssignee ? "opacity-70 cursor-not-allowed" : ""}`}
                        title={
                          canChangeAssignee
                            ? "Change assignee"
                            : "Only Admin/Manager can change assignee"
                        }
                        disabled={!canChangeAssignee}
                        value={task.assigneeId || ""}
                        onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                      >
                        {!task.assigneeId && (
                          <option value="" disabled>
                            Select assignee
                          </option>
                        )}
                        {assignableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {userLabel(u)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
