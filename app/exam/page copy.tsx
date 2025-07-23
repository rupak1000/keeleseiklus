"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trophy, Award, Download, Star, CheckCircle, Clock, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

function ExamPageContent() {
  const [currentSection, setCurrentSection] = useState("instructions")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [timeLeft, setTimeLeft] = useState(7200) // 2 hours = 7200 seconds
  const [examStarted, setExamStarted] = useState(false)
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const [sectionScores, setSectionScores] = useState<Record<string, { score: number; total: number }>>({})
  const [examTemplate, setExamTemplate] = useState<any>(null)
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState<any[]>([])

  const { t } = useLanguage()

  // Load exam template and check eligibility
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem("completedModules") || "[]")
    setCompletedModules(completed)

    // Load active exam template
    const activeTemplate = localStorage.getItem("activeExamTemplate")
    if (activeTemplate) {
      const template = JSON.parse(activeTemplate)
      setExamTemplate(template)
      setTimeLeft(template.timeLimit * 60) // Convert minutes to seconds
    } else {
      // Use default exam if no template is set
      const defaultExam = createDefaultExam()
      setExamTemplate(defaultExam)
    }
  }, [])

  const createDefaultExam = () => {
    return {
      id: "default-exam",
      title: "Estonian Language Proficiency Exam",
      description: "Comprehensive assessment of Estonian language skills",
      timeLimit: 120,
      passingScore: 70,
      sections: [
        {
          id: "vocabulary",
          title: "Vocabulary (20 points)",
          questions: [
            {
              id: "vocab-1",
              type: "multiple-choice",
              question: "What does 'Tere' mean in English?",
              options: ["Hello", "Goodbye", "Thank you", "Please"],
              correctAnswer: 0,
              points: 2,
            },
            {
              id: "vocab-2",
              type: "multiple-choice",
              question: "How do you say 'Thank you' in Estonian?",
              options: ["Palun", "Aitäh", "Vabandust", "Tere"],
              correctAnswer: 1,
              points: 2,
            },
            {
              id: "vocab-3",
              type: "fill-blank",
              question: "Complete: 'Ma _____ eesti keelt' (I _____ Estonian)",
              correctAnswer: "õpin",
              points: 3,
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
          questions: [
            {
              id: "grammar-1",
              type: "multiple-choice",
              question: "Which is the correct plural form of 'laps' (child)?",
              options: ["lapsi", "lapsed", "lapse", "lapsid"],
              correctAnswer: 1,
              points: 3,
            },
            {
              id: "grammar-2",
              type: "true-false",
              question: "Estonian has 14 grammatical cases.",
              correctAnswer: true,
              points: 2,
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
          questions: [
            {
              id: "reading-1",
              type: "multiple-choice",
              question: "Based on 'Tallinn on Eesti pealinn', what is Tallinn?",
              options: ["A city", "The capital", "A country", "A region"],
              correctAnswer: 1,
              points: 3,
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
          questions: [
            {
              id: "cultural-1",
              type: "multiple-choice",
              question: "What is the traditional Estonian folk song festival called?",
              options: ["Laulupidu", "Tantsupidu", "Muusikafestival", "Kultuuripäev"],
              correctAnswer: 0,
              points: 3,
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
          questions: [
            {
              id: "writing-1",
              type: "essay",
              question:
                "Write a short paragraph (50-100 words) about yourself in Estonian. Include your name, age, and what you like to do.",
              correctAnswer: "",
              points: 8,
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
    }
  }

  // Timer effect
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

  // Update current section questions when section changes
  useEffect(() => {
    if (examTemplate && currentSection !== "instructions" && currentSection !== "results") {
      const section = examTemplate.sections.find((s: any) => s.id === currentSection)
      if (section) {
        setCurrentSectionQuestions(section.questions)
        setCurrentQuestionIndex(0)
      }
    }
  }, [currentSection, examTemplate])

  const checkExamEligibility = () => {
    const requireAllModules = JSON.parse(localStorage.getItem("examRequireAllModules") || "true")
    const minModulesRequired = Number.parseInt(localStorage.getItem("examMinModulesRequired") || "10")

    if (requireAllModules) {
      return completedModules.length >= 40
    } else {
      return completedModules.length >= minModulesRequired
    }
  }

  const canTakeExam = checkExamEligibility()
  const requireAllModules = JSON.parse(localStorage.getItem("examRequireAllModules") || "true")
  const minModulesRequired = Number.parseInt(localStorage.getItem("examMinModulesRequired") || "10")

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const checkAnswer = (userAnswer: any, correctAnswer: any, questionType: string) => {
    if (questionType === "true-false") {
      return userAnswer === correctAnswer
    }
    if (questionType === "multiple-choice") {
      return userAnswer === correctAnswer
    }
    if (questionType === "fill-blank" || questionType === "short-answer") {
      if (typeof userAnswer === "string" && typeof correctAnswer === "string") {
        return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
      }
    }
    if (questionType === "essay") {
      // For essays, we'll give full points if there's content (manual grading would be needed)
      return userAnswer && userAnswer.trim().length > 10
    }
    return userAnswer === correctAnswer
  }

  const calculateSectionScore = (sectionId: string) => {
    const section = examTemplate.sections.find((s: any) => s.id === sectionId)
    if (!section) return { score: 0, total: 0 }

    let score = 0
    let total = 0

    section.questions.forEach((question: any) => {
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
    const sectionScore = calculateSectionScore(currentSection)
    setSectionScores((prev) => ({ ...prev, [currentSection]: sectionScore }))

    if (!completedSections.includes(currentSection)) {
      setCompletedSections((prev) => [...prev, currentSection])
    }

    // Move to next section or finish exam
    const currentSectionIndex = examTemplate.sections.findIndex((s: any) => s.id === currentSection)
    if (currentSectionIndex < examTemplate.sections.length - 1) {
      const nextSection = examTemplate.sections[currentSectionIndex + 1]
      setCurrentSection(nextSection.id)
    } else {
      handleFinishExam()
    }
  }

  const handleFinishExam = () => {
    // Calculate final scores for all sections
    const finalSectionScores: Record<string, { score: number; total: number }> = {}
    let totalScore = 0
    let maxScore = 0

    examTemplate.sections.forEach((section: any) => {
      const sectionScore = calculateSectionScore(section.id)
      finalSectionScores[section.id] = sectionScore
      totalScore += sectionScore.score
      maxScore += sectionScore.total
    })

    setSectionScores(finalSectionScores)
    setScore(totalScore)
    setTotalPoints(maxScore)

    const percentage = Math.round((totalScore / maxScore) * 100)
    const passed = percentage >= examTemplate.passingScore

    // Save exam results
    const examResult = {
      id: `result_${Date.now()}`,
      examId: examTemplate.id,
      studentName: JSON.parse(localStorage.getItem("user") || '{"name": "Student"}').name,
      studentEmail: JSON.parse(localStorage.getItem("user") || '{"email": "student@example.com"}').email,
      score: totalScore,
      totalPoints: maxScore,
      percentage: percentage,
      passed: passed,
      completedAt: new Date().toISOString(),
      timeSpent: examTemplate.timeLimit * 60 - timeLeft,
      answers: answers,
      sectionScores: finalSectionScores,
    }

    // Save to localStorage
    const existingResults = JSON.parse(localStorage.getItem("examResults") || "[]")
    const updatedResults = [...existingResults, examResult]
    localStorage.setItem("examResults", JSON.stringify(updatedResults))
    localStorage.setItem("lastExamResult", JSON.stringify(examResult))

    // Generate certificate if passed
    if (passed) {
      generateStudentCertificate(examResult)
    }

    setShowResults(true)
  }

  const generateStudentCertificate = (examResult: any) => {
    const user = JSON.parse(localStorage.getItem("user") || '{"name": "Estonian Learner"}')
    const certificateData = {
      id: `cert_${Date.now()}`,
      studentName: user.name,
      studentEmail: user.email || "student@example.com",
      score: examResult.percentage,
      completedModules: completedModules.length,
      completedAt: examResult.completedAt,
      generatedAt: new Date().toISOString(),
    }

    // Save to generated certificates
    const existingCerts = JSON.parse(localStorage.getItem("generatedCertificates") || "[]")
    const updatedCerts = [...existingCerts, certificateData]
    localStorage.setItem("generatedCertificates", JSON.stringify(updatedCerts))

    // Save student's certificate
    localStorage.setItem("studentCertificate", JSON.stringify(certificateData))

    return certificateData
  }

  const downloadCertificate = () => {
    const user = JSON.parse(localStorage.getItem("user") || '{"name": "Estonian Learner"}')
    const examResult = JSON.parse(localStorage.getItem("lastExamResult") || "{}")

    const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Certificate of Achievement</title>
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
        .date { 
          color: #6b7280; 
          font-size: 16px;
        }
        @media print {
          body { background: white; padding: 0; }
          .certificate { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div class="title">Certificate of Achievement</div>
          <div class="subtitle">Estonian Language Proficiency</div>
        </div>
        
        <div class="content">
          <div style="font-size: 20px; margin-bottom: 20px;">This is to certify that</div>
          <div class="student-name">${user.name}</div>
          
          <div class="achievement">
            has successfully completed the Estonian Language Proficiency Exam
            and demonstrated competency in Estonian language skills.
          </div>
          
          <div class="details">
            <div class="detail-item">
              <span class="detail-value">${examResult.percentage}%</span>
              <div class="detail-label">Final Score</div>
            </div>
            <div class="detail-item">
              <span class="detail-value">${completedModules.length}</span>
              <div class="detail-label">Modules Completed</div>
            </div>
            <div class="detail-item">
              <span class="detail-value">A1-A2</span>
              <div class="detail-label">CEFR Level</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
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

    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(certificateHTML)
      newWindow.document.close()
    }
  }

  if (!examTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-700 mb-4">No Exam Available</h1>
            <p className="text-gray-600 mb-6">
              No exam template has been published yet. Please contact your instructor.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!canTakeExam) {
    const requiredModules = requireAllModules ? 40 : minModulesRequired

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Exam Locked</h1>
            <p className="text-gray-600 mb-6">You need to complete {requiredModules} modules before taking the exam.</p>
            <div className="text-sm text-gray-500 mb-6">
              Modules Completed: {completedModules.length} / {requiredModules}
            </div>
            <Progress value={(completedModules.length / requiredModules) * 100} className="mb-6" />
            <Button onClick={() => (window.location.href = "/modules")}>Continue Learning</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const passed = score >= (totalPoints * examTemplate.passingScore) / 100
    const percentage = Math.round((score / totalPoints) * 100)

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
              <CardTitle className="text-3xl">Exam Complete!</CardTitle>
              <CardDescription className="text-lg">Here are your results</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-6xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-lg text-gray-600">
                Points Earned: {score}/{totalPoints}
              </div>

              {/* Section Breakdown */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Section Breakdown:</h3>
                {Object.entries(sectionScores).map(([sectionId, sectionScore]) => {
                  const section = examTemplate.sections.find((s: any) => s.id === sectionId)
                  const sectionPercentage = Math.round((sectionScore.score / sectionScore.total) * 100)

                  return (
                    <div key={sectionId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{section?.title || sectionId}</span>
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
                  <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
                  <p className="text-green-700">You have passed the Estonian Language Proficiency Exam!</p>
                </div>
              ) : (
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-xl font-bold text-red-800 mb-2">Keep Learning!</h3>
                  <p className="text-red-700">
                    You need {examTemplate.passingScore}% to pass. Review the material and try again!
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {passed && (
                  <Button onClick={downloadCertificate} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false)
                    setExamStarted(false)
                    setCurrentSection("instructions")
                    setAnswers({})
                    setTimeLeft(examTemplate.timeLimit * 60)
                    setCompletedSections([])
                    setSectionScores({})
                  }}
                >
                  Retake Exam
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/progress")}>
                  View Progress
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
      (total: number, section: any) => total + section.questions.length,
      0,
    )
    const totalPoints = examTemplate.sections.reduce(
      (total: number, section: any) =>
        total + section.questions.reduce((sectionTotal: number, question: any) => sectionTotal + question.points, 0),
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
                Exam Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{examTemplate.timeLimit}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{examTemplate.passingScore}%</div>
                  <div className="text-sm text-gray-600">To Pass</div>
                </div>
                <div className="text-center p-4 bg-violet-50 rounded-lg">
                  <div className="text-2xl font-bold text-violet-600">{examTemplate.sections.length}</div>
                  <div className="text-sm text-gray-600">Sections</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Exam Sections:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examTemplate.sections.map((section: any) => (
                    <div key={section.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{section.title}</h4>
                      <p className="text-sm text-gray-600">{section.questions.length} questions</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Instructions:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• You have {examTemplate.timeLimit} minutes to complete the entire exam</li>
                  <li>• You can navigate between questions within a section</li>
                  <li>• Make sure to complete each section before moving to the next</li>
                  <li>• Your progress is automatically saved</li>
                  <li>• You need {examTemplate.passingScore}% to pass the exam</li>
                </ul>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => {
                    setExamStarted(true)
                    setCurrentSection(examTemplate.sections[0].id)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Start Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render exam questions
  const currentSectionData = examTemplate.sections.find((s: any) => s.id === currentSection)
  const currentQuestion = currentSectionQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / currentSectionQuestions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Timer */}
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {examTemplate.sections.map((section: any) => (
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

        {/* Current Question */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{currentSectionData?.title}</CardTitle>
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {currentSectionQuestions.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                  <Badge>{currentQuestion.points} points</Badge>
                </div>

                {/* Multiple Choice */}
                {currentQuestion.type === "multiple-choice" && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ""}
                    onValueChange={(value) => handleAnswer(currentQuestion.id, Number.parseInt(value))}
                  >
                    {currentQuestion.options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* True/False */}
                {currentQuestion.type === "true-false" && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ""}
                    onValueChange={(value) => handleAnswer(currentQuestion.id, value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true">True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false">False</Label>
                    </div>
                  </RadioGroup>
                )}

                {/* Fill in the Blank */}
                {currentQuestion.type === "fill-blank" && (
                  <Input
                    placeholder="Your answer"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  />
                )}

                {/* Short Answer */}
                {currentQuestion.type === "short-answer" && (
                  <Textarea
                    placeholder="Your answer"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    rows={3}
                  />
                )}

                {/* Essay */}
                {currentQuestion.type === "essay" && (
                  <Textarea
                    placeholder="Write your essay here..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    rows={8}
                  />
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestionIndex === currentSectionQuestions.length - 1 ? (
                <Button onClick={handleSectionComplete}>
                  Complete Section
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex(Math.min(currentSectionQuestions.length - 1, currentQuestionIndex + 1))
                  }
                >
                  Next
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

export default function ExamPage() {
  return (
    <AuthGuard>
      <ExamPageContent />
    </AuthGuard>
  )
}
