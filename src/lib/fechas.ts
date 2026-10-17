const TZ = "Europe/Madrid";

function partes(ts: number) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(ts))
      .map((x) => [x.type, x.value]),
  );
  return p as Record<string, string>;
}

/** Milisegundos que Madrid adelanta a UTC en el instante `ts`. */
function desfase(ts: number) {
  const p = partes(ts);
  return (
    Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) -
    Math.floor(ts / 1000) * 1000
  );
}

/** "2026-10-17T20:30" (hora de Madrid) → ISO en UTC. */
export function madridAISO(local: string): string {
  const [f, h] = local.split("T");
  const [y, m, d] = f.split("-").map(Number);
  const [hh, mm] = h.split(":").map(Number);
  const base = Date.UTC(y, m - 1, d, hh, mm);
  let ts = base - desfase(base);
  ts = base - desfase(ts);
  return new Date(ts).toISOString();
}

/** ISO → valor para <input type="datetime-local"> en hora de Madrid. */
export function isoAMadridLocal(iso: string): string {
  const p = partes(new Date(iso).getTime());
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Clave "YYYY-MM-DD" del día (en Madrid) de un instante. */
export function claveDia(iso: string | Date): string {
  const p = partes(new Date(iso).getTime());
  return `${p.year}-${p.month}-${p.day}`;
}

export function hoyClave() {
  return claveDia(new Date());
}

export function fechaLarga(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function hora(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function claveDiaLarga(clave: string) {
  const [y, m, d] = clave.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Abreviatura del día de la semana y número, p. ej. { dia: "sáb", num: "17" } */
export function insignia(iso: string) {
  const f = new Date(iso);
  return {
    dia: new Intl.DateTimeFormat("es-ES", { timeZone: TZ, weekday: "short" }).format(f).replace(".", ""),
    num: new Intl.DateTimeFormat("es-ES", { timeZone: TZ, day: "numeric" }).format(f),
    mes: new Intl.DateTimeFormat("es-ES", { timeZone: TZ, month: "short" }).format(f).replace(".", ""),
  };
}

/** "hace 5 min", "hace 2 h", "hace 3 d" */
export function hace(iso: string) {
  const seg = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seg < 60) return "ahora mismo";
  const min = Math.floor(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} ${d === 1 ? "día" : "días"}`;
  return new Intl.DateTimeFormat("es-ES", { timeZone: TZ, day: "numeric", month: "short" }).format(new Date(iso));
}
