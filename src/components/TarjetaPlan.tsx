import Link from "next/link";
import Avatar from "./Avatar";
import PilaAvatares from "./PilaAvatares";
import { hora, insignia } from "@/lib/fechas";
import { colorCategoria, emojiCategoria, etiquetaCategoria, plazasOcupadas, textoCoste, type Plan } from "@/lib/planes";

export default function TarjetaPlan({ plan }: { plan: Plan }) {
  const ocupadas = plazasOcupadas(plan);
  const lleno = ocupadas >= plan.aforo;
  const ins = insignia(plan.inicio);
  const apuntados = (plan.asistencias ?? []).filter((a) => a.estado === "voy").map((a) => a.profiles?.nombre ?? "?");
  const chip = "inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold";

  return (
    <Link
      href={`/planes/${plan.id}`}
      style={{ background: colorCategoria(plan.categoria) }}
      className={`group block rounded-[2rem] border-2 border-transparent p-5 transition hover:-translate-y-0.5 hover:border-tinta hover:shadow-xl sm:p-6 ${plan.cancelado ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar nombre={plan.profiles?.nombre ?? "?"} tam={42} />
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">{plan.profiles?.nombre}</p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-black/55">
              {etiquetaCategoria(plan.categoria)}
              {plan.cancelado && <span className="rounded-full bg-red-700 px-2 py-0.5 text-[10px] font-bold text-white">Cancelado</span>}
              {!plan.cancelado && lleno && <span className="rounded-full bg-tinta px-2 py-0.5 text-[10px] font-bold text-white">Completo</span>}
            </p>
          </div>
        </div>
        <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-3xl">
          {emojiCategoria(plan.categoria)}
        </span>
      </div>

      <h3 className={`mt-4 text-2xl font-extrabold leading-tight tracking-tight ${plan.cancelado ? "line-through" : ""}`}>{plan.titulo}</h3>
      {plan.descripcion && <p className="mt-1.5 line-clamp-2 text-sm text-black/65">{plan.descripcion}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={chip}><span aria-hidden>📅</span> <span className="capitalize">{ins.dia}</span> {ins.num} {ins.mes} · {hora(plan.inicio)}</span>
        <span className={`${chip} max-w-full`}><span aria-hidden>📍</span> <span className="truncate">{plan.lugar}</span></span>
        <span className={chip}><span aria-hidden>💶</span> {textoCoste(plan.coste_por_persona)}</span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PilaAvatares nombres={apuntados} total={ocupadas} />
          <span className="text-sm font-bold">{ocupadas}/{plan.aforo}</span>
        </div>
        <span className="btn !py-2.5">Ver plan →</span>
      </div>
    </Link>
  );
}
