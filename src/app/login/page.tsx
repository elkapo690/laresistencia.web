import Maquina from "@/components/Maquina";
import FormLogin from "./FormLogin";

export default function Login() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <div className="tarjeta !p-7 sm:!p-9">
      <Maquina texto="Bienvenido a la resistencia" className="mb-2 min-h-[2.6em] text-4xl font-extrabold leading-tight tracking-tight" />
      <p className="mb-8 text-apagado">Entra con tu correo y tu clave.</p>
      <FormLogin />
      <p className="mt-8 text-sm text-apagado">
        ¿Aún no tienes cuenta? Pide el enlace de invitación a un administrador.
      </p>
      </div>
    </main>
  );
}
