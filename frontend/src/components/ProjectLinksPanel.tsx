"use client"

import { useQuery } from "@tanstack/react-query"
import { financeApi } from "@/api/finance"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Link as LinkIcon, FileText, ShoppingCart, Receipt, DollarSign } from "lucide-react"

export function ProjectLinksPanel({ projectId }: { projectId: string }) {
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", projectId],
    queryFn: async () => {
      try {
        const res = await financeApi.getInvoices(projectId)
        return res.data
      } catch {
        return []
      }
    },
  })

  const { data: salesOrders = [] } = useQuery({
    queryKey: ["sales-orders", projectId],
    queryFn: async () => {
      try {
        const res = await financeApi.getSalesOrders(projectId)
        return res.data
      } catch {
        return []
      }
    },
  })

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchase-orders", projectId],
    queryFn: async () => {
      try {
        const res = await financeApi.getPurchaseOrders(projectId)
        return res.data
      } catch {
        return []
      }
    },
  })

  const { data: vendorBills = [] } = useQuery({
    queryKey: ["vendor-bills", projectId],
    queryFn: async () => {
      try {
        const res = await financeApi.getVendorBills(projectId)
        return res.data
      } catch {
        return []
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Linked Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Invoices</p>
              <p className="text-lg font-bold text-blue-600">{invoices.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Sales Orders</p>
              <p className="text-lg font-bold text-green-600">{salesOrders.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Receipt className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Purchase Orders</p>
              <p className="text-lg font-bold text-purple-600">{purchaseOrders.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600">Vendor Bills</p>
              <p className="text-lg font-bold text-orange-600">{vendorBills.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

