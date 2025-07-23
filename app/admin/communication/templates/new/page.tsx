// app/admin/communication/templates/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner"; // For notifications

interface NewEmailTemplate {
  name: string;
  subject: string;
  content: string;
  category: "welcome" | "progress" | "reminder" | "certificate" | "general" | "custom"; // Added custom
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [templateData, setTemplateData] = useState<NewEmailTemplate>({
    name: "",
    subject: "",
    content: "",
    category: "general", // Default category
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveTemplate = async () => {
    setError(null);
    setIsSaving(true);

    if (!templateData.name.trim() || !templateData.subject.trim() || !templateData.content.trim()) {
      setError("Please fill in all required fields (Name, Subject, Content).");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/communication/templates", { // POST to /api/communication/templates
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create template.");
      }

      toast.success("Email template created successfully!");
      router.push("/admin/communication?tab=templates"); // Redirect back to templates tab
    } catch (err: any) {
      console.error("Error creating template:", err);
      setError(err.message || "An unexpected error occurred while creating the template.");
      toast.error(`Failed to create template: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/communication?tab=templates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Email Template
              </h1>
              <p className="text-gray-600 mt-2">Design a reusable email template for your communications</p>
            </div>
            <Button
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Define the name, subject, and content of your email template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateData.name}
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                placeholder="e.g., Seasonal Greetings, New Feature Announcement"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select
                value={templateData.category}
                onValueChange={(value: NewEmailTemplate['category']) =>
                  setTemplateData({ ...templateData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="progress">Progress Update</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject</Label>
              <Input
                id="template-subject"
                value={templateData.subject}
                onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                placeholder="Enter template subject"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-content">Content</Label>
              <Textarea
                id="template-content"
                value={templateData.content}
                onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                placeholder="Enter template content. Use {name}, {progress}, {completedModules}, {lastActive} for personalization."
                rows={15}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Characters: {templateData.content.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}