import Maquina from "@/components/Maquina";
import FormUnirse from "./FormUnirse";

export default async function Unirse({ searchParams }: PageProps<"/unirse">) {
  const { codigo } = await searchParams;
  const c = typeof codigo === "string" ? codigo : "";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <Maquina texto="Bienvenido a la resistencia" className="mb-2 min-h-[2.6em] text-4xl font-extrabold leading-tight tracking-tight" />
      {c ? (
        <>
          <p className="mb-8 text-apagado">Crea tu cuenta para ver y proponer planes.</p>
          <FormUnirse codigo={c} />
        </>
      ) : (
        <p className="text-apagado">Necesitas un enlace de invitación para unirte. Pídeselo a un administrador.</p>
      )}
      <p className="mt-8 text-sm"><a className="font-semibold underline" href="/login">Ya tengo cuenta</a></p>
    </main>
  );
}
