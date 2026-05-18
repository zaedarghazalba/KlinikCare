"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Printer, CreditCard, CheckCircle2, Clock, XCircle, DollarSign, Loader2 } from "lucide-react";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: "PENDING" | "AWAITING_MEDICINE" | "READY_FOR_PAYMENT" | "PAID" | "CANCELLED";
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
  appointment: {
    patient: { name: string; nik: string };
    doctor: { name: string; specialization: string; consultationFee?: number };
    appointmentDate: string;
    medicalRecord?: {
      prescriptions?: Array<{
        id: string;
        unitPrice: number;
        quantity: number;
        medicine?: { name: string };
        medicationName: string;
        dosage: string;
      }>;
    };
  };
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [payModal, setPayModal] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paying, setPaying] = useState(false);
  const [receiptData, setReceiptData] = useState<Invoice | null>(null);

  // Calculate total including medicines for display
  const getDisplayTotal = (invoice: Invoice) => {
    const consultationFee = invoice.appointment?.doctor?.consultationFee || 150000;
    let medicineTotal = 0;
    if (invoice.appointment?.medicalRecord?.prescriptions) {
      medicineTotal = invoice.appointment.medicalRecord.prescriptions.reduce(
        (sum: number, rx: { unitPrice: number; quantity: number }) => sum + (rx.unitPrice * rx.quantity), 0
      );
    }
    return consultationFee + medicineTotal;
  };

  const handlePay = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/billing/${payModal.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      if (res.ok) {
        setPayModal(null);
        fetchData();
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setPaying(false);
    }
  };
  const [summary, setSummary] = useState({ pendingCount: 0, paidCount: 0, todayPaid: 0, awaitingMedicineCount: 0 });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (searchQuery) params.set("search", searchQuery);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const queryString = params.toString();
    fetch(`/api/billing${queryString ? `?${queryString}` : ""}`)
      .then((r) => r.json())
       .then((d: { invoices?: Invoice[]; pendingCount?: number; paidCount?: number; todayPaid?: number; awaitingMedicineCount?: number }) => {
        setInvoices(d.invoices || []);
        setSummary({
          pendingCount: d.pendingCount || 0,
          paidCount: d.paidCount || 0,
          todayPaid: d.todayPaid || 0,
          awaitingMedicineCount: d.awaitingMedicineCount || 0,
        });
      })
      .finally(() => setLoading(false));
  }, [statusFilter, searchQuery, dateFrom, dateTo]);

useEffect(() => {
    const timeout = setTimeout(() => fetchData(), 0);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Billing & Kasir</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola tagihan dan pembayaran pasien</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><Clock size={20} className="text-orange-600" /></div>
            <p className="text-sm text-gray-500">Menunggu Obat</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.awaitingMedicineCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><Clock size={20} className="text-primary-600" /></div>
            <p className="text-sm text-gray-500">Menunggu Bayar</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><CheckCircle2 size={20} className="text-emerald-600" /></div>
            <p className="text-sm text-gray-500">Sudah Lunas</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.paidCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><DollarSign size={20} className="text-primary-600" /></div>
            <p className="text-sm text-gray-500">Pendapatan Hari Ini</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.todayPaid)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 print:hidden">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {["all", "PENDING", "AWAITING_MEDICINE", "READY_FOR_PAYMENT", "PAID", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
              >
                {s === "all" ? "Semua" : s === "AWAITING_MEDICINE" ? "Menunggu Obat" : s === "READY_FOR_PAYMENT" ? "Siap Bayar" : getStatusLabel(s)}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Cari invoice / pasien / dokter..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          </div>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          <button onClick={fetchData} className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium">Cari</button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Pasien</th>
                <th className="px-4 py-3 font-medium">Dokter</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium">Tgl Bayar</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Tidak ada tagihan</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{inv.appointment?.patient?.name || "-"}</p>
                      <p className="text-xs text-gray-400">{new Date(inv.appointment?.appointmentDate).toLocaleDateString("id-ID")}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{inv.appointment?.doctor?.name || "-"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(getDisplayTotal(inv))}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(inv.status)}`}>
                        {getStatusLabel(inv.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === "PENDING" && (
                          <button onClick={() => setPayModal(inv)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors">
                            <CreditCard size={14} /> Bayar
                          </button>
                        )}
                        {inv.status === "READY_FOR_PAYMENT" && (
                          <button onClick={() => setPayModal(inv)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors">
                            <CreditCard size={14} /> Bayar
                          </button>
                        )}
                        {inv.status === "AWAITING_MEDICINE" && (
                          <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-600 text-xs font-semibold">
                            <Clock size={14} /> Menunggu Obat
                          </span>
                        )}
                        {inv.status === "PAID" && (
                          <button onClick={() => { setReceiptData(inv); setTimeout(() => window.print(), 100); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 text-xs font-semibold hover:bg-primary-100 transition-colors">
                            <Printer size={14} /> Cetak
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Proses Pembayaran</h3>
              <button onClick={() => setPayModal(null)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"><XCircle size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Rincian Pembayaran */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Invoice</span>
                  <span className="font-mono font-medium">{payModal.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pasien</span>
                  <span className="font-medium">{payModal.appointment?.patient?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dokter</span>
                  <span className="font-medium">{payModal.appointment?.doctor?.name}</span>
                </div>
                
                {/* breakdown */}
                <div className="border-t border-gray-200 pt-3 mt-2 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Rincian Pembayaran:</p>
                  
                  {/* Biaya Konsultasi */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Biaya Konsultasi</span>
                    <span className="font-medium">{formatCurrency(payModal.appointment?.doctor?.consultationFee || 150000)}</span>
                  </div>
                  
                  {/* Medicines */}
                  {payModal.appointment?.medicalRecord?.prescriptions?.map((rx, idx) => (
                    <div key={idx} className="flex justify-between text-sm pl-2">
                      <span className="text-gray-500">{rx.medicationName} ({rx.dosage}) x{rx.quantity}</span>
                      <span className="font-medium">{formatCurrency(rx.unitPrice * rx.quantity)}</span>
                    </div>
                  ))}
                  
                  {(payModal.appointment?.medicalRecord?.prescriptions?.length ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal Obat</span>
                      <span className="font-medium">{formatCurrency(
                        (payModal.appointment?.medicalRecord?.prescriptions || []).reduce((sum, rx) => sum + (rx.unitPrice * rx.quantity), 0)
                      )}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total Tagihan</span>
                    <span className="font-bold text-lg text-emerald-600">{formatCurrency(getDisplayTotal(payModal))}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod("CASH")} className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === "CASH" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <DollarSign size={20} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-sm font-medium">Tunai</p>
                  </button>
                  <button onClick={() => setPaymentMethod("TRANSFER")} className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === "TRANSFER" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <CreditCard size={20} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-sm font-medium">Transfer</p>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setPayModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">Batal</button>
                <button onClick={handlePay} disabled={paying} className="flex-1 px-4 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {paying ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Konfirmasi Bayar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Print Area */}
      {receiptData && (
        <div className="hidden print:block fixed inset-0 bg-white z-50 p-8">
          <div className="max-w-xs mx-auto text-center">
            <h2 className="text-xl font-bold mb-1">KlinikCare</h2>
            <p className="text-xs text-gray-500 mb-4">Jl. Contoh No. 123 - Telp: (021) 1234567</p>
            <div className="border-t border-b border-gray-300 py-2 mb-3">
              <p className="text-xs font-mono">{receiptData.invoiceNumber}</p>
              <p className="text-xs text-gray-500">{receiptData.paidAt ? new Date(receiptData.paidAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
            </div>
            <div className="text-left text-xs space-y-1 mb-3">
              <p>Pasien: <span className="font-medium">{receiptData.appointment?.patient?.name}</span></p>
              <p>Dokter: <span className="font-medium">{receiptData.appointment?.doctor?.name}</span></p>
            </div>
            
            {/* Biaya Konsultasi */}
            <div className="text-left text-xs mb-2">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span>Biaya Konsultasi</span>
                <span>{formatCurrency(receiptData.appointment?.doctor?.consultationFee || 150000)}</span>
              </div>
            </div>
            
            {/* Prescribed Medicines */}
            {receiptData.appointment?.medicalRecord?.prescriptions && receiptData.appointment.medicalRecord.prescriptions.length > 0 && (
              <div className="text-left text-xs mb-3">
                <p className="font-bold border-b border-gray-300 pb-1 mb-2">Resep Obat:</p>
                {receiptData.appointment.medicalRecord.prescriptions.map((rx: { id: string; medicine?: { name: string }; medicationName: string; dosage: string; quantity: number; unitPrice: number }) => (
                  <div key={rx.id} className="flex justify-between py-1">
                    <span>{rx.medicine?.name || rx.medicationName} ({rx.dosage}) x{rx.quantity}</span>
                    <span>{formatCurrency(rx.unitPrice * rx.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-b border-gray-300 py-2 mb-3">
              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL</span>
                <span>{formatCurrency(getDisplayTotal(receiptData))}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Metode: {receiptData.paymentMethod === "CASH" ? "Tunai" : "Transfer"}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 mb-4">
              <p className="text-center text-emerald-800 font-medium text-sm">🙏</p>
              <p className="text-center text-emerald-700 text-xs mt-1">Thank you for trusting our service</p>
              <p className="text-center text-emerald-600 text-xs mt-1">Get well soon! / Lekas Sembuh!</p>
              <p className="text-center text-emerald-600 text-xs">Semoga lekas sembuh! 💚</p>
            </div>
            <p className="text-xs text-gray-400 mt-4">Terima kasih, lekas sembuh!</p>
          </div>
        </div>
      )}
    </div>
  );
}
