import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Plano alimentar",
  robots: { index: false, follow: false },
};

export default function RelatorioLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-stone-100 flex flex-col">{children}</div>;
}
