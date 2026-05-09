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

      // Fetch session to get role
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
    <div className="min-h-screen flex">
      {/* Left side — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-32 right-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-teal-400/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Heart className="text-emerald-400" size={24} />
            </div>
            <span className="text-2xl font-bold">KlinikCare</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Layanan Kesehatan
            <br />
            <span className="text-emerald-400">Modern & Digital</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-md leading-relaxed">
            Daftar online, pantau antrean real-time, dan akses rekam medis Anda
            kapan saja, di mana saja.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4">
            {[
              "Pendaftaran online tanpa antrean panjang",
              "Rekam medis digital yang aman",
              "Pantau antrean secara real-time",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-gray-300"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-200">
              <Heart className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">KlinikCare</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Masuk ke Akun
            </h1>
            <p className="text-gray-500">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-scale-in" id="login-error">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  required
                  id="input-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  required
                  id="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              id="btn-login"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Masuk
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
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
                    setPassword(
                      role === "Admin"
                        ? "password123"
                        : role === "Dokter"
                          ? "password123"
                          : role === "Owner"
                            ? "password123"
                            : role === "Apoteker"
                              ? "password123"
                              : "password123"
                    );
                  }}
                  className="p-2.5 rounded-lg bg-white border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-left"
                >
                  <span className="font-semibold text-gray-700">{role}</span>
                  <br />
                  <span className="text-gray-400 text-[10px]">{demoEmail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
