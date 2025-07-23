"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  Award,
  Download,
  Star,
  CheckCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Volume2,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"

interface User {
  id: number
  name: string
  email: string
  completedModulesList: number[]
}

interface ExamTemplate {
  id: number
  title: string
  description: string
  timeLimit: number
  passingScore: number
  totalPoints: number
  sections: {
    id: string
    title: string
    description?: string
    max_points: number
    questions: {
      id: number
      type: string
      question: string
      options?: string[]
      correctAnswer: any
      points: number
      hint?: string
      explanation?: string
      difficulty: string
      audioUrl?: string
    }[]
  }[]
}

export default function ExamPage() {
  const [currentSection, setCurrentSection] = useState("instructions")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [timeLeft, setTimeLeft] = useState(7200)
  const [examStarted, setExamStarted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [examTemplate, setExamTemplate] = useState<ExamTemplate | null>(null)
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [sectionScores, setSectionScores] = useState<Record<string, { score: number; total: number }>>({})
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [examAttemptId, setExamAttemptId] = useState<number | null>(null)
  const [audioPlaying, setAudioPlaying] = useState<Record<string, boolean>>({})
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({})
  const { t } = useLanguage()

  const loadExamData = async (retries = 3, delay = 1000) => {
    setLoading(true)
    setError(null)
    try {
      const userRes = await fetch("/api/user", {
        cache: "no-store",
        credentials: "include",
      })
      if (!userRes.ok) {
        const errorData = await userRes.json()
        throw new Error(errorData.details || t("progress.userFetchError"))
      }
      const userData: User = await userRes.json()
      setUser(userData)

      let attempt = 0
      while (attempt < retries) {
        try {
          const examRes = await fetch("/api/exam/template", {
            cache: "no-store",
            credentials: "include",
          })
          if (!examRes.ok) {
            const errorData = await examRes.json()
            throw new Error(errorData.details || t("exam.noExamAvailable"))
          }
          const examData: ExamTemplate = await examRes.json()
          console.log("Exam data fetched:", examData)

          // Ensure options are arrays for all questions
          const processedExamData = {
            ...examData,
            sections: examData.sections.map((section) => ({
              ...section,
              questions: section.questions.map((question) => {
                let processedOptions = []
                let processedCorrectAnswer = question.correctAnswer

                // Handle different formats of options
                if (question.options) {
                  if (Array.isArray(question.options)) {
                    processedOptions = question.options
                  } else if (typeof question.options === "string") {
                    try {
                      processedOptions = JSON.parse(question.options)
                    } catch (e) {
                      console.warn("Failed to parse options as JSON:", question.options)
                      processedOptions = []
                    }
                  } else {
                    processedOptions = []
                  }
                }

                // Handle correct_answer parsing
                if (question.correct_answer !== undefined) {
                  processedCorrectAnswer = question.correct_answer
                  if (typeof question.correct_answer === "string") {
                    try {
                      processedCorrectAnswer = JSON.parse(question.correct_answer)
                    } catch (e) {
                      console.warn("Failed to parse correct_answer:", question.correct_answer)
                      processedCorrectAnswer = question.correct_answer
                    }
                  }
                }

                return {
                  ...question,
                  options: processedOptions,
                  correctAnswer: processedCorrectAnswer, // Map to correctAnswer for consistency
                }
              }),
            })),
          }

          setExamTemplate(processedExamData)
          setTimeLeft(processedExamData.timeLimit * 60)
          return
        } catch (err: any) {
          attempt++
          if (attempt === retries) {
            throw err
          }
          console.log(`Retrying fetch (attempt ${attempt + 1}/${retries})...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    } catch (err: any) {
      console.error("Error loading exam data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Reset all exam state completely
  const resetExamState = () => {
    setCurrentSection("instructions")
    setCurrentQuestionIndex(0)
    setAnswers({})
    setShowResults(false)
    setScore(0)
    setTotalPoints(0)
    setExamStarted(false)
    setCompletedSections([])
    setSectionScores({})
    setCurrentSectionQuestions([])
    setExamAttemptId(null)
    setResultsLoading(false)
    setAudioPlaying({})
    // Stop all audio elements
    Object.values(audioElements).forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })
    setAudioElements({})
    if (examTemplate) {
      setTimeLeft(examTemplate.timeLimit * 60)
    }
  }

  useEffect(() => {
    loadExamData()
    const handleModuleComplete = (event: Event) => {
      console.log("Module completion event received:", (event as CustomEvent).detail)
      loadExamData()
    }

    window.addEventListener("moduleCompleted", handleModuleComplete)
    return () => window.removeEventListener("moduleCompleted", handleModuleComplete)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (examStarted && timeLeft > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinishExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [examStarted, timeLeft, showResults])

  useEffect(() => {
    if (examTemplate && currentSection !== "instructions" && currentSection !== "results") {
      const section = examTemplate.sections.find((s) => s.id === currentSection)
      if (section) {
        setCurrentSectionQuestions(section.questions)
        setCurrentQuestionIndex(0)
      }
    }
  }, [currentSection, examTemplate])

  const checkExamEligibility = () => {
    const requireAllModules = false
    const minModulesRequired = 1
    const completedModules = user?.completedModulesList || []
    return requireAllModules ? completedModules.length >= 1 : completedModules.length >= minModulesRequired
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
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

  const checkAnswer = (userAnswer: any, correctAnswer: any, questionType: string) => {
    // Handle null/undefined answers
    if (userAnswer === null || userAnswer === undefined || userAnswer === "") {
      console.log("Answer is null/undefined/empty:", { userAnswer, correctAnswer, questionType })
      return false
    }

    console.log("Checking answer:", {
      userAnswer,
      correctAnswer,
      questionType,
      userAnswerType: typeof userAnswer,
      correctAnswerType: typeof correctAnswer,
    })

    if (questionType === "true-false") {
      const result = Boolean(userAnswer) === Boolean(correctAnswer)
      console.log("True/False comparison:", { userAnswer, correctAnswer, result })
      return result
    }

    if (questionType === "multiple-choice") {
      // Parse correctAnswer if it's a string
      let parsedCorrectAnswer = correctAnswer
      if (typeof correctAnswer === "string") {
        try {
          parsedCorrectAnswer = JSON.parse(correctAnswer)
        } catch (e) {
          console.warn("Failed to parse correctAnswer:", correctAnswer)
          parsedCorrectAnswer = correctAnswer
        }
      }

      // Ensure both are numbers for comparison
      const userNum = Number(userAnswer)
      const correctNum = Number(parsedCorrectAnswer)

      console.log("Multiple choice comparison:", {
        userAnswer,
        correctAnswer,
        parsedCorrectAnswer,
        userNum,
        correctNum,
        match: userNum === correctNum,
      })

      return userNum === correctNum
    }

    if (questionType === "fill-blank" || questionType === "short-answer" || questionType === "audio") {
      let parsedCorrectAnswer = correctAnswer
      if (typeof correctAnswer === "string") {
        try {
          parsedCorrectAnswer = JSON.parse(correctAnswer)
        } catch (e) {
          parsedCorrectAnswer = correctAnswer
        }
      }

      const userStr = String(userAnswer).toLowerCase().trim()
      const correctStr = String(parsedCorrectAnswer).toLowerCase().trim()
      const result = userStr === correctStr

      console.log("Text comparison:", {
        userAnswer,
        correctAnswer,
        parsedCorrectAnswer,
        userStr,
        correctStr,
        result,
      })

      return result
    }

    if (questionType === "essay") {
      const result = userAnswer && String(userAnswer).trim().length > 10
      console.log("Essay check:", { userAnswer, result })
      return result
    }

    const result = userAnswer === correctAnswer
    console.log("Default comparison:", { userAnswer, correctAnswer, result })
    return result
  }

  const calculateSectionScore = (sectionId: string) => {
    const section = examTemplate?.sections?.find((s) => s.id === sectionId)
    if (!section) return { score: 0, total: 0 }

    let score = 0
    let total = 0

    section.questions.forEach((question) => {
      const userAnswer = answers[question.id]
      const isCorrect = checkAnswer(userAnswer, question.correctAnswer, question.type)
      if (isCorrect) {
        score += question.points
      }
      total += question.points
    })

    return { score, total }
  }

  const handleSectionComplete = () => {
    if (!examTemplate) {
      console.error("handleSectionComplete: examTemplate is null")
      setError(t("exam.noExamAvailable"))
      return
    }

    const sectionScore = calculateSectionScore(currentSection)
    setSectionScores((prev) => ({ ...prev, [currentSection]: sectionScore }))

    if (!completedSections.includes(currentSection)) {
      setCompletedSections((prev) => [...prev, currentSection])
    }

    const currentSectionIndex = examTemplate.sections.findIndex((s) => s.id === currentSection)
    if (currentSectionIndex < examTemplate.sections.length - 1) {
      const nextSection = examTemplate.sections[currentSectionIndex + 1]
      setCurrentSection(nextSection.id)
    } else {
      handleFinishExam()
    }
  }

  const handleFinishExam = async () => {
    if (!examTemplate) {
      console.error("handleFinishExam: examTemplate is null")
      setError(t("exam.noExamAvailable"))
      return
    }

    setResultsLoading(true)
    console.log("Finishing exam, examTemplate:", examTemplate)

    const finalSectionScores: Record<string, { score: number; total: number }> = {}
    let totalScore = 0
    let maxScore = 0

    examTemplate.sections.forEach((section) => {
      const sectionScore = calculateSectionScore(section.id)
      finalSectionScores[section.id] = sectionScore
      totalScore += sectionScore.score
      maxScore += sectionScore.total
    })

    setSectionScores(finalSectionScores)
    setScore(totalScore)
    setTotalPoints(maxScore)

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
    const passed = percentage >= examTemplate.passingScore

    const examResult = {
      examId: examTemplate.id,
      score: totalScore,
      totalPoints: maxScore,
      percentage,
      passed,
      timeSpent: examTemplate.timeLimit * 60 - timeLeft,
      answers,
      sectionScores: finalSectionScores,
    }

    try {
      const response = await fetch("/api/exam/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(examResult),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || t("exam.saveAttemptError"))
      }

      const result = await response.json()
      setExamAttemptId(result.id)
    } catch (err: any) {
      console.error("Error saving exam attempt:", err)
      setError(err.message)
    } finally {
      setResultsLoading(false)
      if (examTemplate) {
        setShowResults(true)
      } else {
        console.error("Cannot set showResults: examTemplate is still null")
        setError(t("exam.noExamAvailable"))
      }
    }
  }

  const downloadCertificatePDF = async () => {
    if (!user || !examTemplate || !examAttemptId) {
      console.error("downloadCertificatePDF: missing required data", { user, examTemplate, examAttemptId })
      setError("Missing required data for certificate generation")
      return
    }

    try {
      // Generate certificate number
      const certificateNumber = `EST-${Date.now()}-${user.id}`
      const finalScore = Math.round((score / totalPoints) * 100)

      // Create the certificate HTML for PDF conversion with KeeleSeiklus name - SINGLE PAGE
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
      <div class="student-name">${user.name || "Student"}</div>
      
      <div class="achievement">
        has successfully completed the Estonian Language Proficiency Exam and demonstrated competency in Estonian language skills at the A1-A2 level of the Common European Framework of Reference for Languages (CEFR). This achievement represents dedication to learning and mastery of essential Estonian language communication skills.
      </div>
      
      <div class="details">
        <div class="detail-item">
          <span class="detail-value">${finalScore}%</span>
          <div class="detail-label">Final Score</div>
        </div>
        <div class="detail-item">
          <span class="detail-value">${user.completedModulesList.length}</span>
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
        Issued on ${new Date().toLocaleDateString("en-US", {
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
            studentId: user.id,
            examId: examTemplate.id,
            studentName: user.name,
            studentEmail: user.email,
            score: finalScore,
            completedModules: user.completedModulesList.length,
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
      setError(err.message)
      toast.error(`Failed to download certificate: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("progress.loadingProgress")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">{t("progress.error")}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => loadExamData()} className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t("progress.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!examTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-700 mb-4">{t("exam.noExamAvailable")}</h1>
            <p className="text-gray-600 mb-6">{t("exam.contactInstructor")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canTakeExam = checkExamEligibility()
  const requiredModules = checkExamEligibility() ? 1 : 1

  if (!canTakeExam || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-700 mb-4">{t("exam.examLocked")}</h1>
            <p className="text-gray-600 mb-6">{t("exam.modulesRequired", { count: requiredModules })}</p>
            <div className="text-sm text-gray-500 mb-6">
              {t("exam.modulesCompleted", {
                completed: user?.completedModulesList.length || 0,
                required: requiredModules,
              })}
            </div>
            <Progress value={((user?.completedModulesList.length || 0) / requiredModules) * 100} className="mb-6" />
            <Button onClick={() => (window.location.href = "/modules")}>{t("exam.continueLearning")}</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    if (!examTemplate) {
      console.error("showResults is true but examTemplate is null")
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h1 className="text-2xl font-bold text-gray-700 mb-4">{t("exam.noExamAvailable")}</h1>
                <p className="text-gray-600 mb-6">{t("exam.contactInstructor")}</p>
                <Button onClick={() => loadExamData()} className="w-full flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {t("progress.retry")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (resultsLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("exam.loadingResults")}</p>
          </div>
        </div>
      )
    }

    console.log("Rendering results, examTemplate:", examTemplate)
    const passed = totalPoints > 0 ? (score / totalPoints) * 100 >= examTemplate.passingScore : false
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div
                className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  passed ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {passed ? <Trophy className="w-10 h-10 text-green-600" /> : <Star className="w-10 h-10 text-red-600" />}
              </div>
              <CardTitle className="text-3xl">{t("exam.examComplete")}</CardTitle>
              <CardDescription className="text-lg">{t("exam.results")}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-6xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-lg text-gray-600">{t("exam.pointsEarned", { score, total: totalPoints })}</div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{t("exam.sectionBreakdown")}</h3>
                {examTemplate.sections.map((section) => {
                  const sectionScore = sectionScores[section.id] || { score: 0, total: 0 }
                  const sectionPercentage =
                    sectionScore.total > 0 ? Math.round((sectionScore.score / sectionScore.total) * 100) : 0
                  return (
                    <div key={section.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{section.title}</span>
                      <div className="flex items-center gap-2">
                        <span>
                          {sectionScore.score}/{sectionScore.total}
                        </span>
                        <Badge variant={sectionPercentage >= 70 ? "default" : "destructive"}>
                          {sectionPercentage}%
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>

              {passed ? (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-bold text-green-800 mb-2">{t("exam.congratulations")}</h3>
                  <p className="text-green-700">{t("exam.passed")}</p>
                </div>
              ) : (
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-xl font-bold text-red-800 mb-2">{t("exam.keepLearning")}</h3>
                  <p className="text-red-700">{t("exam.needToPass", { passingScore: examTemplate.passingScore })}</p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {passed && (
                  <Button onClick={downloadCertificatePDF} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Certificate
                  </Button>
                )}
                <Button variant="outline" onClick={resetExamState}>
                  {t("exam.retakeExam")}
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/progress")}>
                  {t("exam.viewProgress")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentSection === "instructions") {
    const totalQuestions = examTemplate.sections.reduce(
      (total: number, section: any) => total + (section.questions?.length ?? 0),
      0,
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {examTemplate.title}
            </h1>
            <p className="text-xl text-gray-600">{examTemplate.description}</p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6" />
                {t("exam.instructions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{examTemplate.totalPoints}</div>
                  <div className="text-sm text-gray-600">{t("exam.totalPoints")}</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{examTemplate.timeLimit}</div>
                  <div className="text-sm text-gray-600">{t("exam.minutes")}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{examTemplate.passingScore}%</div>
                  <div className="text-sm text-gray-600">{t("exam.toPass")}</div>
                </div>
                <div className="text-center p-4 bg-violet-50 rounded-lg">
                  <div className="text-2xl font-bold text-violet-600">{examTemplate.sections.length}</div>
                  <div className="text-sm text-gray-600">{t("exam.sections")}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("exam.examSections")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examTemplate.sections.map((section) => (
                    <div key={section.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{section.title}</h4>
                      <p className="text-sm text-gray-600">
                        {t("exam.questionsCount", { count: section.questions.length })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">{t("exam.importantInstructions")}</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>{t("exam.timeLimit", { minutes: examTemplate.timeLimit })}</li>
                  <li>{t("exam.navigateQuestions")}</li>
                  <li>{t("exam.completeSection")}</li>
                  <li>{t("exam.progressSaved")}</li>
                  <li>{t("exam.passingScore", { score: examTemplate.passingScore })}</li>
                </ul>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => {
                    if (!examTemplate.sections.length) {
                      setError(t("exam.noSectionsAvailable"))
                      return
                    }
                    // Reset state before starting
                    resetExamState()
                    setExamStarted(true)
                    setCurrentSection(examTemplate.sections[0].id)
                    setTimeLeft(examTemplate.timeLimit * 60)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {t("exam.startExam")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentSectionData = examTemplate.sections.find((s) => s.id === currentSection)
  const currentQuestion = currentSectionQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / (currentSectionQuestions.length || 1)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {examTemplate.sections.map((section) => (
              <Button
                key={section.id}
                variant={currentSection === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentSection(section.id)}
                className={completedSections.includes(section.id) ? "border-green-500" : ""}
              >
                {completedSections.includes(section.id) && <CheckCircle className="w-4 h-4 mr-2 text-green-600" />}
                {section.title}
              </Button>
            ))}
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{currentSectionData?.title || t("exam.sectionNotFound")}</CardTitle>
              <Badge>
                {t("exam.questionOf", { current: currentQuestionIndex + 1, total: currentSectionQuestions.length })}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                  <Badge>{t("exam.points", { points: currentQuestion.points })}</Badge>
                </div>

                {/* Audio Question Type */}
                {currentQuestion.type === "audio" && currentQuestion.audioUrl && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <Button
                        onClick={() => playAudio(currentQuestion.id.toString(), currentQuestion.audioUrl!)}
                        className="flex items-center gap-2"
                        variant={audioPlaying[currentQuestion.id] ? "destructive" : "default"}
                      >
                        {audioPlaying[currentQuestion.id] ? (
                          <>
                            <Pause className="w-5 h-5" />
                            Stop Audio
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            Play Audio
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Volume2 className="w-4 h-4" />
                      <span>Listen to the audio and provide your answer below</span>
                    </div>
                    <Textarea
                      placeholder="Type what you heard..."
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {currentQuestion.type === "multiple-choice" && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ""}
                    onValueChange={(value) => handleAnswer(currentQuestion.id, Number.parseInt(value))}
                  >
                    {Array.isArray(currentQuestion.options) &&
                      currentQuestion.options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`}>{option}</Label>
                        </div>
                      ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === "true-false" && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ""}
                    onValueChange={(value) => handleAnswer(currentQuestion.id, value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true">{t("exam.true")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false">{t("exam.false")}</Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.type === "fill-blank" && (
                  <Input
                    placeholder={t("exam.yourAnswer")}
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  />
                )}

                {currentQuestion.type === "short-answer" && (
                  <Textarea
                    placeholder={t("exam.yourAnswer")}
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    rows={3}
                  />
                )}

                {currentQuestion.type === "essay" && (
                  <Textarea
                    placeholder={t("exam.writeEssay")}
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    rows={8}
                  />
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600">{t("exam.noQuestionAvailable")}</div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("exam.previous")}
              </Button>

              {currentQuestionIndex === currentSectionQuestions.length - 1 ? (
                <Button onClick={handleSectionComplete} disabled={!currentSectionQuestions.length}>
                  {t("exam.completeSection")}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex(Math.min(currentSectionQuestions.length - 1, currentQuestionIndex + 1))
                  }
                  disabled={!currentSectionQuestions.length}
                >
                  {t("exam.next")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
