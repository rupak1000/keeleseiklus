"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Send, Mail, Bell, History, LayoutTemplateIcon as Template, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface EmailTemplate {
  id: number
  name: string
  subject: string
  content: string
  type: "welcome" | "reminder" | "achievement" | "custom"
}

interface EmailHistory {
  id: number
  to: string
  subject: string
  sentAt: string
  status: "sent" | "failed" | "pending"
  recipients: number
}

export default function CommunicationHub() {
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
    type: "individual",
  })

  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 1,
      name: "Welcome Email",
      subject: "Welcome to Eesti Seiklus!",
      content:
        "Dear {name},\n\nWelcome to our Estonian learning platform! We're excited to have you join our community...",
      type: "welcome",
    },
    {
      id: 2,
      name: "Module Completion",
      subject: "Congratulations on completing Module {module}!",
      content: "Hi {name},\n\nGreat job completing Module {module}! You're making excellent progress...",
      type: "achievement",
    },
    {
      id: 3,
      name: "Learning Reminder",
      subject: "Continue your Estonian journey",
      content: "Hello {name},\n\nWe noticed you haven't logged in for a while. Don't lose your momentum...",
      type: "reminder",
    },
  ])

  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([
    {
      id: 1,
      to: "maria@example.com",
      subject: "Welcome to Eesti Seiklus!",
      sentAt: "2024-01-20 14:30",
      status: "sent",
      recipients: 1,
    },
    {
      id: 2,
      to: "All Active Students",
      subject: "New Module Available!",
      sentAt: "2024-01-19 10:15",
      status: "sent",
      recipients: 3,
    },
  ])

  const [students] = useState([
    { id: 1, name: "Maria Kask", email: "maria@example.com", status: "Active", subscription: "Premium" },
    { id: 2, name: "John Smith", email: "john@example.com", status: "Active", subscription: "Free" },
    { id: 3, name: "Anna Tamm", email: "anna@example.com", status: "Active", subscription: "Premium" },
    { id: 4, name: "Erik Mets", email: "erik@example.com", status: "Inactive", subscription: "Free" },
  ])

  const [activeTab, setActiveTab] = useState("compose")

  const useTemplate = (template: EmailTemplate) => {
    setEmailData((prev) => ({
      ...prev,
      subject: template.subject,
      message: template.content,
    }))
    setActiveTab("compose")
  }

  useEffect(() => {
    // Check for pre-filled email from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const toEmail = urlParams.get("to")
    if (toEmail) {
      setEmailData((prev) => ({ ...prev, to: toEmail }))
    }
  }, [])

  const handleBulkSelect = (type: string) => {
    let emails: string[] = []
    switch (type) {
      case "all":
        emails = students.map((s) => s.email)
        break
      case "active":
        emails = students.filter((s) => s.status === "Active").map((s) => s.email)
        break
      case "premium":
        emails = students.filter((s) => s.subscription === "Premium").map((s) => s.email)
        break
      case "free":
        emails = students.filter((s) => s.subscription === "Free").map((s) => s.email)
        break
    }
    setEmailData({ ...emailData, to: emails.join(", ") })
  }

  const handleSendEmail = () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      alert("Please fill in all email fields (To, Subject, Message)")
      return
    }

    const recipientCount = emailData.to.split(",").filter((email: string) => email.trim()).length

    // Add to history
    const newHistoryItem: EmailHistory = {
      id: emailHistory.length + 1,
      to: recipientCount > 1 ? `${recipientCount} recipients` : emailData.to,
      subject: emailData.subject,
      sentAt: new Date().toLocaleString(),
      status: "sent",
      recipients: recipientCount,
    }

    setEmailHistory((prev) => [newHistoryItem, ...prev])

    alert(
      `✅ Email sent successfully!\n\nTo: ${recipientCount} recipient(s)\nSubject: ${emailData.subject}\n\nNote: This is a demo - no actual emails were sent.`,
    )

    // Clear form
    setEmailData({ to: "", subject: "", message: "", type: "individual" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Communication Hub
              </h1>
              <p className="text-gray-600 mt-2">Send emails, manage templates, and track communications</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Template className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compose Email</CardTitle>
                <CardDescription>Send emails to individual students or groups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Select Recipients */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Quick Select Recipients</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkSelect("all")}>
                      All Students ({students.length})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkSelect("active")}>
                      Active Only ({students.filter((s) => s.status === "Active").length})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkSelect("premium")}>
                      Premium Only ({students.filter((s) => s.subscription === "Premium").length})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkSelect("free")}>
                      Free Only ({students.filter((s) => s.subscription === "Free").length})
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email-to">To</Label>
                  <Textarea
                    id="email-to"
                    placeholder="Enter email addresses separated by commas"
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recipients:{" "}
                    {emailData.to ? emailData.to.split(",").filter((email: string) => email.trim()).length : 0}
                  </p>
                </div>

                <div>
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input
                    id="email-subject"
                    placeholder="Email subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email-message">Message</Label>
                  <Textarea
                    id="email-message"
                    placeholder="Email message"
                    value={emailData.message}
                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                    rows={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">Characters: {emailData.message.length}</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.setItem("emailDraft", JSON.stringify(emailData))
                      alert("Draft saved successfully!")
                    }}
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    disabled={!emailData.to || !emailData.subject || !emailData.message}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Email Templates</h2>
                <p className="text-gray-600">Manage reusable email templates</p>
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="capitalize">{template.type} template</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Subject:</p>
                        <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Preview:</p>
                        <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                      </div>
                      <Button size="sm" className="w-full" onClick={() => useTemplate(template)}>
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email History</CardTitle>
                <CardDescription>Track all sent communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">To</th>
                        <th className="text-left p-4 font-medium">Subject</th>
                        <th className="text-left p-4 font-medium">Sent At</th>
                        <th className="text-left p-4 font-medium">Recipients</th>
                        <th className="text-left p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailHistory.map((email) => (
                        <tr key={email.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{email.to}</td>
                          <td className="p-4">{email.subject}</td>
                          <td className="p-4 text-sm text-gray-600">{email.sentAt}</td>
                          <td className="p-4 text-sm">{email.recipients}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                email.status === "sent"
                                  ? "bg-green-100 text-green-700"
                                  : email.status === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {email.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure automated notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Welcome Email</h4>
                      <p className="text-sm text-gray-600">Send welcome email to new students</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Module Completion</h4>
                      <p className="text-sm text-gray-600">Congratulate students on module completion</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Inactivity Reminder</h4>
                      <p className="text-sm text-gray-600">Remind inactive students to continue learning</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Achievement Notifications</h4>
                      <p className="text-sm text-gray-600">Notify students when they earn achievements</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Save Notification Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
