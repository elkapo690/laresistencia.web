-- Cada plan puede recordar de cuál es repetición ("Repetir plan").
alter table public.planes add column if not exists repite_de uuid references public.planes(id) on delete set null;
create index if not exists planes_repite_de_idx on public.planes (repite_de);
