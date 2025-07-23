// app/api/student-modules/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('studentId'); // This is a string

    if (!studentIdParam) {
      return NextResponse.json({ message: 'Student ID is required' }, { status: 400 });
    }

    // FIXED: Parse the studentId string to an integer
    const studentId = parseInt(studentIdParam, 10);

    if (isNaN(studentId)) { // Add a check for successful parsing
      return NextResponse.json({ message: 'Invalid Student ID format.' }, { status: 400 });
    }

    const studentModules = await prisma.studentModule.findMany({
      where: { student_id: studentId }, // FIXED: Use the parsed integer studentId
      select: { module_id: true },
    });
    return NextResponse.json(studentModules, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching student modules:', error);
    return NextResponse.json(
      { message: 'Failed to fetch student modules', details: error.message },
      { status: 500 },
    );
  } finally {
    // In Next.js API routes, you typically don't need to manually disconnect Prisma,
    // as it's managed by the Next.js lifecycle. Removing this is generally fine.
    // await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    // FIXED: Parse studentId to Int here as well if it's coming from frontend as string
    const { studentId: studentIdParam, moduleIds } = await req.json();
    const studentId = parseInt(studentIdParam, 10); // Parse to Int

    if (isNaN(studentId) || !Array.isArray(moduleIds) || moduleIds.some((id: any) => !Number.isInteger(id) || id < 1)) {
      return NextResponse.json(
        { message: 'Valid studentId (integer) and moduleIds (array of positive integers) are required' },
        { status: 400 },
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }, // Use the parsed integer studentId
    });
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Verify modules exist
    const modules = await prisma.module.findMany({
      where: { id: { in: moduleIds } },
      select: { id: true },
    });
    const validModuleIds = modules.map((m) => m.id);
    const invalidModuleIds = moduleIds.filter((id: number) => !validModuleIds.includes(id));
    if (invalidModuleIds.length > 0) {
      return NextResponse.json(
        { message: `Invalid module IDs: ${invalidModuleIds.join(', ')}` },
        { status: 400 },
      );
    }

    // Create student module records
    const data = moduleIds.map((moduleId: number) => ({
      student_id: studentId, // Use the parsed integer studentId
      module_id: moduleId,
    }));
    await prisma.studentModule.createMany({
      data,
      skipDuplicates: true,
    });

    return NextResponse.json({ message: 'Student modules created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student modules:', {
      message: error.message,
      stack: error.stack,
      // Removed `body: await req.json()` from catch, as it tries to re-parse consumed stream
    });
    return NextResponse.json(
      { message: 'Failed to create student modules', details: error.message },
      { status: 500 },
    );
  } finally {
    // await prisma.$disconnect(); // Generally not needed in Next.js API routes
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('studentId'); // This is a string

    if (!studentIdParam) {
      return NextResponse.json({ message: 'Student ID is required' }, { status: 400 });
    }

    // FIXED: Parse the studentId string to an integer
    const studentId = parseInt(studentIdParam, 10);

    if (isNaN(studentId)) { // Add a check for successful parsing
      return NextResponse.json({ message: 'Invalid Student ID format.' }, { status: 400 });
    }

    await prisma.studentModule.deleteMany({
      where: { student_id: studentId }, // FIXED: Use the parsed integer studentId
    });
    return NextResponse.json({ message: 'Student modules deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting student modules:', error);
    return NextResponse.json(
      { message: 'Failed to delete student modules', details: error.message },
      { status: 500 },
    );
  } finally {
    // await prisma.$disconnect(); // Generally not needed in Next.js API routes
  }
}