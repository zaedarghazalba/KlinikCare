"use client";

import { useEffect, useState } from "react";
import { Stethoscope, Plus, Trash2, X, Loader2 } from "lucide-react";

interface Doctor { id: string; name: string; specialization: string; schedule: Record<string, string[]>; user: { email: string }; dailyQuota: number; consultationFee: number }

const dayLabels: Record<string, string> = { monday: "Senin", tuesday: "Selasa", wednesday: "Rabu", thursday: "Kamis", friday: "Jumat", saturday: "Sabtu", sunday: "Minggu" };

const initialForm = { name: "", email: "", password: "", specialization: "", dailyQuota: "20", consultationFee: "50000" };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editingQuotaId, setEditingQuotaId] = useState<string | null>(null);
  const [newQuota, setNewQuota] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDoctors = () => fetch("/api/doctors").then(r => r.json()).then(d => setDoctors(d.doctors || []));
  useEffect(() => { fetchDoctors(); }, []);

  const handleUpdateQuota = async (id: string) => {
    await fetch(`/api/doctors/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyQuota: newQuota })
    });
    setEditingQuotaId(null);
    fetchDoctors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dokter ini beserta akunnya?")) return;
    await fetch(`/api/doctors/${id}`, { method: "DELETE" });
    fetchDoctors();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/doctors", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Gagal menambah dokter");
    } else {
      setShowModal(false);
      setForm(initialForm);
      fetchDoctors();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jadwal & Kuota Dokter</h1>
          <p className="text-gray-500 text-sm mt-1">Manajemen data master dokter</p>
        </div>
        <button onClick={() => { setForm(initialForm); setError(""); setShowModal(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all">
          <Plus size={18} /> Tambah Dokter
        </button>
      </div>

      <div className="grid gap-4">
        {doctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400"><Stethoscope size={48} className="mx-auto mb-3 text-gray-300" /><p>Belum ada data dokter</p></div>
        ) : doctors.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                  <p className="text-sm text-gray-500">{doc.specialization} · {doc.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Biaya Konsultasi</p>
                  <span className="text-sm font-bold text-emerald-600">Rp {(doc.consultationFee || 50000).toLocaleString("id-ID")}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Kuota Harian</p>
                  {editingQuotaId === doc.id ? (
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" value={newQuota} onChange={e => setNewQuota(parseInt(e.target.value))} 
                        className="w-20 px-2 py-1 text-sm border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                      <button onClick={() => handleUpdateQuota(doc.id)} className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600">Simpan</button>
                      <button onClick={() => setEditingQuotaId(null)} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200">Batal</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">{doc.dailyQuota || 20} <span className="text-sm font-normal text-gray-500">Pasien</span></span>
                      <button onClick={() => { setEditingQuotaId(doc.id); setNewQuota(doc.dailyQuota || 20); }} className="text-xs text-emerald-600 font-semibold hover:underline">Ubah</button>
                    </div>
                  )}
                </div>
                <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus Dokter">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Jadwal Praktik</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(doc.schedule || {}).map(([day, slots]) => (
                  <div key={day} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 mb-2">{dayLabels[day] || day}</p>
                    <div className="flex flex-wrap gap-1">
                      {(slots as string[]).map(slot => (
                        <span key={slot} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono">{slot}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Tambah Dokter</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">{error}</div>}
              {[
                { key: "name", label: "Nama Dokter (dengan gelar)", type: "text" },
                { key: "specialization", label: "Spesialisasi (mis: Dokter Umum)", type: "text" },
                { key: "email", label: "Email (untuk login)", type: "email" },
                { key: "password", label: "Password", type: "password" },
                { key: "consultationFee", label: "Biaya Konsultasi (Rp)", type: "number" },
                { key: "dailyQuota", label: "Kuota Harian", type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input type={type} min={type === "number" ? "1" : undefined} value={form[key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    required />
                </div>
              ))}
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Simpan Dokter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

