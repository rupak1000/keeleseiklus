// app/api/students/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
// GET handler to fetch all students with relevant data for frontend display
export async function GET() {
  try {
    console.log('Fetching students from database...');
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        // SECURITY: DO NOT select password_hash for frontend exposure
        is_admin: true,
        level: true,
        enrollment_date: true,
        last_active: true,
        total_time_spent: true,
        streak: true,
        achievements: true, // String[]
        status: true,
        progress: true, // Include progress field
        exam_status: true,
        exam_score: true,
        exam_attempts: true,
        subscription: true,
        subscription_status: true,
        subscription_date: true,
        phone: true,
        date_of_birth: true,
        country: true,
        preferred_language: true,
        notes: true,
        // Include student_modules to get completed module IDs
        student_modules: {
          where: {
            status: 'completed' // Assuming 'completed' status for finished modules
          },
          select: {
            module_id: true // Only need the module ID
          }
        }
      },
      orderBy: {
        id: 'asc', // Or any other order you prefer
      },
    });

    // Format data for the frontend, including the completedModulesList
    const formattedStudents = students.map(s => ({
      id: s.id, // ID is Int from DB, keep as number
      name: s.name,
      email: s.email,
      level: s.level,
      enrollmentDate: s.enrollment_date.toISOString(),
      lastActive: s.last_active.toISOString(),
      progress: s.progress || 0,
      completedModulesList: s.student_modules.map(sm => sm.module_id), // Extract module IDs
      currentLevel: s.level, // Map level to currentLevel
      totalTimeSpent: s.total_time_spent || '0h 0m',
      streak: s.streak || 0,
      achievements: s.achievements || [],
      subscription: s.subscription || 'Free',
      status: s.status,
      preferredLanguage: s.preferred_language || undefined,
      country: s.country || undefined,
      subscriptionStatus: s.subscription_status || 'free',
      subscriptionDate: s.subscription_date?.toISOString() || undefined,
      isAdmin: s.is_admin, // Include isAdmin
    }));

    console.log('Students fetched:', formattedStudents.length);
    return NextResponse.json(formattedStudents, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students', details: error.message }, { status: 500 });
  } finally {
    // In Next.js API routes, you typically don't need to manually disconnect Prisma,
    // as it's managed by the Next.js lifecycle. Removing this is generally fine.
  }
}

// POST handler for creating a new student (assuming this is used elsewhere)
// Ensure it uses the singleton prisma and handles autoincrement IDs correctly
export async function POST(request: Request) {
  try {
    const data = await request.json(); // Assuming validation happens on frontend or in a utility

    const student = await prisma.student.create({
      data: {
        // Do NOT include `id: data.id` if `id` is autoincrement in schema.prisma
        name: data.name,
        email: data.email,
        password_hash: data.password_hash,
        is_admin: data.is_admin ?? false,
        level: data.level ?? 'A1',
        enrollment_date: data.enrollment_date ? new Date(data.enrollment_date) : new Date(),
        last_active: data.last_active ? new Date(data.last_active) : new Date(),
        total_time_spent: data.total_time_spent ?? '0h 0m',
        streak: data.streak ?? 0,
        achievements: data.achievements ?? [],
        status: data.status ?? 'active',
        progress: data.progress ?? 0, // Ensure progress is handled
        exam_status: data.exam_status ?? 'not_taken',
        exam_score: data.exam_score ?? 0,
        exam_attempts: data.exam_attempts ?? 0,
        subscription: data.subscription ?? 'Free',
        subscription_status: data.subscription_status ?? 'free',
        subscription_date: data.subscription_date ? new Date(data.subscription_date) : null,
        phone: data.phone ?? null,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
        country: data.country ?? null,
        preferred_language: data.preferred_language ?? 'English',
        notes: data.notes ?? null,
      },
    });
    console.log('Student created:', student);
    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student', details: error.message }, { status: 500 });
  } finally {
    // No need to manually disconnect
  }
}
