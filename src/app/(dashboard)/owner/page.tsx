"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, DollarSign, TrendingUp, BarChart3, Activity, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils";

interface Stats {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  dailyStats: { date: string; day: string; count: number }[];
}

interface Appointment {
  id: string;
  queueNumber: number;
  status: string;
  timeSlot: string;
  patient: { name: string };
  doctor: { name: string; specialization: string };
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState("daily");
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch(`/api/reports?period=${period}`).then(r => r.json()).then(setStats);
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/appointments?date=${today}`).then(r => r.json()).then(d => setRecentAppointments(d.appointments || []));
  }, [period]);

  const maxCount = Math.max(...(stats?.dailyStats || []).map(d => d.count), 1);

  const cards = [
    { label: "Total Pasien", value: stats?.totalPatients || 0, icon: Users, color: "from-primary-500 to-primary-600", bg: "bg-primary-50", text: "text-primary-600" },
    { label: "Selesai", value: stats?.completedAppointments || 0, icon: CheckCircle2, color: "from-primary-500 to-primary-600", bg: "bg-primary-50", text: "text-primary-600" },
    { label: "Pendapatan", value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: "from-primary-500 to-primary-600", bg: "bg-primary-50", text: "text-primary-600", span: "col-span-1 md:col-span-2" },
  ];

  return (
    <div className="space-y-6 p-2 lg:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard Owner</h1>
          <p className="text-gray-500 text-sm mt-1">Monitoring performa klinik</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { key: "daily", label: "Hari Ini" },
            { key: "weekly", label: "Minggu Ini" },
            { key: "monthly", label: "Bulan Ini" }
          ].map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all ${card.span || ""}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={20} className={card.text} />
              </div>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Tren Kunjungan</h3>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">{period === "daily" ? "7 Hari Terakhir" : period === "weekly" ? "4 Minggu Terakhir" : "12 Bulan Terakhir"}</span>
          </div>
          <div className="h-48 flex items-end gap-2 lg:gap-4 px-2">
            {(stats?.dailyStats || []).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative" style={{ height: '140px' }}>
                  <div 
                    className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '8px' : '0' }}
                  />
                </div>
                <span className="text-[10px] lg:text-xs font-semibold text-gray-700">{d.count}</span>
                <span className="text-[10px] text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={20} className="text-emerald-100" />
            <h3 className="font-semibold">Ringkasan Cepat</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100 text-sm">Tingkat Penyelesaian</span>
              <span className="font-bold">{stats && stats.totalAppointments > 0 ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${stats && stats.totalAppointments > 0 ? (stats.completedAppointments / stats.totalAppointments) * 100 : 0}%` }} />
            </div>
            <div className="pt-4 border-t border-white/20 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-100">Rata-rata per hari</span>
                <span className="font-semibold">{Math.round((stats?.totalAppointments || 0) / 7)} pasien</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-100">Pendapatan rata-rata</span>
                <span className="font-semibold">{formatCurrency((stats?.totalRevenue || 0) / 7)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Queue */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Antrean Hari Ini</h3>
          <Link href="/owner/reports" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Lihat Semua →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Belum ada antrean hari ini</div>
          ) : (
            recentAppointments.slice(0, 5).map(apt => (
              <div key={apt.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-sm flex items-center justify-center">
                  {String(apt.queueNumber).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{apt.patient.name}</p>
                  <p className="text-xs text-gray-500">{apt.doctor.name} • {apt.timeSlot}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                  {getStatusLabel(apt.status)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Link to Reports */}
      <Link href="/owner/reports" className="flex items-center gap-4 bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <BarChart3 size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">Laporan Lengkap</h3>
          <p className="text-sm text-gray-500">Analisis detail performa klinik</p>
        </div>
      </Link>
    </div>
  );
}