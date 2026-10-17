"use client";

import { IconoPapelera } from "./Iconos";
import { eliminarPlan } from "@/app/(app)/planes/actions";

export default function BotonEliminar({ id }: { id: string }) {
  return (
    <form
      action={eliminarPlan}
      onSubmit={(e) => {
        if (!window.confirm("¿Eliminar este plan para siempre?\n\nSe borrarán también los apuntados y los comentarios. Quedará anotado en el registro de actividad.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn-claro !border-red-700 !text-red-700 hover:!bg-red-50">
        <IconoPapelera /> Eliminar plan
      </button>
    </form>
  );
}
