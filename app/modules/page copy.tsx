"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Lock, Play, CheckCircle, Clock, BookOpen, Users, Trophy, Star, Crown, CreditCard, Check } from "lucide-react"
import Link from "next/link"
import { getModules } from "@/data/modules"
import { useLanguage } from "@/contexts/language-context"
import { useSearchParams, useRouter } from "next/navigation"

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
}

interface SubscriptionSettings {
  enabled: boolean
  freeModuleLimit: number
  premiumRequired: boolean
}

export default function ModulesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState(getModules())
  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>({
    enabled: true,
    freeModuleLimit: 10,
    premiumRequired: true,
  })
  const { t } = useLanguage()

  const searchParams = useSearchParams()
  const router = useRouter()
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)

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
    const checkAuth = () => {
      try {
        console.log("=== MODULES PAGE AUTH CHECK ===")

        // Load subscription settings
        const savedSettings = getFromStorage("subscriptionSettings")
        if (savedSettings) {
          setSubscriptionSettings(JSON.parse(savedSettings))
        }

        const loginStatus = getFromStorage("isLoggedIn")
        const userStr = getFromStorage("user")

        console.log("Login status:", loginStatus)
        console.log("User data exists:", !!userStr)

        if (loginStatus === "true" && userStr) {
          try {
            const userData = JSON.parse(userStr)
            console.log("Parsed user data:", userData)

            // Ensure subscription status exists
            if (!userData.subscriptionStatus) {
              userData.subscriptionStatus = "free"
            }

            // Normalize completedModules data
            if (Array.isArray(userData.completedModules)) {
              userData.completedModules = userData.completedModules.length
              userData.completedModulesList = userData.completedModules
            } else if (userData.completedModulesList && Array.isArray(userData.completedModulesList)) {
              userData.completedModules = userData.completedModulesList.length
            }

            setUser(userData)
            setIsLoggedIn(true)
          } catch (parseError) {
            console.error("Error parsing user data:", parseError)
            setIsLoggedIn(false)
          }
        } else {
          console.log("Not logged in or no user data")
          setIsLoggedIn(false)
        }

        // Load modules
        setModules(getModules())
        setLoading(false)
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsLoggedIn(false)
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for storage changes to update progress in real-time
    const handleStorageChange = () => {
      checkAuth()
    }

    // Listen for custom events when modules are completed
    const handleModuleComplete = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("moduleCompleted", handleModuleComplete)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("moduleCompleted", handleModuleComplete)
    }
  }, [])

  useEffect(() => {
    const paymentStatus = searchParams.get("payment")
    if (paymentStatus === "success") {
      setShowPaymentSuccess(true)

      // Clean up the URL by removing the query parameter
      router.replace("/modules", { scroll: false })

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowPaymentSuccess(false)
      }, 5000)
    }
  }, [searchParams, router])

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

    if (typeof user.completedModules === "number") {
      // Assume sequential completion
      return Array.from({ length: user.completedModules }, (_, i) => i + 1)
    }

    return []
  }

  const isModuleUnlocked = (moduleId: number): boolean => {
    // First 3 modules are always free (demo)
    if (moduleId <= 3) return true

    // If not logged in, only first 3 are available
    if (!isLoggedIn) return false

    // Check subscription requirements if system is enabled
    if (subscriptionSettings.enabled && moduleId > subscriptionSettings.freeModuleLimit) {
      // Modules beyond free limit require premium or admin override
      return user?.subscriptionStatus === "premium" || user?.subscriptionStatus === "admin_override"
    }

    // If logged in and within free limit, check if previous module is completed
    const completedCount = getCompletedModulesCount()
    return moduleId <= completedCount + 1
  }

  const getModuleStatus = (moduleId: number) => {
    const completedModulesList = getCompletedModulesList()

    if (completedModulesList.includes(moduleId)) {
      return { status: "completed", icon: CheckCircle, color: "text-green-600" }
    } else if (isModuleUnlocked(moduleId)) {
      return { status: "available", icon: Play, color: "text-blue-600" }
    } else if (!isLoggedIn && moduleId > 3) {
      return { status: "login-required", icon: Lock, color: "text-gray-400" }
    } else if (
      subscriptionSettings.enabled &&
      moduleId > subscriptionSettings.freeModuleLimit &&
      user?.subscriptionStatus !== "premium" &&
      user?.subscriptionStatus !== "admin_override"
    ) {
      return { status: "subscription-required", icon: Crown, color: "text-purple-500" }
    } else {
      return { status: "locked", icon: Lock, color: "text-gray-400" }
    }
  }

  const getModuleAccessType = (moduleId: number): string => {
    if (moduleId <= 3) return "demo"
    if (moduleId <= subscriptionSettings.freeModuleLimit) return "free"
    return "premium"
  }

  const handleModuleClick = (moduleId: number) => {
    const moduleStatus = getModuleStatus(moduleId)

    if (moduleStatus.status === "login-required") {
      window.location.href = "/login"
      return
    }

    if (moduleStatus.status === "subscription-required") {
      window.location.href = "/payment"
      return
    }

    if (moduleStatus.status === "locked") {
      alert("Complete the previous modules to unlock this one!")
      return
    }

    window.location.href = `/modules/${moduleId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  const completedCount = getCompletedModulesCount()
  const totalModules = modules.length
  const progressPercentage = (completedCount / totalModules) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("modules.title")}
          </h1>
          <p className="text-gray-600 text-lg">
            {isLoggedIn
              ? `${t("modules.welcomeBack")} ${user?.name}! ${t("modules.continueJourney")}`
              : t("modules.exploreModules")}
          </p>
        </div>

        {/* Payment Success Notification */}
        {showPaymentSuccess && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800">🎉 Welcome to Premium!</h3>
                    <p className="text-green-600">
                      Your payment was successful! You now have access to all 40 modules. Continue your Estonian
                      learning journey!
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPaymentSuccess(false)}
                    className="text-green-600 hover:text-green-700"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Overview */}
        {isLoggedIn && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">{t("modules.completed")}</p>
                    <p className="text-3xl font-bold">{completedCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">{t("modules.totalModules")}</p>
                    <p className="text-3xl font-bold">{totalModules}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-indigo-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">{t("modules.progress")}</p>
                    <p className="text-3xl font-bold">{Math.round(progressPercentage)}%</p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={`bg-gradient-to-br text-white ${
                user?.subscriptionStatus === "premium" || user?.subscriptionStatus === "admin_override"
                  ? "from-yellow-500 to-yellow-600"
                  : "from-violet-500 to-violet-600"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        user?.subscriptionStatus === "premium" || user?.subscriptionStatus === "admin_override"
                          ? "text-yellow-100"
                          : "text-violet-100"
                      }`}
                    >
                      {user?.subscriptionStatus === "premium"
                        ? "Premium"
                        : user?.subscriptionStatus === "admin_override"
                          ? "Admin Override"
                          : t("modules.level")}
                    </p>
                    <p className="text-2xl font-bold">
                      {user?.subscriptionStatus === "premium" || user?.subscriptionStatus === "admin_override"
                        ? "Active"
                        : user?.level || "Beginner"}
                    </p>
                  </div>
                  {user?.subscriptionStatus === "premium" || user?.subscriptionStatus === "admin_override" ? (
                    <Crown
                      className={`w-8 h-8 ${
                        user?.subscriptionStatus === "premium" ? "text-yellow-200" : "text-violet-200"
                      }`}
                    />
                  ) : (
                    <Star className="w-8 h-8 text-violet-200" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Overall Progress Bar */}
        {isLoggedIn && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{t("modules.overallProgress")}</h3>
                <span className="text-sm text-gray-500">
                  {completedCount} {t("progress.ofTotal")} {totalModules} {t("modules.modulesCompleted")}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Subscription Notice */}
        {isLoggedIn &&
          subscriptionSettings.enabled &&
          completedCount >= subscriptionSettings.freeModuleLimit &&
          user?.subscriptionStatus === "free" && (
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-purple-800">Ready for Premium?</h3>
                    <p className="text-purple-600">
                      You've completed {completedCount} modules! Upgrade to Premium to access all{" "}
                      {totalModules - subscriptionSettings.freeModuleLimit} remaining modules.
                    </p>
                  </div>
                  <div className="w-full sm:w-auto flex-shrink-0">
                    <Link href="/payment">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Free Access Notice */}
        {!isLoggedIn && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-blue-800">{t("modules.freeAccessAvailable")}</h3>
                  <p className="text-blue-600">{t("modules.tryModulesFree")}</p>
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                  <Link href="/login">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto text-center">
                      {t("modules.loginToUnlockAll")}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => {
            const moduleStatus = getModuleStatus(module.id)
            const accessType = getModuleAccessType(module.id)
            const StatusIcon = moduleStatus.icon

            return (
              <Card
                key={module.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  moduleStatus.status === "completed"
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
                    : moduleStatus.status === "available"
                      ? "bg-white hover:shadow-xl"
                      : moduleStatus.status === "subscription-required"
                        ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
                        : "bg-gray-50 opacity-75"
                }`}
                onClick={() => handleModuleClick(module.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={moduleStatus.status === "completed" ? "default" : "secondary"}
                      className={
                        moduleStatus.status === "completed"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          : ""
                      }
                    >
                      Module {module.id}
                    </Badge>
                    <StatusIcon className={`w-5 h-5 ${moduleStatus.color}`} />
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{module.subtitle}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t("modules.levelLabel")}</span>
                      <Badge variant="outline">{module.level}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t("modules.duration")}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {module.duration}
                      </span>
                    </div>

                    {/* Access Status */}
                    <div className="pt-2 border-t">
                      {moduleStatus.status === "completed" && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          {t("modules.completedStatus")}
                        </div>
                      )}
                      {moduleStatus.status === "available" && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                          <Play className="w-4 h-4" />
                          {accessType === "demo" ? t("modules.freeAccess") : t("modules.available")}
                        </div>
                      )}
                      {moduleStatus.status === "login-required" && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                          <Lock className="w-4 h-4" />
                          {t("modules.loginRequired")}
                        </div>
                      )}
                      {moduleStatus.status === "subscription-required" && (
                        <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                          <Crown className="w-4 h-4" />
                          Premium Required
                        </div>
                      )}
                      {moduleStatus.status === "locked" && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                          <Lock className="w-4 h-4" />
                          {t("modules.locked")}
                        </div>
                      )}
                    </div>

                    {/* Access Type Badge */}
                    <Badge
                      variant="outline"
                      className={`w-full justify-center ${
                        accessType === "demo"
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200"
                          : accessType === "free"
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                            : "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {accessType === "demo" ? (
                        <>🎯 {t("modules.free")}</>
                      ) : accessType === "free" ? (
                        <>✨ Free</>
                      ) : (
                        <>👑 Premium</>
                      )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Call to Action */}
        {!isLoggedIn && (
          <div className="text-center mt-12">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">{t("modules.readyToLearnMore")}</h3>
                <p className="text-blue-100 mb-6">{t("modules.joinThousands")}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/login">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
                      {t("modules.loginNow")}
                    </Button>
                  </Link>
                  <Link href="/modules/1">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent w-full sm:w-auto"
                    >
                      {t("modules.tryFreeModule")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Premium Upgrade CTA for logged-in free users */}
        {isLoggedIn && subscriptionSettings.enabled && user?.subscriptionStatus === "free" && (
          <div className="text-center mt-12">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardContent className="p-8">
                <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-2xl font-bold mb-4">Unlock Your Full Potential</h3>
                <p className="text-purple-100 mb-6">
                  You've made great progress! Upgrade to Premium to access all{" "}
                  {totalModules - subscriptionSettings.freeModuleLimit} remaining modules and earn your official
                  certificate.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/payment">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 w-full sm:w-auto">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent w-full sm:w-auto"
                    onClick={() => (window.location.href = "/modules")}
                  >
                    Continue with Free
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
