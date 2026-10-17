import Link from "next/link";
import FormCambiarClave from "./FormCambiarClave";
import { createClient } from "@/lib/supabase/server";

export default async function CambiarClave() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Si la columna aún no existe, se trata como cambio voluntario.
  const { data } = await supabase.from("profiles").select("cambiar_clave").eq("id", user!.id).maybeSingle();
  const obligatorio = data?.cambiar_clave === true;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <div className="overflow-hidden rounded-[2.5rem] bg-white/90 shadow-[0_40px_90px_-30px_rgba(60,40,120,0.4)] backdrop-blur">
        <div className="relative bg-gradient-to-br from-[#FFF0CC] via-[#FFDCEB] to-[#E8DEFF] px-8 pb-8 pt-10">
          <span aria-hidden className="absolute right-6 top-5 text-4xl">🔑</span>
          <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight">
            {obligatorio ? "Elige tu clave nueva" : "Cambiar mi clave"}
          </h1>
          <p className="mt-2 text-sm font-semibold text-black/60">
            {obligatorio
              ? "Un administrador te ha dado una clave temporal. Antes de seguir, pon una que solo sepas tú."
              : "Escribe la clave nueva que quieres usar."}
          </p>
        </div>
        <div className="space-y-5 p-8">
          <FormCambiarClave />
          {!obligatorio && <Link href="/perfil" className="inline-block text-sm font-bold underline">← Volver a mi perfil</Link>}
        </div>
      </div>
    </main>
  );
}
