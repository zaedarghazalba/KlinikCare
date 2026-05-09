"use client"

import { useEffect } from "react"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"

export default function DashboardErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar role="PATIENT" userName="User" />
      <div className="lg:pl-72">
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-xl shadow-card p-8 max-w-lg w-full text-center animate-fade-in">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Terjadi Kesalahan</h2>
              <p className="text-text-secondary">
                Terjadi kesalahan pada dashboard. Silakan coba lagi atau logout jika masalah berlanjut.
              </p>
              {error.digest && (
                <p className="text-xs text-text-tertiary mt-2">Error ID: {error.digest}</p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
              >
                Coba Lagi
              </button>
              <Link
                href="/"
                className="px-5 py-2 border border-gray-300 text-text-primary rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Kembali ke Dashboard
              </Link>
              <Link
                href="/api/auth/signout"
                className="px-5 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
