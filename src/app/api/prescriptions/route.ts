import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updatePrescriptionSchema } from "@/lib/validations";
import { apiRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const rateLimitResult = await apiRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const whereClause: Record<string, unknown> = status ? { status } : {};

    // Role-based filtering
    if (session.user.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ 
        where: { userId: session.user.id } 
      });
      if (!patient) return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
      
      // Only show prescriptions for this patient
      whereClause.medicalRecord = {
        patientId: patient.id
      };
    } else if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({ 
        where: { userId: session.user.id } 
      });
      if (!doctor) return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
      
      // Only show prescriptions for this doctor's patients
      whereClause.medicalRecord = {
        doctorId: doctor.id
      };
    }
    // ADMIN, OWNER, PHARMACY can see all - no additional filter

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where: whereClause,
        include: {
          medicine: true,
          medicalRecord: {
            include: {
              patient: true,
              doctor: true,
              appointment: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.prescription.count({ where: whereClause }),
    ]);

    return NextResponse.json({ prescriptions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "PHARMACY", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = updatePrescriptionSchema.parse(body);

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { medicine: true, medicalRecord: { include: { appointment: true } } },
    });

    if (!prescription) return NextResponse.json({ error: "Prescription not found" }, { status: 404 });

    let appointmentId = prescription.medicalRecord?.appointment?.id;
    if (!appointmentId) {
      const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id: prescription.medicalRecordId },
        select: { appointmentId: true },
      });
      
      if (!medicalRecord?.appointmentId) {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
      }
      appointmentId = medicalRecord.appointmentId;
    }

    let unitPrice = prescription.unitPrice;

    // If dispensed, update prescription status FIRST
    if (status === "DISPENSED") {
      // Update the prescription status first
      await prisma.prescription.update({
        where: { id },
        data: { status: "DISPENSED", unitPrice },
      });
      
      // Then check medicine for stock deduction
      if (prescription.medicineId && prescription.medicine) {
        unitPrice = prescription.medicine.price;
        
        await prisma.medicine.update({
          where: { id: prescription.medicineId },
          data: { stock: { decrement: prescription.quantity } },
        });

        const payment = await prisma.payment.findUnique({
          where: { appointmentId },
        });

        if (payment) {
          await prisma.payment.update({
            where: { appointmentId },
            data: { totalAmount: { increment: unitPrice * prescription.quantity } },
          });
        }
      }
      
      // NOW check if all prescriptions are dispensed (after update)
      const allPrescriptions = await prisma.prescription.findMany({
        where: { medicalRecordId: prescription.medicalRecordId },
      });

      const allDispensed = allPrescriptions.every((rx) => rx.status === "DISPENSED");
      console.log("allDispensed:", allDispensed, "total:", allPrescriptions.length);

      // If all dispensed, update payment status from AWAITING_MEDICINE to READY_FOR_PAYMENT
      if (allDispensed) {
        const payment = await prisma.payment.findUnique({
          where: { appointmentId },
        });

        console.log("payment status before:", payment?.status, "appointmentId:", appointmentId);

        if (payment?.status === "AWAITING_MEDICINE") {
          await prisma.payment.update({
            where: { appointmentId },
            data: { status: "READY_FOR_PAYMENT" },
          });
          console.log("updated to READY_FOR_PAYMENT");
        }
      }
      
      return NextResponse.json({ prescription: { ...prescription, status: "DISPENSED" } });
    }

    return NextResponse.json({ prescription });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
