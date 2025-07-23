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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  Users,
  BarChart3,
  FileText,
  CheckCircle,
  Eye,
  Download,
  Target,
  Award,
  Send,
  Settings,
  BadgeIcon as Certificate,
  Mail,
  Calendar,
  Clock,
  TrendingUp,
  User,
  GraduationCap,
} from "lucide-react"

interface Question {
  id: string
  type: "multiple-choice" | "fill-blank" | "true-false" | "short-answer" | "essay"
  question: string
  options?: string[]
  correctAnswer: string | number | boolean
  points: number
  explanation?: string
}

interface ExamSection {
  id: string
  title: string
  description?: string
  questions: Question[]
  timeLimit?: number
}

interface ExamTemplate {
  id: string
  title: string
  description: string
  sections: ExamSection[]
  totalPoints: number
  passingScore: number
  timeLimit: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  settings: {
    shuffleQuestions: boolean
    showResults: boolean
    allowRetake: boolean
    requireLogin: boolean
  }
}

interface ExamResult {
  id: string
  examId: string
  studentName: string
  studentEmail: string
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  completedAt: string
  timeSpent: number
  answers: Record<string, any>
  sectionScores: Record<string, { score: number; total: number }>
}

interface CertificateData {
  id: string
  studentName: string
  studentEmail: string
  score: number
  completedModules: number
  completedAt: string
  generatedAt: string
  examId?: string
  certificateNumber?: string
}

interface CertificateSettings {
  title: string
  subtitle: string
  description: string
  cefrLevel: string
  institutionName: string
  institutionSubtitle: string
  signatoryName: string
  signatoryTitle: string
  autoGenerate: boolean
  emailDelivery: boolean
  template: string
}

export default function AdminExamPage() {
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>([])
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [generatedCertificates, setGeneratedCertificates] = useState<CertificateData[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ExamTemplate | null>(null)
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("templates")
  const [certificateSettings, setCertificateSettings] = useState<CertificateSettings>({
    title: "Certificate of Achievement",
    subtitle: "Estonian Language Proficiency",
    description:
      "This is to certify that {studentName} has successfully completed the Eesti Seiklus Estonian language course and demonstrated proficiency at the {cefrLevel} level of the Common European Framework of Reference for Languages (CEFR).",
    cefrLevel: "A1-A2",
    institutionName: "Eesti Seiklus Language Academy",
    institutionSubtitle: "Estonian Adventure Learning Platform",
    signatoryName: "Dr. Estonian Teacher",
    signatoryTitle: "Director of Estonian Studies",
    autoGenerate: true,
    emailDelivery: false,
    template: "default",
  })

  // Load data from localStorage
  useEffect(() => {
    loadExamData()
    loadCertificateData()
  }, [])

  const loadExamData = () => {
    const savedTemplates = localStorage.getItem("examTemplates")
    const savedResults = localStorage.getItem("examResults")

    if (savedTemplates) {
      setExamTemplates(JSON.parse(savedTemplates))
    } else {
      const defaultTemplate = createDefaultTemplate()
      setExamTemplates([defaultTemplate])
      localStorage.setItem("examTemplates", JSON.stringify([defaultTemplate]))
    }

    if (savedResults) {
      setExamResults(JSON.parse(savedResults))
    }
  }

  const loadCertificateData = () => {
    const savedCertificates = localStorage.getItem("generatedCertificates")
    const savedSettings = localStorage.getItem("certificateSettings")

    if (savedCertificates) {
      setGeneratedCertificates(JSON.parse(savedCertificates))
    }

    if (savedSettings) {
      setCertificateSettings(JSON.parse(savedSettings))
    }
  }

  const createDefaultTemplate = (): ExamTemplate => {
    return {
      id: "default-exam",
      title: "Estonian Language Proficiency Exam",
      description:
        "Comprehensive assessment of Estonian language skills covering vocabulary, grammar, reading, and cultural knowledge.",
      sections: [
        {
          id: "vocabulary",
          title: "Vocabulary (20 points)",
          description: "Test your knowledge of Estonian words and phrases",
          questions: [
            {
              id: "vocab-1",
              type: "multiple-choice",
              question: "What does 'Tere' mean in English?",
              options: ["Hello", "Goodbye", "Thank you", "Please"],
              correctAnswer: 0,
              points: 2,
              explanation: "'Tere' is the most common greeting in Estonian, meaning 'Hello'.",
            },
            {
              id: "vocab-2",
              type: "multiple-choice",
              question: "How do you say 'Thank you' in Estonian?",
              options: ["Palun", "Aitäh", "Vabandust", "Tere"],
              correctAnswer: 1,
              points: 2,
              explanation: "'Aitäh' means 'Thank you' in Estonian.",
            },
            {
              id: "vocab-3",
              type: "fill-blank",
              question: "Complete the sentence: 'Ma _____ eesti keelt' (I _____ Estonian)",
              correctAnswer: "õpin",
              points: 3,
              explanation: "The verb 'õppima' means 'to learn' in Estonian.",
            },
            {
              id: "vocab-4",
              type: "multiple-choice",
              question: "What is 'leib' in English?",
              options: ["Milk", "Bread", "Water", "Meat"],
              correctAnswer: 1,
              points: 2,
            },
            {
              id: "vocab-5",
              type: "multiple-choice",
              question: "How do you say 'house' in Estonian?",
              options: ["Auto", "Maja", "Linn", "Tee"],
              correctAnswer: 1,
              points: 2,
            },
          ],
        },
        {
          id: "grammar",
          title: "Grammar (20 points)",
          description: "Estonian grammar rules and sentence structure",
          questions: [
            {
              id: "grammar-1",
              type: "multiple-choice",
              question: "Which is the correct plural form of 'laps' (child)?",
              options: ["lapsi", "lapsed", "lapse", "lapsid"],
              correctAnswer: 1,
              points: 3,
              explanation: "The plural nominative form of 'laps' is 'lapsed'.",
            },
            {
              id: "grammar-2",
              type: "true-false",
              question: "Estonian has 14 grammatical cases.",
              correctAnswer: true,
              points: 2,
              explanation:
                "True. Estonian has 14 grammatical cases, which is quite complex compared to many languages.",
            },
            {
              id: "grammar-3",
              type: "fill-blank",
              question: "Complete: 'Ma _____ koolis' (I _____ at school)",
              correctAnswer: "olen",
              points: 3,
            },
            {
              id: "grammar-4",
              type: "multiple-choice",
              question: "What is the partitive case of 'raamat' (book)?",
              options: ["raamatut", "raamatu", "raamatule", "raamatuga"],
              correctAnswer: 0,
              points: 4,
            },
            {
              id: "grammar-5",
              type: "multiple-choice",
              question: "How do you say 'I have a car' in Estonian?",
              options: ["Ma olen auto", "Mul on auto", "Ma auto", "Minu auto"],
              correctAnswer: 1,
              points: 4,
            },
          ],
        },
        {
          id: "reading",
          title: "Reading Comprehension (15 points)",
          description: "Understanding Estonian texts",
          questions: [
            {
              id: "reading-1",
              type: "multiple-choice",
              question: "Based on 'Tallinn on Eesti pealinn', what is Tallinn?",
              options: ["A city", "The capital", "A country", "A region"],
              correctAnswer: 1,
              points: 3,
              explanation: "'Pealinn' means capital city in Estonian.",
            },
            {
              id: "reading-2",
              type: "multiple-choice",
              question: "In the sentence 'Mul on kaks last', how many children are mentioned?",
              options: ["One", "Two", "Three", "Four"],
              correctAnswer: 1,
              points: 3,
            },
            {
              id: "reading-3",
              type: "fill-blank",
              question: "Complete: 'Eesti _____ on Tallinn' (Estonia's _____ is Tallinn)",
              correctAnswer: "pealinn",
              points: 4,
            },
            {
              id: "reading-4",
              type: "true-false",
              question: "The sentence 'Ma elan Tallinnas' means 'I live in Tallinn'.",
              correctAnswer: true,
              points: 2,
            },
            {
              id: "reading-5",
              type: "short-answer",
              question: "What does 'Kas sa räägid eesti keelt?' mean in English?",
              correctAnswer: "Do you speak Estonian?",
              points: 3,
            },
          ],
        },
        {
          id: "cultural",
          title: "Cultural Knowledge (10 points)",
          description: "Estonian culture and traditions",
          questions: [
            {
              id: "cultural-1",
              type: "multiple-choice",
              question: "What is the traditional Estonian folk song festival called?",
              options: ["Laulupidu", "Tantsupidu", "Muusikafestival", "Kultuuripäev"],
              correctAnswer: 0,
              points: 3,
              explanation:
                "'Laulupidu' (Song Festival) is Estonia's most important cultural event, held every five years.",
            },
            {
              id: "cultural-2",
              type: "multiple-choice",
              question: "Which city is known as Estonia's cultural capital?",
              options: ["Tallinn", "Tartu", "Pärnu", "Narva"],
              correctAnswer: 1,
              points: 2,
            },
            {
              id: "cultural-3",
              type: "true-false",
              question: "Estonia regained independence in 1991.",
              correctAnswer: true,
              points: 2,
            },
            {
              id: "cultural-4",
              type: "multiple-choice",
              question: "What is Estonia's national flower?",
              options: ["Rose", "Tulip", "Cornflower", "Daisy"],
              correctAnswer: 2,
              points: 3,
            },
          ],
        },
        {
          id: "writing",
          title: "Writing (15 points)",
          description: "Express yourself in Estonian",
          questions: [
            {
              id: "writing-1",
              type: "essay",
              question:
                "Write a short paragraph (50-100 words) about yourself in Estonian. Include your name, age, and what you like to do.",
              correctAnswer: "",
              points: 8,
              explanation:
                "This tests your ability to construct sentences and express personal information in Estonian.",
            },
            {
              id: "writing-2",
              type: "short-answer",
              question: "Write three sentences in Estonian about your family.",
              correctAnswer: "",
              points: 7,
            },
          ],
        },
      ],
      totalPoints: 80,
      passingScore: 70,
      timeLimit: 120,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        shuffleQuestions: false,
        showResults: true,
        allowRetake: true,
        requireLogin: true,
      },
    }
  }

  const saveTemplates = (templates: ExamTemplate[]) => {
    setExamTemplates(templates)
    localStorage.setItem("examTemplates", JSON.stringify(templates))
  }

  const saveCertificateSettings = (settings: CertificateSettings) => {
    setCertificateSettings(settings)
    localStorage.setItem("certificateSettings", JSON.stringify(settings))
  }

  const createNewTemplate = () => {
    const newTemplate: ExamTemplate = {
      id: `exam-${Date.now()}`,
      title: "New Exam",
      description: "Description for new exam",
      sections: [],
      totalPoints: 0,
      passingScore: 70,
      timeLimit: 60,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        shuffleQuestions: false,
        showResults: true,
        allowRetake: true,
        requireLogin: true,
      },
    }

    setSelectedTemplate(newTemplate)
    setIsEditing(true)
  }

  const duplicateTemplate = (template: ExamTemplate) => {
    const duplicated: ExamTemplate = {
      ...template,
      id: `exam-${Date.now()}`,
      title: `${template.title} (Copy)`,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedTemplates = [...examTemplates, duplicated]
    saveTemplates(updatedTemplates)
  }

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = examTemplates.filter((t) => t.id !== templateId)
    saveTemplates(updatedTemplates)

    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null)
      setIsEditing(false)
    }
  }

  const publishTemplate = (templateId: string) => {
    const updatedTemplates = examTemplates.map((template) => {
      if (template.id === templateId) {
        const published = { ...template, isPublished: !template.isPublished, updatedAt: new Date().toISOString() }

        if (published.isPublished) {
          examTemplates.forEach((t) => {
            if (t.id !== templateId && t.isPublished) {
              t.isPublished = false
            }
          })

          localStorage.setItem("activeExamTemplate", JSON.stringify(published))
          localStorage.setItem("examSettings", JSON.stringify(published.settings))
        } else {
          localStorage.removeItem("activeExamTemplate")
          localStorage.removeItem("examSettings")
        }

        return published
      }
      return { ...template, isPublished: false }
    })

    saveTemplates(updatedTemplates)
  }

  const saveTemplate = (template: ExamTemplate) => {
    const totalPoints = template.sections.reduce(
      (total, section) =>
        total + section.questions.reduce((sectionTotal, question) => sectionTotal + question.points, 0),
      0,
    )

    const updatedTemplate = {
      ...template,
      totalPoints,
      updatedAt: new Date().toISOString(),
    }

    const existingIndex = examTemplates.findIndex((t) => t.id === template.id)
    let updatedTemplates

    if (existingIndex >= 0) {
      updatedTemplates = [...examTemplates]
      updatedTemplates[existingIndex] = updatedTemplate
    } else {
      updatedTemplates = [...examTemplates, updatedTemplate]
    }

    saveTemplates(updatedTemplates)
    setSelectedTemplate(updatedTemplate)
    setIsEditing(false)
  }

  const addSection = () => {
    if (!selectedTemplate) return

    const newSection: ExamSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      description: "Section description",
      questions: [],
    }

    setSelectedTemplate({
      ...selectedTemplate,
      sections: [...selectedTemplate.sections, newSection],
    })
  }

  const updateSection = (sectionIndex: number, updates: Partial<ExamSection>) => {
    if (!selectedTemplate) return

    const updatedSections = [...selectedTemplate.sections]
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], ...updates }

    setSelectedTemplate({
      ...selectedTemplate,
      sections: updatedSections,
    })
  }

  const deleteSection = (sectionIndex: number) => {
    if (!selectedTemplate) return

    const updatedSections = selectedTemplate.sections.filter((_, index) => index !== sectionIndex)
    setSelectedTemplate({
      ...selectedTemplate,
      sections: updatedSections,
    })
  }

  const addQuestion = (sectionIndex: number) => {
    if (!selectedTemplate) return

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: "multiple-choice",
      question: "New question",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: 0,
      points: 1,
    }

    const updatedSections = [...selectedTemplate.sections]
    updatedSections[sectionIndex].questions.push(newQuestion)

    setSelectedTemplate({
      ...selectedTemplate,
      sections: updatedSections,
    })
  }

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => {
    if (!selectedTemplate) return

    const updatedSections = [...selectedTemplate.sections]
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      ...updates,
    }

    setSelectedTemplate({
      ...selectedTemplate,
      sections: updatedSections,
    })
  }

  const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
    if (!selectedTemplate) return

    const updatedSections = [...selectedTemplate.sections]
    updatedSections[sectionIndex].questions.splice(questionIndex, 1)

    setSelectedTemplate({
      ...selectedTemplate,
      sections: updatedSections,
    })
  }

  const generateCertificate = (result: ExamResult) => {
    const certificateData: CertificateData = {
      id: `cert_${Date.now()}`,
      studentName: result.studentName,
      studentEmail: result.studentEmail,
      score: result.percentage,
      completedModules: JSON.parse(localStorage.getItem("completedModules") || "[]").length,
      completedAt: result.completedAt,
      generatedAt: new Date().toISOString(),
      examId: result.examId,
      certificateNumber: `EST-${Date.now().toString().slice(-6)}`,
    }

    const updatedCertificates = [...generatedCertificates, certificateData]
    setGeneratedCertificates(updatedCertificates)
    localStorage.setItem("generatedCertificates", JSON.stringify(updatedCertificates))

    return certificateData
  }

  const downloadCertificate = (certificate: CertificateData) => {
    const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${certificateSettings.title}</title>
      <style>
        body { 
          font-family: 'Times New Roman', serif; 
          margin: 0; 
          padding: 40px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .certificate { 
          background: white; 
          padding: 60px; 
          border-radius: 20px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
          max-width: 800px; 
          width: 100%;
          position: relative;
        }
        .header { text-align: center; margin-bottom: 40px; }
        .title { 
          font-size: 48px; 
          font-weight: bold; 
          color: #2563eb; 
          margin-bottom: 10px; 
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .subtitle { 
          font-size: 24px; 
          color: #6b7280; 
          margin-bottom: 20px;
        }
        .content { text-align: center; margin: 40px 0; }
        .student-name { 
          font-size: 36px; 
          font-weight: bold; 
          color: #1f2937; 
          margin: 20px 0; 
          border-bottom: 3px solid #2563eb; 
          display: inline-block; 
          padding-bottom: 10px; 
        }
        .achievement { 
          font-size: 18px; 
          color: #374151; 
          margin: 20px 0; 
          line-height: 1.8; 
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .details { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 20px; 
          margin: 40px 0; 
          padding: 20px;
          background: #f8fafc;
          border-radius: 10px;
        }
        .detail-item { text-align: center; }
        .detail-value { 
          font-size: 28px; 
          font-weight: bold; 
          color: #2563eb; 
          display: block;
        }
        .detail-label { 
          font-size: 14px; 
          color: #6b7280; 
          margin-top: 5px;
        }
        .footer { 
          text-align: center; 
          margin-top: 50px; 
          padding-top: 30px; 
          border-top: 2px solid #e5e7eb; 
        }
        .signature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin: 30px 0;
        }
        .signature {
          text-align: center;
          padding: 20px;
        }
        .signature-line {
          border-top: 2px solid #374151;
          margin-bottom: 10px;
          width: 200px;
          margin-left: auto;
          margin-right: auto;
        }
        .signature-name {
          font-weight: bold;
          font-size: 16px;
          color: #1f2937;
        }
        .signature-title {
          font-size: 14px;
          color: #6b7280;
          margin-top: 5px;
        }
        .date { 
          color: #6b7280; 
          font-size: 16px;
          margin-top: 20px;
        }
        .certificate-number {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body { background: white; padding: 0; }
          .certificate { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="certificate-number">Certificate No: ${certificate.certificateNumber}</div>
        
        <div class="header">
          <div class="title">${certificateSettings.title}</div>
          <div class="subtitle">${certificateSettings.subtitle}</div>
        </div>
        
        <div class="content">
          <div style="font-size: 20px; margin-bottom: 20px;">This is to certify that</div>
          <div class="student-name">${certificate.studentName}</div>
          
          <div class="achievement">
            ${certificateSettings.description
              .replace("{studentName}", certificate.studentName)
              .replace("{cefrLevel}", certificateSettings.cefrLevel)}
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
              <span class="detail-value">${certificateSettings.cefrLevel}</span>
              <div class="detail-label">CEFR Level</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="signature-section">
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-name">${certificateSettings.signatoryName}</div>
              <div class="signature-title">${certificateSettings.signatoryTitle}</div>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-name">${certificateSettings.institutionName}</div>
              <div class="signature-title">${certificateSettings.institutionSubtitle}</div>
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

    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(certificateHTML)
      newWindow.document.close()
    }
  }

  const sendCertificateEmail = (certificate: CertificateData) => {
    // Simulate email sending
    alert(`Certificate sent to ${certificate.studentEmail}`)
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
  }

  const getPublishedExam = () => {
    return examTemplates.find((template) => template.isPublished)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Exam Management
          </h1>
          <p className="text-gray-600">Create, manage, and monitor Estonian language proficiency exams</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Exams</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalExams}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">{stats.publishedExams}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Submissions</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalResults}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.averageScore}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.passRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Exam Templates</TabsTrigger>
            <TabsTrigger value="results">Results & Analytics</TabsTrigger>
            <TabsTrigger value="certificates">Certificate Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Exam Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Exam Templates</h2>
              <Button onClick={createNewTemplate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Exam
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Templates List */}
              <div className="space-y-4">
                {examTemplates.map((template) => (
                  <Card key={template.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {template.title}
                            {template.isPublished && <Badge className="bg-green-100 text-green-800">Published</Badge>}
                          </CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{template.sections.length}</div>
                          <div className="text-sm text-gray-600">Sections</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">{template.totalPoints}</div>
                          <div className="text-sm text-gray-600">Points</div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setIsEditing(false)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setIsEditing(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </Button>
                        <Button
                          size="sm"
                          variant={template.isPublished ? "destructive" : "default"}
                          onClick={() => publishTemplate(template.id)}
                        >
                          {template.isPublished ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Publish
                            </>
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Exam Template</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{template.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTemplate(template.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {examTemplates.length === 0 && (
                  <Card className="text-center p-8">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Exam Templates</h3>
                    <p className="text-gray-600 mb-4">Create your first exam template to get started.</p>
                    <Button onClick={createNewTemplate}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Exam Template
                    </Button>
                  </Card>
                )}
              </div>

              {/* Template Editor */}
              {selectedTemplate && (
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {isEditing ? "Edit Exam Template" : "View Exam Template"}
                      {isEditing && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false)
                              setSelectedTemplate(null)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => saveTemplate(selectedTemplate)}>
                            Save
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                    {/* Basic Info */}
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
                            value={selectedTemplate.timeLimit}
                            onChange={(e) =>
                              setSelectedTemplate({
                                ...selectedTemplate,
                                timeLimit: Number.parseInt(e.target.value) || 60,
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
                            value={selectedTemplate.passingScore}
                            onChange={(e) =>
                              setSelectedTemplate({
                                ...selectedTemplate,
                                passingScore: Number.parseInt(e.target.value) || 70,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sections */}
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

                      {selectedTemplate.sections.map((section, sectionIndex) => (
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
                            {/* Questions */}
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

                              {section.questions.map((question, questionIndex) => (
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
                                            />
                                          </>
                                        ) : (
                                          <>
                                            <div className="flex justify-between items-center">
                                              <Badge variant="outline">{question.type}</Badge>
                                              <Badge>{question.points} points</Badge>
                                            </div>
                                            <p className="font-medium">{question.question}</p>
                                          </>
                                        )}

                                        {/* Question Options */}
                                        {question.type === "multiple-choice" && (
                                          <div className="space-y-2">
                                            {question.options?.map((option, optionIndex) => (
                                              <div key={optionIndex} className="flex items-center gap-2">
                                                {isEditing ? (
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
                                                ) : (
                                                  <span
                                                    className={`p-2 rounded ${
                                                      question.correctAnswer === optionIndex
                                                        ? "bg-green-100 text-green-800 font-medium"
                                                        : "bg-gray-100"
                                                    }`}
                                                  >
                                                    {option}
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Correct Answer */}
                                        {isEditing && (
                                          <div>
                                            <Label>Correct Answer</Label>
                                            {question.type === "multiple-choice" ? (
                                              <Select
                                                value={question.correctAnswer.toString()}
                                                onValueChange={(value) =>
                                                  updateQuestion(sectionIndex, questionIndex, {
                                                    correctAnswer: Number.parseInt(value),
                                                  })
                                                }
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {question.options?.map((option, index) => (
                                                    <SelectItem key={index} value={index.toString()}>
                                                      {option}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            ) : question.type === "true-false" ? (
                                              <Select
                                                value={question.correctAnswer.toString()}
                                                onValueChange={(value) =>
                                                  updateQuestion(sectionIndex, questionIndex, {
                                                    correctAnswer: value === "true",
                                                  })
                                                }
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="true">True</SelectItem>
                                                  <SelectItem value="false">False</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            ) : (
                                              <Input
                                                value={question.correctAnswer.toString()}
                                                onChange={(e) =>
                                                  updateQuestion(sectionIndex, questionIndex, {
                                                    correctAnswer: e.target.value,
                                                  })
                                                }
                                              />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {isEditing && (
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
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
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Exam Results & Analytics</h2>
              {examResults.length > 0 && (
                <Button onClick={exportResults} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              )}
            </div>

            {examResults.length > 0 ? (
              <div className="space-y-4">
                {/* Analytics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Submissions</p>
                          <p className="text-3xl font-bold text-blue-600">{examResults.length}</p>
                        </div>
                        <Users className="w-10 h-10 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Pass Rate</p>
                          <p className="text-3xl font-bold text-green-600">{stats.passRate}%</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Average Score</p>
                          <p className="text-3xl font-bold text-purple-600">{stats.averageScore}%</p>
                        </div>
                        <BarChart3 className="w-10 h-10 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Individual Results */}
                {examResults.map((result) => (
                  <Card key={result.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-500" />
                              <h3 className="font-semibold text-lg">{result.studentName}</h3>
                            </div>
                            <Badge variant={result.passed ? "default" : "destructive"} className="text-sm">
                              {result.passed ? "PASSED" : "FAILED"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{result.studentEmail}</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">
                                <strong>{result.percentage}%</strong> ({result.score}/{result.totalPoints})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{new Date(result.completedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">{Math.round(result.timeSpent / 60)} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-purple-500" />
                              <span className="text-sm">
                                {result.passed &&
                                generatedCertificates.find((c) => c.studentEmail === result.studentEmail)
                                  ? "Certified"
                                  : result.passed
                                    ? "Eligible"
                                    : "Not Eligible"}
                              </span>
                            </div>
                          </div>

                          {/* Section Scores */}
                          {result.sectionScores && Object.keys(result.sectionScores).length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Section Performance:</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(result.sectionScores).map(([sectionId, sectionScore]) => {
                                  const percentage = Math.round((sectionScore.score / sectionScore.total) * 100)
                                  return (
                                    <div key={sectionId} className="text-center p-2 bg-gray-50 rounded">
                                      <div className="text-sm font-medium capitalize">{sectionId}</div>
                                      <div
                                        className={`text-lg font-bold ${percentage >= 70 ? "text-green-600" : "text-red-600"}`}
                                      >
                                        {percentage}%
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {sectionScore.score}/{sectionScore.total}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedResult(result)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Exam Result Details - {result.studentName}</DialogTitle>
                                <DialogDescription>Detailed breakdown of exam performance</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Student Name</Label>
                                    <p className="font-medium">{result.studentName}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="font-medium">{result.studentEmail}</p>
                                  </div>
                                  <div>
                                    <Label>Final Score</Label>
                                    <p className="font-medium">
                                      {result.percentage}% ({result.score}/{result.totalPoints})
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <Badge variant={result.passed ? "default" : "destructive"}>
                                      {result.passed ? "PASSED" : "FAILED"}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label>Completed At</Label>
                                    <p className="font-medium">{new Date(result.completedAt).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <Label>Time Spent</Label>
                                    <p className="font-medium">{Math.round(result.timeSpent / 60)} minutes</p>
                                  </div>
                                </div>

                                {/* Section Breakdown */}
                                {result.sectionScores && (
                                  <div>
                                    <Label>Section Performance</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                      {Object.entries(result.sectionScores).map(([sectionId, sectionScore]) => {
                                        const percentage = Math.round((sectionScore.score / sectionScore.total) * 100)
                                        return (
                                          <div key={sectionId} className="p-4 border rounded-lg">
                                            <h4 className="font-medium capitalize">{sectionId}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                              <span>
                                                {sectionScore.score}/{sectionScore.total} points
                                              </span>
                                              <Badge variant={percentage >= 70 ? "default" : "destructive"}>
                                                {percentage}%
                                              </Badge>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Answers Review */}
                                {result.answers && Object.keys(result.answers).length > 0 && (
                                  <div>
                                    <Label>Answer Summary</Label>
                                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">
                                        {Object.keys(result.answers).length} questions answered
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {result.passed && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const existingCert = generatedCertificates.find(
                                  (c) => c.studentEmail === result.studentEmail,
                                )
                                if (existingCert) {
                                  downloadCertificate(existingCert)
                                } else {
                                  const newCert = generateCertificate(result)
                                  downloadCertificate(newCert)
                                }
                              }}
                            >
                              <Certificate className="w-4 h-4 mr-2" />
                              Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Yet</h3>
                <p className="text-gray-600 mb-4">Exam results will appear here once students start taking exams.</p>
                {getPublishedExam() ? (
                  <p className="text-sm text-blue-600">
                    Your exam "{getPublishedExam()?.title}" is published and ready for students
                  </p>
                ) : (
                  <p className="text-sm text-orange-600">Publish an exam template to start receiving results</p>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Certificate Management Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Certificate Management</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Generate certificates for all passing students who don't have one
                    const passingResults = examResults.filter((r) => r.passed)
                    const newCertificates: CertificateData[] = []

                    passingResults.forEach((result) => {
                      const existingCert = generatedCertificates.find((c) => c.studentEmail === result.studentEmail)
                      if (!existingCert) {
                        const newCert = generateCertificate(result)
                        newCertificates.push(newCert)
                      }
                    })

                    if (newCertificates.length > 0) {
                      alert(`Generated ${newCertificates.length} new certificates`)
                    } else {
                      alert("All eligible students already have certificates")
                    }
                  }}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Generate All Certificates
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    generatedCertificates.forEach((cert) => {
                      if (certificateSettings.emailDelivery) {
                        sendCertificateEmail(cert)
                      }
                    })
                    alert(`Sent ${generatedCertificates.length} certificates via email`)
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send All Certificates
                </Button>
              </div>
            </div>

            {/* Certificate Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Certificates</p>
                      <p className="text-3xl font-bold text-blue-600">{generatedCertificates.length}</p>
                    </div>
                    <Certificate className="w-10 h-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Eligible Students</p>
                      <p className="text-3xl font-bold text-green-600">{examResults.filter((r) => r.passed).length}</p>
                    </div>
                    <GraduationCap className="w-10 h-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Certificates</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {examResults.filter((r) => r.passed).length - generatedCertificates.length}
                      </p>
                    </div>
                    <Clock className="w-10 h-10 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generated Certificates List */}
            {generatedCertificates.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Generated Certificates</h3>
                {generatedCertificates.map((certificate) => (
                  <Card key={certificate.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-lg">{certificate.studentName}</h3>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Certificate #{certificate.certificateNumber}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{certificate.studentEmail}</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">
                                <strong>{certificate.score}%</strong> Score
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-purple-500" />
                              <span className="text-sm">
                                <strong>{certificate.completedModules}</strong> Modules
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{new Date(certificate.completedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">
                                Generated {new Date(certificate.generatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" onClick={() => downloadCertificate(certificate)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => sendCertificateEmail(certificate)}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Email
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedCertificate(certificate)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Certificate Preview</DialogTitle>
                                <DialogDescription>
                                  Preview of {certificate.studentName}'s certificate
                                </DialogDescription>
                              </DialogHeader>
                              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                                <div className="text-center space-y-4">
                                  <h2 className="text-2xl font-bold text-blue-600">{certificateSettings.title}</h2>
                                  <p className="text-lg text-gray-600">{certificateSettings.subtitle}</p>
                                  <div className="my-6">
                                    <p className="text-sm text-gray-600 mb-2">This is to certify that</p>
                                    <p className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 inline-block pb-1">
                                      {certificate.studentName}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-700 max-w-md mx-auto">
                                    {certificateSettings.description
                                      .replace("{studentName}", certificate.studentName)
                                      .replace("{cefrLevel}", certificateSettings.cefrLevel)}
                                  </p>
                                  <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center">
                                      <p className="text-lg font-bold text-blue-600">{certificate.score}%</p>
                                      <p className="text-xs text-gray-600">Final Score</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-bold text-purple-600">
                                        {certificate.completedModules}
                                      </p>
                                      <p className="text-xs text-gray-600">Modules</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-bold text-green-600">
                                        {certificateSettings.cefrLevel}
                                      </p>
                                      <p className="text-xs text-gray-600">CEFR Level</p>
                                    </div>
                                  </div>
                                  <div className="mt-6 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                      Certificate #{certificate.certificateNumber} • Issued{" "}
                                      {new Date(certificate.completedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={() => downloadCertificate(certificate)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Full Certificate
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <Certificate className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Certificates Generated</h3>
                <p className="text-gray-600 mb-4">
                  Certificates will be generated automatically when students pass exams, or you can generate them
                  manually.
                </p>
                {examResults.filter((r) => r.passed).length > 0 && (
                  <Button
                    onClick={() => {
                      const passingResults = examResults.filter((r) => r.passed)
                      passingResults.forEach((result) => {
                        const existingCert = generatedCertificates.find((c) => c.studentEmail === result.studentEmail)
                        if (!existingCert) {
                          generateCertificate(result)
                        }
                      })
                      alert(`Generated certificates for ${passingResults.length} students`)
                    }}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Generate Certificates Now
                  </Button>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-semibold">Exam Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exam Requirements */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Exam Requirements
                  </CardTitle>
                  <CardDescription>Configure prerequisites for taking exams</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireAllModules">Require All Modules</Label>
                      <p className="text-sm text-gray-600">Students must complete all 40 modules</p>
                    </div>
                    <Switch
                      id="requireAllModules"
                      checked={JSON.parse(localStorage.getItem("examRequireAllModules") || "true")}
                      onCheckedChange={(checked) => {
                        localStorage.setItem("examRequireAllModules", JSON.stringify(checked))
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="minModules">Minimum Modules Required</Label>
                    <Input
                      id="minModules"
                      type="number"
                      min="1"
                      max="40"
                      defaultValue={localStorage.getItem("examMinModulesRequired") || "10"}
                      onChange={(e) => {
                        localStorage.setItem("examMinModulesRequired", e.target.value)
                      }}
                    />
                    <p className="text-sm text-gray-600 mt-1">Only applies if "Require All Modules" is disabled</p>
                  </div>
                </CardContent>
              </Card>

              {/* Certificate Settings */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certificate Settings
                  </CardTitle>
                  <CardDescription>Configure certificate generation and delivery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoGenerateCert">Auto-Generate Certificates</Label>
                      <p className="text-sm text-gray-600">Automatically create certificates for passing students</p>
                    </div>
                    <Switch
                      id="autoGenerateCert"
                      checked={certificateSettings.autoGenerate}
                      onCheckedChange={(checked) => {
                        const newSettings = { ...certificateSettings, autoGenerate: checked }
                        saveCertificateSettings(newSettings)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailCertificates">Email Certificates</Label>
                      <p className="text-sm text-gray-600">Send certificates via email</p>
                    </div>
                    <Switch
                      id="emailCertificates"
                      checked={certificateSettings.emailDelivery}
                      onCheckedChange={(checked) => {
                        const newSettings = { ...certificateSettings, emailDelivery: checked }
                        saveCertificateSettings(newSettings)
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="certTemplate">Certificate Template</Label>
                    <Select
                      value={certificateSettings.template}
                      onValueChange={(value) => {
                        const newSettings = { ...certificateSettings, template: value }
                        saveCertificateSettings(newSettings)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Template</SelectItem>
                        <SelectItem value="modern">Modern Template</SelectItem>
                        <SelectItem value="classic">Classic Template</SelectItem>
                        <SelectItem value="elegant">Elegant Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certificate Customization */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Certificate Customization
                </CardTitle>
                <CardDescription>Customize certificate content and appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certTitle">Certificate Title</Label>
                    <Input
                      id="certTitle"
                      value={certificateSettings.title}
                      onChange={(e) => {
                        const newSettings = { ...certificateSettings, title: e.target.value }
                        saveCertificateSettings(newSettings)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="certSubtitle">Certificate Subtitle</Label>
                    <Input
                      id="certSubtitle"
                      value={certificateSettings.subtitle}
                      onChange={(e) => {
                        const newSettings = { ...certificateSettings, subtitle: e.target.value }
                        saveCertificateSettings(newSettings)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cefrLevel">CEFR Level</Label>
                    <Select
                      value={certificateSettings.cefrLevel}
                      onValueChange={(value) => {
                        const newSettings = { ...certificateSettings, cefrLevel: value }
                        saveCertificateSettings(newSettings)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1">A1 - Beginner</SelectItem>
                        <SelectItem value="A2">A2 - Elementary</SelectItem>
                        <SelectItem value="A1-A2">A1-A2 - Basic User</SelectItem>
                        <SelectItem value="B1">B1 - Intermediate</SelectItem>
                        <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="institutionName">Institution Name</Label>
                    <Input
                      id="institutionName"
                      value={certificateSettings.institutionName}
                      onChange={(e) => {
                        const newSettings = { ...certificateSettings, institutionName: e.target.value }
                        saveCertificateSettings(newSettings)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signatoryName">Signatory Name</Label>
                    <Input
                      id="signatoryName"
                      value={certificateSettings.signatoryName}
                      onChange={(e) => {
                        const newSettings = { ...certificateSettings, signatoryName: e.target.value }
                        saveCertificateSettings(newSettings)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signatoryTitle">Signatory Title</Label>
                    <Input
                      id="signatoryTitle"
                      value={certificateSettings.signatoryTitle}
                      onChange={(e) => {
                        const newSettings = { ...certificateSettings, signatoryTitle: e.target.value }
                        saveCertificateSettings(newSettings)
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="certDescription">Certificate Description</Label>
                  <Textarea
                    id="certDescription"
                    value={certificateSettings.description}
                    onChange={(e) => {
                      const newSettings = { ...certificateSettings, description: e.target.value }
                      saveCertificateSettings(newSettings)
                    }}
                    rows={3}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Use {"{studentName}"} and {"{cefrLevel}"} as placeholders
                  </p>
                </div>

                <Button onClick={() => saveCertificateSettings(certificateSettings)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Save Certificate Settings
                </Button>
              </CardContent>
            </Card>

            {/* Published Exam Info */}
            {getPublishedExam() && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Currently Published Exam
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{getPublishedExam()?.title}</h3>
                    <p className="text-gray-600">{getPublishedExam()?.description}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>⏱️ {getPublishedExam()?.timeLimit} minutes</span>
                      <span>🎯 {getPublishedExam()?.passingScore}% to pass</span>
                      <span>📝 {getPublishedExam()?.totalPoints} total points</span>
                      <span>📚 {getPublishedExam()?.sections.length} sections</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
