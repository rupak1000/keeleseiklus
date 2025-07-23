// app/admin/students/new/page.tsx (or wherever your NewStudent component is)

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, UserPlus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"



interface Student {
  id: string; // Changed to string to match Prisma @id type
  name: string;
  email: string;
  password_hash?: string; // Add if you plan to set a password during creation
  is_admin: boolean;
  level: string; // Corresponds to currentLevel in your form
  enrollment_date: string; // Corresponds to joinDate
  last_active: string;
  total_time_spent: string;
  streak: number;
  achievements: string[];
  status: string;
  exam_status?: string;
  exam_score?: number;
  exam_attempts?: number;
  subscription?: string; // Corresponds to subscription in your form
  subscription_status?: string;
  subscription_date?: string;
  phone?: string;
  date_of_birth?: string; // Corresponds to dateOfBirth
  country?: string;
  preferred_language?: string; // Corresponds to preferredLanguage
  notes?: string;
  // student_modules, student_exam_attempts, certificates, audit_logs are relations and won't be directly created here
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
]

const defaultStudents: Student[] = [
  {
    id: 1,
    name: "Maria Kask",
    email: "maria@example.com",
    joinDate: "2024-01-15",
    lastActive: "2024-01-20",
    progress: 75,
    completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    currentLevel: "A2",
    totalTimeSpent: "45h 30m",
    streak: 12,
    achievements: ["First Steps", "Week Warrior", "Grammar Master"],
    subscription: "Premium",
    status: "Active",
    phone: "+372 5555 1234",
    country: "Estonia",
    preferredLanguage: "English",
    notes: "Excellent progress in grammar exercises. Shows great dedication to learning.",
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@example.com",
    joinDate: "2024-01-10",
    lastActive: "2024-01-19",
    progress: 45,
    completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    currentLevel: "A1",
    totalTimeSpent: "28h 15m",
    streak: 5,
    achievements: ["First Steps", "Vocabulary Builder"],
    subscription: "Free",
    status: "Active",
    phone: "+1 555 0123",
    country: "United States",
    preferredLanguage: "English",
    notes: "Consistent learner, good with vocabulary but needs practice with pronunciation.",
  },
  {
    id: 3,
    name: "Anna Tamm",
    email: "anna@example.com",
    joinDate: "2023-12-20",
    lastActive: "2024-01-18",
    progress: 90,
    completedModules: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      32, 33, 34, 35, 36,
    ],
    currentLevel: "A2",
    totalTimeSpent: "82h 45m",
    streak: 25,
    achievements: ["First Steps", "Week Warrior", "Grammar Master", "Culture Explorer", "Speaking Star"],
    subscription: "Premium",
    status: "Active",
    phone: "+372 5555 5678",
    country: "Estonia",
    preferredLanguage: "Russian",
    notes: "Advanced learner with excellent progress. Near completion of A2 level.",
  },
  {
    id: 4,
    name: "Erik Mets",
    email: "erik@example.com",
    joinDate: "2024-01-05",
    lastActive: "2024-01-15",
    progress: 15,
    completedModules: [1, 2, 3],
    currentLevel: "A1",
    totalTimeSpent: "8h 20m",
    streak: 0,
    achievements: ["First Steps"],
    subscription: "Free",
    status: "Inactive",
    phone: "+372 5555 9999",
    country: "Estonia",
    preferredLanguage: "English",
    notes: "Started strong but became inactive. May need motivation to continue.",
  },
]

export default function NewStudent() {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<Student>>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    country: "",
    preferredLanguage: "English",
    currentLevel: "A1",
    subscription: "Free",
    status: "Active",
    progress: 0,
    completedModules: [],
    streak: 0,
    achievements: [],
    notes: "",
    joinDate: new Date().toISOString().split("T")[0],
    lastActive: new Date().toISOString().split("T")[0],
    totalTimeSpent: "0h 0m",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get existing students or use defaults
      let existingStudents = []
      try {
        const saved = localStorage.getItem("adminStudents")
        existingStudents = saved ? JSON.parse(saved) : defaultStudents
      } catch {
        existingStudents = defaultStudents
      }

      // Check if email already exists
      if (existingStudents.some((student: Student) => student.email === formData.email)) {
        setErrors({ email: "A student with this email already exists" })
        setIsSubmitting(false)
        return
      }

      // Generate new ID
      const newId = existingStudents.length > 0 ? Math.max(...existingStudents.map((s: Student) => s.id)) + 1 : 1

      // Create new student
      const newStudent: Student = {
        id: newId,
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        dateOfBirth: formData.dateOfBirth || "",
        country: formData.country || "",
        preferredLanguage: formData.preferredLanguage || "English",
        joinDate: formData.joinDate || new Date().toISOString().split("T")[0],
        lastActive: formData.lastActive || new Date().toISOString().split("T")[0],
        progress: formData.progress || 0,
        completedModules: formData.completedModules || [],
        currentLevel: formData.currentLevel || "A1",
        totalTimeSpent: formData.totalTimeSpent || "0h 0m",
        streak: formData.streak || 0,
        achievements: formData.achievements || [],
        subscription: formData.subscription || "Free",
        status: formData.status || "Active",
        notes: formData.notes || "",
      }

      // Save to localStorage
      const updatedStudents = [...existingStudents, newStudent]
      localStorage.setItem("adminStudents", JSON.stringify(updatedStudents))

      // Redirect to students list
      router.push("/admin/students")
    } catch (error) {
      console.error("Error creating student:", error)
      setErrors({ submit: "Failed to create student. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof Student, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addAchievement = (achievement: string) => {
    if (!formData.achievements?.includes(achievement)) {
      handleInputChange("achievements", [...(formData.achievements || []), achievement])
    }
  }

  const removeAchievement = (achievement: string) => {
    handleInputChange("achievements", formData.achievements?.filter((a) => a !== achievement) || [])
  }

  const addCompletedModule = (moduleId: number) => {
    if (!formData.completedModules?.includes(moduleId)) {
      const newCompleted = [...(formData.completedModules || []), moduleId].sort((a, b) => a - b)
      handleInputChange("completedModules", newCompleted)
      // Update progress based on completed modules
      const progress = Math.round((newCompleted.length / 40) * 100)
      handleInputChange("progress", progress)
    }
  }

  const removeCompletedModule = (moduleId: number) => {
    const newCompleted = formData.completedModules?.filter((id) => id !== moduleId) || []
    handleInputChange("completedModules", newCompleted)
    // Update progress based on completed modules
    const progress = Math.round((newCompleted.length / 40) * 100)
    handleInputChange("progress", progress)
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
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Add New Student
              </h1>
              <p className="text-gray-600 mt-1">Create a new student account with learning preferences</p>
            </div>
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
                  />
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
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
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
  )
}
