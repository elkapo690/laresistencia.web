const COLORES = ["#FFDCEB", "#D8E7FF", "#D7F2DF", "#FFF0CC", "#E8DEFF", "#FFE0D1"];

export default function Avatar({ nombre, tam = 36, anillo = false }: { nombre: string; tam?: number; anillo?: boolean }) {
  const n = nombre || "?";
  const color = COLORES[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORES.length];
  const circulo = (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white font-extrabold shadow-sm"
      style={{ width: tam, height: tam, background: color, fontSize: tam * 0.4 }}
    >
      {n.trim().charAt(0).toUpperCase()}
    </span>
  );
  if (!anillo) return circulo;
  return <span className="inline-flex rounded-full bg-gradient-to-tr from-fuchsia-400 via-violet-400 to-sky-400 p-[3px]">{circulo}</span>;
}
