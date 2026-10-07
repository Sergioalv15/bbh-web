import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/auth/server";

const VISITOR_COOKIE = "bbh_visitor";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CommentStatus = "pending" | "approved" | "rejected";

export type PublicComment = {
  id: string;
  parent_id: string | null;
  author_name: string;
  content: string;
  like_count: number;
  created_at: string;
  liked_by_me: boolean;
};

function ensureVisitorKey(): string {
  const existing = getCookie(VISITOR_COOKIE);
  if (existing && UUID_RE.test(existing)) return existing;
  const key = randomUUID();
  setCookie(VISITOR_COOKIE, key, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return key;
}

function readVisitorKey(): string | null {
  const existing = getCookie(VISITOR_COOKIE);
  return existing && UUID_RE.test(existing) ? existing : null;
}

/** Public: identidad del visitante actual (cookie segura, 1 año). */
export const getVisitorIdentity = createServerFn({ method: "GET" }).handler(async () => {
  return { visitor_key: ensureVisitorKey() };
});

/** Public: comentarios aprobados de una canción o entrada + los que "me gustan". */
export const listComments = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        song_id: z.string().uuid().nullable().optional(),
        post_id: z.string().uuid().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { song_id, post_id } = data;
    const visitorKey = readVisitorKey();

    let query = supabaseAdmin
      .from("comments")
      .select("id, parent_id, author_name, content, like_count, created_at")
      .eq("status", "approved");

    if (song_id) query = query.eq("song_id", song_id);
    if (post_id) query = query.eq("post_id", post_id);

    query = query.order("created_at", { ascending: true });

    const { data: rows } = await query;
    const comments = (rows ?? []) as Omit<PublicComment, "liked_by_me">[];

    let liked = new Set<string>();
    if (visitorKey && comments.length > 0) {
      const { data: likes } = await supabaseAdmin
        .from("comment_likes")
        .select("comment_id")
        .eq("visitor_key", visitorKey)
        .in(
          "comment_id",
          comments.map((c) => c.id),
        );
      liked = new Set((likes ?? []).map((l) => (l as { comment_id: string }).comment_id));
    }

    return comments.map((c) => ({ ...c, liked_by_me: liked.has(c.id) }));
  });

/** Public: crear comentario (entra en cola de moderación). */
export const createComment = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        song_id: z.string().uuid().nullable().optional(),
        post_id: z.string().uuid().nullable().optional(),
        parent_id: z.string().uuid().nullable().optional(),
        author_name: z.string().trim().min(1).max(60),
        content: z.string().trim().min(1).max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if ((data.song_id ? 1 : 0) + (data.post_id ? 1 : 0) !== 1) {
      throw new Error("Indique una canción o una entrada de journal, no ambas.");
    }
    const visitorKey = ensureVisitorKey();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("visitor_key", visitorKey)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if ((count ?? 0) >= 5) {
      throw new Error("Haz superado el límite de comentarios por hora.");
    }

    const row = {
      song_id: data.song_id ?? null,
      post_id: data.post_id ?? null,
      parent_id: data.parent_id ?? null,
      author_name: data.author_name,
      content: data.content,
      visitor_key: visitorKey,
      status: "pending" as CommentStatus,
    };

    const { error } = await supabaseAdmin.from("comments").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Public: dar/quitar "me gusta" a un comentario (sin crear identidad de paso). */
export const toggleCommentLike = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ comment_id: z.string().uuid(), liked: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    const visitorKey = readVisitorKey();
    if (!visitorKey) throw new Error("Use un comentario existente para interactuar.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.liked) {
      const { error } = await supabaseAdmin
        .from("comment_likes")
        .insert({ comment_id: data.comment_id, visitor_key: visitorKey });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("comment_likes")
        .delete()
        .eq("comment_id", data.comment_id)
        .eq("visitor_key", visitorKey);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/** Public: me gusta en canciones / entradas de journal. */
export const getMediaLikes = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({ media_type: z.enum(["song", "journal_post"]), media_id: z.string().uuid() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const visitorKey = readVisitorKey();

    const { count } = await supabaseAdmin
      .from("media_likes")
      .select("visitor_key", { count: "exact", head: true })
      .eq("media_type", data.media_type)
      .eq("media_id", data.media_id);

    let likedByMe = false;
    if (visitorKey) {
      const { data: mine } = await supabaseAdmin
        .from("media_likes")
        .select("visitor_key")
        .eq("media_type", data.media_type)
        .eq("media_id", data.media_id)
        .eq("visitor_key", visitorKey)
        .maybeSingle();
      likedByMe = !!mine;
    }

    return { count: count ?? 0, liked_by_me: likedByMe };
  });

export const toggleMediaLike = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        media_type: z.enum(["song", "journal_post"]),
        media_id: z.string().uuid(),
        liked: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const visitorKey = readVisitorKey();
    if (!visitorKey) throw new Error("Identidad de visitante no disponible.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.liked) {
      const { error } = await supabaseAdmin
        .from("media_likes")
        .insert({ media_type: data.media_type, media_id: data.media_id, visitor_key: visitorKey });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("media_likes")
        .delete()
        .eq("media_type", data.media_type)
        .eq("media_id", data.media_id)
        .eq("visitor_key", visitorKey);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/** Admin: cola de moderación de comentarios. */
export const adminListComments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ status: z.enum(["pending", "approved", "rejected"]).optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin
      .from("comments")
      .select("id, song_id, post_id, author_name, content, status, created_at, songs(title, slug)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status) query = query.eq("status", data.status);
    const { data: rows } = await query;
    return (rows ?? []) as {
      id: string;
      song_id: string | null;
      post_id: string | null;
      author_name: string;
      content: string;
      status: CommentStatus;
      created_at: string;
      songs: { title: string; slug: string } | null;
    }[];
  });
