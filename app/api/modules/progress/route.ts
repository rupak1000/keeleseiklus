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

    const userId = parseInt(user.id);

    const studentModules = await prisma.studentModule.findMany({
      where: { student_id: userId },
      select: {
        module_id: true,
        progress: true,
        status: true,
        completed_at: true,
        story: true,
        vocabulary: true,
        grammar: true,
        pronunciation: true,
        listening: true,
        speaking: true,
        reading: true,
        writing: true,
        cultural: true,
        quiz: true,
        time_spent: true,
      },
    });

    const moduleProgress: { [moduleId: number]: any } = {};
    studentModules.forEach((sm) => {
      moduleProgress[sm.module_id] = {
        progress: sm.progress || 0,
        status: sm.status,
        completed: sm.status === 'completed',
        completedAt: sm.completed_at?.toISOString() || null,
        story: sm.story,
        vocabulary: sm.vocabulary,
        grammar: sm.grammar,
        pronunciation: sm.pronunciation,
        listening: sm.listening,
        speaking: sm.speaking,
        reading: sm.reading,
        writing: sm.writing,
        cultural: sm.cultural,
        quiz: sm.quiz,
        timeSpent: sm.time_spent || 30,
      };
    });

    return NextResponse.json(moduleProgress);
  } catch (error: any) {
    console.error('Error fetching module progress:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}