// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; 

import bcrypt from 'bcryptjs'; // For password hashing
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // 1. Basic Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required.' }, { status: 400 });
    }

    // 2. Validate email format (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    // 3. Validate password strength (e.g., minimum length)
    const passwordMinLength = 6; // Or fetch from SecuritySettings if dynamic
    if (password.length < passwordMinLength) {
      return NextResponse.json({ message: `Password must be at least ${passwordMinLength} characters long.` }, { status: 400 });
    }

    // 4. Check if user with this email already exists
    const existingUser = await prisma.student.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 }); // 409 Conflict
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // 6. Create the new Student record in the database
    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        password_hash: hashedPassword, // Store the hashed password (now required by schema)
        // enrollment_date and last_active are now handled by @default(now()) in schema
        // All other fields with @default will be set automatically by Prisma
      },
      select: { // Select only necessary fields to return (avoid sending password_hash back)
        id: true,
        name: true,
        email: true,
        enrollment_date: true, // Changed to snake_case
        last_active: true,     // Changed to snake_case
        level: true,
        subscription_status: true,
        status: true,
      }
    });

    // Return success response
    return NextResponse.json({ message: 'Account created successfully!', student: newStudent }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Signup API Error:', error); // This will now log the specific Prisma error if one occurs
    // Generic error message for security reasons, log specific error on server
    return NextResponse.json(
      { message: 'An unexpected error occurred during signup. Please try again.' },
      { status: 500 }
    );
  }
}