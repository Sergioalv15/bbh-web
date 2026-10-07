-- F2-A APROBADA
-- Comentarios seguros + base de moderación
-- Fundamenta en las tablas ya creadas en
--   20260716121909_95702766-cc0b-4829-89e3-b741d21a9d0e.sql

-- 1) Moderación: estado del comentario (mismo enum que la app:
--    'pending' / 'approved' / 'rejected' — ver music.functions.ts y CommentsManager)
alter table public.comments
  add column if not exists status text not null default 'pending'
  check (status in ('pending', 'approved', 'rejected'));

create index if not exists comments_status_idx
  on public.comments(status, created_at desc);

-- Los comentarios que YA EXISTÍAN hoy pasan a 'approved'
-- (no romper contenido previo; los nuevos entran a cola de moderación)
update public.comments set status = 'approved' where status = 'pending';

-- 2) Solamente se leen los aprobados (los pendientes/rechazados solo admin/service)
drop policy if exists "comments public read" on public.comments;
create policy "comments public read"
  on public.comments for select
  to anon, authenticated
  using (status = 'approved');

-- 3) Registro de visitantes (para límites y "mis comentarios")
create table if not exists public.visitor_keys (
  visitor_key  text primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

grant select, insert on public.visitor_keys to anon, authenticated;
grant all on public.visitor_keys to service_role;

alter table public.visitor_keys enable row level security;

-- El leído de la propia clave lo hace la app vía server function
-- (nunca una policy abierta hacia un header de cliente)
create policy "visitor keys read"
  on public.visitor_keys for select
  to anon, authenticated
  using (visitor_key is not null);

-- 4) Anti-spam: máx. 5 comentarios / hora / visitante
create or replace function public.comments_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.visitor_key is not null and (
    select count(*) from public.comments
    where visitor_key = new.visitor_key
      and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Demasiados comentarios. Inténtalo más tarde.';
  end if;
  return new;
end;
$$;

create trigger tg_comments_rate_limit
  before insert on public.comments
  for each row execute function public.comments_rate_limit();

-- 5) límite de longitud ya cubierto por los CHECK existentes (1..2000)