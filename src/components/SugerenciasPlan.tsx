"use client";

import { useEffect, useState } from "react";

const FRASES = [
  "¿Qué plan propones?",
  "Una barbacoa el sábado…",
  "Unas cañas esta noche…",
  "Una ruta en moto…",
  "Cine y palomitas…",
  "Una escapada de finde…",
];

/** Frases de ejemplo que van rotando para animar a proponer planes. */
export default function SugerenciasPlan() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % FRASES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <span key={i} className="aparecer block min-w-0 flex-1 truncate text-[15px] font-semibold text-apagado">
      {FRASES[i]}
    </span>
  );
}
