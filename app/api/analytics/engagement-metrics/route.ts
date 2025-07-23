// app/api/analytics/engagement-metrics/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        streak: true,
        last_active: true,
      },
    });

    const totalStudents = students.length;

    const activeStreaks = students.map((s) => s.streak || 0);
    const averageStreak = activeStreaks.length > 0 ? Math.round(activeStreaks.reduce((sum, s) => sum + s, 0) / activeStreaks.length) : 0;
    const maxStreak = Math.max(...activeStreaks, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyActive = students.filter((s) => {
      if (!s.last_active) return false;
      return s.last_active >= sevenDaysAgo;
    }).length;

    const retentionRate = totalStudents > 0 ? Math.round((recentlyActive / totalStudents) * 100) : 0;

    // Total time spent will be fetched from overview-stats
    // We can fetch it here again or assume it's fetched by overview-stats if needed.
    // For now, let's just return engagement specific metrics.

    return NextResponse.json({
      averageStreak,
      maxStreak,
      recentlyActive,
      retentionRate,
      totalStudents, // Pass total students to frontend for calculation if needed
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return NextResponse.json(
      { message: 'Failed to fetch engagement metrics.', error: (error as Error).message },
      { status: 500 }
    );
  }
}