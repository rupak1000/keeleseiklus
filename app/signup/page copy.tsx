"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, MapPin, Trophy, Star, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

interface Student {
  id: number
  name: string
  email: string
  joinDate: string
  lastActive: string
  progress: number
  completedModules: number[]
  currentLevel: string
  totalTimeSpent: string
  streak: number
  achievements: string[]
  subscription: string
  status: string
  notes?: string
  phone?: string
  dateOfBirth?: string
  country?: string
  preferredLanguage?: string
  subscriptionStatus?: "free" | "premium" | "admin_override"
  subscriptionDate?: string
}

const defaultStudents: Student[] = [
  {
    id: 1,
    name: "Maria Kask",
    email: "maria@example.com",
    joinDate: "2024-01-15",
    lastActive: "2024-01-20",
    progress: 75,
    completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    currentLevel: "A2",
    totalTimeSpent: "45h 30m",
    streak: 12,
    achievements: ["First Steps", "Week Warrior", "Grammar Master"],
    subscription: "Premium",
    status: "Active",
    phone: "+372 5555 1234",
    country: "Estonia",
    preferredLanguage: "English",
    notes: "Excellent progress in grammar exercises. Shows great dedication to learning.",
    subscriptionStatus: "premium",
    subscriptionDate: "2024-01-10",
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@example.com",
    joinDate: "2024-01-10",
    lastActive: "2024-01-19",
    progress: 45,
    completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    currentLevel: "A1",
    totalTimeSpent: "28h 15m",
    streak: 5,
    achievements: ["First Steps", "Vocabulary Builder"],
    subscription: "Free",
    status: "Active",
    phone: "+1 555 0123",
    country: "United States",
    preferredLanguage: "English",
    notes: "Consistent learner, good with vocabulary but needs practice with pronunciation.",
    subscriptionStatus: "free",
  },
  {
    id: 3,
    name: "Anna Tamm",
    email: "anna@example.com",
    joinDate: "2023-12-20",
    lastActive: "2024-01-18",
    progress: 90,
    completedModules: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      32, 33, 34, 35, 36,
    ],
    currentLevel: "A2",
    totalTimeSpent: "82h 45m",
    streak: 25,
    achievements: ["First Steps", "Week Warrior", "Grammar Master", "Culture Explorer", "Speaking Star"],
    subscription: "Premium",
    status: "Active",
    phone: "+372 5555 5678",
    country: "Estonia",
    preferredLanguage: "Russian",
    notes: "Advanced learner with excellent progress. Near completion of A2 level.",
    subscriptionStatus: "premium",
    subscriptionDate: "2023-12-15",
  },
  {
    id: 4,
    name: "Erik Mets",
    email: "erik@example.com",
    joinDate: "2024-01-05",
    lastActive: "2024-01-15",
    progress: 15,
    completedModules: [1, 2, 3],
    currentLevel: "A1",
    totalTimeSpent: "8h 20m",
    streak: 0,
    achievements: ["First Steps"],
    subscription: "Free",
    status: "Inactive",
    phone: "+372 5555 9999",
    country: "Estonia",
    preferredLanguage: "English",
    notes: "Started strong but became inactive. May need motivation to continue.",
    subscriptionStatus: "free",
  },
]

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
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

  // Function to add new student to admin students list
  const addStudentToAdminList = (studentData: {
    name: string
    email: string
  }): boolean => {
    try {
      // Get existing students or use defaults
      let existingStudents = []
      try {
        const saved = localStorage.getItem("adminStudents")
        existingStudents = saved ? JSON.parse(saved) : defaultStudents
      } catch {
        existingStudents = defaultStudents
      }

      // Check if student already exists
      const existingStudent = existingStudents.find((s: Student) => s.email === studentData.email)
      if (existingStudent) {
        console.log("Student already exists in admin list")
        return true
      }

      // Generate new ID
      const newId = existingStudents.length > 0 ? Math.max(...existingStudents.map((s: Student) => s.id)) + 1 : 1

      // Create new student record for admin
      const currentDate = new Date().toISOString().split("T")[0]
      const newStudent: Student = {
        id: newId,
        name: studentData.name,
        email: studentData.email,
        joinDate: currentDate,
        lastActive: currentDate,
        progress: 0,
        completedModules: [],
        currentLevel: "A1",
        totalTimeSpent: "0h 0m",
        streak: 0,
        achievements: ["First Steps"], // Give them the first achievement for signing up
        subscription: "Free", // New users start with free subscription
        status: "Active",
        phone: "",
        dateOfBirth: "",
        country: "",
        preferredLanguage: "English",
        notes: `New student registered on ${currentDate}. Welcome to Eesti Seiklus!`,
        subscriptionStatus: "free", // Default to free subscription
      }

      // Add to existing students
      const updatedStudents = [...existingStudents, newStudent]

      // Save back to localStorage
      const saved = saveToStorage("adminStudents", JSON.stringify(updatedStudents))
      if (saved) {
        console.log("✅ New student added to admin list:", newStudent)
        return true
      } else {
        console.error("❌ Failed to save student to admin list")
        return false
      }
    } catch (error) {
      console.error("❌ Error adding student to admin list:", error)
      return false
    }
  }

  const validateForm = (): boolean => {
    // Reset messages
    setErrorMessage("")
    setSuccessMessage("")

    // Check if all fields are filled
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name!")
      return false
    }

    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address!")
      return false
    }

    if (!formData.password) {
      setErrorMessage("Please enter a password!")
      return false
    }

    if (!formData.confirmPassword) {
      setErrorMessage("Please confirm your password!")
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address!")
      return false
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!")
      return false
    }

    // Check password strength
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long!")
      return false
    }

    // Check terms acceptance
    if (!acceptTerms) {
      setErrorMessage("Please accept the Terms of Service and Privacy Policy to create an account!")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("=== SIGNUP ATTEMPT ===")
      console.log("Name:", formData.name)
      console.log("Email:", formData.email)
      console.log("Password length:", formData.password.length)

      // Validate form
      if (!validateForm()) {
        setIsSubmitting(false)
        return
      }

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

      // Check if email already exists in admin students list
      try {
        const existingStudents = JSON.parse(localStorage.getItem("adminStudents") || "[]")
        const emailExists = existingStudents.some((student: Student) => student.email === formData.email)
        if (emailExists) {
          setErrorMessage("An account with this email already exists. Please use a different email or try logging in.")
          setIsSubmitting(false)
          return
        }
      } catch (error) {
        console.log("Could not check existing emails, proceeding with registration")
      }

      console.log("👤 Creating new user account")

      // Create user data
      const userData = {
        name: formData.name,
        email: formData.email,
        level: "A1",
        completedModules: 0,
        loginTime: new Date().toISOString(),
        isAdmin: false,
        subscriptionStatus: "free", // Default to free subscription
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

        // Add new student to admin students list
        console.log("📝 Adding new student to admin list...")
        const studentAdded = addStudentToAdminList({
          name: formData.name,
          email: formData.email,
        })

        if (studentAdded) {
          console.log("✅ Student successfully added to admin list")
        } else {
          console.log("⚠️ Failed to add student to admin list, but user account created")
        }

        // Verify data was saved
        const savedUser = getFromStorage("user")
        const savedLogin = getFromStorage("isLoggedIn")
        console.log("✅ Verification - savedUser exists:", !!savedUser)
        console.log("✅ Verification - savedLogin:", savedLogin)

        if (savedUser && savedLogin) {
          setSuccessMessage("Account created successfully! Redirecting to your learning journey...")

          // Show success message for 2 seconds before redirecting
          setTimeout(() => {
            console.log("🚀 Redirecting to modules...")
            window.location.href = "/modules"
          }, 2000)
        } else {
          setErrorMessage("Data verification failed. Please try again.")
        }
      } else {
        setErrorMessage("Failed to save account data. Your browser may have storage restrictions.")
      }
    } catch (error) {
      console.error("❌ Signup error:", error)
      setErrorMessage("An error occurred during account creation. Please try again.")
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
            <CardTitle className="text-2xl">{t("login.joinAdventure")}</CardTitle>
            <CardDescription>{t("login.startEstonianAdventure")}</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("login.fullName")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("login.enterFullName")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-gray-200 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

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
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("login.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("login.confirmPasswordPlaceholder")}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="border-gray-200 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-start space-x-2 py-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("login.agreeToTerms")}{" "}
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:text-blue-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("login.termsOfService")}
                    </Link>{" "}
                    {t("login.and")}{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:text-blue-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("login.privacyPolicy")}
                    </Link>
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !acceptTerms}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? "Creating Account..." : t("login.createAccount")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Already have an account?</p>
              <Link href="/login">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Sign In to Your Account
                </Button>
              </Link>
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

        {/* Benefits Section */}
        <Card className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-center text-blue-800">Why Choose Eesti Seiklus?</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Interactive learning with real Estonian culture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Progress tracking and personalized learning path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Gamified experience with achievements and rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>Official certification upon course completion</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
