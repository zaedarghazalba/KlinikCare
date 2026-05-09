import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hash } from "bcryptjs";
import { z } from "zod";

const createStaffSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "DOCTOR", "PHARMACY", "OWNER"]),
  specialization: z.string().optional(),
  consultationFee: z.number().optional(),
});

const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["ADMIN", "DOCTOR", "PHARMACY", "OWNER"]).optional(),
  specialization: z.string().optional(),
  consultationFee: z.number().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      role: { not: "PATIENT" },
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          doctor: {
            select: {
              specialization: true,
              consultationFee: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      staff: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json({ error: "Gagal mengambil data staff" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createStaffSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    if (data.role === "DOCTOR") {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          name: data.name,
          specialization: data.specialization || "Umum",
          consultationFee: data.consultationFee || 50000,
          schedule: {},
        },
      });
    }

    return NextResponse.json(
      { message: "Staff berhasil ditambahkan", staffId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error creating staff:", error);
    return NextResponse.json({ error: "Gagal membuat staff" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    const body = await req.json();
    const data = updateStaffSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
      },
    });

    if (data.role === "DOCTOR" || data.specialization || data.consultationFee) {
      await prisma.doctor.upsert({
        where: { userId: id },
        create: {
          userId: id,
          name: user.name,
          specialization: data.specialization || "Umum",
          consultationFee: data.consultationFee || 50000,
          schedule: {},
        },
        update: {
          specialization: data.specialization,
          consultationFee: data.consultationFee,
        },
      });
    }

    return NextResponse.json({ message: "Staff berhasil diperbarui" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error updating staff:", error);
    return NextResponse.json({ error: "Gagal memperbarui staff" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    console.log("Delete request for ID:", id);

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    console.log("User found:", user);

    if (!user) {
      return NextResponse.json({ error: "Staff tidak ditemukan" }, { status: 404 });
    }

    if (user.role === "PATIENT") {
      return NextResponse.json({ error: "Tidak dapat menghapus pasien melalui menu ini" }, { status: 400 });
    }

    // Delete related records first (doctor, etc)
    if (user.role === "DOCTOR") {
      await prisma.doctor.deleteMany({ where: { userId: id } }).catch(() => {});
    }

    await prisma.user.delete({ where: { id } });
    console.log("User deleted:", id);

    return NextResponse.json({ message: "Staff berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json({ error: "Gagal menghapus staff" }, { status: 500 });
  }
}