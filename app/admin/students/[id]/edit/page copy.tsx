"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Edit, X, Trash2, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
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

interface Student {
  id: number
  name: string
  email: string
  joinDate: string
  lastActive: string
  progress: number
  completedModules: number[]
  currentLevel: string
  totalTimeSpent: string
  streak: number
  achievements: string[]
  subscription: string
  status: string
  notes?: string
  phone?: string
  dateOfBirth?: string
  country?: string
  preferredLanguage?: string
  password?: string
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
    password: "maria123",
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
    password: "john123",
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
    password: "anna123",
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
    password: "erik123",
  },
]

export default function EditStudent() {
  const router = useRouter()
  const params = useParams()
  const studentId = Number.parseInt(params.id as string)

  const [student, setStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState<Partial<Student>>({})
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load student data
    let savedStudents = []
    try {
      const saved = localStorage.getItem("adminStudents")
      savedStudents = saved ? JSON.parse(saved) : defaultStudents
    } catch {
      savedStudents = defaultStudents
    }

    const foundStudent = savedStudents.find((s: Student) => s.id === studentId)

    if (foundStudent) {
      setStudent(foundStudent)
      setFormData(foundStudent)
    } else {
      // If student not found, check if we need to initialize with defaults
      if (!localStorage.getItem("adminStudents")) {
        localStorage.setItem("adminStudents", JSON.stringify(defaultStudents))
        const defaultStudent = defaultStudents.find((s: Student) => s.id === studentId)
        if (defaultStudent) {
          setStudent(defaultStudent)
          setFormData(defaultStudent)
        }
      }
    }
    setIsLoading(false)
  }, [studentId])

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

    // Password validation
    if (passwordData.newPassword) {
      if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters long"
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
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
      // Get existing students
      let existingStudents = []
      try {
        const saved = localStorage.getItem("adminStudents")
        existingStudents = saved ? JSON.parse(saved) : defaultStudents
      } catch {
        existingStudents = defaultStudents
      }

      // Check if email already exists (excluding current student)
      if (existingStudents.some((s: Student) => s.email === formData.email && s.id !== studentId)) {
        setErrors({ email: "A student with this email already exists" })
        setIsSubmitting(false)
        return
      }

      // Prepare updated student data
      const updatedStudentData = { ...formData }

      // Update password if provided
      if (passwordData.newPassword) {
        updatedStudentData.password = passwordData.newPassword
      }

      // Update student
      const updatedStudents = existingStudents.map((s: Student) =>
        s.id === studentId ? { ...s, ...updatedStudentData } : s,
      )

      // Save to localStorage
      localStorage.setItem("adminStudents", JSON.stringify(updatedStudents))

      // Clear password fields
      setPasswordData({ newPassword: "", confirmPassword: "" })

      // Redirect to students list
      router.push("/admin/students")
    } catch (error) {
      console.error("Error updating student:", error)
      setErrors({ submit: "Failed to update student. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    try {
      let existingStudents = []
      try {
        const saved = localStorage.getItem("adminStudents")
        existingStudents = saved ? JSON.parse(saved) : defaultStudents
      } catch {
        existingStudents = defaultStudents
      }

      const updatedStudents = existingStudents.filter((s: Student) => s.id !== studentId)
      localStorage.setItem("adminStudents", JSON.stringify(updatedStudents))
      router.push("/admin/students")
    } catch (error) {
      console.error("Error deleting student:", error)
    }
  }

  const handleInputChange = (field: keyof Student, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePasswordChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    )
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
    )
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
  )
}
