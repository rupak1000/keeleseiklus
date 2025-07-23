// app/api/analytics/language-distribution/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: { preferred_language: true },
    });

    const languageCounts: Record<string, number> = {};
    students.forEach(s => {
      const lang = s.preferred_language || "English"; // Default to English if null
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });

    const totalStudents = students.length;

    const distribution = Object.entries(languageCounts).map(([language, count]) => ({
      language,
      count,
      percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
    }));

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Error fetching language distribution:', error);
    return NextResponse.json(
      { message: 'Failed to fetch language distribution.', error: (error as Error).message },
      { status: 500 }
    );
  }
}