import Avatar from "./Avatar";
import type { PerfilMini } from "@/lib/perfil";

export default function PilaAvatares({ perfiles, total, tam = 30 }: { perfiles: PerfilMini[]; total: number; tam?: number }) {
  const mostrados = perfiles.slice(0, 4);
  const resto = total - mostrados.length;
  if (total === 0) return <span className="text-sm font-semibold text-black/55">Sé el primero</span>;
  return (
    <span className="flex items-center">
      <span className="flex -space-x-2">
        {mostrados.map((p, i) => (
          <Avatar key={i} perfil={p} tam={tam} />
        ))}
      </span>
      {resto > 0 && (
        <span
          className="-ml-2 inline-flex items-center justify-center rounded-full border-2 border-white bg-tinta text-xs font-bold text-white"
          style={{ width: tam, height: tam }}
        >
          +{resto}
        </span>
      )}
    </span>
  );
}
