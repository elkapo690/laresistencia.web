"use client";

import { useEffect, useState } from "react";

/** Texto que se escribe letra a letra. */
export default function Maquina({ texto, className = "" }: { texto: string; className?: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= texto.length) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setN(reducido ? texto.length : n + 1), reducido ? 0 : 70);
    return () => clearTimeout(t);
  }, [n, texto]);

  return (
    <h1 className={className} aria-label={texto}>
      <span aria-hidden>{texto.slice(0, n)}</span>
      <span aria-hidden className="ml-0.5 inline-block w-[0.08em] animate-pulse bg-tinta align-middle" style={{ height: "0.9em" }} />
    </h1>
  );
}
