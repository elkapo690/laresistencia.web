"use client";

import { useActionState } from "react";
import { CATEGORIAS } from "@/lib/planes";
import type { Estado } from "@/app/(app)/planes/actions";

type Valores = {
  id?: string;
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  inicio?: string; // valor datetime-local
  lugar?: string;
  aforo?: number;
  coste?: number;
};

export default function FormPlan({
  accion,
  valores = {},
  textoBoton,
}: {
  accion: (e: Estado, d: FormData) => Promise<Estado>;
  valores?: Valores;
  textoBoton: string;
}) {
  const [estado, enviar, pendiente] = useActionState(accion, undefined);
  return (
    <form action={enviar} className="space-y-4">
      {valores.id && <input type="hidden" name="id" value={valores.id} />}
      <div>
        <label className="etiqueta" htmlFor="titulo">¿Qué plan es?</label>
        <input id="titulo" name="titulo" required maxLength={120} defaultValue={valores.titulo} className="campo" placeholder="Barbacoa en casa de Pepe" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="inicio">Fecha y hora</label>
          <input id="inicio" name="inicio" type="datetime-local" required defaultValue={valores.inicio} className="campo" />
        </div>
        <div>
          <label className="etiqueta" htmlFor="categoria">Categoría</label>
          <select id="categoria" name="categoria" defaultValue={valores.categoria ?? "otro"} className="campo">
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor}>{c.etiqueta}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="etiqueta" htmlFor="lugar">Lugar</label>
        <input id="lugar" name="lugar" required maxLength={200} defaultValue={valores.lugar} className="campo" placeholder="Nombre del sitio y dirección" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="aforo">Aforo máximo</label>
          <input id="aforo" name="aforo" type="number" inputMode="numeric" min={1} max={500} required defaultValue={valores.aforo} className="campo" placeholder="12" />
          <p className="mt-1 text-xs text-apagado">Cuentan los apuntados y sus invitados.</p>
        </div>
        <div>
          <label className="etiqueta" htmlFor="coste">Coste por persona (€)</label>
          <input id="coste" name="coste" type="number" inputMode="decimal" min={0} step="0.01" defaultValue={valores.coste ?? 0} className="campo" />
          <p className="mt-1 text-xs text-apagado">Déjalo en 0 si es gratis.</p>
        </div>
      </div>
      <div>
        <label className="etiqueta" htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows={5} maxLength={2000} defaultValue={valores.descripcion} className="campo" placeholder="Qué vamos a hacer, qué hay que llevar, cómo llegar…" />
      </div>
      {estado?.error && <p role="alert" className="text-sm font-semibold text-red-700">{estado.error}</p>}
      <button className="btn w-full sm:w-auto" disabled={pendiente}>{pendiente ? "Guardando…" : textoBoton}</button>
    </form>
  );
}
