-- ───────── Perfil ampliado ─────────
alter table public.profiles
  add column if not exists avatar_emoji text,
  add column if not exists avatar_color text,
  add column if not exists edad smallint check (edad between 14 and 99),
  add column if not exists bio text not null default '' check (char_length(bio) <= 300),
  add column if not exists intereses text[] not null default '{}'
    check (coalesce(array_length(intereses, 1), 0) <= 12);
grant update (nombre, avatar_url, avatar_emoji, avatar_color, edad, bio, intereses)
  on public.profiles to authenticated;

-- ───────── Comentarios ─────────
create table if not exists public.comentarios (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.planes(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 1000),
  creado_en timestamptz not null default now()
);
create index if not exists comentarios_plan_idx on public.comentarios (plan_id, creado_en);
alter table public.comentarios enable row level security;
revoke all on public.comentarios from anon;
create policy "comentarios visibles" on public.comentarios for select to authenticated using (true);
create policy "comentar" on public.comentarios for insert to authenticated with check (usuario_id = auth.uid());
create policy "borrar comentario" on public.comentarios for delete to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

-- ───────── Avisos dentro de la web ─────────
create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null,
  plan_id uuid references public.planes(id) on delete cascade,
  titulo text not null,
  cuerpo text not null default '',
  leida boolean not null default false,
  push_enviado boolean not null default false,
  creado_en timestamptz not null default now()
);
create index if not exists notificaciones_usuario_idx on public.notificaciones (usuario_id, creado_en desc);
alter table public.notificaciones enable row level security;
revoke all on public.notificaciones from anon;
revoke update on public.notificaciones from authenticated;
grant update (leida) on public.notificaciones to authenticated;
create policy "ver mis avisos" on public.notificaciones for select to authenticated using (usuario_id = auth.uid());
create policy "marcar mis avisos" on public.notificaciones for update to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy "borrar mis avisos" on public.notificaciones for delete to authenticated using (usuario_id = auth.uid());

-- ───────── Suscripciones push (avisos en el móvil) ─────────
create table if not exists public.suscripciones_push (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  clave_p256dh text not null,
  clave_auth text not null,
  creado_en timestamptz not null default now()
);
alter table public.suscripciones_push enable row level security;
revoke all on public.suscripciones_push from anon;
create policy "ver mis suscripciones" on public.suscripciones_push for select to authenticated using (usuario_id = auth.uid());
create policy "crear mi suscripcion" on public.suscripciones_push for insert to authenticated with check (usuario_id = auth.uid());
create policy "borrar mi suscripcion" on public.suscripciones_push for delete to authenticated using (usuario_id = auth.uid());

-- ───────── Registro de actividad de planes ─────────
create table if not exists public.registro (
  id bigint generated always as identity primary key,
  plan_id uuid,
  plan_titulo text not null,
  accion text not null check (accion in ('creado','cancelado','reactivado','eliminado')),
  usuario_id uuid references public.profiles(id) on delete set null,
  usuario_nombre text not null,
  creado_en timestamptz not null default now()
);
create index if not exists registro_fecha_idx on public.registro (creado_en desc);
alter table public.registro enable row level security;
revoke all on public.registro from anon;
revoke insert, update, delete on public.registro from authenticated;
create policy "admins ven el registro" on public.registro for select to authenticated using (public.es_admin());

-- ───────── Borrar planes: solo propietario y admins ─────────
create policy "borrar planes" on public.planes for delete to authenticated using (public.es_admin());

-- ───────── Disparadores ─────────
create or replace function public.nombre_actor() returns text
language sql stable security definer set search_path = '' as $$
  select coalesce((select nombre from public.profiles where id = auth.uid()), 'Sistema')
$$;
revoke execute on function public.nombre_actor() from public, anon, authenticated;

create or replace function public.trg_plan_registro() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.registro (plan_id, plan_titulo, accion, usuario_id, usuario_nombre)
    values (new.id, new.titulo, 'creado', auth.uid(), public.nombre_actor());
  elsif tg_op = 'UPDATE' then
    if new.cancelado is distinct from old.cancelado then
      insert into public.registro (plan_id, plan_titulo, accion, usuario_id, usuario_nombre)
      values (new.id, new.titulo, case when new.cancelado then 'cancelado' else 'reactivado' end, auth.uid(), public.nombre_actor());
    end if;
  elsif tg_op = 'DELETE' then
    insert into public.registro (plan_id, plan_titulo, accion, usuario_id, usuario_nombre)
    values (null, old.titulo, 'eliminado', auth.uid(), public.nombre_actor());
  end if;
  return null;
end $$;
revoke execute on function public.trg_plan_registro() from public, anon, authenticated;
create trigger planes_registro after insert or update of cancelado or delete on public.planes
  for each row execute function public.trg_plan_registro();

create or replace function public.trg_plan_avisos() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_autor text;
begin
  if tg_op = 'INSERT' then
    select nombre into v_autor from public.profiles where id = new.creador_id;
    insert into public.notificaciones (usuario_id, tipo, plan_id, titulo, cuerpo)
    select p.id, 'nuevo_plan', new.id, 'Nuevo plan: ' || new.titulo, coalesce(v_autor, 'Alguien') || ' propone un plan en ' || new.lugar
    from public.profiles p where p.id <> new.creador_id;
  elsif tg_op = 'UPDATE' and new.cancelado and not old.cancelado then
    insert into public.notificaciones (usuario_id, tipo, plan_id, titulo, cuerpo)
    select a.usuario_id, 'plan_cancelado', new.id, 'Plan cancelado: ' || new.titulo, 'Se ha cancelado el plan al que te habías apuntado.'
    from public.asistencias a where a.plan_id = new.id and a.estado in ('voy','quizas') and a.usuario_id <> coalesce(auth.uid(), new.creador_id);
  end if;
  return null;
end $$;
revoke execute on function public.trg_plan_avisos() from public, anon, authenticated;
create trigger planes_avisos after insert or update of cancelado on public.planes
  for each row execute function public.trg_plan_avisos();

create or replace function public.trg_comentario_avisos() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_titulo text; v_autor text; v_creador uuid;
begin
  select titulo, creador_id into v_titulo, v_creador from public.planes where id = new.plan_id;
  select nombre into v_autor from public.profiles where id = new.usuario_id;
  insert into public.notificaciones (usuario_id, tipo, plan_id, titulo, cuerpo)
  select distinct d.usuario_id, 'comentario', new.plan_id,
         coalesce(v_autor, 'Alguien') || ' comentó en ' || v_titulo, left(new.texto, 120)
  from (
    select v_creador as usuario_id
    union select usuario_id from public.asistencias where plan_id = new.plan_id and estado in ('voy','quizas')
    union select usuario_id from public.comentarios where plan_id = new.plan_id
  ) d
  where d.usuario_id <> new.usuario_id;
  return null;
end $$;
revoke execute on function public.trg_comentario_avisos() from public, anon, authenticated;
create trigger comentarios_avisos after insert on public.comentarios
  for each row execute function public.trg_comentario_avisos();

-- ───────── Envío de avisos al móvil ─────────
-- Devuelve (y marca como enviados) los avisos recientes de un plan con las suscripciones de cada destinatario.
create or replace function public.tomar_push(p_plan uuid, p_tipo text)
returns table(endpoint text, clave_p256dh text, clave_auth text, titulo text, cuerpo text, url text)
language plpgsql security definer set search_path = '' as $$
begin
  return query
  with marcadas as (
    update public.notificaciones n set push_enviado = true
    where n.plan_id = p_plan and n.tipo = p_tipo and not n.push_enviado
      and n.creado_en > now() - interval '10 minutes' and n.usuario_id <> auth.uid()
    returning n.usuario_id, n.titulo, n.cuerpo, n.plan_id
  )
  select s.endpoint, s.clave_p256dh, s.clave_auth, m.titulo, m.cuerpo, '/planes/' || m.plan_id::text
  from marcadas m join public.suscripciones_push s on s.usuario_id = m.usuario_id;
end $$;
revoke execute on function public.tomar_push(uuid, text) from public, anon;
grant execute on function public.tomar_push(uuid, text) to authenticated;

-- ───────── Fotos de perfil ─────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "avatares visibles" on storage.objects for select to public using (bucket_id = 'avatares');
create policy "subir mi avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cambiar mi avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "borrar mi avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
