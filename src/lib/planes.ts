export const CATEGORIAS = [
  { valor: "comida", etiqueta: "Comida y bebida" },
  { valor: "fiesta", etiqueta: "Fiesta" },
  { valor: "deporte", etiqueta: "Deporte" },
  { valor: "viaje", etiqueta: "Viaje" },
  { valor: "cultura", etiqueta: "Cultura y ocio" },
  { valor: "otro", etiqueta: "Otro" },
] as const;

export const etiquetaCategoria = (v: string) =>
  CATEGORIAS.find((c) => c.valor === v)?.etiqueta ?? "Otro";

export type Plan = {
  id: string;
  creador_id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  inicio: string;
  lugar: string;
  aforo: number;
  coste_por_persona: number;
  cancelado: boolean;
  profiles?: { nombre: string } | null;
  asistencias?: { estado: string; invitados: string[] }[];
};

export function plazasOcupadas(p: Pick<Plan, "asistencias">) {
  return (p.asistencias ?? [])
    .filter((a) => a.estado === "voy")
    .reduce((n, a) => n + 1 + a.invitados.length, 0);
}

export function textoCoste(c: number) {
  if (!c) return "Gratis";
  return `${Number(c).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} € por persona`;
}
