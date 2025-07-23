// app/api/settings/notifications/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const settings = await prisma.notificationSettings.findFirst();
    if (!settings) {
      return NextResponse.json({
        id: null,
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
        admin_notification_email: "admin@keeleseiklus.com",
        updated_at: new Date().toISOString(),
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ message: 'Failed to fetch notification settings', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    // Define default values for non-nullable fields that don't have @default in schema
    // These are the DB field names (snake_case)
    const defaultNotificationSettings = {
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
      admin_notification_email: "admin@keeleseiklus.com",
    };

    const dataToSave: any = {
      // FIXED: Explicitly map frontend camelCase to backend snake_case
      // Use `??` for nullable fields, but direct assignment for non-nullable boolean switches
      welcome_email_enabled: body.welcome_email_enabled ?? defaultNotificationSettings.welcome_email_enabled,
      inactivity_reminder_enabled: body.inactivity_reminder_enabled ?? defaultNotificationSettings.inactivity_reminder_enabled,
      achievement_notification_enabled: body.achievement_notification_enabled ?? defaultNotificationSettings.achievement_notification_enabled,
      notify_on_module_completion: body.notify_on_module_completion ?? defaultNotificationSettings.notify_on_module_completion,
      
      // These are boolean switches, they will always be true/false from frontend, not undefined
      enable_push_notifications: body.enablePushNotifications, // Frontend sends camelCase
      enable_email_notifications: body.enableEmailNotifications, // Frontend sends camelCase
      enable_sms_notifications: body.enableSMSNotifications, // Frontend sends camelCase
      notify_on_new_registration: body.notifyOnNewRegistration, // Frontend sends camelCase
      notify_on_exam_completion: body.notifyOnExamCompletion, // Frontend sends camelCase
      notify_on_system_errors: body.notifyOnSystemErrors, // Frontend sends camelCase
      
      admin_notification_email: body.adminNotificationEmail ?? defaultNotificationSettings.admin_notification_email, // Frontend sends camelCase
      updated_at: new Date(),
    };

    // Filter out undefined values (if any, though direct assignment should prevent most)
    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

    let updatedSettings;
    if (id) {
      updatedSettings = await prisma.notificationSettings.update({
        where: { id: id },
        data: dataToSave,
      });
    } else {
      updatedSettings = await prisma.notificationSettings.create({
        data: dataToSave,
      });
    }
    return NextResponse.json({ message: 'Notification settings updated successfully!', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ message: 'Failed to update notification settings', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.notificationSettings.deleteMany({});
    return NextResponse.json({ message: 'Notification settings reset to defaults.' });
  } catch (error) {
    console.error('Error deleting notification settings:', error);
    return NextResponse.json({ message: 'Failed to delete notification settings', error: (error as Error).message }, { status: 500 });
  }
}