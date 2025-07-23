// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    // For demonstration: Fetch the first student.
    // In a real application, you would get the user ID from an authentication token/session.
    const user = await prisma.student.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        progress: true, // Assuming Student model has a progress field
        last_active: true,
        is_admin: true,
        subscription_status: true,
        subscription_date: true,
        // Include related student_modules to get completed module IDs
        student_modules: {
          where: {
            status: 'completed'
          },
          select: {
            module_id: true
          }
        }
      }
    });

    if (!user) {
      // If no user found (e.g., no students in DB), return null to indicate not logged in
      return NextResponse.json(null, { status: 200 });
    }

    // Format data for the frontend User interface
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      level: user.level,
      progress: user.progress || 0,
      completedModulesList: user.student_modules.map(sm => sm.module_id), // Extract module IDs
      lastActive: user.last_active.toISOString(),
      isAdmin: user.is_admin,
      subscriptionStatus: user.subscription_status || 'free',
      subscriptionDate: user.subscription_date?.toISOString() || undefined,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user data.', error: (error as Error).message },
      { status: 500 }
    );
  }
}
