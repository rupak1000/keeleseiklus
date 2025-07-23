// app/api/certificates/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
// GET handler to fetch all generated certificates
export async function GET() {
  try {
    const certificates = await prisma.certificate.findMany({
      select: {
        id: true,
        student_id: true,
        exam_template_id: true,
        score: true,
        completed_modules: true,
        completed_at: true,
        generated_at: true,
        certificate_number: true,
        student: { // Include student to get name and email
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { generated_at: 'desc' },
    });

    const formattedCertificates = certificates.map(cert => ({
      id: cert.id,
      studentId: cert.student_id,
      studentName: cert.student?.name || 'N/A',
      studentEmail: cert.student?.email || 'N/A',
      score: cert.score,
      completedModules: cert.completed_modules,
      completedAt: cert.completed_at.toISOString(),
      generatedAt: cert.generated_at.toISOString(),
      examId: cert.exam_template_id || undefined,
      certificateNumber: cert.certificate_number || undefined,
    }));

    return NextResponse.json(formattedCertificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { message: 'Failed to fetch certificates.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST handler to create a new certificate
export async function POST(request: Request) {
  try {
    const { studentId, examId, score, completedModules, completedAt, generatedAt, certificateNumber } = await request.json();

    if (!studentId || !score || !completedModules || !completedAt || !generatedAt || !certificateNumber) {
      return NextResponse.json({ message: 'Missing required certificate data.' }, { status: 400 });
    }

    const newCertificate = await prisma.certificate.create({
      data: {
        student_id: studentId,
        exam_template_id: examId || null, // Optional
        score: score,
        completed_modules: completedModules,
        completed_at: new Date(completedAt),
        generated_at: new Date(generatedAt),
        certificate_number: certificateNumber,
      },
    });

    return NextResponse.json({ message: 'Certificate generated successfully!', certificate: newCertificate }, { status: 201 });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { message: 'Failed to generate certificate.', error: (error as Error).message },
      { status: 500 }
    );
  }
}