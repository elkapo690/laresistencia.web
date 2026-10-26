import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import BotonEliminar from "@/components/BotonEliminar";
import FormAsistencia from "@/components/FormAsistencia";
import FormComentario from "@/components/FormComentario";
import { IconoCalendario } from "@/components/Iconos";
import { enlaceGoogle } from "@/lib/calendario";
import { esPasado, fechaLarga, hace, hora } from "@/lib/fechas";
import { COLUMNAS_PERFIL, type PerfilMini } from "@/lib/perfil";
import { colorCategoria, emojiCategoria, etiquetaCategoria, plazasOcupadas, textoCoste } from "@/lib/planes";
import { createClient } from "@/lib/supabase/server";
import { borrarComentario, cambiarCancelacion, quitarAsistente } from "../actions";

type Asistente = { usuario_id: string; estado: string; invitados: string[]; profiles: PerfilMini | null };
type Comentario = { id: string; texto: string; creado_en: string; usuario_id: string; profiles: PerfilMini | null };

export default async function DetallePlan({ params }: PageProps<"/planes/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: plan }, { data: asist }, { data: yo }, { data: coments }] = await Promise.all([
    supabase.from("planes").select(`*, profiles!creador_id(${COLUMNAS_PERFIL})`).eq("id", id).single(),
    supabase.from("asistencias").select(`usuario_id, estado, invitados, profiles(${COLUMNAS_PERFIL})`).eq("plan_id", id),
    supabase.from("profiles").select("rol").eq("id", user!.id).single(),
    supabase.from("comentarios").select(`id, texto, creado_en, usuario_id, profiles(${COLUMNAS_PERFIL})`).eq("plan_id", id).order("creado_en"),
  ]);
  if (!plan) notFound();

  // Plan del que viene (si es una repetición) y repeticiones de este plan.
  const [{ data: origen }, { data: repeticiones }] = await Promise.all([
    plan.repite_de
      ? supabase.from("planes").select("id, titulo, inicio").eq("id", plan.repite_de).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("planes").select("id, titulo, inicio").eq("repite_de", id).order("inicio").limit(8),
  ]);

  const asistentes = (asist ?? []) as unknown as Asistente[];
  const comentarios = (coments ?? []) as unknown as Comentario[];
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
  const pasado = esPasado(plan.inicio);
  const puedeRepetir = esCreador || esAdmin;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.lugar)}`;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const urlPlan = `${proto}://${host}/planes/${id}`;
  const fecha = fechaLarga(plan.inicio);
  const mensaje = [
    `${emojiCategoria(plan.categoria)} *${plan.titulo}*`,
    `📅 ${fecha.charAt(0).toUpperCase()}${fecha.slice(1)} · ${hora(plan.inicio)} h`,
    `📍 ${plan.lugar}`,
    `💶 ${textoCoste(Number(plan.coste_por_persona))}`,
    `👥 ${plan.aforo} plazas`,
    "",
    "Apúntate aquí 👇",
    urlPlan,
  ].join("\n");
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  const google = enlaceGoogle(plan, urlPlan);

  return (
    <div className="contenedor space-y-5">
      <Link href="/" className="inline-block text-sm font-bold underline">← Volver a la agenda</Link>

      <article className="space-y-4 rounded-[1.75rem] p-5 sm:p-6" style={{ background: colorCategoria(plan.categoria) }}>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-bold">{etiquetaCategoria(plan.categoria)}</span>
          {plan.cancelado && <span className="rounded-full bg-red-700 px-3 py-0.5 text-xs font-bold text-white">Cancelado</span>}
          {pasado && !plan.cancelado && <span className="rounded-full bg-black/60 px-3 py-0.5 text-xs font-bold text-white">Pasado</span>}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className={`text-4xl font-extrabold leading-[1.05] tracking-tight ${plan.cancelado ? "line-through" : ""}`}>{plan.titulo}</h1>
          <span aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/70 text-4xl">{emojiCategoria(plan.categoria)}</span>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-3">
            <dt className="text-xs font-bold uppercase text-apagado">Cuándo</dt>
            <dd className="font-semibold first-letter:uppercase">{fecha}</dd>
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

        {(origen || (repeticiones && repeticiones.length > 0)) && (
          <div className="space-y-1.5 rounded-2xl bg-white/70 p-3 text-sm">
            {origen && (
              <p>
                🔁 Repetición de{" "}
                <Link href={`/planes/${origen.id}`} className="font-bold underline">«{origen.titulo}»</Link>{" "}
                <span className="text-apagado">({fechaLarga(origen.inicio)})</span>
              </p>
            )}
            {repeticiones && repeticiones.length > 0 && (
              <p>
                🔁 Se ha repetido:{" "}
                {repeticiones.map((r, i) => (
                  <span key={r.id}>
                    {i > 0 && ", "}
                    <Link href={`/planes/${r.id}`} className="font-bold underline">{fechaLarga(r.inicio)}</Link>
                  </span>
                ))}
              </p>
            )}
          </div>
        )}
        <p className="flex items-center gap-2 text-sm text-apagado">
          <Avatar perfil={plan.profiles} tam={26} /> Propuesto por <b className="text-tinta">{plan.profiles?.nombre}</b>
        </p>

        <div className="space-y-3 border-t-2 border-tinta/10 pt-4">
          <div className="flex flex-wrap gap-2">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn !border-[#25D366] !bg-[#25D366] !text-tinta hover:!bg-[#1fbd5a]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.2A8.5 8.5 0 1 1 21 11.5Z" /></svg>
              Compartir por WhatsApp
            </a>
            {!plan.cancelado && !pasado && (
              <>
                <a href={google} target="_blank" rel="noopener noreferrer" className="btn-claro"><IconoCalendario /> Google Calendar</a>
                <a href={`/planes/${id}/calendario`} className="btn-claro"><IconoCalendario /> iPhone / otros</a>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {puedeEditar && <Link href={`/planes/${id}/editar`} className="btn-claro">Editar</Link>}
            {puedeRepetir && (pasado || plan.cancelado) && (
              <Link href={`/planes/nuevo?desde=${id}`} className="btn">🔁 Repetir plan</Link>
            )}
            {puedeCancelar && !pasado && (
              <form action={cambiarCancelacion}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="cancelado" value={String(!plan.cancelado)} />
                <button className="btn-claro">{plan.cancelado ? "Reactivar plan" : "Cancelar plan"}</button>
              </form>
            )}
            {esAdmin && <BotonEliminar id={id} />}
          </div>
        </div>
      </article>

      {pasado && !plan.cancelado && (
        <section className="tarjeta space-y-1 text-center">
          <p className="text-3xl" aria-hidden>🕰️</p>
          <h2 className="text-lg font-extrabold">Este plan ya pasó</h2>
          <p className="text-sm text-apagado">Ya no se puede apuntar nadie. {puedeRepetir ? "Si queréis repetirlo, pulsa «Repetir plan» y elige una fecha nueva." : "Si te gustaría repetirlo, díselo a quien lo propuso en los comentarios."}</p>
        </section>
      )}

      {!plan.cancelado && !pasado && (
        <section className="tarjeta space-y-3">
          <h2 className="text-lg font-extrabold">¿Te apuntas?</h2>
          <FormAsistencia
            key={`${mia?.estado}-${mia?.invitados.join("|")}`}
            planId={id}
            estadoInicial={mia && mia.estado !== "no" ? mia.estado : undefined}
            invitadosIniciales={mia?.invitados ?? []}
            plazasLibres={libres}
          />
        </section>
      )}

      <section className="tarjeta space-y-3">
        <h2 className="text-lg font-extrabold">{pasado ? `Fueron (${ocupadas})` : `Apuntados (${ocupadas})`}</h2>
        {voy.length === 0 ? (
          <p className="text-apagado">{pasado ? "Nadie se apuntó a este plan." : "Nadie todavía. ¡Sé el primero!"}</p>
        ) : (
          <ul className="space-y-2">
            {voy.map((a) => (
              <li key={a.usuario_id} className="flex items-center gap-2">
                <Link href={`/miembros/${a.usuario_id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 transition hover:bg-white">
                  <Avatar perfil={a.profiles} tam={36} />
                  <span className="min-w-0">
                    <span className="font-bold">{a.profiles?.nombre}</span>
                    {a.invitados.length > 0 && <span className="text-apagado"> + {a.invitados.join(", ")}</span>}
                  </span>
                </Link>
                {esPropietario && (
                  <form action={quitarAsistente}>
                    <input type="hidden" name="plan_id" value={id} />
                    <input type="hidden" name="usuario_id" value={a.usuario_id} />
                    <button className="text-xs font-semibold text-apagado underline hover:text-red-700">Quitar</button>
                  </form>
                )}
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

      <section className="tarjeta space-y-4">
        <h2 className="text-lg font-extrabold">Comentarios ({comentarios.length})</h2>
        {comentarios.length === 0 ? (
          <p className="text-apagado">Aún no hay comentarios. Pregunta lo que necesites.</p>
        ) : (
          <ul className="space-y-4">
            {comentarios.map((c) => (
              <li key={c.id} className="flex gap-3">
                <Avatar perfil={c.profiles} tam={36} />
                <div className="min-w-0 flex-1 rounded-2xl bg-white p-3">
                  <p className="flex items-baseline gap-2 text-sm">
                    <b>{c.profiles?.nombre}</b>
                    <span className="text-xs text-apagado">{hace(c.creado_en)}</span>
                    {(c.usuario_id === user?.id || esAdmin) && (
                      <form action={borrarComentario} className="ml-auto">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="plan_id" value={id} />
                        <button className="text-xs font-semibold text-apagado underline hover:text-red-700">Borrar</button>
                      </form>
                    )}
                  </p>
                  <p className="mt-0.5 whitespace-pre-line break-words">{c.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <FormComentario planId={id} />
      </section>
    </div>
  );
}
