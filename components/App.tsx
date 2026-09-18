"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultProfile } from "@/lib/defaultProfile";
import { migrateProfile } from "@/lib/migrate";
import { dayTotals } from "@/lib/nutrition";
import { emptyProfile } from "@/lib/profile";
import { browserStore, type Store } from "@/lib/storage";
import { validatePlan } from "@/lib/validate";
import type { PatientProfile } from "@/lib/types";
import Editor from "./Editor";
import { useFoods } from "./FoodsProvider";
import Navbar from "./Navbar";
import ReportPreview from "./ReportPreview";

export default function App() {
  const { index } = useFoods();
  const store = useRef<Store | null>(null);
  const [profile, setProfile] = useState<PatientProfile>(defaultProfile);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<PatientProfile[]>([]);
  const [favoritos, setFavoritos] = useState<Map<number, number>>(new Map());
  const [savedFlag, setSavedFlag] = useState<boolean | null>(null);

  // Hidrata do navegador depois da montagem (evita divergência SSR/cliente).
  useEffect(() => {
    const s = (store.current = browserStore());
    const draft = s.loadDraft();
    if (draft) setProfile(draft);
    setSaved(s.list());
    setFavoritos(s.favoritos());
    setReady(true);
  }, []);

  // Rascunho automático.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => store.current?.saveDraft(profile), 400);
    return () => clearTimeout(t);
  }, [profile, ready]);

  const change = useCallback((p: PatientProfile) => {
    setSavedFlag(null);
    setProfile(p);
  }, []);

  const totals = useMemo(() => dayTotals(profile, index), [profile, index]);
  const issues = useMemo(() => validatePlan(profile, index), [profile, index]);

  const save = () => {
    const s = store.current;
    if (!s) return;
    const p = { ...profile, atualizadoEm: new Date().toISOString() };
    const ok = s.save(p);
    setSavedFlag(ok);
    if (ok) {
      setProfile(p);
      setSaved(s.list());
    }
  };

  const onFoodUsed = useCallback((id: number) => {
    store.current?.bumpFavoritos([id]);
    setFavoritos(store.current?.favoritos() ?? new Map());
  }, []);

  const confirmDiscard = () => confirm("Descartar as alterações não salvas da ficha atual?");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Navbar
        profile={profile}
        saved={saved}
        onOpen={(id) => {
          const p = store.current?.load(id);
          if (p && confirmDiscard()) change(p);
        }}
        onDelete={(id) => {
          store.current?.remove(id);
          setSaved(store.current?.list() ?? []);
        }}
        onNew={() => confirmDiscard() && change(emptyProfile(profile))}
        onLoadModel={() => confirmDiscard() && change(defaultProfile)}
        onImport={(raw) => change(migrateProfile(raw))}
        onPrint={() => window.print()}
      />
      <div className="flex-1 flex overflow-hidden">
        <Editor
          profile={profile} onChange={change} index={index} totals={totals} issues={issues}
          favoritos={favoritos} onFoodUsed={onFoodUsed}
          saved={savedFlag} onSave={save} onPrint={() => window.print()}
        />
        <ReportPreview profile={profile} index={index} totals={totals} />
      </div>
    </div>
  );
}
