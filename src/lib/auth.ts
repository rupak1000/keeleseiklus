// src/lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/lib/generated/prisma';

// Ensure this is a singleton instance as recommended by Prisma for Next.js
const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  isAdmin?: boolean;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    console.log('Fetching auth_token cookie');
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.log('No auth_token cookie found');
      return null;
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      throw new Error('Server configuration error: JWT_SECRET missing.');
    }

    console.log('Verifying JWT');
    // Ensure the decoded payload matches AuthUser structure or refine type
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string, name?: string, email?: string, isAdmin?: boolean };

    // Log the ID being used to fetch the student
    console.log(`Attempting to fetch student for decoded ID: ${decoded.id}, type: ${typeof decoded.id}`);

    // Parse decoded.id to integer for Prisma, as your schema likely expects an integer ID
    const userIdNum = parseInt(decoded.id);
    if (isNaN(userIdNum)) {
      console.error(`Decoded ID "${decoded.id}" is not a valid number.`);
      return null;
    }

    const user = await prisma.student.findUnique({
      where: { id: userIdNum },
      select: { id: true, name: true, email: true, is_admin: true },
    });

    if (!user) {
      console.log(`Student not found for user ID: ${userIdNum}`);
      return null;
    }

    // Return the user data, ensuring `id` is a string as per AuthUser interface
    return {
      id: user.id.toString(), // Convert back to string if your AuthUser interface expects string
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin,
    };
  } catch (error: any) {
    console.error('Error in getCurrentUser:', {
      message: error.message,
      // Only include stack in development, or if explicitly needed for production debugging
      // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      stack: error.stack // Keep for thorough debugging for now
    });
    // Log specifics if error is from JWT
    if (error instanceof jwt.JsonWebTokenError) {
        console.error('JWT Error:', error.name, error.message);
    }
    return null;
  }
  // REMOVE THE FINALLY BLOCK WITH prisma.$disconnect();
  // The Prisma client should remain connected for subsequent operations in the same request.
  // This is crucial for serverless environments where a new instance might not spin up per request.
}