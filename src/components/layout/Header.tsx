"use client";

import { getGreeting } from "@/lib/utils";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getGreeting()}, {userName.split(" ")[0]} 👋
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 w-64 border border-gray-100 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari..."
              className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder:text-gray-400"
              id="header-search"
            />
          </div>

          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            id="btn-notifications"
          >
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
