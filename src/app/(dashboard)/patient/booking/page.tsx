"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarCheck, Stethoscope, Clock, CheckCircle2, Loader2 } from "lucide-react";

interface Doctor { id: string; name: string; specialization: string; schedule: Record<string, string[]>; }

export default function BookingPage() {
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ queueNumber: number; qrCode: string } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Record<string, number>>({});
  const MAX_PER_SLOT = 3;

  useEffect(() => {
    fetch("/api/doctors").then(r => r.json()).then(d => setDoctors(d.doctors || []));
    // Get patient ID
    fetch("/api/patients?search=&page=1&limit=100").then(r => r.json()).then(d => {
      const patients = d.patients || [];
      const myPatient = patients.find((p: { userId: string }) => p.userId === session?.user?.id);
      if (myPatient) setPatientId(myPatient.id);
      else if (patients.length > 0) setPatientId(patients[0].id);
    });
  }, [session]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const dayOfWeek = new Date(selectedDate).getDay();
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const schedule = selectedDoctor.schedule as Record<string, string[]>;
      setAvailableSlots(schedule[days[dayOfWeek]] || []);

      // Fetch booked slots for the chosen date
      fetch(`/api/appointments/slots?doctorId=${selectedDoctor.id}&date=${selectedDate}`)
        .then(r => r.json())
        .then(data => {
          if (data.slotCounts) setBookedSlots(data.slotCounts);
        });
    } else {
      setBookedSlots({});
    }
  }, [selectedDoctor, selectedDate]);

  const [error, setError] = useState("");

    const handleBook = async () => {
    if (!patientId || !selectedDoctor || !selectedDate || !selectedTime) return;
    setLoading(true); setError("");
    
    // Format appointmentDate to ISO string for validation
    // z.string().datetime() expects ISO 8601 format
    // Create date in local timezone then convert to ISO
    const [year, month, day] = selectedDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const appointmentDateISO = localDate.toISOString();
    
    const res = await fetch("/api/appointments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        patientId, 
        doctorId: selectedDoctor.id, 
        appointmentDate: appointmentDateISO, 
        timeSlot: selectedTime 
      }),
    });
    const data = await res.json();
    
    if (res.ok) { 
      // API returns the appointment object directly
      setResult({ 
        queueNumber: data.queueNumber, 
        qrCode: data.qrCode 
      }); 
      setStep(4); 
    } else {
      setError(data.error || data.details?.map((d: any) => d.message).join(", ") || "Gagal melakukan booking. Silakan coba lagi.");
    }
    setLoading(false);
  };

  const today = new Date().toISOString().split("T")[0];

  if (step === 4 && result) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"><CheckCircle2 size={40} className="text-emerald-600" /></div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Berhasil!</h1>
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Nomor Antrean Anda</p>
          <p className="text-6xl font-bold text-emerald-600 queue-number">{result.queueNumber.toString().padStart(3, "0")}</p>
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3">QR Code Check-in</p>
            {result.qrCode && <img src={result.qrCode} alt="QR Code" className="mx-auto w-40 h-40 rounded-xl" />}
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p><strong>Dokter:</strong> {selectedDoctor?.name}</p>
            <p><strong>Tanggal:</strong> {selectedDate}</p>
            <p><strong>Jam:</strong> {selectedTime}</p>
          </div>
        </div>
        <button onClick={() => { setStep(1); setResult(null); setSelectedDoctor(null); setSelectedDate(""); setSelectedTime(""); }}
          className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
          Booking Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-2 lg:p-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Kunjungan</h1>
        <p className="text-gray-500 text-sm mt-1">Pilih dokter, tanggal, dan jam kunjungan</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {["Pilih Dokter", "Pilih Tanggal", "Konfirmasi"].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</div>
            <span className={`text-sm ${step === i + 1 ? "text-gray-900 font-medium" : "text-gray-400"} hidden sm:block`}>{label}</span>
            {i < 2 && <div className={`flex-1 h-0.5 ${step > i + 1 ? "bg-emerald-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="grid gap-3 animate-slide-up">
          {doctors.map(doc => (
            <button key={doc.id} onClick={() => { setSelectedDoctor(doc); setStep(2); }}
              className="bg-white rounded-2xl p-5 border border-gray-100 text-left hover:border-emerald-300 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{doc.name}</h3>
                  <p className="text-sm text-gray-500">{doc.specialization}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Dokter: <span className="text-emerald-600 font-semibold">{selectedDoctor?.name}</span></p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tanggal</label>
            <input type="date" min={today} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
          </div>
          {selectedDate && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Jam</label>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada jadwal tersedia pada hari ini</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map(slot => {
                    const booked = bookedSlots[slot] || 0;
                    const isFull = booked >= MAX_PER_SLOT;
                    return (
                      <button key={slot} onClick={() => !isFull && setSelectedTime(slot)} disabled={isFull}
                        className={`px-4 py-2 flex flex-col items-center justify-center rounded-xl text-sm transition-all ${isFull ? "bg-red-50 text-red-400 border border-red-100 cursor-not-allowed opacity-70" : selectedTime === slot ? "gradient-primary text-white shadow-lg shadow-emerald-200" : "border border-gray-200 hover:border-emerald-300 text-gray-700"}`}>
                        <div className="flex items-center justify-center font-medium"><Clock size={14} className="mr-1.5" />{slot}</div>
                        {isFull && <span className="text-[10px] mt-0.5 font-bold uppercase tracking-wider">Penuh</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Kembali</button>
            <button onClick={() => selectedTime && setStep(3)} disabled={!selectedTime}
              className="flex-1 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50">Lanjutkan</button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-4">Konfirmasi Booking</h3>
            {[
              { label: "Dokter", value: `${selectedDoctor?.name} (${selectedDoctor?.specialization})` },
              { label: "Tanggal", value: selectedDate },
              { label: "Jam", value: selectedTime },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-scale-in text-center font-medium">
              {error}
              {error.includes("Validation error") && (
                <div className="mt-2 text-xs text-red-500">
                  Pastikan semua field sudah diisi dengan benar
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setStep(2); setError(""); }} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Kembali</button>
            <button onClick={handleBook} disabled={loading}
              className="flex-1 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><CalendarCheck size={16} /> Konfirmasi Booking</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
