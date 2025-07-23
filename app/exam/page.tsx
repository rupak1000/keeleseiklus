"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Download, Star, CheckCircle, Clock, ArrowLeft, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface User {
  id: number;
  name: string;
  email: string;
  completedModulesList: number[];
}

interface ExamTemplate {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  totalPoints: number;
  sections: {
    id: string;
    title: string;
    description?: string;
    max_points: number;
    questions: {
      id: number;
      type: string;
      question: string;
      options?: string[];
      correctAnswer: any;
      points: number;
      hint?: string;
      explanation?: string;
      difficulty: string;
    }[];
  }[];
}

export default function ExamPage() {
  const [currentSection, setCurrentSection] = useState("instructions");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7200);
  const [examStarted, setExamStarted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [examTemplate, setExamTemplate] = useState<ExamTemplate | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [sectionScores, setSectionScores] = useState<Record<string, { score: number; total: number }>>({});
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const loadExamData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRes = await fetch('/api/user', {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!userRes.ok) {
        const errorData = await userRes.json();
        throw new Error(errorData.details || t('progress.userFetchError'));
      }
      const userData: User = await userRes.json();
      setUser(userData);

      const examRes = await fetch('/api/exam/template', {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!examRes.ok) {
        const errorData = await examRes.json();
        throw new Error(errorData.details || t('exam.noExamAvailable'));
      }
      const examData: ExamTemplate = await examRes.json();
      setExamTemplate(examData);
      setTimeLeft(examData.timeLimit * 60);
    } catch (err: any) {
      console.error('Error loading exam data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamData();

    const handleModuleComplete = (event: Event) => {
      console.log('Module completion event received:', (event as CustomEvent).detail);
      loadExamData();
    };

    window.addEventListener('moduleCompleted', handleModuleComplete);
    return () => window.removeEventListener('moduleCompleted', handleModuleComplete);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && timeLeft > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, showResults]);

  useEffect(() => {
    if (examTemplate && currentSection !== "instructions" && currentSection !== "results") {
      const section = examTemplate.sections.find((s) => s.id === currentSection);
      if (section) {
        setCurrentSectionQuestions(section.questions);
        setCurrentQuestionIndex(0);
      }
    }
  }, [currentSection, examTemplate]);

  const checkExamEligibility = () => {
    const requireAllModules = false;
    const minModulesRequired = 1;
    const completedModules = user?.completedModulesList || [];
    return requireAllModules ? completedModules.length >= 1 : completedModules.length >= minModulesRequired;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const checkAnswer = (userAnswer: any, correctAnswer: any, questionType: string) => {
    if (questionType === "true-false") {
      return userAnswer === correctAnswer;
    }
    if (questionType === "multiple-choice") {
      return userAnswer === correctAnswer;
    }
    if (questionType === "fill-blank" || questionType === "short-answer") {
      if (typeof userAnswer === "string" && typeof correctAnswer === "string") {
        return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      }
    }
    if (questionType === "essay") {
      return userAnswer && userAnswer.trim().length > 10;
    }
    return userAnswer === correctAnswer;
  };

  const calculateSectionScore = (sectionId: string) => {
    const section = examTemplate?.sections.find((s) => s.id === sectionId);
    if (!section) return { score: 0, total: 0 };

    let score = 0;
    let total = 0;

    section.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = checkAnswer(userAnswer, question.correctAnswer, question.type);
      if (isCorrect) {
        score += question.points;
      }
      total += question.points;
    });

    return { score, total };
  };

  const handleSectionComplete = () => {
    const sectionScore = calculateSectionScore(currentSection);
    setSectionScores((prev) => ({ ...prev, [currentSection]: sectionScore }));

    if (!completedSections.includes(currentSection)) {
      setCompletedSections((prev) => [...prev, currentSection]);
    }

    const currentSectionIndex = examTemplate!.sections.findIndex((s) => s.id === currentSection);
    if (currentSectionIndex < examTemplate!.sections.length - 1) {
      const nextSection = examTemplate!.sections[currentSectionIndex + 1];
      setCurrentSection(nextSection.id);
    } else {
      handleFinishExam();
    }
  };

  const handleFinishExam = async () => {
    const finalSectionScores: Record<string, { score: number; total: number }> = {};
    let totalScore = 0;
    let maxScore = 0;

    examTemplate!.sections.forEach((section) => {
      const sectionScore = calculateSectionScore(section.id);
      finalSectionScores[section.id] = sectionScore;
      totalScore += sectionScore.score;
      maxScore += sectionScore.total;
    });

    setSectionScores(finalSectionScores);
    setScore(totalScore);
    setTotalPoints(maxScore);

    const percentage = Math.round((totalScore / maxScore) * 100);
    const passed = percentage >= examTemplate!.passingScore;

    const examResult = {
      examId: examTemplate!.id,
      score: totalScore,
      totalPoints: maxScore,
      percentage,
      passed,
      timeSpent: examTemplate!.timeLimit * 60 - timeLeft,
      answers,
      sectionScores: finalSectionScores,
    };

    try {
      const response = await fetch('/api/exam/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(examResult),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || t('exam.saveAttemptError'));
      }
    } catch (err: any) {
      console.error('Error saving exam attempt:', err);
      setError(err.message);
    }

    setShowResults(true);
  };

  const downloadCertificate = async () => {
    try {
      const response = await fetch(`/api/exam/certificate?studentId=${user!.id}&examId=${examTemplate!.id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || t('exam.noCertificate'));
      }
      const certificate = await response.json();

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
            <div class="student-name">${user!.name}</div>
            
            <div class="achievement">
              has successfully completed the Estonian Language Proficiency Exam
              and demonstrated competency in Estonian language skills.
            </div>
            
            <div class="details">
              <div class="detail-item">
                <span class="detail-value">${certificate.score}%</span>
                <div class="detail-label">Final Score</div>
              </div>
              <div class="detail-item">
                <span class="detail-value">${certificate.completed_modules}</span>
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
              Issued on ${new Date(certificate.generated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(certificateHTML);
        newWindow.document.close();
      } else {
        setError(t('exam.certificateWindowError'));
      }
    } catch (err: any) {
      console.error('Error fetching certificate:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("progress.loadingProgress")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">{t("progress.error")}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadExamData} className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t("progress.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
    );
  }

  const canTakeExam = checkExamEligibility();
  const requiredModules = checkExamEligibility() ? 1 : 1;

  if (!canTakeExam || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-700 mb-4">{t("exam.examLocked")}</h1>
            <p className="text-gray-600 mb-6">
              {t("exam.modulesRequired", { count: requiredModules })}
            </p>
            <div className="text-sm text-gray-500 mb-6">
              {t("exam.modulesCompleted", { completed: user?.completedModulesList.length || 0, required: requiredModules })}
            </div>
            <Progress value={(user?.completedModulesList.length || 0) / requiredModules * 100} className="mb-6" />
            <Button onClick={() => (window.location.href = "/modules")}>{t("exam.continueLearning")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const passed = score >= (totalPoints * examTemplate.passingScore) / 100;
    const percentage = Math.round((score / totalPoints) * 100);

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
              <div className="text-lg text-gray-600">
                {t("exam.pointsEarned", { score, total: totalPoints })}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{t("exam.sectionBreakdown")}</h3>
                {Object.entries(sectionScores).map(([sectionId, sectionScore]) => {
                  const section = examTemplate.sections.find((s) => s.id === sectionId);
                  const sectionPercentage = Math.round((sectionScore.score / sectionScore.total) * 100);

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
                  );
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
                  <p className="text-red-700">
                    {t("exam.needToPass", { passingScore: examTemplate.passingScore })}
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {passed && (
                  <Button onClick={downloadCertificate} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    {t("exam.downloadCertificate")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false);
                    setExamStarted(false);
                    setCurrentSection("instructions");
                    setAnswers({});
                    setTimeLeft(examTemplate.timeLimit * 60);
                    setCompletedSections([]);
                    setSectionScores({});
                  }}
                >
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
    );
  }

  if (currentSection === "instructions") {
    const totalQuestions = examTemplate.sections.reduce(
      (total: number, section: any) => total + section.questions.length,
      0,
    );

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
                    setExamStarted(true);
                    setCurrentSection(examTemplate.sections[0].id);
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
    );
  }

  const currentSectionData = examTemplate.sections.find((s) => s.id === currentSection);
  const currentQuestion = currentSectionQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentSectionQuestions.length) * 100;

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
              <CardTitle>{currentSectionData?.title}</CardTitle>
              <Badge variant="outline">
                {t("exam.questionOf", { current: currentQuestionIndex + 1, total: currentSectionQuestions.length })}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                  <Badge>{t("exam.points", { points: currentQuestion.points })}</Badge>
                </div>

                {currentQuestion.type === "multiple-choice" && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ""}
                    onValueChange={(value) => handleAnswer(currentQuestion.id, Number.parseInt(value))}
                  >
                    {currentQuestion.options?.map((option: string, index: number) => (
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
                <Button onClick={handleSectionComplete}>
                  {t("exam.completeSection")}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex(Math.min(currentSectionQuestions.length - 1, currentQuestionIndex + 1))
                  }
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
  );
}