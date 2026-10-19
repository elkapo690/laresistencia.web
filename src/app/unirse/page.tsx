import Maquina from "@/components/Maquina";
import FormUnirse from "./FormUnirse";
import { createClient } from "@/lib/supabase/server";

export default async function Unirse({ searchParams }: PageProps<"/unirse">) {
  const { codigo } = await searchParams;
  const c = typeof codigo === "string" ? codigo : "";
  let valida = false;
  if (c) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("codigo_valido", { p_codigo: c });
    valida = data === true;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <div className="overflow-hidden rounded-[2.5rem] bg-white/90 shadow-[0_40px_90px_-30px_rgba(60,40,120,0.4)] backdrop-blur">
        <div className="relative bg-gradient-to-br from-[#D8E7FF] via-[#E8DEFF] to-[#FFDCEB] px-8 pb-8 pt-10">
          <span aria-hidden className="absolute right-6 top-5 text-4xl">✈️</span>
          <span aria-hidden className="absolute bottom-6 right-8 text-3xl">⚽</span>
          <Maquina texto="Bienvenido a la resistencia" className="min-h-[2.2em] text-4xl font-extrabold leading-[1.05] tracking-tight" />
          <p className="mt-2 text-sm font-semibold text-black/60">{valida ? "Crea tu cuenta para ver y proponer planes." : "Solo se entra con invitación."}</p>
        </div>
        <div className="p-8">
          {valida ? (
            <FormUnirse codigo={c} />
          ) : c ? (
            <p className="text-apagado">
              <b className="text-tinta">Esta invitación ya se ha usado o ha caducado.</b> Cada enlace sirve para una sola persona. Pide uno nuevo a un administrador.
            </p>
          ) : (
            <p className="text-apagado">Necesitas una invitación personal para unirte. Pídesela a un administrador.</p>
          )}
          <p className="mt-6 text-sm"><a className="font-bold underline" href="/login">Ya tengo cuenta</a></p>
        </div>
      </div>
    </main>
  );
}
