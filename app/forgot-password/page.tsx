"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError(t("forgotPassword.pleaseEnterEmail"))
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("forgotPassword.pleaseEnterValidEmail"))
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would send the reset email here
      console.log("Password reset email would be sent to:", email)

      setIsSubmitted(true)
    } catch (error) {
      console.error("Password reset error:", error)
      setError(t("forgotPassword.failedToSend"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">{t("forgotPassword.resetEmailSent")}</CardTitle>
              <CardDescription className="text-green-600">{t("forgotPassword.checkInbox")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{t("forgotPassword.sentTo")}</p>
                <p className="font-medium text-gray-800">{email}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">{t("forgotPassword.important")}</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• {t("forgotPassword.checkSpam")}</li>
                  <li>• {t("forgotPassword.linkExpires")}</li>
                  <li>• {t("forgotPassword.ignoreIfNotRequested")}</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail("")
                  }}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {t("forgotPassword.sendAnotherEmail")}
                </Button>

                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("forgotPassword.backToLogin")}
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">{t("forgotPassword.stillTrouble")}</p>
                <p className="text-xs text-blue-600 mt-1">{t("forgotPassword.demoMode")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("forgotPassword.title")}
          </h1>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("forgotPassword.resetPassword")}</CardTitle>
            <CardDescription>{t("forgotPassword.enterEmail")}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("forgotPassword.emailAddress")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("forgotPassword.enterEmailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-200 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("forgotPassword.sendingResetEmail")}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {t("forgotPassword.sendResetEmail")}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("forgotPassword.backToLogin")}
              </Link>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">{t("forgotPassword.needHelp")}</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• {t("forgotPassword.helpText1")}</li>
                    <li>• {t("forgotPassword.helpText2")}</li>
                    <li>• {t("forgotPassword.helpText3")}</li>
                    <li>• {t("forgotPassword.helpText4")}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">{t("forgotPassword.demoText")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
