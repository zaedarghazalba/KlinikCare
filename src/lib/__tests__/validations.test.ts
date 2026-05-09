import { describe, it, expect } from "vitest"
import {
  createPatientSchema,
  updatePatientSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  createMedicalRecordSchema,
  updatePrescriptionSchema,
  createMedicineSchema,
  updateMedicineSchema,
  updatePaymentSchema,
  createDoctorSchema,
  createMedicalCertificateSchema,
  paginationSchema,
  dateRangeSchema,
} from "../validations"

describe("validations", () => {
  describe("createPatientSchema", () => {
    it("should validate valid patient data", () => {
      const validData = {
        name: "John Doe",
        nik: "1234567890123456",
        birthDate: "2000-01-01T00:00:00.000Z",
        gender: "MALE",
        address: "Jl. Test No. 123",
        phone: "081234567890",
      }

      const result = createPatientSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject name shorter than 2 characters", () => {
      const invalidData = {
        name: "J",
        nik: "1234567890123456",
        birthDate: "2000-01-01T00:00:00.000Z",
        gender: "MALE",
        address: "Jl. Test No. 123",
        phone: "081234567890",
      }

      const result = createPatientSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Nama minimal 2 karakter")
      }
    })

    it("should reject NIK not 16 digits", () => {
      const invalidData = {
        name: "John Doe",
        nik: "12345",
        birthDate: "2000-01-01T00:00:00.000Z",
        gender: "MALE",
        address: "Jl. Test No. 123",
        phone: "081234567890",
      }

      const result = createPatientSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject invalid gender", () => {
      const invalidData = {
        name: "John Doe",
        nik: "1234567890123456",
        birthDate: "2000-01-01T00:00:00.000Z",
        gender: "INVALID",
        address: "Jl. Test No. 123",
        phone: "081234567890",
      }

      const result = createPatientSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should accept optional allergies", () => {
      const dataWithAllergies = {
        name: "John Doe",
        nik: "1234567890123456",
        birthDate: "2000-01-01T00:00:00.000Z",
        gender: "MALE",
        address: "Jl. Test No. 123",
        phone: "081234567890",
        allergies: "Peanuts, Shellfish",
      }

      const result = createPatientSchema.safeParse(dataWithAllergies)
      expect(result.success).toBe(true)
    })
  })

  describe("updatePatientSchema", () => {
    it("should allow partial updates", () => {
      const partialData = { name: "Jane Doe" }
      const result = updatePatientSchema.safeParse(partialData)
      expect(result.success).toBe(true)
    })
  })

  describe("createAppointmentSchema", () => {
    it("should validate valid appointment data", () => {
      const validData = {
        patientId: "cm1234567890",
        doctorId: "cm0987654321",
        appointmentDate: "2024-06-15T10:00:00.000Z",
        timeSlot: "10:00-10:30",
      }

      const result = createAppointmentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid CUID for patientId", () => {
      const invalidData = {
        patientId: "invalid-id",
        doctorId: "cm0987654321",
        appointmentDate: "2024-06-15T10:00:00.000Z",
        timeSlot: "10:00-10:30",
      }

      const result = createAppointmentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("updateAppointmentSchema", () => {
    it("should validate valid status update", () => {
      const validData = { status: "COMPLETED" }
      const result = updateAppointmentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid status", () => {
      const invalidData = { status: "INVALID_STATUS" }
      const result = updateAppointmentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("createMedicalRecordSchema", () => {
    it("should validate valid medical record with prescriptions", () => {
      const validData = {
        patientId: "cm1234567890",
        appointmentId: "cm0987654321",
        complaint: "Sakit kepala",
        diagnosis: "Migrain",
        treatment: "Istirahat",
        prescriptions: [
          {
            medicationName: "Paracetamol",
            dosage: "500mg",
            instructions: "3x sehari",
            quantity: 10,
          },
        ],
      }

      const result = createMedicalRecordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should require complaint, diagnosis, and treatment", () => {
      const invalidData = {
        patientId: "cm1234567890",
        appointmentId: "cm0987654321",
      }

      const result = createMedicalRecordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("updatePrescriptionSchema", () => {
    it("should validate valid prescription update", () => {
      const validData = {
        id: "cm1234567890",
        status: "DISPENSED",
      }

      const result = updatePrescriptionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid status", () => {
      const invalidData = {
        id: "cm1234567890",
        status: "INVALID",
      }

      const result = updatePrescriptionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("createMedicineSchema", () => {
    it("should validate valid medicine data", () => {
      const validData = {
        name: "Paracetamol",
        category: "Analgesic",
        stock: 100,
        price: 5000,
      }

      const result = createMedicineSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should use default values", () => {
      const data = { name: "Paracetamol" }
      const result = createMedicineSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.stock).toBe(0)
        expect(result.data.price).toBe(0)
      }
    })
  })

  describe("updateMedicineSchema", () => {
    it("should allow partial updates", () => {
      const partialData = { price: 10000 }
      const result = updateMedicineSchema.safeParse(partialData)
      expect(result.success).toBe(true)
    })
  })

  describe("updatePaymentSchema", () => {
    it("should validate valid payment update", () => {
      const validData = {
        status: "PAID",
        paymentMethod: "TRANSFER",
      }

      const result = updatePaymentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should accept CASH payment method", () => {
      const validData = {
        status: "PAID",
        paymentMethod: "CASH",
      }

      const result = updatePaymentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe("createDoctorSchema", () => {
    it("should validate valid doctor data", () => {
      const validData = {
        name: "Dr. Smith",
        specialization: "Cardiology",
        schedule: { monday: ["08:00-12:00"] },
        dailyQuota: 20,
        consultationFee: 150000,
        userId: "cm1234567890",
      }

      const result = createDoctorSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject quota over 100", () => {
      const invalidData = {
        name: "Dr. Smith",
        specialization: "Cardiology",
        schedule: {},
        dailyQuota: 150,
        userId: "cm1234567890",
      }

      const result = createDoctorSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("createMedicalCertificateSchema", () => {
    it("should validate valid certificate data", () => {
      const validData = {
        medicalRecordId: "cm1234567890",
        restDays: 3,
        startDate: "2024-06-15T00:00:00.000Z",
        endDate: "2024-06-18T00:00:00.000Z",
        diagnosis: "Flu",
      }

      const result = createMedicalCertificateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should require minimum 1 rest day", () => {
      const invalidData = {
        medicalRecordId: "cm1234567890",
        restDays: 0,
        startDate: "2024-06-15T00:00:00.000Z",
        endDate: "2024-06-18T00:00:00.000Z",
        diagnosis: "Flu",
      }

      const result = createMedicalCertificateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("paginationSchema", () => {
    it("should parse string numbers to numbers", () => {
      const data = { page: "2", limit: "20" }
      const result = paginationSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(20)
      }
    })

    it("should use default values", () => {
      const data = {}
      const result = paginationSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(10)
      }
    })

    it("should reject limit over 100", () => {
      const data = { limit: "200" }
      const result = paginationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe("dateRangeSchema", () => {
    it("should validate valid date range", () => {
      const data = {
        startDate: "2024-06-01T00:00:00.000Z",
        endDate: "2024-06-30T23:59:59.999Z",
      }

      const result = dateRangeSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it("should allow optional dates", () => {
      const data = {}
      const result = dateRangeSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})
