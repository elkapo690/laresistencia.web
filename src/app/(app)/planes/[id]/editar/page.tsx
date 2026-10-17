import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import FormPlan from "@/components/FormPlan";
import { isoAMadridLocal } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { editarPlan } from "../../actions";

export default async function EditarPlan({ params }: PageProps<"/planes/[id]/editar">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: plan }, { data: yo }] = await Promise.all([
    supabase.from("planes").select("*").eq("id", id).single(),
    supabase.from("profiles").select("rol").eq("id", user!.id).single(),
  ]);
  if (!plan) notFound();
  if (plan.creador_id !== user?.id && yo?.rol !== "propietario") redirect(`/planes/${id}`);

  return (
    <div className="contenedor space-y-5">
      <Link href={`/planes/${id}`} className="text-sm font-semibold underline">← Volver al plan</Link>
      <h1 className="text-3xl font-extrabold tracking-tight">Editar plan</h1>
      <div className="tarjeta">
        <FormPlan
          accion={editarPlan}
          textoBoton="Guardar cambios"
          valores={{
            id: plan.id,
            titulo: plan.titulo,
            descripcion: plan.descripcion,
            categoria: plan.categoria,
            inicio: isoAMadridLocal(plan.inicio),
            lugar: plan.lugar,
            aforo: plan.aforo,
            coste: Number(plan.coste_por_persona),
          }}
        />
      </div>
    </div>
  );
}
