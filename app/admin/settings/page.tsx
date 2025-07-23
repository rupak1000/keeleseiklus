// app/admin/settings/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { toast } from "sonner";

// Interfaces to match Prisma models (snake_case from DB)
interface GeneralSettings {
  id?: number;
  app_name: string;
  app_description: string;
  support_email: string;
  default_language: string;
  timezone: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  guest_access_enabled: boolean;
  max_students_per_class: number;
  session_timeout: number; // in minutes
  updated_at?: string;
}

interface EmailSettings {
  id?: number;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  enable_welcome_emails: boolean;
  enable_progress_emails: boolean;
  enable_certificate_emails: boolean;
  enable_reminder_emails: boolean;
  email_frequency: "daily" | "weekly" | "monthly";
  updated_at?: string;
}

interface SecuritySettings {
  id?: number;
  password_min_length: number;
  require_special_chars: boolean;
  require_numbers: boolean;
  require_uppercase: boolean;
  enable_two_factor: boolean;
  session_security: "standard" | "high" | "maximum";
  ip_whitelist: string[];
  max_login_attempts: number;
  lockout_duration: number; // in minutes
  enable_audit_log: boolean;
  updated_at?: string;
}

interface NotificationSettings {
  id?: number;
  welcome_email_enabled: boolean;
  inactivity_reminder_enabled: boolean;
  achievement_notification_enabled: boolean;
  notify_on_module_completion: boolean;
  enable_push_notifications: boolean;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  notify_on_new_registration: boolean;
  notify_on_exam_completion: boolean;
  notify_on_system_errors: boolean;
  admin_notification_email: string;
  updated_at?: string;
}

interface SystemSettings {
  id?: number;
  backup_frequency: "daily" | "weekly" | "monthly";
  retention_period: number; // in days
  enable_analytics: boolean;
  enable_error_reporting: boolean;
  debug_mode: boolean;
  cache_enabled: boolean;
  compression_enabled: boolean;
  max_file_upload_size: number; // in MB
  subscription_enabled: boolean;
  free_module_limit: number;
  premium_required: boolean;
  updated_at?: string;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); // New error state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false); // This dialog is not implemented in logic
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    app_name: "Keele Seiklus", app_description: "Interactive Language Learning Platform",
    support_email: "support@keeleseiklus.com", default_language: "en",
    timezone: "Europe/Tallinn", maintenance_mode: false, registration_enabled: true,
    guest_access_enabled: true, max_students_per_class: 30, session_timeout: 60,
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtp_host: "", smtp_port: 587, smtp_username: "", smtp_password: "",
    from_email: "noreply@keeleseiklus.com", from_name: "Keele Seiklus",
    enable_welcome_emails: true, enable_progress_emails: true,
    enable_certificate_emails: true, enable_reminder_emails: false,
    email_frequency: "weekly",
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    password_min_length: 8, require_special_chars: true, require_numbers: true,
    require_uppercase: true, enable_two_factor: false, session_security: "standard",
    ip_whitelist: [], max_login_attempts: 5, lockout_duration: 15, enable_audit_log: true,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enable_push_notifications: true, enable_email_notifications: true, enable_sms_notifications: false,
    notify_on_new_registration: true, notify_on_exam_completion: true, notify_on_module_completion: false,
    notify_on_system_errors: true, admin_notification_email: "admin@keeleseiklus.com",
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    backup_frequency: "daily", retention_period: 30, enable_analytics: true,
    enable_error_reporting: true, debug_mode: false, cache_enabled: true,
    compression_enabled: true, max_file_upload_size: 10, subscription_enabled: true,
    free_module_limit: 10, premium_required: true,
  });


  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch General Settings
        const generalRes = await fetch("/api/settings/general");
        if (!generalRes.ok) throw new Error("Failed to fetch general settings.");
        const fetchedGeneralSettings = await generalRes.json();
        setGeneralSettings(fetchedGeneralSettings); // State keys match DB keys

        // Fetch Email Settings
        const emailRes = await fetch("/api/settings/email");
        if (!emailRes.ok) throw new Error("Failed to fetch email settings.");
        const fetchedEmailSettings = await emailRes.json();
        setEmailSettings(fetchedEmailSettings); // State keys match DB keys

        // Fetch Security Settings
        const securityRes = await fetch("/api/settings/security");
        if (!securityRes.ok) throw new Error("Failed to fetch security settings.");
        setSecuritySettings(await securityRes.json()); // State keys match DB keys

        // Fetch Notification Settings
        const notificationRes = await fetch("/api/settings/notifications");
        if (!notificationRes.ok) throw new Error("Failed to fetch notification settings.");
        setNotificationSettings(await notificationRes.json()); // State keys match DB keys

        // Fetch System Settings
        const systemRes = await fetch("/api/settings/system");
        if (!systemRes.ok) throw new Error("Failed to fetch system settings.");
        setSystemSettings(await systemRes.json()); // State keys match DB keys

        // Fetch Last Backup Date
        const backupRes = await fetch("/api/settings/backup");
        if (backupRes.ok) {
          const fetchedLastBackup = await backupRes.json();
          setLastBackup(fetchedLastBackup);
        } else {
          console.warn("Failed to fetch last backup date.");
          setLastBackup(null);
        }

      } catch (err: any) {
        console.error("Error loading settings:", err);
        setError(err.message || "An unexpected error occurred while loading settings.");
        // Ensure default fallback values are set on error
        setGeneralSettings({ /* ... default values ... */ });
        setEmailSettings({ /* ... default values ... */ });
        setSecuritySettings({ /* ... default values ... */ });
        setNotificationSettings({ /* ... default values ... */ });
        setSystemSettings({ /* ... default values ... */ });
        setLastBackup(null);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      // Save General Settings
      const generalRes = await fetch("/api/settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generalSettings), // State keys match DB keys
      });
      if (!generalRes.ok) throw new Error("Failed to save general settings.");

      // Save Email Settings
      const emailRes = await fetch("/api/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailSettings), // State keys match DB keys
      });
      if (!emailRes.ok) throw new Error("Failed to save email settings.");

      // Save Security Settings
      const securityRes = await fetch("/api/settings/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(securitySettings), // State keys match DB keys
      });
      if (!securityRes.ok) throw new Error("Failed to save security settings.");

      // Save Notification Settings
      const notificationRes = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationSettings), // State keys match DB keys
      });
      if (!notificationRes.ok) throw new Error("Failed to save notification settings.");

      // Save System Settings
      const systemRes = await fetch("/api/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemSettings), // State keys match DB keys
      });
      if (!systemRes.ok) throw new Error("Failed to save system settings.");

      toast.success("All settings saved successfully!");
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setError(err.message || "An unexpected error occurred while saving settings.");
      toast.error(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const testEmailConnection = async () => {
    toast.info("Testing email connection...");
    try {
      // Ensure all necessary fields are present before sending
      if (!emailSettings.smtp_host || !emailSettings.smtp_port || !emailSettings.smtp_username || !emailSettings.smtp_password || !emailSettings.from_email || !emailSettings.from_name) {
        throw new Error("All SMTP fields (Host, Port, Username, Password, From Email, From Name) must be filled to test connection.");
      }

      const response = await fetch("/api/settings/email/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send snake_case fields directly to match API's expected body
        body: JSON.stringify({
          smtpHost: emailSettings.smtp_host,
          smtpPort: emailSettings.smtp_port,
          smtpUsername: emailSettings.smtp_username,
          smtpPassword: emailSettings.smtp_password,
          fromEmail: emailSettings.from_email,
          fromName: emailSettings.from_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Email connection test failed.");
      }
      toast.success("Email connection test successful!");
    } catch (error: any) {
      console.error("Email connection test failed:", error);
      toast.error(`Email connection test failed: ${error.message}`);
    }
  };

  const createBackup = async () => {
    toast.info("Creating backup...");
    try {
      // Fetch all data from backend APIs to include in backup file
      const [studentsRes, modulesRes, examResultsRes, generalSettingsRes, emailSettingsRes, securitySettingsRes, notificationSettingsRes, systemSettingsRes] = await Promise.all([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/modules', { cache: 'no-store' }),
        fetch('/api/analytics/exam-results', { cache: 'no-store' }), // Re-use this for exam results
        fetch('/api/settings/general', { cache: 'no-store' }),
        fetch('/api/settings/email', { cache: 'no-store' }),
        fetch('/api/settings/security', { cache: 'no-store' }),
        fetch('/api/settings/notifications', { cache: 'no-store' }),
        fetch('/api/settings/system', { cache: 'no-store' }),
      ]);

      const allData = {
        students: studentsRes.ok ? await studentsRes.json() : [],
        modules: modulesRes.ok ? await modulesRes.json() : [],
        examResults: examResultsRes.ok ? await examResultsRes.json() : [],
        generalSettings: generalSettingsRes.ok ? await generalSettingsRes.json() : {},
        emailSettings: emailSettingsRes.ok ? { ...(await emailSettingsRes.json()), smtp_password: "[REDACTED]" } : {}, // Redact password
        securitySettings: securitySettingsRes.ok ? await securitySettingsRes.json() : {},
        notificationSettings: notificationSettingsRes.ok ? await notificationSettingsRes.json() : {},
        systemSettings: systemSettingsRes.ok ? await systemSettingsRes.json() : {},
        backupDate: new Date().toISOString(),
      };

      const fileName = `keele-seiklus-backup-${new Date().toISOString().split("T")[0]}.json`;
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      // Record backup event in database
      const backupRecordResponse = await fetch("/api/settings/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: fileName, fileSize: blob.size }),
      });
      if (!backupRecordResponse.ok) throw new Error("Failed to record backup event in database.");

      const backupDate = new Date().toISOString();
      setLastBackup(backupDate);
      setShowBackupDialog(false);
      toast.success("Backup created and recorded successfully!");
    } catch (error: any) {
      console.error("Error creating backup:", error);
      toast.error(`Error creating backup: ${error.message}`);
    }
  };

  const restoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.info("Restoring backup...");
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);

        // Send each settings type to its respective PUT API
        if (backupData.generalSettings) {
          const res = await fetch("/api/settings/general", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(backupData.generalSettings) });
          if (!res.ok) throw new Error("Failed to restore General Settings.");
        }
        if (backupData.emailSettings) {
          const res = await fetch("/api/settings/email", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(backupData.emailSettings) });
          if (!res.ok) throw new Error("Failed to restore Email Settings.");
        }
        if (backupData.securitySettings) {
          const res = await fetch("/api/settings/security", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(backupData.securitySettings) });
          if (!res.ok) throw new Error("Failed to restore Security Settings.");
        }
        if (backupData.notificationSettings) {
          const res = await fetch("/api/settings/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(backupData.notificationSettings) });
          if (!res.ok) throw new Error("Failed to restore Notification Settings.");
        }
        if (backupData.systemSettings) {
          const res = await fetch("/api/settings/system", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(backupData.systemSettings) });
          if (!res.ok) throw new Error("Failed to restore System Settings.");
        }

        // For students, modules, exam results: This would typically involve more complex APIs
        // that accept bulk data and handle upserts/deletes.
        // For simplicity, this example just logs that they would be restored.
        // In a real app, you'd have POST/PUT endpoints for /api/students/bulk, /api/modules/bulk etc.
        if (backupData.students) console.log("Would restore students to DB via API:", backupData.students.length);
        if (backupData.modules) console.log("Would restore modules to DB via API:", backupData.modules.length);
        if (backupData.examResults) console.log("Would restore exam results to DB via API:", backupData.examResults.length);

        toast.success("Backup restored successfully! Please refresh the page.");
        window.location.reload(); // Full page reload to reflect new settings
      } catch (error: any) {
        console.error("Error restoring backup:", error);
        toast.error(`Error restoring backup: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const resetToDefaults = async () => {
    if (!window.confirm("Are you sure you want to reset all settings to defaults? This action cannot be undone.")) {
      return;
    }
    toast.info("Resetting settings to defaults...");
    try {
      // Call DELETE APIs for each settings type to reset them
      await Promise.all([
        fetch("/api/settings/general", { method: "DELETE" }),
        fetch("/api/settings/email", { method: "DELETE" }),
        fetch("/api/settings/security", { method: "DELETE" }),
        fetch("/api/settings/notifications", { method: "DELETE" }),
        fetch("/api/settings/system", { method: "DELETE" }),
        fetch("/api/settings/backup", { method: "DELETE" }), // Clear backup records
      ]);

      // Reload settings from API to get the new default values
      await loadSettings();
      toast.success("Settings reset to defaults successfully!");
    } catch (error: any) {
      console.error("Error resetting settings:", error);
      toast.error(`Failed to reset settings: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Settings</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
                        value={generalSettings.app_name}
                        onChange={(e) => setGeneralSettings((prev) => ({ ...prev, app_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={generalSettings.support_email}
                        onChange={(e) => setGeneralSettings((prev) => ({ ...prev, support_email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultLanguage">Default Language</Label>
                      <Select
                        value={generalSettings.default_language}
                        onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, default_language: value }))}
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
                        value={generalSettings.app_description}
                        onChange={(e) => setGeneralSettings((prev) => ({ ...prev, app_description: e.target.value }))}
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
                        value={generalSettings.max_students_per_class}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            max_students_per_class: Number.parseInt(e.target.value) || 30,
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
                        value={generalSettings.session_timeout}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            session_timeout: Number.parseInt(e.target.value) || 60,
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
                        checked={generalSettings.maintenance_mode}
                        onCheckedChange={(checked) =>
                          setGeneralSettings((prev) => ({ ...prev, maintenance_mode: checked }))
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
                        checked={generalSettings.registration_enabled}
                        onCheckedChange={(checked) =>
                          setGeneralSettings((prev) => ({ ...prev, registration_enabled: checked }))
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
                        checked={generalSettings.guest_access_enabled}
                        onCheckedChange={(checked) =>
                          setGeneralSettings((prev) => ({ ...prev, guest_access_enabled: checked }))
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
                        value={emailSettings.smtp_host || ""}
                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtp_host: e.target.value }))}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={emailSettings.smtp_port}
                        onChange={(e) =>
                          setEmailSettings((prev) => ({ ...prev, smtp_port: Number.parseInt(e.target.value) || 587 }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        value={emailSettings.smtp_username || ""}
                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtp_username: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <div className="relative">
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={emailSettings.smtp_password || ""}
                          onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtp_password: e.target.value }))}
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
                        value={emailSettings.from_email}
                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, from_email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={emailSettings.from_name}
                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, from_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailFrequency">Email Frequency</Label>
                      <Select
                        value={emailSettings.email_frequency}
                        onValueChange={(value: any) => setEmailSettings((prev) => ({ ...prev, email_frequency: value }))}
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
                        checked={emailSettings.enable_welcome_emails}
                        onCheckedChange={(checked) =>
                          setEmailSettings((prev) => ({ ...prev, enable_welcome_emails: checked }))
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
                        checked={emailSettings.enable_progress_emails}
                        onCheckedChange={(checked) =>
                          setEmailSettings((prev) => ({ ...prev, enable_progress_emails: checked }))
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
                        checked={emailSettings.enable_certificate_emails}
                        onCheckedChange={(checked) =>
                          setEmailSettings((prev) => ({ ...prev, enable_certificate_emails: checked }))
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
                        checked={emailSettings.enable_reminder_emails}
                        onCheckedChange={(checked) =>
                          setEmailSettings((prev) => ({ ...prev, enable_reminder_emails: checked }))
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
                        value={securitySettings.password_min_length}
                        onChange={(e) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            password_min_length: Number.parseInt(e.target.value) || 8,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requireSpecial">Require Special Characters</Label>
                        <Switch
                          id="requireSpecial"
                          checked={securitySettings.require_special_chars}
                          onCheckedChange={(checked) =>
                            setSecuritySettings((prev) => ({ ...prev, require_special_chars: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requireNumbers">Require Numbers</Label>
                        <Switch
                          id="requireNumbers"
                          checked={securitySettings.require_numbers}
                          onCheckedChange={(checked) =>
                            setSecuritySettings((prev) => ({ ...prev, require_numbers: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requireUppercase">Require Uppercase</Label>
                        <Switch
                          id="requireUppercase"
                          checked={securitySettings.require_uppercase}
                          onCheckedChange={(checked) =>
                            setSecuritySettings((prev) => ({ ...prev, require_uppercase: checked }))
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
                        value={securitySettings.session_security}
                        onValueChange={(value: any) =>
                          setSecuritySettings((prev) => ({ ...prev, session_security: value }))
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
                        checked={securitySettings.enable_two_factor}
                        onCheckedChange={(checked) =>
                          setSecuritySettings((prev) => ({ ...prev, enable_two_factor: checked }))
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
                        checked={securitySettings.enable_audit_log}
                        onCheckedChange={(checked) =>
                          setSecuritySettings((prev) => ({ ...prev, enable_audit_log: checked }))
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
                        value={securitySettings.max_login_attempts}
                        onChange={(e) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            max_login_attempts: Number.parseInt(e.target.value) || 5,
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
                        value={securitySettings.lockout_duration}
                        onChange={(e) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            lockout_duration: Number.parseInt(e.target.value) || 15,
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
                        checked={notificationSettings.enable_push_notifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, enable_push_notifications: checked }))
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
                        checked={notificationSettings.enable_email_notifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, enable_email_notifications: checked }))
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
                        checked={notificationSettings.enable_sms_notifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, enable_sms_notifications: checked }))
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
                        checked={notificationSettings.notify_on_new_registration}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notify_on_new_registration: checked }))
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
                        checked={notificationSettings.notify_on_exam_completion}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notify_on_exam_completion: checked }))
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
                        checked={notificationSettings.notify_on_module_completion}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notify_on_module_completion: checked }))
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
                        checked={notificationSettings.notify_on_system_errors}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notify_on_system_errors: checked }))
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
                    value={notificationSettings.admin_notification_email}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({ ...prev, admin_notification_email: e.target.value }))
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
                        value={systemSettings.backup_frequency}
                        onValueChange={(value: any) =>
                          setSystemSettings((prev) => ({ ...prev, backup_frequency: value }))
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
                        value={systemSettings.retention_period}
                        onChange={(e) =>
                          setSystemSettings((prev) => ({
                            ...prev,
                            retention_period: Number.parseInt(e.target.value) || 30,
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
                        value={systemSettings.max_file_upload_size}
                        onChange={(e) =>
                          setSystemSettings((prev) => ({
                            ...prev,
                            max_file_upload_size: Number.parseInt(e.target.value) || 10,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Performance</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cacheEnabled">Enable Caching</Label>
                        <Switch
                          id="cacheEnabled"
                          checked={systemSettings.cache_enabled}
                          onCheckedChange={(checked) =>
                            setSystemSettings((prev) => ({ ...prev, cache_enabled: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compressionEnabled">Enable Compression</Label>
                        <Switch
                          id="compressionEnabled"
                          checked={systemSettings.compression_enabled}
                          onCheckedChange={(checked) =>
                            setSystemSettings((prev) => ({ ...prev, compression_enabled: checked }))
                          }
                        />
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
                          checked={systemSettings.enable_analytics}
                          onCheckedChange={(checked) =>
                            setSystemSettings((prev) => ({ ...prev, enable_analytics: checked }))
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
                          checked={systemSettings.enable_error_reporting}
                          onCheckedChange={(checked) =>
                            setSystemSettings((prev) => ({ ...prev, enable_error_reporting: checked }))
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
                          checked={systemSettings.debug_mode}
                          onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, debug_mode: checked }))}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
