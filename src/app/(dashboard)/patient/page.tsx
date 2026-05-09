"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CalendarPlus, ListOrdered, FileText, Clock } from "lucide-react";
import { getStatusColor, getStatusLabel, getQueueDisplay } from "@/lib/utils";

interface Appointment {
  id: string; queueNumber: number; status: string; timeSlot: string; appointmentDate: string;
  doctor: { name: string; specialization: string };
}

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch("/api/appointments").then(r => r.json()).then(d => setAppointments(d.appointments || []));
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayApt = appointments.find(a => a.appointmentDate?.startsWith(today) && !["COMPLETED", "CANCELLED"].includes(a.status));
  const upcoming = appointments.filter(a => !["COMPLETED", "CANCELLED"].includes(a.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Pasien</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang, {session?.user?.name}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Booking Baru", desc: "Daftar kunjungan", href: "/patient/booking", icon: <CalendarPlus size={22} />, color: "from-emerald-500 to-emerald-600" },
          { label: "Antrean Saya", desc: "Lihat status", href: "/patient/queue", icon: <ListOrdered size={22} />, color: "from-blue-500 to-blue-600" },
          { label: "Riwayat Medis", desc: "Rekam medis", href: "/patient/records", icon: <FileText size={22} />, color: "from-purple-500 to-purple-600" },
        ].map((item, i) => (
          <Link key={i} href={item.href} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <h3 className="font-semibold text-gray-900">{item.label}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Current queue */}
      {todayApt && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl shadow-emerald-200 animate-scale-in">
          <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-2">Antrean Anda Hari Ini</p>
          <div className="flex items-center gap-6">
            <p className="text-6xl font-bold queue-number">{getQueueDisplay(todayApt.queueNumber)}</p>
            <div>
              <p className="text-xl font-semibold">{todayApt.doctor.name}</p>
              <p className="text-emerald-100">{todayApt.doctor.specialization} · {todayApt.timeSlot}</p>
              <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20`}>{getStatusLabel(todayApt.status)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming appointments */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Kunjungan Mendatang</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {upcoming.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Clock size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Belum ada jadwal kunjungan</p>
              <Link href="/patient/booking" className="inline-flex mt-3 text-emerald-600 text-sm font-semibold hover:text-emerald-700">Booking sekarang →</Link>
            </div>
          ) : upcoming.map(apt => (
            <div key={apt.id} className="flex items-center gap-4 px-6 py-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-bold queue-number">{getQueueDisplay(apt.queueNumber)}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{apt.doctor.name}</p>
                <p className="text-xs text-gray-400">{apt.doctor.specialization} · {apt.timeSlot}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
