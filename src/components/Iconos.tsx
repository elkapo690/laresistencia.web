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
export const IconoUsuarios = () => (
  <svg {...base}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.200-5.500 6.500-5.500s5.900 2 6.500 5.500" /><path d="M16 4.500a3.500 3.500 0 0 1 0 7M18 14.800c2 .7 3.200 2.500 3.500 5.200" /></svg>
);
export const IconoCampana = () => (
  <svg {...base}><path d="M6 9a6 6 0 1 1 12 0c0 6 2.500 7.500 2.500 7.500h-17S6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
);
export const IconoPerfil = () => (
  <svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4 4-6 8-6s7.200 2 8 6" /></svg>
);
export const IconoCalendario = () => (
  <svg {...base} width={18} height={18}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);
export const IconoPapelera = () => (
  <svg {...base} width={18} height={18}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);
