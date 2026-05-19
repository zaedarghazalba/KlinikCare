"use client";

import { getGreeting } from "@/lib/utils";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
      <div className="flex items-center justify-between gap-3 h-16 px-3 sm:px-4 lg:px-8">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="lg:hidden w-10 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-display font-semibold text-stone-900 truncate">
              {getGreeting()}, {userName.split(" ")[0]}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 bg-stone-50 rounded-lg px-3.5 py-2 w-60 border border-stone-200/60 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-700/5 transition-all">
            <Search size={15} className="text-stone-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari..."
              className="bg-transparent text-sm outline-none w-full text-stone-700 placeholder:text-stone-400"
              id="header-search"
            />
          </div>

          <button
            className="relative p-2.5 rounded-lg hover:bg-stone-50 transition-colors"
            id="btn-notifications"
          >
            <Bell size={18} className="text-stone-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
