// /app/api/modules/[id]/progress/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma'; // FIXED: Import the singleton Prisma client instance
import { getCurrentUser } from '@/src/lib/auth'; // Assuming this utility exists and returns { id: number, ... }
const prisma = new PrismaClient();
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const moduleId = Number.parseInt(params.id);
    const { sectionId } = await request.json(); // sectionId is like "story", "vocabulary", etc.

    if (isNaN(moduleId) || !sectionId) {
      console.error(`Invalid input: moduleId=${moduleId}, sectionId=${sectionId}`);
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const user = await getCurrentUser(); // Assuming user.id is already a number here
    // FIXED: Add more logging for debugging getCurrentUser()
    console.log('getCurrentUser() result:', user);
    console.log('Type of user.id:', typeof user?.id);

    // FIXED: Ensure user and user.id are valid numbers. If user.id could be a string from auth, parse it here.
    let userId: number;
    if (user && (typeof user.id === 'number')) {
      userId = user.id;
    } else if (user && (typeof user.id === 'string') && !isNaN(parseInt(user.id, 10))) {
      userId = parseInt(user.id, 10);
      console.warn(`User ID was a string, parsed to number: ${userId}`);
    } else {
      console.log('No authenticated user or invalid user ID type. Returning Unauthorized.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let student = await tx.student.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          level: true,
          progress: true,
          last_active: true,
          is_admin: true,
          subscription_status: true,
          total_study_time_minutes: true, // FIXED: Select total_study_time_minutes
          // Select student_modules to get list of completed modules for the student
          student_modules: {
            where: { status: 'completed' },
            select: { module_id: true }
          }
        },
      });

      if (!student) {
        console.log(`Creating new student for user ID: ${userId}`);
        // Ensure all non-nullable fields have values when creating a new student
        student = await tx.student.create({
          data: {
            id: userId, // Ensure this matches the autoincrement ID if it's not provided by auth
            name: user.name || 'Unknown',
            email: user.email || `user_${userId}@example.com`,
            password_hash: 'default_placeholder_hash', // FIXED: Provide a non-empty default hash
            is_admin: user.isAdmin ?? false,
            enrollment_date: new Date(),
            last_active: new Date(),
            level: 'A1',
            progress: 0,
            total_study_time_minutes: 0,
            streak: 0,
            achievements: [],
            status: 'active',
            subscription: 'Free',
            subscription_status: 'free',
            // Other optional fields can be null
          },
        });
      }

      let studentModule = await tx.studentModule.findUnique({
        where: {
          student_id_module_id: { // FIXED: Correct unique constraint name
            student_id: userId,
            module_id: moduleId,
          },
        },
      });

      // Define all valid section keys as per your StudentModule model
      const validSectionKeys = [
        'story', 'vocabulary', 'grammar', 'pronunciation', 'listening',
        'speaking', 'reading', 'writing', 'cultural', 'quiz'
      ];

      // Ensure sectionId is a valid key for StudentModule
      if (!validSectionKeys.includes(sectionId)) {
        console.error(`Invalid section ID: ${sectionId}`);
        throw new Error('Invalid section ID');
      }

      // If studentModule doesn't exist, create it first
      if (!studentModule) {
        console.log(`Creating new student module for user ID: ${userId}, module ID: ${moduleId}`);
        studentModule = await tx.studentModule.create({
          data: {
            student_id: userId,
            module_id: moduleId,
            progress: 0,
            status: 'not_started',
            story: false, vocabulary: false, grammar: false, pronunciation: false,
            listening: false, speaking: false, reading: false, writing: false,
            cultural: false, quiz: false,
            time_spent: 0, // Start with 0, increment later
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }

      // Only mark complete if section is not already true
      const isSectionAlreadyComplete = studentModule[sectionId as keyof typeof studentModule]; // Access dynamically
      let progressIncrementPerSection = 100 / validSectionKeys.length; // Each section contributes equally
      progressIncrementPerSection = parseFloat(progressIncrementPerSection.toFixed(2)); // Cap decimals

      let newModuleProgressPercentage = studentModule.progress;
      if (!isSectionAlreadyComplete) {
        newModuleProgressPercentage = Math.min(studentModule.progress + progressIncrementPerSection, 100);
      }
      
      const updateStudentModuleData: { [key: string]: any } = {
        [sectionId]: true, // Mark this specific section complete
        progress: newModuleProgressPercentage,
        status: newModuleProgressPercentage === 100 ? 'completed' : 'in_progress',
        updated_at: new Date(),
        time_spent: (studentModule.time_spent || 0) + 5, // Increment time spent for this module (e.g., 5 minutes per section)
      };

      if (newModuleProgressPercentage === 100 && !studentModule.completed_at) {
        updateStudentModuleData.completed_at = new Date();
      }

      const updatedStudentModule = await tx.studentModule.update({
        where: {
          student_id_module_id: {
            student_id: userId,
            module_id: moduleId,
          },
        },
        data: updateStudentModuleData,
      });

      // Recalculate overall student progress and update student record
      const completedModulesForStudent = await tx.studentModule.count({
        where: {
          student_id: userId,
          status: 'completed'
        }
      });
      
      // Assuming 40 total modules in your system
      const totalAvailableModules = 40; 
      const newOverallStudentProgress = Math.round((completedModulesForStudent / totalAvailableModules) * 100);

      // Update student's overall progress and last_active time
      const updatedStudent = await tx.student.update({
        where: { id: userId },
        data: {
          progress: newOverallStudentProgress, // Update overall progress percentage
          last_active: new Date(),
          total_study_time_minutes: { // Increment total study time
            increment: updateStudentModuleData.time_spent - (studentModule.time_spent || 0) // Only add the newly added time
          },
          // completedModulesList is a derived field, not directly updated here.
          // It's fetched via student_modules relation.
        },
        select: { // Select updated fields to return to frontend
            id: true,
            name: true,
            email: true,
            level: true,
            progress: true,
            last_active: true,
            is_admin: true,
            subscription_status: true,
            subscription_date: true,
            total_study_time_minutes: true,
            student_modules: {
                where: { status: 'completed' },
                select: { module_id: true }
            }
        }
      });

      // Prepare response for frontend
      const responseProgress = {
        story: updatedStudentModule.story,
        vocabulary: updatedStudentModule.vocabulary,
        grammar: updatedStudentModule.grammar,
        pronunciation: updatedStudentModule.pronunciation,
        listening: updatedStudentModule.listening,
        speaking: updatedStudentModule.speaking,
        reading: updatedStudentModule.reading,
        writing: updatedStudentModule.writing,
        cultural: updatedStudentModule.cultural,
        quiz: updatedStudentModule.quiz,
        progress: updatedStudentModule.progress, // Module's own progress percentage
        status: updatedStudentModule.status,
        completed_at: updatedStudentModule.completed_at?.toISOString() || undefined,
        time_spent: updatedStudentModule.time_spent,
        id: updatedStudentModule.id,
        student_id: updatedStudentModule.student_id,
        module_id: updatedStudentModule.module_id,
        created_at: updatedStudentModule.created_at?.toISOString() || undefined,
        updated_at: updatedStudentModule.updated_at?.toISOString() || undefined,
      };

      const responseUser = {
        id: updatedStudent.id,
        name: updatedStudent.name,
        email: updatedStudent.email,
        level: updatedStudent.level,
        progress: updatedStudent.progress, // Overall student progress
        completedModulesList: updatedStudent.student_modules.map(sm => sm.module_id),
        lastActive: updatedStudent.last_active.toISOString(),
        isAdmin: updatedStudent.is_admin,
        subscriptionStatus: updatedStudent.subscription_status || 'free',
        subscriptionDate: updatedStudent.subscription_date?.toISOString() || undefined,
      };

      return {
        moduleProgress: responseProgress,
        user: responseUser,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating progress:', {
      message: error.message,
      stack: error.stack,
      moduleId: params.id,
      sectionId: request.json ? (await request.json()).sectionId : 'N/A', // Safely access sectionId for logging
    });
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    // FIXED: Remove prisma.$disconnect() in API routes
  }
}
