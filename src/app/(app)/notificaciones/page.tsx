import Link from "next/link";
import ActivarAvisos from "@/components/ActivarAvisos";
import { hace } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { marcarTodasLeidas } from "./actions";

const ICONO: Record<string, string> = { nuevo_plan: "✨", comentario: "💬", plan_cancelado: "🚫" };

export default async function Notificaciones() {
  const supabase = await createClient();
  const { data: avisos } = await supabase
    .from("notificaciones")
    .select("id, tipo, titulo, cuerpo, leida, creado_en")
    .order("creado_en", { ascending: false })
    .limit(50);
  const sinLeer = avisos?.filter((a) => !a.leida).length ?? 0;

  return (
    <div className="contenedor space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight">Avisos</h1>
        {sinLeer > 0 && (
          <form action={marcarTodasLeidas}>
            <button className="btn-claro !py-2">Marcar todo como leído</button>
          </form>
        )}
      </div>

      <ActivarAvisos />

      {!avisos?.length ? (
        <div className="rounded-[2rem] border-2 border-dashed border-tinta/20 p-10 text-center text-apagado">
          <p className="mb-1 text-3xl" aria-hidden>🔔</p>
          Todavía no tienes avisos. Aquí verás los planes nuevos y los comentarios.
        </div>
      ) : (
        <ul className="space-y-2">
          {avisos.map((a) => (
            <li key={a.id}>
              <Link
                href={`/notificaciones/${a.id}`}
                className={`flex items-start gap-3 rounded-3xl p-4 transition hover:shadow-md ${a.leida ? "bg-white/60" : "bg-white shadow-sm"}`}
              >
                <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-suave text-xl">{ICONO[a.tipo] ?? "🔔"}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block ${a.leida ? "font-semibold" : "font-extrabold"}`}>{a.titulo}</span>
                  {a.cuerpo && <span className="block truncate text-sm text-apagado">{a.cuerpo}</span>}
                  <span className="text-xs font-semibold text-apagado">{hace(a.creado_en)}</span>
                </span>
                {!a.leida && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#FF3B6B]" aria-label="Sin leer" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
