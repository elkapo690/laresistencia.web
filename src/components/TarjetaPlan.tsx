import Link from "next/link";
import { fechaLarga, hora } from "@/lib/fechas";
import { etiquetaCategoria, plazasOcupadas, textoCoste, type Plan } from "@/lib/planes";

export default function TarjetaPlan({ plan }: { plan: Plan }) {
  const ocupadas = plazasOcupadas(plan);
  const lleno = ocupadas >= plan.aforo;
  return (
    <Link
      href={`/planes/${plan.id}`}
      className={`tarjeta block transition hover:bg-suave ${plan.cancelado ? "opacity-60" : ""}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="chip">{etiquetaCategoria(plan.categoria)}</span>
        {plan.cancelado && <span className="chip !border-red-700 text-red-700">Cancelado</span>}
        {!plan.cancelado && lleno && <span className="chip !border-tinta">Completo</span>}
      </div>
      <h3 className={`text-xl font-extrabold leading-snug ${plan.cancelado ? "line-through" : ""}`}>{plan.titulo}</h3>
      <p className="mt-1 text-sm capitalize text-apagado">
        {fechaLarga(plan.inicio)} · {hora(plan.inicio)}
      </p>
      <p className="text-sm text-apagado">{plan.lugar}</p>
      <div className="mt-3 flex items-center justify-between text-sm font-semibold">
        <span>{textoCoste(plan.coste_por_persona)}</span>
        <span>
          {ocupadas}/{plan.aforo} plazas
        </span>
      </div>
    </Link>
  );
}
