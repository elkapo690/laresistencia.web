type PlanCal = { id: string; titulo: string; descripcion: string; lugar: string; inicio: string };

const DURACION_MS = 2 * 60 * 60 * 1000; // los planes no tienen hora de fin: se guardan 2 horas

const sello = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function textoPlan(plan: PlanCal, url: string) {
  return [plan.descripcion, `Más info y apuntarse: ${url}`].filter(Boolean).join("\n\n");
}

/** Enlace "añadir a Google Calendar". */
export function enlaceGoogle(plan: PlanCal, url: string) {
  const ini = new Date(plan.inicio);
  const fin = new Date(ini.getTime() + DURACION_MS);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: plan.titulo,
    dates: `${sello(ini)}/${sello(fin)}`,
    details: textoPlan(plan, url),
    location: plan.lugar,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

const escapar = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Pliega líneas largas a 75 caracteres, como exige el formato iCalendar. */
function plegar(linea: string) {
  const trozos: string[] = [];
  let resto = linea;
  while (resto.length > 74) {
    trozos.push(resto.slice(0, 74));
    resto = " " + resto.slice(74);
  }
  trozos.push(resto);
  return trozos.join("\r\n");
}

/** Archivo .ics: lo abren el calendario del iPhone, Google, Outlook… */
export function generarICS(plan: PlanCal, url: string) {
  const ini = new Date(plan.inicio);
  const fin = new Date(ini.getTime() + DURACION_MS);
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La Resistencia//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${plan.id}@laresistencia`,
    `DTSTAMP:${sello(new Date())}`,
    `DTSTART:${sello(ini)}`,
    `DTEND:${sello(fin)}`,
    `SUMMARY:${escapar(plan.titulo)}`,
    `LOCATION:${escapar(plan.lugar)}`,
    `DESCRIPTION:${escapar(textoPlan(plan, url))}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapar(plan.titulo)}`,
    "TRIGGER:-PT2H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lineas.map(plegar).join("\r\n") + "\r\n";
}
