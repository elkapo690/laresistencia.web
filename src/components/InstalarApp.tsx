"use client";

import { useEffect, useState } from "react";

type EventoInstalar = Event & { prompt: () => Promise<void> };
type Modo = "oculto" | "android" | "ios" | "otro";

export default function InstalarApp() {
  const [modo, setModo] = useState<Modo>("oculto");
  const [evento, setEvento] = useState<EventoInstalar | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (window.matchMedia("(display-mode: standalone)").matches) return;
      setModo(/iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "otro");
    }, 0);
    const alInstalar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
      setModo("android");
    };
    window.addEventListener("beforeinstallprompt", alInstalar);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", alInstalar);
    };
  }, []);

  if (modo === "oculto") return null;
  return (
    <div className="rounded-3xl border-2 border-dashed border-tinta/20 p-4 text-center">
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-tinta text-lg font-extrabold text-white">LR</div>
      <p className="text-sm font-extrabold">Instala la app</p>
      {modo === "android" && (
        <>
          <p className="mb-3 text-xs text-apagado">Ábrela desde tu pantalla de inicio.</p>
          <button className="btn !px-4 !py-2 text-xs" onClick={() => evento?.prompt()}>Instalar</button>
        </>
      )}
      {modo === "ios" && (
        <p className="text-xs text-apagado">En Safari pulsa <b>Compartir</b> y luego <b>Añadir a pantalla de inicio</b>.</p>
      )}
      {modo === "otro" && <p className="text-xs text-apagado">Desde el menú del navegador: <b>Instalar app</b>.</p>}
    </div>
  );
}
