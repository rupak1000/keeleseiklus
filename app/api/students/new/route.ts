import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  let body: any = {};

  try {
    // Safely parse JSON once
    try {
      body = await req.json();
    } catch (jsonError: any) {
      console.error('Error parsing JSON body:', {
        message: jsonError.message,
        stack: jsonError.stack,
      });
      return NextResponse.json(
        { message: 'Invalid JSON in request body', details: jsonError.message },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      phone,
      dateOfBirth,
      country,
      preferredLanguage,
      currentLevel,
      subscription,
      subscriptionStatus,
      status,
      streak,
      achievements,
      notes,
      completedModules,
    } = body;

    // --- Server-side Validation ---
    if (!name?.trim()) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

    if (!email?.trim()) return NextResponse.json({ message: 'Email is required' }, { status: 400 });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address' }, { status: 400 });
    }

    if (phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,9}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ message: 'Please enter a valid phone number' }, { status: 400 });
    }

    if (dateOfBirth && isNaN(new Date(dateOfBirth).getTime())) {
      return NextResponse.json({ message: 'Please provide a valid date of birth' }, { status: 400 });
    }

    if (status && !['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    if (subscription && !['Free', 'Premium'].includes(subscription)) {
      return NextResponse.json({ message: 'Invalid subscription value' }, { status: 400 });
    }

    if (subscriptionStatus && !['free', 'premium', 'admin_override'].includes(subscriptionStatus)) {
      return NextResponse.json({ message: 'Invalid subscription status value' }, { status: 400 });
    }

    if (streak && (typeof streak !== 'number' || streak < 0)) {
      return NextResponse.json({ message: 'Streak must be a non-negative number' }, { status: 400 });
    }

    if (achievements && (!Array.isArray(achievements) || achievements.some((a: any) => typeof a !== 'string'))) {
      return NextResponse.json({ message: 'Achievements must be an array of strings' }, { status: 400 });
    }

    if (completedModules && (!Array.isArray(completedModules) || completedModules.some((id: any) => !Number.isInteger(id) || id < 1))) {
      return NextResponse.json({ message: 'Completed modules must be an array of positive integers' }, { status: 400 });
    }

    // Validate module IDs exist
    if (completedModules?.length > 0) {
      const modules = await prisma.module.findMany({
        where: { id: { in: completedModules } },
        select: { id: true },
      });
      const validModuleIds = modules.map((m) => m.id);
      const invalidModuleIds = completedModules.filter((id: number) => !validModuleIds.includes(id));
      if (invalidModuleIds.length > 0) {
        return NextResponse.json(
          { message: `Invalid module IDs: ${invalidModuleIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Email already in use?
    const existingStudent = await prisma.student.findUnique({ where: { email } });
    if (existingStudent) {
      return NextResponse.json({ message: 'A student with this email already exists' }, { status: 409 });
    }

    // Create new student
    const newStudent = await prisma.student.create({
      data: {
        id: randomUUID(),
        name,
        email,
        level: currentLevel || 'A1',
        enrollment_date: new Date(),
        last_active: new Date(),
        total_time_spent: '0h 0m',
        streak: streak || 0,
        achievements: achievements || [],
        status: status || 'active',
        subscription: subscription || 'Free',
        subscription_status: subscriptionStatus || 'free',
        phone: phone || null,
        date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null,
        country: country || null,
        preferred_language: preferredLanguage || 'English',
        notes: notes || null,
        exam_status: 'not_taken',
        exam_score: 0,
        exam_attempts: 0,
      },
    });

    // Associate with completed modules
    if (completedModules?.length > 0) {
      const studentModules = completedModules.map((moduleId: number) => ({
        student_id: newStudent.id,
        module_id: moduleId,
      }));
      await prisma.studentModule.createMany({
        data: studentModules,
        skipDuplicates: true,
      });
    }

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    console.error('API Error creating student:', {
      message: error.message || 'No error message provided',
      code: error.code || 'No error code',
      stack: error.stack || 'No stack trace',
      body, // use already-parsed body
      timestamp: new Date().toISOString(),
    });

    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A student with this email already exists' }, { status: 409 });
    }

    return NextResponse.json(
      {
        message: 'Failed to create student due to an internal server error.',
        details: error.message || 'Unknown error occurred',
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
