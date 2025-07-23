"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, BarChart3, Settings, PenTool, Mail, ArrowRight, Activity, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState("")
  const [stats, setStats] = useState({
    totalModules: 40,
    totalStudents: 4,
    activeStudents: 3,
    premiumUsers: 2,
    totalExamQuestions: 25,
    recentActivity: 8,
  })

  // Enhanced storage getter with fallback
  const getFromStorage = (key: string): string | null => {
    try {
      // Try localStorage first
      const localValue = localStorage.getItem(key)
      if (localValue !== null) {
        return localValue
      }

      // Fallback to sessionStorage
      const sessionValue = sessionStorage.getItem(key)
      return sessionValue
    } catch (error) {
      console.error(`Error getting ${key}:`, error)
      return null
    }
  }

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        console.log("=== ADMIN ACCESS CHECK ===")

        const isLoggedIn = getFromStorage("isLoggedIn")
        const userStr = getFromStorage("user")

        console.log("Raw isLoggedIn:", isLoggedIn)
        console.log("Raw userStr:", userStr)

        let debugMsg = `Storage Check Results:\n`
        debugMsg += `isLoggedIn: "${isLoggedIn}"\n`
        debugMsg += `userStr: ${userStr ? "Found" : "Not found"}\n\n`

        // Test storage availability
        try {
          localStorage.setItem("test", "working")
          const localTest = localStorage.getItem("test")
          localStorage.removeItem("test")
          debugMsg += `LocalStorage: ${localTest === "working" ? "✅ Working" : "❌ Failed"}\n`
        } catch (error) {
          debugMsg += `LocalStorage: ❌ Error - ${error}\n`
        }

        try {
          sessionStorage.setItem("test", "working")
          const sessionTest = sessionStorage.getItem("test")
          sessionStorage.removeItem("test")
          debugMsg += `SessionStorage: ${sessionTest === "working" ? "✅ Working" : "❌ Failed"}\n\n`
        } catch (error) {
          debugMsg += `SessionStorage: ❌ Error - ${error}\n\n`
        }

        if (!isLoggedIn || isLoggedIn !== "true") {
          debugMsg += "❌ Authentication failed: Not logged in\n"
          debugMsg += "Possible causes:\n"
          debugMsg += "- Browser storage is disabled\n"
          debugMsg += "- Incognito mode with strict settings\n"
          debugMsg += "- Login process failed to save data\n"
          setDebugInfo(debugMsg)
          setLoading(false)
          return
        }

        if (!userStr) {
          debugMsg += "❌ Authentication failed: No user data found\n"
          debugMsg += "Possible causes:\n"
          debugMsg += "- Storage was cleared after login\n"
          debugMsg += "- Login process failed to save user data\n"
          setDebugInfo(debugMsg)
          setLoading(false)
          return
        }

        let user
        try {
          user = JSON.parse(userStr)
          debugMsg += `✅ User data parsed successfully:\n`
          debugMsg += `Name: ${user.name}\n`
          debugMsg += `Email: ${user.email}\n`
          debugMsg += `IsAdmin: ${user.isAdmin}\n\n`
        } catch (parseError) {
          debugMsg += `❌ Failed to parse user data: ${parseError}\n`
          setDebugInfo(debugMsg)
          setLoading(false)
          return
        }

        // Check admin credentials
        const emailMatch = user.email === "rupakbd2011@gmail.com"
        const isAdminFlag = user.isAdmin === true

        debugMsg += `Admin Authentication Checks:\n`
        debugMsg += `Email match: ${emailMatch} (${user.email} === rupakbd2011@gmail.com)\n`
        debugMsg += `IsAdmin flag: ${isAdminFlag} (${user.isAdmin} === true)\n`
        debugMsg += `Both conditions met: ${emailMatch && isAdminFlag}\n`

        console.log("Email match:", emailMatch)
        console.log("IsAdmin flag:", isAdminFlag)
        console.log("Both conditions:", emailMatch && isAdminFlag)

        if (emailMatch && isAdminFlag) {
          debugMsg += "\n✅ Admin access granted!\n"
          setIsAdmin(true)

          // Load saved data for stats
          try {
            const savedModules = getFromStorage("adminModules")
            const savedStudents = getFromStorage("adminStudents")

            if (savedModules) {
              const modules = JSON.parse(savedModules)
              setStats((prev) => ({ ...prev, totalModules: modules.length }))
            }

            if (savedStudents) {
              const students = JSON.parse(savedStudents)
              setStats((prev) => ({
                ...prev,
                totalStudents: students.length,
                activeStudents: students.filter((s: any) => s.status === "Active").length,
                premiumUsers: students.filter((s: any) => s.subscription === "Premium").length,
              }))
            }
          } catch (error) {
            console.error("Error loading admin data:", error)
          }
        } else {
          debugMsg += "\n❌ Admin access denied\n"
          debugMsg += "Required: rupakbd2011@gmail.com with isAdmin: true\n"
          debugMsg += `Found: ${user.email} with isAdmin: ${user.isAdmin}\n`
        }

        setDebugInfo(debugMsg)
        setLoading(false)
      } catch (error) {
        console.error("Error in admin access check:", error)
        setDebugInfo(`❌ Critical error checking admin access: ${error}`)
        setLoading(false)
      }
    }

    // Add a small delay to ensure storage is ready
    setTimeout(checkAdminAccess, 100)
  }, [])

  const clearAllStorage = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      console.log("✅ All storage cleared")
      window.location.href = "/login"
    } catch (error) {
      console.error("Error clearing storage:", error)
      alert("Error clearing storage: " + error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h2>
              <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
            </div>

            {/* Debug Information */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left text-xs max-h-64 overflow-y-auto">
              <strong>Diagnostic Information:</strong>
              <pre className="whitespace-pre-wrap mt-2 font-mono">{debugInfo}</pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <Button onClick={() => (window.location.href = "/")} variant="outline">
                🏠 Go Home
              </Button>
              <Button onClick={() => (window.location.href = "/login")} className="bg-blue-600 hover:bg-blue-700">
                🔑 Login as Admin
              </Button>
              <Button
                onClick={clearAllStorage}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
              >
                🗑️ Clear & Retry
              </Button>
            </div>

            {/* Troubleshooting Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Admin Credentials</h3>
                <p className="text-sm text-blue-700 mb-1">Email: rupakbd2011@gmail.com</p>
                <p className="text-sm text-blue-700">Password: 12356</p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Try clearing browser storage</li>
                  <li>• Disable browser extensions</li>
                  <li>• Try incognito/private mode</li>
                  <li>• Check browser console for errors</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Control Center
              </h1>
              <p className="text-gray-600 mt-2">Manage Estonian Learning Platform - Complete Control Dashboard</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/communication">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Communication
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    localStorage.removeItem("user")
                    localStorage.removeItem("isLoggedIn")
                    sessionStorage.removeItem("user")
                    sessionStorage.removeItem("isLoggedIn")
                  } catch (e) {
                    console.log("Note: Could not clear storage")
                  }
                  window.location.href = "/"
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Modules</p>
                  <p className="text-3xl font-bold">{stats.totalModules}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Students</p>
                  <p className="text-3xl font-bold">{stats.activeStudents}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Premium Users</p>
                  <p className="text-3xl font-bold">{stats.premiumUsers}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module Management */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Module Management</CardTitle>
                  <CardDescription>Create, edit, and manage learning modules</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Modules:</span>
                  <Badge variant="outline">{stats.totalModules}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Free Modules:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    3
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Premium Modules:</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">
                    {stats.totalModules - 3}
                  </Badge>
                </div>
                <Link href="/admin/modules" className="block">
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Manage Modules
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Student Management */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Student Management</CardTitle>
                  <CardDescription>Manage student accounts and progress</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Students:</span>
                  <Badge variant="outline">{stats.totalStudents}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Students:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    {stats.activeStudents}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Premium Users:</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">
                    {stats.premiumUsers}
                  </Badge>
                </div>
                <Link href="/admin/students" className="block">
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                    Manage Students
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Exam Management */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PenTool className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Exam Management</CardTitle>
                  <CardDescription>Create and manage final exam questions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Questions:</span>
                  <Badge variant="outline">{stats.totalExamQuestions}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sections:</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">
                    8
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Points:</span>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700">
                    115
                  </Badge>
                </div>
                <Link href="/admin/exam" className="block">
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                    Manage Exam
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Analytics & Reports</CardTitle>
                  <CardDescription>View detailed analytics and reports</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Avg Progress:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">
                    68%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completion Rate:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    25%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recent Activity:</span>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700">
                    {stats.recentActivity}
                  </Badge>
                </div>
                <Link href="/admin/analytics" className="block">
                  <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                    View Analytics
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-pink-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Mail className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Communication</CardTitle>
                  <CardDescription>Send emails and manage notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Email Templates:</span>
                  <Badge variant="outline">5</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sent This Month:</span>
                  <Badge variant="outline" className="bg-pink-100 text-pink-700">
                    12
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Notifications:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">
                    Active
                  </Badge>
                </div>
                <Link href="/admin/communication" className="block">
                  <Button className="w-full mt-4 bg-pink-600 hover:bg-pink-700">
                    Communication Hub
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">System Settings</CardTitle>
                  <CardDescription>Configure platform settings and preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Free Modules:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    3
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Exam Settings:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">
                    Configured
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Backup Status:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                </div>
                <Link href="/admin/settings" className="block">
                  <Button className="w-full mt-4 bg-gray-600 hover:bg-gray-700">
                    System Settings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/modules/create">
                <Button variant="outline" className="w-full bg-transparent">
                  <BookOpen className="w-4 h-4 mr-2" />
                  New Module
                </Button>
              </Link>
              <Link href="/admin/students/new">
                <Button variant="outline" className="w-full bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </Link>
              <Link href="/admin/exam/new">
                <Button variant="outline" className="w-full bg-transparent">
                  <PenTool className="w-4 h-4 mr-2" />
                  New Question
                </Button>
              </Link>
              <Link href="/admin/communication/compose">
                <Button variant="outline" className="w-full bg-transparent">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
