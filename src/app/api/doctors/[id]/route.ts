import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateDoctorSchema = z.object({
  dailyQuota: z.number().min(1).max(100).optional(),
  consultationFee: z.number().min(0).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    // Only Admin or Owner can update doctors
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateDoctorSchema.parse(body);

    const doctor = await prisma.doctor.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(doctor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    // Only Admin or Owner can delete doctors
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // We must find the userId associated with the doctor first
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Deleting the user will cascade and delete the doctor profile too
    await prisma.user.delete({
      where: { id: doctor.userId }
    });

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
