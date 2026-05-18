"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Save, Plus, Trash2, CheckCircle2, FileBadge } from "lucide-react";
import { Suspense } from "react";

function EMRContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") || "";
  const patientId = searchParams.get("patientId") || "";

  const [form, setForm] = useState({ complaint: "", diagnosis: "", treatment: "", notes: "" });
  const [vitals, setVitals] = useState({ bloodPressure: "", heartRate: "", temperature: "", weight: "", height: "" });
  const [prescriptions, setPrescriptions] = useState([{ medicationName: "", dosage: "", instructions: "", quantity: 1, medicineId: "" }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState("");
  const [history, setHistory] = useState<{ id: string; complaint: string; diagnosis: string; treatment: string; createdAt: string; doctor: { name: string } }[]>([]);
  const [medicines, setMedicines] = useState<{ id: string; name: string; stock: number; price: number }[]>([]);

  // Simple static ICD-10 list for demo
  const icd10Codes = [
    "J00 - Acute nasopharyngitis (common cold)",
    "J01 - Acute sinusitis",
    "J02 - Acute pharyngitis",
    "J03 - Acute tonsillitis",
    "J04 - Acute laryngitis and tracheitis",
    "J20 - Acute bronchitis",
    "A09 - Infectious gastroenteritis and colitis",
    "K29 - Gastritis and duodenitis",
    "I10 - Essential (primary) hypertension",
    "E11 - Type 2 diabetes mellitus",
    "R50 - Fever of other and unknown origin",
    "R51 - Headache"
  ];

  useEffect(() => {
    if (patientId) {
      fetch(`/api/medical-records?patientId=${patientId}`).then(r => r.json()).then(d => setHistory(d.records || []));
    }
    fetch("/api/medicines").then(r => r.json()).then(d => setMedicines(d.medicines || []));
  }, [patientId]);

  const addPrescription = () => setPrescriptions(prev => [...prev, { medicationName: "", dosage: "", instructions: "", quantity: 1, medicineId: "" }]);
  const removePrescription = (i: number) => setPrescriptions(prev => prev.filter((_, idx) => idx !== i));
  const updatePrescription = (i: number, key: string, value: string | number) => {
    setPrescriptions(prev => prev.map((p, idx) => {
      if (idx === i) {
        let updates = { [key]: value };
        // If medicineName is selected from datalist, automatically set the ID
        if (key === "medicationName") {
          const matchedMed = medicines.find(m => m.name === value);
          if (matchedMed) updates = { ...updates, medicineId: matchedMed.id };
        }
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId || !patientId) return;
    setLoading(true);
    setSuccess(false);
    
    // Convert vitals: empty strings to undefined, string numbers to numbers
    const processedVitals = vitals.bloodPressure ? { ...vitals } : undefined;
    if (processedVitals) {
      const vitalKeys = ["heartRate", "temperature", "weight", "height"];
      vitalKeys.forEach(key => {
        const val = processedVitals[key as keyof typeof processedVitals];
        if (val === "" || val === undefined) {
          delete processedVitals[key as keyof typeof processedVitals];
        } else {
          const numVal = parseFloat(val as string);
          if (!isNaN(numVal)) {
            (processedVitals as Record<string, number | string>)[key as string] = numVal;
          }
        }
      });
    }
    
    const validPrescriptions = prescriptions.filter(p => p.medicationName);
    try {
      const res = await fetch("/api/medical-records", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, patientId, appointmentId, vitalSigns: processedVitals, prescriptions: validPrescriptions }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Gagal menyimpan: ${data.error || "Terjadi kesalahan"}${data.details ? `\n${JSON.stringify(data.details)}` : ""}`);
        setLoading(false);
        return;
      }
      if (data.record) setSavedRecordId(data.record.id);
      setSuccess(true);
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan rekam medis");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-8 lg:py-12 px-4 animate-scale-in">
        <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-emerald-600 lg:text-40" /></div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Rekam Medis Tersimpan</h2>
        <p className="text-gray-500 mb-4">Data rekam medis pasien berhasil disimpan.</p>
        {prescriptions.some(p => p.medicationName) && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 lg:mb-8">
            <p className="text-blue-800 font-medium">Resep obat telah dikirim ke Apoteker</p>
            <p className="text-blue-600 text-sm mt-1">Apoteker akan memproses dan menyerahkan obat kepada pasien</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <a href="/doctor/queue" className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-200 block">
            Kembali ke Antrean
          </a>
          <a href={`/doctor/medical-certificate?appointmentId=${appointmentId}&patientId=${patientId}&medicalRecordId=${savedRecordId}`} className="w-full py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 font-semibold block hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
            <FileBadge size={18} /> Buat Surat Sakit
          </a>
        </div>
      </div>
    );
  }

  if (!appointmentId || !patientId) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Pilih pasien dari antrean untuk membuka rekam medis</p>
      </div>
    );
  }

  return (
    <div className="p-2 lg:p-0 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <div className="lg:col-span-2 space-y-4 lg:space-y-6">
        <div className="px-2 lg:px-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Rekam Medis Elektronik</h1>
          <p className="text-gray-500 text-sm mt-1">Input data pemeriksaan pasien</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
          {/* Vital Signs */}
          <div className="bg-white rounded-2xl p-4 lg:p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Tanda Vital</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: "bloodPressure", label: "Tekanan Darah", ph: "120/80" },
                { key: "heartRate", label: "Detak Jantung", ph: "80 bpm" },
                { key: "temperature", label: "Suhu (°C)", ph: "36.5" },
                { key: "weight", label: "Berat (kg)", ph: "65" },
                { key: "height", label: "Tinggi (cm)", ph: "170" },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input type="text" value={vitals[key as keyof typeof vitals]} onChange={e => setVitals(prev => ({ ...prev, [key]: e.target.value }))} placeholder={ph}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Medical data */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900">Data Pemeriksaan</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keluhan</label>
              <textarea value={form.complaint} onChange={e => setForm(prev => ({ ...prev, complaint: e.target.value }))} placeholder="Keluhan pasien..." rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Diagnosa (ICD-10)</label>
              <input type="text" list="icd10-list" value={form.diagnosis} onChange={e => setForm(prev => ({ ...prev, diagnosis: e.target.value }))} placeholder="Pilih atau ketik diagnosa..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required />
              <datalist id="icd10-list">
                {icd10Codes.map(code => <option key={code} value={code} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tindakan</label>
              <textarea value={form.treatment} onChange={e => setForm(prev => ({ ...prev, treatment: e.target.value }))} placeholder="Tindakan yang dilakukan..." rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Tambahan</label>
              <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Catatan tambahan..." rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" />
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-white rounded-2xl p-4 lg:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 lg:mb-4">
              <h3 className="font-semibold text-gray-900">Resep Obat</h3>
              <button type="button" onClick={addPrescription} className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium hover:text-emerald-700"><Plus size={16} /> Tambah</button>
            </div>
            <div className="space-y-3">
              <datalist id="medicine-list">
                {medicines.map(m => <option key={m.id} value={m.name}>{m.name} (Stok: {m.stock})</option>)}
              </datalist>

              {prescriptions.map((p, i) => (
                <div key={`prescription-${i}`} className="flex flex-col sm:flex-row gap-2 sm:items-start">
                  <div className="flex-1">
                    <input type="text" list="medicine-list" placeholder="Pilih obat..." value={p.medicationName} onChange={e => updatePrescription(i, "medicationName", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                  <input type="text" placeholder="Dosis" value={p.dosage} onChange={e => updatePrescription(i, "dosage", e.target.value)}
                    className="flex-1 sm:w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  <input type="text" placeholder="Aturan" value={p.instructions} onChange={e => updatePrescription(i, "instructions", e.target.value)}
                    className="flex-1 sm:w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  <input type="number" min="1" placeholder="Qty" value={p.quantity} onChange={e => updatePrescription(i, "quantity", parseInt(e.target.value))}
                    className="w-16 sm:w-14 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  {prescriptions.length > 1 && (
                    <button type="button" onClick={() => removePrescription(i)} className="p-2 text-red-400 hover:text-red-600 self-center"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Simpan Rekam Medis</>}
          </button>
        </form>
      </div>

      {/* History sidebar */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 px-2">Riwayat Rekam Medis Pasien</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 px-2">Belum ada riwayat rekam medis</p>
        ) : history.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-start">
              <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
              <span className="text-xs text-emerald-600 font-medium">{r.doctor?.name || "-"}</span>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2">{r.diagnosis || "-"}</p>
            <p className="text-xs text-gray-500 mt-1">Keluhan: {r.complaint || "-"}</p>
            {r.treatment && <p className="text-xs text-gray-500 mt-1">Tindakan: {r.treatment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EMRPage() {
  return <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={24} /></div>}><EMRContent /></Suspense>;
}
