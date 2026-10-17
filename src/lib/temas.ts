/** Temas de color. `tinta` es el color principal (botones, menú, texto) y el resto forman el fondo degradado. */
export type Tema = {
  clave: string;
  nombre: string;
  tinta: string;
  base: string;
  f1: string;
  f2: string;
  f3: string;
  f4: string;
};

export const TEMAS: Tema[] = [
  { clave: "lila", nombre: "Lila", tinta: "#0a0a0a", base: "#ebe8f5", f1: "#d6cdff", f2: "#ffd3e4", f3: "#c6e2ff", f4: "#ffe6c7" },
  { clave: "oceano", nombre: "Océano", tinta: "#0b1f3a", base: "#e6f0f7", f1: "#bfe0ff", f2: "#c9f1f0", f3: "#cfd8ff", f4: "#e0f5ff" },
  { clave: "bosque", nombre: "Bosque", tinta: "#0f2a1d", base: "#e8f2ec", f1: "#c7ecd3", f2: "#e3f2c1", f3: "#bfe3dc", f4: "#f3ecc8" },
  { clave: "atardecer", nombre: "Atardecer", tinta: "#4a1d0a", base: "#fbece4", f1: "#ffd2b8", f2: "#ffc4d6", f3: "#ffe3a8", f4: "#ffd9f0" },
  { clave: "rosa", nombre: "Rosa", tinta: "#3b0a2a", base: "#fbe9f1", f1: "#ffc9de", f2: "#f3c8ff", f3: "#ffdcc9", f4: "#ffd0e8" },
  { clave: "menta", nombre: "Menta", tinta: "#08302c", base: "#e6f6f3", f1: "#bff0e4", f2: "#d6f5cf", f3: "#c4e8ff", f4: "#f1f9c6" },
  { clave: "violeta", nombre: "Violeta", tinta: "#2b0f5c", base: "#ece7fb", f1: "#cbbcff", f2: "#e6b8ff", f3: "#b8c8ff", f4: "#f3c8ff" },
  { clave: "grafito", nombre: "Grafito", tinta: "#111827", base: "#eeeeee", f1: "#dcdcdc", f2: "#e8e8e8", f3: "#d0d6dc", f4: "#f2f2f2" },
];

export const TEMA_POR_DEFECTO = "lila";
export const temaDe = (clave?: string | null) => TEMAS.find((t) => t.clave === clave) ?? TEMAS[0];

/** Variables CSS de un tema (se aplican en <html>). */
export function variablesTema(t: Tema): Record<string, string> {
  return { "--tinta": t.tinta, "--fondo-base": t.base, "--fondo-1": t.f1, "--fondo-2": t.f2, "--fondo-3": t.f3, "--fondo-4": t.f4 };
}

/** Regla CSS lista para incrustar en la página. */
export function cssTema(t: Tema) {
  return `:root{${Object.entries(variablesTema(t)).map(([k, v]) => `${k}:${v}`).join(";")}}`;
}
