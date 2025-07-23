// app/api/modules/[id]/route.ts

// 1. Correct Prisma Client Import:
//    This assumes you have a file like `D:\webdesign\keeleseiklus\lib\prisma.ts`
//    that looks like this:
//
//    // lib/prisma.ts
//    import { PrismaClient } from '@prisma/client';
//    declare global {
//      var prisma: PrismaClient | undefined;
//    }
//    let prisma: PrismaClient;
//    if (process.env.NODE_ENV === 'production') {
//      prisma = new PrismaClient();
//    } else {
//      if (!global.prisma) {
//        global.prisma = new PrismaClient();
//      }
//      prisma = global.prisma;
//    }
//    export default prisma;
//
//    If your `lib/prisma.ts` is structured this way, then the import below is correct.
//    DO NOT create `new PrismaClient()` directly in this `route.ts` file.
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();
// 2. Define your helper function at the top-level
const handleNestedUpdate = async (moduleId: number, data: any, tx: any) => {
  // Story (one-to-one relationship)
  if (data.module_stories) {
    const storyData = data.module_stories.create; // Frontend now only sends 'create' for direct fields
    if (storyData) { // Only proceed if there's actual story data to process
        const existingStory = await tx.moduleStory.findFirst({
            where: { module_id: moduleId },
            select: { id: true }
        });

        if (existingStory) {
            await tx.moduleStory.update({
                where: { id: existingStory.id },
                data: storyData // Pass direct fields for update
            });
        } else {
            await tx.moduleStory.create({
                data: {
                    ...storyData,
                    module_id: moduleId
                }
            });
        }
    }

    // Characters for story (many-to-many through ModuleStoryCharacter - always delete and recreate for simplicity)
    if (data.moduleStoryCharacters) { // This comes from frontend's characters array
      await tx.moduleStoryCharacter.deleteMany({ where: { module_id: moduleId } });
      if (data.moduleStoryCharacters.createMany?.data.length > 0) {
        await tx.moduleStoryCharacter.createMany({
          data: data.moduleStoryCharacters.createMany.data.map((char: any) => ({
            ...char,
            module_id: moduleId
          }))
        });
      }
    }
  }


  // Vocabulary (many-to-many / list - delete all existing and create new ones)
  if (data.module_vocabulary) {
    await tx.moduleVocabulary.deleteMany({ where: { module_id: moduleId } });
    if (data.module_vocabulary.createMany?.data.length > 0) {
      await tx.moduleVocabulary.createMany({
        data: data.module_vocabulary.createMany.data.map((vocab: any) => ({
          ...vocab,
          module_id: moduleId
        }))
      });
    }
  }

  // Grammar (one-to-one, and its nested lists)
  if (data.module_grammar) {
    const grammarParentData = data.module_grammar.create; // Frontend sends direct fields here
    if (grammarParentData) {
        const existingGrammar = await tx.moduleGrammar.findFirst({
            where: { module_id: moduleId },
            select: { id: true }
        });

        let currentGrammarId;
        if (existingGrammar) {
            const updatedGrammar = await tx.moduleGrammar.update({
                where: { id: existingGrammar.id },
                data: {
                    title: grammarParentData.title,
                    title_ru: grammarParentData.title_ru,
                    explanation: grammarParentData.explanation,
                    explanation_ru: grammarParentData.explanation_ru,
                }
            });
            currentGrammarId = updatedGrammar.id;
        } else {
            const createdGrammar = await tx.moduleGrammar.create({
                data: {
                    ...grammarParentData,
                    module_id: moduleId
                }
            });
            currentGrammarId = createdGrammar.id;
        }

        if (currentGrammarId) {
            // Now, handle the nested lists that came under custom keys from the frontend
            // Grammar Rules: Delete and recreate
            if (data.module_grammar_rules_to_manage) { // Check custom key
                await tx.moduleGrammarRule.deleteMany({ where: { grammar_id: currentGrammarId } });
                if (data.module_grammar_rules_to_manage.createMany?.data.length > 0) {
                    await tx.moduleGrammarRule.createMany({
                        data: data.module_grammar_rules_to_manage.createMany.data.map((rule: any) => ({
                            ...rule,
                            grammar_id: currentGrammarId
                        }))
                    });
                }
            }
            // Grammar Examples: Delete and recreate
            if (data.module_grammar_examples_to_manage) { // Check custom key
                await tx.moduleGrammarExample.deleteMany({ where: { grammar_id: currentGrammarId } });
                if (data.module_grammar_examples_to_manage.createMany?.data.length > 0) {
                    await tx.moduleGrammarExample.createMany({
                        data: data.module_grammar_examples_to_manage.createMany.data.map((example: any) => ({
                            ...example,
                            grammar_id: currentGrammarId
                        }))
                    });
                }
            }
            // Grammar Exercises (complex: delete options first, then exercises, then recreate exercises with options)
            if (data.module_grammar_exercises_to_manage) { // Check custom key
                const existingExerciseIds = await tx.moduleGrammarExercise.findMany({
                    where: { grammar_id: currentGrammarId },
                    select: { id: true }
                }).then((exercises: { id: number; }[]) => exercises.map(ex => ex.id));

                if (existingExerciseIds.length > 0) {
                    await tx.moduleGrammarExerciseOption.deleteMany({
                        where: {
                            exercise_id: { in: existingExerciseIds }
                        }
                    });
                }
                await tx.moduleGrammarExercise.deleteMany({ where: { grammar_id: currentGrammarId } });

                if (data.module_grammar_exercises_to_manage.createMany?.data.length > 0) {
                    for (const exercise of data.module_grammar_exercises_to_manage.createMany.data) {
                        const createdExercise = await tx.moduleGrammarExercise.create({
                            data: {
                                type: exercise.type,
                                question: exercise.question,
                                question_ru: exercise.question_ru,
                                answer: exercise.answer,
                                hint: exercise.hint,
                                hint_ru: exercise.hint_ru,
                                position: exercise.position,
                                grammar_id: currentGrammarId, // Link to parent grammar
                            },
                        });
                        if (exercise.exercise_options?.createMany?.data.length > 0) {
                            await tx.moduleGrammarExerciseOption.createMany({
                                data: exercise.exercise_options.createMany.data.map((option: any) => ({
                                    ...option,
                                    exercise_id: createdExercise.id // Link to newly created exercise
                                }))
                            });
                        }
                    }
                }
            }
        }
    }
  }

  // Pronunciation (one-to-one, and its nested lists)
  if (data.module_pronunciation) {
    const pronunciationParentData = data.module_pronunciation.create; // Get parent fields
    if (pronunciationParentData) {
        const existingPronunciation = await tx.modulePronunciation.findFirst({
            where: { module_id: moduleId },
            select: { id: true }
        });

        let currentPronunciationId;
        if (existingPronunciation) {
            const updatedPronunciation = await tx.modulePronunciation.update({
                where: { id: existingPronunciation.id },
                data: {
                    focus: pronunciationParentData.focus,
                    focus_ru: pronunciationParentData.focus_ru,
                    content: pronunciationParentData.content,
                    content_ru: pronunciationParentData.content_ru,
                    hint: pronunciationParentData.hint,
                    hint_ru: pronunciationParentData.hint_ru,
                }
            });
            currentPronunciationId = updatedPronunciation.id;
        } else {
            const createdPronunciation = await tx.modulePronunciation.create({
                data: {
                    ...pronunciationParentData,
                    module_id: moduleId
                }
            });
            currentPronunciationId = createdPronunciation.id;
        }

        if (currentPronunciationId) {
            // Minimal Pairs: Delete and recreate
            if (data.module_pronunciation_minimalPairs_to_manage) { // Check custom key
                await tx.modulePronunciationMinimalPair.deleteMany({ where: { pronunciation_id: currentPronunciationId } });
                if (data.module_pronunciation_minimalPairs_to_manage.createMany?.data.length > 0) {
                    await tx.modulePronunciationMinimalPair.createMany({
                        data: data.module_pronunciation_minimalPairs_to_manage.createMany.data.map((pair: any) => ({
                            ...pair,
                            pronunciation_id: currentPronunciationId
                        }))
                    });
                }
            }
            // Pronunciation Exercises: Delete and recreate
            if (data.module_pronunciation_exercises_to_manage) { // Check custom key
                await tx.modulePronunciationExercise.deleteMany({ where: { pronunciation_id: currentPronunciationId } });
                if (data.module_pronunciation_exercises_to_manage.createMany?.data.length > 0) {
                    await tx.modulePronunciationExercise.createMany({
                        data: data.module_pronunciation_exercises_to_manage.createMany.data.map((exercise: any) => ({
                            ...exercise,
                            pronunciation_id: currentPronunciationId
                        }))
                    });
                }
            }
        }
    }
  }

  // Listening (one-to-one, and its nested questions/options)
  if (data.module_listening) {
    const listeningParentData = data.module_listening.create; // Get parent fields
    if (listeningParentData) {
        const existingListening = await tx.moduleListening.findFirst({
            where: { module_id: moduleId },
            select: { id: true }
        });

        let currentListeningId;
        if (existingListening) {
            const updatedListening = await tx.moduleListening.update({
                where: { id: existingListening.id },
                data: {
                    audio_url: listeningParentData.audio_url,
                    transcript: listeningParentData.transcript,
                    transcript_ru: listeningParentData.transcript_ru,
                    content: listeningParentData.content,
                    content_ru: listeningParentData.content_ru,
                    hint: listeningParentData.hint,
                    hint_ru: listeningParentData.hint_ru,
                }
            });
            currentListeningId = updatedListening.id;
        } else {
            const createdListening = await tx.moduleListening.create({
                data: {
                    ...listeningParentData,
                    module_id: moduleId
                }
            });
            currentListeningId = createdListening.id;
        }

        if (currentListeningId) {
            // Listening Questions: Delete options first, then questions, then recreate questions with options
            if (data.module_listening_questions_to_manage) { // Check custom key
                const existingQuestionIds = await tx.moduleListeningQuestion.findMany({
                    where: { listening_id: currentListeningId },
                    select: { id: true }
                }).then((questions: { id: number; }[]) => questions.map(q => q.id));

                if (existingQuestionIds.length > 0) {
                    await tx.moduleListeningQuestionOption.deleteMany({
                        where: {
                            question_id: { in: existingQuestionIds }
                        }
                    });
                }
                await tx.moduleListeningQuestion.deleteMany({ where: { listening_id: currentListeningId } });

                if (data.module_listening_questions_to_manage.createMany?.data.length > 0) {
                    for (const question of data.module_listening_questions_to_manage.createMany.data) {
                        const createdQuestion = await tx.moduleListeningQuestion.create({
                            data: {
                                type: question.type, question: question.question, question_ru: question.question_ru,
                                answer: question.answer, position: question.position,
                                listening_id: currentListeningId,
                            },
                        });
                        if (question.options?.createMany?.data.length > 0) {
                            await tx.moduleListeningQuestionOption.createMany({
                                data: question.options.createMany.data.map((option: any) => ({
                                    ...option,
                                    question_id: createdQuestion.id
                                }))
                            });
                        }
                    }
                }
            }
        }
    }
  }

  // Speaking (one-to-one, and its nested exercises)
  if (data.module_speaking) {
    const speakingParentData = data.module_speaking.create; // Get parent fields
    if (speakingParentData) {
        const existingSpeaking = await tx.moduleSpeaking.findFirst({
            where: { module_id: moduleId },
            select: { id: true }
        });

        let currentSpeakingId;
        if (existingSpeaking) {
            const updatedSpeaking = await tx.moduleSpeaking.update({
                where: { id: existingSpeaking.id },
                data: {
                    content: speakingParentData.content,
                    content_ru: speakingParentData.content_ru,
                    hint: speakingParentData.hint,
                    hint_ru: speakingParentData.hint_ru,
                }
            });
            currentSpeakingId = updatedSpeaking.id;
        } else {
            const createdSpeaking = await tx.moduleSpeaking.create({
                data: {
                    ...speakingParentData,
                    module_id: moduleId
                }
            });
            currentSpeakingId = createdSpeaking.id;
        }

        if (currentSpeakingId) {
            // Speaking Exercises: Delete and recreate
            if (data.module_speaking_exercises_to_manage) { // Check custom key
                await tx.moduleSpeakingExercise.deleteMany({ where: { speaking_id: currentSpeakingId } });
                if (data.module_speaking_exercises_to_manage.createMany?.data.length > 0) {
                    await tx.moduleSpeakingExercise.createMany({
                        data: data.module_speaking_exercises_to_manage.createMany.data.map((exercise: any) => ({
                            ...exercise,
                            speaking_id: currentSpeakingId
                        }))
                    });
                }
            }
        }
    }
  }

  // Reading (one-to-one, and its nested questions/options)
  if (data.module_reading) {
    const readingParentData = data.module_reading.create; // Get parent fields
    if (readingParentData) {
        const existingReading = await tx.moduleReading.findFirst({
            where: { module_id: moduleId },
            select: { id: true }
        });

        let currentReadingId;
        if (existingReading) {
            const updatedReading = await tx.moduleReading.update({
                where: { id: existingReading.id },
                data: {
                    text: readingParentData.text,
                    text_ru: readingParentData.text_ru,
                    hint: readingParentData.hint,
                    hint_ru: readingParentData.hint_ru,
                }
            });
            currentReadingId = updatedReading.id;
        } else {
            const createdReading = await tx.moduleReading.create({
                data: {
                    ...readingParentData,
                    module_id: moduleId
                }
            });
            currentReadingId = createdReading.id;
        }

        if (currentReadingId) {
            // Reading Questions: Delete options first, then questions, then recreate questions with options
            if (data.module_reading_questions_to_manage) { // Check custom key
                const existingQuestionIds = await tx.moduleReadingQuestion.findMany({
                    where: { reading_id: currentReadingId },
                    select: { id: true }
                }).then((questions: { id: number; }[]) => questions.map(q => q.id));

                if (existingQuestionIds.length > 0) {
                    await tx.moduleReadingQuestionOption.deleteMany({
                        where: {
                            question_id: { in: existingQuestionIds }
                        }
                    });
                }
                await tx.moduleReadingQuestion.deleteMany({ where: { reading_id: currentReadingId } });

                if (data.module_reading_questions_to_manage.createMany?.data.length > 0) {
                    for (const question of data.module_reading_questions_to_manage.createMany.data) {
                        const createdQuestion = await tx.moduleReadingQuestion.create({
                            data: {
                                type: question.type, question: question.question, question_ru: question.question_ru,
                                answer: question.answer, position: question.position,
                                reading_id: currentReadingId,
                            },
                        });
                        if (question.options?.createMany?.data.length > 0) {
                            await tx.moduleReadingQuestionOption.createMany({
                                data: question.options.createMany.data.map((option: any) => ({
                                    ...option,
                                    question_id: createdQuestion.id
                                }))
                            });
                        }
                    }
                }
            }
        }
    }
  }

  // Writing (one-to-one, and its nested exercises)
  if (data.module_writing) {
    const writingParentData = data.module_writing.create; // Get parent fields
    if (writingParentData) {
        const existingWriting = await tx.moduleWriting.findFirst({
            where: { module_id: moduleId },
            select: { id: true }
        });

        let currentWritingId;
        if (existingWriting) {
            const updatedWriting = await tx.moduleWriting.update({
                where: { id: existingWriting.id },
                data: {
                    content: writingParentData.content,
                    content_ru: writingParentData.content_ru,
                    hint: writingParentData.hint,
                    hint_ru: writingParentData.hint_ru,
                }
            });
            currentWritingId = updatedWriting.id;
        } else {
            const createdWriting = await tx.moduleWriting.create({
                data: {
                    ...writingParentData,
                    module_id: moduleId
                }
            });
            currentWritingId = createdWriting.id;
        }

        if (currentWritingId) {
            // Writing Exercises: Delete and recreate
            if (data.module_writing_exercises_to_manage) { // Check custom key
                await tx.moduleWritingExercise.deleteMany({ where: { writing_id: currentWritingId } });
                if (data.module_writing_exercises_to_manage.createMany?.data.length > 0) {
                    await tx.moduleWritingExercise.createMany({
                        data: data.module_writing_exercises_to_manage.createMany.data.map((exercise: any) => ({
                            ...exercise,
                            writing_id: currentWritingId
                        }))
                    });
                }
            }
        }
    }
  }

  // Cultural (one-to-one relationship)
  if (data.module_cultural) {
    const culturalParentData = data.module_cultural.create; // Get parent fields
    if (culturalParentData) {
        const existingCultural = await tx.moduleCultural.findFirst({
            where: { module_id: moduleId },
            select: { id: true }
        });

        if (existingCultural) {
            await tx.moduleCultural.update({
                where: { id: existingCultural.id },
                data: {
                    title: culturalParentData.title,
                    title_ru: culturalParentData.title_ru,
                    content: culturalParentData.content,
                    content_ru: culturalParentData.content_ru,
                    souvenir_name: culturalParentData.souvenir_name,
                    souvenir_name_ru: culturalParentData.souvenir_name_ru,
                    souvenir_description: culturalParentData.souvenir_description,
                    souvenir_description_ru: culturalParentData.souvenir_description_ru,
                    souvenir_download_url: culturalParentData.souvenir_download_url,
                    hint: culturalParentData.hint,
                    hint_ru: culturalParentData.hint_ru,
                }
            });
        } else {
            await tx.moduleCultural.create({
                data: {
                    ...culturalParentData,
                    module_id: moduleId
                }
            });
        }
    }
  }

  // Quiz (many-to-many / list - delete all existing and create new ones)
  // Quiz is already handled correctly in frontend as top-level deleteMany/createMany
  if (data.module_quizzes) {
    const existingQuizQuestionIds = await tx.moduleQuiz.findMany({
      where: { module_id: moduleId },
      select: { id: true }
    }).then((quizzes: { id: number; }[]) => quizzes.map(q => q.id));

    if (existingQuizQuestionIds.length > 0) {
      await tx.moduleQuizOption.deleteMany({
        where: {
          quiz_id: { in: existingQuizQuestionIds }
        }
      });
    }
    await tx.moduleQuiz.deleteMany({ where: { module_id: moduleId } });

    if (data.module_quizzes.createMany?.data.length > 0) {
      for (const question of data.module_quizzes.createMany.data) {
        const createdQuestion = await tx.moduleQuiz.create({
          data: {
            type: question.type,
            question: question.question,
            question_ru: question.question_ru,
            answer: question.answer,
            hint: question.hint,
            hint_ru: question.hint_ru,
            audio_url: question.audio_url,
            position: question.position,
            module_id: moduleId,
          },
        });
        if (question.options?.createMany?.data.length > 0) {
          await tx.moduleQuizOption.createMany({
            data: question.options.createMany.data.map((option: any) => ({
              ...option,
              quiz_id: createdQuestion.id
            }))
          });
        }
      }
    }
  }

  // Mission Challenge (one-to-one, and its nested requirements)
  if (data.module_mission_challenges) {
    const missionChallengeParentData = data.module_mission_challenges.create; // Get parent fields
    if (missionChallengeParentData) {
        const existingMissionChallenge = await tx.moduleMissionChallenge.findFirst({
            where: { module_id: moduleId },
            select: { id: true }
        });

        let currentMissionChallengeId;
        if (existingMissionChallenge) {
            const updatedMissionChallenge = await tx.moduleMissionChallenge.update({
                where: { id: existingMissionChallenge.id },
                data: {
                    title: missionChallengeParentData.title,
                    title_ru: missionChallengeParentData.title_ru,
                    description: missionChallengeParentData.description,
                    description_ru: missionChallengeParentData.description_ru,
                    hint: missionChallengeParentData.hint,
                    hint_ru: missionChallengeParentData.hint_ru,
                }
            });
            currentMissionChallengeId = updatedMissionChallenge.id;
        } else {
            const createdMissionChallenge = await tx.moduleMissionChallenge.create({
                data: {
                    ...missionChallengeParentData,
                    module_id: moduleId
                }
            });
            currentMissionChallengeId = createdMissionChallenge.id;
        }

        if (currentMissionChallengeId) {
            // Requirements: Delete and recreate
            if (data.module_mission_challenge_requirements_to_manage) { // Check custom key
                await tx.moduleMissionRequirement.deleteMany({ where: { mission_challenge_id: currentMissionChallengeId } });
                if (data.module_mission_challenge_requirements_to_manage.createMany?.data.length > 0) {
                    await tx.moduleMissionRequirement.createMany({
                        data: data.module_mission_challenge_requirements_to_manage.createMany.data.map((req: any) => ({
                            ...req,
                            mission_challenge_id: currentMissionChallengeId
                        }))
                    });
                }
            }
        }
    }
  }
};

// GET handler to fetch a single module
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid module ID' }, { status: 400 });
    }

    const module = await prisma.module.findUnique({
      where: { id: id },
      include: {
        module_stories: {
          select: {
            id: true,
            text: true,
            text_ru: true,
            hint: true,
            hint_ru: true,
            mission: true,
            mission_ru: true,
            show_translation: true,
            video_url: true,
          }
        },
        moduleStoryCharacters: { // Included directly from Module
          select: {
            id: true,
            character_name: true,
            position: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        module_vocabulary: {
          select: {
            id: true,
            word: true,
            translation: true,
            translation_ru: true,
            example: true,
            example_ru: true,
            audio_url: true,
            position: true,
          },
          orderBy: {
            position: 'asc'
          }
        },
        module_grammar: {
          select: {
            id: true,
            title: true,
            title_ru: true,
            explanation: true,
            explanation_ru: true,
            grammar_rules: {
              select: {
                id: true,
                rule: true,
                rule_ru: true,
                position: true,
              },
              orderBy: {
                position: 'asc'
              }
            },
            grammar_examples: {
              select: {
                id: true,
                sentence: true,
                sentence_ru: true,
                translation: true,
                translation_ru: true,
                position: true,
              },
              orderBy: {
                position: 'asc'
              }
            },
            grammar_exercises: {
              select: {
                id: true,
                type: true,
                question: true,
                question_ru: true,
                answer: true,
                hint: true,
                hint_ru: true,
                position: true,
                exercise_options: {
                  select: {
                    id: true,
                    option_text: true,
                    option_text_ru: true,
                    position: true,
                  },
                  orderBy: {
                    position: 'asc'
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        module_pronunciation: {
          select: {
            id: true,
            focus: true,
            focus_ru: true,
            content: true,
            content_ru: true,
            hint: true,
            hint_ru: true,
            minimal_pairs: {
              select: {
                id: true,
                word1: true,
                word2: true,
                sound1: true,
                sound2: true,
                audio_url1: true,
                audio_url2: true,
                position: true,
              },
              orderBy: {
                position: 'asc'
              }
            },
            exercises: {
              select: {
                id: true,
                type: true,
                word: true,
                phonetic: true,
                audio_url: true,
                hint: true,
                hint_ru: true,
                position: true,
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        module_listening: {
          select: {
            id: true,
            audio_url: true,
            transcript: true,
            transcript_ru: true,
            content: true,
            content_ru: true,
            hint: true,
            hint_ru: true,
            questions: {
              select: {
                id: true,
                type: true,
                question: true,
                question_ru: true,
                answer: true,
                position: true,
                options: {
                  select: {
                    id: true,
                    option_text: true,
                    option_text_ru: true,
                    position: true,
                  },
                  orderBy: {
                    position: 'asc'
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        module_speaking: {
          select: {
            id: true,
            content: true,
            content_ru: true,
            hint: true,
            hint_ru: true,
            exercises: {
              select: {
                id: true,
                type: true,
                prompt: true,
                prompt_ru: true,
                expected_response: true,
                hint: true,
                hint_ru: true,
                position: true,
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        module_reading: {
          select: {
            id: true,
            text: true,
            text_ru: true,
            hint: true,
            hint_ru: true,
            questions: {
              select: {
                id: true,
                type: true,
                question: true,
                question_ru: true,
                answer: true,
                position: true,
                options: {
                  select: {
                    id: true,
                    option_text: true,
                    option_text_ru: true,
                    position: true,
                  },
                  orderBy: {
                    position: 'asc'
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        module_writing: {
          select: {
            id: true,
            content: true,
            content_ru: true,
            hint: true,
            hint_ru: true,
            exercises: {
              select: {
                id: true,
                type: true,
                prompt: true,
                prompt_ru: true,
                min_words: true,
                max_words: true,
                hint: true,
                hint_ru: true,
                position: true,
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        module_cultural: {
          select: {
            id: true,
            title: true,
            title_ru: true,
            content: true,
            content_ru: true,
            souvenir_name: true,
            souvenir_name_ru: true,
            souvenir_description: true,
            souvenir_description_ru: true,
            souvenir_download_url: true,
            hint: true,
            hint_ru: true,
          }
        },
        module_quizzes: {
          select: {
            id: true,
            type: true,
            question: true,
            question_ru: true,
            answer: true,
            hint: true,
            hint_ru: true,
            audio_url: true,
            position: true,
            options: {
              select: {
                id: true,
                option_text: true,
                option_text_ru: true,
                position: true,
              },
              orderBy: {
                position: 'asc'
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        },
        module_mission_challenges: {
          select: {
            id: true,
            title: true,
            title_ru: true,
            description: true,
            description_ru: true,
            hint: true,
            hint_ru: true,
            requirements: {
              select: {
                id: true,
                requirement: true,
                requirement_ru: true,
                position: true,
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        }
      },
    });

    if (!module) {
      return NextResponse.json({ message: 'Module not found' }, { status: 404 });
    }

    // Transform Prisma output to match frontend state structure for pre-filling the form
    const transformedModule = {
      id: module.id,
      title: module.title,
      title_ru: module.title_ru,
      subtitle: module.subtitle,
      subtitle_ru: module.subtitle_ru,
      level: module.level,
      duration: module.duration,
      description: module.description,
      description_ru: module.description_ru,
      location: module.location,
      region: module.region,
      video_url: module.video_url,
      map_position_x: module.map_position_x,
      map_position_y: module.map_position_y,
      // Handle the single object relations
      story: module.module_stories?.[0] ? {
        id: module.module_stories[0].id,
        text: module.module_stories[0].text,
        text_ru: module.module_stories[0].text_ru,
        hint: module.module_stories[0].hint,
        hint_ru: module.module_stories[0].hint_ru,
        mission: module.module_stories[0].mission,
        mission_ru: module.module_stories[0].mission_ru,
        show_translation: module.module_stories[0].show_translation,
        video_url: module.module_stories[0].video_url,
        characters: module.moduleStoryCharacters.map(char => char.character_name) // Flatten characters
      } : { id: undefined, text: "", text_ru: "", hint: "", hint_ru: "", mission: "", mission_ru: "", show_translation: false, video_url: "", characters: [] },
      // Handle the array relations
      vocabulary: module.module_vocabulary.map(vocab => ({
        id: vocab.id,
        word: vocab.word,
        translation: vocab.translation,
        translation_ru: vocab.translation_ru,
        example: vocab.example,
        example_ru: vocab.example_ru,
        audio_url: vocab.audio_url,
      })),
      // Handle complex nested relations (grammar, pronunciation, listening, etc.)
      grammar: module.module_grammar?.[0] ? { // Grammar is one-to-one, so use [0]
        id: module.module_grammar[0].id,
        title: module.module_grammar[0].title,
        title_ru: module.module_grammar[0].title_ru,
        explanation: module.module_grammar[0].explanation,
        explanation_ru: module.module_grammar[0].explanation_ru,
        rules: module.module_grammar[0].grammar_rules.map(rule => rule.rule), // Flatten rules
        rules_ru: module.module_grammar[0].grammar_rules.map(rule => rule.rule_ru || ""), // Flatten Russian rules
        examples: module.module_grammar[0].grammar_examples.map(example => ({
          id: example.id,
          sentence: example.sentence,
          sentence_ru: example.sentence_ru,
          translation: example.translation,
          translation_ru: example.translation_ru,
        })),
        exercises: module.module_grammar[0].grammar_exercises.map(exercise => ({
          id: exercise.id,
          type: exercise.type,
          question: exercise.question,
          question_ru: exercise.question_ru,
          answer: exercise.answer,
          hint: exercise.hint,
          hint_ru: exercise.hint_ru,
          options: exercise.exercise_options.map(opt => opt.option_text), // Flatten options
          options_ru: exercise.exercise_options.map(opt => opt.option_text_ru || ""), // Flatten Russian options
        }))
      } : { id: undefined, title: "", title_ru: "", explanation: "", explanation_ru: "", rules: [], rules_ru: [], examples: [], exercises: [] },
      
      pronunciation: module.module_pronunciation?.[0] ? {
        id: module.module_pronunciation[0].id,
        focus: module.module_pronunciation[0].focus,
        focus_ru: module.module_pronunciation[0].focus_ru,
        content: module.module_pronunciation[0].content,
        content_ru: module.module_pronunciation[0].content_ru,
        hint: module.module_pronunciation[0].hint,
        hint_ru: module.module_pronunciation[0].hint_ru,
        minimalPairs: module.module_pronunciation[0].minimal_pairs.map(pair => ({
          id: pair.id,
          word1: pair.word1,
          word2: pair.word2,
          sound1: pair.sound1,
          sound2: pair.sound2,
          audio_url1: pair.audio_url1,
          audio_url2: pair.audio_url2,
        })),
        exercises: module.module_pronunciation[0].exercises.map(exercise => ({
          id: exercise.id,
          type: exercise.type,
          word: exercise.word,
          phonetic: exercise.phonetic,
          audio_url: exercise.audio_url,
          hint: exercise.hint,
          hint_ru: exercise.hint_ru,
        }))
      } : { id: undefined, focus: "", focus_ru: "", minimalPairs: [], exercises: [], content: "", content_ru: "", hint: "", hint_ru: "" },

      listening: module.module_listening?.[0] ? {
        id: module.module_listening[0].id,
        audio_url: module.module_listening[0].audio_url,
        transcript: module.module_listening[0].transcript,
        transcript_ru: module.module_listening[0].transcript_ru,
        content: module.module_listening[0].content,
        content_ru: module.module_listening[0].content_ru,
        hint: module.module_listening[0].hint,
        hint_ru: module.module_listening[0].hint_ru,
        questions: module.module_listening[0].questions.map(question => ({
          id: question.id,
          type: question.type,
          question: question.question,
          question_ru: question.question_ru,
          answer: question.answer,
          options: question.options.map(opt => opt.option_text),
          options_ru: question.options.map(opt => opt.option_text_ru || ""),
        }))
      } : { id: undefined, audio_url: "", transcript: "", transcript_ru: "", questions: [], content: "", content_ru: "", hint: "", hint_ru: "" },

      speaking: module.module_speaking?.[0] ? {
        id: module.module_speaking[0].id,
        content: module.module_speaking[0].content,
        content_ru: module.module_speaking[0].content_ru,
        hint: module.module_speaking[0].hint,
        hint_ru: module.module_speaking[0].hint_ru,
        exercises: module.module_speaking[0].exercises.map(exercise => ({
          id: exercise.id,
          type: exercise.type,
          prompt: exercise.prompt,
          prompt_ru: exercise.prompt_ru,
          expectedResponse: exercise.expected_response,
          hint: exercise.hint,
          hint_ru: exercise.hint_ru,
        }))
      } : { id: undefined, exercises: [], content: "", content_ru: "", hint: "", hint_ru: "" },

      reading: module.module_reading?.[0] ? {
        id: module.module_reading[0].id,
        text: module.module_reading[0].text,
        text_ru: module.module_reading[0].text_ru,
        hint: module.module_reading[0].hint,
        hint_ru: module.module_reading[0].hint_ru,
        questions: module.module_reading[0].questions.map(question => ({
          id: question.id,
          type: question.type,
          question: question.question,
          question_ru: question.question_ru,
          answer: question.answer,
          options: question.options.map(opt => opt.option_text),
          options_ru: question.options.map(opt => opt.option_text_ru || ""),
        }))
      } : { id: undefined, text: "", text_ru: "", questions: [], hint: "", hint_ru: "" },

      writing: module.module_writing?.[0] ? {
        id: module.module_writing[0].id,
        content: module.module_writing[0].content,
        content_ru: module.module_writing[0].content_ru,
        hint: module.module_writing[0].hint,
        hint_ru: module.module_writing[0].hint_ru,
        exercises: module.module_writing[0].exercises.map(exercise => ({
          id: exercise.id,
          type: exercise.type,
          prompt: exercise.prompt,
          prompt_ru: exercise.prompt_ru,
          minWords: exercise.min_words,
          maxWords: exercise.max_words,
          hint: exercise.hint,
          hint_ru: exercise.hint_ru,
        }))
      } : { id: undefined, exercises: [], content: "", content_ru: "", hint: "", hint_ru: "" },

      cultural: module.module_cultural?.[0] ? {
        id: module.module_cultural[0].id,
        title: module.module_cultural[0].title,
        title_ru: module.module_cultural[0].title_ru,
        content: module.module_cultural[0].content,
        content_ru: module.module_cultural[0].content_ru,
        souvenir: { // Souvenir is part of Cultural model
          name: module.module_cultural[0].souvenir_name,
          name_ru: module.module_cultural[0].souvenir_name_ru,
          description: module.module_cultural[0].souvenir_description,
          description_ru: module.module_cultural[0].souvenir_description_ru,
          downloadUrl: module.module_cultural[0].souvenir_download_url,
        },
        hint: module.module_cultural[0].hint,
        hint_ru: module.module_cultural[0].hint_ru,
      } : { id: undefined, title: "", title_ru: "", content: "", content_ru: "", souvenir: { name: "", name_ru: "", description: "", description_ru: "", downloadUrl: "" }, hint: "", hint_ru: "" },
      
      quiz: module.module_quizzes.map(quiz => ({
        id: quiz.id,
        type: quiz.type,
        question: quiz.question,
        question_ru: quiz.question_ru,
        answer: quiz.answer,
        hint: quiz.hint,
        hint_ru: quiz.hint_ru,
        audio_url: quiz.audio_url,
        options: quiz.options.map(opt => opt.option_text),
        options_ru: quiz.options.map(opt => opt.option_text_ru || ""),
      })),

      missionChallenge: module.module_mission_challenges?.[0] ? {
        id: module.module_mission_challenges[0].id,
        title: module.module_mission_challenges[0].title,
        title_ru: module.module_mission_challenges[0].title_ru,
        description: module.module_mission_challenges[0].description,
        description_ru: module.module_mission_challenges[0].description_ru,
        hint: module.module_mission_challenges[0].hint,
        hint_ru: module.module_mission_challenges[0].hint_ru,
        requirements: module.module_mission_challenges[0].requirements.map(req => req.requirement),
        requirements_ru: module.module_mission_challenges[0].requirements.map(req => req.requirement_ru || ""),
      } : { id: undefined, title: "", title_ru: "", description: "", description_ru: "", requirements: [], requirements_ru: [], hint: "", hint_ru: "" },
    };

    return NextResponse.json(transformedModule);

  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { message: 'Error fetching module', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH handler to update a module
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid module ID' }, { status: 400 });
    }

    const body = await request.json();

    // Separate main module data from nested relations
    const {
      module_stories,
      moduleStoryCharacters,
      module_vocabulary,
      // These are the direct fields for the one-to-one relations
      module_grammar,
      module_pronunciation,
      module_listening,
      module_speaking,
      module_reading,
      module_writing,
      module_cultural,
      module_mission_challenges,
      // These are the lists that need separate management (deleteMany/createMany)
      module_grammar_rules_to_manage,
      module_grammar_examples_to_manage,
      module_grammar_exercises_to_manage,
      module_pronunciation_minimalPairs_to_manage,
      module_pronunciation_exercises_to_manage,
      module_listening_questions_to_manage,
      module_speaking_exercises_to_manage,
      module_reading_questions_to_manage,
      module_writing_exercises_to_manage,
      module_mission_challenge_requirements_to_manage,
      // Quiz is already handled as a top-level list
      module_quizzes,
      ...mainModuleData // These are direct fields on the Module model
    } = body;

    // Start a Prisma transaction to ensure atomicity
    const updatedModule = await prisma.$transaction(async (tx) => {
      // 1. Update the main Module record
      const module = await tx.module.update({
        where: { id: id },
        data: mainModuleData, // Update direct fields
      });

      // 2. Handle nested updates using the helper function
      // Pass the entire body so handleNestedUpdate can access all custom keys
      await handleNestedUpdate(id, body, tx);

      return module;
    }, {
      timeout: 60000, // Increase timeout to 20 seconds (20000 ms)
                      // Adjust as needed, but avoid excessively high values
    });

    return NextResponse.json({ message: 'Module updated successfully', module: updatedModule });

  } catch (error) {
    console.error('Error updating module:', error);
    // More detailed error logging for debugging
    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Failed to update module', error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'An unknown error occurred while updating the module' },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid module ID' }, { status: 400 });
    }

    // Use a transaction to ensure all related records are deleted cleanly
    await prisma.$transaction(async (tx) => {
      // Delete nested one-to-one relations first
      await tx.moduleStory.deleteMany({ where: { module_id: id } });
      await tx.moduleCultural.deleteMany({ where: { module_id: id } });
      await tx.moduleMissionChallenge.deleteMany({ where: { module_id: id } }); // Delete mission_challenge first

      // Handle complex one-to-one relations with their own nested children
      const grammar = await tx.moduleGrammar.findFirst({ where: { module_id: id } });
      if (grammar) {
        await tx.moduleGrammarRule.deleteMany({ where: { grammar_id: grammar.id } });
        await tx.moduleGrammarExample.deleteMany({ where: { grammar_id: grammar.id } });
        const grammarExercises = await tx.moduleGrammarExercise.findMany({ where: { grammar_id: grammar.id }, select: { id: true } });
        if (grammarExercises.length > 0) {
          await tx.moduleGrammarExerciseOption.deleteMany({ where: { exercise_id: { in: grammarExercises.map(e => e.id) } } });
        }
        await tx.moduleGrammarExercise.deleteMany({ where: { grammar_id: grammar.id } });
        await tx.moduleGrammar.delete({ where: { id: grammar.id } });
      }

      const pronunciation = await tx.modulePronunciation.findFirst({ where: { module_id: id } });
      if (pronunciation) {
        await tx.modulePronunciationMinimalPair.deleteMany({ where: { pronunciation_id: pronunciation.id } });
        await tx.modulePronunciationExercise.deleteMany({ where: { pronunciation_id: pronunciation.id } });
        await tx.modulePronunciation.delete({ where: { id: pronunciation.id } });
      }

      const listening = await tx.moduleListening.findFirst({ where: { module_id: id } });
      if (listening) {
        const listeningQuestions = await tx.moduleListeningQuestion.findMany({ where: { listening_id: listening.id }, select: { id: true } });
        if (listeningQuestions.length > 0) {
          await tx.moduleListeningQuestionOption.deleteMany({ where: { question_id: { in: listeningQuestions.map(q => q.id) } } });
        }
        await tx.moduleListeningQuestion.deleteMany({ where: { listening_id: listening.id } });
        await tx.moduleListening.delete({ where: { id: listening.id } });
      }

      const speaking = await tx.moduleSpeaking.findFirst({ where: { module_id: id } });
      if (speaking) {
        await tx.moduleSpeakingExercise.deleteMany({ where: { speaking_id: speaking.id } });
        await tx.moduleSpeaking.delete({ where: { id: speaking.id } });
      }

      const reading = await tx.moduleReading.findFirst({ where: { module_id: id } });
      if (reading) {
        const readingQuestions = await tx.moduleReadingQuestion.findMany({ where: { reading_id: reading.id }, select: { id: true } });
        if (readingQuestions.length > 0) {
          await tx.moduleReadingQuestionOption.deleteMany({ where: { question_id: { in: readingQuestions.map(q => q.id) } } });
        }
        await tx.moduleReadingQuestion.deleteMany({ where: { reading_id: reading.id } });
        await tx.moduleReading.delete({ where: { id: reading.id } });
      }

      const writing = await tx.moduleWriting.findFirst({ where: { module_id: id } });
      if (writing) {
        await tx.moduleWritingExercise.deleteMany({ where: { writing_id: writing.id } });
        await tx.moduleWriting.delete({ where: { id: writing.id } });
      }

      // Delete other direct one-to-many relations
      await tx.moduleVocabulary.deleteMany({ where: { module_id: id } });
      await tx.moduleStoryCharacter.deleteMany({ where: { module_id: id } });

      // Quiz (delete options first, then questions)
      const quizQuestions = await tx.moduleQuiz.findMany({ where: { module_id: id }, select: { id: true } });
      if (quizQuestions.length > 0) {
        await tx.moduleQuizOption.deleteMany({ where: { quiz_id: { in: quizQuestions.map(q => q.id) } } });
      }
      await tx.moduleQuiz.deleteMany({ where: { module_id: id } });

      // Finally, delete the main module record
      await tx.module.delete({
        where: { id: id },
      });
    });

    return NextResponse.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { message: 'Error deleting module', error: (error as Error).message },
      { status: 500 }
    );
  }
}