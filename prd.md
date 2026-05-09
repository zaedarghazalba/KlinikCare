# Product Requirements Document (PRD)
## Sistem Pendaftaran Online dan Rekam Medis Elektronik Klinik

---

## 1. Product Overview

### Nama Produk
**KlinikCare** *(placeholder)*

### Deskripsi
Sistem berbasis **Web + PWA** untuk membantu operasional klinik dalam proses:

- Pendaftaran pasien online
- Manajemen antrean pasien
- Rekam medis elektronik (EMR)
- Resep obat
- Dashboard laporan klinik

### Platform
- Web Application
- Progressive Web App (PWA)

### Tech Stack
- Next.js
- React
- Tailwind CSS
- PostgreSQL
- NextAuth / Clerk
- Vercel / VPS Deployment

---

# 2. Background Problem

Saat ini banyak klinik masih menggunakan proses manual seperti:

- Pendaftaran dilakukan secara langsung di tempat
- Antrean pasien ditulis manual
- Rekam medis menggunakan kertas
- Sulit mencari riwayat pasien lama
- Laporan operasional dibuat manual

### Dampak
- Antrean panjang
- Human error tinggi
- Data pasien mudah hilang
- Operasional lambat

---

# 3. Product Goals

## Business Goals
- Mengurangi waktu pendaftaran pasien
- Mengurangi penggunaan kertas
- Mempercepat pelayanan klinik
- Mempermudah laporan operasional

## User Goals

### Pasien
- Daftar online
- Melihat nomor antrean
- Menghemat waktu tunggu

### Admin
- Verifikasi pasien lebih cepat
- Mengelola antrean dengan mudah

### Dokter
- Akses riwayat pasien cepat
- Input rekam medis digital

### Owner
- Monitoring performa klinik

---

# 4. User Roles

## Pasien
- Register akun
- Booking jadwal
- Melihat antrean

## Admin
- Kelola pasien
- Verifikasi pendaftaran
- Kelola antrean

## Dokter
- Melihat data pasien
- Input rekam medis
- Input resep

## Owner
- Melihat laporan
- Monitoring operasional

---

# 5. Core Features (MVP)

---

## 5.1 Authentication

### Features
- Register pasien
- Login
- Logout
- Forgot password

### Roles
- Patient
- Admin
- Doctor
- Owner

---

# 5.2 Patient Management

Admin dapat:

- Tambah pasien
- Edit pasien
- Hapus pasien
- Cari pasien

### Data Pasien
- Nama
- NIK
- Tgl lahir
- Alamat
- No telepon
- Jenis kelamin
- Riwayat alergi

---

# 5.3 Online Registration

Pasien dapat:

- Pilih dokter
- Pilih poli
- Pilih tanggal
- Pilih jam kunjungan

### Output
- Nomor antrean
- QR check-in

---

# 5.4 Queue Management

Admin dapat:

- Lihat antrean hari ini
- Panggil antrean berikutnya
- Update status antrean

### Queue Status
- Waiting
- Checked In
- In Consultation
- Completed
- Cancelled

---

# 5.5 Electronic Medical Record (EMR)

Dokter dapat input:

- Keluhan
- Diagnosa
- Tindakan
- Obat
- Catatan dokter
- Vital sign

Dokter dapat melihat:

- Riwayat kunjungan sebelumnya

---

# 5.6 Prescription Management

Dokter dapat:

- Menambahkan obat
- Dosis
- Aturan pakai

---

# 5.7 Dashboard

Admin dashboard menampilkan:

- Total pasien hari ini
- Total antrean
- Pasien selesai
- Pasien batal

---

# 5.8 Reports

Owner dapat melihat:

- Laporan harian
- Laporan mingguan
- Laporan bulanan
- Pendapatan
- Jumlah pasien

---

# 6. Future Features

Fitur tahap berikutnya:

- Integrasi BPJS
- Pembayaran online
- WhatsApp notification
- Telemedicine
- Integrasi laboratorium
- Integrasi apotek

---

# 7. User Flow

## Pasien Flow

Register/Login  
→ Pilih jadwal  
→ Daftar  
→ Dapat nomor antrean  
→ Datang ke klinik  
→ Check-in  
→ Konsultasi  
→ Selesai

---

## Admin Flow

Login  
→ Verifikasi pasien  
→ Kelola antrean  
→ Input pasien walk-in

---

## Doctor Flow

Login  
→ Lihat antrean  
→ Buka rekam medis  
→ Input diagnosa  
→ Input resep  
→ Selesai

---

## Owner Flow

Login  
→ Dashboard  
→ Lihat laporan

---

# 8. Functional Requirements

| ID | Requirement |
|------|-------------|
| FR-01 | User authentication |
| FR-02 | Patient registration |
| FR-03 | Appointment booking |
| FR-04 | Queue generation |
| FR-05 | Medical record management |
| FR-06 | Reporting dashboard |

---

# 9. Non Functional Requirements

## Performance
- Response time < 3 detik

## Security
- Role-based access control
- Enkripsi data medis
- Secure authentication

## Availability
- 99% uptime

## Scalability
- Support multi clinic

## Compliance
- Sesuai regulasi data kesehatan Indonesia

---

# 10. Database Entities

## Users
- id
- name
- email
- password
- role

---

## Patients
- id
- medical_record_number
- name
- nik
- birth_date
- gender
- address
- phone_number

---

## Doctors
- id
- name
- specialization

---

## Appointments
- id
- patient_id
- doctor_id
- queue_number
- appointment_date
- status

---

## Medical Records
- id
- patient_id
- doctor_id
- diagnosis
- prescription
- notes

---

## Payments
- id
- appointment_id
- total_amount
- payment_status

---

# 11. API Endpoints

## Auth
- POST `/register`
- POST `/login`

## Patients
- GET `/patients`
- POST `/patients`

## Appointments
- GET `/appointments`
- POST `/appointments`

## Medical Records
- GET `/medical-records`
- POST `/medical-records`

---

# 12. UI Pages

## Public
- Landing page
- Login
- Register

## Patient
- Dashboard
- Booking page
- Queue tracking

## Admin
- Patient management
- Queue dashboard

## Doctor
- EMR dashboard

## Owner
- Reports dashboard

---

# 13. Success Metrics

- Waktu pendaftaran turun 50%
- Penggunaan kertas turun
- Error administrasi turun
- Kepuasan pasien meningkat

---

# 14. Risks

## Risiko
- Kebocoran data medis
- User sulit adaptasi
- Internet tidak stabil

## Mitigasi
- Backup data
- Training staff
- Audit log

---

# 15. AI Agent Development Prompts

Gunakan prompt berikut saat memakai AI agent:

### Generate Project Structure
> Create scalable Next.js app router architecture for clinic management system with patient, admin, doctor, and owner roles.

### Generate Database Schema
> Create PostgreSQL schema for appointment booking and electronic medical records.

### Generate Queue System
> Build real-time queue management system using websocket.

### Generate Authentication
> Create role-based authentication middleware.

### Generate PWA
> Build mobile-friendly PWA booking system for patients.

---

# 16. Suggested Tech Architecture

Frontend:
- Next.js
- React
- Tailwind

Backend:
- Next.js API / NestJS

Database:
- PostgreSQL

Authentication:
- NextAuth / Clerk

Realtime:
- Socket.io / Pusher

Storage:
- Cloud storage

Deployment:
- Vercel 