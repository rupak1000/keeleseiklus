"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import VocabularyCard from "@/components/vocabulary-card"
import { ExerciseComponent } from "@/components/exercise-component"
import AudioPlayer from "@/components/audio-player"
// Remove the useTranslation import since we're using the custom language context

// Import module data - this should sync with admin data
import { getModules, type Module } from "@/data/modules"

interface ModuleProgress {
  [sectionId: string]: boolean
}

interface User {
  name: string
  email: string
  level: string
  completedModules: number | number[]
  completedModulesList?: number[]
  loginTime: string
  isAdmin: boolean
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
]

// Section color themes matching the design
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
}

export default function ModulePage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  // Remove the useTranslation hook usage:
  const moduleId = Number.parseInt(params.id as string)

  const [progress, setProgress] = useState<ModuleProgress>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [module, setModule] = useState<Module | null>(null)
  const [currentTab, setCurrentTab] = useState("story")

  useEffect(() => {
    // Load module data - check both admin saved data and default data
    // Load module data - use consistent getModules function
    const loadModuleData = () => {
      try {
        const allModules = getModules()
        const foundModule = allModules.find((m: Module) => m.id === moduleId)

        if (foundModule) {
          setModule(foundModule)
        } else {
          console.error(`Module ${moduleId} not found`)
        }
      } catch (error) {
        console.error("Error loading module data:", error)
        // Fallback to default modules
        const allModules = getModules()
        const foundModule = allModules.find((m: Module) => m.id === moduleId)
        setModule(foundModule || null)
      }
    }

    loadModuleData()

    // Check authentication status
    const checkAuth = () => {
      try {
        const adminData = localStorage.getItem("adminLoginData") || sessionStorage.getItem("adminLoginData")
        const studentData = localStorage.getItem("studentLoginData") || sessionStorage.getItem("studentLoginData")
        const isLoggedInFlag = localStorage.getItem("isLoggedIn") || sessionStorage.getItem("isLoggedIn")
        const userData = localStorage.getItem("user") || sessionStorage.getItem("user")

        if (adminData || studentData || isLoggedInFlag === "true") {
          setIsLoggedIn(true)
          setUserType(adminData ? "admin" : "student")

          if (userData) {
            try {
              const parsedUser = JSON.parse(userData)
              // Normalize completedModules to always be a number
              if (Array.isArray(parsedUser.completedModules)) {
                parsedUser.completedModules = parsedUser.completedModules.length
              }
              setUser(parsedUser)
            } catch (e) {
              console.error("Error parsing user data:", e)
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      }
    }

    checkAuth()

    // Load progress from storage
    const loadProgress = () => {
      try {
        const savedProgress =
          localStorage.getItem(`module-${moduleId}-progress`) || sessionStorage.getItem(`module-${moduleId}-progress`)
        if (savedProgress) {
          setProgress(JSON.parse(savedProgress))
        }
      } catch (error) {
        console.error("Progress load error:", error)
      }
    }

    loadProgress()
    setIsLoading(false)
  }, [moduleId])

  const { t } = useLanguage()

  // Check if module is accessible
  const isModuleAccessible = () => {
    // Modules 1-3 are free for everyone
    if (moduleId <= 3) return true
    // Other modules require login
    return isLoggedIn
  }

  // Safe content getter with multi-language support
  const getContent = (key: string, fallback = "") => {
    if (!module) return fallback

    try {
      // Handle story content specifically
      if (key === "story" && module.story) {
        const storyText = language === "ru" && module.story.text_ru ? module.story.text_ru : module.story.text
        return storyText || fallback
      }

      // Handle other nested content
      const sections = ["grammar", "pronunciation", "listening", "speaking", "reading", "writing", "cultural"]

      for (const section of sections) {
        if (key.startsWith(section) && (module as any)[section]) {
          const sectionData = (module as any)[section]
          const subKey = key.replace(section, "").toLowerCase()

          if (subKey === "title" || subKey === "") {
            const title = language === "ru" && sectionData.title_ru ? sectionData.title_ru : sectionData.title
            return title || fallback
          }

          if (subKey === "content") {
            const content = language === "ru" && sectionData.content_ru ? sectionData.content_ru : sectionData.content
            return content || fallback
          }

          if (subKey === "hint") {
            const hint = language === "ru" && sectionData.hint_ru ? sectionData.hint_ru : sectionData.hint
            return hint || fallback
          }
        }
      }

      // Direct property access
      const directValue = (module as any)[key]
      if (typeof directValue === "string") {
        return directValue
      }

      return fallback
    } catch (error) {
      console.error(`Error getting content for key: ${key}`, error)
      return fallback
    }
  }

  const markSectionComplete = (sectionId: string) => {
    const newProgress = { ...progress, [sectionId]: true }
    setProgress(newProgress)

    // Save to both localStorage and sessionStorage for reliability
    try {
      localStorage.setItem(`module-${moduleId}-progress`, JSON.stringify(newProgress))
    } catch (e) {
      sessionStorage.setItem(`module-${moduleId}-progress`, JSON.stringify(newProgress))
    }

    // Update user progress in storage
    updateUserProgress(newProgress)

    // Auto-advance to next tab
    const currentIndex = SECTION_ORDER.indexOf(sectionId)
    if (currentIndex < SECTION_ORDER.length - 1) {
      const nextSection = SECTION_ORDER[currentIndex + 1]
      setCurrentTab(nextSection)
    } else {
      // All sections complete, check if module should be marked complete
      const allComplete = SECTION_ORDER.every((section) => newProgress[section])
      if (allComplete) {
        markModuleComplete()
      }
    }
  }

  const updateUserProgress = (moduleProgress: ModuleProgress) => {
    try {
      const completedSections = Object.values(moduleProgress).filter(Boolean).length
      const isModuleComplete = completedSections >= SECTION_ORDER.length

      if (isModuleComplete && user) {
        // Get current user data
        const currentUserData = localStorage.getItem("user") || sessionStorage.getItem("user")
        if (currentUserData) {
          const parsedUser = JSON.parse(currentUserData)

          // Get current completed modules as array
          let completedModulesArray: number[] = []

          if (Array.isArray(parsedUser.completedModulesList)) {
            completedModulesArray = [...parsedUser.completedModulesList]
          } else if (Array.isArray(parsedUser.completedModules)) {
            completedModulesArray = [...parsedUser.completedModules]
          } else if (typeof parsedUser.completedModules === "number" && parsedUser.completedModules > 0) {
            // Convert number to array (assuming sequential completion)
            completedModulesArray = Array.from({ length: parsedUser.completedModules }, (_, i) => i + 1)
          }

          // Add current module if not already completed
          if (!completedModulesArray.includes(moduleId)) {
            completedModulesArray.push(moduleId)
            completedModulesArray.sort((a, b) => a - b)

            const updatedUser = {
              ...parsedUser,
              completedModules: completedModulesArray.length, // Store as count for compatibility
              completedModulesList: completedModulesArray, // Store as array for detailed tracking
              lastActive: new Date().toISOString().split("T")[0],
            }

            // Update both localStorage and sessionStorage
            localStorage.setItem("user", JSON.stringify(updatedUser))
            sessionStorage.setItem("user", JSON.stringify(updatedUser))
            setUser(updatedUser)

            // Also update admin students data if user is a student
            updateAdminStudentData(updatedUser, completedModulesArray)

            // Dispatch a custom event to notify other pages of the update
            window.dispatchEvent(
              new CustomEvent("userProgressUpdated", {
                detail: {
                  moduleId,
                  completedModules: completedModulesArray.length,
                  completedModulesList: completedModulesArray,
                },
              }),
            )

            console.log(`Module ${moduleId} completed. Total completed: ${completedModulesArray.length}`)
          }
        }
      }
    } catch (error) {
      console.error("Error updating user progress:", error)
    }
  }

  const updateAdminStudentData = (updatedUser: User, completedModulesArray: number[]) => {
    try {
      // Update admin students data
      const adminStudents = localStorage.getItem("adminStudents")
      if (adminStudents) {
        const students = JSON.parse(adminStudents)
        const updatedStudents = students.map((student: any) => {
          if (student.email === updatedUser.email) {
            return {
              ...student,
              completedModules: completedModulesArray,
              progress: Math.round((completedModulesArray.length / 40) * 100),
              lastActive: new Date().toISOString().split("T")[0],
            }
          }
          return student
        })
        localStorage.setItem("adminStudents", JSON.stringify(updatedStudents))
      }
    } catch (error) {
      console.error("Error updating admin student data:", error)
    }
  }

  const markModuleComplete = () => {
    // Trigger a final progress update
    updateUserProgress(progress)

    // Show completion message and redirect to next module or modules page
    setTimeout(() => {
      if (moduleId < 40) {
        // Go to next module automatically
        router.push(`/modules/${moduleId + 1}`)
      } else {
        // Go to final exam or modules page
        router.push("/exam")
      }
    }, 1500) // Reduced time for better UX
  }

  const calculateProgress = () => {
    const totalSections = SECTION_ORDER.length
    const completedSections = Object.values(progress).filter(Boolean).length
    return Math.round((completedSections / totalSections) * 100)
  }

  const getCurrentTheme = () => {
    return SECTION_THEMES[currentTab as keyof typeof SECTION_THEMES] || SECTION_THEMES.story
  }

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
    )
  }

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{t("module.moduleNotFound")}</h1>
            <p className="text-gray-600 mb-4">{t("module.moduleNotFoundDesc")}</p>
            <Button onClick={() => router.push("/modules")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Modules
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
                Back to Modules
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const allSectionsComplete = SECTION_ORDER.every((section) => progress[section])
  const currentTheme = getCurrentTheme()

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-all duration-500`}>
      <div className="container mx-auto px-4 py-8">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => router.push("/modules")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Modules
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
            {language === "ru" && (module as any).titleRu ? (module as any).titleRu : module.title}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {language === "ru" && (module as any).subtitleRu ? (module as any).subtitleRu : module.subtitle}
          </p>
          <p className="text-gray-500 mb-6">
            {language === "ru" && (module as any).descriptionRu ? (module as any).descriptionRu : module.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-700">Module Progress</span>
              <span className="text-lg font-bold text-blue-600">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-3" />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            {allSectionsComplete && (
              <Button
                onClick={() => router.push(`/modules/${moduleId}/quiz`)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Take Quiz
              </Button>
            )}
          </div>
        </div>

        {/* Module Content Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto p-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            <TabsTrigger
              value="story"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${SECTION_THEMES.story.tab}`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-medium">{t("module.story")}</span>
              {progress.story && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="vocabulary"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${SECTION_THEMES.vocabulary.tab}`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">{t("module.vocabulary")}</span>
              {progress.vocabulary && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="grammar"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${SECTION_THEMES.grammar.tab}`}
            >
              <PenTool className="w-5 h-5" />
              <span className="text-xs font-medium">{t("module.grammar")}</span>
              {progress.grammar && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="pronunciation"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${SECTION_THEMES.pronunciation.tab}`}
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-xs font-medium">{t("module.pronunciation")}</span>
              {progress.pronunciation && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="listening"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${SECTION_THEMES.listening.tab}`}
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-xs font-medium">{t("module.listening")}</span>
              {progress.listening && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="speaking"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${SECTION_THEMES.speaking.tab}`}
            >
              <Mic className="w-5 h-5" />
              <span className="text-xs font-medium">{t("module.speaking")}</span>
              {progress.speaking && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="reading"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${SECTION_THEMES.reading.tab}`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-medium">{t("module.reading")}</span>
              {progress.reading && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="writing"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${SECTION_THEMES.writing.tab}`}
            >
              <PenTool className="w-5 h-5" />
              <span className="text-xs font-medium">{t("module.writing")}</span>
              {progress.writing && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="cultural"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${SECTION_THEMES.cultural.tab}`}
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-medium">{t("module.cultural")}</span>
              {progress.cultural && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
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
                  {/* Main Video Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Video Player */}
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
                        <p className="text-gray-300 text-sm mt-2">Tallinn's Old Town - Story</p>
                      </div>
                    </div>

                    {/* Your Mission */}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🎯</span>
                        </div>
                        <h3 className="text-lg font-semibold text-purple-800">{t("module.yourMission")}</h3>
                      </div>
                      <p className="text-purple-700">
                        Your mission: greet Liis, introduce yourself, and use polite phrases to connect in Tallinn's
                        vibrant atmosphere.
                      </p>
                    </div>

                    {/* Story Transcript */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{t("module.storyTranscript")}</h3>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          {t("module.showTranslation")}
                        </button>
                      </div>
                      <div className="space-y-4 text-gray-700">
                        <p>
                          You step into Tallinn's Old Town, where cobblestone streets echo with history. The scent of
                          fresh kohuke wafts from a café near Alexander Nevsky Cathedral. Liis, your guide, waves and
                          begins a warm conversation.
                        </p>
                        <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                          <p>
                            <strong>Liis:</strong> Tere! Minu nimi on Liis. Ma olen õpilane. Mis sinu nimi on?
                          </p>
                          <p>
                            <strong>Me:</strong> Tere! Minu nimi on [your name]. Ma olen õpilane/töötan. Kuidas läheb?
                          </p>
                          <p>
                            <strong>Liis:</strong> Hästi, aitäh! Ma olen õnnelik, sest Tallinn on ilus linn. Sina oled
                            õnnelik?
                          </p>
                          <p>
                            <strong>Me:</strong> Jah, ma olen õnnelik. See kohvik on tore. Kas sina oled?
                          </p>
                          <p>
                            <strong>Liis:</strong> Ma olen sinu giid! Ma armastan kohvikuid ja raamatuid. Kas sa tahad
                            kohvi? Palun, tule sisse!
                          </p>
                          <p>
                            <strong>Me:</strong> Aitäh! Vabandust, ma pean hiljem minema. Nägemist!
                          </p>
                          <p>
                            <strong>Liis:</strong> Head aega! Tule varsti tagasi!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Learning Hint */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">💡</span>
                        </div>
                        <h3 className="text-lg font-semibold text-blue-800">{t("module.learningHint")}</h3>
                      </div>
                      <p className="text-blue-700">
                        Read the dialogue aloud (use MP3) to feel the café setting. Practice greetings (tere, aitäh) and
                        note emotions (õnnelik).
                      </p>
                    </div>

                    {/* Complete Button */}
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

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("module.quickActions")}</h3>
                      <div className="space-y-3">
                        <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all">
                          <Volume2 className="w-4 h-4" />
                          {t("module.playModuleAudio")}
                        </button>
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

                    {/* Cultural Souvenir */}
                    <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("module.culturalSouvenir")}</h3>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">🧀</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">Kohuke Recipe</h4>
                        <p className="text-gray-600 text-sm mb-4">Learn to make Estonia's beloved curd snack</p>
                        <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                          {t("module.downloadSouvenir")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
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
                      <h2 className="text-2xl font-bold">Vocabulary</h2>
                      <p className="text-gray-600 font-normal">{t("module.learnEssential")}</p>
                    </div>
                  </span>
                  {progress.vocabulary && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {module.vocabulary && module.vocabulary.length > 0 ? (
                    module.vocabulary.map((item, index) => (
                      <VocabularyCard key={index} item={item} language={language} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>{t("module.noVocabulary")}</p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
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
                      <h2 className="text-2xl font-bold">Grammar</h2>
                      <p className="text-gray-600 font-normal">{t("module.masterGrammar")}</p>
                    </div>
                  </span>
                  {progress.grammar && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grammar Explanation */}
                <div className="prose max-w-none">
                  <div className={`${SECTION_THEMES.grammar.light} p-6 rounded-xl`}>
                    <h3 className="text-lg font-semibold mb-3">Personal Pronouns and Verb 'Olema' (to be)</h3>
                    <p>
                      Personal pronouns are used to indicate the subject of a sentence. Estonian pronouns are
                      straightforward, with no gender distinctions for third person (tema for he/she). The verb 'olema'
                      (to be) is essential for introductions and descriptions.
                    </p>
                  </div>
                </div>

                {/* Grammar Rules */}
                {module.grammar?.rules && module.grammar.rules.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.grammarRules")}</h4>
                    <ul className="space-y-2">
                      {module.grammar.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span
                            className={`w-6 h-6 ${SECTION_THEMES.grammar.light} ${SECTION_THEMES.grammar.icon} rounded-full flex items-center justify-center text-sm font-medium mt-0.5`}
                          >
                            {index + 1}
                          </span>
                          <span>
                            {language === "ru" && module.grammar.rules_ru?.[index]
                              ? module.grammar.rules_ru[index]
                              : rule}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Grammar Examples */}
                {module.grammar?.examples && module.grammar.examples.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.examples")}</h4>
                    <div className="space-y-3">
                      {module.grammar.examples.map((example, index) => (
                        <div key={index} className={`${SECTION_THEMES.grammar.light} p-4 rounded-xl`}>
                          <p className={`font-medium ${SECTION_THEMES.grammar.accent}`}>{example.estonian}</p>
                          <p className={`${SECTION_THEMES.grammar.icon} italic`}>
                            {language === "ru" && example.russian ? example.russian : example.english}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grammar Exercises */}
                {module.grammar?.exercises && module.grammar.exercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.practiceExercises")}</h4>
                    <div className="space-y-4">
                      {module.grammar.exercises.map((exercise, index) => (
                        <ExerciseComponent
                          key={index}
                          exercise={exercise}
                          exerciseNumber={index + 1}
                          language={language}
                          onComplete={(correct) => {
                            if (correct) {
                              console.log(`Grammar exercise ${index + 1} completed correctly`)
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
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
                      <h2 className="text-2xl font-bold">Pronunciation</h2>
                      <p className="text-gray-600 font-normal">{t("module.masterPronunciation")}</p>
                    </div>
                  </span>
                  {progress.pronunciation && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none mb-6">
                  <p>
                    {getContent(
                      "pronunciationContent",
                      "Learn proper Estonian pronunciation with audio guides and practice exercises.",
                    )}
                  </p>
                </div>

                {/* Focus Areas */}
                <div className={`${SECTION_THEMES.pronunciation.light} p-6 rounded-xl`}>
                  <h4 className={`font-semibold ${SECTION_THEMES.pronunciation.accent} mb-3`}>
                    {t("module.focusAreas")}
                  </h4>
                  <p className={SECTION_THEMES.pronunciation.accent}>
                    Vowels e (tere – short 'eh'), õ (õnnelik – 'u-o' blend), first-syllable stress (TE-re)
                  </p>
                </div>

                {/* Pronunciation Exercises */}
                {module.pronunciation?.exercises && module.pronunciation.exercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.pronunciationExercises")}</h4>
                    <div className="space-y-4">
                      {module.pronunciation.exercises.map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-white/80 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{exercise.instruction || `Exercise ${index + 1}`}</h5>
                            <Badge variant="outline">{exercise.type}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {language === "ru" && exercise.instruction_ru
                              ? exercise.instruction_ru
                              : exercise.instruction}
                          </p>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="font-medium">{exercise.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Minimal Pairs */}
                {module.pronunciation?.minimalPairs && module.pronunciation.minimalPairs.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.minimalPairs")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {module.pronunciation.minimalPairs.map((pair, index) => (
                        <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                          <div className="text-center">
                            <p className="font-medium text-lg">{pair}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
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
                      <h2 className="text-2xl font-bold">Listening Comprehension</h2>
                      <p className="text-gray-600 font-normal">{t("module.practiceUnderstanding")}</p>
                    </div>
                  </span>
                  {progress.listening && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <p>
                    {getContent(
                      "listeningContent",
                      "Improve your Estonian listening skills with audio exercises and comprehension questions.",
                    )}
                  </p>
                </div>

                {/* Audio Player */}
                <div className={`${SECTION_THEMES.listening.light} p-6 rounded-xl text-center`}>
                  <Button className={`${SECTION_THEMES.listening.button} text-white shadow-lg mb-4`}>
                    <Volume2 className="w-5 h-5 mr-2" />
                    {t("module.playAudioDialogue")}
                  </Button>
                  <p className={SECTION_THEMES.listening.accent}>{t("module.listenCarefully")}</p>
                </div>

                {/* Audio Player */}
                {module.listening?.audioUrl && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.listenToAudio")}</h4>
                    <AudioPlayer src={module.listening.audioUrl} title="Listening Exercise" />
                  </div>
                )}

                {/* Transcript */}
                {module.listening?.transcript && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.transcript")}</h4>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                      <p>
                        {language === "ru" && module.listening.transcript_ru
                          ? module.listening.transcript_ru
                          : module.listening.transcript}
                      </p>
                    </div>
                  </div>
                )}

                {/* Listening Questions */}
                {module.listening?.questions && module.listening.questions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.comprehensionQuestions")}</h4>
                    <div className="space-y-4">
                      {module.listening.questions.map((question, index) => (
                        <ExerciseComponent
                          key={index}
                          exercise={question}
                          exerciseNumber={index + 1}
                          language={language}
                          onComplete={(correct) => {
                            if (correct) {
                              console.log(`Listening question ${index + 1} completed correctly`)
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
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
                      <h2 className="text-2xl font-bold">Speaking Practice</h2>
                      <p className="text-gray-600 font-normal">{t("module.practicePronunciation")}</p>
                    </div>
                  </span>
                  {progress.speaking && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none mb-6">
                  <p>
                    {getContent(
                      "speakingContent",
                      "Practice speaking Estonian with guided exercises and conversation prompts.",
                    )}
                  </p>
                </div>

                {/* Speaking Exercise */}
                <div className={`${SECTION_THEMES.speaking.light} p-6 rounded-xl`}>
                  <h4 className={`font-semibold ${SECTION_THEMES.speaking.accent} mb-3`}>Exercise 1: role play</h4>
                  <p className={`${SECTION_THEMES.speaking.accent} mb-4`}>
                    Role-Play Script: Meet Liis at a Tallinn café. Greet and ask her name.
                  </p>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg mb-4">
                    <p className="font-medium">Script:</p>
                  </div>
                </div>

                {/* Speaking Exercises */}
                {module.speaking?.exercises && module.speaking.exercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.speakingExercises")}</h4>
                    <div className="space-y-4">
                      {module.speaking.exercises.map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4 bg-white/80 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">Exercise {index + 1}</h5>
                            <Badge variant="outline">{exercise.type}</Badge>
                          </div>
                          <div>
                            <p className={`font-medium ${SECTION_THEMES.speaking.icon}`}>{t("module.prompt")}</p>
                            <p>{language === "ru" && exercise.prompt_ru ? exercise.prompt_ru : exercise.prompt}</p>
                          </div>
                          {exercise.expectedResponse && (
                            <div>
                              <p className="font-medium text-green-600">{t("module.expectedResponse")}</p>
                              <p className="italic">{exercise.expectedResponse}</p>
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

                {/* Navigation */}
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
                      <h2 className="text-2xl font-bold">Reading Comprehension</h2>
                      <p className="text-gray-600 font-normal">{t("module.readAndUnderstand")}</p>
                    </div>
                  </span>
                  {progress.reading && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reading Text */}
                <div>
                  <h4 className="font-semibold mb-3">{t("module.readingText")}</h4>
                  <div className={`${SECTION_THEMES.reading.light} p-6 rounded-xl`}>
                    <div className="prose max-w-none">
                      <p className="text-lg leading-relaxed">
                        Tere! Mina olen Liis. Ma olen õpilane. Ma olen õnnelik, sest Tallinn on ilus linn. Ma armastan
                        kohvikuid. Kuidas läheb? Mis sinu nimi on? Kes sina oled? Palun, ütle mulle! Aitäh! Vabandust,
                        ma pean minema. Nägemist!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reading Questions */}
                {module.reading?.questions && module.reading.questions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.comprehensionQuestions")}</h4>
                    <div className="space-y-4">
                      {module.reading.questions.map((question, index) => (
                        <ExerciseComponent
                          key={index}
                          exercise={question}
                          exerciseNumber={index + 1}
                          language={language}
                          onComplete={(correct) => {
                            if (correct) {
                              console.log(`Reading question ${index + 1} completed correctly`)
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
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
                      <h2 className="text-2xl font-bold">Writing Practice</h2>
                      <p className="text-gray-600 font-normal">{t("module.writingPractice")}</p>
                    </div>
                  </span>
                  {progress.writing && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <p>
                    {getContent(
                      "writingContent",
                      "Develop your Estonian writing skills through guided exercises and creative prompts.",
                    )}
                  </p>
                </div>

                {/* Writing Exercise */}
                <div className={`${SECTION_THEMES.writing.light} p-6 rounded-xl`}>
                  <h4 className={`font-semibold ${SECTION_THEMES.writing.accent} mb-3`}>Writing Exercise 1: guided</h4>
                  <p className={`${SECTION_THEMES.writing.accent} mb-4`}>
                    Write 5 sentences introducing yourself using the vocabulary from this module.
                  </p>
                  <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg mb-2">
                    <p className="text-sm font-medium">Word limit: 50 words</p>
                  </div>
                </div>

                {/* Writing Exercises */}
                {module.writing?.exercises && module.writing.exercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("module.writingExercises")}</h4>
                    <div className="space-y-4">
                      {module.writing.exercises.map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4 bg-white/80 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">Exercise {index + 1}</h5>
                            <div className="flex gap-2">
                              <Badge variant="outline">{exercise.type}</Badge>
                              {exercise.wordLimit && <Badge variant="secondary">{exercise.wordLimit} words</Badge>}
                            </div>
                          </div>
                          <div>
                            <p className={`font-medium ${SECTION_THEMES.writing.icon}`}>{t("module.prompt")}</p>
                            <p>{language === "ru" && exercise.prompt_ru ? exercise.prompt_ru : exercise.prompt}</p>
                          </div>
                          {exercise.hints && exercise.hints.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-600">{t("module.hints")}</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {exercise.hints.map((hint, hintIndex) => (
                                  <li key={hintIndex}>
                                    {language === "ru" && exercise.hints_ru?.[hintIndex]
                                      ? exercise.hints_ru[hintIndex]
                                      : hint}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <textarea
                            className={`w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-${SECTION_THEMES.writing.icon.split("-")[1]}-500 focus:border-transparent`}
                            placeholder={t("module.writeResponse")}
                          />
                          <Button variant="outline">{t("module.submitWriting")}</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
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
                      <h2 className="text-2xl font-bold">Cultural Note</h2>
                      <p className="text-gray-600 font-normal">{t("module.culturalNote")}</p>
                    </div>
                  </span>
                  {progress.cultural && <CheckCircle className="w-6 h-6 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <div className={`${SECTION_THEMES.cultural.light} p-6 rounded-xl`}>
                    <p>
                      {getContent(
                        "culturalContent",
                        "Discover the rich culture and traditions of Estonia through this immersive learning experience.",
                      )}
                    </p>
                  </div>
                </div>

                {/* Digital Souvenir */}
                {module.cultural?.souvenir && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="w-8 h-8 text-purple-600" />
                      <div>
                        <h4 className="text-xl font-semibold text-purple-800">
                          {t("module.digitalSouvenir")}
                          {language === "ru" && module.cultural.souvenir.name_ru
                            ? module.cultural.souvenir.name_ru
                            : module.cultural.souvenir.name}
                        </h4>
                        <p className="text-purple-600">
                          {language === "ru" && module.cultural.souvenir.description_ru
                            ? module.cultural.souvenir.description_ru
                            : module.cultural.souvenir.description}
                        </p>
                      </div>
                    </div>
                    {module.cultural.souvenir.downloadUrl && (
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Trophy className="w-4 h-4 mr-2" />
                        {t("module.downloadSouvenir")}
                      </Button>
                    )}
                  </div>
                )}

                {/* Navigation */}
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
                      Take Quiz
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Module Completion */}
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
                {moduleId < 40 && (
                  <Button
                    onClick={() => router.push(`/modules/${moduleId + 1}`)}
                    variant="outline"
                    className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm w-full sm:w-auto"
                    size="lg"
                  >
                    <span className="text-sm sm:text-base">Next Module</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
