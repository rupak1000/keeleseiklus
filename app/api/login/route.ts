// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Basic Validation
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // 2. Find the user by email
    const user = await prisma.student.findUnique({
      where: { email: email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    // 3. Compare the provided password with the hashed password
    if (!user.password_hash) {
      console.error(`User ${user.id} has no password_hash.`);
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    // 4. Update last_active timestamp
    await prisma.student.update({
      where: { id: user.id },
      data: {
        last_active: new Date(),
      },
    });

    // 5. Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // 6. Set JWT in a secure HTTP-only cookie
    const response = NextResponse.json(
      {
        message: 'Login successful!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: user.is_admin,
          level: user.level,
          enrollment_date: user.enrollment_date,
          last_active: user.last_active,
          total_time_spent: user.total_time_spent,
          streak: user.streak,
          achievements: user.achievements,
          status: user.status,
          subscription_status: user.subscription_status,
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred during login. Please try again.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}