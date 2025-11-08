"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { salesOrdersApi } from "@/api/salesOrders"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "./ui/card"

export function SalesOrderPanel({ projectId }: { projectId?: string }) {
  const qc = useQueryClient()
  const { data: salesOrders = [] } = useQuery({ queryKey: ["sales-orders", projectId], queryFn: () => salesOrdersApi.getAll(projectId).then(r => r.data) })

  const createMutation = useMutation({
    mutationFn: (payload: any) => salesOrdersApi.create(payload).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries(["sales-orders", projectId] as any),
  })

  const navigate = useNavigate()

  const createInvoiceMutation = useMutation({
    mutationFn: (soId: string) => salesOrdersApi.createInvoice(soId).then((r: any) => r.data),
    onSuccess: (data: any) => {
      // backend returns { invoice, invoiceLines }
      const invoiceId = data?.invoice?.id
      if (invoiceId) navigate(`/invoice/view/${invoiceId}`)
    },
  })

  // Form state
  const [customerName, setCustomerName] = useState("")
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<Array<any>>([{ productName: "", quantity: 1, unitPrice: 0 }])

  const addLine = () => setLines(prev => [...prev, { productName: "", quantity: 1, unitPrice: 0 }])
  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx))
  const updateLine = (idx: number, key: string, value: any) => setLines(prev => prev.map((l, i) => i === idx ? { ...l, [key]: value } : l))

  const total = lines.reduce((s, l) => s + (Number(l.quantity || 0) * Number(l.unitPrice || 0)), 0)

  const submit = async () => {
    if (!customerName) return alert('Customer name is required')
    const payload = { customerName, notes, date: new Date().toISOString(), lines, projectId }
    createMutation.mutate(payload)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Sales Orders</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Create Sales Order</h4>
          <Card>
            <CardContent className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Customer Name</label>
                <input value={customerName} onChange={(e: any) => setCustomerName(e.target.value)} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Notes</label>
                <input value={notes} onChange={(e: any) => setNotes(e.target.value)} className="w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium">Line Items</label>
                <div className="space-y-2">
                  {lines.map((l, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input placeholder="Product name" value={l.productName} onChange={(e: any) => updateLine(idx, 'productName', e.target.value)} className="border p-2 rounded flex-1" />
                      <input type="number" className="w-20 border p-2 rounded" value={l.quantity} onChange={(e: any) => updateLine(idx, 'quantity', Number(e.target.value))} />
                      <input type="number" className="w-32 border p-2 rounded" value={l.unitPrice} onChange={(e: any) => updateLine(idx, 'unitPrice', Number(e.target.value))} />
                      <div className="flex items-center">
                        <Button onClick={() => removeLine(idx)} className="text-sm">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Button onClick={addLine}>Add Line</Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Total:</div>
                <div className="text-lg font-bold">${total}</div>
              </div>

              <Button onClick={submit} disabled={createMutation.isPending}>Create SO</Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <h4 className="font-medium">Existing Sales Orders</h4>
          <div className="space-y-2">
            {salesOrders.map((so: any) => (
              <Card key={so.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{so.number}</div>
                      <div className="text-sm text-gray-600">{so.customerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${so.totalAmount}</div>
                      <div className="text-sm text-gray-600">{new Date(so.createdAt).toLocaleDateString?.()}</div>
                      <div className="mt-2 flex flex-col gap-2">
                        <Button onClick={() => createInvoiceMutation.mutate(so.id)} disabled={createInvoiceMutation.isPending} className="text-sm">{createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}</Button>
                        <Button onClick={() => navigate(`/invoice/${so.id}`)} className="text-sm">Edit & Create Invoice</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
