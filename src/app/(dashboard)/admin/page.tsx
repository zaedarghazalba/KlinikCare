"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, Clock, XCircle, TrendingUp } from "lucide-react";
import { getStatusColor, getStatusLabel, getQueueDisplay } from "@/lib/utils";

interface Stats {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  dailyStats: { date: string; day: string; count: number }[];
}

interface Appointment {
  id: string;
  queueNumber: number;
  status: string;
  timeSlot: string;
  patient: { name: string; phone: string };
  doctor: { name: string; specialization: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayQueue, setTodayQueue] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch("/api/reports?period=daily").then(r => r.json()).then(setStats);
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/appointments?date=${today}`).then(r => r.json()).then(d => setTodayQueue(d.appointments || []));
  }, []);

  useEffect(() => {
    fetch("/api/reports?period=daily").then(r => r.json()).then(setStats);
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/appointments?date=${today}`).then(r => r.json()).then(d => setTodayQueue(d.appointments || []));
  }, []);

  const statCards = [
    { label: "Total Pasien", value: stats?.totalPatients || 0, icon: <Users size={22} />, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-200" },
    { label: "Antrean Hari Ini", value: stats?.totalAppointments || 0, icon: <Clock size={22} />, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-200" },
    { label: "Selesai", value: stats?.completedAppointments || 0, icon: <CalendarCheck size={22} />, color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-200" },
    { label: "Dibatalkan", value: stats?.cancelledAppointments || 0, icon: <XCircle size={22} />, color: "from-red-400 to-red-500", shadow: "shadow-red-200" },
  ];

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan operasional klinik hari ini</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} ${card.shadow} shadow-lg flex items-center justify-center text-white`}>
                {card.icon}
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Pasien 7 Hari Terakhir</h3>
        <div className="h-48 flex items-end gap-3 px-4">
          {(stats?.dailyStats || []).map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">{d.count}</span>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500" style={{ height: `${Math.max((d.count / Math.max(...(stats?.dailyStats || []).map(x => x.count), 1)) * 140, 8)}px` }} />
              <span className="text-xs text-gray-500">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Queue */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Antrean Hari Ini</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">No.</th>
                <th className="px-6 py-4">Pasien</th>
                <th className="px-6 py-4">Dokter</th>
                <th className="px-6 py-4">Jam</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {todayQueue.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Belum ada antrean hari ini</td></tr>
              ) : todayQueue.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm queue-number">
                      {getQueueDisplay(apt.queueNumber)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 text-sm">{apt.patient.name}</p>
                    <p className="text-xs text-gray-400">{apt.patient.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{apt.doctor.name}</p>
                    <p className="text-xs text-gray-400">{apt.doctor.specialization}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{apt.timeSlot}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
