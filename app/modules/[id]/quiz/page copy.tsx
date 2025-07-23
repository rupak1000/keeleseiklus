"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Volume2, Trophy, Star } from "lucide-react"
import { modules } from "@/data/modules"

function QuizPageContent({ params }: { params: { id: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const moduleId = Number.parseInt(params.id)
  const module = modules.find((m) => m.id === moduleId)

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Not Found</h2>
            <p className="text-gray-600 mb-4">The requested quiz could not be found.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const quiz = module.quiz
  const question = quiz[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.length) * 100

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      // Calculate score and show results
      let correctAnswers = 0
      quiz.forEach((q) => {
        const userAnswer = answers[q.id]
        if (q.type === "multiple-choice") {
          if (userAnswer === q.answer) correctAnswers++
        } else if (q.type === "fill-blank" || q.type === "translation") {
          if (userAnswer?.toLowerCase().trim() === q.answer?.toLowerCase()) correctAnswers++
        } else if (q.type === "true-false") {
          if (userAnswer === q.answer) correctAnswers++
        }
      })
      setScore(correctAnswers)
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  if (showResults) {
    const percentage = Math.round((score / quiz.length) * 100)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Quiz Complete!
              </CardTitle>
              <CardDescription>Here are your results for {module.title}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6 p-8">
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {percentage}%
              </div>
              <div className="text-lg">
                You got <span className="font-bold text-green-600">{score}</span> out of{" "}
                <span className="font-bold">{quiz.length}</span> questions correct!
              </div>

              {score === quiz.length ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800 font-medium text-lg">Perfect score! You've mastered this module!</p>
                  <div className="flex justify-center mt-4">
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  </div>
                </div>
              ) : score >= quiz.length * 0.7 ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <p className="text-blue-800 font-medium">Great job! You're ready for the next module.</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <p className="text-yellow-800 font-medium">
                    Good effort! Consider reviewing the module before continuing.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Retake Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Back to Module
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {module.title} Quiz
            </h1>
            <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
              Question {currentQuestion + 1} of {quiz.length}
            </span>
          </div>
          <Progress value={progress} className="bg-white" />
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Question {currentQuestion + 1}
              {question.audioUrl && (
                <Button size="sm" variant="ghost" className="text-blue-600">
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-base">{question.question}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.type === "multiple-choice" && question.options && (
              <RadioGroup value={answers[question.id] || ""} onValueChange={(value) => handleAnswer(value)}>
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {(question.type === "fill-blank" || question.type === "translation") && (
              <div className="space-y-2">
                <Input
                  placeholder="Type your answer here..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="border-gray-200 focus:border-blue-500"
                />
                {question.hint && (
                  <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">💡 Hint: {question.hint}</p>
                )}
              </div>
            )}

            {question.type === "true-false" && (
              <RadioGroup value={answers[question.id] || ""} onValueChange={(value) => handleAnswer(value)}>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="cursor-pointer">
                    True
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="cursor-pointer">
                    False
                  </Label>
                </div>
              </RadioGroup>
            )}

            {question.type === "listening" && question.options && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg text-center border border-blue-200">
                  <Button className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Play Audio
                  </Button>
                  <p className="text-sm text-gray-600">Listen carefully and select the correct answer</p>
                </div>
                <RadioGroup value={answers[question.id] || ""} onValueChange={(value) => handleAnswer(value)}>
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[question.id]}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {currentQuestion === quiz.length - 1 ? "Finish Quiz" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const moduleId = Number.parseInt(params.id)

  return (
    <AuthGuard requiredModule={moduleId}>
      <QuizPageContent params={params} />
    </AuthGuard>
  )
}
