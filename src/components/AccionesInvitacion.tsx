"use client";

import { useState } from "react";

/** Copiar o enviar por WhatsApp el enlace de una invitación. */
export default function AccionesInvitacion({ codigo, etiqueta }: { codigo: string; etiqueta?: string }) {
  const [copiada, setCopiada] = useState(false);
  const enlace = () => `${window.location.origin}/unirse?codigo=${codigo}`;
  const mensaje = () =>
    `${etiqueta ? `Hola ${etiqueta.split(" ")[0]}, t` : "T"}e invito a La Resistencia 👇\nEste enlace es solo para ti y caduca en 7 días:\n${enlace()}`;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn-claro !px-4 !py-2 text-xs"
        onClick={async () => {
          await navigator.clipboard.writeText(enlace());
          setCopiada(true);
          setTimeout(() => setCopiada(false), 2000);
        }}
      >
        {copiada ? "¡Copiado!" : "Copiar enlace"}
      </button>
      <button
        type="button"
        className="btn !border-[#25D366] !bg-[#25D366] !px-4 !py-2 text-xs !text-tinta"
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(mensaje())}`, "_blank", "noopener,noreferrer")}
      >
        Enviar por WhatsApp
      </button>
    </div>
  );
}
