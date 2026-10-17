"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Estado } from "../login/actions";

export async function registrarse(_: Estado, datos: FormData): Promise<Estado> {
  const nombre = String(datos.get("nombre") ?? "").trim();
  const email = String(datos.get("email") ?? "").trim();
  const password = String(datos.get("password") ?? "");
  const codigo = String(datos.get("codigo") ?? "").trim();

  if (!nombre) return { error: "Dinos cómo te llamas." };
  if (!email) return { error: "Escribe tu correo." };
  if (password.length < 8) return { error: "La clave debe tener al menos 8 caracteres." };

  const supabase = await createClient();
  const { data: valido } = await supabase.rpc("codigo_valido", { p_codigo: codigo });
  if (!valido) return { error: "Este enlace de invitación no es válido o ha caducado." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre, codigo } },
  });
  if (error) {
    if (/already|registered/i.test(error.message)) return { error: "Ese correo ya tiene cuenta. Entra desde la pantalla de acceso." };
    return { error: "No hemos podido crear la cuenta. Inténtalo de nuevo." };
  }
  if (!data.session) {
    return { error: "Cuenta creada. Revisa tu correo para confirmarla y luego entra." };
  }
  redirect("/");
}
