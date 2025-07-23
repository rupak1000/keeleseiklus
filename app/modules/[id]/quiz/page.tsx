"use client";
import { useState, useEffect, use } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Volume2, Trophy, Star, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";

interface QuizQuestion {
  id: number;
  type: "multiple-choice" | "fill-blank" | "translation" | "true-false" | "listening";
  question: string;
  question_ru?: string;
  answer: string;
  options?: string[];
  options_ru?: string[];
  hint?: string;
  hint_ru?: string;
  audioUrl?: string;
}

interface QuizData {
  moduleId: number;
  moduleTitle: string;
  moduleTitle_ru?: string;
  quiz: QuizQuestion[];
}

interface User {
  id: number;
  name: string;
  email: string;
  level: string;
}

function QuizPageContent({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise); // Unwrap params with React.use()
  const router = useRouter();
  const { language, t } = useLanguage();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const moduleId = Number.parseInt(params.id);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/modules/${moduleId}/quiz`, { cache: 'no-store' });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(t("quiz.quizNotFound"));
          }
          throw new Error(`Failed to fetch quiz data: ${response.statusText}`);
        }
        const data: QuizData = await response.json();
        setQuizData(data);
      } catch (err: any) {
        console.error("Error fetching quiz data:", err);
        setError(err.message || t("quiz.failedToLoadQuiz"));
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(moduleId)) {
      fetchQuizData();
    } else {
      setError(t("quiz.invalidModuleId"));
      setIsLoading(false);
    }
  }, [moduleId, t]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("quiz.loadingQuiz")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quizData || quizData.quiz.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{error || t("quiz.noQuizAvailable")}</h2>
            <p className="text-gray-600 mb-4">{t("quiz.checkModuleData")}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("quiz.goBack")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quiz = quizData.quiz;
  const currentQuestion = quiz[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.length) * 100;

  const getQuestionText = (q: QuizQuestion) => (language === "ru" && q.question_ru ? q.question_ru : q.question);
  const getOptionText = (option: string, q: QuizQuestion, optIndex: number) => {
    if (language === "ru" && q.options_ru && q.options_ru[optIndex]) {
      return q.options_ru[optIndex];
    }
    return option;
  };
  const getHintText = (q: QuizQuestion) => (language === "ru" && q.hint_ru ? q.hint_ru : q.hint);

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = async () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      let correctAnswers = 0;
      quiz.forEach((q) => {
        const userAnswer = answers[q.id];
        if (q.type === "multiple-choice" || q.type === "true-false" || q.type === "listening") {
          if (userAnswer === q.answer) correctAnswers++;
        } else if (q.type === "fill-blank" || q.type === "translation") {
          if (userAnswer?.toLowerCase().trim() === q.answer?.toLowerCase().trim()) correctAnswers++;
        }
      });
      setScore(correctAnswers);
      setShowResults(true);

      try {
        const markQuizResponse = await fetch(`/api/modules/${moduleId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId: "quiz" }),
          credentials: 'include',
        });

        if (!markQuizResponse.ok) {
          const errorData = await markQuizResponse.json();
          console.error("Failed to mark quiz as complete:", errorData.error);
        } else {
          console.log("Quiz section marked as complete successfully.");
          // Trigger moduleCompleted event
          const event = new CustomEvent('moduleCompleted', { detail: { moduleId } });
          window.dispatchEvent(event);
        }
      } catch (err) {
        console.error("Error calling API to mark quiz complete:", err);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const getModuleTitle = () => (language === "ru" && quizData?.moduleTitle_ru ? quizData.moduleTitle_ru : quizData?.moduleTitle);

  if (showResults) {
    const percentage = Math.round((score / quiz.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                {t("quiz.quizComplete")}
              </CardTitle>
              <CardDescription>{t("quiz.yourResultsFor", { moduleTitle: getModuleTitle() })}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6 p-8">
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {percentage}%
              </div>
              <div className="text-lg">
                {t("quiz.youGotScore", { score: score, total: quiz.length })}
              </div>

              {score === quiz.length ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800 font-medium text-lg">{t("quiz.perfectScoreMessage")}</p>
                  <div className="flex justify-center mt-4">
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  </div>
                </div>
              ) : percentage >= 70 ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <p className="text-blue-800 font-medium">{t("quiz.greatJobMessage")}</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <p className="text-yellow-800 font-medium">{t("quiz.reviewModuleMessage")}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {t("quiz.retakeQuiz")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/modules/${moduleId}`)}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  {t("quiz.backToModule")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getModuleTitle()} {t("quiz.quiz")}
            </h1>
            <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
              {t("quiz.questionOfTotal", { current: currentQuestionIndex + 1, total: quiz.length })}
            </span>
          </div>
          <Progress value={progress} className="bg-white" />
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t("quiz.question")} {currentQuestionIndex + 1}
              {currentQuestion.audioUrl && (
                <Button size="sm" variant="ghost" className="text-blue-600">
                  <Volume2 className="w-4 h-4" />
                  <audio src={currentQuestion.audioUrl} preload="auto" ref={(el) => el && el.load()}></audio>
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-base">{getQuestionText(currentQuestion)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(currentQuestion.type === "multiple-choice" || currentQuestion.type === "listening") &&
              currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswer(value)}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                        {getOptionText(option, currentQuestion, index)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

            {(currentQuestion.type === "fill-blank" || currentQuestion.type === "translation") && (
              <div className="space-y-2">
                <Input
                  placeholder={t("quiz.typeYourAnswerHere")}
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="border-gray-200 focus:border-blue-500"
                />
                {currentQuestion.hint && (
                  <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    💡 {t("quiz.hint")}: {getHintText(currentQuestion)}
                  </p>
                )}
              </div>
            )}

            {currentQuestion.type === "true-false" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswer(value)}
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="cursor-pointer">
                    {t("quiz.true")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="cursor-pointer">
                    {t("quiz.false")}
                  </Label>
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            {t("quiz.previous")}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {currentQuestionIndex === quiz.length - 1 ? t("quiz.finishQuiz") : t("quiz.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard requiredModule={use(params).id}>
      <QuizPageContent params={params} />
    </AuthGuard>
  );
}