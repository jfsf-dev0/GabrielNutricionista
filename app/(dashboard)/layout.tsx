import type { Metadata } from "next";
import React from "react";
import DashboardShell from "@/components/DashboardShell";

export const metadata: Metadata = { title: { default: "Painel Clínico", template: "%s · Gabriel Alves" } };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
