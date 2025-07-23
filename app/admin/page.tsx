// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, BarChart3, Settings, PenTool, Mail, ArrowRight, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter

export default function AdminDashboard() {
  const router = useRouter(); // Initialize useRouter
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");
  const [stats, setStats] = useState({
    totalModules: 0, // Now initialized to 0, fetched dynamically
    totalStudents: 0,
    activeStudents: 0,
    premiumUsers: 0,
    totalExamQuestions: 0,
    recentActivity: 0,
    // Add more specific stats here if you create API endpoints for them
    freeModules: 0, // Placeholder for future dynamic data
    premiumModules: 0, // Placeholder for future dynamic data
    totalExamSections: 0, // Placeholder for future dynamic data
    totalExamPoints: 0, // Placeholder for future dynamic data
    avgStudentProgress: 0, // Placeholder for future dynamic data
    overallCompletionRate: 0, // Placeholder for future dynamic data
    emailTemplatesCount: 0, // Placeholder for future dynamic data
    emailsSentThisMonth: 0, // Placeholder for future dynamic data
    notificationsStatus: "N/A", // Placeholder for future dynamic data
    freeModuleLimit: 0, // Placeholder for future dynamic data from SystemSettings
    examSettingsStatus: "N/A", // Placeholder for future dynamic data
    backupStatus: "N/A", // Placeholder for future dynamic data
  });
  const [error, setError] = useState<string | null>(null); // State for dashboard data fetch errors

  // Enhanced storage getter with fallback
  const getFromStorage = (key: string): string | null => {
    try {
      const localValue = localStorage.getItem(key);
      if (localValue !== null) {
        return localValue;
      }
      const sessionValue = sessionStorage.getItem(key);
      return sessionValue;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  };

  // Function to clear all local/session storage (useful for logout/debug)
  const clearAllStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log("✅ All storage cleared");
      router.push("/login"); // Redirect to login after clearing
    } catch (error: any) {
      console.error("Error clearing storage:", error);
      alert("Error clearing storage: " + error.message);
    }
  };

  useEffect(() => {
    const checkAdminAccessAndLoadStats = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      let debugMsg = `Storage Check Results:\n`;

      try {
        const isLoggedIn = getFromStorage("isLoggedIn");
        const userStr = getFromStorage("user");

        debugMsg += `isLoggedIn: "${isLoggedIn}"\n`;
        debugMsg += `userStr: ${userStr ? "Found" : "Not found"}\n\n`;

        // Test storage availability (retained for diagnostic info)
        try {
          localStorage.setItem("test", "working");
          const localTest = localStorage.getItem("test");
          localStorage.removeItem("test");
          debugMsg += `LocalStorage: ${localTest === "working" ? "✅ Working" : "❌ Failed"}\n`;
        } catch (storageError: any) {
          debugMsg += `LocalStorage: ❌ Error - ${storageError.message}\n`;
        }

        try {
          sessionStorage.setItem("test", "working");
          const sessionTest = sessionStorage.getItem("test");
          sessionStorage.removeItem("test");
          debugMsg += `SessionStorage: ${sessionTest === "working" ? "✅ Working" : "❌ Failed"}\n\n`;
        } catch (storageError: any) {
          debugMsg += `SessionStorage: ❌ Error - ${storageError.message}\n\n`;
        }

        // --- Admin Access Logic ---
        if (!isLoggedIn || isLoggedIn !== "true" || !userStr) {
          debugMsg += "❌ Authentication failed: Not logged in or no user data.\n";
          setIsAdmin(false);
          setDebugInfo(debugMsg);
          setLoading(false);
          return;
        }

        let user;
        try {
          user = JSON.parse(userStr);
          debugMsg += `✅ User data parsed successfully:\n`;
          debugMsg += `Name: ${user.name}\n`;
          debugMsg += `Email: ${user.email}\n`;
          debugMsg += `IsAdmin (from stored data): ${user.is_admin}\n\n`; // Use user.is_admin (snake_case from backend)
        } catch (parseError: any) {
          debugMsg += `❌ Failed to parse user data: ${parseError.message}\n`;
          setIsAdmin(false);
          setDebugInfo(debugMsg);
          setLoading(false);
          return;
        }

        // Check admin credentials based on database data (stored in `user` object)
        // The email check is an extra layer of security/specificity if you have a known admin email.
        const expectedAdminEmail = "rupakbd2011@gmail.com"; // Your specific admin email
        const emailMatch = user.email === expectedAdminEmail;
        const isAdminFlag = user.is_admin === true; // Check the flag directly from the database

        debugMsg += `Admin Authentication Checks:\n`;
        debugMsg += `Email match: ${emailMatch} (Stored: ${user.email} === Expected: ${expectedAdminEmail})\n`;
        debugMsg += `IsAdmin flag from DB: ${isAdminFlag} (Stored: ${user.is_admin} === true)\n`;
        debugMsg += `Both conditions met: ${emailMatch && isAdminFlag}\n`;

        if (emailMatch && isAdminFlag) {
          debugMsg += "\n✅ Admin access granted!\n";
          setIsAdmin(true);

          // --- Fetch Dynamic Stats from Backend API ---
          try {
            const statsResponse = await fetch("/api/dashboard/stats");
            if (!statsResponse.ok) {
              const errorData = await statsResponse.json();
              throw new Error(errorData.message || "Failed to fetch dashboard statistics.");
            }
            const fetchedStats = await statsResponse.json();

            // Fetch additional specific stats for cards (requires new API endpoints)
            const additionalStats = await fetchAdditionalDashboardStats(); // Call new helper function
            
            setStats({ ...fetchedStats, ...additionalStats }); // Merge fetched stats

          } catch (statsFetchError: any) {
            console.error("Error fetching dashboard stats:", statsFetchError);
            setError(statsFetchError.message || "Failed to load dashboard statistics.");
          }

        } else {
          debugMsg += "\n❌ Admin access denied\n";
          debugMsg += `Required: ${expectedAdminEmail} with is_admin: true\n`;
          debugMsg += `Found: ${user.email} with is_admin: ${user.is_admin}\n`;
          setIsAdmin(false);
        }

      } catch (mainError: any) {
        console.error("Error in admin access check or stats load:", mainError);
        setDebugInfo(`❌ Critical error: ${mainError.message}`);
        setIsAdmin(false); // Ensure admin is false on any critical error
      } finally {
        setDebugInfo(debugMsg);
        setLoading(false);
      }
    };

    // Execute the check and load stats
    checkAdminAccessAndLoadStats();
  }, []); // Empty dependency array means this runs once on mount

  // New helper function to fetch additional dashboard stats
  const fetchAdditionalDashboardStats = async () => {
    let additionalStats = {
      freeModules: 0,
      premiumModules: 0,
      totalExamSections: 0,
      totalExamPoints: 0,
      avgStudentProgress: 0,
      overallCompletionRate: 0,
      emailTemplatesCount: 0,
      emailsSentThisMonth: 0,
      notificationsStatus: "N/A",
      freeModuleLimit: 0,
      examSettingsStatus: "N/A",
      backupStatus: "N/A",
    };

    try {
      // Example: Fetch module counts by premium status (requires new API route)
      const moduleCountsResponse = await fetch("/api/dashboard/module-counts"); // You need to create this API
      if (moduleCountsResponse.ok) {
        const data = await moduleCountsResponse.json();
        additionalStats.freeModules = data.freeModules;
        additionalStats.premiumModules = data.premiumModules;
      }

      // Example: Fetch exam stats (requires new API route)
      const examStatsResponse = await fetch("/api/dashboard/exam-stats"); // You need to create this API
      if (examStatsResponse.ok) {
        const data = await examStatsResponse.json();
        additionalStats.totalExamSections = data.totalSections;
        additionalStats.totalExamPoints = data.totalPoints;
      }

      // Example: Fetch analytics stats (requires new API route)
      const analyticsStatsResponse = await fetch("/api/dashboard/analytics-stats"); // You need to create this API
      if (analyticsStatsResponse.ok) {
        const data = await analyticsStatsResponse.json();
        additionalStats.avgStudentProgress = data.avgStudentProgress;
        additionalStats.overallCompletionRate = data.overallCompletionRate;
      }

      // Example: Fetch communication stats (requires new API route)
      const communicationStatsResponse = await fetch("/api/dashboard/communication-stats"); // You need to create this API
      if (communicationStatsResponse.ok) {
        const data = await communicationStatsResponse.json();
        additionalStats.emailTemplatesCount = data.emailTemplatesCount;
        additionalStats.emailsSentThisMonth = data.emailsSentThisMonth;
        additionalStats.notificationsStatus = data.notificationsStatus;
      }

      // Example: Fetch system settings (requires new API route)
      const systemSettingsResponse = await fetch("/api/dashboard/system-settings"); // You need to create this API
      if (systemSettingsResponse.ok) {
        const data = await systemSettingsResponse.json();
        additionalStats.freeModuleLimit = data.freeModuleLimit;
        additionalStats.examSettingsStatus = data.examSettingsStatus; // e.g., "Configured" or "Not Configured"
        additionalStats.backupStatus = data.backupStatus; // e.g., "Active" or "Inactive"
      }

    } catch (err) {
      console.error("Error fetching additional dashboard stats:", err);
      // Don't set global error here, as main stats might still load.
    }
    return additionalStats;
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access and loading data...</p>
        </div>
      </div>
    );
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
              <Button onClick={() => router.push("/")} variant="outline">
                🏠 Go Home
              </Button>
              <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700">
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
                <p className="text-sm text-blue-700">Password: (your admin password)</p> {/* Do NOT hardcode password in UI */}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Ensure you are logging in with the correct admin credentials.</li>
                  <li>• Try clearing browser storage (using the button below).</li>
                  <li>• Disable browser extensions.</li>
                  <li>• Try incognito/private mode.</li>
                  <li>• Check browser console for errors.</li>
                  <li>• Verify your backend server logs for any API errors.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If isAdmin is true, render the dashboard content
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your learning platform</p>
        </div>
        <Button onClick={clearAllStorage} variant="outline" className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 text-red-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-800">Error Loading Dashboard Data</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

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
                  {stats.freeModules} {/* Now dynamic */}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Premium Modules:</span>
                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                  {stats.premiumModules} {/* Now dynamic */}
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
                  {stats.totalExamSections} {/* Now dynamic */}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Points:</span>
                <Badge variant="outline" className="bg-orange-100 text-orange-700">
                  {stats.totalExamPoints} {/* Now dynamic */}
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
                  {stats.avgStudentProgress}% {/* Now dynamic */}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completion Rate:</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {stats.overallCompletionRate}% {/* Now dynamic */}
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
                <Badge variant="outline">{stats.emailTemplatesCount}</Badge> {/* Now dynamic */}
              </div>
              <div className="flex justify-between text-sm">
                <span>Sent This Month:</span>
                <Badge variant="outline" className="bg-pink-100 text-pink-700">
                  {stats.emailsSentThisMonth} {/* Now dynamic */}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Notifications:</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  {stats.notificationsStatus} {/* Now dynamic */}
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
                <span>Free Module Limit:</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {stats.freeModuleLimit} {/* Now dynamic */}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Exam Settings:</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  {stats.examSettingsStatus} {/* Now dynamic */}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Backup Status:</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {stats.backupStatus} {/* Now dynamic */}
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
  );
}