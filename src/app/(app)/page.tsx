import Link from "next/link";
import Avatar from "@/components/Avatar";
import Calendario, { mesDe } from "@/components/Calendario";
import FiltroCategorias from "@/components/FiltroCategorias";
import Maquina from "@/components/Maquina";
import Miembros from "@/components/Miembros";
import { IconoMas } from "@/components/Iconos";
import Proximos from "@/components/Proximos";
import ProximosMovil from "@/components/ProximosMovil";
import SugerenciasPlan from "@/components/SugerenciasPlan";
import TarjetaPlan from "@/components/TarjetaPlan";
import { claveDia, claveDiaLarga, hoyClave, inicioDeHoy } from "@/lib/fechas";
import { CATEGORIAS, acentoCategoria, ruta, type Plan } from "@/lib/planes";
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
  const pasados = sp.v === "pasados";
  // Se quitan los caracteres que tienen significado especial en el filtro de la base de datos.
  const q = typeof sp.q === "string" ? sp.q.replace(/[,()"\\%*]/g, " ").trim().slice(0, 60) : "";
  const n = Math.min(Math.max(Number(sp.n) || 20, 20), 200);
  const mesExplicito = !dia && !pasados && typeof sp.mes === "string" && reMes.test(sp.mes) && sp.mes !== mesDe(hoy);
  const hoyInicio = inicioDeHoy();

  const [y, m] = mes.split("-").map(Number);
  // Un día de margen a cada lado por la zona horaria.
  const desde = new Date(Date.UTC(y, m - 1, 1) - 864e5).toISOString();
  const hasta = new Date(Date.UTC(y, m, 1) + 864e5).toISOString();
  const columnas = `*, profiles!creador_id(${COLUMNAS_PERFIL}), asistencias(estado, invitados, profiles(${COLUMNAS_PERFIL}))`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let listaConsulta = supabase.from("planes").select(columnas);
  listaConsulta = pasados ? listaConsulta.lt("inicio", hoyInicio) : listaConsulta.gte("inicio", hoyInicio);
  if (cat) listaConsulta = listaConsulta.eq("categoria", cat);
  if (pasados && q) listaConsulta = listaConsulta.or(`titulo.ilike.%${q}%,lugar.ilike.%${q}%`);

  const [{ data: planes }, { data: proximos }, { data: miembros }, { data: lista }] = await Promise.all([
    supabase.from("planes").select(columnas).gte("inicio", desde).lt("inicio", hasta).order("inicio"),
    supabase
      .from("planes")
      .select(columnas)
      .gte("inicio", hoyInicio)
      .eq("cancelado", false)
      .order("inicio")
      .limit(4),
    supabase.from("profiles").select(`id, ${COLUMNAS_PERFIL}`).order("creado_en").limit(60),
    listaConsulta.order("inicio", { ascending: !pasados }).limit(n + 1),
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
  const delDia = delMes.filter((p) => claveDia(p.inicio) === dia && (!cat || p.categoria === cat));
  const delMesFiltrado = delMes.filter((p) => !cat || p.categoria === cat);
  const completa = (lista ?? []) as Plan[];
  const hayMas = completa.length > n;
  const visibles = dia ? delDia : mesExplicito ? delMesFiltrado : completa.slice(0, n);
  const modoLista = dia ? "dia" : mesExplicito ? "mes" : pasados ? "pasados" : "proximos";
  const tituloMes = new Intl.DateTimeFormat("es-ES", { timeZone: "UTC", month: "long", year: "numeric" })
    .format(new Date(Date.UTC(y, m - 1, 1)))
    .replace(" de ", " ");

  const calendario = <Calendario mes={mes} marcas={marcas} varios={varios} hoy={hoy} seleccionado={dia} cat={cat} />;
  const pestana = (activa: boolean) =>
    `rounded-full px-5 py-2 text-sm font-extrabold transition ${activa ? "bg-tinta text-white" : "text-apagado hover:text-tinta"}`;

  return (
    <div className="mx-auto grid max-w-2xl gap-6 lg:max-w-none lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-8">
      <div className="min-w-0 space-y-6">
        <header>
          <Maquina texto="Bienvenido a la resistencia" className="min-h-[2.4em] text-4xl font-extrabold leading-[1.05] tracking-tight sm:min-h-0 lg:text-[2.6rem]" />
          <p className="mt-2 text-base text-apagado">Hola, {primerNombre(yo)}. Mira qué se cuece.</p>
        </header>

        <Link
          href="/planes/nuevo"
          aria-label="Proponer un plan nuevo"
          className="group block rounded-full bg-gradient-to-r from-violet-300 via-pink-300 to-sky-300 p-[2px] shadow-[0_10px_30px_-14px_rgba(60,40,120,0.35)] transition hover:shadow-lg"
        >
          <span className="flex items-center gap-3 rounded-full bg-white p-2 pl-2.5">
            <Avatar perfil={yoPerfil} tam={40} />
            <SugerenciasPlan />
            <span className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-tinta text-white transition group-hover:bg-[color-mix(in_srgb,var(--tinta),white_15%)] max-sm:w-11 sm:px-5">
              <IconoMas />
              <span className="hidden text-sm font-bold sm:inline">Nuevo plan</span>
            </span>
          </span>
        </Link>

        <ProximosMovil planes={(proximos ?? []) as Plan[]} />

        <Miembros miembros={miembros ?? []} />

        <div className="lg:hidden">{calendario}</div>

        <section className="space-y-4">
          {modoLista === "dia" || modoLista === "mes" ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight first-letter:uppercase">
                {modoLista === "dia" ? claveDiaLarga(dia!) : `Planes de ${tituloMes}`}
              </h2>
              <Link href={ruta({ cat })} className="text-sm font-bold underline">Volver a próximos</Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex rounded-full bg-white p-1 shadow-sm lg:bg-[#f6f6fa] lg:shadow-none" role="tablist" aria-label="Qué planes ver">
                <Link role="tab" aria-selected={!pasados} href={ruta({ cat })} className={pestana(!pasados)}>Próximos</Link>
                <Link role="tab" aria-selected={pasados} href={ruta({ cat, v: "pasados" })} className={pestana(pasados)}>Pasados</Link>
              </div>
            </div>
          )}

          {modoLista === "pasados" && (
            <form action="/" className="relative">
              <input type="hidden" name="v" value="pasados" />
              {cat && <input type="hidden" name="cat" value={cat} />}
              <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
              <input name="q" defaultValue={q} maxLength={60} placeholder="Buscar por título o lugar…" aria-label="Buscar planes pasados" className="campo pl-11" />
            </form>
          )}

          <FiltroCategorias mes={modoLista === "mes" || modoLista === "dia" ? mes : undefined} dia={dia} cat={cat} v={pasados ? "pasados" : undefined} q={q || undefined} />

          {visibles.length === 0 ? (
            <div className="rounded-[2rem] border-2 border-dashed border-tinta/20 p-10 text-center text-apagado">
              <p className="mb-1 text-3xl" aria-hidden>{modoLista === "pasados" ? "🕰️" : "🌱"}</p>
              {modoLista === "dia"
                ? "Día libre. ¿Y si propones algo?"
                : modoLista === "pasados"
                  ? q || cat ? "Ningún plan pasado coincide con tu búsqueda." : "Todavía no hay planes pasados."
                  : modoLista === "mes"
                    ? "Este mes no hay planes."
                    : "No hay planes próximos. ¡Propón el primero!"}
            </div>
          ) : (
            <div className="space-y-4">
              {visibles.map((p) => <TarjetaPlan key={p.id} plan={p} />)}
            </div>
          )}

          {(modoLista === "pasados" || modoLista === "proximos") && hayMas && (
            <div className="text-center">
              <Link href={ruta({ cat, v: pasados ? "pasados" : undefined, q: q || undefined, n: n + 20 })} className="btn-claro">Ver más</Link>
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
