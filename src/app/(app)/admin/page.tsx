import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { desactivarCodigo, nuevoCodigo } from "./actions";

export default async function Admin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: yo } = await supabase.from("profiles").select("rol").eq("id", user!.id).single();
  if (yo?.rol !== "admin") redirect("/");

  const [{ data: activa }, { data: miembros }] = await Promise.all([
    supabase.from("invitaciones").select("codigo").eq("activa", true).limit(1).maybeSingle(),
    supabase.from("profiles").select("id, nombre, rol, creado_en").order("creado_en"),
  ]);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const enlace = activa ? `${proto}://${host}/unirse?codigo=${activa.codigo}` : null;

  return (
    <div className="contenedor space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Administración</h1>

      <section className="tarjeta space-y-3">
        <h2 className="text-lg font-extrabold">Enlace de invitación</h2>
        {enlace ? (
          <>
            <p className="text-sm text-apagado">Compártelo en el grupo de WhatsApp. Quien lo abra podrá crear su cuenta.</p>
            <input readOnly value={enlace} className="campo text-sm" aria-label="Enlace de invitación" />
          </>
        ) : (
          <p className="text-apagado">No hay ningún enlace activo: nadie nuevo puede registrarse.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <form action={nuevoCodigo}><button className="btn">{enlace ? "Generar enlace nuevo" : "Activar enlace"}</button></form>
          {enlace && <form action={desactivarCodigo}><button className="btn-claro">Desactivar</button></form>}
        </div>
        {enlace && <p className="text-xs text-apagado">Generar uno nuevo invalida el anterior.</p>}
      </section>

      <section className="tarjeta space-y-3">
        <h2 className="text-lg font-extrabold">Miembros ({miembros?.length ?? 0})</h2>
        <ul className="divide-y-2 divide-tinta/10">
          {miembros?.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-2">
              <span className="font-semibold">{m.nombre}</span>
              {m.rol === "admin" && <span className="chip">Admin</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
