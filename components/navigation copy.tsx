"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, BookOpen, Trophy, BarChart3, Users, Home, GraduationCap } from "lucide-react"
import { LanguageSelector } from "./language-selector"
import { useLanguage } from "@/contexts/language-context"

interface UserData {
  name: string
  email: string
  isAdmin?: boolean
  level?: string
  completedModules?: number
}

export function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  useEffect(() => {
    checkAuthStatus()

    // Listen for storage changes to update auth status
    const handleStorageChange = () => {
      checkAuthStatus()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const checkAuthStatus = () => {
    try {
      const loginStatus = localStorage.getItem("isLoggedIn") || sessionStorage.getItem("isLoggedIn")
      const userData = localStorage.getItem("user") || sessionStorage.getItem("user")
      const adminData = localStorage.getItem("adminLoginData") || sessionStorage.getItem("adminLoginData")

      if (loginStatus === "true" && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } else if (adminData) {
        const parsedAdmin = JSON.parse(adminData)
        setUser({ ...parsedAdmin, isAdmin: true })
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  const handleLogout = () => {
    try {
      // Clear all auth-related data
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")
      localStorage.removeItem("adminLoginData")
      localStorage.removeItem("studentLoginData")
      sessionStorage.removeItem("isLoggedIn")
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("adminLoginData")
      sessionStorage.removeItem("studentLoginData")

      setIsLoggedIn(false)
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Keele Seiklus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive("/") && pathname === "/"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t("nav.home")}</span>
            </Link>

            <Link
              href="/modules"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive("/modules")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t("nav.modules")}</span>
            </Link>

            {isLoggedIn && (
              <>
                <Link
                  href="/progress"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive("/progress")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t("nav.progress")}</span>
                </Link>

                <Link
                  href="/achievements"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive("/achievements")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>{t("nav.achievements")}</span>
                </Link>

                <Link
                  href="/exam"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive("/exam")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{t("nav.finalExam")}</span>
                </Link>
              </>
            )}

            {user?.isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/admin")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{t("nav.admin") || "Admin"}</span>
                <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-700">
                  {t("nav.admin") || "Admin"}
                </Badge>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:inline font-medium">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {user?.level && (
                      <Badge variant="outline" className="mt-1">
                        {t("nav.level")}
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/progress" className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {t("nav.progress")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/achievements" className="flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      {t("nav.achievements")}
                    </Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          {t("nav.adminDashboard") || "Admin Dashboard"}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/students" className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {t("nav.manageStudents") || "Manage Students"}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/modules" className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {t("nav.manageModules") || "Manage Modules"}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("nav.logout") || "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">{t("nav.login")}</Button>
                </Link>
                <Link href="/login" className="hidden sm:block">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {t("nav.signUp") || "Sign Up"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
