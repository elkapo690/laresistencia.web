-- Tema de colores que cada persona elige para su aplicación
alter table public.profiles add column if not exists tema text not null default 'lila';
grant update (tema) on public.profiles to authenticated;
