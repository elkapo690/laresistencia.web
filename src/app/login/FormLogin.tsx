"use client";

import { useActionState } from "react";
import { entrar } from "./actions";

export default function FormLogin() {
  const [estado, accion, pendiente] = useActionState(entrar, undefined);
  return (
    <form action={accion} className="space-y-4">
      <div>
        <label className="etiqueta" htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="campo" placeholder="tu@correo.com" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">Clave</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="campo" />
      </div>
      {estado?.error && <p role="alert" className="text-sm font-semibold text-red-700">{estado.error}</p>}
      <button className="btn w-full" disabled={pendiente}>{pendiente ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
