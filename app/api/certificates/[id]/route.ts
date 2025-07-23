import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const certificateId = Number.parseInt(params.id)

    if (isNaN(certificateId)) {
      return NextResponse.json({ message: "Invalid certificate ID." }, { status: 400 })
    }

    await prisma.certificate.delete({
      where: { id: certificateId },
    })

    return NextResponse.json({ message: "Certificate deleted successfully!" })
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json(
      { message: "Failed to delete certificate.", error: (error as Error).message },
      { status: 500 },
    )
  }
}
