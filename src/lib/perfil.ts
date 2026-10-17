export type PerfilMini = {
  nombre: string;
  avatar_url?: string | null;
  avatar_emoji?: string | null;
  avatar_color?: string | null;
};

/** Columnas de profiles necesarias para pintar un avatar. */
export const COLUMNAS_PERFIL = "nombre, avatar_url, avatar_emoji, avatar_color";

export const INTERESES = [
  { valor: "senderismo", etiqueta: "Senderismo", emoji: "🥾" },
  { valor: "playa", etiqueta: "Playa", emoji: "🏖️" },
  { valor: "montana", etiqueta: "Montaña", emoji: "⛰️" },
  { valor: "viajes", etiqueta: "Viajes", emoji: "✈️" },
  { valor: "gastronomia", etiqueta: "Gastronomía", emoji: "🍜" },
  { valor: "cocinar", etiqueta: "Cocinar", emoji: "👩‍🍳" },
  { valor: "cafe", etiqueta: "Café", emoji: "☕" },
  { valor: "cervezas", etiqueta: "Cervezas", emoji: "🍺" },
  { valor: "fiesta", etiqueta: "Fiesta", emoji: "🎉" },
  { valor: "bailar", etiqueta: "Bailar", emoji: "💃" },
  { valor: "musica", etiqueta: "Música en vivo", emoji: "🎸" },
  { valor: "cine", etiqueta: "Cine", emoji: "🎬" },
  { valor: "teatro", etiqueta: "Teatro", emoji: "🎭" },
  { valor: "arte", etiqueta: "Arte y museos", emoji: "🎨" },
  { valor: "lectura", etiqueta: "Lectura", emoji: "📚" },
  { valor: "fotografia", etiqueta: "Fotografía", emoji: "📷" },
  { valor: "juegos", etiqueta: "Juegos de mesa", emoji: "🎲" },
  { valor: "videojuegos", etiqueta: "Videojuegos", emoji: "🎮" },
  { valor: "running", etiqueta: "Running", emoji: "🏃" },
  { valor: "gimnasio", etiqueta: "Gimnasio", emoji: "🏋️" },
  { valor: "padel", etiqueta: "Pádel y tenis", emoji: "🎾" },
  { valor: "futbol", etiqueta: "Fútbol", emoji: "⚽" },
  { valor: "mascotas", etiqueta: "Mascotas", emoji: "🐶" },
  { valor: "idiomas", etiqueta: "Idiomas", emoji: "🗣️" },
] as const;

export const MAX_INTERESES = 12;
export const etiquetaInteres = (v: string) => INTERESES.find((i) => i.valor === v);

export const AVATARES_EMOJI = ["😀", "😎", "🤠", "🥳", "🦊", "🐼", "🐯", "🦄", "🐸", "🐙", "🦁", "🐨", "🌵", "🌻", "🍕", "🚀", "⚡", "🔥", "🎧", "🧢"];
export const COLORES_AVATAR = ["#FFDCEB", "#D8E7FF", "#D7F2DF", "#FFF0CC", "#E8DEFF", "#FFE0D1", "#CDF3F0", "#EDEDE8"];

export function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/)[0] ?? nombre;
}
