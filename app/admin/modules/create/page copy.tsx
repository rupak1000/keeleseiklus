"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
  Play,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { modules, type Module } from "@/data/modules"

export default function CreateModule() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [showRussianFields, setShowRussianFields] = useState(true)

  // Initialize new module with default structure
  const [newModule, setNewModule] = useState<Module>({
    id: 0, // Will be set when saving
    title: "",
    subtitle: "",
    level: "A1",
    duration: "3 hours",
    description: "",
    location: "",
    region: "Estonia",
    videoUrl: "",
    story: {
      text: "",
      text_ru: "",
      hint: "",
      hint_ru: "",
      characters: [],
      mission: "",
      mission_ru: "",
      showTranslation: false,
      videoUrl: "",
    },
    vocabulary: [],
    grammar: {
      title: "",
      title_ru: "",
      explanation: "",
      explanation_ru: "",
      rules: [],
      rules_ru: [],
      examples: [],
      exercises: [],
    },
    pronunciation: {
      focus: "",
      focus_ru: "",
      minimalPairs: [],
      exercises: [],
      content: "",
      content_ru: "",
      hint: "",
      hint_ru: "",
    },
    listening: {
      audioUrl: "",
      transcript: "",
      transcript_ru: "",
      questions: [],
      content: "",
      content_ru: "",
      hint: "",
      hint_ru: "",
    },
    speaking: {
      exercises: [],
      content: "",
      content_ru: "",
      hint: "",
      hint_ru: "",
    },
    reading: {
      text: "",
      text_ru: "",
      questions: [],
      hint: "",
      hint_ru: "",
    },
    writing: {
      exercises: [],
      content: "",
      content_ru: "",
      hint: "",
      hint_ru: "",
    },
    cultural: {
      title: "",
      title_ru: "",
      content: "",
      content_ru: "",
      souvenir: {
        name: "",
        name_ru: "",
        description: "",
        description_ru: "",
        downloadUrl: "",
      },
      hint: "",
      hint_ru: "",
    },
    quiz: [],
    missionChallenge: {
      title: "",
      title_ru: "",
      description: "",
      description_ru: "",
      requirements: [],
      requirements_ru: [],
      hint: "",
      hint_ru: "",
    },
    mapPosition: { x: 58, y: 24 },
  })

  const handleSave = async () => {
    if (!newModule.title.trim()) {
      alert("Please enter a module title before saving.")
      return
    }

    setIsSaving(true)

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Get existing modules and assign new ID
    const savedModules = localStorage.getItem("adminModules")
    const moduleList = savedModules ? JSON.parse(savedModules) : modules
    const newId = Math.max(...moduleList.map((m: Module) => m.id), 0) + 1

    const moduleToSave = { ...newModule, id: newId }

    // Save to localStorage
    const updatedModules = [...moduleList, moduleToSave]
    localStorage.setItem("adminModules", JSON.stringify(updatedModules))

    setIsSaving(false)

    // Show success message and redirect
    alert("Module created successfully!")
    router.push("/admin/modules")
  }

  const updateModule = (field: string, value: any) => {
    setNewModule((prev) => ({ ...prev, [field]: value }))
  }

  const updateNestedField = (section: string, field: string, value: any) => {
    setNewModule((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof Module],
        [field]: value,
      },
    }))
  }

  // Vocabulary management functions
  const addVocabularyItem = () => {
    setNewModule((prev) => ({
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
    }))
  }

  const updateVocabularyItem = (index: number, field: string, value: string) => {
    setNewModule((prev) => ({
      ...prev,
      vocabulary: prev.vocabulary.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const removeVocabularyItem = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      vocabulary: prev.vocabulary.filter((_, i) => i !== index),
    }))
  }

  // Grammar management functions
  const addGrammarRule = () => {
    setNewModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        rules: [...prev.grammar.rules, ""],
        rules_ru: [...(prev.grammar.rules_ru || []), ""],
      },
    }))
  }

  const updateGrammarRule = (index: number, value: string, isRussian = false) => {
    setNewModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        [isRussian ? "rules_ru" : "rules"]: (isRussian ? prev.grammar.rules_ru || [] : prev.grammar.rules).map(
          (rule, i) => (i === index ? value : rule),
        ),
      },
    }))
  }

  const removeGrammarRule = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        rules: prev.grammar.rules.filter((_, i) => i !== index),
        rules_ru: (prev.grammar.rules_ru || []).filter((_, i) => i !== index),
      },
    }))
  }

  const addGrammarExample = () => {
    setNewModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        examples: [
          ...prev.grammar.examples,
          {
            sentence: "",
            sentence_ru: "",
            translation: "",
            translation_ru: "",
          },
        ],
      },
    }))
  }

  const updateGrammarExample = (index: number, field: string, value: string) => {
    setNewModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        examples: prev.grammar.examples.map((example, i) => (i === index ? { ...example, [field]: value } : example)),
      },
    }))
  }

  const removeGrammarExample = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        examples: prev.grammar.examples.filter((_, i) => i !== index),
      },
    }))
  }

  const addGrammarExercise = () => {
    setNewModule((prev) => ({
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
    }))
  }

  const updateGrammarExercise = (index: number, field: string, value: any) => {
    setNewModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        exercises: prev.grammar.exercises.map((exercise, i) =>
          i === index ? { ...exercise, [field]: value } : exercise,
        ),
      },
    }))
  }

  const removeGrammarExercise = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        exercises: prev.grammar.exercises.filter((_, i) => i !== index),
      },
    }))
  }

  // Pronunciation management functions
  const addMinimalPair = () => {
    setNewModule((prev) => ({
      ...prev,
      pronunciation: {
        ...prev.pronunciation,
        minimalPairs: [
          ...prev.pronunciation.minimalPairs,
          {
            word1: "",
            word2: "",
            sound1: "",
            sound2: "",
            audioUrl1: "",
            audioUrl2: "",
          },
        ],
      },
    }))
  }

  const updateMinimalPair = (index: number, field: string, value: string) => {
    setNewModule((prev) => ({
      ...prev,
      pronunciation: {
        ...prev.pronunciation,
        minimalPairs: prev.pronunciation.minimalPairs.map((pair, i) =>
          i === index ? { ...pair, [field]: value } : pair,
        ),
      },
    }))
  }

  const removeMinimalPair = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      pronunciation: {
        ...prev.pronunciation,
        minimalPairs: prev.pronunciation.minimalPairs.filter((_, i) => i !== index),
      },
    }))
  }

  const addPronunciationExercise = () => {
    setNewModule((prev) => ({
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
    }))
  }

  const updatePronunciationExercise = (index: number, field: string, value: any) => {
    setNewModule((prev) => ({
      ...prev,
      pronunciation: {
        ...prev.pronunciation,
        exercises: prev.pronunciation.exercises.map((exercise, i) =>
          i === index ? { ...exercise, [field]: value } : exercise,
        ),
      },
    }))
  }

  const removePronunciationExercise = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      pronunciation: {
        ...prev.pronunciation,
        exercises: prev.pronunciation.exercises.filter((_, i) => i !== index),
      },
    }))
  }

  // Listening management functions
  const addListeningQuestion = () => {
    setNewModule((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        questions: [
          ...prev.listening.questions,
          {
            question: "",
            question_ru: "",
            answer: "",
            options: ["", "", "", ""],
            options_ru: ["", "", "", ""],
            type: "multiple-choice",
          },
        ],
      },
    }))
  }

  const updateListeningQuestion = (index: number, field: string, value: any) => {
    setNewModule((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        questions: prev.listening.questions.map((question, i) =>
          i === index ? { ...question, [field]: value } : question,
        ),
      },
    }))
  }

  const removeListeningQuestion = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        questions: prev.listening.questions.filter((_, i) => i !== index),
      },
    }))
  }

  // Speaking management functions
  const addSpeakingExercise = () => {
    setNewModule((prev) => ({
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
    }))
  }

  const updateSpeakingExercise = (index: number, field: string, value: any) => {
    setNewModule((prev) => ({
      ...prev,
      speaking: {
        ...prev.speaking,
        exercises: prev.speaking.exercises.map((exercise, i) =>
          i === index ? { ...exercise, [field]: value } : exercise,
        ),
      },
    }))
  }

  const removeSpeakingExercise = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      speaking: {
        ...prev.speaking,
        exercises: prev.speaking.exercises.filter((_, i) => i !== index),
      },
    }))
  }

  // Reading management functions
  const addReadingQuestion = () => {
    setNewModule((prev) => ({
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
            options: ["", "", "", ""],
            options_ru: ["", "", "", ""],
          },
        ],
      },
    }))
  }

  const updateReadingQuestion = (index: number, field: string, value: any) => {
    setNewModule((prev) => ({
      ...prev,
      reading: {
        ...prev.reading,
        questions: prev.reading.questions.map((question, i) =>
          i === index ? { ...question, [field]: value } : question,
        ),
      },
    }))
  }

  const removeReadingQuestion = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      reading: {
        ...prev.reading,
        questions: prev.reading.questions.filter((_, i) => i !== index),
      },
    }))
  }

  // Writing management functions
  const addWritingExercise = () => {
    setNewModule((prev) => ({
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
    }))
  }

  const updateWritingExercise = (index: number, field: string, value: any) => {
    setNewModule((prev) => ({
      ...prev,
      writing: {
        ...prev.writing,
        exercises: prev.writing.exercises.map((exercise, i) =>
          i === index ? { ...exercise, [field]: value } : exercise,
        ),
      },
    }))
  }

  const removeWritingExercise = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      writing: {
        ...prev.writing,
        exercises: prev.writing.exercises.filter((_, i) => i !== index),
      },
    }))
  }

  // Quiz management functions
  const addQuizQuestion = () => {
    const newId = Math.max(...newModule.quiz.map((q) => q.id), 0) + 1
    setNewModule((prev) => ({
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
    }))
  }

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    setNewModule((prev) => ({
      ...prev,
      quiz: prev.quiz.map((question, i) => (i === index ? { ...question, [field]: value } : question)),
    }))
  }

  const removeQuizQuestion = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      quiz: prev.quiz.filter((_, i) => i !== index),
    }))
  }

  // Character management functions
  const addCharacter = () => {
    setNewModule((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        characters: [...prev.story.characters, ""],
      },
    }))
  }

  const updateCharacter = (index: number, value: string) => {
    setNewModule((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        characters: prev.story.characters.map((char, i) => (i === index ? value : char)),
      },
    }))
  }

  const removeCharacter = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        characters: prev.story.characters.filter((_, i) => i !== index),
      },
    }))
  }

  // Mission Challenge requirements management
  const addRequirement = () => {
    setNewModule((prev) => ({
      ...prev,
      missionChallenge: {
        ...prev.missionChallenge,
        requirements: [...prev.missionChallenge.requirements, ""],
        requirements_ru: [...(prev.missionChallenge.requirements_ru || []), ""],
      },
    }))
  }

  const updateRequirement = (index: number, value: string, isRussian = false) => {
    setNewModule((prev) => ({
      ...prev,
      missionChallenge: {
        ...prev.missionChallenge,
        [isRussian ? "requirements_ru" : "requirements"]: (isRussian
          ? prev.missionChallenge.requirements_ru || []
          : prev.missionChallenge.requirements
        ).map((req, i) => (i === index ? value : req)),
      },
    }))
  }

  const removeRequirement = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      missionChallenge: {
        ...prev.missionChallenge,
        requirements: prev.missionChallenge.requirements.filter((_, i) => i !== index),
        requirements_ru: (prev.missionChallenge.requirements_ru || []).filter((_, i) => i !== index),
      },
    }))
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
                Create New Module
              </h1>
              <p className="text-gray-600 mt-2">Build a comprehensive learning module with all sections</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !newModule.title.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Creating..." : "Create Module"}
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
                    <Label htmlFor="module-title">Title (English) *</Label>
                    <Input
                      id="module-title"
                      value={newModule.title}
                      onChange={(e) => updateModule("title", e.target.value)}
                      placeholder="English title"
                      required
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="module-title-ru">Title (Russian)</Label>
                      <Input
                        id="module-title-ru"
                        value={(newModule as any).titleRu || ""}
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
                      value={newModule.subtitle}
                      onChange={(e) => updateModule("subtitle", e.target.value)}
                      placeholder="English subtitle"
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="module-subtitle-ru">Subtitle (Russian)</Label>
                      <Input
                        id="module-subtitle-ru"
                        value={(newModule as any).subtitleRu || ""}
                        onChange={(e) => updateModule("subtitleRu", e.target.value)}
                        placeholder="Русский подзаголовок"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="module-level">Level</Label>
                    <Select value={newModule.level} onValueChange={(value) => updateModule("level", value)}>
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
                      value={newModule.duration}
                      onChange={(e) => updateModule("duration", e.target.value)}
                      placeholder="e.g., 3 hours"
                    />
                  </div>
                  <div>
                    <Label htmlFor="module-location">Location</Label>
                    <Input
                      id="module-location"
                      value={newModule.location}
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
                      value={newModule.description}
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
                        value={(newModule as any).descriptionRu || ""}
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
                      value={newModule.videoUrl}
                      onChange={(e) => updateModule("videoUrl", e.target.value)}
                      placeholder="/videos/module.mp4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="module-region">Region</Label>
                    <Input
                      id="module-region"
                      value={newModule.region}
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
                      value={newModule.mapPosition.x}
                      onChange={(e) =>
                        updateModule("mapPosition", {
                          ...newModule.mapPosition,
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
                      value={newModule.mapPosition.y}
                      onChange={(e) =>
                        updateModule("mapPosition", {
                          ...newModule.mapPosition,
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
                <CardTitle>Story Configuration</CardTitle>
                <CardDescription>Set up the story content, mission, and characters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="story-text">Story Text (English)</Label>
                    <Textarea
                      id="story-text"
                      value={newModule.story.text}
                      onChange={(e) => updateNestedField("story", "text", e.target.value)}
                      rows={6}
                      placeholder="Enter the story content in English..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="story-text-ru">Story Text (Russian)</Label>
                      <Textarea
                        id="story-text-ru"
                        value={newModule.story.text_ru || ""}
                        onChange={(e) => updateNestedField("story", "text_ru", e.target.value)}
                        rows={6}
                        placeholder="Введите содержание истории на русском языке..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="story-mission">Mission (English)</Label>
                    <Textarea
                      id="story-mission"
                      value={newModule.story.mission}
                      onChange={(e) => updateNestedField("story", "mission", e.target.value)}
                      rows={3}
                      placeholder="Describe the mission or objective..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="story-mission-ru">Mission (Russian)</Label>
                      <Textarea
                        id="story-mission-ru"
                        value={newModule.story.mission_ru || ""}
                        onChange={(e) => updateNestedField("story", "mission_ru", e.target.value)}
                        rows={3}
                        placeholder="Опишите миссию или цель..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="story-hint">Hint (English)</Label>
                    <Textarea
                      id="story-hint"
                      value={newModule.story.hint}
                      onChange={(e) => updateNestedField("story", "hint", e.target.value)}
                      rows={2}
                      placeholder="Provide a helpful hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="story-hint-ru">Hint (Russian)</Label>
                      <Textarea
                        id="story-hint-ru"
                        value={newModule.story.hint_ru || ""}
                        onChange={(e) => updateNestedField("story", "hint_ru", e.target.value)}
                        rows={2}
                        placeholder="Дайте полезную подсказку..."
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="story-video">Video URL</Label>
                  <Input
                    id="story-video"
                    value={newModule.story.videoUrl || ""}
                    onChange={(e) => updateNestedField("story", "videoUrl", e.target.value)}
                    placeholder="/videos/story-video.mp4"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Characters ({newModule.story.characters.length})</Label>
                    <Button size="sm" onClick={addCharacter}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Character
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newModule.story.characters.map((character, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={character}
                          onChange={(e) => updateCharacter(index, e.target.value)}
                          placeholder={`Character ${index + 1} name`}
                        />
                        <Button size="sm" variant="destructive" onClick={() => removeCharacter(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {newModule.story.characters.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No characters added yet.</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-translation"
                    checked={newModule.story.showTranslation}
                    onChange={(e) => updateNestedField("story", "showTranslation", e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="show-translation">Show translation by default</Label>
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
                      Manage vocabulary words for this module ({newModule.vocabulary.length} words)
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
                  {newModule.vocabulary.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">Word {index + 1}</span>
                        <Button size="sm" variant="destructive" onClick={() => removeVocabularyItem(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className={`grid ${showRussianFields ? "grid-cols-3" : "grid-cols-2"} gap-2 mb-3`}>
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

                      <div className={`grid ${showRussianFields ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
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

                  {newModule.vocabulary.length === 0 && (
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
                <CardTitle>Grammar Configuration</CardTitle>
                <CardDescription>Set up grammar rules, examples, and exercises</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="grammar-title">Grammar Title (English)</Label>
                    <Input
                      id="grammar-title"
                      value={newModule.grammar.title}
                      onChange={(e) => updateNestedField("grammar", "title", e.target.value)}
                      placeholder="Grammar topic title"
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="grammar-title-ru">Grammar Title (Russian)</Label>
                      <Input
                        id="grammar-title-ru"
                        value={newModule.grammar.title_ru || ""}
                        onChange={(e) => updateNestedField("grammar", "title_ru", e.target.value)}
                        placeholder="Название грамматической темы"
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="grammar-explanation">Explanation (English)</Label>
                    <Textarea
                      id="grammar-explanation"
                      value={newModule.grammar.explanation}
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
                        value={newModule.grammar.explanation_ru || ""}
                        onChange={(e) => updateNestedField("grammar", "explanation_ru", e.target.value)}
                        rows={4}
                        placeholder="Объясните грамматическую концепцию..."
                      />
                    </div>
                  )}
                </div>

                {/* Grammar Rules */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Grammar Rules ({newModule.grammar.rules.length})</Label>
                    <Button size="sm" onClick={addGrammarRule}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newModule.grammar.rules.map((rule, index) => (
                      <div key={index} className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                        <div className="flex gap-2">
                          <Input
                            value={rule}
                            onChange={(e) => updateGrammarRule(index, e.target.value)}
                            placeholder={`Rule ${index + 1} (English)`}
                          />
                          <Button size="sm" variant="destructive" onClick={() => removeGrammarRule(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {showRussianFields && (
                          <Input
                            value={(newModule.grammar.rules_ru || [])[index] || ""}
                            onChange={(e) => updateGrammarRule(index, e.target.value, true)}
                            placeholder={`Rule ${index + 1} (Russian)`}
                          />
                        )}
                      </div>
                    ))}
                    {newModule.grammar.rules.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No grammar rules added yet.</p>
                    )}
                  </div>
                </div>

                {/* Grammar Examples */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Examples ({newModule.grammar.examples.length})</Label>
                    <Button size="sm" onClick={addGrammarExample}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Example
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {newModule.grammar.examples.map((example, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Example {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeGrammarExample(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                          <div className="space-y-2">
                            <Input
                              placeholder="Estonian sentence"
                              value={example.sentence}
                              onChange={(e) => updateGrammarExample(index, "sentence", e.target.value)}
                            />
                            <Input
                              placeholder="English translation"
                              value={example.translation}
                              onChange={(e) => updateGrammarExample(index, "translation", e.target.value)}
                            />
                          </div>
                          {showRussianFields && (
                            <div className="space-y-2">
                              <Input
                                placeholder="Estonian sentence (same)"
                                value={example.sentence_ru || example.sentence}
                                onChange={(e) => updateGrammarExample(index, "sentence_ru", e.target.value)}
                              />
                              <Input
                                placeholder="Russian translation"
                                value={example.translation_ru || ""}
                                onChange={(e) => updateGrammarExample(index, "translation_ru", e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    {newModule.grammar.examples.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No examples added yet.</p>
                    )}
                  </div>
                </div>

                {/* Grammar Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Exercises ({newModule.grammar.exercises.length})</Label>
                    <Button size="sm" onClick={addGrammarExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {newModule.grammar.exercises.map((exercise, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Exercise {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeGrammarExercise(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Exercise Type</Label>
                            <Select
                              value={exercise.type}
                              onChange={(value) => updateGrammarExercise(index, "type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                <SelectItem value="transformation">Sentence Transformation</SelectItem>
                                <SelectItem value="correction">Error Correction</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <div>
                              <Label>Question (English)</Label>
                              <Textarea
                                value={exercise.question}
                                onChange={(e) => updateGrammarExercise(index, "question", e.target.value)}
                                rows={2}
                                placeholder="Enter the exercise question..."
                              />
                            </div>
                            {showRussianFields && (
                              <div>
                                <Label>Question (Russian)</Label>
                                <Textarea
                                  value={exercise.question_ru || ""}
                                  onChange={(e) => updateGrammarExercise(index, "question_ru", e.target.value)}
                                  rows={2}
                                  placeholder="Введите вопрос упражнения..."
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Answer</Label>
                              <Input
                                value={exercise.answer}
                                onChange={(e) => updateGrammarExercise(index, "answer", e.target.value)}
                                placeholder="Correct answer"
                              />
                            </div>
                            <div>
                              <Label>Hint (English)</Label>
                              <Input
                                value={exercise.hint}
                                onChange={(e) => updateGrammarExercise(index, "hint", e.target.value)}
                                placeholder="Optional hint"
                              />
                            </div>
                          </div>

                          {showRussianFields && (
                            <div>
                              <Label>Hint (Russian)</Label>
                              <Input
                                value={exercise.hint_ru || ""}
                                onChange={(e) => updateGrammarExercise(index, "hint_ru", e.target.value)}
                                placeholder="Необязательная подсказка"
                              />
                            </div>
                          )}

                          {exercise.type === "multiple-choice" && (
                            <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                              <div>
                                <Label>Options (English)</Label>
                                <div className="space-y-2">
                                  {(exercise.options || []).map((option, optIndex) => (
                                    <Input
                                      key={optIndex}
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(exercise.options || [])]
                                        newOptions[optIndex] = e.target.value
                                        updateGrammarExercise(index, "options", newOptions)
                                      }}
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newOptions = [...(exercise.options || []), ""]
                                      updateGrammarExercise(index, "options", newOptions)
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Option
                                  </Button>
                                </div>
                              </div>
                              {showRussianFields && (
                                <div>
                                  <Label>Options (Russian)</Label>
                                  <div className="space-y-2">
                                    {(exercise.options_ru || []).map((option, optIndex) => (
                                      <Input
                                        key={optIndex}
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...(exercise.options_ru || [])]
                                          newOptions[optIndex] = e.target.value
                                          updateGrammarExercise(index, "options_ru", newOptions)
                                        }}
                                        placeholder={`Вариант ${optIndex + 1}`}
                                      />
                                    ))}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const newOptions = [...(exercise.options_ru || []), ""]
                                        updateGrammarExercise(index, "options_ru", newOptions)
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Добавить вариант
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    {newModule.grammar.exercises.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No exercises added yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pronunciation Tab */}
          <TabsContent value="pronunciation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pronunciation Configuration</CardTitle>
                <CardDescription>Set up pronunciation focus areas, minimal pairs, and exercises</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="pronunciation-focus">Focus Areas (English)</Label>
                    <Textarea
                      id="pronunciation-focus"
                      value={newModule.pronunciation.focus}
                      onChange={(e) => updateNestedField("pronunciation", "focus", e.target.value)}
                      rows={3}
                      placeholder="Describe the pronunciation focus areas..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="pronunciation-focus-ru">Focus Areas (Russian)</Label>
                      <Textarea
                        id="pronunciation-focus-ru"
                        value={newModule.pronunciation.focus_ru || ""}
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
                      value={newModule.pronunciation.content}
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
                        value={newModule.pronunciation.content_ru || ""}
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
                    <Textarea
                      id="pronunciation-hint"
                      value={newModule.pronunciation.hint}
                      onChange={(e) => updateNestedField("pronunciation", "hint", e.target.value)}
                      rows={2}
                      placeholder="Helpful pronunciation hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="pronunciation-hint-ru">Hint (Russian)</Label>
                      <Textarea
                        id="pronunciation-hint-ru"
                        value={newModule.pronunciation.hint_ru || ""}
                        onChange={(e) => updateNestedField("pronunciation", "hint_ru", e.target.value)}
                        rows={2}
                        placeholder="Полезная подсказка по произношению..."
                      />
                    </div>
                  )}
                </div>

                {/* Minimal Pairs */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Minimal Pairs ({newModule.pronunciation.minimalPairs.length})</Label>
                    <Button size="sm" onClick={addMinimalPair}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Minimal Pair
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {newModule.pronunciation.minimalPairs.map((pair, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Minimal Pair {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeMinimalPair(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Input
                              placeholder="Word 1"
                              value={pair.word1}
                              onChange={(e) => updateMinimalPair(index, "word1", e.target.value)}
                            />
                            <Input
                              placeholder="Sound 1 (IPA)"
                              value={pair.sound1}
                              onChange={(e) => updateMinimalPair(index, "sound1", e.target.value)}
                            />
                            <Input
                              placeholder="Audio URL 1"
                              value={pair.audioUrl1}
                              onChange={(e) => updateMinimalPair(index, "audioUrl1", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Input
                              placeholder="Word 2"
                              value={pair.word2}
                              onChange={(e) => updateMinimalPair(index, "word2", e.target.value)}
                            />
                            <Input
                              placeholder="Sound 2 (IPA)"
                              value={pair.sound2}
                              onChange={(e) => updateMinimalPair(index, "sound2", e.target.value)}
                            />
                            <Input
                              placeholder="Audio URL 2"
                              value={pair.audioUrl2}
                              onChange={(e) => updateMinimalPair(index, "audioUrl2", e.target.value)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                    {newModule.pronunciation.minimalPairs.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No minimal pairs added yet.</p>
                    )}
                  </div>
                </div>

                {/* Pronunciation Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Pronunciation Exercises ({newModule.pronunciation.exercises.length})</Label>
                    <Button size="sm" onClick={addPronunciationExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {newModule.pronunciation.exercises.map((exercise, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Exercise {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removePronunciationExercise(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Exercise Type</Label>
                            <Select
                              value={exercise.type}
                              onChange={(value) => updatePronunciationExercise(index, "type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="listen-repeat">Listen & Repeat</SelectItem>
                                <SelectItem value="phonetic-transcription">Phonetic Transcription</SelectItem>
                                <SelectItem value="sound-identification">Sound Identification</SelectItem>
                                <SelectItem value="word-stress">Word Stress</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Word/Phrase</Label>
                              <Input
                                value={exercise.word}
                                onChange={(e) => updatePronunciationExercise(index, "word", e.target.value)}
                                placeholder="Word or phrase to practice"
                              />
                            </div>
                            <div>
                              <Label>Phonetic Transcription</Label>
                              <Input
                                value={exercise.phonetic}
                                onChange={(e) => updatePronunciationExercise(index, "phonetic", e.target.value)}
                                placeholder="IPA transcription"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Audio URL</Label>
                              <Input
                                value={exercise.audioUrl}
                                onChange={(e) => updatePronunciationExercise(index, "audioUrl", e.target.value)}
                                placeholder="/audio/pronunciation.mp3"
                              />
                            </div>
                            <div>
                              <Label>Hint (English)</Label>
                              <Input
                                value={exercise.hint}
                                onChange={(e) => updatePronunciationExercise(index, "hint", e.target.value)}
                                placeholder="Pronunciation tip"
                              />
                            </div>
                          </div>

                          {showRussianFields && (
                            <div>
                              <Label>Hint (Russian)</Label>
                              <Input
                                value={exercise.hint_ru || ""}
                                onChange={(e) => updatePronunciationExercise(index, "hint_ru", e.target.value)}
                                placeholder="Совет по произношению"
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    {newModule.pronunciation.exercises.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No pronunciation exercises added yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listening Tab */}
          <TabsContent value="listening" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listening Configuration</CardTitle>
                <CardDescription>Set up listening comprehension content and questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="listening-audio">Audio URL</Label>
                    <Input
                      id="listening-audio"
                      value={newModule.listening.audioUrl}
                      onChange={(e) => updateNestedField("listening", "audioUrl", e.target.value)}
                      placeholder="/audio/listening-exercise.mp3"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" size="sm" disabled={!newModule.listening.audioUrl}>
                      <Play className="w-4 h-4 mr-2" />
                      Test Audio
                    </Button>
                  </div>
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="listening-transcript">Transcript (English)</Label>
                    <Textarea
                      id="listening-transcript"
                      value={newModule.listening.transcript}
                      onChange={(e) => updateNestedField("listening", "transcript", e.target.value)}
                      rows={6}
                      placeholder="Full transcript of the audio..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="listening-transcript-ru">Transcript (Russian)</Label>
                      <Textarea
                        id="listening-transcript-ru"
                        value={newModule.listening.transcript_ru || ""}
                        onChange={(e) => updateNestedField("listening", "transcript_ru", e.target.value)}
                        rows={6}
                        placeholder="Полная расшифровка аудио..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="listening-content">Content (English)</Label>
                    <Textarea
                      id="listening-content"
                      value={newModule.listening.content}
                      onChange={(e) => updateNestedField("listening", "content", e.target.value)}
                      rows={4}
                      placeholder="Listening lesson content and instructions..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="listening-content-ru">Content (Russian)</Label>
                      <Textarea
                        id="listening-content-ru"
                        value={newModule.listening.content_ru || ""}
                        onChange={(e) => updateNestedField("listening", "content_ru", e.target.value)}
                        rows={4}
                        placeholder="Содержание урока аудирования и инструкции..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="listening-hint">Hint (English)</Label>
                    <Textarea
                      id="listening-hint"
                      value={newModule.listening.hint}
                      onChange={(e) => updateNestedField("listening", "hint", e.target.value)}
                      rows={2}
                      placeholder="Helpful listening hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="listening-hint-ru">Hint (Russian)</Label>
                      <Textarea
                        id="listening-hint-ru"
                        value={newModule.listening.hint_ru || ""}
                        onChange={(e) => updateNestedField("listening", "hint_ru", e.target.value)}
                        rows={2}
                        placeholder="Полезная подсказка для аудирования..."
                      />
                    </div>
                  )}
                </div>

                {/* Listening Questions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Listening Questions ({newModule.listening.questions.length})</Label>
                    <Button size="sm" onClick={addListeningQuestion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {newModule.listening.questions.map((question, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Question {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeListeningQuestion(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Question Type</Label>
                            <Select
                              value={question.type}
                              onChange={(value) => updateListeningQuestion(index, "type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                <SelectItem value="true-false">True/False</SelectItem>
                                <SelectItem value="short-answer">Short Answer</SelectItem>
                                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <div>
                              <Label>Question (English)</Label>
                              <Textarea
                                value={question.question}
                                onChange={(e) => updateListeningQuestion(index, "question", e.target.value)}
                                rows={2}
                                placeholder="Enter the question..."
                              />
                            </div>
                            {showRussianFields && (
                              <div>
                                <Label>Question (Russian)</Label>
                                <Textarea
                                  value={question.question_ru || ""}
                                  onChange={(e) => updateListeningQuestion(index, "question_ru", e.target.value)}
                                  rows={2}
                                  placeholder="Введите вопрос..."
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <Label>Correct Answer</Label>
                            <Input
                              value={question.answer}
                              onChange={(e) => updateListeningQuestion(index, "answer", e.target.value)}
                              placeholder="Correct answer"
                            />
                          </div>

                          {question.type === "multiple-choice" && (
                            <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                              <div>
                                <Label>Options (English)</Label>
                                <div className="space-y-2">
                                  {(question.options || []).map((option, optIndex) => (
                                    <Input
                                      key={optIndex}
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(question.options || [])]
                                        newOptions[optIndex] = e.target.value
                                        updateListeningQuestion(index, "options", newOptions)
                                      }}
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newOptions = [...(question.options || []), ""]
                                      updateListeningQuestion(index, "options", newOptions)
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Option
                                  </Button>
                                </div>
                              </div>
                              {showRussianFields && (
                                <div>
                                  <Label>Options (Russian)</Label>
                                  <div className="space-y-2">
                                    {(question.options_ru || []).map((option, optIndex) => (
                                      <Input
                                        key={optIndex}
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...(question.options_ru || [])]
                                          newOptions[optIndex] = e.target.value
                                          updateListeningQuestion(index, "options_ru", newOptions)
                                        }}
                                        placeholder={`Вариант ${optIndex + 1}`}
                                      />
                                    ))}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const newOptions = [...(question.options_ru || []), ""]
                                        updateListeningQuestion(index, "options_ru", newOptions)
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Добавить вариант
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    {newModule.listening.questions.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No listening questions added yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Speaking Tab */}
          <TabsContent value="speaking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Speaking Configuration</CardTitle>
                <CardDescription>Set up speaking exercises and practice activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="speaking-content">Content (English)</Label>
                    <Textarea
                      id="speaking-content"
                      value={newModule.speaking.content}
                      onChange={(e) => updateNestedField("speaking", "content", e.target.value)}
                      rows={4}
                      placeholder="Speaking lesson content and instructions..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="speaking-content-ru">Content (Russian)</Label>
                      <Textarea
                        id="speaking-content-ru"
                        value={newModule.speaking.content_ru || ""}
                        onChange={(e) => updateNestedField("speaking", "content_ru", e.target.value)}
                        rows={4}
                        placeholder="Содержание урока говорения и инструкции..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="speaking-hint">Hint (English)</Label>
                    <Textarea
                      id="speaking-hint"
                      value={newModule.speaking.hint}
                      onChange={(e) => updateNestedField("speaking", "hint", e.target.value)}
                      rows={2}
                      placeholder="Helpful speaking hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="speaking-hint-ru">Hint (Russian)</Label>
                      <Textarea
                        id="speaking-hint-ru"
                        value={newModule.speaking.hint_ru || ""}
                        onChange={(e) => updateNestedField("speaking", "hint_ru", e.target.value)}
                        rows={2}
                        placeholder="Полезная подсказка для говорения..."
                      />
                    </div>
                  )}
                </div>

                {/* Speaking Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Speaking Exercises ({newModule.speaking.exercises.length})</Label>
                    <Button size="sm" onClick={addSpeakingExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {newModule.speaking.exercises.map((exercise, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Exercise {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeSpeakingExercise(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Exercise Type</Label>
                            <Select
                              value={exercise.type}
                              onChange={(value) => updateSpeakingExercise(index, "type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="role-play">Role Play</SelectItem>
                                <SelectItem value="conversation">Conversation Practice</SelectItem>
                                <SelectItem value="presentation">Presentation</SelectItem>
                                <SelectItem value="description">Description Task</SelectItem>
                                <SelectItem value="storytelling">Storytelling</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <div>
                              <Label>Prompt (English)</Label>
                              <Textarea
                                value={exercise.prompt}
                                onChange={(e) => updateSpeakingExercise(index, "prompt", e.target.value)}
                                rows={3}
                                placeholder="Speaking exercise prompt..."
                              />
                            </div>
                            {showRussianFields && (
                              <div>
                                <Label>Prompt (Russian)</Label>
                                <Textarea
                                  value={exercise.prompt_ru || ""}
                                  onChange={(e) => updateSpeakingExercise(index, "prompt_ru", e.target.value)}
                                  rows={3}
                                  placeholder="Задание для говорения..."
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <Label>Expected Response</Label>
                            <Textarea
                              value={exercise.expectedResponse}
                              onChange={(e) => updateSpeakingExercise(index, "expectedResponse", e.target.value)}
                              rows={2}
                              placeholder="Sample or expected response..."
                            />
                          </div>

                          <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <div>
                              <Label>Hint (English)</Label>
                              <Input
                                value={exercise.hint}
                                onChange={(e) => updateSpeakingExercise(index, "hint", e.target.value)}
                                placeholder="Speaking tip or hint"
                              />
                            </div>
                            {showRussianFields && (
                              <div>
                                <Label>Hint (Russian)</Label>
                                <Input
                                  value={exercise.hint_ru || ""}
                                  onChange={(e) => updateSpeakingExercise(index, "hint_ru", e.target.value)}
                                  placeholder="Совет или подсказка для говорения"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    {newModule.speaking.exercises.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No speaking exercises added yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading Tab */}
          <TabsContent value="reading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reading Configuration</CardTitle>
                <CardDescription>Set up reading comprehension texts and questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="reading-text">Reading Text (English)</Label>
                    <Textarea
                      id="reading-text"
                      value={newModule.reading.text}
                      onChange={(e) => updateNestedField("reading", "text", e.target.value)}
                      rows={8}
                      placeholder="Enter the reading passage..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="reading-text-ru">Reading Text (Russian Translation)</Label>
                      <Textarea
                        id="reading-text-ru"
                        value={newModule.reading.text_ru || ""}
                        onChange={(e) => updateNestedField("reading", "text_ru", e.target.value)}
                        rows={8}
                        placeholder="Введите перевод текста для чтения..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="reading-hint">Hint (English)</Label>
                    <Textarea
                      id="reading-hint"
                      value={newModule.reading.hint}
                      onChange={(e) => updateNestedField("reading", "hint", e.target.value)}
                      rows={2}
                      placeholder="Helpful reading hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="reading-hint-ru">Hint (Russian)</Label>
                      <Textarea
                        id="reading-hint-ru"
                        value={newModule.reading.hint_ru || ""}
                        onChange={(e) => updateNestedField("reading", "hint_ru", e.target.value)}
                        rows={2}
                        placeholder="Полезная подсказка для чтения..."
                      />
                    </div>
                  )}
                </div>

                {/* Reading Questions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Reading Questions ({newModule.reading.questions.length})</Label>
                    <Button size="sm" onClick={addReadingQuestion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {newModule.reading.questions.map((question, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Question {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeReadingQuestion(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Question Type</Label>
                            <Select
                              value={question.type}
                              onChange={(value) => updateReadingQuestion(index, "type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                <SelectItem value="true-false">True/False</SelectItem>
                                <SelectItem value="short-answer">Short Answer</SelectItem>
                                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <div>
                              <Label>Question (English)</Label>
                              <Textarea
                                value={question.question}
                                onChange={(e) => updateReadingQuestion(index, "question", e.target.value)}
                                rows={2}
                                placeholder="Enter the question..."
                              />
                            </div>
                            {showRussianFields && (
                              <div>
                                <Label>Question (Russian)</Label>
                                <Textarea
                                  value={question.question_ru || ""}
                                  onChange={(e) => updateReadingQuestion(index, "question_ru", e.target.value)}
                                  rows={2}
                                  placeholder="Введите вопрос..."
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <Label>Correct Answer</Label>
                            <Input
                              value={question.answer}
                              onChange={(e) => updateReadingQuestion(index, "answer", e.target.value)}
                              placeholder="Correct answer"
                            />
                          </div>

                          {question.type === "multiple-choice" && (
                            <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                              <div>
                                <Label>Options (English)</Label>
                                <div className="space-y-2">
                                  {(question.options || []).map((option, optIndex) => (
                                    <Input
                                      key={optIndex}
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(question.options || [])]
                                        newOptions[optIndex] = e.target.value
                                        updateReadingQuestion(index, "options", newOptions)
                                      }}
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newOptions = [...(question.options || []), ""]
                                      updateReadingQuestion(index, "options", newOptions)
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Option
                                  </Button>
                                </div>
                              </div>
                              {showRussianFields && (
                                <div>
                                  <Label>Options (Russian)</Label>
                                  <div className="space-y-2">
                                    {(question.options_ru || []).map((option, optIndex) => (
                                      <Input
                                        key={optIndex}
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...(question.options_ru || [])]
                                          newOptions[optIndex] = e.target.value
                                          updateReadingQuestion(index, "options_ru", newOptions)
                                        }}
                                        placeholder={`Вариант ${optIndex + 1}`}
                                      />
                                    ))}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const newOptions = [...(question.options_ru || []), ""]
                                        updateReadingQuestion(index, "options_ru", newOptions)
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Добавить вариант
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    {newModule.reading.questions.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No reading questions added yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Writing Tab */}
          <TabsContent value="writing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Writing Configuration</CardTitle>
                <CardDescription>Set up writing exercises and prompts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="writing-content">Content (English)</Label>
                    <Textarea
                      id="writing-content"
                      value={newModule.writing.content}
                      onChange={(e) => updateNestedField("writing", "content", e.target.value)}
                      rows={4}
                      placeholder="Writing lesson content and instructions..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="writing-content-ru">Content (Russian)</Label>
                      <Textarea
                        id="writing-content-ru"
                        value={newModule.writing.content_ru || ""}
                        onChange={(e) => updateNestedField("writing", "content_ru", e.target.value)}
                        rows={4}
                        placeholder="Содержание урока письма и инструкции..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="writing-hint">Hint (English)</Label>
                    <Textarea
                      id="writing-hint"
                      value={newModule.writing.hint}
                      onChange={(e) => updateNestedField("writing", "hint", e.target.value)}
                      rows={2}
                      placeholder="Helpful writing hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="writing-hint-ru">Hint (Russian)</Label>
                      <Textarea
                        id="writing-hint-ru"
                        value={newModule.writing.hint_ru || ""}
                        onChange={(e) => updateNestedField("writing", "hint_ru", e.target.value)}
                        rows={2}
                        placeholder="Полезная подсказка для письма..."
                      />
                    </div>
                  )}
                </div>

                {/* Writing Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Writing Exercises ({newModule.writing.exercises.length})</Label>
                    <Button size="sm" onClick={addWritingExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {newModule.writing.exercises.map((exercise, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Exercise {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeWritingExercise(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Exercise Type</Label>
                            <Select
                              value={exercise.type}
                              onChange={(value) => updateWritingExercise(index, "type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="essay">Essay</SelectItem>
                                <SelectItem value="letter">Letter Writing</SelectItem>
                                <SelectItem value="creative">Creative Writing</SelectItem>
                                <SelectItem value="summary">Summary</SelectItem>
                                <SelectItem value="description">Description</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <div>
                              <Label>Prompt (English)</Label>
                              <Textarea
                                value={exercise.prompt}
                                onChange={(e) => updateWritingExercise(index, "prompt", e.target.value)}
                                rows={3}
                                placeholder="Writing exercise prompt..."
                              />
                            </div>
                            {showRussianFields && (
                              <div>
                                <Label>Prompt (Russian)</Label>
                                <Textarea
                                  value={exercise.prompt_ru || ""}
                                  onChange={(e) => updateWritingExercise(index, "prompt_ru", e.target.value)}
                                  rows={3}
                                  placeholder="Задание для письма..."
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Minimum Words</Label>
                              <Input
                                type="number"
                                value={exercise.minWords}
                                onChange={(e) =>
                                  updateWritingExercise(index, "minWords", Number.parseInt(e.target.value) || 0)
                                }
                                placeholder="50"
                              />
                            </div>
                            <div>
                              <Label>Maximum Words</Label>
                              <Input
                                type="number"
                                value={exercise.maxWords}
                                onChange={(e) =>
                                  updateWritingExercise(index, "maxWords", Number.parseInt(e.target.value) || 0)
                                }
                                placeholder="200"
                              />
                            </div>
                          </div>

                          <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <div>
                              <Label>Hint (English)</Label>
                              <Input
                                value={exercise.hint}
                                onChange={(e) => updateWritingExercise(index, "hint", e.target.value)}
                                placeholder="Writing tip or hint"
                              />
                            </div>
                            {showRussianFields && (
                              <div>
                                <Label>Hint (Russian)</Label>
                                <Input
                                  value={exercise.hint_ru || ""}
                                  onChange={(e) => updateWritingExercise(index, "hint_ru", e.target.value)}
                                  placeholder="Совет или подсказка для письма"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    {newModule.writing.exercises.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No writing exercises added yet.</p>
                    )}
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
                <CardDescription>Add cultural context and downloadable souvenirs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="cultural-title">Cultural Title (English)</Label>
                    <Input
                      id="cultural-title"
                      value={newModule.cultural.title}
                      onChange={(e) => updateNestedField("cultural", "title", e.target.value)}
                      placeholder="Cultural topic title"
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="cultural-title-ru">Cultural Title (Russian)</Label>
                      <Input
                        id="cultural-title-ru"
                        value={newModule.cultural.title_ru || ""}
                        onChange={(e) => updateNestedField("cultural", "title_ru", e.target.value)}
                        placeholder="Название культурной темы"
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="cultural-content">Cultural Content (English)</Label>
                    <Textarea
                      id="cultural-content"
                      value={newModule.cultural.content}
                      onChange={(e) => updateNestedField("cultural", "content", e.target.value)}
                      rows={6}
                      placeholder="Cultural information and context..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="cultural-content-ru">Cultural Content (Russian)</Label>
                      <Textarea
                        id="cultural-content-ru"
                        value={newModule.cultural.content_ru || ""}
                        onChange={(e) => updateNestedField("cultural", "content_ru", e.target.value)}
                        rows={6}
                        placeholder="Культурная информация и контекст..."
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="cultural-hint">Hint (English)</Label>
                    <Textarea
                      id="cultural-hint"
                      value={newModule.cultural.hint}
                      onChange={(e) => updateNestedField("cultural", "hint", e.target.value)}
                      rows={2}
                      placeholder="Cultural learning hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="cultural-hint-ru">Hint (Russian)</Label>
                      <Textarea
                        id="cultural-hint-ru"
                        value={newModule.cultural.hint_ru || ""}
                        onChange={(e) => updateNestedField("cultural", "hint_ru", e.target.value)}
                        rows={2}
                        placeholder="Подсказка для изучения культуры..."
                      />
                    </div>
                  )}
                </div>

                <Card className="p-4">
                  <h4 className="font-medium mb-3">Digital Souvenir</h4>
                  <div className="space-y-3">
                    <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                      <div>
                        <Label htmlFor="souvenir-name">Souvenir Name (English)</Label>
                        <Input
                          id="souvenir-name"
                          value={newModule.cultural.souvenir.name}
                          onChange={(e) =>
                            updateNestedField("cultural", "souvenir", {
                              ...newModule.cultural.souvenir,
                              name: e.target.value,
                            })
                          }
                          placeholder="Souvenir name"
                        />
                      </div>
                      {showRussianFields && (
                        <div>
                          <Label htmlFor="souvenir-name-ru">Souvenir Name (Russian)</Label>
                          <Input
                            id="souvenir-name-ru"
                            value={newModule.cultural.souvenir.name_ru || ""}
                            onChange={(e) =>
                              updateNestedField("cultural", "souvenir", {
                                ...newModule.cultural.souvenir,
                                name_ru: e.target.value,
                              })
                            }
                            placeholder="Название сувенира"
                          />
                        </div>
                      )}
                    </div>

                    <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                      <div>
                        <Label htmlFor="souvenir-description">Description (English)</Label>
                        <Textarea
                          id="souvenir-description"
                          value={newModule.cultural.souvenir.description}
                          onChange={(e) =>
                            updateNestedField("cultural", "souvenir", {
                              ...newModule.cultural.souvenir,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Souvenir description"
                        />
                      </div>
                      {showRussianFields && (
                        <div>
                          <Label htmlFor="souvenir-description-ru">Description (Russian)</Label>
                          <Textarea
                            id="souvenir-description-ru"
                            value={newModule.cultural.souvenir.description_ru || ""}
                            onChange={(e) =>
                              updateNestedField("cultural", "souvenir", {
                                ...newModule.cultural.souvenir,
                                description_ru: e.target.value,
                              })
                            }
                            rows={3}
                            placeholder="Описание сувенира"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="souvenir-download">Download URL</Label>
                      <Input
                        id="souvenir-download"
                        value={newModule.cultural.souvenir.downloadUrl}
                        onChange={(e) =>
                          updateNestedField("cultural", "souvenir", {
                            ...newModule.cultural.souvenir,
                            downloadUrl: e.target.value,
                          })
                        }
                        placeholder="/downloads/souvenir.pdf"
                      />
                    </div>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Quiz Management</CardTitle>
                    <CardDescription>
                      Create and manage quiz questions ({newModule.quiz.length} questions)
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
                  {newModule.quiz.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Question {index + 1}</span>
                          <Badge variant="outline">{question.type}</Badge>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => removeQuizQuestion(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label>Question Type</Label>
                          <Select value={question.type} onChange={(value) => updateQuizQuestion(index, "type", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                              <SelectItem value="audio">Audio Question</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                          <div>
                            <Label>Question (English)</Label>
                            <Textarea
                              value={question.question}
                              onChange={(e) => updateQuizQuestion(index, "question", e.target.value)}
                              rows={2}
                              placeholder="Enter the question..."
                            />
                          </div>
                          {showRussianFields && (
                            <div>
                              <Label>Question (Russian)</Label>
                              <Textarea
                                value={question.question_ru || ""}
                                onChange={(e) => updateQuizQuestion(index, "question_ru", e.target.value)}
                                rows={2}
                                placeholder="Введите вопрос..."
                              />
                            </div>
                          )}
                        </div>

                        {question.type === "audio" && (
                          <div>
                            <Label>Audio URL</Label>
                            <Input
                              value={question.audioUrl || ""}
                              onChange={(e) => updateQuizQuestion(index, "audioUrl", e.target.value)}
                              placeholder="/audio/question.mp3"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Correct Answer</Label>
                            <Input
                              value={question.answer}
                              onChange={(e) => updateQuizQuestion(index, "answer", e.target.value)}
                              placeholder="Correct answer"
                            />
                          </div>
                          <div>
                            <Label>Hint (English)</Label>
                            <Input
                              value={question.hint}
                              onChange={(e) => updateQuizQuestion(index, "hint", e.target.value)}
                              placeholder="Optional hint"
                            />
                          </div>
                        </div>

                        {showRussianFields && (
                          <div>
                            <Label>Hint (Russian)</Label>
                            <Input
                              value={question.hint_ru || ""}
                              onChange={(e) => updateQuizQuestion(index, "hint_ru", e.target.value)}
                              placeholder="Необязательная подсказка"
                            />
                          </div>
                        )}

                        {(question.type === "multiple-choice" || question.type === "audio") && (
                          <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <div>
                              <Label>Options (English)</Label>
                              <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <Input
                                    key={optIndex}
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...question.options]
                                      newOptions[optIndex] = e.target.value
                                      updateQuizQuestion(index, "options", newOptions)
                                    }}
                                    placeholder={`Option ${optIndex + 1}`}
                                  />
                                ))}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newOptions = [...question.options, ""]
                                    updateQuizQuestion(index, "options", newOptions)
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                            {showRussianFields && (
                              <div>
                                <Label>Options (Russian)</Label>
                                <div className="space-y-2">
                                  {(question.options_ru || []).map((option, optIndex) => (
                                    <Input
                                      key={optIndex}
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(question.options_ru || [])]
                                        newOptions[optIndex] = e.target.value
                                        updateQuizQuestion(index, "options_ru", newOptions)
                                      }}
                                      placeholder={`Вариант ${optIndex + 1}`}
                                    />
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newOptions = [...(question.options_ru || []), ""]
                                      updateQuizQuestion(index, "options_ru", newOptions)
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Добавить вариант
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}

                  {newModule.quiz.length === 0 && (
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
