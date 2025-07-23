// app/api/analytics/country-distribution/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: { country: true },
    });

    const countryCounts: Record<string, number> = {};
    students.forEach(s => {
      const country = s.country || "Unknown"; // Default to Unknown if null
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const totalStudents = students.length;

    const distribution = Object.entries(countryCounts)
      .map(([country, count]) => ({
        country,
        count,
        percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Error fetching country distribution:', error);
    return NextResponse.json(
      { message: 'Failed to fetch country distribution.', error: (error as Error).message },
      { status: 500 }
    );
  }
}