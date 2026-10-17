import { generarICS } from "@/lib/calendario";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plan } = await supabase.from("planes").select("id, titulo, descripcion, lugar, inicio").eq("id", id).single();
  if (!plan) return new Response("Plan no encontrado", { status: 404 });

  const origen = new URL(request.url).origin;
  const ics = generarICS(plan, `${origen}/planes/${id}`);
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="plan.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
