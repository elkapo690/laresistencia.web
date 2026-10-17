"use client";

import { eliminarMiembro } from "@/app/(app)/admin/actions";

export default function BotonEliminarMiembro({ usuario, nombre }: { usuario: string; nombre: string }) {
  return (
    <form
      action={eliminarMiembro}
      onSubmit={(e) => {
        if (!window.confirm(`¿Eliminar a ${nombre} de La Resistencia?\n\nSe borrarán también sus planes, comentarios y apuntados. No se puede deshacer.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="usuario" value={usuario} />
      <button className="rounded-full border-2 border-red-700 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50">Eliminar</button>
    </form>
  );
}
