import Link from "next/link";
import { hora, insignia } from "@/lib/fechas";
import { acentoCategoria, emojiCategoria, type Plan } from "@/lib/planes";

export default function Proximos({ planes }: { planes: Plan[] }) {
  return (
    <section className="tarjeta space-y-3 !p-5" aria-label="Próximos planes">
      <h2 className="text-xl font-extrabold">Próximos planes</h2>
      {planes.length === 0 ? (
        <p className="text-sm text-apagado">No hay planes a la vista.</p>
      ) : (
        <ul className="space-y-2">
          {planes.map((p) => {
            const i = insignia(p.inicio);
            return (
              <li key={p.id}>
                <Link href={`/planes/${p.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 transition hover:shadow-md lg:bg-white">
                  <span className="w-1 self-stretch rounded-full" style={{ background: acentoCategoria(p.categoria) }} />
                  <span className="w-9 shrink-0 text-center leading-none">
                    <span className="block text-[10px] font-bold uppercase text-apagado">{i.dia}</span>
                    <span className="block text-xl font-extrabold">{i.num}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{p.titulo}</span>
                    <span className="block truncate text-xs text-apagado">{hora(p.inicio)} · {p.lugar}</span>
                  </span>
                  <span aria-hidden className="text-xl">{emojiCategoria(p.categoria)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
