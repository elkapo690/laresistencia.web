-- Roles: propietario (control total) > admin > miembro
alter table public.profiles drop constraint if exists profiles_rol_check;
alter table public.profiles add constraint profiles_rol_check check (rol in ('propietario','admin','miembro'));

-- Quien se registró primero pasa a ser el propietario
update public.profiles set rol = 'propietario'
where id = (select id from public.profiles order by creado_en limit 1);

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin','propietario'))
$$;

create or replace function public.es_propietario() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and rol = 'propietario')
$$;
revoke execute on function public.es_propietario() from public, anon;
grant execute on function public.es_propietario() to authenticated;

-- El primer usuario del sistema es el propietario
create or replace function public.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from public.invitaciones
    where codigo = new.raw_user_meta_data->>'codigo' and activa
  ) then
    raise exception 'codigo_invalido';
  end if;
  insert into public.profiles (id, nombre, rol)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'), ''), 'Sin nombre'), 60),
    case when exists (select 1 from public.profiles) then 'miembro' else 'propietario' end
  );
  return new;
end $$;

-- Solo el propietario nombra o quita administradores
create or replace function public.cambiar_rol(p_usuario uuid, p_rol text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_propietario() then raise exception 'solo_propietario'; end if;
  if p_rol not in ('admin','miembro') then raise exception 'rol_invalido'; end if;
  update public.profiles set rol = p_rol where id = p_usuario and rol <> 'propietario';
end $$;
revoke execute on function public.cambiar_rol(uuid, text) from public, anon;
grant execute on function public.cambiar_rol(uuid, text) to authenticated;

-- Cancelar o reactivar un plan: su creador, un admin o el propietario
create or replace function public.cancelar_plan(p_plan uuid, p_cancelado boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not (
    public.es_admin()
    or exists (select 1 from public.planes where id = p_plan and creador_id = auth.uid())
  ) then raise exception 'sin_permiso'; end if;
  update public.planes set cancelado = p_cancelado where id = p_plan;
end $$;
revoke execute on function public.cancelar_plan(uuid, boolean) from public, anon;
grant execute on function public.cancelar_plan(uuid, boolean) to authenticated;

-- Editar un plan: su creador o el propietario
drop policy if exists "editar mis planes" on public.planes;
drop policy if exists "editar planes" on public.planes;
create policy "editar planes" on public.planes for update to authenticated
  using (creador_id = auth.uid() or public.es_propietario())
  with check (creador_id = auth.uid() or public.es_propietario());
