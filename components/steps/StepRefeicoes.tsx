"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeftRight, Plus, Sparkles, StickyNote, Trash2 } from "lucide-react";
import { violations } from "@/lib/foods";
import { MAX_GRAMAS, MAX_GRAMAS_MACRO, MAX_KCAL } from "@/lib/limits";
import { optionTotals, scaleNutrients, toMacros } from "@/lib/nutrition";
import { newItem, newMeal, newOption, uid } from "@/lib/profile";
import { suggestSubstitutions, suggestToComplete } from "@/lib/recommend";
import { fmt } from "@/lib/report";
import type { Food, Meal, MealItem, MealOption } from "@/lib/types";
import FoodPicker from "../FoodPicker";
import { useConfirm } from "../Feedback";
import { useFoods } from "../FoodsProvider";
import { Field, NumInput, TextInput, inputCls } from "../ui";
import type { StepProps } from "./StepIdentificacao";

interface Props extends StepProps {
  favoritos: Map<number, number>;
  onFoodUsed: (foodId: number) => void;
}

const signed = (v: number, dec = 1) => `${v > 0 ? "+" : ""}${fmt(v, dec)}`;

export default function StepRefeicoes({ profile, onChange, favoritos, onFoodUsed }: Props) {
  const { foods, index } = useFoods();
  const confirm = useConfirm();
  const [activeId, setActiveId] = useState<number>(profile.meals[0]?.id ?? 1);
  const [subFor, setSubFor] = useState<string | null>(null);
  const [completeFor, setCompleteFor] = useState<string | null>(null);

  const meal = profile.meals.find((m) => m.id === activeId) ?? profile.meals[0];

  const setMeals = (meals: Meal[]) => onChange({ ...profile, meals });
  const patchMeal = (id: number, fn: (m: Meal) => Meal) => setMeals(profile.meals.map((m) => (m.id === id ? fn(m) : m)));
  const patchOption = (optId: string, fn: (o: MealOption) => MealOption) =>
    patchMeal(meal.id, (m) => ({ ...m, opcoes: m.opcoes.map((o) => (o.id === optId ? fn(o) : o)) }));
  const patchItem = (optId: string, itemId: string, patch: Partial<MealItem>) =>
    patchOption(optId, (o) => ({ ...o, itens: o.itens.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }));

  const addFood = (optId: string, food: Food, gramas = 100) => {
    patchOption(optId, (o) => ({ ...o, itens: [...o.itens, newItem({ foodId: food.id, nome: food.nome, gramas })] }));
    onFoodUsed(food.id);
  };

  const addMeal = () => {
    const id = Math.max(0, ...profile.meals.map((m) => m.id)) + 1;
    setMeals([...profile.meals, newMeal(id, `Refeição ${id}`)]);
    setActiveId(id);
  };
  const removeMeal = async () => {
    const ok = await confirm({ titulo: "Remover refeição?", mensagem: `“${meal.nome}” e todas as suas opções serão removidas.`, confirmar: "Remover", perigo: true });
    if (!ok) return;
    const rest = profile.meals.filter((m) => m.id !== meal.id);
    setMeals(rest);
    setActiveId(rest[0]?.id ?? 1);
  };
  const addOption = () =>
    patchMeal(meal.id, (m) => ({ ...m, opcoes: [...m.opcoes, newOption(`Opção ${String.fromCharCode(65 + m.opcoes.length)}`)] }));

  if (!meal) {
    return (
      <div className="text-xs text-stone-500">
        Nenhuma refeição. <button className="underline" onClick={addMeal}>Adicionar a primeira</button>.
      </div>
    );
  }

  const porRefeicao = { kcal: profile.calorias / profile.meals.length, p: profile.prot / profile.meals.length, c: profile.carbo / profile.meals.length, l: profile.gord / profile.meals.length };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-2">
        {profile.meals.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveId(m.id)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              m.id === meal.id ? "bg-stone-900 text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            {m.nome || `Refeição ${m.id}`}
          </button>
        ))}
        <button onClick={addMeal} className="px-2 py-1 rounded text-[11px] text-stone-600 hover:bg-stone-100 flex items-center gap-1" title="Adicionar refeição">
          <Plus className="w-3 h-3" /> Refeição
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <Field label="Nome da refeição"><TextInput value={meal.nome} onChange={(e) => patchMeal(meal.id, (m) => ({ ...m, nome: e.target.value }))} /></Field>
        <Field label="Horário sugerido"><TextInput value={meal.horario} onChange={(e) => patchMeal(meal.id, (m) => ({ ...m, horario: e.target.value }))} /></Field>
        <button onClick={removeMeal} className="p-1.5 text-stone-400 hover:text-red-600" title="Remover refeição"><Trash2 className="w-4 h-4" /></button>
      </div>

      {meal.opcoes.map((opt) => {
        const tot = optionTotals(opt, index);
        const falta = {
          kcal: porRefeicao.kcal - tot.macros.kcal, p: porRefeicao.p - tot.macros.p,
          c: porRefeicao.c - tot.macros.c, l: porRefeicao.l - tot.macros.l,
        };
        return (
          <div key={opt.id} className="p-3 rounded border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={opt.titulo}
                onChange={(e) => patchOption(opt.id, (o) => ({ ...o, titulo: e.target.value }))}
                className="flex-1 font-semibold text-xs bg-transparent outline-none border-b border-transparent focus:border-stone-400"
                placeholder="Título da opção"
              />
              <span className="text-[10.5px] text-stone-600 tabular-nums whitespace-nowrap">
                <b>{fmt(tot.macros.kcal, 0)} kcal</b> · P {fmt(tot.macros.p)} · C {fmt(tot.macros.c)} · L {fmt(tot.macros.l)}
              </span>
              {meal.opcoes.length > 1 && (
                <button
                  onClick={() => patchMeal(meal.id, (m) => ({ ...m, opcoes: m.opcoes.filter((o) => o.id !== opt.id) }))}
                  className="text-stone-400 hover:text-red-600" title="Remover opção"
                ><Trash2 className="w-3.5 h-3.5" /></button>
              )}
            </div>

            <ul className="space-y-1">
              {opt.itens.map((it) => {
                const food = it.foodId !== undefined ? index.get(it.foodId) : undefined;
                const conflito = food ? violations(food, profile.restricoes) : [];
                const macros = food && !it.nota ? toMacros(scaleNutrients(food.n, it.gramas)) : null;
                return (
                  <li key={it.id}>
                    <div className="flex items-center gap-1.5 text-xs">
                      {it.nota ? (
                        <input
                          value={it.nome}
                          onChange={(e) => patchItem(opt.id, it.id, { nome: e.target.value })}
                          className={`${inputCls} text-stone-500 italic`}
                        />
                      ) : (
                        <>
                          <span className="flex-1 min-w-0 truncate" title={it.nome}>
                            {food ? it.nome : <span className="text-stone-500">{it.nome} <em className="text-[10px] text-amber-600 not-italic">sem vínculo</em></span>}
                            {conflito.length > 0 && <span className="ml-1 text-[10px] text-red-600 font-medium">⚠ {conflito.join(", ")}</span>}
                          </span>
                          <NumInput
                            value={it.gramas} step={5} max={MAX_GRAMAS} className="!w-16 text-right" title="Gramas" aria-label={`Gramas de ${it.nome}`}
                            onChange={(v) => patchItem(opt.id, it.id, { gramas: v })}
                          />
                          <span className="text-[10px] text-stone-400">g</span>
                          {food?.medidas?.length ? (
                            <select
                              aria-label={`Medida caseira de ${it.nome}`}
                              className={`${inputCls} !w-32`}
                              value={food.medidas.some((m) => m.nome === it.medida) ? it.medida : ""}
                              onChange={(e) => {
                                const m = food.medidas!.find((x) => x.nome === e.target.value);
                                patchItem(opt.id, it.id, m ? { medida: m.nome, gramas: m.gramas } : { medida: undefined });
                              }}
                            >
                              <option value="">medida caseira…</option>
                              {food.medidas.map((m) => <option key={m.nome} value={m.nome}>{m.nome} ({m.gramas} g)</option>)}
                            </select>
                          ) : (
                            <TextInput
                              value={it.medida ?? ""} placeholder="medida caseira" className="!w-28" title="Medida caseira (texto livre)" aria-label={`Medida caseira de ${it.nome}`}
                              onChange={(e) => patchItem(opt.id, it.id, { medida: e.target.value || undefined })}
                            />
                          )}
                          <span className="w-12 text-right text-[10px] text-stone-500 tabular-nums">
                            {macros ? `${fmt(macros.kcal, 0)} kcal` : ""}
                          </span>
                          {food && (
                            <button
                              onClick={() => setSubFor(subFor === it.id ? null : it.id)}
                              className={`p-1 ${subFor === it.id ? "text-stone-900" : "text-stone-400 hover:text-stone-900"}`}
                              title="Sugerir substituição"
                            ><ArrowLeftRight className="w-3.5 h-3.5" /></button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => patchOption(opt.id, (o) => ({ ...o, itens: o.itens.filter((i) => i.id !== it.id) }))}
                        className="p-1 text-stone-400 hover:text-red-600" title="Remover item"
                      ><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>

                    {subFor === it.id && food && (
                      <Substitutions
                        item={it} foods={foods} restricoes={profile.restricoes} favoritos={favoritos}
                        onUse={(f, gramas) => {
                          patchItem(opt.id, it.id, { foodId: f.id, nome: f.nome, gramas, medida: undefined });
                          onFoodUsed(f.id);
                          setSubFor(null);
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="flex items-start gap-2">
              <div className="flex-1">
                <FoodPicker restricoes={profile.restricoes} favoritos={favoritos} onPick={(f) => addFood(opt.id, f)} />
              </div>
              <button
                onClick={() => patchOption(opt.id, (o) => ({ ...o, itens: [...o.itens, { id: uid(), nome: "", gramas: 0, nota: true }] }))}
                className="px-2 py-1.5 text-[11px] text-stone-600 hover:bg-stone-100 rounded flex items-center gap-1 whitespace-nowrap" title="Adicionar observação / substituição em texto"
              ><StickyNote className="w-3.5 h-3.5" /> Nota</button>
              <button
                onClick={() => setCompleteFor(completeFor === opt.id ? null : opt.id)}
                className={`px-2 py-1.5 text-[11px] rounded flex items-center gap-1 whitespace-nowrap ${completeFor === opt.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
                title="Sugerir alimentos que aproximam esta opção da meta"
              ><Sparkles className="w-3.5 h-3.5" /> Completar</button>
            </div>

            {completeFor === opt.id && (
              <Completion
                falta={falta} porRefeicao={porRefeicao} foods={foods} restricoes={profile.restricoes} favoritos={favoritos}
                onAdd={(f, g) => addFood(opt.id, f, g)}
              />
            )}

            <details className="text-[10.5px] text-stone-500">
              <summary className="cursor-pointer select-none">
                Ajuste manual{tot.macros.kcal > 0 && (opt.extra.kcal || opt.extra.p || opt.extra.c || opt.extra.l) ? ` (${fmt(opt.extra.kcal, 0)} kcal somadas)` : ""}
              </summary>
              <p className="mt-1 mb-1.5">Valores somados aos alimentos vinculados, para itens sem vínculo com a base.</p>
              <div className="grid grid-cols-4 gap-2">
                {(["kcal", "p", "c", "l"] as const).map((k) => (
                  <Field key={k} label={k === "kcal" ? "kcal" : k === "p" ? "Prot. g" : k === "c" ? "Carb. g" : "Lip. g"}>
                    <NumInput value={opt.extra[k]} step={k === "kcal" ? 1 : 0.1} max={k === "kcal" ? MAX_KCAL : MAX_GRAMAS_MACRO} onChange={(v) => patchOption(opt.id, (o) => ({ ...o, extra: { ...o.extra, [k]: v } }))} />
                  </Field>
                ))}
              </div>
            </details>
          </div>
        );
      })}

      <button onClick={addOption} className="text-xs text-stone-900 font-medium hover:underline flex items-center gap-1">
        <Plus className="w-3.5 h-3.5" /> Adicionar opção
      </button>
    </div>
  );
}

function Substitutions({ item, foods, restricoes, favoritos, onUse }: {
  item: MealItem; foods: Food[]; restricoes: Props["profile"]["restricoes"]; favoritos: Map<number, number>;
  onUse: (f: Food, gramas: number) => void;
}) {
  const sugestoes = useMemo(
    () => suggestSubstitutions(item, foods, { restricoes, favoritos, limit: 5 }),
    [item, foods, restricoes, favoritos],
  );
  return (
    <div className="ml-2 mt-1 mb-1 p-2 rounded border border-stone-200 bg-white text-[11px]">
      <div className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Mesmo grupo, mesmas calorias</div>
      {sugestoes.length === 0 && <div className="text-stone-400">Sem sugestões para este alimento.</div>}
      {sugestoes.map((s) => (
        <div key={s.food.id} className="flex items-center justify-between gap-2 py-0.5">
          <span className="min-w-0 truncate">
            {favoritos.has(s.food.id) && <span className="text-amber-500 mr-1">★</span>}
            <b>{s.gramas} g</b> {s.food.nome}
          </span>
          <span className="text-[10px] text-stone-500 tabular-nums whitespace-nowrap">
            {signed(s.delta.kcal, 0)} kcal · P {signed(s.delta.p)} · C {signed(s.delta.c)} · L {signed(s.delta.l)}
          </span>
          <button onClick={() => onUse(s.food, s.gramas)} className="px-1.5 py-0.5 bg-stone-900 text-white rounded text-[10px]">Usar</button>
        </div>
      ))}
    </div>
  );
}

function Completion({ falta, porRefeicao, foods, restricoes, favoritos, onAdd }: {
  falta: { kcal: number; p: number; c: number; l: number }; porRefeicao: { kcal: number };
  foods: Food[]; restricoes: Props["profile"]["restricoes"]; favoritos: Map<number, number>;
  onAdd: (f: Food, gramas: number) => void;
}) {
  const sugestoes = useMemo(
    () => suggestToComplete(falta, foods, { restricoes, favoritos, limit: 6 }),
    [falta, foods, restricoes, favoritos],
  );
  return (
    <div className="p-2 rounded border border-stone-200 bg-white text-[11px]">
      <div className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">
        Meta média por refeição: {fmt(porRefeicao.kcal, 0)} kcal · falta {fmt(Math.max(0, falta.kcal), 0)} kcal · P {fmt(Math.max(0, falta.p))} · C {fmt(Math.max(0, falta.c))} · L {fmt(Math.max(0, falta.l))}
      </div>
      {sugestoes.length === 0 && <div className="text-stone-400">Esta opção já está próxima da meta por refeição (ou nada na base se ajusta).</div>}
      {sugestoes.map((s) => (
        <div key={s.food.id} className="flex items-center justify-between gap-2 py-0.5">
          <span className="min-w-0 truncate">
            {favoritos.has(s.food.id) && <span className="text-amber-500 mr-1">★</span>}
            <b>{s.gramas} g</b> {s.food.nome}
          </span>
          <span className="text-[10px] text-stone-500 tabular-nums whitespace-nowrap">
            {fmt(s.macros.kcal, 0)} kcal · P {fmt(s.macros.p)} · C {fmt(s.macros.c)} · L {fmt(s.macros.l)}
          </span>
          <button onClick={() => onAdd(s.food, s.gramas)} className="px-1.5 py-0.5 bg-stone-900 text-white rounded text-[10px]">Adicionar</button>
        </div>
      ))}
    </div>
  );
}
