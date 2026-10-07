import { parseBlocks } from "@/lib/blocks.shared";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

/**
 * Público: renderiza el contenido de un artículo como bloques (galería visual,
 * headings, texto, imagen, vídeo, quote, cta, embed). Si el contenido no es
 * JSON de bloques (posts legacy con texto plano / Markdown) usa un fallback
 * de texto conservador sin parsear nada.
 */
export function JournalBlocks({
  content,
  excerpt,
}: {
  content: string;
  excerpt?: string | null;
}) {
  const blocks = parseBlocks(safeJson(content));
  const hasBlocks = blocks.length > 0;

  if (hasBlocks) {
    return <BlockRenderer blocks={blocks} />;
  }

  return (
    <div className="space-y-5">
      {excerpt ? (
        <p className="font-display text-xl leading-relaxed text-muted-foreground sm:text-2xl">
          {excerpt}
        </p>
      ) : null}
      <div className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
        {content}
      </div>
    </div>
  );
}

function safeJson(raw: string): unknown {
  if (!raw) return [];
  const t = raw.trim();
  if (!t.startsWith("[") && !t.startsWith("{")) return [];
  try {
    return JSON.parse(t);
  } catch {
    return [];
  }
}
