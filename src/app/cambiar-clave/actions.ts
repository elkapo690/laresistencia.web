"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoClave = { error?: string } | undefined;

export async function cambiarClave(_: EstadoClave, datos: FormData): Promise<EstadoClave> {
  const nueva = String(datos.get("nueva") ?? "");
  const repetir = String(datos.get("repetir") ?? "");
  if (nueva.length < 8) return { error: "La clave debe tener al menos 8 caracteres." };
  if (nueva !== repetir) return { error: "Las dos claves no coinciden." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) {
    if (/different|same/i.test(error.message)) return { error: "La clave nueva tiene que ser distinta de la actual." };
    return { error: "No se ha podido cambiar la clave. Inténtalo de nuevo." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await supabase.from("profiles").update({ cambiar_clave: false }).eq("id", user.id);
  redirect("/");
}
