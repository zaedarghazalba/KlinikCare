"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Calendar, User, Stethoscope, Loader2, X, Printer } from "lucide-react";

interface Certificate {
  id: string;
  certificateNumber: string;
  diagnosis: string;
  restDays: number;
  startDate: string;
  endDate: string;
  issuedAt: string;
  notes: string | null;
  doctor: { name: string; specialization: string };
  medicalRecord: {
    patient: { name: string; nik: string };
    appointment: { appointmentDate: string };
  };
}

export default function PatientCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState<Certificate | null>(null);

  useEffect(() => {
    fetch("/api/medical-certificates")
      .then(r => r.json())
      .then(d => {
        setCertificates(d.certificates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Surat Keterangan Sakit</h1>
        <p className="text-gray-500 text-sm mt-1">Riwayat surat keterangan sakit Anda</p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">Belum ada surat keterangan sakit</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="text-emerald-600" size={20} />
                    <span className="font-mono text-xs text-gray-400">{cert.certificateNumber}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{cert.diagnosis}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><User size={14} /> {cert.medicalRecord.patient.name}</span>
                    <span className="flex items-center gap-1"><Stethoscope size={14} /> {cert.doctor.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-lg font-medium">Istirahat {cert.restDays} hari</span>
                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-lg">
                      {new Date(cert.startDate).toLocaleDateString("id-ID")} - {new Date(cert.endDate).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setPrinting(cert)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
                >
                  <Printer size={16} /> Cetak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print Modal */}
      {printing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold">Preview Surat Sakit</h2>
              <button onClick={() => setPrinting(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            {/* Print Preview */}
            <div id="certificate-print" className="p-8 text-sm">
              <div className="text-center border-b-2 border-emerald-500 pb-4 mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">KlinikCare</h1>
                    <p className="text-xs text-gray-500">Jl. Raya Klinik No. 123, Jakarta 12345</p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">SURAT KETERANGAN SAKIT</h2>
                <p className="text-xs text-gray-500">No: {printing.certificateNumber}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">Yang bertanda tangan bawah ini, dokter KlinikCare menyatakan bahwa:</p>
                <table className="w-full mt-4">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-600 w-32">Nama Pasien</td>
                      <td className="py-1 font-semibold">: {printing.medicalRecord.patient.name}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">NIK</td>
                      <td className="py-1 font-semibold">: {printing.medicalRecord.patient.nik}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">Diagnosa</td>
                      <td className="py-1 font-semibold">: {printing.diagnosis}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">Dokter</td>
                      <td className="py-1 font-semibold">: {printing.doctor.name}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">Dengan ini menyatakan bahwasannya pasien tersebut perlu beristirahat di rumah selama <span className="font-bold">{printing.restDays} ({printing.restDays === 1 ? "satu" : printing.restDays === 2 ? "dua" : printing.restDays === 3 ? "tiga" : printing.restDays.toString()}) hari</span> terhitung dari tanggal <span className="font-bold">{new Date(printing.startDate).toLocaleDateString("id-ID")}</span> sampai dengan <span className="font-bold">{new Date(printing.endDate).toLocaleDateString("id-ID")}</span>, karena {printing.diagnosis.toLowerCase()}.</p>
                {printing.notes && <p className="mt-2 text-gray-700"><strong>Catatan:</strong> {printing.notes}</p>}
              </div>

              <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Tanggal Issued</p>
                  <p className="font-semibold">{new Date(printing.issuedAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-8">Tanda Tangan Dokter</p>
                  <p className="font-semibold text-emerald-600">{printing.doctor.name}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setPrinting(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium">Tutup</button>
              <button onClick={() => window.print()} className="flex-1 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
                <Printer size={16} /> Cetak / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          * { visibility: hidden; }
          #certificate-print, #certificate-print * { visibility: visible; }
          #certificate-print { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>
    </div>
  );
}