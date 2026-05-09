"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutWrapperProps {
  role: string;
  userName: string;
  children: ReactNode;
}

export default function LayoutWrapper({
  role,
  userName,
  children,
}: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar role={role} userName={userName} />
      <div className="lg:pl-72">
        <Header userName={userName} />
        <main className="p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
