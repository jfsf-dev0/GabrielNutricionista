"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadFoods } from "@/lib/foods";
import type { FoodIndex } from "@/lib/nutrition";
import type { Food } from "@/lib/types";

interface FoodsState {
  foods: Food[];
  index: FoodIndex;
  status: "loading" | "ready" | "error";
}

const Ctx = createContext<FoodsState>({ foods: [], index: new Map(), status: "loading" });

export function FoodsProvider({ children }: { children: React.ReactNode }) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [status, setStatus] = useState<FoodsState["status"]>("loading");

  useEffect(() => {
    let vivo = true;
    loadFoods()
      .then((f) => vivo && (setFoods(f), setStatus("ready")))
      .catch(() => vivo && setStatus("error"));
    return () => {
      vivo = false;
    };
  }, []);

  const value = useMemo(() => ({ foods, index: new Map(foods.map((f) => [f.id, f])), status }), [foods, status]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFoods = () => useContext(Ctx);
