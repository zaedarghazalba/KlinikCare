import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hash } from "bcryptjs";
import { createDoctorSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doctors = await prisma.doctor.findMany({
      include: { user: { select: { email: true, image: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, ...doctorData } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validated = createDoctorSchema.parse({ ...doctorData, name });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const newDoctor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DOCTOR",
        doctor: {
          create: {
            ...validated,
            schedule: validated.schedule || {
              monday: ["08:00", "09:00", "10:00"],
              tuesday: ["08:00", "09:00", "10:00"],
              wednesday: ["08:00", "09:00", "10:00"],
              thursday: ["08:00", "09:00", "10:00"],
              friday: ["08:00", "09:00", "10:00"]
            }
          }
        }
      },
      include: { doctor: true }
    });

    return NextResponse.json({ message: "Doctor created successfully", doctor: newDoctor.doctor }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
