"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, MapPin, Trophy, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { t } = useLanguage()

  // Enhanced localStorage with fallback
  const saveToStorage = (key: string, value: string): boolean => {
    try {
      // Try localStorage first
      localStorage.setItem(key, value)
      const saved = localStorage.getItem(key)
      if (saved === value) {
        console.log(`✅ Successfully saved ${key} to localStorage`)
        return true
      }

      // If localStorage failed, try sessionStorage
      console.log("⚠️ localStorage failed, trying sessionStorage")
      sessionStorage.setItem(key, value)
      const sessionSaved = sessionStorage.getItem(key)
      if (sessionSaved === value) {
        console.log(`✅ Successfully saved ${key} to sessionStorage`)
        return true
      }

      console.error("❌ Both localStorage and sessionStorage failed")
      return false
    } catch (error) {
      console.error(`❌ Error saving ${key}:`, error)

      // Try sessionStorage as fallback
      try {
        sessionStorage.setItem(key, value)
        const sessionSaved = sessionStorage.getItem(key)
        if (sessionSaved === value) {
          console.log(`✅ Fallback: saved ${key} to sessionStorage`)
          return true
        }
      } catch (sessionError) {
        console.error("❌ SessionStorage fallback also failed:", sessionError)
      }

      return false
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      console.log("=== LOGIN ATTEMPT ===")
      console.log("Email:", formData.email)
      console.log("Password length:", formData.password.length)
      console.log("Is admin check:", formData.email === "admin@eestiseiklus.com" && formData.password === "admin123")

      // Test storage first
      const testKey = "test_" + Date.now()
      const testValue = "test_value"
      if (!saveToStorage(testKey, testValue)) {
        setErrorMessage("Browser storage is not available. Please check your browser settings and try again.")
        setIsSubmitting(false)
        return
      }

      // Clean up test
      try {
        localStorage.removeItem(testKey)
        sessionStorage.removeItem(testKey)
      } catch (e) {
        // Ignore cleanup errors
      }

      // Check for admin login
      if (formData.email === "admin@eestiseiklus.com" && formData.password === "admin123") {
        console.log("✅ Admin credentials matched!")

        const adminData = {
          name: "Admin",
          email: "admin@eestiseiklus.com",
          level: "Admin",
          completedModules: 0,
          loginTime: new Date().toISOString(),
          isAdmin: true,
          subscriptionStatus: "admin_override",
        }

        console.log("💾 Saving admin data:", adminData)

        // Clear any existing data first
        try {
          localStorage.removeItem("user")
          localStorage.removeItem("isLoggedIn")
          sessionStorage.removeItem("user")
          sessionStorage.removeItem("isLoggedIn")
        } catch (e) {
          console.log("Note: Could not clear existing data")
        }

        // Save new data with enhanced method
        const userSaved = saveToStorage("user", JSON.stringify(adminData))
        const loginSaved = saveToStorage("isLoggedIn", "true")

        if (userSaved && loginSaved) {
          console.log("✅ Admin data saved successfully")

          // Verify data was saved
          const savedUser = getFromStorage("user")
          const savedLogin = getFromStorage("isLoggedIn")
          console.log("✅ Verification - savedUser exists:", !!savedUser)
          console.log("✅ Verification - savedLogin:", savedLogin)

          if (savedUser && savedLogin) {
            console.log("🚀 Redirecting to admin dashboard...")
            // Use a more reliable redirect method
            window.location.href = "/admin"
          } else {
            setErrorMessage("Data verification failed. Please try again.")
          }
        } else {
          setErrorMessage("Failed to save login data. Your browser may have storage restrictions.")
        }
        return
      }

      // Regular user authentication
      console.log("👤 Regular user login")

      // For demo purposes, we'll accept any email/password combination for regular users
      // In a real app, you would validate against a database
      const userData = {
        name: "Estonian Learner",
        email: formData.email,
        level: "A1",
        completedModules: 0,
        loginTime: new Date().toISOString(),
        isAdmin: false,
        subscriptionStatus: "free",
      }

      console.log("💾 Saving user data:", userData)

      // Clear any existing data first
      try {
        localStorage.removeItem("user")
        localStorage.removeItem("isLoggedIn")
        sessionStorage.removeItem("user")
        sessionStorage.removeItem("isLoggedIn")
      } catch (e) {
        console.log("Note: Could not clear existing data")
      }

      // Save new data with enhanced method
      const userSaved = saveToStorage("user", JSON.stringify(userData))
      const loginSaved = saveToStorage("isLoggedIn", "true")

      if (userSaved && loginSaved) {
        console.log("✅ User data saved successfully")

        // Verify data was saved
        const savedUser = getFromStorage("user")
        const savedLogin = getFromStorage("isLoggedIn")
        console.log("✅ Verification - savedUser exists:", !!savedUser)
        console.log("✅ Verification - savedLogin:", savedLogin)

        if (savedUser && savedLogin) {
          console.log("🚀 Redirecting to modules...")
          window.location.href = "/modules"
        } else {
          setErrorMessage("Data verification failed. Please try again.")
        }
      } else {
        setErrorMessage("Failed to save login data. Your browser may have storage restrictions.")
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      setErrorMessage("An error occurred during login. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const testStorage = () => {
    console.log("=== STORAGE TEST ===")
    const results = []

    // Test localStorage
    try {
      localStorage.setItem("test", "working")
      const localTest = localStorage.getItem("test")
      localStorage.removeItem("test")
      results.push(`LocalStorage: ${localTest === "working" ? "✅ Working" : "❌ Failed"}`)
    } catch (error) {
      results.push(`LocalStorage: ❌ Error - ${error}`)
    }

    // Test sessionStorage
    try {
      sessionStorage.setItem("test", "working")
      const sessionTest = sessionStorage.getItem("test")
      sessionStorage.removeItem("test")
      results.push(`SessionStorage: ${sessionTest === "working" ? "✅ Working" : "❌ Failed"}`)
    } catch (error) {
      results.push(`SessionStorage: ❌ Error - ${error}`)
    }

    // Test storage quota
    try {
      const testData = "x".repeat(1024 * 1024) // 1MB test
      localStorage.setItem("quota_test", testData)
      localStorage.removeItem("quota_test")
      results.push("Storage Quota: ✅ Sufficient")
    } catch (error) {
      results.push(`Storage Quota: ⚠️ Limited - ${error}`)
    }

    console.log("Storage test results:", results)
    alert(results.join("\n"))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Eesti Seiklus
          </h1>
          <p className="text-gray-600 mt-2">{t("login.yourEstonianAdventure")}</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("login.welcomeBack")}</CardTitle>
            <CardDescription>{t("login.continueJourney")}</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.enterEmail")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-gray-200 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("login.enterPassword")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="border-gray-200 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? t("login.signingIn") : t("login.signIn")}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 underline">
                {t("login.forgotPassword")}
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
              <Link href="/signup">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                  disabled={isSubmitting}
                >
                  Create New Account
                </Button>
              </Link>
            </div>

            {/* Admin Login Info */}
            <div className="mt-6 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                <strong>{t("login.adminAccess")}: admin@eestiseiklus.com / admin123</strong>
              </p>
            </div>

            {/* Debug Test Button */}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs bg-transparent border-blue-300 text-blue-600 hover:bg-blue-50"
                onClick={testStorage}
                disabled={isSubmitting}
              >
                {t("login.testBrowserStorage")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Preview */}
        <Card className="mt-6 bg-white/60 backdrop-blur-sm border-0">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-center">{t("login.whatYoullLearn")}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>{t("login.interactiveModules")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>{t("login.estonianDestinations")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-600" />
                <span>{t("login.achievementsBadges")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-violet-600" />
                <span>{t("login.certification")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
