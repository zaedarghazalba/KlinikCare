"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Loader2, Calendar, MapPin } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    nik: "", birthDate: "", gender: "MALE", address: ""
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Password tidak cocok"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal mendaftar"); setLoading(false); return; }
      router.push("/login?registered=true");
    } catch { setError("Terjadi kesalahan"); setLoading(false); }
  };

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-32 right-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Heart className="text-emerald-400" size={24} />
            </div>
            <span className="text-2xl font-bold">KlinikCare</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">Bergabung<br /><span className="text-emerald-400">Sekarang</span></h2>
          <p className="text-lg text-gray-300 max-w-md">Daftar dan nikmati kemudahan layanan kesehatan digital.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-200">
              <Heart className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">KlinikCare</span>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
            <p className="text-gray-500 text-sm">Sudah punya akun? <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">Masuk</Link></p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-scale-in">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Nama sesuai KTP"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
                <input type="text" value={form.nik} onChange={e => update("nik", e.target.value)} placeholder="16 digit"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required minLength={16} maxLength={16} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                <select value={form.gender} onChange={e => update("gender", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={form.birthDate} onChange={e => update("birthDate", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="08xxxxxxxxxx"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-3 text-gray-400" />
                <textarea value={form.address} onChange={e => update("address", e.target.value)} placeholder="Alamat lengkap"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={2} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="nama@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min. 8 karakter"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required minLength={8} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                <span className={form.password.length >= 8 ? "text-emerald-600" : "text-gray-400"}>✓ 8+ karakter</span>
                <span className={/[A-Z]/.test(form.password) ? "text-emerald-600" : "text-gray-400"}>✓ Huruf besar</span>
                <span className={/[a-z]/.test(form.password) ? "text-emerald-600" : "text-gray-400"}>✓ Huruf kecil</span>
                <span className={/\d/.test(form.password) ? "text-emerald-600" : "text-gray-400"}>✓ Angka</span>
                <span className={/[!@#$%^&*]/.test(form.password) ? "text-emerald-600" : "text-gray-400"}>✓ Spesial (!@#$%)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? "text" : "password"} value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Min. 8 karakter"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required minLength={8} />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Daftar Sekarang</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}