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
  title: { default: "Gabriel Alves — Nutrição Clínica & Performance", template: "%s · Gabriel Alves" },
  description: "Painel de prescrição dietética e geração de relatórios clínicos estruturados.",
  // Área com dados de saúde: nunca indexar.
  robots: { index: false, follow: false },
};

import { FeedbackProvider } from "@/components/Feedback";
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
          <FeedbackProvider>{children}</FeedbackProvider>
        </FoodsProvider>
      </body>
    </html>
  );
}
