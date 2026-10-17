import Link from "next/link";
import Avatar from "./Avatar";
import { IconoUbicacion } from "./Iconos";
import { hora, insignia } from "@/lib/fechas";
import { colorCategoria, etiquetaCategoria, plazasOcupadas, textoCoste, type Plan } from "@/lib/planes";

export default function TarjetaPlan({ plan }: { plan: Plan }) {
  const ocupadas = plazasOcupadas(plan);
  const lleno = ocupadas >= plan.aforo;
  const ins = insignia(plan.inicio);
  const pct = Math.min(100, Math.round((ocupadas / plan.aforo) * 100));

  return (
    <Link
      href={`/planes/${plan.id}`}
      style={{ background: colorCategoria(plan.categoria) }}
      className={`block rounded-[1.75rem] border-2 border-transparent p-4 transition hover:border-tinta sm:p-5 ${plan.cancelado ? "opacity-60" : ""}`}
    >
      <div className="flex gap-4">
        <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white leading-none shadow-sm">
          <span className="text-[11px] font-bold uppercase text-apagado">{ins.dia}</span>
          <span className="text-2xl font-extrabold">{ins.num}</span>
          <span className="text-[11px] font-bold uppercase text-apagado">{ins.mes}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-bold">{etiquetaCategoria(plan.categoria)}</span>
            {plan.cancelado && <span className="rounded-full bg-red-700 px-2.5 py-0.5 text-xs font-bold text-white">Cancelado</span>}
            {!plan.cancelado && lleno && <span className="rounded-full bg-tinta px-2.5 py-0.5 text-xs font-bold text-white">Completo</span>}
          </div>
          <h3 className={`text-lg font-extrabold leading-snug ${plan.cancelado ? "line-through" : ""}`}>{plan.titulo}</h3>
          <p className="mt-0.5 text-sm font-semibold">{hora(plan.inicio)} h</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-tinta/70">
            <IconoUbicacion /> <span className="truncate">{plan.lugar}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Avatar nombre={plan.profiles?.nombre ?? "?"} tam={28} />
        <span className="min-w-0 flex-1 truncate text-sm text-tinta/70">
          de <b className="text-tinta">{plan.profiles?.nombre}</b>
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold">{textoCoste(plan.coste_por_persona)}</span>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs font-bold">
          <span>{ocupadas} de {plan.aforo} plazas</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full bg-tinta" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
