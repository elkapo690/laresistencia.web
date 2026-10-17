export type PerfilMini = {
  nombre: string;
  avatar_url?: string | null;
  avatar_emoji?: string | null;
  avatar_color?: string | null;
};

/** Columnas de profiles necesarias para pintar un avatar. */
export const COLUMNAS_PERFIL = "nombre, avatar_url, avatar_emoji, avatar_color";

type Interes = { valor: string; etiqueta: string; emoji: string };

/** Los gustos van en cuadros temáticos. Los `valor` ya guardados no se pueden renombrar. */
export const GRUPOS_INTERESES: { id: string; titulo: string; emoji: string; color: string; items: Interes[] }[] = [
  {
    id: "musica", titulo: "Música", emoji: "🎵", color: "#E8DEFF",
    items: [
      { valor: "musica", etiqueta: "Música en vivo", emoji: "🎸" },
      { valor: "rock", etiqueta: "Rock", emoji: "🤘" },
      { valor: "pop", etiqueta: "Pop", emoji: "🎤" },
      { valor: "indie", etiqueta: "Indie", emoji: "🎧" },
      { valor: "hiphop", etiqueta: "Hip hop y rap", emoji: "🧢" },
      { valor: "reggaeton", etiqueta: "Reggaeton", emoji: "🔥" },
      { valor: "electronica", etiqueta: "Electrónica y techno", emoji: "🎛️" },
      { valor: "latina", etiqueta: "Salsa y bachata", emoji: "🥁" },
      { valor: "flamenco", etiqueta: "Flamenco", emoji: "🪘" },
      { valor: "jazz", etiqueta: "Jazz y blues", emoji: "🎷" },
      { valor: "clasica", etiqueta: "Clásica", emoji: "🎻" },
      { valor: "metal", etiqueta: "Metal y punk", emoji: "🤟" },
      { valor: "folk", etiqueta: "Folk y country", emoji: "🪕" },
      { valor: "reggae", etiqueta: "Reggae", emoji: "🌴" },
      { valor: "kpop", etiqueta: "K-pop", emoji: "💖" },
      { valor: "cantar", etiqueta: "Cantar y karaoke", emoji: "🎶" },
      { valor: "instrumento", etiqueta: "Tocar un instrumento", emoji: "🎹" },
    ],
  },
  {
    id: "social", titulo: "Salir y social", emoji: "🥂", color: "#FFDCEB",
    items: [
      { valor: "fiesta", etiqueta: "Fiesta", emoji: "🎉" },
      { valor: "bailar", etiqueta: "Bailar", emoji: "💃" },
      { valor: "discoteca", etiqueta: "Discotecas", emoji: "🪩" },
      { valor: "cervezas", etiqueta: "Cervezas", emoji: "🍺" },
      { valor: "cafe", etiqueta: "Café", emoji: "☕" },
      { valor: "terrazas", etiqueta: "Terrazas", emoji: "☀️" },
      { valor: "tapas", etiqueta: "Tapas y vermut", emoji: "🍤" },
      { valor: "cenas", etiqueta: "Cenas con amigos", emoji: "🍽️" },
      { valor: "brunch", etiqueta: "Brunch", emoji: "🥞" },
      { valor: "quedadas", etiqueta: "Quedadas tranquilas", emoji: "🛋️" },
      { valor: "conocer", etiqueta: "Conocer gente nueva", emoji: "👋" },
    ],
  },
  {
    id: "comida", titulo: "Comida y bebida", emoji: "🍜", color: "#FFF0CC",
    items: [
      { valor: "gastronomia", etiqueta: "Gastronomía", emoji: "🍜" },
      { valor: "cocinar", etiqueta: "Cocinar", emoji: "👩‍🍳" },
      { valor: "vino", etiqueta: "Vino", emoji: "🍷" },
      { valor: "cocteles", etiqueta: "Cócteles", emoji: "🍸" },
      { valor: "barbacoa", etiqueta: "Barbacoas", emoji: "🥩" },
      { valor: "asiatica", etiqueta: "Comida asiática", emoji: "🍣" },
      { valor: "vegano", etiqueta: "Vegano y vegetariano", emoji: "🥗" },
      { valor: "reposteria", etiqueta: "Repostería", emoji: "🧁" },
    ],
  },
  {
    id: "deporte", titulo: "Deporte", emoji: "🏅", color: "#D7F2DF",
    items: [
      { valor: "running", etiqueta: "Running", emoji: "🏃" },
      { valor: "gimnasio", etiqueta: "Gimnasio", emoji: "🏋️" },
      { valor: "padel", etiqueta: "Pádel y tenis", emoji: "🎾" },
      { valor: "futbol", etiqueta: "Fútbol", emoji: "⚽" },
      { valor: "baloncesto", etiqueta: "Baloncesto", emoji: "🏀" },
      { valor: "ciclismo", etiqueta: "Ciclismo", emoji: "🚴" },
      { valor: "natacion", etiqueta: "Natación", emoji: "🏊" },
      { valor: "yoga", etiqueta: "Yoga y pilates", emoji: "🧘" },
      { valor: "escalada", etiqueta: "Escalada", emoji: "🧗" },
      { valor: "surf", etiqueta: "Surf y paddle surf", emoji: "🏄" },
      { valor: "esqui", etiqueta: "Esquí y snowboard", emoji: "⛷️" },
      { valor: "combate", etiqueta: "Boxeo y artes marciales", emoji: "🥊" },
    ],
  },
  {
    id: "naturaleza", titulo: "Naturaleza y viajes", emoji: "🌍", color: "#D8E7FF",
    items: [
      { valor: "senderismo", etiqueta: "Senderismo", emoji: "🥾" },
      { valor: "playa", etiqueta: "Playa", emoji: "🏖️" },
      { valor: "montana", etiqueta: "Montaña", emoji: "⛰️" },
      { valor: "viajes", etiqueta: "Viajes", emoji: "✈️" },
      { valor: "escapadas", etiqueta: "Escapadas y road trips", emoji: "🚗" },
      { valor: "camping", etiqueta: "Camping y acampadas", emoji: "⛺" },
      { valor: "mascotas", etiqueta: "Animales y mascotas", emoji: "🐶" },
      { valor: "astronomia", etiqueta: "Astronomía", emoji: "🔭" },
      { valor: "jardineria", etiqueta: "Plantas y jardinería", emoji: "🪴" },
    ],
  },
  {
    id: "cultura", titulo: "Cultura y arte", emoji: "🎭", color: "#FFE0D1",
    items: [
      { valor: "cine", etiqueta: "Cine", emoji: "🎬" },
      { valor: "series", etiqueta: "Series", emoji: "📺" },
      { valor: "teatro", etiqueta: "Teatro", emoji: "🎭" },
      { valor: "arte", etiqueta: "Arte y museos", emoji: "🎨" },
      { valor: "lectura", etiqueta: "Lectura", emoji: "📚" },
      { valor: "fotografia", etiqueta: "Fotografía", emoji: "📷" },
      { valor: "comics", etiqueta: "Cómics y manga", emoji: "🦸" },
      { valor: "anime", etiqueta: "Anime", emoji: "🍥" },
      { valor: "podcasts", etiqueta: "Podcasts", emoji: "🎙️" },
      { valor: "historia", etiqueta: "Historia", emoji: "🏛️" },
      { valor: "dibujo", etiqueta: "Dibujo y pintura", emoji: "✏️" },
      { valor: "escritura", etiqueta: "Escritura", emoji: "✍️" },
    ],
  },
  {
    id: "juegos", titulo: "Juegos y tecnología", emoji: "🎮", color: "#CDF3F0",
    items: [
      { valor: "juegos", etiqueta: "Juegos de mesa", emoji: "🎲" },
      { valor: "videojuegos", etiqueta: "Videojuegos", emoji: "🎮" },
      { valor: "rol", etiqueta: "Rol y fantasía", emoji: "🐉" },
      { valor: "ajedrez", etiqueta: "Ajedrez", emoji: "♟️" },
      { valor: "cartas", etiqueta: "Cartas y póker", emoji: "🃏" },
      { valor: "escaperoom", etiqueta: "Escape rooms", emoji: "🔐" },
      { valor: "trivial", etiqueta: "Trivial y pub quiz", emoji: "🧠" },
      { valor: "tecnologia", etiqueta: "Tecnología", emoji: "💻" },
      { valor: "programacion", etiqueta: "Programación", emoji: "👨‍💻" },
    ],
  },
  {
    id: "vida", titulo: "Estilo de vida", emoji: "🌱", color: "#EDEDE8",
    items: [
      { valor: "idiomas", etiqueta: "Idiomas", emoji: "🗣️" },
      { valor: "voluntariado", etiqueta: "Voluntariado", emoji: "🤝" },
      { valor: "meditacion", etiqueta: "Meditación y bienestar", emoji: "🪷" },
      { valor: "emprender", etiqueta: "Emprender y negocios", emoji: "💡" },
      { valor: "moda", etiqueta: "Moda", emoji: "👗" },
      { valor: "motor", etiqueta: "Coches y motos", emoji: "🏍️" },
      { valor: "bricolaje", etiqueta: "Bricolaje y manualidades", emoji: "🛠️" },
      { valor: "ecologia", etiqueta: "Ecología y sostenibilidad", emoji: "♻️" },
    ],
  },
];

/** Lista plana con el grupo y el color de cada gusto. */
export const INTERESES = GRUPOS_INTERESES.flatMap((g) => g.items.map((i) => ({ ...i, grupo: g.id, color: g.color })));

export const MAX_INTERESES = 12;
export const etiquetaInteres = (v: string) => INTERESES.find((i) => i.valor === v);

export const AVATARES_EMOJI = ["😀", "😎", "🤠", "🥳", "🦊", "🐼", "🐯", "🦄", "🐸", "🐙", "🦁", "🐨", "🌵", "🌻", "🍕", "🚀", "⚡", "🔥", "🎧", "🧢"];
export const COLORES_AVATAR = ["#FFDCEB", "#D8E7FF", "#D7F2DF", "#FFF0CC", "#E8DEFF", "#FFE0D1", "#CDF3F0", "#EDEDE8"];

export function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/)[0] ?? nombre;
}
