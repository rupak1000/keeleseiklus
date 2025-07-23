import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getCurrentUser } from '@/src/lib/auth';
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const examTemplate = await prisma.examTemplate.findFirst({
      where: { is_active: true, is_published: true },
      include: {
        exam_sections: {
          include: {
            exam_questions: {
              select: {
                id: true,
                type: true,
                question: true,
                options: true,
                correct_answer: true,
                points: true,
                hint: true,
                explanation: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!examTemplate) {
      console.log('No active exam template found');
      return NextResponse.json({ error: 'No active exam template available' }, { status: 404 });
    }

    return NextResponse.json({
      id: examTemplate.id,
      title: examTemplate.title,
      description: examTemplate.description,
      timeLimit: examTemplate.time_limit,
      passingScore: examTemplate.passing_score,
      totalPoints: examTemplate.total_points,
      sections: examTemplate.exam_sections.map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        max_points: section.max_points,
        questions: section.exam_questions.map((question) => ({
          id: question.id,
          type: question.type,
          question: question.question,
          options: question.options,
          correctAnswer: question.correct_answer,
          points: question.points,
          hint: question.hint,
          explanation: question.explanation,
          difficulty: question.difficulty,
        })),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching exam template:', {
      message: error.message,
      stack: error.stack,
      databaseUrl: process.env.DATABASE_URL?.replace(/:\/\//g, '://<redacted>@'),
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch exam template',
        details: error.message.includes('connect') ? 'Database connection failed' : error.message,
      },
      { status: 500 },
    );
  }
}