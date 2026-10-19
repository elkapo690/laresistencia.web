import Maquina from "@/components/Maquina";
import FormLogin from "./FormLogin";

export default function Login() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <div className="overflow-hidden rounded-[2.5rem] bg-white/90 shadow-[0_40px_90px_-30px_rgba(60,40,120,0.4)] backdrop-blur">
        <div className="relative bg-gradient-to-br from-[#E8DEFF] via-[#FFDCEB] to-[#FFF0CC] px-8 pb-8 pt-10">
          <span aria-hidden className="absolute right-6 top-5 text-4xl">🎉</span>
          <span aria-hidden className="absolute bottom-6 right-8 text-3xl">🍽️</span>
          <Maquina texto="Bienvenido a la resistencia" className="min-h-[2.2em] text-4xl font-extrabold leading-[1.05] tracking-tight" />
          <p className="mt-2 text-sm font-semibold text-black/60">Los planes del grupo, por fin en un solo sitio.</p>
        </div>
        <div className="p-8">
          <FormLogin />
          <p className="mt-6 text-sm text-apagado">
            ¿Aún no tienes cuenta? Solo se entra con invitación personal: pídesela a un administrador.
          </p>
        </div>
      </div>
    </main>
  );
}
