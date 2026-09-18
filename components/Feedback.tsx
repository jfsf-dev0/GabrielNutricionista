"use client";

import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";

interface ConfirmOptions {
  titulo: string;
  mensagem?: string;
  confirmar?: string;
  cancelar?: string;
  /** Ação destrutiva: botão de confirmar em vermelho. */
  perigo?: boolean;
}

type Tom = "sucesso" | "erro" | "info";
interface Aviso { id: number; texto: string; tom: Tom }

interface Feedback {
  /** Diálogo de confirmação acessível; resolve true/false (substitui window.confirm). */
  confirm: (o: ConfirmOptions) => Promise<boolean>;
  /** Aviso temporário em região aria-live (substitui window.alert). */
  notify: (texto: string, tom?: Tom) => void;
}

const Ctx = createContext<Feedback>({
  confirm: async () => false,
  notify: () => {},
});

export const useConfirm = () => useContext(Ctx).confirm;
export const useNotify = () => useContext(Ctx).notify;

const TONS: Record<Tom, string> = {
  sucesso: "bg-emerald-800 text-white",
  erro: "bg-red-800 text-white",
  info: "bg-stone-900 text-white",
};

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const seq = useRef(0);
  const anterior = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        anterior.current = document.activeElement as HTMLElement | null;
        setDialog({ opts, resolve });
      }),
    [],
  );

  const fechar = useCallback(
    (v: boolean) => {
      dialog?.resolve(v);
      setDialog(null);
      anterior.current?.focus?.();
    },
    [dialog],
  );

  const notify = useCallback((texto: string, tom: Tom = "info") => {
    const id = ++seq.current;
    setAvisos((a) => [...a, { id, texto, tom }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 4500);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar(false);
      if (e.key === "Tab") {
        // foco preso entre os dois botões
        const btns = document.querySelectorAll<HTMLElement>("[data-feedback-dialog] button");
        if (btns.length === 0) return;
        const first = btns[0], last = btns[btns.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog, fechar]);

  const value = useMemo(() => ({ confirm, notify }), [confirm, notify]);

  return (
    <Ctx.Provider value={value}>
      {children}

      {dialog && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && fechar(false)}>
          <div
            data-feedback-dialog
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={dialog.opts.mensagem ? descId : undefined}
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
          >
            <h2 id={titleId} className="font-serif-title text-lg text-stone-900">{dialog.opts.titulo}</h2>
            {dialog.opts.mensagem && <p id={descId} className="mt-1.5 text-xs text-stone-700">{dialog.opts.mensagem}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button ref={cancelRef} onClick={() => fechar(false)} className="px-3 py-1.5 rounded border border-stone-300 text-xs text-stone-800 hover:bg-stone-50">
                {dialog.opts.cancelar ?? "Cancelar"}
              </button>
              <button
                onClick={() => fechar(true)}
                className={`px-3 py-1.5 rounded text-xs font-medium text-white ${dialog.opts.perigo ? "bg-red-700 hover:bg-red-800" : "bg-stone-900 hover:bg-stone-800"}`}
              >
                {dialog.opts.confirmar ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="no-print fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`rounded-lg px-3.5 py-2 text-xs shadow-lg ${TONS[a.tom]}`}>{a.texto}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
