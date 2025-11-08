"use client"

import type React from "react"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuthStore } from "./store/auth"
import { Layout } from "./components/Layout"
import { LoginPage } from "./pages/LoginPage"
import DashboardAdminPage from "./pages/DashboardAdminPage"
import DashboardManagerPage from "./pages/DashboardManagerPage"
import DashboardTeamPage from "./pages/DashboardTeamPage"
import { ProjectPage } from "./pages/ProjectPage"
import { TimesheetsPage } from "./pages/TimesheetsPage"
import { FinancePage } from "./pages/FinancePage"
import InvoiceFromSoPage from "./pages/InvoiceFromSoPage"
import InvoiceViewPage from "./pages/InvoiceViewPage"
import VendorBillFromPoPage from "./pages/VendorBillFromPoPage"
import VendorBillViewPage from "./pages/VendorBillViewPage"
import { ExpensesPage } from "./pages/ExpensesPage"
import { AnalyticsPage } from "./pages/AnalyticsPage"
import { ProfilePage } from "./pages/ProfilePage"
import TasksPage from "./pages/TasksPage"
import SettingsPage from "./pages/SettingsPage"
import SignupPage from "./pages/SignupPage"
import Hero from "./Hero"
import { DashboardPage } from "./pages/DashboardPage"

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />
}

// RoleRedirect removed: unified dashboard is used for all roles.

export function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-admin"
            element={
              <ProtectedRoute>
                <DashboardAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-manager"
            element={
              <ProtectedRoute>
                <DashboardManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-team"
            element={
              <ProtectedRoute>
                <DashboardTeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timesheets"
            element={
              <ProtectedRoute>
                <TimesheetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <FinancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice/:soId"
            element={
              <ProtectedRoute>
                <InvoiceFromSoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice/view/:invoiceId"
            element={
              <ProtectedRoute>
                <InvoiceViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor-bill/:poId"
            element={
              <ProtectedRoute>
                <VendorBillFromPoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor-bill/view/:invoiceId"
            element={
              <ProtectedRoute>
                <VendorBillViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Hero />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
