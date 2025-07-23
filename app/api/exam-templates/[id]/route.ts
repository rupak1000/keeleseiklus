import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

/**
 * GET handler to fetch a specific exam template by ID.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const templateId = Number.parseInt(params.id)

    if (isNaN(templateId)) {
      return NextResponse.json({ message: "Invalid template ID." }, { status: 400 })
    }

    const template = await prisma.examTemplate.findUnique({
      where: { id: templateId },
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
      return NextResponse.json({ message: "Exam template not found." }, { status: 404 })
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
      isPublished: template.is_published,
      isActive: template.is_active,
      createdAt: template.created_at.toISOString(),
      updatedAt: template.updated_at.toISOString(),
      settings: template.settings as any,
      sections: template.exam_sections.map((section) => ({
        id: section.id,
        exam_template_id: section.exam_template_id,
        title: section.title,
        description: section.description || "",
        instructions: section.instructions || "",
        timeLimit: section.time_limit || undefined,
        maxPoints: section.max_points,
        randomizeQuestions: section.randomize_questions,
        passingScore: section.passing_score || undefined,
        questions: section.exam_questions.map((question) => ({
          id: question.id,
          type: question.type as any,
          question: question.question,
          question_ru: question.question_ru || undefined,
          options: question.options
            ? Array.isArray(question.options)
              ? question.options
              : JSON.parse(question.options as string)
            : undefined,
          correct_answer: question.correct_answer
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
          module_id: question.module_id || undefined,
          difficulty: question.difficulty as any,
          tags: question.tags ? (Array.isArray(question.tags) ? question.tags : []) : [],
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

/**
 * PUT handler to update an exam template.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const templateId = Number.parseInt(params.id)

    if (isNaN(templateId)) {
      return NextResponse.json({ message: "Invalid template ID." }, { status: 400 })
    }

    const updateData = await request.json()
    const { title, description, instructions, timeLimit, sections, settings, isActive, isPublished } = updateData

    const updatedTemplate = await prisma.$transaction(async (tx) => {
      // Update the exam template
      const template = await tx.examTemplate.update({
        where: { id: templateId },
        data: {
          title: title || undefined,
          description: description || null,
          instructions: instructions || null,
          total_points: sections
            ? sections.reduce((sum: number, section: any) => sum + (section.maxPoints || 0), 0)
            : undefined,
          time_limit: timeLimit || undefined,
          passing_score: settings?.passingScore || undefined,
          settings: settings || undefined,
          is_active: isActive !== undefined ? isActive : undefined,
          is_published: isPublished !== undefined ? isPublished : undefined,
          updated_at: new Date(),
        },
      })

      // If sections are provided, update them
      if (sections) {
        // Delete existing sections and their questions
        await tx.examQuestion.deleteMany({
          where: {
            section_id: {
              in: await tx.examSection
                .findMany({
                  where: { exam_template_id: templateId },
                  select: { id: true },
                })
                .then((sections) => sections.map((s) => s.id)),
            },
          },
        })

        await tx.examSection.deleteMany({
          where: { exam_template_id: templateId },
        })

        // Create new sections and questions
        for (const sectionData of sections) {
          const createdSection = await tx.examSection.create({
            data: {
              exam_template_id: templateId,
              title: sectionData.title,
              description: sectionData.description || null,
              instructions: sectionData.instructions || null,
              time_limit: sectionData.timeLimit || null,
              max_points: sectionData.maxPoints || 0,
              randomize_questions: sectionData.randomizeQuestions ?? false,
              passing_score: sectionData.passingScore || null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          })

          // Create questions for this section
          if (sectionData.questions && sectionData.questions.length > 0) {
            for (const questionData of sectionData.questions) {
              // Ensure correct_answer is always provided and properly formatted
              let correctAnswer = questionData.correct_answer || questionData.correctAnswer

              // Handle different question types
              if (questionData.type === "multiple-choice") {
                // For multiple choice, ensure it's a number (index)
                correctAnswer = typeof correctAnswer === "number" ? correctAnswer : 0
              } else if (questionData.type === "true-false") {
                // For true/false, ensure it's a boolean
                correctAnswer = typeof correctAnswer === "boolean" ? correctAnswer : false
              } else {
                // For text-based questions, ensure it's a string
                correctAnswer = typeof correctAnswer === "string" ? correctAnswer : ""
              }

              await tx.examQuestion.create({
                data: {
                  section_id: createdSection.id,
                  type: questionData.type,
                  question: questionData.question,
                  question_ru: questionData.question_ru || null,
                  options: questionData.options ? JSON.stringify(questionData.options) : null,
                  correct_answer: JSON.stringify(correctAnswer), // Always stringify for database
                  points: questionData.points || 1,
                  hint: questionData.hint || null,
                  explanation: questionData.explanation || null,
                  module_id: questionData.module_id || null,
                  difficulty: questionData.difficulty || "medium",
                  tags: questionData.tags || [],
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              })
            }
          }
        }
      }

      return template
    })

    return NextResponse.json({ message: "Exam template updated successfully!", examTemplate: updatedTemplate })
  } catch (error) {
    console.error("Error updating exam template:", error)
    return NextResponse.json(
      { message: "Failed to update exam template.", error: (error as Error).message },
      { status: 500 },
    )
  }
}

/**
 * DELETE handler to delete an exam template.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const templateId = Number.parseInt(params.id)

    if (isNaN(templateId)) {
      return NextResponse.json({ message: "Invalid template ID." }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // Delete questions first
      await tx.examQuestion.deleteMany({
        where: {
          section_id: {
            in: await tx.examSection
              .findMany({
                where: { exam_template_id: templateId },
                select: { id: true },
              })
              .then((sections) => sections.map((s) => s.id)),
          },
        },
      })

      // Delete sections
      await tx.examSection.deleteMany({
        where: { exam_template_id: templateId },
      })

      // Delete the template
      await tx.examTemplate.delete({
        where: { id: templateId },
      })
    })

    return NextResponse.json({ message: "Exam template deleted successfully!" })
  } catch (error) {
    console.error("Error deleting exam template:", error)
    return NextResponse.json(
      { message: "Failed to delete exam template.", error: (error as Error).message },
      { status: 500 },
    )
  }
}
