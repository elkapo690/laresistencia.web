"use client";

import { useActionState, useEffect, useRef } from "react";
import { comentar } from "@/app/(app)/planes/actions";

export default function FormComentario({ planId }: { planId: string }) {
  const [estado, enviar, pendiente] = useActionState(comentar, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.ok) ref.current?.reset();
  }, [estado]);

  return (
    <form ref={ref} action={enviar} className="space-y-2">
      <input type="hidden" name="plan_id" value={planId} />
      <textarea name="texto" rows={2} maxLength={1000} required placeholder="Escribe un comentario…" className="campo" />
      {estado?.error && <p role="alert" className="text-sm font-semibold text-red-700">{estado.error}</p>}
      <button className="btn" disabled={pendiente}>{pendiente ? "Enviando…" : "Comentar"}</button>
    </form>
  );
}
