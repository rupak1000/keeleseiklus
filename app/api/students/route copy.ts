// app/api/students/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const StudentSchema = z.object({
  id: z.string().max(255),
  name: z.string().max(255),
  email: z.string().email().max(255),
  password_hash: z.string().max(255).optional(),
  is_admin: z.boolean().default(false),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1'),
  enrollment_date: z.string(),
  last_active: z.string(),
  total_time_spent: z.string().default('0h 0m'),
  streak: z.number().int().default(0),
  achievements: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  exam_status: z.enum(['not_taken', 'passed', 'failed']).default('not_taken').optional(),
  exam_score: z.number().int().min(0).max(100).default(0).optional(),
  exam_attempts: z.number().int().min(0).default(0).optional(),
  subscription: z.enum(['Free', 'Premium']).default('Free').optional(),
  subscription_status: z.enum(['free', 'premium', 'admin_override']).default('free').optional(),
  subscription_date: z.string().optional(),
  phone: z.string().max(50).optional(),
  date_of_birth: z.string().optional(),
  country: z.string().max(100).optional(),
  preferred_language: z.string().max(50).default('English').optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    console.log('Fetching students from database...');
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        is_admin: true,
        level: true,
        enrollment_date: true,
        last_active: true,
        total_time_spent: true,
        streak: true,
        achievements: true,
        status: true,
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
      },
    });
    console.log('Students fetched:', students);
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = StudentSchema.parse(await request.json());
    console.log('Creating student with data:', data);
    const student = await prisma.student.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        password_hash: data.password_hash,
        is_admin: data.is_admin,
        level: data.level,
        enrollment_date: new Date(data.enrollment_date),
        last_active: new Date(data.last_active),
        total_time_spent: data.total_time_spent,
        streak: data.streak,
        achievements: data.achievements,
        status: data.status,
        exam_status: data.exam_status,
        exam_score: data.exam_score,
        exam_attempts: data.exam_attempts,
        subscription: data.subscription,
        subscription_status: data.subscription_status,
        subscription_date: data.subscription_date ? new Date(data.subscription_date) : undefined,
        phone: data.phone,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        country: data.country,
        preferred_language: data.preferred_language,
        notes: data.notes,
      },
    });
    console.log('Student created:', student);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}