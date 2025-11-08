"use client"

import type React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { Button } from "./ui/button"
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  Users,
  Settings,
  BarChart3,
  Receipt,
  ShoppingCart,
  FileInvoice,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Timesheets", href: "/timesheets", icon: Clock },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const canAccess = (href: string) => {
    if (!user) return false
    // Role-based access control
    if (href === "/users" && !["ADMIN"].includes(user.role)) return false
    if (href === "/finance" && !["ADMIN", "FINANCE", "PROJECT_MANAGER"].includes(user.role)) return false
    if (href === "/analytics" && !["ADMIN", "PROJECT_MANAGER", "FINANCE"].includes(user.role)) return false
    return true
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OF</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                OneFlow
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase().replace("_", " ")}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
              <SidebarContent location={location} canAccess={canAccess} onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        {sidebarOpen && (
          <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
            <SidebarContent location={location} canAccess={canAccess} />
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({
  location,
  canAccess,
  onNavigate,
}: {
  location: ReturnType<typeof useLocation>
  canAccess: (href: string) => boolean
  onNavigate?: () => void
}) {
  return (
    <nav className="p-4 space-y-1">
      {navigation
        .filter((item) => canAccess(item.href))
        .map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
    </nav>
  )
}
