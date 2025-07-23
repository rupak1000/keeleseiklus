"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Settings,
  BookOpen,
  PenTool,
  Volume2,
  Mic,
  FileText,
  Edit3,
  Globe,
  Target,
  Eye,
  EyeOff,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { modules, type Module } from "@/data/modules"

export default function EditModule() {
  const params = useParams()
  const moduleId = Number.parseInt(params.id as string)

  const [editedModule, setEditedModule] = useState<Module | null>(null)
  const [activeSection, setActiveSection] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [showRussianFields, setShowRussianFields] = useState(true)

  useEffect(() => {
    // Load module data
    const savedModules = localStorage.getItem("adminModules")
    const moduleList = savedModules ? JSON.parse(savedModules) : modules
    const module = moduleList.find((m: Module) => m.id === moduleId)

    if (module) {
      // Add Russian fields if they don't exist
      setEditedModule({
        ...module,
        titleRu: (module as any).titleRu || "",
        subtitleRu: (module as any).subtitleRu || "",
        descriptionRu: (module as any).descriptionRu || "",
        story: {
          ...module.story,
          text_ru: (module.story as any).text_ru || "",
          hint_ru: (module.story as any).hint_ru || "",
          mission_ru: (module.story as any).mission_ru || "",
        },
        grammar: {
          ...module.grammar,
          title_ru: (module.grammar as any).title_ru || "",
          explanation_ru: (module.grammar as any).explanation_ru || "",
          rules_ru: (module.grammar as any).rules_ru || [],
        },
        pronunciation: {
          ...module.pronunciation,
          focus_ru: (module.pronunciation as any).focus_ru || "",
          content_ru: (module.pronunciation as any).content_ru || "",
          hint_ru: (module.pronunciation as any).hint_ru || "",
        },
        listening: {
          ...module.listening,
          transcript_ru: (module.listening as any).transcript_ru || "",
          content_ru: (module.listening as any).content_ru || "",
          hint_ru: (module.listening as any).hint_ru || "",
        },
        speaking: {
          ...module.speaking,
          content_ru: (module.speaking as any).content_ru || "",
          hint_ru: (module.speaking as any).hint_ru || "",
        },
        reading: {
          ...module.reading,
          text_ru: (module.reading as any).text_ru || "",
          hint_ru: (module.reading as any).hint_ru || "",
        },
        writing: {
          ...module.writing,
          content_ru: (module.writing as any).content_ru || "",
          hint_ru: (module.writing as any).hint_ru || "",
        },
        cultural: {
          ...module.cultural,
          title_ru: (module.cultural as any).title_ru || "",
          content_ru: (module.cultural as any).content_ru || "",
          hint_ru: (module.cultural as any).hint_ru || "",
          souvenir: {
            ...module.cultural.souvenir,
            name_ru: (module.cultural.souvenir as any).name_ru || "",
            description_ru: (module.cultural.souvenir as any).description_ru || "",
          },
        },
        missionChallenge: {
          ...module.missionChallenge,
          title_ru: (module.missionChallenge as any).title_ru || "",
          description_ru: (module.missionChallenge as any).description_ru || "",
          requirements_ru: (module.missionChallenge as any).requirements_ru || [],
          hint_ru: (module.missionChallenge as any).hint_ru || "",
        },
      })
    }
  }, [moduleId])

  const handleSave = async () => {
    if (!editedModule) return

    setIsSaving(true)

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Save to localStorage
    const savedModules = localStorage.getItem("adminModules")
    const moduleList = savedModules ? JSON.parse(savedModules) : modules
    const updatedModules = moduleList.map((m: Module) => (m.id === editedModule.id ? editedModule : m))

    localStorage.setItem("adminModules", JSON.stringify(updatedModules))
    setIsSaving(false)

    // Show success message
    alert("Module saved successfully!")
  }

  const updateModule = (field: string, value: any) => {
    if (!editedModule) return
    setEditedModule((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const updateNestedField = (section: string, field: string, value: any) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            [section]: {
              ...prev[section as keyof Module],
              [field]: value,
            },
          }
        : null,
    )
  }

  // Vocabulary management functions
  const addVocabularyItem = () => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            vocabulary: [
              ...prev.vocabulary,
              {
                word: "",
                translation: "",
                translation_ru: "",
                example: "",
                example_ru: "",
                audioUrl: "",
              },
            ],
          }
        : null,
    )
  }

  const updateVocabularyItem = (index: number, field: string, value: string) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            vocabulary: prev.vocabulary.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
          }
        : null,
    )
  }

  const removeVocabularyItem = (index: number) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            vocabulary: prev.vocabulary.filter((_, i) => i !== index),
          }
        : null,
    )
  }

  // Grammar exercise management
  const addGrammarExercise = () => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            grammar: {
              ...prev.grammar,
              exercises: [
                ...prev.grammar.exercises,
                {
                  type: "fill-blank",
                  question: "",
                  question_ru: "",
                  answer: "",
                  hint: "",
                  hint_ru: "",
                  options: [],
                  options_ru: [],
                },
              ],
            },
          }
        : null,
    )
  }

  const updateGrammarExercise = (index: number, field: string, value: any) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            grammar: {
              ...prev.grammar,
              exercises: prev.grammar.exercises.map((exercise, i) =>
                i === index ? { ...exercise, [field]: value } : exercise,
              ),
            },
          }
        : null,
    )
  }

  const removeGrammarExercise = (index: number) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            grammar: {
              ...prev.grammar,
              exercises: prev.grammar.exercises.filter((_, i) => i !== index),
            },
          }
        : null,
    )
  }

  // Pronunciation exercise management
  const addPronunciationExercise = () => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            pronunciation: {
              ...prev.pronunciation,
              exercises: [
                ...prev.pronunciation.exercises,
                {
                  type: "listen-repeat",
                  word: "",
                  phonetic: "",
                  audioUrl: "",
                  hint: "",
                  hint_ru: "",
                },
              ],
            },
          }
        : null,
    )
  }

  const updatePronunciationExercise = (index: number, field: string, value: any) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            pronunciation: {
              ...prev.pronunciation,
              exercises: prev.pronunciation.exercises.map((exercise, i) =>
                i === index ? { ...exercise, [field]: value } : exercise,
              ),
            },
          }
        : null,
    )
  }

  const removePronunciationExercise = (index: number) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            pronunciation: {
              ...prev.pronunciation,
              exercises: prev.pronunciation.exercises.filter((_, i) => i !== index),
            },
          }
        : null,
    )
  }

  // Listening exercise management
  const addListeningQuestion = () => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            listening: {
              ...prev.listening,
              questions: [
                ...prev.listening.questions,
                {
                  question: "",
                  question_ru: "",
                  answer: "",
                  options: [],
                  options_ru: [],
                  type: "multiple-choice",
                },
              ],
            },
          }
        : null,
    )
  }

  const updateListeningQuestion = (index: number, field: string, value: any) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            listening: {
              ...prev.listening,
              questions: prev.listening.questions.map((question, i) =>
                i === index ? { ...question, [field]: value } : question,
              ),
            },
          }
        : null,
    )
  }

  const removeListeningQuestion = (index: number) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            listening: {
              ...prev.listening,
              questions: prev.listening.questions.filter((_, i) => i !== index),
            },
          }
        : null,
    )
  }

  // Speaking exercise management
  const addSpeakingExercise = () => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            speaking: {
              ...prev.speaking,
              exercises: [
                ...prev.speaking.exercises,
                {
                  type: "role-play",
                  prompt: "",
                  prompt_ru: "",
                  expectedResponse: "",
                  hint: "",
                  hint_ru: "",
                },
              ],
            },
          }
        : null,
    )
  }

  const updateSpeakingExercise = (index: number, field: string, value: any) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            speaking: {
              ...prev.speaking,
              exercises: prev.speaking.exercises.map((exercise, i) =>
                i === index ? { ...exercise, [field]: value } : exercise,
              ),
            },
          }
        : null,
    )
  }

  const removeSpeakingExercise = (index: number) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            speaking: {
              ...prev.speaking,
              exercises: prev.speaking.exercises.filter((_, i) => i !== index),
            },
          }
        : null,
    )
  }

  // Reading exercise management
  const addReadingQuestion = () => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            reading: {
              ...prev.reading,
              questions: [
                ...prev.reading.questions,
                {
                  question: "",
                  question_ru: "",
                  answer: "",
                  type: "multiple-choice",
                  options: [],
                  options_ru: [],
                },
              ],
            },
          }
        : null,
    )
  }

  const updateReadingQuestion = (index: number, field: string, value: any) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            reading: {
              ...prev.reading,
              questions: prev.reading.questions.map((question, i) =>
                i === index ? { ...question, [field]: value } : question,
              ),
            },
          }
        : null,
    )
  }

  const removeReadingQuestion = (index: number) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            reading: {
              ...prev.reading,
              questions: prev.reading.questions.filter((_, i) => i !== index),
            },
          }
        : null,
    )
  }

  // Writing exercise management
  const addWritingExercise = () => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            writing: {
              ...prev.writing,
              exercises: [
                ...prev.writing.exercises,
                {
                  type: "essay",
                  prompt: "",
                  prompt_ru: "",
                  minWords: 50,
                  maxWords: 200,
                  hint: "",
                  hint_ru: "",
                },
              ],
            },
          }
        : null,
    )
  }

  const updateWritingExercise = (index: number, field: string, value: any) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            writing: {
              ...prev.writing,
              exercises: prev.writing.exercises.map((exercise, i) =>
                i === index ? { ...exercise, [field]: value } : exercise,
              ),
            },
          }
        : null,
    )
  }

  const removeWritingExercise = (index: number) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            writing: {
              ...prev.writing,
              exercises: prev.writing.exercises.filter((_, i) => i !== index),
            },
          }
        : null,
    )
  }

  // Quiz management functions
  const addQuizQuestion = () => {
    if (!editedModule) return
    const newId = Math.max(...editedModule.quiz.map((q) => q.id), 0) + 1
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            quiz: [
              ...prev.quiz,
              {
                id: newId,
                type: "multiple-choice",
                question: "",
                question_ru: "",
                options: ["", "", "", ""],
                options_ru: ["", "", "", ""],
                answer: "",
                hint: "",
                hint_ru: "",
                audioUrl: "",
              },
            ],
          }
        : null,
    )
  }

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            quiz: prev.quiz.map((question, i) => (i === index ? { ...question, [field]: value } : question)),
          }
        : null,
    )
  }

  const removeQuizQuestion = (index: number) => {
    if (!editedModule) return
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            quiz: prev.quiz.filter((_, i) => i !== index),
          }
        : null,
    )
  }

  if (!editedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Module Not Found</h2>
            <p className="text-gray-600 mb-4">The requested module could not be found.</p>
            <Link href="/admin/modules">
              <Button>Back to Modules</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/modules">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Modules
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setShowRussianFields(!showRussianFields)}>
              {showRussianFields ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showRussianFields ? "Hide" : "Show"} Russian Fields
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Module {editedModule.id}
              </h1>
              <p className="text-gray-600 mt-2">{editedModule.title}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.open(`/modules/${editedModule.id}`, "_blank")}>
                <BookOpen className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Multi-language Support Notice */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Multi-language Support</h3>
                <p className="text-sm text-blue-700">
                  Fill in both English and Russian content for all fields to support both languages in the application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-11 min-w-[900px] lg:min-w-0 text-xs">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="story" className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Story
              </TabsTrigger>
              <TabsTrigger value="vocabulary" className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Vocabulary
              </TabsTrigger>
              <TabsTrigger value="grammar" className="flex items-center gap-1">
                <PenTool className="w-3 h-3" />
                Grammar
              </TabsTrigger>
              <TabsTrigger value="pronunciation" className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Pronunciation
              </TabsTrigger>
              <TabsTrigger value="listening" className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Listening
              </TabsTrigger>
              <TabsTrigger value="speaking" className="flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Speaking
              </TabsTrigger>
              <TabsTrigger value="reading" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Reading
              </TabsTrigger>
              <TabsTrigger value="writing" className="flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                Writing
              </TabsTrigger>
              <TabsTrigger value="cultural" className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Cultural
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Quiz
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Configure the basic module settings and metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="module-title">Title (English)</Label>
                    <Input
                      id="module-title"
                      value={editedModule.title}
                      onChange={(e) => updateModule("title", e.target.value)}
                      placeholder="English title"
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="module-title-ru">Title (Russian)</Label>
                      <Input
                        id="module-title-ru"
                        value={(editedModule as any).titleRu}
                        onChange={(e) => updateModule("titleRu", e.target.value)}
                        placeholder="Русский заголовок"
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="module-subtitle">Subtitle (English)</Label>
                    <Input
                      id="module-subtitle"
                      value={editedModule.subtitle}
                      onChange={(e) => updateModule("subtitle", e.target.value)}
                      placeholder="English subtitle"
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="module-subtitle-ru">Subtitle (Russian)</Label>
                      <Input
                        id="module-subtitle-ru"
                        value={(editedModule as any).subtitleRu}
                        onChange={(e) => updateModule("subtitleRu", e.target.value)}
                        placeholder="Русский подзаголовок"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="module-level">Level</Label>
                    <Select value={editedModule.level} onValueChange={(value) => updateModule("level", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1">A1 - Beginner</SelectItem>
                        <SelectItem value="A1-A2">A1-A2 - Elementary</SelectItem>
                        <SelectItem value="A2">A2 - Pre-Intermediate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="module-duration">Duration</Label>
                    <Input
                      id="module-duration"
                      value={editedModule.duration}
                      onChange={(e) => updateModule("duration", e.target.value)}
                      placeholder="e.g., 3 hours"
                    />
                  </div>
                  <div>
                    <Label htmlFor="module-location">Location</Label>
                    <Input
                      id="module-location"
                      value={editedModule.location}
                      onChange={(e) => updateModule("location", e.target.value)}
                      placeholder="e.g., Tallinn's Old Town"
                    />
                  </div>
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="module-description">Description (English)</Label>
                    <Textarea
                      id="module-description"
                      value={editedModule.description}
                      onChange={(e) => updateModule("description", e.target.value)}
                      rows={3}
                      placeholder="English description"
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="module-description-ru">Description (Russian)</Label>
                      <Textarea
                        id="module-description-ru"
                        value={(editedModule as any).descriptionRu}
                        onChange={(e) => updateModule("descriptionRu", e.target.value)}
                        rows={3}
                        placeholder="Русское описание"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="module-video">Video URL</Label>
                    <Input
                      id="module-video"
                      value={editedModule.videoUrl}
                      onChange={(e) => updateModule("videoUrl", e.target.value)}
                      placeholder="/videos/module.mp4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="module-region">Region</Label>
                    <Input
                      id="module-region"
                      value={editedModule.region}
                      onChange={(e) => updateModule("region", e.target.value)}
                      placeholder="e.g., Estonia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="map-x">Map Position X</Label>
                    <Input
                      id="map-x"
                      type="number"
                      step="0.1"
                      value={editedModule.mapPosition.x}
                      onChange={(e) =>
                        updateModule("mapPosition", {
                          ...editedModule.mapPosition,
                          x: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="map-y">Map Position Y</Label>
                    <Input
                      id="map-y"
                      type="number"
                      step="0.1"
                      value={editedModule.mapPosition.y}
                      onChange={(e) =>
                        updateModule("mapPosition", {
                          ...editedModule.mapPosition,
                          y: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Story Tab */}
          <TabsContent value="story" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Story Content</CardTitle>
                <CardDescription>Configure the main story and mission for this module</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="story-text">Story Text (English)</Label>
                    <Textarea
                      id="story-text"
                      value={editedModule.story.text}
                      onChange={(e) => updateNestedField("story", "text", e.target.value)}
                      rows={8}
                      placeholder="Enter the main story content in English..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="story-text-ru">Story Text (Russian)</Label>
                      <Textarea
                        id="story-text-ru"
                        value={(editedModule.story as any).text_ru}
                        onChange={(e) => updateNestedField("story", "text_ru", e.target.value)}
                        rows={8}
                        placeholder="Введите основное содержание истории на русском..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="story-mission">Mission (English)</Label>
                    <Textarea
                      id="story-mission"
                      value={editedModule.story.mission}
                      onChange={(e) => updateNestedField("story", "mission", e.target.value)}
                      rows={3}
                      placeholder="Describe the learning mission in English..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="story-mission-ru">Mission (Russian)</Label>
                      <Textarea
                        id="story-mission-ru"
                        value={(editedModule.story as any).mission_ru}
                        onChange={(e) => updateNestedField("story", "mission_ru", e.target.value)}
                        rows={3}
                        placeholder="Опишите учебную миссию на русском..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="story-hint">Learning Hint (English)</Label>
                    <Input
                      id="story-hint"
                      value={editedModule.story.hint}
                      onChange={(e) => updateNestedField("story", "hint", e.target.value)}
                      placeholder="Provide a helpful learning hint in English..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="story-hint-ru">Learning Hint (Russian)</Label>
                      <Input
                        id="story-hint-ru"
                        value={(editedModule.story as any).hint_ru}
                        onChange={(e) => updateNestedField("story", "hint_ru", e.target.value)}
                        placeholder="Дайте полезную подсказку для обучения на русском..."
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="story-video">Video URL</Label>
                  <Input
                    id="story-video"
                    value={editedModule.story.videoUrl || ""}
                    onChange={(e) => updateNestedField("story", "videoUrl", e.target.value)}
                    placeholder="/videos/story-video.mp4"
                  />
                </div>

                <div>
                  <Label htmlFor="story-characters">Characters (comma separated)</Label>
                  <Input
                    id="story-characters"
                    value={editedModule.story.characters.join(", ")}
                    onChange={(e) =>
                      updateNestedField(
                        "story",
                        "characters",
                        e.target.value.split(", ").filter((c) => c.trim()),
                      )
                    }
                    placeholder="Liis, You, Guide..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="story-show-translation"
                    checked={editedModule.story.showTranslation || false}
                    onChange={(e) => updateNestedField("story", "showTranslation", e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="story-show-translation" className="text-sm font-medium">
                    Show Translation
                  </Label>
                  <span className="text-xs text-gray-500 ml-2">
                    Display English translation alongside Estonian text
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Vocabulary Management</CardTitle>
                    <CardDescription>
                      Manage vocabulary words for this module ({editedModule.vocabulary.length} words)
                    </CardDescription>
                  </div>
                  <Button onClick={addVocabularyItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Word
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {editedModule.vocabulary.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">Word {index + 1}</span>
                        <Button size="sm" variant="destructive" onClick={() => removeVocabularyItem(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <Input
                          placeholder="Estonian word"
                          value={item.word}
                          onChange={(e) => updateVocabularyItem(index, "word", e.target.value)}
                        />
                        <Input
                          placeholder="English translation"
                          value={item.translation}
                          onChange={(e) => updateVocabularyItem(index, "translation", e.target.value)}
                        />
                        {showRussianFields && (
                          <Input
                            placeholder="Russian translation"
                            value={(item as any).translation_ru || ""}
                            onChange={(e) => updateVocabularyItem(index, "translation_ru", e.target.value)}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Example sentence (EN)"
                          value={item.example}
                          onChange={(e) => updateVocabularyItem(index, "example", e.target.value)}
                        />
                        {showRussianFields && (
                          <Input
                            placeholder="Example sentence (RU)"
                            value={(item as any).example_ru || ""}
                            onChange={(e) => updateVocabularyItem(index, "example_ru", e.target.value)}
                          />
                        )}
                        <Input
                          placeholder="Audio URL (optional)"
                          value={item.audioUrl}
                          onChange={(e) => updateVocabularyItem(index, "audioUrl", e.target.value)}
                        />
                      </div>
                    </Card>
                  ))}

                  {editedModule.vocabulary.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No vocabulary words added yet.</p>
                      <p className="text-sm">Click "Add Word" to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grammar Tab */}
          <TabsContent value="grammar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grammar Section</CardTitle>
                <CardDescription>Configure grammar rules, examples, and exercises</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grammar Title and Explanation */}
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="grammar-title">Grammar Title (English)</Label>
                    <Input
                      id="grammar-title"
                      value={editedModule.grammar.title}
                      onChange={(e) => updateNestedField("grammar", "title", e.target.value)}
                      placeholder="Grammar topic title"
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="grammar-title-ru">Grammar Title (Russian)</Label>
                      <Input
                        id="grammar-title-ru"
                        value={(editedModule.grammar as any).title_ru}
                        onChange={(e) => updateNestedField("grammar", "title_ru", e.target.value)}
                        placeholder="Заголовок грамматической темы"
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="grammar-explanation">Explanation (English)</Label>
                    <Textarea
                      id="grammar-explanation"
                      value={editedModule.grammar.explanation}
                      onChange={(e) => updateNestedField("grammar", "explanation", e.target.value)}
                      rows={4}
                      placeholder="Explain the grammar concept..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="grammar-explanation-ru">Explanation (Russian)</Label>
                      <Textarea
                        id="grammar-explanation-ru"
                        value={(editedModule.grammar as any).explanation_ru}
                        onChange={(e) => updateNestedField("grammar", "explanation_ru", e.target.value)}
                        rows={4}
                        placeholder="Объясните грамматическую концепцию..."
                      />
                    </div>
                  )}
                </div>

                {/* Grammar Rules */}
                <div>
                  <Label>Grammar Rules</Label>
                  <div className="space-y-2">
                    {editedModule.grammar.rules.map((rule, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={rule}
                          onChange={(e) => {
                            const newRules = [...editedModule.grammar.rules]
                            newRules[index] = e.target.value
                            updateNestedField("grammar", "rules", newRules)
                          }}
                          placeholder={`Rule ${index + 1}`}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const newRules = editedModule.grammar.rules.filter((_, i) => i !== index)
                            updateNestedField("grammar", "rules", newRules)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newRules = [...editedModule.grammar.rules, ""]
                        updateNestedField("grammar", "rules", newRules)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </div>

                {/* Grammar Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Grammar Exercises ({editedModule.grammar.exercises.length})</Label>
                    <Button onClick={addGrammarExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {editedModule.grammar.exercises.map((exercise, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Exercise {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeGrammarExercise(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <Select
                            value={exercise.type}
                            onValueChange={(value) => updateGrammarExercise(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="translation">Translation</SelectItem>
                              <SelectItem value="conjugation">Conjugation</SelectItem>
                              <SelectItem value="arrange">Arrange Words</SelectItem>
                              <SelectItem value="correct">Correct the Sentence</SelectItem>
                              <SelectItem value="write">Write Answer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Answer"
                            value={exercise.answer}
                            onChange={(e) => updateGrammarExercise(index, "answer", e.target.value)}
                          />
                        </div>

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2 mb-3`}>
                          <Input
                            placeholder="Question (English)"
                            value={exercise.question}
                            onChange={(e) => updateGrammarExercise(index, "question", e.target.value)}
                          />
                          {showRussianFields && (
                            <Input
                              placeholder="Question (Russian)"
                              value={(exercise as any).question_ru || ""}
                              onChange={(e) => updateGrammarExercise(index, "question_ru", e.target.value)}
                            />
                          )}
                        </div>

                        {exercise.type === "multiple-choice" && (
                          <div className="space-y-2">
                            <Label>Options</Label>
                            {(exercise.options || []).map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}
                              >
                                <Input
                                  placeholder={`Option ${optionIndex + 1} (EN)`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(exercise.options || [])]
                                    newOptions[optionIndex] = e.target.value
                                    updateGrammarExercise(index, "options", newOptions)
                                  }}
                                />
                                {showRussianFields && (
                                  <Input
                                    placeholder={`Option ${optionIndex + 1} (RU)`}
                                    value={((exercise as any).options_ru || [])[optionIndex] || ""}
                                    onChange={(e) => {
                                      const newOptionsRu = [...((exercise as any).options_ru || [])]
                                      newOptionsRu[optionIndex] = e.target.value
                                      updateGrammarExercise(index, "options_ru", newOptionsRu)
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...(exercise.options || []), ""]
                                updateGrammarExercise(index, "options", newOptions)
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        )}

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2 mt-3`}>
                          <Input
                            placeholder="Hint (English)"
                            value={exercise.hint || ""}
                            onChange={(e) => updateGrammarExercise(index, "hint", e.target.value)}
                          />
                          {showRussianFields && (
                            <Input
                              placeholder="Hint (Russian)"
                              value={(exercise as any).hint_ru || ""}
                              onChange={(e) => updateGrammarExercise(index, "hint_ru", e.target.value)}
                            />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pronunciation Tab */}
          <TabsContent value="pronunciation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pronunciation Section</CardTitle>
                <CardDescription>Configure pronunciation focus areas and exercises</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="pronunciation-focus">Focus Areas (English)</Label>
                    <Textarea
                      id="pronunciation-focus"
                      value={editedModule.pronunciation.focus}
                      onChange={(e) => updateNestedField("pronunciation", "focus", e.target.value)}
                      rows={3}
                      placeholder="Describe pronunciation focus areas..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="pronunciation-focus-ru">Focus Areas (Russian)</Label>
                      <Textarea
                        id="pronunciation-focus-ru"
                        value={(editedModule.pronunciation as any).focus_ru}
                        onChange={(e) => updateNestedField("pronunciation", "focus_ru", e.target.value)}
                        rows={3}
                        placeholder="Опишите области фокуса произношения..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="pronunciation-content">Content (English)</Label>
                    <Textarea
                      id="pronunciation-content"
                      value={editedModule.pronunciation.content}
                      onChange={(e) => updateNestedField("pronunciation", "content", e.target.value)}
                      rows={4}
                      placeholder="Pronunciation lesson content..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="pronunciation-content-ru">Content (Russian)</Label>
                      <Textarea
                        id="pronunciation-content-ru"
                        value={(editedModule.pronunciation as any).content_ru}
                        onChange={(e) => updateNestedField("pronunciation", "content_ru", e.target.value)}
                        rows={4}
                        placeholder="Содержание урока произношения..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="pronunciation-hint">Hint (English)</Label>
                    <Input
                      id="pronunciation-hint"
                      value={editedModule.pronunciation.hint}
                      onChange={(e) => updateNestedField("pronunciation", "hint", e.target.value)}
                      placeholder="Pronunciation learning hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="pronunciation-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="pronunciation-hint-ru"
                        value={(editedModule.pronunciation as any).hint_ru}
                        onChange={(e) => updateNestedField("pronunciation", "hint_ru", e.target.value)}
                        placeholder="Подсказка для изучения произношения..."
                      />
                    </div>
                  )}
                </div>

                {/* Minimal Pairs */}
                <div>
                  <Label>Minimal Pairs</Label>
                  <div className="space-y-2">
                    {editedModule.pronunciation.minimalPairs.map((pair, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={pair.word1}
                          onChange={(e) => {
                            const newPairs = [...editedModule.pronunciation.minimalPairs]
                            newPairs[index] = { ...pair, word1: e.target.value }
                            updateNestedField("pronunciation", "minimalPairs", newPairs)
                          }}
                          placeholder="Word 1"
                        />
                        <Input
                          value={pair.word2}
                          onChange={(e) => {
                            const newPairs = [...editedModule.pronunciation.minimalPairs]
                            newPairs[index] = { ...pair, word2: e.target.value }
                            updateNestedField("pronunciation", "minimalPairs", newPairs)
                          }}
                          placeholder="Word 2"
                        />
                        <Input
                          value={pair.audioUrl1}
                          onChange={(e) => {
                            const newPairs = [...editedModule.pronunciation.minimalPairs]
                            newPairs[index] = { ...pair, audioUrl1: e.target.value }
                            updateNestedField("pronunciation", "minimalPairs", newPairs)
                          }}
                          placeholder="Audio URL 1"
                        />
                        <Input
                          value={pair.audioUrl2}
                          onChange={(e) => {
                            const newPairs = [...editedModule.pronunciation.minimalPairs]
                            newPairs[index] = { ...pair, audioUrl2: e.target.value }
                            updateNestedField("pronunciation", "minimalPairs", newPairs)
                          }}
                          placeholder="Audio URL 2"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const newPairs = editedModule.pronunciation.minimalPairs.filter((_, i) => i !== index)
                            updateNestedField("pronunciation", "minimalPairs", newPairs)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newPairs = [
                          ...editedModule.pronunciation.minimalPairs,
                          { word1: "", word2: "", audioUrl1: "", audioUrl2: "" },
                        ]
                        updateNestedField("pronunciation", "minimalPairs", newPairs)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Minimal Pair
                    </Button>
                  </div>
                </div>

                {/* Pronunciation Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Pronunciation Exercises ({editedModule.pronunciation.exercises.length})</Label>
                    <Button onClick={addPronunciationExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {editedModule.pronunciation.exercises.map((exercise, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Exercise {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removePronunciationExercise(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <Select
                            value={exercise.type}
                            onValueChange={(value) => updatePronunciationExercise(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="listen-repeat">Listen & Repeat</SelectItem>
                              <SelectItem value="phonetic">Phonetic Practice</SelectItem>
                              <SelectItem value="minimal-pair">Minimal Pair</SelectItem>
                              <SelectItem value="stress">Word Stress</SelectItem>
                              <SelectItem value="intonation">Intonation</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Word/Phrase"
                            value={exercise.word}
                            onChange={(e) => updatePronunciationExercise(index, "word", e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <Input
                            placeholder="Phonetic transcription"
                            value={exercise.phonetic}
                            onChange={(e) => updatePronunciationExercise(index, "phonetic", e.target.value)}
                          />
                          <Input
                            placeholder="Audio URL"
                            value={exercise.audioUrl}
                            onChange={(e) => updatePronunciationExercise(index, "audioUrl", e.target.value)}
                          />
                        </div>

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                          <Input
                            placeholder="Hint (English)"
                            value={exercise.hint || ""}
                            onChange={(e) => updatePronunciationExercise(index, "hint", e.target.value)}
                          />
                          {showRussianFields && (
                            <Input
                              placeholder="Hint (Russian)"
                              value={(exercise as any).hint_ru || ""}
                              onChange={(e) => updatePronunciationExercise(index, "hint_ru", e.target.value)}
                            />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listening Tab */}
          <TabsContent value="listening" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listening Section</CardTitle>
                <CardDescription>Configure listening exercises and comprehension questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="listening-audio">Audio URL</Label>
                  <Input
                    id="listening-audio"
                    value={editedModule.listening.audioUrl}
                    onChange={(e) => updateNestedField("listening", "audioUrl", e.target.value)}
                    placeholder="/audio/listening-exercise.mp3"
                  />
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="listening-transcript">Transcript (English)</Label>
                    <Textarea
                      id="listening-transcript"
                      value={editedModule.listening.transcript}
                      onChange={(e) => updateNestedField("listening", "transcript", e.target.value)}
                      rows={6}
                      placeholder="Audio transcript in English..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="listening-transcript-ru">Transcript (Russian)</Label>
                      <Textarea
                        id="listening-transcript-ru"
                        value={(editedModule.listening as any).transcript_ru}
                        onChange={(e) => updateNestedField("listening", "transcript_ru", e.target.value)}
                        rows={6}
                        placeholder="Транскрипция аудио на русском..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="listening-content">Content (English)</Label>
                    <Textarea
                      id="listening-content"
                      value={editedModule.listening.content}
                      onChange={(e) => updateNestedField("listening", "content", e.target.value)}
                      rows={4}
                      placeholder="Listening lesson content..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="listening-content-ru">Content (Russian)</Label>
                      <Textarea
                        id="listening-content-ru"
                        value={(editedModule.listening as any).content_ru}
                        onChange={(e) => updateNestedField("listening", "content_ru", e.target.value)}
                        rows={4}
                        placeholder="Содержание урока аудирования..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="listening-hint">Hint (English)</Label>
                    <Input
                      id="listening-hint"
                      value={editedModule.listening.hint}
                      onChange={(e) => updateNestedField("listening", "hint", e.target.value)}
                      placeholder="Listening comprehension hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="listening-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="listening-hint-ru"
                        value={(editedModule.listening as any).hint_ru}
                        onChange={(e) => updateNestedField("listening", "hint_ru", e.target.value)}
                        placeholder="Подсказка для понимания на слух..."
                      />
                    </div>
                  )}
                </div>

                {/* Listening Questions */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Listening Questions ({editedModule.listening.questions.length})</Label>
                    <Button onClick={addListeningQuestion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {editedModule.listening.questions.map((question, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Question {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeListeningQuestion(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <Select
                            value={question.type}
                            onValueChange={(value) => updateListeningQuestion(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                              <SelectItem value="short-answer">Short Answer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Answer"
                            value={question.answer}
                            onChange={(e) => updateListeningQuestion(index, "answer", e.target.value)}
                          />
                        </div>

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2 mb-3`}>
                          <Input
                            placeholder="Question (English)"
                            value={question.question}
                            onChange={(e) => updateListeningQuestion(index, "question", e.target.value)}
                          />
                          {showRussianFields && (
                            <Input
                              placeholder="Question (Russian)"
                              value={(question as any).question_ru || ""}
                              onChange={(e) => updateListeningQuestion(index, "question_ru", e.target.value)}
                            />
                          )}
                        </div>

                        {question.type === "multiple-choice" && (
                          <div className="space-y-2">
                            <Label>Options</Label>
                            {(question.options || []).map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}
                              >
                                <Input
                                  placeholder={`Option ${optionIndex + 1} (EN)`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(question.options || [])]
                                    newOptions[optionIndex] = e.target.value
                                    updateListeningQuestion(index, "options", newOptions)
                                  }}
                                />
                                {showRussianFields && (
                                  <Input
                                    placeholder={`Option ${optionIndex + 1} (RU)`}
                                    value={((question as any).options_ru || [])[optionIndex] || ""}
                                    onChange={(e) => {
                                      const newOptionsRu = [...((question as any).options_ru || [])]
                                      newOptionsRu[optionIndex] = e.target.value
                                      updateListeningQuestion(index, "options_ru", newOptionsRu)
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...(question.options || []), ""]
                                updateListeningQuestion(index, "options", newOptions)
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Speaking Tab */}
          <TabsContent value="speaking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Speaking Section</CardTitle>
                <CardDescription>Configure speaking exercises and conversation practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="speaking-content">Content (English)</Label>
                    <Textarea
                      id="speaking-content"
                      value={editedModule.speaking.content}
                      onChange={(e) => updateNestedField("speaking", "content", e.target.value)}
                      rows={4}
                      placeholder="Speaking lesson content..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="speaking-content-ru">Content (Russian)</Label>
                      <Textarea
                        id="speaking-content-ru"
                        value={(editedModule.speaking as any).content_ru}
                        onChange={(e) => updateNestedField("speaking", "content_ru", e.target.value)}
                        rows={4}
                        placeholder="Содержание урока говорения..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="speaking-hint">Hint (English)</Label>
                    <Input
                      id="speaking-hint"
                      value={editedModule.speaking.hint}
                      onChange={(e) => updateNestedField("speaking", "hint", e.target.value)}
                      placeholder="Speaking practice hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="speaking-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="speaking-hint-ru"
                        value={(editedModule.speaking as any).hint_ru}
                        onChange={(e) => updateNestedField("speaking", "hint_ru", e.target.value)}
                        placeholder="Подсказка для практики говорения..."
                      />
                    </div>
                  )}
                </div>

                {/* Speaking Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Speaking Exercises ({editedModule.speaking.exercises.length})</Label>
                    <Button onClick={addSpeakingExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {editedModule.speaking.exercises.map((exercise, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Exercise {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeSpeakingExercise(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <Select
                            value={exercise.type}
                            onValueChange={(value) => updateSpeakingExercise(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="role-play">Role Play</SelectItem>
                              <SelectItem value="description">Description</SelectItem>
                              <SelectItem value="conversation">Conversation</SelectItem>
                              <SelectItem value="presentation">Presentation</SelectItem>
                              <SelectItem value="storytelling">Storytelling</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Expected Response"
                            value={exercise.expectedResponse}
                            onChange={(e) => updateSpeakingExercise(index, "expectedResponse", e.target.value)}
                          />
                        </div>

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2 mb-3`}>
                          <Textarea
                            placeholder="Prompt (English)"
                            value={exercise.prompt}
                            onChange={(e) => updateSpeakingExercise(index, "prompt", e.target.value)}
                            rows={3}
                          />
                          {showRussianFields && (
                            <Textarea
                              placeholder="Prompt (Russian)"
                              value={(exercise as any).prompt_ru || ""}
                              onChange={(e) => updateSpeakingExercise(index, "prompt_ru", e.target.value)}
                              rows={3}
                            />
                          )}
                        </div>

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                          <Input
                            placeholder="Hint (English)"
                            value={exercise.hint || ""}
                            onChange={(e) => updateSpeakingExercise(index, "hint", e.target.value)}
                          />
                          {showRussianFields && (
                            <Input
                              placeholder="Hint (Russian)"
                              value={(exercise as any).hint_ru || ""}
                              onChange={(e) => updateSpeakingExercise(index, "hint_ru", e.target.value)}
                            />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading Tab */}
          <TabsContent value="reading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reading Section</CardTitle>
                <CardDescription>Configure reading texts and comprehension questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="reading-text">Reading Text (English)</Label>
                    <Textarea
                      id="reading-text"
                      value={editedModule.reading.text}
                      onChange={(e) => updateNestedField("reading", "text", e.target.value)}
                      rows={8}
                      placeholder="Reading passage in English..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="reading-text-ru">Reading Text (Russian)</Label>
                      <Textarea
                        id="reading-text-ru"
                        value={(editedModule.reading as any).text_ru}
                        onChange={(e) => updateNestedField("reading", "text_ru", e.target.value)}
                        rows={8}
                        placeholder="Текст для чтения на русском..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="reading-hint">Hint (English)</Label>
                    <Input
                      id="reading-hint"
                      value={editedModule.reading.hint}
                      onChange={(e) => updateNestedField("reading", "hint", e.target.value)}
                      placeholder="Reading comprehension hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="reading-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="reading-hint-ru"
                        value={(editedModule.reading as any).hint_ru}
                        onChange={(e) => updateNestedField("reading", "hint_ru", e.target.value)}
                        placeholder="Подсказка для понимания прочитанного..."
                      />
                    </div>
                  )}
                </div>

                {/* Reading Questions */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Reading Questions ({editedModule.reading.questions.length})</Label>
                    <Button onClick={addReadingQuestion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {editedModule.reading.questions.map((question, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Question {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeReadingQuestion(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <Select
                            value={question.type}
                            onValueChange={(value) => updateReadingQuestion(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                              <SelectItem value="short-answer">Short Answer</SelectItem>
                              <SelectItem value="essay">Essay</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Answer"
                            value={question.answer}
                            onChange={(e) => updateReadingQuestion(index, "answer", e.target.value)}
                          />
                        </div>

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2 mb-3`}>
                          <Input
                            placeholder="Question (English)"
                            value={question.question}
                            onChange={(e) => updateReadingQuestion(index, "question", e.target.value)}
                          />
                          {showRussianFields && (
                            <Input
                              placeholder="Question (Russian)"
                              value={(question as any).question_ru || ""}
                              onChange={(e) => updateReadingQuestion(index, "question_ru", e.target.value)}
                            />
                          )}
                        </div>

                        {question.type === "multiple-choice" && (
                          <div className="space-y-2">
                            <Label>Options</Label>
                            {(question.options || []).map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}
                              >
                                <Input
                                  placeholder={`Option ${optionIndex + 1} (EN)`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(question.options || [])]
                                    newOptions[optionIndex] = e.target.value
                                    updateReadingQuestion(index, "options", newOptions)
                                  }}
                                />
                                {showRussianFields && (
                                  <Input
                                    placeholder={`Option ${optionIndex + 1} (RU)`}
                                    value={((question as any).options_ru || [])[optionIndex] || ""}
                                    onChange={(e) => {
                                      const newOptionsRu = [...((question as any).options_ru || [])]
                                      newOptionsRu[optionIndex] = e.target.value
                                      updateReadingQuestion(index, "options_ru", newOptionsRu)
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...(question.options || []), ""]
                                updateReadingQuestion(index, "options", newOptions)
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Writing Tab */}
          <TabsContent value="writing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Writing Section</CardTitle>
                <CardDescription>Configure writing exercises and prompts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="writing-content">Content (English)</Label>
                    <Textarea
                      id="writing-content"
                      value={editedModule.writing.content}
                      onChange={(e) => updateNestedField("writing", "content", e.target.value)}
                      rows={4}
                      placeholder="Writing lesson content..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="writing-content-ru">Content (Russian)</Label>
                      <Textarea
                        id="writing-content-ru"
                        value={(editedModule.writing as any).content_ru}
                        onChange={(e) => updateNestedField("writing", "content_ru", e.target.value)}
                        rows={4}
                        placeholder="Содержание урока письма..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="writing-hint">Hint (English)</Label>
                    <Input
                      id="writing-hint"
                      value={editedModule.writing.hint}
                      onChange={(e) => updateNestedField("writing", "hint", e.target.value)}
                      placeholder="Writing practice hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="writing-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="writing-hint-ru"
                        value={(editedModule.writing as any).hint_ru}
                        onChange={(e) => updateNestedField("writing", "hint_ru", e.target.value)}
                        placeholder="Подсказка для практики письма..."
                      />
                    </div>
                  )}
                </div>

                {/* Writing Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Writing Exercises ({editedModule.writing.exercises.length})</Label>
                    <Button onClick={addWritingExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {editedModule.writing.exercises.map((exercise, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Exercise {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeWritingExercise(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <Select
                            value={exercise.type}
                            onValueChange={(value) => updateWritingExercise(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="essay">Essay</SelectItem>
                              <SelectItem value="letter">Letter</SelectItem>
                              <SelectItem value="story">Story</SelectItem>
                              <SelectItem value="description">Description</SelectItem>
                              <SelectItem value="summary">Summary</SelectItem>
                              <SelectItem value="creative">Creative Writing</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="Min Words"
                            value={exercise.minWords}
                            onChange={(e) =>
                              updateWritingExercise(index, "minWords", Number.parseInt(e.target.value) || 0)
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Max Words"
                            value={exercise.maxWords}
                            onChange={(e) =>
                              updateWritingExercise(index, "maxWords", Number.parseInt(e.target.value) || 0)
                            }
                          />
                        </div>

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2 mb-3`}>
                          <Textarea
                            placeholder="Prompt (English)"
                            value={exercise.prompt}
                            onChange={(e) => updateWritingExercise(index, "prompt", e.target.value)}
                            rows={3}
                          />
                          {showRussianFields && (
                            <Textarea
                              placeholder="Prompt (Russian)"
                              value={(exercise as any).prompt_ru || ""}
                              onChange={(e) => updateWritingExercise(index, "prompt_ru", e.target.value)}
                              rows={3}
                            />
                          )}
                        </div>

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                          <Input
                            placeholder="Hint (English)"
                            value={exercise.hint || ""}
                            onChange={(e) => updateWritingExercise(index, "hint", e.target.value)}
                          />
                          {showRussianFields && (
                            <Input
                              placeholder="Hint (Russian)"
                              value={(exercise as any).hint_ru || ""}
                              onChange={(e) => updateWritingExercise(index, "hint_ru", e.target.value)}
                            />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cultural Tab */}
          <TabsContent value="cultural" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cultural Information</CardTitle>
                <CardDescription>Configure cultural content and souvenir for this module</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="cultural-title">Cultural Title (English)</Label>
                    <Input
                      id="cultural-title"
                      value={editedModule.cultural.title}
                      onChange={(e) => updateNestedField("cultural", "title", e.target.value)}
                      placeholder="Cultural topic title"
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="cultural-title-ru">Cultural Title (Russian)</Label>
                      <Input
                        id="cultural-title-ru"
                        value={(editedModule.cultural as any).title_ru}
                        onChange={(e) => updateNestedField("cultural", "title_ru", e.target.value)}
                        placeholder="Заголовок культурной темы"
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="cultural-content">Cultural Content (English)</Label>
                    <Textarea
                      id="cultural-content"
                      value={editedModule.cultural.content}
                      onChange={(e) => updateNestedField("cultural", "content", e.target.value)}
                      rows={6}
                      placeholder="Describe the cultural aspects..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="cultural-content-ru">Cultural Content (Russian)</Label>
                      <Textarea
                        id="cultural-content-ru"
                        value={(editedModule.cultural as any).content_ru}
                        onChange={(e) => updateNestedField("cultural", "content_ru", e.target.value)}
                        rows={6}
                        placeholder="Опишите культурные аспекты..."
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Cultural Souvenir</h3>

                  <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4 mb-4`}>
                    <div>
                      <Label htmlFor="souvenir-name">Souvenir Name (English)</Label>
                      <Input
                        id="souvenir-name"
                        value={editedModule.cultural.souvenir.name}
                        onChange={(e) => {
                          const newSouvenir = { ...editedModule.cultural.souvenir, name: e.target.value }
                          updateNestedField("cultural", "souvenir", newSouvenir)
                        }}
                        placeholder="Souvenir name"
                      />
                    </div>
                    {showRussianFields && (
                      <div>
                        <Label htmlFor="souvenir-name-ru">Souvenir Name (Russian)</Label>
                        <Input
                          id="souvenir-name-ru"
                          value={(editedModule.cultural.souvenir as any).name_ru}
                          onChange={(e) => {
                            const newSouvenir = { ...editedModule.cultural.souvenir, name_ru: e.target.value }
                            updateNestedField("cultural", "souvenir", newSouvenir)
                          }}
                          placeholder="Название сувенира"
                        />
                      </div>
                    )}
                  </div>

                  <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4 mb-4`}>
                    <div>
                      <Label htmlFor="souvenir-description">Souvenir Description (English)</Label>
                      <Textarea
                        id="souvenir-description"
                        value={editedModule.cultural.souvenir.description}
                        onChange={(e) => {
                          const newSouvenir = { ...editedModule.cultural.souvenir, description: e.target.value }
                          updateNestedField("cultural", "souvenir", newSouvenir)
                        }}
                        rows={3}
                        placeholder="Describe the souvenir..."
                      />
                    </div>
                    {showRussianFields && (
                      <div>
                        <Label htmlFor="souvenir-description-ru">Souvenir Description (Russian)</Label>
                        <Textarea
                          id="souvenir-description-ru"
                          value={(editedModule.cultural.souvenir as any).description_ru}
                          onChange={(e) => {
                            const newSouvenir = { ...editedModule.cultural.souvenir, description_ru: e.target.value }
                            updateNestedField("cultural", "souvenir", newSouvenir)
                          }}
                          rows={3}
                          placeholder="Опишите сувенир..."
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="souvenir-download">Download URL</Label>
                    <Input
                      id="souvenir-download"
                      value={editedModule.cultural.souvenir.downloadUrl}
                      onChange={(e) => {
                        const newSouvenir = { ...editedModule.cultural.souvenir, downloadUrl: e.target.value }
                        updateNestedField("cultural", "souvenir", newSouvenir)
                      }}
                      placeholder="/downloads/souvenir.pdf"
                    />
                  </div>
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="cultural-hint">Cultural Hint (English)</Label>
                    <Input
                      id="cultural-hint"
                      value={editedModule.cultural.hint}
                      onChange={(e) => updateNestedField("cultural", "hint", e.target.value)}
                      placeholder="Provide a cultural learning hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="cultural-hint-ru">Cultural Hint (Russian)</Label>
                      <Input
                        id="cultural-hint-ru"
                        value={(editedModule.cultural as any).hint_ru}
                        onChange={(e) => updateNestedField("cultural", "hint_ru", e.target.value)}
                        placeholder="Дайте культурную подсказку..."
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Quiz Questions</CardTitle>
                    <CardDescription>
                      Manage quiz questions for this module ({editedModule.quiz.length} questions)
                    </CardDescription>
                  </div>
                  <Button onClick={addQuizQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {editedModule.quiz.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">Question {index + 1}</span>
                        <Button size="sm" variant="destructive" onClick={() => removeQuizQuestion(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <Select
                          value={question.type}
                          onValueChange={(value) => updateQuizQuestion(index, "type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                            <SelectItem value="translation">Translation</SelectItem>
                            <SelectItem value="listening">Listening</SelectItem>
                            <SelectItem value="true-false">True/False</SelectItem>
                            <SelectItem value="conjugate">Conjugation</SelectItem>
                            <SelectItem value="match">Match</SelectItem>
                            <SelectItem value="write">Write Answer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Answer"
                          value={question.answer}
                          onChange={(e) => updateQuizQuestion(index, "answer", e.target.value)}
                        />
                      </div>

                      <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2 mb-3`}>
                        <Input
                          placeholder="Question (English)"
                          value={question.question}
                          onChange={(e) => updateQuizQuestion(index, "question", e.target.value)}
                        />
                        {showRussianFields && (
                          <Input
                            placeholder="Question (Russian)"
                            value={(question as any).question_ru || ""}
                            onChange={(e) => updateQuizQuestion(index, "question_ru", e.target.value)}
                          />
                        )}
                      </div>

                      {(question.type === "multiple-choice" || question.type === "listening") && (
                        <div className="space-y-2 mb-3">
                          <Label>Options</Label>
                          {(question.options || []).map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}
                            >
                              <Input
                                placeholder={`Option ${optionIndex + 1} (EN)`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])]
                                  newOptions[optionIndex] = e.target.value
                                  updateQuizQuestion(index, "options", newOptions)
                                }}
                              />
                              {showRussianFields && (
                                <Input
                                  placeholder={`Option ${optionIndex + 1} (RU)`}
                                  value={((question as any).options_ru || [])[optionIndex] || ""}
                                  onChange={(e) => {
                                    const newOptionsRu = [...((question as any).options_ru || [])]
                                    newOptionsRu[optionIndex] = e.target.value
                                    updateQuizQuestion(index, "options_ru", newOptionsRu)
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === "listening" && (
                        <div className="mb-3">
                          <Label htmlFor={`audio-url-${index}`}>Audio URL</Label>
                          <Input
                            id={`audio-url-${index}`}
                            placeholder="Audio file URL"
                            value={question.audioUrl || ""}
                            onChange={(e) => updateQuizQuestion(index, "audioUrl", e.target.value)}
                          />
                        </div>
                      )}

                      <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                        <Input
                          placeholder="Hint (English)"
                          value={question.hint || ""}
                          onChange={(e) => updateQuizQuestion(index, "hint", e.target.value)}
                        />
                        {showRussianFields && (
                          <Input
                            placeholder="Hint (Russian)"
                            value={(question as any).hint_ru || ""}
                            onChange={(e) => updateQuizQuestion(index, "hint_ru", e.target.value)}
                          />
                        )}
                      </div>
                    </Card>
                  ))}

                  {editedModule.quiz.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No quiz questions added yet.</p>
                      <p className="text-sm">Click "Add Question" to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
