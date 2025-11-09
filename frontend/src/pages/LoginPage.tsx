"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { usersApi } from "@/api/users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import axios from "axios"

const ROLE_OPTIONS = ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER", "FINANCE"] as const
type Role = typeof ROLE_OPTIONS[number]

// use the same API base as your store
const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000"

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isLoading, error } = useAuthStore()

  const [mode, setMode] = useState<"signin" | "signup">("signin")

  // shared fields
  const [email, setEmail] = useState("admin@oneflow.local")
  const [password, setPassword] = useState("admin@123")

  // sign-up only
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<Role>("TEAM_MEMBER")

  const [localError, setLocalError] = useState<string | null>(null)

  async function postAuthRedirectAndCache(me: any) {
    localStorage.setItem("me", JSON.stringify(me))
    const userRoleAfterAuth = String(me.role || "").toUpperCase()
    localStorage.setItem("userRole", userRoleAfterAuth)
    navigate(userRoleAfterAuth === "TEAM_MEMBER" ? "/dashboard-team" : "/dashboard")
  }

  async function handleSignIn() {
    setLocalError(null)
    await signIn(email, password)
    const me = (await usersApi.getMe()).data
    await postAuthRedirectAndCache(me)
  }

  async function handleSignUp() {
    setLocalError(null)
    if (!fullName.trim()) {
      setLocalError("Full name is required")
      return
    }
    if (!ROLE_OPTIONS.includes(role)) {
      setLocalError("Invalid role")
      return
    }

    const res = await axios.post(`${API_URL}/api/v1/auth/sign-up`, {
      email,
      password,
      fullName,
      role, // chosen role from dropdown
    })

    const { accessToken } = res.data || {}
    if (!accessToken) throw new Error("Sign-up did not return a token")

    localStorage.setItem("token", accessToken)

    const me = (await usersApi.getMe()).data
    await postAuthRedirectAndCache(me)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === "signin") await handleSignIn()
      else await handleSignUp()
    } catch (err: any) {
      console.error(err)
      setLocalError(err?.response?.data?.message || err?.message || "Something went wrong")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">OneFlow</CardTitle>
          <CardDescription>Plan • Execute • Bill</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button type="button" variant={mode === "signin" ? "default" : "outline"} onClick={() => setMode("signin")}>
              Sign In
            </Button>
            <Button type="button" variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || localError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{localError || error}</p>
              </div>
            )}

            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? (mode === "signin" ? "Signing in..." : "Creating account...") : (mode === "signin" ? "Sign In" : "Sign Up")}
            </Button>

            <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
              <p className="font-semibold">Test Credentials:</p>
              <p>Admin: admin@oneflow.local / admin@123</p>
              <p>PM: pm@oneflow.local / pm@123</p>
              <p>Finance: finance@oneflow.local / finance@123</p>
              <p>Team: team@oneflow.local / team@123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
 