// app/admin/communication/compose/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Send, Save, Eye, Users, Mail, Clock, Star, X, Target, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define interfaces to match your Prisma models and API responses
interface Student {
  id: number; // FIXED: Changed to number to match Prisma Student.id
  name: string;
  email: string;
  status: "active" | "inactive" | "premium"; // Based on your frontend enum
  progress: number; // Now available on Student model
  lastActive: string; // ISO string from backend, formatted for display
  completedModules: number; // Count of completed student_modules
  subscription_status: string; // Added to match backend
}

interface EmailTemplate {
  id: number; // FIXED: Changed to number to match Prisma EmailTemplate.id
  name: string;
  subject: string;
  content: string;
  category: "welcome" | "progress" | "reminder" | "certificate" | "general";
}

interface EmailComposition {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  content: string;
  priority: "low" | "normal" | "high";
  scheduleDate?: string; // YYYY-MM-DD
  scheduleTime?: string; // HH:MM
  useTemplate: boolean;
  selectedTemplate?: string; // Template ID (string, for Select component value)
  personalizeContent: boolean;
}

export default function ComposeEmailPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [composition, setComposition] = useState<EmailComposition>({
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    content: "",
    priority: "normal",
    useTemplate: false,
    personalizeContent: true,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]); // FIXED: Changed to number[]
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [isDraft, setIsDraft] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch Students
        const studentsResponse = await fetch("/api/communication/students?filter=all");
        if (!studentsResponse.ok) throw new Error("Failed to fetch students.");
        const fetchedStudents: Student[] = await studentsResponse.json();
        setStudents(fetchedStudents);

        // Fetch Email Templates
        const templatesResponse = await fetch("/api/communication/templates");
        if (!templatesResponse.ok) throw new Error("Failed to fetch email templates.");
        const fetchedTemplates: EmailTemplate[] = await templatesResponse.json();
        setEmailTemplates(fetchedTemplates);

        // Load Draft (from backend API)
        const draftResponse = await fetch("/api/communication/drafts");
        if (draftResponse.ok) {
          const fetchedDraft = await draftResponse.json();
          if (fetchedDraft) {
            // Ensure array fields are parsed if stored as JSON strings in DB
            setComposition({
              ...fetchedDraft,
              to: fetchedDraft.to_emails ? JSON.parse(fetchedDraft.to_emails) : [], // Use correct DB field name
              cc: fetchedDraft.cc_emails ? JSON.parse(fetchedDraft.cc_emails) : [], // Use correct DB field name
              bcc: fetchedDraft.bcc_emails ? JSON.parse(fetchedDraft.bcc_emails) : [], // Use correct DB field name
              // Convert scheduleDate to YYYY-MM-DD for input type="date"
              scheduleDate: fetchedDraft.schedule_date ? new Date(fetchedDraft.schedule_date).toISOString().split('T')[0] : undefined,
              selectedTemplate: fetchedDraft.selected_template_id ? fetchedDraft.selected_template_id.toString() : undefined, // Convert Int to String
            });
            setIsDraft(true);
          }
        } else {
            // If draft API returns 404 or other non-OK, it just means no draft
            console.log("No draft found or error fetching draft, starting fresh.");
        }

      } catch (err: any) {
        console.error("Error loading initial data:", err);
        setError(err.message || "An unexpected error occurred while loading data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setCharacterCount(composition.content.length);
  }, [composition.content]);

  const getFilteredStudents = () => {
    // This now filters the fetched 'students' state
    switch (recipientFilter) {
      case "active":
        return students.filter((s) => s.status === "active");
      case "premium":
        return students.filter((s) => s.subscription_status === "premium"); // FIXED: Use subscription_status
      case "high-progress":
        return students.filter((s) => s.progress >= 70);
      case "low-progress":
        return students.filter((s) => s.progress < 30);
      case "inactive":
        return students.filter((s) => s.status === "inactive");
      default:
        return students;
    }
  };

  const addRecipient = (email: string, field: "to" | "cc" | "bcc") => {
    if (!composition[field].includes(email)) {
      setComposition((prev) => ({
        ...prev,
        [field]: [...prev[field], email],
      }));
    }
  };

  const removeRecipient = (email: string, field: "to" | "cc" | "bcc") => {
    setComposition((prev) => ({
      ...prev,
      [field]: prev[field].filter((e) => e !== email),
    }));
  };

  const addSelectedStudents = (field: "to" | "cc" | "bcc") => {
    const selectedEmails = students
      .filter((s) => selectedStudents.includes(s.id)) // s.id is now number
      .map((s) => s.email)
      .filter((email) => !composition[field].includes(email));

    setComposition((prev) => ({
      ...prev,
      [field]: [...prev[field], ...selectedEmails],
    }));
    setSelectedStudents([]);
  };

  const selectAllFiltered = () => {
    const filteredIds = getFilteredStudents().map((s) => s.id); // s.id is number
    setSelectedStudents(filteredIds);
  };

  const applyTemplate = (templateId: string) => { // templateId is string from Select
    const template = emailTemplates.find((t) => t.id.toString() === templateId); // Compare with string conversion
    if (template) {
      setComposition((prev) => ({
        ...prev,
        subject: template.subject,
        content: template.content,
        selectedTemplate: template.id.toString(), // Store as string for Select
        useTemplate: true,
      }));
    }
  };

  const personalizeContent = (content: string, student: Student) => {
    return content
      .replace(/{name}/g, student.name)
      .replace(/{progress}/g, student.progress.toString())
      .replace(/{completedModules}/g, student.completedModules.toString())
      .replace(/{lastActive}/g, new Date(student.lastActive).toLocaleDateString())
      .replace(/{score}/g, "85"); // Default score for certificate emails (as it's not dynamic from student data)
  };

  const saveDraft = async () => {
    try {
      const response = await fetch("/api/communication/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send current composition as draft, backend handles JSON.stringify for arrays
        body: JSON.stringify({
          ...composition,
          // Convert scheduleDate to ISO string for DB storage
          scheduleDate: composition.scheduleDate ? new Date(composition.scheduleDate).toISOString() : undefined,
          // Convert selectedTemplate to number for DB storage if it exists
          selectedTemplate: composition.selectedTemplate ? parseInt(composition.selectedTemplate, 10) : undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to save draft.");
      setIsDraft(true);
      alert("Draft saved successfully!");
    } catch (err: any) {
      console.error("Error saving draft:", err);
      alert(`Error saving draft: ${err.message}`);
    }
  };

  const clearDraft = async () => {
    try {
      const response = await fetch("/api/communication/drafts", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to clear draft.");
      setComposition({
        to: [],
        cc: [],
        bcc: [],
        subject: "",
        content: "",
        priority: "normal",
        useTemplate: false,
        personalizeContent: true,
      });
      setIsDraft(false);
      alert("Draft cleared successfully!");
    } catch (err: any) {
      console.error("Error clearing draft:", err);
      alert(`Error clearing draft: ${err.message}`);
    }
  };

  const sendEmail = async () => {
    if (composition.to.length === 0) {
      alert("Please add at least one recipient");
      return;
    }
    if (!composition.subject.trim()) {
      alert("Please enter a subject");
      return;
    }
    if (!composition.content.trim()) {
      alert("Please enter email content");
      return;
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composition.to,
          cc: composition.cc,
          bcc: composition.bcc,
          subject: composition.subject,
          content: composition.content, // Send original content, backend will personalize
          priority: composition.priority,
          scheduleDate: composition.scheduleDate,
          scheduleTime: composition.scheduleTime,
          personalizeContent: composition.personalizeContent,
          selectedTemplate: composition.selectedTemplate ? parseInt(composition.selectedTemplate, 10) : undefined, // Convert to number for backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send email.");
      }

      // Clear draft after successful send/schedule
      await clearDraft(); // Call the async clearDraft function

      alert(
        composition.scheduleDate
          ? `Email scheduled for ${composition.scheduleDate} at ${composition.scheduleTime}`
          : "Email sent successfully!"
      );
      router.push("/admin/communication"); // Redirect to communication hub
    } catch (err: any) {
      console.error("Error sending email:", err);
      alert(`Error sending email: ${err.message}`);
    }
  };

  const previewEmail = () => {
    // Create a temporary personalized content for preview based on the first 'To' recipient
    let previewContent = composition.content;
    if (composition.personalizeContent && composition.to.length > 0) {
      const firstRecipientEmail = composition.to[0];
      const student = students.find((s) => s.email === firstRecipientEmail);
      if (student) {
        previewContent = personalizeContent(composition.content, student);
      } else {
        previewContent = "Cannot personalize preview: First recipient not found in student list.";
      }
    }
    // Update composition state for preview only (not for actual sending)
    setComposition((prev) => ({ ...prev, content: previewContent }));
    setShowPreview(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/communication">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Communication Hub
              </Button>
            </Link>
            {isDraft && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Draft Loaded
              </Badge>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Compose Email
              </h1>
              <p className="text-gray-600 mt-2">Create and send personalized emails to your students</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={previewEmail}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={saveDraft}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={sendEmail}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {composition.scheduleDate ? "Schedule Email" : "Send Email"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Composition Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Recipients */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recipients
                </CardTitle>
                <CardDescription>Select who will receive this email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Recipient Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label>Quick Select:</Label>
                    <Select value={recipientFilter} onValueChange={setRecipientFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="active">Active Students</SelectItem>
                        <SelectItem value="premium">Premium Students</SelectItem>
                        <SelectItem value="high-progress">High Progress (70%+)</SelectItem>
                        <SelectItem value="low-progress">Low Progress (&lt;30%)</SelectItem>
                        <SelectItem value="inactive">Inactive Students</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={selectAllFiltered}>
                      Select All Filtered
                    </Button>
                  </div>

                  {/* Student Selection */}
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {getFilteredStudents().map((student) => (
                        <div
                          key={student.id} // Use number ID directly
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedStudents((prev) => [...prev, student.id]);
                                } else {
                                  setSelectedStudents((prev) => prev.filter((id) => id !== student.id));
                                }
                              }}
                            />
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                student.status === "active"
                                  ? "default"
                                  : student.status === "premium"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {student.status}
                            </Badge>
                            <span className="text-sm text-gray-600">{student.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedStudents.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addSelectedStudents("to")}>
                        Add to TO ({selectedStudents.length})
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSelectedStudents("cc")}>
                        Add to CC
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSelectedStudents("bcc")}>
                        Add to BCC
                      </Button>
                    </div>
                  )}
                </div>

                {/* Email Fields */}
                <div className="space-y-4">
                  {/* TO Field */}
                  <div className="space-y-2">
                    <Label>To:</Label>
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                      {composition.to.map((email) => (
                        <Badge key={email} variant="default" className="flex items-center gap-1">
                          {email}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeRecipient(email, "to")} />
                        </Badge>
                      ))}
                      <Input
                        placeholder="Add email address"
                        className="border-none flex-1 min-w-[200px] p-0 h-auto"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const email = e.currentTarget.value.trim();
                            if (email && email.includes("@")) {
                              addRecipient(email, "to");
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* CC Field */}
                  <div className="space-y-2">
                    <Label>CC:</Label>
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                      {composition.cc.map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeRecipient(email, "cc")} />
                        </Badge>
                      ))}
                      <Input
                        placeholder="Add CC email"
                        className="border-none flex-1 min-w-[200px] p-0 h-auto"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const email = e.currentTarget.value.trim();
                            if (email && email.includes("@")) {
                              addRecipient(email, "cc");
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* BCC Field */}
                  <div className="space-y-2">
                    <Label>BCC:</Label>
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                      {composition.bcc.map((email) => (
                        <Badge key={email} variant="outline" className="flex items-center gap-1">
                          {email}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeRecipient(email, "bcc")} />
                        </Badge>
                      ))}
                      <Input
                        placeholder="Add BCC email"
                        className="border-none flex-1 min-w-[200px] p-0 h-auto"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const email = e.currentTarget.value.trim();
                            if (email && email.includes("@")) {
                              addRecipient(email, "bcc");
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Content */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Content
                </CardTitle>
                <CardDescription>Compose your email message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={composition.useTemplate}
                      onCheckedChange={(checked) => setComposition((prev) => ({ ...prev, useTemplate: checked }))}
                    />
                    <Label>Use Email Template</Label>
                  </div>

                  {composition.useTemplate && (
                    <Select value={composition.selectedTemplate} onValueChange={applyTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id.toString()} value={template.id.toString()}> {/* Use string for value */}
                            {template.name} ({template.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={composition.subject}
                    onChange={(e) => setComposition((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={composition.priority}
                    onValueChange={(value: "low" | "normal" | "high") =>
                      setComposition((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Message</Label>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{characterCount} characters</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={composition.personalizeContent}
                          onCheckedChange={(checked) =>
                            setComposition((prev) => ({ ...prev, personalizeContent: checked }))
                          }
                        />
                        <Label className="text-sm">Personalize content</Label>
                      </div>
                    </div>
                  </div>
                  <Textarea
                    id="content"
                    value={composition.content}
                    onChange={(e) => setComposition((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your email message..."
                    className="min-h-[300px]"
                  />
                  {composition.personalizeContent && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium mb-2">Available personalization variables:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <span>• {"{name}"} - Student name</span>
                        <span>• {"{progress}"} - Progress percentage</span>
                        <span>• {"{completedModules}"} - Completed modules</span>
                        <span>• {"{lastActive}"} - Last active date</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scheduling */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={!!composition.scheduleDate}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setComposition((prev) => ({ ...prev, scheduleDate: undefined, scheduleTime: undefined }));
                        } else {
                          setComposition((prev) => ({
                            ...prev,
                            scheduleDate: new Date().toISOString().split("T")[0],
                            scheduleTime: "09:00",
                          }));
                        }
                      }}
                    />
                    <Label>Schedule for later</Label>
                  </div>

                  {composition.scheduleDate && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={composition.scheduleDate}
                          onChange={(e) => setComposition((prev) => ({ ...prev, scheduleDate: e.target.value }))}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={composition.scheduleTime || ""}
                          onChange={(e) => setComposition((prev) => ({ ...prev, scheduleTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Email Summary */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Email Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Recipients:</span>
                    <span className="font-medium">{composition.to.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CC:</span>
                    <span className="font-medium">{composition.cc.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>BCC:</span>
                    <span className="font-medium">{composition.bcc.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Priority:</span>
                    <Badge
                      variant={
                        composition.priority === "high"
                          ? "destructive"
                          : composition.priority === "low"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {composition.priority}
                    </Badge>
                  </div>
                  {composition.scheduleDate && (
                    <div className="flex justify-between text-sm">
                      <span>Scheduled:</span>
                      <span className="font-medium">
                        {composition.scheduleDate} {composition.scheduleTime}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => applyTemplate("welcome")}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Welcome Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => applyTemplate("progress")}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Progress Update
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => applyTemplate("reminder")}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Learning Reminder
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => applyTemplate("certificate")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Certificate Ready
                </Button>
              </CardContent>
            </Card>

            {/* Draft Actions */}
            {isDraft && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Draft Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full bg-transparent" onClick={clearDraft}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Draft
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
          <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Email Preview</AlertDialogTitle>
              <AlertDialogDescription>Preview how your email will appear to recipients</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>To:</strong> {composition.to.join(", ")}
                  </div>
                  {composition.cc.length > 0 && (
                    <div>
                      <strong>CC:</strong> {composition.cc.join(", ")}
                    </div>
                  )}
                  <div>
                    <strong>Subject:</strong> {composition.subject}
                  </div>
                  <div>
                    <strong>Priority:</strong>{" "}
                    <Badge
                      variant={
                        composition.priority === "high"
                          ? "destructive"
                          : composition.priority === "low"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {composition.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                {composition.content}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close Preview</AlertDialogCancel>
              <AlertDialogAction onClick={sendEmail}>
                {composition.scheduleDate ? "Schedule Email" : "Send Email"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}