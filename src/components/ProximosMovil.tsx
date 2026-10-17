import Link from "next/link";
import { hora, insignia } from "@/lib/fechas";
import { colorCategoria, emojiCategoria, type Plan } from "@/lib/planes";

/** Carrusel de próximos planes para pantallas pequeñas. */
export default function ProximosMovil({ planes }: { planes: Plan[] }) {
  if (planes.length === 0) return null;
  return (
    <section aria-label="Próximos planes" className="lg:hidden">
      <h2 className="mb-3 text-lg font-extrabold">Próximos planes</h2>
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        {planes.map((p) => {
          const i = insignia(p.inicio);
          return (
            <li key={p.id} className="w-[15.5rem] shrink-0 snap-start">
              <Link
                href={`/planes/${p.id}`}
                style={{ background: colorCategoria(p.categoria) }}
                className="flex h-full flex-col rounded-[1.5rem] p-4 transition active:scale-[0.98]"
              >
                <span className="flex items-start justify-between">
                  <span className="flex flex-col items-center rounded-2xl bg-white px-3 py-1.5 leading-none shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-apagado">{i.dia}</span>
                    <span className="text-xl font-extrabold">{i.num}</span>
                  </span>
                  <span aria-hidden className="text-2xl">{emojiCategoria(p.categoria)}</span>
                </span>
                <span className="mt-3 line-clamp-2 text-base font-extrabold leading-tight">{p.titulo}</span>
                <span className="mt-1 truncate text-xs font-semibold text-black/60">{hora(p.inicio)} h · {p.lugar}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
