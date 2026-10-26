import Link from "next/link";
import { ruta } from "@/lib/planes";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const pad = (n: number) => String(n).padStart(2, "0");

export function mesDe(clave: string) {
  return clave.slice(0, 7);
}

function desplazar(mes: string, delta: number) {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

/** Calendario mensual. `marcas`: día → color del primer plan; `varios`: días con más de un plan. */
export default function Calendario({
  mes,
  marcas,
  varios,
  hoy,
  seleccionado,
  cat,
}: {
  mes: string;
  marcas: Record<string, string>;
  varios: Set<string>;
  hoy: string;
  seleccionado?: string;
  cat?: string;
}) {
  const [y, m] = mes.split("-").map(Number);
  const primero = new Date(Date.UTC(y, m - 1, 1));
  const huecos = (primero.getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const titulo = new Intl.DateTimeFormat("es-ES", { timeZone: "UTC", month: "long", year: "numeric" })
    .format(primero)
    .replace(" de ", " ");

  const celdas: (number | null)[] = [...Array(huecos).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  return (
    <section className="tarjeta !p-5" aria-label="Calendario">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold first-letter:uppercase">{titulo}</h2>
        <div className="flex gap-1.5">
          <Link href={ruta({ mes: desplazar(mes, -1), cat })} className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-bold shadow-sm transition hover:bg-tinta hover:text-white" aria-label="Mes anterior">‹</Link>
          <Link href={ruta({ mes: desplazar(mes, 1), cat })} className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-bold shadow-sm transition hover:bg-tinta hover:text-white" aria-label="Mes siguiente">›</Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-apagado">
        {DIAS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`h${i}`} />;
          const clave = `${mes}-${pad(dia)}`;
          const color = marcas[clave];
          const esHoy = clave === hoy;
          const sel = clave === seleccionado;
          const pasado = clave < hoy;
          return (
            <Link
              key={clave}
              href={sel ? ruta({ mes, cat }) : ruta({ mes, dia: clave, cat })}
              aria-label={`${dia}${color ? (pasado ? ", hubo planes" : ", hay planes") : ", libre"}`}
              aria-current={esHoy ? "date" : undefined}
              style={color && !sel ? { background: color, opacity: pasado ? 0.45 : 1 } : undefined}
              className={[
                "relative mx-auto flex h-10 w-full max-w-11 items-center justify-center rounded-full text-sm transition",
                sel ? "bg-tinta font-extrabold text-white" : color ? "font-extrabold" : "font-semibold hover:bg-white",
                esHoy && !sel ? "outline outline-2 outline-offset-1 outline-tinta" : "",
              ].join(" ")}
            >
              {dia}
              {varios.has(clave) && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${sel ? "bg-white" : "bg-tinta"}`} />}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-apagado">
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded-full bg-[#FF6FA5]" /> Día con plan · apagado = ya pasó</span>
        {mes !== mesDe(hoy) && <Link href="/" className="font-bold text-tinta underline">Hoy</Link>}
      </div>
    </section>
  );
}
