import Maquina from "@/components/Maquina";
import FormLogin from "./FormLogin";

export default function Login() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <Maquina texto="Bienvenido a la resistencia" className="mb-2 min-h-[2.6em] text-4xl font-extrabold leading-tight tracking-tight" />
      <p className="mb-8 text-apagado">Entra con tu correo y tu clave.</p>
      <FormLogin />
      <p className="mt-8 text-sm text-apagado">
        ¿Aún no tienes cuenta? Pide el enlace de invitación a un administrador.
      </p>
    </main>
  );
}
