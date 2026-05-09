"use client";

import { useEffect, useState, useCallback } from "react";
import { getStatusColor, getStatusLabel, getQueueDisplay } from "@/lib/utils";
import { RefreshCw, PhoneCall, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface Appointment {
  id: string; queueNumber: number; status: string; timeSlot: string;
  patient: { name: string; phone: string };
  doctor: { name: string; specialization: string };
}

const statusFlow: Record<string, string> = {
  WAITING: "CHECKED_IN", CHECKED_IN: "IN_CONSULTATION", IN_CONSULTATION: "COMPLETED",
};

export default function QueueManagement() {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchQueue = useCallback(() => {
    fetch(`/api/appointments?date=${selectedDate}`).then(r => r.json()).then(d => setQueue(d.appointments || []));
  }, [selectedDate]);

  useEffect(() => { fetchQueue(); const interval = setInterval(fetchQueue, 5000); return () => clearInterval(interval); }, [fetchQueue]);

  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    await fetch(`/api/appointments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchQueue(); setLoading(false);
  };

  const filteredQueue = selectedDoctor ? queue.filter(a => a.doctor.name === selectedDoctor) : queue;

  const currentlyServing = filteredQueue.find(a => a.status === "IN_CONSULTATION");
  const waiting = filteredQueue.filter(a => a.status === "WAITING");
  const checkedIn = filteredQueue.filter(a => a.status === "CHECKED_IN");
  const completed = filteredQueue.filter(a => a.status === "COMPLETED");

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Manajemen Antrean</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola antrean pasien</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <select 
            value={selectedDoctor} 
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Semua Dokter</option>
            {Array.from(new Set(queue.map(a => a.doctor.name))).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button onClick={fetchQueue} className="p-2.5 rounded-xl border border-gray-200 hover:bg-white transition-colors bg-white">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Current serving */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl shadow-emerald-200">
        <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-2">Sedang Dilayani</p>
        {currentlyServing ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-6xl font-bold queue-number">{getQueueDisplay(currentlyServing.queueNumber)}</p>
              <p className="text-xl mt-2 font-medium">{currentlyServing.patient.name}</p>
              <p className="text-emerald-100 text-sm">{currentlyServing.doctor.name} — {currentlyServing.doctor.specialization}</p>
            </div>
            <button onClick={() => updateStatus(currentlyServing.id, "COMPLETED")} disabled={loading}
              className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur text-white font-semibold text-sm transition-all flex items-center gap-2">
              <CheckCircle2 size={18} /> Selesai
            </button>
          </div>
        ) : (
          <p className="text-3xl font-bold opacity-50">—</p>
        )}
      </div>

      {/* Queue summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
          <p className="text-3xl font-bold text-amber-600">{waiting.length}</p>
          <p className="text-sm text-gray-500 mt-1">Menunggu</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
          <p className="text-3xl font-bold text-blue-600">{checkedIn.length}</p>
          <p className="text-sm text-gray-500 mt-1">Check-in</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
          <p className="text-3xl font-bold text-emerald-600">{completed.length}</p>
          <p className="text-sm text-gray-500 mt-1">Selesai</p>
        </div>
      </div>

      {/* Queue list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Antrean</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {filteredQueue.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              {selectedDate === new Date().toISOString().split("T")[0] 
                ? "Belum ada antrean hari ini" 
                : `Belum ada antrean pada ${new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
            </div>
          ) : filteredQueue.map(apt => (
            <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-800 font-bold text-lg queue-number">
                {getQueueDisplay(apt.queueNumber)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{apt.patient.name}</p>
                <p className="text-xs text-gray-400">{apt.doctor.name} · {apt.timeSlot}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
              <div className="flex gap-1">
                {statusFlow[apt.status] && (
                  <button onClick={() => updateStatus(apt.id, statusFlow[apt.status])} disabled={loading}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Lanjutkan">
                    <ArrowRight size={16} />
                  </button>
                )}
                {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                  <button onClick={() => updateStatus(apt.id, "CANCELLED")} disabled={loading}
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Batalkan">
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
