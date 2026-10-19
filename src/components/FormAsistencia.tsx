"use client";

import { useActionState, useState } from "react";
import { apuntarse, desapuntarse } from "@/app/(app)/planes/actions";

const OPCIONES = [
  { v: "voy", t: "Voy" },
  { v: "quizas", t: "Quizás" },
];

export default function FormAsistencia({
  planId,
  estadoInicial,
  invitadosIniciales,
  plazasLibres,
}: {
  planId: string;
  estadoInicial?: string;
  invitadosIniciales: string[];
  plazasLibres: number;
}) {
  const [estado, enviar, pendiente] = useActionState(apuntarse, undefined);
  // Los registros antiguos con "no voy" se tratan como no apuntado.
  const apuntado = estadoInicial === "voy" || estadoInicial === "quizas";
  const [sel, setSel] = useState(apuntado ? estadoInicial : "voy");

  return (
    <div className="space-y-3">
    <form action={enviar} className="space-y-4">
      <input type="hidden" name="plan_id" value={planId} />
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tu respuesta">
        {OPCIONES.map((o) => (
          <label
            key={o.v}
            className={`cursor-pointer rounded-full border-2 border-tinta py-2.5 text-center text-sm font-semibold transition ${
              sel === o.v ? "bg-tinta text-white" : "bg-white hover:bg-suave"
            }`}
          >
            <input type="radio" name="estado" value={o.v} checked={sel === o.v} onChange={() => setSel(o.v)} className="sr-only" />
            {o.t}
          </label>
        ))}
      </div>

      {sel === "voy" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Invitados (máximo 2)</p>
          {[0, 1].map((i) => (
            <input
              key={i}
              name={`invitado${i + 1}`}
              defaultValue={invitadosIniciales[i] ?? ""}
              maxLength={60}
              placeholder={`Nombre del invitado ${i + 1} (opcional)`}
              className="campo"
            />
          ))}
          <p className="text-xs text-apagado">Cada invitado ocupa una plaza. Quedan {plazasLibres} libres{apuntado && estadoInicial === "voy" ? " (sin contar las tuyas)" : ""}.</p>
        </div>
      )}

      {estado?.error && <p role="alert" className="text-sm font-semibold text-red-700">{estado.error}</p>}
      {estado?.ok && <p role="status" className="text-sm font-semibold">{estado.ok}</p>}
      <button className="btn w-full" disabled={pendiente}>
        {pendiente ? "Guardando…" : apuntado ? "Guardar cambios" : sel === "voy" ? "Apuntarme" : "Apuntarme como «quizás»"}
      </button>
    </form>

    {apuntado && (
      <form action={desapuntarse} className="text-center">
        <input type="hidden" name="plan_id" value={planId} />
        <button aria-label="Ya no puedo ir: quitar mi apuntado" className="text-sm font-bold text-apagado underline transition hover:text-red-700">Ya no puedo ir 😢</button>
      </form>
    )}
    </div>
  );
}
