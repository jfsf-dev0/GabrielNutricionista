"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import CommandMenu from "@/components/CommandMenu";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-stone-100/60 antialiased">
      {/* Sidebar */}
      <Sidebar onOpenCommand={() => setIsCommandOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onOpenCommand={() => setIsCommandOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-stone-100/60 p-6">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandMenu
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
}
