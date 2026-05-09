import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateCertificateNumber } from "@/lib/utils";
import { createMedicalCertificateSchema } from "@/lib/validations";
import { apiRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const rateLimitResult = await apiRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where: Record<string, unknown> = {};

    if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({ where: { userId: session.user.id } });
      if (doctor) where.doctorId = doctor.id;
    }

    if (session.user.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session.user.id } });
      if (!patient) {
        return NextResponse.json({ certificates: [] });
      }
      where.medicalRecord = { patientId: patient.id };
    }

    const certificates = await prisma.medicalCertificate.findMany({
      where,
      include: {
        medicalRecord: { include: { patient: true, appointment: true } },
        doctor: true,
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rateLimitResult = await apiRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await auth();
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findFirst({ where: { userId: session.user.id } });
    if (!doctor) return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });

    const body = await req.json();
    const validated = createMedicalCertificateSchema.parse(body);

    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: validated.medicalRecordId },
      include: { patient: true },
    });

    if (!medicalRecord) return NextResponse.json({ error: "Medical record not found" }, { status: 404 });

    const start = new Date(validated.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + validated.restDays - 1);

    // Allow multiple certificates per visit (per medicalRecordId)
    // Previous check removed to allow creating new certificate for each visit

    const certificate = await prisma.medicalCertificate.create({
      data: {
        certificateNumber: generateCertificateNumber(),
        medicalRecordId: validated.medicalRecordId,
        doctorId: doctor.id,
        patientId: medicalRecord.patientId,
        patientName: medicalRecord.patient.name,
        patientNik: medicalRecord.patient.nik,
        restDays: validated.restDays,
        startDate: start,
        endDate: end,
        diagnosis: validated.diagnosis,
        notes: validated.notes || null,
      },
      include: { doctor: true, medicalRecord: { include: { patient: true } } },
    });

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findFirst({ where: { userId: session.user.id } });
    if (!doctor) return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    const body = await req.json();
    const validated = createMedicalCertificateSchema.parse(body);

    const existing = await prisma.medicalCertificate.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });

    const start = new Date(validated.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + validated.restDays - 1);

    const certificate = await prisma.medicalCertificate.update({
      where: { id },
      data: {
        restDays: validated.restDays,
        startDate: start,
        endDate: end,
        diagnosis: validated.diagnosis,
        notes: validated.notes || null,
      },
      include: { doctor: true },
    });

    return NextResponse.json({ certificate });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
