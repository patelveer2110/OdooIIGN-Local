"use client"

import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function Navbar() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="w-full sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <img 
            src="/logo.png"
            alt="OneFlow Logo"
            className="w-9 h-9 shadow-sm transition transform group-hover:scale-105"
          />
          <span className="font-bold text-lg sm:text-xl text-gray-900 group-hover:text-blue-600 transition">
            OneFlow
          </span>
        </div>

        {/* Right: User info + actions */}
        <div className="flex items-center gap-4">
          {user?.fullName && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
              <span className="text-xs text-gray-500 capitalize">
                {String(user.role || "").replace("_", " ").toLowerCase()}
              </span>
            </div>
          )}

          <Button
            onClick={handleLogout}
            className="border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 transition rounded-lg flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
