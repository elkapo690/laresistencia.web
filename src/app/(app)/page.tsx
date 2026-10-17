import Calendario, { mesDe } from "@/components/Calendario";
import Maquina from "@/components/Maquina";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: planes }, { data: perfil }] = await Promise.all([
    supabase
      .from("planes")
      .select("*, profiles(nombre), asistencias(estado, invitados)")
      .gte("inicio", desde)
      .lt("inicio", hasta)
      .order("inicio"),
    supabase.from("profiles").select("nombre").eq("id", user!.id).single(),
  ]);

  const delMes = ((planes ?? []) as Plan[]).filter((p) => mesDe(claveDia(p.inicio)) === mes);
  const conPlanes = new Set(delMes.filter((p) => !p.cancelado).map((p) => claveDia(p.inicio)));
  const visibles = dia ? delMes.filter((p) => claveDia(p.inicio) === dia) : delMes;

  return (
    <div className="space-y-6">
      <div>
        <Maquina texto="Bienvenido a la resistencia" className="min-h-[2.6em] text-3xl font-extrabold leading-tight tracking-tight sm:min-h-0 sm:text-4xl" />
        <p className="text-apagado">Hola, {perfil?.nombre}. Mira qué se cuece.</p>
      </div>

      <Calendario mes={mes} conPlanes={conPlanes} hoy={hoy} seleccionado={dia} />

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">
          {dia ? <span className="capitalize">{claveDiaLarga(dia)}</span> : "Planes del mes"}
        </h2>
        {visibles.length === 0 ? (
          <div className="tarjeta border-dashed !border-tinta/30 text-center text-apagado">
            {dia ? "Día libre. ¿Y si propones algo?" : "Este mes aún no hay planes."}
          </div>
        ) : (
          visibles.map((p) => <TarjetaPlan key={p.id} plan={p} />)
        )}
      </section>
    </div>
  );
}
