// app/api/communication/students/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // e.g., 'active', 'premium', 'high-progress', 'low-progress', 'inactive'

    let whereClause: any = {};

    switch (filter) {
      case 'active':
        whereClause.status = 'active';
        break;
      case 'premium':
        whereClause.subscription_status = 'premium'; // Assuming this field exists
        break;
      case 'high-progress':
        whereClause.progress = { gte: 70 }; // Now 'progress' field exists on Student
        break;
      case 'low-progress':
        whereClause.progress = { lt: 30 }; // Now 'progress' field exists on Student
        break;
      case 'inactive':
        whereClause.status = 'inactive';
        break;
      case 'all':
      default:
        // No specific filter, fetch all
        break;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        status: true, // Now available on Student model
        progress: true, // Now available on Student model
        last_active: true, // Now available on Student model
        subscription_status: true, // Added for 'premium' filter in frontend
        // Include student_modules to count completed modules
        student_modules: {
          where: {
            status: 'completed' // Assuming StudentModule has a status field
          },
          select: { id: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform data to match frontend Student interface
    const formattedStudents = students.map(s => ({
      id: s.id, // Keep as number, frontend will handle it
      name: s.name,
      email: s.email,
      status: s.status as "active" | "inactive" | "premium", // Cast to match frontend enum
      progress: s.progress || 0, // Ensure progress is a number
      lastActive: s.last_active ? s.last_active.toISOString().split('T')[0] : 'N/A', // Format date
      completedModules: s.student_modules?.length || 0, // Count completed modules
      subscription_status: s.subscription_status || 'free', // Add subscription_status
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { message: 'Failed to fetch students.', error: (error as Error).message },
      { status: 500 }
    );
  }
}