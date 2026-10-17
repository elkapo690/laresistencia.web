import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import FormAsistencia from "@/components/FormAsistencia";
import { fechaLarga, hora } from "@/lib/fechas";
import Avatar from "@/components/Avatar";
import { colorCategoria, emojiCategoria, etiquetaCategoria, plazasOcupadas, textoCoste } from "@/lib/planes";
import { createClient } from "@/lib/supabase/server";
import { cambiarCancelacion } from "../actions";

type Asistente = { usuario_id: string; estado: string; invitados: string[]; profiles: { nombre: string } | null };

export default async function DetallePlan({ params }: PageProps<"/planes/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: plan }, { data: asist }, { data: yo }] = await Promise.all([
    supabase.from("planes").select("*, profiles!creador_id(nombre)").eq("id", id).single(),
    supabase.from("asistencias").select("usuario_id, estado, invitados, profiles(nombre)").eq("plan_id", id),
    supabase.from("profiles").select("rol").eq("id", user!.id).single(),
  ]);
  if (!plan) notFound();

  const asistentes = (asist ?? []) as unknown as Asistente[];
  const voy = asistentes.filter((a) => a.estado === "voy");
  const quizas = asistentes.filter((a) => a.estado === "quizas");
  const ocupadas = plazasOcupadas({ asistencias: asistentes });
  const mia = asistentes.find((a) => a.usuario_id === user?.id);
  const misPlazas = mia?.estado === "voy" ? 1 + mia.invitados.length : 0;
  const libres = Math.max(plan.aforo - ocupadas + misPlazas, 0);
  const esCreador = plan.creador_id === user?.id;
  const esPropietario = yo?.rol === "propietario";
  const esAdmin = esPropietario || yo?.rol === "admin";
  const puedeEditar = esCreador || esPropietario;
  const puedeCancelar = esCreador || esAdmin;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const fecha = fechaLarga(plan.inicio);
  const mensaje = [
    `${emojiCategoria(plan.categoria)} *${plan.titulo}*`,
    `📅 ${fecha.charAt(0).toUpperCase()}${fecha.slice(1)} · ${hora(plan.inicio)} h`,
    `📍 ${plan.lugar}`,
    `💶 ${textoCoste(Number(plan.coste_por_persona))}`,
    `👥 ${plan.aforo} plazas`,
    "",
    "Apúntate aquí 👇",
    `${proto}://${host}/planes/${id}`,
  ].join("\n");
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.lugar)}`;

  return (
    <div className="contenedor space-y-5">
      <Link href="/" className="inline-block text-sm font-bold underline">← Volver a la agenda</Link>

      <article className="space-y-4 rounded-[1.75rem] p-5 sm:p-6" style={{ background: colorCategoria(plan.categoria) }}>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-bold">{etiquetaCategoria(plan.categoria)}</span>
          {plan.cancelado && <span className="chip !border-red-700 text-red-700">Cancelado</span>}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className={`text-4xl font-extrabold leading-[1.05] tracking-tight ${plan.cancelado ? "line-through" : ""}`}>{plan.titulo}</h1>
          <span aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/70 text-4xl">{emojiCategoria(plan.categoria)}</span>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-3">
            <dt className="text-xs font-bold uppercase text-apagado">Cuándo</dt>
            <dd className="font-semibold first-letter:uppercase">{fechaLarga(plan.inicio)}</dd>
            <dd className="text-sm">{hora(plan.inicio)} h</dd>
          </div>
          <div className="rounded-2xl bg-white p-3">
            <dt className="text-xs font-bold uppercase text-apagado">Dónde</dt>
            <dd className="font-semibold">{plan.lugar}</dd>
            <dd><a href={mapa} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline">Ver en el mapa ↗</a></dd>
          </div>
          <div className="rounded-2xl bg-white p-3">
            <dt className="text-xs font-bold uppercase text-apagado">Coste</dt>
            <dd className="font-semibold">{textoCoste(Number(plan.coste_por_persona))}</dd>
          </div>
          <div className="rounded-2xl bg-white p-3">
            <dt className="text-xs font-bold uppercase text-apagado">Plazas</dt>
            <dd className="font-semibold">{ocupadas} de {plan.aforo} ocupadas</dd>
          </div>
        </dl>

        {plan.descripcion && <p className="whitespace-pre-line">{plan.descripcion}</p>}
        <p className="text-sm text-apagado">Propuesto por <b className="text-tinta">{plan.profiles?.nombre}</b></p>

        <div className="flex flex-wrap gap-2 border-t-2 border-tinta/10 pt-4">
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn !border-[#25D366] !bg-[#25D366] !text-tinta hover:!bg-[#1fbd5a]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.2A8.5 8.5 0 1 1 21 11.5Z" /></svg>
            Compartir por WhatsApp
          </a>
          {puedeEditar && <Link href={`/planes/${id}/editar`} className="btn-claro">Editar</Link>}
          {puedeCancelar && (
            <form action={cambiarCancelacion}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="cancelado" value={String(!plan.cancelado)} />
              <button className="btn-claro">{plan.cancelado ? "Reactivar plan" : "Cancelar plan"}</button>
            </form>
          )}
        </div>
      </article>

      {!plan.cancelado && (
        <section className="tarjeta space-y-3">
          <h2 className="text-lg font-extrabold">¿Te apuntas?</h2>
          <FormAsistencia
            key={`${mia?.estado}-${mia?.invitados.join("|")}`}
            planId={id}
            estadoInicial={mia?.estado}
            invitadosIniciales={mia?.invitados ?? []}
            plazasLibres={libres}
          />
        </section>
      )}

      <section className="tarjeta space-y-3">
        <h2 className="text-lg font-extrabold">Apuntados ({ocupadas})</h2>
        {voy.length === 0 ? (
          <p className="text-apagado">Nadie todavía. ¡Sé el primero!</p>
        ) : (
          <ul className="space-y-2">
            {voy.map((a) => (
              <li key={a.usuario_id} className="flex items-center gap-3">
                <Avatar nombre={a.profiles?.nombre ?? "?"} tam={36} />
                <span>
                  <span className="font-bold">{a.profiles?.nombre}</span>
                  {a.invitados.length > 0 && <span className="text-apagado"> + {a.invitados.join(", ")}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
        {quizas.length > 0 && (
          <p className="border-t-2 border-tinta/10 pt-3 text-sm text-apagado">
            Quizás: {quizas.map((a) => a.profiles?.nombre).join(", ")}
          </p>
        )}
      </section>
    </div>
  );
}
