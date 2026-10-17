-- Marca para obligar a cambiar la clave tras un restablecimiento
alter table public.profiles add column if not exists cambiar_clave boolean not null default false;
grant update (cambiar_clave) on public.profiles to authenticated;

-- Registro de acciones sobre cuentas (solo lo ven admins y propietario)
create table if not exists public.registro_cuentas (
  id bigint generated always as identity primary key,
  accion text not null check (accion in ('clave_restablecida','miembro_eliminado','rol_cambiado')),
  objetivo_nombre text not null,
  detalle text not null default '',
  usuario_id uuid references public.profiles(id) on delete set null,
  usuario_nombre text not null,
  creado_en timestamptz not null default now()
);
create index if not exists registro_cuentas_fecha_idx on public.registro_cuentas (creado_en desc);
alter table public.registro_cuentas enable row level security;
revoke all on public.registro_cuentas from anon;
revoke insert, update, delete on public.registro_cuentas from authenticated;
create policy "admins ven el registro de cuentas" on public.registro_cuentas for select to authenticated using (public.es_admin());

-- Un admin puede restablecer la clave de un miembro; el propietario, la de cualquiera.
create or replace function public.restablecer_clave(p_usuario uuid, p_clave text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_rol text; v_nombre text;
begin
  if not public.es_admin() then raise exception 'sin_permiso'; end if;
  if char_length(p_clave) < 8 then raise exception 'clave_corta'; end if;
  select rol, nombre into v_rol, v_nombre from public.profiles where id = p_usuario;
  if v_rol is null then raise exception 'no_existe'; end if;
  if v_rol <> 'miembro' and not public.es_propietario() then raise exception 'sin_permiso'; end if;

  update auth.users
    set encrypted_password = extensions.crypt(p_clave, extensions.gen_salt('bf', 10)), updated_at = now()
    where id = p_usuario;
  update public.profiles set cambiar_clave = true where id = p_usuario;
  delete from auth.sessions where user_id = p_usuario;  -- cierra sus sesiones abiertas

  insert into public.registro_cuentas (accion, objetivo_nombre, usuario_id, usuario_nombre)
  values ('clave_restablecida', v_nombre, auth.uid(), public.nombre_actor());
end $$;
revoke execute on function public.restablecer_clave(uuid, text) from public, anon;
grant execute on function public.restablecer_clave(uuid, text) to authenticated;

-- Solo el propietario elimina miembros (se borran también sus planes, comentarios y asistencias).
create or replace function public.eliminar_miembro(p_usuario uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_rol text; v_nombre text;
begin
  if not public.es_propietario() then raise exception 'solo_propietario'; end if;
  select rol, nombre into v_rol, v_nombre from public.profiles where id = p_usuario;
  if v_rol is null then raise exception 'no_existe'; end if;
  if v_rol = 'propietario' then raise exception 'no_se_puede_eliminar_al_propietario'; end if;
  insert into public.registro_cuentas (accion, objetivo_nombre, usuario_id, usuario_nombre)
  values ('miembro_eliminado', v_nombre, auth.uid(), public.nombre_actor());
  delete from auth.users where id = p_usuario;
end $$;
revoke execute on function public.eliminar_miembro(uuid) from public, anon;
grant execute on function public.eliminar_miembro(uuid) to authenticated;

-- Nombrar o quitar admins ahora también queda en el registro
create or replace function public.cambiar_rol(p_usuario uuid, p_rol text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_nombre text;
begin
  if not public.es_propietario() then raise exception 'solo_propietario'; end if;
  if p_rol not in ('admin','miembro') then raise exception 'rol_invalido'; end if;
  update public.profiles set rol = p_rol where id = p_usuario and rol <> 'propietario' returning nombre into v_nombre;
  if v_nombre is not null then
    insert into public.registro_cuentas (accion, objetivo_nombre, detalle, usuario_id, usuario_nombre)
    values ('rol_cambiado', v_nombre, p_rol, auth.uid(), public.nombre_actor());
  end if;
end $$;

-- El propietario puede quitar a cualquiera de un plan
create policy "propietario quita asistentes" on public.asistencias for delete to authenticated using (public.es_propietario());
