"use client";

import { useEffect, useState } from "react";
import { getStatusColor, getStatusLabel, getQueueDisplay } from "@/lib/utils";
import { ArrowRight, FileText, ChevronDown, ChevronUp, Eye, X, Loader2, Pill } from "lucide-react";

interface Appointment {
  id: string; queueNumber: number; status: string; timeSlot: string;
  patient: { id: string; name: string; phone: string };
}

interface MedicalRecord {
  id: string;
  complaint: string;
  diagnosis: string;
  treatment: string;
  vitalSigns?: string;
  notes?: string;
  createdAt: string;
  doctor: { id: string; name: string };
  prescriptions?: { id: string; medicationName: string; dosage: string; instructions?: string }[];
}

export default function DoctorQueuePage() {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<Record<string, MedicalRecord[]>>({});
  const [loadingRecords, setLoadingRecords] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<MedicalRecord | null>(null);

  const fetchQueue = () => {
    fetch(`/api/appointments?date=${selectedDate}`).then(r => r.json()).then(d => setQueue(d.appointments || []));
  };

  useEffect(() => { fetchQueue(); const interval = setInterval(fetchQueue, 5000); return () => clearInterval(interval); }, [selectedDate]);

  const toggleHistory = async (patientId: string) => {
    if (expandedPatient === patientId) {
      setExpandedPatient(null);
      return;
    }
    setExpandedPatient(patientId);
    if (!medicalRecords[patientId]) {
      setLoadingRecords(patientId);
      try {
        const res = await fetch(`/api/medical-records?patientId=${patientId}&limit=100`);
        const data = await res.json();
        setMedicalRecords(prev => ({ ...prev, [patientId]: data.records || [] }));
      } catch (e) {
        console.error(e);
      }
      setLoadingRecords(null);
    }
  };

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-xl lg:text-2xl font-bold text-gray-900">Antrean Pasien</h1><p className="text-gray-500 text-sm mt-1">Panggil pasien berikutnya</p></div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button onClick={fetchQueue} className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-200 flex items-center gap-2">
            Panggil Berikutnya <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {queue.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            {selectedDate === new Date().toISOString().split("T")[0] 
              ? "Belum ada pasien hari ini" 
              : `Belum ada pasien pada ${new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
          </div>
        ) : queue.map(apt => (
          <div key={apt.id}>
            <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-700 font-bold text-lg">{getQueueDisplay(apt.queueNumber)}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{apt.patient.name}</p>
                <p className="text-sm text-gray-400">{apt.timeSlot}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
              
              <button 
                onClick={() => toggleHistory(apt.patient.id)}
                  className="px-3 py-2 rounded-xl bg-primary-50 text-primary-600 text-xs font-semibold hover:bg-primary-100 transition-colors flex items-center gap-1"
              >
                <FileText size={14} /> 
                {expandedPatient === apt.patient.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {apt.status === "IN_CONSULTATION" && (
                <a href={`/doctor/emr?appointmentId=${apt.id}&patientId=${apt.patient.id}`}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
                  Buka EMR
                </a>
              )}
              {(apt.status === "WAITING" || apt.status === "CHECKED_IN") && (
                <button onClick={async () => {
                  await fetch(`/api/appointments/${apt.id}`, { 
                    method: "PUT", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ status: "IN_CONSULTATION" }) 
                  });
                  fetchQueue();
                }} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-semibold hover:bg-emerald-100 transition-colors">
                  Panggil
                </button>
              )}
            </div>

            {expandedPatient === apt.patient.id && (
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                {loadingRecords === apt.patient.id ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                  </div>
                ) : medicalRecords[apt.patient.id]?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileText size={40} className="mx-auto mb-2 opacity-30" />
                    <p>Belum ada rekam medis untuk pasien ini</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Riwayat Rekam Medis</div>
                    {medicalRecords[apt.patient.id]?.map(record => (
                      <div key={record.id} className="p-4 rounded-xl border border-gray-200 bg-white flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <p className="font-medium text-gray-900 mt-1">{record.diagnosis || "-"}</p>
                          <p className="text-sm text-gray-500">Keluhan: {record.complaint || "-"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-emerald-600 font-medium">{record.doctor?.name || "-"}</span>
                          <button 
                            onClick={() => setSelectedRecord(record)}
                            className="px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1"
                          >
                            <Eye size={12} /> Detail
                          </button>
                        </div>
                      </div>
                    ))}

                    {medicalRecords[apt.patient.id]?.some(r => r.prescriptions && r.prescriptions.length > 0) && (
                      <>
                        <div className="text-sm font-medium text-gray-700 mt-4 mb-2">Riwayat Resep Obat</div>
                        {medicalRecords[apt.patient.id]?.filter(r => r.prescriptions && r.prescriptions.length > 0).map(record => (
                          <div key={record.id} className="p-4 rounded-xl border border-gray-200 bg-white flex justify-between items-center">
                            <div>
                              <span className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                              <p className="font-medium text-gray-900 mt-1">{record.diagnosis || "-"}</p>
                              <p className="text-sm text-gray-500">{record.prescriptions?.length} obat</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-emerald-600 font-medium">{record.doctor?.name || "-"}</span>
                              <button 
                                onClick={() => setSelectedPrescription(record)}
                                className="px-3 py-2 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors flex items-center gap-1"
                              >
                                <Pill size={12} /> Lihat Resep
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">Detail Rekam Medis</h2>
                <p className="text-sm text-gray-500">{new Date(selectedRecord.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 uppercase">Dokter</span>
                    <p className="font-medium text-gray-900 mt-1">{selectedRecord.doctor?.name || "-"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 uppercase">Diagnosa</span>
                    <p className="font-medium text-gray-900 mt-1">{selectedRecord.diagnosis || "-"}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <span className="text-xs text-gray-500 uppercase">Keluhan</span>
                  <p className="font-medium text-gray-900 mt-1">{selectedRecord.complaint || "-"}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <span className="text-xs text-gray-500 uppercase">Tindakan</span>
                  <p className="font-medium text-gray-900 mt-1">{selectedRecord.treatment || "-"}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <span className="text-xs text-gray-500 uppercase">Vital Signs</span>
                  <p className="font-medium text-gray-900 mt-1">{selectedRecord.vitalSigns || "-"}</p>
                </div>
                {selectedRecord.notes && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 uppercase">Catatan</span>
                    <p className="font-medium text-gray-900 mt-1">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">Resep Obat</h2>
                <p className="text-sm text-gray-500">{new Date(selectedPrescription.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <button onClick={() => setSelectedPrescription(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {selectedPrescription.prescriptions && selectedPrescription.prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {selectedPrescription.prescriptions.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{p.medicationName}</p>
                          <p className="text-sm text-gray-500 mt-1">{p.dosage}</p>
                          {p.instructions && <p className="text-xs text-gray-400 mt-1">{p.instructions}</p>}
                        </div>
                        <span className="text-xs text-gray-400">#{idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Pill size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Tidak ada resep obat</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}