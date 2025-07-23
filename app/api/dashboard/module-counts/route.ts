// app/api/dashboard/module-counts/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();
export async function GET() {
  try {
    // Assuming 'premium' status is determined by module.id > 3 as per your frontend logic
    // For a real app, you'd likely have a 'is_premium: Boolean' field on the Module model
    const totalModules = await prisma.module.count();
    const freeModules = await prisma.module.count({
      where: {
        id: { lte: 3 } // Example: Modules with ID <= 3 are free
        // Or if you add a field: is_premium: false
      }
    });
    const premiumModules = totalModules - freeModules;

    return NextResponse.json({
      freeModules,
      premiumModules,
    });
  } catch (error) {
    console.error('Error fetching module counts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch module counts', error: (error as Error).message },
      { status: 500 }
    );
  }
}