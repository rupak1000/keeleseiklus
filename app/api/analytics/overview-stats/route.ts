// app/api/analytics/overview-stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const totalStudents = await prisma.student.count();
    const activeStudents = await prisma.student.count({ where: { status: 'active' } });
    const premiumStudents = await prisma.student.count({ where: { subscription_status: 'premium' } });

    // Calculate average progress
    const avgProgressResult = await prisma.student.aggregate({
      _avg: { progress: true },
    });
    const averageProgress = avgProgressResult._avg.progress ? Math.round(avgProgressResult._avg.progress) : 0;

    // Calculate exam pass rate
    const totalExamAttempts = await prisma.studentExamAttempt.count();
    const passedExams = await prisma.studentExamAttempt.count({ where: { passed: true } });
    const examPassRate = totalExamAttempts > 0 ? Math.round((passedExams / totalExamAttempts) * 100) : 0;

    // Calculate average exam score
    const avgExamScoreResult = await prisma.studentExamAttempt.aggregate({
      _avg: { percentage: true },
    });
    const averageExamScore = avgExamScoreResult._avg.percentage ? Math.round(avgExamScoreResult._avg.percentage) : 0;

    // Total modules completed (sum of completed modules per student)
    // This is complex and might be better as a separate, more specific query if performance is an issue.
    // For now, let's just return the count of StudentModule records marked as 'completed'
    const totalModulesCompletedRecords = await prisma.studentModule.count({
      where: { status: 'completed' }
    });
    // This doesn't directly give "average modules per student" without more complex aggregation or fetching all students.
    // For simplicity, let's just return total completed module records.
    // The frontend can then divide by totalStudents.
    const totalModules = await prisma.module.count(); // Get total available modules

    // Calculate total time spent (summing up total_time_spent from students)
    // This is tricky because total_time_spent is a string "0h 0m".
    // It's better to store this as an Int (minutes or seconds) in the DB.
    // For now, we'll return 0 and note the need for schema change.
    // If you change total_time_spent to Int in DB:
    /*
    const totalTimeSpentResult = await prisma.student.aggregate({
      _sum: { total_time_spent_in_minutes: true } // Assuming new field
    });
    const totalTimeSpentHours = totalTimeSpentResult._sum.total_time_spent_in_minutes ? Math.round(totalTimeSpentResult._sum.total_time_spent_in_minutes / 60) : 0;
    */
    const totalTimeSpentHours = 0; // Placeholder until schema change for total_time_spent

    return NextResponse.json({
      totalStudents,
      activeStudents,
      premiumStudents,
      averageProgress,
      totalExamAttempts,
      passedExams,
      examPassRate,
      averageExamScore,
      totalModulesCompleted: totalModulesCompletedRecords, // Total completed records, not unique modules
      averageModulesPerStudent: totalStudents > 0 ? Math.round(totalModulesCompletedRecords / totalStudents) : 0, // Simplified avg
      totalTimeSpent: totalTimeSpentHours,
      totalAvailableModules: totalModules, // Send total modules for frontend calculation
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch overview stats.', error: (error as Error).message },
      { status: 500 }
    );
  }
}