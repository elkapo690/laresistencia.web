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
