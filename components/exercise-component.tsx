"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Volume2, Lightbulb } from "lucide-react"

interface Exercise {
  type: "multiple-choice" | "fill-blank" | "true-false" | "translation" | "conjugation"
  question: string
  question_ru?: string
  options?: string[]
  options_ru?: string[]
  answer: string | number
  correctAnswer?: number
  hint?: string
  hint_ru?: string
  explanation?: string
  explanation_ru?: string
  audioUrl?: string
  difficulty?: "easy" | "medium" | "hard"
}

interface ExerciseComponentProps {
  exercise: Exercise
  exerciseNumber?: number
  language?: string
  onComplete?: (correct: boolean) => void
}

export function ExerciseComponent({
  exercise,
  exerciseNumber = 1,
  language = "en",
  onComplete,
}: ExerciseComponentProps) {
  const [userAnswer, setUserAnswer] = useState<string>("")
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)

  const getLocalizedText = (text: string, textRu?: string) => {
    return language === "ru" && textRu ? textRu : text
  }

  const question = getLocalizedText(exercise.question, exercise.question_ru)
  const options = language === "ru" && exercise.options_ru ? exercise.options_ru : exercise.options
  const hint = getLocalizedText(exercise.hint || "", exercise.hint_ru)
  const explanation = getLocalizedText(exercise.explanation || "", exercise.explanation_ru)

  const checkAnswer = () => {
    let correct = false
    const correctAnswer = exercise.correctAnswer !== undefined ? exercise.correctAnswer : exercise.answer

    switch (exercise.type) {
      case "multiple-choice":
        const selectedIndex = Number.parseInt(selectedOption)
        correct = selectedIndex === correctAnswer
        break
      case "true-false":
        const boolAnswer = userAnswer.toLowerCase() === "true" || userAnswer.toLowerCase() === "yes"
        correct = boolAnswer === (correctAnswer === "true" || correctAnswer === true)
        break
      case "fill-blank":
      case "translation":
      case "conjugation":
        const normalizedUser = userAnswer.toLowerCase().trim()
        const normalizedCorrect = String(correctAnswer).toLowerCase().trim()
        correct = normalizedUser === normalizedCorrect
        break
      default:
        correct = userAnswer.toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()
    }

    setIsSubmitted(true)
    setIsCorrect(correct)
    setAttempts((prev) => prev + 1)

    if (onComplete) {
      onComplete(correct)
    }
  }

  const resetExercise = () => {
    setUserAnswer("")
    setSelectedOption("")
    setIsSubmitted(false)
    setIsCorrect(false)
    setShowHint(false)
  }

  const playAudio = () => {
    if (exercise.audioUrl) {
      const audio = new Audio(exercise.audioUrl)
      audio.play().catch(console.error)
    }
  }

  const getDifficultyColor = () => {
    switch (exercise.difficulty) {
      case "easy":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "hard":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Exercise {exerciseNumber}
            {exercise.difficulty && <span className={`text-sm ${getDifficultyColor()}`}>({exercise.difficulty})</span>}
          </span>
          <div className="flex items-center gap-2">
            {exercise.audioUrl && (
              <Button size="sm" variant="outline" onClick={playAudio}>
                <Volume2 className="w-4 h-4" />
              </Button>
            )}
            {hint && (
              <Button size="sm" variant="outline" onClick={() => setShowHint(!showHint)}>
                <Lightbulb className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium">{question}</div>

        {showHint && hint && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Hint:</span>
            </div>
            <p className="text-blue-700 mt-1">{hint}</p>
          </div>
        )}

        {/* Multiple Choice */}
        {exercise.type === "multiple-choice" && options && (
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption} disabled={isSubmitted}>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* True/False */}
        {exercise.type === "true-false" && (
          <RadioGroup value={userAnswer} onValueChange={setUserAnswer} disabled={isSubmitted}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="cursor-pointer">
                {language === "ru" ? "Правда" : "True"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="cursor-pointer">
                {language === "ru" ? "Ложь" : "False"}
              </Label>
            </div>
          </RadioGroup>
        )}

        {/* Fill in the blank, Translation, Conjugation */}
        {(exercise.type === "fill-blank" || exercise.type === "translation" || exercise.type === "conjugation") && (
          <Input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={language === "ru" ? "Введите ваш ответ..." : "Enter your answer..."}
            disabled={isSubmitted}
            className="text-lg"
          />
        )}

        {/* Submit/Reset buttons */}
        <div className="flex gap-2">
          {!isSubmitted ? (
            <Button
              onClick={checkAnswer}
              disabled={
                (exercise.type === "multiple-choice" && !selectedOption) ||
                (exercise.type !== "multiple-choice" && !userAnswer.trim())
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {language === "ru" ? "Проверить" : "Check Answer"}
            </Button>
          ) : (
            <Button onClick={resetExercise} variant="outline">
              {language === "ru" ? "Попробовать снова" : "Try Again"}
            </Button>
          )}
        </div>

        {/* Result feedback */}
        {isSubmitted && (
          <div
            className={`p-4 rounded-lg border ${
              isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                {isCorrect
                  ? language === "ru"
                    ? "Правильно!"
                    : "Correct!"
                  : language === "ru"
                    ? "Неправильно"
                    : "Incorrect"}
              </span>
            </div>

            {!isCorrect && (
              <p className="text-red-700">
                {language === "ru" ? "Правильный ответ: " : "Correct answer: "}
                <span className="font-medium">{exercise.answer}</span>
              </p>
            )}

            {explanation && <p className="text-gray-700 mt-2">{explanation}</p>}

            <p className="text-sm text-gray-600 mt-2">
              {language === "ru" ? "Попыток: " : "Attempts: "}
              {attempts}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Default export for compatibility
export default ExerciseComponent
