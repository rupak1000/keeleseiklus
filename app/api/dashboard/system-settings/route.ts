// app/api/dashboard/system-settings/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; // <-- Assuming your lib/prisma.ts exports the INSTANCE
const prisma = new PrismaClient();
export async function GET() {
  try {
    const systemSettings = await prisma.systemSettings.findFirst();
    const certificateSettings = await prisma.certificateSettings.findFirst();
    const backupSettings = await prisma.backup.findFirst({
        orderBy: { created_at: 'desc' } // Get the most recent backup
    });

    const freeModuleLimit = systemSettings?.free_module_limit ?? 0;
    const examSettingsStatus = certificateSettings ? "Configured" : "Not Configured";
    const backupStatus = backupSettings ? "Active" : "Inactive"; // More detailed check might be needed

    return NextResponse.json({
      freeModuleLimit,
      examSettingsStatus,
      backupStatus,
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch system settings', error: (error as Error).message },
      { status: 500 }
    );
  }
}