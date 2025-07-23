import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import { getCurrentUser } from "@/src/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.log("No authenticated user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = typeof user.id === "string" ? Number.parseInt(user.id) : user.id
    if (isNaN(userId)) {
      console.error("Invalid user ID:", user.id)
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { examId, score, totalPoints, percentage, passed, timeSpent, answers, sectionScores } = await request.json()

    console.log("Creating exam attempt:", {
      userId,
      examId,
      score,
      totalPoints,
      percentage,
      passed,
      timeSpent,
    })

    // Create the exam attempt using the correct model name
    const attempt = await prisma.studentExamAttempt.create({
      data: {
        student_id: userId,
        exam_template_id: examId,
        attempt_number:
          (await prisma.studentExamAttempt.count({
            where: { student_id: userId, exam_template_id: examId },
          })) + 1,
        score,
        total_points: totalPoints,
        percentage,
        passed,
        completed_at: new Date(),
        time_spent: timeSpent,
        answers: answers || {},
        section_scores: sectionScores || {},
        certificate_issued: passed,
      },
    })

    console.log("Exam attempt created:", attempt.id)

    // If passed, create certificate
    if (passed) {
      try {
        const student = await prisma.student.findUnique({ where: { id: userId } })

        // Check if certificate already exists for this student and exam
        const existingCertificate = await prisma.certificate.findFirst({
          where: {
            student_id: userId,
            exam_template_id: examId,
          },
        })

        if (!existingCertificate) {
          // Generate a unique certificate number
          const certificateNumber = `EST-${Date.now()}-${userId}`

          const certificate = await prisma.certificate.create({
            data: {
              student_id: userId,
              exam_template_id: examId,
              student_name: student?.name || "Student",
              student_email: student?.email || "student@example.com",
              score: percentage,
              completed_modules: await prisma.studentModule.count({
                where: { student_id: userId, status: "completed" },
              }),
              completed_at: new Date(),
              generated_at: new Date(),
              certificate_number: certificateNumber,
            },
          })

          console.log("Certificate created:", certificate.id)
        } else {
          console.log("Certificate already exists for this student and exam")
        }
      } catch (certError: any) {
        console.error("Error creating certificate:", certError)
        // Don't fail the entire request if certificate creation fails
        // The exam attempt was still successful
      }
    }

    return NextResponse.json(attempt)
  } catch (error: any) {
    console.error("Error saving exam attempt:", {
      message: error.message,
      stack: error.stack,
      databaseUrl: process.env.DATABASE_URL?.replace(/:\/\//g, "://<redacted>@"),
    })

    return NextResponse.json(
      {
        error: "Failed to save exam attempt",
        details: error.message.includes("connect") ? "Database connection failed" : error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = typeof user.id === "string" ? Number.parseInt(user.id) : user.id
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const attempts = await prisma.studentExamAttempt.findMany({
      where: { student_id: userId },
      include: {
        exam_template: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { completed_at: "desc" },
    })

    return NextResponse.json(attempts)
  } catch (error: any) {
    console.error("Error fetching exam attempts:", error)
    return NextResponse.json({ error: "Failed to fetch exam attempts", details: error.message }, { status: 500 })
  }
}
