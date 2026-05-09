import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  cn,
  formatDate,
  formatDateTime,
  generateMedicalRecordNumber,
  getQueueDisplay,
  getStatusColor,
  getStatusLabel,
  getGreeting,
  getDayName,
  formatCurrency,
  generateInvoiceNumber,
  generateCertificateNumber,
} from "../utils"

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("foo", "bar")).toBe("foo bar")
    })

    it("should handle conditional classes", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
    })

    it("should handle undefined and null", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar")
    })
  })

  describe("formatDate", () => {
    it("should format Date object correctly", () => {
      const date = new Date("2024-01-15")
      const formatted = formatDate(date)
      expect(formatted).toContain("15")
      expect(formatted).toContain("Januari")
      expect(formatted).toContain("2024")
    })

    it("should format date string correctly", () => {
      const formatted = formatDate("2024-06-20T10:30:00Z")
      expect(formatted).toContain("20")
      expect(formatted).toContain("Juni")
    })
  })

  describe("formatDateTime", () => {
    it("should format date with time", () => {
      const date = new Date("2024-03-10T14:30:00")
      const formatted = formatDateTime(date)
      expect(formatted).toContain("10")
      expect(formatted).toContain("Maret")
      expect(formatted).toContain("2024")
    })
  })

  describe("generateMedicalRecordNumber", () => {
    it("should generate valid medical record number format", () => {
      const rm = generateMedicalRecordNumber()
      expect(rm).toMatch(/^RM-\d{4}-\d{4}$/)
    })

    it("should include current year", () => {
      const currentYear = new Date().getFullYear()
      const rm = generateMedicalRecordNumber()
      expect(rm).toContain(`RM-${currentYear}`)
    })
  })

  describe("getQueueDisplay", () => {
    it("should pad single digit numbers", () => {
      expect(getQueueDisplay(5)).toBe("005")
    })

    it("should pad two digit numbers", () => {
      expect(getQueueDisplay(42)).toBe("042")
    })

    it("should not pad three digit numbers", () => {
      expect(getQueueDisplay(123)).toBe("123")
    })
  })

  describe("getStatusColor", () => {
    it("should return correct color for WAITING", () => {
      expect(getStatusColor("WAITING")).toBe("bg-amber-100 text-amber-800")
    })

    it("should return correct color for COMPLETED", () => {
      expect(getStatusColor("COMPLETED")).toBe("bg-emerald-100 text-emerald-800")
    })

    it("should return default color for unknown status", () => {
      expect(getStatusColor("UNKNOWN")).toBe("bg-gray-100 text-gray-800")
    })

    it("should handle CANCELLED status", () => {
      expect(getStatusColor("CANCELLED")).toBe("bg-red-100 text-red-800")
    })
  })

  describe("getStatusLabel", () => {
    it("should return Indonesian label for WAITING", () => {
      expect(getStatusLabel("WAITING")).toBe("Menunggu")
    })

    it("should return Indonesian label for CHECKED_IN", () => {
      expect(getStatusLabel("CHECKED_IN")).toBe("Check-in")
    })

    it("should return Indonesian label for IN_CONSULTATION", () => {
      expect(getStatusLabel("IN_CONSULTATION")).toBe("Konsultasi")
    })

    it("should return original status for unknown status", () => {
      expect(getStatusLabel("UNKNOWN_STATUS")).toBe("UNKNOWN_STATUS")
    })
  })

  describe("getGreeting", () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it("should return Selamat Pagi in the morning", () => {
      vi.setSystemTime(new Date(2024, 5, 15, 8, 0))
      expect(getGreeting()).toBe("Selamat Pagi")
    })

    it("should return Selamat Siang around noon", () => {
      vi.setSystemTime(new Date(2024, 5, 15, 13, 0))
      expect(getGreeting()).toBe("Selamat Siang")
    })

    it("should return Selamat Sore in afternoon", () => {
      vi.setSystemTime(new Date(2024, 5, 15, 16, 0))
      expect(getGreeting()).toBe("Selamat Sore")
    })

    it("should return Selamat Malam at night", () => {
      vi.setSystemTime(new Date(2024, 5, 15, 20, 0))
      expect(getGreeting()).toBe("Selamat Malam")
    })
  })

  describe("getDayName", () => {
    it("should return correct day name for sunday (0)", () => {
      expect(getDayName(0)).toBe("sunday")
    })

    it("should return correct day name for monday (1)", () => {
      expect(getDayName(1)).toBe("monday")
    })

    it("should return correct day name for saturday (6)", () => {
      expect(getDayName(6)).toBe("saturday")
    })
  })

  describe("formatCurrency", () => {
    it("should format currency in Indonesian Rupiah", () => {
      expect(formatCurrency(100000)).toBe("Rp 100.000")
    })

    it("should handle small amounts", () => {
      expect(formatCurrency(5000)).toBe("Rp 5.000")
    })

    it("should handle large amounts", () => {
      expect(formatCurrency(1000000)).toBe("Rp 1.000.000")
    })
  })

  describe("generateInvoiceNumber", () => {
    it("should generate valid invoice number format", () => {
      const inv = generateInvoiceNumber()
      expect(inv).toMatch(/^INV-\d{8}-\d{4}$/)
    })
  })

  describe("generateCertificateNumber", () => {
    it("should generate valid certificate number format", () => {
      const skt = generateCertificateNumber()
      expect(skt).toMatch(/^SKT-\d{8}-\d{4}$/)
    })
  })
})
