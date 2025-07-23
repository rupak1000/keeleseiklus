"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Trophy, Star, CheckCircle, Lock, Calendar, Target, Award, Zap } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  category: "learning" | "progress" | "social" | "special"
  earned: boolean
  earnedDate?: string
  requirement: string
  points: number
  rarity: "common" | "rare" | "epic" | "legendary"
}

const achievements: Achievement[] = [
  {
    id: 1,
    title: "First Steps",
    description: "Complete your first module",
    icon: "🎯",
    category: "learning",
    earned: true,
    earnedDate: "2024-01-15",
    requirement: "Complete Module 1",
    points: 100,
    rarity: "common",
  },
  {
    id: 2,
    title: "Conversation Starter",
    description: "Master basic greetings and introductions",
    icon: "💬",
    category: "learning",
    earned: true,
    earnedDate: "2024-01-16",
    requirement: "Complete greetings module with 90%+ score",
    points: 150,
    rarity: "common",
  },
  {
    id: 3,
    title: "Daily Routine Master",
    description: "Learn time and routine vocabulary",
    icon: "⏰",
    category: "learning",
    earned: true,
    earnedDate: "2024-01-18",
    requirement: "Complete daily routines module",
    points: 150,
    rarity: "common",
  },
  {
    id: 4,
    title: "Family Bonds",
    description: "Master family vocabulary and relationships",
    icon: "👨‍👩‍👧‍👦",
    category: "learning",
    earned: false,
    requirement: "Complete family module with perfect score",
    points: 200,
    rarity: "rare",
  },
  {
    id: 5,
    title: "Market Explorer",
    description: "Navigate Estonian markets like a local",
    icon: "🛒",
    category: "learning",
    earned: false,
    requirement: "Complete shopping module and cultural note",
    points: 200,
    rarity: "rare",
  },
  {
    id: 6,
    title: "Nature Guide",
    description: "Navigate Estonian landscapes and directions",
    icon: "🌲",
    category: "learning",
    earned: false,
    requirement: "Complete Lahemaa National Park module",
    points: 250,
    rarity: "rare",
  },
  {
    id: 7,
    title: "Culture Enthusiast",
    description: "Deep dive into Estonian traditions",
    icon: "🎭",
    category: "learning",
    earned: false,
    requirement: "Complete 5 cultural notes and download 3 souvenirs",
    points: 300,
    rarity: "epic",
  },
  {
    id: 8,
    title: "Speed Learner",
    description: "Complete 3 modules in one day",
    icon: "⚡",
    category: "progress",
    earned: false,
    requirement: "Complete 3 modules within 24 hours",
    points: 400,
    rarity: "epic",
  },
  {
    id: 9,
    title: "Perfect Student",
    description: "Score 100% on 5 consecutive quizzes",
    icon: "🌟",
    category: "progress",
    earned: false,
    requirement: "Achieve perfect scores on 5 quizzes in a row",
    points: 500,
    rarity: "epic",
  },
  {
    id: 10,
    title: "Language Master",
    description: "Complete all 40 modules",
    icon: "🏆",
    category: "progress",
    earned: false,
    requirement: "Complete all 40 modules with 80%+ average",
    points: 1000,
    rarity: "legendary",
  },
  {
    id: 11,
    title: "Streak Champion",
    description: "Maintain a 30-day learning streak",
    icon: "🔥",
    category: "progress",
    earned: false,
    requirement: "Study for 30 consecutive days",
    points: 600,
    rarity: "epic",
  },
  {
    id: 12,
    title: "Community Helper",
    description: "Share 10 posts in the Travel Journal",
    icon: "🤝",
    category: "social",
    earned: false,
    requirement: "Share 10 learning experiences",
    points: 300,
    rarity: "rare",
  },
]

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    earnedAchievements: 0,
    currentStreak: 7,
    totalModules: 3,
  })

  const { t } = useLanguage()

  useEffect(() => {
    // Calculate user stats
    const earned = achievements.filter((a) => a.earned)
    const totalPoints = earned.reduce((sum, a) => sum + a.points, 0)

    setUserStats((prev) => ({
      ...prev,
      totalPoints,
      earnedAchievements: earned.length,
    }))
  }, [])

  const categories = [
    { id: "all", label: t("achievements.all"), icon: Trophy },
    { id: "learning", label: t("achievements.learning"), icon: Star },
    { id: "progress", label: t("achievements.progress"), icon: Target },
    { id: "social", label: t("achievements.social"), icon: Award },
    { id: "special", label: t("achievements.special"), icon: Zap },
  ]

  const filteredAchievements =
    selectedCategory === "all" ? achievements : achievements.filter((a) => a.category === selectedCategory)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getProgressToNext = () => {
    const nextAchievement = achievements.find((a) => !a.earned)
    if (!nextAchievement) return { achievement: null, progress: 100 }

    // Mock progress calculation based on achievement type
    let progress = 0
    if (nextAchievement.id === 4) progress = 75
    else if (nextAchievement.id === 5) progress = 50

    return { achievement: nextAchievement, progress }
  }

  const { achievement: nextAchievement, progress: nextProgress } = getProgressToNext()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{t("achievements.title")}</h1>
          <p className="text-gray-600 mb-6">{t("achievements.description")}</p>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{userStats.totalPoints}</div>
                <div className="text-xs sm:text-sm text-gray-600">{t("achievements.totalPoints")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{userStats.earnedAchievements}</div>
                <div className="text-xs sm:text-sm text-gray-600">{t("achievements.title")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{userStats.currentStreak}</div>
                <div className="text-xs sm:text-sm text-gray-600">{t("achievements.dayStreak")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{userStats.totalModules}/40</div>
                <div className="text-xs sm:text-sm text-gray-600">{t("achievements.modules")}</div>
              </CardContent>
            </Card>
          </div>

          {/* Next Achievement Progress */}
          {nextAchievement && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5" />
                  {t("achievements.nextAchievement")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{nextAchievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{nextAchievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{nextAchievement.description}</p>
                    <div className="flex items-center gap-4">
                      <Progress value={nextProgress} className="flex-1" />
                      <span className="text-sm font-medium">{nextProgress}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{nextAchievement.requirement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`transition-all hover:shadow-lg cursor-pointer ${
                achievement.earned ? "border-green-200 bg-green-50" : "hover:border-gray-300"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl sm:text-3xl ${achievement.earned ? "" : "grayscale opacity-50"}`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <CardTitle
                        className={`text-base sm:text-lg ${achievement.earned ? "text-green-800" : "text-gray-700"}`}
                      >
                        {achievement.title}
                      </CardTitle>
                      <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                  {achievement.earned ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm mb-3">{achievement.description}</CardDescription>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Requirement:</span>
                    <span className="font-medium text-blue-600">{achievement.points} pts</span>
                  </div>
                  <p className="text-xs text-gray-500">{achievement.requirement}</p>

                  {achievement.earned && achievement.earnedDate && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <Calendar className="w-3 h-3" />
                      Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievement Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("achievements.statistics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["common", "rare", "epic", "legendary"].map((rarity) => {
                const total = achievements.filter((a) => a.rarity === rarity).length
                const earned = achievements.filter((a) => a.rarity === rarity && a.earned).length
                const percentage = total > 0 ? Math.round((earned / total) * 100) : 0

                return (
                  <div key={rarity} className="text-center">
                    <div className={`text-lg font-bold ${getRarityColor(rarity).split(" ")[1]}`}>
                      {earned}/{total}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{rarity}</div>
                    <Progress value={percentage} className="mt-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
