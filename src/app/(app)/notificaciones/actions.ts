"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function guardarSuscripcion(datos: { endpoint: string; p256dh: string; auth: string }) {
  if (!datos.endpoint || !datos.p256dh || !datos.auth) return { error: "Suscripción no válida." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión caducada." };
  const { error } = await supabase
    .from("suscripciones_push")
    .upsert(
      { usuario_id: user.id, endpoint: datos.endpoint, clave_p256dh: datos.p256dh, clave_auth: datos.auth },
      { onConflict: "endpoint" },
    );
  return error ? { error: "No se ha podido activar el aviso." } : {};
}

export async function borrarSuscripcion(endpoint: string) {
  const supabase = await createClient();
  await supabase.from("suscripciones_push").delete().eq("endpoint", endpoint);
}

export async function marcarTodasLeidas() {
  const supabase = await createClient();
  await supabase.from("notificaciones").update({ leida: true }).eq("leida", false);
  revalidatePath("/", "layout");
}
