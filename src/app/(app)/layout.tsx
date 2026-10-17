import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { salir } from "../login/actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: perfil } = await supabase.from("profiles").select("nombre, rol").eq("id", user.id).single();

  return (
    <>
      <header className="sticky top-0 z-10 border-b-2 border-tinta bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight">La Resistencia</Link>
          <nav className="flex items-center gap-2">
            {perfil?.rol === "admin" && (
              <Link href="/admin" className="btn-claro !px-4 !py-2">Admin</Link>
            )}
            <Link href="/planes/nuevo" className="btn !px-4 !py-2">+ Plan</Link>
            <form action={salir}>
              <button className="btn-claro !px-4 !py-2" aria-label="Cerrar sesión">Salir</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
