"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";
import InstalarApp from "./InstalarApp";
import { IconoEscudo, IconoInicio, IconoMas, IconoSalir } from "./Iconos";
import { salir } from "@/app/login/actions";

type Props = { nombre: string; admin: boolean };

function usaRuta(ruta: string, actual: string) {
  return ruta === "/" ? actual === "/" : actual.startsWith(ruta);
}

export default function Menu({ nombre, admin }: Props) {
  const actual = usePathname();
  const items = [
    { href: "/", texto: "Inicio", Icono: IconoInicio },
    { href: "/planes/nuevo", texto: "Nuevo plan", Icono: IconoMas },
    ...(admin ? [{ href: "/admin", texto: "Admin", Icono: IconoEscudo }] : []),
  ];

  return (
    <>
      {/* Escritorio: menú lateral */}
      <aside className="sticky top-14 hidden h-[calc(100dvh-7rem)] w-56 shrink-0 flex-col lg:flex">
        <Link href="/" className="mb-6 block text-center text-sm font-extrabold uppercase tracking-[0.25em]">
          La Resistencia
        </Link>
        <div className="mb-6 flex flex-col items-center text-center">
          <Avatar nombre={nombre} tam={72} anillo />
          <p className="mt-3 max-w-full truncate text-lg font-extrabold">{nombre}</p>
          <p className="text-xs font-semibold text-apagado">{admin ? "Administrador" : "Miembro"}</p>
        </div>
        <nav className="flex flex-col gap-1.5" aria-label="Principal">
          {items.map(({ href, texto, Icono }) => {
            const activo = usaRuta(href, actual);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold transition ${
                  activo ? "bg-tinta text-white shadow-lg shadow-black/20" : "hover:bg-suave"
                }`}
              >
                <Icono /> {texto}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <InstalarApp />
          <form action={salir}>
            <button className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-apagado transition hover:bg-suave hover:text-tinta">
              <IconoSalir /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Móvil: barra superior + barra inferior */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/" className="text-sm font-extrabold uppercase tracking-[0.2em]">La Resistencia</Link>
        <form action={salir} className="flex items-center gap-2">
          <Avatar nombre={nombre} tam={34} anillo />
          <button aria-label="Cerrar sesión" className="rounded-full bg-white p-2 shadow-sm"><IconoSalir /></button>
        </form>
      </header>
      <nav
        aria-label="Principal"
        className="fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-sm items-center justify-around rounded-full bg-tinta p-2 text-white shadow-2xl shadow-black/30 lg:hidden"
      >
        {items.map(({ href, texto, Icono }) => {
          const activo = usaRuta(href, actual);
          return (
            <Link
              key={href}
              href={href}
              aria-label={texto}
              aria-current={activo ? "page" : undefined}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                activo ? "bg-white text-tinta" : "text-white/80"
              }`}
            >
              <Icono />
              {activo && <span>{texto}</span>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
