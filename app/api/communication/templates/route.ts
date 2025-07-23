// app/api/communication/templates/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
// GET handler to fetch all email templates
export async function GET(request: Request) {
  try {
    const templates = await prisma.emailTemplate.findMany({
      select: {
        id: true,
        name: true,
        subject: true,
        content: true,
        category: true,
        // No need to select created_at/updated_at unless frontend displays them
      },
      orderBy: {
        name: 'asc', // Order by name for consistent display
      },
    });

    // Frontend's EmailTemplate interface expects 'id: number', and Prisma returns Int.
    // So, no need for .toString() conversion here.
    const formattedTemplates = templates.map(t => ({
      ...t,
      id: t.id, // Keep as number
    }));

    return NextResponse.json(formattedTemplates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { message: 'Failed to fetch email templates.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST handler to create a new email template
export async function POST(request: Request) {
  try {
    const { name, subject, content, category } = await request.json();

    // Basic validation for required fields
    if (!name || !subject || !content || !category) {
      return NextResponse.json({ message: 'Name, subject, content, and category are required.' }, { status: 400 });
    }

    // Optional: Add more robust validation for 'category' if it's an enum in Prisma
    // e.g., if (!['welcome', 'progress', 'reminder', 'certificate', 'general', 'custom'].includes(category)) { ... }

    const newTemplate = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        content,
        category,
        created_at: new Date(), // Set creation timestamp
        updated_at: new Date(), // Set initial update timestamp
      },
    });

    // Return the newly created template
    return NextResponse.json({ message: 'Template created successfully!', template: newTemplate }, { status: 201 });
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      { message: 'Failed to create email template.', error: (error as Error).message },
      { status: 500 }
    );
  }
}