import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiRateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const rateLimitResult = await apiRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "daily";

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "weekly":
        startDate = new Date(now); startDate.setDate(now.getDate() - 7); break;
      case "monthly":
        startDate = new Date(now); startDate.setMonth(now.getMonth() - 1); break;
      default:
        startDate = new Date(now); startDate.setHours(0, 0, 0, 0);
    }

    const [totalPatients, totalAppointments, completedAppointments, cancelledAppointments, totalPayments] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({ where: { appointmentDate: { gte: startDate } } }),
      prisma.appointment.count({ where: { appointmentDate: { gte: startDate }, status: "COMPLETED" } }),
      prisma.appointment.count({ where: { appointmentDate: { gte: startDate }, status: "CANCELLED" } }),
      prisma.payment.aggregate({ where: { paidAt: { gte: startDate }, status: "PAID" }, _sum: { totalAmount: true } }),
    ]);

    // Daily stats for the last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now); day.setDate(now.getDate() - i); day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day); nextDay.setDate(day.getDate() + 1);
      const count = await prisma.appointment.count({
        where: { appointmentDate: { gte: day, lt: nextDay } },
      });
      dailyStats.push({
        date: day.toISOString().split("T")[0],
        day: day.toLocaleDateString("id-ID", { weekday: "short" }),
        count,
      });
    }

    return NextResponse.json({
      totalPatients, totalAppointments, completedAppointments, cancelledAppointments,
      totalRevenue: totalPayments._sum.totalAmount || 0,
      dailyStats,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
