import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Envía avisos push a quienes tengan un aviso nuevo de ese plan.
 * Si no hay claves VAPID configuradas, no hace nada (los avisos dentro de la web siguen funcionando).
 */
export async function enviarPush(supabase: SupabaseClient, planId: string, tipo: string) {
  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  if (!publica || !privada) return;

  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:admin@example.com", publica, privada);
    const { data } = await supabase.rpc("tomar_push", { p_plan: planId, p_tipo: tipo });
    if (!data?.length) return;
    await Promise.allSettled(
      data.map((s: { endpoint: string; clave_p256dh: string; clave_auth: string; titulo: string; cuerpo: string; url: string }) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.clave_p256dh, auth: s.clave_auth } },
          JSON.stringify({ title: s.titulo, body: s.cuerpo, url: s.url }),
        ),
      ),
    );
  } catch {
    // Un fallo al avisar nunca debe romper la acción del usuario.
  }
}
