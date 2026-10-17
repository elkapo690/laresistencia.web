"use server";

import { revalidatePath } from "next/cache";
import { AVATARES_EMOJI, COLORES_AVATAR, INTERESES, MAX_INTERESES } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";

export type EstadoPerfil = { error?: string; ok?: string } | undefined;

export async function guardarPerfil(_: EstadoPerfil, datos: FormData): Promise<EstadoPerfil> {
  const nombre = String(datos.get("nombre") ?? "").trim();
  const edadTxt = String(datos.get("edad") ?? "").trim();
  const bio = String(datos.get("bio") ?? "").trim();
  const emoji = String(datos.get("avatar_emoji") ?? "");
  const color = String(datos.get("avatar_color") ?? "");
  const intereses = [...new Set(datos.getAll("intereses").map(String))].filter((v) => INTERESES.some((i) => i.valor === v));

  if (!nombre || nombre.length > 60) return { error: "El nombre debe tener entre 1 y 60 caracteres." };
  const edad = edadTxt ? Number(edadTxt) : null;
  if (edad !== null && (!Number.isInteger(edad) || edad < 14 || edad > 99)) return { error: "La edad debe estar entre 14 y 99." };
  if (bio.length > 300) return { error: "La descripción admite hasta 300 caracteres." };
  if (intereses.length > MAX_INTERESES) return { error: `Elige como máximo ${MAX_INTERESES} intereses.` };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión caducada. Vuelve a entrar." };

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre,
      edad,
      bio,
      intereses,
      avatar_emoji: AVATARES_EMOJI.includes(emoji) ? emoji : null,
      avatar_color: COLORES_AVATAR.includes(color) ? color : null,
    })
    .eq("id", user.id);
  if (error) return { error: "No se han podido guardar los cambios." };

  revalidatePath("/", "layout");
  return { ok: "Perfil guardado" };
}

/** Guarda (o quita) la URL de la foto; solo se aceptan fotos de la carpeta del propio usuario. */
export async function guardarFoto(url: string | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión caducada." };

  if (url !== null) {
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatares/${user.id}/`;
    if (!url.startsWith(base)) return { error: "Foto no válida." };
  }
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  if (error) return { error: "No se ha podido guardar la foto." };
  revalidatePath("/", "layout");
  return {};
}

/** Guarda al momento el avatar (emoji y color) que se usa cuando no hay foto. */
export async function guardarAvatar(emoji: string, color: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión caducada." };
  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_emoji: AVATARES_EMOJI.includes(emoji) ? emoji : null,
      avatar_color: COLORES_AVATAR.includes(color) ? color : null,
    })
    .eq("id", user.id);
  if (error) return { error: "No se ha podido guardar el avatar." };
  revalidatePath("/", "layout");
  return {};
}
