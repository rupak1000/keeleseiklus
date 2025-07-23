// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();
import bcrypt from 'bcryptjs'; // For password comparison

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
      // User not found
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 }); // 401 Unauthorized
    }

    // 3. Compare the provided password with the hashed password from the database
    // Ensure password_hash is not null before comparing
    if (!user.password_hash) {
      console.error(`User ${user.id} has no password_hash. This should not happen.`);
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Passwords do not match
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 }); // 401 Unauthorized
    }

    // 4. Update last_active timestamp
    await prisma.student.update({
      where: { id: user.id },
      data: {
        last_active: new Date(),
      },
    });

    // 5. Login successful: Return relevant user data (EXCLUDE password_hash)
    const userDataToReturn = {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin, // Crucial for redirect logic
      level: user.level,
      enrollment_date: user.enrollment_date,
      last_active: user.last_active,
      total_time_spent: user.total_time_spent,
      streak: user.streak,
      achievements: user.achievements,
      status: user.status,
      subscription_status: user.subscription_status,
      subscription_date: user.subscription_date,
      // Include any other non-sensitive fields your frontend needs
    };

    return NextResponse.json({ message: 'Login successful!', user: userDataToReturn }, { status: 200 });

  } catch (error) {
    console.error('Login API Error:', error);
    // Generic error message for security reasons
    return NextResponse.json(
      { message: 'An unexpected error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}