"use client";

import { useEffect, useState } from "react";
import { Pill, CheckCircle2, Clock, Search, AlertCircle, Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  quantity: number;
  status: "PENDING" | "DISPENSED";
  unitPrice: number;
  createdAt: string;
  medicalRecord: {
    patient: { name: string; id: string };
    doctor: { name: string };
    appointment: { id: string };
  };
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

interface PatientGroup {
  patient: { name: string; id: string } | undefined;
  doctor: { name: string } | undefined;
  prescriptions: Prescription[];
  allDispensed: boolean;
  createdAt: string;
}

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"prescriptions" | "inventory">("prescriptions");
  const [rxFilter, setRxFilter] = useState<"pending" | "completed">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState("");
  const [medForm, setMedForm] = useState({ name: "", category: "Tablet", stock: 0, price: 0 });

  const fetchData = () => {
    fetch("/api/prescriptions").then(r => r.json()).then(d => setPrescriptions(d.prescriptions || []));
    fetch("/api/medicines").then(r => r.json()).then(d => setMedicines(d.medicines || []));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (!isModalOpen) fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [isModalOpen]);

  const handleDispense = async (id: string) => {
    setLoading(true);
    await fetch("/api/prescriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "DISPENSED" }),
    });
    fetchData();
    setLoading(false);
  };

  const handleDispenseAll = async (prescriptions: Prescription[]) => {
    setLoading(true);
    for (const p of prescriptions.filter(p => p.status === "PENDING")) {
      await fetch("/api/prescriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, status: "DISPENSED" }),
      });
    }
    fetchData();
    setLoading(false);
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = modalMode === "add" ? "/api/medicines" : `/api/medicines/${editingId}`;
    const method = modalMode === "add" ? "POST" : "PATCH";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medForm),
    });
    
    setIsModalOpen(false);
    fetchData();
    setLoading(false);
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm("Yakin ingin menghapus obat ini dari inventaris?")) return;
    setLoading(true);
    await fetch(`/api/medicines/${id}`, { method: "DELETE" });
    fetchData();
    setLoading(false);
  };

  const openAddModal = () => {
    setModalMode("add");
    setMedForm({ name: "", category: "Tablet", stock: 0, price: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medicine) => {
    setModalMode("edit");
    setEditingId(med.id);
    setMedForm({ name: med.name, category: med.category || "Tablet", stock: med.stock, price: med.price });
    setIsModalOpen(true);
  };

  // Group prescriptions by patient + appointment (separate each visit)
  const patientGroups = prescriptions.reduce((groups: Record<string, PatientGroup>, p) => {
    const patientName = p.medicalRecord?.patient?.name || "Unknown";
    const appointmentId = p.medicalRecord?.appointment?.id || "unknown";
    const groupKey = `${patientName}-${appointmentId}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        patient: p.medicalRecord?.patient,
        doctor: p.medicalRecord?.doctor,
        prescriptions: [],
        allDispensed: true,
        createdAt: p.createdAt
      };
    }
    groups[groupKey].prescriptions.push(p);
    if (p.status !== "DISPENSED") {
      groups[groupKey].allDispensed = false;
    }
    return groups;
  }, {} as Record<string, PatientGroup>);

  const groups = Object.values(patientGroups);
  const pendingCount = prescriptions.filter(p => p.status === "PENDING").length;
  const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard Apotek</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola resep pasien dan inventaris obat</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl self-start lg:self-auto">
          <button onClick={() => setActiveTab("prescriptions")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "prescriptions" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
            Resep Masuk
          </button>
          <button onClick={() => setActiveTab("inventory")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "inventory" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
            Inventaris Obat
          </button>
        </div>
      </div>

      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          {/* Filter resep */}
          <div className="flex gap-2">
            <button onClick={() => setRxFilter("pending")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${rxFilter === "pending" ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              Menunggu ({prescriptions.filter(p => p.status === "PENDING").length})
            </button>
            <button onClick={() => setRxFilter("completed")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${rxFilter === "completed" ? "bg-emerald-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              Diserahkaan ({prescriptions.filter(p => p.status === "DISPENSED").length})
            </button>
          </div>
          
          {groups.filter(g => rxFilter === "pending" ? !g.allDispensed : g.allDispensed).length === 0 ? (
             <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
               <Pill size={48} className="mx-auto mb-3 text-gray-200" />
               <p>{rxFilter === "pending" ? "Tidak ada resep yang menunggu" : "Belum ada resep yang diserahkan"}</p>
             </div>
          ) : (
            groups.filter(g => rxFilter === "pending" ? !g.allDispensed : g.allDispensed).map((group, idx) => (
              <div key={idx} className={`bg-white rounded-2xl border p-5 transition-all ${group.allDispensed ? "border-emerald-200" : "border-amber-200 shadow-sm shadow-amber-50"}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.patient?.name || "Pasien"}</h3>
                    <p className="text-xs text-gray-500">Dr. {group.doctor?.name} · {new Date(group.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${group.allDispensed ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {group.allDispensed ? "Selesai" : "Menunggu"}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6">
                  {group.prescriptions.map((p) => (
                    <div key={p.id} className={`flex justify-between items-center p-3 rounded-xl ${p.status === "DISPENSED" ? "bg-emerald-50" : "bg-gray-50"}`}>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.medicationName}</p>
                        <p className="text-xs text-gray-500">{p.dosage} · {p.instructions}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Qty</p>
                        <p className="font-bold text-gray-900">{p.quantity}</p>
                        {p.status === "DISPENSED" && (
                          <p className="text-xs text-emerald-600">{formatCurrency(p.unitPrice * p.quantity)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {!group.allDispensed && (
                  <button 
                    onClick={() => handleDispenseAll(group.prescriptions)} 
                    disabled={loading} 
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Serahkan Semua Obat
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-semibold text-gray-900">Database Obat</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Cari obat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <button onClick={openAddModal} className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:shadow-lg transition-all">
                <Plus size={16} /> Tambah Obat
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3 font-medium">Nama Obat</th>
                  <th className="px-6 py-3 font-medium">Kategori</th>
                  <th className="px-6 py-3 font-medium">Stok</th>
                  <th className="px-6 py-3 font-medium">Harga</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMedicines.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 group">
                    <td className="px-6 py-4 font-medium text-gray-900">{m.name}</td>
                    <td className="px-6 py-4 text-gray-500">{m.category || "-"}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{m.stock}</td>
                    <td className="px-6 py-4 text-gray-500">Rp {m.price.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 text-center">
                      {m.stock > 10 ? (
                        <span className="text-emerald-600 text-xs font-semibold px-2 py-1 bg-emerald-50 rounded-md">Tersedia</span>
                      ) : m.stock > 0 ? (
                        <span className="text-amber-600 text-xs font-semibold px-2 py-1 bg-amber-50 rounded-md">Menipis</span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold px-2 py-1 bg-red-50 rounded-md">Habis</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(m)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors" title="Edit Obat"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteMedicine(m.id)} disabled={loading} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors" title="Hapus Obat"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Obat tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">{modalMode === "add" ? "Tambah Obat Baru" : "Edit Obat"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveMedicine} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Obat</label>
                <input type="text" value={medForm.name} onChange={(e) => setMedForm({...medForm, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                <select value={medForm.category} onChange={(e) => setMedForm({...medForm, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white">
                  <option value="Tablet">Tablet</option>
                  <option value="Kapsul">Kapsul</option>
                  <option value="Sirup">Sirup</option>
                  <option value="Salep">Salep</option>
                  <option value="Obat Tetes">Obat Tetes</option>
                  <option value="Alat Kesehatan">Alat Kesehatan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok</label>
                  <input type="number" min="0" value={medForm.stock} onChange={(e) => setMedForm({...medForm, stock: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Dasar (Rp)</label>
                  <input type="number" min="0" value={medForm.price} onChange={(e) => setMedForm({...medForm, price: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" required />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm transition-all">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
