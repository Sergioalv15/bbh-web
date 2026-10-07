-- F2-C APROBADA
-- Limpieza de seguridad sobre el esquema heredado de Lovable

-- 1) Quitar el bootstrap de admin por email hardcodeado
--    (el SQL estuvo en un repo público; el admin se asignará
--     de forma explícita desde la app, no por coincidencia de email)
drop trigger if exists on_auth_user_created_grant_founder on auth.users;
drop function if exists public.grant_admin_for_founder();

-- 2) Cerrar el grifo abierto a anónimos:
--    los INSERT/DELETE directos de comentarios y 'me gusta' dejan de
--    existir en el cliente. Toda escritura pasa por server functions
--    (src/lib/comments.functions.ts) que valida identidad por cookie,
--    aplica rate-limit y respeta la cola de moderación.
drop policy if exists "anyone can create comment" on public.comments;
drop policy if exists "anyone can like" on public.comment_likes;
drop policy if exists "anyone can unlike own" on public.comment_likes;

-- 3) A partir de aquí, escrituras de comentarios/likes:
--    * service_role (server functions) → capa de confianza
--    * anon/authenticated → SOLO select de lo aprobado (RLS f2a)
--    * comment_likes pasa a lectura pública select (counts vía server fn)
grant select on public.comment_likes to anon, authenticated;
grant all on public.comment_likes to service_role;

-- 4) (Opcional) Invitación explícita de nuevo admin se hará vía
--    server function segura: insert into user_roles por service_role.