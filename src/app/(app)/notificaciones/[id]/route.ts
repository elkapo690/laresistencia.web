import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Marca el aviso como leído y lleva al plan. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("notificaciones").update({ leida: true }).eq("id", id).select("plan_id").maybeSingle();
  return NextResponse.redirect(new URL(data?.plan_id ? `/planes/${data.plan_id}` : "/notificaciones", request.url));
}
