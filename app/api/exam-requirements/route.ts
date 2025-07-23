// app/api/exam-requirements/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const settings = await prisma.examRequirement.findFirst();
    if (!settings) {
      return NextResponse.json({
        id: null,
        require_all_modules: true,
        min_modules_required: 10,
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching exam requirements:', error);
    return NextResponse.json({ message: 'Failed to fetch exam requirements.', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    const dataToSave: any = {
      require_all_modules: body.requireAllModules, // Frontend camelCase to DB snake_case
      min_modules_required: body.minModulesRequired, // Frontend camelCase to DB snake_case
      // Assuming no updated_at in this model, if there is, add it.
    };

    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

    let updatedSettings;
    if (id) {
      updatedSettings = await prisma.examRequirement.update({
        where: { id: id },
        data: dataToSave,
      });
    } else {
      updatedSettings = await prisma.examRequirement.create({
        data: dataToSave,
      });
    }
    return NextResponse.json({ message: 'Exam requirements updated successfully!', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating exam requirements:', error);
    return NextResponse.json({ message: 'Failed to update exam requirements.', error: (error as Error).message }, { status: 500 });
  }
}