"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Settings,
  Mail,
  Shield,
  Database,
  Bell,
  Download,
  Upload,
  Save,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

interface GeneralSettings {
  appName: string
  appDescription: string
  supportEmail: string
  defaultLanguage: string
  timezone: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  guestAccessEnabled: boolean
  maxStudentsPerClass: number
  sessionTimeout: number // in minutes
}

interface EmailSettings {
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  fromEmail: string
  fromName: string
  enableWelcomeEmails: boolean
  enableProgressEmails: boolean
  enableCertificateEmails: boolean
  enableReminderEmails: boolean
  emailFrequency: "daily" | "weekly" | "monthly"
}

interface SecuritySettings {
  passwordMinLength: number
  requireSpecialChars: boolean
  requireNumbers: boolean
  requireUppercase: boolean
  enableTwoFactor: boolean
  sessionSecurity: "standard" | "high" | "maximum"
  ipWhitelist: string[]
  maxLoginAttempts: number
  lockoutDuration: number // in minutes
  enableAuditLog: boolean
}

interface NotificationSettings {
  enablePushNotifications: boolean
  enableEmailNotifications: boolean
  enableSMSNotifications: boolean
  notifyOnNewRegistration: boolean
  notifyOnExamCompletion: boolean
  notifyOnModuleCompletion: boolean
  notifyOnSystemErrors: boolean
  adminNotificationEmail: string
}

interface SystemSettings {
  backupFrequency: "daily" | "weekly" | "monthly"
  retentionPeriod: number // in days
  enableAnalytics: boolean
  enableErrorReporting: boolean
  debugMode: boolean
  cacheEnabled: boolean
  compressionEnabled: boolean
  maxFileUploadSize: number // in MB
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    appName: "Keele Seiklus",
    appDescription: "Interactive Language Learning Platform",
    supportEmail: "support@keeleseiklus.com",
    defaultLanguage: "en",
    timezone: "Europe/Tallinn",
    maintenanceMode: false,
    registrationEnabled: true,
    guestAccessEnabled: true,
    maxStudentsPerClass: 30,
    sessionTimeout: 60,
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "noreply@keeleseiklus.com",
    fromName: "Keele Seiklus",
    enableWelcomeEmails: true,
    enableProgressEmails: true,
    enableCertificateEmails: true,
    enableReminderEmails: false,
    emailFrequency: "weekly",
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    enableTwoFactor: false,
    sessionSecurity: "standard",
    ipWhitelist: [],
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableAuditLog: true,
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    notifyOnNewRegistration: true,
    notifyOnExamCompletion: true,
    notifyOnModuleCompletion: false,
    notifyOnSystemErrors: true,
    adminNotificationEmail: "admin@keeleseiklus.com",
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    backupFrequency: "daily",
    retentionPeriod: 30,
    enableAnalytics: true,
    enableErrorReporting: true,
    debugMode: false,
    cacheEnabled: true,
    compressionEnabled: true,
    maxFileUploadSize: 10,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      // Load general settings
      const savedGeneral = localStorage.getItem("adminGeneralSettings")
      if (savedGeneral) {
        setGeneralSettings(JSON.parse(savedGeneral))
      }

      // Load email settings
      const savedEmail = localStorage.getItem("adminEmailSettings")
      if (savedEmail) {
        setEmailSettings(JSON.parse(savedEmail))
      }

      // Load security settings
      const savedSecurity = localStorage.getItem("adminSecuritySettings")
      if (savedSecurity) {
        setSecuritySettings(JSON.parse(savedSecurity))
      }

      // Load notification settings
      const savedNotifications = localStorage.getItem("adminNotificationSettings")
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications))
      }

      // Load system settings
      const savedSystem = localStorage.getItem("adminSystemSettings")
      if (savedSystem) {
        setSystemSettings(JSON.parse(savedSystem))
      }

      // Load last backup date
      const savedBackup = localStorage.getItem("lastBackupDate")
      if (savedBackup) {
        setLastBackup(savedBackup)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Save all settings to localStorage
      localStorage.setItem("adminGeneralSettings", JSON.stringify(generalSettings))
      localStorage.setItem("adminEmailSettings", JSON.stringify(emailSettings))
      localStorage.setItem("adminSecuritySettings", JSON.stringify(securitySettings))
      localStorage.setItem("adminNotificationSettings", JSON.stringify(notificationSettings))
      localStorage.setItem("adminSystemSettings", JSON.stringify(systemSettings))

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success message (you could use a toast here)
      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error saving settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const testEmailConnection = async () => {
    try {
      // Simulate email test
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert("Email connection test successful!")
    } catch (error) {
      alert("Email connection test failed. Please check your settings.")
    }
  }

  const createBackup = async () => {
    try {
      // Get all data from localStorage
      const allData = {
        students: JSON.parse(localStorage.getItem("adminStudents") || "[]"),
        modules: JSON.parse(localStorage.getItem("adminModules") || "[]"),
        examResults: JSON.parse(localStorage.getItem("examResults") || "[]"),
        examSettings: JSON.parse(localStorage.getItem("examSettings") || "{}"),
        generalSettings,
        emailSettings: { ...emailSettings, smtpPassword: "[REDACTED]" }, // Don't export password
        securitySettings,
        notificationSettings,
        systemSettings,
        backupDate: new Date().toISOString(),
      }

      // Create and download backup file
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `keele-seiklus-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      // Update last backup date
      const backupDate = new Date().toISOString()
      setLastBackup(backupDate)
      localStorage.setItem("lastBackupDate", backupDate)

      setShowBackupDialog(false)
      alert("Backup created successfully!")
    } catch (error) {
      console.error("Error creating backup:", error)
      alert("Error creating backup. Please try again.")
    }
  }

  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string)

        // Restore data to localStorage
        if (backupData.students) localStorage.setItem("adminStudents", JSON.stringify(backupData.students))
        if (backupData.modules) localStorage.setItem("adminModules", JSON.stringify(backupData.modules))
        if (backupData.examResults) localStorage.setItem("examResults", JSON.stringify(backupData.examResults))
        if (backupData.examSettings) localStorage.setItem("examSettings", JSON.stringify(backupData.examSettings))

        // Restore settings
        if (backupData.generalSettings) {
          setGeneralSettings(backupData.generalSettings)
          localStorage.setItem("adminGeneralSettings", JSON.stringify(backupData.generalSettings))
        }
        if (backupData.emailSettings) {
          setEmailSettings(backupData.emailSettings)
          localStorage.setItem("adminEmailSettings", JSON.stringify(backupData.emailSettings))
        }
        if (backupData.securitySettings) {
          setSecuritySettings(backupData.securitySettings)
          localStorage.setItem("adminSecuritySettings", JSON.stringify(backupData.securitySettings))
        }
        if (backupData.notificationSettings) {
          setNotificationSettings(backupData.notificationSettings)
          localStorage.setItem("adminNotificationSettings", JSON.stringify(backupData.notificationSettings))
        }
        if (backupData.systemSettings) {
          setSystemSettings(backupData.systemSettings)
          localStorage.setItem("adminSystemSettings", JSON.stringify(backupData.systemSettings))
        }

        alert("Backup restored successfully! Please refresh the page.")
      } catch (error) {
        console.error("Error restoring backup:", error)
        alert("Error restoring backup. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults? This action cannot be undone.")) {
      // Clear all settings from localStorage
      localStorage.removeItem("adminGeneralSettings")
      localStorage.removeItem("adminEmailSettings")
      localStorage.removeItem("adminSecuritySettings")
      localStorage.removeItem("adminNotificationSettings")
      localStorage.removeItem("adminSystemSettings")

      // Reset state to defaults
      loadSettings()
      alert("Settings reset to defaults successfully!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                System Settings
              </h1>
              <p className="text-gray-600 mt-2">Configure application settings and preferences</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowBackupDialog(true)}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Download className="w-4 h-4" />
                Backup
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic application configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="appName">Application Name</Label>
                      <Input
                        id="appName"
                        value={generalSettings.appName}
                        onChange={(e) => setGeneralSettings((prev) => ({ ...prev, appName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={generalSettings.supportEmail}
                        onChange={(e) => setGeneralSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultLanguage">Default Language</Label>
                      <Select
                        value={generalSettings.defaultLanguage}
                        onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, defaultLanguage: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="et">Estonian</SelectItem>
                          <SelectItem value="ru">Russian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={generalSettings.timezone}
                        onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Tallinn">Europe/Tallinn</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="appDescription">Application Description</Label>
                      <Textarea
                        id="appDescription"
                        value={generalSettings.appDescription}
                        onChange={(e) => setGeneralSettings((prev) => ({ ...prev, appDescription: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStudents">Max Students Per Class</Label>
                      <Input
                        id="maxStudents"
                        type="number"
                        min="1"
                        max="100"
                        value={generalSettings.maxStudentsPerClass}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            maxStudentsPerClass: Number.parseInt(e.target.value) || 30,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="15"
                        max="480"
                        value={generalSettings.sessionTimeout}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            sessionTimeout: Number.parseInt(e.target.value) || 60,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Access Control</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="maintenance">Maintenance Mode</Label>
                        <p className="text-sm text-gray-600">Disable public access</p>
                      </div>
                      <Switch
                        id="maintenance"
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={(checked) =>
                          setGeneralSettings((prev) => ({ ...prev, maintenanceMode: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="registration">Registration Enabled</Label>
                        <p className="text-sm text-gray-600">Allow new user signups</p>
                      </div>
                      <Switch
                        id="registration"
                        checked={generalSettings.registrationEnabled}
                        onCheckedChange={(checked) =>
                          setGeneralSettings((prev) => ({ ...prev, registrationEnabled: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="guestAccess">Guest Access</Label>
                        <p className="text-sm text-gray-600">Allow demo access</p>
                      </div>
                      <Switch
                        id="guestAccess"
                        checked={generalSettings.guestAccessEnabled}
                        onCheckedChange={(checked) =>
                          setGeneralSettings((prev) => ({ ...prev, guestAccessEnabled: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Configuration
                </CardTitle>
                <CardDescription>Configure SMTP settings and email preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">SMTP Settings</h3>
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={emailSettings.smtpPort}
                        onChange={(e) =>
                          setEmailSettings((prev) => ({ ...prev, smtpPort: Number.parseInt(e.target.value) || 587 }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        value={emailSettings.smtpUsername}
                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtpUsername: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <div className="relative">
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={emailSettings.smtpPassword}
                          onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtpPassword: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Email Identity</h3>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, fromEmail: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={emailSettings.fromName}
                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, fromName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailFrequency">Email Frequency</Label>
                      <Select
                        value={emailSettings.emailFrequency}
                        onValueChange={(value: any) => setEmailSettings((prev) => ({ ...prev, emailFrequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={testEmailConnection} variant="outline" className="w-full bg-transparent">
                      Test Email Connection
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Email Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="welcomeEmails">Welcome Emails</Label>
                        <p className="text-sm text-gray-600">Send welcome email to new users</p>
                      </div>
                      <Switch
                        id="welcomeEmails"
                        checked={emailSettings.enableWelcomeEmails}
                        onCheckedChange={(checked) =>
                          setEmailSettings((prev) => ({ ...prev, enableWelcomeEmails: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="progressEmails">Progress Emails</Label>
                        <p className="text-sm text-gray-600">Send progress updates</p>
                      </div>
                      <Switch
                        id="progressEmails"
                        checked={emailSettings.enableProgressEmails}
                        onCheckedChange={(checked) =>
                          setEmailSettings((prev) => ({ ...prev, enableProgressEmails: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="certificateEmails">Certificate Emails</Label>
                        <p className="text-sm text-gray-600">Send certificates via email</p>
                      </div>
                      <Switch
                        id="certificateEmails"
                        checked={emailSettings.enableCertificateEmails}
                        onCheckedChange={(checked) =>
                          setEmailSettings((prev) => ({ ...prev, enableCertificateEmails: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="reminderEmails">Reminder Emails</Label>
                        <p className="text-sm text-gray-600">Send learning reminders</p>
                      </div>
                      <Switch
                        id="reminderEmails"
                        checked={emailSettings.enableReminderEmails}
                        onCheckedChange={(checked) =>
                          setEmailSettings((prev) => ({ ...prev, enableReminderEmails: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security policies and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Password Policy</h3>
                    <div className="space-y-2">
                      <Label htmlFor="passwordLength">Minimum Password Length</Label>
                      <Input
                        id="passwordLength"
                        type="number"
                        min="6"
                        max="32"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            passwordMinLength: Number.parseInt(e.target.value) || 8,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requireSpecial">Require Special Characters</Label>
                        <Switch
                          id="requireSpecial"
                          checked={securitySettings.requireSpecialChars}
                          onCheckedChange={(checked) =>
                            setSecuritySettings((prev) => ({ ...prev, requireSpecialChars: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requireNumbers">Require Numbers</Label>
                        <Switch
                          id="requireNumbers"
                          checked={securitySettings.requireNumbers}
                          onCheckedChange={(checked) =>
                            setSecuritySettings((prev) => ({ ...prev, requireNumbers: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requireUppercase">Require Uppercase</Label>
                        <Switch
                          id="requireUppercase"
                          checked={securitySettings.requireUppercase}
                          onCheckedChange={(checked) =>
                            setSecuritySettings((prev) => ({ ...prev, requireUppercase: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Authentication</h3>
                    <div className="space-y-2">
                      <Label htmlFor="sessionSecurity">Session Security Level</Label>
                      <Select
                        value={securitySettings.sessionSecurity}
                        onValueChange={(value: any) =>
                          setSecuritySettings((prev) => ({ ...prev, sessionSecurity: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="maximum">Maximum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                      </div>
                      <Switch
                        id="twoFactor"
                        checked={securitySettings.enableTwoFactor}
                        onCheckedChange={(checked) =>
                          setSecuritySettings((prev) => ({ ...prev, enableTwoFactor: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auditLog">Audit Logging</Label>
                        <p className="text-sm text-gray-600">Log all admin actions</p>
                      </div>
                      <Switch
                        id="auditLog"
                        checked={securitySettings.enableAuditLog}
                        onCheckedChange={(checked) =>
                          setSecuritySettings((prev) => ({ ...prev, enableAuditLog: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Login Protection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        min="3"
                        max="10"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            maxLoginAttempts: Number.parseInt(e.target.value) || 5,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        min="5"
                        max="60"
                        value={securitySettings.lockoutDuration}
                        onChange={(e) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            lockoutDuration: Number.parseInt(e.target.value) || 15,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure notification preferences and channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Channels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-gray-600">Browser notifications</p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={notificationSettings.enablePushNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, enablePushNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Email alerts</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notificationSettings.enableEmailNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, enableEmailNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Text message alerts</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={notificationSettings.enableSMSNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, enableSMSNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Event Notifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="newRegistration">New Registration</Label>
                        <p className="text-sm text-gray-600">When a new user registers</p>
                      </div>
                      <Switch
                        id="newRegistration"
                        checked={notificationSettings.notifyOnNewRegistration}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notifyOnNewRegistration: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="examCompletion">Exam Completion</Label>
                        <p className="text-sm text-gray-600">When a student completes an exam</p>
                      </div>
                      <Switch
                        id="examCompletion"
                        checked={notificationSettings.notifyOnExamCompletion}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notifyOnExamCompletion: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="moduleCompletion">Module Completion</Label>
                        <p className="text-sm text-gray-600">When a student completes a module</p>
                      </div>
                      <Switch
                        id="moduleCompletion"
                        checked={notificationSettings.notifyOnModuleCompletion}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notifyOnModuleCompletion: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="systemErrors">System Errors</Label>
                        <p className="text-sm text-gray-600">When system errors occur</p>
                      </div>
                      <Switch
                        id="systemErrors"
                        checked={notificationSettings.notifyOnSystemErrors}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notifyOnSystemErrors: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Notification Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={notificationSettings.adminNotificationEmail}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({ ...prev, adminNotificationEmail: e.target.value }))
                    }
                    placeholder="admin@keeleseiklus.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system performance and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Backup & Maintenance</h3>
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select
                        value={systemSettings.backupFrequency}
                        onValueChange={(value: any) =>
                          setSystemSettings((prev) => ({ ...prev, backupFrequency: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retentionPeriod">Data Retention Period (days)</Label>
                      <Input
                        id="retentionPeriod"
                        type="number"
                        min="7"
                        max="365"
                        value={systemSettings.retentionPeriod}
                        onChange={(e) =>
                          setSystemSettings((prev) => ({
                            ...prev,
                            retentionPeriod: Number.parseInt(e.target.value) || 30,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxFileSize">Max File Upload Size (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        min="1"
                        max="100"
                        value={systemSettings.maxFileUploadSize}
                        onChange={(e) =>
                          setSystemSettings((prev) => ({
                            ...prev,
                            maxFileUploadSize: Number.parseInt(e.target.value) || 10,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Performance</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="cacheEnabled">Enable Caching</Label>
                          <p className="text-sm text-gray-600">Improve performance</p>
                        </div>
                        <Switch
                          id="cacheEnabled"
                          checked={systemSettings.cacheEnabled}
                          onCheckedChange={(checked) =>
                            setSystemSettings((prev) => ({ ...prev, cacheEnabled: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="compressionEnabled">Enable Compression</Label>
                          <p className="text-sm text-gray-600">Reduce bandwidth usage</p>
                        </div>
                        <Switch
                          id="compressionEnabled"
                          checked={systemSettings.compressionEnabled}
                          onCheckedChange={(checked) =>
                            setSystemSettings((prev) => ({ ...prev, compressionEnabled: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Monitoring & Debugging</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="analytics">Enable Analytics</Label>
                        <p className="text-sm text-gray-600">Track usage statistics</p>
                      </div>
                      <Switch
                        id="analytics"
                        checked={systemSettings.enableAnalytics}
                        onCheckedChange={(checked) =>
                          setSystemSettings((prev) => ({ ...prev, enableAnalytics: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="errorReporting">Error Reporting</Label>
                        <p className="text-sm text-gray-600">Automatic error reports</p>
                      </div>
                      <Switch
                        id="errorReporting"
                        checked={systemSettings.enableErrorReporting}
                        onCheckedChange={(checked) =>
                          setSystemSettings((prev) => ({ ...prev, enableErrorReporting: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="debugMode">Debug Mode</Label>
                        <p className="text-sm text-gray-600">Show detailed errors</p>
                      </div>
                      <Switch
                        id="debugMode"
                        checked={systemSettings.debugMode}
                        onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, debugMode: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Data Management</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setShowBackupDialog(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Create Backup
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={restoreBackup}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                        <Upload className="w-4 h-4" />
                        Restore Backup
                      </Button>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                          Reset to Defaults
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset All Settings</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will reset all settings to their default values. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={resetToDefaults}>Reset Settings</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {lastBackup && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Last backup: {new Date(lastBackup).toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Backup Dialog */}
        <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create System Backup</DialogTitle>
              <DialogDescription>
                This will create a complete backup of all system data including students, modules, exams, and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-emerald-600" />
                <div className="text-sm">
                  <p className="font-medium">Backup will include:</p>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    <li>All student data and progress</li>
                    <li>Module content and settings</li>
                    <li>Exam results and templates</li>
                    <li>System configuration (passwords excluded)</li>
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createBackup} className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
