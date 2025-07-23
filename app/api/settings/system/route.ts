// app/api/settings/system/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      return NextResponse.json({
        id: null,
        backup_frequency: "daily",
        retention_period: 30,
        enable_analytics: true,
        enable_error_reporting: true,
        debug_mode: false,
        cache_enabled: true,
        compression_enabled: true,
        max_file_upload_size: 10,
        subscription_enabled: true,
        free_module_limit: 10,
        premium_required: true,
        updated_at: new Date().toISOString(),
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json({ message: 'Failed to fetch system settings', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const dataToSave: any = {
      backup_frequency: body.backupFrequency,
      retention_period: body.retentionPeriod,
      enable_analytics: body.enableAnalytics,
      enable_error_reporting: body.enableErrorReporting,
      debug_mode: body.debugMode,
      cache_enabled: body.cacheEnabled,
      compression_enabled: body.compressionEnabled,
      max_file_upload_size: body.maxFileUploadSize,
      subscription_enabled: body.subscriptionEnabled, // Map frontend name
      free_module_limit: body.freeModuleLimit, // Map frontend name
      premium_required: body.premiumRequired, // Map frontend name
      updated_at: new Date(),
    };

    let updatedSettings;
    if (id) {
      updatedSettings = await prisma.systemSettings.update({
        where: { id: id },
        data: dataToSave,
      });
    } else {
      updatedSettings = await prisma.systemSettings.create({
        data: dataToSave,
      });
    }
    return NextResponse.json({ message: 'System settings updated successfully!', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ message: 'Failed to update system settings', error: (error as Error).message }, { status: 500 });
  }
}