"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { financeApi } from "@/api/finance"
import { projectsApi } from "@/api/projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, FileText, ShoppingCart, Receipt, DollarSign } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { Link } from "react-router-dom"

export function FinancePage() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState("invoices")

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      try {
        const res = await financeApi.getInvoices()
        return res.data
      } catch {
        return []
      }
    },
  })

  const { data: salesOrders = [] } = useQuery({
    queryKey: ["sales-orders"],
    queryFn: async () => {
      try {
        const res = await financeApi.getSalesOrders()
        return res.data
      } catch {
        return []
      }
    },
  })

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      try {
        const res = await financeApi.getPurchaseOrders()
        return res.data
      } catch {
        return []
      }
    },
  })

  const { data: vendorBills = [] } = useQuery({
    queryKey: ["vendor-bills"],
    queryFn: async () => {
      try {
        const res = await financeApi.getVendorBills()
        return res.data
      } catch {
        return []
      }
    },
  })

  const canCreate = user?.role === "ADMIN" || user?.role === "FINANCE" || user?.role === "PROJECT_MANAGER"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600 mt-1">Manage invoices, orders, and bills</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="sales-orders" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Sales Orders ({salesOrders.length})
          </TabsTrigger>
          <TabsTrigger value="purchase-orders" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Purchase Orders ({purchaseOrders.length})
          </TabsTrigger>
          <TabsTrigger value="vendor-bills" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Vendor Bills ({vendorBills.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-end">
            {canCreate && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {invoices.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No invoices found</p>
                </CardContent>
              </Card>
            ) : (
              invoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">{invoice.number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${invoice.totalAmount.toLocaleString()}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            invoice.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "POSTED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sales-orders" className="space-y-4">
          <div className="space-y-2">
            {salesOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No sales orders found</p>
                </CardContent>
              </Card>
            ) : (
              salesOrders.map((so) => (
                <Card key={so.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">{so.number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(so.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${so.totalAmount.toLocaleString()}</p>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">{so.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4">
          <div className="space-y-2">
            {purchaseOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No purchase orders found</p>
                </CardContent>
              </Card>
            ) : (
              purchaseOrders.map((po) => (
                <Card key={po.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">{po.number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(po.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${po.totalAmount.toLocaleString()}</p>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">{po.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="vendor-bills" className="space-y-4">
          <div className="space-y-2">
            {vendorBills.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No vendor bills found</p>
                </CardContent>
              </Card>
            ) : (
              vendorBills.map((vb) => (
                <Card key={vb.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">{vb.number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(vb.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${vb.totalAmount.toLocaleString()}</p>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">{vb.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

