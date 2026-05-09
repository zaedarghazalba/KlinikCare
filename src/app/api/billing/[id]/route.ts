import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updatePaymentSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    console.log("Billing POST body:", body);
    
    const validated = updatePaymentSchema.parse({ ...body, id });
    console.log("Validated:", validated);

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { appointment: { include: { patient: true, doctor: true } } },
    });

if (!payment) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (payment.status === "AWAITING_MEDICINE") {
      return NextResponse.json({ error: "Obat belum seringkalian oleh farmasi" }, { status: 400 });
    }

    if (payment.status !== "PENDING" && payment.status !== "READY_FOR_PAYMENT") {
      return NextResponse.json({ error: "Invoice sudah lunas atau tidak valid" }, { status: 400 });
    }

    // Calculate total: consultation fee + medicines
    const appointment = await prisma.appointment.findUnique({
      where: { id: payment.appointmentId },
      include: {
        medicalRecord: {
          include: { prescriptions: { include: { medicine: true } } },
        },
        doctor: true,
      },
    });

    let medicineTotal = 0;
    if (appointment?.medicalRecord?.prescriptions) {
      medicineTotal = appointment.medicalRecord.prescriptions.reduce(
        (sum, rx) => sum + (rx.unitPrice * rx.quantity), 0
      );
    }

    const consultationFee = appointment?.doctor?.consultationFee || 150000;
    const totalAmount = consultationFee + medicineTotal;

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: "PAID",
        paymentMethod: validated.paymentMethod,
        paidAt: new Date(),
        totalAmount: totalAmount,
      },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
            medicalRecord: {
              include: { prescriptions: { include: { medicine: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json({ payment: updated });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
            medicalRecord: {
              include: {
                prescriptions: {
                  include: { medicine: true },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Role-based access control
    if (session.user.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({
        where: { userId: session.user.id, id: payment.appointment.patientId }
      });
      if (!patient) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({
        where: { userId: session.user.id, id: payment.appointment.doctorId }
      });
      if (!doctor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else if (!["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
