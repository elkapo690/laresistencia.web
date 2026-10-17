import Link from "next/link";
import Avatar from "@/components/Avatar";
import ChipsIntereses from "@/components/ChipsIntereses";
import { COLUMNAS_PERFIL, INTERESES } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";

export default async function Miembros({ searchParams }: PageProps<"/miembros">) {
  const sp = await searchParams;
  const filtro = typeof sp.i === "string" && INTERESES.some((i) => i.valor === sp.i) ? sp.i : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase.from("profiles").select(`id, ${COLUMNAS_PERFIL}, edad, bio, intereses, rol`).order("creado_en");
  const todos = data ?? [];
  const mios = todos.find((m) => m.id === user!.id)?.intereses ?? [];

  const lista = todos
    .filter((m) => !filtro || m.intereses.includes(filtro))
    .map((m) => ({ ...m, comunes: m.id === user!.id ? [] : m.intereses.filter((v: string) => mios.includes(v)) }))
    .sort((a, b) => (a.id === user!.id ? 1 : 0) - (b.id === user!.id ? 1 : 0) || b.comunes.length - a.comunes.length);

  const chip = (activo: boolean) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${activo ? "bg-tinta text-white" : "bg-white hover:bg-white/60 lg:bg-[#f6f6fa] lg:hover:bg-suave"}`;

  return (
    <div className="contenedor space-y-5">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Miembros</h1>
        <p className="mt-1 text-apagado">Conoce a la gente del grupo. Te ponemos primero a quien comparte gustos contigo.</p>
      </div>

      <nav aria-label="Filtrar por gusto" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 [scrollbar-width:none]">
        <Link href="/miembros" className={chip(!filtro)}>Todos</Link>
        {INTERESES.map((i) => (
          <Link key={i.valor} href={`/miembros?i=${i.valor}`} className={chip(filtro === i.valor)}>
            <span aria-hidden>{i.emoji}</span> {i.etiqueta}
          </Link>
        ))}
      </nav>

      {lista.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-tinta/20 p-10 text-center text-apagado">Nadie ha elegido ese gusto todavía.</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {lista.map((m) => (
            <li key={m.id}>
              <Link href={`/miembros/${m.id}`} className="tarjeta flex h-full gap-4 !p-4 transition hover:shadow-lg">
                <Avatar perfil={m} tam={64} anillo />
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="block">
                    <span className="block truncate font-extrabold">{m.nombre}{m.id === user!.id && " (tú)"}</span>
                    <span className="text-xs font-semibold text-apagado">
                      {[m.edad ? `${m.edad} años` : null, m.rol === "propietario" ? "Propietario" : m.rol === "admin" ? "Admin" : null].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {m.comunes.length > 0 && (
                    <span className="inline-block rounded-full bg-[#D7F2DF] px-2.5 py-0.5 text-xs font-bold">
                      {m.comunes.length} {m.comunes.length === 1 ? "gusto" : "gustos"} en común
                    </span>
                  )}
                  <ChipsIntereses intereses={m.intereses.slice(0, 4)} comunes={m.comunes} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
