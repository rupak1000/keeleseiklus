// app/api/analytics/level-distribution/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: { level: true },
    });

    const levelCounts: Record<string, number> = {};
    students.forEach(s => {
      const level = s.level || "A1"; // Default to A1 if null
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    const totalStudents = students.length;

    const distribution = Object.entries(levelCounts).map(([level, count]) => ({
      level,
      count,
      percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
    }));

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Error fetching level distribution:', error);
    return NextResponse.json(
      { message: 'Failed to fetch level distribution.', error: (error as Error).message },
      { status: 500 }
    );
  }
}