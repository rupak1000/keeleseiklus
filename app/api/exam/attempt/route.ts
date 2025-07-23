import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getCurrentUser } from '@/src/lib/auth';
const prisma = new PrismaClient();
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
    if (isNaN(userId)) {
      console.error('Invalid user ID:', user.id);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { examId, score, totalPoints, percentage, passed, timeSpent, answers, sectionScores } =
      await request.json();

    const attempt = await prisma.studentExamAttempt.create({
      data: {
        student_id: userId,
        exam_template_id: examId,
        attempt_number: await prisma.studentExamAttempt.count({
          where: { student_id: userId, exam_template_id: examId },
        }) + 1,
        score,
        total_points: totalPoints,
        percentage,
        passed,
        completed_at: new Date(),
        time_spent: timeSpent,
        answers,
        section_scores: sectionScores,
        certificate_issued: passed,
      },
    });

    if (passed) {
      const student = await prisma.student.findUnique({ where: { id: userId } });
      await prisma.certificate.create({
        data: {
          student_id: userId,
          exam_template_id: examId,
          student_name: student?.name || 'Student',
          student_email: student?.email || 'student@example.com',
          score: percentage,
          completed_modules: (await prisma.studentModule.count({
            where: { student_id: userId, status: 'completed' },
          })),
          completed_at: new Date(),
          generated_at: new Date(),
        },
      });
    }

    return NextResponse.json(attempt);
  } catch (error: any) {
    console.error('Error saving exam attempt:', {
      message: error.message,
      stack: error.stack,
      databaseUrl: process.env.DATABASE_URL?.replace(/:\/\//g, '://<redacted>@'),
    });
    return NextResponse.json(
      {
        error: 'Failed to save exam attempt',
        details: error.message.includes('connect') ? 'Database connection failed' : error.message,
      },
      { status: 500 },
    );
  }
}