export const CATEGORIAS = [
  { valor: "comida", etiqueta: "Comida y bebida", color: "#FFF0CC" },
  { valor: "fiesta", etiqueta: "Fiesta", color: "#FFDCEB" },
  { valor: "deporte", etiqueta: "Deporte", color: "#D7F2DF" },
  { valor: "viaje", etiqueta: "Viaje", color: "#D8E7FF" },
  { valor: "cultura", etiqueta: "Cultura y ocio", color: "#E8DEFF" },
  { valor: "otro", etiqueta: "Otro", color: "#ECECE8" },
] as const;

export const etiquetaCategoria = (v: string) =>
  CATEGORIAS.find((c) => c.valor === v)?.etiqueta ?? "Otro";

export const colorCategoria = (v: string) =>
  CATEGORIAS.find((c) => c.valor === v)?.color ?? "#ECECE8";

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
