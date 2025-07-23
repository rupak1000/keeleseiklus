"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, CreditCard, Crown } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredModule?: number
}

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

export function AuthGuard({ children, requiredModule }: AuthGuardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>({
    enabled: true,
    freeModuleLimit: 10,
    premiumRequired: true,
  })
  const [accessDeniedReason, setAccessDeniedReason] = useState<"login" | "subscription" | "completion" | null>(null)

  // Enhanced storage getter with fallback
  const getFromStorage = (key: string): string | null => {
    try {
      const localValue = localStorage.getItem(key)
      if (localValue !== null) return localValue
      const sessionValue = sessionStorage.getItem(key)
      return sessionValue
    } catch (error) {
      console.error(`Error getting ${key}:`, error)
      return null
    }
  }

  const getCompletedModulesCount = (userData: User): number => {
    if (Array.isArray(userData.completedModulesList)) {
      return userData.completedModulesList.length
    }
    if (Array.isArray(userData.completedModules)) {
      return userData.completedModules.length
    }
    if (typeof userData.completedModules === "number") {
      return userData.completedModules
    }
    return 0
  }

  const checkSubscriptionAccess = (userData: User, moduleId: number): boolean => {
    // Admin users always have access
    if (userData.isAdmin) return true

    // Check if subscription system is enabled
    if (!subscriptionSettings.enabled) return true

    // Modules 1-3 are always free (demo)
    if (moduleId <= 3) return true

    // Modules 4-10 are free for logged-in users
    if (moduleId <= subscriptionSettings.freeModuleLimit) return true

    // Modules 11+ require subscription or admin override
    if (moduleId > subscriptionSettings.freeModuleLimit) {
      return userData.subscriptionStatus === "premium" || userData.subscriptionStatus === "admin_override"
    }

    return false
  }

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Load subscription settings
        const savedSettings = getFromStorage("subscriptionSettings")
        if (savedSettings) {
          setSubscriptionSettings(JSON.parse(savedSettings))
        }

        const loggedIn = getFromStorage("isLoggedIn") === "true"
        const userStr = getFromStorage("user")

        setIsLoggedIn(loggedIn)

        if (!loggedIn) {
          if (requiredModule && requiredModule > 3) {
            setAccessDeniedReason("login")
            setHasAccess(false)
          } else {
            setHasAccess(true)
          }
          setLoading(false)
          return
        }

        if (userStr) {
          try {
            const userData: User = JSON.parse(userStr)

            // Ensure subscription status exists
            if (!userData.subscriptionStatus) {
              userData.subscriptionStatus = "free"
            }

            setUser(userData)

            if (requiredModule) {
              // Check completion requirement
              const completedCount = getCompletedModulesCount(userData)
              const hasCompletedPrevious = requiredModule === 1 || completedCount >= requiredModule - 1

              if (!hasCompletedPrevious) {
                setAccessDeniedReason("completion")
                setHasAccess(false)
                setLoading(false)
                return
              }

              // Check subscription requirement
              const hasSubscriptionAccess = checkSubscriptionAccess(userData, requiredModule)

              if (!hasSubscriptionAccess) {
                setAccessDeniedReason("subscription")
                setHasAccess(false)
                setLoading(false)
                return
              }
            }

            setHasAccess(true)
          } catch (error) {
            console.error("Error parsing user data:", error)
            setHasAccess(false)
            setAccessDeniedReason("login")
          }
        } else {
          setHasAccess(false)
          setAccessDeniedReason("login")
        }

        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        setLoading(false)
        setHasAccess(false)
        setAccessDeniedReason("login")
      }
    }

    checkAuth()
  }, [requiredModule])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // For modules 1-3, always allow access
  if (requiredModule && requiredModule <= 3) {
    return <>{children}</>
  }

  if (accessDeniedReason === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access modules beyond the free demo (modules 1-3).</p>
            <Button onClick={() => (window.location.href = "/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (accessDeniedReason === "subscription") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <Crown className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Premium Access Required</h2>
            <p className="text-gray-600 mb-4">
              You've completed the free modules (1-{subscriptionSettings.freeModuleLimit})! To continue your Estonian
              learning journey, upgrade to Premium.
            </p>
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-purple-800 mb-2">Premium Benefits:</h3>
              <ul className="text-sm text-purple-700 text-left space-y-1">
                <li>• Access to all {40 - subscriptionSettings.freeModuleLimit} remaining modules</li>
                <li>• Advanced grammar exercises</li>
                <li>• Cultural immersion content</li>
                <li>• Final exam and certification</li>
                <li>• Priority support</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => (window.location.href = "/payment")}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/modules")} className="flex-1">
                Back to Modules
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (accessDeniedReason === "completion") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Module Locked</h2>
            <p className="text-gray-600 mb-6">Complete Module {requiredModule! - 1} to unlock this module.</p>
            <Button onClick={() => (window.location.href = "/modules")} className="w-full">
              Go to Modules
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
