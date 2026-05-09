import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const doctorId = searchParams.get("doctorId");

    if (!dateParam || !doctorId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const date = new Date(dateParam); date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: date, lt: nextDay },
        status: { not: "CANCELLED" }
      },
      select: { timeSlot: true }
    });

    const slotCounts = appointments.reduce((acc: Record<string, number>, curr) => {
      acc[curr.timeSlot] = (acc[curr.timeSlot] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ slotCounts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
