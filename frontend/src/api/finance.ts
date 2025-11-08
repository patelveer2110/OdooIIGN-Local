import client from "./client"
import type { CustomerInvoice } from "@/types"

export interface SalesOrder {
  id: string
  number: string
  partnerId: string
  projectId?: string
  status: string
  totalAmount: number
  currency: string
  createdAt: string
}

export interface PurchaseOrder {
  id: string
  number: string
  vendorId: string
  projectId?: string
  status: string
  totalAmount: number
  currency: string
  createdAt: string
}

export interface VendorBill {
  id: string
  number: string
  vendorId: string
  projectId?: string
  sourcePoId?: string
  status: string
  totalAmount: number
  currency: string
  createdAt: string
}

export const financeApi = {
  // Sales Orders
  getSalesOrders: (projectId?: string) =>
    client.get<SalesOrder[]>("/api/v1/finance/sales-orders", {
      params: projectId ? { project: projectId } : {},
    }),
  createSalesOrder: (data: Partial<SalesOrder>) =>
    client.post<SalesOrder>("/api/v1/finance/sales-orders", data),

  // Purchase Orders
  getPurchaseOrders: (projectId?: string) =>
    client.get<PurchaseOrder[]>("/api/v1/finance/purchase-orders", {
      params: projectId ? { project: projectId } : {},
    }),
  createPurchaseOrder: (data: Partial<PurchaseOrder>) =>
    client.post<PurchaseOrder>("/api/v1/finance/purchase-orders", data),

  // Customer Invoices
  getInvoices: (projectId?: string) =>
    client.get<CustomerInvoice[]>("/api/v1/finance/invoices", {
      params: projectId ? { project: projectId } : {},
    }),
  getInvoiceById: (id: string) => client.get<CustomerInvoice>(`/api/v1/finance/invoices/${id}`),
  createInvoiceFromTimesheets: (projectId: string, timesheetIds: string[]) =>
    client.post("/api/v1/finance/invoices/from-timesheets", {
      project_id: projectId,
      timesheet_ids: timesheetIds,
    }),
  createInvoiceFromExpenses: (expenseIds: string[]) =>
    client.post("/api/v1/finance/invoices/from-expenses", { expense_ids: expenseIds }),

  // Vendor Bills
  getVendorBills: (projectId?: string) =>
    client.get<VendorBill[]>("/api/v1/finance/vendor-bills", {
      params: projectId ? { project: projectId } : {},
    }),
  createVendorBill: (data: Partial<VendorBill>) =>
    client.post<VendorBill>("/api/v1/finance/vendor-bills", data),
}

