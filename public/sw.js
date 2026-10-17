// Service worker: permite instalar la app y recibe los avisos push.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let datos = {};
  try {
    datos = e.data ? e.data.json() : {};
  } catch {
    datos = { body: e.data ? e.data.text() : "" };
  }
  e.waitUntil(
    self.registration.showNotification(datos.title || "La Resistencia", {
      body: datos.body || "",
      icon: "/icons/192",
      badge: "/icons/192",
      data: { url: datos.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if ("focus" in v) {
          if ("navigate" in v) v.navigate(url);
          return v.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
