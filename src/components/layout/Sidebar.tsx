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
  UserCog,
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
    {
      label: "Dashboard",
      href: "/patient",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Booking",
      href: "/patient/booking",
      icon: <CalendarPlus size={20} />,
    },
    {
      label: "Antrean Saya",
      href: "/patient/queue",
      icon: <ListOrdered size={20} />,
    },
    {
      label: "Riwayat Medis",
      href: "/patient/records",
      icon: <FileText size={20} />,
    },
    {
      label: "Surat Sakit",
      href: "/patient/certificates",
      icon: <FileText size={20} />,
    },
  ],
  ADMIN: [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Pasien",
      href: "/admin/patients",
      icon: <Users size={20} />,
    },
    {
      label: "Antrean",
      href: "/admin/queue",
      icon: <ListOrdered size={20} />,
    },
    {
      label: "Billing",
      href: "/admin/billing",
      icon: <Receipt size={20} />,
    },
    {
      label: "Laporan",
      href: "/admin/reports",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Jadwal Dokter",
      href: "/admin/doctors",
      icon: <Stethoscope size={20} />,
    },
  ],
  DOCTOR: [
    {
      label: "Dashboard",
      href: "/doctor",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Antrean Pasien",
      href: "/doctor/queue",
      icon: <ListOrdered size={20} />,
    },
    {
      label: "Surat Sakit",
      href: "/doctor/certificates",
      icon: <FileBadge size={20} />,
    },
  ],
  OWNER: [
    {
      label: "Dashboard",
      href: "/owner",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Kelola Pegawai",
      href: "/owner/staff",
      icon: <Users size={20} />,
    },
    {
      label: "Laporan",
      href: "/owner/reports",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Pengaturan",
      href: "/owner/settings",
      icon: <Settings size={20} />,
    },
  ],
  PHARMACY: [
    {
      label: "Dashboard Apotek",
      href: "/pharmacy",
      icon: <Pill size={20} />,
    },
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
  PATIENT: "bg-emerald-500",
  ADMIN: "bg-blue-500",
  DOCTOR: "bg-purple-500",
  OWNER: "bg-amber-500",
  PHARMACY: "bg-teal-500",
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
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg rounded-xl p-2.5 hover:bg-gray-50 transition-colors"
        id="sidebar-toggle"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onPointerDown={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-40 transition-transform duration-300 ease-in-out flex flex-col",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onPointerDown={() => setIsOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                KlinikCare
              </h1>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
                {roleLabels[role]} Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-emerald-600" : "text-gray-400"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold",
                roleColors[role]
              )}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-400">{roleLabels[role]}</p>
            </div>
          </div>
          <button
            onPointerDown={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
            id="btn-logout"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
