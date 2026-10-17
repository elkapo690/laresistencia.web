// Service worker mínimo: permite instalar la app y deja listo el terreno
// para las notificaciones push (Fase 3).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
