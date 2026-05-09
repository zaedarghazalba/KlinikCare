"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function AuthErrorPage({
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
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
          <h2 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-300 mb-4">
            Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mb-4">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
          >
            Coba Lagi
          </button>
          <Link
            href="/login"
            className="px-5 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-sm"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}
