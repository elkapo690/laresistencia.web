import Link from "next/link";
import Calendario, { mesDe } from "@/components/Calendario";
import Maquina from "@/components/Maquina";
import Proximos from "@/components/Proximos";
import TarjetaPlan from "@/components/TarjetaPlan";
import { claveDia, claveDiaLarga, hoyClave } from "@/lib/fechas";
import type { Plan } from "@/lib/planes";
import { createClient } from "@/lib/supabase/server";

const reMes = /^\d{4}-(0[1-9]|1[0-2])$/;
const reDia = /^\d{4}-\d{2}-\d{2}$/;

export default async function Inicio({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const hoy = hoyClave();
  const dia = typeof sp.dia === "string" && reDia.test(sp.dia) ? sp.dia : undefined;
  const mes = typeof sp.mes === "string" && reMes.test(sp.mes) ? sp.mes : (dia ? mesDe(dia) : mesDe(hoy));

  const [y, m] = mes.split("-").map(Number);
  // Un día de margen a cada lado por la zona horaria.
  const desde = new Date(Date.UTC(y, m - 1, 1) - 864e5).toISOString();
  const hasta = new Date(Date.UTC(y, m, 1) + 864e5).toISOString();
  const columnas = "*, profiles(nombre), asistencias(estado, invitados)";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: planes }, { data: proximos }, { data: perfil }] = await Promise.all([
    supabase.from("planes").select(columnas).gte("inicio", desde).lt("inicio", hasta).order("inicio"),
    supabase
      .from("planes")
      .select(columnas)
      .gte("inicio", new Date().toISOString())
      .eq("cancelado", false)
      .order("inicio")
      .limit(4),
    supabase.from("profiles").select("nombre").eq("id", user!.id).single(),
  ]);

  const delMes = ((planes ?? []) as Plan[]).filter((p) => mesDe(claveDia(p.inicio)) === mes);
  const conPlanes = new Set(delMes.filter((p) => !p.cancelado).map((p) => claveDia(p.inicio)));
  const visibles = dia ? delMes.filter((p) => claveDia(p.inicio) === dia) : delMes;

  return (
    <div className="mx-auto grid max-w-2xl gap-5 lg:max-w-none lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
      <section className="tarjeta flex flex-wrap items-center justify-between gap-4 lg:col-start-1 lg:row-start-1">
        <div>
          <Maquina texto="Bienvenido a la resistencia" className="min-h-[2.6em] text-3xl font-extrabold leading-tight tracking-tight sm:min-h-0 sm:text-4xl" />
          <p className="text-apagado">Hola, {perfil?.nombre}. Mira qué se cuece.</p>
        </div>
        <Link href="/planes/nuevo" className="btn hidden sm:inline-flex">+ Proponer un plan</Link>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:space-y-6">
        <Calendario mes={mes} conPlanes={conPlanes} hoy={hoy} seleccionado={dia} />
        <div className="hidden lg:block">
          <Proximos planes={(proximos ?? []) as Plan[]} />
        </div>
      </aside>

      <section className="space-y-4 lg:col-start-1 lg:row-start-2">
        <h2 className="text-xl font-extrabold first-letter:uppercase">
          {dia ? claveDiaLarga(dia) : "Planes del mes"}
        </h2>
        {visibles.length === 0 ? (
          <div className="rounded-[1.75rem] border-2 border-dashed border-tinta/20 p-8 text-center text-apagado">
            {dia ? "Día libre. ¿Y si propones algo?" : "Este mes aún no hay planes."}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibles.map((p) => <TarjetaPlan key={p.id} plan={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
