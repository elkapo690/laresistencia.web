import FormPlan from "@/components/FormPlan";
import { crearPlan } from "../actions";

export default function NuevoPlan() {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold tracking-tight">Nuevo plan</h1>
      <div className="tarjeta">
        <FormPlan accion={crearPlan} textoBoton="Publicar plan" />
      </div>
    </div>
  );
}
