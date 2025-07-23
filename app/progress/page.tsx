"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, Target, TrendingUp, CheckCircle, Play, Lock, BarChart3, Flame, RefreshCw, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface User {
  id: number;
  name: string;
  email: string;
  level: string;
  completedModules: number;
  completedModulesList: number[];
  last_active: string;
  is_admin: boolean;
  total_study_time_minutes: number;
  enrollment_date: string;
  streak: number;
  status: string;
  subscription_status: "free" | "premium" | "admin_override";
  subscription_date?: string;
}

interface Module {
  id: number;
  title: string;
  subtitle: string | null;
  level: string;
  duration: string;
}

interface ModuleProgress {
  [moduleId: number]: {
    story: boolean;
    vocabulary: boolean;
    grammar: boolean;
    pronunciation: boolean;
    listening: boolean;
    speaking: boolean;
    reading: boolean;
    writing: boolean;
    cultural: boolean;
    quiz: boolean;
    progress: number;
    status: string;
    completed: boolean;
    completedAt?: string | null;
    timeSpent: number;
  };
}

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({});
  const { t } = useLanguage();

  const loadPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch user data
      const userRes = await fetch('/api/user', {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!userRes.ok) {
        const errorData = await userRes.json();
        throw new Error(errorData.details || 'Failed to fetch user data');
      }
      const userData: User = await userRes.json();
      setUser(userData);
      setIsLoggedIn(true);

      // Fetch modules
      const modulesRes = await fetch('/api/modules', { cache: 'no-store' });
      if (!modulesRes.ok) {
        throw new Error('Failed to fetch modules');
      }
      const modulesData: Module[] = await modulesRes.json();
      setModules(modulesData);

      // Fetch module progress
      const progressRes = await fetch('/api/modules/progress', {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!progressRes.ok) {
        const errorData = await progressRes.json();
        throw new Error(errorData.details || 'Failed to fetch module progress');
      }
      const progressData: ModuleProgress = await progressRes.json();
      setModuleProgress(progressData);
    } catch (err: any) {
      console.error('Error loading progress page data:', err);
      setError(err.message.includes('connect') ? t('progress.databaseError') : err.message);
      setIsLoggedIn(false);
      setUser(null);
      setModuleProgress({});
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();

    const handleModuleComplete = (event: Event) => {
      console.log('Module completion event received:', (event as CustomEvent).detail);
      loadPageData();
    };

    window.addEventListener('moduleCompleted', handleModuleComplete);
    return () => window.removeEventListener('moduleCompleted', handleModuleComplete);
  }, []);

  const getCompletedModulesCount = (): number => {
    return user?.completedModulesList?.length || 0;
  };

  const getCompletedModulesList = (): number[] => {
    return user?.completedModulesList || [];
  };

  const calculateSectionProgress = (moduleId: number): number => {
    return moduleProgress[moduleId]?.progress || 0;
  };

  const getTotalStudyTime = (): number => {
    if (!moduleProgress || Object.keys(moduleProgress).length === 0) {
      return getCompletedModulesCount() * 30; // Estimate 30 min per module
    }
    return Object.values(moduleProgress).reduce((total, progress) => total + (progress.timeSpent || 30), 0);
  };

  const getCurrentStreak = (): number => {
    if (!user?.last_active) return 0;
    const lastActive = new Date(user.last_active);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return user.streak || Math.max(0, diffDays);
  };

  const getNextMilestone = (): { target: number; message: string } => {
    const completed = getCompletedModulesCount();
    if (completed === 0) {
      return { target: 1, message: t("progress.milestones.firstModule") };
    } else if (completed < 5) {
      return { target: 5, message: t("progress.milestones.fiveModules") };
    } else if (completed < 10) {
      return { target: 10, message: t("progress.milestones.tenModules") };
    } else if (completed < 20) {
      return { target: 20, message: t("progress.milestones.twentyModules") };
    } else if (completed < 40) {
      return { target: 40, message: t("progress.milestones.allModules") };
    } else {
      return { target: 40, message: t("progress.milestones.mastered") };
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
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">{t("progress.error")}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadPageData} className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t("progress.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">{t("progress.loginRequired")}</h2>
            <p className="text-gray-600 mb-6">{t("progress.loginRequiredDesc")}</p>
            <Link href="/login">
              <Button className="w-full">{t("common.loginToContinue")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = getCompletedModulesCount();
  const totalModules = modules.length;
  const overallProgress = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
  const studyTimeHours = Math.round(getTotalStudyTime() / 60);
  const currentStreak = getCurrentStreak();
  const nextMilestone = getNextMilestone();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("progress.title")}
          </h1>
          <p className="text-gray-600 text-lg">
            {completedCount === 0
              ? `${t("home.welcomeBack")} ${user.name}! ${t("progress.welcomeNewUser")}`
              : `${t("home.welcomeBack")} ${user.name}! ${t("progress.welcomeReturning")}`}
          </p>
          <Button onClick={loadPageData} className="mt-4 flex mx-auto items-center gap-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("progress.refreshProgress")}
          </Button>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">{t("progress.modulesCompleted")}</p>
                  <p className="text-3xl font-bold">{completedCount}</p>
                  <p className="text-blue-200 text-sm">
                    {t("progress.ofTotal")} {totalModules} {t("modules.totalModules").toLowerCase()}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">{t("progress.overallProgress")}</p>
                  <p className="text-3xl font-bold">{Math.round(overallProgress)}%</p>
                  <p className="text-green-200 text-sm">{t("progress.completionRate")}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">{t("progress.studyTime")}</p>
                  <p className="text-3xl font-bold">{studyTimeHours}h</p>
                  <p className="text-purple-200 text-sm">{t("progress.totalHours")}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">{t("progress.currentStreak")}</p>
                  <p className="text-3xl font-bold">{currentStreak}</p>
                  <p className="text-orange-200 text-sm">{t("progress.daysActive")}</p>
                </div>
                <Flame className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t("progress.overallCourseProgress")}</h3>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {Math.round(overallProgress)}%
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-4 mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {completedCount} {t("modules.modulesCompleted")}
              </span>
              <span>
                {totalModules - completedCount} {t("progress.modulesRemaining")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-indigo-800">{t("progress.nextMilestone")}</h3>
                <p className="text-indigo-600">{nextMilestone.message}</p>
                <div className="mt-2">
                  <Progress
                    value={nextMilestone.target > 0 ? (completedCount / nextMilestone.target) * 100 : 0}
                    className="h-2"
                  />
                  <p className="text-sm text-indigo-500 mt-1">
                    {completedCount} / {nextMilestone.target} {t("home.modules")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Progress Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">{t("progress.moduleProgress")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.slice(0, 12).map((module) => {
              const completedModulesList = getCompletedModulesList();
              const isCompleted = completedModulesList.includes(module.id);
              const sectionProgress = calculateSectionProgress(module.id);
              const hasStarted = sectionProgress > 0;

              return (
                <Card
                  key={module.id}
                  className={`transition-all duration-200 ${
                    isCompleted
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                      : hasStarted
                        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
                        : "bg-white"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={isCompleted ? "default" : hasStarted ? "secondary" : "outline"}>
                        {t("modules.levelLabel")} {module.id}
                      </Badge>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : hasStarted ? (
                        <Play className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{module.subtitle || 'No subtitle'}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t("progress.progress")}</span>
                        <span className="text-sm font-medium">{sectionProgress}%</span>
                      </div>
                      <Progress value={sectionProgress} className="h-2" />

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          {t("modules.levelLabel")}: {module.level}
                        </span>
                        <span className="text-gray-500">{module.duration}</span>
                      </div>

                      <Link href={`/modules/${module.id}`}>
                        <Button
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                          className="w-full"
                          disabled={!hasStarted && !isCompleted && module.id > 3 && !isLoggedIn}
                        >
                          {isCompleted
                            ? t("progress.review")
                            : hasStarted
                              ? t("progress.continue")
                              : t("progress.start")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {modules.length > 12 && (
            <div className="text-center mt-8">
              <Link href="/modules">
                <Button variant="outline" size="lg">
                  {t("progress.viewAllModules").replace("{total}", modules.length.toString())}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">
                {completedCount === 0 ? t("progress.startLearning") : t("progress.continueLearning")}
              </h3>
              <p className="text-blue-100 mb-4 text-sm">
                {completedCount === 0 ? t("progress.beginJourney") : t("progress.pickUpWhereLeft")}
              </p>
              <Link href={completedCount === 0 ? "/modules/1" : "/modules"}>
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  {completedCount === 0 ? t("progress.startNow") : t("progress.continue")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-purple-200" />
              <h3 className="text-lg font-semibold mb-2">{t("progress.achievements")}</h3>
              <p className="text-purple-100 mb-4 text-sm">{t("progress.viewMilestones")}</p>
              <Link href="/achievements">
                <Button className="bg-white text-purple-600 hover:bg-gray-100">{t("progress.viewAchievements")}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-200" />
              <h3 className="text-lg font-semibold mb-2">{t("progress.detailedStats")}</h3>
              <p className="text-green-100 mb-4 text-sm">{t("progress.analyzePatterns")}</p>
              <Button className="bg-white text-green-600 hover:bg-gray-100" disabled>
                {t("progress.comingSoon")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}