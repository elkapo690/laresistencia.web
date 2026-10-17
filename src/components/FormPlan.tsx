"use client";

import { useActionState, useRef, useState } from "react";
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
  const [categoria, setCategoria] = useState(valores.categoria ?? "otro");
  const [pago, setPago] = useState((valores.coste ?? 0) > 0);
  const [importe, setImporte] = useState(valores.coste ? String(valores.coste).replace(".", ",") : "");
  const campoImporte = useRef<HTMLInputElement>(null);

  function elegirPago(deVerdad: boolean) {
    setPago(deVerdad);
    if (deVerdad) setTimeout(() => campoImporte.current?.focus(), 0);
  }
  const boton = (activo: boolean) =>
    `rounded-full border-2 px-4 py-3 text-sm font-bold transition ${activo ? "border-tinta bg-tinta text-white" : "border-tinta/15 bg-white hover:border-tinta/40"}`;
  return (
    <form action={enviar} className="space-y-4">
      {valores.id && <input type="hidden" name="id" value={valores.id} />}
      <div>
        <label className="etiqueta" htmlFor="titulo">¿Qué plan es?</label>
        <input id="titulo" name="titulo" required maxLength={120} defaultValue={valores.titulo} className="campo" placeholder="Barbacoa en casa de Pepe" />
      </div>
      <div>
        <p className="etiqueta" id="etiqueta-categoria">¿Qué tipo de plan es?</p>
        <input type="hidden" name="categoria" value={categoria} />
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="etiqueta-categoria">
          {CATEGORIAS.map((c) => {
            const activa = categoria === c.valor;
            return (
              <button
                key={c.valor}
                type="button"
                aria-pressed={activa}
                onClick={() => setCategoria(c.valor)}
                style={activa ? undefined : { background: c.color }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition active:scale-95 ${activa ? "bg-tinta text-white ring-2 ring-tinta ring-offset-2" : ""}`}
              >
                <span aria-hidden>{c.emoji}</span> {c.etiqueta}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="etiqueta" htmlFor="inicio">Fecha y hora</label>
        <input id="inicio" name="inicio" type="datetime-local" required defaultValue={valores.inicio} className="campo" />
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
          <p className="etiqueta" id="etiqueta-coste">Coste por persona</p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="etiqueta-coste">
            <button type="button" aria-pressed={!pago} onClick={() => elegirPago(false)} className={boton(!pago)}>Gratis</button>
            <button type="button" aria-pressed={pago} onClick={() => elegirPago(true)} className={boton(pago)}>De pago</button>
          </div>
          {pago ? (
            <div className="mt-2 space-y-2">
              <div className="relative">
                <input
                  ref={campoImporte}
                  id="coste"
                  name="coste"
                  type="text"
                  inputMode="decimal"
                  required
                  autoComplete="off"
                  value={importe}
                  onChange={(e) => setImporte(e.target.value.replace(/[^0-9.,]/g, ""))}
                  onFocus={(e) => e.target.select()}
                  placeholder="Ej. 12,50"
                  aria-label="Importe por persona en euros"
                  className="campo pr-12"
                />
                <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-apagado">€</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 30].map((n) => (
                  <button key={n} type="button" onClick={() => setImporte(String(n))} className="rounded-full border-2 border-tinta/15 bg-white px-3.5 py-1.5 text-sm font-bold transition hover:border-tinta/40 active:scale-95">
                    {n} €
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <input type="hidden" name="coste" value="0" />
          )}
          <p className="mt-1 text-xs text-apagado">{pago ? "Lo que paga cada persona." : "No hay que pagar nada."}</p>
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
