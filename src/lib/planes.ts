import type { PerfilMini } from "./perfil";

export const CATEGORIAS = [
  { valor: "comida", etiqueta: "Comida", emoji: "🍕", color: "#FFF0CC", acento: "#FFC83D" },
  { valor: "fiesta", etiqueta: "Fiesta", emoji: "🎉", color: "#FFDCEB", acento: "#FF6FA5" },
  { valor: "deporte", etiqueta: "Deporte", emoji: "⚽", color: "#D7F2DF", acento: "#3DD68C" },
  { valor: "viaje", etiqueta: "Viaje", emoji: "✈️", color: "#D8E7FF", acento: "#5B9DFF" },
  { valor: "cultura", etiqueta: "Cultura", emoji: "🎬", color: "#E8DEFF", acento: "#9B7BFF" },
  { valor: "otro", etiqueta: "Otro", emoji: "✨", color: "#ECECE8", acento: "#B8B8B0" },
] as const;

const buscar = (v: string) => CATEGORIAS.find((c) => c.valor === v) ?? CATEGORIAS[5];
export const etiquetaCategoria = (v: string) => buscar(v).etiqueta;
export const colorCategoria = (v: string) => buscar(v).color;
export const acentoCategoria = (v: string) => buscar(v).acento;
export const emojiCategoria = (v: string) => buscar(v).emoji;

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
  profiles?: PerfilMini | null;
  asistencias?: { estado: string; invitados: string[]; profiles?: PerfilMini | null }[];
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

/** Enlace de la portada conservando mes, día y categoría. */
export function ruta(p: { mes?: string; dia?: string; cat?: string }) {
  const q = new URLSearchParams();
  if (p.mes) q.set("mes", p.mes);
  if (p.dia) q.set("dia", p.dia);
  if (p.cat) q.set("cat", p.cat);
  const s = q.toString();
  return s ? `/?${s}` : "/";
}
