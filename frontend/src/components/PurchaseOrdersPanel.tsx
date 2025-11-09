"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { purchaseOrdersApi } from "@/api/purchaseOrders"
import { vendorBillsApi } from "@/api/vendorBills"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export function PurchaseOrdersPanel({ projectId }: { projectId?: string }) {
  const qc = useQueryClient()
  const navigate = useNavigate()

  // 🔎 Fetch POs for this project (server filters by ?projectId=)
  const { data: posResp } = useQuery({
    queryKey: ["finance:purchase-orders", projectId],
    queryFn: () => purchaseOrdersApi.getAll(projectId).then((r) => r.data),
  })
  const pos = Array.isArray(posResp) ? posResp : []

  // (Extra guard in case server doesn’t filter)
  const projectPOs = useMemo(
    () => (projectId ? pos.filter((po: any) => po.projectId === projectId) : pos),
    [pos, projectId]
  )

  // 🧾 Create PO (attached to this project)
  const createPoMutation = useMutation({
    mutationFn: (payload: any) => purchaseOrdersApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance:purchase-orders", projectId] }),
  })

  // 📄 Create Vendor Bill from PO
  const createBillMutation = useMutation({
    mutationFn: (poId: string) => vendorBillsApi.createFromPo(poId, {}).then((r) => r.data),
    onSuccess: (bill) => {
      qc.invalidateQueries({ queryKey: ["finance:vendor-bills", projectId] })
      // Navigate if you have a bill view route; adjust as needed:
      if (bill?.id) navigate(`/vendor-bill/view/${bill.id}`)
    },
  })

  // 🧱 Draft form state
  const [draft, setDraft] = useState<{
    vendorName: string
    lines: Array<{ description: string; quantity: number; unitPrice: number }>
  }>({ vendorName: "", lines: [{ description: "", quantity: 1, unitPrice: 0 }] })

  const addLine = () =>
    setDraft((d) => ({
      ...d,
      lines: [...d.lines, { description: "", quantity: 1, unitPrice: 0 }],
    }))

  const updateLine = (
    idx: number,
    key: "description" | "quantity" | "unitPrice",
    value: string | number
  ) =>
    setDraft((d) => {
      const lines = d.lines.slice()
      lines[idx] = { ...lines[idx], [key]: key === "description" ? String(value) : Number(value) }
      return { ...d, lines }
    })

  const totalDraft = draft.lines.reduce(
    (s, l) => s + Number(l.quantity || 0) * Number(l.unitPrice || 0),
    0
  )

  const createPO = () => {
    if (!projectId) return alert("This Purchase Order must be associated with a project.")
    if (!draft.vendorName.trim()) return alert("Vendor name is required.")

    const payload = {
      vendorName: draft.vendorName.trim(),
      projectId, // ✅ backend expects projectId
      lines: draft.lines.map((l) => ({
        description: l.description,
        quantity: Number(l.quantity || 0),
        unitPrice: Number(l.unitPrice || 0),
      })),
    }
    createPoMutation.mutate(payload)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Purchase Orders</h3>

      {/* Existing POs (filtered by project) */}
      <div>
        <h4 className="font-medium mb-2">Existing Purchase Orders</h4>
        {projectPOs.length === 0 ? (
          <div className="text-sm text-gray-600">
            {projectId ? "No purchase orders for this project yet." : "No purchase orders."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectPOs.map((po: any) => (
              <Card key={po.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{po.number}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">Vendor: {po.vendorName}</div>
                  <div className="text-sm text-gray-600">
                    Total: ${Number(po.totalAmount ?? 0).toLocaleString()}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      onClick={() => createBillMutation.mutate(po.id)}
                      disabled={createBillMutation.isPending}
                    >
                      {createBillMutation.isPending ? "Creating…" : "Create Bill"}
                    </Button>
                    {/* If you have a PO detail route, adjust this link */}
                    <Button variant="secondary" onClick={() => navigate(`/purchase-order/${po.id}`)}>
                      View PO
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create PO */}
      <div className="p-4 border rounded">
        <h4 className="font-semibold">Create Purchase Order</h4>
        {!projectId && (
          <div className="text-xs text-red-600 mt-1">
            A projectId is required to create purchase orders here.
          </div>
        )}
        <div className="space-y-2 mt-2">
          <input
            className="border p-2 w-full"
            placeholder="Vendor name"
            value={draft.vendorName}
            onChange={(e) => setDraft({ ...draft, vendorName: e.target.value })}
          />

          {draft.lines.map((ln, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <input
                className="border p-2"
                placeholder="Description"
                value={ln.description}
                onChange={(e) => updateLine(idx, "description", e.target.value)}
              />
              <input
                className="border p-2"
                placeholder="Qty"
                type="number"
                value={ln.quantity}
                onChange={(e) => updateLine(idx, "quantity", e.target.value)}
              />
              <input
                className="border p-2"
                placeholder="Unit Price"
                type="number"
                value={ln.unitPrice}
                onChange={(e) => updateLine(idx, "unitPrice", e.target.value)}
              />
            </div>
          ))}

          <div className="flex justify-between items-center mt-2">
            <Button type="button" onClick={addLine} variant="secondary">
              Add line
            </Button>
            <div className="font-semibold">Draft Total: ${totalDraft.toFixed(2)}</div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={createPO}
              className="bg-blue-600 text-white"
              disabled={createPoMutation.isPending || !projectId}
            >
              {createPoMutation.isPending ? "Creating…" : "Create PO"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
