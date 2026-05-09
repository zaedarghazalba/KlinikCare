import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createPatientSchema, paginationSchema } from "@/lib/validations";
import { apiRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const rateLimitResult = await apiRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    console.log("GET patients - role:", session.user.role);

    // Role-based filtering
    let baseWhere: Record<string, unknown> = {};
    
    if (session.user.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session.user.id } });
      baseWhere = patient ? { id: patient.id } : { id: "none" };
    } else if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({ where: { userId: session.user.id } });
      baseWhere = doctor ? { doctorId: doctor.id } : { id: "none" };
    }

    let where: Record<string, unknown>;
    if (search) {
      where = search ? { 
        ...baseWhere, 
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { nik: { contains: search } },
          { medicalRecordNumber: { contains: search } },
          { phone: { contains: search } },
        ]
      } : baseWhere;
    } else {
      where = baseWhere;
    }

    console.log("Patients where:", JSON.stringify(where));

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { appointments: true, medicalRecords: true } } },
      }),
      prisma.patient.count({ where }),
    ]);

    return NextResponse.json({ patients, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.errors);
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("API patients error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rateLimitResult = await apiRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createPatientSchema.parse(body);

    const existing = await prisma.patient.findUnique({ where: { nik: validated.nik } });
    if (existing) return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 400 });

    // Generate MRN based on year + sequential
    const year = new Date().getFullYear();
    const prefix = `RM-${year}-`;
    
    // Get last patient with this year's MRN
    const lastPatient = await prisma.patient.findFirst({
      where: { medicalRecordNumber: { startsWith: prefix } },
      orderBy: { medicalRecordNumber: "desc" },
    });
    
    let nextNum = 1;
    if (lastPatient?.medicalRecordNumber) {
      const lastNum = parseInt(lastPatient.medicalRecordNumber.replace(prefix, ""));
      nextNum = lastNum + 1;
    }
    const mrn = `${prefix}${nextNum.toString().padStart(4, "0")}`;

    const patient = await prisma.patient.create({
      data: {
        medicalRecordNumber: mrn,
        ...validated,
        birthDate: new Date(validated.birthDate),
      },
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error creating patient:", error);
    return NextResponse.json({ error: "Gagal membuat pasien" }, { status: 500 });
  }
}