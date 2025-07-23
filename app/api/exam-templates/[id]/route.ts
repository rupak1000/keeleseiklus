import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// Helper to parse template ID from request URL
function getTemplateIdFromRequest(request: Request): number | null {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1];
  const templateId = parseInt(id, 10);
  return isNaN(templateId) ? null : templateId;
}

// GET handler to fetch a single exam template
export async function GET(request: Request) {
  try {
    const templateId = getTemplateIdFromRequest(request);
    if (templateId === null) {
      return NextResponse.json({ message: 'Invalid exam template ID' }, { status: 400 });
    }

    const template = await prisma.examTemplate.findUnique({
      where: { id: templateId },
      include: {
        exam_sections: {
          include: {
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
              orderBy: { id: 'asc' },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ message: 'Exam template not found' }, { status: 404 });
    }

    const formattedTemplate = {
      id: template.id,
      title: template.title,
      description: template.description || '',
      instructions: template.instructions || '',
      totalPoints: template.total_points,
      passingScore: template.passing_score,
      timeLimit: template.time_limit,
      isPublished: template.is_published,
      isActive: template.is_active,
      createdAt: template.created_at.toISOString(),
      updatedAt: template.updated_at.toISOString(),
      settings: template.settings as any,
      sections: template.exam_sections.map(section => ({
        id: section.id.toString(),
        title: section.title,
        description: section.description || '',
        instructions: section.instructions || '',
        timeLimit: section.time_limit || undefined,
        maxPoints: section.max_points,
        randomizeQuestions: section.randomize_questions,
        passingScore: section.passing_score || undefined,
        questions: section.exam_questions.map(question => ({
          id: question.id.toString(),
          type: question.type as any,
          question: question.question,
          question_ru: question.question_ru || undefined,
          options: question.options ? (question.options as string[]) : undefined,
          correctAnswer: question.correct_answer,
          points: question.points,
          hint: question.hint || undefined,
          explanation: question.explanation || undefined,
          module_id: question.module_id || undefined,
          difficulty: question.difficulty as any,
          tags: question.tags ? (question.tags as string[]) : [],
        })),
      })),
    };

    return NextResponse.json(formattedTemplate);
  } catch (error) {
    console.error(`Error fetching exam template:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch exam template.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT handler to update an exam template (for editing/saving drafts)
export async function PUT(request: Request) {
  try {
    const templateId = getTemplateIdFromRequest(request);
    if (templateId === null) {
      return NextResponse.json({ message: 'Invalid exam template ID' }, { status: 400 });
    }

    const { title, description, instructions, timeLimit, sections, settings, isActive, isPublished } = await request.json();

    if (!title || !sections || sections.length === 0) {
      return NextResponse.json({ message: 'Exam title and at least one section are required.' }, { status: 400 });
    }

    const updatedExamTemplate = await prisma.$transaction(async (tx) => {
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
          is_published: isPublished ?? false,
          updated_at: new Date(),
        },
      });

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
      await tx.examSection.deleteMany({
        where: { exam_template_id: templateId }
      });

      for (const sectionData of sections) {
        const createdSection = await tx.examSection.create({
          data: {
            exam_template_id: updatedTemplate.id,
            title: sectionData.title,
            description: sectionData.description || null,
            instructions: sectionData.instructions || null,
            time_limit: sectionData.timeLimit || null,
            max_points: sectionData.maxPoints,
            randomize_questions: sectionData.randomizeQuestions ?? false,
            passing_score: sectionData.passingScore || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        for (const questionData of sectionData.questions) {
          await tx.examQuestion.create({
            data: {
              section_id: createdSection.id,
              type: questionData.type,
              question: questionData.question,
              question_ru: (questionData as any).question_ru || null,
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
            },
          });
        }
      }

      return updatedTemplate;
    });

    return NextResponse.json({ message: 'Exam template updated successfully!', examTemplate: updatedExamTemplate });

  } catch (error) {
    console.error(`Error updating exam template:`, error);
    return NextResponse.json(
      { message: 'Failed to update exam template.', error: (error as Error).message },
      { status: 500 }
    );
  }
}
