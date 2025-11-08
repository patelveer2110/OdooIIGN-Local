"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, User, Bell, Shield } from "lucide-react"
import { useAuthStore } from "@/store/auth"

export function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    timezone: user?.timezone || "UTC",
    defaultHourlyRate: user?.defaultHourlyRate || 50,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Update user profile
    alert("Profile updated successfully!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultHourlyRate">Default Hourly Rate ($)</Label>
                <Input
                  id="defaultHourlyRate"
                  type="number"
                  step="0.01"
                  value={formData.defaultHourlyRate}
                  onChange={(e) => setFormData({ ...formData, defaultHourlyRate: parseFloat(e.target.value) })}
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500">Role</Label>
              <p className="font-semibold capitalize">{user?.role?.toLowerCase().replace("_", " ")}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">User ID</Label>
              <p className="font-mono text-sm text-gray-600">{user?.id}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Member Since</Label>
              <p className="text-sm text-gray-600">Recently</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

