"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Star, CheckCircle, Lock, Calendar, Target, Award, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: "learning" | "progress" | "social" | "special";
  earned: boolean;
  earnedDate?: string;
  requirement: string;
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface UserStats {
  totalPoints: number;
  earnedAchievements: number;
  currentStreak: number;
  totalModules: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    earnedAchievements: 0,
    currentStreak: 0,
    totalModules: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
      const userData = await userRes.json();

      // Fetch achievements
      const achievementsRes = await fetch('/api/achievements', {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!achievementsRes.ok) {
        const errorData = await achievementsRes.json();
        throw new Error(errorData.details || 'Failed to fetch achievements');
      }
      const achievementsData: Achievement[] = await achievementsRes.json();

      // Calculate user stats
      const earned = achievementsData.filter((a) => a.earned);
      const totalPoints = earned.reduce((sum, a) => sum + a.points, 0);

      setAchievements(achievementsData);
      setUserStats({
        totalPoints,
        earnedAchievements: earned.length,
        currentStreak: userData.streak || 0,
        totalModules: userData.completedModulesList?.length || 0,
      });
    } catch (err: any) {
      console.error('Error loading achievements page data:', err);
      setError(err.message.includes('connect') ? t('achievements.databaseError') : err.message);
      setAchievements([]);
      setUserStats({ totalPoints: 0, earnedAchievements: 0, currentStreak: 0, totalModules: 0 });
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

  const categories = [
    { id: "all", label: t("achievements.all"), icon: Trophy },
    { id: "learning", label: t("achievements.learning"), icon: Star },
    { id: "progress", label: t("achievements.progress"), icon: Target },
    { id: "social", label: t("achievements.social"), icon: Award },
    { id: "special", label: t("achievements.special"), icon: Zap },
  ];

  const filteredAchievements =
    selectedCategory === "all" ? achievements : achievements.filter((a) => a.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getProgressToNext = () => {
    const nextAchievement = achievements.find((a) => !a.earned);
    if (!nextAchievement) return { achievement: null, progress: 100 };

    // Dynamic progress calculation based on achievement criteria
    let progress = 0;
    if (nextAchievement.id === 4) {
      // Family Bonds: Assume 75% progress if related module is partially complete
      progress = userStats.totalModules >= 3 ? 75 : 0;
    } else if (nextAchievement.id === 5) {
      // Market Explorer: Assume 50% progress
      progress = userStats.totalModules >= 3 ? 50 : 0;
    } else if (nextAchievement.id === 11) {
      // Streak Champion: Progress based on streak
      progress = Math.min((userStats.currentStreak / 30) * 100, 100);
    } else if (nextAchievement.id === 10) {
      // Language Master: Progress based on completed modules
      progress = (userStats.totalModules / 40) * 100;
    }

    return { achievement: nextAchievement, progress };
  };

  const { achievement: nextAchievement, progress: nextProgress } = getProgressToNext();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("achievements.loading")}</p>
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
            <h2 className="text-2xl font-bold mb-4">{t("achievements.error")}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadPageData} className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t("achievements.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                      <span className="text-sm font-medium">{Math.round(nextProgress)}%</span>
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
              const Icon = category.icon;
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
              );
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
                const total = achievements.filter((a) => a.rarity === rarity).length;
                const earned = achievements.filter((a) => a.rarity === rarity && a.earned).length;
                const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;

                return (
                  <div key={rarity} className="text-center">
                    <div className={`text-lg font-bold ${getRarityColor(rarity).split(" ")[1]}`}>
                      {earned}/{total}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{rarity}</div>
                    <Progress value={percentage} className="mt-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}