"use client";

import { useActionState } from "react";
import { cambiarClave } from "./actions";

export default function FormCambiarClave() {
  const [estado, enviar, pendiente] = useActionState(cambiarClave, undefined);
  return (
    <form action={enviar} className="space-y-4">
      <div>
        <label className="etiqueta" htmlFor="nueva">Clave nueva (mínimo 8 caracteres)</label>
        <input id="nueva" name="nueva" type="password" required minLength={8} autoComplete="new-password" className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="repetir">Repite la clave nueva</label>
        <input id="repetir" name="repetir" type="password" required minLength={8} autoComplete="new-password" className="campo" />
      </div>
      {estado?.error && <p role="alert" className="text-sm font-semibold text-red-700">{estado.error}</p>}
      <button className="btn w-full" disabled={pendiente}>{pendiente ? "Guardando…" : "Guardar clave nueva"}</button>
    </form>
  );
}
