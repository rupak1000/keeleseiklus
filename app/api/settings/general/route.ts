// app/api/settings/general/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const settings = await prisma.generalSettings.findFirst();
    if (!settings) {
      // Ensure all non-nullable fields have a default value when no record exists
      return NextResponse.json({
        id: null, // Indicate no DB ID yet
        app_name: "Keele Seiklus", // Default
        app_description: "Interactive Language Learning Platform", // Default
        support_email: "support@keeleseiklus.com", // Default
        default_language: "en", // Default
        timezone: "Europe/Tallinn", // Default
        maintenance_mode: false,
        registration_enabled: true,
        guest_access_enabled: true,
        max_students_per_class: 30,
        session_timeout: 60,
        updated_at: new Date().toISOString(),
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching general settings:', error);
    return NextResponse.json({ message: 'Failed to fetch general settings', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    // Define default values for non-nullable fields that don't have @default in schema
    const defaultGeneralSettings = {
      app_name: "Keele Seiklus",
      app_description: "Interactive Language Learning Platform",
      support_email: "support@keeleseiklus.com",
      default_language: "en",
      timezone: "Europe/Tallinn",
      maintenance_mode: false,
      registration_enabled: true,
      guest_access_enabled: true,
      max_students_per_class: 30,
      session_timeout: 60,
    };

    const dataToSave: any = {
      // Merge incoming body with defaults, prioritizing body values
      ...defaultGeneralSettings, // Start with all defaults
      app_name: body.app_name ?? defaultGeneralSettings.app_name, // Use ?? to handle null/undefined from frontend
      app_description: body.app_description ?? defaultGeneralSettings.app_description,
      support_email: body.support_email ?? defaultGeneralSettings.support_email,
      default_language: body.default_language ?? defaultGeneralSettings.default_language,
      timezone: body.timezone ?? defaultGeneralSettings.timezone,
      maintenance_mode: body.maintenance_mode,
      registration_enabled: body.registration_enabled,
      guest_access_enabled: body.guest_access_enabled,
      max_students_per_class: body.max_students_per_class,
      session_timeout: body.session_timeout,
      updated_at: new Date(),
    };

    // Filter out undefined values (if any, though `??` should handle most)
    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

    let updatedSettings;
    if (id) {
      updatedSettings = await prisma.generalSettings.update({
        where: { id: id },
        data: dataToSave,
      });
    } else {
      // When creating, ensure all required fields are present
      updatedSettings = await prisma.generalSettings.create({
        data: dataToSave, // dataToSave now contains all required fields
      });
    }
    return NextResponse.json({ message: 'General settings updated successfully!', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating general settings:', error);
    return NextResponse.json({ message: 'Failed to update general settings', error: (error as Error).message }, { status: 500 });
  }
}