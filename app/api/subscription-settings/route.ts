// app/api/subscription-settings/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst({
      select: {
        id: true,
        subscription_enabled: true,
        free_module_limit: true,
        premium_required: true,
      }
    });

    if (!settings) {
      // Return default values if no settings record exists
      return NextResponse.json({
        id: null,
        enabled: true,
        freeModuleLimit: 10,
        premiumRequired: true,
      });
    }

    // Map snake_case from DB to camelCase for frontend
    return NextResponse.json({
      id: settings.id,
      enabled: settings.subscription_enabled,
      freeModuleLimit: settings.free_module_limit,
      premiumRequired: settings.premium_required,
    });
  } catch (error) {
    console.error('Error fetching subscription settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch subscription settings.', error: (error as Error).message },
      { status: 500 }
    );
  }
}
