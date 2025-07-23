// app/admin/communication/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, Mail, Bell, History, LayoutTemplateIcon as Template, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch"; // Import Switch for notification settings
import { toast } from "sonner"; // Assuming you have sonner installed and configured
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

// Interfaces to match Prisma models and API responses
interface Student {
  id: number; // Matches Prisma Int ID
  name: string;
  email: string;
  status: "active" | "inactive" | "premium"; // Ensure this matches your Prisma enum/string values
  progress: number;
  lastActive: string; // ISO date string or YYYY-MM-DD
  completedModules: number; // Count from student_modules
  subscription_status: string; // From Prisma
}

interface EmailTemplate {
  id: number; // Matches Prisma Int ID
  name: string;
  subject: string;
  content: string;
  category: "welcome" | "progress" | "reminder" | "certificate" | "general"; // Use 'category' as per schema
}

interface EmailHistoryItem {
  id: number; // Matches Prisma Int ID
  to_emails: string[]; // Parsed JSON string from DB
  subject: string;
  sent_at?: string; // ISO string, optional if scheduled
  scheduled_at?: string; // ISO string, optional if sent immediately
  status: "sent" | "failed" | "pending" | "scheduled"; // Added "scheduled"
  recipients_count: number; // Matches Prisma field
  content: string; // For detail view if needed
  priority: string; // From DB
}

interface NotificationSettings {
  id?: number; // Optional if not yet created in DB
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

export default function CommunicationHub() {
  const router = useRouter();
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
    type: "individual", // This 'type' is for frontend use, not directly mapped to DB
  });

  // FIXED: Correct useState declarations for templates and students
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    welcome_email_enabled: true,
    inactivity_reminder_enabled: false,
    achievement_notification_enabled: true,
    notify_on_module_completion: false,
    enable_push_notifications: true,
    enable_email_notifications: true,
    enable_sms_notifications: false,
    notify_on_new_registration: true,
    notify_on_exam_completion: true,
    notify_on_system_errors: true,
    admin_notification_email: "",
  });

  const [students, setStudents] = useState<Student[]>([]); // FIXED: Ensure this is Student[]
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("compose");

  // Character count state
  const [characterCount, setCharacterCount] = useState(0);

  // --- Data Fetching on Mount ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch Email Templates
        const templatesResponse = await fetch("/api/communication/templates");
        if (!templatesResponse.ok) throw new Error("Failed to fetch email templates.");
        const fetchedTemplates: EmailTemplate[] = await templatesResponse.json();
        setTemplates(fetchedTemplates); // FIXED: Changed setEmailTemplates to setTemplates

        // Fetch Email History
        const historyResponse = await fetch("/api/communication/history");
        if (!historyResponse.ok) throw new Error("Failed to fetch email history.");
        const fetchedHistory: EmailHistoryItem[] = await historyResponse.json();
        setEmailHistory(fetchedHistory);

        // Fetch Notification Settings
        const notificationSettingsResponse = await fetch("/api/communication/notification-settings");
        if (!notificationSettingsResponse.ok) throw new Error("Failed to fetch notification settings.");
        const fetchedNotificationSettings: NotificationSettings = await notificationSettingsResponse.json();
        setNotificationSettings(fetchedNotificationSettings);

        // Fetch Students (for recipient selection in Compose tab)
        const studentsResponse = await fetch("/api/communication/students?filter=all");
        if (!studentsResponse.ok) throw new Error("Failed to fetch students for recipient list.");
        const fetchedStudents: Student[] = await studentsResponse.json(); // Explicitly type as Student[]
        setStudents(fetchedStudents); // FIXED: Changed setStudents to setStudents

        // Check for pre-filled email from URL params (for 'Compose' tab)
        const urlParams = new URLSearchParams(window.location.search);
        const toEmail = urlParams.get("student"); // Changed from 'to' to 'student' to match your compose page logic
        if (toEmail) {
          const student = fetchedStudents.find((s: Student) => s.id.toString() === toEmail); // Find student by ID (number)
          if (student) {
            setEmailData((prev) => ({ ...prev, to: student.email }));
            setActiveTab("compose"); // Ensure compose tab is active if pre-filled
          }
        }

      } catch (err: any) {
        console.error("Error loading communication hub data:", err);
        setError(err.message || "An unexpected error occurred while loading data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Effect to update character count
  useEffect(() => {
    setCharacterCount(emailData.message.length);
  }, [emailData.message]); // Depend only on emailData.message for character count

  const handleBulkSelect = (type: string) => {
    let emails: string[] = [];
    switch (type) {
      case "all":
        emails = students.map((s) => s.email);
        break;
      case "active":
        emails = students.filter((s) => s.status === "active").map((s) => s.email);
        break;
      case "premium":
        emails = students.filter((s) => s.subscription_status === "premium").map((s) => s.email);
        break;
      case "free":
        emails = students.filter((s) => s.subscription_status === "free").map((s) => s.email);
        break;
    }
    setEmailData({ ...emailData, to: emails.join(", ") });
  };

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      alert("Please fill in all email fields (To, Subject, Message)");
      return;
    }

    const recipientEmails = emailData.to.split(",").map((email) => email.trim()).filter(Boolean);
    if (recipientEmails.length === 0) {
      alert("Please add at least one valid recipient email address.");
      return;
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmails,
          cc: [],
          bcc: [],
          subject: emailData.subject,
          content: emailData.message,
          priority: "normal",
          personalizeContent: true,
          // selectedTemplate: composition.selectedTemplate ? parseInt(composition.selectedTemplate, 10) : undefined, // This was from ComposeEmailPage, not CommunicationHub
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send email.");
      }

      // After successful send, reload history and clear form
      await loadData(); // Reload all data to update history
      setEmailData({ to: "", subject: "", message: "", type: "individual" }); // Clear form
      toast.success("Email sent successfully!");

    } catch (err: any) {
      console.error("Error sending email:", err);
      toast.error(`Error sending email: ${err.message}`);
    }
  };

  const handleEditTemplate = (templateId: number) => {
    router.push(`/admin/communication/templates/${templateId}/edit`);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      const response = await fetch(`/api/communication/templates/${templateId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template.");
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success("Template deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting template:", err);
      toast.error(`Failed to delete template: ${err.message}`);
    }
  };

  const handleNotificationSettingChange = (field: keyof NotificationSettings, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveNotificationSettings = async () => {
    try {
      const response = await fetch("/api/communication/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationSettings),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save notification settings.");
      }
      toast.success("Notification settings saved successfully!");
    } catch (err: any) {
      console.error("Error saving notification settings:", err);
      toast.error(`Failed to save notification settings: ${err.message}`);
    }
  };

  // Function to apply template content to emailData
  const useTemplate = (template: EmailTemplate) => {
    setEmailData((prev) => ({
      ...prev,
      subject: template.subject,
      message: template.content,
    }));
    setActiveTab("compose"); // Switch to compose tab
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communication hub data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </CardContent>
        </Card>
      </div>
    );
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
                      Active Only ({students.filter((s) => s.status === "active").length})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkSelect("premium")}>
                      Premium Only ({students.filter((s) => s.subscription_status === "premium").length})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkSelect("free")}>
                      Free Only ({students.filter((s) => s.subscription_status === "free").length})
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
                      // This is a simplified local storage save, ideally integrate with /api/communication/drafts POST
                      localStorage.setItem("emailDraft", JSON.stringify(emailData));
                      toast.success("Draft saved successfully!");
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
              <Link href="/admin/communication/templates/new">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="capitalize">{template.category} template</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Link href={`/admin/communication/templates/${template.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTemplate(template.id)}>
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
                      <Button size="sm" className="w-full" onClick={() => {
                        setEmailData(prev => ({ ...prev, subject: template.subject, message: template.content }));
                        setActiveTab("compose"); // Switch to compose tab
                      }}>
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
                          <td className="p-4 font-medium">{email.to_emails.join(', ')}</td> {/* Display joined emails */}
                          <td className="p-4">{email.subject}</td>
                          <td className="p-4 text-sm text-gray-600">
                            {email.sent_at ? new Date(email.sent_at).toLocaleString() :
                             email.scheduled_at ? new Date(email.scheduled_at).toLocaleString() + ' (Scheduled)' : 'N/A'}
                          </td>
                          <td className="p-4 text-sm">{email.recipients_count}</td> {/* Use recipients_count */}
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                email.status === "sent"
                                  ? "bg-green-100 text-green-700"
                                  : email.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : email.status === "scheduled"
                                  ? "bg-blue-100 text-blue-700" // New style for scheduled
                                  : "bg-yellow-100 text-yellow-700" // For pending or unknown
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
                      <h4 className="font-medium">Welcome Email Enabled</h4>
                      <p className="text-sm text-gray-600">Send welcome email to new students</p>
                    </div>
                    <Switch
                      checked={notificationSettings.welcome_email_enabled}
                      onCheckedChange={(checked) => handleNotificationSettingChange("welcome_email_enabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Module Completion Notifications</h4>
                      <p className="text-sm text-gray-600">Congratulate students on module completion</p>
                    </div>
                    <Switch
                      checked={notificationSettings.notify_on_module_completion}
                      onCheckedChange={(checked) => handleNotificationSettingChange("notify_on_module_completion", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Inactivity Reminder Enabled</h4>
                      <p className="text-sm text-gray-600">Remind inactive students to continue learning</p>
                    </div>
                    <Switch
                      checked={notificationSettings.inactivity_reminder_enabled}
                      onCheckedChange={(checked) => handleNotificationSettingChange("inactivity_reminder_enabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Achievement Notifications Enabled</h4>
                      <p className="text-sm text-gray-600">Notify students when they earn achievements</p>
                    </div>
                    <Switch
                      checked={notificationSettings.achievement_notification_enabled}
                      onCheckedChange={(checked) => handleNotificationSettingChange("achievement_notification_enabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Notifications Enabled</h4>
                      <p className="text-sm text-gray-600">Enable sending all email notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.enable_email_notifications}
                      onCheckedChange={(checked) => handleNotificationSettingChange("enable_email_notifications", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Notification Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={notificationSettings.admin_notification_email}
                      onChange={(e) => handleNotificationSettingChange("admin_notification_email", e.target.value)}
                      placeholder="admin@yourdomain.com"
                    />
                    <p className="text-sm text-gray-500">System errors and critical alerts will be sent to this email.</p>
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={saveNotificationSettings}>
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}