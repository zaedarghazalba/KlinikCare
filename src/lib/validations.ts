import { z } from "zod";

// Helper to validate date strings (accepts both YYYY-MM-DD and ISO 8601)
const dateStringSchema = z.string().refine(
  (val) => {
    // Accept YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return true;
    // Accept ISO 8601 format
    try {
      new Date(val).toISOString();
      return true;
    } catch {
      return false;
    }
  },
  { message: "Format tanggal tidak valid (gunakan YYYY-MM-DD atau ISO 8601)" }
);

// Patient validations
export const createPatientSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  nik: z.string().length(16, "NIK harus 16 digit"),
  birthDate: dateStringSchema,
  gender: z.enum(["MALE", "FEMALE"], { message: "Jenis kelamin tidak valid" }),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  allergies: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

// Appointment validations
export const createAppointmentSchema = z.object({
  patientId: z.string().cuid({ message: "ID Pasien tidak valid" }),
  doctorId: z.string().cuid({ message: "ID Dokter tidak valid" }),
  appointmentDate: dateStringSchema,
  timeSlot: z.string().min(1, "Time slot harus dipilih"),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(["WAITING", "CHECKED_IN", "IN_CONSULTATION", "COMPLETED", "CANCELLED"]),
});

// Medical Record validations
export const createMedicalRecordSchema = z.object({
  patientId: z.string().cuid({ message: "ID Pasien tidak valid" }),
  appointmentId: z.string().cuid({ message: "ID Appointment tidak valid" }),
  complaint: z.string().min(1, "Keluhan harus diisi"),
  diagnosis: z.string().min(1, "Diagnosis harus diisi"),
  treatment: z.string().min(1, "Tindakan harus diisi"),
  notes: z.string().optional(),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.union([z.number(), z.string().transform(val => parseFloat(val) || undefined)]).optional(),
    temperature: z.union([z.number(), z.string().transform(val => parseFloat(val) || undefined)]).optional(),
    weight: z.union([z.number(), z.string().transform(val => parseFloat(val) || undefined)]).optional(),
    height: z.union([z.number(), z.string().transform(val => parseFloat(val) || undefined)]).optional(),
  }).optional(),
  prescriptions: z.array(z.object({
    medicationName: z.string().min(1, "Nama obat harus diisi"),
    dosage: z.string().min(1, "Dosis harus diisi"),
    instructions: z.string().optional().default(""),
    quantity: z.number().min(1).default(1),
  })).optional(),
});

// Prescription validations
export const updatePrescriptionSchema = z.object({
  id: z.string().cuid({ message: "ID Resep tidak valid" }),
  status: z.enum(["PENDING", "DISPENSED"], { message: "Status tidak valid" }),
});

// Medicine validations
export const createMedicineSchema = z.object({
  name: z.string().min(2, "Nama obat minimal 2 karakter"),
  category: z.string().optional(),
  stock: z.number().min(0).default(0),
  price: z.number().min(0).default(0),
});

export const updateMedicineSchema = createMedicineSchema.partial();

// Billing validations
export const updatePaymentSchema = z.object({
  id: z.string().cuid({ message: "ID Payment tidak valid" }),
  status: z.enum(["PENDING", "AWAITING_MEDICINE", "READY_FOR_PAYMENT", "PAID", "CANCELLED"]).optional(),
  paymentMethod: z.enum(["CASH", "TRANSFER"]).optional(),
});

// Doctor validations
export const createDoctorSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  specialization: z.string().min(2, "Spesialisasi harus diisi"),
  schedule: z.record(z.any(), { message: "Jadwal harus diisi" }),
  dailyQuota: z.number().min(1).max(100).default(20),
  consultationFee: z.number().min(0).default(50000),
  userId: z.string().cuid({ message: "User ID tidak valid" }),
});

// Medical Certificate validations
export const createMedicalCertificateSchema = z.object({
  medicalRecordId: z.string().cuid({ message: "ID Rekam Medis tidak valid" }),
  restDays: z.number().min(1, "Minimal 1 hari istirahat"),
  startDate: dateStringSchema,
  diagnosis: z.string().min(1, "Diagnosis harus diisi"),
  notes: z.string().optional(),
});

// Query params validations
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const dateRangeSchema = z.object({
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
});
