import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = { title: "Agenda de consultas" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
