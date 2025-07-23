// /app/modules/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Volume2,
  Mic,
  FileText,
  PenTool,
  Globe,
  Trophy,
  Lock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import VocabularyCard from "@/components/vocabulary-card";
import { ExerciseComponent } from "@/components/exercise-component";
import AudioPlayer from "@/components/audio-player";
import { ModuleData } from "@/types/module";

interface ModuleProgress {
  [sectionId: string]: boolean;
}

interface User {
  id: number; // Added for database reference
  name: string;
  email: string;
  level: string;
  completedModules: number | number[];
  completedModulesList?: number[];
  loginTime: string;
  isAdmin: boolean;
}

const SECTION_ORDER = [
  "story",
  "vocabulary",
  "grammar",
  "pronunciation",
  "listening",
  "speaking",
  "reading",
  "writing",
  "cultural",
];

const SECTION_THEMES = {
  story: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    tab: "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
    button: "bg-blue-600 hover:bg-blue-700",
    accent: "text-blue-700",
    light: "bg-blue-100 text-blue-800",
  },
  vocabulary: {
    bg: "bg-gradient-to-br from-purple-50 to-violet-50",
    border: "border-purple-200",
    icon: "text-purple-600",
    tab: "data-[state=active]:bg-purple-600 data-[state=active]:text-white",
    button: "bg-purple-600 hover:bg-purple-700",
    accent: "text-purple-700",
    light: "bg-purple-100 text-purple-800",
  },
  grammar: {
    bg: "bg-gradient-to-br from-indigo-50 to-blue-50",
    border: "border-indigo-200",
    icon: "text-indigo-600",
    tab: "data-[state=active]:bg-indigo-600 data-[state=active]:text-white",
    button: "bg-indigo-600 hover:bg-indigo-700",
    accent: "text-indigo-700",
    light: "bg-indigo-100 text-indigo-800",
  },
  pronunciation: {
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    tab: "data-[state=active]:bg-amber-600 data-[state=active]:text-white",
    button: "bg-amber-600 hover:bg-amber-700",
    accent: "text-amber-700",
    light: "bg-amber-100 text-amber-800",
  },
  listening: {
    bg: "bg-gradient-to-br from-cyan-50 to-blue-50",
    border: "border-cyan-200",
    icon: "text-cyan-600",
    tab: "data-[state=active]:bg-cyan-600 data-[state=active]:text-white",
    button: "bg-cyan-600 hover:bg-cyan-700",
    accent: "text-cyan-700",
    light: "bg-cyan-100 text-cyan-800",
  },
  speaking: {
    bg: "bg-gradient-to-br from-violet-50 to-purple-50",
    border: "border-violet-200",
    icon: "text-violet-600",
    tab: "data-[state=active]:bg-violet-600 data-[state=active]:text-white",
    button: "bg-violet-600 hover:bg-violet-700",
    accent: "text-violet-700",
    light: "bg-violet-100 text-violet-800",
  },
  reading: {
    bg: "bg-gradient-to-br from-sky-50 to-blue-50",
    border: "border-sky-200",
    icon: "text-sky-600",
    tab: "data-[state=active]:bg-sky-600 data-[state=active]:text-white",
    button: "bg-sky-600 hover:bg-sky-700",
    accent: "text-sky-700",
    light: "bg-sky-100 text-sky-800",
  },
  writing: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    tab: "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
    button: "bg-blue-600 hover:bg-blue-700",
    accent: "text-blue-700",
    light: "bg-blue-100 text-blue-800",
  },
  cultural: {
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
    border: "border-orange-200",
    icon: "text-orange-600",
    tab: "data-[state=active]:bg-orange-600 data-[state=active]:text-white",
    button: "bg-orange-600 hover:bg-orange-700",
    accent: "text-orange-700",
    light: "bg-orange-100 text-orange-800",
  },
};

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const moduleId = Number.parseInt(params.id as string);

  // Initialize progress with all sections set to false
  const initialProgressState: ModuleProgress = SECTION_ORDER.reduce((acc, section) => {
    acc[section] = false;
    return acc;
  }, {} as ModuleProgress);

  const [progress, setProgress] = useState<ModuleProgress>(initialProgressState);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [module, setModule] = useState<ModuleData | null>(null);
  const [currentTab, setCurrentTab] = useState("story");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        // Fetch module and user progress data from API
        const response = await fetch(`/api/modules/${moduleId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch module data: ${response.statusText}`);
        }
        const data = await response.json();

        if (data.module) {
          setModule(data.module);
        } else {
          setError(t("module.moduleNotFound"));
        }

        if (data.isLoggedIn && data.user) {
          setIsLoggedIn(true);
          setUserType(data.user.isAdmin ? "admin" : "student");
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            level: data.user.level,
            completedModules: data.user.completedModulesList?.length || 0,
            completedModulesList: data.user.completedModulesList || [],
            loginTime: data.user.last_active,
            isAdmin: data.user.isAdmin,
          });
          // Merge fetched progress with initial state to ensure all keys exist
          setProgress(prevProgress => ({
              ...prevProgress, // Keep existing false states for sections not in API response
              ...(data.progress || {}) // Override with fetched true/false states
          }));
        } else {
            // If not logged in or user data is missing, ensure progress is reset to initial state
            setProgress(initialProgressState);
            setIsLoggedIn(false);
            setUser(null);
            setUserType("");
        }
      } catch (err) {
        console.error("Error fetching module data:", err);
        setError(t("module.moduleNotFound"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleId, t]);

  const isModuleAccessible = () => {
    if (moduleId <= 3) return true; // Free modules
    return isLoggedIn;
  };

  const getContent = (key: string, fallback = "") => {
    if (!module) return fallback;

    try {
      // Handle story content
      if (key === "story" && module.module_stories?.[0]) {
        return language === "ru" && module.module_stories[0].text_ru
          ? module.module_stories[0].text_ru
          : module.module_stories[0].text || fallback;
      }

      // Handle other nested content
      const sections: { [key: string]: keyof ModuleData } = {
        grammar: "module_grammar",
        pronunciation: "module_pronunciation",
        listening: "module_listening",
        speaking: "module_speaking",
        reading: "module_reading",
        writing: "module_writing",
        cultural: "module_cultural",
      };

      for (const [section, field] of Object.entries(sections)) {
        if (key.startsWith(section) && module[field]?.[0]) {
          const sectionData = module[field]![0];
          const subKey = key.replace(section, "").toLowerCase();

          if (subKey === "title" || subKey === "") {
            return language === "ru" && sectionData.title_ru
              ? sectionData.title_ru
              : sectionData.title || fallback;
          }

          if (subKey === "content") {
            return language === "ru" && sectionData.content_ru
              ? sectionData.content_ru
              : sectionData.content || fallback;
          }

          if (subKey === "hint") {
            return language === "ru" && sectionData.hint_ru
              ? sectionData.hint_ru
              : sectionData.hint || fallback;
          }
        }
      }

      // Direct property access
      const directValue = (module as any)[key];
      if (typeof directValue === "string") {
        return language === "ru" && (module as any)[`${key}_ru`]
          ? (module as any)[`${key}_ru`]
          : directValue;
      }

      return fallback;
    } catch (error) {
      console.error(`Error getting content for key: ${key}`, error);
      return fallback;
    }
  };

  
async function markSectionComplete(sectionId: string) {
    if (!user) {
      setError(t("module.notLoggedIn"));
      return;
    }

    try {
      console.log(`Marking section ${sectionId} complete for module ID: ${moduleId}, user ID: ${user.id}`);
      const response = await fetch(`/api/modules/${moduleId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: user.id, sectionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update progress:", {
          moduleId,
          sectionId,
          userId: user.id,
          status: response.status,
          error: errorData,
        });
        throw new Error(`${t("module.progressUpdateFailed")}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      // Merge fetched progress with initial state to ensure all SECTION_ORDER keys are present
      setProgress((prevProgress) => ({
        ...SECTION_ORDER.reduce((acc, section) => {
          acc[section] = prevProgress[section] || false;
          return acc;
        }, {} as ModuleProgress),
        ...data.moduleProgress,
      }));

      setUser((prev) => ({
        ...prev!,
        completedModules: data.user.completedModulesList?.length || 0,
        completedModulesList: data.user.completedModulesList || [],
        last_active: data.user.lastActive,
        total_study_time_minutes: data.user.total_study_time_minutes,
      }));

      const isModuleComplete = data.moduleProgress.status === "completed";
      if (isModuleComplete) {
        console.log(`Module ${moduleId} completed, dispatching event`);
        window.dispatchEvent(new CustomEvent("moduleCompleted", { detail: { moduleId: Number(moduleId) } }));

        // Check for new achievements
        const checkResponse = await fetch("/api/achievements/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ moduleId: Number(moduleId) }),
        });

        if (!checkResponse.ok) {
          const errorData = await checkResponse.json();
          console.error("Failed to check achievements:", {
            moduleId,
            userId: user.id,
            status: checkResponse.status,
            error: errorData,
          });
        } else {
          const checkData = await checkResponse.json();
          if (checkData.newAchievements > 0) {
            console.log(`Unlocked ${checkData.newAchievements} new achievements for user ${user.id}`);
          }
        }
      }
    } catch (error: any) {
      console.error("Error updating section progress:", {
        message: error.message,
        moduleId,
        sectionId,
        userId: user?.id,
        stack: error.stack,
      });
      setError(`${t("module.progressUpdateFailed")}: ${error.message}`);
    }
  }

  const markModuleComplete = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/modules/${moduleId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark module complete: ${response.statusText}`);
      }

      const data = await response.json();
      setUser({
        ...user,
        completedModules: data.completedModules,
        completedModulesList: data.completedModulesList,
        loginTime: data.last_active,
      });

      setTimeout(() => {
        if (moduleId < 1) {
          router.push(`/modules/${moduleId + 1}`);
        } else {
          router.push("/exam");
        }
      }, 1500);
    } catch (error) {
      console.error("Error marking module complete:", error);
    }
  };

const calculateProgress = () => {
  const totalSections = SECTION_ORDER.length;
  const completedSections = SECTION_ORDER.filter(
    (section) => progress[section]
  ).length;
  return Math.round((completedSections / totalSections) * 100);
};


  const getCurrentTheme = () => {
    return SECTION_THEMES[currentTab as keyof typeof SECTION_THEMES] || SECTION_THEMES.story;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("module.loadingModule")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{t("module.moduleNotFound")}</h1>
            <p className="text-gray-600 mb-4">{t("module.moduleNotFoundDesc")}</p>
            <Button onClick={() => router.push("/modules")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("module.backToModules")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isModuleAccessible()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-700 mb-4">{t("module.moduleLocked")}</h1>
            <p className="text-gray-600 mb-4">{t("module.moduleLockedDesc")}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/login")}>{t("module.loginToAccess")}</Button>
              <Button variant="outline" onClick={() => router.push("/modules")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("module.backToModules")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allSectionsComplete = SECTION_ORDER.every((section) => progress[section]);
  const currentTheme = getCurrentTheme();

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-all duration-500`}>
      <div className="container mx-auto px-4 py-8">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => router.push("/modules")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("module.backToModules")}
            </Button>
            <Badge variant="secondary">Module {module.id}</Badge>
            <Badge variant="outline">{module.level}</Badge>
            {moduleId <= 3 && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Free
              </Badge>
            )}
            {moduleId > 3 && <Badge variant="default">Premium</Badge>}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {language === "ru" && module.title_ru ? module.title_ru : module.title}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {language === "ru" && module.subtitle_ru ? module.subtitle_ru : module.subtitle}
          </p>
          <p className="text-gray-500 mb-6">
            {language === "ru" && module.description_ru ? module.description_ru : module.description}
          </p>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-700">{t("module.progress")}</span>
              <span className="text-lg font-bold text-blue-600">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-3" />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {allSectionsComplete && (
              <Button
                onClick={() => router.push(`/modules/${moduleId}/quiz`)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Trophy className="w-4 h-4 mr-2" />
                {t("module.takeQuiz")}
              </Button>
            )}
          </div>
        </div>

        {/* Module Content Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto p-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            {SECTION_ORDER.map((section) => (
              <TabsTrigger
                key={section}
                value={section}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                  SECTION_THEMES[section as keyof typeof SECTION_THEMES].tab
                }`}
              >
                {section === "story" || section === "reading" ? (
                  <BookOpen className="w-5 h-5" />
                ) : section === "vocabulary" || section === "writing" ? (
                  <FileText className="w-5 h-5" />
                ) : section === "grammar" ? (
                  <PenTool className="w-5 h-5" />
                ) : section === "pronunciation" || section === "listening" ? (
                  <Volume2 className="w-5 h-5" />
                ) : section === "speaking" ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <Globe className="w-5 h-5" />
                )}
                <span className="text-xs font-medium">{t(`module.${section}`)}</span>
                {progress[section] && <CheckCircle className="w-3 h-3 text-green-500" />}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Story Section */}
          <TabsContent value="story">
            <Card className={`${SECTION_THEMES.story.bg} ${SECTION_THEMES.story.border} border-2 shadow-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${SECTION_THEMES.story.light}`}>
                      <BookOpen className={`w-6 h-6 ${SECTION_THEMES.story.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("module.interactiveVideoStory")}</h2>
                      <p className="text-gray-600 font-normal">{t("module.experienceAuthentic")}</p>
                    </div>
                  </span>
                  {progress.story && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {module.module_stories?.[0]?.video_url && (
                      <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                        <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                          <button className="relative z-10 w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
                            <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                          </button>
                        </div>
                        <div className="bg-gray-900 p-4">
                          <div className="flex items-center gap-4">
                            <button className="text-white hover:text-blue-400">
                              <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                            </button>
                            <button className="text-white hover:text-blue-400">
                              <Volume2 className="w-5 h-5" />
                            </button>
                            <div className="flex-1 bg-gray-700 h-1 rounded-full">
                              <div className="bg-blue-500 h-1 rounded-full w-1/4"></div>
                            </div>
                            <span className="text-white text-sm">0:00 / 0:00</span>
                            <button className="text-white hover:text-blue-400">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm mt-2">{module.title} - Story</p>
                        </div>
                      </div>
                    )}

                    {module.module_stories?.[0]?.mission && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">🎯</span>
                          </div>
                          <h3 className="text-lg font-semibold text-purple-800">{t("module.yourMission")}</h3>
                        </div>
                        <p className="text-purple-700">
                          {language === "ru" && module.module_stories[0].mission_ru
                            ? module.module_stories[0].mission_ru
                            : module.module_stories[0].mission}
                        </p>
                      </div>
                    )}

                    {module.module_stories?.[0]?.text && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">{t("module.storyTranscript")}</h3>
                          {module.module_stories[0].show_translation && (
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              {t("module.showTranslation")}
                            </button>
                          )}
                        </div>
                        <div className="space-y-4 text-gray-700">
                          <p>{getContent("story")}</p>
                        </div>
                      </div>
                    )}

                    {module.module_stories?.[0]?.hint && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">💡</span>
                          </div>
                          <h3 className="text-lg font-semibold text-blue-800">{t("module.learningHint")}</h3>
                        </div>
                        <p className="text-blue-700">
                          {language === "ru" && module.module_stories[0].hint_ru
                            ? module.module_stories[0].hint_ru
                            : module.module_stories[0].hint}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center pt-4">
                      {!progress.story ? (
                        <button
                          onClick={() => markSectionComplete("story")}
                          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all"
                        >
                          {t("module.completeContinue")}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-6 py-3 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">{t("module.sectionComplete")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("module.quickActions")}</h3>
                      <div className="space-y-3">
                        {module.module_stories?.[0]?.video_url && (
                          <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all">
                            <Volume2 className="w-4 h-4" />
                            {t("module.playModuleAudio")}
                          </button>
                        )}
                        <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-200 flex items-center justify-center gap-2 transition-all">
                          <FileText className="w-4 h-4" />
                          {t("module.downloadPDF")}
                        </button>
                        <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-200 flex items-center justify-center gap-2 transition-all">
                          <Globe className="w-4 h-4" />
                          {t("module.joinDiscussion")}
                        </button>
                      </div>
                    </div>

                    {module.module_cultural?.[0]?.souvenir_name && (
                      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("module.culturalSouvenir")}</h3>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🧀</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {language === "ru" && module.module_cultural[0].souvenir_name_ru
                              ? module.module_cultural[0].souvenir_name_ru
                              : module.module_cultural[0].souvenir_name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            {language === "ru" && module.module_cultural[0].souvenir_description_ru
                              ? module.module_cultural[0].souvenir_description_ru
                              : module.module_cultural[0].souvenir_description}
                          </p>
                          {module.module_cultural[0].souvenir_download_url && (
                            <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                              {t("module.downloadSouvenir")}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button variant="outline" className="w-full sm:w-auto order-2 sm:order-1 bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("module.previousModule")}
                  </Button>
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {!progress.story ? (
                      <Button
                        onClick={() => markSectionComplete("story")}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t("module.markSectionComplete")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-6 py-3 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("module.sectionComplete")}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("vocabulary")}
                    className="w-full sm:w-auto order-3"
                  >
                    {t("module.nextModule")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vocabulary Section */}
          <TabsContent value="vocabulary">
            <Card className={`${SECTION_THEMES.vocabulary.bg} ${SECTION_THEMES.vocabulary.border} border-2 shadow-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${SECTION_THEMES.vocabulary.light}`}>
                      <FileText className={`w-6 h-6 ${SECTION_THEMES.vocabulary.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("module.vocabulary")}</h2>
                      <p className="text-gray-600 font-normal">{t("module.learnEssential")}</p>
                    </div>
                  </span>
                  {progress.vocabulary && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {module.module_vocabulary && module.module_vocabulary.length > 0 ? (
                    module.module_vocabulary.map((item, index) => (
                      <VocabularyCard
                        key={index}
                        item={{
                          word: item.word,
                          translation: language === "ru" && item.translation_ru ? item.translation_ru : item.translation,
                          example: language === "ru" && item.example_ru ? item.example_ru : item.example,
                          audio_url: item.audio_url,
                        }}
                        language={language}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>{t("module.noVocabulary")}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("story")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("module.previousStory")}
                  </Button>
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {!progress.vocabulary ? (
                      <Button
                        onClick={() => markSectionComplete("vocabulary")}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t("module.markAsComplete")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("module.sectionComplete")}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("grammar")}
                    className="w-full sm:w-auto order-3"
                  >
                    {t("module.nextGrammar")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grammar Section */}
          <TabsContent value="grammar">
            <Card className={`${SECTION_THEMES.grammar.bg} ${SECTION_THEMES.grammar.border} border-2 shadow-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${SECTION_THEMES.grammar.light}`}>
                      <PenTool className={`w-6 h-6 ${SECTION_THEMES.grammar.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("module.grammar")}</h2>
                      <p className="text-gray-600 font-normal">{t("module.masterGrammar")}</p>
                    </div>
                  </span>
                  {progress.grammar && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {module.module_grammar?.[0]?.explanation && (
                  <div className="prose max-w-none">
                    <div className={`${SECTION_THEMES.grammar.light} p-6 rounded-xl`}>
                      <h3 className="text-lg font-semibold mb-3">
                        {language === "ru" && module.module_grammar[0].title_ru
                          ? module.module_grammar[0].title_ru
                          : module.module_grammar[0].title}
                      </h3>
                      <p>
                        {language === "ru" && module.module_grammar[0].explanation_ru
                          ? module.module_grammar[0].explanation_ru
                          : module.module_grammar[0].explanation}
                      </p>
                    </div>
                  </div>
                )}

                {module.module_grammar?.[0]?.grammar_rules && module.module_grammar[0].grammar_rules.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.grammarRules")}</h4>
                    <ul className="space-y-2">
                      {module.module_grammar[0].grammar_rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span
                            className={`w-6 h-6 ${SECTION_THEMES.grammar.light} ${SECTION_THEMES.grammar.icon} rounded-full flex items-center justify-center text-sm font-medium mt-0.5`}
                          >
                            {index + 1}
                          </span>
                          <span>
                            {language === "ru" && rule.rule_ru ? rule.rule_ru : rule.rule}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {module.module_grammar?.[0]?.grammar_examples && module.module_grammar[0].grammar_examples.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.examples")}</h4>
                    <div className="space-y-3">
                      {module.module_grammar[0].grammar_examples.map((example, index) => (
                        <div key={index} className={`${SECTION_THEMES.grammar.light} p-4 rounded-xl`}>
                          <p className={`font-medium ${SECTION_THEMES.grammar.accent}`}>{example.sentence}</p>
                          <p className={`${SECTION_THEMES.grammar.icon} italic`}>
                            {language === "ru" && example.translation_ru ? example.translation_ru : example.translation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {module.module_grammar?.[0]?.grammar_exercises && module.module_grammar[0].grammar_exercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.practiceExercises")}</h4>
                    <div className="space-y-4">
                      {module.module_grammar[0].grammar_exercises.map((exercise, index) => (
                        <ExerciseComponent
                          key={index}
                          exercise={{
                            type: exercise.type,
                            question: language === "ru" && exercise.question_ru ? exercise.question_ru : exercise.question,
                            answer: exercise.answer,
                            hint: language === "ru" && exercise.hint_ru ? exercise.hint_ru : exercise.hint,
                            options: exercise.exercise_options?.map((opt) => ({
                              option_text: language === "ru" && opt.option_text_ru ? opt.option_text_ru : opt.option_text,
                            })),
                          }}
                          exerciseNumber={index + 1}
                          language={language}
                          onComplete={(correct) => {
                            if (correct) {
                              console.log(`Grammar exercise ${index + 1} completed correctly`);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("vocabulary")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("module.previousVocabulary")}
                  </Button>
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {!progress.grammar ? (
                      <Button
                        onClick={() => markSectionComplete("grammar")}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t("module.markAsComplete")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("module.sectionComplete")}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("pronunciation")}
                    className="w-full sm:w-auto order-3"
                  >
                    {t("module.nextPronunciation")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pronunciation Section */}
          <TabsContent value="pronunciation">
            <Card
              className={`${SECTION_THEMES.pronunciation.bg} ${SECTION_THEMES.pronunciation.border} border-2 shadow-xl`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${SECTION_THEMES.pronunciation.light}`}>
                      <Volume2 className={`w-6 h-6 ${SECTION_THEMES.pronunciation.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("module.pronunciation")}</h2>
                      <p className="text-gray-600 font-normal">{t("module.masterPronunciation")}</p>
                    </div>
                  </span>
                  {progress.pronunciation && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {module.module_pronunciation?.[0]?.content && (
                  <div className="prose max-w-none mb-6">
                    <p>{getContent("pronunciationContent")}</p>
                  </div>
                )}

                {module.module_pronunciation?.[0]?.focus && (
                  <div className={`${SECTION_THEMES.pronunciation.light} p-6 rounded-xl`}>
                    <h4 className={`font-semibold ${SECTION_THEMES.pronunciation.accent} mb-3`}>
                      {t("module.focusAreas")}
                    </h4>
                    <p className={SECTION_THEMES.pronunciation.accent}>
                      {language === "ru" && module.module_pronunciation[0].focus_ru
                        ? module.module_pronunciation[0].focus_ru
                        : module.module_pronunciation[0].focus}
                    </p>
                  </div>
                )}

                {module.module_pronunciation?.[0]?.exercises && module.module_pronunciation[0].exercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.pronunciationExercises")}</h4>
                    <div className="space-y-4">
                      {module.module_pronunciation[0].exercises.map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-white/80 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{exercise.instruction || `Exercise ${index + 1}`}</h5>
                            <Badge variant="outline">{exercise.type}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {language === "ru" && exercise.hint_ru ? exercise.hint_ru : exercise.hint}
                          </p>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="font-medium">{exercise.word}</p>
                            {exercise.phonetic && <p className="text-sm text-gray-600">{exercise.phonetic}</p>}
                          </div>
                          {exercise.audio_url && <AudioPlayer src={exercise.audio_url} title={`Exercise ${index + 1}`} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {module.module_pronunciation?.[0]?.minimal_pairs && module.module_pronunciation[0].minimal_pairs.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.minimalPairs")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {module.module_pronunciation[0].minimal_pairs.map((pair, index) => (
                        <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                          <div className="text-center">
                            <p className="font-medium text-lg">{`${pair.word1} / ${pair.word2}`}</p>
                            {(pair.audio_url1 || pair.audio_url2) && (
                              <div className="flex gap-2 justify-center mt-2">
                                {pair.audio_url1 && <AudioPlayer src={pair.audio_url1} title={pair.word1} />}
                                {pair.audio_url2 && <AudioPlayer src={pair.audio_url2} title={pair.word2} />}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("grammar")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("module.previousGrammar")}
                  </Button>
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {!progress.pronunciation ? (
                      <Button
                        onClick={() => markSectionComplete("pronunciation")}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t("module.markAsComplete")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("module.sectionComplete")}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("listening")}
                    className="w-full sm:w-auto order-3"
                  >
                    {t("module.nextListening")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listening Section */}
          <TabsContent value="listening">
            <Card className={`${SECTION_THEMES.listening.bg} ${SECTION_THEMES.listening.border} border-2 shadow-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${SECTION_THEMES.listening.light}`}>
                      <Volume2 className={`w-6 h-6 ${SECTION_THEMES.listening.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("module.listening")}</h2>
                      <p className="text-gray-600 font-normal">{t("module.practiceUnderstanding")}</p>
                    </div>
                  </span>
                  {progress.listening && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {module.module_listening?.[0]?.content && (
                  <div className="prose max-w-none">
                    <p>{getContent("listeningContent")}</p>
                  </div>
                )}

                {module.module_listening?.[0]?.audio_url && (
                  <div className={`${SECTION_THEMES.listening.light} p-6 rounded-xl text-center`}>
                    <Button className={`${SECTION_THEMES.listening.button} text-white shadow-lg mb-4`}>
                      <Volume2 className="w-5 h-5 mr-2" />
                      {t("module.playAudioDialogue")}
                    </Button>
                    <p className={SECTION_THEMES.listening.accent}>{t("module.listenCarefully")}</p>
                    <AudioPlayer src={module.module_listening[0].audio_url} title="Listening Exercise" />
                  </div>
                )}

                {module.module_listening?.[0]?.transcript && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.transcript")}</h4>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                      <p>
                        {language === "ru" && module.module_listening[0].transcript_ru
                          ? module.module_listening[0].transcript_ru
                          : module.module_listening[0].transcript}
                      </p>
                    </div>
                  </div>
                )}

                {module.module_listening?.[0]?.questions && module.module_listening[0].questions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.comprehensionQuestions")}</h4>
                    <div className="space-y-4">
                      {module.module_listening[0].questions.map((question, index) => (
                        <ExerciseComponent
                          key={index}
                          exercise={{
                            type: question.type,
                            question: language === "ru" && question.question_ru ? question.question_ru : question.question,
                            answer: question.answer,
                            options: question.options?.map((opt) => ({
                              option_text: language === "ru" && opt.option_text_ru ? opt.option_text_ru : opt.option_text,
                            })),
                          }}
                          exerciseNumber={index + 1}
                          language={language}
                          onComplete={(correct) => {
                            if (correct) {
                              console.log(`Listening question ${index + 1} completed correctly`);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("pronunciation")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("module.previousPronunciation")}
                  </Button>
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {!progress.listening ? (
                      <Button
                        onClick={() => markSectionComplete("listening")}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t("module.markAsComplete")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("module.sectionComplete")}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("speaking")}
                    className="w-full sm:w-auto order-3"
                  >
                    {t("module.nextSpeaking")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Speaking Section */}
          <TabsContent value="speaking">
            <Card className={`${SECTION_THEMES.speaking.bg} ${SECTION_THEMES.speaking.border} border-2 shadow-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${SECTION_THEMES.speaking.light}`}>
                      <Mic className={`w-6 h-6 ${SECTION_THEMES.speaking.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("module.speaking")}</h2>
                      <p className="text-gray-600 font-normal">{t("module.practicePronunciation")}</p>
                    </div>
                  </span>
                  {progress.speaking && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {module.module_speaking?.[0]?.content && (
                  <div className="prose max-w-none mb-6">
                    <p>{getContent("speakingContent")}</p>
                  </div>
                )}

                {module.module_speaking?.[0]?.exercises && module.module_speaking[0].exercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.speakingExercises")}</h4>
                    <div className="space-y-4">
                      {module.module_speaking[0].exercises.map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4 bg-white/80 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">Exercise {index + 1}</h5>
                            <Badge variant="outline">{exercise.type}</Badge>
                          </div>
                          <div>
                            <p className={`font-medium ${SECTION_THEMES.speaking.icon}`}>{t("module.prompt")}</p>
                            <p>{language === "ru" && exercise.prompt_ru ? exercise.prompt_ru : exercise.prompt}</p>
                          </div>
                          {exercise.expected_response && (
                            <div>
                              <p className="font-medium text-green-600">{t("module.expectedResponse")}</p>
                              <p className="italic">{exercise.expected_response}</p>
                            </div>
                          )}
                          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                            <Mic className="w-4 h-4" />
                            {t("module.startRecording")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("listening")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("module.previousListening")}
                  </Button>
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {!progress.speaking ? (
                      <Button
                        onClick={() => markSectionComplete("speaking")}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t("module.markAsComplete")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("module.sectionComplete")}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("reading")}
                    className="w-full sm:w-auto order-3"
                  >
                    {t("module.nextReading")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading Section */}
          <TabsContent value="reading">
            <Card className={`${SECTION_THEMES.reading.bg} ${SECTION_THEMES.reading.border} border-2 shadow-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${SECTION_THEMES.reading.light}`}>
                      <BookOpen className={`w-6 h-6 ${SECTION_THEMES.reading.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("module.reading")}</h2>
                      <p className="text-gray-600 font-normal">{t("module.readAndUnderstand")}</p>
                    </div>
                  </span>
                  {progress.reading && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {module.module_reading?.[0]?.text && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.readingText")}</h4>
                    <div className={`${SECTION_THEMES.reading.light} p-6 rounded-xl`}>
                      <div className="prose max-w-none">
                        <p className="text-lg leading-relaxed">
                          {language === "ru" && module.module_reading[0].text_ru
                            ? module.module_reading[0].text_ru
                            : module.module_reading[0].text}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {module.module_reading?.[0]?.questions && module.module_reading[0].questions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.comprehensionQuestions")}</h4>
                    <div className="space-y-4">
                      {module.module_reading[0].questions.map((question, index) => (
                        <ExerciseComponent
                          key={index}
                          exercise={{
                            type: question.type,
                            question: language === "ru" && question.question_ru ? question.question_ru : question.question,
                            answer: question.answer,
                            options: question.options?.map((opt) => ({
                              option_text: language === "ru" && opt.option_text_ru ? opt.option_text_ru : opt.option_text,
                            })),
                          }}
                          exerciseNumber={index + 1}
                          language={language}
                          onComplete={(correct) => {
                            if (correct) {
                              console.log(`Reading question ${index + 1} completed correctly`);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("speaking")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("module.previousSpeaking")}
                  </Button>
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {!progress.reading ? (
                      <Button
                        onClick={() => markSectionComplete("reading")}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t("module.markAsComplete")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("module.sectionComplete")}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("writing")}
                    className="w-full sm:w-auto order-3"
                  >
                    {t("module.nextWriting")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Writing Section */}
          <TabsContent value="writing">
            <Card className={`${SECTION_THEMES.writing.bg} ${SECTION_THEMES.writing.border} border-2 shadow-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${SECTION_THEMES.writing.light}`}>
                      <PenTool className={`w-6 h-6 ${SECTION_THEMES.writing.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("module.writing")}</h2>
                      <p className="text-gray-600 font-normal">{t("module.writingPractice")}</p>
                    </div>
                  </span>
                  {progress.writing && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {module.module_writing?.[0]?.content && (
                  <div className="prose max-w-none">
                    <p>{getContent("writingContent")}</p>
                  </div>
                )}

                {module.module_writing?.[0]?.exercises && module.module_writing[0].exercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.writingExercises")}</h4>
                    <div className="space-y-4">
                      {module.module_writing[0].exercises.map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4 bg-white/80 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">Exercise {index + 1}</h5>
                            <div className="flex gap-2">
                              <Badge variant="outline">{exercise.type}</Badge>
                              {(exercise.min_words || exercise.max_words) && (
                                <Badge variant="secondary">{`${exercise.min_words}-${exercise.max_words} words`}</Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className={`font-medium ${SECTION_THEMES.writing.icon}`}>{t("module.prompt")}</p>
                            <p>{language === "ru" && exercise.prompt_ru ? exercise.prompt_ru : exercise.prompt}</p>
                          </div>
                          {exercise.hint && (
                            <div>
                              <p className="font-medium text-gray-600">{t("module.hints")}</p>
                              <p className="text-sm text-gray-600">
                                {language === "ru" && exercise.hint_ru ? exercise.hint_ru : exercise.hint}
                              </p>
                            </div>
                          )}
                          <textarea
                            className={`w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-${
                              SECTION_THEMES.writing.icon.split("-")[1]
                            }-500 focus:border-transparent`}
                            placeholder={t("module.writeResponse")}
                          />
                          <Button variant="outline">{t("module.submitWriting")}</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("reading")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("module.previousReading")}
                  </Button>
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {!progress.writing ? (
                      <Button
                        onClick={() => markSectionComplete("writing")}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t("module.markAsComplete")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("module.sectionComplete")}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("cultural")}
                    className="w-full sm:w-auto order-3"
                  >
                    {t("module.nextCulture")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cultural Section */}
          <TabsContent value="cultural">
            <Card className={`${SECTION_THEMES.cultural.bg} ${SECTION_THEMES.cultural.border} border-2 shadow-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${SECTION_THEMES.cultural.light}`}>
                      <Globe className={`w-6 h-6 ${SECTION_THEMES.cultural.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{t("module.cultural")}</h2>
                      <p className="text-gray-600 font-normal">{t("module.culturalNote")}</p>
                    </div>
                  </span>
                  {progress.cultural && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {module.module_cultural?.[0]?.content && (
                  <div className="prose max-w-none">
                    <div className={`${SECTION_THEMES.cultural.light} p-6 rounded-xl`}>
                      <p>{getContent("culturalContent")}</p>
                    </div>
                  </div>
                )}

                {module.module_cultural?.[0]?.souvenir_name && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="w-8 h-8 text-purple-600" />
                      <div>
                        <h4 className="text-xl font-semibold text-purple-800">
                          {t("module.digitalSouvenir")}
                          {language === "ru" && module.module_cultural[0].souvenir_name_ru
                            ? module.module_cultural[0].souvenir_name_ru
                            : module.module_cultural[0].souvenir_name}
                        </h4>
                        <p className="text-purple-600">
                          {language === "ru" && module.module_cultural[0].souvenir_description_ru
                            ? module.module_cultural[0].souvenir_description_ru
                            : module.module_cultural[0].souvenir_description}
                        </p>
                      </div>
                    </div>
                    {module.module_cultural[0].souvenir_download_url && (
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Trophy className="w-4 h-4 mr-2" />
                        {t("module.downloadSouvenir")}
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("writing")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("module.previousWriting")}
                  </Button>
                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    {!progress.cultural ? (
                      <Button
                        onClick={() => markSectionComplete("cultural")}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t("module.markAsComplete")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{t("module.sectionComplete")}</span>
                      </div>
                    )}
                  </div>
                  {allSectionsComplete && (
                    <Button
                      onClick={() => router.push(`/modules/${moduleId}/quiz`)}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 flex items-center gap-2 text-white"
                    >
                      {t("module.takeQuiz")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {allSectionsComplete && (
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-xl">
            <CardContent className="p-4 sm:p-8 text-center">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-yellow-600 mb-4 sm:mb-6" />
              <h3 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3 sm:mb-4">
                {t("module.congratulations")}
              </h3>
              <p className="text-green-700 mb-4 sm:mb-6 text-base sm:text-lg px-2">
                {t("module.completedAllSections")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                <Button
                  onClick={() => router.push(`/modules/${moduleId}/quiz`)}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg w-full sm:w-auto"
                  size="lg"
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">{t("module.takeFinalQuiz")}</span>
                </Button>
                {moduleId < 1 && (
                  <Button
                    onClick={() => router.push(`/modules/${moduleId + 1}`)}
                    variant="outline"
                    className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm w-full sm:w-auto"
                    size="lg"
                  >
                    <span className="text-sm sm:text-base">{t("module.nextModule")}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}