"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoInvitacion = { codigo?: string; etiqueta?: string; error?: string } | undefined;

/** Crea una invitación de un solo uso (caduca a los 7 días). Solo admins y propietario (lo exige la base de datos). */
export async function crearInvitacion(_: EstadoInvitacion, datos: FormData): Promise<EstadoInvitacion> {
  const etiqueta = String(datos.get("etiqueta") ?? "").trim().slice(0, 60);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión caducada." };
  const { data, error } = await supabase
    .from("invitaciones")
    .insert({ etiqueta, creado_por: user.id })
    .select("codigo")
    .single();
  if (error || !data) return { error: "No se ha podido crear la invitación." };
  revalidatePath("/admin");
  return { codigo: data.codigo, etiqueta };
}

/** Anula una invitación que todavía no se ha usado. */
export async function anularInvitacion(datos: FormData) {
  const codigo = String(datos.get("codigo") ?? "");
  const supabase = await createClient();
  await supabase.from("invitaciones").update({ activa: false }).eq("codigo", codigo).is("usado_en", null);
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

export type EstadoClave = { clave?: string; nombre?: string; error?: string } | undefined;

// Sin caracteres que se confundan al leerlos (0/O, 1/l/I).
const ALFABETO = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generarClave() {
  const parte = () => Array.from({ length: 5 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  return `${parte()}-${parte()}`;
}

/** Admin: solo a miembros. Propietario: a cualquiera. La base de datos lo comprueba. */
export async function restablecerClave(_: EstadoClave, datos: FormData): Promise<EstadoClave> {
  const usuario = String(datos.get("usuario") ?? "");
  const nombre = String(datos.get("nombre") ?? "");
  const clave = generarClave();
  const supabase = await createClient();
  const { error } = await supabase.rpc("restablecer_clave", { p_usuario: usuario, p_clave: clave });
  if (error) return { error: "No se ha podido restablecer la clave." };
  revalidatePath("/admin");
  return { clave, nombre };
}

/** Solo el propietario. Borra también sus planes, comentarios y apuntados. */
export async function eliminarMiembro(datos: FormData) {
  const usuario = String(datos.get("usuario") ?? "");
  const supabase = await createClient();
  await supabase.rpc("eliminar_miembro", { p_usuario: usuario });
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}
