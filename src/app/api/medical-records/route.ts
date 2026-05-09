import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createMedicalRecordSchema } from "@/lib/validations";
import { apiRateLimit } from "@/lib/rate-limit";
import { createAuditLog } from "@/lib/audit";
import { generateInvoiceNumber } from "@/lib/utils";
import { z } from "zod";
import type { PaymentStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const rateLimitResult = await apiRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};
    if (patientId) where.patientId = patientId;

    // Role-based filtering
    if (session.user.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session.user.id } });
      if (patient) {
        where.patientId = patient.id;
      } else {
        return NextResponse.json({ records: [], total: 0, page, totalPages: 0 });
      }
    }

    // Doctors and owners can view all records when patientId is specified

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { patient: true, doctor: true, prescriptions: true, appointment: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.medicalRecord.count({ where }),
    ]);

    // Audit log for viewing medical records
    if (records.length > 0) {
      await createAuditLog({
        userId: session.user.id,
        action: "VIEW_RECORDS",
        entity: "MedicalRecord",
        entityId: records.map(r => r.id).join(","),
        details: `Viewed ${records.length} medical records`,
      });
    }

    return NextResponse.json({ records, total, page, totalPages: Math.ceil(total / limit) });
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

    const body = await req.json();
    const validated = createMedicalRecordSchema.parse(body);

    const doctorFeeQuery = await prisma.doctor.findFirst({ 
      where: { userId: session.user.id },
    }) as unknown as { consultationFee: number } | null;
    const doctorFee = doctorFeeQuery?.consultationFee || 150000;

    const doctor = await prisma.doctor.findFirst({ 
      where: { userId: session.user.id },
    });
    if (!doctor) return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });

    // Check if medical record already exists for this appointment
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { appointmentId: validated.appointmentId },
    });

    if (existingRecord) {
      return NextResponse.json({ error: "Rekam medis untuk appointment ini sudah ada", status: 400 });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: validated.patientId,
        doctorId: doctor.id,
        appointmentId: validated.appointmentId,
        complaint: validated.complaint,
        diagnosis: validated.diagnosis,
        treatment: validated.treatment,
        notes: validated.notes || undefined,
        vitalSigns: validated.vitalSigns || undefined,
      },
      include: { patient: true, doctor: true },
    });

    // Audit log for creating medical record
    await createAuditLog({
      userId: session.user.id,
      action: "CREATE_RECORD",
      entity: "MedicalRecord",
      entityId: record.id,
      details: `Created medical record for patient ${record.patientId}`,
    });

    // Update appointment status to COMPLETED
    await prisma.appointment.update({
      where: { id: validated.appointmentId },
      data: { status: "COMPLETED" },
    });

    // Create prescriptions if provided
    if (validated.prescriptions && validated.prescriptions.length > 0) {
      // Get all medicines to find prices
      const medicines = await prisma.medicine.findMany();
      
      await prisma.prescription.createMany({
        data: validated.prescriptions.map((p) => {
          // Find medicine by name
          const med = medicines.find(m => m.name === p.medicationName);
          return {
            medicalRecordId: record.id,
            medicationName: p.medicationName,
            dosage: p.dosage,
            instructions: p.instructions,
            quantity: p.quantity || 1,
            medicineId: med?.id,
            unitPrice: med?.price || 0, // Snapshot price from medicine
          };
        }),
      });
    }

    // Auto-create Payment with consultation fee
    // Status: AWAITING_MEDICINE if prescriptions exist, PENDING if not
const hasPrescriptions = validated.prescriptions && validated.prescriptions.length > 0;
    
    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { appointmentId: validated.appointmentId },
    });
    
    let newPayment = existingPayment;
    if (!existingPayment) {
      const invoiceNum = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      newPayment = await prisma.payment.create({
        data: {
          appointmentId: validated.appointmentId,
          totalAmount: doctorFee,
          invoiceNumber: invoiceNum,
          status: (hasPrescriptions ? "AWAITING_MEDICINE" : "PENDING") as PaymentStatus,
        } as unknown as Parameters<typeof prisma.payment.create>[0]["data"],
      });
      console.log("Payment created:", newPayment.status, "for appointment:", validated.appointmentId);
    } else {
      console.log("Payment already exists:", existingPayment.status);
    }

    return NextResponse.json({ record, payment: newPayment }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
