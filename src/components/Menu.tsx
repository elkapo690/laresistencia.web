"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";
import InstalarApp from "./InstalarApp";
import { IconoCampana, IconoEscudo, IconoInicio, IconoMas, IconoPerfil, IconoSalir, IconoUsuarios } from "./Iconos";
import { salir } from "@/app/login/actions";
import type { PerfilMini } from "@/lib/perfil";

type Props = { perfil: PerfilMini; rol: string; avisos: number };

function usaRuta(ruta: string, actual: string) {
  return ruta === "/" ? actual === "/" : actual.startsWith(ruta);
}

function Insignia({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-[#FF3B6B] px-1.5 text-[11px] font-extrabold leading-5 text-white">
      {n > 9 ? "9+" : n}
    </span>
  );
}

export default function Menu({ perfil, rol, avisos }: Props) {
  const actual = usePathname();
  const admin = rol === "admin" || rol === "propietario";

  const escritorio = [
    { href: "/", texto: "Inicio", Icono: IconoInicio, n: 0 },
    { href: "/miembros", texto: "Miembros", Icono: IconoUsuarios, n: 0 },
    { href: "/planes/nuevo", texto: "Nuevo plan", Icono: IconoMas, n: 0 },
    { href: "/notificaciones", texto: "Avisos", Icono: IconoCampana, n: avisos },
    ...(admin ? [{ href: "/admin", texto: "Admin", Icono: IconoEscudo, n: 0 }] : []),
  ];
  const movil = [
    { href: "/", texto: "Inicio", Icono: IconoInicio, n: 0 },
    { href: "/miembros", texto: "Miembros", Icono: IconoUsuarios, n: 0 },
    { href: "/planes/nuevo", texto: "Nuevo plan", Icono: IconoMas, n: 0 },
    { href: "/notificaciones", texto: "Avisos", Icono: IconoCampana, n: avisos },
    { href: "/perfil", texto: "Perfil", Icono: IconoPerfil, n: 0 },
  ];

  return (
    <>
      {/* Escritorio: menú lateral */}
      <aside className="sticky top-14 hidden h-[calc(100dvh-7rem)] w-56 shrink-0 flex-col lg:flex">
        <Link href="/" className="mb-6 block text-center text-sm font-extrabold uppercase tracking-[0.25em]">
          La Resistencia
        </Link>
        <Link href="/perfil" className="group mb-6 flex flex-col items-center text-center" title="Editar mi perfil">
          <Avatar perfil={perfil} tam={72} anillo />
          <p className="mt-3 max-w-full truncate text-lg font-extrabold">{perfil.nombre}</p>
          <p className="text-xs font-semibold text-apagado group-hover:underline">
            {rol === "propietario" ? "Propietario" : rol === "admin" ? "Administrador" : "Miembro"} · Mi perfil
          </p>
        </Link>
        <nav className="flex flex-col gap-1.5" aria-label="Principal">
          {escritorio.map(({ href, texto, Icono, n }) => {
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
                <Icono /> {texto} <Insignia n={n} />
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
        <div className="flex items-center gap-2">
          {admin && (
            <Link href="/admin" aria-label="Administración" className="rounded-full bg-white p-2 shadow-sm"><IconoEscudo /></Link>
          )}
          <Link href="/perfil" aria-label="Mi perfil"><Avatar perfil={perfil} tam={34} anillo /></Link>
        </div>
      </header>
      <nav
        aria-label="Principal"
        className="fixed inset-x-3 bottom-4 z-20 mx-auto flex max-w-md items-center justify-around rounded-full bg-tinta p-1.5 text-white shadow-2xl shadow-black/30 lg:hidden"
      >
        {movil.map(({ href, texto, Icono, n }) => {
          const activo = usaRuta(href, actual);
          return (
            <Link
              key={href}
              href={href}
              aria-label={texto}
              aria-current={activo ? "page" : undefined}
              className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-bold transition ${
                activo ? "bg-white text-tinta" : "text-white/80"
              }`}
            >
              <Icono />
              {activo && <span>{texto}</span>}
              {n > 0 && !activo && (
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#FF3B6B] ring-2 ring-tinta" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
