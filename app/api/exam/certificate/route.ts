import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { studentId, examId, studentName, studentEmail, score, completedModules, completedAt, certificateNumber } =
      await request.json()

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        student_id: studentId,
        exam_id: examId,
        student_name: studentName,
        student_email: studentEmail,
        score: score,
        completed_modules: completedModules,
        completed_at: new Date(completedAt),
        generated_at: new Date(),
        certificate_number: certificateNumber,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      id: certificate.id,
      message: "Certificate generated successfully!",
      certificateNumber: certificate.certificate_number,
    })
  } catch (error) {
    console.error("Error generating certificate:", error)
    return NextResponse.json(
      { message: "Failed to generate certificate.", error: (error as Error).message },
      { status: 500 },
    )
  }
}
