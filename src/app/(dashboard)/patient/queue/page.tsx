"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getStatusColor, getStatusLabel, getQueueDisplay } from "@/lib/utils";
import { RefreshCw, Clock } from "lucide-react";

interface Appointment {
  id: string; queueNumber: number; status: string; timeSlot: string; qrCode?: string;
  appointmentDate: string;
  doctor: { name: string; specialization: string };
}

export default function PatientQueuePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const fetchQueue = useCallback(async () => {
    try {
      setError(null);
      // Fetch all appointments for the patient (not just today)
      const res = await fetch(`/api/appointments`, {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const d = await res.json();
      
      if (d.error) {
        throw new Error(d.error);
      }
      
      setAppointments(d.appointments || []);
    } catch (err) {
      console.error("Failed to fetch queue:", err);
      setError(err instanceof Error ? err.message : 'Gagal mengambil data antrean');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      // Use setTimeout to avoid calling setState synchronously in effect
      const timeout = setTimeout(() => fetchQueue(), 0);
      const interval = setInterval(fetchQueue, 3000);
      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [sessionStatus, fetchQueue]);

  // Filter appointments based on selected status
  const filteredAppointments = appointments
    .filter(a => a.status !== "CANCELLED")
    .filter(a => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return ["WAITING", "CHECKED_IN", "IN_CONSULTATION"].includes(a.status);
      if (statusFilter === "completed") return a.status === "COMPLETED";
      return a.status === statusFilter;
    })
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  if (sessionStatus === "loading" || isLoading) {
    return <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="text-gray-500">Memuat antrean...</div>
    </div>;
  }

  if (!session) {
    return <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="text-gray-500">Silakan login terlebih dahulu</div>
    </div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-2 lg:p-0">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Antrean Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Lihat semua antrean Anda (Selesai, Menunggu, atau Periksa)</p>
        </div>
        <button onClick={fetchQueue} className="p-2.5 rounded-xl border border-gray-200 hover:bg-white bg-white transition-colors flex items-center justify-center">
          <RefreshCw size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: "all", label: "Semua" },
          { key: "active", label: "Aktif" },
          { key: "WAITING", label: "Menunggu" },
          { key: "CHECKED_IN", label: "Check-in" },
          { key: "IN_CONSULTATION", label: "Diperiksa" },
          { key: "completed", label: "Selesai" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              statusFilter === key
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Show filtered appointments */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-6">
          {filteredAppointments.map((apt) => {
            const isActive = ["WAITING", "CHECKED_IN", "IN_CONSULTATION"].includes(apt.status);
            return (
              <div key={apt.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in">
                {/* Main Queue Card */}
                <div className={`rounded-3xl p-8 text-white text-center shadow-xl relative overflow-hidden ${
                  isActive ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-gray-500 to-gray-600"
                }`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

                  <div className="relative z-10">
                    <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-6">Nomor Antrean</p>
                    <p className="text-8xl font-bold queue-number mb-6 tracking-tighter">{getQueueDisplay(apt.queueNumber)}</p>
                    <span className={`inline-flex px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold tracking-wide ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>

                {/* Details & QR Card */}
                <div className="flex flex-col gap-6">
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center">
                    <p className="text-sm font-medium text-gray-500 mb-4">QR Code Check-in</p>
                    {apt.qrCode ? (
                      <div className="p-3 rounded-2xl border border-gray-100 bg-gray-50">
                        <img src={apt.qrCode} alt="QR Code" className="w-36 h-36 rounded-xl" />
                      </div>
                    ) : (
                      <div className="w-36 h-36 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                        <p className="text-xs">Tidak tersedia</p>
                      </div>
                    )}
                    <p className="text-emerald-600 text-sm mt-4 font-semibold">Tunjukkan saat tiba di klinik</p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Dokter</span>
                      <span className="text-sm font-bold text-gray-900">{apt.doctor?.name || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Spesialisasi</span>
                      <span className="text-sm font-bold text-gray-900">{apt.doctor?.specialization || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Tanggal Periksa</span>
                      <span className="text-sm font-bold text-gray-900">
                        {new Date(apt.appointmentDate).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Jam Perkiraan</span>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{apt.timeSlot}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center text-gray-400 shadow-sm">
          <Clock size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-600">Tidak ada antrean</p>
          <p className="text-sm mt-2">Anda belum mendaftar antrean apa pun.</p>
        </div>
      )}
    </div>
  );
}
