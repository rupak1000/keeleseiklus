"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Trophy,
  Clock,
  Target,
  Download,
  Calendar,
  ArrowLeft,
  Activity,
  Award,
  Brain,
  Globe,
  XCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Interfaces to match Prisma models and API responses
interface Student {
  id: number
  name: string
  email: string
  enrollmentDate: string
  lastActive: string
  progress: number
  completedModules: number
  currentLevel: string
  totalTimeSpent: string
  streak: number
  achievements: string[]
  subscription: string
  status: string
  preferredLanguage?: string
  country?: string
  subscriptionStatus?: string
}

interface ExamResult {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  score: number
  totalQuestions: number
  points: number
  maxPoints: number
  percentage: number
  completedAt: string
  passed: boolean
  timeSpent: number
  attemptNumber: number
  sectionScores: Record<string, number>
}

interface ModuleAnalytics {
  moduleId: number
  title: string
  completionRate: number
  averageTimeSpent: number
  difficultyRating: number
  dropoffRate: number
  completedCount: number
  totalStudents: number
}

interface OverviewStats {
  totalStudents: number
  activeStudents: number
  premiumStudents: number
  averageProgress: number
  totalExamAttempts: number
  passedExams: number
  examPassRate: number
  averageExamScore: number
  totalModulesCompleted: number
  averageModulesPerStudent: number
  totalTimeSpent: number
  totalAvailableModules: number
}

interface EngagementMetrics {
  averageStreak: number
  maxStreak: number
  recentlyActive: number
  retentionRate: number
  totalStudents: number
}

export default function AdminAnalyticsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [moduleAnalytics, setModuleAnalytics] = useState<ModuleAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30")
  const [activeTab, setActiveTab] = useState("overview")
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalStudents: 0,
    activeStudents: 0,
    premiumStudents: 0,
    averageProgress: 0,
    totalExamAttempts: 0,
    passedExams: 0,
    examPassRate: 0,
    averageExamScore: 0,
    totalModulesCompleted: 0,
    averageModulesPerStudent: 0,
    totalTimeSpent: 0,
    totalAvailableModules: 0,
  })
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>({
    averageStreak: 0,
    maxStreak: 0,
    recentlyActive: 0,
    retentionRate: 0,
    totalStudents: 0,
  })
  const [languageDistribution, setLanguageDistribution] = useState<
    { language: string; count: number; percentage: number }[]
  >([])
  const [countryDistribution, setCountryDistribution] = useState<
    { country: string; count: number; percentage: number }[]
  >([])
  const [levelDistribution, setLevelDistribution] = useState<{ level: string; count: number; percentage: number }[]>([])
  const [topPerformers, setTopPerformers] = useState<Student[]>([])
  const [difficultModules, setDifficultModules] = useState<ModuleAnalytics[]>([])

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Simulate API calls with mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        const mockStudents: Student[] = [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            enrollmentDate: "2024-01-15",
            lastActive: "2024-01-20",
            progress: 85,
            completedModules: 17,
            currentLevel: "Intermediate",
            totalTimeSpent: "45",
            streak: 7,
            achievements: ["First Module", "Week Streak", "Quiz Master"],
            subscription: "premium",
            status: "active",
            preferredLanguage: "English",
            country: "USA",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            enrollmentDate: "2024-01-10",
            lastActive: "2024-01-19",
            progress: 92,
            completedModules: 18,
            currentLevel: "Advanced",
            totalTimeSpent: "52",
            streak: 12,
            achievements: ["First Module", "Week Streak", "Quiz Master", "Speed Learner"],
            subscription: "premium",
            status: "active",
            preferredLanguage: "English",
            country: "Canada",
          },
        ]

        const mockOverviewStats: OverviewStats = {
          totalStudents: 150,
          activeStudents: 120,
          premiumStudents: 45,
          averageProgress: 68,
          totalExamAttempts: 450,
          passedExams: 380,
          examPassRate: 84,
          averageExamScore: 78,
          totalModulesCompleted: 2400,
          averageModulesPerStudent: 16,
          totalTimeSpent: 3200,
          totalAvailableModules: 20,
        }

        const mockEngagementMetrics: EngagementMetrics = {
          averageStreak: 8,
          maxStreak: 45,
          recentlyActive: 95,
          retentionRate: 76,
          totalStudents: 150,
        }

        const mockLanguageDistribution = [
          { language: "English", count: 85, percentage: 57 },
          { language: "Spanish", count: 35, percentage: 23 },
          { language: "French", count: 20, percentage: 13 },
          { language: "German", count: 10, percentage: 7 },
        ]

        const mockCountryDistribution = [
          { country: "USA", count: 45, percentage: 30 },
          { country: "Canada", count: 25, percentage: 17 },
          { country: "UK", count: 20, percentage: 13 },
          { country: "Germany", count: 15, percentage: 10 },
          { country: "France", count: 12, percentage: 8 },
        ]

        const mockLevelDistribution = [
          { level: "Beginner", count: 60, percentage: 40 },
          { level: "Intermediate", count: 55, percentage: 37 },
          { level: "Advanced", count: 35, percentage: 23 },
        ]

        const mockDifficultModules: ModuleAnalytics[] = [
          {
            moduleId: 15,
            title: "Advanced Grammar",
            completionRate: 45,
            averageTimeSpent: 85,
            difficultyRating: 4.2,
            dropoffRate: 35,
            completedCount: 68,
            totalStudents: 150,
          },
          {
            moduleId: 18,
            title: "Complex Sentences",
            completionRate: 52,
            averageTimeSpent: 78,
            difficultyRating: 4.0,
            dropoffRate: 28,
            completedCount: 78,
            totalStudents: 150,
          },
        ]

        setStudents(mockStudents)
        setOverviewStats(mockOverviewStats)
        setEngagementMetrics(mockEngagementMetrics)
        setLanguageDistribution(mockLanguageDistribution)
        setCountryDistribution(mockCountryDistribution)
        setLevelDistribution(mockLevelDistribution)
        setTopPerformers(mockStudents.slice(0, 5))
        setDifficultModules(mockDifficultModules)
      } catch (err: any) {
        console.error("Error loading analytics data:", err)
        setError(err.message || "An unexpected error occurred while loading analytics data.")
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [timeRange])

  const exportAnalytics = () => {
    const csvContent = [
      ["Metric", "Value"],
      ["Total Students", overviewStats.totalStudents],
      ["Active Students", overviewStats.activeStudents],
      ["Premium Users", overviewStats.premiumStudents],
      ["Average Progress", `${overviewStats.averageProgress}%`],
      ["Exam Pass Rate", `${overviewStats.examPassRate}%`],
      ["Average Exam Score", `${overviewStats.averageExamScore}%`],
      ["Total Time Spent", `${overviewStats.totalTimeSpent}h`],
      ["Average Streak", `${engagementMetrics.averageStreak} days`],
      ["Retention Rate", `${engagementMetrics.retentionRate}%`],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Analytics exported successfully!")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-7xl">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Analytics</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into student performance and platform usage</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportAnalytics} variant="outline" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold">{overviewStats.totalStudents}</p>
                  <p className="text-blue-200 text-xs mt-1">{overviewStats.activeStudents} active</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Avg Progress</p>
                  <p className="text-3xl font-bold">{overviewStats.averageProgress}%</p>
                  <p className="text-green-200 text-xs mt-1">
                    {overviewStats.averageModulesPerStudent}/{overviewStats.totalAvailableModules} modules
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Exam Pass Rate</p>
                  <p className="text-3xl font-bold">{overviewStats.examPassRate}%</p>
                  <p className="text-purple-200 text-xs mt-1">
                    {overviewStats.passedExams}/{overviewStats.totalExamAttempts} passed
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Time</p>
                  <p className="text-3xl font-bold">{overviewStats.totalTimeSpent}h</p>
                  <p className="text-orange-200 text-xs mt-1">Learning time</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Exams
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Engagement
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Distribution */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Student Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Students</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{overviewStats.activeStudents}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {overviewStats.totalStudents > 0
                            ? Math.round((overviewStats.activeStudents / overviewStats.totalStudents) * 100)
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={
                        overviewStats.totalStudents > 0
                          ? (overviewStats.activeStudents / overviewStats.totalStudents) * 100
                          : 0
                      }
                      className="bg-gray-200"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Premium Users</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{overviewStats.premiumStudents}</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {overviewStats.totalStudents > 0
                            ? Math.round((overviewStats.premiumStudents / overviewStats.totalStudents) * 100)
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={
                        overviewStats.totalStudents > 0
                          ? (overviewStats.premiumStudents / overviewStats.totalStudents) * 100
                          : 0
                      }
                      className="bg-gray-200"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Free Users</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          {overviewStats.totalStudents - overviewStats.premiumStudents}
                        </span>
                        <Badge className="bg-gray-100 text-gray-800">
                          {overviewStats.totalStudents > 0
                            ? Math.round(
                                ((overviewStats.totalStudents - overviewStats.premiumStudents) /
                                  overviewStats.totalStudents) *
                                  100,
                              )
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={
                        overviewStats.totalStudents > 0
                          ? ((overviewStats.totalStudents - overviewStats.premiumStudents) /
                              overviewStats.totalStudents) *
                            100
                          : 0
                      }
                      className="bg-gray-200"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Level Distribution */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Level Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {levelDistribution.map((level) => (
                      <div key={level.level} className="flex items-center justify-between">
                        <span className="text-sm font-medium">Level {level.level}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{level.count}</span>
                          <Badge variant="outline">{level.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Language Preferences */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {languageDistribution.map((lang) => (
                      <div key={lang.language} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{lang.language}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{lang.count}</span>
                          <Badge variant="outline">{lang.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Country Distribution */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {countryDistribution.slice(0, 5).map((country) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{country.country}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{country.count}</span>
                          <Badge variant="outline">{country.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Students with highest progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformers.map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-600">
                              {student.currentLevel} • {student.completedModules}/{overviewStats.totalAvailableModules}{" "}
                              modules
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{student.progress}%</div>
                          <div className="text-sm text-gray-600">{student.streak} day streak</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Student Engagement */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Retention Rate</span>
                        <span className="text-lg font-bold text-green-600">{engagementMetrics.retentionRate}%</span>
                      </div>
                      <Progress value={engagementMetrics.retentionRate} className="bg-gray-200" />
                      <p className="text-xs text-gray-600 mt-1">
                        {engagementMetrics.recentlyActive} of {engagementMetrics.totalStudents} students active in last
                        7 days
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Average Streak</span>
                        <span className="text-lg font-bold text-blue-600">{engagementMetrics.averageStreak} days</span>
                      </div>
                      <div className="text-xs text-gray-600">Longest streak: {engagementMetrics.maxStreak} days</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{overviewStats.totalTimeSpent}h</div>
                        <div className="text-sm text-gray-600">Total Learning Time</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {overviewStats.totalStudents > 0
                            ? Math.round(overviewStats.totalTimeSpent / overviewStats.totalStudents)
                            : 0}
                          h
                        </div>
                        <div className="text-sm text-gray-600">Avg per Student</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Most Difficult Modules
                </CardTitle>
                <CardDescription>Modules with lowest completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {difficultModules.map((module) => (
                    <div key={module.moduleId} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-red-800">{module.title}</h4>
                        <Badge variant="destructive">{module.completionRate}% completion</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Avg Time:</span>
                          <span className="font-medium ml-1">{module.averageTimeSpent}min</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Difficulty:</span>
                          <span className="font-medium ml-1">{module.difficultyRating}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Drop-off:</span>
                          <span className="font-medium ml-1">{module.dropoffRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Exam Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{overviewStats.examPassRate}%</div>
                      <div className="text-sm text-gray-600">Overall Pass Rate</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{overviewStats.averageExamScore}%</div>
                        <div className="text-sm text-gray-600">Avg Score</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{overviewStats.totalExamAttempts}</div>
                        <div className="text-sm text-gray-600">Total Attempts</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    User Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{engagementMetrics.retentionRate}%</div>
                      <div className="text-sm text-gray-600">7-Day Retention Rate</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{engagementMetrics.averageStreak}</div>
                        <div className="text-sm text-gray-600">Avg Streak (days)</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{engagementMetrics.maxStreak}</div>
                        <div className="text-sm text-gray-600">Max Streak (days)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
