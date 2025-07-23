import { NextResponse } from "next/server"

// Mock certificate settings - you can implement database storage later
const defaultSettings = {
  id: 1,
  title: "Certificate of Achievement",
  subtitle: "Estonian Language Proficiency",
  description:
    "This is to certify that {studentName} has successfully completed the KeeleSeiklus Estonian language course and demonstrated proficiency at the {cefrLevel} level of the Common European Framework of Reference for Languages (CEFR).",
  cefr_level: "A1-A2",
  institution_name: "KeeleSeiklus Language Academy",
  institution_subtitle: "Estonian Adventure Learning Platform",
  signatory_name: "Dr. Estonian Teacher",
  signatory_title: "Director of Estonian Studies",
  auto_generate: true,
  email_delivery: false,
  template: "default",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export async function GET() {
  try {
    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error("Error fetching certificate settings:", error)
    return NextResponse.json(
      { message: "Failed to fetch certificate settings.", error: (error as Error).message },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const updateData = await request.json()

    // In a real implementation, you would save to database
    const updatedSettings = {
      ...defaultSettings,
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({ message: "Certificate settings updated successfully!", settings: updatedSettings })
  } catch (error) {
    console.error("Error updating certificate settings:", error)
    return NextResponse.json(
      { message: "Failed to update certificate settings.", error: (error as Error).message },
      { status: 500 },
    )
  }
}
