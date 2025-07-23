import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
import { z } from 'zod'; // For robust validation
import bcrypt from 'bcryptjs'; // For password hashing

// Zod schema for validating the incoming update data from the frontend
const StudentUpdateSchema = z.object({
  name: z.string().trim().min(1, "Full Name is required.").optional(),
  email: z.string().email("Please enter a valid email address.").optional(),
  phone: z.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,9}$/, "Please enter a valid phone number (e.g., +1 555 123 4567).").optional().or(z.literal('')), // Allow empty string
  dateOfBirth: z.string().optional().or(z.literal('')), // YYYY-MM-DD string, allow empty
  country: z.string().optional().or(z.literal('')), // Allow empty string
  preferredLanguage: z.enum(['English', 'Russian']).optional(), // Adjust if more languages
  currentLevel: z.enum(['A1', 'A2', 'B1', 'B2']).optional(),
  // FIX: Add 'Admin Override' to the subscription enum to match client-side payload
  subscription: z.enum(['Free', 'Premium', 'Admin Override']).optional(),
  subscriptionStatus: z.enum(['free', 'premium', 'admin_override']).optional(), // Matches DB enum
  status: z.enum(['active', 'inactive', 'suspended']).optional(), // Matches DB enum
  streak: z.number().int().min(0, "Streak must be a non-negative number.").optional(),
  achievements: z.array(z.string()).optional(),
  notes: z.string().optional().or(z.literal('')), // Allow empty string
  joinDate: z.string().optional().or(z.literal('')), // YYYY-MM-DD string, allow empty
  lastActive: z.string().optional().or(z.literal('')), // YYYY-MM-DD string, allow empty
  totalTimeSpent: z.string().optional().or(z.literal('')), // Allow empty string
  newPassword: z.string().min(6, "New password must be at least 6 characters long.").optional().or(z.literal('')), // For password update
  completedModules: z.array(z.number().int().min(1, "Module ID must be a positive integer.")).optional(), // Array of module IDs
}).partial(); // All fields are optional for an update operation

// Helper function to safely parse JSON body
async function parseJsonBody(req: Request) {
  try {
    return await req.json();
  } catch (error) {
    console.error('Error parsing JSON body:', error);
    return null; // Return null if parsing fails
  }
}

// GET /api/students/[id] - Fetch a single student
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Parse params.id to an integer immediately
  const studentId = parseInt(params.id, 10);

  if (isNaN(studentId)) { // Check if parsing was successful
    return NextResponse.json({ message: 'Invalid student ID format.' }, { status: 400 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        student_modules: { // Include related student modules to determine completed modules
          select: { module_id: true }
        },
        student_exam_attempts: { // Include exam attempts for detail view
          select: {
            id: true,
            student_id: true, // Ensure student_id is selected for ExamResult mapping
            attempt_number: true,
            score: true,
            total_points: true,
            percentage: true,
            passed: true,
            completed_at: true,
            time_spent: true,
          },
          orderBy: {
            completed_at: 'desc'
          }
        },
        // Include other relations if your frontend detail view needs them
      },
    });

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Transform data from Prisma model to frontend interface format
    const formattedStudent = {
      id: student.id,
      name: student.name,
      email: student.email,
      joinDate: student.enrollment_date.toISOString().split('T')[0], // Format to YYYY-MM-DD
      lastActive: student.last_active.toISOString().split('T')[0],   // Format to YYYY-MM-DD
      progress: student.progress, // Use actual progress from DB
      completedModules: student.student_modules.map(sm => sm.module_id), // Array of module IDs
      currentLevel: student.level, // Map 'level' to 'currentLevel'
      totalTimeSpent: student.total_time_spent || '', // Ensure empty string if null
      streak: student.streak,
      achievements: student.achievements,
      subscription: student.subscription || 'Free', // Ensure default if null
      subscriptionStatus: student.subscription_status || 'free', // Ensure default if null
      status: student.status,
      notes: student.notes || '', // Ensure empty string if null
      phone: student.phone || '', // Ensure empty string if null
      dateOfBirth: student.date_of_birth?.toISOString().split('T')[0] || '', // Format if exists, else empty string
      country: student.country || '', // Ensure empty string if null
      preferredLanguage: student.preferred_language || 'English', // Ensure default if null
      // Do NOT send password_hash to the frontend for security reasons
      examResults: student.student_exam_attempts.map(attempt => ({
        id: attempt.id.toString(), // Convert to string for frontend key if needed
        studentId: attempt.student_id, // This is already Int from DB
        studentName: student.name, // Add student name for convenience
        score: attempt.score,
        totalQuestions: attempt.total_points, // Assuming total_points in DB is totalQuestions
        correctAnswers: Math.round((attempt.percentage / 100) * attempt.total_points), // Calculate correct answers
        timeSpent: attempt.time_spent,
        completedAt: attempt.completed_at.toISOString(),
        passed: attempt.passed,
        attempt: attempt.attempt_number,
      }))
    };

    return NextResponse.json(formattedStudent, { status: 200 });
  } catch (error: any) {
    console.error(`API Error fetching student ${params.id}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { message: 'Failed to fetch student data', details: error.message },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Generally not needed in Next.js API routes
  }
}

// PUT /api/students/[id] - Update a student
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Parse params.id to an integer immediately
  const studentId = parseInt(params.id, 10);

  if (isNaN(studentId)) {
    return NextResponse.json({ message: 'Invalid student ID format.' }, { status: 400 });
  }

  const body = await parseJsonBody(request);

  if (!body) {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    // Validate incoming data using Zod
    const validatedData = StudentUpdateSchema.parse(body);

    // Check for email uniqueness during update, excluding the current student
    if (validatedData.email) {
      const existingStudentWithEmail = await prisma.student.findFirst({
        where: {
          email: validatedData.email,
          NOT: {
            id: studentId,
          },
        },
      });

      if (existingStudentWithEmail) {
        return NextResponse.json({ message: 'A student with this email already exists' }, { status: 409 });
      }
    }

    let passwordHash = undefined;
    if (validatedData.newPassword) {
      // Password validation is handled by Zod schema, but double-check length here too
      if (validatedData.newPassword.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters long' }, { status: 400 });
      }
      passwordHash = await bcrypt.hash(validatedData.newPassword, 10);
    }

    // Prepare data for Prisma update, mapping frontend names to DB names
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone === '' ? null : validatedData.phone,
      date_of_birth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
      country: validatedData.country === '' ? null : validatedData.country,
      preferred_language: validatedData.preferredLanguage,
      level: validatedData.currentLevel,
      subscription: validatedData.subscription,
      subscription_status: validatedData.subscriptionStatus,
      status: validatedData.status,
      streak: validatedData.streak,
      achievements: validatedData.achievements,
      notes: validatedData.notes === '' ? null : validatedData.notes,
      enrollment_date: validatedData.joinDate ? new Date(validatedData.joinDate) : undefined,
      last_active: validatedData.lastActive ? new Date(validatedData.lastActive) : undefined,
      total_time_spent: validatedData.totalTimeSpent === '' ? null : validatedData.totalTimeSpent,
      ...(passwordHash && { password_hash: passwordHash }),
    };

    // Filter out undefined values to ensure only provided fields are updated
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);


    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
    });

    // Handle completedModules update (StudentModule relation)
    // This is a "replace" strategy: delete all existing, then create new ones.
    if (validatedData.completedModules !== undefined) { // Only update if provided in payload
      await prisma.studentModule.deleteMany({
        where: { student_id: studentId },
      });

      if (validatedData.completedModules.length > 0) {
        // Validate modules against the Module table before creating StudentModule entries
        const existingModules = await prisma.module.findMany({
            where: { id: { in: validatedData.completedModules } },
            select: { id: true }
        });
        const validModuleIds = existingModules.map(m => m.id);
        const modulesToCreate = validatedData.completedModules
            .filter((moduleId: number) => validModuleIds.includes(moduleId)) // Only create for valid module IDs
            .map((moduleId: number) => ({
                student_id: updatedStudent.id,
                module_id: moduleId,
                completed_at: new Date() // Set completion date
            }));

        if (modulesToCreate.length > 0) {
            await prisma.studentModule.createMany({
              data: modulesToCreate,
              skipDuplicates: true, // Prevents errors if a module somehow already exists
            });
        }
      }
    }

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error: any) {
    console.error(`API Error updating student ${studentId}:`, { // Changed 'id' to 'studentId' for consistency
      message: error.message,
      code: error.code || 'N/A',
      stack: error.stack,
      body: body, // Log the original body for debugging
      timestamp: new Date().toISOString(),
    });

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    // Handle Prisma unique constraint error (e.g., email)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ message: 'A student with this email already exists' }, { status: 409 });
    }

    return NextResponse.json(
      { message: 'Failed to update student data', details: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/students/[id] - Delete a student
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Parse params.id to an integer immediately
  const studentId = parseInt(params.id, 10);

  if (isNaN(studentId)) {
    return NextResponse.json({ message: 'Invalid student ID format.' }, { status: 400 });
  }

  try {
    // Check if student exists before attempting to delete
    const existingStudent = await prisma.student.findUnique({ where: { id: studentId } });
    if (!existingStudent) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Prisma's onDelete: Cascade in schema will handle related records (StudentModule, etc.)
    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`API Error deleting student ${studentId}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { message: 'Failed to delete student', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
