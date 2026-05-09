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
    const type = searchParams.get("type") || "patients";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const dateFilter: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      dateFilter.gte = dateFrom ? new Date(dateFrom) : undefined;
      dateFilter.lte = dateTo ? new Date(dateTo + "T23:59:59") : undefined;
    }

    if (type === "patients") {
      const where: Record<string, unknown> = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { nik: { contains: search } },
          { phone: { contains: search } },
        ];
      }

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.patient.count({ where }),
      ]);

      return NextResponse.json({ patients, total, page, totalPages: Math.ceil(total / limit) });
    }

    if (type === "appointments") {
      const where: Record<string, unknown> = {};
      if (dateFrom || dateTo) {
        where.appointmentDate = dateFilter;
      }
      if (search) {
        where.OR = [
          { patient: { name: { contains: search, mode: "insensitive" } } },
          { doctor: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          include: { patient: true, doctor: true },
          orderBy: { appointmentDate: "desc" },
          skip,
          take: limit,
        }),
        prisma.appointment.count({ where }),
      ]);

      return NextResponse.json({ appointments, total, page, totalPages: Math.ceil(total / limit) });
    }

    if (type === "payments") {
      const where: Record<string, unknown> = {};
      if (dateFrom || dateTo) {
        where.createdAt = dateFilter;
      }
      if (search) {
        where.OR = [
          { invoiceNumber: { contains: search, mode: "insensitive" } },
          { appointment: { patient: { name: { contains: search, mode: "insensitive" } } } },
        ];
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: { appointment: { include: { patient: true, doctor: true } } },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.payment.count({ where }),
      ]);

      // Calculate revenue
      const paidPayments = payments.filter(p => p.status === "PAID");
      const revenueTotal = paidPayments.reduce((sum, p) => sum + p.totalAmount, 0);

      return NextResponse.json({ 
        payments, 
        total, 
        page, 
        totalPages: Math.ceil(total / limit),
        revenue: { total: revenueTotal }
      });
    }

    if (type === "medicines") {
      const where: Record<string, unknown> = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ];
      }

      const [medicines, total] = await Promise.all([
        prisma.medicine.findMany({
          where,
          orderBy: { name: "asc" },
          skip,
          take: limit,
        }),
        prisma.medicine.count({ where }),
      ]);

      return NextResponse.json({ medicines, total, page, totalPages: Math.ceil(total / limit) });
    }

    if (type === "revenue") {
      const where: Record<string, unknown> = { status: "PAID" };
      if (dateFrom || dateTo) {
        where.paidAt = dateFilter;
      }

      const payments = await prisma.payment.findMany({
        where,
        select: { totalAmount: true, paidAt: true },
        orderBy: { paidAt: "desc" },
      });

      const total = payments.reduce((sum, p) => sum + p.totalAmount, 0);

      // Group by date
      const breakdown: Record<string, number> = {};
      payments.forEach(p => {
        const date = new Date(p.paidAt!).toLocaleDateString("id-ID");
        breakdown[date] = (breakdown[date] || 0) + p.totalAmount;
      });

      return NextResponse.json({
        revenue: {
          total,
          breakdown: Object.entries(breakdown).map(([date, amount]) => ({ date, amount })),
        },
      });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}