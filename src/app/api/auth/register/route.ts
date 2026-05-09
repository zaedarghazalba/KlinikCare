import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { authRateLimit } from "@/lib/rate-limit";

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const passwordSchema = z.string()
  .min(8, "Password minimal 8 karakter")
  .refine(val => /[A-Z]/.test(val), { message: "Password harus memiliki huruf besar" })
  .refine(val => /[a-z]/.test(val), { message: "Password harus memiliki huruf kecil" })
  .refine(val => /\d/.test(val), { message: "Password harus memiliki angka" })
  .refine(val => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), { message: "Password harus memiliki karakter khusus (!@#$%^&* dll)" });

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon tidak valid"),
  password: passwordSchema,
  nik: z.string().min(16, "NIK minimal 16 digit"),
  birthDate: z.string().min(1, "Tanggal lahir harus diisi"),
  gender: z.enum(["MALE", "FEMALE"]),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
});

export async function POST(req: Request) {
  try {
    const rateLimitResult = await authRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const existingNik = await prisma.patient.findUnique({ where: { nik: data.nik } });
    if (existingNik) {
      return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await hash(data.password, 12);
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "PATIENT",
      },
    });

    const year = new Date().getFullYear();
    const count = await prisma.patient.count();
    const mrn = `RM-${year}-${(count + 1).toString().padStart(4, "0")}`;

    await prisma.patient.create({
      data: {
        name: data.name,
        nik: data.nik,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        address: data.address,
        phone: data.phone,
        userId: user.id,
        medicalRecordNumber: mrn,
      },
    });

    return NextResponse.json({ message: "Registrasi berhasil", userId: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}