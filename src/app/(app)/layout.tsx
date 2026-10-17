import { redirect } from "next/navigation";
import Menu from "@/components/Menu";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: perfil } = await supabase.from("profiles").select("nombre, rol").eq("id", user.id).single();

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col lg:p-6">
      <div className="marco flex flex-1 flex-col lg:flex-row lg:gap-8 lg:p-8">
        <Menu nombre={perfil?.nombre ?? "Tú"} admin={perfil?.rol === "admin"} />
        <main className="min-w-0 flex-1 px-4 pb-28 pt-2 lg:px-0 lg:pb-0 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
