import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateAppointmentSchema } from "@/lib/validations";
import { z } from "zod";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status } = updateAppointmentSchema.parse(body);

    // Fetch appointment with relations
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Role-based authorization
    if (session.user.role === "PATIENT") {
      // Patient can only update their own appointments
      const patient = await prisma.patient.findFirst({
        where: { userId: session.user.id, id: appointment.patientId }
      });
      if (!patient) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // Patient can only CANCEL appointments
      if (status !== "CANCELLED") {
        return NextResponse.json({ error: "Patients can only cancel appointments" }, { status: 403 });
      }
    } else if (session.user.role === "DOCTOR") {
      // Doctor can only update their own appointments
      const doctor = await prisma.doctor.findFirst({
        where: { userId: session.user.id, id: appointment.doctorId }
      });
      if (!doctor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else if (!["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { patient: true, doctor: true },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
