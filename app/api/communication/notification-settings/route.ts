// app/api/communication/notification-settings/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
// GET handler to fetch notification settings
export async function GET() {
  try {
    // Find the first (and likely only) notification settings record
    const settings = await prisma.notificationSettings.findFirst();

    if (!settings) {
      // If no settings exist, return default values or create one
      // In a real app, you might want to create a default entry on first access
      return NextResponse.json({
        id: null, // Indicate no existing record
        welcome_email_enabled: true,
        inactivity_reminder_enabled: false,
        achievement_notification_enabled: true,
        notify_on_module_completion: false,
        enable_push_notifications: true,
        enable_email_notifications: true,
        enable_sms_notifications: false,
        notify_on_new_registration: true,
        notify_on_exam_completion: true,
        notify_on_system_errors: true,
        admin_notification_email: "",
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch notification settings.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT handler to update notification settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body; // Extract ID and rest of data

    // Ensure updateData only contains fields from NotificationSettings model
    const validUpdateData: any = {};
    for (const key in updateData) {
      // Basic check for valid fields (you might use Zod for more robust validation)
      if (['welcome_email_enabled', 'inactivity_reminder_enabled', 'achievement_notification_enabled',
           'notify_on_module_completion', 'enable_push_notifications', 'enable_email_notifications',
           'enable_sms_notifications', 'notify_on_new_registration', 'notify_on_exam_completion',
           'notify_on_system_errors', 'admin_notification_email'].includes(key)) {
        validUpdateData[key] = updateData[key];
      }
    }
    validUpdateData.updated_at = new Date(); // Ensure updated_at is set

    let updatedSettings;
    if (id) {
      // If an ID is provided, try to update an existing record
      updatedSettings = await prisma.notificationSettings.update({
        where: { id: id },
        data: validUpdateData,
      });
    } else {
      // If no ID, but data is sent, it might be a first-time save.
      // Try to create the first record.
      updatedSettings = await prisma.notificationSettings.create({
        data: validUpdateData,
      });
    }

    return NextResponse.json({ message: 'Notification settings updated successfully!', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { message: 'Failed to update notification settings.', error: (error as Error).message },
      { status: 500 }
    );
  }
}