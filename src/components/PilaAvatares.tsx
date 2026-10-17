import Avatar from "./Avatar";

export default function PilaAvatares({ nombres, total, tam = 30 }: { nombres: string[]; total: number; tam?: number }) {
  const mostrados = nombres.slice(0, 4);
  const resto = total - mostrados.length;
  if (total === 0) return <span className="text-sm font-semibold text-black/55">Sé el primero</span>;
  return (
    <span className="flex items-center">
      <span className="flex -space-x-2">
        {mostrados.map((n, i) => (
          <Avatar key={i} nombre={n} tam={tam} />
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
