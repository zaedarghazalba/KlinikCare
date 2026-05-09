"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FileBadge, Printer, Loader2, CalendarDays, Stethoscope } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function MedicalCertificateContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") || "";
  const patientId = searchParams.get("patientId") || "";
  const medicalRecordId = searchParams.get("medicalRecordId") || "";

  const [patient, setPatient] = useState<{ name: string; nik: string; birthDate: string; address: string } | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<{ diagnosis: string; doctorName: string; specialization: string } | null>(null);
  const [form, setForm] = useState({ restDays: "1", startDate: new Date().toISOString().split("T")[0], diagnosis: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    if (patientId) {
      fetch(`/api/patients/${patientId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.patient) {
            setPatient({
              name: d.patient.name,
              nik: d.patient.nik,
              birthDate: d.patient.birthDate,
              address: d.patient.address,
            });
          }
        });
    }
    if (medicalRecordId) {
      fetch(`/api/medical-records?patientId=${patientId}`)
        .then((r) => r.json())
        .then((d) => {
          const record = (d.records || []).find((r: any) => r.id === medicalRecordId);
          if (record) {
            setMedicalRecord({
              diagnosis: record.diagnosis,
              doctorName: record.doctor.name,
              specialization: record.doctor.specialization,
            });
          }
        });
    }
  }, [patientId, medicalRecordId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/medical-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicalRecordId,
        restDays: parseInt(form.restDays),
        startDate: form.startDate,
        diagnosis: form.diagnosis,
        notes: form.notes,
      }),
    });

    const data = await response.json();
    if (data.certificate) {
      setCertificate(data.certificate);
      setSubmitted(true);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const endDate = form.startDate && form.restDays
    ? (() => {
        const start = new Date(form.startDate);
        start.setDate(start.getDate() + parseInt(form.restDays) - 1);
        return start.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      })()
    : "";

  const startDateFormatted = form.startDate
    ? new Date(form.startDate + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  if (submitted && certificate) {
    return (
      <div className="space-y-6 p-2 lg:p-0">
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Surat Keterangan Sakit</h1>
            <p className="text-gray-500 text-sm mt-1">Surat berhasil dibuat</p>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:shadow-lg transition-all">
            <Printer size={16} /> Cetak Surat
          </button>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 print:shadow-none print:border-0 print:p-0" id="certificate-print">
          {/* Kop Klinik */}
          <div className="text-center border-b-2 border-gray-300 pb-4 mb-6 print:border-b-2">
            <h2 className="text-xl font-bold text-gray-900">KLINIKCARE</h2>
            <p className="text-sm text-gray-500">Jl. Contoh No. 123, Kota - Telp: (021) 1234567</p>
          </div>

          {/* Judul */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 underline">SURAT KETERANGAN SAKIT</h3>
            <p className="text-xs text-gray-500 mt-1">No: {certificate.certificateNumber}</p>
          </div>

          {/* Isi Surat */}
          <div className="space-y-4 text-sm leading-relaxed">
            <p>Yang bertanda tangan di bawah ini:</p>

            <div className="ml-6 space-y-1">
              <p><span className="inline-block w-32">Nama</span>: dr. {certificate.doctor.name}</p>
              <p><span className="inline-block w-32">Spesialisasi</span>: {certificate.doctor.specialization}</p>
            </div>

            <p className="mt-4">Menerangkan bahwa pasien:</p>

            <div className="ml-6 space-y-1">
              <p><span className="inline-block w-32">Nama</span>: {certificate.patientName}</p>
              <p><span className="inline-block w-32">NIK</span>: {certificate.patientNik}</p>
            </div>

            <p className="mt-4">
              Telah diperiksa di KlinikCare dan berdasarkan hasil pemeriksaan dinyatakan perlu <strong>istirahat selama {certificate.restDays} hari</strong> terhitung dari tanggal <strong>{startDateFormatted}</strong> sampai dengan <strong>{endDate}</strong>.
            </p>

            {certificate.notes && (
              <div className="mt-4">
                <p><strong>Catatan:</strong> {certificate.notes}</p>
              </div>
            )}
          </div>

          {/* Tanda Tangan */}
          <div className="mt-12 flex justify-end">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-sm mt-2">Dokter yang memeriksa,</p>
              <div className="h-20" />
              <p className="font-semibold underline">dr. {certificate.doctor.name}</p>
              <p className="text-xs text-gray-500">{certificate.doctor.specialization}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 print:hidden">
          <a href="/doctor/queue" className="flex-1 py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 font-semibold block text-center hover:bg-emerald-50 transition-colors">
            Kembali ke Antrean
          </a>
          <button onClick={() => { setSubmitted(false); setCertificate(null); }} className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold hover:shadow-lg transition-all">
            Buat Surat Baru
          </button>
        </div>
      </div>
    );
  }

  if (!medicalRecordId || !patientId) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileBadge size={48} className="mx-auto mb-4 text-gray-200" />
        <p className="text-lg">Pilih pasien dari antrean atau rekam medis untuk membuat surat sakit</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buat Surat Keterangan Sakit</h1>
        <p className="text-gray-500 text-sm mt-1">Generate surat sakit untuk pasien</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CalendarDays size={18} className="text-emerald-500" /> Data Pasien
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400">Nama</p>
            <p className="font-medium text-gray-900">{patient?.name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">NIK</p>
            <p className="font-medium text-gray-900">{patient?.nik || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Diagnosa</p>
            <p className="font-medium text-gray-900">{medicalRecord?.diagnosis || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Dokter</p>
            <p className="font-medium text-gray-900">{medicalRecord?.doctorName || "-"}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Stethoscope size={18} className="text-emerald-500" /> Detail Surat
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Hari Istirahat</label>
            <input type="number" min="1" max="30" value={form.restDays} onChange={(e) => setForm({ ...form, restDays: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Mulai</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Diagnosa</label>
          <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Contoh: ISPA,Demam" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Tambahan (opsional)</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan untuk surat..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none resize-none" />
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm">
          <p className="text-xs text-gray-400 mb-2">Preview:</p>
          <p className="text-gray-700">
            Pasien <strong>{patient?.name}</strong> perlu istirahat <strong>{form.restDays} hari</strong> dari <strong>{startDateFormatted}</strong> s/d <strong>{endDate}</strong>.
          </p>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><FileBadge size={18} /> Generate & Cetak Surat</>}
        </button>
      </form>
    </div>
  );
}

export default function MedicalCertificatePage() {
  return <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={24} /></div>}><MedicalCertificateContent /></Suspense>;
}
