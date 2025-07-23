import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.certificateSettings.findFirst();
    if (!settings) {
      return NextResponse.json({
        id: undefined, // Use undefined instead of null to match CertificateSettings interface
        title: "Certificate of Achievement",
        subtitle: "Estonian Language Proficiency",
        description: "This is to certify that {studentName} has successfully completed the Eesti Seiklus Estonian language course and demonstrated proficiency at the {cefrLevel} level of the Common European Framework of Reference for Languages (CEFR).",
        cefr_level: "A1-A2",
        institution_name: "Eesti Seiklus Language Academy",
        institution_subtitle: "Estonian Adventure Learning Platform",
        signatory_name: "Dr. Estonian Teacher",
        signatory_title: "Director of Estonian Studies",
        auto_generate: true,
        email_delivery: false,
        template: "default",
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching certificate settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch certificate settings.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataToSave = {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      cefr_level: body.cefr_level,
      institution_name: body.institution_name,
      institution_subtitle: body.institution_subtitle,
      signatory_name: body.signatory_name,
      signatory_title: body.signatory_title,
      auto_generate: body.auto_generate,
      email_delivery: body.email_delivery,
      template: body.template,
    };

    // Remove undefined fields to prevent Prisma errors
    Object.keys(dataToSave).forEach((key) => dataToSave[key] === undefined && delete dataToSave[key]);

    const newSettings = await prisma.certificateSettings.create({
      data: dataToSave,
    });

    return NextResponse.json(
      { message: 'Certificate settings created successfully!', settings: newSettings },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating certificate settings:', error);
    return NextResponse.json(
      { message: 'Failed to create certificate settings.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { message: 'ID is required for updating certificate settings.' },
        { status: 400 }
      );
    }

    const dataToSave = {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      cefr_level: body.cefr_level,
      institution_name: body.institution_name,
      institution_subtitle: body.institution_subtitle,
      signatory_name: body.signatory_name,
      signatory_title: body.signatory_title,
      auto_generate: body.auto_generate,
      email_delivery: body.email_delivery,
      template: body.template,
    };

    // Remove undefined fields
    Object.keys(dataToSave).forEach((key) => dataToSave[key] === undefined && delete dataToSave[key]);

    const updatedSettings = await prisma.certificateSettings.update({
      where: { id },
      data: dataToSave,
    });

    return NextResponse.json(
      { message: 'Certificate settings updated successfully!', settings: updatedSettings }
    );
  } catch (error) {
    console.error('Error updating certificate settings:', error);
    return NextResponse.json(
      { message: 'Failed to update certificate settings.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    { message: 'Method Not Allowed' },
    { status: 405, headers: { Allow: 'GET, POST, PUT' } }
  );
}