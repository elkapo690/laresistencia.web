const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const IconoInicio = () => (
  <svg {...base}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></svg>
);
export const IconoMas = () => (
  <svg {...base}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconoEscudo = () => (
  <svg {...base}><path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3Z" /></svg>
);
export const IconoSalir = () => (
  <svg {...base}><path d="M10 4H5v16h5" /><path d="M15 8l4 4-4 4M19 12H9" /></svg>
);
export const IconoUbicacion = () => (
  <svg {...base} width={15} height={15}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
