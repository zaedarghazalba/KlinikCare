"use client";

import { useEffect, useState, useRef } from "react";
import { BarChart3, Users, CalendarCheck, DollarSign, Pill, Printer, Download, Search, Calendar, Loader2, Heart } from "lucide-react";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils";

interface ReportData {
  patients?: { id: string; name: string; nik: string; phone: string; createdAt: string }[];
  appointments?: { id: string; queueNumber: number; patient: { name: string }; doctor: { name: string }; appointmentDate: string; status: string; timeSlot: string }[];
  payments?: { id: string; invoiceNumber: string; totalAmount: number; status: string; paidAt: string | null; createdAt: string; appointment: { patient: { name: string }; doctor: { name: string } } }[];
  medicines?: { id: string; name: string; category: string; stock: number; price: number }[];
  revenue?: { total: number };
}

const reportTypes = [
  { value: "patients", label: "Daftar Pasien", icon: Users },
  { value: "appointments", label: "Data Antrean", icon: CalendarCheck },
  { value: "payments", label: "Data Pembayaran", icon: DollarSign },
  { value: "medicines", label: "Inventory Obat", icon: Pill },
  { value: "revenue", label: "Pendapatan", icon: BarChart3 },
];

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("patients");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: reportType, limit: "50" });
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (search) params.append("search", search);

    try {
      const res = await fetch(`/api/reports/admin?${params}`);
      setData(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [reportType]);
  useEffect(() => {
    const timeout = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timeout);
  }, [dateFrom, dateTo]);

  const handlePrint = () => window.print();

  const handleExport = () => {
    let csv = "";
    if (reportType === "patients" && data?.patients) {
      csv = "No,Nama,NIK,Telepon,Tanggal\n" + data.patients.map((p, i) => `${i+1},"${p.name}","${p.nik}","${p.phone}","${new Date(p.createdAt).toLocaleDateString("id-ID")}"`).join("\n");
    }
    if (csv) {
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${reportType}_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-6 p-2 lg:p-0">
      {/* Screen UI - hidden when printing */}
      <div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-500 text-sm mt-1">Pilih jenis laporan dan filter tanggal</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {reportTypes.map(rt => (
              <button key={rt.value} onClick={() => setReportType(rt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${reportType === rt.value ? "gradient-primary text-white shadow-lg shadow-emerald-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                <rt.icon size={16} /> {rt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Dari" />
            <span className="text-gray-400">-</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Sampai" />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <button onClick={fetchData} className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium">Cari</button>
          <button onClick={handleExport} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          <button onClick={handlePrint} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium flex items-center gap-2">
            <Printer size={16} /> Cetak
          </button>
        </div>

        {(reportType === "revenue" || reportType === "payments") && data?.revenue && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
              <p className="text-emerald-100 text-sm">Total Pendapatan</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(data.revenue.total)}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Transaksi Lunas</p>
              <p className="text-3xl font-bold text-gray-900">{data.payments?.filter(p => p.status === "PAID").length || 0}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Menunggu</p>
              <p className="text-3xl font-bold text-amber-600">{data.payments?.filter(p => p.status !== "PAID").length || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Data Table - Screen Only */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {reportType === "patients" && <><th className="px-4 py-3 text-left font-medium text-gray-500">No</th><th className="px-4 py-3 text-left font-medium text-gray-500">Nama</th><th className="px-4 py-3 text-left font-medium text-gray-500">NIK</th><th className="px-4 py-3 text-left font-medium text-gray-500">Telepon</th><th className="px-4 py-3 text-left font-medium text-gray-500">Tanggal</th></>}
                {reportType === "appointments" && <><th className="px-4 py-3 text-left font-medium text-gray-500">No</th><th className="px-4 py-3 text-left font-medium text-gray-500">Antrean</th><th className="px-4 py-3 text-left font-medium text-gray-500">Pasien</th><th className="px-4 py-3 text-left font-medium text-gray-500">Dokter</th><th className="px-4 py-3 text-left font-medium text-gray-500">Jam</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th></>}
                {reportType === "payments" && <><th className="px-4 py-3 text-left font-medium text-gray-500">No</th><th className="px-4 py-3 text-left font-medium text-gray-500">Invoice</th><th className="px-4 py-3 text-left font-medium text-gray-500">Pasien</th><th className="px-4 py-3 text-left font-medium text-gray-500">Dokter</th><th className="px-4 py-3 text-right font-medium text-gray-500">Total</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th></>}
                {reportType === "medicines" && <><th className="px-4 py-3 text-left font-medium text-gray-500">No</th><th className="px-4 py-3 text-left font-medium text-gray-500">Nama</th><th className="px-4 py-3 text-left font-medium text-gray-500">Kategori</th><th className="px-4 py-3 text-center font-medium text-gray-500">Stok</th><th className="px-4 py-3 text-right font-medium text-gray-500">Harga</th></>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={24} /></td></tr>
              ) : (
                <>
                  {reportType === "patients" && data?.patients?.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{i+1}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.nik}</td>
                      <td className="px-4 py-3 text-gray-500">{p.phone}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))}
                  {reportType === "appointments" && data?.appointments?.map((a, i) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{i+1}</td>
                      <td className="px-4 py-3 font-bold">{String(a.queueNumber).padStart(3,"0")}</td>
                      <td className="px-4 py-3">{a.patient.name}</td>
                      <td className="px-4 py-3 text-gray-500">{a.doctor.name}</td>
                      <td className="px-4 py-3 text-gray-500">{a.timeSlot}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}>{getStatusLabel(a.status)}</span></td>
                    </tr>
                  ))}
                  {reportType === "payments" && data?.payments?.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{i+1}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.invoiceNumber}</td>
                      <td className="px-4 py-3">{p.appointment?.patient?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.appointment?.doctor?.name}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(p.totalAmount)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                    </tr>
                  ))}
                  {reportType === "medicines" && data?.medicines?.map((m, i) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{i+1}</td>
                      <td className="px-4 py-3 font-medium">{m.name}</td>
                      <td className="px-4 py-3 text-gray-500">{m.category || "-"}</td>
                      <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${m.stock > 10 ? "bg-emerald-50 text-emerald-700" : m.stock > 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{m.stock}</span></td>
                      <td className="px-4 py-3 text-right">{formatCurrency(m.price)}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT ONLY - Clean PDF Layout */}
      <div style={{ display: 'none' }} className="print-section">
        <div style={{ padding: '15mm', fontFamily: 'Arial, sans-serif', fontSize: '10pt' }}>
          
          {/* KOP: Header with Logo and Title */}
          <div style={{ borderBottom: '3px solid #10b981', paddingBottom: '12px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '45px', height: '45px', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Heart size={22} />
              </div>
              <div>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>KlinikCare</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Jl. Raya Klinik No. 123, Jakarta 12345</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Telp: (021) 123-4567 | Email: info@klinikcare.com</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', color: '#1f2937' }}>{reportTypes.find(r => r.value === reportType)?.label}</p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Periode: {dateFrom || dateTo ? `${dateFrom || "awal"} - ${dateTo || "sekarang"}` : "Semua Tanggal"}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Dicetak Tanggal: {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', fontSize: '10pt', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#ecfdf5' }}>
                <th style={{ textAlign: 'center', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46', width: '30px' }}>No</th>
                {reportType === "patients" && <>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Nama Lengkap</th>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>NIK</th>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>No. Telepon</th>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Tanggal Daftar</th>
                </>}
                {reportType === "appointments" && <>
                  <th style={{ textAlign: 'center', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46', width: '50px' }}>No. Antrean</th>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Nama Pasien</th>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Dokter</th>
                  <th style={{ textAlign: 'center', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Jam</th>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Status</th>
                </>}
                {reportType === "payments" && <>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Invoice</th>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Nama Pasien</th>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Dokter</th>
                  <th style={{ textAlign: 'right', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Jumlah</th>
                  <th style={{ textAlign: 'center', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Status</th>
                </>}
                {reportType === "medicines" && <>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46', width: '40%' }}>Nama Obat</th>
                  <th style={{ textAlign: 'left', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Kategori</th>
                  <th style={{ textAlign: 'center', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Stok</th>
                  <th style={{ textAlign: 'right', padding: '6px', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#065f46' }}>Harga Satuan</th>
                </>}
              </tr>
            </thead>
            <tbody>
              {reportType === "patients" && data?.patients?.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{i+1}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>{p.name}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '9pt' }}>{p.nik}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{p.phone}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
              {reportType === "appointments" && data?.appointments?.map((a, i) => (
                <tr key={a.id}>
                  <td style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>{String(a.queueNumber).padStart(3,"0")}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{a.patient.name}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{a.doctor.name}</td>
                  <td style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{a.timeSlot}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}><span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '8pt', backgroundColor: a.status === 'COMPLETED' ? '#d1fae5' : a.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7', color: a.status === 'COMPLETED' ? '#065f46' : a.status === 'CANCELLED' ? '#991b1b' : '#92400e' }}>{getStatusLabel(a.status)}</span></td>
                </tr>
              ))}
              {reportType === "payments" && data?.payments?.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '9pt' }}>{p.invoiceNumber}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{p.appointment?.patient?.name}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{p.appointment?.doctor?.name}</td>
                  <td style={{ textAlign: 'right', padding: '4px 6px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>{formatCurrency(p.totalAmount)}</td>
                  <td style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}><span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '8pt', backgroundColor: p.status === 'PAID' ? '#d1fae5' : p.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7', color: p.status === 'PAID' ? '#065f46' : p.status === 'CANCELLED' ? '#991b1b' : '#92400e' }}>{getStatusLabel(p.status)}</span></td>
                </tr>
              ))}
              {reportType === "medicines" && data?.medicines?.map((m, i) => (
                <tr key={m.id}>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>{m.name}</td>
                  <td style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{m.category || "-"}</td>
                  <td style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}><span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '8pt', backgroundColor: m.stock > 10 ? '#d1fae5' : m.stock > 0 ? '#fef3c7' : '#fee2e2', color: m.stock > 10 ? '#065f46' : m.stock > 0 ? '#92400e' : '#991b1b' }}>{m.stock}</span></td>
                  <td style={{ textAlign: 'right', padding: '4px 6px', borderBottom: '1px solid #e5e7eb' }}>{formatCurrency(m.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div style={{ marginTop: '15px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#9ca3af' }}>
            <span>Dokumen ini generated secara otomatis oleh Sistem KlinikCare</span>
            <span>Halaman 1</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            display: block !important;
          }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>
    </div>
  );
}