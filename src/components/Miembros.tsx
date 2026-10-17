import Avatar from "./Avatar";

export default function Miembros({ miembros }: { miembros: { id: string; nombre: string }[] }) {
  return (
    <section aria-label="Miembros">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-extrabold">La resistencia</h2>
        <span className="text-sm font-semibold text-apagado">{miembros.length} {miembros.length === 1 ? "miembro" : "miembros"}</span>
      </div>
      <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 [scrollbar-width:none]">
        {miembros.map((m) => (
          <li key={m.id} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
            <Avatar nombre={m.nombre} tam={56} anillo />
            <span className="w-full truncate text-center text-xs font-semibold">{m.nombre.split(" ")[0]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
