import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import ChipsIntereses from "@/components/ChipsIntereses";
import TarjetaPlan from "@/components/TarjetaPlan";
import { COLUMNAS_PERFIL } from "@/lib/perfil";
import type { Plan } from "@/lib/planes";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilMiembro({ params }: PageProps<"/miembros/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const columnas = `*, profiles!creador_id(${COLUMNAS_PERFIL}), asistencias(estado, invitados, profiles(${COLUMNAS_PERFIL}))`;
  const [{ data: m }, { data: yo }, { data: planes }] = await Promise.all([
    supabase.from("profiles").select(`id, ${COLUMNAS_PERFIL}, edad, bio, intereses, rol`).eq("id", id).single(),
    supabase.from("profiles").select("intereses").eq("id", user!.id).single(),
    supabase.from("planes").select(columnas).eq("creador_id", id).gte("inicio", new Date().toISOString()).eq("cancelado", false).order("inicio").limit(3),
  ]);
  if (!m) notFound();

  const soyYo = m.id === user!.id;
  const comunes = soyYo ? [] : m.intereses.filter((v: string) => (yo?.intereses ?? []).includes(v));

  return (
    <div className="contenedor space-y-5">
      <Link href="/miembros" className="inline-block text-sm font-bold underline">← Miembros</Link>

      <section className="tarjeta flex flex-col items-center gap-3 text-center">
        <Avatar perfil={m} tam={112} anillo />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{m.nombre}</h1>
          <p className="text-sm font-semibold text-apagado">
            {[m.edad ? `${m.edad} años` : null, m.rol === "propietario" ? "Propietario 👑" : m.rol === "admin" ? "Administrador" : "Miembro"].filter(Boolean).join(" · ")}
          </p>
        </div>
        {m.bio && <p className="max-w-md whitespace-pre-line">{m.bio}</p>}
        {soyYo && <Link href="/perfil" className="btn">Editar mi perfil</Link>}
      </section>

      <section className="tarjeta space-y-3">
        <h2 className="text-lg font-extrabold">Gustos</h2>
        {m.intereses.length === 0 ? (
          <p className="text-apagado">{soyYo ? "Aún no has elegido tus gustos." : "Todavía no ha elegido sus gustos."}</p>
        ) : (
          <>
            {!soyYo && (
              <p className="text-sm text-apagado">
                {comunes.length > 0
                  ? `Tenéis ${comunes.length} ${comunes.length === 1 ? "gusto" : "gustos"} en común (en negro).`
                  : "No coincidís en ningún gusto, ¡motivo para conoceros!"}
              </p>
            )}
            <ChipsIntereses intereses={m.intereses} comunes={comunes} />
          </>
        )}
      </section>

      {planes && planes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold">Planes que propone</h2>
          {(planes as Plan[]).map((p) => <TarjetaPlan key={p.id} plan={p} />)}
        </section>
      )}
    </div>
  );
}
