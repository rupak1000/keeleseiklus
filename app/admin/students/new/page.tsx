
// app/admin/students/new/page.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FormDataStudent {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  preferredLanguage?: string;
  currentLevel?: string;
  subscription?: string;
  subscriptionStatus?: string;
  status?: string;
  progress?: number;
  completedModules?: number[];
  streak?: number;
  achievements?: string[];
  notes?: string;
  joinDate?: string;
  lastActive?: string;
  totalTimeSpent?: string;
}

const availableAchievements = [
  "First Steps",
  "Week Warrior",
  "Grammar Master",
  "Vocabulary Builder",
  "Culture Explorer",
  "Speaking Star",
  "Pronunciation Pro",
  "Reading Champion",
  "Writing Wizard",
  "Listening Expert",
];

export default function NewStudent() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<FormDataStudent>>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    country: "",
    preferredLanguage: "English",
    currentLevel: "A1",
    subscription: "Free",
    subscriptionStatus: "free",
    status: "active",
    progress: 0,
    completedModules: [],
    streak: 0,
    achievements: [],
    notes: "",
    joinDate: new Date().toISOString().split("T")[0],
    lastActive: new Date().toISOString().split("T")[0],
    totalTimeSpent: "0h 0m",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Full Name is required.";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,9}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number (e.g., +1 555 123 4567).";
    }

    if (formData.dateOfBirth && isNaN(new Date(formData.dateOfBirth).getTime())) {
      newErrors.dateOfBirth = "Please enter a valid date of birth.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      country: formData.country,
      preferredLanguage: formData.preferredLanguage,
      currentLevel: formData.currentLevel,
      subscription: formData.subscription,
      subscriptionStatus: formData.subscriptionStatus,
      status: formData.status,
      streak: formData.streak,
      achievements: formData.achievements,
      notes: formData.notes,
      completedModules: formData.completedModules,
    };

    console.log('Submitting payload to /api/students/new:', payload);

    try {
      const response = await fetch("/api/students/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));
      console.log('API response:', { status: response.status, data: responseData });

      if (!response.ok) {
        console.error("API error response:", responseData);
        if (response.status === 409) {
          setErrors({ email: responseData.message || "A student with this email already exists." });
          toast.error(responseData.message || "A student with this email already exists.");
        } else {
          setErrors({
            submit: responseData.message || responseData.details || "Failed to create student. Please try again.",
          });
          toast.error(responseData.message || responseData.details || "Failed to create student.");
        }
        return;
      }

      console.log("Student created successfully:", responseData);
      toast.success("Student created successfully!");
      router.push("/admin/students");
    } catch (error: any) {
      console.error("Error in handleSubmit:", {
        message: error.message || 'No error message',
        stack: error.stack || 'No stack trace',
        payload,
      });
      setErrors({ submit: error.message || "An unexpected error occurred. Please check your network connection and try again." });
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormDataStudent, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addAchievement = (achievement: string) => {
    if (!formData.achievements?.includes(achievement)) {
      handleInputChange("achievements", [...(formData.achievements || []), achievement]);
    }
  };

  const removeAchievement = (achievement: string) => {
    handleInputChange("achievements", formData.achievements?.filter((a) => a !== achievement) || []);
  };

  const addCompletedModule = (moduleId: number) => {
    if (!formData.completedModules?.includes(moduleId)) {
      const newCompleted = [...(formData.completedModules || []), moduleId].sort((a, b) => a - b);
      handleInputChange("completedModules", newCompleted);
      const progress = Math.round((newCompleted.length / 40) * 100);
      handleInputChange("progress", progress);
    }
  };

  const removeCompletedModule = (moduleId: number) => {
    const newCompleted = formData.completedModules?.filter((id) => id !== moduleId) || [];
    handleInputChange("completedModules", newCompleted);
    const progress = Math.round((newCompleted.length / 40) * 100);
    handleInputChange("progress", progress);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/students">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Students
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Add New Student
              </h1>
              <p className="text-gray-600 mt-1">Create a new student account with learning preferences.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential student details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter student's full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className={errors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ""}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(value) => handleInputChange("preferredLanguage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Russian">Russian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Information</CardTitle>
              <CardDescription>Student's learning progress and subscription details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentLevel">Current Level</Label>
                  <Select
                    value={formData.currentLevel}
                    onValueChange={(value) => handleInputChange("currentLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1 - Beginner</SelectItem>
                      <SelectItem value="A2">A2 - Elementary</SelectItem>
                      <SelectItem value="B1">B1 - Intermediate</SelectItem>
                      <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subscription">Subscription</Label>
                  <Select
                    value={formData.subscription}
                    onValueChange={(value) => {
                      handleInputChange("subscription", value);
                      handleInputChange("subscriptionStatus", value === "Premium" ? "premium" : "free");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="streak">Current Streak (days)</Label>
                  <Input
                    id="streak"
                    type="number"
                    min="0"
                    value={formData.streak || 0}
                    onChange={(e) => handleInputChange("streak", Number.parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="totalTimeSpent">Total Time Spent</Label>
                  <Input
                    id="totalTimeSpent"
                    value={formData.totalTimeSpent || ""}
                    onChange={(e) => handleInputChange("totalTimeSpent", e.target.value)}
                    placeholder="e.g., 25h 30m"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Select achievements earned by the student.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {availableAchievements.map((achievement) => (
                    <Button
                      key={achievement}
                      type="button"
                      variant={formData.achievements?.includes(achievement) ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        formData.achievements?.includes(achievement)
                          ? removeAchievement(achievement)
                          : addAchievement(achievement)
                      }
                    >
                      {achievement}
                    </Button>
                  ))}
                </div>

                {formData.achievements && formData.achievements.length > 0 && (
                  <div>
                    <Label>Selected Achievements:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.achievements.map((achievement) => (
                        <Badge key={achievement} variant="secondary" className="bg-yellow-100 text-yellow-700">
                          🏆 {achievement}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-4 w-4 p-0"
                            onClick={() => removeAchievement(achievement)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Modules</CardTitle>
              <CardDescription>
                Select modules the student has completed (Progress: {formData.progress}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((moduleId) => (
                  <Button
                    key={moduleId}
                    type="button"
                    variant={formData.completedModules?.includes(moduleId) ? "default" : "outline"}
                    size="sm"
                    className="w-12 h-12"
                    onClick={() =>
                      formData.completedModules?.includes(moduleId)
                        ? removeCompletedModule(moduleId)
                        : addCompletedModule(moduleId)
                    }
                  >
                    {moduleId}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any additional information about the student.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Enter any additional notes about the student..."
                rows={4}
              />
            </CardContent>
          </Card>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Creating Student..." : "Create Student"}
            </Button>
            <Link href="/admin/students">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}