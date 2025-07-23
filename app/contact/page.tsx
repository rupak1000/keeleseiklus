"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ContactPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Store the contact form submission (in a real app, this would go to a server)
    const submissions = JSON.parse(localStorage.getItem("contactSubmissions") || "[]")
    const newSubmission = {
      ...formData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: "new",
    }
    submissions.push(newSubmission)
    localStorage.setItem("contactSubmissions", JSON.stringify(submissions))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    }, 3000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("contact.messageSent")}</h2>
            <p className="text-gray-600 mb-4">{t("contact.thankYou")}</p>
            <p className="text-sm text-gray-500">{t("contact.redirecting")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("contact.title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("contact.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">{t("contact.getInTouch")}</CardTitle>
                <CardDescription>{t("contact.getInTouchDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("contact.email")}</h3>
                    <p className="text-gray-600">support@estonianlearning.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("contact.phone")}</h3>
                    <p className="text-gray-600">+372 123 4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("contact.address")}</h3>
                    <p className="text-gray-600">Tallinn, Estonia</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("contact.faq")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800">{t("contact.faqQuestion1")}</h4>
                  <p className="text-gray-600 text-sm">{t("contact.faqAnswer1")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{t("contact.faqQuestion2")}</h4>
                  <p className="text-gray-600 text-sm">{t("contact.faqAnswer2")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{t("contact.faqQuestion3")}</h4>
                  <p className="text-gray-600 text-sm">{t("contact.faqAnswer3")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>{t("contact.sendMessage")}</CardTitle>
              <CardDescription>{t("contact.sendMessageDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("contact.nameRequired")}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder={t("contact.namePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("contact.emailRequired")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder={t("contact.emailPlaceholder")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{t("contact.subjectRequired")}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder={t("contact.subjectPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t("contact.messageRequired")}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder={t("contact.messagePlaceholder")}
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t("contact.sending")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t("contact.sendButton")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
