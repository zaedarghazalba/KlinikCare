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
    <div className="min-h-screen flex bg-stone-50">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-800 relative overflow-hidden">
        <div className="absolute top-16 left-16 w-72 h-72 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute bottom-24 right-12 w-96 h-96 rounded-full bg-accent-600/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] dot-pattern" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
              <Heart className="text-primary-300" size={22} />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">KlinikCare</span>
          </div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-5">Bergabung<br /><span className="text-primary-300">Sekarang</span></h2>
          <p className="text-base text-stone-400 max-w-md">Daftar dan nikmati kemudahan layanan kesehatan digital.</p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up py-4">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary-700 flex items-center justify-center">
              <Heart className="text-white" size={19} />
            </div>
            <span className="text-xl font-display font-bold text-stone-900 tracking-tight">KlinikCare</span>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-stone-900 mb-2">Buat Akun Baru</h1>
            <p className="text-stone-500 text-sm">Sudah punya akun? <Link href="/login" className="text-primary-700 font-semibold hover:text-primary-800">Masuk</Link></p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm animate-scale-in">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Nama sesuai KTP"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">NIK</label>
                <input type="text" value={form.nik} onChange={e => update("nik", e.target.value)} placeholder="16 digit"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all" required minLength={16} maxLength={16} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Jenis Kelamin</label>
                <select value={form.gender} onChange={e => update("gender", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all">
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Tanggal Lahir</label>
                <div className="relative">
                  <Calendar size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="date" value={form.birthDate} onChange={e => update("birthDate", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">No. Telepon</label>
                <div className="relative">
                  <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="08xxxxxxxxxx"
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all" required />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Alamat</label>
              <div className="relative">
                <MapPin size={17} className="absolute left-3.5 top-3 text-stone-400" />
                <textarea value={form.address} onChange={e => update("address", e.target.value)} placeholder="Alamat lengkap"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all resize-none" rows={2} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="nama@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type={showPw ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min. 8 karakter"
                  className="w-full pl-11 pr-12 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all" required minLength={8} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-500 transition-colors">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <span className={form.password.length >= 8 ? "text-primary-700 font-medium" : "text-stone-400"}>✓ 8+ karakter</span>
                <span className={/[A-Z]/.test(form.password) ? "text-primary-700 font-medium" : "text-stone-400"}>✓ Huruf besar</span>
                <span className={/[a-z]/.test(form.password) ? "text-primary-700 font-medium" : "text-stone-400"}>✓ Huruf kecil</span>
                <span className={/\d/.test(form.password) ? "text-primary-700 font-medium" : "text-stone-400"}>✓ Angka</span>
                <span className={/[!@#$%^&*]/.test(form.password) ? "text-primary-700 font-medium" : "text-stone-400"}>✓ Spesial (!@#$%)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type={showPw ? "text" : "password"} value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Min. 8 karakter"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all" required minLength={8} />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 size={17} className="animate-spin" /> : <><ArrowRight size={17} /> Daftar Sekarang</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
