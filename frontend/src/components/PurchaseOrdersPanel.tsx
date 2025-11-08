"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { purchaseOrdersApi } from "@/api/purchaseOrders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export function PurchaseOrdersPanel({ projectId }: { projectId?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: pos = [] } = useQuery({ queryKey: ["purchase-orders", projectId], queryFn: () => purchaseOrdersApi.getAll(projectId).then(r => r.data) })

  const createMutation = useMutation({ mutationFn: (payload: any) => purchaseOrdersApi.create(payload), onSuccess: () => queryClient.invalidateQueries(["purchase-orders"] as any) })

  const [draft, setDraft] = useState({ vendorName: "", lines: [{ description: "", quantity: 1, unitPrice: 0 }] })

  const addLine = () => setDraft((d: any) => ({ ...d, lines: [...d.lines, { description: "", quantity: 1, unitPrice: 0 }] }))

  const createPO = () => {
    const payload = { ...draft, projectId }
    createMutation.mutate(payload)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pos.map((po: any) => (
          <Card key={po.id}>
            <CardHeader>
              <CardTitle className="text-sm">{po.number}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">Vendor: {po.vendorName}</div>
              <div className="text-sm text-gray-600">Total: ${po.totalAmount}</div>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => navigate(`/vendor-bill/${po.id}`)}>Create Bill</Button>
                <Button onClick={() => navigate(`/vendor-bill/view/${po.id}`)}>View Bill</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 border rounded">
        <h4 className="font-semibold">Create Purchase Order</h4>
        <div className="space-y-2 mt-2">
          <input className="border p-2" placeholder="Vendor name" value={draft.vendorName} onChange={(e) => setDraft({ ...draft, vendorName: e.target.value })} />

          {draft.lines.map((ln: any, idx: number) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <input className="border p-2" placeholder="Description" value={ln.description} onChange={(e) => setDraft((d: any) => { const copy = { ...d }; copy.lines[idx].description = e.target.value; return copy })} />
              <input className="border p-2" placeholder="Qty" type="number" value={ln.quantity} onChange={(e) => setDraft((d: any) => { const copy = { ...d }; copy.lines[idx].quantity = Number(e.target.value); return copy })} />
              <input className="border p-2" placeholder="Unit Price" type="number" value={ln.unitPrice} onChange={(e) => setDraft((d: any) => { const copy = { ...d }; copy.lines[idx].unitPrice = Number(e.target.value); return copy })} />
            </div>
          ))}

          <div className="flex gap-2">
            <Button onClick={addLine}>Add line</Button>
            <Button onClick={createPO} className="bg-blue-600 text-white">Create PO</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
