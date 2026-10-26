import type { PerfilMini } from "./perfil";

export const CATEGORIAS = [
  { valor: "comida", etiqueta: "Comida y cenas", emoji: "🍕", color: "#FFF0CC", acento: "#FFC83D" },
  { valor: "cafe", etiqueta: "Café y charla", emoji: "☕", color: "#EBDACB", acento: "#A0673A" },
  { valor: "copas", etiqueta: "Copas y terrazas", emoji: "🍸", color: "#FFE0CC", acento: "#FF8A3D" },
  { valor: "fiesta", etiqueta: "Fiesta y discoteca", emoji: "🎉", color: "#FFDCEB", acento: "#FF6FA5" },
  { valor: "cumple", etiqueta: "Cumpleaños", emoji: "🎂", color: "#FFD4D4", acento: "#F43F5E" },
  { valor: "musica", etiqueta: "Música y conciertos", emoji: "🎵", color: "#E0E1FF", acento: "#6366F1" },
  { valor: "cine", etiqueta: "Cine y series", emoji: "🎬", color: "#DCE3EC", acento: "#475569" },
  { valor: "cultura", etiqueta: "Cultura y talleres", emoji: "🎭", color: "#E8DEFF", acento: "#9B7BFF" },
  { valor: "juegos", etiqueta: "Juegos y videojuegos", emoji: "🎮", color: "#F6D8F5", acento: "#D946EF" },
  { valor: "deporte", etiqueta: "Deporte", emoji: "⚽", color: "#D7F2DF", acento: "#3DD68C" },
  { valor: "naturaleza", etiqueta: "Naturaleza y senderismo", emoji: "🥾", color: "#E4F4C4", acento: "#84CC16" },
  { valor: "playa", etiqueta: "Playa y piscina", emoji: "🏖️", color: "#CFF1FF", acento: "#22B8E6" },
  { valor: "motor", etiqueta: "Motor y rutas", emoji: "🏍️", color: "#FBE5C3", acento: "#D97706" },
  { valor: "viaje", etiqueta: "Viajes y escapadas", emoji: "✈️", color: "#D8E7FF", acento: "#5B9DFF" },
  { valor: "bienestar", etiqueta: "Bienestar y yoga", emoji: "🧘", color: "#CDF3F0", acento: "#14B8A6" },
  { valor: "mascotas", etiqueta: "Mascotas", emoji: "🐶", color: "#F6E3D3", acento: "#C2763A" },
  { valor: "idiomas", etiqueta: "Idiomas e intercambio", emoji: "🗣️", color: "#E3EDFF", acento: "#2563EB" },
  { valor: "compras", etiqueta: "Compras y mercadillos", emoji: "🛍️", color: "#FFE3E8", acento: "#FB7185" },
  { valor: "solidario", etiqueta: "Solidario y voluntariado", emoji: "🤝", color: "#E8F5E0", acento: "#4ADE80" },
  { valor: "otro", etiqueta: "Otro", emoji: "✨", color: "#ECECE8", acento: "#B8B8B0" },
] as const;

const buscar = (v: string) => CATEGORIAS.find((c) => c.valor === v) ?? CATEGORIAS[CATEGORIAS.length - 1];
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

/** Enlace de la portada conservando mes, día, categoría, vista (pasados), búsqueda y cantidad. */
export function ruta(p: { mes?: string; dia?: string; cat?: string; v?: string; q?: string; n?: number }) {
  const q = new URLSearchParams();
  if (p.mes) q.set("mes", p.mes);
  if (p.dia) q.set("dia", p.dia);
  if (p.cat) q.set("cat", p.cat);
  if (p.v) q.set("v", p.v);
  if (p.q) q.set("q", p.q);
  if (p.n) q.set("n", String(p.n));
  const s = q.toString();
  return s ? `/?${s}` : "/";
}
