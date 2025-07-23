// app/admin/students/[id]/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Edit, X, Trash2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
import { toast } from "sonner"; // Assuming you have sonner installed and configured

// Interface for the data received from the backend (after mapping)
interface StudentFetchedData {
  id: string; // From Prisma UUID
  name: string;
  email: string;
  joinDate: string; // Formatted date: YYYY-MM-DD
  lastActive: string; // Formatted date: YYYY-MM-DD
  progress: number;
  completedModules: number[];
  currentLevel: string;
  totalTimeSpent: string;
  streak: number;
  achievements: string[];
  subscription: string;
  subscriptionStatus: string; // Added to interface for DB consistency
  status: string;
  notes?: string;
  phone?: string;
  dateOfBirth?: string; // Formatted date: YYYY-MM-DD
  country?: string;
  preferredLanguage?: string;
  // password_hash is not sent to frontend
}

// Interface for the form data (matches what's sent to backend)
interface StudentFormData {
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
  streak?: number;
  achievements?: string[];
  notes?: string;
  joinDate?: string;
  lastActive?: string;
  totalTimeSpent?: string;
  newPassword?: string; // For password update
  completedModules?: number[]; // To send back for update
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

export default function EditStudent() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string; // Student ID is now a string (UUID)

  const [student, setStudent] = useState<StudentFetchedData | null>(null);
  const [formData, setFormData] = useState<Partial<StudentFormData>>({});
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch student data on component mount
  useEffect(() => {
    async function fetchStudent() {
      if (!studentId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/students/${studentId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch student.");
        }
        const data: StudentFetchedData = await response.json();

        setStudent(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          country: data.country,
          preferredLanguage: data.preferredLanguage,
          currentLevel: data.currentLevel,
          subscription: data.subscription,
          subscriptionStatus: data.subscriptionStatus,
          status: data.status,
          streak: data.streak,
          achievements: data.achievements,
          notes: data.notes,
          joinDate: data.joinDate,
          lastActive: data.lastActive,
          totalTimeSpent: data.totalTimeSpent,
          completedModules: data.completedModules,
        });
      } catch (error: any) {
        console.error("Error fetching student:", error);
        toast.error(error.message || "Could not load student data.");
        setStudent(null); // Ensure student is null if fetch fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudent();
  }, [studentId]);

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

    // Password validation
    if (passwordData.newPassword) {
      if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters long.";
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
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
    setErrors({}); // Clear previous errors

    const payload: Partial<StudentFormData> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      country: formData.country,
      preferredLanguage: formData.preferredLanguage,
      currentLevel: formData.currentLevel,
      subscription: formData.subscription,
      subscriptionStatus: formData.subscriptionStatus, // Send this field
      status: formData.status,
      streak: formData.streak,
      achievements: formData.achievements,
      notes: formData.notes,
      joinDate: formData.joinDate,
      lastActive: formData.lastActive,
      totalTimeSpent: formData.totalTimeSpent,
      completedModules: formData.completedModules, // Send modules for update
    };

    if (passwordData.newPassword) {
      payload.newPassword = passwordData.newPassword;
    }

    console.log("Submitting payload to API:", payload);

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({})); // Attempt to parse, fallback to empty object
      console.log("API response:", { status: response.status, data: responseData });

      if (!response.ok) {
        console.error("API error response:", responseData);
        if (response.status === 409) {
          setErrors({ email: responseData.message || "A student with this email already exists." });
          toast.error(responseData.message || "A student with this email already exists.");
        } else {
          setErrors({
            submit: responseData.message || responseData.details || "Failed to update student. Please try again.",
          });
          toast.error(responseData.message || responseData.details || "Failed to update student.");
        }
        return;
      }

      console.log("Student updated successfully:", responseData);
      toast.success("Student updated successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" }); // Clear password fields on success
      router.push("/admin/students"); // Redirect after successful update
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      setErrors({ submit: error.message || "An unexpected error occurred. Please check your network connection and try again." });
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete student.");
      }

      toast.success("Student deleted successfully!");
      router.push("/admin/students"); // Redirect after successful deletion
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error(error.message || "Failed to delete student.");
    }
  };

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePasswordChange = (field: "newPassword" | "confirmPassword", value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
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
      // Update progress based on completed modules (frontend calculation)
      const progress = Math.round((newCompleted.length / 40) * 100);
      handleInputChange("progress", progress);
    }
  };

  const removeCompletedModule = (moduleId: number) => {
    const newCompleted = formData.completedModules?.filter((id) => id !== moduleId) || [];
    handleInputChange("completedModules", newCompleted);
    // Update progress based on completed modules (frontend calculation)
    const progress = Math.round((newCompleted.length / 40) * 100);
    handleInputChange("progress", progress);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-6">The student you're looking for doesn't exist.</p>
          <Link href="/admin/students">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/students">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Students
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Student
                </h1>
                <p className="text-gray-600 mt-1">Update {student.name}'s information and progress</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Student
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Student</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {student.name}? This will permanently remove their account and all
                    progress data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete Student
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential student details and contact information</CardDescription>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={formData.joinDate || ""}
                    onChange={(e) => handleInputChange("joinDate", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="lastActive">Last Active</Label>
                  <Input
                    id="lastActive"
                    type="date"
                    value={formData.lastActive || ""}
                    onChange={(e) => handleInputChange("lastActive", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Update */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Password Update
              </CardTitle>
              <CardDescription>Update the student's login password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className={errors.newPassword ? "border-red-500" : ""}
                  />
                  {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Leave password fields empty if you don't want to change the current password.
              </p>
            </CardContent>
          </Card>

          {/* Learning Information */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Information</CardTitle>
              <CardDescription>Student's learning progress and subscription details</CardDescription>
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
                    onValueChange={(value) => handleInputChange("subscription", value)}
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

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Select achievements earned by the student</CardDescription>
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

          {/* Completed Modules */}
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

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any additional information about the student</CardDescription>
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

          {/* Submit */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Updating Student..." : "Update Student"}
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