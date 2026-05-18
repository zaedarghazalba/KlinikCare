"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Edit, Trash2, X, Loader2, Stethoscope, UserCog, Shield } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  doctor?: {
    specialization: string;
    consultationFee: number;
  };
}

const roleOptions = [
  { value: "ADMIN", label: "Admin", icon: Shield },
  { value: "DOCTOR", label: "Dokter", icon: Stethoscope },
  { value: "PHARMACY", label: "Apoteker", icon: UserCog },
  { value: "OWNER", label: "Pemilik", icon: Users },
];

const specializationOptions = [
  "Umum Gigi Anak Kandungan Penyakit Dalam",
];

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "ADMIN",
    specialization: "Umum",
    consultationFee: 50000,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      
      const res = await fetch(`/api/staff?${params}`);
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, [search, roleFilter]);

  const openModal = (s?: Staff) => {
    if (s) {
      setEditingStaff(s);
      setFormData({
        name: s.name,
        email: s.email,
        phone: "",
        password: "",
        role: s.role,
        specialization: s.doctor?.specialization || "Umum",
        consultationFee: s.doctor?.consultationFee || 50000,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "ADMIN",
        specialization: "Umum",
        consultationFee: 50000,
      });
    }
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingStaff) {
        const res = await fetch(`/api/staff?id=${editingStaff.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Gagal memperbarui");
      } else {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal membuat staff");
        }
      }
      setShowModal(false);
      fetchStaff();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus staff ini?")) return;
    
    try {
      const res = await fetch(`/api/staff?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      console.log("Delete response:", data);
      if (!res.ok) {
        alert(data.error || "Gagal menghapus");
        return;
      }
      fetchStaff();
    } catch (e) {
      console.error(e);
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Kelola Pegawai</h1>
          <p className="text-gray-500 text-sm mt-1">Tambah, ubah, atau hapus akun staff</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-emerald-200">
          <Plus size={18} /> Tambah Pegawai
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
        >
          <option value="">Semua Role</option>
          <option value="ADMIN">Admin</option>
          <option value="DOCTOR">Dokter</option>
          <option value="PHARMACY">Apoteker</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Spesialisasi</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Bergabung</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={24} /></td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Belum ada staff</td></tr>
              ) : (
                staff.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.role === "ADMIN" ? "bg-primary-50 text-primary-700" :
                        s.role === "DOCTOR" ? "bg-primary-50 text-primary-700" :
                        s.role === "OWNER" ? "bg-primary-50 text-primary-700" :
                        "bg-primary-50 text-primary-700"
                      }`}>
                        {s.role === "ADMIN" ? "Admin" : s.role === "DOCTOR" ? "Dokter" : s.role === "OWNER" ? "Pemilik" : "Apoteker"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.doctor?.specialization || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(s)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{editingStaff ? "Edit Pegawai" : "Tambah Pegawai"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  required
                  disabled={!!editingStaff}
                />
              </div>
              
              {!editingStaff && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    required={!editingStaff}
                    placeholder={editingStaff ? "Kosongkan jika tidak diubah" : ""}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                >
                  {roleOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              
              {formData.role === "DOCTOR" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi</label>
                    <select
                      value={formData.specialization}
                      onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    >
                      {specializationOptions[0].split(" ").map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Konsultasi</label>
                    <input
                      type="number"
                      value={formData.consultationFee}
                      onChange={e => setFormData({ ...formData, consultationFee: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : editingStaff ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}