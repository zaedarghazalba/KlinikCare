import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "KlinikCare — Sistem Manajemen Klinik Modern",
  description:
    "Platform digital untuk pendaftaran pasien online, manajemen antrean real-time, dan rekam medis elektronik. Solusi lengkap untuk klinik modern.",
  keywords: [
    "klinik",
    "pendaftaran online",
    "rekam medis",
    "antrean",
    "EMR",
    "manajemen klinik",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
