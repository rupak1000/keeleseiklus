// app/api/dashboard/analytics-stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Avg Student Progress: This is a complex calculation.
    // It would require fetching all StudentModule progress records,
    // and then calculating an average.
    // Assuming StudentModule has a 'progress' field (0-100)
    const studentModuleProgress = await prisma.studentModule.aggregate({
      _avg: {
        progress: true,
      },
    });
    const avgStudentProgress = studentModuleProgress._avg.progress ? Math.round(studentModuleProgress._avg.progress) : 0;

    // Overall Completion Rate: Even more complex.
    // You'd need total modules, and total completed modules across all students.
    // For simplicity, let's just return a placeholder or a basic calculation.
    // Example: (Total completed student_modules / (Total students * Total modules)) * 100
    const totalCompletedStudentModules = await prisma.studentModule.count({
      where: { status: 'completed' } // Assuming a 'status' field on StudentModule
    });
    const totalPossibleStudentModules = await prisma.student.count() * await prisma.module.count();
    const overallCompletionRate = totalPossibleStudentModules > 0 
      ? Math.round((totalCompletedStudentModules / totalPossibleStudentModules) * 100) 
      : 0;


    return NextResponse.json({
      avgStudentProgress,
      overallCompletionRate,
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics stats', error: (error as Error).message },
      { status: 500 }
    );
  }
}