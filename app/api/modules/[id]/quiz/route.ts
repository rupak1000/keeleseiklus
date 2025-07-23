// /app/api/modules/[id]/quiz/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getCurrentUser } from '@/src/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const moduleId = Number.parseInt(params.id);

    if (isNaN(moduleId)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const moduleWithQuiz = await prisma.module.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        title: true,
        title_ru: true,
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
            position: true, // You have a position field, good for ordering!
            // --- THIS IS THE CRITICAL CHANGE ---
            options: { // Select the related ModuleQuizOption records
              select: {
                option_text: true,
                option_text_ru: true,
              },
              orderBy: {
                position: 'asc', // Order options by their position
              },
            },
            // --- END CRITICAL CHANGE ---
          },
          orderBy: {
            position: 'asc', // Order quiz questions by their position
          },
        },
      },
    });

    if (!moduleWithQuiz) {
      return NextResponse.json({ error: 'Module or quiz not found' }, { status: 404 });
    }

    const quizQuestions = moduleWithQuiz.module_quizzes.map(q => ({
      id: q.id,
      type: q.type as any, // Type assertion is okay if you ensure type consistency
      question: q.question,
      question_ru: q.question_ru,
      answer: q.answer,
      hint: q.hint,
      hint_ru: q.hint_ru,
      audioUrl: q.audio_url,
      // Map the related options into a simple string array for the frontend
      options: q.options.map(opt => opt.option_text),
      options_ru: q.options.map(opt => opt.option_text_ru).filter((text): text is string => text !== null), // Filter out nulls for options_ru
    }));

    const responseData = {
      moduleId: moduleWithQuiz.id,
      moduleTitle: moduleWithQuiz.title,
      moduleTitle_ru: moduleWithQuiz.title_ru,
      quiz: quizQuestions,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error fetching quiz data:', {
      message: error.message,
      stack: error.stack,
      moduleId: params.id,
    });
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
  // Remember to not disconnect Prisma here
}