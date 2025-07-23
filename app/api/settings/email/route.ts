// app/api/settings/email/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const settings = await prisma.emailSettings.findFirst();
    if (!settings) {
      return NextResponse.json({
        id: null,
        smtp_host: "",
        smtp_port: 587,
        smtp_username: "",
        smtp_password: "",
        from_email: "rupakbd2011@gmail.com",
        from_name: "Keele Seiklus",
        enable_welcome_emails: true,
        enable_progress_emails: true,
        enable_certificate_emails: true,
        enable_reminder_emails: false,
        email_frequency: "weekly",
        updated_at: new Date().toISOString(),
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return NextResponse.json({ message: 'Failed to fetch email settings', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    // Define default values for non-nullable fields that don't have @default in schema
    const defaultEmailSettings = {
      smtp_host: "", // Can be null in DB, but provide default for consistency
      smtp_port: 587,
      smtp_username: "", // Can be null in DB
      smtp_password: "", // Can be null in DB
      from_email: "rupakbd2011@gmail.com", // REQUIRED in DB, provide default
      from_name: "Keele Seiklus", // REQUIRED in DB, provide default
      enable_welcome_emails: true,
      enable_progress_emails: true,
      enable_certificate_emails: true,
      enable_reminder_emails: false,
      email_frequency: "weekly",
    };

    const dataToSave: any = {
      // Merge incoming body with defaults, prioritizing body values and mapping camelCase to snake_case
      smtp_host: body.smtp_host ?? defaultEmailSettings.smtp_host,
      smtp_port: body.smtp_port ?? defaultEmailSettings.smtp_port,
      smtp_username: body.smtp_username ?? defaultEmailSettings.smtp_username,
      smtp_password: body.smtp_password ?? defaultEmailSettings.smtp_password,
      from_email: body.from_email ?? defaultEmailSettings.from_email, // FIXED: Ensure default for from_email
      from_name: body.from_name ?? defaultEmailSettings.from_name,     // FIXED: Ensure default for from_name
      enable_welcome_emails: body.enable_welcome_emails ?? defaultEmailSettings.enable_welcome_emails,
      enable_progress_emails: body.enable_progress_emails ?? defaultEmailSettings.enable_progress_emails,
      enable_certificate_emails: body.enable_certificate_emails ?? defaultEmailSettings.enable_certificate_emails,
      enable_reminder_emails: body.enable_reminder_emails ?? defaultEmailSettings.enable_reminder_emails,
      email_frequency: body.email_frequency ?? defaultEmailSettings.email_frequency,
      updated_at: new Date(),
    };

    // Filter out undefined values (if any, though `??` should handle most)
    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

    let updatedSettings;
    if (id) {
      updatedSettings = await prisma.emailSettings.update({
        where: { id: id },
        data: dataToSave,
      });
    } else {
      updatedSettings = await prisma.emailSettings.create({
        data: dataToSave,
      });
    }
    return NextResponse.json({ message: 'Email settings updated successfully!', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating email settings:', error);
    return NextResponse.json({ message: 'Failed to update email settings', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.emailSettings.deleteMany({});
    return NextResponse.json({ message: 'Email settings reset to defaults.' });
  } catch (error) {
    console.error('Error deleting email settings:', error);
    return NextResponse.json({ message: 'Failed to delete email settings', error: (error as Error).message }, { status: 500 });
  }
}
