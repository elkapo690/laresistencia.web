import Link from "next/link";
import Avatar from "@/components/Avatar";
import Calendario, { mesDe } from "@/components/Calendario";
import FiltroCategorias from "@/components/FiltroCategorias";
import Maquina from "@/components/Maquina";
import Miembros from "@/components/Miembros";
import Proximos from "@/components/Proximos";
import ProximosMovil from "@/components/ProximosMovil";
import TarjetaPlan from "@/components/TarjetaPlan";
import { claveDia, claveDiaLarga, hoyClave } from "@/lib/fechas";
import { CATEGORIAS, acentoCategoria, type Plan } from "@/lib/planes";
import { COLUMNAS_PERFIL, primerNombre } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";

const reMes = /^\d{4}-(0[1-9]|1[0-2])$/;
const reDia = /^\d{4}-\d{2}-\d{2}$/;

export default async function Inicio({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const hoy = hoyClave();
  const dia = typeof sp.dia === "string" && reDia.test(sp.dia) ? sp.dia : undefined;
  const mes = typeof sp.mes === "string" && reMes.test(sp.mes) ? sp.mes : (dia ? mesDe(dia) : mesDe(hoy));
  const cat = typeof sp.cat === "string" && CATEGORIAS.some((c) => c.valor === sp.cat) ? sp.cat : undefined;

  const [y, m] = mes.split("-").map(Number);
  // Un día de margen a cada lado por la zona horaria.
  const desde = new Date(Date.UTC(y, m - 1, 1) - 864e5).toISOString();
  const hasta = new Date(Date.UTC(y, m, 1) + 864e5).toISOString();
  const columnas = `*, profiles!creador_id(${COLUMNAS_PERFIL}), asistencias(estado, invitados, profiles(${COLUMNAS_PERFIL}))`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: planes }, { data: proximos }, { data: miembros }] = await Promise.all([
    supabase.from("planes").select(columnas).gte("inicio", desde).lt("inicio", hasta).order("inicio"),
    supabase
      .from("planes")
      .select(columnas)
      .gte("inicio", new Date().toISOString())
      .eq("cancelado", false)
      .order("inicio")
      .limit(4),
    supabase.from("profiles").select(`id, ${COLUMNAS_PERFIL}`).order("creado_en").limit(60),
  ]);
  const yoPerfil = miembros?.find((p) => p.id === user!.id);
  const yo = yoPerfil?.nombre ?? "";

  const delMes = ((planes ?? []) as Plan[]).filter((p) => mesDe(claveDia(p.inicio)) === mes);
  const marcas: Record<string, string> = {};
  const varios = new Set<string>();
  for (const p of delMes.filter((p) => !p.cancelado)) {
    const k = claveDia(p.inicio);
    if (marcas[k]) varios.add(k);
    else marcas[k] = acentoCategoria(p.categoria);
  }
  const visibles = delMes.filter((p) => (!dia || claveDia(p.inicio) === dia) && (!cat || p.categoria === cat));

  const calendario = <Calendario mes={mes} marcas={marcas} varios={varios} hoy={hoy} seleccionado={dia} cat={cat} />;

  return (
    <div className="mx-auto grid max-w-2xl gap-6 lg:max-w-none lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-8">
      <div className="min-w-0 space-y-6">
        <header>
          <Maquina texto="Bienvenido a la resistencia" className="min-h-[2.4em] text-4xl font-extrabold leading-[1.05] tracking-tight sm:min-h-0 lg:text-[2.6rem]" />
          <p className="mt-2 text-base text-apagado">Hola, {primerNombre(yo)}. Mira qué se cuece.</p>
        </header>

        <Link
          href="/planes/nuevo"
          className="flex items-center gap-3 rounded-full bg-white p-2 pl-2.5 shadow-[0_10px_30px_-14px_rgba(60,40,120,0.3)] transition hover:shadow-lg lg:bg-[#f6f6fa] lg:shadow-none lg:hover:bg-white"
        >
          <Avatar perfil={yoPerfil} tam={40} />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-apagado">¿Qué plan propones?</span>
          <span className="btn !py-2.5">+ Nuevo plan</span>
        </Link>

        <ProximosMovil planes={(proximos ?? []) as Plan[]} />

        <Miembros miembros={miembros ?? []} />

        <div className="lg:hidden">{calendario}</div>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight first-letter:uppercase">
              {dia ? claveDiaLarga(dia) : "Planes del mes"}
            </h2>
            {dia && (
              <Link href={`/?mes=${mes}${cat ? `&cat=${cat}` : ""}`} className="text-sm font-bold underline">Ver todo el mes</Link>
            )}
          </div>
          <FiltroCategorias mes={mes} dia={dia} cat={cat} />
          {visibles.length === 0 ? (
            <div className="rounded-[2rem] border-2 border-dashed border-tinta/20 p-10 text-center text-apagado">
              <p className="mb-1 text-3xl" aria-hidden>🌱</p>
              {dia ? "Día libre. ¿Y si propones algo?" : "Aquí aún no hay planes."}
            </div>
          ) : (
            <div className="space-y-4">
              {visibles.map((p) => <TarjetaPlan key={p.id} plan={p} />)}
            </div>
          )}
        </section>
      </div>

      <aside className="hidden space-y-6 lg:sticky lg:top-14 lg:block lg:self-start">
        {calendario}
        <Proximos planes={(proximos ?? []) as Plan[]} />
      </aside>
    </div>
  );
}
