"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Play, // Added Play icon for audio preview
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; // Import useRouter

// Import the new types (ensure this path is correct for your project)
import {
  ModuleData, // Used for the dataToSend structure
  ModuleVocabularyData,
  ModuleGrammarExampleData,
  ModuleGrammarExerciseData,
  ModulePronunciationMinimalPairData,
  ModulePronunciationExerciseData,
  ModuleListeningQuestionData,
  ModuleSpeakingExerciseData,
  ModuleReadingQuestionData,
  ModuleWritingExerciseData,
  ModuleQuizData,
} from "@/src/types/module"; // Adjust path as necessary

// Define the comprehensive type for the frontend state of the module being edited.
// This matches the structure that your API's GET response will be transformed into,
// and the structure that you can easily manipulate in the frontend.
// Note the inclusion of 'id' on nested objects where applicable for updates.
type EditedModuleState = {
  id: number;
  title: string;
  title_ru?: string;
  subtitle?: string;
  subtitle_ru?: string;
  level: string;
  duration: string;
  description?: string;
  description_ru?: string;
  location?: string;
  region: string;
  video_url?: string;
  map_position_x: number;
  map_position_y: number;
  story: {
    id?: number; // Primary key for ModuleStory record
    text: string;
    text_ru?: string;
    hint?: string;
    hint_ru?: string;
    mission: string;
    mission_ru?: string;
    show_translation: boolean;
    video_url?: string;
    characters: string[]; // Array of character names (frontend representation)
  };
  vocabulary: (Omit<ModuleVocabularyData, "position"> & { id?: number })[];
  grammar: {
    id?: number; // Primary key for ModuleGrammar record
    title: string;
    title_ru?: string;
    explanation: string;
    explanation_ru?: string;
    rules: string[]; // Array of rule texts (frontend representation)
    rules_ru: string[]; // Array of Russian rule texts (frontend representation)
    examples: (Omit<ModuleGrammarExampleData, "position"> & { id?: number })[];
    exercises: (Omit<ModuleGrammarExerciseData, "position" | "exercise_options"> & {
      id?: number;
      options?: string[]; // Array of option texts (frontend representation)
      options_ru?: string[]; // Array of Russian option texts (frontend representation)
    })[];
  };
  pronunciation: {
    id?: number; // Primary key for ModulePronunciation record
    focus: string;
    focus_ru?: string;
    minimalPairs: (Omit<ModulePronunciationMinimalPairData, "position"> & { id?: number })[];
    exercises: (Omit<ModulePronunciationExerciseData, "position"> & { id?: number })[];
    content: string;
    content_ru?: string;
    hint?: string;
    hint_ru?: string;
  };
  listening: {
    id?: number; // Primary key for ModuleListening record
    audio_url: string;
    transcript: string;
    transcript_ru?: string;
    questions: (Omit<ModuleListeningQuestionData, "position" | "options"> & {
      id?: number;
      options?: string[];
      options_ru?: string[];
    })[];
    content: string;
    content_ru?: string;
    hint?: string;
    hint_ru?: string;
  };
  speaking: {
    id?: number; // Primary key for ModuleSpeaking record
    exercises: (Omit<ModuleSpeakingExerciseData, "position"> & { id?: number })[];
    content: string;
    content_ru?: string;
    hint?: string;
    hint_ru?: string;
  };
  reading: {
    id?: number; // Primary key for ModuleReading record
    text: string;
    text_ru?: string;
    questions: (Omit<ModuleReadingQuestionData, "position" | "options"> & {
      id?: number;
      options?: string[];
      options_ru?: string[];
    })[];
    hint?: string;
    hint_ru?: string;
  };
  writing: {
    id?: number; // Primary key for ModuleWriting record
    exercises: (Omit<ModuleWritingExerciseData, "position"> & { id?: number })[];
    content: string;
    content_ru?: string;
    hint?: string;
    hint_ru?: string;
  };
  cultural: {
    id?: number; // Primary key for ModuleCultural record
    title: string;
    title_ru?: string;
    content: string;
    content_ru?: string;
    souvenir: {
      name: string;
      name_ru?: string;
      description: string;
      description_ru?: string;
      downloadUrl?: string;
    };
    hint?: string;
    hint_ru?: string;
  };
  quiz: (Omit<ModuleQuizData, "position" | "options"> & {
    id?: number;
    options?: string[];
    options_ru?: string[];
  })[];
  missionChallenge: {
    id?: number; // Primary key for ModuleMissionChallenge record
    title: string;
    title_ru?: string;
    description: string;
    description_ru?: string;
    requirements: string[]; // Array of requirement texts (frontend representation)
    requirements_ru: string[]; // Array of Russian requirement texts (frontend representation)
    hint?: string;
    hint_ru?: string;
  };
};

export default function EditModule() {
  const router = useRouter();
  const params = useParams();
  const moduleId = Number.parseInt(params.id as string);

  const [editedModule, setEditedModule] = useState<EditedModuleState | null>(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetching
  const [error, setError] = useState<string | null>(null); // Error state for fetching
  const [showRussianFields, setShowRussianFields] = useState(true);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchModule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/modules/admin/${moduleId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch module for editing");
        }
        const fetchedModule = await response.json();

        // --- Transform fetched Prisma data to frontend state format ---
        // This is crucial because Prisma's response for related data (like module_stories)
        // is often an array, but your frontend state models it as a single object (story).
        setEditedModule({
          id: fetchedModule.id,
          title: fetchedModule.title || "",
          title_ru: fetchedModule.title_ru || "",
          subtitle: fetchedModule.subtitle || "",
          subtitle_ru: fetchedModule.subtitle_ru || "",
          level: fetchedModule.level || "A1",
          duration: fetchedModule.duration || "3 hours",
          description: fetchedModule.description || "",
          description_ru: fetchedModule.description_ru || "",
          location: fetchedModule.location || "",
          region: fetchedModule.region || "Estonia",
          video_url: fetchedModule.video_url || "",
          map_position_x: fetchedModule.map_position_x ?? 58, // Use ?? for null/undefined
          map_position_y: fetchedModule.map_position_y ?? 24,

          // Story: Transform array to single object + characters
          story: fetchedModule.module_stories?.[0] ? {
            id: fetchedModule.module_stories[0].id,
            text: fetchedModule.module_stories[0].text || "",
            text_ru: fetchedModule.module_stories[0].text_ru || "",
            hint: fetchedModule.module_stories[0].hint || "",
            hint_ru: fetchedModule.module_stories[0].hint_ru || "",
            mission: fetchedModule.module_stories[0].mission || "",
            mission_ru: fetchedModule.module_stories[0].mission_ru || "",
            show_translation: fetchedModule.module_stories[0].show_translation ?? false,
            video_url: fetchedModule.module_stories[0].video_url || "",
            characters: fetchedModule.moduleStoryCharacters?.map((char: any) => char.character_name) || [],
          } : { id: undefined, text: "", text_ru: "", hint: "", hint_ru: "", mission: "", mission_ru: "", show_translation: false, video_url: "", characters: [] },
          
          // Vocabulary: Map array of objects
          vocabulary: fetchedModule.module_vocabulary?.map((vocab: any) => ({
            id: vocab.id,
            word: vocab.word || "",
            translation: vocab.translation || "",
            translation_ru: vocab.translation_ru || "",
            example: vocab.example || "",
            example_ru: vocab.example_ru || "",
            audio_url: vocab.audio_url || "",
          })) || [],

          // Grammar: Transform single object + nested arrays
          grammar: fetchedModule.module_grammar ? {
            id: fetchedModule.module_grammar.id,
            title: fetchedModule.module_grammar.title || "",
            title_ru: fetchedModule.module_grammar.title_ru || "",
            explanation: fetchedModule.module_grammar.explanation || "",
            explanation_ru: fetchedModule.module_grammar.explanation_ru || "",
            rules: fetchedModule.module_grammar.grammar_rules?.map((rule: any) => rule.rule) || [],
            rules_ru: fetchedModule.module_grammar.grammar_rules?.map((rule: any) => rule.rule_ru || "") || [],
            examples: fetchedModule.module_grammar.grammar_examples?.map((example: any) => ({
              id: example.id,
              sentence: example.sentence || "",
              sentence_ru: example.sentence_ru || "",
              translation: example.translation || "",
              translation_ru: example.translation_ru || "",
            })) || [],
            exercises: fetchedModule.module_grammar.grammar_exercises?.map((exercise: any) => ({
              id: exercise.id,
              type: exercise.type || "fill-blank",
              question: exercise.question || "",
              question_ru: exercise.question_ru || "",
              answer: exercise.answer || "",
              hint: exercise.hint || "",
              hint_ru: exercise.hint_ru || "",
              options: exercise.exercise_options?.map((opt: any) => opt.option_text) || [],
              options_ru: exercise.exercise_options?.map((opt: any) => opt.option_text_ru || "") || [],
            })) || [],
          } : { id: undefined, title: "", title_ru: "", explanation: "", explanation_ru: "", rules: [], rules_ru: [], examples: [], exercises: [] },

          // Pronunciation: Transform single object + nested arrays
          pronunciation: fetchedModule.module_pronunciation ? {
            id: fetchedModule.module_pronunciation.id,
            focus: fetchedModule.module_pronunciation.focus || "",
            focus_ru: fetchedModule.module_pronunciation.focus_ru || "",
            content: fetchedModule.module_pronunciation.content || "",
            content_ru: fetchedModule.module_pronunciation.content_ru || "",
            hint: fetchedModule.module_pronunciation.hint || "",
            hint_ru: fetchedModule.module_pronunciation.hint_ru || "",
            minimalPairs: fetchedModule.module_pronunciation.minimal_pairs?.map((pair: any) => ({
              id: pair.id,
              word1: pair.word1 || "",
              word2: pair.word2 || "",
              sound1: pair.sound1 || "",
              sound2: pair.sound2 || "",
              audio_url1: pair.audio_url1 || "",
              audio_url2: pair.audio_url2 || "",
            })) || [],
            exercises: fetchedModule.module_pronunciation.exercises?.map((exercise: any) => ({
              id: exercise.id,
              type: exercise.type || "listen-repeat",
              word: exercise.word || "",
              phonetic: exercise.phonetic || "",
              audio_url: exercise.audio_url || "",
              hint: exercise.hint || "",
              hint_ru: exercise.hint_ru || "",
            })) || [],
          } : { id: undefined, focus: "", focus_ru: "", minimalPairs: [], exercises: [], content: "", content_ru: "", hint: "", hint_ru: "" },

          // Listening: Transform single object + nested arrays
          listening: fetchedModule.module_listening ? {
            id: fetchedModule.module_listening.id,
            audio_url: fetchedModule.module_listening.audio_url || "",
            transcript: fetchedModule.module_listening.transcript || "",
            transcript_ru: fetchedModule.module_listening.transcript_ru || "",
            content: fetchedModule.module_listening.content || "",
            content_ru: fetchedModule.module_listening.content_ru || "",
            hint: fetchedModule.module_listening.hint || "",
            hint_ru: fetchedModule.module_listening.hint_ru || "",
            questions: fetchedModule.module_listening.questions?.map((question: any) => ({
              id: question.id,
              type: question.type || "multiple-choice",
              question: question.question || "",
              question_ru: question.question_ru || "",
              answer: question.answer || "",
              options: question.options?.map((opt: any) => opt.option_text) || [],
              options_ru: question.options?.map((opt: any) => opt.option_text_ru || "") || [],
            })) || [],
          } : { id: undefined, audio_url: "", transcript: "", transcript_ru: "", questions: [], content: "", content_ru: "", hint: "", hint_ru: "" },

          // Speaking: Transform single object + nested arrays
          speaking: fetchedModule.module_speaking ? {
            id: fetchedModule.module_speaking.id,
            content: fetchedModule.module_speaking.content || "",
            content_ru: fetchedModule.module_speaking.content_ru || "",
            hint: fetchedModule.module_speaking.hint || "",
            hint_ru: fetchedModule.module_speaking.hint_ru || "",
            exercises: fetchedModule.module_speaking.exercises?.map((exercise: any) => ({
              id: exercise.id,
              type: exercise.type || "role-play",
              prompt: exercise.prompt || "",
              prompt_ru: exercise.prompt_ru || "",
              expectedResponse: exercise.expected_response || "",
              hint: exercise.hint || "",
              hint_ru: exercise.hint_ru || "",
            })) || [],
          } : { id: undefined, exercises: [], content: "", content_ru: "", hint: "", hint_ru: "" },

          // Reading: Transform single object + nested arrays
          reading: fetchedModule.module_reading ? {
            id: fetchedModule.module_reading.id,
            text: fetchedModule.module_reading.text || "",
            text_ru: fetchedModule.module_reading.text_ru || "",
            hint: fetchedModule.module_reading.hint || "",
            hint_ru: fetchedModule.module_reading.hint_ru || "",
            questions: fetchedModule.module_reading.questions?.map((question: any) => ({
              id: question.id,
              type: question.type || "multiple-choice",
              question: question.question || "",
              question_ru: question.question_ru || "",
              answer: question.answer || "",
              options: question.options?.map((opt: any) => opt.option_text) || [],
              options_ru: question.options?.map((opt: any) => opt.option_text_ru || "") || [],
            })) || [],
          } : { id: undefined, text: "", text_ru: "", questions: [], hint: "", hint_ru: "" },

          // Writing: Transform single object + nested arrays
          writing: fetchedModule.module_writing ? {
            id: fetchedModule.module_writing.id,
            content: fetchedModule.module_writing.content || "",
            content_ru: fetchedModule.module_writing.content_ru || "",
            hint: fetchedModule.module_writing.hint || "",
            hint_ru: fetchedModule.module_writing.hint_ru || "",
            exercises: fetchedModule.module_writing.exercises?.map((exercise: any) => ({
              id: exercise.id,
              type: exercise.type || "essay",
              prompt: exercise.prompt || "",
              prompt_ru: exercise.prompt_ru || "",
              minWords: exercise.min_words ?? 50,
              maxWords: exercise.max_words ?? 200,
              hint: exercise.hint || "",
              hint_ru: exercise.hint_ru || "",
            })) || [],
          } : { id: undefined, exercises: [], content: "", content_ru: "", hint: "", hint_ru: "" },

          // Cultural: Transform single object (and its nested souvenir object)
          cultural: fetchedModule.module_cultural ? {
            id: fetchedModule.module_cultural.id,
            title: fetchedModule.module_cultural.title || "",
            title_ru: fetchedModule.module_cultural.title_ru || "",
            content: fetchedModule.module_cultural.content || "",
            content_ru: fetchedModule.module_cultural.content_ru || "",
            souvenir: {
              name: fetchedModule.module_cultural.souvenir_name || "",
              name_ru: fetchedModule.module_cultural.souvenir_name_ru || "",
              description: fetchedModule.module_cultural.souvenir_description || "",
              description_ru: fetchedModule.module_cultural.souvenir_description_ru || "",
              downloadUrl: fetchedModule.module_cultural.souvenir_download_url || "",
            },
            hint: fetchedModule.module_cultural.hint || "",
            hint_ru: fetchedModule.module_cultural.hint_ru || "",
          } : { id: undefined, title: "", title_ru: "", content: "", content_ru: "", souvenir: { name: "", name_ru: "", description: "", description_ru: "", downloadUrl: "" }, hint: "", hint_ru: "" },
          
          // Quiz: Map array of objects with nested options
          quiz: fetchedModule.module_quizzes?.map((question: any) => ({
            id: question.id,
            type: question.type || "multiple-choice",
            question: question.question || "",
            question_ru: question.question_ru || "",
            answer: question.answer || "",
            hint: question.hint || "",
            hint_ru: question.hint_ru || "",
            audio_url: question.audio_url || "",
            options: question.options?.map((opt: any) => opt.option_text) || [],
            options_ru: question.options?.map((opt: any) => opt.option_text_ru || "") || [],
          })) || [],

          // Mission Challenge: Transform single object + nested requirements array
          missionChallenge: fetchedModule.module_mission_challenges ? {
            id: fetchedModule.module_mission_challenges.id,
            title: fetchedModule.module_mission_challenges.title || "",
            title_ru: fetchedModule.module_mission_challenges.title_ru || "",
            description: fetchedModule.module_mission_challenges.description || "",
            description_ru: fetchedModule.module_mission_challenges.description_ru || "",
            hint: fetchedModule.module_mission_challenges.hint || "",
            hint_ru: fetchedModule.module_mission_challenges.hint_ru || "",
            requirements: fetchedModule.module_mission_challenges.requirements?.map((req: any) => req.requirement) || [],
            requirements_ru: fetchedModule.module_mission_challenges.requirements?.map((req: any) => req.requirement_ru || "") || [],
          } : { id: undefined, title: "", title_ru: "", description: "", description_ru: "", requirements: [], requirements_ru: [], hint: "", hint_ru: "" },
        });

      } catch (err: any) {
        console.error("Error fetching module:", err);
        setError(err.message || "An unexpected error occurred while loading the module.");
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]); // Re-run effect if moduleId changes









const handleSave = async () => {
    if (!editedModule || !editedModule.id) {
      alert("Cannot save: Module not loaded or has no ID.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const dataToSend: Partial<ModuleData> = {
      title: editedModule.title,
      title_ru: showRussianFields ? editedModule.title_ru || null : null,
      subtitle: editedModule.subtitle || null,
      subtitle_ru: showRussianFields ? editedModule.subtitle_ru || null : null,
      level: editedModule.level,
      duration: editedModule.duration,
      description: editedModule.description || null,
      description_ru: showRussianFields ? editedModule.description_ru || null : null,
      location: editedModule.location || null,
      region: editedModule.region,
      video_url: editedModule.video_url || null,
      map_position_x: editedModule.map_position_x,
      map_position_y: editedModule.map_position_y,
    };

    // Story: Prepare direct fields for story, characters are separate
    if (editedModule.story) {
        // Prepare only the direct fields for module_stories.create
        const storyDirectData = {
            text: editedModule.story.text,
            text_ru: showRussianFields ? editedModule.story.text_ru || null : null,
            hint: editedModule.story.hint || null,
            hint_ru: showRussianFields ? editedModule.story.hint_ru || null : null,
            mission: editedModule.story.mission,
            mission_ru: showRussianFields ? editedModule.story.mission_ru || null : null,
            show_translation: editedModule.story.show_translation,
            video_url: editedModule.story.video_url || null,
        };

        // If story existed, send data for update, otherwise for create.
        // The backend's handleNestedUpdate will use the 'create' key's value for the actual data
        // and decide whether to update or create the ModuleStory record itself.
        if (editedModule.story.id) {
            // If there's an ID, it means the story record exists, so the backend should update it.
            // We just pass the direct data as the "create" payload,
            // and the backend decides whether to UPDATE or CREATE.
            (dataToSend as any).module_stories = { create: storyDirectData };
        } else if (editedModule.story.text || editedModule.story.mission) {
            // If no ID and there's content, means new story, send data for create.
            (dataToSend as any).module_stories = { create: storyDirectData };
        }

        // Characters for story are linked directly to Module, managed via deleteMany/createMany
        // This is separate from ModuleStory's direct fields.
        (dataToSend as any).moduleStoryCharacters = {
            deleteMany: {},
            createMany: {
                data: editedModule.story.characters.map((charName, index) => ({
                    character_name: charName,
                    position: index,
                })),
            },
        };
    }

    // Vocabulary: Already correctly uses deleteMany/createMany at top level
    (dataToSend as any).module_vocabulary = {
      deleteMany: {},
      createMany: {
        data: editedModule.vocabulary.map((vocab, index) => ({
          word: vocab.word,
          translation: vocab.translation,
          translation_ru: showRussianFields ? vocab.translation_ru || null : null,
          example: vocab.example || null,
          example_ru: showRussianFields ? vocab.example_ru || null : null,
          audio_url: vocab.audio_url || null,
          position: index,
        })),
      },
    };

    // Grammar: Correctly structure data for the backend's handleNestedUpdate
    if (editedModule.grammar) {
        // Only send the direct fields of ModuleGrammar under 'create'
        const grammarDirectData = {
            title: editedModule.grammar.title,
            title_ru: showRussianFields ? editedModule.grammar.title_ru || null : null,
            explanation: editedModule.grammar.explanation,
            explanation_ru: showRussianFields ? editedModule.grammar.explanation_ru || null : null,
        };
        (dataToSend as any).module_grammar = { create: grammarDirectData };

        // Send nested lists (rules, examples, exercises) separately for backend processing
        // These are handled by handleNestedUpdate which performs deleteMany/createMany based on parent ID
        (dataToSend as any).module_grammar_rules_to_manage = { // Custom key for backend to recognize
            deleteMany: {},
            createMany: {
                data: editedModule.grammar.rules.map((rule, index) => ({
                    rule: rule,
                    rule_ru: showRussianFields ? editedModule.grammar.rules_ru[index] || null : null,
                    position: index,
                })),
            },
        };
        (dataToSend as any).module_grammar_examples_to_manage = { // Custom key
            deleteMany: {},
            createMany: {
                data: editedModule.grammar.examples.map((example, index) => ({
                    sentence: example.sentence,
                    sentence_ru: showRussianFields ? example.sentence_ru || null : null,
                    translation: example.translation,
                    translation_ru: showRussianFields ? example.translation_ru || null : null,
                    position: index,
                })),
            },
        };
        (dataToSend as any).module_grammar_exercises_to_manage = { // Custom key
            deleteMany: {},
            createMany: {
                data: editedModule.grammar.exercises.map((exercise, index) => ({
                    type: exercise.type,
                    question: exercise.question,
                    question_ru: showRussianFields ? exercise.question_ru || null : null,
                    answer: exercise.answer,
                    hint: exercise.hint || null,
                    hint_ru: showRussianFields ? exercise.hint_ru || null : null,
                    position: index,
                    // Nested options for exercises still structured as createMany
                    exercise_options: {
                        createMany: {
                            data: (exercise.options || []).map((option, optIndex) => ({
                                option_text: option,
                                option_text_ru: showRussianFields ? exercise.options_ru?.[optIndex] || null : null,
                                position: optIndex,
                            })),
                        },
                    },
                })),
            },
        };
    }
    
    // Repeat the pattern for all other single-instance nested sections
    // (Pronunciation, Listening, Speaking, Reading, Writing, Cultural, Mission Challenge)
    // Send direct parent data under 'create', and send child lists under custom keys.

    // Pronunciation
    if (editedModule.pronunciation) {
      const pronunciationDirectData = {
        focus: editedModule.pronunciation.focus,
        focus_ru: showRussianFields ? editedModule.pronunciation.focus_ru || null : null,
        content: editedModule.pronunciation.content,
        content_ru: showRussianFields ? editedModule.pronunciation.content_ru || null : null,
        hint: editedModule.pronunciation.hint || null,
        hint_ru: showRussianFields ? editedModule.pronunciation.hint_ru || null : null,
      };
      (dataToSend as any).module_pronunciation = { create: pronunciationDirectData };

      (dataToSend as any).module_pronunciation_minimalPairs_to_manage = {
        deleteMany: {},
        createMany: {
          data: editedModule.pronunciation.minimalPairs.map((pair, index) => ({
            word1: pair.word1, word2: pair.word2, sound1: pair.sound1 || null, sound2: pair.sound2 || null,
            audio_url1: pair.audio_url1 || null, audio_url2: pair.audio_url2 || null, position: index
          }))
        }
      };
      (dataToSend as any).module_pronunciation_exercises_to_manage = {
        deleteMany: {},
        createMany: {
          data: editedModule.pronunciation.exercises.map((exercise, index) => ({
            type: exercise.type, word: exercise.word, phonetic: exercise.phonetic || null,
            audio_url: exercise.audio_url || null, hint: exercise.hint || null,
            hint_ru: showRussianFields ? exercise.hint_ru || null : null, position: index
          }))
        }
      };
    }

    // Listening
    if (editedModule.listening) {
      const listeningDirectData = {
        audio_url: editedModule.listening.audio_url,
        transcript: editedModule.listening.transcript,
        transcript_ru: showRussianFields ? editedModule.listening.transcript_ru || null : null,
        content: editedModule.listening.content,
        content_ru: showRussianFields ? editedModule.listening.content_ru || null : null,
        hint: editedModule.listening.hint || null,
        hint_ru: showRussianFields ? editedModule.listening.hint_ru || null : null,
      };
      (dataToSend as any).module_listening = { create: listeningDirectData };

      (dataToSend as any).module_listening_questions_to_manage = {
        deleteMany: {},
        createMany: {
          data: editedModule.listening.questions.map((question, index) => ({
            type: question.type, question: question.question, question_ru: showRussianFields ? question.question_ru || null : null,
            answer: question.answer, position: index,
            options: {
              createMany: {
                data: (question.options || []).map((option, optIndex) => ({
                  option_text: option,
                  option_text_ru: showRussianFields ? question.options_ru?.[optIndex] || null : null,
                  position: optIndex
                }))
              }
            }
          }))
        }
      };
    }

    // Speaking
    if (editedModule.speaking) {
      const speakingDirectData = {
        content: editedModule.speaking.content,
        content_ru: showRussianFields ? editedModule.speaking.content_ru || null : null,
        hint: editedModule.speaking.hint || null,
        hint_ru: showRussianFields ? editedModule.speaking.hint_ru || null : null,
      };
      (dataToSend as any).module_speaking = { create: speakingDirectData };

      (dataToSend as any).module_speaking_exercises_to_manage = {
        deleteMany: {},
        createMany: {
          data: editedModule.speaking.exercises.map((exercise, index) => ({
            type: exercise.type, prompt: exercise.prompt, prompt_ru: showRussianFields ? exercise.prompt_ru || null : null,
            expected_response: exercise.expectedResponse, hint: exercise.hint || null,
            hint_ru: showRussianFields ? exercise.hint_ru || null : null, position: index
          }))
        }
      };
    }

    // Reading
    if (editedModule.reading) {
      const readingDirectData = {
        text: editedModule.reading.text,
        text_ru: showRussianFields ? editedModule.reading.text_ru || null : null,
        hint: editedModule.reading.hint || null,
        hint_ru: showRussianFields ? editedModule.reading.hint_ru || null : null,
      };
      (dataToSend as any).module_reading = { create: readingDirectData };

      (dataToSend as any).module_reading_questions_to_manage = {
        deleteMany: {},
        createMany: {
          data: editedModule.reading.questions.map((question, index) => ({
            type: question.type, question: question.question, question_ru: showRussianFields ? question.question_ru || null : null,
            answer: question.answer, position: index,
            options: {
              createMany: {
                data: (question.options || []).map((option, optIndex) => ({
                  option_text: option,
                  option_text_ru: showRussianFields ? question.options_ru?.[optIndex] || null : null,
                  position: optIndex
                }))
              }
            }
          }))
        }
      };
    }

    // Writing
    if (editedModule.writing) {
      const writingDirectData = {
        content: editedModule.writing.content,
        content_ru: showRussianFields ? editedModule.writing.content_ru || null : null,
        hint: editedModule.writing.hint || null,
        hint_ru: showRussianFields ? editedModule.writing.hint_ru || null : null,
      };
      (dataToSend as any).module_writing = { create: writingDirectData };

      (dataToSend as any).module_writing_exercises_to_manage = {
        deleteMany: {},
        createMany: {
          data: editedModule.writing.exercises.map((exercise, index) => ({
            type: exercise.type, prompt: exercise.prompt, prompt_ru: showRussianFields ? exercise.prompt_ru || null : null,
            min_words: exercise.minWords, max_words: exercise.maxWords,
            hint: exercise.hint || null, hint_ru: showRussianFields ? exercise.hint_ru || null : null,
            position: index
          }))
        }
      };
    }

    // Cultural
    if (editedModule.cultural) {
      const culturalDirectData = {
        title: editedModule.cultural.title,
        title_ru: showRussianFields ? editedModule.cultural.title_ru || null : null,
        content: editedModule.cultural.content,
        content_ru: showRussianFields ? editedModule.cultural.content_ru || null : null,
        souvenir_name: editedModule.cultural.souvenir.name,
        souvenir_name_ru: showRussianFields ? editedModule.cultural.souvenir.name_ru || null : null,
        souvenir_description: editedModule.cultural.souvenir.description,
        souvenir_description_ru: showRussianFields ? editedModule.cultural.souvenir.description_ru || null : null,
        souvenir_download_url: editedModule.cultural.souvenir.downloadUrl || null,
        hint: editedModule.cultural.hint || null,
        hint_ru: showRussianFields ? editedModule.cultural.hint_ru || null : null,
      };
      (dataToSend as any).module_cultural = { create: culturalDirectData };
    }

    // Quiz (already uses deleteMany/createMany at top level, which is fine)
    (dataToSend as any).module_quizzes = {
      deleteMany: {},
      createMany: {
        data: editedModule.quiz.map((question, index) => ({
          type: question.type,
          question: question.question,
          question_ru: showRussianFields ? question.question_ru || null : null,
          answer: question.answer,
          hint: question.hint || null,
          hint_ru: showRussianFields ? question.hint_ru || null : null,
          audio_url: question.audio_url || null,
          position: index,
          options: {
            createMany: {
              data: (question.options || []).map((option, optIndex) => ({
                option_text: option,
                option_text_ru: showRussianFields ? question.options_ru?.[optIndex] || null : null,
                position: optIndex,
              })),
            },
          },
        })),
      },
    };

    // Mission Challenge
    if (editedModule.missionChallenge) {
      const missionChallengeDirectData = {
        title: editedModule.missionChallenge.title,
        title_ru: showRussianFields ? editedModule.missionChallenge.title_ru || null : null,
        description: editedModule.missionChallenge.description,
        description_ru: showRussianFields ? editedModule.missionChallenge.description_ru || null : null,
        hint: editedModule.missionChallenge.hint || null,
        hint_ru: showRussianFields ? editedModule.missionChallenge.hint_ru || null : null,
      };
      (dataToSend as any).module_mission_challenges = { create: missionChallengeDirectData };

      (dataToSend as any).module_mission_challenge_requirements_to_manage = {
        deleteMany: {},
        createMany: {
          data: editedModule.missionChallenge.requirements.map((req, index) => ({
            requirement: req,
            requirement_ru: showRussianFields ? editedModule.missionChallenge.requirements_ru[index] || null : null,
            position: index,
          })),
        },
      };
    }

    try {
      const response = await fetch(`/api/modules/admin/${editedModule.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        let errorMessage = "Failed to save module changes";
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const text = await response.text();
          console.error("Non-JSON error response:", text);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedModuleResponse = await response.json();
      console.log("Module updated successfully:", updatedModuleResponse);

      alert("Module updated successfully!");
      router.push("/admin/modules");
    } catch (err: any) {
      console.error("Error saving module:", err);
      alert(`Error saving module: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
};


  // --- Generic Update Functions (Simplified) ---
  // These helper functions are adapted to correctly access properties that might be optional (nullable)
  // from the database, and handle string conversions for numbers.
  const updateModule = (field: keyof EditedModuleState, value: any) => {
    if (!editedModule) return;
    setEditedModule((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const updateNestedField = (
    section: keyof EditedModuleState,
    field: string,
    value: any
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            [section]: {
              ...(prev[section] as object), // Cast to object to allow spread
              [field]: value,
            },
          }
        : null
    );
  };

  // Vocabulary management functions
  const addVocabularyItem = () => {
    if (!editedModule) return;
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
                audio_url: "", // Corrected to audio_url
              },
            ],
          }
        : null
    );
  };

  const updateVocabularyItem = (
    index: number,
    field: keyof (Omit<ModuleVocabularyData, "position"> & { id?: number }),
    value: string
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            vocabulary: prev.vocabulary.map((item, i) =>
              i === index ? { ...item, [field]: value } : item
            ),
          }
        : null
    );
  };

  const removeVocabularyItem = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            vocabulary: prev.vocabulary.filter((_, i) => i !== index),
          }
        : null
    );
  };

  // Grammar management functions
  const addGrammarRule = () => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        rules: [...prev.grammar.rules, ""],
        rules_ru: [...(prev.grammar.rules_ru || []), ""], // Ensure rules_ru exists
      },
    }));
  };

  const updateGrammarRule = (index: number, value: string, isRussian = false) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        [isRussian ? "rules_ru" : "rules"]: (isRussian ? prev.grammar.rules_ru || [] : prev.grammar.rules).map(
          (rule, i) => (i === index ? value : rule)
        ),
      },
    }));
  };

  const removeGrammarRule = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        rules: prev.grammar.rules.filter((_, i) => i !== index),
        rules_ru: (prev.grammar.rules_ru || []).filter((_, i) => i !== index),
      },
    }));
  };

  const addGrammarExample = () => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
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
    }));
  };

  const updateGrammarExample = (
    index: number,
    field: keyof (Omit<ModuleGrammarExampleData, "position"> & { id?: number }),
    value: string
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        examples: prev.grammar.examples.map((example, i) =>
          i === index ? { ...example, [field]: value } : example
        ),
      },
    }));
  };

  const removeGrammarExample = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      grammar: {
        ...prev.grammar,
        examples: prev.grammar.examples.filter((_, i) => i !== index),
      },
    }));
  };

  const addGrammarExercise = () => {
    if (!editedModule) return;
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
        : null
    );
  };

  const updateGrammarExercise = (
    index: number,
    field: keyof (Omit<ModuleGrammarExerciseData, "position" | "exercise_options"> & {
      id?: number;
      options?: string[];
      options_ru?: string[];
    }),
    value: any
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            grammar: {
              ...prev.grammar,
              exercises: prev.grammar.exercises.map((exercise, i) =>
                i === index ? { ...exercise, [field]: value } : exercise
              ),
            },
          }
        : null
    );
  };

  const removeGrammarExercise = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            grammar: {
              ...prev.grammar,
              exercises: prev.grammar.exercises.filter((_, i) => i !== index),
            },
          }
        : null
    );
  };


  // Pronunciation management functions
  const addMinimalPair = () => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
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
            audio_url1: "",
            audio_url2: "",
          },
        ],
      },
    }));
  };

  const updateMinimalPair = (
    index: number,
    field: keyof (Omit<ModulePronunciationMinimalPairData, "position"> & { id?: number }),
    value: string
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      pronunciation: {
        ...prev.pronunciation,
        minimalPairs: prev.pronunciation.minimalPairs.map((pair, i) =>
          i === index ? { ...pair, [field]: value } : pair
        ),
      },
    }));
  };

  const removeMinimalPair = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      pronunciation: {
        ...prev.pronunciation,
        minimalPairs: prev.pronunciation.minimalPairs.filter((_, i) => i !== index),
      },
    }));
  };

  const addPronunciationExercise = () => {
    if (!editedModule) return;
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
                  audio_url: "", // Corrected to audio_url
                  hint: "",
                  hint_ru: "",
                },
              ],
            },
          }
        : null
    );
  };

  const updatePronunciationExercise = (
    index: number,
    field: keyof (Omit<ModulePronunciationExerciseData, "position"> & { id?: number }),
    value: any
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            pronunciation: {
              ...prev.pronunciation,
              exercises: prev.pronunciation.exercises.map((exercise, i) =>
                i === index ? { ...exercise, [field]: value } : exercise
              ),
            },
          }
        : null
    );
  };

  const removePronunciationExercise = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            pronunciation: {
              ...prev.pronunciation,
              exercises: prev.pronunciation.exercises.filter((_, i) => i !== index),
            },
          }
        : null
    );
  };

  // Listening management functions
  const addListeningQuestion = () => {
    if (!editedModule) return;
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
                  options: ["", "", "", ""],
                  options_ru: ["", "", "", ""],
                  type: "multiple-choice",
                },
              ],
            },
          }
        : null
    );
  };

  const updateListeningQuestion = (
    index: number,
    field: keyof (Omit<ModuleListeningQuestionData, "position" | "options"> & {
      id?: number;
      options?: string[];
      options_ru?: string[];
    }),
    value: any
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            listening: {
              ...prev.listening,
              questions: prev.listening.questions.map((question, i) =>
                i === index ? { ...question, [field]: value } : question
              ),
            },
          }
        : null
    );
  };

  const removeListeningQuestion = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            listening: {
              ...prev.listening,
              questions: prev.listening.questions.filter((_, i) => i !== index),
            },
          }
        : null
    );
  };

  // Speaking management functions
  const addSpeakingExercise = () => {
    if (!editedModule) return;
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
        : null
    );
  };

  const updateSpeakingExercise = (
    index: number,
    field: keyof (Omit<ModuleSpeakingExerciseData, "position"> & { id?: number }),
    value: any
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            speaking: {
              ...prev.speaking,
              exercises: prev.speaking.exercises.map((exercise, i) =>
                i === index ? { ...exercise, [field]: value } : exercise
              ),
            },
          }
        : null
    );
  };

  const removeSpeakingExercise = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            speaking: {
              ...prev.speaking,
              exercises: prev.speaking.exercises.filter((_, i) => i !== index),
            },
          }
        : null
    );
  };

  // Reading management functions
  const addReadingQuestion = () => {
    if (!editedModule) return;
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
                  options: ["", "", "", ""],
                  options_ru: ["", "", "", ""],
                },
              ],
            },
          }
        : null
    );
  };

  const updateReadingQuestion = (
    index: number,
    field: keyof (Omit<ModuleReadingQuestionData, "position" | "options"> & {
      id?: number;
      options?: string[];
      options_ru?: string[];
    }),
    value: any
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            reading: {
              ...prev.reading,
              questions: prev.reading.questions.map((question, i) =>
                i === index ? { ...question, [field]: value } : question
              ),
            },
          }
        : null
    );
  };

  const removeReadingQuestion = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            reading: {
              ...prev.reading,
              questions: prev.reading.questions.filter((_, i) => i !== index),
            },
          }
        : null
    );
  };

  // Writing management functions
  const addWritingExercise = () => {
    if (!editedModule) return;
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
        : null
    );
  };

  const updateWritingExercise = (
    index: number,
    field: keyof (Omit<ModuleWritingExerciseData, "position"> & { id?: number }),
    value: any
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            writing: {
              ...prev.writing,
              exercises: prev.writing.exercises.map((exercise, i) =>
                i === index ? { ...exercise, [field]: value } : exercise
              ),
            },
          }
        : null
    );
  };

  const removeWritingExercise = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            writing: {
              ...prev.writing,
              exercises: prev.writing.exercises.filter((_, i) => i !== index),
            },
          }
        : null
    );
  };

  // Quiz management functions
  const addQuizQuestion = () => {
    if (!editedModule) return;
    const newId = Math.max(...editedModule.quiz.map((q) => q.id || 0), 0) + 1; // Generate unique ID for new frontend items
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            quiz: [
              ...prev.quiz,
              {
                id: newId, // Use temp ID for client-side key
                type: "multiple-choice",
                question: "",
                question_ru: "",
                options: ["", "", "", ""],
                options_ru: ["", "", "", ""],
                answer: "",
                hint: "",
                hint_ru: "",
                audio_url: "", // Corrected to audio_url
              },
            ],
          }
        : null
    );
  };

  const updateQuizQuestion = (
    index: number,
    field: keyof (Omit<ModuleQuizData, "position" | "options"> & {
      id?: number;
      options?: string[];
      options_ru?: string[];
    }),
    value: any
  ) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            quiz: prev.quiz.map((question, i) =>
              i === index ? { ...question, [field]: value } : question
            ),
          }
        : null
    );
  };

  const removeQuizQuestion = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) =>
      prev
        ? {
            ...prev,
            quiz: prev.quiz.filter((_, i) => i !== index),
          }
        : null
    );
  };

  // Character management functions (for story)
  const addCharacter = () => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        characters: [...prev.story.characters, ""],
      },
    }));
  };

  const updateCharacter = (index: number, value: string) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        characters: prev.story.characters.map((char, i) => (i === index ? value : char)),
      },
    }));
  };

  const removeCharacter = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        characters: prev.story.characters.filter((_, i) => i !== index),
      },
    }));
  };

  // Mission Challenge requirements management
  const addRequirement = () => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      missionChallenge: {
        ...prev.missionChallenge,
        requirements: [...prev.missionChallenge.requirements, ""],
        requirements_ru: [...(prev.missionChallenge.requirements_ru || []), ""],
      },
    }));
  };

  const updateRequirement = (index: number, value: string, isRussian = false) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      missionChallenge: {
        ...prev.missionChallenge,
        [isRussian ? "requirements_ru" : "requirements"]: (
          isRussian ? prev.missionChallenge.requirements_ru || [] : prev.missionChallenge.requirements
        ).map((req, i) => (i === index ? value : req)),
      },
    }));
  };

  const removeRequirement = (index: number) => {
    if (!editedModule) return;
    setEditedModule((prev) => ({
      ...prev,
      missionChallenge: {
        ...prev.missionChallenge,
        requirements: prev.missionChallenge.requirements.filter((_, i) => i !== index),
        requirements_ru: (prev.missionChallenge.requirements_ru || []).filter((_, i) => i !== index),
      },
    }));
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Module</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/admin/modules")}>Back to Modules</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!editedModule) {
    // This case should ideally be caught by 'error' state if fetch fails,
    // but acts as a fallback if editedModule is null for some other reason (e.g., direct access to non-existent ID).
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
    );
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRussianFields(!showRussianFields)}
            >
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
                        value={editedModule.title_ru || ""}
                        onChange={(e) => updateModule("title_ru", e.target.value)}
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
                      value={editedModule.subtitle || ""}
                      onChange={(e) => updateModule("subtitle", e.target.value)}
                      placeholder="English subtitle"
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="module-subtitle-ru">Subtitle (Russian)</Label>
                      <Input
                        id="module-subtitle-ru"
                        value={editedModule.subtitle_ru || ""}
                        onChange={(e) => updateModule("subtitle_ru", e.target.value)}
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
                      value={editedModule.location || ""}
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
                      value={editedModule.description || ""}
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
                        value={editedModule.description_ru || ""}
                        onChange={(e) => updateModule("description_ru", e.target.value)}
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
                      value={editedModule.video_url || ""}
                      onChange={(e) => updateModule("video_url", e.target.value)}
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
                      value={editedModule.map_position_x}
                      onChange={(e) =>
                        updateModule("map_position_x", Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="map-y">Map Position Y</Label>
                    <Input
                      id="map-y"
                      type="number"
                      step="0.1"
                      value={editedModule.map_position_y}
                      onChange={(e) =>
                        updateModule("map_position_y", Number.parseFloat(e.target.value) || 0)
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
                        value={editedModule.story.text_ru || ""}
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
                        value={editedModule.story.mission_ru || ""}
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
                      value={editedModule.story.hint || ""}
                      onChange={(e) => updateNestedField("story", "hint", e.target.value)}
                      placeholder="Provide a helpful learning hint in English..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="story-hint-ru">Learning Hint (Russian)</Label>
                      <Input
                        id="story-hint-ru"
                        value={editedModule.story.hint_ru || ""}
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
                    value={editedModule.story.video_url || ""}
                    onChange={(e) => updateNestedField("story", "video_url", e.target.value)}
                    placeholder="/videos/story-video.mp4"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Characters ({editedModule.story.characters.length})</Label>
                    <Button size="sm" onClick={addCharacter}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Character
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editedModule.story.characters.map((character, index) => (
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
                    {editedModule.story.characters.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No characters added yet.</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="story-show-translation"
                    checked={editedModule.story.show_translation ?? false}
                    onChange={(e) => updateNestedField("story", "show_translation", e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="story-show-translation" className="text-sm font-medium">
                    Show Translation by default
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
                    <Card key={item.id || `new-vocab-${index}`} className="p-4">
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
                            value={item.translation_ru || ""}
                            onChange={(e) => updateVocabularyItem(index, "translation_ru", e.target.value)}
                          />
                        )}
                      </div>

                      <div className={`grid ${showRussianFields ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
                        <Input
                          placeholder="Example sentence (EN)"
                          value={item.example || ""}
                          onChange={(e) => updateVocabularyItem(index, "example", e.target.value)}
                        />
                        {showRussianFields && (
                          <Input
                            placeholder="Example sentence (RU)"
                            value={item.example_ru || ""}
                            onChange={(e) => updateVocabularyItem(index, "example_ru", e.target.value)}
                          />
                        )}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Audio URL (optional)"
                            value={item.audio_url || ""}
                            onChange={(e) => updateVocabularyItem(index, "audio_url", e.target.value)}
                          />
                          {item.audio_url && (
                            <Button size="sm" variant="outline" onClick={() => new Audio(item.audio_url!).play()}>
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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
                        value={editedModule.grammar.title_ru || ""}
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
                        value={editedModule.grammar.explanation_ru || ""}
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
                    <Label>Grammar Rules ({editedModule.grammar.rules.length})</Label>
                    <Button size="sm" onClick={addGrammarRule}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editedModule.grammar.rules.map((rule, index) => (
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
                            value={editedModule.grammar.rules_ru[index] || ""}
                            onChange={(e) => updateGrammarRule(index, e.target.value, true)}
                            placeholder={`Rule ${index + 1} (Russian)`}
                          />
                        )}
                      </div>
                    ))}
                    {editedModule.grammar.rules.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No grammar rules added yet.</p>
                    )}
                  </div>
                </div>

                {/* Grammar Examples */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Examples ({editedModule.grammar.examples.length})</Label>
                    <Button size="sm" onClick={addGrammarExample}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Example
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedModule.grammar.examples.map((example, index) => (
                      <Card key={example.id || `new-grammar-example-${index}`} className="p-3">
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
                                placeholder="Estonian sentence (Russian translation)"
                                value={example.sentence_ru || ""}
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
                    {editedModule.grammar.examples.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No examples added yet.</p>
                    )}
                  </div>
                </div>

                {/* Grammar Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Exercises ({editedModule.grammar.exercises.length})</Label>
                    <Button size="sm" onClick={addGrammarExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedModule.grammar.exercises.map((exercise, index) => (
                      <Card key={exercise.id || `new-grammar-exercise-${index}`} className="p-4">
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
                              onValueChange={(value) => updateGrammarExercise(index, "type", value)}
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
                                value={exercise.hint || ""}
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
                                        const newOptions = [...(exercise.options || [])];
                                        newOptions[optIndex] = e.target.value;
                                        updateGrammarExercise(index, "options", newOptions);
                                      }}
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newOptions = [...(exercise.options || []), ""];
                                      updateGrammarExercise(index, "options", newOptions);
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
                                          const newOptions = [...(exercise.options_ru || [])];
                                          newOptions[optIndex] = e.target.value;
                                          updateGrammarExercise(index, "options_ru", newOptions);
                                        }}
                                        placeholder={`Вариант ${optIndex + 1}`}
                                      />
                                    ))}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const newOptions = [...(exercise.options_ru || []), ""];
                                        updateGrammarExercise(index, "options_ru", newOptions);
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
                    {editedModule.grammar.exercises.length === 0 && (
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
                        value={editedModule.pronunciation.focus_ru || ""}
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
                        value={editedModule.pronunciation.content_ru || ""}
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
                      value={editedModule.pronunciation.hint || ""}
                      onChange={(e) => updateNestedField("pronunciation", "hint", e.target.value)}
                      placeholder="Pronunciation learning hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="pronunciation-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="pronunciation-hint-ru"
                        value={editedModule.pronunciation.hint_ru || ""}
                        onChange={(e) => updateNestedField("pronunciation", "hint_ru", e.target.value)}
                        placeholder="Подсказка для изучения произношения..."
                      />
                    </div>
                  )}
                </div>

                {/* Minimal Pairs */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Minimal Pairs ({editedModule.pronunciation.minimalPairs.length})</Label>
                    <Button size="sm" onClick={addMinimalPair}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Minimal Pair
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedModule.pronunciation.minimalPairs.map((pair, index) => (
                      <Card key={pair.id || `new-minimal-pair-${index}`} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Minimal Pair {index + 1}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeMinimalPair(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Word 1</Label>
                            <Input
                              placeholder="Word 1"
                              value={pair.word1}
                              onChange={(e) => updateMinimalPair(index, "word1", e.target.value)}
                            />
                            <Label>Sound 1 (IPA)</Label>
                            <Input
                              placeholder="Sound 1"
                              value={pair.sound1 || ""}
                              onChange={(e) => updateMinimalPair(index, "sound1", e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Label htmlFor={`minimal-pair-audio1-${index}`}>Audio URL 1</Label>
                              <Input
                                id={`minimal-pair-audio1-${index}`}
                                placeholder="Audio URL 1"
                                value={pair.audio_url1 || ""}
                                onChange={(e) => updateMinimalPair(index, "audio_url1", e.target.value)}
                              />
                              {pair.audio_url1 && (
                                <Button size="sm" variant="outline" onClick={() => new Audio(pair.audio_url1!).play()}>
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Word 2</Label>
                            <Input
                              placeholder="Word 2"
                              value={pair.word2}
                              onChange={(e) => updateMinimalPair(index, "word2", e.target.value)}
                            />
                            <Label>Sound 2 (IPA)</Label>
                            <Input
                              placeholder="Sound 2"
                              value={pair.sound2 || ""}
                              onChange={(e) => updateMinimalPair(index, "sound2", e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Label htmlFor={`minimal-pair-audio2-${index}`}>Audio URL 2</Label>
                              <Input
                                id={`minimal-pair-audio2-${index}`}
                                placeholder="Audio URL 2"
                                value={pair.audio_url2 || ""}
                                onChange={(e) => updateMinimalPair(index, "audio_url2", e.target.value)}
                              />
                              {pair.audio_url2 && (
                                <Button size="sm" variant="outline" onClick={() => new Audio(pair.audio_url2!).play()}>
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {editedModule.pronunciation.minimalPairs.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No minimal pairs added yet.</p>
                    )}
                  </div>
                </div>

                {/* Pronunciation Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Pronunciation Exercises ({editedModule.pronunciation.exercises.length})</Label>
                    <Button size="sm" onClick={addPronunciationExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedModule.pronunciation.exercises.map((exercise, index) => (
                      <Card key={exercise.id || `new-pronunciation-exercise-${index}`} className="p-4">
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
                              onValueChange={(value) => updatePronunciationExercise(index, "type", value)}
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
                                value={exercise.phonetic || ""}
                                onChange={(e) => updatePronunciationExercise(index, "phonetic", e.target.value)}
                                placeholder="IPA transcription"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="flex gap-2 items-center">
                                <Label htmlFor={`pronunciation-audio-url-${index}`}>Audio URL</Label>
                                <Input
                                  id={`pronunciation-audio-url-${index}`}
                                  value={exercise.audio_url || ""}
                                  onChange={(e) => updatePronunciationExercise(index, "audio_url", e.target.value)}
                                  placeholder="/audio/pronunciation.mp3"
                                />
                                {exercise.audio_url && (
                                  <Button size="sm" variant="outline" onClick={() => new Audio(exercise.audio_url!).play()}>
                                    <Play className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label>Hint (English)</Label>
                              <Input
                                value={exercise.hint || ""}
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
                    {editedModule.pronunciation.exercises.length === 0 && (
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
                <CardTitle>Listening Section</CardTitle>
                <CardDescription>Configure listening exercises and comprehension questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="listening-audio">Audio URL</Label>
                    <Input
                      id="listening-audio"
                      value={editedModule.listening.audio_url || ""}
                      onChange={(e) => updateNestedField("listening", "audio_url", e.target.value)}
                      placeholder="/audio/listening-exercise.mp3"
                    />
                  </div>
                  <div className="flex items-end">
                    {editedModule.listening.audio_url && (
                      <Button variant="outline" size="sm" onClick={() => new Audio(editedModule.listening.audio_url!).play()}>
                        <Play className="w-4 h-4 mr-2" />
                        Test Audio
                      </Button>
                    )}
                  </div>
                </div>

                <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div>
                    <Label htmlFor="listening-transcript">Transcript (English)</Label>
                    <Textarea
                      id="listening-transcript"
                      value={editedModule.listening.transcript}
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
                        value={editedModule.listening.transcript_ru || ""}
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
                      value={editedModule.listening.content}
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
                        value={editedModule.listening.content_ru || ""}
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
                    <Input
                      id="listening-hint"
                      value={editedModule.listening.hint || ""}
                      onChange={(e) => updateNestedField("listening", "hint", e.target.value)}
                      placeholder="Helpful listening hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="listening-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="listening-hint-ru"
                        value={editedModule.listening.hint_ru || ""}
                        onChange={(e) => updateNestedField("listening", "hint_ru", e.target.value)}
                        placeholder="Полезная подсказка для аудирования..."
                      />
                    </div>
                  )}
                </div>

                {/* Listening Questions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Listening Questions ({editedModule.listening.questions.length})</Label>
                    <Button size="sm" onClick={addListeningQuestion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedModule.listening.questions.map((question, index) => (
                      <Card key={question.id || `new-listening-question-${index}`} className="p-4">
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
                              onValueChange={(value) => updateListeningQuestion(index, "type", value)}
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
                                        const newOptions = [...(question.options || [])];
                                        newOptions[optIndex] = e.target.value;
                                        updateListeningQuestion(index, "options", newOptions);
                                      }}
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newOptions = [...(question.options || []), ""];
                                      updateListeningQuestion(index, "options", newOptions);
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
                                          const newOptions = [...(question.options_ru || [])];
                                          newOptions[optIndex] = e.target.value;
                                          updateListeningQuestion(index, "options_ru", newOptions);
                                        }}
                                        placeholder={`Вариант ${optIndex + 1}`}
                                      />
                                    ))}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const newOptions = [...(question.options_ru || []), ""];
                                        updateListeningQuestion(index, "options_ru", newOptions);
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
                    {editedModule.listening.questions.length === 0 && (
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
                      placeholder="Speaking lesson content and instructions..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="speaking-content-ru">Content (Russian)</Label>
                      <Textarea
                        id="speaking-content-ru"
                        value={editedModule.speaking.content_ru || ""}
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
                    <Input
                      id="speaking-hint"
                      value={editedModule.speaking.hint || ""}
                      onChange={(e) => updateNestedField("speaking", "hint", e.target.value)}
                      placeholder="Speaking practice hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="speaking-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="speaking-hint-ru"
                        value={editedModule.speaking.hint_ru || ""}
                        onChange={(e) => updateNestedField("speaking", "hint_ru", e.target.value)}
                        placeholder="Подсказка для практики говорения..."
                      />
                    </div>
                  )}
                </div>

                {/* Speaking Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Speaking Exercises ({editedModule.speaking.exercises.length})</Label>
                    <Button size="sm" onClick={addSpeakingExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedModule.speaking.exercises.map((exercise, index) => (
                      <Card key={exercise.id || `new-speaking-exercise-${index}`} className="p-4">
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
                              onValueChange={(value) => updateSpeakingExercise(index, "type", value)}
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
                                value={exercise.hint || ""}
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
                    {editedModule.speaking.exercises.length === 0 && (
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
                      placeholder="Enter the reading passage..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="reading-text-ru">Reading Text (Russian Translation)</Label>
                      <Textarea
                        id="reading-text-ru"
                        value={editedModule.reading.text_ru || ""}
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
                    <Input
                      id="reading-hint"
                      value={editedModule.reading.hint || ""}
                      onChange={(e) => updateNestedField("reading", "hint", e.target.value)}
                      placeholder="Helpful reading hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="reading-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="reading-hint-ru"
                        value={editedModule.reading.hint_ru || ""}
                        onChange={(e) => updateNestedField("reading", "hint_ru", e.target.value)}
                        placeholder="Полезная подсказка для чтения..."
                      />
                    </div>
                  )}
                </div>

                {/* Reading Questions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Reading Questions ({editedModule.reading.questions.length})</Label>
                    <Button size="sm" onClick={addReadingQuestion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedModule.reading.questions.map((question, index) => (
                      <Card key={question.id || `new-reading-question-${index}`} className="p-4">
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
                              onValueChange={(value) => updateReadingQuestion(index, "type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                <SelectItem value="true-false">True/False</SelectItem>
                                <SelectItem value="short-answer">Short Answer</SelectItem>
                                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                                <SelectItem value="essay">Essay</SelectItem>
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
                                        const newOptions = [...(question.options || [])];
                                        newOptions[optIndex] = e.target.value;
                                        updateReadingQuestion(index, "options", newOptions);
                                      }}
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newOptions = [...(question.options || []), ""];
                                      updateReadingQuestion(index, "options", newOptions);
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
                                          const newOptions = [...(question.options_ru || [])];
                                          newOptions[optIndex] = e.target.value;
                                          updateReadingQuestion(index, "options_ru", newOptions);
                                        }}
                                        placeholder={`Вариант ${optIndex + 1}`}
                                      />
                                    ))}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const newOptions = [...(question.options_ru || []), ""];
                                        updateReadingQuestion(index, "options_ru", newOptions);
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
                    {editedModule.reading.questions.length === 0 && (
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
                        value={editedModule.writing.content_ru || ""}
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
                      value={editedModule.writing.hint || ""}
                      onChange={(e) => updateNestedField("writing", "hint", e.target.value)}
                      placeholder="Writing practice hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="writing-hint-ru">Hint (Russian)</Label>
                      <Input
                        id="writing-hint-ru"
                        value={editedModule.writing.hint_ru || ""}
                        onChange={(e) => updateNestedField("writing", "hint_ru", e.target.value)}
                        placeholder="Подсказка для практики письма..."
                      />
                    </div>
                  )}
                </div>

                {/* Writing Exercises */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Writing Exercises ({editedModule.writing.exercises.length})</Label>
                    <Button size="sm" onClick={addWritingExercise}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedModule.writing.exercises.map((exercise, index) => (
                      <Card key={exercise.id || `new-writing-exercise-${index}`} className="p-4">
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
                              value={exercise.prompt_ru || ""}
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
                              value={exercise.hint_ru || ""}
                              onChange={(e) => updateWritingExercise(index, "hint_ru", e.target.value)}
                            />
                          )}
                        </div>
                      </Card>
                    ))}
                    {editedModule.writing.exercises.length === 0 && (
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
                        value={editedModule.cultural.title_ru || ""}
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
                        value={editedModule.cultural.content_ru || ""}
                        onChange={(e) => updateNestedField("cultural", "content_ru", e.target.value)}
                        rows={6}
                        placeholder="Опишите культурные аспекты..."
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Digital Souvenir</h3>

                  <div className={`grid ${showRussianFields ? "grid-cols-2" : "grid-cols-1"} gap-4 mb-4`}>
                    <div>
                      <Label htmlFor="souvenir-name">Souvenir Name (English)</Label>
                      <Input
                        id="souvenir-name"
                        value={editedModule.cultural.souvenir.name}
                        onChange={(e) => {
                          const newSouvenir = { ...editedModule.cultural.souvenir, name: e.target.value };
                          updateNestedField("cultural", "souvenir", newSouvenir);
                        }}
                        placeholder="Souvenir name"
                      />
                    </div>
                    {showRussianFields && (
                      <div>
                        <Label htmlFor="souvenir-name-ru">Souvenir Name (Russian)</Label>
                        <Input
                          id="souvenir-name-ru"
                          value={editedModule.cultural.souvenir.name_ru || ""}
                          onChange={(e) => {
                            const newSouvenir = { ...editedModule.cultural.souvenir, name_ru: e.target.value };
                            updateNestedField("cultural", "souvenir", newSouvenir);
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
                          const newSouvenir = { ...editedModule.cultural.souvenir, description: e.target.value };
                          updateNestedField("cultural", "souvenir", newSouvenir);
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
                          value={editedModule.cultural.souvenir.description_ru || ""}
                          onChange={(e) => {
                            const newSouvenir = { ...editedModule.cultural.souvenir, description_ru: e.target.value };
                            updateNestedField("cultural", "souvenir", newSouvenir);
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
                      value={editedModule.cultural.souvenir.downloadUrl || ""}
                      onChange={(e) => {
                        const newSouvenir = { ...editedModule.cultural.souvenir, downloadUrl: e.target.value };
                        updateNestedField("cultural", "souvenir", newSouvenir);
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
                      value={editedModule.cultural.hint || ""}
                      onChange={(e) => updateNestedField("cultural", "hint", e.target.value)}
                      placeholder="Provide a cultural learning hint..."
                    />
                  </div>
                  {showRussianFields && (
                    <div>
                      <Label htmlFor="cultural-hint-ru">Cultural Hint (Russian)</Label>
                      <Input
                        id="cultural-hint-ru"
                        value={editedModule.cultural.hint_ru || ""}
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
                    <Card key={question.id || `new-quiz-question-${index}`} className="p-4">
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
                            value={question.question_ru || ""}
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
                                  const newOptions = [...(question.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuizQuestion(index, "options", newOptions);
                                }}
                              />
                              {showRussianFields && (
                                <Input
                                  placeholder={`Option ${optionIndex + 1} (RU)`}
                                  value={((question as any).options_ru || [])[optionIndex] || ""}
                                  onChange={(e) => {
                                    const newOptionsRu = [...((question as any).options_ru || [])];
                                    newOptionsRu[optionIndex] = e.target.value;
                                    updateQuizQuestion(index, "options_ru", newOptionsRu);
                                  }}
                                />
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [...(question.options || []), ""];
                              updateQuizQuestion(index, "options", newOptions);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}

                      {question.type === "listening" && (
                        <div className="mb-3">
                          <Label htmlFor={`audio-url-${index}`}>Audio URL</Label>
                          <Input
                            id={`audio-url-${index}`}
                            placeholder="Audio file URL"
                            value={question.audio_url || ""}
                            onChange={(e) => updateQuizQuestion(index, "audio_url", e.target.value)}
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
                            value={question.hint_ru || ""}
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
  );
}