import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";
import { createAppointmentSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");
    const patientId = searchParams.get("patientId");

    const where: Record<string, unknown> = {};
    if (date) {
      const d = new Date(date); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      where.appointmentDate = { gte: d, lt: next };
    }
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;

    // If patient role, only show their own
    if (session.user.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session.user.id } });
      if (patient) {
        where.patientId = patient.id;
        console.log("Patient ID for queue:", patient.id); // Debug log
      }
      else return NextResponse.json({ appointments: [] });
    }

    // If doctor role, only show their own
    if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({ where: { userId: session.user.id } });
      if (doctor) where.doctorId = doctor.id;
      else return NextResponse.json({ appointments: [] });
    }

    const appointments = await prisma.appointment.findMany({
      where, orderBy: [{ queueNumber: "asc" }],
      include: { patient: true, doctor: true, medicalRecord: true },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validated = createAppointmentSchema.parse(body);

    // Use transaction for atomic queue number generation
    const appointment = await prisma.$transaction(async (tx) => {
      // Check if patient already has an appointment on this date (not cancelled)
      const date = new Date(validated.appointmentDate); date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);

      const existingBooking = await tx.appointment.findFirst({
        where: {
          patientId: validated.patientId,
          appointmentDate: { gte: date, lt: nextDay },
          status: { not: "CANCELLED" }
        }
      });

      if (existingBooking) {
        throw new Error("Anda sudah memiliki jadwal kunjungan pada tanggal ini.");
      }

      // Check doctor quota
      const doctor = await tx.doctor.findUnique({ where: { id: validated.doctorId } });
      if (!doctor) throw new Error("Dokter tidak ditemukan.");

      const doctorBookingsToday = await tx.appointment.count({
        where: {
          doctorId: validated.doctorId,
          appointmentDate: { gte: date, lt: nextDay },
          status: { not: "CANCELLED" }
        }
      });

      if (doctorBookingsToday >= doctor.dailyQuota) {
        throw new Error(`Kuota dokter ini sudah penuh hari ini (Maks ${doctor.dailyQuota} pasien).`);
      }

      const lastAppointment = await tx.appointment.findFirst({
        where: { doctorId: validated.doctorId, appointmentDate: { gte: date, lt: nextDay } },
        orderBy: { queueNumber: "desc" },
      });

      const queueNumber = (lastAppointment?.queueNumber || 0) + 1;

      // Generate QR code
      const qrData = JSON.stringify({
        patientId: validated.patientId,
        doctorId: validated.doctorId,
        date: validated.appointmentDate,
        queue: queueNumber
      });
      const qrCode = await QRCode.toDataURL(qrData, { width: 200, margin: 1 });

      return await tx.appointment.create({
        data: {
          patientId: validated.patientId,
          doctorId: validated.doctorId,
          queueNumber,
          appointmentDate: date,
          timeSlot: validated.timeSlot,
          qrCode,
          status: "WAITING",
        },
        include: { patient: true, doctor: true },
      });
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error("Validation error details:", error.errors);
      return NextResponse.json({ error: "Validation error", details: (error as z.ZodError).errors }, { status: 400 });
    }
    if (error instanceof Error) {
      console.error("Booking error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Unknown error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
