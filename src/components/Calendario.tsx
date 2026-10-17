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
  const titulo = new Intl.DateTimeFormat("es-ES", { timeZone: "UTC", month: "long", year: "numeric" }).format(primero);

  const celdas: (number | null)[] = [...Array(huecos).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  return (
    <section className="tarjeta !p-4" aria-label="Calendario">
      <div className="mb-3 flex items-center justify-between">
        <Link href={`/?mes=${desplazar(mes, -1)}`} className="btn-claro !px-4 !py-1.5" aria-label="Mes anterior">←</Link>
        <div className="text-center">
          <h2 className="text-lg font-extrabold capitalize">{titulo}</h2>
          {mes !== mesDe(hoy) && (
            <Link href="/" className="text-xs font-semibold underline">Ir a hoy</Link>
          )}
        </div>
        <Link href={`/?mes=${desplazar(mes, 1)}`} className="btn-claro !px-4 !py-1.5" aria-label="Mes siguiente">→</Link>
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
                "relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 text-sm font-semibold transition",
                hay ? "border-tinta bg-tinta text-white" : "border-tinta/10 hover:border-tinta/40",
                sel ? "ring-2 ring-offset-2 ring-tinta" : "",
                esHoy && !hay ? "border-tinta" : "",
              ].join(" ")}
            >
              {dia}
              {esHoy && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${hay ? "bg-white" : "bg-tinta"}`} />}
            </Link>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-4 text-xs text-apagado">
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded bg-tinta" /> Hay planes</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded border-2 border-tinta/20" /> Libre</span>
      </p>
    </section>
  );
}
