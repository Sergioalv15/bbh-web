import { useEffect, useState } from "react";
import { Heart, MessageCircle, Reply } from "lucide-react";
import {
  createComment,
  getVisitorIdentity,
  listComments,
  toggleCommentLike,
  type PublicComment,
} from "@/lib/comments.functions";
import { cn } from "@/lib/utils";

export function CommentSection({
  songId,
  postId,
  enabled,
}: {
  songId?: string;
  postId?: string;
  enabled: boolean;
}) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const results = await Promise.all([
      listComments({ data: { song_id: songId, post_id: postId } }),
      getVisitorIdentity(),
    ]);
    setComments(results[0]);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId, postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createComment({
        data: {
          song_id: songId,
          post_id: postId,
          parent_id: replyTo,
          author_name: name.trim(),
          content: content.trim(),
        },
      });
      setContent("");
      setReplyTo(null);
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar el comentario.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleLike(id: string) {
    const liked = likedIds.has(id);
    setComments((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              like_count: Math.max(c.like_count + (liked ? -1 : 1), 0),
              liked_by_me: !liked,
            }
          : c,
      ),
    );
    await toggleCommentLike({ data: { comment_id: id, liked: !liked } });
  }

  if (!enabled) {
    return (
      <div className="border-y border-white/10 py-8 text-sm text-muted-foreground">
        Los comentarios están desactivados en este contenido.
      </div>
    );
  }

  const likedIds = new Set(comments.filter((c) => c.liked_by_me).map((c) => c.id));
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (id: string) => comments.filter((c) => c.parent_id === id);

  return (
    <section className="border-t border-white/10 pt-10">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="size-5 text-electric-glow" />
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Comentarios <span className="text-muted-foreground">({comments.length})</span>
        </h2>
      </div>

      <form
        onSubmit={submit}
        className="mb-8 space-y-3 rounded-2xl border border-white/10 bg-surface/50 p-5"
      >
        {replyTo && (
          <div className="flex items-center justify-between text-xs text-electric-glow">
            <span>Respuesta a un comentario</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          maxLength={60}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribir un comentario…"
          maxLength={2000}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
        />
        {error && <p className="text-sm text-blood">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Publicar"}
          </button>
        </div>
      </form>

      {justSubmitted && (
        <div className="mb-6 rounded-xl border border-electric/30 bg-electric/10 px-4 py-3 text-sm text-electric-glow">
          ¡Gracias! Tu comentario está pendiente de moderación y se publicará tras la validación del
          equipo de BBH.
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando…</div>
      ) : topLevel.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-muted-foreground">
          Todavía no hay comentarios.
        </div>
      ) : (
        <ul className="space-y-6">
          {topLevel.map((c) => (
            <li key={c.id} className="border-b border-white/5 pb-6 last:border-0">
              <CommentCard
                c={c}
                liked={likedIds.has(c.id)}
                onLike={() => toggleLike(c.id)}
                onReply={() => setReplyTo(c.id)}
              />
              {replies(c.id).length > 0 && (
                <ul className="mt-4 space-y-4 border-l border-white/10 pl-4">
                  {replies(c.id).map((r) => (
                    <li key={r.id}>
                      <CommentCard
                        c={r}
                        liked={likedIds.has(r.id)}
                        onLike={() => toggleLike(r.id)}
                        onReply={() => setReplyTo(c.id)}
                        isReply
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CommentCard({
  c,
  liked,
  onLike,
  onReply,
  isReply,
}: {
  c: PublicComment;
  liked: boolean;
  onLike: () => void;
  onReply: () => void;
  isReply?: boolean;
}) {
  return (
    <div className={cn(isReply && "text-sm")}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display font-bold tracking-tight">{c.author_name}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {new Date(c.created_at).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-line text-foreground/90">{c.content}</p>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <button
          onClick={onLike}
          className={cn(
            "inline-flex items-center gap-1.5 hover:text-foreground",
            liked && "text-blood",
          )}
        >
          <Heart className={cn("size-3.5", liked && "fill-current")} />
          {c.like_count}
        </button>
        {!isReply && (
          <button
            onClick={onReply}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Reply className="size-3.5" /> Responder
          </button>
        )}
      </div>
    </div>
  );
}
