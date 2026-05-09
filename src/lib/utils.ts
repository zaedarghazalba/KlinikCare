import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateMedicalRecordNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `RM-${year}-${random}`;
}

export function getQueueDisplay(num: number): string {
  return num.toString().padStart(3, "0");
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    WAITING: "bg-amber-100 text-amber-800",
    CHECKED_IN: "bg-blue-100 text-blue-800",
    IN_CONSULTATION: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-red-100 text-red-800",
    PENDING: "bg-amber-100 text-amber-800",
    PAID: "bg-emerald-100 text-emerald-800",
    CANCELLED_PAYMENT: "bg-red-100 text-red-800",
    AWAITING_MEDICINE: "bg-orange-100 text-orange-800",
    READY_FOR_PAYMENT: "bg-blue-100 text-blue-800",
    DISPENSED: "bg-emerald-100 text-emerald-800",
  };
  return colors[status] || "bg-gray-100 text-gray--800";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    WAITING: "Menunggu",
    CHECKED_IN: "Check-in",
    IN_CONSULTATION: "Konsultasi",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
    PENDING: "Belum Bayar",
    PAID: "Lunas",
    AWAITING_MEDICINE: "Menunggu Obat",
    READY_FOR_PAYMENT: "Siap Bayar",
    DISPENSED: "Diserahkan",
  };
  return labels[status] || status;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export function getDayName(day: number): string {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[day];
}

export function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `INV-${date}-${random}`;
}

export function generateCertificateNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `SKT-${date}-${random}`;
}
