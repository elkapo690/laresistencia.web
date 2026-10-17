"use client";

import { useActionState } from "react";
import { registrarse } from "./actions";

export default function FormUnirse({ codigo }: { codigo: string }) {
  const [estado, accion, pendiente] = useActionState(registrarse, undefined);
  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="codigo" value={codigo} />
      <div>
        <label className="etiqueta" htmlFor="nombre">Nombre (como te conocen en el grupo)</label>
        <input id="nombre" name="nombre" required maxLength={60} autoComplete="name" className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">Clave (mínimo 8 caracteres)</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="campo" />
      </div>
      {estado?.error && <p role="alert" className="text-sm font-semibold text-red-700">{estado.error}</p>}
      <button className="btn w-full" disabled={pendiente}>{pendiente ? "Creando cuenta…" : "Unirme a la resistencia"}</button>
    </form>
  );
}
