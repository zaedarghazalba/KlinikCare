import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-100/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-accent-400"
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
          <h1 className="text-6xl font-bold text-white mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-300 mb-6">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau URL tidak valid.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
          >
            Kembali ke Sebelumnya
          </Link>
        </div>
      </div>
    </div>
  )
}
