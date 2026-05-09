# KlinikCare - Sistem Manajemen Klinik Modern

Sistem manajemen klinik berbasis web yang modern dan efisien untuk membantu operasional klinik dalam proses pendaftaran pasien, manajemen antrean, rekam medis elektronik, dan laporan operasional.

## 🏥 Fitur Utama

### 1. Autentikasi & Manajemen Pengguna
- Login dan register untuk pasien
- Role-based access control (PATIENT, ADMIN, DOCTOR, OWNER, PHARMACY)
- NextAuth v5 untuk keamanan autentikasi
- Rate limiting untuk mencegah brute force

### 2. Manajemen Pasien
- Pendaftaran pasien online
- Database pasien lengkap (NIK, tanggal lahir, alamat, telepon, alergi)
- Pencarian dan pengelolaan data pasien
- Riwayat kunjungan pasien

### 3. Sistem Antrean
- Nomor antrean otomatis
- Status antrean real-time (WAITING, CHECKED_IN, IN_CONSULTATION, COMPLETED, CANCELLED)
- Monitoring antrean untuk admin dan dokter
- Pasien dapat melihat antrean mereka

### 4. Rekam Medis Elektronik (EMR)
- Input rekam medis digital oleh dokter
- Data vital signs (tensi, detak jantung, suhu, berat, tinggi)
- Diagnosis dan tindakan medis
- Riwayat rekam medis pasien

### 5. Resep Obat & Apotek
- Dokter dapat membuat resep digital
- Apoteker dapat memverifikasi dan menyerahkan obat
- Manajemen stok obat
- Status resep (PENDING, DISPENSED)

### 6. Billing & Pembayaran
- Tagihan otomatis setelah konsultasi
- Status pembayaran (PENDING, PAID, CANCELLED)
- Metode pembayaran: CASH dan TRANSFER
- Generate nomor invoice otomatis

### 7. Laporan & Analytics
- Dashboard untuk owner
- Laporan harian, mingguan, bulanan
- Analytics kunjungan pasien
- Performa dokter dan klinik

### 8. Surat Keterangan Medis
- Generate surat sakit digital
- Nomor sertifikat otomatis (SKT-YYYYMMDD-XXXX)
- Durasi istirahat dokter

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL dengan Prisma ORM 6
- **Authentication**: NextAuth v5 (beta)
- **Validation**: Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Vitest, Testing Library

## 📋 Prasyarat

- Node.js 18.x atau 20.x LTS
- PostgreSQL 14+
- npm atau pnpm

## 🚀 Cara Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd Eklick
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```
Edit file `.env` dengan konfigurasi database dan auth:
```
DATABASE_URL="postgresql://user:password@localhost:5432/klinikcare"
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database
```bash
# Push schema ke database
npm run db:push

# Atau gunakan migrations
npx prisma migrate dev --name init

# Seed data awal
npm run db:seed
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Project

```
src/
├── app/
│   ├── (auth)/              # Login & Register
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Role-based dashboards
│   │   ├── admin/
│   │   ├── doctor/
│   │   ├── patient/
│   │   ├── owner/
│   │   └── pharmacy/
│   ├── api/                 # API Routes
│   │   ├── appointments/
│   │   ├── auth/
│   │   ├── billing/
│   │   ├── doctors/
│   │   ├── medical-certificates/
│   │   ├── medical-records/
│   │   ├── medicines/
│   │   ├── patients/
│   │   ├── prescriptions/
│   │   └── reports/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles
│   ├── error.tsx            # Global error page
│   └── not-found.tsx       # 404 page
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── providers.tsx
│   └── socket-provider.tsx
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── audit.ts             # Audit logging
│   ├── db.ts                # Prisma client
│   ├── rate-limit.ts        # API rate limiting
│   ├── utils.ts             # Helper functions
│   └── validations.ts       # Zod schemas
└── types/
    └── next-auth.d.ts       # NextAuth type extensions
```

## 👥 User Roles

### Pasien (PATIENT)
- Daftar online dan booking jadwal
- Melihat nomor antrean
- Melihat riwayat medis

### Admin (ADMIN)
- Kelola data pasien
- Kelola antrean klinik
- Manajemen billing
- Atur jadwal dokter

### Dokter (DOCTOR)
- Melihat antrean pasien
- Input rekam medis elektronik
- Buat resep obat digital
- Generate surat keterangan medis

### Pemilik (OWNER)
- Melihat laporan operasional
- Monitoring performa klinik
- Pengaturan klinik

### Apoteker (PHARMACY)
- Melihat resep obat yang masuk
- Verifikasi dan serahkan obat
- Update status resep

## 🧪 Testing

### Menjalankan Tests
```bash
# Run tests sekali
npm run test:run

# Run tests dengan watch mode
npm run test

# Run tests dengan coverage
npm run test:coverage
```

### Test Structure
- `src/lib/__tests__/utils.test.ts` - Test helper functions
- `src/lib/__tests__/validations.test.ts` - Test Zod validations
- `src/lib/__tests__/rate-limit.test.ts` - Test rate limiting
- `src/components/__tests__/Header.test.tsx` - Test Header component
- `src/components/__tests__/Sidebar.test.tsx` - Test Sidebar component

## 📄 Error Pages

Sistem sudah dilengkapi dengan error pages yang user-friendly:
- `/error.tsx` - Global error boundary
- `/not-found.tsx` - 404 page
- `/(dashboard)/error.tsx` - Dashboard error boundary
- `/(dashboard)/not-found.tsx` - Dashboard 404
- `/(dashboard)/loading.tsx` - Loading skeleton
- `/(auth)/error.tsx` - Auth error boundary

Semua halaman menggunakan Bahasa Indonesia dan mengikuti tema KlinikCare.

## 🗄️ Database Schema

13 model utama:
- User, Patient, Doctor
- Appointment, MedicalRecord, Prescription
- Medicine, Payment, MedicalCertificate
- ClinicSettings, AuditLog
- Session, Account (NextAuth)

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients` | GET, POST | Manajemen pasien |
| `/api/appointments` | GET, POST | Manajemen janji temu |
| `/api/medical-records` | GET, POST | Rekam medis |
| `/api/prescriptions` | GET, PATCH | Resep obat |
| `/api/medicines` | GET, POST | Manajemen obat |
| `/api/billing` | GET, PATCH | Pembayaran |
| `/api/reports` | GET | Laporan untuk owner |
| `/api/medical-certificates` | GET, POST | Surat keterangan medis |

## 🚢 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository di Vercel
3. Set environment variables
4. Deploy

### Manual Deployment
```bash
npm run build
npm run start
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | NextAuth secret key | Yes |
| `AUTH_URL` | NextAuth URL | Yes |
| `NEXT_PUBLIC_APP_URL` | App public URL | Yes |

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

Untuk bantuan teknis, silakan hubungi tim development.

---

**KlinikCare** - Modernisasi operasional klinik Anda 🏥✨
