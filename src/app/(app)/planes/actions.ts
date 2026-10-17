"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { madridAISO } from "@/lib/fechas";
import { CATEGORIAS } from "@/lib/planes";
import { enviarPush } from "@/lib/push";
import { createClient } from "@/lib/supabase/server";

export type Estado = { error?: string; ok?: string } | undefined;

function leerPlan(d: FormData) {
  const titulo = String(d.get("titulo") ?? "").trim();
  const descripcion = String(d.get("descripcion") ?? "").trim();
  const categoria = String(d.get("categoria") ?? "otro");
  const cuando = String(d.get("inicio") ?? "");
  const lugar = String(d.get("lugar") ?? "").trim();
  const aforo = Number(d.get("aforo"));
  const coste = Number(String(d.get("coste") ?? "0").replace(",", ".") || 0);

  if (!titulo) return { error: "Ponle un título al plan." };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(cuando)) return { error: "Indica fecha y hora." };
  if (!lugar) return { error: "Indica dónde será." };
  if (!Number.isInteger(aforo) || aforo < 1 || aforo > 500) return { error: "El aforo debe ser un número entre 1 y 500." };
  if (!Number.isFinite(coste) || coste < 0 || coste > 9999) return { error: "El coste no es válido." };
  if (!CATEGORIAS.some((c) => c.valor === categoria)) return { error: "Categoría no válida." };

  return {
    valores: {
      titulo,
      descripcion,
      categoria,
      inicio: madridAISO(cuando),
      lugar,
      aforo,
      coste_por_persona: Math.round(coste * 100) / 100,
    },
  };
}

export async function crearPlan(_: Estado, datos: FormData): Promise<Estado> {
  const r = leerPlan(datos);
  if (!r.valores) return { error: r.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("planes")
    .insert({ ...r.valores, creador_id: user.id })
    .select("id")
    .single();
  if (error || !data) return { error: "No se ha podido crear el plan." };

  // El creador se apunta automáticamente.
  await supabase.from("asistencias").insert({ plan_id: data.id, usuario_id: user.id, estado: "voy", invitados: [] });
  after(() => enviarPush(supabase, data.id, "nuevo_plan"));
  revalidatePath("/");
  redirect(`/planes/${data.id}`);
}

export async function editarPlan(_: Estado, datos: FormData): Promise<Estado> {
  const id = String(datos.get("id") ?? "");
  const r = leerPlan(datos);
  if (!r.valores) return { error: r.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from("planes").update(r.valores).eq("id", id).select("id");
  if (error) {
    if (error.message.includes("aforo_insuficiente"))
      return { error: "Ya hay más plazas ocupadas que ese aforo." };
    return { error: "No se ha podido guardar." };
  }
  if (!data?.length) return { error: "Solo quien creó el plan (o el propietario) puede editarlo." };
  revalidatePath("/");
  redirect(`/planes/${id}`);
}

export async function cambiarCancelacion(datos: FormData) {
  const id = String(datos.get("id") ?? "");
  const cancelado = datos.get("cancelado") === "true";
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancelar_plan", { p_plan: id, p_cancelado: cancelado });
  // Respaldo por si la función aún no está en la base de datos: lo permite el creador.
  if (error) await supabase.from("planes").update({ cancelado }).eq("id", id);
  if (cancelado) after(() => enviarPush(supabase, id, "plan_cancelado"));
  revalidatePath("/");
  revalidatePath(`/planes/${id}`);
}

export async function apuntarse(_: Estado, datos: FormData): Promise<Estado> {
  const planId = String(datos.get("plan_id") ?? "");
  const estado = String(datos.get("estado") ?? "");
  if (!["voy", "quizas", "no"].includes(estado)) return { error: "Elige una opción." };

  const invitados =
    estado === "voy"
      ? ["invitado1", "invitado2"]
          .map((k) => String(datos.get(k) ?? "").trim().slice(0, 60))
          .filter(Boolean)
      : [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: plan } = await supabase.from("planes").select("cancelado").eq("id", planId).single();
  if (!plan) return { error: "El plan no existe." };
  if (plan.cancelado) return { error: "Este plan está cancelado." };

  const { error } = await supabase
    .from("asistencias")
    .upsert(
      { plan_id: planId, usuario_id: user.id, estado, invitados, actualizado_en: new Date().toISOString() },
      { onConflict: "plan_id,usuario_id" },
    );
  if (error) {
    if (error.message.includes("plan_completo"))
      return { error: "No quedan plazas suficientes (tú y tus invitados contáis cada uno)." };
    return { error: "No se ha podido guardar tu respuesta." };
  }
  revalidatePath(`/planes/${planId}`);
  revalidatePath("/");
  return { ok: "¡Guardado!" };
}

export async function comentar(_: Estado, datos: FormData): Promise<Estado> {
  const planId = String(datos.get("plan_id") ?? "");
  const texto = String(datos.get("texto") ?? "").trim();
  if (!texto) return { error: "Escribe algo antes de enviar." };
  if (texto.length > 1000) return { error: "El comentario es demasiado largo (máximo 1000 caracteres)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("comentarios").insert({ plan_id: planId, usuario_id: user.id, texto });
  if (error) return { error: "No se ha podido publicar el comentario." };

  after(() => enviarPush(supabase, planId, "comentario"));
  revalidatePath(`/planes/${planId}`);
  return { ok: "Publicado" };
}

export async function borrarComentario(datos: FormData) {
  const id = String(datos.get("id") ?? "");
  const planId = String(datos.get("plan_id") ?? "");
  const supabase = await createClient();
  await supabase.from("comentarios").delete().eq("id", id);
  revalidatePath(`/planes/${planId}`);
}

/** Solo propietario y admins (lo exige la base de datos). El registro de actividad lo anota un disparador. */
export async function eliminarPlan(datos: FormData) {
  const id = String(datos.get("id") ?? "");
  const supabase = await createClient();
  const { data } = await supabase.from("planes").delete().eq("id", id).select("id");
  if (!data?.length) redirect(`/planes/${id}`);
  revalidatePath("/");
  redirect("/");
}

/** Solo el propietario (lo exige la base de datos). */
export async function quitarAsistente(datos: FormData) {
  const planId = String(datos.get("plan_id") ?? "");
  const usuarioId = String(datos.get("usuario_id") ?? "");
  const supabase = await createClient();
  await supabase.from("asistencias").delete().eq("plan_id", planId).eq("usuario_id", usuarioId);
  revalidatePath(`/planes/${planId}`);
  revalidatePath("/");
}
