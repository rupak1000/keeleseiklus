// api/modules/route.ts
import { NextResponse } from 'next/server';

import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();
export async function GET(request: Request) {
  try {
    const modules = await prisma.module.findMany({
      select: {
        id: true,
        title: true,
        subtitle: true,
        level: true,
        duration: true,
        location: true,
        // Include counts of related data if you need them for display
        _count: {
          select: {
            module_vocabulary: true,
            module_quizzes: true,
            // Add other relations if you display their counts (e.g., grammar, exercises)
          },
        },
      },
      orderBy: {
        id: 'asc', // Order by ID for consistent display
      },
    });

    // Transform data to match frontend's expected 'Module' type
    const formattedModules = modules.map(module => ({
      id: module.id,
      title: module.title,
      subtitle: module.subtitle,
      level: module.level,
      duration: module.duration,
      location: module.location,
      vocabulary: {
        length: module._count.module_vocabulary // Use the count directly
      },
      quiz: {
        length: module._count.module_quizzes // Use the count directly
      }
      // Add other fields you selected and need on the frontend
    }));

    return NextResponse.json(formattedModules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { message: 'Error fetching modules', error: (error as Error).message },
      { status: 500 }
    );
  }
}