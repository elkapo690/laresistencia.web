import { etiquetaInteres } from "@/lib/perfil";

/** Gustos como etiquetas, con el color de su cuadro. Los que coinciden con los del usuario que mira van en negro. */
export default function ChipsIntereses({ intereses, comunes = [] }: { intereses: string[]; comunes?: string[] }) {
  if (!intereses.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {intereses.map((v) => {
        const i = etiquetaInteres(v);
        if (!i) return null;
        const comun = comunes.includes(v);
        return (
          <li
            key={v}
            style={comun ? undefined : { background: i.color }}
            className={`rounded-full px-3 py-1 text-xs font-bold ${comun ? "bg-tinta text-white" : ""}`}
          >
            <span aria-hidden>{i.emoji}</span> {i.etiqueta}
          </li>
        );
      })}
    </ul>
  );
}
