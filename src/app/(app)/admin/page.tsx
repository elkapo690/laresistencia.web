import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/server";
import { cambiarRol, desactivarCodigo, nuevoCodigo } from "./actions";

const ETIQUETA: Record<string, string> = { propietario: "Propietario", admin: "Admin", miembro: "Miembro" };

export default async function Admin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: yo } = await supabase.from("profiles").select("rol").eq("id", user!.id).single();
  const esPropietario = yo?.rol === "propietario";
  if (!esPropietario && yo?.rol !== "admin") redirect("/");

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
      <h1 className="text-4xl font-extrabold tracking-tight">Administración</h1>

      <section className="tarjeta space-y-3">
        <h2 className="text-lg font-extrabold">Enlace de invitación</h2>
        {enlace ? (
          <>
            <p className="text-sm text-apagado">Compártelo en el grupo de WhatsApp. Quien lo abra podrá crear su cuenta.</p>
            <input readOnly value={enlace} className="campo text-sm" aria-label="Enlace de invitación" />
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Únete a La Resistencia 👇\n${enlace}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-claro"
            >
              Enviar por WhatsApp
            </a>
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
        <div>
          <h2 className="text-lg font-extrabold">Miembros ({miembros?.length ?? 0})</h2>
          <p className="text-sm text-apagado">
            {esPropietario
              ? "Tú eres el propietario: puedes nombrar y quitar administradores."
              : "Solo el propietario puede nombrar administradores."}
          </p>
        </div>
        <ul className="divide-y-2 divide-tinta/5">
          {miembros?.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <Avatar nombre={m.nombre} tam={40} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{m.nombre}</span>
                <span className="text-xs font-semibold text-apagado">{ETIQUETA[m.rol] ?? m.rol}</span>
              </span>
              {esPropietario && m.rol !== "propietario" && (
                <form action={cambiarRol}>
                  <input type="hidden" name="usuario" value={m.id} />
                  <input type="hidden" name="rol" value={m.rol === "admin" ? "miembro" : "admin"} />
                  <button className={m.rol === "admin" ? "btn-claro !px-4 !py-2 text-xs" : "btn !px-4 !py-2 text-xs"}>
                    {m.rol === "admin" ? "Quitar admin" : "Hacer admin"}
                  </button>
                </form>
              )}
              {m.rol === "propietario" && <span className="chip">👑</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
