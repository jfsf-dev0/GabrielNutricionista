import React from "react";

export default function PacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-100/80 text-stone-900 antialiased flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen bg-white shadow-xl flex flex-col">
        {children}
      </div>
    </div>
  );
}
