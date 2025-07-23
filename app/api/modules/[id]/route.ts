// src/app/api/modules/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getCurrentUser } from '@/src/lib/auth'; // Use '../../lib/auth' if auth.ts is in src/lib/
import { ModuleData } from '@/src/types/module';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const moduleId = Number.parseInt(params.id);
    if (isNaN(moduleId)) {
      console.error(`Invalid module ID: ${params.id}`);
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    console.log(`Fetching module with ID: ${moduleId}`);
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        module_stories: true,
        module_vocabulary: true,
        module_grammar: { include: { grammar_rules: true, grammar_examples: true, grammar_exercises: { include: { exercise_options: true } } } },
        module_pronunciation: { include: { exercises: true, minimal_pairs: true } },
        module_listening: { include: { questions: { include: { options: true } } } },
        module_speaking: { include: { exercises: true } },
        module_reading: { include: { questions: { include: { options: true } } } },
        module_writing: { include: { exercises: true } },
        module_cultural: true,
      },
    });

    if (!module) {
      console.error(`Module not found for ID: ${moduleId}`);
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const moduleData: ModuleData = {
      id: module.id,
      title: module.title,
      title_ru: module.title_ru || undefined,
      subtitle: module.subtitle,
      subtitle_ru: module.subtitle_ru || undefined,
      description: module.description,
      description_ru: module.description_ru || undefined,
      level: module.level,
      module_stories: module.module_stories || [],
      module_vocabulary: module.module_vocabulary || [],
      module_grammar: module.module_grammar || [],
      module_pronunciation: module.module_pronunciation || [],
      module_listening: module.module_listening || [],
      module_speaking: module.module_speaking || [],
      module_reading: module.module_reading || [],
      module_writing: module.module_writing || [],
      module_cultural: module.module_cultural || [],
    };

    console.log(`Fetching user data for module ID: ${moduleId}`);
    const user = await getCurrentUser();
    if (!user) {
      console.log(`No authenticated user for module ID: ${moduleId}`);
      return NextResponse.json({
        module: moduleData,
        isLoggedIn: false,
        user: null,
        progress: null,
      });
    }

    console.log(`Fetching student data for user ID: ${user.id}`);
    let student = await prisma.student.findUnique({
      where: { id: parseInt(user.id) },
    });

    if (!student) {
      console.log(`Creating new student for user ID: ${user.id}`);
      try {
        student = await prisma.student.create({
          data: {
            id: parseInt(user.id),
            name: user.name || 'Unknown',
            email: user.email || '',
            level: 'Beginner',
            total_time_spent: 0,
            last_active: new Date(),
            is_admin: user.isAdmin || false,
            enrollment_date: new Date(),
            streak: 0,
            status: 'active',
            subscription_status: 'free',
          },
        });
      } catch (studentError: any) {
        console.error(`Failed to create student for user ID: ${user.id}`, {
          message: studentError.message,
          stack: studentError.stack,
        });
        throw studentError;
      }
    }

    console.log(`Fetching student module progress for user ID: ${user.id}, module ID: ${moduleId}`);
    let studentModule = await prisma.studentModule.findUnique({
      where: {
        student_id_module_id: {
          student_id: parseInt(user.id),
          module_id: moduleId,
        },
      },
    });

    if (!studentModule) {
      console.log(`Creating new student module for user ID: ${user.id}, module ID: ${moduleId}`);
      try {
        studentModule = await prisma.studentModule.create({
          data: {
            student_id: parseInt(user.id),
            module_id: moduleId,
            progress: 0,
            status: 'not_started',
            story: false,
            vocabulary: false,
            grammar: false,
            pronunciation: false,
            listening: false,
            speaking: false,
            reading: false,
            writing: false,
            cultural: false,
            quiz: false,
            time_spent: 30,
          },
        });
      } catch (moduleError: any) {
        console.error(`Failed to create student module for user ID: ${user.id}, module ID: ${moduleId}`, {
          message: moduleError.message,
          stack: moduleError.stack,
        });
        throw moduleError;
      }
    }

    const progress = {
      story: studentModule.story,
      vocabulary: studentModule.vocabulary,
      grammar: studentModule.grammar,
      pronunciation: studentModule.pronunciation,
      listening: studentModule.listening,
      speaking: studentModule.speaking,
      reading: studentModule.reading,
      writing: studentModule.writing,
      cultural: studentModule.cultural,
      quiz: studentModule.quiz,
    };

    return NextResponse.json({
      module: moduleData,
      isLoggedIn: true,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        level: student.level,
        total_time_spent: student.total_time_spent,
        enrollment_date: student.enrollment_date?.toISOString(),
        last_active: student.last_active.toISOString(),
        is_admin: student.is_admin,
        streak: student.streak,
        achievements: student.achievements || null,
        status: student.status,
        subscription_status: student.subscription_status,
        subscription_date: student.subscription_date?.toISOString() || null,
        completedModules: student.completedModulesList?.length || 0,
        completedModulesList: student.completedModulesList || [],
      },
      progress,
    });
  } catch (error: any) {
    console.error('Error in /api/modules/[id]:', {
      message: error.message,
      stack: error.stack,
      moduleId: params.id,
    });
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}