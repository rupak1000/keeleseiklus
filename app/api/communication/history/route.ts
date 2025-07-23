// app/api/communication/history/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET(request: Request) {
  try {
    const history = await prisma.emailHistory.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        subject: true,
        status: true,
        recipients_count: true,
        sent_at: true,
        scheduled_at: true,
        created_at: true,
        to_emails: true,
        // You might include other fields if needed for display in the history list
      }
    });

    // Parse JSON string fields back to arrays for frontend
    const formattedHistory = history.map(item => ({
      ...item,
      to_emails: JSON.parse(item.to_emails as string),
      // Parse cc_emails, bcc_emails if you select them
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching email history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch email history.', error: (error as Error).message },
      { status: 500 }
    );
  }
}
