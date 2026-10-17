"use client";

import { useActionState, useRef, useState } from "react";
import Avatar from "./Avatar";
import { guardarFoto, guardarPerfil } from "@/app/(app)/perfil/actions";
import { createClient } from "@/lib/supabase/client";
import { AVATARES_EMOJI, COLORES_AVATAR, INTERESES, MAX_INTERESES } from "@/lib/perfil";

type Props = {
  uid: string;
  nombre: string;
  edad: number | null;
  bio: string;
  intereses: string[];
  avatarUrl: string | null;
  avatarEmoji: string | null;
  avatarColor: string | null;
};

/** Recorta al cuadrado y reduce a 256 px (unos 15 KB) para que la web cargue rápido y gaste poco. */
async function reducir(archivo: File): Promise<Blob> {
  const img = await createImageBitmap(archivo);
  const lado = Math.min(img.width, img.height);
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = 256;
  lienzo.getContext("2d")!.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 256, 256);
  return new Promise((ok, fallo) => lienzo.toBlob((b) => (b ? ok(b) : fallo(new Error("sin imagen"))), "image/jpeg", 0.82));
}

export default function FormPerfil(p: Props) {
  const [estado, enviar, pendiente] = useActionState(guardarPerfil, undefined);
  const [foto, setFoto] = useState(p.avatarUrl);
  const [emoji, setEmoji] = useState(p.avatarEmoji ?? "");
  const [color, setColor] = useState(p.avatarColor ?? "");
  const [elegidos, setElegidos] = useState<string[]>(p.intereses);
  const [subiendo, setSubiendo] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function alElegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setErrorFoto("");
    setSubiendo(true);
    try {
      const blob = await reducir(archivo);
      const supabase = createClient();
      const ruta = `${p.uid}/avatar.jpg`;
      const { error } = await supabase.storage.from("avatares").upload(ruta, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "31536000" });
      if (error) throw error;
      const url = `${supabase.storage.from("avatares").getPublicUrl(ruta).data.publicUrl}?v=${Date.now()}`;
      const r = await guardarFoto(url);
      if (r.error) throw new Error(r.error);
      setFoto(url);
    } catch {
      setErrorFoto("No se ha podido subir la foto. Prueba con otra imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  async function quitarFoto() {
    setErrorFoto("");
    const r = await guardarFoto(null);
    if (r.error) return setErrorFoto(r.error);
    setFoto(null);
  }

  const alternar = (v: string) =>
    setElegidos((a) => (a.includes(v) ? a.filter((x) => x !== v) : a.length >= MAX_INTERESES ? a : [...a, v]));

  return (
    <form action={enviar} className="space-y-6">
      <section className="tarjeta space-y-4">
        <h2 className="text-lg font-extrabold">Tu foto o avatar</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar perfil={{ nombre: p.nombre, avatar_url: foto, avatar_emoji: emoji || null, avatar_color: color || null }} tam={96} anillo />
          <div className="space-y-2">
            <input ref={input} type="file" accept="image/*" className="sr-only" onChange={alElegirFoto} aria-label="Subir foto" />
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn !py-2" disabled={subiendo} onClick={() => input.current?.click()}>
                {subiendo ? "Subiendo…" : foto ? "Cambiar foto" : "Subir foto"}
              </button>
              {foto && <button type="button" className="btn-claro !py-2" onClick={quitarFoto}>Quitar foto</button>}
            </div>
            <p className="text-xs text-apagado">La foto se guarda al momento. Sin foto, se usa el avatar de abajo.</p>
            {errorFoto && <p role="alert" className="text-sm font-semibold text-red-700">{errorFoto}</p>}
          </div>
        </div>

        <input type="hidden" name="avatar_emoji" value={emoji} />
        <input type="hidden" name="avatar_color" value={color} />
        <div>
          <p className="etiqueta">Avatar</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setEmoji("")} className={`h-11 rounded-full px-4 text-sm font-bold ${emoji === "" ? "bg-tinta text-white" : "bg-white"}`}>Inicial</button>
            {AVATARES_EMOJI.map((e) => (
              <button key={e} type="button" aria-label={`Avatar ${e}`} aria-pressed={emoji === e} onClick={() => setEmoji(e)} className={`h-11 w-11 rounded-full text-xl ${emoji === e ? "bg-tinta" : "bg-white"}`}>{e}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="etiqueta">Color de fondo</p>
          <div className="flex flex-wrap gap-2">
            {COLORES_AVATAR.map((c) => (
              <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={color === c} onClick={() => setColor(color === c ? "" : c)} className={`h-9 w-9 rounded-full border-2 ${color === c ? "border-tinta" : "border-white"}`} style={{ background: c }} />
            ))}
          </div>
        </div>
      </section>

      <section className="tarjeta space-y-4">
        <h2 className="text-lg font-extrabold">Sobre ti</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <div>
            <label className="etiqueta" htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" required maxLength={60} defaultValue={p.nombre} className="campo" />
          </div>
          <div>
            <label className="etiqueta" htmlFor="edad">Edad</label>
            <input id="edad" name="edad" type="number" inputMode="numeric" min={14} max={99} defaultValue={p.edad ?? ""} className="campo" placeholder="—" />
          </div>
        </div>
        <div>
          <label className="etiqueta" htmlFor="bio">Cuéntanos algo de ti</label>
          <textarea id="bio" name="bio" rows={3} maxLength={300} defaultValue={p.bio} className="campo" placeholder="A qué te dedicas, qué buscas en la resistencia…" />
        </div>
      </section>

      <section className="tarjeta space-y-3">
        <div>
          <h2 className="text-lg font-extrabold">Tus gustos</h2>
          <p className="text-sm text-apagado">Elige hasta {MAX_INTERESES}. Así los demás saben con quién tienen cosas en común. ({elegidos.length}/{MAX_INTERESES})</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {INTERESES.map((i) => {
            const activo = elegidos.includes(i.valor);
            return (
              <label key={i.valor} className={`cursor-pointer rounded-full border-2 border-transparent px-4 py-2 text-sm font-bold transition ${activo ? "bg-tinta text-white" : "border-2 border-tinta/10 bg-white hover:border-tinta/30"}`}>
                <input type="checkbox" name="intereses" value={i.valor} checked={activo} onChange={() => alternar(i.valor)} className="sr-only" />
                <span aria-hidden>{i.emoji}</span> {i.etiqueta}
              </label>
            );
          })}
        </div>
      </section>

      {estado?.error && <p role="alert" className="text-sm font-semibold text-red-700">{estado.error}</p>}
      {estado?.ok && <p role="status" className="text-sm font-semibold">{estado.ok}</p>}
      <button className="btn w-full sm:w-auto" disabled={pendiente}>{pendiente ? "Guardando…" : "Guardar perfil"}</button>
    </form>
  );
}
