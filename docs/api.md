# Dokumentasi API KlinikCare

Dokumen ini menjelaskan API endpoints yang tersedia di sistem KlinikCare.

## 📋 Overview

- **Base URL**: `http://localhost:3000/api`
- **Authentication**: Required (NextAuth session)
- **Content-Type**: `application/json`
- **Rate Limiting**: Enabled (100 req/min for API, 5 req/15min for auth)

## 🔐 Authentication

Semua API endpoints (kecuali `/api/auth/*`) memerlukan authentication.

### Mendapatkan Session

```bash
# Check session status
GET /api/auth/session
```

Response:
```json
{
  "user": {
    "id": "cm1234567890",
    "name": "Dr. Smith",
    "email": "dr.smith@klinikcare.com",
    "role": "DOCTOR"
  },
  "expires": "2024-12-31T23:59:59.999Z"
}
```

## 👥 Patients API

### GET /api/patients

Mendapatkan daftar pasien dengan pagination dan search.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `search` (string, optional) - Search by name or NIK

**Headers:**
```
Authorization: Bearer <session-token> (handled by NextAuth)
```

**Response:**
```json
{
  "patients": [
    {
      "id": "cm1234567890",
      "name": "John Doe",
      "nik": "1234567890123456",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "gender": "MALE",
      "address": "Jl. Test No. 123",
      "phone": "081234567890",
      "allergies": "Peanuts",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### POST /api/patients

Membuat data pasien baru (Admin only).

**Request Body:**
```json
{
  "name": "Jane Doe",
  "nik": "1234567890123457",
  "birthDate": "1995-05-15T00:00:00.000Z",
  "gender": "FEMALE",
  "address": "Jl. Example No. 456",
  "phone": "081234567891",
  "allergies": "Seafood"
}
```

**Response:** (201 Created)
```json
{
  "id": "cm0987654321",
  "name": "Jane Doe",
  "nik": "1234567890123457",
  ...
}
```

### GET /api/patients/[id]

Mendapatkan detail pasien berdasarkan ID.

**Response:**
```json
{
  "id": "cm1234567890",
  "name": "John Doe",
  "nik": "1234567890123456",
  "appointments": [...],
  "medicalRecords": [...]
}
```

### PATCH /api/patients/[id]

Update data pasien (Admin only).

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "081234567899"
}
```

### DELETE /api/patients/[id]

Hapus data pasien (Admin only).

**Response:** (200 OK)
```json
{
  "message": "Patient deleted successfully"
}
```

## 📅 Appointments API

### GET /api/appointments

Mendapatkan daftar janji temu.

**Query Parameters:**
- `patientId` (string, optional) - Filter by patient
- `doctorId` (string, optional) - Filter by doctor
- `date` (string, optional) - Filter by date (YYYY-MM-DD)
- `status` (enum, optional) - WAITING, CHECKED_IN, IN_CONSULTATION, COMPLETED, CANCELLED

### POST /api/appointments

Membuat janji temu baru (Patient).

**Request Body:**
```json
{
  "patientId": "cm1234567890",
  "doctorId": "cm0987654321",
  "appointmentDate": "2024-06-15T10:00:00.000Z",
  "timeSlot": "10:00-10:30"
}
```

### PATCH /api/appointments/[id]

Update status janji temu (Admin/Doctor).

**Request Body:**
```json
{
  "status": "CHECKED_IN"
}
```

## 🏥 Medical Records API

### GET /api/medical-records

Mendapatkan daftar rekam medis.

**Query Parameters:**
- `patientId` (string, optional) - Filter by patient
- `doctorId` (string, optional) - Filter by doctor
- `startDate` (string, optional) - Filter from date
- `endDate` (string, optional) - Filter to date

### POST /api/medical-records

Membuat rekam medis baru (Doctor).

**Request Body:**
```json
{
  "patientId": "cm1234567890",
  "appointmentId": "cm0987654321",
  "complaint": "Sakit kepala",
  "diagnosis": "Migrain",
  "treatment": "Istirahat, minum obat",
  "notes": "Follow up next week",
  "vitalSigns": {
    "bloodPressure": "120/80",
    "heartRate": 80,
    "temperature": 36.5,
    "weight": 70,
    "height": 170
  },
  "prescriptions": [
    {
      "medicationName": "Paracetamol",
      "dosage": "500mg",
      "instructions": "3x sehari setelah makan",
      "quantity": 10
    }
  ]
}
```

### GET /api/medical-records/[id]

Mendapatkan detail rekam medis dengan prescriptions.

## 💊 Medicines API

### GET /api/medicines

Mendapatkan daftar obat.

**Query Parameters:**
- `search` (string, optional) - Search by name
- `category` (string, optional) - Filter by category

### POST /api/medicines

Menambah obat baru (Admin/Pharmacy).

**Request Body:**
```json
{
  "name": "Paracetamol 500mg",
  "category": "Analgesic",
  "stock": 100,
  "price": 5000
}
```

### PATCH /api/medicines/[id]

Update data obat.

### DELETE /api/medicines/[id]

Hapus obat dari inventory.

## 🧾 Prescriptions API

### GET /api/prescriptions

Mendapatkan daftar resep (filter by status: PENDING, DISPENSED).

### PATCH /api/prescriptions/[id]

Update status resep (Pharmacy).

**Request Body:**
```json
{
  "id": "cm1234567890",
  "status": "DISPENSED"
}
```

## 💰 Billing API

### GET /api/billing

Mendapatkan daftar tagihan (Admin/Owner).

**Query Parameters:**
- `status` (enum) - PENDING, PAID, CANCELLED
- `startDate` (string) - Filter from date
- `endDate` (string) - Filter to date

### PATCH /api/billing/[id]

Update status pembayaran (Admin).

**Request Body:**
```json
{
  "status": "PAID",
  "paymentMethod": "CASH"
}
```

## 📊 Reports API

### GET /api/reports

Mendapatkan laporan operasional (Owner only).

**Query Parameters:**
- `type` (enum) - daily, weekly, monthly
- `startDate` (string) - Laporan dari tanggal
- `endDate` (string) - Laporan sampai tanggal

**Response:**
```json
{
  "totalPatients": 150,
  "totalAppointments": 300,
  "totalRevenue": 15000000,
  "doctorPerformance": [
    {
      "doctorName": "Dr. Smith",
      "totalPatients": 50,
      "totalRevenue": 5000000
    }
  ],
  "patientVisits": [
    { "date": "2024-06-01", "count": 10 },
    { "date": "2024-06-02", "count": 15 }
  ]
}
```

## 📄 Medical Certificates API

### GET /api/medical-certificates

Mendapatkan daftar surat keterangan medis.

### POST /api/medical-certificates

Membuat surat keterangan medis (Doctor).

**Request Body:**
```json
{
  "medicalRecordId": "cm1234567890",
  "restDays": 3,
  "startDate": "2024-06-15T00:00:00.000Z",
  "endDate": "2024-06-18T00:00:00.000Z",
  "diagnosis": "Flu",
  "notes": "Istirahat total"
}
```

## ⚠️ Error Responses

Semua API endpoints mengembalikan error dalam format:

```json
{
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (wrong role)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## 🔒 Role-Based Access

| Endpoint | PATIENT | ADMIN | DOCTOR | OWNER | PHARMACY |
|----------|---------|-------|--------|-------|----------|
| /api/patients | Read own | Full | Read | Read | - |
| /api/appointments | CRUD own | Full | Read/Update | Read | - |
| /api/medical-records | Read own | Read | CRUD | Read | - |
| /api/prescriptions | Read own | Read | Create | Read | Update status |
| /api/medicines | - | CRUD | - | Read | CRUD |
| /api/billing | Read own | CRUD | Read | Read | - |
| /api/reports | - | - | - | Full | - |
| /api/medical-certificates | Read own | Read | CRUD | Read | - |

---

Untuk contoh penggunaan API lebih lanjut, silakan cek file di folder `src/app/api/`.
