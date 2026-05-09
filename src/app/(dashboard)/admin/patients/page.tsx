"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, X, User, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Patient {
  id: string; medicalRecordNumber: string; name: string; nik: string;
  birthDate: string; gender: string; address: string; phone: string; allergies: string | null;
  _count: { appointments: number; medicalRecords: number };
}

const initialForm = { name: "", nik: "", birthDate: "", gender: "MALE", address: "", phone: "", allergies: "" };

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPatients = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', '1');
    params.set('limit', '100');
    fetch(`/api/patients?${params.toString()}`, { credentials: 'include' })
      .then(async (r) => {
        console.log("Patients response:", r.status);
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch patients:', r.status, errorData);
          setPatients([]);
          return;
        }
        const d = await r.json();
        console.log("Patients data:", d);
        setPatients(d.patients || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch((err) => {
        console.error('Error fetching patients:', err);
        setPatients([]);
      });
  };

  useEffect(() => { fetchPatients(); }, [search, page]);

  const openAdd = () => { setEditing(null); setForm(initialForm); setShowModal(true); };
  const openEdit = (p: Patient) => {
    setEditing(p);
    setForm({ name: p.name, nik: p.nik, birthDate: p.birthDate.split("T")[0], gender: p.gender, address: p.address, phone: p.phone, allergies: p.allergies || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const url = editing ? `/api/patients/${editing.id}` : "/api/patients";
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowModal(false); fetchPatients();
    } catch (err) {
      console.error('Failed to save patient:', err);
      alert('Gagal menyimpan data pasien');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pasien ini?")) return;
    try {
      const res = await fetch(`/api/patients/${id}`, { 
        method: "DELETE",
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchPatients();
    } catch (err) {
      console.error('Failed to delete patient:', err);
      alert('Gagal menghapus pasien');
    }
  };

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Manajemen Pasien</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data pasien klinik</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all" id="btn-add-patient">
          <Plus size={18} /> Tambah Pasien
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-gray-200 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 max-w-md transition-all">
        <Search size={18} className="text-gray-400" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama, NIK, atau no. rekam medis..." className="bg-transparent outline-none text-sm flex-1" id="search-patient" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/50">
              <th className="px-6 py-4">No. RM</th><th className="px-6 py-4">Nama</th><th className="px-6 py-4">NIK</th>
              <th className="px-6 py-4">Tgl Lahir</th><th className="px-6 py-4">Telepon</th><th className="px-6 py-4">Kunjungan</th><th className="px-6 py-4 text-right">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {patients.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-400"><User size={40} className="mx-auto mb-3 text-gray-300" />Belum ada data pasien</td></tr>
              ) : patients.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4"><span className="inline-flex px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold">{p.medicalRecordNumber}</span></td>
                  <td className="px-6 py-4 font-medium text-gray-900 text-sm">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{p.nik}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(p.birthDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p._count.appointments}x</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? "Edit Pasien" : "Tambah Pasien"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { key: "name", label: "Nama Lengkap", type: "text" },
                { key: "nik", label: "NIK", type: "text" },
                { key: "birthDate", label: "Tanggal Lahir", type: "date" },
                { key: "phone", label: "No. Telepon", type: "tel" },
                { key: "address", label: "Alamat", type: "text" },
                { key: "allergies", label: "Riwayat Alergi", type: "text" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    required={key !== "allergies"} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Kelamin</label>
                <select value={form.gender} onChange={e => setForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                  <option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : editing ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
