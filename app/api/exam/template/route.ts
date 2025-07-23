import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get the first published and active exam template
    const template = await prisma.examTemplate.findFirst({
      where: {
        is_published: true,
        is_active: true,
      },
      include: {
        exam_sections: {
          include: {
            exam_questions: {
              orderBy: { id: "asc" },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    })

    if (!template) {
      return NextResponse.json({ message: "No active exam template found." }, { status: 404 })
    }

    // Format for frontend consumption
    const formattedTemplate = {
      id: template.id,
      title: template.title,
      description: template.description || "",
      instructions: template.instructions || "",
      totalPoints: template.total_points,
      passingScore: template.passing_score,
      timeLimit: template.time_limit,
      sections: template.exam_sections.map((section) => ({
        id: section.id.toString(),
        title: section.title,
        description: section.description || "",
        max_points: section.max_points,
        questions: section.exam_questions.map((question) => ({
          id: question.id,
          type: question.type,
          question: question.question,
          question_ru: question.question_ru || undefined,
          options: question.options
            ? Array.isArray(question.options)
              ? question.options
              : JSON.parse(question.options as string)
            : undefined,
          correctAnswer: question.correct_answer
            ? (() => {
                try {
                  return JSON.parse(question.correct_answer as string)
                } catch (e) {
                  console.warn("Failed to parse correct_answer:", question.correct_answer)
                  return question.correct_answer
                }
              })()
            : null,
          points: question.points,
          hint: question.hint || undefined,
          explanation: question.explanation || undefined,
          difficulty: question.difficulty,
          audioUrl: question.audioUrl || undefined,
        })),
      })),
    }

    return NextResponse.json(formattedTemplate)
  } catch (error) {
    console.error("Error fetching exam template:", error)
    return NextResponse.json(
      { message: "Failed to fetch exam template.", error: (error as Error).message },
      { status: 500 },
    )
  }
}
