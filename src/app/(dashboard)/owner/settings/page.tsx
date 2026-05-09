"use client";

import { useState } from "react";
import { Building2, Globe, Clock, Save, Loader2, CheckCircle2 } from "lucide-react";

export default function OwnerSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [form, setForm] = useState({
    clinicName: "KlinikCare Utama",
    address: "Jl. Kesehatan No. 123, Jakarta Selatan",
    phone: "021-555-0123",
    email: "info@klinikcare.com",
    website: "www.klinikcare.com",
    openHour: "08:00",
    closeHour: "21:00"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    
    // Simulate API call for settings
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-6 p-2 lg:p-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Klinik</h1>
        <p className="text-gray-500 text-sm mt-1">Konfigurasi profil dan operasional klinik Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profil Klinik</h3>
              <p className="text-xs text-gray-500">Informasi dasar yang akan ditampilkan ke pasien</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Klinik</label>
              <input type="text" value={form.clinicName} onChange={e => setForm({...form, clinicName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
              <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" required />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Jam Operasional</h3>
              <p className="text-xs text-gray-500">Waktu buka dan tutup standar klinik</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Buka</label>
              <input type="time" value={form.openHour} onChange={e => setForm({...form, openHour: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Tutup</label>
              <input type="time" value={form.closeHour} onChange={e => setForm({...form, closeHour: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none" required />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 animate-fade-in font-medium text-sm">
              <CheckCircle2 size={18} /> Pengaturan berhasil disimpan
            </div>
          )}
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Simpan Pengaturan</>}
          </button>
        </div>
      </form>
    </div>
  );
}
