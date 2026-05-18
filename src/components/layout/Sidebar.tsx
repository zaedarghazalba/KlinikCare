"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarPlus,
  ListOrdered,
  FileText,
  Stethoscope,
  Pill,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Receipt,
  FileBadge,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  role: string;
  userName: string;
}

const menuItems: Record<
  string,
  { label: string; href: string; icon: React.ReactNode }[]
> = {
  PATIENT: [
    { label: "Dashboard", href: "/patient", icon: <LayoutDashboard size={19} /> },
    { label: "Booking", href: "/patient/booking", icon: <CalendarPlus size={19} /> },
    { label: "Antrean Saya", href: "/patient/queue", icon: <ListOrdered size={19} /> },
    { label: "Riwayat Medis", href: "/patient/records", icon: <FileText size={19} /> },
    { label: "Surat Sakit", href: "/patient/certificates", icon: <FileText size={19} /> },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={19} /> },
    { label: "Pasien", href: "/admin/patients", icon: <Users size={19} /> },
    { label: "Antrean", href: "/admin/queue", icon: <ListOrdered size={19} /> },
    { label: "Billing", href: "/admin/billing", icon: <Receipt size={19} /> },
    { label: "Laporan", href: "/admin/reports", icon: <BarChart3 size={19} /> },
    { label: "Jadwal Dokter", href: "/admin/doctors", icon: <Stethoscope size={19} /> },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/doctor", icon: <LayoutDashboard size={19} /> },
    { label: "Antrean Pasien", href: "/doctor/queue", icon: <ListOrdered size={19} /> },
    { label: "Surat Sakit", href: "/doctor/certificates", icon: <FileBadge size={19} /> },
  ],
  OWNER: [
    { label: "Dashboard", href: "/owner", icon: <LayoutDashboard size={19} /> },
    { label: "Kelola Pegawai", href: "/owner/staff", icon: <Users size={19} /> },
    { label: "Laporan", href: "/owner/reports", icon: <BarChart3 size={19} /> },
    { label: "Pengaturan", href: "/owner/settings", icon: <Settings size={19} /> },
  ],
  PHARMACY: [
    { label: "Dashboard Apotek", href: "/pharmacy", icon: <Pill size={19} /> },
  ],
};

const roleLabels: Record<string, string> = {
  PATIENT: "Pasien",
  ADMIN: "Admin",
  DOCTOR: "Dokter",
  OWNER: "Pemilik",
  PHARMACY: "Apoteker",
};

const roleColors: Record<string, string> = {
  PATIENT: "bg-primary-600",
  ADMIN: "bg-primary-600",
  DOCTOR: "bg-primary-600",
  OWNER: "bg-primary-600",
  PHARMACY: "bg-primary-600",
};

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const items = menuItems[role] || [];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onPointerDown={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-sm border border-stone-200 rounded-lg p-2 hover:bg-stone-50 transition-colors"
        id="sidebar-toggle"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 lg:hidden"
          onPointerDown={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white border-r border-stone-200/60 z-40 transition-transform duration-300 ease-in-out flex flex-col",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-stone-200/60">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onPointerDown={() => setIsOpen(false)}
          >
            <div className="w-9 h-9 rounded-lg bg-primary-700 flex items-center justify-center group-hover:bg-primary-800 transition-colors">
              <Heart className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base font-display font-bold text-stone-900 tracking-tight">
                KlinikCare
              </h1>
              <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-widest">
                {roleLabels[role]} Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${role.toLowerCase()}` &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onPointerDown={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary-50 text-primary-800"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                )}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary-600" : "text-stone-400"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-3 border-t border-stone-200/60">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1.5 rounded-lg bg-stone-50">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                roleColors[role]
              )}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-900 truncate">
                {userName}
              </p>
              <p className="text-[11px] text-stone-500">{roleLabels[role]}</p>
            </div>
          </div>
          <button
            onPointerDown={() => signOut({ redirectTo: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
            id="btn-logout"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
