-- Invitaciones individuales: cada enlace sirve para una sola persona y caduca.
alter table public.invitaciones
  add column if not exists etiqueta text not null default '' check (char_length(etiqueta) <= 60),
  add column if not exists caduca_en timestamptz,
  add column if not exists creado_por uuid references public.profiles(id) on delete set null,
  add column if not exists usado_por uuid references public.profiles(id) on delete set null,
  add column if not exists usado_en timestamptz;
alter table public.invitaciones alter column caduca_en set default (now() + interval '7 days');

create or replace function public.codigo_valido(p_codigo text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.invitaciones
    where codigo = p_codigo and activa and usado_en is null and (caduca_en is null or caduca_en > now())
  )
$$;

-- Al registrarse: exige una invitación válida, la gasta y crea el perfil.
create or replace function public.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_codigo text := new.raw_user_meta_data->>'codigo';
begin
  perform 1 from public.invitaciones
    where codigo = v_codigo and activa and usado_en is null and (caduca_en is null or caduca_en > now())
    for update;  -- bloquea la fila: dos registros a la vez no pueden gastar la misma invitación
  if not found then raise exception 'codigo_invalido'; end if;

  insert into public.profiles (id, nombre, rol)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'), ''), 'Sin nombre'), 60),
    case when exists (select 1 from public.profiles) then 'miembro' else 'propietario' end
  );

  update public.invitaciones set activa = false, usado_en = now(), usado_por = new.id where codigo = v_codigo;
  return new;
end $$;
