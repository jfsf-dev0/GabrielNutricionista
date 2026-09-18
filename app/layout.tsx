import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Gabriel Alves — Nutrição Clínica & Performance",
  description: "Painel de prescrição dietética e geração de relatórios clínicos estruturados.",
};

import { FoodsProvider } from "@/components/FoodsProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${newsreader.variable} h-full`}>
      <body className="h-full flex flex-col antialiased selection:bg-stone-200">
        <FoodsProvider>
          {children}
        </FoodsProvider>
      </body>
    </html>
  );
}
