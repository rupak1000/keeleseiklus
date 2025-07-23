import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getCurrentUser } from '@/src/lib/auth';
const prisma = new PrismaClient();
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
    if (isNaN(userId)) {
      console.error('Invalid user ID:', user.id);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { moduleId } = await request.json();
    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID required' }, { status: 400 });
    }

    // Fetch user data
    const student = await prisma.student.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        student_modules: {
          where: { status: 'completed' },
          select: { module_id: true, completed_at: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fetch existing user achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { student_id: userId },
      select: { achievement_id: true },
    });
    const earnedAchievementIds = new Set(userAchievements.map((ua) => ua.achievement_id));

    // Check for unlockable achievements
    const achievements = await prisma.achievement.findMany({
      select: { id: true, criteria: true },
    });

    const newAchievements: { achievement_id: number; earned_at: Date }[] = [];

    for (const achievement of achievements) {
      if (earnedAchievementIds.has(achievement.id)) continue;

      let shouldUnlock = false;
      if (achievement.id === 1 && student.student_modules.some((sm) => sm.module_id === 1)) {
        // First Steps: Complete Module 1
        shouldUnlock = true;
      } else if (achievement.id === 10 && student.student_modules.length >= 40) {
        // Language Master: Complete all 40 modules
        shouldUnlock = true;
      } else if (achievement.id === 11 && student.streak >= 30) {
        // Streak Champion: 30-day streak
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        newAchievements.push({
          achievement_id: achievement.id,
          earned_at: new Date(),
        });
      }
    }

    // Insert new achievements
    if (newAchievements.length > 0) {
      await prisma.userAchievement.createMany({
        data: newAchievements.map((na) => ({
          student_id: userId,
          achievement_id: na.achievement_id,
          earned_at: na.earned_at,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      });
      console.log(`Unlocked ${newAchievements.length} achievements for user ${userId}`);
    }

    return NextResponse.json({ newAchievements: newAchievements.length });
  } catch (error: any) {
    console.error('Error checking achievements:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: 'Failed to check achievements',
        details: error.message.includes('connect') ? 'Database connection failed' : error.message,
      },
      { status: 500 }
    );
  }
}