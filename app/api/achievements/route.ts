import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getCurrentUser } from '@/src/lib/auth';
const prisma = new PrismaClient();
// Map achievement IDs to points and rarity from static data
const achievementMetadata: { [id: number]: { points: number; rarity: 'common' | 'rare' | 'epic' | 'legendary' } } = {
  1: { points: 100, rarity: 'common' },
  2: { points: 150, rarity: 'common' },
  3: { points: 150, rarity: 'common' },
  4: { points: 200, rarity: 'rare' },
  5: { points: 200, rarity: 'rare' },
  6: { points: 250, rarity: 'rare' },
  7: { points: 300, rarity: 'epic' },
  8: { points: 400, rarity: 'epic' },
  9: { points: 500, rarity: 'epic' },
  10: { points: 1000, rarity: 'legendary' },
  11: { points: 600, rarity: 'epic' },
  12: { points: 300, rarity: 'rare' },
};

export async function GET(request: Request) {
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

    const [achievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          badge_image: true,
          criteria: true,
          category: true,
        },
      }),
      prisma.userAchievement.findMany({
        where: { student_id: userId },
        select: {
          achievement_id: true,
          earned_at: true,
        },
      }),
    ]);

    const achievementsWithStatus = achievements.map((achievement) => {
      const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id);
      const metadata = achievementMetadata[achievement.id] || { points: 100, rarity: 'common' };
      return {
        id: achievement.id,
        title: achievement.name,
        description: achievement.description,
        icon: achievement.badge_image || '🏆',
        category: achievement.category || 'learning',
        earned: !!userAchievement,
        earnedDate: userAchievement?.earned_at?.toISOString(),
        requirement: achievement.criteria,
        points: metadata.points,
        rarity: metadata.rarity,
      };
    });

    return NextResponse.json(achievementsWithStatus);
  } catch (error: any) {
    console.error('Error fetching achievements:', {
      message: error.message,
      stack: error.stack,
      databaseUrl: process.env.DATABASE_URL?.replace(/:\/\//g, '://<redacted>@'),
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch achievements',
        details: error.message.includes('connect') ? 'Database connection failed' : error.message,
      },
      { status: 500 }
    );
  }
}