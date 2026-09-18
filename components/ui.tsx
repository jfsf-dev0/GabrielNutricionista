import React from "react";

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
  value, onChange, step = 1, ...rest
}: { value: number; onChange: (v: number) => void; step?: number } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "step">) {
  return (
    <input
      {...rest}
      type="number"
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={`${inputCls} ${rest.className ?? ""}`}
    />
  );
}

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-2">{children}</h3>
);
