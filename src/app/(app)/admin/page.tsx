import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import BotonEliminarMiembro from "@/components/BotonEliminarMiembro";
import RestablecerClave from "@/components/RestablecerClave";
import AccionesInvitacion from "@/components/AccionesInvitacion";
import NuevaInvitacion from "@/components/NuevaInvitacion";
import { caducaEn, hace } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { anularInvitacion, cambiarRol } from "./actions";

const ETIQUETA: Record<string, string> = { propietario: "Propietario", admin: "Admin", miembro: "Miembro" };
const ACCION: Record<string, string> = { creado: "✨ Creó", cancelado: "🚫 Canceló", reactivado: "♻️ Reactivó", eliminado: "🗑️ Eliminó" };
const ACCION_CUENTA: Record<string, string> = {
  clave_restablecida: "🔑 Restableció la clave de",
  miembro_eliminado: "🗑️ Eliminó a",
  rol_cambiado: "🛡️ Cambió el rol de",
};

export default async function Admin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: yo } = await supabase.from("profiles").select("rol").eq("id", user!.id).single();
  const esPropietario = yo?.rol === "propietario";
  if (!esPropietario && yo?.rol !== "admin") redirect("/");

  const [{ data: pendientes }, { data: usadas }, { data: miembros }, { data: registro }, { data: cuentas }] = await Promise.all([
    supabase.from("invitaciones").select("codigo, etiqueta, caduca_en, creador:profiles!creado_por(nombre)").eq("activa", true).is("usado_en", null).order("creado_en", { ascending: false }),
    supabase
      .from("invitaciones")
      .select("codigo, etiqueta, usado_en, usado:profiles!usado_por(nombre), creador:profiles!creado_por(nombre)")
      .not("usado_en", "is", null)
      .order("usado_en", { ascending: false })
      .limit(10),
    supabase.from("profiles").select("id, nombre, rol, avatar_url, avatar_emoji, avatar_color, creado_en").order("creado_en"),
    supabase.from("registro").select("id, plan_titulo, accion, usuario_nombre, creado_en").order("creado_en", { ascending: false }).limit(30),
    supabase.from("registro_cuentas").select("id, accion, objetivo_nombre, detalle, usuario_nombre, creado_en").order("creado_en", { ascending: false }).limit(30),
  ]);

  return (
    <div className="contenedor space-y-6">
      <h1 className="text-4xl font-extrabold tracking-tight">Administración</h1>

      <section className="tarjeta space-y-4">
        <div>
          <h2 className="text-lg font-extrabold">Invitar a alguien</h2>
          <p className="text-sm text-apagado">
            Cada invitación es un enlace personal: sirve para <b>una sola persona</b> y caduca a los 7 días. El registro libre está cerrado.
          </p>
        </div>
        <NuevaInvitacion />

        <div className="space-y-2 border-t-2 border-tinta/5 pt-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-apagado">Pendientes ({pendientes?.length ?? 0})</h3>
          {!pendientes?.length ? (
            <p className="text-sm text-apagado">No hay invitaciones pendientes.</p>
          ) : (
            <ul className="space-y-2">
              {pendientes.map((i) => {
                const caducada = caducaEn(i.caduca_en) === "caducada";
                return (
                  <li key={i.codigo} className="rounded-2xl bg-suave p-3 lg:bg-white">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate font-bold">
                        {i.etiqueta || "Sin nombre"}
                        <span className="ml-2 text-xs font-semibold text-apagado">por {(i.creador as unknown as { nombre: string } | null)?.nombre ?? "—"}</span>
                      </span>
                      <span className={`shrink-0 text-xs font-semibold ${caducada ? "text-red-700" : "text-apagado"}`}>{caducaEn(i.caduca_en)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {!caducada && <AccionesInvitacion codigo={i.codigo} etiqueta={i.etiqueta} />}
                      <form action={anularInvitacion}>
                        <input type="hidden" name="codigo" value={i.codigo} />
                        <button className="rounded-full border-2 border-red-700 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50">Anular</button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!!usadas?.length && (
          <div className="space-y-2 border-t-2 border-tinta/5 pt-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-apagado">Usadas recientemente</h3>
            <ul className="divide-y-2 divide-tinta/5 text-sm">
              {usadas.map((i) => (
                <li key={i.codigo} className="py-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="font-bold">{(i.usado as unknown as { nombre: string } | null)?.nombre ?? "Alguien"}</span>
                    <span className="text-xs text-apagado">{hace(i.usado_en!)}</span>
                  </div>
                  <p className="text-xs text-apagado">
                    Invitada por <b className="text-tinta">{(i.creador as unknown as { nombre: string } | null)?.nombre ?? "el enlace del grupo"}</b>
                    {i.etiqueta ? ` · para ${i.etiqueta}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="tarjeta space-y-3">
        <div>
          <h2 className="text-lg font-extrabold">Miembros ({miembros?.length ?? 0})</h2>
          <p className="text-sm text-apagado">
            {esPropietario
              ? "Como propietario puedes nombrar admins, restablecer cualquier clave y eliminar miembros."
              : "Puedes darle una clave temporal a un miembro que haya olvidado la suya."}
          </p>
        </div>
        <ul className="space-y-3">
          {miembros?.map((m) => {
            const puedeClave = m.id !== user!.id && (esPropietario || m.rol === "miembro");
            const hayAcciones = puedeClave || (esPropietario && m.rol !== "propietario");
            return (
              <li key={m.id} className="rounded-3xl bg-suave p-4 lg:bg-white">
                <div className="flex items-center gap-3">
                  <Avatar perfil={m} tam={44} />
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-extrabold leading-tight">{m.nombre}</p>
                    <p className="text-xs font-semibold text-apagado">{ETIQUETA[m.rol] ?? m.rol}</p>
                  </div>
                  {m.rol === "propietario" && <span className="chip">👑</span>}
                </div>
                {hayAcciones && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t-2 border-tinta/5 pt-3">
                    {esPropietario && m.rol !== "propietario" && (
                      <form action={cambiarRol}>
                        <input type="hidden" name="usuario" value={m.id} />
                        <input type="hidden" name="rol" value={m.rol === "admin" ? "miembro" : "admin"} />
                        <button className={m.rol === "admin" ? "btn-claro !px-4 !py-2 text-xs" : "btn !px-4 !py-2 text-xs"}>
                          {m.rol === "admin" ? "Quitar admin" : "Hacer admin"}
                        </button>
                      </form>
                    )}
                    {puedeClave && <RestablecerClave usuario={m.id} nombre={m.nombre} />}
                    {esPropietario && m.rol !== "propietario" && <BotonEliminarMiembro usuario={m.id} nombre={m.nombre} />}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="tarjeta space-y-3">
        <div>
          <h2 className="text-lg font-extrabold">Registro de cuentas</h2>
          <p className="text-sm text-apagado">Cambios de rol, claves restablecidas y miembros eliminados.</p>
        </div>
        {!cuentas?.length ? (
          <p className="text-sm text-apagado">Todavía no hay actividad.</p>
        ) : (
          <ul className="divide-y-2 divide-tinta/5 text-sm">
            {cuentas.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline gap-x-2 py-2">
                <span className="font-bold">{r.usuario_nombre}</span>
                <span>{ACCION_CUENTA[r.accion] ?? r.accion}</span>
                <span className="font-bold">{r.objetivo_nombre}</span>
                {r.accion === "rol_cambiado" && <span className="text-apagado">({r.detalle === "admin" ? "ahora es admin" : "ahora es miembro"})</span>}
                <span className="ml-auto text-xs text-apagado">{hace(r.creado_en)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="tarjeta space-y-3">
        <div>
          <h2 className="text-lg font-extrabold">Registro de planes</h2>
          <p className="text-sm text-apagado">Qué se ha creado, cancelado o eliminado, y quién lo hizo.</p>
        </div>
        {!registro?.length ? (
          <p className="text-sm text-apagado">Todavía no hay actividad.</p>
        ) : (
          <ul className="divide-y-2 divide-tinta/5 text-sm">
            {registro.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline gap-x-2 py-2">
                <span className="font-bold">{ACCION[r.accion] ?? r.accion}</span>
                <span className="min-w-0 truncate">«{r.plan_titulo}»</span>
                <span className="text-apagado">por {r.usuario_nombre}</span>
                <span className="ml-auto text-xs text-apagado">{hace(r.creado_en)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
