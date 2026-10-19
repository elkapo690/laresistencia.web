"use client";

import { useActionState } from "react";
import AccionesInvitacion from "./AccionesInvitacion";
import { crearInvitacion } from "@/app/(app)/admin/actions";

export default function NuevaInvitacion() {
  const [estado, enviar, pendiente] = useActionState(crearInvitacion, undefined);
  return (
    <div className="space-y-3">
      <form action={enviar} className="flex flex-col gap-2 sm:flex-row">
        <input name="etiqueta" maxLength={60} placeholder="¿Para quién? (opcional)" aria-label="Nombre de la persona invitada" className="campo flex-1" />
        <button className="btn" disabled={pendiente}>{pendiente ? "Creando…" : "Crear invitación"}</button>
      </form>
      {estado?.error && <p role="alert" className="text-sm font-semibold text-red-700">{estado.error}</p>}
      {estado?.codigo && (
        <div className="space-y-3 rounded-2xl bg-[#D7F2DF] p-4">
          <p className="text-sm font-bold">
            ✅ Invitación creada{estado.etiqueta ? ` para ${estado.etiqueta}` : ""}. Envíasela ahora:
          </p>
          <AccionesInvitacion codigo={estado.codigo} etiqueta={estado.etiqueta} />
          <p className="text-xs text-black/60">Sirve para una sola persona y caduca en 7 días. Aparece abajo, en «Pendientes».</p>
        </div>
      )}
    </div>
  );
}
