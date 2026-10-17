"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Estado = { error?: string } | undefined;

export async function entrar(_: Estado, datos: FormData): Promise<Estado> {
  const email = String(datos.get("email") ?? "").trim();
  const password = String(datos.get("password") ?? "");
  if (!email || !password) return { error: "Escribe tu correo y tu clave." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Correo o clave incorrectos." };
  redirect("/");
}

export async function salir() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
