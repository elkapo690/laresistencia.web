import Link from "next/link";

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

/** Calendario mensual. `conPlanes`: claves de día con algún plan. */
export default function Calendario({
  mes,
  conPlanes,
  hoy,
  seleccionado,
}: {
  mes: string;
  conPlanes: Set<string>;
  hoy: string;
  seleccionado?: string;
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
    <section className="tarjeta !p-4" aria-label="Calendario">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold first-letter:uppercase">{titulo}</h2>
        <div className="flex gap-1.5">
          <Link href={`/?mes=${desplazar(mes, -1)}`} className="btn-claro !h-9 !w-9 !p-0" aria-label="Mes anterior">←</Link>
          <Link href={`/?mes=${desplazar(mes, 1)}`} className="btn-claro !h-9 !w-9 !p-0" aria-label="Mes siguiente">→</Link>
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
          const hay = conPlanes.has(clave);
          const esHoy = clave === hoy;
          const sel = clave === seleccionado;
          return (
            <Link
              key={clave}
              href={sel ? `/?mes=${mes}` : `/?mes=${mes}&dia=${clave}`}
              aria-label={`${dia}${hay ? ", hay planes" : ", libre"}`}
              aria-current={esHoy ? "date" : undefined}
              className={[
                "relative mx-auto flex h-10 w-full max-w-11 items-center justify-center rounded-xl text-sm font-semibold transition",
                hay ? "bg-tinta text-white" : "hover:bg-suave",
                esHoy && !hay ? "border-2 border-tinta" : "",
                sel ? "outline outline-2 outline-offset-2 outline-tinta" : "",
              ].join(" ")}
            >
              {dia}
            </Link>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-apagado">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded bg-tinta" /> Hay planes</span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded border-2 border-tinta/20" /> Libre</span>
        </span>
        {mes !== mesDe(hoy) && <Link href="/" className="font-bold text-tinta underline">Ir a hoy</Link>}
      </div>
    </section>
  );
}
