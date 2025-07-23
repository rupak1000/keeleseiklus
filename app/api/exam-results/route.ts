// app/api/exam-results/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const examAttempts = await prisma.studentExamAttempt.findMany({
      select: {
        id: true,
        student_id: true,
        exam_template_id: true,
        attempt_number: true,
        score: true,
        total_points: true,
        percentage: true,
        passed: true,
        completed_at: true,
        time_spent: true,
        answers: true,
        section_scores: true,
        student: { // Include student to get name and email
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { completed_at: 'desc' }, // Order by most recent
    });

    const formattedResults = examAttempts.map(attempt => ({
      id: attempt.id,
      examId: attempt.exam_template_id, // Map to examId
      studentId: attempt.student_id,
      studentName: attempt.student?.name || 'N/A',
      studentEmail: attempt.student?.email || 'N/A',
      score: attempt.score,
      totalQuestions: attempt.total_points, // Assuming total_points in DB is totalQuestions
      points: attempt.score, // Assuming 'score' is points earned
      maxPoints: attempt.total_points, // Assuming 'total_points' is max points
      percentage: attempt.percentage,
      completedAt: attempt.completed_at.toISOString(),
      passed: attempt.passed,
      timeSpent: attempt.time_spent,
      attemptNumber: attempt.attempt_number,
      answers: attempt.answers as Record<string, any>, // Cast Json field
      sectionScores: attempt.section_scores as Record<string, { score: number; total: number }>, // Cast Json field
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json(
      { message: 'Failed to fetch exam results.', error: (error as Error).message },
      { status: 500 }
    );
  }
}