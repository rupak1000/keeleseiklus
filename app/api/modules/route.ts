// src/app/api/modules/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

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
        _count: {
          select: {
            module_vocabulary: true,
            module_quizzes: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formattedModules = modules.map(module => ({
      id: module.id,
      title: module.title,
      subtitle: module.subtitle,
      level: module.level,
      duration: module.duration || 'Unknown', // Fallback if duration is null
      location: module.location || 'Unknown', // Fallback if location is null
      vocabulary: {
        length: module._count.module_vocabulary,
      },
      quiz: {
        length: module._count.module_quizzes,
      },
    }));

    return NextResponse.json(formattedModules);
  } catch (error: any) {
    console.error('Error fetching modules:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}