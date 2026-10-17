import Link from "next/link";
import Avatar from "./Avatar";
import { primerNombre, type PerfilMini } from "@/lib/perfil";

export default function Miembros({ miembros }: { miembros: (PerfilMini & { id: string })[] }) {
  return (
    <section aria-label="Miembros">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-extrabold">La resistencia</h2>
        <Link href="/miembros" className="text-sm font-bold underline">
          {miembros.length} {miembros.length === 1 ? "miembro" : "miembros"} · Conocer
        </Link>
      </div>
      <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 [scrollbar-width:none]">
        {miembros.map((m) => (
          <li key={m.id} className="w-16 shrink-0">
            <Link href={`/miembros/${m.id}`} className="flex flex-col items-center gap-1.5">
              <Avatar perfil={m} tam={56} anillo />
              <span className="w-full truncate text-center text-xs font-semibold">{primerNombre(m.nombre)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
