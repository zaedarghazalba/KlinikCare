"use client";

import { useEffect, useState } from "react";
import { FileBadge, Search, Loader2, Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface AppointmentRecord {
  id: string;
  complaint: string;
  diagnosis: string;
  treatment: string;
  createdAt: string;
  appointment: { id: string; appointmentDate: string; timeSlot: string; status: string; queueNumber: number };
  patient: { id: string; name: string; nik: string };
  doctor: { name: string; specialization: string };
}

interface Certificate {
  id: string;
  certificateNumber: string;
  diagnosis: string;
  restDays: number;
  startDate: string;
  endDate: string;
  patientName: string;
  medicalRecordId: string;
}

export default function DoctorCertificatesPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null);
  const [form, setForm] = useState({ restDays: "1", startDate: new Date().toISOString().split("T")[0], diagnosis: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptRes, certRes] = await Promise.all([
        fetch("/api/appointments?status=COMPLETED&limit=100"),
        fetch("/api/medical-certificates"),
      ]);
      const aptData = await aptRes.json();
      const certData = await certRes.json();

      const apts = (aptData.appointments || []).map((apt: { id: string; queueNumber: number; status: string; appointmentDate: string; timeSlot: string; patient: { id: string; name: string; nik: string }; doctor: { name: string; specialization: string }; medicalRecord: { id: string; complaint: string; diagnosis: string; treatment: string } | null }) => ({
        id: apt.medicalRecord?.id || apt.id,
        appointment: { id: apt.id, appointmentDate: apt.appointmentDate, timeSlot: apt.timeSlot, status: apt.status, queueNumber: apt.queueNumber },
        patient: apt.patient,
        doctor: apt.doctor,
        complaint: apt.medicalRecord?.complaint || "",
        diagnosis: apt.medicalRecord?.diagnosis || "",
        treatment: apt.medicalRecord?.treatment || "",
        createdAt: apt.appointmentDate,
      }));

      setAppointments(apts);
      setCertificates(certData.certificates || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getCertificateForAppointment = (appointmentId: string, recordId: string) => {
    return certificates.find(c => c.medicalRecordId === recordId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const existingCert = getCertificateForAppointment(selectedAppointment.appointment.id, selectedAppointment.id);
      const url = existingCert ? `/api/medical-certificates?id=${existingCert.id}` : "/api/medical-certificates";
      const method = existingCert ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicalRecordId: selectedAppointment.id,
          restDays: parseInt(form.restDays),
          startDate: form.startDate,
          diagnosis: form.diagnosis,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan surat");
      } else {
        setSuccess(existingCert ? "Surat sakit diperbarui!" : "Surat sakit berhasil dibuat!");
        fetchData();
      }
    } catch (e) {
      setError("Terjadi kesalahan");
    }
    setSaving(false);
  };

  const openForm = (apt: AppointmentRecord) => {
    setSelectedAppointment(apt);
    const existingCert = getCertificateForAppointment(apt.appointment.id, apt.id);
    if (existingCert) {
      setForm({
        restDays: String(existingCert.restDays),
        startDate: existingCert.startDate.split("T")[0],
        diagnosis: existingCert.diagnosis,
        notes: "",
      });
    } else {
      setForm({ restDays: "1", startDate: new Date().toISOString().split("T")[0], diagnosis: apt.diagnosis, notes: "" });
    }
    setError("");
    setSuccess("");
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.patient.name.toLowerCase().includes(search.toLowerCase()) ||
    apt.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  const endDate = form.startDate ? new Date(new Date(form.startDate).getTime() + (parseInt(form.restDays) - 1) * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID") : "";

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex items-center gap-4">
        <Link href="/doctor" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Surat Sakit</h1>
          <p className="text-gray-500 text-sm mt-1">Buat/edit surat sakit per kunjungan pasien</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pasien atau diagnosa..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={24} /></div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-gray-400">Belum ada pasien selesai</div>
            ) : (
              filteredAppointments.map(apt => {
                const existingCert = getCertificateForAppointment(apt.appointment.id, apt.id);
                const dateStr = new Date(apt.appointment.appointmentDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
                return (
                  <div key={apt.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">
                      {String(apt.appointment.queueNumber).padStart(2, "0")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{apt.patient.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>{dateStr} {apt.appointment.timeSlot}</span>
                        <span className={`px-1.5 py-0.5 rounded ${getStatusColor(apt.appointment.status)}`}>
                          {getStatusLabel(apt.appointment.status)}
                        </span>
                      </div>
                      {apt.diagnosis && <p className="text-xs text-gray-400 truncate">Dx: {apt.diagnosis}</p>}
                    </div>
                    <button
                      onClick={() => openForm(apt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${existingCert ? "bg-primary-50 text-primary-700 hover:bg-primary-100" : "bg-primary-50 text-primary-700 hover:bg-primary-100"}`}
                    >
                      {existingCert ? "Edit" : "Buat"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Form */}
        <div>
          {selectedAppointment ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <User size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedAppointment.patient.name}</p>
                  <p className="text-xs text-gray-500">NIK: {selectedAppointment.patient.nik} | Antrean: {String(selectedAppointment.appointment.queueNumber).padStart(2, "0")}</p>
                </div>
              </div>

              {/* Rekam Medis Saat Ini */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Rekam Medis - Antrean {String(selectedAppointment.appointment.queueNumber).padStart(2, "0")}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Keluhan Utama</p>
                    <p className="text-gray-700">{selectedAppointment.complaint || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Diagnosa</p>
                    <p className="text-gray-700 font-medium">{selectedAppointment.diagnosis || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Tindakan</p>
                    <p className="text-gray-700">{selectedAppointment.treatment || "-"}</p>
                  </div>
                </div>
              </div>

              {success && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm">{success}</div>}
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hari Istirahat</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={form.restDays}
                      onChange={(e) => setForm({ ...form, restDays: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Diagnosa</label>
                  <input
                    type="text"
                    value={form.diagnosis}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    placeholder="Contoh: ISPA, Demam"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan (opsional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <p className="text-gray-600">
                    Preview: Pasien perlu beristirahat di rumah selama <strong>{form.restDays} hari</strong> ({form.startDate} s/d {endDate}), karena {form.diagnosis || "(diagnosa)"}.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <><FileBadge size={18} /> Simpan Surat Sakit</>}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400">
              <FileBadge size={40} className="mx-auto mb-3 opacity-30" />
              <p>Pilih antrean dari daftar untuk membuat surat sakit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}