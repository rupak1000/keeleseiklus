// api/modules/new/route.ts
import { NextResponse } from 'next/server';
// ⚠️ CHANGE THIS LINE:
// Instead of importing the class, import the default exported instance.
import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();
// If your 'lib/prisma.ts' file doesn't exist, or doesn't export a default instance,
// you would need to create it like this:
//
// // lib/prisma.ts
// import { PrismaClient } from '@prisma/client';
// declare global {
//   var prisma: PrismaClient | undefined;
// }
// let prisma: PrismaClient;
// if (process.env.NODE_ENV === 'production') {
//   prisma = new PrismaClient();
// } else {
//   if (!global.prisma) {
//     global.prisma = new PrismaClient();
//   }
//   prisma = global.prisma;
// }
// export default prisma;
//
// And then your route.ts would import from that 'lib/prisma' file.

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      module_stories,
      moduleStoryCharacters,
      module_vocabulary,
      module_grammar,
      module_pronunciation,
      module_listening,
      module_speaking,
      module_reading,
      module_writing,
      module_cultural,
      module_quizzes,
      module_mission_challenges,
      ...mainModuleData
    } = body;

    // Start a Prisma transaction to ensure atomicity
    // 'prisma' here is the imported instance from '@/lib/prisma'
    const newModule = await prisma.$transaction(async (tx) => {
      // ... (rest of your logic remains the same) ...
      // 1. Create the main Module record
      const module = await tx.module.create({
        data: mainModuleData,
      });

      // 2. Create nested relations, linking them to the newly created module
      // Story
      if (module_stories && module_stories.create && module_stories.create.length > 0) {
        await tx.moduleStory.create({
          data: {
            ...module_stories.create[0], // Assuming only one story per module for create
            moduleId: module.id,
          },
        });
      }

      // Characters for Story (linked directly to Module)
      if (moduleStoryCharacters && moduleStoryCharacters.create && moduleStoryCharacters.create.length > 0) {
        await tx.moduleStoryCharacter.createMany({
          data: moduleStoryCharacters.create.map((char: any) => ({
            ...char,
            moduleId: module.id,
          })),
        });
      }

      // Vocabulary
      if (module_vocabulary && module_vocabulary.create && module_vocabulary.create.length > 0) {
        await tx.moduleVocabulary.createMany({
          data: module_vocabulary.create.map((vocab: any) => ({
            ...vocab,
            moduleId: module.id,
          })),
        });
      }

      // Grammar (and its nested relations)
      if (module_grammar && module_grammar.create) {
        const createdGrammar = await tx.moduleGrammar.create({
          data: {
            title: module_grammar.create.title,
            title_ru: module_grammar.create.title_ru,
            explanation: module_grammar.create.explanation,
            explanation_ru: module_grammar.create.explanation_ru,
            moduleId: module.id,
          },
        });

        if (module_grammar.create.grammar_rules && module_grammar.create.grammar_rules.create) {
          await tx.moduleGrammarRule.createMany({
            data: module_grammar.create.grammar_rules.create.map((rule: any) => ({
              ...rule,
              moduleGrammarId: createdGrammar.id,
            })),
          });
        }
        if (module_grammar.create.grammar_examples && module_grammar.create.grammar_examples.create) {
          await tx.moduleGrammarExample.createMany({
            data: module_grammar.create.grammar_examples.create.map((example: any) => ({
              ...example,
              moduleGrammarId: createdGrammar.id,
            })),
          });
        }
        // Grammar Exercises (with their options)
        if (module_grammar.create.grammar_exercises && module_grammar.create.grammar_exercises.create) {
          for (const exercise of module_grammar.create.grammar_exercises.create) {
            const createdExercise = await tx.moduleGrammarExercise.create({
              data: {
                type: exercise.type,
                question: exercise.question,
                question_ru: exercise.question_ru,
                answer: exercise.answer,
                hint: exercise.hint,
                hint_ru: exercise.hint_ru,
                position: exercise.position,
                moduleGrammarId: createdGrammar.id,
              },
            });
            if (exercise.exercise_options && exercise.exercise_options.create) {
              await tx.moduleGrammarExerciseOption.createMany({
                data: exercise.exercise_options.create.map((option: any) => ({
                  ...option,
                  moduleGrammarExerciseId: createdExercise.id,
                })),
              });
            }
          }
        }
      }

      // Pronunciation (and its nested relations)
      if (module_pronunciation && module_pronunciation.create) {
        const createdPronunciation = await tx.modulePronunciation.create({
          data: {
            focus: module_pronunciation.create.focus,
            focus_ru: module_pronunciation.create.focus_ru,
            content: module_pronunciation.create.content,
            content_ru: module_pronunciation.create.content_ru,
            hint: module_pronunciation.create.hint,
            hint_ru: module_pronunciation.create.hint_ru,
            moduleId: module.id,
          },
        });
        if (module_pronunciation.create.minimal_pairs && module_pronunciation.create.minimal_pairs.create) {
          await tx.modulePronunciationMinimalPair.createMany({
            data: module_pronunciation.create.minimal_pairs.create.map((pair: any) => ({
              ...pair,
              modulePronunciationId: createdPronunciation.id,
            })),
          });
        }
        if (module_pronunciation.create.exercises && module_pronunciation.create.exercises.create) {
          await tx.modulePronunciationExercise.createMany({
            data: module_pronunciation.create.exercises.create.map((exercise: any) => ({
              ...exercise,
              modulePronunciationId: createdPronunciation.id,
            })),
          });
        }
      }

      // Listening (and its nested relations)
      if (module_listening && module_listening.create) {
        const createdListening = await tx.moduleListening.create({
          data: {
            audio_url: module_listening.create.audio_url,
            transcript: module_listening.create.transcript,
            transcript_ru: module_listening.create.transcript_ru,
            content: module_listening.create.content,
            content_ru: module_listening.create.content_ru,
            hint: module_listening.create.hint,
            hint_ru: module_listening.create.hint_ru,
            moduleId: module.id,
          },
        });
        // Listening Questions (with their options)
        if (module_listening.create.questions && module_listening.create.questions.create) {
          for (const question of module_listening.create.questions.create) {
            const createdQuestion = await tx.moduleListeningQuestion.create({
              data: {
                type: question.type,
                question: question.question,
                question_ru: question.question_ru,
                answer: question.answer,
                position: question.position,
                moduleListeningId: createdListening.id,
              },
            });
            if (question.options && question.options.create) {
              await tx.moduleListeningQuestionOption.createMany({
                data: question.options.create.map((option: any) => ({
                  ...option,
                  moduleListeningQuestionId: createdQuestion.id,
                })),
              });
            }
          }
        }
      }

      // Speaking (and its nested relations)
      if (module_speaking && module_speaking.create) {
        const createdSpeaking = await tx.moduleSpeaking.create({
          data: {
            content: module_speaking.create.content,
            content_ru: module_speaking.create.content_ru,
            hint: module_speaking.create.hint,
            hint_ru: module_speaking.create.hint_ru,
            moduleId: module.id,
          },
        });
        if (module_speaking.create.exercises && module_speaking.create.exercises.create) {
          await tx.moduleSpeakingExercise.createMany({
            data: module_speaking.create.exercises.create.map((exercise: any) => ({
              ...exercise,
              moduleSpeakingId: createdSpeaking.id,
            })),
          });
        }
      }

      // Reading (and its nested relations)
      if (module_reading && module_reading.create) {
        const createdReading = await tx.moduleReading.create({
          data: {
            text: module_reading.create.text,
            text_ru: module_reading.create.text_ru,
            hint: module_reading.create.hint,
            hint_ru: module_reading.create.hint_ru,
            moduleId: module.id,
          },
        });
        // Reading Questions (with their options)
        if (module_reading.create.questions && module_reading.create.questions.create) {
          for (const question of module_reading.create.questions.create) {
            const createdQuestion = await tx.moduleReadingQuestion.create({
              data: {
                type: question.type,
                question: question.question,
                question_ru: question.question_ru,
                answer: question.answer,
                position: question.position,
                moduleReadingId: createdReading.id,
              },
            });
            if (question.options && question.options.create) {
              await tx.moduleReadingQuestionOption.createMany({
                data: question.options.create.map((option: any) => ({
                  ...option,
                  moduleReadingQuestionId: createdQuestion.id,
                })),
              });
            }
          }
        }
      }

      // Writing (and its nested relations)
      if (module_writing && module_writing.create) {
        const createdWriting = await tx.moduleWriting.create({
          data: {
            content: module_writing.create.content,
            content_ru: module_writing.create.content_ru,
            hint: module_writing.create.hint,
            hint_ru: module_writing.create.hint_ru,
            moduleId: module.id,
          },
        });
        if (module_writing.create.exercises && module_writing.create.exercises.create) {
          await tx.moduleWritingExercise.createMany({
            data: module_writing.create.exercises.create.map((exercise: any) => ({
              ...exercise,
              moduleWritingId: createdWriting.id,
            })),
          });
        }
      }

      // Cultural
      if (module_cultural && module_cultural.create) {
        await tx.moduleCultural.create({
          data: {
            title: module_cultural.create.title,
            title_ru: module_cultural.create.title_ru,
            content: module_cultural.create.content,
            content_ru: module_cultural.create.content_ru,
            souvenir_name: module_cultural.create.souvenir_name,
            souvenir_name_ru: module_cultural.create.souvenir_name_ru,
            souvenir_description: module_cultural.create.souvenir_description,
            souvenir_description_ru: module_cultural.create.souvenir_description_ru,
            souvenir_download_url: module_cultural.create.souvenir_download_url,
            hint: module_cultural.create.hint,
            hint_ru: module_cultural.create.hint_ru,
            moduleId: module.id,
          },
        });
      }

      // Quiz (and its options)
      if (module_quizzes && module_quizzes.create && module_quizzes.create.length > 0) {
        for (const question of module_quizzes.create) {
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
              moduleId: module.id,
            },
          });
          if (question.options && question.options.create) {
            await tx.moduleQuizOption.createMany({
              data: question.options.create.map((option: any) => ({
                ...option,
                moduleQuizId: createdQuestion.id,
              })),
            });
          }
        }
      }

      // Mission Challenge (and its requirements)
      if (module_mission_challenges && module_mission_challenges.create) {
        const createdMissionChallenge = await tx.moduleMissionChallenge.create({
          data: {
            title: module_mission_challenges.create.title,
            title_ru: module_mission_challenges.create.title_ru,
            description: module_mission_challenges.create.description,
            description_ru: module_mission_challenges.create.description_ru,
            hint: module_mission_challenges.create.hint,
            hint_ru: module_mission_challenges.create.hint_ru,
            moduleId: module.id,
          },
        });
        if (module_mission_challenges.create.requirements && module_mission_challenges.create.requirements.create) {
          await tx.moduleMissionRequirement.createMany({
            data: module_mission_challenges.create.requirements.create.map((req: any) => ({
              ...req,
              moduleMissionChallengeId: createdMissionChallenge.id,
            })),
          });
        }
      }

      return module;
    });

    return NextResponse.json({ message: 'Module created successfully', module: newModule }, { status: 201 });

  } catch (error) {
    console.error('Error creating module:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Failed to create module', error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'An unknown error occurred while creating the module' },
      { status: 500 }
    );
  }
}