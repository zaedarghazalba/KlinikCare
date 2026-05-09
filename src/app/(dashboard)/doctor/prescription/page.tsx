"use client";

import { useEffect, useState } from "react";
import { Pill, Printer } from "lucide-react";

interface Record { id: string; diagnosis: string; createdAt: string; patient: { name: string }; prescriptions: { id: string; medicationName: string; dosage: string; instructions: string; quantity: number }[]; }

export default function PrescriptionPage() {
  const [records, setRecords] = useState<Record[]>([]);
  useEffect(() => { fetch("/api/medical-records").then(r => r.json()).then(d => setRecords((d.records || []).filter((r: Record) => r.prescriptions.length > 0))); }, []);

  const handlePrint = (recordId: string) => {
    const printContent = document.getElementById(`print-${recordId}`);
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore React state
    }
  };

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <h1 className="text-2xl font-bold text-gray-900">Resep Obat</h1>
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400"><Pill size={48} className="mx-auto mb-3 text-gray-300" /><p>Belum ada resep obat</p></div>
      ) : records.map(r => (
        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden relative">
          <button 
            onClick={() => handlePrint(r.id)} 
            className="absolute top-5 right-5 p-2 rounded-lg bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 transition-colors"
            title="Cetak Resep"
          >
            <Printer size={18} />
          </button>
          <div id={`print-${r.id}`} className="p-5">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900 hidden print:block mb-2">KlinikCare - Resep Dokter</h2>
              <p className="font-semibold text-gray-900">Pasien: {r.patient.name}</p>
              <p className="text-sm text-gray-500">Diagnosa: {r.diagnosis} · {new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 uppercase"><th className="pb-2">Obat</th><th className="pb-2">Dosis</th><th className="pb-2">Aturan Pakai</th><th className="pb-2">Qty</th></tr></thead>
              <tbody>{r.prescriptions.map(p => (
                <tr key={p.id} className="border-t border-gray-50"><td className="py-2 font-medium">{p.medicationName}</td><td className="py-2">{p.dosage}</td><td className="py-2">{p.instructions}</td><td className="py-2">{p.quantity}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
