"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Play, Lock, CheckCircle, Star, ZoomIn, ZoomOut, RotateCcw, User, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface Module {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  level: string;
  duration: string;
  location?: string;
  region?: string;
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

interface EstoniaMapProps {
  completedModules?: number;
  isLoggedIn?: boolean;
}

export default function EstoniaMap({ completedModules = 0, isLoggedIn = false }: EstoniaMapProps) {
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [completedModulesList, setCompletedModulesList] = useState<number[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const loadMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch modules from the API
      const modulesRes = await fetch('/api/modules', { cache: 'no-store' });
      if (!modulesRes.ok) {
        const errorData = await modulesRes.json();
        throw new Error(errorData.details || 'Failed to fetch modules');
      }
      const modulesData: Module[] = await modulesRes.json();
      setModules(modulesData);

      // Fetch user progress if logged in
      if (isLoggedIn) {
        const progressRes = await fetch('/api/modules/progress', {
          cache: 'no-store',
          credentials: 'include', // Include cookies for authentication
        });
        if (!progressRes.ok) {
          const errorData = await progressRes.json();
          throw new Error(errorData.details || 'Failed to fetch module progress');
        }
        const progressData: ModuleProgress = await progressRes.json();
        setModuleProgress(progressData);
        // Determine which modules are completed
        const completed = Object.entries(progressData)
          .filter(([_, data]) => data.completed)
          .map(([moduleId]) => parseInt(moduleId));
        setCompletedModulesList(completed);
      } else {
        // Reset progress if not logged in
        setModuleProgress({});
        setCompletedModulesList([]);
      }
    } catch (err: any) {
      console.error('Error loading map data:', err);
      // Provide a user-friendly error message, especially for network issues
      setError(err.message.includes('connect') ? t('progress.databaseError') : err.message);
      // Clear modules and progress on error
      setModules([]);
      setModuleProgress({});
      setCompletedModulesList([]);
    } finally {
      setLoading(false); // Always set loading to false in finally block
    }
  };

  // Effect to load map data on component mount or isLoggedIn change
  useEffect(() => {
    loadMapData();

    // Event listener for when a module is completed elsewhere in the app
    const handleModuleComplete = (event: Event) => {
      console.log('Map received module completion:', (event as CustomEvent).detail);
      loadMapData(); // Reload data to reflect changes
    };

    window.addEventListener('moduleCompleted', handleModuleComplete);
    // Cleanup event listener on component unmount
    return () => window.removeEventListener('moduleCompleted', handleModuleComplete);
  }, [isLoggedIn]); // Re-run effect when login status changes

  // Determines if a module is unlocked based on completion of the previous one (or if it's a free module)
  const isModuleUnlocked = (moduleId: number) => {
    if (moduleId <= 3) return true; // First 3 modules are always free
    return isLoggedIn && completedModulesList.includes(moduleId - 1); // Unlock if logged in and previous module is completed
  };

  // Gets the current status of a module (completed, free, unlocked, locked)
  const getModuleStatus = (moduleId: number) => {
    if (completedModulesList.includes(moduleId)) return "completed";
    if (moduleId <= 3) return "free";
    if (isModuleUnlocked(moduleId)) return "unlocked";
    return "locked";
  };

  // Returns Tailwind CSS classes for the marker color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "free":
        return "bg-gradient-to-r from-green-500 to-emerald-500 border-green-600 shadow-green-500/50";
      case "unlocked":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-600 shadow-blue-500/50";
      default:
        return "bg-gray-400 border-gray-500 shadow-gray-400/30 opacity-60";
    }
  };

  // Returns the appropriate Lucide icon for the marker based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />;
      case "free":
        return <MapPin className="w-3 h-3 sm:w-5 sm:h-5 text-white" />;
      case "unlocked":
        return <Play className="w-3 h-3 sm:w-5 sm:h-5 text-white" />;
      default:
        return <Lock className="w-3 h-3 sm:w-5 sm:h-5 text-white" />;
    }
  };

  // Returns the appropriate Badge component for the module details based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 text-white">✓ {t("map.completed")}</Badge>;
      case "free":
        return <Badge className="bg-green-600 text-white">🎁 {t("map.freeAccess")}</Badge>;
      case "unlocked":
        return <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">{t("map.available")}</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">🔒 {t("map.locked")}</Badge>;
    }
  };

  // Handles zooming in on the map
  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(prev + 0.3, 3)); // Max zoom level 3
  };

  // Handles zooming out on the map
  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(prev - 0.3, 0.5)); // Min zoom level 0.5
  };

  // Resets map zoom and position to default
  const resetMap = () => {
    setMapZoom(1);
    setMapPosition({ x: 0, y: 0 });
  };

  // Calculates module position on the map to avoid overlap and distribute them
  const getModulePosition = (moduleId: number) => {
    const index = moduleId - 1; // 0-indexed for calculations
    const cols = 4; // Number of columns for a grid-like distribution
    const rowHeight = 20; // Vertical spacing
    const colWidth = 20; // Horizontal spacing
    // Apply sine/cosine for slight variations to prevent perfect alignment and add visual interest
    const x = 10 + (index % cols) * colWidth + (Math.sin(index * 0.5) * 5);
    const y = 15 + Math.floor(index / cols) * rowHeight + (Math.cos(index * 0.5) * 3);
    // Ensure positions stay within the bounds of the map (5% to 95%)
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  // Calculate overall progress percentage
  const totalProgress = modules.length > 0 ? Math.round((completedModulesList.length / modules.length) * 100) : 0;

  // Render loading state
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("map.loadingMap")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">{t("progress.error")}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadMapData} className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t("progress.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main component render
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {t("map.yourEstonianAdventure")}
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {isLoggedIn ? t("map.trackProgress") : t("map.exploreDestinations")}
        </p>
      </div>

      {/* Demo Notice for Non-Logged Users */}
      {!isLoggedIn && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-blue-800">{t("map.exploreFreeDemo")}</h3>
              <p className="text-sm text-blue-700">
                {t("map.freeModulesDesc").replace("{count}", "3")}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/login">
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="whitespace-nowrap">{t("map.loginToUnlockAll")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {isLoggedIn ? `${completedModulesList.length}/${modules.length}` : `3/${modules.length}`}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {isLoggedIn ? t("map.destinationsVisited") : t("map.freeDestinations")}
                </div>
              </div>
            </div> {/* This div needs to be closed here */}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-200 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{totalProgress}%</div>
                <div className="text-xs sm:text-sm text-gray-600">{t("map.overallProgress")}</div>
              </div>
            </div> {/* This div needs to be closed here */}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{modules.length * 3}+</div>
                <div className="text-xs sm:text-sm text-gray-600">{t("map.hoursContent")}</div>
              </div>
            </div> {/* This div needs to be closed here */}
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        {/* Interactive Map */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {t("map.adventureMap").replace("{count}", modules.length.toString())}
                </h3>
                <p className="text-gray-600">{isLoggedIn ? t("map.clickDestinations") : t("map.freeToExplore")}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomIn}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomOut}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetMap}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-blue-100 via-green-100 to-emerald-100 rounded-xl overflow-hidden border border-blue-200">
              <div
                className="relative w-full h-64 sm:h-96 transition-transform duration-300"
                style={{
                  transform: `scale(${mapZoom}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                }}
              >
                {/* Estonia Map SVG Background */}
                <svg
                  viewBox="0 0 400 300"
                  className="absolute inset-0 w-full h-full opacity-40"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Main Estonia outline (simplified for illustrative purposes) */}
                  <path
                    d="M50,120 L80,100 L120,90 L160,85 L200,80 L240,85 L280,90 L320,100 L350,120 L360,140 L350,160 L340,180 L320,200 L300,210 L280,215 L240,220 L200,215 L160,210 L120,200 L80,180 L60,160 L50,140 Z"
                    fill="currentColor"
                    className="text-blue-300"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  {/* Saaremaa Island (simplified) */}
                  <circle cx="100" cy="180" r="15" fill="currentColor" className="text-blue-300" />
                  {/* Hiiumaa Island (simplified) */}
                  <circle cx="80" cy="160" r="8" fill="currentColor" className="text-blue-300" />
                </svg>

                {/* Module Markers */}
                {modules.map((module) => {
                  const status = getModuleStatus(module.id);
                  const isHovered = hoveredModule === module.id;
                  const isSelected = selectedModule === module.id;
                  const position = getModulePosition(module.id);

                  return (
                    <button
                      key={module.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 z-10 ${
                        isSelected ? "scale-125" : ""
                      } ${status === "locked" ? "cursor-not-allowed" : "cursor-pointer"}`}
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                      }}
                      onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                      onMouseEnter={() => setHoveredModule(module.id)}
                      onMouseLeave={() => setHoveredModule(null)}
                      disabled={status === "locked"}
                    >
                      <div className="relative">
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg ${getStatusColor(status)}`}
                        >
                          {getStatusIcon(status)}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shadow">
                          {module.id}
                        </div>
                        {module.id <= 3 && !isLoggedIn && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-1 rounded">
                            FREE
                          </div>
                        )}
                        {status === "completed" && (
                          <div className="absolute -top-2 -right-2">
                            <Star className="w-3 h-3 text-green-400 fill-green-400" />
                          </div>
                        )}
                        {isHovered && (
                          <div className="absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap z-20 opacity-100 transition-opacity">
                            {module.title}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Module Details */}
            {selectedModule && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                {(() => {
                  const module = modules.find((m) => m.id === selectedModule);
                  if (!module) return null;

                  const status = getModuleStatus(module.id);
                  const progress = moduleProgress[module.id]?.progress || 0;

                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-blue-800">
                          {module.title} {module.subtitle ? `- ${module.subtitle}` : ''}
                        </h4>
                        {module.id <= 3 && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">{t("map.freeAccess")}</span>
                        )}
                      </div>
                      {/* Changed from subtitle to description */}
                      <p className="text-sm text-blue-700 mb-3">{module.description || t("map.noDescription")}</p>

                      <div className="flex items-center gap-4 mb-3">
                        <Progress value={progress} className="flex-1 bg-white" />
                        <span className="text-sm font-medium text-blue-700">{progress}%</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {getStatusBadge(status)}
                        <Badge className="bg-blue-100 text-blue-700">{module.level}</Badge>
                        <Badge className="bg-purple-100 text-purple-700">{module.duration}</Badge>
                        {module.location && (
                          <Badge className="bg-indigo-100 text-indigo-700">
                            <MapPin className="w-3 h-3 mr-1" />
                            {module.location}{module.region ? `, ${module.region}` : ''}
                          </Badge>
                        )}
                      </div>

                      {status === "locked" ? (
                        <div className="flex items-center gap-2">
                          <Link href="/login">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                              {t("map.loginToUnlock")}
                            </Button>
                          </Link>
                          <span className="text-xs text-gray-600">{t("map.completePrevious")}</span>
                        </div>
                      ) : (
                        <Link href={`/modules/${module.id}`}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            {status === "completed"
                              ? t("map.reviewModule")
                              : progress > 0
                                ? t("map.continue")
                                : module.id <= 3
                                  ? t("map.startFreeModule")
                                  : t("map.startModule")}
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </Card>

        {/* Map Legend */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{t("map.mapLegend")}</h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-green-600 shadow-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-100" />
              </div>
              <span className="text-gray-700 font-medium">{t("map.completed")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-green-600 shadow-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-green-100" />
              </div>
              <span className="text-gray-700 font-medium">{t("map.freeAccess")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-blue-600 shadow-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-blue-100" />
              </div>
              <span className="text-gray-700 font-medium">{t("map.available")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500 shadow-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-100" />
              </div>
              <span className="text-gray-700 font-medium">{t("map.locked")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
