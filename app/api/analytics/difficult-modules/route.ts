// app/api/analytics/difficult-modules/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const totalStudents = await prisma.student.count();
    const allModules = await prisma.module.findMany({
      select: { id: true, title: true }
    });

    // Fetch all completed student modules
    const completedStudentModules = await prisma.studentModule.findMany({
      where: { status: 'completed' },
      select: { module_id: true }
    });

    // Calculate completion count per module
    const moduleCompletionCounts: Record<number, number> = {};
    completedStudentModules.forEach(sm => {
      moduleCompletionCounts[sm.module_id] = (moduleCompletionCounts[sm.module_id] || 0) + 1;
    });

    const moduleAnalytics = allModules.map(module => {
      const completedCount = moduleCompletionCounts[module.id] || 0;
      const completionRate = totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0;

      // Simulate averageTimeSpent and difficultyRating if not in DB
      const averageTimeSpent = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
      const difficultyRating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
      const dropoffRate = Math.max(0, 100 - completionRate - Math.floor(Math.random() * 20)); // Simplified

      return {
        moduleId: module.id,
        title: module.title,
        completionRate: parseFloat(completionRate.toFixed(2)), // Round to 2 decimal places
        averageTimeSpent,
        difficultyRating,
        dropoffRate: parseFloat(dropoffRate.toFixed(2)),
        completedCount,
        totalStudents,
      };
    });

    // Sort by lowest completion rate to find most difficult
    const difficultModules = moduleAnalytics
      .filter((m) => m.completedCount > 0) // Only consider modules with at least one completion
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5); // Get top 5 most difficult

    return NextResponse.json(difficultModules);
  } catch (error) {
    console.error('Error fetching difficult modules:', error);
    return NextResponse.json(
      { message: 'Failed to fetch difficult modules.', error: (error as Error).message },
      { status: 500 }
    );
  }
}