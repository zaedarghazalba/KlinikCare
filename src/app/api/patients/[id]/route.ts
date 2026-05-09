import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updatePatientSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Role-based access control
    if (session.user.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({
        where: { id, userId: session.user.id }
      });
      if (!patient) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({ where: { userId: session.user.id } });
      if (!doctor) return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });

      // Doctor can only view their patients (via appointments)
      const hasAccess = await prisma.appointment.findFirst({
        where: { patientId: id, doctorId: doctor.id }
      });
      if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else if (!["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: { include: { doctor: true }, orderBy: { appointmentDate: "desc" }, take: 10 },
        medicalRecords: { include: { doctor: true, prescriptions: true }, orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // Audit log for viewing patient data
    await createAuditLog({
      userId: session?.user?.id || "unknown",
      action: "VIEW_PATIENT",
      entity: "Patient",
      entityId: id,
      details: `Viewed patient ${patient.name}`,
    });

    return NextResponse.json(patient);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;

    // Role-based authorization
    if (session?.user?.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({
        where: { id, userId: session.user.id }
      });
      if (!patient) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else if (!["ADMIN", "OWNER"].includes(session?.user?.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = updatePatientSchema.parse(body);
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...validated,
        birthDate: validated.birthDate ? new Date(validated.birthDate) : undefined,
      },
    });

    // Audit log for updating patient data
    await createAuditLog({
      userId: session?.user?.id || "unknown",
      action: "UPDATE_PATIENT",
      entity: "Patient",
      entityId: id,
      details: `Updated patient ${patient.name}`,
    });

    return NextResponse.json(patient);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    // Check dependencies before delete
    const patientWithData = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: { where: { status: { not: "CANCELLED" } } },
        medicalRecords: true
      }
    });

    if (!patientWithData) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // Check for active appointments
    if (patientWithData.appointments.length > 0) {
      return NextResponse.json({
        error: "Cannot delete patient with active appointments"
      }, { status: 400 });
    }

    // Check for medical records (healthcare compliance)
    if (patientWithData.medicalRecords.length > 0) {
      return NextResponse.json({
        error: "Cannot delete patient with medical records. Use soft delete instead."
      }, { status: 400 });
    }

    await prisma.patient.delete({ where: { id } });

    // Audit log for deleting patient
    await createAuditLog({
      userId: session.user.id,
      action: "DELETE_PATIENT",
      entity: "Patient",
      entityId: id,
      details: `Deleted patient ${patientWithData.name}`,
    });

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
