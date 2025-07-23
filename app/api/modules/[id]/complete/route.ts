// src/app/api/modules/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from '@/lib/generated/prisma';
import { getCurrentUser } from "@/src/lib/auth";

const prisma = new PrismaClient(); // Keep this as a singleton

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const moduleId = Number.parseInt(params.id);
    const { userId } = await request.json(); // Note: The userId from body should match the authenticated user's ID

    if (isNaN(moduleId) || !userId) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await getCurrentUser();
    // Validate that the authenticated user's ID matches the userId sent in the request body
    if (!user || user.id !== userId.toString()) { // Ensure type consistency: user.id is string from auth.ts
      console.log(`Unauthorized attempt: Auth user ID ${user?.id} vs Request user ID ${userId}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Convert userId to number for Prisma queries if your schema IDs are numbers
    const userIdNum = Number.parseInt(user.id); // Use the authenticated user's ID
    if (isNaN(userIdNum)) {
        console.error(`Authenticated user ID "${user.id}" is not a valid number.`);
        return NextResponse.json({ error: "Unauthorized: Invalid user ID format" }, { status: 401 });
    }

    // Fetch Student
    const student = await prisma.student.findUnique({
      where: { id: userIdNum }, // Use the parsed numeric ID
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Fetch StudentModule
    const studentModule = await prisma.studentModule.findUnique({
      where: {
        student_id_module_id: { // Corrected unique constraint name based on your `progress/route.ts`
          student_id: userIdNum, // Use the parsed numeric ID
          module_id: moduleId,
        },
      },
    });

    if (!studentModule) {
      return NextResponse.json({ error: "Progress for this module not found" }, { status: 404 });
    }

    // Verify all sections are complete (including 'quiz' if applicable)
    // Make sure this list matches the `validSectionKeys` in progress/route.ts and SECTION_ORDER in page.tsx
    const sectionsToCheck = [
      studentModule.story,
      studentModule.vocabulary,
      studentModule.grammar,
      studentModule.pronunciation,
      studentModule.listening,
      studentModule.speaking,
      studentModule.reading,
      studentModule.writing,
      studentModule.cultural,
      studentModule.quiz, // Include quiz here if it's a section
    ];

    const isModuleComplete = sectionsToCheck.every((completed) => completed);

    if (!isModuleComplete) {
      // Log which sections are not complete for debugging
      const incompleteSections = sectionsToCheck
        .map((status, index) => !status ? ["story", "vocabulary", "grammar", "pronunciation", "listening", "speaking", "reading", "writing", "cultural", "quiz"][index] : null)
        .filter(Boolean);
      console.log(`Module ${moduleId} not fully completed by user ${userId}. Incomplete sections: ${incompleteSections.join(', ')}`);
      return NextResponse.json({ error: "Module not fully completed" }, { status: 400 });
    }

    // Update Student's completedModulesList
    const completedModulesList = student.completedModulesList
      ? [...student.completedModulesList, moduleId]
      : [moduleId];

    const updatedStudent = await prisma.student.update({
      where: { id: userIdNum }, // Use the parsed numeric ID
      data: {
        completedModulesList: [...new Set(completedModulesList)], // Avoid duplicates
        last_active: new Date(),
        total_study_time_minutes: {
          increment: studentModule.time_spent || 10, // Adjust as needed
        },
      },
    });

    // Check and create achievement
    const moduleAchievement = await prisma.achievement.findFirst({
      where: {
        type: "MODULE_COMPLETION",
        module_id: moduleId, // Ensure this matches your schema for Achievement
      },
    });

    if (moduleAchievement) {
      // Use findUnique with a compound ID if available for UserAchievement
      const existingUserAchievement = await prisma.userAchievement.findUnique({
        where: {
          studentId_achievementId: { // Assuming this is your unique compound key
            studentId: userIdNum,
            achievementId: moduleAchievement.id,
          },
        },
      });

      if (!existingUserAchievement) {
        await prisma.userAchievement.create({
          data: {
            studentId: userIdNum,
            achievementId: moduleAchievement.id,
            earnedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      completedModules: updatedStudent.completedModulesList?.length || 0,
      completedModulesList: updatedStudent.completedModulesList || [],
      last_active: updatedStudent.last_active.toISOString(),
    });
  } catch (error: any) {
    console.error("Error marking module complete:", {
      message: error.message,
      stack: error.stack,
      moduleId: params.id,
      userId: request.json ? (await request.json()).userId : 'N/A',
    });
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  } finally {
    // REMOVE THIS LINE: Disconnecting Prisma in a serverless function is usually not recommended.
    // await prisma.$disconnect();
  }
}