"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoEscudo, IconoInicio, IconoMas, IconoSalir } from "./Iconos";
import Avatar from "./Avatar";
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
      <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-60 shrink-0 flex-col rounded-[2rem] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] lg:flex">
        <Link href="/" className="mb-8 block px-2 text-2xl font-extrabold leading-none tracking-tight">
          La<br />Resistencia
        </Link>
        <nav className="flex flex-col gap-1.5" aria-label="Principal">
          {items.map(({ href, texto, Icono }) => {
            const activo = usaRuta(href, actual);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  activo ? "bg-tinta text-white" : "hover:bg-suave"
                }`}
              >
                <Icono /> {texto}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-suave p-3">
          <Avatar nombre={nombre} />
          <span className="min-w-0 flex-1 truncate text-sm font-bold">{nombre}</span>
          <form action={salir}>
            <button aria-label="Cerrar sesión" title="Cerrar sesión" className="rounded-full p-2 transition hover:bg-white">
              <IconoSalir />
            </button>
          </form>
        </div>
      </aside>

      {/* Móvil: barra superior + barra inferior */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-fondo/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="text-lg font-extrabold tracking-tight">La Resistencia</Link>
        <form action={salir} className="flex items-center gap-2">
          <Avatar nombre={nombre} tam={32} />
          <button aria-label="Cerrar sesión" className="rounded-full bg-white p-2"><IconoSalir /></button>
        </form>
      </header>
      <nav
        aria-label="Principal"
        className="fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-sm items-center justify-around rounded-full bg-tinta p-2 text-white shadow-xl lg:hidden"
      >
        {items.map(({ href, texto, Icono }) => {
          const activo = usaRuta(href, actual);
          return (
            <Link
              key={href}
              href={href}
              aria-label={texto}
              aria-current={activo ? "page" : undefined}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
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
