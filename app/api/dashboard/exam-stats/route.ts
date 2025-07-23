// app/api/dashboard/exam-stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalSections = await prisma.examSection.count();
    
    // To get total points, you'd need to sum points from all ExamQuestions
    // This requires a Prisma aggregation query.
    const totalPointsResult = await prisma.examQuestion.aggregate({
      _sum: {
        points: true,
      },
    });
    const totalPoints = totalPointsResult._sum.points || 0;

    return NextResponse.json({
      totalSections,
      totalPoints,
    });
  } catch (error) {
    console.error('Error fetching exam stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch exam stats', error: (error as Error).message },
      { status: 500 }
    );
  }
}