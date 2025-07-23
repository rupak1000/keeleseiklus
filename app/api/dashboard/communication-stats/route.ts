// app/api/dashboard/communication-stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();

export async function GET() {
  try {
    const emailTemplatesCount = await prisma.emailTemplate.count();

    // Emails sent this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const emailsSentThisMonth = await prisma.emailHistory.count({
      where: {
        sent_at: {
          gte: startOfMonth,
        },
      },
    });

    // Notifications Status (e.g., from NotificationSettings)
    const notificationSettings = await prisma.notificationSettings.findFirst();
    const notificationsStatus = notificationSettings?.enable_push_notifications || notificationSettings?.enable_email_notifications ? "Active" : "Inactive";


    return NextResponse.json({
      emailTemplatesCount,
      emailsSentThisMonth,
      notificationsStatus,
    });
  } catch (error) {
    console.error('Error fetching communication stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch communication stats', error: (error as Error).message },
      { status: 500 }
    );
  }
}