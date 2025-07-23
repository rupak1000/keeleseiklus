"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Trophy,
  Clock,
  Target,
  Download,
  Calendar,
  ArrowLeft,
  Activity,
  Award,
  Globe,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Interfaces to match Prisma models and API responses
interface Student {
  id: number;
  name: string;
  email: string;
  enrollmentDate: string;
  lastActive: string;
  progress: number;
  completedModules: number[]; // Updated to array of module IDs
  currentLevel: string;
  totalTimeSpent: string;
  streak: number;
  achievements: string[];
  subscription: string;
  status: string;
  preferredLanguage?: string;
  country?: string;
  subscriptionStatus?: string;
}

interface ExamResult {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  score: number;
  totalQuestions: number;
  points: number;
  maxPoints: number;
  percentage: number;
  completedAt: string;
  passed: boolean;
  timeSpent: number;
  attemptNumber: number;
  sectionScores: Record<string, number>;
}

interface ModuleAnalytics {
  moduleId: number;
  title: string;
  completionRate: number;
  averageTimeSpent: number;
  difficultyRating: number;
  dropoffRate: number;
  completedCount: number;
  totalStudents: number;
}

interface OverviewStats {
  totalStudents: number;
  activeStudents: number;
  premiumStudents: number;
  averageProgress: number;
  totalExamAttempts: number;
  passedExams: number;
  examPassRate: number;
  averageExamScore: number;
  totalModulesCompleted: number;
  averageModulesPerStudent: number;
  totalTimeSpent: number;
  totalAvailableModules: number;
}

interface EngagementMetrics {
  averageStreak: number;
  maxStreak: number;
  recentlyActive: number;
  retentionRate: number;
  totalStudents: number;
}

export default function AdminAnalyticsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [moduleAnalytics, setModuleAnalytics] = useState<ModuleAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");

  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalStudents: 0,
    activeStudents: 0,
    premiumStudents: 0,
    averageProgress: 0,
    totalExamAttempts: 0,
    passedExams: 0,
    examPassRate: 0,
    averageExamScore: 0,
    totalModulesCompleted: 0,
    averageModulesPerStudent: 0,
    totalTimeSpent: 0,
    totalAvailableModules: 0,
  });

  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>({
    averageStreak: 0,
    maxStreak: 0,
    recentlyActive: 0,
    retentionRate: 0,
    totalStudents: 0,
  });

  const [languageDistribution, setLanguageDistribution] = useState<
    { language: string; count: number; percentage: number }[]
  >([]);
  const [countryDistribution, setCountryDistribution] = useState<
    { country: string; count: number; percentage: number }[]
  >([]);
  const [levelDistribution, setLevelDistribution] = useState<
    { level: string; count: number; percentage: number }[]
  >([]);
  const [topPerformers, setTopPerformers] = useState<Student[]>([]);
  const [difficultModules, setDifficultModules] = useState<ModuleAnalytics[]>([]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          studentsRes,
          examResultsRes,
          overviewStatsRes,
          engagementMetricsRes,
          languageDistRes,
          countryDistRes,
          levelDistRes,
          topPerformersRes,
          difficultModulesRes,
          allModulesRes,
        ] = await Promise.all([
          fetch('/api/students', { cache: 'no-store' }),
          fetch('/api/analytics/exam-results', { cache: 'no-store' }),
          fetch('/api/analytics/overview-stats', { cache: 'no-store' }),
          fetch('/api/analytics/engagement-metrics', { cache: 'no-store' }),
          fetch('/api/analytics/language-distribution', { cache: 'no-store' }),
          fetch('/api/analytics/country-distribution', { cache: 'no-store' }),
          fetch('/api/analytics/level-distribution', { cache: 'no-store' }),
          fetch('/api/analytics/top-performers', { cache: 'no-store' }),
          fetch('/api/analytics/difficult-modules', { cache: 'no-store' }),
          fetch('/api/modules', { cache: 'no-store' }),
        ]);

        if (!studentsRes.ok)
          throw new Error(`Failed to fetch students: ${(await studentsRes.json()).error || studentsRes.statusText}`);
        const fetchedStudents: Student[] = await studentsRes.json();
        setStudents(fetchedStudents);

        if (!examResultsRes.ok)
          throw new Error(
            `Failed to fetch exam results: ${(await examResultsRes.json()).error || examResultsRes.statusText}`,
          );
        const fetchedExamResults: ExamResult[] = await examResultsRes.json();
        setExamResults(fetchedExamResults);

        if (!overviewStatsRes.ok)
          throw new Error(
            `Failed to fetch overview stats: ${(await overviewStatsRes.json()).error || overviewStatsRes.statusText}`,
          );
        const fetchedOverviewStats: OverviewStats = await overviewStatsRes.json();
        setOverviewStats(fetchedOverviewStats);

        if (!engagementMetricsRes.ok)
          throw new Error(
            `Failed to fetch engagement metrics: ${(await engagementMetricsRes.json()).error || engagementMetricsRes.statusText}`,
          );
        const fetchedEngagementMetrics: EngagementMetrics = await engagementMetricsRes.json();
        setEngagementMetrics(fetchedEngagementMetrics);

        if (!languageDistRes.ok)
          throw new Error(
            `Failed to fetch language distribution: ${(await languageDistRes.json()).error || languageDistRes.statusText}`,
          );
        const fetchedLanguageDist = await languageDistRes.json();
        setLanguageDistribution(fetchedLanguageDist);

        if (!countryDistRes.ok)
          throw new Error(
            `Failed to fetch country distribution: ${(await countryDistRes.json()).error || countryDistRes.statusText}`,
          );
        const fetchedCountryDist = await countryDistRes.json();
        setCountryDistribution(fetchedCountryDist);

        if (!levelDistRes.ok)
          throw new Error(
            `Failed to fetch level distribution: ${(await levelDistRes.json()).error || levelDistRes.statusText}`,
          );
        const fetchedLevelDist = await levelDistRes.json();
        setLevelDistribution(fetchedLevelDist);

        if (!topPerformersRes.ok)
          throw new Error(
            `Failed to fetch top performers: ${(await topPerformersRes.json()).error || topPerformersRes.statusText}`,
          );
        const fetchedTopPerformers: Student[] = await topPerformersRes.json();
        setTopPerformers(fetchedTopPerformers);

        if (!difficultModulesRes.ok)
          throw new Error(
            `Failed to fetch difficult modules: ${(await difficultModulesRes.json()).error || difficultModulesRes.statusText}`,
          );
        const fetchedDifficultModules: ModuleAnalytics[] = await difficultModulesRes.json();
        setDifficultModules(fetchedDifficultModules);

        let allModulesData: { id: number; title: string }[] = [];
        if (allModulesRes.ok) {
          allModulesData = await allModulesRes.json();
        } else {
          console.warn('Failed to fetch all modules for analytics grid. Using fallback.');
          for (let i = 1; i <= 40; i++) {
            allModulesData.push({ id: i, title: `Module ${i}` });
          }
        }

        const studentsForModuleAnalytics = fetchedStudents;
        const totalStudentsForModuleAnalytics = studentsForModuleAnalytics.length;

        const calculatedModuleAnalytics: ModuleAnalytics[] = allModulesData.map((module) => {
          const completedCount = studentsForModuleAnalytics.filter((s) =>
            s.completedModules.includes(module.id),
          ).length;
          const completionRate =
            totalStudentsForModuleAnalytics > 0 ? (completedCount / totalStudentsForModuleAnalytics) * 100 : 0;

          return {
            moduleId: module.id,
            title: module.title,
            completionRate: parseFloat(completionRate.toFixed(2)),
            averageTimeSpent: 30, // Placeholder: Replace with actual data from backend
            difficultyRating: 3, // Placeholder: Replace with actual data from backend
            dropoffRate: 20, // Placeholder: Replace with actual data from backend
            completedCount,
            totalStudents: totalStudentsForModuleAnalytics,
          };
        });
        setModuleAnalytics(calculatedModuleAnalytics);
      } catch (err: any) {
        console.error("Error loading analytics data:", err);
        setError(err.message || "An unexpected error occurred while loading analytics data.");
        setStudents([]);
        setExamResults([]);
        setModuleAnalytics([]);
        setOverviewStats({ ...overviewStats, totalStudents: 0 });
        setEngagementMetrics({ ...engagementMetrics, totalStudents: 0 });
        setLanguageDistribution([]);
        setCountryDistribution([]);
        setLevelDistribution([]);
        setTopPerformers([]);
        setDifficultModules([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange]);

  const getOverviewStats = () => overviewStats;
  const getEngagementMetrics = () => engagementMetrics;
  const getLanguageDistribution = () => languageDistribution;
  const getCountryDistribution = () => countryDistribution;
  const getLevelDistribution = () => levelDistribution;
  const getTopPerformers = () => topPerformers;
  const getMostDifficultModules = () => difficultModules;

  const exportAnalytics = () => {
    const currentOverviewStats = getOverviewStats();
    const currentEngagementMetrics = getEngagementMetrics();

    const csvContent = [
      ["Metric", "Value"],
      ["Total Students", currentOverviewStats.totalStudents],
      ["Active Students", currentOverviewStats.activeStudents],
      ["Premium Users", currentOverviewStats.premiumStudents],
      ["Average Progress", `${currentOverviewStats.averageProgress}%`],
      ["Exam Pass Rate", `${currentOverviewStats.examPassRate}%`],
      ["Average Exam Score", `${currentOverviewStats.averageExamScore}%`],
      ["Total Time Spent", `${currentOverviewStats.totalTimeSpent}h`],
      ["Average Streak", `${currentEngagementMetrics.averageStreak} days`],
      ["Retention Rate", `${currentEngagementMetrics.retentionRate}%`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exported successfully!");
  };

  const overview = getOverviewStats();
  const engagement = getEngagementMetrics();
  const languageDist = getLanguageDistribution();
  const countryDist = getCountryDistribution();
  const levelDist = getLevelDistribution();
  const topPerf = getTopPerformers();
  const diffModules = getMostDifficultModules();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-7xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Analytics</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into student performance and platform usage</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportAnalytics} variant="outline" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold">{overview.totalStudents}</p>
                  <p className="text-blue-200 text-xs mt-1">{overview.activeStudents} active</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Avg Progress</p>
                  <p className="text-3xl font-bold">{overview.averageProgress}%</p>
                  <p className="text-green-200 text-xs mt-1">
                    {overview.averageModulesPerStudent}/{overview.totalAvailableModules} modules
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Exam Pass Rate</p>
                  <p className="text-3xl font-bold">{overview.examPassRate}%</p>
                  <p className="text-purple-200 text-xs mt-1">
                    {overview.passedExams}/{overview.totalExamAttempts} passed
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Time</p>
                  <p className="text-3xl font-bold">{overview.totalTimeSpent}h</p>
                  <p className="text-orange-200 text-xs mt-1">Learning time</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Exams
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Engagement
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Student Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Students</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{overview.activeStudents}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {overview.totalStudents > 0
                            ? Math.round((overview.activeStudents / overview.totalStudents) * 100)
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={overview.totalStudents > 0 ? (overview.activeStudents / overview.totalStudents) * 100 : 0}
                      className="bg-gray-200"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Premium Users</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{overview.premiumStudents}</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {overview.totalStudents > 0
                            ? Math.round((overview.premiumStudents / overview.totalStudents) * 100)
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={overview.totalStudents > 0 ? (overview.premiumStudents / overview.totalStudents) * 100 : 0}
                      className="bg-gray-200"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Free Users</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{overview.totalStudents - overview.premiumStudents}</span>
                        <Badge className="bg-gray-100 text-gray-800">
                          {overview.totalStudents > 0
                            ? Math.round(((overview.totalStudents - overview.premiumStudents) / overview.totalStudents) * 100)
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={
                        overview.totalStudents > 0
                          ? ((overview.totalStudents - overview.premiumStudents) / overview.totalStudents) * 100
                          : 0
                      }
                      className="bg-gray-200"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Level Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {levelDist.map((level) => (
                      <div key={level.level} className="flex items-center justify-between">
                        <span className="text-sm font-medium">Level {level.level}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{level.count}</span>
                          <Badge variant="outline">{level.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {languageDist.map((lang) => (
                      <div key={lang.language} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{lang.language}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{lang.count}</span>
                          <Badge variant="outline">{lang.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {countryDist.slice(0, 5).map((country) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{country.country}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{country.count}</span>
                          <Badge variant="outline">{country.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Students with highest progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerf.map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-600">
                              {student.currentLevel} • {student.completedModules.length}/
                              {overviewStats.totalAvailableModules} modules
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{student.progress}%</div>
                          <div className="text-sm text-gray-600">{student.streak} day streak</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Retention Rate</span>
                        <span className="text-lg font-bold text-green-600">{engagement.retentionRate}%</span>
                      </div>
                      <Progress value={engagement.retentionRate} className="bg-gray-200" />
                      <p className="text-xs text-gray-600 mt-1">
                        {engagement.recentlyActive} of {engagement.totalStudents} students active in last 7 days
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Average Streak</span>
                        <span className="text-lg font-bold text-blue-600">{engagement.averageStreak} days</span>
                      </div>
                      <div className="text-xs text-gray-600">Longest streak: {engagement.maxStreak} days</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{overview.totalTimeSpent}h</div>
                        <div className="text-sm text-gray-600">Total Learning Time</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {overview.totalStudents > 0
                            ? Math.round(overview.totalTimeSpent / overview.totalStudents)
                            : 0}
                          h
                        </div>
                        <div className="text-sm text-gray-600">Avg per Student</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Time Investment</h4>
                      <div className="space-y-2">
                        {[
                          {
                            range: "50+ hours",
                            count: students.filter((s) => parseInt(s.totalTimeSpent) >= 50).length,
                          },
                          {
                            range: "20-49 hours",
                            count: students.filter((s) => parseInt(s.totalTimeSpent) >= 20 && parseInt(s.totalTimeSpent) < 50)
                              .length,
                          },
                          {
                            range: "10-19 hours",
                            count: students.filter((s) => parseInt(s.totalTimeSpent) >= 10 && parseInt(s.totalTimeSpent) < 20)
                              .length,
                          },
                          {
                            range: "1-9 hours",
                            count: students.filter((s) => parseInt(s.totalTimeSpent) >= 1 && parseInt(s.totalTimeSpent) < 10)
                              .length,
                          },
                          {
                            range: "0 hours",
                            count: students.filter((s) => parseInt(s.totalTimeSpent) === 0).length,
                          },
                        ].map((item) => (
                          <div key={item.range} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.range}</span>
                            <span className="text-sm font-bold">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Achievement Distribution
                  </CardTitle>
                  <CardDescription>Most earned achievements across all students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      const achievementCounts = students.reduce(
                        (acc, student) => {
                          if (student.achievements && Array.isArray(student.achievements)) {
                            student.achievements.forEach((achievement) => {
                              acc[achievement] = (acc[achievement] || 0) + 1;
                            });
                          }
                          return acc;
                        },
                        {} as Record<string, number>,
                      );

                      return Object.entries(achievementCounts)
                        .sort(([, a], [, b]) => b - a)
                        .map(([achievement, count]) => (
                          <div key={achievement} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-yellow-800">{achievement}</div>
                                <div className="text-sm text-yellow-600">
                                  {students.length > 0 ? Math.round((count / students.length) * 100) : 0}% of students
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-yellow-600">{count}</div>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Module Performance
                  </CardTitle>
                  <CardDescription>Completion rates and difficulty metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {moduleAnalytics.map((module) => (
                      <div key={module.moduleId} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="text-sm text-gray-600">
                              Completed by {module.completedCount}/{module.totalStudents} students
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{module.completionRate}%</div>
                            <div className="text-sm text-gray-600">Difficulty: {module.difficultyRating}/5</div>
                          </div>
                        </div>
                        <Progress value={module.completionRate} className="bg-gray-200 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Most Difficult Modules
                  </CardTitle>
                  <CardDescription>Modules with high drop-off rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {diffModules.map((module) => (
                      <div key={module.moduleId} className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="text-sm text-gray-600">Drop-off: {module.dropoffRate}%</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{module.completionRate}%</div>
                            <div className="text-sm text-gray-600">Avg Time: {module.averageTimeSpent} min</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Exam Performance
                  </CardTitle>
                  <CardDescription>Recent exam results and pass rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examResults.slice(0, 5).map((result) => (
                      <div key={result.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{result.studentName}</div>
                            <div className="text-sm text-gray-600">
                              Attempt {result.attemptNumber} • {new Date(result.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{result.percentage}%</div>
                            <div className="text-sm text-gray-600">{result.passed ? 'Passed' : 'Failed'}</div>
                          </div>
                        </div>
                        <Progress value={result.percentage} className="bg-gray-200 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Exam Section Performance
                  </CardTitle>
                  <CardDescription>Average scores by section</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examResults.length > 0 &&
                      Object.entries(
                        examResults.reduce(
                          (acc, result) => {
                            Object.entries(result.sectionScores).forEach(([section, score]) => {
                              if (!acc[section]) acc[section] = { total: 0, count: 0 };
                              acc[section].total += score;
                              acc[section].count += 1;
                            });
                            return acc;
                          },
                          {} as Record<string, { total: number; count: number }>,
                        ),
                      ).map(([section, { total, count }]) => (
                        <div key={section} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{section}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-Bold">{Math.round(total / count)}%</span>
                            <Badge variant="outline">{count} attempts</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Engagement Trends
                  </CardTitle>
                  <CardDescription>Key engagement metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Retention Rate</span>
                        <span className="text-lg font-bold text-green-600">{engagement.retentionRate}%</span>
                      </div>
                      <Progress value={engagement.retentionRate} className="bg-gray-200" />
                      <p className="text-xs text-gray-600 mt-1">
                        {engagement.recentlyActive} of {engagement.totalStudents} students active in last 7 days
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Average Streak</span>
                        <span className="text-lg font-bold text-blue-600">{engagement.averageStreak} days</span>
                      </div>
                      <Progress value={(engagement.averageStreak / engagement.maxStreak) * 100} className="bg-gray-200" />
                      <p className="text-xs text-gray-600 mt-1">Longest streak: {engagement.maxStreak} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Activity Over Time
                  </CardTitle>
                  <CardDescription>Distribution of student activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { range: "Last 24 hours", count: students.filter((s) => new Date(s.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length },
                      { range: "Last 7 days", count: students.filter((s) => new Date(s.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length },
                      { range: "Last 30 days", count: students.filter((s) => new Date(s.lastActive) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length },
                    ].map((item) => (
                      <div key={item.range} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.range}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{item.count}</span>
                          <Badge variant="outline">
                            {students.length > 0 ? Math.round((item.count / students.length) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}