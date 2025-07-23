// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// Configure Nodemailer transporter with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const {
      to, cc, bcc, subject, content, priority,
      scheduleDate, scheduleTime, personalizeContent,
      selectedTemplate, // Not directly used for sending, but for context/history
    } = await request.json();

    // Basic validation
    if (!to || to.length === 0 || !subject || !content) {
      return NextResponse.json({ message: 'Missing required email fields (To, Subject, Content).' }, { status: 400 });
    }

    // Fetch student data for personalization if requested
    let personalizedEmails: { to: string, content: string }[] = [];

    if (personalizeContent) {
      // Fetch all students who are recipients
      const recipientEmails = [...new Set(to.concat(cc || []).concat(bcc || []))];
      const students = await prisma.student.findMany({
        where: {
          email: { in: recipientEmails },
        },
        select: {
          id: true,
          name: true,
          email: true,
          progress: true, // Now available on Student model
          // Select student_modules to count completed modules
          student_modules: {
            where: {
              status: 'completed' // Assuming StudentModule has a status field
            },
            select: { id: true }
          },
          last_active: true, // Now available on Student model
        },
      });

      // Helper to count completed modules for a student
      const getCompletedModulesCount = (student: any) => {
        return student.student_modules?.length || 0;
      };

      // Personalize content for each 'To' recipient
      for (const recipientEmail of to) {
        const student = students.find(s => s.email === recipientEmail);
        let finalContent = content;

        if (student) {
          finalContent = content
            .replace(/{name}/g, student.name)
            .replace(/{progress}/g, student.progress?.toString() || '0')
            .replace(/{completedModules}/g, getCompletedModulesCount(student).toString())
            .replace(/{lastActive}/g, student.last_active?.toLocaleDateString() || 'N/A')
            .replace(/{score}/g, "85"); // Default score for certificate emails (as it's not dynamic from student data)
        }
        personalizedEmails.push({ to: recipientEmail, content: finalContent });
      }

    } else {
      // If not personalizing, send the same content to all 'To' recipients
      to.forEach((recipient: string) => {
        personalizedEmails.push({ to: recipient, content: content });
      });
    }

    // Prepare mail options
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`,
      cc: cc.length > 0 ? cc.join(',') : undefined,
      bcc: bcc.length > 0 ? bcc.join(',') : undefined,
      subject: subject,
      priority: priority || 'normal',
      // html: content, // Use html for rich text, text for plain text
    };

    // Send emails (or schedule them)
    if (scheduleDate && scheduleTime) {
      // In a real application, you would save this to a database
      // and use a cron job or a dedicated scheduling service (e.g., AWS SQS, Google Cloud Tasks)
      // to send the email at the specified time.
      // For this example, we'll just log it as scheduled and save to history.
      console.log(`Email scheduled to: ${to.join(', ')} for ${scheduleDate} at ${scheduleTime}`);
      // Find template ID as Int
      const templateIdInt = selectedTemplate ? parseInt(selectedTemplate, 10) : null;

      await prisma.emailHistory.create({
        data: {
          template_id: templateIdInt, // Store as Int
          to_emails: JSON.stringify(to),
          cc_emails: JSON.stringify(cc),
          bcc_emails: JSON.stringify(bcc),
          subject: subject,
          content: content, // Store original content, personalization happens at send time
          priority: priority,
          status: 'scheduled',
          recipients_count: to.length + (cc?.length || 0) + (bcc?.length || 0),
          scheduled_at: new Date(`${scheduleDate}T${scheduleTime}:00Z`), // Combine date and time
          created_at: new Date(),
        },
      });
      return NextResponse.json({ message: 'Email scheduled successfully!' }, { status: 200 });

    } else {
      // Send immediately
      let sentCount = 0;
      for (const pEmail of personalizedEmails) {
        await transporter.sendMail({
          ...mailOptions,
          to: pEmail.to,
          html: pEmail.content, // Send personalized content
        });
        sentCount++;
      }

      // Find template ID as Int
      const templateIdInt = selectedTemplate ? parseInt(selectedTemplate, 10) : null;

      // Save to EmailHistory with 'sent' status
      await prisma.emailHistory.create({
        data: {
          template_id: templateIdInt, // Store as Int
          to_emails: JSON.stringify(to),
          cc_emails: JSON.stringify(cc),
          bcc_emails: JSON.stringify(bcc),
          subject: subject,
          content: content, // Store original content
          priority: priority,
          status: 'sent',
          recipients_count: personalizedEmails.length,
          sent_at: new Date(),
          created_at: new Date(),
        },
      });

      return NextResponse.json({ message: `Email sent successfully to ${sentCount} recipients!` }, { status: 200 });
    }

  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { message: 'Failed to send email.', error: (error as Error).message },
      { status: 500 }
    );
  }
}