import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getMediaLikes, toggleMediaLike } from "@/lib/comments.functions";
import { cn } from "@/lib/utils";

export function MediaLikeButton({
  mediaType,
  mediaId,
}: {
  mediaType: "song" | "journal_post";
  mediaId: string;
}) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getMediaLikes({ data: { media_type: mediaType, media_id: mediaId } }).then((r) => {
      if (!alive) return;
      setCount(r.count);
      setLiked(r.liked_by_me);
    });
    return () => {
      alive = false;
    };
  }, [mediaType, mediaId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(c + (next ? 1 : -1), 0));
    try {
      await toggleMediaLike({ data: { media_type: mediaType, media_id: mediaId, liked: next } });
    } catch {
      setLiked(!next);
      setCount((c) => Math.max(c + (next ? -1 : 1), 0));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm transition",
        liked
          ? "border-electric bg-electric/15 text-electric-glow"
          : "border-white/15 hover:bg-white/5",
        busy && "opacity-60",
      )}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {count > 0 ? `Me gusta (${count})` : "Me gusta"}
    </button>
  );
}
