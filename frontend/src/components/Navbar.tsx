"use client"

import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Home link */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img
            src="/logo.svg"
            alt="OneFlow Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-bold text-lg text-blue-600">OneFlow</span>
        </div>

        {/* Right side: User info + logout */}
        <div className="flex items-center gap-4">
          {user?.fullName && (
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.fullName}{" "}
              <span className="text-gray-400 text-xs">
                ({String(user.role).replace("_", " ")})
              </span>
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-gray-300"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
