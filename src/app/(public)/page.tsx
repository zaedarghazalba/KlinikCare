import Link from "next/link";
import { prisma } from "@/lib/db";
import TemplateScripts from "@/components/TemplateScripts";
import LoadingScreen from "@/components/LoadingScreen";
import PageContent from "@/components/PageContent";

const TEMPLATE_CSS = [
  "/template/assets/vendor/bootstrap/css/bootstrap.min.css",
  "/template/assets/vendor/bootstrap-icons/bootstrap-icons.css",
  "/template/assets/vendor/aos/aos.css",
  "/template/assets/vendor/glightbox/css/glightbox.min.css",
  "/template/assets/vendor/fontawesome-free/css/all.min.css",
  "/template/assets/vendor/swiper/swiper-bundle.min.css",
  "/template/assets/css/main.css",
]

const TEMPLATE_FONTS = "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"

async function getDoctors() {
  try {
    return await prisma.doctor.findMany({
      take: 6,
      orderBy: { name: "asc" },
    })
  } catch {
    return []
  }
}

async function getClinicSettings() {
  try {
    return await prisma.clinicSettings.findFirst()
  } catch {
    return null
  }
}

export default async function LandingPage() {
  const [doctors, settings] = await Promise.all([getDoctors(), getClinicSettings()])

  const clinicName = settings?.clinicName || "KlinikCare"
  const clinicAddress = settings?.address || "Jl. Merdeka Raya No. 123, Jakarta Selatan"
  const clinicPhone = settings?.phone || "021-5550123"
  const clinicEmail = settings?.email || "info@klinikcare.com"

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preload" href={TEMPLATE_FONTS} as="style" />
      <link rel="stylesheet" href={TEMPLATE_FONTS} />
      {TEMPLATE_CSS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <LoadingScreen />
      <PageContent>
      <style>{`
        .header {
          z-index: 1000;
        }

        .header .branding .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .header .navmenu {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .header .navmenu ul {
          display: flex;
          align-items: center;
          margin: 0;
          padding: 0;
          list-style: none;
          gap: 4px;
        }

        .header .auth-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-left: 24px;
          padding-left: 24px;
          border-left: 1px solid rgba(60, 64, 73, 0.15);
        }

        .header .btn-get-in {
          font-family: var(--nav-font, "Lato", sans-serif);
          font-size: 14px;
          font-weight: 600;
          color: var(--nav-color, #3c4049);
          background: transparent;
          border: 2px solid transparent;
          border-radius: 6px;
          padding: 8px 20px;
          text-decoration: none;
          transition: all 0.3s ease;
          letter-spacing: 0.3px;
          white-space: nowrap;
          line-height: 1.2;
        }

        .header .btn-get-in:hover {
          color: var(--nav-hover-color, #175cdd);
          background: rgba(23, 92, 221, 0.06);
          text-decoration: none;
        }

        .header .btn-book {
          font-family: var(--nav-font, "Lato", sans-serif);
          font-size: 14px;
          font-weight: 600;
          color: var(--contrast-color, #ffffff);
          background: var(--accent-color, #175cdd);
          border: 2px solid var(--accent-color, #175cdd);
          border-radius: 6px;
          padding: 8px 20px;
          text-decoration: none;
          transition: all 0.3s ease;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 8px rgba(23, 92, 221, 0.25);
          white-space: nowrap;
          line-height: 1.2;
        }

        .header .btn-book:hover {
          background: color-mix(in srgb, var(--accent-color, #175cdd), transparent 15%);
          border-color: color-mix(in srgb, var(--accent-color, #175cdd), transparent 15%);
          color: var(--contrast-color, #ffffff);
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(23, 92, 221, 0.35);
          transform: translateY(-1px);
        }

        .header .btn-book:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(23, 92, 221, 0.2);
        }

        .header .nav-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header .mobile-nav-toggle {
          color: var(--nav-color, #3c4049);
          font-size: 28px;
          line-height: 0;
          margin-left: 8px;
          transition: 0.3s;
          cursor: pointer;
        }

        .hero.section {
          padding-top: 180px;
        }

        @media (max-width: 1199px) {
          .header .auth-buttons {
            margin-left: 0;
            padding-left: 0;
            border-left: none;
            gap: 6px;
          }

          .header .btn-get-in,
          .header .btn-book {
            font-size: 13px;
            padding: 7px 14px;
          }

          .hero.section {
            padding-top: 160px;
          }
        }

        @media (max-width: 575px) {
          .header .branding .container {
            gap: 8px;
          }

          .header .branding .logo h1.sitename {
            font-size: 20px;
          }

          .header .auth-buttons {
            gap: 4px;
          }

          .header .btn-get-in,
          .header .btn-book {
            font-size: 12px;
            padding: 6px 10px;
          }

          .header .mobile-nav-toggle {
            font-size: 24px;
            margin-left: 4px;
          }

          .hero.section {
            padding-top: 150px;
          }

          .topbar .contact-info i + i {
            margin-left: 12px !important;
          }

          .topbar .contact-info {
            font-size: 12px;
          }

          .hero .hero-content .hero-actions .btn {
            padding: 0.75rem 1.25rem !important;
            font-size: 14px;
            width: 100%;
          }

          .home-about .about-content .cta-section {
            justify-content: center;
            text-align: center;
          }

          .home-about .about-content .cta-section .btn-primary {
            display: inline-block;
            text-align: center;
          }
        }

        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 1;
          transition: opacity 0.3s ease;
        }

        .loading-screen.fade-out {
          opacity: 0;
        }

        .loading-content {
          text-align: center;
        }

        .loading-logo {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0ea5e9;
        }

        .loading-logo svg {
          width: 48px;
          height: 48px;
          position: relative;
          z-index: 2;
        }

        .pulse-ring {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #0ea5e9;
          opacity: 0;
          animation: pulseRing 1.5s ease-out infinite;
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        .loading-bar {
          width: 200px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
          margin: 0 auto 16px;
        }

        .loading-bar-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #0ea5e9, #38bdf8);
          border-radius: 2px;
          animation: loadingBar 1s ease-in-out forwards;
        }

        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }

        @keyframes pulseRing {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        .loading-text {
          font-family: var(--nav-font, "Lato", sans-serif);
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          letter-spacing: 0.5px;
          margin: 0;
        }
      `}</style>
      <header id="header" className="header fixed-top">
        <div className="topbar d-flex align-items-center dark-background">
          <div className="container d-flex justify-content-center justify-content-md-between">
            <div className="contact-info d-flex align-items-center">
              <i className="bi bi-envelope d-flex align-items-center"><a href={`mailto:${clinicEmail}`}>{clinicEmail}</a></i>
              <i className="bi bi-phone d-flex align-items-center ms-4"><span>{clinicPhone}</span></i>
            </div>
            <div className="social-links d-none d-md-flex align-items-center">
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="whatsapp"><i className="bi bi-whatsapp"></i></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="facebook"><i className="bi bi-facebook"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="instagram"><i className="bi bi-instagram"></i></a>
            </div>
          </div>
        </div>

        <div className="branding d-flex align-items-cente">
          <div className="container position-relative d-flex align-items-center justify-content-between">
            <Link href="/" className="logo d-flex align-items-center">
              <h1 className="sitename">{clinicName}</h1>
            </Link>

            <div className="d-flex align-items-center">
              <nav id="navmenu" className="navmenu">
                <ul>
                  <li><a href="#hero" className="active">Beranda</a></li>
                  <li><a href="#tentang">Tentang</a></li>
                  <li><a href="#layanan">Layanan</a></li>
                  <li><a href="#alur">Alur</a></li>
                  <li><a href="#dokter">Dokter</a></li>
                  <li><a href="#kontak">Kontak</a></li>
                </ul>
              </nav>

              <div className="auth-buttons">
                <Link href="/login" className="btn-get-in">
                  Masuk
                </Link>
                <Link href="/register" className="btn-book">
                  Daftar
                </Link>
              </div>

              <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Hero Section */}
        <section id="hero" className="hero section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="hero-content">
                  <div className="trust-badges mb-4" data-aos="fade-right" data-aos-delay="200">
                    <div className="badge-item">
                      <i className="bi bi-shield-check"></i>
                      <span>Terakreditasi</span>
                    </div>
                    <div className="badge-item">
                      <i className="bi bi-clock"></i>
                      <span>Layanan Digital</span>
                    </div>
                    <div className="badge-item">
                      <i className="bi bi-star-fill"></i>
                      <span>Rating 4.9/5</span>
                    </div>
                  </div>

                  <h1 data-aos="fade-right" data-aos-delay="300">
                    Pelayanan <span className="highlight">Kesehatan</span> Terbaik Dengan Sentuhan Kasih Sayang
                  </h1>

                  <p className="hero-description" data-aos="fade-right" data-aos-delay="400">
                    Daftar online, pantau antrean real-time, akses rekam medis digital, dan kelola resep obat — semua dalam satu platform.
                  </p>

                  <div className="hero-stats mb-4" data-aos="fade-right" data-aos-delay="500">
                    <div className="stat-item">
                      <h3>5000+</h3>
                      <p>Pasien Terlayani</p>
                    </div>
                    <div className="stat-item">
                      <h3>15+</h3>
                      <p>Dokter Spesialis</p>
                    </div>
                    <div className="stat-item">
                      <h3>24/7</h3>
                      <p>Akses Online</p>
                    </div>
                  </div>

                  <div className="hero-actions" data-aos="fade-right" data-aos-delay="600">
                    <Link href="/register" className="btn btn-primary">Daftar Sekarang</Link>
                    <a href="#tentang" className="btn btn-outline">
                      <i className="bi bi-info-circle me-2"></i>
                      Pelajari Lebih Lanjut
                    </a>
                  </div>

                  <div className="emergency-contact" data-aos="fade-right" data-aos-delay="700">
                    <div className="emergency-icon">
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div className="emergency-info">
                      <small>Hotline Klinik</small>
                      <strong>{clinicPhone}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="hero-visual" data-aos="fade-left" data-aos-delay="400">
                  <div className="main-image">
                    <img src="/template/assets/img/health/staff-10.webp" alt="Fasilitas Klinik Modern" className="img-fluid" />
                    <div className="floating-card rating-card">
                      <div className="card-content">
                        <div className="rating-stars">
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                        </div>
                        <h6>4.9/5</h6>
                        <small>1,234 Ulasan</small>
                      </div>
                    </div>
                  </div>
                  <div className="background-elements">
                    <div className="element element-1"></div>
                    <div className="element element-2"></div>
                    <div className="element element-3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="tentang" className="home-about section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right" data-aos-delay="200">
                <div className="about-content">
                  <h2 className="section-heading">Klinik Modern, Rekam Medis Digital</h2>
                  <p className="lead-text">{clinicName} adalah fasilitas kesehatan yang berkomitmen memberikan pelayanan medis terbaik dengan didukung oleh tenaga profesional dan fasilitas modern.</p>

                  <p>Kami mengutamakan kenyamanan dan keselamatan pasien dalam setiap layanan yang kami berikan. Sistem digital kami memungkinkan Anda mendaftar online, memantau antrean secara real-time, dan mengakses rekam medis kapan saja.</p>

                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">5000+</div>
                      <div className="stat-label">Pasien Terlayani</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">15+</div>
                      <div className="stat-label">Dokter Spesialis</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">98%</div>
                      <div className="stat-label">Kepuasan Pasien</div>
                    </div>
                  </div>

                  <div className="cta-section">
                    <Link href="/register" className="btn-primary">Daftar Sekarang</Link>
                  </div>
                </div>
              </div>

              <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
                <div className="about-visual">
                  <div className="main-image">
                    <img src="/template/assets/img/health/facilities-9.webp" alt="Fasilitas medis modern" className="img-fluid" />
                  </div>
                  <div className="floating-card">
                    <div className="card-content">
                      <div className="icon">
                        <i className="bi bi-heart-pulse"></i>
                      </div>
                      <div className="card-text">
                        <h4>Rekam Medis Digital</h4>
                        <p>Akses riwayat kesehatan Anda kapan saja</p>
                      </div>
                    </div>
                  </div>
                  <div className="experience-badge">
                    <div className="badge-content">
                      <span className="years">15+</span>
                      <span className="text">Tahun Pelayanan Terpercaya</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="layanan" className="featured-services section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Layanan Kami</h2>
            <p>Kami menyediakan berbagai layanan medis dan fitur digital untuk memenuhi kebutuhan kesehatan Anda</p>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row g-0">
              <div className="col-lg-8" data-aos="fade-right" data-aos-delay="200">
                <div className="featured-service-main">
                  <div className="service-image-wrapper">
                    <img src="/template/assets/img/health/consultation-4.webp" alt="Layanan Kesehatan Unggulan" className="img-fluid" loading="lazy" />
                    <div className="service-overlay">
                      <div className="service-badge">
                        <i className="bi bi-heart-pulse"></i>
                        <span>Pendaftaran Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="service-details">
                    <h2>Sistem Klinik Digital Terintegrasi</h2>
                    <p>Dari pendaftaran online hingga pembayaran, semua proses terintegrasi dalam satu platform. Pantau antrean real-time, akses rekam medis digital, dan kelola resep obat dengan mudah.</p>
                    <Link href="/register" className="main-cta">Daftar Sekarang</Link>
                  </div>
                </div>
              </div>

              <div className="col-lg-4" data-aos="fade-left" data-aos-delay="300">
                <div className="services-sidebar">
                  <div className="service-item" data-aos="fade-up" data-aos-delay="400">
                    <div className="service-icon-wrapper">
                      <i className="bi bi-clipboard2-pulse"></i>
                    </div>
                    <div className="service-info">
                      <h4>Rekam Medis Elektronik</h4>
                      <p>Diagnosa, vital signs, dan riwayat pengobatan tersimpan aman secara digital.</p>
                    </div>
                  </div>

                  <div className="service-item" data-aos="fade-up" data-aos-delay="500">
                    <div className="service-icon-wrapper">
                      <i className="bi bi-qr-code"></i>
                    </div>
                    <div className="service-info">
                      <h4>Antrean Real-time</h4>
                      <p>Scan QR code untuk check-in dan pantau posisi antrean Anda secara live.</p>
                    </div>
                  </div>

                  <div className="service-item" data-aos="fade-up" data-aos-delay="600">
                    <div className="service-icon-wrapper">
                      <i className="bi bi-capsule"></i>
                    </div>
                    <div className="service-info">
                      <h4>Resep Digital</h4>
                      <p>Resep dari dokter langsung ke apotek, tanpa perlu antri lagi.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="specialties-grid" data-aos="fade-up" data-aos-delay="300">
              <div className="row align-items-center">
                <div className="col-lg-3 col-md-6">
                  <div className="specialty-card">
                    <div className="specialty-image">
                      <img src="/template/assets/img/health/maternal-2.webp" alt="Billing" className="img-fluid" loading="lazy" />
                    </div>
                    <div className="specialty-content">
                      <h5>Billing & Pembayaran</h5>
                      <span>Tagihan otomatis, bayar tunai atau transfer</span>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="specialty-card">
                    <div className="specialty-image">
                      <img src="/template/assets/img/health/vaccination-3.webp" alt="Surat Medis" className="img-fluid" loading="lazy" />
                    </div>
                    <div className="specialty-content">
                      <h5>Surat Keterangan Medis</h5>
                      <span>Generate surat sakit digital otomatis</span>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="specialty-card">
                    <div className="specialty-image">
                      <img src="/template/assets/img/health/emergency-1.webp" alt="Dashboard" className="img-fluid" loading="lazy" />
                    </div>
                    <div className="specialty-content">
                      <h5>Dashboard Role-based</h5>
                      <span>Panel khusus untuk pasien, dokter, admin, apoteker</span>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="specialty-card">
                    <div className="specialty-image">
                      <img src="/template/assets/img/health/facilities-6.webp" alt="Laporan" className="img-fluid" loading="lazy" />
                    </div>
                    <div className="specialty-content">
                      <h5>Laporan & Analytics</h5>
                      <p>Monitoring kunjungan dan performa klinik</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alur Section */}
        <section id="alur" className="call-to-action section light-background">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="container section-title" data-aos="fade-up">
              <h2>Alur Layanan</h2>
              <p>Tahapan layanan di {clinicName} dari pendaftaran hingga selesai</p>
            </div>

            <div className="features-section">
              <div className="row g-0">
                <div className="col-lg-3 col-md-6">
                  <div className="feature-block" data-aos="fade-up" data-aos-delay="100">
                    <div className="feature-icon">
                      <i className="bi bi-person-plus"></i>
                    </div>
                    <h3>1. Registrasi</h3>
                    <p>Buat akun pasien dan login ke sistem untuk mulai menggunakan layanan.</p>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="feature-block" data-aos="fade-up" data-aos-delay="200">
                    <div className="feature-icon">
                      <i className="bi bi-calendar-check"></i>
                    </div>
                    <h3>2. Booking Jadwal</h3>
                    <p>Pilih dokter, tanggal, dan jam kunjungan yang tersedia.</p>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="feature-block" data-aos="fade-up" data-aos-delay="300">
                    <div className="feature-icon">
                      <i className="bi bi-qr-code"></i>
                    </div>
                    <h3>3. Check-in QR</h3>
                    <p>Tiba di klinik, scan QR code untuk daftar ulang dan dapatkan nomor antrean.</p>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="feature-block" data-aos="fade-up" data-aos-delay="400">
                    <div className="feature-icon">
                      <i className="bi bi-clipboard2-pulse"></i>
                    </div>
                    <h3>4. Konsultasi</h3>
                    <p>Dokter memeriksa, membuat diagnosa, dan input rekam medis digital.</p>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="feature-block" data-aos="fade-up" data-aos-delay="500">
                    <div className="feature-icon">
                      <i className="bi bi-capsule"></i>
                    </div>
                    <h3>5. Resep Obat</h3>
                    <p>Apoteker menyiapkan obat berdasarkan resep digital dari dokter.</p>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="feature-block" data-aos="fade-up" data-aos-delay="600">
                    <div className="feature-icon">
                      <i className="bi bi-credit-card"></i>
                    </div>
                    <h3>6. Pembayaran</h3>
                    <p>Bayar biaya konsultasi dan obat di kasir (tunai atau transfer).</p>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="feature-block" data-aos="fade-up" data-aos-delay="700">
                    <div className="feature-icon">
                      <i className="bi bi-file-earmark-medical"></i>
                    </div>
                    <h3>7. Surat Medis</h3>
                    <p>Buat surat keterangan sakit digital jika diperlukan.</p>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="feature-block" data-aos="fade-up" data-aos-delay="800">
                    <div className="feature-icon">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <h3>8. Selesai</h3>
                    <p>Terima bukti pembayaran dan akses rekam medis Anda secara online.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-5" data-aos="fade-up" data-aos-delay="900">
              <Link href="/register" className="primary-cta d-inline-flex">
                <span>Mulai Sekarang</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* Doctors Section */}
        <section id="dokter" className="find-a-doctor section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Tim Dokter Kami</h2>
            <p>Didukung oleh tim dokter spesialis berpengalaman dan profesional</p>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="doctors-grid">
              {doctors.map((doctor, i) => (
                <div key={doctor.id} className="doctor-profile" data-aos="zoom-in" data-aos-delay={(i + 1) * 100}>
                  <div className="profile-header">
                    <div className="doctor-avatar">
                      <img src={`/template/assets/img/health/staff-${(i % 8) + 1}.webp`} alt={doctor.name} className="img-fluid" />
                      <div className="status-indicator available"></div>
                    </div>
                    <div className="doctor-details">
                      <h4>{doctor.name}</h4>
                      <span className="specialty-tag">{doctor.specialization}</span>
                      <div className="experience-info">
                        <i className="bi bi-award"></i>
                        <span>{doctor.dailyQuota} pasien/hari</span>
                      </div>
                    </div>
                  </div>
                  <div className="rating-section">
                    <div className="stars">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                    </div>
                    <span className="rating-score">5.0</span>
                  </div>
                  <div className="action-buttons">
                    <Link href="/register" className="btn-secondary">Daftar</Link>
                    <Link href="/login" className="btn-primary">Booking</Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-5" data-aos="fade-up" data-aos-delay="700">
              <Link href="/register" className="btn-view-all">
                Daftar Sekarang
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="kontak" className="contact section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="container section-title" data-aos="fade-up">
              <h2>Hubungi Kami</h2>
              <p>Informasi kontak dan lokasi klinik kami</p>
            </div>

            <div className="row g-5">
              <div className="col-lg-5">
                <div className="contact-info-wrapper">
                  <div className="contact-info-item" data-aos="fade-up" data-aos-delay="100">
                    <div className="info-icon">
                      <i className="bi bi-geo-alt"></i>
                    </div>
                    <div className="info-content">
                      <h3>Alamat Klinik</h3>
                      <p>{clinicAddress}</p>
                    </div>
                  </div>

                  <div className="contact-info-item" data-aos="fade-up" data-aos-delay="200">
                    <div className="info-icon">
                      <i className="bi bi-telephone"></i>
                    </div>
                    <div className="info-content">
                      <h3>Telepon</h3>
                      <p>{clinicPhone}</p>
                    </div>
                  </div>

                  <div className="contact-info-item" data-aos="fade-up" data-aos-delay="300">
                    <div className="info-icon">
                      <i className="bi bi-envelope"></i>
                    </div>
                    <div className="info-content">
                      <h3>Email</h3>
                      <p>{clinicEmail}</p>
                    </div>
                  </div>

                  <div className="contact-info-item" data-aos="fade-up" data-aos-delay="400">
                    <div className="info-icon">
                      <i className="bi bi-clock"></i>
                    </div>
                    <div className="info-content">
                      <h3>Jam Operasional</h3>
                      <p>Senin - Jumat: 08:00 - 17:00</p>
                      <p>Sabtu: 08:00 - 14:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="contact-form-card" data-aos="fade-up" data-aos-delay="200">
                  <h2>Lokasi Klinik</h2>
                  <p className="mb-4">Kunjungi kami langsung atau hubungi melalui telepon dan email untuk informasi lebih lanjut.</p>

                  <div className="map-container rounded overflow-hidden" style={{ height: "350px" }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521261135284!2d106.8195613!3d-6.194741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sMonumen%20Nasional!5e0!3m2!1sid!2sid!4v1699999999999!5m2!1sid!2sid"
                      width="100%"
                      height="350"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Lokasi Klinik"
                    ></iframe>
                  </div>

                  <div className="mt-4">
                    <Link href="/register" className="btn-book d-inline-block">
                      <i className="bi bi-calendar-check me-2"></i>
                      Daftar Online Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="footer-16 footer position-relative">
        <div className="container">
          <div className="footer-main" data-aos="fade-up" data-aos-delay="100">
            <div className="row align-items-start">
              <div className="col-lg-5">
                <div className="brand-section">
                  <Link href="/" className="logo d-flex align-items-center mb-4">
                    <span className="sitename">{clinicName}</span>
                  </Link>
                  <p className="brand-description">Sistem manajemen klinik modern dengan pendaftaran online, rekam medis digital, antrean real-time, dan resep obat digital.</p>

                  <div className="contact-info mt-5">
                    <div className="contact-item">
                      <i className="bi bi-geo-alt"></i>
                      <span>{clinicAddress}</span>
                    </div>
                    <div className="contact-item">
                      <i className="bi bi-telephone"></i>
                      <span>{clinicPhone}</span>
                    </div>
                    <div className="contact-item">
                      <i className="bi bi-envelope"></i>
                      <span>{clinicEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="footer-nav-wrapper">
                  <div className="row">
                    <div className="col-6 col-lg-3">
                      <div className="nav-column">
                        <h6>Navigasi</h6>
                        <nav className="footer-nav">
                          <a href="#hero">Beranda</a>
                          <a href="#tentang">Tentang</a>
                          <a href="#layanan">Layanan</a>
                          <a href="#alur">Alur</a>
                          <a href="#dokter">Dokter</a>
                          <a href="#kontak">Kontak</a>
                        </nav>
                      </div>
                    </div>

                    <div className="col-6 col-lg-3">
                      <div className="nav-column">
                        <h6>Fitur</h6>
                        <nav className="footer-nav">
                          <a href="#layanan">Rekam Medis Digital</a>
                          <a href="#layanan">Antrean Real-time</a>
                          <a href="#layanan">Resep Digital</a>
                          <a href="#layanan">Billing Online</a>
                          <a href="#layanan">Surat Medis</a>
                        </nav>
                      </div>
                    </div>

                    <div className="col-6 col-lg-3">
                      <div className="nav-column">
                        <h6>Akun</h6>
                        <nav className="footer-nav">
                          <Link href="/login">Masuk</Link>
                          <Link href="/register">Daftar</Link>
                          <Link href="/register">Booking Dokter</Link>
                        </nav>
                      </div>
                    </div>

                    <div className="col-6 col-lg-3">
                      <div className="nav-column">
                        <h6>Role</h6>
                        <nav className="footer-nav">
                          <span>Pasien</span>
                          <span>Dokter</span>
                          <span>Admin</span>
                          <span>Apoteker</span>
                          <span>Owner</span>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <div className="bottom-content" data-aos="fade-up" data-aos-delay="300">
              <div className="row align-items-center">
                <div className="col-lg-6">
                  <div className="copyright">
                    <p>© <span className="sitename">{clinicName}</span>. All rights reserved.</p>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="legal-links">
                    <Link href="/">Kebijakan Privasi</Link>
                    <Link href="/">Syarat Layanan</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <a href="#hero" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center"><i className="bi bi-arrow-up-short"></i></a>
      <TemplateScripts />
      </PageContent>
    </>
  )
}
