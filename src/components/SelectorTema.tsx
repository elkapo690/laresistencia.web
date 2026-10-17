"use client";

import { useState } from "react";
import { guardarTema } from "@/app/(app)/perfil/actions";
import { TEMAS, variablesTema } from "@/lib/temas";

/** Elegir los colores de la aplicación: se ven al instante y se guardan en la cuenta. */
export default function SelectorTema({ actual }: { actual: string }) {
  const [elegido, setElegido] = useState(actual);
  const [aviso, setAviso] = useState("");

  async function elegir(clave: string) {
    const t = TEMAS.find((x) => x.clave === clave);
    if (!t) return;
    setElegido(clave);
    for (const [k, v] of Object.entries(variablesTema(t))) document.documentElement.style.setProperty(k, v);
    setAviso("Guardando…");
    const r = await guardarTema(clave);
    setAviso(r.error ?? "Guardado ✓");
  }

  return (
    <section className="tarjeta space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Colores de la app</h2>
          <p className="text-sm text-apagado">Elige el tema que más te guste. Solo cambia cómo la ves tú.</p>
        </div>
        {aviso && <span role="status" className="shrink-0 text-xs font-bold text-apagado">{aviso}</span>}
      </div>
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {TEMAS.map((t) => {
          const activo = elegido === t.clave;
          return (
            <li key={t.clave}>
              <button
                type="button"
                onClick={() => elegir(t.clave)}
                aria-pressed={activo}
                aria-label={`Tema ${t.nombre}`}
                className="group flex w-full flex-col items-center gap-1.5"
              >
                <span
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full transition group-active:scale-95 ${activo ? "ring-2 ring-offset-2" : ""}`}
                  style={{
                    background: `radial-gradient(circle at 25% 25%, ${t.f1}, transparent 60%), radial-gradient(circle at 80% 30%, ${t.f2}, transparent 60%), radial-gradient(circle at 60% 90%, ${t.f3}, transparent 60%), ${t.base}`,
                    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.8)",
                    ["--tw-ring-color" as string]: t.tinta,
                  }}
                >
                  <span className="h-5 w-5 rounded-full border-2 border-white" style={{ background: t.tinta }} />
                </span>
                <span className={`text-xs ${activo ? "font-extrabold" : "font-semibold text-apagado"}`}>{t.nombre}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
