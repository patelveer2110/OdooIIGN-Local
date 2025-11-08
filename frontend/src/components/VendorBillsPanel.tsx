"use client"
import { useQuery } from "@tanstack/react-query"
import { vendorBillsApi } from "@/api/vendorBills"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function VendorBillsPanel({ projectId }: { projectId?: string }) {
  const navigate = useNavigate()
  const { data: bills = [] } = useQuery({ queryKey: ["vendor-bills", projectId], queryFn: () => vendorBillsApi.getAll(projectId).then(r => r.data) })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bills.map((b: any) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle className="text-sm">{b.number}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">Vendor: {b.vendorName}</div>
              <div className="text-sm text-gray-600">Total: ${b.totalAmount}</div>
              <div className="mt-2">
                <Button onClick={() => navigate(`/vendor-bill/view/${b.id}`)}>View</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
