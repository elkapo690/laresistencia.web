import FormPlan from "@/components/FormPlan";
import { createClient } from "@/lib/supabase/server";
import { crearPlan } from "../actions";

export default async function NuevoPlan({ searchParams }: PageProps<"/planes/nuevo">) {
  const { desde } = await searchParams;

  // "Repetir plan": se copian los datos de otro plan y solo falta elegir la fecha nueva.
  let base: { titulo: string; descripcion: string; categoria: string; lugar: string; aforo: number; coste_por_persona: number } | null = null;
  if (typeof desde === "string") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const [{ data: plan }, { data: yo }] = await Promise.all([
      supabase.from("planes").select("titulo, descripcion, categoria, lugar, aforo, coste_por_persona, creador_id").eq("id", desde).maybeSingle(),
      supabase.from("profiles").select("rol").eq("id", user!.id).single(),
    ]);
    const admin = yo?.rol === "admin" || yo?.rol === "propietario";
    if (plan && (plan.creador_id === user!.id || admin)) base = plan;
  }

  return (
    <div className="contenedor space-y-5">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">{base ? "Repetir plan" : "Nuevo plan"}</h1>
        {base && (
          <p className="mt-1 text-apagado">
            Basado en «{base.titulo}». Elige la <b className="text-tinta">fecha nueva</b> y cambia lo que quieras. Se crea como un plan aparte: el original conserva su historial.
          </p>
        )}
      </div>
      <div className="tarjeta">
        <FormPlan
          accion={crearPlan}
          textoBoton={base ? "Publicar de nuevo" : "Publicar plan"}
          valores={
            base
              ? {
                  titulo: base.titulo,
                  descripcion: base.descripcion,
                  categoria: base.categoria,
                  lugar: base.lugar,
                  aforo: base.aforo,
                  coste: Number(base.coste_por_persona),
                }
              : {}
          }
        />
      </div>
    </div>
  );
}
