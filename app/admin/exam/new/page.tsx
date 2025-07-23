"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Eye,
  Copy,
  FileText,
  Target,
  BookOpen,
  CheckCircle,
  Settings,
  RefreshCw,
  AlertTriangle,
  Volume2,
  Upload,
  Play,
  Pause,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Interfaces matching backend models for consistency
interface ExamQuestion {
  id: string // Frontend uses string for temporary IDs
  type: "multiple-choice" | "fill-blank" | "true-false" | "short-answer" | "essay" | "matching" | "ordering" | "audio"
  question: string
  question_ru?: string
  options?: string[]
  correctAnswer: string | boolean | number // Use number for multiple choice indices
  points: number
  hint?: string
  explanation?: string
  module_id?: number
  difficulty: "easy" | "medium" | "hard"
  tags: string[]
  audioUrl?: string
}

interface ExamSection {
  id: string
  title: string
  description: string
  instructions?: string
  timeLimit?: number
  maxPoints: number
  questions: ExamQuestion[]
  randomizeQuestions: boolean
  passingScore?: number
}

interface ExamTemplate {
  id: string
  title: string
  description: string
  instructions: string
  totalPoints: number
  timeLimit: number
  sections: ExamSection[]
  settings: {
    randomizeQuestions: boolean
    randomizeSections: boolean
    showProgressBar: boolean
    allowBackNavigation: boolean
    showQuestionNumbers: boolean
    autoSave: boolean
    preventCheating: boolean
    fullScreenMode: boolean
    passingScore: number
    maxAttempts: number
    showResultsImmediately: boolean
    certificateEnabled: boolean
  }
  createdAt: string
  updatedAt: string
  isActive: boolean
  isPublished: boolean
}

export default function NewExamPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [examTemplate, setExamTemplate] = useState<ExamTemplate>({
    id: `exam_${Date.now()}`,
    title: "",
    description: "",
    instructions: "",
    totalPoints: 0,
    timeLimit: 120,
    sections: [],
    settings: {
      randomizeQuestions: false,
      randomizeSections: false,
      showProgressBar: true,
      allowBackNavigation: true,
      showQuestionNumbers: true,
      autoSave: true,
      preventCheating: false,
      fullScreenMode: false,
      passingScore: 70,
      maxAttempts: 3,
      showResultsImmediately: true,
      certificateEnabled: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: false,
    isPublished: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState<Record<string, boolean>>({})
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({})

  // Question templates for quick creation
  const questionTemplates = {
    "multiple-choice": {
      type: "multiple-choice" as const,
      question: "",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0, // Use index instead of text
      points: 1,
      difficulty: "medium" as const,
      tags: [],
    },
    "fill-blank": {
      type: "fill-blank" as const,
      question: "Complete the sentence: Ma _____ eesti keelt. (I _____ Estonian)",
      correctAnswer: "õpin",
      points: 1,
      difficulty: "medium" as const,
      tags: ["grammar"],
    },
    "true-false": {
      type: "true-false" as const,
      question: "Estonia is located in Northern Europe.",
      correctAnswer: true,
      points: 1,
      difficulty: "easy" as const,
      tags: ["geography"],
    },
    "short-answer": {
      type: "short-answer" as const,
      question: "What is the capital of Estonia?",
      correctAnswer: "Tallinn",
      points: 2,
      difficulty: "easy" as const,
      tags: ["geography"],
    },
    essay: {
      type: "essay" as const,
      question:
        "Describe your experience learning Estonian. What challenges have you faced and how have you overcome them?",
      correctAnswer: "",
      points: 10,
      difficulty: "hard" as const,
      tags: ["writing", "reflection"],
    },
    audio: {
      type: "audio" as const,
      question: "Listen to the audio and write what you hear:",
      correctAnswer: "",
      points: 2,
      difficulty: "medium" as const,
      tags: ["listening"],
      audioUrl: "",
    },
  }

  const playAudio = (questionId: string, audioUrl: string) => {
    // Stop all other audio first
    Object.entries(audioElements).forEach(([id, audio]) => {
      if (id !== questionId) {
        audio.pause()
        audio.currentTime = 0
        setAudioPlaying((prev) => ({ ...prev, [id]: false }))
      }
    })

    let audio = audioElements[questionId]
    if (!audio) {
      audio = new Audio(audioUrl)
      audio.addEventListener("ended", () => {
        setAudioPlaying((prev) => ({ ...prev, [questionId]: false }))
      })
      audio.addEventListener("error", () => {
        toast.error("Failed to load audio")
        setAudioPlaying((prev) => ({ ...prev, [questionId]: false }))
      })
      setAudioElements((prev) => ({ ...prev, [questionId]: audio }))
    }

    if (audioPlaying[questionId]) {
      audio.pause()
      setAudioPlaying((prev) => ({ ...prev, [questionId]: false }))
    } else {
      audio.play()
      setAudioPlaying((prev) => ({ ...prev, [questionId]: true }))
    }
  }

  const addSection = () => {
    const newSection: ExamSection = {
      id: `section_${Date.now()}`,
      title: `Section ${examTemplate.sections.length + 1}`,
      description: "",
      instructions: "",
      maxPoints: 0,
      questions: [],
      randomizeQuestions: false,
    }
    setExamTemplate((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
    setActiveTab("sections")
  }

  const updateSection = (sectionId: string, updates: Partial<ExamSection>) => {
    setExamTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }))
  }

  const deleteSection = (sectionId: string) => {
    setExamTemplate((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }))
  }

  const addQuestion = (sectionId: string, questionType: keyof typeof questionTemplates) => {
    const template = questionTemplates[questionType]
    const newQuestion: ExamQuestion = {
      id: `question_${Date.now()}`,
      ...template,
      tags: template.tags || [],
    }
    setExamTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: [...section.questions, newQuestion],
              maxPoints: section.maxPoints + newQuestion.points,
            }
          : section,
      ),
    }))
  }

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<ExamQuestion>) => {
    setExamTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId ? { ...question, ...updates } : question,
              ),
              // Recalculate section max points when question points change
              maxPoints:
                updates.points !== undefined
                  ? section.questions.reduce(
                      (sum, q) => sum + (q.id === questionId ? updates.points || 1 : q.points),
                      0,
                    )
                  : section.maxPoints,
            }
          : section,
      ),
    }))
  }

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setExamTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter((question) => question.id !== questionId),
              maxPoints: Math.max(
                0,
                section.maxPoints - (section.questions.find((q) => q.id === questionId)?.points || 0),
              ),
            }
          : section,
      ),
    }))
  }

  const duplicateQuestion = (sectionId: string, questionId: string) => {
    const section = examTemplate.sections.find((s) => s.id === sectionId)
    const question = section?.questions.find((q) => q.id === questionId)
    if (question) {
      const duplicatedQuestion: ExamQuestion = {
        ...question,
        id: `question_${Date.now()}_copy`,
        question: `${question.question} (Copy)`,
      }
      const questionIndex = section!.questions.findIndex((q) => q.id === questionId)
      if (questionIndex !== -1) {
        setExamTemplate((prev) => ({
          ...prev,
          sections: prev.sections.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  questions: [
                    ...s.questions.slice(0, questionIndex + 1),
                    duplicatedQuestion,
                    ...s.questions.slice(questionIndex + 1),
                  ],
                  maxPoints: s.maxPoints + duplicatedQuestion.points,
                }
              : s,
          ),
        }))
      }
    }
  }

  const calculateTotalPoints = () => {
    return examTemplate.sections.reduce((total, section) => total + section.maxPoints, 0)
  }

  useEffect(() => {
    const totalPoints = calculateTotalPoints()
    setExamTemplate((prev) => ({ ...prev, totalPoints }))
  }, [examTemplate.sections])

  const saveExam = async (publish = false) => {
    setError(null)
    setSaving(true)

    if (!examTemplate.title.trim()) {
      setError("Please enter an exam title.")
      setSaving(false)
      return
    }

    if (examTemplate.sections.length === 0) {
      setError("Please add at least one section to the exam.")
      setSaving(false)
      return
    }

    for (const section of examTemplate.sections) {
      if (!section.title.trim()) {
        setError(`Section ${section.id} is missing a title.`)
        setSaving(false)
        return
      }
      if (section.questions.length === 0) {
        setError(`Section "${section.title}" has no questions.`)
        setSaving(false)
        return
      }
      for (const question of section.questions) {
        if (!question.question.trim()) {
          setError(`Question in section "${section.title}" is missing text.`)
          setSaving(false)
          return
        }
        if (question.type === "multiple-choice" && (!question.options || question.options.length < 2)) {
          setError(`Multiple-choice question in section "${section.title}" needs at least 2 options.`)
          setSaving(false)
          return
        }
        if (question.type === "multiple-choice" && question.correctAnswer === undefined) {
          setError(`Multiple-choice question in section "${section.title}" needs a correct answer.`)
          setSaving(false)
          return
        }
        if (question.type === "audio" && !question.audioUrl) {
          setError(`Audio question in section "${section.title}" needs an audio URL.`)
          setSaving(false)
          return
        }
        // Ensure correctAnswer is not null/undefined for any question type
        if (question.correctAnswer === null || question.correctAnswer === undefined) {
          setError(`Question in section "${section.title}" needs a correct answer.`)
          setSaving(false)
          return
        }
      }
    }

    const totalPoints = calculateTotalPoints()

    // Transform the data to match the backend API expectations
    const examDataForAPI = {
      title: examTemplate.title,
      description: examTemplate.description,
      instructions: examTemplate.instructions,
      totalPoints,
      timeLimit: examTemplate.timeLimit,
      isPublished: publish,
      isActive: true,
      settings: examTemplate.settings,
      sections: examTemplate.sections.map((section) => ({
        title: section.title,
        description: section.description,
        instructions: section.instructions,
        timeLimit: section.timeLimit,
        maxPoints: section.maxPoints,
        randomizeQuestions: section.randomizeQuestions,
        passingScore: section.passingScore,
        questions: section.questions.map((question) => ({
          type: question.type,
          question: question.question,
          question_ru: question.question_ru,
          options: question.options ? JSON.stringify(question.options) : null,
          correct_answer: JSON.stringify(question.correctAnswer), // Always stringify for consistency
          points: question.points,
          hint: question.hint,
          explanation: question.explanation,
          module_id: question.module_id,
          difficulty: question.difficulty,
          tags: question.tags,
          audioUrl: question.audioUrl,
        })),
      })),
    }

    try {
      const response = await fetch("/api/exam-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examDataForAPI),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || "Failed to save exam template.")
      }

      toast.success(`Exam ${publish ? "published" : "saved"} successfully!`)
      router.push("/admin/exam")
    } catch (err: any) {
      console.error("Error saving exam:", err)
      setError(err.message || "An unexpected error occurred while saving the exam.")
      toast.error(`Failed to save exam: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const previewExam = () => {
    localStorage.setItem("examPreview", JSON.stringify(examTemplate))
    window.open("/exam?preview=true", "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/exam">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exam Management
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Exam
              </h1>
              <p className="text-gray-600 mt-2">Build a comprehensive exam with multiple sections and question types</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={previewExam}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={() => saveExam(false)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => saveExam(true)}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Publish Exam
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 text-red-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Exam Progress</span>
            <span>
              {examTemplate.sections.length} sections, {examTemplate.totalPoints} points
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  (examTemplate.sections.length > 0 ? 25 : 0) +
                    (examTemplate.title ? 25 : 0) +
                    (examTemplate.totalPoints > 0 ? 50 : 0),
                )}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-6">
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Exam Information
                    </CardTitle>
                    <CardDescription>Set up the basic details for your exam</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Exam Title *</Label>
                        <Input
                          id="title"
                          value={examTemplate.title}
                          onChange={(e) => setExamTemplate((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Estonian Language Proficiency Test"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                        <Input
                          id="timeLimit"
                          type="number"
                          min="30"
                          max="300"
                          value={examTemplate.timeLimit}
                          onChange={(e) =>
                            setExamTemplate((prev) => ({
                              ...prev,
                              timeLimit: Number.parseInt(e.target.value) || 120,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={examTemplate.description}
                        onChange={(e) => setExamTemplate((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this exam covers and its purpose"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructions">Instructions for Students</Label>
                      <Textarea
                        id="instructions"
                        value={examTemplate.instructions}
                        onChange={(e) => setExamTemplate((prev) => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Provide detailed instructions for taking this exam"
                        rows={5}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sections */}
              <TabsContent value="sections" className="space-y-6">
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          Exam Sections
                        </CardTitle>
                        <CardDescription>Organize your exam into logical sections</CardDescription>
                      </div>
                      <Button onClick={addSection} className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Section
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {examTemplate.sections.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No sections created yet</p>
                        <Button onClick={addSection} variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Section
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {examTemplate.sections.map((section, index) => (
                          <Card key={section.id} className="border-2 hover:border-blue-200 transition-colors">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline">Section {index + 1}</Badge>
                                  <div>
                                    <Input
                                      value={section.title}
                                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                      className="font-semibold border-none p-0 h-auto bg-transparent"
                                      placeholder="Section title"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Section</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this section? All questions in this section
                                          will be permanently removed.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteSection(section.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <Textarea
                                  value={section.description}
                                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                                  placeholder="Section description"
                                  rows={2}
                                />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Questions:</span>
                                    <p className="font-medium">{section.questions.length}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Max Points:</span>
                                    <p className="font-medium">{section.maxPoints}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Time Limit:</span>
                                    <Input
                                      type="number"
                                      value={section.timeLimit || ""}
                                      onChange={(e) =>
                                        updateSection(section.id, {
                                          timeLimit: Number.parseInt(e.target.value) || undefined,
                                        })
                                      }
                                      placeholder="Optional"
                                      className="h-6 text-xs"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={section.randomizeQuestions}
                                      onCheckedChange={(checked) =>
                                        updateSection(section.id, { randomizeQuestions: checked })
                                      }
                                    />
                                    <span className="text-xs">Randomize</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Questions */}
              <TabsContent value="questions" className="space-y-6">
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Question Management
                    </CardTitle>
                    <CardDescription>Add and edit questions for each section</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {examTemplate.sections.length === 0 ? (
                      <div className="text-center py-12">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Create sections first before adding questions</p>
                        <Button onClick={() => setActiveTab("sections")} variant="outline">
                          Go to Sections
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {examTemplate.sections.map((section) => (
                          <Card key={section.id} className="border-2">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">{section.title}</CardTitle>
                                  <p className="text-sm text-gray-600">
                                    {section.questions.length} questions, {section.maxPoints} points
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {Object.keys(questionTemplates).map((type) => (
                                    <Button
                                      key={type}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addQuestion(section.id, type as keyof typeof questionTemplates)}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      {type === "audio" ? "Audio" : type.replace("-", " ")}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {section.questions.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                  <p className="text-gray-600 mb-4">No questions in this section yet</p>
                                  <div className="flex flex-wrap justify-center gap-2">
                                    {Object.keys(questionTemplates).map((type) => (
                                      <Button
                                        key={type}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addQuestion(section.id, type as keyof typeof questionTemplates)}
                                      >
                                        Add {type === "audio" ? "Audio" : type.replace("-", " ")}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {section.questions.map((question, qIndex) => (
                                    <Card key={question.id} className="bg-gray-50">
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline">Q{qIndex + 1}</Badge>
                                            <Badge variant="secondary">{question.type}</Badge>
                                            <Badge
                                              variant={
                                                question.difficulty === "easy"
                                                  ? "default"
                                                  : question.difficulty === "medium"
                                                    ? "secondary"
                                                    : "destructive"
                                              }
                                            >
                                              {question.difficulty}
                                            </Badge>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => duplicateQuestion(section.id, question.id)}
                                            >
                                              <Copy className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => deleteQuestion(section.id, question.id)}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div className="space-y-3">
                                          <Textarea
                                            value={question.question}
                                            onChange={(e) =>
                                              updateQuestion(section.id, question.id, { question: e.target.value })
                                            }
                                            placeholder="Enter your question"
                                            rows={2}
                                          />

                                          {question.type === "audio" && (
                                            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                              <div className="flex items-center gap-2">
                                                <Volume2 className="w-5 h-5 text-blue-600" />
                                                <Label className="text-blue-800 font-medium">
                                                  Audio Question Setup
                                                </Label>
                                              </div>

                                              <div className="space-y-2">
                                                <Label>Audio URL</Label>
                                                <div className="flex gap-2">
                                                  <Input
                                                    value={question.audioUrl || ""}
                                                    onChange={(e) =>
                                                      updateQuestion(section.id, question.id, {
                                                        audioUrl: e.target.value,
                                                      })
                                                    }
                                                    placeholder="https://example.com/audio.mp3"
                                                    className="flex-1"
                                                  />
                                                  <Button variant="outline" size="sm">
                                                    <Upload className="w-4 h-4" />
                                                  </Button>
                                                  {question.audioUrl && (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => playAudio(question.id, question.audioUrl!)}
                                                    >
                                                      {audioPlaying[question.id] ? (
                                                        <Pause className="w-4 h-4" />
                                                      ) : (
                                                        <Play className="w-4 h-4" />
                                                      )}
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="space-y-2">
                                                <Label>Expected Answer/Transcription</Label>
                                                <Input
                                                  value={question.correctAnswer as string}
                                                  onChange={(e) =>
                                                    updateQuestion(section.id, question.id, {
                                                      correctAnswer: e.target.value,
                                                    })
                                                  }
                                                  placeholder="What students should hear and type"
                                                />
                                                <p className="text-sm text-blue-600">
                                                  Students will listen to the audio and provide their answer in a text
                                                  field.
                                                </p>
                                              </div>
                                            </div>
                                          )}

                                          {question.type === "multiple-choice" && question.options && (
                                            <div className="space-y-2">
                                              <Label>Answer Options</Label>
                                              {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex gap-2">
                                                  <Input
                                                    value={option}
                                                    onChange={(e) => {
                                                      const newOptions = [...question.options!]
                                                      newOptions[optionIndex] = e.target.value
                                                      updateQuestion(section.id, question.id, { options: newOptions })
                                                    }}
                                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                                  />
                                                  <Button
                                                    variant={
                                                      question.correctAnswer === optionIndex ? "default" : "outline"
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                      updateQuestion(section.id, question.id, {
                                                        correctAnswer: optionIndex, // Store as index
                                                      })
                                                    }
                                                  >
                                                    {question.correctAnswer === optionIndex
                                                      ? "✓ Correct"
                                                      : "Set Correct"}
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {(question.type === "fill-blank" || question.type === "short-answer") && (
                                            <div className="space-y-2">
                                              <Label>Correct Answer</Label>
                                              <Input
                                                value={question.correctAnswer as string}
                                                onChange={(e) =>
                                                  updateQuestion(section.id, question.id, {
                                                    correctAnswer: e.target.value,
                                                  })
                                                }
                                                placeholder="Enter the correct answer"
                                              />
                                            </div>
                                          )}

                                          {question.type === "true-false" && (
                                            <div className="space-y-2">
                                              <Label>Correct Answer</Label>
                                              <div className="flex gap-2">
                                                <Button
                                                  variant={question.correctAnswer === true ? "default" : "outline"}
                                                  size="sm"
                                                  onClick={() =>
                                                    updateQuestion(section.id, question.id, { correctAnswer: true })
                                                  }
                                                >
                                                  {question.correctAnswer === true ? "✓ True" : "True"}
                                                </Button>
                                                <Button
                                                  variant={question.correctAnswer === false ? "default" : "outline"}
                                                  size="sm"
                                                  onClick={() =>
                                                    updateQuestion(section.id, question.id, { correctAnswer: false })
                                                  }
                                                >
                                                  {question.correctAnswer === false ? "✓ False" : "False"}
                                                </Button>
                                              </div>
                                            </div>
                                          )}

                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                              <Label>Points</Label>
                                              <Input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={question.points}
                                                onChange={(e) =>
                                                  updateQuestion(section.id, question.id, {
                                                    points: Number.parseInt(e.target.value) || 1,
                                                  })
                                                }
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Difficulty</Label>
                                              <Select
                                                value={question.difficulty}
                                                onValueChange={(value: "easy" | "medium" | "hard") =>
                                                  updateQuestion(section.id, question.id, { difficulty: value })
                                                }
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="easy">Easy</SelectItem>
                                                  <SelectItem value="medium">Medium</SelectItem>
                                                  <SelectItem value="hard">Hard</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Module</Label>
                                              <Input
                                                value={question.module_id || ""}
                                                onChange={(e) =>
                                                  updateQuestion(section.id, question.id, {
                                                    module_id: Number.parseInt(e.target.value) || undefined,
                                                  })
                                                }
                                                placeholder="e.g., Module 12"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Tags</Label>
                                              <Input
                                                value={question.tags.join(", ")}
                                                onChange={(e) =>
                                                  updateQuestion(section.id, question.id, {
                                                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                                                  })
                                                }
                                                placeholder="grammar, vocabulary"
                                              />
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <Label>Hint (optional)</Label>
                                              <Textarea
                                                value={question.hint || ""}
                                                onChange={(e) =>
                                                  updateQuestion(section.id, question.id, { hint: e.target.value })
                                                }
                                                placeholder="Provide a helpful hint"
                                                rows={2}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Explanation (optional)</Label>
                                              <Textarea
                                                value={question.explanation || ""}
                                                onChange={(e) =>
                                                  updateQuestion(section.id, question.id, {
                                                    explanation: e.target.value,
                                                  })
                                                }
                                                placeholder="Explain the correct answer"
                                                rows={2}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Exam Settings
                    </CardTitle>
                    <CardDescription>Configure exam behavior and student experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Question Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Question Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
                            <Switch
                              id="randomizeQuestions"
                              checked={examTemplate.settings.randomizeQuestions}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, randomizeQuestions: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="randomizeSections">Randomize Sections</Label>
                            <Switch
                              id="randomizeSections"
                              checked={examTemplate.settings.randomizeSections}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, randomizeSections: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="showQuestionNumbers">Show Question Numbers</Label>
                            <Switch
                              id="showQuestionNumbers"
                              checked={examTemplate.settings.showQuestionNumbers}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, showQuestionNumbers: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Navigation Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Navigation Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="showProgressBar">Show Progress Bar</Label>
                            <Switch
                              id="showProgressBar"
                              checked={examTemplate.settings.showProgressBar}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, showProgressBar: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="allowBackNavigation">Allow Back Navigation</Label>
                            <Switch
                              id="allowBackNavigation"
                              checked={examTemplate.settings.allowBackNavigation}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, allowBackNavigation: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="autoSave">Auto-save Progress</Label>
                            <Switch
                              id="autoSave"
                              checked={examTemplate.settings.autoSave}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, autoSave: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Security Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="preventCheating">Prevent Cheating</Label>
                            <Switch
                              id="preventCheating"
                              checked={examTemplate.settings.preventCheating}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, preventCheating: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="fullScreenMode">Full Screen Mode</Label>
                            <Switch
                              id="fullScreenMode"
                              checked={examTemplate.settings.fullScreenMode}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, fullScreenMode: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Scoring Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Scoring Settings</h3>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="passingScore">Passing Score (%)</Label>
                            <Input
                              id="passingScore"
                              type="number"
                              min="50"
                              max="100"
                              value={examTemplate.settings.passingScore}
                              onChange={(e) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, passingScore: Number.parseInt(e.target.value) || 70 },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                            <Input
                              id="maxAttempts"
                              type="number"
                              min="1"
                              max="10"
                              value={examTemplate.settings.maxAttempts}
                              onChange={(e) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, maxAttempts: Number.parseInt(e.target.value) || 3 },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="showResultsImmediately">Show Results Immediately</Label>
                            <Switch
                              id="showResultsImmediately"
                              checked={examTemplate.settings.showResultsImmediately}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, showResultsImmediately: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="certificateEnabled">Enable Certificates</Label>
                            <Switch
                              id="certificateEnabled"
                              checked={examTemplate.settings.certificateEnabled}
                              onCheckedChange={(checked) =>
                                setExamTemplate((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, certificateEnabled: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exam Summary */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Exam Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Title</span>
                  <span className="font-medium text-right">{examTemplate.title || "Untitled"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sections</span>
                  <span className="font-medium">{examTemplate.sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Questions</span>
                  <span className="font-medium">
                    {examTemplate.sections.reduce((total, section) => total + section.questions.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Points</span>
                  <span className="font-medium">{examTemplate.totalPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time Limit</span>
                  <span className="font-medium">{examTemplate.timeLimit} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Passing Score</span>
                  <span className="font-medium">{examTemplate.settings.passingScore}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={previewExam}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Exam
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => saveExam(false)}
                  disabled={saving}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  onClick={() => saveExam(true)}
                  disabled={saving}
                  className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish Exam
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Exam Building Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Start with basic information and add sections progressively</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use different question types to test various skills</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Set appropriate point values based on question difficulty</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Preview your exam before publishing to students</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Audio questions require valid URLs and expected answers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
