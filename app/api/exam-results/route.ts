import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const attempts = await prisma.studentExamAttempt.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam_template: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { completed_at: "desc" },
    })

    const formattedResults = attempts.map((attempt) => ({
      id: attempt.id,
      examId: attempt.exam_template_id,
      examTitle: attempt.exam_template?.title || "Unknown Exam",
      studentId: attempt.student_id,
      studentName: attempt.student?.name || "Unknown Student",
      studentEmail: attempt.student?.email || "unknown@email.com",
      score: attempt.score,
      totalPoints: attempt.total_points,
      percentage: attempt.percentage,
      passed: attempt.passed,
      completedAt: attempt.completed_at.toISOString(),
      timeSpent: attempt.time_spent,
      attemptNumber: attempt.attempt_number,
      answers: attempt.answers,
      sectionScores: attempt.section_scores,
    }))

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error("Error fetching exam results:", error)
    return NextResponse.json(
      { message: "Failed to fetch exam results.", error: (error as Error).message },
      { status: 500 },
    )
  }
}
