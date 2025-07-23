"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Users,
  BarChart3,
  FileText,
  CheckCircle,
  Eye,
  Download,
  Award,
  Send,
  Settings,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Interfaces matching Prisma models and API responses
interface ExamQuestion {
  id: number
  type: "multiple-choice" | "fill-blank" | "true-false" | "short-answer" | "essay" | "matching" | "ordering" | "audio"
  question: string
  question_ru?: string
  options?: string[]
  correct_answer: string | boolean | string[]
  points: number
  hint?: string
  explanation?: string
  module_id?: number
  difficulty: "easy" | "medium" | "hard"
  tags: string[]
  audioUrl?: string
}

interface ExamSection {
  id: number
  exam_template_id: number
  title: string
  description?: string
  instructions?: string
  time_limit?: number
  max_points: number
  questions: ExamQuestion[]
  randomize_questions: boolean
  passing_score?: number
}

interface ExamSettings {
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

interface ExamTemplate {
  id: number
  title: string
  description: string
  instructions: string
  totalPoints: number
  timeLimit: number
  sections: ExamSection[]
  settings: ExamSettings
  createdAt: string
  updatedAt: string
  isActive: boolean
  isPublished: boolean
}

interface ExamResult {
  id: number
  examId: number
  examTitle?: string
  studentId: number
  studentName: string
  studentEmail: string
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  completedAt: string
  timeSpent: number
  attemptNumber: number
  answers: Record<string, any>
  sectionScores: Record<string, { score: number; total: number }>
}

interface CertificateData {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  score: number
  completedModules: number
  completedAt: string
  generatedAt: string
  examId?: number
  certificateNumber?: string
}

interface CertificateSettings {
  id?: number
  title: string
  subtitle: string
  description: string
  cefr_level: string
  institution_name: string
  institution_subtitle: string
  signatory_name: string
  signatory_title: string
  auto_generate: boolean
  email_delivery: boolean
  template: string
  created_at?: string
  updated_at?: string
}

// Default settings object
const DEFAULT_EXAM_SETTINGS: ExamSettings = {
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
}

export default function AdminExamPage() {
  const router = useRouter()
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>([])
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [generatedCertificates, setGeneratedCertificates] = useState<CertificateData[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ExamTemplate | null>(null)
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("templates")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Pagination states
  const [resultsPage, setResultsPage] = useState(1)
  const [certificatesPage, setCertificatesPage] = useState(1)
  const [templatesPage, setTemplatesPage] = useState(1)
  const itemsPerPage = 10

  const [certificateSettings, setCertificateSettings] = useState<CertificateSettings>({
    title: "Certificate of Achievement",
    subtitle: "Estonian Language Proficiency",
    description:
      "This is to certify that {studentName} has successfully completed the KeeleSeiklus Estonian language course and demonstrated proficiency at the {cefrLevel} level of the Common European Framework of Reference for Languages (CEFR).",
    cefr_level: "A1-A2",
    institution_name: "KeeleSeiklus Language Academy",
    institution_subtitle: "Estonian Adventure Learning Platform",
    signatory_name: "Dr. Estonian Teacher",
    signatory_title: "Director of Estonian Studies",
    auto_generate: true,
    email_delivery: false,
    template: "default",
  })

  // Helper function to ensure template has proper settings
  const ensureTemplateSettings = (template: any): ExamTemplate => {
    return {
      ...template,
      sections: template.sections || [],
      settings: {
        ...DEFAULT_EXAM_SETTINGS,
        ...(template.settings || {}),
      },
    }
  }

  // Pagination helper functions
  const getPaginatedItems = <T,>(items: T[], page: number, perPage: number = itemsPerPage) => {
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    return {
      items: items.slice(startIndex, endIndex),
      totalPages: Math.ceil(items.length / perPage),
      currentPage: page,
      totalItems: items.length,
    }
  }

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalItems: number
  }) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
          {totalItems} items
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const loadAllExamData = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("Loading exam data...")

        // Load exam templates
        const templatesRes = await fetch("/api/exam-templates", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!templatesRes.ok) {
          const errorData = await templatesRes.json().catch(() => ({ error: templatesRes.statusText }))
          throw new Error(`Failed to fetch exam templates: ${errorData.error || templatesRes.statusText}`)
        }

        const fetchedTemplates: ExamTemplate[] = await templatesRes.json()
        console.log(`Loaded ${fetchedTemplates.length} exam templates`)
        const templatesWithSettings = fetchedTemplates.map(ensureTemplateSettings)
        setExamTemplates(templatesWithSettings)

        // Load exam results
        try {
          const resultsRes = await fetch("/api/exam-results", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          })

          if (resultsRes.ok) {
            const fetchedResults: ExamResult[] = await resultsRes.json()
            console.log(`Loaded ${fetchedResults.length} exam results`)
            setExamResults(fetchedResults)
          } else {
            console.warn("Failed to fetch exam results, continuing without them")
            setExamResults([])
          }
        } catch (resultsError) {
          console.warn("Error fetching exam results:", resultsError)
          setExamResults([])
        }

        // Load certificates
        try {
          const certificatesRes = await fetch("/api/certificates", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          })

          if (certificatesRes.ok) {
            const fetchedCertificates: CertificateData[] = await certificatesRes.json()
            console.log(`Loaded ${fetchedCertificates.length} certificates`)
            setGeneratedCertificates(fetchedCertificates)
          } else {
            console.warn("Failed to fetch certificates, continuing without them")
            setGeneratedCertificates([])
          }
        } catch (certError) {
          console.warn("Error fetching certificates:", certError)
          setGeneratedCertificates([])
        }

        // Load certificate settings
        try {
          const certSettingsRes = await fetch("/api/certificate-settings", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          })

          if (certSettingsRes.ok) {
            const fetchedCertSettings: CertificateSettings = await certSettingsRes.json()
            setCertificateSettings(fetchedCertSettings)
          }
        } catch (settingsError) {
          console.warn("Error fetching certificate settings:", settingsError)
        }
      } catch (err: any) {
        console.error("Error loading exam page data:", err)
        setError(err.message || "An unexpected error occurred while loading exam data.")
        setExamTemplates([])
        setExamResults([])
        setGeneratedCertificates([])
      } finally {
        setLoading(false)
      }
    }

    loadAllExamData()
  }, [])

  // --- Exam Template Actions ---
  const createNewTemplate = () => {
    router.push("/admin/exam/new")
  }

  const saveTemplate = async (template: ExamTemplate) => {
    setSaving(true)
    try {
      const templateWithSettings = ensureTemplateSettings(template)
      const response = await fetch(`/api/exam-templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateWithSettings),
      })
      if (!response.ok)
        throw new Error(`Failed to save template: ${(await response.json()).error || response.statusText}`)
      toast.success("Exam template saved successfully!")
      const updatedTemplate = await response.json()
      const updatedTemplateWithSettings = ensureTemplateSettings(updatedTemplate)
      setExamTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplateWithSettings.id ? updatedTemplateWithSettings : t)),
      )
      setSelectedTemplate(updatedTemplateWithSettings)
    } catch (err: any) {
      console.error("Error saving template:", err)
      toast.error(`Failed to save template: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const duplicateTemplate = async (template: ExamTemplate) => {
    toast.info("Duplicating exam template...")
    try {
      const duplicatedTemplateData = {
        ...template,
        id: undefined,
        title: `${template.title} (Copy)`,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { ...DEFAULT_EXAM_SETTINGS, ...(template.settings || {}) },
      }
      const response = await fetch("/api/exam-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatedTemplateData),
      })
      if (!response.ok)
        throw new Error(`Failed to duplicate template: ${(await response.json()).error || response.statusText}`)
      toast.success("Template duplicated successfully!")
      const newTemplate = await response.json()
      const newTemplateWithSettings = ensureTemplateSettings(newTemplate)
      setExamTemplates((prev) => [...prev, newTemplateWithSettings])
    } catch (err: any) {
      console.error("Error duplicating template:", err)
      toast.error(`Failed to duplicate template: ${err.message}`)
    }
  }

  const deleteTemplate = async (templateId: number) => {
    toast.info("Deleting exam template...")
    try {
      const response = await fetch(`/api/exam-templates/${templateId}`, {
        method: "DELETE",
      })
      if (!response.ok)
        throw new Error(`Failed to delete template: ${(await response.json()).error || response.statusText}`)
      toast.success("Template deleted successfully!")
      setExamTemplates((prev) => prev.filter((t) => t.id !== templateId))
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null)
        setIsEditing(false)
      }
    } catch (err: any) {
      console.error("Error deleting template:", err)
      toast.error(`Failed to delete template: ${err.message}`)
    }
  }

  const publishTemplate = async (templateId: number) => {
    const templateToPublish = examTemplates.find((t) => t.id === templateId)
    if (!templateToPublish) return
    const newPublishedStatus = !templateToPublish.isPublished
    const actionText = newPublishedStatus ? "Publishing" : "Unpublishing"
    toast.info(`${actionText} exam template...`)
    try {
      const response = await fetch(`/api/exam-templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: newPublishedStatus }),
      })
      if (!response.ok)
        throw new Error(
          `Failed to ${actionText.toLowerCase()} template: ${(await response.json()).error || response.statusText}`,
        )
      toast.success(`Exam template ${newPublishedStatus ? "published" : "unpublished"} successfully!`)
      setExamTemplates((prev) => prev.map((t) => (t.id === templateId ? { ...t, isPublished: newPublishedStatus } : t)))
    } catch (err: any) {
      console.error(`Error ${actionText.toLowerCase()} template:`, err)
      toast.error(`Failed to ${actionText.toLowerCase()} template: ${err.message}`)
    }
  }

  const addSection = () => {
    if (!selectedTemplate) return
    const newSection: ExamSection = {
      id: Date.now(),
      exam_template_id: selectedTemplate.id,
      title: `Section ${(selectedTemplate.sections?.length || 0) + 1}`,
      max_points: 0,
      questions: [],
      randomize_questions: false,
    }
    setSelectedTemplate({
      ...selectedTemplate,
      sections: [...(selectedTemplate.sections || []), newSection],
    })
  }

  const updateSection = (sectionIndex: number, updates: Partial<ExamSection>) => {
    if (!selectedTemplate) return
    const updatedSections = [...(selectedTemplate.sections || [])]
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], ...updates }
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections })
  }

  const deleteSection = (sectionIndex: number) => {
    if (!selectedTemplate) return
    setSelectedTemplate({
      ...selectedTemplate,
      sections: selectedTemplate.sections.filter((_, i) => i !== sectionIndex),
    })
  }

  const addQuestion = (sectionIndex: number) => {
    if (!selectedTemplate) return
    const newQuestion: ExamQuestion = {
      id: Date.now(),
      type: "multiple-choice",
      question: "New Question",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correct_answer: 0,
      points: 1,
      difficulty: "easy",
      tags: [],
    }
    const updatedSections = [...(selectedTemplate.sections || [])]
    updatedSections[sectionIndex].questions.push(newQuestion)
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections })
  }

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<ExamQuestion>) => {
    if (!selectedTemplate) return
    const updatedSections = [...(selectedTemplate.sections || [])]
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      ...updates,
    }
    // Recalculate section max points when question points change
    if (updates.points !== undefined) {
      const sectionTotalPoints = updatedSections[sectionIndex].questions.reduce((sum, q) => sum + (q.points || 1), 0)
      updatedSections[sectionIndex].max_points = sectionTotalPoints
    }
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections })
  }

  const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
    if (!selectedTemplate) return
    const updatedSections = [...(selectedTemplate.sections || [])]
    updatedSections[sectionIndex].questions = updatedSections[sectionIndex].questions.filter(
      (_, i) => i !== questionIndex,
    )
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections })
  }

  const duplicateQuestion = (sectionId: number, questionId: number) => {
    if (!selectedTemplate) return
    const sectionIndex = selectedTemplate.sections.findIndex((s) => s.id === sectionId)
    if (sectionIndex === -1) return
    const questionIndex = selectedTemplate.sections[sectionIndex].questions.findIndex((q) => q.id === questionId)
    if (questionIndex === -1) return
    const question = selectedTemplate.sections[sectionIndex].questions[questionIndex]
    const newQuestion: ExamQuestion = {
      ...question,
      id: Date.now(),
    }
    const updatedSections = [...(selectedTemplate.sections || [])]
    updatedSections[sectionIndex].questions.push(newQuestion)
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections })
  }

  const handleAudioUpload = (sectionIndex: number, questionIndex: number, file: File) => {
    // In a real implementation, you would upload the file to a storage service
    // For now, we'll create a mock URL
    const audioUrl = URL.createObjectURL(file)
    updateQuestion(sectionIndex, questionIndex, { audioUrl })
    toast.success("Audio file uploaded successfully!")
  }

  const previewExam = () => {
    if (!selectedTemplate) return
    const previewHTML = `
      <html>
        <body>
          <h1>${selectedTemplate.title}</h1>
          <p>${selectedTemplate.description}</p>
          ${(selectedTemplate.sections || [])
            .map(
              (section, i) => `
                <h2>Section ${i + 1}: ${section.title}</h2>
                ${(section.questions || [])
                  .map(
                    (q, j) => `
                      <div>
                        <strong>Question ${j + 1}: ${q.question}</strong>
                        <p>Type: ${q.type}</p>
                        <p>Points: ${q.points}</p>
                        ${q.options ? `<p>Options: ${q.options.join(", ")}</p>` : ""}
                        ${q.audioUrl ? `<p>Audio: ${q.audioUrl}</p>` : ""}
                      </div>
                    `,
                  )
                  .join("")}
              `,
            )
            .join("")}
        </body>
      </html>
    `
    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(previewHTML)
      newWindow.document.close()
    }
  }

  const saveExam = async (publish: boolean) => {
    if (!selectedTemplate) return
    setSaving(true)
    try {
      const templateWithSettings = ensureTemplateSettings(selectedTemplate)
      const response = await fetch(`/api/exam-templates/${selectedTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...templateWithSettings, isPublished: publish }),
      })
      if (!response.ok) throw new Error(`Failed to save exam: ${(await response.json()).error || response.statusText}`)
      toast.success(publish ? "Exam published successfully!" : "Exam saved as draft!")
      const updatedTemplate = await response.json()
      const updatedTemplateWithSettings = ensureTemplateSettings(updatedTemplate)
      setExamTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplateWithSettings.id ? updatedTemplateWithSettings : t)),
      )
      setSelectedTemplate(updatedTemplateWithSettings)
      setIsEditing(false)
    } catch (err: any) {
      console.error("Error saving exam:", err)
      toast.error(`Failed to save exam: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const generateCertificate = async (result: ExamResult) => {
    toast.info(`Generating certificate for ${result.studentName}...`)
    try {
      const studentRes = await fetch(`/api/students/${result.studentId}`)
      if (!studentRes.ok)
        throw new Error(`Failed to fetch student data: ${(await studentRes.json()).error || studentRes.statusText}`)
      const studentData = await studentRes.json()
      const studentCompletedModulesCount = studentData.completedModules?.length || 0
      const certDataToSend = {
        studentId: result.studentId,
        examId: result.examId,
        studentName: result.studentName,
        studentEmail: result.studentEmail,
        score: result.percentage,
        completedModules: studentCompletedModulesCount,
        completedAt: result.completedAt,
        generatedAt: new Date().toISOString(),
        certificateNumber: `EST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      }
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certDataToSend),
      })
      if (!response.ok)
        throw new Error(`Failed to generate certificate: ${(await response.json()).error || response.statusText}`)
      const newCert = await response.json()
      toast.success(`Certificate generated for ${result.studentName}!`)
      setGeneratedCertificates((prev) => [...prev, newCert])
      return newCert
    } catch (err: any) {
      console.error("Error generating certificate:", err)
      toast.error(`Failed to generate certificate: ${err.message}`)
      return null
    }
  }

  const downloadCertificatePDF = async (certificate: CertificateData) => {
    try {
      console.log("Downloading certificate for:", certificate)

      // Generate certificate number if not exists
      const certificateNumber = certificate.certificateNumber || `EST-${Date.now()}-${certificate.studentId}`

      // Ensure we have a student name
      const studentName = certificate.studentName || "Student Name Not Available"

      console.log("Certificate details:", {
        studentName,
        certificateNumber,
        score: certificate.score,
        completedModules: certificate.completedModules,
      })

      // Create the certificate HTML for PDF conversion - SINGLE PAGE with student name
      const certificateHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Certificate of Achievement</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: 'Times New Roman', serif;
      margin: 0;
      padding: 0;
      background: white;
      color: #333;
      line-height: 1.4;
    }
    .certificate {
      width: 100%;
      max-width: 210mm;
      height: auto;
      min-height: 250mm;
      padding: 30px;
      border: 8px solid #2563eb;
      border-radius: 15px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      position: relative;
      box-sizing: border-box;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    .brand-name {
      font-size: 36px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 15px;
      letter-spacing: 3px;
      text-transform: uppercase;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    .title {
      font-size: 42px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 8px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    .subtitle {
      font-size: 20px;
      color: #6b7280;
      margin-bottom: 15px;
      font-style: italic;
    }
    .content { 
      text-align: center; 
      margin: 30px 0; 
    }
    .certify-text {
      font-size: 18px;
      margin-bottom: 15px;
      color: #374151;
    }
    .student-name {
      font-size: 32px;
      font-weight: bold;
      color: #1f2937;
      margin: 20px 0;
      border-bottom: 3px solid #2563eb;
      display: inline-block;
      padding-bottom: 8px;
      text-transform: capitalize;
    }
    .achievement {
      font-size: 16px;
      color: #374151;
      margin: 25px auto;
      line-height: 1.6;
      max-width: 500px;
      text-align: justify;
    }
    .details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 25px 0;
      padding: 15px;
      background: rgba(255,255,255,0.8);
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .detail-item { 
      text-align: center; 
      padding: 10px;
    }
    .detail-value {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      display: block;
      margin-bottom: 5px;
    }
    .detail-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin: 20px 0;
    }
    .signature {
      text-align: center;
      padding: 15px;
    }
    .signature-line {
      border-top: 2px solid #374151;
      margin-bottom: 8px;
      width: 150px;
      margin-left: auto;
      margin-right: auto;
    }
    .signature-name {
      font-weight: bold;
      font-size: 14px;
      color: #1f2937;
      margin-bottom: 3px;
    }
    .signature-title {
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
    }
    .date {
      color: #6b7280;
      font-size: 14px;
      margin-top: 15px;
      text-align: center;
    }
    .certificate-number {
      position: absolute;
      top: 15px;
      right: 20px;
      font-size: 10px;
      color: #6b7280;
      background: rgba(255,255,255,0.9);
      padding: 5px 8px;
      border-radius: 4px;
    }
    .decorative-border {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 2px solid #cbd5e1;
      border-radius: 10px;
      pointer-events: none;
    }
    @media print {
      body { 
        background: white !important; 
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .certificate { 
        box-shadow: none !important;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="decorative-border"></div>
    <div class="certificate-number">Certificate No: ${certificateNumber}</div>
    
    <div class="header">
      <div class="brand-name">KeeleSeiklus</div>
      <div class="title">Certificate of Achievement</div>
      <div class="subtitle">Estonian Language Proficiency</div>
    </div>
    
    <div class="content">
      <div class="certify-text">This is to certify that</div>
      <div class="student-name">${studentName}</div>
      
      <div class="achievement">
        has successfully completed the Estonian Language Proficiency Exam and demonstrated competency in Estonian language skills at the A1-A2 level of the Common European Framework of Reference for Languages (CEFR). This achievement represents dedication to learning and mastery of essential Estonian language communication skills.
      </div>
      
      <div class="details">
        <div class="detail-item">
          <span class="detail-value">${certificate.score}%</span>
          <div class="detail-label">Final Score</div>
        </div>
        <div class="detail-item">
          <span class="detail-value">${certificate.completedModules}</span>
          <div class="detail-label">Modules Completed</div>
        </div>
        <div class="detail-item">
          <span class="detail-value">A1-A2</span>
          <div class="detail-label">CEFR Level</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="signature-section">
        <div class="signature">
          <div class="signature-line"></div>
          <div class="signature-name">Dr. Estonian Teacher</div>
          <div class="signature-title">Director of Estonian Studies</div>
        </div>
        <div class="signature">
          <div class="signature-line"></div>
          <div class="signature-name">KeeleSeiklus Language Academy</div>
          <div class="signature-title">Estonian Adventure Learning Platform</div>
        </div>
      </div>
      <div class="date">
        Issued on ${new Date(certificate.completedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  </div>
</body>
</html>
`

      // Open in new window for PDF printing
      const newWindow = window.open("", "_blank")
      if (newWindow) {
        newWindow.document.write(certificateHTML)
        newWindow.document.close()

        // Wait for content to load then trigger print
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print()
          }, 500)
        }
      }

      toast.success("Certificate opened for PDF download! Use your browser's print function to save as PDF.")

      // Try to save certificate to database (optional, won't fail if API doesn't exist)
      try {
        const response = await fetch("/api/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            studentId: certificate.studentId,
            examId: certificate.examId,
            studentName: certificate.studentName,
            studentEmail: certificate.studentEmail,
            score: certificate.score,
            completedModules: certificate.completedModules,
            completedAt: new Date().toISOString(),
            generatedAt: new Date().toISOString(),
            certificateNumber: certificateNumber,
          }),
        })

        if (response.ok) {
          console.log("Certificate saved to database successfully")
        } else {
          console.log("Certificate database save failed, but download succeeded")
        }
      } catch (dbError) {
        console.log("Certificate database save failed, but download succeeded:", dbError)
      }
    } catch (err: any) {
      console.error("Error downloading certificate:", err)
      toast.error(`Failed to download certificate: ${err.message}`)
    }
  }

  const sendCertificateEmail = async (certificate: CertificateData) => {
    toast.info(`Sending certificate email to ${certificate.studentEmail}...`)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: [certificate.studentEmail],
          subject: certificateSettings.title,
          content: `${certificateSettings.description
            .replace("{studentName}", certificate.studentName)
            .replace("{cefrLevel}", certificateSettings.cefr_level)}
          \n\nYour certificate number is: ${certificate.certificateNumber}`,
          priority: "normal",
          personalizeContent: true,
          selectedTemplate: certificateSettings.template,
        }),
      })
      if (!response.ok)
        throw new Error(`Failed to send certificate email: ${(await response.json()).error || response.statusText}`)
      toast.success(`Certificate email sent to ${certificate.studentName}!`)
    } catch (err: any) {
      console.error("Error sending certificate email:", err)
      toast.error(`Failed to send certificate email: ${err.message}`)
    }
  }

  const deleteCertificate = async (certificateId: number) => {
    toast.info("Deleting certificate...")
    try {
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(errorData.error || errorData.message || "Failed to delete certificate")
      }
      toast.success("Certificate deleted successfully!")
      setGeneratedCertificates((prev) => prev.filter((c) => c.id !== certificateId))
    } catch (err: any) {
      console.error("Error deleting certificate:", err)
      toast.error(`Failed to delete certificate: ${err.message}`)
    }
  }

  const exportResults = () => {
    const csvContent = [
      ["Student Name", "Email", "Score", "Total Points", "Percentage", "Passed", "Completed At", "Time Spent (min)"],
      ...examResults.map((result) => [
        result.studentName,
        result.studentEmail,
        result.score.toString(),
        result.totalPoints.toString(),
        `${result.percentage}%`,
        result.passed ? "Yes" : "No",
        new Date(result.completedAt).toLocaleDateString(),
        Math.round(result.timeSpent / 60).toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exam-results.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Exam results exported successfully!")
  }

  const saveCertificateSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/certificate-settings", {
        method: certificateSettings.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certificateSettings),
      })
      let errorMessage = response.statusText || "An error occurred"
      if (!response.ok) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (jsonError) {
          console.warn("Failed to parse error response:", jsonError)
        }
        throw new Error(`Failed to save certificate settings: ${errorMessage}`)
      }
      const updatedSettings = await response.json()
      toast.success("Certificate settings saved successfully!")
      setCertificateSettings(updatedSettings.settings || updatedSettings)
    } catch (err: any) {
      console.error("Error saving certificate settings:", err)
      toast.error(`Failed to save certificate settings: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const getExamStats = () => {
    const totalExams = examTemplates.length
    const publishedExams = examTemplates.filter((t) => t.isPublished).length
    const totalResults = examResults.length
    const averageScore =
      examResults.length > 0
        ? Math.round(examResults.reduce((sum, result) => sum + result.percentage, 0) / examResults.length)
        : 0
    const passRate =
      examResults.length > 0 ? Math.round((examResults.filter((r) => r.passed).length / examResults.length) * 100) : 0
    return { totalExams, publishedExams, totalResults, averageScore, passRate }
  }

  const stats = getExamStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam management...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get paginated data
  const paginatedTemplates = getPaginatedItems(examTemplates, templatesPage)
  const paginatedResults = getPaginatedItems(examResults, resultsPage)
  const paginatedCertificates = getPaginatedItems(generatedCertificates, certificatesPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Exam Management
              </h1>
              <p className="text-gray-600 mt-2">Create, manage, and analyze Estonian language proficiency exams</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={createNewTemplate} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Create New Exam
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Exams</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalExams}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published Exams</p>
                  <p className="text-3xl font-bold text-green-600">{stats.publishedExams}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalResults}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificates Issued</p>
                  <p className="text-3xl font-bold text-orange-600">{generatedCertificates.length}</p>
                </div>
                <Award className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Exam Templates</TabsTrigger>
            <TabsTrigger value="results">Results & Analytics</TabsTrigger>
            <TabsTrigger value="certificates">Certificate Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Exam Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Exam Templates
                    </CardTitle>
                    <CardDescription>Manage your exam templates and questions</CardDescription>
                  </div>
                  <Button onClick={createNewTemplate} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Exam
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {paginatedTemplates.items.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No exam templates created yet</p>
                    <Button onClick={createNewTemplate} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Exam
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedTemplates.items.map((template) => (
                        <Card key={template.id} className="border-2 hover:border-blue-200 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">{template.title}</h3>
                                  <Badge variant={template.isPublished ? "default" : "secondary"}>
                                    {template.isPublished ? "Published" : "Draft"}
                                  </Badge>
                                  <Badge variant="outline">{template.sections?.length || 0} sections</Badge>
                                  <Badge variant="outline">{template.totalPoints} points</Badge>
                                </div>
                                <p className="text-gray-600 mb-3">{template.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>Time Limit: {template.timeLimit} minutes</span>
                                  <span>Passing Score: {template.settings?.passingScore || 70}%</span>
                                  <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTemplate(ensureTemplateSettings(template))
                                    setIsEditing(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => duplicateTemplate(template)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={template.isPublished ? "destructive" : "default"}
                                  size="sm"
                                  onClick={() => publishTemplate(template.id)}
                                >
                                  {template.isPublished ? "Unpublish" : "Publish"}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Exam Template</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{template.title}"? This action cannot be undone
                                        and will remove all associated questions and results.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteTemplate(template.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <PaginationControls
                      currentPage={paginatedTemplates.currentPage}
                      totalPages={paginatedTemplates.totalPages}
                      onPageChange={setTemplatesPage}
                      totalItems={paginatedTemplates.totalItems}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {isEditing ? "Edit Exam Template" : "View Exam Template"}
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(null)
                            setIsEditing(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => saveTemplate(selectedTemplate)} disabled={saving}>
                          {saving ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Exam Title</Label>
                      <Input
                        id="title"
                        value={selectedTemplate.title}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, title: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={selectedTemplate.description}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, description: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                        <Input
                          id="timeLimit"
                          type="number"
                          min="30"
                          max="300"
                          value={selectedTemplate.timeLimit}
                          onChange={(e) =>
                            setSelectedTemplate({
                              ...selectedTemplate,
                              timeLimit: Number.parseInt(e.target.value) || 120,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="passingScore">Passing Score (%)</Label>
                        <Input
                          id="passingScore"
                          type="number"
                          min="50"
                          max="100"
                          value={selectedTemplate.settings?.passingScore || DEFAULT_EXAM_SETTINGS.passingScore}
                          onChange={(e) =>
                            setSelectedTemplate({
                              ...selectedTemplate,
                              settings: {
                                ...selectedTemplate.settings,
                                passingScore: Number.parseInt(e.target.value) || 70,
                              },
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Sections</h3>
                      {isEditing && (
                        <Button size="sm" onClick={addSection}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Section
                        </Button>
                      )}
                    </div>
                    {(selectedTemplate.sections || []).map((section, sectionIndex) => (
                      <Card key={section.id} className="border">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              {isEditing ? (
                                <Input
                                  value={section.title}
                                  onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                                  className="font-semibold"
                                />
                              ) : (
                                <CardTitle className="text-base">{section.title}</CardTitle>
                              )}
                            </div>
                            {isEditing && (
                              <Button size="sm" variant="destructive" onClick={() => deleteSection(sectionIndex)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Questions ({section.questions.length})</h4>
                              {isEditing && (
                                <Button size="sm" variant="outline" onClick={() => addQuestion(sectionIndex)}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Question
                                </Button>
                              )}
                            </div>
                            {(section.questions || []).map((question, questionIndex) => (
                              <Card key={question.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-3">
                                      {isEditing ? (
                                        <>
                                          <div className="grid grid-cols-2 gap-2">
                                            <Select
                                              value={question.type}
                                              onValueChange={(value: any) =>
                                                updateQuestion(sectionIndex, questionIndex, { type: value })
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                                <SelectItem value="true-false">True/False</SelectItem>
                                                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                                                <SelectItem value="short-answer">Short Answer</SelectItem>
                                                <SelectItem value="essay">Essay</SelectItem>
                                                <SelectItem value="audio">Audio Question</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <Input
                                              type="number"
                                              placeholder="Points"
                                              value={question.points}
                                              onChange={(e) =>
                                                updateQuestion(sectionIndex, questionIndex, {
                                                  points: Number.parseInt(e.target.value) || 1,
                                                })
                                              }
                                            />
                                          </div>
                                          <Textarea
                                            placeholder="Question text"
                                            value={question.question}
                                            onChange={(e) =>
                                              updateQuestion(sectionIndex, questionIndex, {
                                                question: e.target.value,
                                              })
                                            }
                                            rows={2}
                                          />
                                        </>
                                      ) : (
                                        <>
                                          <div className="flex justify-between items-center">
                                            <Badge variant="outline" className="flex items-center gap-1">
                                              {question.type === "audio" && <Volume2 className="w-3 h-3" />}
                                              {question.type}
                                            </Badge>
                                            <Badge>{question.points} points</Badge>
                                          </div>
                                          <p className="font-medium">{question.question}</p>
                                        </>
                                      )}

                                      {/* Audio Question Specific Fields */}
                                      {question.type === "audio" && (
                                        <div className="space-y-2">
                                          <Label>Audio File</Label>
                                          {isEditing ? (
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="file"
                                                accept="audio/*"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0]
                                                  if (file) {
                                                    handleAudioUpload(sectionIndex, questionIndex, file)
                                                  }
                                                }}
                                              />
                                              <Button size="sm" variant="outline">
                                                <Upload className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          ) : (
                                            question.audioUrl && (
                                              <audio controls className="w-full">
                                                <source src={question.audioUrl} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                              </audio>
                                            )
                                          )}
                                          <div className="space-y-2">
                                            <Label>Correct Answer</Label>
                                            <Input
                                              value={question.correct_answer as string}
                                              onChange={(e) =>
                                                updateQuestion(sectionIndex, questionIndex, {
                                                  correct_answer: e.target.value,
                                                })
                                              }
                                              placeholder="Enter the correct answer for the audio question"
                                              disabled={!isEditing}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {question.type === "multiple-choice" && (
                                        <div className="space-y-2">
                                          <Label>Answer Options</Label>
                                          {(question.options || []).map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex gap-2">
                                              {isEditing ? (
                                                <>
                                                  <Input
                                                    value={option}
                                                    onChange={(e) => {
                                                      const newOptions = [...(question.options || [])]
                                                      newOptions[optionIndex] = e.target.value
                                                      updateQuestion(sectionIndex, questionIndex, {
                                                        options: newOptions,
                                                      })
                                                    }}
                                                  />
                                                  <Button
                                                    variant={
                                                      question.correct_answer === optionIndex ? "default" : "outline"
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                      updateQuestion(sectionIndex, questionIndex, {
                                                        correct_answer: optionIndex,
                                                      })
                                                    }
                                                  >
                                                    {question.correct_answer === optionIndex
                                                      ? "✓ Correct"
                                                      : "Set Correct"}
                                                  </Button>
                                                </>
                                              ) : (
                                                <span
                                                  className={`p-2 rounded ${
                                                    question.correct_answer === optionIndex
                                                      ? "bg-green-100 text-green-800 font-medium"
                                                      : "bg-gray-100"
                                                  }`}
                                                >
                                                  {option}
                                                  {question.correct_answer === optionIndex && " ✓"}
                                                </span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {(question.type === "fill-blank" || question.type === "short-answer") && (
                                        <div className="space-y-2">
                                          <Label>Correct Answer</Label>
                                          <Input
                                            value={question.correct_answer as string}
                                            onChange={(e) =>
                                              updateQuestion(sectionIndex, questionIndex, {
                                                correct_answer: e.target.value,
                                              })
                                            }
                                            placeholder="Enter the correct answer"
                                            disabled={!isEditing}
                                          />
                                        </div>
                                      )}
                                      {question.type === "true-false" && (
                                        <div className="space-y-2">
                                          <Label>Correct Answer</Label>
                                          <div className="flex gap-2">
                                            <Button
                                              variant={question.correct_answer === true ? "default" : "outline"}
                                              size="sm"
                                              onClick={() =>
                                                updateQuestion(sectionIndex, questionIndex, {
                                                  correct_answer: true,
                                                })
                                              }
                                              disabled={!isEditing}
                                            >
                                              {question.correct_answer === true ? "✓ True" : "True"}
                                            </Button>
                                            <Button
                                              variant={question.correct_answer === false ? "default" : "outline"}
                                              size="sm"
                                              onClick={() =>
                                                updateQuestion(sectionIndex, questionIndex, {
                                                  correct_answer: false,
                                                })
                                              }
                                              disabled={!isEditing}
                                            >
                                              {question.correct_answer === false ? "✓ False" : "False"}
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                      {isEditing && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          <div className="space-y-2">
                                            <Label>Difficulty</Label>
                                            <Select
                                              value={question.difficulty}
                                              onValueChange={(value: "easy" | "medium" | "hard") =>
                                                updateQuestion(sectionIndex, questionIndex, {
                                                  difficulty: value,
                                                })
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
                                                updateQuestion(sectionIndex, questionIndex, {
                                                  module_id: Number.parseInt(e.target.value) || undefined,
                                                })
                                              }
                                              placeholder="e.g., Module 12 ID"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Tags</Label>
                                            <Input
                                              value={question.tags.join(", ")}
                                              onChange={(e) =>
                                                updateQuestion(sectionIndex, questionIndex, {
                                                  tags: e.target.value
                                                    .split(",")
                                                    .map((tag) => tag.trim())
                                                    .filter((tag) => tag),
                                                })
                                              }
                                              placeholder="grammar, vocabulary"
                                            />
                                          </div>
                                        </div>
                                      )}
                                      {(question.hint || isEditing) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label>Hint (optional)</Label>
                                            <Textarea
                                              value={question.hint || ""}
                                              onChange={(e) =>
                                                updateQuestion(sectionIndex, questionIndex, {
                                                  hint: e.target.value,
                                                })
                                              }
                                              placeholder="Provide a helpful hint"
                                              rows={2}
                                              disabled={!isEditing}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Explanation (optional)</Label>
                                            <Textarea
                                              value={question.explanation || ""}
                                              onChange={(e) =>
                                                updateQuestion(sectionIndex, questionIndex, {
                                                  explanation: e.target.value,
                                                })
                                              }
                                              placeholder="Explain the correct answer"
                                              rows={2}
                                              disabled={!isEditing}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      {isEditing && (
                                        <>
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
                                            onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Results & Analytics Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Exam Results & Analytics
                </CardTitle>
                <CardDescription>View and analyze student exam performance</CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedResults.items.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No exam results available yet</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedResults.items.map((result) => (
                        <Card key={result.id} className="border hover:border-blue-200 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold">{result.studentName}</h4>
                                  <Badge variant={result.passed ? "default" : "destructive"}>
                                    {result.percentage}%
                                  </Badge>
                                  <Badge variant="outline">Attempt #{result.attemptNumber}</Badge>
                                  {result.examTitle && <Badge variant="secondary">{result.examTitle}</Badge>}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>
                                    Score: {result.score}/{result.totalPoints}
                                  </span>
                                  <span>
                                    Time: {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                                  </span>
                                  <span>Completed: {new Date(result.completedAt).toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)}>
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Button>
                                {result.passed && (
                                  <Button size="sm" onClick={() => generateCertificate(result)}>
                                    <Award className="w-4 h-4" />
                                    Generate Certificate
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <PaginationControls
                      currentPage={paginatedResults.currentPage}
                      totalPages={paginatedResults.totalPages}
                      onPageChange={setResultsPage}
                      totalItems={paginatedResults.totalItems}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificate Management Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certificate Management
                </CardTitle>
                <CardDescription>Manage and distribute certificates to successful students</CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedCertificates.items.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No certificates generated yet</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedCertificates.items.map((certificate) => (
                        <Card key={certificate.id} className="border hover:border-blue-200 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold">{certificate.studentName || "Unknown Student"}</h4>
                                  <Badge variant="default">{certificate.score}%</Badge>
                                  <Badge variant="outline">{certificate.completedModules} modules</Badge>
                                  {certificate.certificateNumber && (
                                    <Badge variant="secondary">{certificate.certificateNumber}</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>Email: {certificate.studentEmail}</span>
                                  <span>Completed: {new Date(certificate.completedAt).toLocaleDateString()}</span>
                                  <span>Generated: {new Date(certificate.generatedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => downloadCertificatePDF(certificate)}>
                                  <Download className="w-4 h-4" />
                                  PDF
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => sendCertificateEmail(certificate)}>
                                  <Send className="w-4 h-4" />
                                  Email
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this certificate? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteCertificate(certificate.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <PaginationControls
                      currentPage={paginatedCertificates.currentPage}
                      totalPages={paginatedCertificates.totalPages}
                      onPageChange={setCertificatesPage}
                      totalItems={paginatedCertificates.totalItems}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Certificate Settings
                </CardTitle>
                <CardDescription>Configure certificate templates and generation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cert-title">Certificate Title</Label>
                      <Input
                        id="cert-title"
                        value={certificateSettings.title}
                        onChange={(e) => setCertificateSettings((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cert-subtitle">Certificate Subtitle</Label>
                      <Input
                        id="cert-subtitle"
                        value={certificateSettings.subtitle}
                        onChange={(e) => setCertificateSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cefr-level">CEFR Level</Label>
                      <Input
                        id="cefr-level"
                        value={certificateSettings.cefr_level}
                        onChange={(e) => setCertificateSettings((prev) => ({ ...prev, cefr_level: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="institution-name">Institution Name</Label>
                      <Input
                        id="institution-name"
                        value={certificateSettings.institution_name}
                        onChange={(e) =>
                          setCertificateSettings((prev) => ({ ...prev, institution_name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signatory-name">Signatory Name</Label>
                      <Input
                        id="signatory-name"
                        value={certificateSettings.signatory_name}
                        onChange={(e) =>
                          setCertificateSettings((prev) => ({ ...prev, signatory_name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signatory-title">Signatory Title</Label>
                      <Input
                        id="signatory-title"
                        value={certificateSettings.signatory_title}
                        onChange={(e) =>
                          setCertificateSettings((prev) => ({ ...prev, signatory_title: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-description">Certificate Description</Label>
                  <Textarea
                    id="cert-description"
                    value={certificateSettings.description}
                    onChange={(e) => setCertificateSettings((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Label>Auto-generate Certificates</Label>
                    <p className="text-sm text-gray-600">Automatically generate certificates for passing students</p>
                  </div>
                  <Switch
                    checked={certificateSettings.auto_generate}
                    onCheckedChange={(checked) =>
                      setCertificateSettings((prev) => ({ ...prev, auto_generate: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Label>Email Delivery</Label>
                    <p className="text-sm text-gray-600">Automatically email certificates to students</p>
                  </div>
                  <Switch
                    checked={certificateSettings.email_delivery}
                    onCheckedChange={(checked) =>
                      setCertificateSettings((prev) => ({ ...prev, email_delivery: checked }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveCertificateSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
