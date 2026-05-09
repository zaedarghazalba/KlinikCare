import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { apiRateLimit } from "@/lib/rate-limit";

const billingQuerySchema = z.object({
  status: z.enum(["PENDING", "AWAITING_MEDICINE", "READY_FOR_PAYMENT", "PAID", "CANCELLED"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  treatmentId: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const rateLimitResult = await apiRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  const { searchParams } = new URL(req.url);
  const getParam = (key: string) => searchParams.get(key) ?? undefined;
  const { status, dateFrom, dateTo, search, page, limit, patientId, appointmentId } = billingQuerySchema.parse({
    status: getParam("status"),
    dateFrom: getParam("dateFrom"),
    dateTo: getParam("dateTo"),
    search: getParam("search"),
    page: getParam("page"),
    limit: getParam("limit"),
    patientId: getParam("patientId"),
    appointmentId: getParam("appointmentId"),
  });

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (appointmentId) where.appointmentId = appointmentId;

    if (patientId) {
      where.appointment = { patientId };
    }

    if (dateFrom || dateTo) {
      const dateWhere: Record<string, unknown> = {};
      if (dateFrom) dateWhere.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateWhere.lte = end;
      }
      where.createdAt = dateWhere;
    }

    const includeData = {
      appointment: {
        include: {
          patient: true,
          doctor: true,
          medicalRecord: {
            include: {
              prescriptions: {
                include: {
                  medicine: true,
                },
              },
            },
          },
        },
      },
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: includeData,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    console.log("Billing query result:", payments.length, "total:", total);

    // Filter by search in application layer for Turbopack compatibility
    let filteredPayments = payments;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPayments = payments.filter(p =>
        p.invoiceNumber.toLowerCase().includes(searchLower) ||
        p.appointment.patient.name.toLowerCase().includes(searchLower) ||
        p.appointment.doctor.name.toLowerCase().includes(searchLower)
      );
    }

    // Calculate correct total for each payment (consultation fee + medicines)
    const paymentsWithCorrectTotal = filteredPayments.map((p) => {
      const consultationFee = p.appointment.doctor?.consultationFee || 150000;
      let medicineTotal = 0;
      
      if (p.appointment.medicalRecord?.prescriptions) {
        medicineTotal = p.appointment.medicalRecord.prescriptions.reduce(
          (sum: number, rx: { unitPrice: number; quantity: number }) => sum + (rx.unitPrice * rx.quantity), 0
        );
      }
      
      const correctTotal = consultationFee + medicineTotal;
      
      return {
        ...p,
        totalAmount: correctTotal,
      };
    });

    // Update payment records in DB to have correct total
    await Promise.all(
      paymentsWithCorrectTotal.map(async (p) => {
        await prisma.payment.update({
          where: { id: p.id },
          data: { totalAmount: p.totalAmount },
        }).catch(() => {}); // Ignore errors
      })
    );

    // Get summary stats using groupBy for efficiency
    const stats = await prisma.payment.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Calculate todayPaid with correct total (consultation + medicines)
    const todayPayments = await prisma.payment.findMany({
      where: {
        status: "PAID",
        paidAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        appointment: {
          include: {
            doctor: true,
            medicalRecord: {
              include: { prescriptions: true },
            },
          },
        },
      },
    });

    const todayPaidTotal = todayPayments.reduce((sum, p) => {
      const consultationFee = p.appointment.doctor?.consultationFee || 150000;
      let medicineTotal = 0;
      if (p.appointment.medicalRecord?.prescriptions) {
        medicineTotal = p.appointment.medicalRecord.prescriptions.reduce(
          (s: number, rx: { unitPrice: number; quantity: number }) => s + (rx.unitPrice * rx.quantity), 0
        );
      }
      return sum + consultationFee + medicineTotal;
    }, 0);

    const pendingCount = stats.find((s: { status: string; _count: { status: number } }) => s.status === "PENDING")?._count.status || 0;
    const paidCount = stats.find((s: { status: string; _count: { status: number } }) => s.status === "PAID")?._count.status || 0;
    const awaitingMedicineCount = stats.find((s: { status: string; _count: { status: number } }) => s.status === "AWAITING_MEDICINE")?._count.status || 0;
    const readyForPaymentCount = stats.find((s: { status: string; _count: { status: number } }) => s.status === "READY_FOR_PAYMENT")?._count.status || 0;

    return NextResponse.json({
      invoices: paymentsWithCorrectTotal,
      total: search ? paymentsWithCorrectTotal.length : total,
      page,
      totalPages: Math.ceil((search ? paymentsWithCorrectTotal.length : total) / limit),
      pendingCount,
      paidCount,
      todayPaid: todayPaidTotal,
      awaitingMedicineCount,
      readyForPaymentCount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
