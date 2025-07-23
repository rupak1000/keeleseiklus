// app/api/analytics/top-performers/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const topStudents = await prisma.student.findMany({
      where: { status: 'active' }, // Only active students
      orderBy: { progress: 'desc' }, // Order by progress descending
      take: 5, // Get top 5
      select: {
        id: true,
        name: true,
        email: true,
        progress: true,
        level: true,
        streak: true,
        achievements: true,
        student_modules: { // To count completed modules
          where: { status: 'completed' },
          select: { id: true }
        }
      },
    });

    const formattedTopStudents = topStudents.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      progress: s.progress || 0,
      completedModules: s.student_modules?.length || 0,
      currentLevel: s.level,
      streak: s.streak || 0,
      achievements: s.achievements || [],
    }));

    return NextResponse.json(formattedTopStudents);
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return NextResponse.json(
      { message: 'Failed to fetch top performers.', error: (error as Error).message },
      { status: 500 }
    );
  }
}