"use client";

import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardNotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar role="PATIENT" userName="User" />
      <div className="lg:pl-72">
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-xl shadow-card p-8 max-w-lg w-full text-center animate-fade-in">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-accent-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Halaman Tidak Ditemukan</h2>
              <p className="text-text-secondary">
                Halaman yang Anda cari tidak tersedia di dashboard.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="px-5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
              >
                Kembali ke Dashboard
              </Link>
              <button
                onPointerDown={() => window.history.back()}
                className="px-5 py-2 border border-gray-300 text-text-primary rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
