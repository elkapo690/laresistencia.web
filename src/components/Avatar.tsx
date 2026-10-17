const COLORES = ["#FFDCEB", "#D8E7FF", "#D7F2DF", "#FFF0CC", "#E8DEFF", "#FFE0D1"];

export default function Avatar({ nombre, tam = 36 }: { nombre: string; tam?: number }) {
  const n = nombre || "?";
  const color = COLORES[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORES.length];
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white font-extrabold shadow-sm"
      style={{ width: tam, height: tam, background: color, fontSize: tam * 0.4 }}
    >
      {n.trim().charAt(0).toUpperCase()}
    </span>
  );
}
