"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function nuevoCodigo() {
  const supabase = await createClient();
  // Las políticas RLS rechazan a cualquiera que no sea admin.
  await supabase.from("invitaciones").update({ activa: false }).eq("activa", true);
  await supabase.from("invitaciones").insert({});
  revalidatePath("/admin");
}

export async function desactivarCodigo() {
  const supabase = await createClient();
  await supabase.from("invitaciones").update({ activa: false }).eq("activa", true);
  revalidatePath("/admin");
}

/** Solo el propietario puede nombrar o quitar administradores (lo exige la base de datos). */
export async function cambiarRol(datos: FormData) {
  const usuario = String(datos.get("usuario") ?? "");
  const rol = String(datos.get("rol") ?? "");
  const supabase = await createClient();
  await supabase.rpc("cambiar_rol", { p_usuario: usuario, p_rol: rol });
  revalidatePath("/admin");
}
