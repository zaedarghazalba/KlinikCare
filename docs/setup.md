# Panduan Setup KlinikCare

Dokumen ini menjelaskan cara menyiapkan dan menjalankan proyek KlinikCare di lingkungan lokal.

## 📋 Prasyarat

Pastikan sistem Anda memenuhi persyaratan berikut:

- **Node.js** 18.x atau 20.x LTS ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** 9+ atau **pnpm** 8+
- **Git** ([Download](https://git-scm.com/))

## 🚀 Langkah-langkah Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd Eklick
```

### 2. Install Dependencies

Gunakan npm:
```bash
npm install
```

Atau gunakan pnpm (lebih cepat):
```bash
pnpm install
```

### 3. Konfigurasi Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Kemudian edit file `.env` dan sesuaikan dengan konfigurasi lokal Anda:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/klinikcare?schema=public"

# NextAuth
AUTH_SECRET="generate-with-openssl-rand-hex-32"
AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Menghasilkan AUTH_SECRET

Gunakan perintah berikut untuk menghasilkan secret yang aman:

```bash
openssl rand -hex 32
```

Atau gunakan online generator: https://generate-secret.vercel.app/32

### 4. Setup Database

#### Menggunakan Prisma DB Push (Cepat untuk development)

```bash
npm run db:push
```

#### Menggunakan Migrations (Direkomasikan untuk production)

```bash
npx prisma migrate dev --name init
```

#### Mengisi Data Awal (Seed)

```bash
npm run db:seed
```

Data yang akan diisi:
- User admin default
- Dokter contoh
- Data obat dasar

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 🗄️ Database Management

### Mengakses Prisma Studio (GUI Database)

```bash
npm run db:studio
```

Prisma Studio akan terbuka di [http://localhost:5555](http://localhost:5555)

### Reset Database

```bash
# Hapus semua data dan migrasi
npx prisma migrate reset

# Push schema baru
npm run db:push
```

### Melihat Database Schema

Buka file `prisma/schema.prisma` untuk melihat struktur database lengkap.

## 👤 Akun Default Setelah Seed

Setelah menjalankan seed, Anda dapat login dengan akun berikut:

| Role | Email | Password | Keterangan |
|------|--------|-----------|-------------|
| Admin | admin@klinikcare.com | admin123 | Akses penuh admin |
| Dokter | dr.smith@klinikcare.com | doctor123 | Contoh dokter |
| Pasien | patient@example.com | patient123 | Contoh pasien |

*Catatan: Ganti dengan kredensial yang sebenarnya sesuai seed script*

## 🔧 Troubleshooting

### Error: "P1001: Can't reach database server"

Pastikan PostgreSQL berjalan dan `DATABASE_URL` benar.

Cek status PostgreSQL:
```bash
# Windows
pg_isready

# Atau cek service
sc query postgresql
```

### Error: "Unknown Prisma Client"

Jalankan generate ulang:
```bash
npx prisma generate
```

### Error: "Port 3000 already in use"

Ubah port di `package.json` atau gunakan:
```bash
npm run dev -- -p 3001
```

### Error saat instalasi dependencies

Coba hapus `node_modules` dan `package-lock.json`:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📦 Production Build

Untuk melakukan build production:

```bash
npm run build
```

Jalankan hasil build:
```bash
npm run start
```

## 🔒 Environment Variables untuk Production

Pastikan untuk mengubah environment variables saat deploy ke production:

```env
DATABASE_URL="postgresql://user:pass@prod-db:5432/klinikcare"
AUTH_SECRET="production-secret-key"
AUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## 📚 Referensi

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org/getting-started)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Jika mengalami kendala lain, silakan buat issue di repository atau hubungi tim development.
