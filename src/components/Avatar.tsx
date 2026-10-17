import type { PerfilMini } from "@/lib/perfil";

const COLORES = ["#FFDCEB", "#D8E7FF", "#D7F2DF", "#FFF0CC", "#E8DEFF", "#FFE0D1"];

type Props = { nombre?: string; perfil?: PerfilMini | null; tam?: number; anillo?: boolean };

export default function Avatar({ nombre, perfil, tam = 36, anillo = false }: Props) {
  const n = perfil?.nombre ?? nombre ?? "?";
  const color = perfil?.avatar_color || COLORES[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORES.length];
  const caja = "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white font-extrabold shadow-sm";

  const circulo = perfil?.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={perfil.avatar_url} alt="" width={tam} height={tam} loading="lazy" decoding="async" className={`${caja} object-cover`} style={{ width: tam, height: tam, background: color }} />
  ) : (
    <span aria-hidden className={caja} style={{ width: tam, height: tam, background: color, fontSize: tam * (perfil?.avatar_emoji ? 0.5 : 0.4) }}>
      {perfil?.avatar_emoji || n.trim().charAt(0).toUpperCase()}
    </span>
  );
  if (!anillo) return circulo;
  return <span className="inline-flex rounded-full bg-gradient-to-tr from-fuchsia-400 via-violet-400 to-sky-400 p-[3px]">{circulo}</span>;
}
