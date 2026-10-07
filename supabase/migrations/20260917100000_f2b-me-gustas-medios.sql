-- F2-B APROBADA
-- "Me gusta" en canciones y entradas de journal
-- (los me gusta de comentarios ya existen: public.comment_likes)
-- ============================================================

-- 1) Me gusta genéricos por tipo de medio
create table if not exists public.media_likes (
  id          uuid primary key default gen_random_uuid(),
  media_type  text not null check (media_type in ('song', 'journal_post')),
  media_id    uuid not null,
  visitor_key text not null,
  created_at  timestamptz not null default now(),
  unique (media_type, media_id, visitor_key)
);

create index media_likes_lookup_idx on public.media_likes(media_type, media_id);

-- Integridad por trigger (las CHECK no admiten subconsultas en Postgres)
create or replace function public.validate_media_like_target()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.media_type = 'song' then
    if not exists (select 1 from public.songs where id = new.media_id) then
      raise exception 'song % no existe', new.media_id;
    end if;
  else
    if not exists (select 1 from public.journal_posts where id = new.media_id) then
      raise exception 'journal_post % no existe', new.media_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger tg_media_like_validate
  before insert on public.media_likes
  for each row execute function public.validate_media_like_target();

grant select on public.media_likes to anon, authenticated;
grant all on public.media_likes to service_role;

alter table public.media_likes enable row level security;

create policy "media likes public read"
  on public.media_likes for select
  to anon, authenticated
  using (true);

-- 2) Contadores denormalizados (patrón igual a comment_like_count)
alter table public.songs add column if not exists like_count int not null default 0;
alter table public.journal_posts add column if not exists like_count int not null default 0;

create or replace function public.sync_media_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare _target text := new.media_type;
begin
  if tg_op = 'INSERT' then
    if _target = 'song' then
      update public.songs set like_count = like_count + 1 where id = new.media_id;
    else
      update public.journal_posts set like_count = like_count + 1 where id = new.media_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    _target := old.media_type;
    if _target = 'song' then
      update public.songs set like_count = greatest(like_count - 1, 0) where id = old.media_id;
    else
      update public.journal_posts set like_count = greatest(like_count - 1, 0) where id = old.media_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

create trigger tg_media_like_ins
  after insert on public.media_likes
  for each row execute function public.sync_media_like_count();
create trigger tg_media_like_del
  after delete on public.media_likes
  for each row execute function public.sync_media_like_count();