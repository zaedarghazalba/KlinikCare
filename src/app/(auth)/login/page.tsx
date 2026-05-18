"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;

      const roleRoutes: Record<string, string> = {
        PATIENT: "/patient",
        ADMIN: "/admin",
        DOCTOR: "/doctor",
        OWNER: "/owner",
        PHARMACY: "/pharmacy",
      };

      router.push(roleRoutes[role] || "/patient");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Left side — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-800 relative overflow-hidden">
        <div className="absolute top-16 left-16 w-72 h-72 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute bottom-24 right-12 w-96 h-96 rounded-full bg-accent-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-primary-500/15 blur-2xl" />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.04] dot-pattern" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
              <Heart className="text-primary-300" size={22} />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">KlinikCare</span>
          </div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-5">
            Layanan Kesehatan
            <br />
            <span className="text-primary-300">Modern & Digital</span>
          </h2>
          <p className="text-base text-stone-400 max-w-md leading-relaxed">
            Daftar online, pantau antrean real-time, dan akses rekam medis Anda
            kapan saja, di mana saja.
          </p>

          <div className="mt-12 space-y-4">
            {[
              "Pendaftaran online tanpa antrean panjang",
              "Rekam medis digital yang aman",
              "Pantau antrean secara real-time",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-stone-400">
                <div className="w-5 h-5 rounded-full bg-primary-600/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-300" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-primary-700 flex items-center justify-center">
              <Heart className="text-white" size={19} />
            </div>
            <span className="text-xl font-display font-bold text-stone-900 tracking-tight">KlinikCare</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-stone-900 mb-2">
              Masuk ke Akun
            </h1>
            <p className="text-stone-500 text-sm">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-primary-700 font-semibold hover:text-primary-800 transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm animate-scale-in" id="login-error">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all"
                  required
                  id="input-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-11 pr-12 py-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/10 focus:border-primary-500 transition-all"
                  required
                  id="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              id="btn-login"
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <>
                  Masuk
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-5 rounded-lg bg-stone-100/60 border border-stone-200/60">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { role: "Admin", email: "admin@klinikcare.com" },
                { role: "Dokter", email: "dr.sarah@klinikcare.com" },
                { role: "Pasien", email: "andi@gmail.com" },
                { role: "Owner", email: "owner@klinikcare.com" },
                { role: "Apoteker", email: "apoteker@gmail.com" },
              ].map(({ role, email: demoEmail }) => (
                <button
                  key={role}
                  onClick={() => {
                    setEmail(demoEmail);
                    setPassword("password123");
                  }}
                  className="p-2.5 rounded-md bg-white border border-stone-200 hover:border-primary-300 hover:bg-primary-50/40 transition-all text-left"
                >
                  <span className="font-semibold text-stone-700 text-xs">{role}</span>
                  <br />
                  <span className="text-stone-400 text-[10px]">{demoEmail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
