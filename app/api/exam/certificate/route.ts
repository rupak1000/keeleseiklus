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

    const { searchParams } = new URL(request.url);
    const studentId = parseInt(searchParams.get('studentId') || '0');
    const examId = parseInt(searchParams.get('examId') || '0');

    if (studentId !== user.id) {
      console.log('Unauthorized access attempt', { studentId, userId: user.id });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        student_id: studentId,
        exam_template_id: examId,
      },
      orderBy: { generated_at: 'desc' },
    });

    if (!certificate) {
      console.log('No certificate found', { studentId, examId });
      return NextResponse.json({ error: 'No certificate found' }, { status: 404 });
    }

    return NextResponse.json({
      student_name: certificate.student_name,
      student_email: certificate.student_email,
      score: certificate.score,
      completed_modules: certificate.completed_modules,
      completed_at: certificate.completed_at,
      generated_at: certificate.generated_at,
    });
  } catch (error: any) {
    console.error('Error fetching certificate:', {
      message: error.message,
      stack: error.stack,
      databaseUrl: process.env.DATABASE_URL?.replace(/:\/\//g, '://<redacted>@'),
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch certificate',
        details: error.message.includes('connect') ? 'Database connection failed' : error.message,
      },
      { status: 500 },
    );
  }
}