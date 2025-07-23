// app/api/exam-templates/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
// GET handler to fetch all exam templates
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
        settings: true, // Fetch settings JSON
        created_at: true,
        updated_at: true,
        is_active: true,
        is_published: true,
        exam_sections: {
          select: {
            id: true,
            title: true,
            description: true, // Include description for section
            instructions: true, // Include instructions for section
            time_limit: true, // Include time_limit for section
            max_points: true,
            randomize_questions: true, // Include randomize_questions
            passing_score: true, // Include passing_score
            exam_questions: { // FIXED: Changed 'questions' to 'exam_questions'
              select: { // Select all fields needed for editing questions
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
              orderBy: { id: 'asc' } // Order questions for consistent editing
            }
          },
          orderBy: { id: 'asc' } // Order sections for consistent editing
        }
      },
      orderBy: { created_at: 'desc' },
    });

    // Format for frontend
    const formattedTemplates = templates.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      instructions: t.instructions || '',
      totalPoints: t.total_points,
      passingScore: t.passing_score,
      timeLimit: t.time_limit,
      isPublished: t.is_published,
      isActive: t.is_active,
      createdAt: t.created_at.toISOString(),
      updatedAt: t.updated_at.toISOString(),
      settings: t.settings as any, // Cast Json to frontend settings interface
      sections: t.exam_sections.map(section => ({
        id: section.id, // Keep as number, frontend expects number for ExamSection.id
        exam_template_id: section.exam_template_id,
        title: section.title,
        description: section.description || '',
        instructions: section.instructions || '',
        timeLimit: section.time_limit || undefined,
        maxPoints: section.max_points,
        randomizeQuestions: section.randomize_questions,
        passingScore: section.passing_score || undefined,
        questions: section.exam_questions.map(question => ({ // FIXED: Use exam_questions here
          id: question.id, // Keep as number
          type: question.type as any,
          question: question.question,
          question_ru: question.question_ru || undefined,
          options: question.options ? (question.options as string[]) : undefined,
          correct_answer: question.correct_answer,
          points: question.points,
          hint: question.hint || undefined,
          explanation: question.explanation || undefined,
          module_id: question.module_id || undefined,
          difficulty: question.difficulty as any,
          tags: question.tags ? (question.tags as string[]) : [],
        }))
      }))
    }));

    return NextResponse.json(formattedTemplates);
  } catch (error) {
    console.error('Error fetching exam templates:', error);
    return NextResponse.json(
      { message: 'Failed to fetch exam templates.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST handler to create a new exam template (from NewExamPage)
export async function POST(request: Request) {
  try {
    const { title, description, instructions, timeLimit, sections, settings, isActive, isPublished } = await request.json();

    if (!title || !sections || sections.length === 0) {
      return NextResponse.json({ message: 'Exam title and at least one section are required.' }, { status: 400 });
    }

    const newExamTemplate = await prisma.$transaction(async (tx) => {
      const createdTemplate = await tx.examTemplate.create({
        data: {
          title,
          description: description || null,
          instructions: instructions || null,
          total_points: sections.reduce((sum: number, section: any) => sum + (section.maxPoints || 0), 0),
          time_limit: timeLimit || 120,
          passing_score: settings.passingScore || 70,
          settings: settings || {}, // Store settings JSON
          is_active: isActive ?? false,
          is_published: isPublished ?? false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Create ExamSections and their nested ExamQuestions
      for (const sectionData of sections) {
        await tx.examSection.create({
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
            exam_questions: { // FIXED: Correct nested create syntax
              create: sectionData.questions.map((questionData: any) => ({
                // No need for `id: undefined` here, Prisma handles new IDs
                type: questionData.type,
                question: questionData.question,
                question_ru: questionData.question_ru || null,
                options: questionData.options || null, // `Json?` type, so `null` is fine
                correct_answer: questionData.correctAnswer, // `Json` type
                points: questionData.points || 1,
                hint: questionData.hint || null,
                explanation: questionData.explanation || null,
                module_id: questionData.module_id || null, // `Int?` type
                difficulty: questionData.difficulty || "medium",
                tags: questionData.tags || [], // `String[]` type, ensure it's an array
                created_at: new Date(),
                updated_at: new Date(),
              }))
            },
          },
        });
      }

      return createdTemplate; // Return the created exam template
    });

    return NextResponse.json({ message: 'Exam template created successfully!', examTemplate: newExamTemplate }, { status: 201 });

  } catch (error) {
    console.error('Error creating exam template:', error);
    // Log full error for debugging
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { message: 'Failed to create exam template.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE handler for individual exam template
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const templateId = parseInt(params.id, 10);
    if (isNaN(templateId)) {
      return NextResponse.json({ message: 'Invalid exam template ID' }, { status: 400 });
    }

    // Use a transaction to ensure all related data is deleted
    await prisma.$transaction(async (tx) => {
      // Delete ExamQuestions first (cascade from ExamSection might not be enough for complex setups)
      const sectionsToDelete = await tx.examSection.findMany({
        where: { exam_template_id: templateId },
        select: { id: true }
      });
      const sectionIds = sectionsToDelete.map(s => s.id);
      if (sectionIds.length > 0) {
        await tx.examQuestion.deleteMany({
          where: { section_id: { in: sectionIds } }
        });
      }

      // Delete ExamSections
      await tx.examSection.deleteMany({
        where: { exam_template_id: templateId }
      });

      // Delete StudentExamAttempts related to this template
      await tx.studentExamAttempt.deleteMany({
        where: { exam_template_id: templateId }
      });

      // Delete Certificates related to this template
      await tx.certificate.deleteMany({
        where: { exam_template_id: templateId }
      });

      // Finally, delete the ExamTemplate itself
      await tx.examTemplate.delete({
        where: { id: templateId },
      });
    });

    return NextResponse.json({ message: 'Exam template deleted successfully!' });
  } catch (error) {
    console.error(`Error deleting exam template ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete exam template.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT handler for publishing/unpublishing exam template
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const templateId = parseInt(params.id, 10);
    if (isNaN(templateId)) {
      return NextResponse.json({ message: 'Invalid exam template ID' }, { status: 400 });
    }

    const { isPublished, ...restOfTemplateData } = await request.json(); // Extract isPublished and other fields

    // If only isPublished is sent, handle it as a publish/unpublish action
    if (Object.keys(restOfTemplateData).length === 0 && typeof isPublished === 'boolean') {
      let updatedTemplate;
      await prisma.$transaction(async (tx) => {
        // If publishing, unpublish all other currently published exams
        if (isPublished) {
          await tx.examTemplate.updateMany({
            where: { is_published: true, NOT: { id: templateId } },
            data: { is_published: false, updated_at: new Date() },
          });
        }

        // Update the target exam template's published status
        updatedTemplate = await tx.examTemplate.update({
          where: { id: templateId },
          data: {
            is_published: isPublished,
            is_active: isPublished, // Often active when published
            updated_at: new Date(),
          },
        });
      });
      return NextResponse.json({ message: 'Exam template published status updated successfully!', examTemplate: updatedTemplate });
    } else {
      // Handle full template update (saving draft/changes from editor)
      // This logic mirrors the POST handler's data processing for sections/questions
      const { title, description, instructions, timeLimit, sections, settings, isActive } = restOfTemplateData;

      if (!title || !sections || sections.length === 0) {
        return NextResponse.json({ message: 'Exam title and at least one section are required for full update.' }, { status: 400 });
      }

      const updatedExamTemplate = await prisma.$transaction(async (tx) => {
        // 1. Update the main ExamTemplate record
        const updatedTemplate = await tx.examTemplate.update({
          where: { id: templateId },
          data: {
            title,
            description: description || null,
            instructions: instructions || null,
            total_points: sections.reduce((sum: number, section: any) => sum + (section.maxPoints || 0), 0),
            time_limit: timeLimit || 120,
            passing_score: settings.passingScore || 70,
            settings: settings || {},
            is_active: isActive ?? false,
            is_published: isPublished ?? false, // Use the passed isPublished status
            updated_at: new Date(),
          },
        });

        // 2. Handle ExamSections and their nested ExamQuestions (Delete all and recreate approach for simplicity)
        // First, delete all existing questions for this template's sections
        const existingSectionIds = await tx.examSection.findMany({
          where: { exam_template_id: templateId },
          select: { id: true }
        });
        const sectionIdsToDelete = existingSectionIds.map(s => s.id);
        if (sectionIdsToDelete.length > 0) {
          await tx.examQuestion.deleteMany({
            where: { section_id: { in: sectionIdsToDelete } }
          });
        }
        // Then, delete all existing sections for this template
        await tx.examSection.deleteMany({
          where: { exam_template_id: templateId }
        });

        // Now, recreate sections and questions based on the incoming data
        for (const sectionData of sections) {
          await tx.examSection.create({
            data: {
              exam_template_id: updatedTemplate.id,
              title: sectionData.title,
              description: sectionData.description || null,
              instructions: sectionData.instructions || null,
              time_limit: sectionData.timeLimit || null,
              max_points: sectionData.maxPoints || 0,
              randomize_questions: sectionData.randomizeQuestions ?? false,
              passing_score: sectionData.passingScore || null,
              created_at: new Date(),
              updated_at: new Date(),
              exam_questions: {
                create: sectionData.questions.map((questionData: any) => ({
                  type: questionData.type,
                  question: questionData.question,
                  question_ru: questionData.question_ru || null,
                  options: questionData.options || null,
                  correct_answer: questionData.correctAnswer,
                  points: questionData.points || 1,
                  hint: questionData.hint || null,
                  explanation: questionData.explanation || null,
                  module_id: questionData.module_id || null,
                  difficulty: questionData.difficulty || "medium",
                  tags: questionData.tags || [],
                  created_at: new Date(),
                  updated_at: new Date(),
                }))
              },
            },
          });
        }
        return updatedTemplate;
      });
      return NextResponse.json({ message: 'Exam template fully updated successfully!', examTemplate: updatedExamTemplate });
    }
  } catch (error) {
    console.error(`Error updating exam template ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update exam template.', error: (error as Error).message },
      { status: 500 }
    );
  }
}
