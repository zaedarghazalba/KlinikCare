import { PrismaClient, Role, Gender } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const schedule = {
  monday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00"],
  tuesday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00"],
  wednesday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00"],
  thursday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00"],
  friday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00"],
};

async function main() {
  console.log("🌱 Seeding database - accounts only...");

  console.log("🧹 Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.medicalCertificate.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinicSettings.deleteMany();
  console.log("✅ Data cleaned");

  console.log("⚙️ Creating clinic settings...");
  await prisma.clinicSettings.create({
    data: {
      clinicName: "KlinikCare",
      address: "Jl. Merdeka Raya No. 123, Jakarta Selatan",
      phone: "021-5550123",
      operatingHours: { open: "08:00", close: "17:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] },
    },
  });
  console.log("✅ Clinic settings created");

  const password = await hash("password123", 12);

  console.log("👤 Creating owner...");
  const ownerUser = await prisma.user.create({
    data: { name: "Dr. Ahmad Hidayat", email: "owner@klinikcare.com", password, role: Role.OWNER },
  });
  console.log("✅ Owner:", ownerUser.email);

  console.log("👤 Creating admin...");
  const adminUser = await prisma.user.create({
    data: { name: "Siti Nurhaliza", email: "admin@klinikcare.com", password, role: Role.ADMIN },
  });
  console.log("✅ Admin:", adminUser.email);

  console.log("👨‍⚕️ Creating doctors...");
  const doctor1User = await prisma.user.create({
    data: { name: "Dr. Sarah Wijaya", email: "dr.sarah@klinikcare.com", password, role: Role.DOCTOR },
  });
  await prisma.doctor.create({
    data: { name: "Dr. Sarah Wijaya", specialization: "Penyakit Dalam", userId: doctor1User.id, consultationFee: 150000, schedule, dailyQuota: 20 },
  });
  console.log("✅ Doctor:", doctor1User.email);

  const doctor2User = await prisma.user.create({
    data: { name: "Dr. Budi Santoso", email: "dr.budi@klinikcare.com", password, role: Role.DOCTOR },
  });
  await prisma.doctor.create({
    data: { name: "Dr. Budi Santoso", specialization: "Bedah Umum", userId: doctor2User.id, consultationFee: 150000, schedule, dailyQuota: 20 },
  });
  console.log("✅ Doctor:", doctor2User.email);

  const doctor3User = await prisma.user.create({
    data: { name: "Dr. Rina Putri", email: "dr.rina@klinikcare.com", password, role: Role.DOCTOR },
  });
  await prisma.doctor.create({
    data: { name: "Dr. Rina Putri", specialization: "Anak", userId: doctor3User.id, consultationFee: 150000, schedule, dailyQuota: 20 },
  });
  console.log("✅ Doctor:", doctor3User.email);

  console.log("💊 Creating pharmacy user...");
  const pharmacyUser = await prisma.user.create({
    data: { name: "Apt. Sari Melati", email: "apoteker@gmail.com", password, role: Role.PHARMACY },
  });
  console.log("✅ Pharmacy:", pharmacyUser.email);

  console.log("👥 Creating patients...");
  const patient1User = await prisma.user.create({
    data: { name: "Andi Pratama", email: "andi@gmail.com", password, role: Role.PATIENT },
  });
  await prisma.patient.create({
    data: { medicalRecordNumber: "RM-2026-0001", name: "Andi Pratama", nik: "3507112301900001", gender: Gender.MALE, birthDate: new Date("1990-01-23"), address: "Jl. Mawar No. 15", phone: "08123456789", userId: patient1User.id },
  });
  console.log("✅ Patient:", patient1User.email);

  const patient2User = await prisma.user.create({
    data: { name: "Dewi Lestari", email: "dewi@gmail.com", password, role: Role.PATIENT },
  });
  await prisma.patient.create({
    data: { medicalRecordNumber: "RM-2026-0002", name: "Dewi Lestari", nik: "3507124505920002", gender: Gender.FEMALE, birthDate: new Date("1992-05-15"), address: "Jl. Melati No. 20", phone: "081298765432", userId: patient2User.id },
  });
  console.log("✅ Patient:", patient2User.email);

  console.log("💊 Creating medicines...");
  await prisma.medicine.create({ data: { name: "Paracetamol 500mg", category: "Analgesik", stock: 500, price: 5000 } });
  await prisma.medicine.create({ data: { name: "Amoxilin 500mg", category: "Antibiotik", stock: 300, price: 15000 } });
  await prisma.medicine.create({ data: { name: "CTM 60ml", category: "Obat Batuk", stock: 200, price: 12000 } });
  await prisma.medicine.create({ data: { name: "Salep Hydrocortisone", category: "Kortikosteroid", stock: 150, price: 18000 } });
  await prisma.medicine.create({ data: { name: "Vitamin C 100mg", category: "Vitamin", stock: 400, price: 8000 } });
  console.log("✅ Medicines created");

  console.log("\n🎉 SEED COMPLETED!");
  console.log("\n📋 Demo Accounts (password: password123):");
  console.log("  Owner: owner@klinikcare.com");
  console.log("  Admin: admin@klinikcare.com");
  console.log("  Apoteker: apoteker@gmail.com");
  console.log("  Doctor: dr.sarah@klinikcare.com, dr.budi@klinikcare.com, dr.rina@klinikcare.com");
  console.log("  Patient: andi@gmail.com, dewi@gmail.com");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());