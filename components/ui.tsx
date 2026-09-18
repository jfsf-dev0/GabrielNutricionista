import React from "react";
import { clampNum, MAX_KCAL } from "@/lib/limits";

export const inputCls =
  "w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 bg-white outline-none focus:border-stone-900";

export function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function NumInput({
  value, onChange, step = 1, min = 0, max = MAX_KCAL, ...rest
}: {
  value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "step" | "min" | "max">) {
  return (
    <input
      {...rest}
      type="number"
      inputMode="decimal"
      step={step}
      min={min}
      max={max}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(clampNum(e.target.value, min, max))}
      className={`${inputCls} ${rest.className ?? ""}`}
    />
  );
}

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-2">{children}</h2>
);
