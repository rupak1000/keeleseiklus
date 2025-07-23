"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  MapPin,
  Trophy,
  Star,
  Play,
  CheckCircle,
  Globe,
  Clock,
  Award,
  Mail,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import EstoniaMap from "@/components/estonia-map";
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
  location?: string;
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

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      console.error('Error loading home page data:', err);
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

  const featuredModules = modules.slice(0, 3);
  const totalModules = modules.length;
  const completedModules = user?.completedModulesList?.length || 0;
  const completedModulesList = user?.completedModulesList || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-3xl">E</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              {t("home.title")}
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">{t("home.description")}</p>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8 max-w-4xl mx-auto">
              <Badge className="bg-blue-100 text-blue-700 px-2 sm:px-4 py-2 text-xs sm:text-sm flex items-center justify-center min-h-[2.5rem]">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-center leading-tight">
                  {totalModules} {t("home.interactiveModules")}
                </span>
              </Badge>
              <Badge className="bg-indigo-100 text-indigo-700 px-2 sm:px-4 py-2 text-xs sm:text-sm flex items-center justify-center min-h-[2.5rem]">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-center leading-tight">
                  {totalModules * 3} {t("home.hoursContent")}
                </span>
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 px-2 sm:px-4 py-2 text-xs sm:text-sm flex items-center justify-center min-h-[2.5rem]">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-center leading-tight">{t("home.officialCert")}</span>
              </Badge>
              <Badge className="bg-violet-100 text-violet-700 px-2 sm:px-4 py-2 text-xs sm:text-sm flex items-center justify-center min-h-[2.5rem]">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-center leading-tight">{t("home.culturalImmersion")}</span>
              </Badge>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <>
                  <Link href="/modules">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
                    >
                      {t("home.continueLearning")}
                      <Play className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/progress">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-3 text-lg bg-transparent border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      {t("home.viewProgress")}
                      <Trophy className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
                    >
                      {t("home.startJourney")}
                      <Play className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/modules">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-3 text-lg bg-transparent border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      {t("home.exploreFreeModules")}
                      <BookOpen className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* User Welcome */}
            {isLoggedIn && user && (
              <div className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                <p className="text-lg text-gray-700">
                  {t("home.welcomeBack")} <span className="font-semibold text-blue-600">{user.name}</span>!{" "}
                  {t("home.completedModules")} <span className="font-semibold text-purple-600">{completedModules}</span>{" "}
                  {t("home.ofModules")} {totalModules} {t("home.modules")}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Modules */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t("home.startEstonianAdventure")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("home.beginWithFree")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredModules.map((module) => (
              <Card
                key={module.id}
                className={`hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-2 ${
                  completedModulesList.includes(module.id) ? 'border-green-200' : 'border-yellow-200'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      {t("home.free")}
                    </Badge>
                    {completedModulesList.includes(module.id) ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <span className="text-2xl">🇪🇪</span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.subtitle || 'No description available'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{module.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{module.level}</span>
                    </div>
                    {module.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{module.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Trophy className="w-4 h-4 mr-2" />
                      <span>{moduleProgress[module.id]?.progress || 0}% {t("progress.progress")}</span>
                    </div>
                  </div>

                  <Link href={`/modules/${module.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      {completedModulesList.includes(module.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t("home.reviewModule")}
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {t("home.startFreeModuleBtn")}
                        </>
                      )}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/modules">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg bg-transparent border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                {t("home.viewAllModules")} {totalModules} {t("nav.modules")}
                <BookOpen className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estonia Interactive Map Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <EstoniaMap completedModules={completedModules} isLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t("home.whyChoose")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("home.comprehensiveApproach")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("home.interactiveLearning")}</h3>
                <p className="text-gray-600">{t("home.interactiveLearningDesc")}</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("home.culturalImmersionTitle")}</h3>
                <p className="text-gray-600">{t("home.culturalImmersionDesc")}</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("home.achievementSystem")}</h3>
                <p className="text-gray-600">{t("home.achievementSystemDesc")}</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("home.certificationTitle")}</h3>
                <p className="text-gray-600">{t("home.certificationDesc")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t("home.getInTouch")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("home.contactDescription")}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-200">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {t("contact.email")} {t("contact.faq")}
                        </h3>
                        <p className="text-gray-600">support@estonianlearning.com</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{t("contact.faqQuestion2")}</h3>
                        <p className="text-gray-600">{t("contact.faqAnswer2")}</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-gray-600 mb-4">{t("contact.getInTouchDesc")}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <Mail className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{t("contact.sendMessage")}?</h3>
                    <p className="text-gray-600 mb-6">{t("contact.sendMessageDesc")}</p>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        {t("home.contactUs")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}