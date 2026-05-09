"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FileText, Clock, ChevronDown, ChevronUp, Pill } from "lucide-react";

interface Record {
  id: string;
  createdAt: string;
  complaint: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  doctor: { name: string; specialization: string };
  prescriptions: { medicationName: string; dosage: string; instructions: string }[];
}

export default function PatientRecordsPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Get patient ID
    fetch("/api/patients?search=&page=1&limit=100")
      .then(r => r.json())
      .then(d => {
        const patients = d.patients || [];
        const myPatient = patients.find((p: { userId: string }) => p.userId === session?.user?.id);
        if (myPatient) {
          fetch(`/api/medical-records?patientId=${myPatient.id}`)
            .then(r => r.json())
            .then(data => {
              setRecords(data.records || []);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  }, [session]);

  if (loading) {
    return <div className="py-12 text-center text-gray-500 animate-pulse">Memuat riwayat medis...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-2 lg:p-0 animate-scale-in">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Riwayat Medis</h1>
        <p className="text-gray-500 text-sm mt-1">Rekam jejak pemeriksaan kesehatan Anda</p>
      </div>

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400">
            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Belum ada riwayat medis</p>
          </div>
        ) : records.map((record) => {
          const isExpanded = expandedId === record.id;
          const dateStr = new Date(record.createdAt).toLocaleDateString("id-ID", {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          });

          return (
            <div key={record.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all shadow-sm hover:shadow-md">
              <div 
                className="p-5 cursor-pointer flex items-center justify-between hover:bg-gray-50/50"
                onClick={() => setExpandedId(isExpanded ? null : record.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.diagnosis || "Pemeriksaan Umum"}</h3>
                    <p className="text-sm text-gray-500">{dateStr} · {record.doctor?.name || "Dokter"}</p>
                  </div>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 border-t border-gray-100 bg-gray-50/30 space-y-4 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Keluhan</p>
                      <p className="text-sm text-gray-900">{record.complaint}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tindakan</p>
                      <p className="text-sm text-gray-900">{record.treatment}</p>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Catatan Dokter</p>
                      <p className="text-sm text-gray-900">{record.notes}</p>
                    </div>
                  )}

                  {record.prescriptions && record.prescriptions.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-3 text-emerald-600">
                        <Pill size={16} />
                        <p className="text-sm font-semibold">Resep Obat</p>
                      </div>
                      <div className="space-y-2">
                        {record.prescriptions.map((p, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{p.medicationName}</p>
                              <p className="text-xs text-gray-500">{p.instructions}</p>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{p.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
