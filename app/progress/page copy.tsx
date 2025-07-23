"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Trophy, Target, TrendingUp, CheckCircle, Play, Lock, BarChart3, Flame } from "lucide-react"
import Link from "next/link"
import { getModules } from "@/data/modules"
import { useLanguage } from "@/contexts/language-context"

interface User {
  name: string
  email: string
  level: string
  completedModules: number | number[]
  completedModulesList?: number[]
  loginTime: string
  isAdmin: boolean
  subscriptionStatus?: "free" | "premium" | "admin_override"
  subscriptionDate?: string
  totalStudyTime?: number
}

interface ModuleProgress {
  [moduleId: number]: {
    story?: boolean
    vocabulary?: boolean
    grammar?: boolean
    pronunciation?: boolean
    listening?: boolean
    speaking?: boolean
    reading?: boolean
    writing?: boolean
    cultural?: boolean
    quiz?: boolean
    completed?: boolean
    completedAt?: string
    timeSpent?: number
  }
}

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState(getModules())
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({})
  const { t } = useLanguage()
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())

  // Enhanced storage getter with fallback
  const getFromStorage = (key: string): string | null => {
    try {
      const localValue = localStorage.getItem(key)
      if (localValue !== null) {
        return localValue
      }
      const sessionValue = sessionStorage.getItem(key)
      return sessionValue
    } catch (error) {
      console.error(`Error getting ${key}:`, error)
      return null
    }
  }

  useEffect(() => {
    const checkAuth = () => {
      try {
        const loginStatus = getFromStorage("isLoggedIn")
        const userStr = getFromStorage("user")
        const progressStr = getFromStorage("moduleProgress")

        if (loginStatus === "true" && userStr) {
          try {
            const userData = JSON.parse(userStr)

            // Ensure subscription status exists
            if (!userData.subscriptionStatus) {
              userData.subscriptionStatus = "free"
            }

            // Normalize completedModules data
            if (Array.isArray(userData.completedModules)) {
              userData.completedModulesList = userData.completedModules
              userData.completedModules = userData.completedModules.length
            } else if (userData.completedModulesList && Array.isArray(userData.completedModulesList)) {
              userData.completedModules = userData.completedModulesList.length
            } else if (typeof userData.completedModules === "number") {
              // Create array from number for backward compatibility
              userData.completedModulesList = Array.from({ length: userData.completedModules }, (_, i) => i + 1)
            } else {
              // New user - no completed modules
              userData.completedModules = 0
              userData.completedModulesList = []
            }

            setUser(userData)
            setIsLoggedIn(true)

            // Load module progress
            if (progressStr) {
              try {
                const progress = JSON.parse(progressStr)
                setModuleProgress(progress)

                // Initialize study time for completed modules if not set
                const completedList = userData.completedModulesList || []
                let needsUpdate = false
                const updatedProgress = { ...progress }

                completedList.forEach((moduleId) => {
                  if (!updatedProgress[moduleId]?.timeSpent) {
                    if (!updatedProgress[moduleId]) {
                      updatedProgress[moduleId] = {}
                    }
                    updatedProgress[moduleId].timeSpent = 30 // Default 30 minutes
                    needsUpdate = true
                  }
                })

                if (needsUpdate) {
                  setModuleProgress(updatedProgress)
                  localStorage.setItem("moduleProgress", JSON.stringify(updatedProgress))
                }
              } catch (progressError) {
                console.error("Error parsing progress:", progressError)
                setModuleProgress({})
              }
            } else {
              // Initialize empty progress for new users
              setModuleProgress({})
            }
          } catch (parseError) {
            console.error("Error parsing user data:", parseError)
            setIsLoggedIn(false)
            setUser(null)
            setModuleProgress({})
          }
        } else {
          setIsLoggedIn(false)
          setUser(null)
          setModuleProgress({})
        }

        setModules(getModules())
        setLoading(false)
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsLoggedIn(false)
        setUser(null)
        setModuleProgress({})
        setLoading(false)
      }
    }

    checkAuth()
    setSessionStartTime(Date.now())

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth()
    }

    // Listen for module completion events
    const handleModuleComplete = (event: any) => {
      if (event.detail?.moduleId) {
        updateStudyTime(event.detail.moduleId, 30)
      }
      checkAuth()
    }

    // Listen for user progress updates from module pages
    const handleUserProgressUpdate = (event: any) => {
      console.log("Progress page received user progress update:", event.detail)
      checkAuth() // Refresh the data
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("moduleCompleted", handleModuleComplete)
    window.addEventListener("userProgressUpdated", handleUserProgressUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("moduleCompleted", handleModuleComplete)
      window.removeEventListener("userProgressUpdated", handleUserProgressUpdate)
    }
  }, [])

  const getCompletedModulesCount = (): number => {
    if (!user) return 0

    if (typeof user.completedModules === "number") {
      return user.completedModules
    }

    if (Array.isArray(user.completedModules)) {
      return user.completedModules.length
    }

    if (user.completedModulesList && Array.isArray(user.completedModulesList)) {
      return user.completedModulesList.length
    }

    return 0
  }

  const getCompletedModulesList = (): number[] => {
    if (!user) return []

    if (user.completedModulesList && Array.isArray(user.completedModulesList)) {
      return user.completedModulesList
    }

    if (Array.isArray(user.completedModules)) {
      return user.completedModules
    }

    if (typeof user.completedModules === "number" && user.completedModules > 0) {
      return Array.from({ length: user.completedModules }, (_, i) => i + 1)
    }

    return []
  }

  const calculateSectionProgress = (moduleId: number): number => {
    const progress = moduleProgress[moduleId]
    if (!progress) return 0

    const sections = [
      "story",
      "vocabulary",
      "grammar",
      "pronunciation",
      "listening",
      "speaking",
      "reading",
      "writing",
      "cultural",
      "quiz",
    ]

    const completedSections = sections.filter((section) => progress[section as keyof typeof progress] === true).length

    return completedSections > 0 ? Math.round((completedSections / sections.length) * 100) : 0
  }

  const getTotalStudyTime = (): number => {
    if (!moduleProgress || Object.keys(moduleProgress).length === 0) {
      // If no module progress, calculate based on completed modules (estimate 30 min per module)
      const completedCount = getCompletedModulesCount()
      return completedCount * 30 // 30 minutes per completed module as estimate
    }

    return Object.values(moduleProgress).reduce((total, progress) => {
      return total + (progress.timeSpent || 30) // Default 30 minutes if timeSpent not set
    }, 0)
  }

  const updateStudyTime = (moduleId: number, additionalMinutes = 30) => {
    try {
      // Update module progress with study time
      const currentProgress = moduleProgress[moduleId] || {}
      const updatedProgress = {
        ...currentProgress,
        timeSpent: (currentProgress.timeSpent || 0) + additionalMinutes,
      }

      const newModuleProgress = {
        ...moduleProgress,
        [moduleId]: updatedProgress,
      }

      setModuleProgress(newModuleProgress)

      // Save to storage
      localStorage.setItem("moduleProgress", JSON.stringify(newModuleProgress))

      // Also update user's total study time
      if (user) {
        const updatedUser = {
          ...user,
          totalStudyTime: (user.totalStudyTime || 0) + additionalMinutes,
        }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Error updating study time:", error)
    }
  }

  const getCurrentStreak = (): number => {
    if (!user || !user.loginTime) return 0

    const loginTime = new Date(user.loginTime)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - loginTime.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }

  const getNextMilestone = (): { target: number; message: string } => {
    const completed = getCompletedModulesCount()

    if (completed === 0) {
      return { target: 1, message: t("progress.milestones.firstModule") }
    } else if (completed < 5) {
      return { target: 5, message: t("progress.milestones.fiveModules") }
    } else if (completed < 10) {
      return { target: 10, message: t("progress.milestones.tenModules") }
    } else if (completed < 20) {
      return { target: 20, message: t("progress.milestones.twentyModules") }
    } else if (completed < 40) {
      return { target: 40, message: t("progress.milestones.allModules") }
    } else {
      return { target: 40, message: t("progress.milestones.mastered") }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("progress.loadingProgress")}</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">{t("progress.loginRequired")}</h2>
            <p className="text-gray-600 mb-6">{t("progress.loginRequiredDesc")}</p>
            <Link href="/login">
              <Button className="w-full">{t("common.loginToContinue")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedCount = getCompletedModulesCount()
  const totalModules = modules.length
  const overallProgress = totalModules > 0 ? (completedCount / totalModules) * 100 : 0
  const studyTimeHours = Math.round(getTotalStudyTime() / 60)
  const currentStreak = getCurrentStreak()
  const nextMilestone = getNextMilestone()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("progress.title")}
          </h1>
          <p className="text-gray-600 text-lg">
            {completedCount === 0
              ? `${t("home.welcomeBack")} ${user?.name}! ${t("progress.welcomeNewUser")}`
              : `${t("home.welcomeBack")} ${user?.name}! ${t("progress.welcomeReturning")}`}
          </p>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">{t("progress.modulesCompleted")}</p>
                  <p className="text-3xl font-bold">{completedCount}</p>
                  <p className="text-blue-200 text-sm">
                    {t("progress.ofTotal")} {totalModules} {t("modules.totalModules").toLowerCase()}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">{t("progress.overallProgress")}</p>
                  <p className="text-3xl font-bold">{Math.round(overallProgress)}%</p>
                  <p className="text-green-200 text-sm">{t("progress.completionRate")}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">{t("progress.studyTime")}</p>
                  <p className="text-3xl font-bold">{studyTimeHours}h</p>
                  <p className="text-purple-200 text-sm">{t("progress.totalHours")}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">{t("progress.currentStreak")}</p>
                  <p className="text-3xl font-bold">{currentStreak}</p>
                  <p className="text-orange-200 text-sm">{t("progress.daysActive")}</p>
                </div>
                <Flame className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t("progress.overallCourseProgress")}</h3>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {Math.round(overallProgress)}%
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-4 mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {completedCount} {t("modules.modulesCompleted")}
              </span>
              <span>
                {totalModules - completedCount} {t("progress.modulesRemaining")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-indigo-800">{t("progress.nextMilestone")}</h3>
                <p className="text-indigo-600">{nextMilestone.message}</p>
                <div className="mt-2">
                  <Progress
                    value={nextMilestone.target > 0 ? (completedCount / nextMilestone.target) * 100 : 0}
                    className="h-2"
                  />
                  <p className="text-sm text-indigo-500 mt-1">
                    {completedCount} / {nextMilestone.target} {t("home.modules")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Progress Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">{t("progress.moduleProgress")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.slice(0, 12).map((module) => {
              const completedModulesList = getCompletedModulesList()
              const isCompleted = completedModulesList.includes(module.id)
              const sectionProgress = calculateSectionProgress(module.id)
              const hasStarted = sectionProgress > 0

              return (
                <Card
                  key={module.id}
                  className={`transition-all duration-200 ${
                    isCompleted
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                      : hasStarted
                        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
                        : "bg-white"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={isCompleted ? "default" : hasStarted ? "secondary" : "outline"}>
                        {t("modules.levelLabel")} {module.id}
                      </Badge>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : hasStarted ? (
                        <Play className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{module.subtitle}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t("progress.progress")}</span>
                        <span className="text-sm font-medium">{sectionProgress}%</span>
                      </div>
                      <Progress value={sectionProgress} className="h-2" />

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          {t("modules.levelLabel")}: {module.level}
                        </span>
                        <span className="text-gray-500">{module.duration}</span>
                      </div>

                      <Link href={`/modules/${module.id}`}>
                        <Button
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                          className="w-full"
                          disabled={!hasStarted && !isCompleted && module.id > 3 && !isLoggedIn}
                        >
                          {isCompleted
                            ? t("progress.review")
                            : hasStarted
                              ? t("progress.continue")
                              : t("progress.start")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {modules.length > 12 && (
            <div className="text-center mt-8">
              <Link href="/modules">
                <Button variant="outline" size="lg">
                  {t("progress.viewAllModules").replace("{total}", modules.length.toString())}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">
                {completedCount === 0 ? t("progress.startLearning") : t("progress.continueLearning")}
              </h3>
              <p className="text-blue-100 mb-4 text-sm">
                {completedCount === 0 ? t("progress.beginJourney") : t("progress.pickUpWhereLeft")}
              </p>
              <Link href={completedCount === 0 ? "/modules/1" : "/modules"}>
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  {completedCount === 0 ? t("progress.startNow") : t("progress.continue")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-purple-200" />
              <h3 className="text-lg font-semibold mb-2">{t("progress.achievements")}</h3>
              <p className="text-purple-100 mb-4 text-sm">{t("progress.viewMilestones")}</p>
              <Link href="/achievements">
                <Button className="bg-white text-purple-600 hover:bg-gray-100">{t("progress.viewAchievements")}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-200" />
              <h3 className="text-lg font-semibold mb-2">{t("progress.detailedStats")}</h3>
              <p className="text-green-100 mb-4 text-sm">{t("progress.analyzePatterns")}</p>
              <Button className="bg-white text-green-600 hover:bg-gray-100" disabled>
                {t("progress.comingSoon")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
