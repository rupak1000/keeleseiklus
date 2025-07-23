// components/navigation.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, Settings, LogOut, BookOpen, Trophy, BarChart3, Users, Home, GraduationCap } from "lucide-react";
import { LanguageSelector } from "./language-selector";
import { useLanguage } from "@/contexts/language-context";

// Define UserData interface to match the structure returned by your /api/login endpoint
// and stored in localStorage/sessionStorage.
interface UserData {
  id: number; // Assuming ID is part of the user object
  name: string;
  email: string;
  is_admin: boolean; // Matches Prisma's snake_case field
  level: string; // Matches Prisma's snake_case field
  // Add other fields you might display or use from the user object
  // e.g., total_time_spent, streak, completed_modules (if you store it on the user object)
}

export function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  // Helper to get data from storage (localStorage first, then sessionStorage)
  const getFromStorage = (key: string): string | null => {
    try {
      const localValue = localStorage.getItem(key);
      if (localValue !== null) {
        return localValue;
      }
      const sessionValue = sessionStorage.getItem(key);
      return sessionValue;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  };

  // Function to check authentication status and set user data
  const checkAuthStatus = () => {
    try {
      const isLoggedInStatus = getFromStorage("isLoggedIn");
      const userJson = getFromStorage("user");

      if (isLoggedInStatus === "true" && userJson) {
        const parsedUser: UserData = JSON.parse(userJson);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } else {
        // If not logged in or user data is missing/invalid, reset state
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Handle logout: clear all relevant storage items
  const handleLogout = () => {
    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      // Remove any other specific keys you might have used in the past
      // e.g., localStorage.removeItem("adminLoginData");
      // e.g., localStorage.removeItem("studentLoginData");

      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("user");
      // e.g., sessionStorage.removeItem("adminLoginData");
      // e.g., sessionStorage.removeItem("studentLoginData");

      setIsLoggedIn(false);
      setUser(null);
      router.push("/"); // Redirect to home or login page after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Effect to run once on component mount to check auth status
  useEffect(() => {
    checkAuthStatus();

    // Add event listener for storage changes to keep auth status in sync
    // This is useful if login/logout happens in another tab/window
    window.addEventListener("storage", checkAuthStatus);
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // Helper to determine if a navigation link is active
  const isActive = (path: string) => {
    // For home, ensure exact match
    if (path === "/") {
      return pathname === "/";
    }
    // For other paths, check if pathname starts with the path
    return pathname.startsWith(path);
  };

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
                isActive("/") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t("nav.home")}</span>
            </Link>

            <Link
              href="/modules"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive("/modules") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
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
                    isActive("/progress") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t("nav.progress")}</span>
                </Link>

                <Link
                  href="/achievements"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive("/achievements") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>{t("nav.achievements")}</span>
                </Link>

                <Link
                  href="/exam"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive("/exam") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{t("nav.finalExam")}</span>
                </Link>
              </>
            )}

            {/* Admin Link (only if user is logged in AND is admin) */}
            {user?.is_admin && ( // Use user?.is_admin from the parsed user object
              <Link
                href="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/admin") ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
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

          {/* Right side: Language Selector & Auth Buttons/Dropdown */}
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
                        {t("nav.level")}: {user.level} {/* Display user's level */}
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
                  {user?.is_admin && ( // Admin links in dropdown
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
                <Link href="/signup" className="hidden sm:block"> {/* Link to signup page */}
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
  );
}
