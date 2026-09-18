import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = { title: "Planos alimentares" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
