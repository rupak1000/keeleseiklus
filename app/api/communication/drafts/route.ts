// app/api/communication/drafts/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
// For persisting drafts in the DB, you'll need an 'EmailDraft' model in your schema.prisma
// Example 'EmailDraft' model:
/*
model EmailDraft {
  id                   Int       @id @default(autoincrement())
  subject              String?
  content              String?
  to_emails            String?   @default("[]") // Store as JSON string of emails
  cc_emails            String?   @default("[]")
  bcc_emails           String?   @default("[]")
  priority             String    @default("normal")
  schedule_date        DateTime?
  schedule_time        String?   // Store time as string (e.g., "HH:MM")
  use_template         Boolean   @default(false)
  selected_template_id Int?      // Link to EmailTemplate if needed (Int ID)
  personalize_content  Boolean   @default(true)
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt
  // userId               Int?      @map("user_id") // If drafts are per user
  // user                 Student?  @relation(fields: [userId], references: [id])
}
*/

export async function GET(request: Request) {
  try {
    // If you have a DB model for EmailDraft, fetch from there.
    const draft = await prisma.emailDraft.findFirst({
      orderBy: { updated_at: 'desc' } // Get the most recent draft
    });

    if (draft) {
      // Parse JSON string fields back to arrays for frontend
      return NextResponse.json({
        ...draft,
        to: draft.to_emails ? JSON.parse(draft.to_emails) : [],
        cc: draft.cc_emails ? JSON.parse(draft.cc_emails) : [],
        bcc: draft.bcc_emails ? JSON.parse(draft.bcc_emails) : [],
        // Convert scheduleDate to YYYY-MM-DD for frontend input
        scheduleDate: draft.schedule_date ? new Date(draft.schedule_date).toISOString().split('T')[0] : undefined,
        selectedTemplate: draft.selected_template_id ? draft.selected_template_id.toString() : undefined, // Convert Int to String
      });
    }
    return NextResponse.json(null, { status: 200 }); // Return null if no draft
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { message: 'Failed to fetch draft.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const draftData = await request.json();
    // Convert template ID to Int for DB storage
    const selectedTemplateIdInt = draftData.selectedTemplate ? parseInt(draftData.selectedTemplate, 10) : null;

    // If you have a DB model for EmailDraft, save/update there.
    const existingDraft = await prisma.emailDraft.findFirst();
    let savedDraft;

    if (existingDraft) {
      savedDraft = await prisma.emailDraft.update({
        where: { id: existingDraft.id },
        data: {
          subject: draftData.subject,
          content: draftData.content,
          to_emails: JSON.stringify(draftData.to),
          cc_emails: JSON.stringify(draftData.cc),
          bcc_emails: JSON.stringify(draftData.bcc),
          priority: draftData.priority,
          schedule_date: draftData.scheduleDate ? new Date(draftData.scheduleDate) : null,
          schedule_time: draftData.scheduleTime || null,
          use_template: draftData.useTemplate,
          selected_template_id: selectedTemplateIdInt,
          personalize_content: draftData.personalizeContent,
        }
      });
    } else {
      savedDraft = await prisma.emailDraft.create({
        data: {
          subject: draftData.subject,
          content: draftData.content,
          to_emails: JSON.stringify(draftData.to),
          cc_emails: JSON.stringify(draftData.cc),
          bcc_emails: JSON.stringify(draftData.bcc),
          priority: draftData.priority,
          schedule_date: draftData.scheduleDate ? new Date(draftData.scheduleDate) : null,
          schedule_time: draftData.scheduleTime || null,
          use_template: draftData.useTemplate,
          selected_template_id: selectedTemplateIdInt,
          personalize_content: draftData.personalizeContent,
        }
      });
    }
    return NextResponse.json({ message: 'Draft saved successfully!', draft: savedDraft });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { message: 'Failed to save draft.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // If you have a DB model for EmailDraft, delete from there.
    await prisma.emailDraft.deleteMany(); // Deletes all drafts (adjust if you have per-user drafts)
    return NextResponse.json({ message: 'Draft cleared successfully!' });
  } catch (error) {
    console.error('Error clearing draft:', error);
    return NextResponse.json(
      { message: 'Failed to clear draft.', error: (error as Error).message },
      { status: 500 }
    );
  }
}