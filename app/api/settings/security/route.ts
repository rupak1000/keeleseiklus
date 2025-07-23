// app/api/settings/security/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const settings = await prisma.securitySettings.findFirst();
    if (!settings) {
      return NextResponse.json({
        id: null,
        password_min_length: 8,
        require_special_chars: true,
        require_numbers: true,
        require_uppercase: true,
        enable_two_factor: false,
        session_security: "standard",
        ip_whitelist: [], // Stored as String[]
        max_login_attempts: 5,
        lockout_duration: 15,
        enable_audit_log: true,
        updated_at: new Date().toISOString(),
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json({ message: 'Failed to fetch security settings', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    const defaultSecuritySettings = {
      password_min_length: 8, require_special_chars: true, require_numbers: true,
      require_uppercase: true, enable_two_factor: false, session_security: "standard",
      ip_whitelist: [], // Default is an empty array
      max_login_attempts: 5, lockout_duration: 15, enable_audit_log: true,
    };

    const dataToSave: any = {
      password_min_length: body.password_min_length ?? defaultSecuritySettings.password_min_length,
      require_special_chars: body.require_special_chars ?? defaultSecuritySettings.require_special_chars,
      require_numbers: body.require_numbers ?? defaultSecuritySettings.require_numbers,
      require_uppercase: body.require_uppercase ?? defaultSecuritySettings.require_uppercase,
      enable_two_factor: body.enable_two_factor,
      session_security: body.session_security ?? defaultSecuritySettings.session_security,
      // FIXED: Ensure ip_whitelist is always an array.
      // If body.ip_whitelist is not an array, it defaults to an empty array.
      ip_whitelist: Array.isArray(body.ip_whitelist) ? body.ip_whitelist : defaultSecuritySettings.ip_whitelist,
      max_login_attempts: body.max_login_attempts ?? defaultSecuritySettings.max_login_attempts,
      lockout_duration: body.lockout_duration ?? defaultSecuritySettings.lockout_duration,
      enable_audit_log: body.enable_audit_log,
      updated_at: new Date(),
    };

    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

    let updatedSettings;
    if (id) {
      updatedSettings = await prisma.securitySettings.update({
        where: { id: id },
        data: dataToSave,
      });
    } else {
      updatedSettings = await prisma.securitySettings.create({
        data: dataToSave,
      });
    }
    return NextResponse.json({ message: 'Security settings updated successfully!', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json({ message: 'Failed to update security settings', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.securitySettings.deleteMany({});
    return NextResponse.json({ message: 'Security settings reset to defaults.' });
  } catch (error) {
    console.error('Error deleting security settings:', error);
    return NextResponse.json({ message: 'Failed to delete security settings', error: (error as Error).message }, { status: 500 });
  }
}
