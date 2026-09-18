"use client";

import App from "@/components/App";
import { FoodsProvider } from "@/components/FoodsProvider";

export default function HomePage() {
  return (
    <FoodsProvider>
      <App />
    </FoodsProvider>
  );
}
