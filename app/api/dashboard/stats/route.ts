// app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();
export async function GET(request: Request) {
  try {
    // Fetch total modules
    const totalModules = await prisma.module.count();

    // Fetch total students
    const totalStudents = await prisma.student.count();

    // Fetch active students (assuming 'status' field in Student model)
    const activeStudents = await prisma.student.count({
      where: { status: 'active' },
    });

    // Fetch premium users (assuming 'subscription_status' field in Student model)
    const premiumUsers = await prisma.student.count({
      where: { subscription_status: 'premium' },
    });

    // Fetch total exam questions (assuming ExamQuestion model)
    const totalExamQuestions = await prisma.examQuestion.count();

    // You might need to define what "recent activity" means.
    // For example, count students active in the last 7 days.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = await prisma.student.count({
      where: {
        last_active: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Return the aggregated stats
    return NextResponse.json({
      totalModules,
      totalStudents,
      activeStudents,
      premiumUsers,
      totalExamQuestions,
      recentActivity,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch dashboard stats', error: (error as Error).message },
      { status: 500 }
    );
  }
}