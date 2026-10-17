import Link from "next/link";
import FormPerfil from "@/components/FormPerfil";
import SelectorTema from "@/components/SelectorTema";
import { salir } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/server";

export default async function Perfil() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: p } = await supabase
    .from("profiles")
    .select("nombre, edad, bio, intereses, avatar_url, avatar_emoji, avatar_color, rol")
    .eq("id", user!.id)
    .single();
  const { data: aj } = await supabase.from("profiles").select("tema").eq("id", user!.id).maybeSingle();
  const admin = p?.rol === "admin" || p?.rol === "propietario";

  return (
    <div className="contenedor space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight">Mi perfil</h1>
        <Link href={`/miembros/${user!.id}`} className="text-sm font-bold underline">Ver cómo me ven</Link>
      </div>

      <SelectorTema actual={aj?.tema ?? "lila"} />

      <FormPerfil
        uid={user!.id}
        nombre={p?.nombre ?? ""}
        edad={p?.edad ?? null}
        bio={p?.bio ?? ""}
        intereses={p?.intereses ?? []}
        avatarUrl={p?.avatar_url ?? null}
        avatarEmoji={p?.avatar_emoji ?? null}
        avatarColor={p?.avatar_color ?? null}
      />

      <div className="flex flex-wrap gap-2 border-t-2 border-tinta/5 pt-5">
        <Link href="/cambiar-clave" className="btn-claro">Cambiar mi clave</Link>
        {admin && <Link href="/admin" className="btn-claro">Administración</Link>}
        <form action={salir}><button className="btn-claro">Cerrar sesión</button></form>
      </div>
    </div>
  );
}
