import Link from "next/link";
import { hora, insignia } from "@/lib/fechas";
import { colorCategoria, type Plan } from "@/lib/planes";

export default function Proximos({ planes }: { planes: Plan[] }) {
  return (
    <section className="tarjeta space-y-3 !p-4" aria-label="Próximos planes">
      <h2 className="text-lg font-extrabold">Próximos planes</h2>
      {planes.length === 0 ? (
        <p className="text-sm text-apagado">No hay planes a la vista.</p>
      ) : (
        <ul className="space-y-2">
          {planes.map((p) => {
            const i = insignia(p.inicio);
            return (
              <li key={p.id}>
                <Link href={`/planes/${p.id}`} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-suave">
                  <span className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-center leading-none" style={{ background: colorCategoria(p.categoria) }}>
                    <span className="text-[10px] font-bold uppercase">{i.dia}</span>
                    <span className="text-lg font-extrabold">{i.num}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{p.titulo}</span>
                    <span className="block truncate text-xs text-apagado">{hora(p.inicio)} h · {p.lugar}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
