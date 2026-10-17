"use client";

import { useActionState, useState } from "react";
import { restablecerClave } from "@/app/(app)/admin/actions";

export default function RestablecerClave({ usuario, nombre }: { usuario: string; nombre: string }) {
  const [estado, enviar, pendiente] = useActionState(restablecerClave, undefined);
  const [copiada, setCopiada] = useState(false);

  const mensaje = (clave: string) =>
    `Hola ${nombre.split(" ")[0]}, tu clave temporal de La Resistencia es: ${clave}\nEntra en ${window.location.origin}/login y te pedirá elegir una nueva.`;

  return (
    <div className="basis-full">
      {estado?.clave ? (
        <div className="mt-2 space-y-3 rounded-2xl bg-[#FFF0CC] p-4">
          <p className="text-sm font-bold">Clave temporal para {estado.nombre}:</p>
          <p className="select-all break-all text-center font-mono text-2xl font-extrabold tracking-wider">{estado.clave}</p>
          <p className="text-xs text-black/60">Solo se muestra ahora. Al entrar con ella, {estado.nombre?.split(" ")[0]} tendrá que elegir una clave nueva.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-claro !py-2 text-xs"
              onClick={async () => {
                await navigator.clipboard.writeText(estado.clave!);
                setCopiada(true);
              }}
            >
              {copiada ? "¡Copiada!" : "Copiar"}
            </button>
            <a
              className="btn !border-[#25D366] !bg-[#25D366] !py-2 text-xs !text-tinta"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(mensaje(estado.clave))}`}
            >
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <form
          action={enviar}
          onSubmit={(e) => {
            if (!window.confirm(`¿Restablecer la clave de ${nombre}?\n\nSe cerrará su sesión y tendrá que entrar con una clave temporal.`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="usuario" value={usuario} />
          <input type="hidden" name="nombre" value={nombre} />
          <button className="btn-claro !px-4 !py-2 text-xs" disabled={pendiente}>{pendiente ? "Generando…" : "Nueva clave"}</button>
          {estado?.error && <span role="alert" className="ml-2 text-xs font-semibold text-red-700">{estado.error}</span>}
        </form>
      )}
    </div>
  );
}
