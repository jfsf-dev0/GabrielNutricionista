import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = { title: "Construtor de plano" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
