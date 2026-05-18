import type { Metadata } from "next"
import { Outfit, Source_Sans_3 } from "next/font/google"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
})

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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${outfit.variable} ${sourceSans.variable} font-body antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
