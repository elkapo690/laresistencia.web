-- La Resistencia · esquema inicial
create extension if not exists pgcrypto;

-- ───────── Tablas ─────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 60),
  avatar_url text,
  rol text not null default 'miembro' check (rol in ('admin','miembro')),
  creado_en timestamptz not null default now()
);

create table public.invitaciones (
  codigo text primary key default encode(gen_random_bytes(8), 'hex'),
  activa boolean not null default true,
  creado_en timestamptz not null default now()
);

create table public.planes (
  id uuid primary key default gen_random_uuid(),
  creador_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 120),
  descripcion text not null default '' check (char_length(descripcion) <= 2000),
  categoria text not null default 'otro',
  inicio timestamptz not null,
  lugar text not null check (char_length(lugar) between 1 and 200),
  aforo integer not null check (aforo between 1 and 500),
  coste_por_persona numeric(8,2) not null default 0 check (coste_por_persona >= 0),
  cancelado boolean not null default false,
  creado_en timestamptz not null default now()
);
create index planes_inicio_idx on public.planes (inicio);

create table public.asistencias (
  plan_id uuid not null references public.planes(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  estado text not null check (estado in ('voy','quizas','no')),
  invitados text[] not null default '{}'
    check (coalesce(array_length(invitados, 1), 0) <= 2),
  actualizado_en timestamptz not null default now(),
  primary key (plan_id, usuario_id)
);

-- ───────── Funciones ─────────
create function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin')
$$;
revoke execute on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

create function public.codigo_valido(p_codigo text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.invitaciones where codigo = p_codigo and activa)
$$;
grant execute on function public.codigo_valido(text) to anon, authenticated;

-- Al registrarse: exige código de invitación válido y crea el perfil.
-- El primer usuario del sistema queda como admin.
create function public.nuevo_usuario() returns trigger
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
    case when exists (select 1 from public.profiles) then 'miembro' else 'admin' end
  );
  return new;
end $$;
revoke execute on function public.nuevo_usuario() from public, anon, authenticated;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.nuevo_usuario();

-- El aforo cuenta a la persona + sus invitados.
create function public.comprobar_aforo() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_aforo int; v_ocupadas int;
begin
  if new.estado <> 'voy' then return new; end if;
  select aforo into v_aforo from public.planes where id = new.plan_id for update;
  select coalesce(sum(1 + coalesce(array_length(invitados, 1), 0)), 0) into v_ocupadas
    from public.asistencias
    where plan_id = new.plan_id and estado = 'voy' and usuario_id <> new.usuario_id;
  if v_ocupadas + 1 + coalesce(array_length(new.invitados, 1), 0) > v_aforo then
    raise exception 'plan_completo';
  end if;
  return new;
end $$;
revoke execute on function public.comprobar_aforo() from public, anon, authenticated;
create trigger asistencias_aforo
  before insert or update on public.asistencias
  for each row execute function public.comprobar_aforo();

create function public.comprobar_aforo_plan() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_ocupadas int;
begin
  if new.aforo < old.aforo then
    select coalesce(sum(1 + coalesce(array_length(invitados, 1), 0)), 0) into v_ocupadas
      from public.asistencias where plan_id = new.id and estado = 'voy';
    if new.aforo < v_ocupadas then raise exception 'aforo_insuficiente'; end if;
  end if;
  return new;
end $$;
revoke execute on function public.comprobar_aforo_plan() from public, anon, authenticated;
create trigger planes_aforo
  before update of aforo on public.planes
  for each row execute function public.comprobar_aforo_plan();

-- ───────── Seguridad (RLS) ─────────
alter table public.profiles enable row level security;
alter table public.invitaciones enable row level security;
alter table public.planes enable row level security;
alter table public.asistencias enable row level security;

revoke all on public.profiles, public.invitaciones, public.planes, public.asistencias from anon;
-- Nadie puede cambiarse el rol a sí mismo.
revoke update on public.profiles from authenticated;
grant update (nombre, avatar_url) on public.profiles to authenticated;

create policy "perfiles visibles" on public.profiles for select to authenticated using (true);
create policy "editar mi perfil" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "admin ve invitaciones" on public.invitaciones for select to authenticated using (public.es_admin());
create policy "admin crea invitaciones" on public.invitaciones for insert to authenticated with check (public.es_admin());
create policy "admin edita invitaciones" on public.invitaciones for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "planes visibles" on public.planes for select to authenticated using (true);
create policy "crear mis planes" on public.planes for insert to authenticated with check (creador_id = auth.uid());
create policy "editar mis planes" on public.planes for update to authenticated
  using (creador_id = auth.uid()) with check (creador_id = auth.uid());

create policy "asistencias visibles" on public.asistencias for select to authenticated using (true);
create policy "apuntarme" on public.asistencias for insert to authenticated with check (usuario_id = auth.uid());
create policy "cambiar mi asistencia" on public.asistencias for update to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy "borrar mi asistencia" on public.asistencias for delete to authenticated using (usuario_id = auth.uid());

-- Primer código de invitación (enlace para el grupo de WhatsApp)
insert into public.invitaciones default values;
