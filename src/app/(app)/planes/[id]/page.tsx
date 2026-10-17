import Link from "next/link";
import { notFound } from "next/navigation";
import FormAsistencia from "@/components/FormAsistencia";
import { fechaLarga, hora } from "@/lib/fechas";
import { colorCategoria, etiquetaCategoria, plazasOcupadas, textoCoste } from "@/lib/planes";
import { createClient } from "@/lib/supabase/server";
import { cambiarCancelacion } from "../actions";

type Asistente = { usuario_id: string; estado: string; invitados: string[]; profiles: { nombre: string } | null };

export default async function DetallePlan({ params }: PageProps<"/planes/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: plan }, { data: asist }] = await Promise.all([
    supabase.from("planes").select("*, profiles(nombre)").eq("id", id).single(),
    supabase.from("asistencias").select("usuario_id, estado, invitados, profiles(nombre)").eq("plan_id", id),
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
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.lugar)}`;

  return (
    <div className="contenedor space-y-5">
      <Link href="/" className="inline-block text-sm font-bold underline">← Volver a la agenda</Link>

      <article className="space-y-4 rounded-[1.75rem] p-5 sm:p-6" style={{ background: colorCategoria(plan.categoria) }}>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-bold">{etiquetaCategoria(plan.categoria)}</span>
          {plan.cancelado && <span className="chip !border-red-700 text-red-700">Cancelado</span>}
        </div>
        <h1 className={`text-3xl font-extrabold leading-tight tracking-tight ${plan.cancelado ? "line-through" : ""}`}>{plan.titulo}</h1>

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

        {esCreador && (
          <div className="flex flex-wrap gap-2 border-t-2 border-tinta/10 pt-4">
            <Link href={`/planes/${id}/editar`} className="btn-claro">Editar</Link>
            <form action={cambiarCancelacion}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="cancelado" value={String(!plan.cancelado)} />
              <button className="btn-claro">{plan.cancelado ? "Reactivar plan" : "Cancelar plan"}</button>
            </form>
          </div>
        )}
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
              <li key={a.usuario_id}>
                <span className="font-semibold">{a.profiles?.nombre}</span>
                {a.invitados.length > 0 && <span className="text-apagado"> + {a.invitados.join(", ")}</span>}
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
