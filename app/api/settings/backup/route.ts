// app/api/settings/backup/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
// GET handler to fetch the last backup date
export async function GET() {
  try {
    const lastBackup = await prisma.backup.findFirst({
      orderBy: {
        backup_date: 'desc', // Get the most recent backup
      },
      select: {
        backup_date: true,
      }
    });
    return NextResponse.json(lastBackup ? lastBackup.backup_date.toISOString() : null);
  } catch (error) {
    console.error('Error fetching last backup date:', error);
    return NextResponse.json({ message: 'Failed to fetch last backup date', error: (error as Error).message }, { status: 500 });
  }
}

// POST handler to record a new backup event (frontend triggers download)
export async function POST(request: Request) {
  try {
    const { fileName, fileSize } = await request.json(); // Frontend sends these details

    if (!fileName || !fileSize) {
      return NextResponse.json({ message: 'File name and size are required for backup record.' }, { status: 400 });
    }

    const newBackupRecord = await prisma.backup.create({
      data: {
        backup_date: new Date(),
        file_name: fileName,
        file_size: fileSize,
        created_at: new Date(),
      },
    });
    return NextResponse.json({ message: 'Backup record created successfully!', backup: newBackupRecord });
  } catch (error) {
    console.error('Error creating backup record:', error);
    return NextResponse.json({ message: 'Failed to create backup record', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE handler to clear all backup records (optional, for 'reset to defaults')
export async function DELETE() {
  try {
    await prisma.backup.deleteMany();
    return NextResponse.json({ message: 'All backup records cleared successfully!' });
  } catch (error) {
    console.error('Error clearing backup records:', error);
    return NextResponse.json({ message: 'Failed to clear backup records', error: (error as Error).message }, { status: 500 });
  }
}