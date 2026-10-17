import { etiquetaInteres } from "@/lib/perfil";

/** Gustos como etiquetas. Los que coinciden con los del usuario que mira van resaltados. */
export default function ChipsIntereses({ intereses, comunes = [] }: { intereses: string[]; comunes?: string[] }) {
  if (!intereses.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {intereses.map((v) => {
        const i = etiquetaInteres(v);
        if (!i) return null;
        const comun = comunes.includes(v);
        return (
          <li key={v} className={`rounded-full border-2 border-transparent px-3 py-0.5 text-xs font-bold ${comun ? "bg-tinta text-white" : "border-2 border-tinta/10 bg-white"}`}>
            <span aria-hidden>{i.emoji}</span> {i.etiqueta}
          </li>
        );
      })}
    </ul>
  );
}
