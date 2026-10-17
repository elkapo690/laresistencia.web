import Link from "next/link";
import { CATEGORIAS, ruta } from "@/lib/planes";

export default function FiltroCategorias({ mes, dia, cat }: { mes: string; dia?: string; cat?: string }) {
  const chip = (activo: boolean) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
      activo ? "bg-tinta text-white" : "bg-white hover:bg-white/60 lg:bg-[#f6f6fa] lg:hover:bg-suave"
    }`;
  return (
    <nav aria-label="Filtrar por categoría" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 [scrollbar-width:none]">
      <Link href={ruta({ mes, dia })} className={chip(!cat)}>Todos</Link>
      {CATEGORIAS.map((c) => (
        <Link key={c.valor} href={ruta({ mes, dia, cat: c.valor })} className={chip(cat === c.valor)}>
          <span aria-hidden>{c.emoji}</span> {c.etiqueta}
        </Link>
      ))}
    </nav>
  );
}
