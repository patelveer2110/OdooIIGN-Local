"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { expensesApi } from "@/api/expenses"
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
import { Plus, Check, X, DollarSign, Calendar, Tag, Receipt } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { toast } from "@/hooks/use-toast"
import type { Expense } from "@/types"

export function ExpenseList({ projectId }: { projectId: string }) {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses", projectId],
    queryFn: async () => {
      const res = await expensesApi.getAll({ project: projectId })
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Expense>) => expensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", projectId] })
      setCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Expense submitted successfully",
      })
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => expensesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", projectId] })
      toast({
        title: "Success",
        description: "Expense approved",
      })
    },
  })

  const reimburseMutation = useMutation({
    mutationFn: (id: string) => expensesApi.reimburse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", projectId] })
      toast({
        title: "Success",
        description: "Expense marked as reimbursed",
      })
    },
  })

  const canApprove = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER"
  const canReimburse = user?.role === "ADMIN" || user?.role === "FINANCE"

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Expenses</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Submit Expense
            </Button>
          </DialogTrigger>
          <ExpenseDialog
            projectId={projectId}
            onSubmit={(data) => createMutation.mutate(data)}
            onClose={() => setCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </Dialog>
      </div>

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No expenses submitted yet</p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">${expense.amount.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Tag className="w-4 h-4" />
                          <span>{expense.category}</span>
                          <span className="mx-1">•</span>
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {expense.notes && (
                      <p className="text-sm text-gray-600 mt-2 ml-13">{expense.notes}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 ml-13">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          expense.billable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {expense.billable ? "Billable" : "Non-billable"}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          expense.approved
                            ? "bg-green-100 text-green-800"
                            : expense.approved === false
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {expense.approved ? "Approved" : expense.approved === false ? "Rejected" : "Pending"}
                      </span>
                      {expense.reimbursed && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Reimbursed</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!expense.approved && canApprove && (
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(expense.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {expense.approved && !expense.reimbursed && canReimburse && (
                      <Button
                        size="sm"
                        onClick={() => reimburseMutation.mutate(expense.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Mark Reimbursed
                      </Button>
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

function ExpenseDialog({
  projectId,
  onSubmit,
  onClose,
  isLoading,
}: {
  projectId: string
  onSubmit: (data: Partial<Expense>) => void
  onClose: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
    category: "",
    billable: false,
    notes: "",
  })

  const categories = [
    "Travel",
    "Meals",
    "Software",
    "Hardware",
    "Office Supplies",
    "Training",
    "Other",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      projectId,
      ...formData,
      amount: parseFloat(formData.amount),
    })
    setFormData({
      amount: "",
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
      category: "",
      billable: false,
      notes: "",
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Submit Expense</DialogTitle>
        <DialogDescription>Add a new expense for this project</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
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
            {isLoading ? "Submitting..." : "Submit Expense"}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

