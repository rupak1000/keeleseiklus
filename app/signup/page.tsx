// app/signup/page.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, MapPin, Trophy, Star, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter

// Define the Student type that matches what you expect from the API response
// and what you might store in client-side session (if needed, though API is primary)
interface Student {
  id: number;
  name: string;
  email: string;
  join_date: string; // Matches Prisma schema's snake_case
  last_active: string; // Matches Prisma schema's snake_case
  progress: number; // This is not returned by API select, but kept for frontend consistency if used elsewhere
  completed_modules: string[]; // Matches Prisma schema's String[]
  current_level: string; // Matches Prisma schema's snake_case
  total_time_spent: string; // Matches Prisma schema's snake_case
  streak: number;
  achievements: string[]; // Matches Prisma schema's String[]
  subscription_status: string; // Matches Prisma schema's snake_case
  subscription_date?: string; // Matches Prisma schema's snake_case
  status: string;
  notes?: string;
  phone?: string;
  date_of_birth?: string; // Matches Prisma schema's snake_case
  country?: string;
  preferred_language?: string; // Matches Prisma schema's snake_case
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useLanguage();
  const router = useRouter(); // Initialize useRouter

  // Removed all localStorage/sessionStorage related functions:
  // saveToStorage, getFromStorage, addStudentToAdminList, testStorage
  // These functions are no longer needed as data will be handled by the backend.

  const validateForm = (): boolean => {
    // Reset messages
    setErrorMessage("");
    setSuccessMessage("");

    // Check if all fields are filled
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name!");
      return false;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address!");
      return false;
    }

    if (!formData.password) {
      setErrorMessage("Please enter a password!");
      return false;
    }

    if (!formData.confirmPassword) {
      setErrorMessage("Please confirm your password!");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address!");
      return false;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return false;
    }

    // Check password strength (matches backend validation)
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long!");
      return false;
    }

    // Check terms acceptance
    if (!acceptTerms) {
      setErrorMessage("Please accept the Terms of Service and Privacy Policy to create an account!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(""); // Clear previous errors

    // 1. Client-side Validation
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Attempting to sign up user...");

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password, // Send plain password, backend will hash
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle API errors (e.g., email already exists, validation errors from backend)
        setErrorMessage(responseData.message || "Failed to create account. Please try again.");
        console.error("Signup API Error:", responseData.error || responseData.message);
        return; // Exit on error
      }

      // Signup successful
      setSuccessMessage("Account created successfully! Redirecting to your learning journey...");
      console.log("User signed up successfully:", responseData.student);

      // In a real application, after successful signup, you'd typically handle authentication here
      // (e.g., store a JWT token, set a session cookie, etc.)
      // For now, we'll just redirect.

      setTimeout(() => {
        router.push("/modules"); // Redirect to the modules page
      }, 2000);

    } catch (error: any) {
      console.error("Frontend Signup Error:", error);
      setErrorMessage(error.message || "An unexpected error occurred during account creation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // testStorage function is no longer relevant as we're using a backend.
  // You can remove it or keep it as a simple browser API test if you wish,
  // but it won't interact with your backend.
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
  );
}