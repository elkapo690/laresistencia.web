"use client";

import { useEffect, useState } from "react";
import { borrarSuscripcion, guardarSuscripcion } from "@/app/(app)/notificaciones/actions";

type Estado = "cargando" | "no-disponible" | "instalar-ios" | "bloqueado" | "inactivo" | "activo";

function claveABytes(base64: string) {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const bin = atob((base64 + relleno).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export default function ActivarAvisos() {
  const clave = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const [estado, setEstado] = useState<Estado>("cargando");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const instalada = window.matchMedia("(display-mode: standalone)").matches;
      if (!clave || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setEstado(ios && !instalada ? "instalar-ios" : "no-disponible");
        return;
      }
      if (Notification.permission === "denied") return setEstado("bloqueado");
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        setEstado(sub ? "activo" : "inactivo");
      } catch {
        setEstado("inactivo");
      }
    }, 0);
    return () => clearTimeout(t);
  }, [clave]);

  async function activar() {
    setError("");
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") return setEstado(permiso === "denied" ? "bloqueado" : "inactivo");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: claveABytes(clave!) });
      const j = sub.toJSON();
      const r = await guardarSuscripcion({ endpoint: sub.endpoint, p256dh: j.keys?.p256dh ?? "", auth: j.keys?.auth ?? "" });
      if (r.error) throw new Error(r.error);
      setEstado("activo");
    } catch {
      setError("No se han podido activar los avisos en este dispositivo.");
    }
  }

  async function desactivar() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await borrarSuscripcion(sub.endpoint);
      await sub.unsubscribe();
    }
    setEstado("inactivo");
  }

  if (estado === "cargando") return null;
  return (
    <div className="tarjeta flex flex-wrap items-center justify-between gap-3 !p-4">
      <div className="min-w-0 flex-1">
        <p className="font-extrabold">Avisos en el móvil</p>
        <p className="text-sm text-apagado">
          {estado === "activo" && "Activados en este dispositivo: te avisaremos de planes nuevos y comentarios."}
          {estado === "inactivo" && "Recibe un aviso cuando haya un plan nuevo o te comenten."}
          {estado === "bloqueado" && "Los avisos están bloqueados en tu navegador. Actívalos en los ajustes del sitio."}
          {estado === "instalar-ios" && "En iPhone, primero instala la app: Compartir → Añadir a pantalla de inicio. Luego vuelve aquí."}
          {estado === "no-disponible" && "Este dispositivo no admite avisos. Los verás aquí dentro de la web."}
        </p>
        {error && <p role="alert" className="mt-1 text-sm font-semibold text-red-700">{error}</p>}
      </div>
      {estado === "inactivo" && <button className="btn !py-2" onClick={activar}>Activar</button>}
      {estado === "activo" && <button className="btn-claro !py-2" onClick={desactivar}>Desactivar</button>}
    </div>
  );
}
