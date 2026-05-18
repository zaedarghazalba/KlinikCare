"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, FileText, Pill, Clock } from "lucide-react";
import { getStatusColor, getStatusLabel, getQueueDisplay } from "@/lib/utils";
import Link from "next/link";

interface Appointment {
  id: string; queueNumber: number; status: string; timeSlot: string;
  patient: { id: string; name: string; phone: string };
}

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const [todayQueue, setTodayQueue] = useState<Appointment[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/appointments?date=${today}`).then(r => r.json()).then(d => setTodayQueue(d.appointments || []));
  }, []);

  const waiting = todayQueue.filter(a => ["WAITING", "CHECKED_IN"].includes(a.status)).length;
  const inConsult = todayQueue.find(a => a.status === "IN_CONSULTATION");
  const completed = todayQueue.filter(a => a.status === "COMPLETED").length;

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Dokter</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
          <Clock size={24} className="mx-auto text-amber-500 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{waiting}</p>
          <p className="text-sm text-gray-500">Menunggu</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
          <Users size={24} className="mx-auto text-purple-500 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{todayQueue.length}</p>
          <p className="text-sm text-gray-500">Total Hari Ini</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
          <FileText size={24} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{completed}</p>
          <p className="text-sm text-gray-500">Selesai</p>
        </div>
      </div>

      {inConsult && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-200">
          <p className="text-purple-200 text-sm font-medium uppercase tracking-wider mb-2">Sedang Konsultasi</p>
          <div className="flex items-center gap-6">
            <p className="text-5xl font-bold queue-number">{getQueueDisplay(inConsult.queueNumber)}</p>
            <div>
              <p className="text-xl font-semibold">{inConsult.patient.name}</p>
              <Link href={`/doctor/emr?appointmentId=${inConsult.id}&patientId=${inConsult.patient.id}`}
                className="inline-flex mt-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition-all">
                Buka Rekam Medis →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-100"><h3 className="text-lg font-semibold text-gray-900">Antrean Pasien Hari Ini</h3></div>
        <div className="divide-y divide-gray-50">
          {todayQueue.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada pasien hari ini</div>
          ) : todayQueue.map(apt => (
            <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-700 font-bold text-sm queue-number">{getQueueDisplay(apt.queueNumber)}</span>
              <div className="flex-1"><p className="font-medium text-gray-900 text-sm">{apt.patient.name}</p><p className="text-xs text-gray-400">{apt.timeSlot}</p></div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
              {apt.status === "IN_CONSULTATION" && (
                <Link href={`/doctor/emr?appointmentId=${apt.id}&patientId=${apt.patient.id}`}
                  className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 text-xs font-semibold hover:bg-primary-100 transition-colors">EMR</Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
