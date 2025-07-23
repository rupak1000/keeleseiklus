import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

/**
 * GET handler to fetch all exam templates.
 * This route handles requests to /api/exam-templates.
 */
export async function GET() {
  try {
    const templates = await prisma.examTemplate.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        instructions: true,
        total_points: true,
        passing_score: true,
        time_limit: true,
        settings: true,
        created_at: true,
        updated_at: true,
        is_active: true,
        is_published: true,
        exam_sections: {
          select: {
            id: true,
            exam_template_id: true,
            title: true,
            description: true,
            instructions: true,
            time_limit: true,
            max_points: true,
            randomize_questions: true,
            passing_score: true,
            exam_questions: {
              select: {
                id: true,
                type: true,
                question: true,
                question_ru: true,
                options: true,
                correct_answer: true,
                points: true,
                hint: true,
                explanation: true,
                module_id: true,
                difficulty: true,
                tags: true,
              },
              orderBy: { id: "asc" },
            },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
    })

    // Format for frontend consumption
    const formattedTemplates = templates.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      instructions: t.instructions || "",
      totalPoints: t.total_points,
      passingScore: t.passing_score,
      timeLimit: t.time_limit,
      isPublished: t.is_published,
      isActive: t.is_active,
      createdAt: t.created_at.toISOString(),
      updatedAt: t.updated_at.toISOString(),
      settings: t.settings as any,
      sections: t.exam_sections.map((section) => ({
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
    }))

    return NextResponse.json(formattedTemplates)
  } catch (error) {
    console.error("Error fetching exam templates:", error)
    return NextResponse.json(
      { message: "Failed to fetch exam templates.", error: (error as Error).message },
      { status: 500 },
    )
  }
}

/**
 * POST handler to create a new exam template.
 * This route handles requests to /api/exam-templates.
 */
export async function POST(request: Request) {
  try {
    const { title, description, instructions, timeLimit, sections, settings, isActive, isPublished } =
      await request.json()

    if (!title || !sections || sections.length === 0) {
      return NextResponse.json({ message: "Exam title and at least one section are required." }, { status: 400 })
    }

    const newExamTemplate = await prisma.$transaction(async (tx) => {
      // Create the exam template first
      const createdTemplate = await tx.examTemplate.create({
        data: {
          title,
          description: description || null,
          instructions: instructions || null,
          total_points: sections.reduce((sum: number, section: any) => sum + (section.maxPoints || 0), 0),
          time_limit: timeLimit || 120,
          passing_score: settings?.passingScore || 70,
          settings: settings || {},
          is_active: isActive ?? false,
          is_published: isPublished ?? false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      // Create sections and questions
      for (const sectionData of sections) {
        const createdSection = await tx.examSection.create({
          data: {
            exam_template_id: createdTemplate.id,
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

      return createdTemplate
    })

    return NextResponse.json(
      { message: "Exam template created successfully!", examTemplate: newExamTemplate },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating exam template:", error)
    console.error("Full error details:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      { message: "Failed to create exam template.", error: (error as Error).message },
      { status: 500 },
    )
  }
}
