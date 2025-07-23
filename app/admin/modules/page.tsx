// app/admin/modules/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
// Remove this line: import { getModules, type Module } from "@/data/modules"

// Define the Module type that matches the API response
// Adjust this to match the exact fields you fetch in api/modules/route.ts
// and how your frontend consumes them.
// Ensure vocabulary and quiz properties match the structure from _count
interface Module {
  id: number;
  title: string;
  subtitle?: string;
  level: string;
  duration: string;
  location?: string;
  // Assuming these are objects with a length property from _count
  vocabulary?: { length: number };
  quiz?: { length: number };
  // Add other properties you display on the page
}

export default function AdminModulesPage() {
  const [moduleList, setModuleList] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for handling errors

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch("/api/modules"); // Call your new API route
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch modules");
      }
      const modules: Module[] = await response.json();
      setModuleList(modules);
      // localStorage is no longer needed for primary data storage,
      // as data is fetched from the database
      // localStorage.setItem("adminModules", JSON.stringify(modules));
    } catch (err: any) {
      console.error("Error loading modules:", err);
      setError(err.message || "An unexpected error occurred while loading modules.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (window.confirm("Are you sure you want to delete this module? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/modules/${moduleId}`, { // Call your DELETE API route
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete module");
        }
        // If successful, update the local state to remove the module
        setModuleList((prev) => prev.filter((m) => m.id !== moduleId));
        // localStorage.setItem("adminModules", JSON.stringify(updatedModules)); // Remove this line
      } catch (err: any) {
        console.error("Error deleting module:", err);
        alert(`Error deleting module: ${err.message}`);
      }
    }
  };

  const handleRenumberModules = async () => {
    if (window.confirm("Are you sure you want to renumber all modules? This will change module IDs and URLs.")) {
      // NOTE: Renumbering is a complex operation that ideally should be handled on the backend
      // due to potential foreign key constraints and atomic updates.
      // For this example, I'll simulate an API call and then reload modules.
      // You would need to implement a /api/modules/renumber POST/PATCH route
      // that handles the renumbering logic in your database.

      // Example of a backend call for renumbering (you'd need to implement this API route)
      // try {
      //   const response = await fetch("/api/modules/renumber", {
      //     method: "POST", // Or PATCH
      //     headers: { "Content-Type": "application/json" },
      //     // body: JSON.stringify({ /* any data needed for renumbering, e.g., current order */ }),
      //   });
      //   if (!response.ok) {
      //     const errorData = await response.json();
      //     throw new Error(errorData.message || "Failed to renumber modules");
      //   }
      //   alert("Modules renumbered successfully!");
      //   loadModules(); // Reload to get the new IDs
      // } catch (err: any) {
      //   console.error("Error renumbering modules:", err);
      //   alert(`Error renumbering modules: ${err.message}`);
      // }

      // For now, let's keep the frontend renumbering for local display,
      // but acknowledge that it should be a backend operation for persistence.
      const sortedModules = [...moduleList].sort((a, b) => a.id - b.id);
      const renumberedModules = sortedModules.map((module, index) => ({
        ...module,
        id: index + 1,
      }));

      setModuleList(renumberedModules);
      // localStorage.setItem("adminModules", JSON.stringify(renumberedModules)); // Remove this line
      alert("Modules renumbered locally. For persistent changes, implement a backend renumbering API.");
    }
  };

  const hasGaps = () => {
    const sortedIds = moduleList.map((m) => m.id).sort((a, b) => a - b);
    for (let i = 0; i < sortedIds.length - 1; i++) {
      if (sortedIds[i + 1] - sortedIds[i] > 1) {
        return true;
      }
    }
    return false;
  };

  const getModuleIds = () => {
    return moduleList
      .map((m) => m.id)
      .sort((a, b) => a - b)
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading modules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 border-red-200 bg-red-50 text-red-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-800">Error Loading Modules</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={loadModules} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Modules</h1>
          <p className="text-gray-600 mt-2">Create, edit, and organize your Estonian learning modules</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleRenumberModules} variant="outline" className="flex items-center gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            Renumber Modules
          </Button>
          <Link href="/admin/modules/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Module
            </Button>
          </Link>
        </div>
      </div>

      {/* Gap Detection Warning */}
      {hasGaps() && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-orange-800">Module ID Gaps Detected</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              Your modules have non-sequential IDs: {getModuleIds()}. This can cause confusion with URLs and
              organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={handleRenumberModules}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Fix Numbering
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moduleList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Free Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{moduleList.filter((m) => m.id <= 3).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Premium Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{moduleList.filter((m) => m.id > 3).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            {/* This approximation might need review based on actual content duration data */}
            <div className="text-2xl font-bold">{moduleList.length * 3}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moduleList
          .sort((a, b) => a.id - b.id) // Still good to sort by ID for consistent display
          .map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={module.id <= 3 ? "default" : "secondary"} className="bg-blue-100 text-blue-800">
                      {module.level} • {module.id <= 3 ? "FREE" : "PREMIUM"}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">Module {module.id}</CardTitle>
                <CardDescription className="font-medium text-gray-900">{module.title}</CardDescription>
                <CardDescription>{module.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Location:</span>
                    <br />
                    {module.location}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>
                    <br />
                    {module.duration}
                  </div>
                  <div>
                    <div>
                      <span className="font-medium">Vocabulary:</span>
                      <br />
                      {module.vocabulary?.length || 0} words
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Quiz:</span>
                    <br />
                    {module.quiz?.length || 0} questions
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Link href={`/modules/${module.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Preview
                    </Button>
                  </Link>
                  <Link href={`/admin/modules/${module.id}/edit`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteModule(module.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {moduleList.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No modules found</h3>
              <p>Get started by creating your first Estonian learning module.</p>
            </div>
            <Link href="/admin/modules/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Module
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}