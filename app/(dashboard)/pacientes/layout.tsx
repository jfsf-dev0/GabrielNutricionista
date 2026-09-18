import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = { title: "Pacientes" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
