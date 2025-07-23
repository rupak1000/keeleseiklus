// app/api/settings/email/test-connection/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { smtpHost, smtpPort, smtpUsername, smtpPassword, fromEmail, fromName } = await request.json();

    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword || !fromEmail || !fromName) {
      return NextResponse.json({ message: 'Missing required SMTP settings for test.' }, { status: 400 });
    }

    const testTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // Use true for 465 (SSL), false for 587 (TLS/STARTTLS)
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      // Optional: Add a timeout for the connection attempt
      // timeout: 5000,
      // logger: true, // Enable logging for debugging
      // debug: true, // Enable debug output
    });

    // Verify connection
    await testTransporter.verify();

    // Optionally send a test email
    await testTransporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: fromEmail, // Send test email to the 'from' address
      subject: 'Keele Seiklus: SMTP Connection Test Successful',
      html: '<p>This is a test email from your Keele Seiklus platform. Your SMTP connection is working!</p>',
    });

    return NextResponse.json({ message: 'Email connection test successful!' }, { status: 200 });
  } catch (error: any) {
    console.error('Email connection test failed:', error);
    return NextResponse.json(
      { message: 'Email connection test failed.', error: error.message },
      { status: 500 }
    );
  }
}