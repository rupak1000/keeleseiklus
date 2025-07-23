// src/types/module.ts

export interface ModuleData {
  id?: number; // Optional for creation, as the database generates it
  title: string;
  title_ru?: string | null;
  subtitle?: string | null;
  subtitle_ru?: string | null;
  level: string;
  duration: string;
  description?: string | null;
  description_ru?: string | null;
  location?: string | null;
  region?: string | null;
  video_url?: string | null;
  map_position_x: number;
  map_position_y: number;

  // Nested structures for Prisma's create operations
  module_stories?: { create: ModuleStoryData[] };
  module_vocabulary?: { create: ModuleVocabularyData[] };
  module_grammar?: { create: ModuleGrammarData }; // Grammar is a single nested object
  module_pronunciation?: { create: ModulePronunciationData };
  module_listening?: { create: ModuleListeningData };
  module_speaking?: { create: ModuleSpeakingData };
  module_reading?: { create: ModuleReadingData };
  module_writing?: { create: ModuleWritingData };
  module_cultural?: { create: ModuleCulturalData };
  module_quizzes?: { create: ModuleQuizData[] };
  module_mission_challenges?: { create: ModuleMissionChallengeData };
  moduleStoryCharacters?: { create: ModuleStoryCharacterData[] };
}

export interface ModuleStoryData {
  id?: number;
  text: string;
  text_ru?: string | null;
  hint?: string | null;
  hint_ru?: string | null;
  mission: string;
  mission_ru?: string | null;
  show_translation: boolean;
  video_url?: string | null;
}

export interface ModuleStoryCharacterData {
  id?: number;
  character_name: string;
  position: number;
}

export interface ModuleVocabularyData {
  id?: number;
  word: string;
  translation: string;
  translation_ru?: string | null;
  example?: string | null;
  example_ru?: string | null;
  audio_url?: string | null;
  position: number;
}

export interface ModuleGrammarData {
  id?: number;
  title: string;
  title_ru?: string | null;
  explanation: string;
  explanation_ru?: string | null;
  grammar_rules?: { create: ModuleGrammarRuleData[] };
  grammar_examples?: { create: ModuleGrammarExampleData[] };
  grammar_exercises?: { create: ModuleGrammarExerciseData[] };
}

export interface ModuleGrammarRuleData {
  id?: number;
  rule: string;
  rule_ru?: string | null;
  position: number;
}

export interface ModuleGrammarExampleData {
  id?: number;
  sentence: string;
  sentence_ru?: string | null;
  translation: string;
  translation_ru?: string | null;
  position: number;
}

export interface ModuleGrammarExerciseData {
  id?: number;
  type: string;
  question: string;
  question_ru?: string | null;
  answer: string;
  hint?: string | null;
  hint_ru?: string | null;
  position: number;
  exercise_options?: { create: ModuleGrammarExerciseOptionData[] };
}

export interface ModuleGrammarExerciseOptionData {
  id?: number;
  option_text: string;
  option_text_ru?: string | null;
  position: number;
}

export interface ModulePronunciationData {
  id?: number;
  focus: string;
  focus_ru?: string | null;
  content: string;
  content_ru?: string | null;
  hint?: string | null;
  hint_ru?: string | null;
  minimal_pairs?: { create: ModulePronunciationMinimalPairData[] };
  exercises?: { create: ModulePronunciationExerciseData[] };
}

export interface ModulePronunciationMinimalPairData {
  id?: number;
  word1: string;
  word2: string;
  sound1: string;
  sound2: string;
  audio_url1?: string | null;
  audio_url2?: string | null;
  position: number;
}

export interface ModulePronunciationExerciseData {
  id?: number;
  type: string;
  word: string;
  phonetic: string;
  audio_url?: string | null;
  hint?: string | null;
  hint_ru?: string | null;
  position: number;
}

export interface ModuleListeningData {
  id?: number;
  audio_url: string;
  transcript: string;
  transcript_ru?: string | null;
  content: string;
  content_ru?: string | null;
  hint?: string | null;
  hint_ru?: string | null;
  questions?: { create: ModuleListeningQuestionData[] };
}

export interface ModuleListeningQuestionData {
  id?: number;
  type: string;
  question: string;
  question_ru?: string | null;
  answer: string;
  position: number;
  options?: { create: ModuleListeningQuestionOptionData[] };
}

export interface ModuleListeningQuestionOptionData {
  id?: number;
  option_text: string;
  option_text_ru?: string | null;
  position: number;
}

export interface ModuleSpeakingData {
  id?: number;
  content: string;
  content_ru?: string | null;
  hint?: string | null;
  hint_ru?: string | null;
  exercises?: { create: ModuleSpeakingExerciseData[] };
}

export interface ModuleSpeakingExerciseData {
  id?: number;
  type: string;
  prompt: string;
  prompt_ru?: string | null;
  expected_response: string;
  hint?: string | null;
  hint_ru?: string | null;
  position: number;
}

export interface ModuleReadingData {
  id?: number;
  text: string;
  text_ru?: string | null;
  hint?: string | null;
  hint_ru?: string | null;
  questions?: { create: ModuleReadingQuestionData[] };
}

export interface ModuleReadingQuestionData {
  id?: number;
  type: string;
  question: string;
  question_ru?: string | null;
  answer: string;
  position: number;
  options?: { create: ModuleReadingQuestionOptionData[] };
}

export interface ModuleReadingQuestionOptionData {
  id?: number;
  option_text: string;
  option_text_ru?: string | null;
  position: number;
}

export interface ModuleWritingData {
  id?: number;
  content: string;
  content_ru?: string | null;
  hint?: string | null;
  hint_ru?: string | null;
  exercises?: { create: ModuleWritingExerciseData[] };
}

export interface ModuleWritingExerciseData {
  id?: number;
  type: string;
  prompt: string;
  prompt_ru?: string | null;
  min_words: number;
  max_words: number;
  hint?: string | null;
  hint_ru?: string | null;
  position: number;
}

export interface ModuleCulturalData {
  id?: number;
  title: string;
  title_ru?: string | null;
  content: string;
  content_ru?: string | null;
  souvenir_name: string;
  souvenir_name_ru?: string | null;
  souvenir_description: string;
  souvenir_description_ru?: string | null;
  souvenir_download_url?: string | null;
  hint?: string | null;
  hint_ru?: string | null;
}

export interface ModuleQuizData {
  id?: number;
  type: string;
  question: string;
  question_ru?: string | null;
  answer: string;
  hint?: string | null;
  hint_ru?: string | null;
  audio_url?: string | null;
  position: number;
  options?: { create: ModuleQuizOptionData[] };
}

export interface ModuleQuizOptionData {
  id?: number;
  option_text: string;
  option_text_ru?: string | null;
  position: number;
}

export interface ModuleMissionChallengeData {
  id?: number;
  title: string;
  title_ru?: string | null;
  description: string;
  description_ru?: string | null;
  hint?: string | null;
  hint_ru?: string | null;
  requirements?: { create: ModuleMissionRequirementData[] };
}

export interface ModuleMissionRequirementData {
  id?: number;
  requirement: string;
  requirement_ru?: string | null;
  position: number;
}