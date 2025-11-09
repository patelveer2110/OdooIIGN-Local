"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { vendorBillsApi } from "@/api/vendorBills"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function VendorBillsPanel({ projectId }: { projectId?: string }) {
  const navigate = useNavigate()

  // 🔎 Fetch vendor bills filtered by project
  const { data: billsResp, isLoading } = useQuery({
    queryKey: ["finance:vendor-bills", projectId],
    queryFn: () => vendorBillsApi.getAll(projectId).then((r) => r.data),
  })

  const bills = Array.isArray(billsResp) ? billsResp : []

  // Optional safeguard — local filter if backend doesn't yet filter by ?projectId=
  const projectBills = useMemo(
    () => (projectId ? bills.filter((b: any) => b.projectId === projectId) : bills),
    [bills, projectId]
  )

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Vendor Bills</h3>

      {isLoading ? (
        <div className="text-sm text-gray-600">Loading vendor bills…</div>
      ) : projectBills.length === 0 ? (
        <div className="text-sm text-gray-600">
          {projectId
            ? "No vendor bills found for this project."
            : "No vendor bills available."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projectBills.map((b: any) => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {b.number || "Untitled Bill"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  Vendor: {b.vendorName || "—"}
                </div>
                <div className="text-sm text-gray-600">
                  Total: ${Number(b.totalAmount ?? 0).toLocaleString()}
                </div>
                {b.status && (
                  <div
                    className={`mt-1 text-xs px-2 py-1 rounded inline-block ${
                      b.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : b.status === "DRAFT"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {b.status}
                  </div>
                )}
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/vendor-bill/view/${b.id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    View Bill
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
