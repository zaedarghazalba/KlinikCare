import Link from "next/link";
import {
  Heart,
  CalendarCheck,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Stethoscope,
  Brain,
  Eye,
  Bone,
  Baby,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Mail,
  ClipboardList,
  CreditCard,
  Pill,
  FileCheck,
  QrCode,
} from "lucide-react";

import LandingImages from "@/components/LandingImages";

const NAMA_KLINIK = "KlinikCare";
const TAGLINE = "Solusi Digital Untuk Klinik Modern";

const doctors = [
  { name: "Dr. Ahmad Faisal, Sp.PD", specialty: "Spesialis Penyakit Dalam", image: "/doctors/doctor1.jpg" },
  { name: "Dr. Sarah Putri, Sp.OG", specialty: "Spesialis Kandungan", image: "/doctors/doctor2.jpg" },
  { name: "Dr. Budi Santoso, Sp.B", specialty: "Spesialis Bedah", image: "/doctors/doctor3.jpg" },
  { name: "Dr. Maya Kristin, Sp.A", specialty: "Spesialis Anak", image: "/doctors/doctor4.jpg" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-cyan-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-cyan-200">
              <Heart className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-gray-900">{NAMA_KLINIK}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#tentang" className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors">
              Tentang
            </Link>
            <Link href="#layanan" className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors">
              Layanan
            </Link>
            <Link href="#dokter" className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors">
              Dokter
            </Link>
            <Link href="#visimisi" className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors">
              Visi & Misi
            </Link>
            <Link href="#pendaftaran" className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors">
              Pendaftaran
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-cyan-200 hover:shadow-cyan-300 hover:opacity-95 transition-all">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-100/50 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-sky-100/50 blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-sm font-medium mb-6 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse-soft" />
                {TAGLINE}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 animate-slide-up">
                Kesehatan Anda{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent">
                  Prioritas Kami
                </span>
              </h1>
              <p className="text-lg text-gray-500 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: "100ms" }}>
                Dapatkan layanan kesehatan terbaik dengan tenaga medis profesional, 
                fasilitas modern, dan pelayanan yang mudah melalui sistem digital kami.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
                <Link href="/register" className="px-8 py-4 rounded-2xl gradient-primary text-white font-semibold shadow-xl shadow-cyan-200 hover:shadow-cyan-300 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  Daftar Sekarang <ArrowRight size={18} />
                </Link>
                <Link href="#layanan" className="px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
                  Lihat Layanan
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-sky-200 rounded-3xl" />
                <LandingImages
                  src="/clinic/clinic-front.jpg"
                  alt="Klinik Utama Sehat"
                  className="object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                    <Users className="text-cyan-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">5000+</p>
                    <p className="text-sm text-gray-500">Pasien Puas</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                    <Award className="text-cyan-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">15+</p>
                    <p className="text-sm text-gray-500">Dokter Spesialis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-cyan-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5000+", label: "Pasien" },
              { value: "15+", label: "Dokter Spesialis" },
              { value: "24/7", label: "Layanan" },
              { value: "98%", label: "Kepuasan" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-cyan-600">{stat.value}</p>
                <p className="text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-6" id="tentang">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                <LandingImages
                  src="/clinic/clinic-interior.jpg"
                  alt="Interior Klinik"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-cyan-100 rounded-3xl -z-10" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tentang {NAMA_KLINIK}
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                {NAMA_KLINIK} adalah fasilitas kesehatan yang berkomitmen memberikan 
                pelayanan medis terbaik dengan didukung oleh tenaga profesional dan 
                fasilitasmodern. Kami mengutamakan kenyamanan dan keselamatan pasien 
                dalam setiap layanan yang kami berikan.
              </p>
              <div className="space-y-4">
                {[
                  "Tenaga medis profesional dan berpengalaman",
                  "Fasilitas medis modern dan lengkap",
                  "Pelayanan cepat dan efisien",
                  "Lokasi strategis dan mudah diakses",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-cyan-500 flex-shrink-0" size={20} />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6 bg-gray-50/50" id="layanan">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Layanan Kami
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Kami menyediakan berbagai layanan medis untuk memenuhi kebutuhan 
              kesehatan Anda dan keluarga
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Stethoscope size={24} />, title: "Poli Umum", desc: "Pemeriksaan kesehatan umum dan konsultasi medis", color: "from-cyan-500 to-cyan-600", shadow: "shadow-cyan-200" },
              { icon: <Baby size={24} />, title: "Poli Anak", desc: "Pemeriksaan dan perawatan kesehatan anak", color: "from-pink-500 to-pink-600", shadow: "shadow-pink-200" },
              { icon: <Heart size={24} />, title: "Poli Kandungan", desc: "Layanan kesehatan wanita dan ibu hamil", color: "from-rose-500 to-rose-600", shadow: "shadow-rose-200" },
              { icon: <Brain size={24} />, title: "Poli Saraf", desc: "Pemeriksaan dan perawatan sistem saraf", color: "from-purple-500 to-purple-600", shadow: "shadow-purple-200" },
              { icon: <Eye size={24} />, title: "Poli Mata", desc: "Pemeriksaan kesehatan mata dan penglihatan", color: "from-amber-500 to-amber-600", shadow: "shadow-amber-200" },
              { icon: <Bone size={24} />, title: "Poli Orthopedi", desc: "Pemeriksaan tulang, sendi, dan otot", color: "from-sky-500 to-sky-600", shadow: "shadow-sky-200" },
            ].map((feat, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} ${feat.shadow} shadow-lg flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="py-20 px-6" id="dokter">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tim Dokter Kami
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Di dukung oleh tim dokter spesialis berpengalaman dan profesional
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative aspect-square bg-gray-100">
                  <LandingImages
                    src={doctor.image}
                    alt={doctor.name}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackText={doctor.name.split(' ').slice(1, 3).map(n => n[0]).join('')}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-cyan-600 text-sm mt-1">{doctor.specialty}</p>
                  <div className="flex items-center gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">(50)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="inline-flex items-center gap-2 text-cyan-600 font-medium hover:text-cyan-700 transition-colors">
              Lihat Semua Dokter <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Visi Misi */}
      <section className="py-20 px-6 bg-cyan-50/50" id="visimisi">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Visi & Misi
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Komitmen kami dalam memberikan pelayanan kesehatan terbaik
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-cyan-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center text-white mb-6">
                <Eye size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visi</h3>
              <p className="text-gray-500 leading-relaxed">
                Menjadi klinik pilihan utama masyarakat dalam pelayanan kesehatan 
                yang berkualitas, profesional, dan terjangkau dengan mengutamakan 
                kepuasan pasien dan keselamatan pelayanan.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-cyan-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white mb-6">
                <Target width={32} height={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Misi</h3>
              <ul className="space-y-3 text-gray-500">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-cyan-500 flex-shrink-0 mt-0.5" size={18} />
                  <span>Menyediakan layanan kesehatan yang bermutu dan profesional</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-cyan-500 flex-shrink-0 mt-0.5" size={18} />
                  <span>Menggunakan teknologi modern untuk keamanan dan kenyamanan</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-cyan-500 flex-shrink-0 mt-0.5" size={18} />
                  <span>Membangun hubungan baik dengan pasien dan keluarga</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-cyan-500 flex-shrink-0 mt-0.5" size={18} />
                  <span>Mengembangkan kompetensi tim medis secara berkelanjutan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pendaftaran */}
      <section className="py-20 px-6" id="pendaftaran">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Alur Sistem
            </h2>
            <p className="text-gray-500">Tahapan layanan di {NAMA_KLINIK}</p>
          </div>
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 to-sky-500 hidden md:block" />
            <div className="space-y-8">
              {[
                { title: "Registrasi & Login", desc: "Buat akun pasien dan masuk ke sistem", icon: <Users size={24} /> },
                { title: "Pilih Jadwal", desc: "Pilih dokter, tanggal, dan jam kunjungan yang tersedia", icon: <CalendarCheck size={24} /> },
                { title: "Booking", desc: "Sistem membuat appointment dan generate QR code", icon: <QrCode size={24} /> },
                { title: "Check-in", desc: "Tiba di klinik, scan QR code untuk daftar ulang", icon: <Smartphone size={24} /> },
                { title: "Konsultasi", desc: "Dokter memeriksa, membuat diagnosa dan rekam medis", icon: <ClipboardList size={24} /> },
                { title: "Resep Obat", desc: "Apoteker menyiapkan obat berdasarkan resep dokter", icon: <Pill size={24} /> },
                { title: "Pembayaran", desc: "Bayar biaya konsultasi dan obat di kasir", icon: <CreditCard size={24} /> },
                { title: "Selesai", desc: "Terima bukti pembayaran, bisa pulang atau buat surat sakit", icon: <FileCheck size={24} /> },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-cyan-200 group-hover:scale-110 transition-transform z-10">
                    {item.icon}
                  </div>
                  <div className="pt-1 bg-white">
                    <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                    <p className="text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto gradient-hero rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-sky-500/10 blur-2xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Untuk Berobat?
            </h2>
            <p className="text-cyan-100 text-lg mb-8 max-w-xl mx-auto">
              Daftar sekarang dan rasakan pelayanan kesehatan yang berbeda.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-cyan-700 font-semibold hover:bg-cyan-50 transition-all shadow-xl">
              Daftar Sekarang <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="text-cyan-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Alamat</h3>
                <p className="text-gray-500 text-sm">Jl. Raya Utama No. 123, Jakarta Selatan</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <Phone className="text-cyan-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Telepon</h3>
                <p className="text-gray-500 text-sm">(021) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <Mail className="text-cyan-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-500 text-sm">info@klinikutamahebat.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-cyan-500" />
            <span className="text-sm text-gray-500">
              © 2026 {NAMA_KLINIK}. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>Built with Next.js 16</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}