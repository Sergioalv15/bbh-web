import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deleteJournalPost, upsertJournalPost } from "@/lib/music.functions";
import { TranslationsEditor } from "@/components/admin/TranslationsEditor";
import type { Translations } from "@/lib/i18n";
import { parseTranslations } from "@/lib/i18n";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { parseBlocks, type Block } from "@/lib/blocks.shared";
import { Plus, Trash2 } from "lucide-react";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  category: string | null;
  published: boolean;
  published_at: string;
  translations?: unknown;
  contentMode?: "text" | "blocks";
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function JournalManager() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [editing, setEditing] = useState<Partial<PostRow> | null>(null);
  const [saving, setSaving] = useState(false);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [useBlocks, setUseBlocks] = useState(false);
    const [contentMode, setContentMode] = useState<"text" | "blocks">("text");

  async function refresh() {
    const { data } = await supabase
      .from("journal_posts")
      .select("*")
      .order("published_at", { ascending: false });
    setPosts((data ?? []) as PostRow[]);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function save() {
    if (!editing?.title || !editing.slug) return alert("Se requieren título y slug");
    setSaving(true);
    try {
      await upsertJournalPost({
        data: {
          id: editing.id,
          title: editing.title,
          slug: editing.slug,
          excerpt: editing.excerpt ?? null,
          content: editing.content ?? "",
          cover_url: editing.cover_url ?? null,
          category: editing.category ?? null,
          media: [],
          published: editing.published ?? true,
          translations: parseTranslations(editing.translations) as Record<
            string,
            Record<string, string>
          >,
        },
      });
      await refresh();
      setEditing(null);
    } catch (err) {
      alert("Error: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este artículo?")) return;
    await deleteJournalPost({ data: { id } });
    await refresh();
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">
            {editing.id ? "Editar artículo" : "Nuevo artículo"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(null)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {saving ? "…" : "Publicar"}
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">
              Título
            </span>
            <input
              value={editing.title ?? ""}
              onChange={(e) =>
                setEditing((s) =>
                  s
                    ? {
                        ...s,
                        title: e.target.value,
                        slug: s.slug ? s.slug : slugify(e.target.value),
                      }
                    : s,
                )
              }
              className={cls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">
              Slug
            </span>
            <input
              value={editing.slug ?? ""}
              onChange={(e) => setEditing((s) => (s ? { ...s, slug: slugify(e.target.value) } : s))}
              className={cls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">
              Categoría
            </span>
            <input
              value={editing.category ?? ""}
              onChange={(e) => setEditing((s) => (s ? { ...s, category: e.target.value } : s))}
              className={cls}
              placeholder="Estudio, Directo, Bastidores…"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">
              Portada (URL o ruta)
            </span>
            <input
              value={editing.cover_url ?? ""}
              onChange={(e) => setEditing((s) => (s ? { ...s, cover_url: e.target.value } : s))}
              className={cls}
            />
          </label>
        </div>
        <div className="rounded-2xl border border-white/10 p-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Contenido
            </span>
            <button
              type="button"
              onClick={() => {
                if (useBlocks) {
                  setEditing((s) =>
                    s ? { ...s, content: JSON.stringify(blocks) } : s,
                  );
                }
                setUseBlocks((v) => !v);
              }}
              className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-white"
            >
              {useBlocks ? "Modo texto" : "Modo bloques (galería…)"}
            </button>
          </div>
          {useBlocks ? (
            <div className="mt-3 space-y-6">
              <div>
                <p className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Extracto
                </p>
                <textarea
                  rows={2}
                  value={editing.excerpt ?? ""}
                  onChange={(e) => setEditing((s) => (s ? { ...s, excerpt: e.target.value } : s))}
                  className={cls}
                />
              </div>
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            </div>
          ) : (
            <textarea
              rows={16}
              value={editing.content ?? ""}
              onChange={(e) => setEditing((s) => (s ? { ...s, content: e.target.value } : s))}
              className={cls}
              placeholder="Texto, se acepta Markdown ligero…"
            />
          )}
        </div>
        <div className="rounded-2xl border border-white/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Contenido (bloques visuales)
            </p>
            <button
              type="button"
              onClick={() => setEditing((s) => (s ? { ...s, contentMode: s.contentMode === "text" ? "blocks" : "text" } : s))}
              className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-white"
            >
              {editing.contentMode === "text" ? "Usar bloques" : "Usar texto"}
            </button>
          </div>
          {editing.contentMode === "blocks" ? (
            <BlockEditor
              blocks={parseBlocks(editing.content)}
              onChange={(next) =>
                setEditing((s) => (s ? { ...s, content: JSON.stringify(next) } : s))
              }
            />
          ) : (
            <textarea
              rows={16}
              value={editing.content ?? ""}
              onChange={(e) => setEditing((s) => (s ? { ...s, content: e.target.value } : s))}
              className={cls}
              placeholder="Texto, se acepta Markdown ligero…"
            />
          )}
        </div>
        <div className="rounded-2xl border border-white/10 p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Traducciones (ES / EN)
          </p>
          <TranslationsEditor
            value={parseTranslations(editing.translations)}
            onChange={(t: Translations) => setEditing((s) => (s ? { ...s, translations: t } : s))}
            fields={[
              { key: "title", label: "Título", source: editing.title ?? "" },
              { key: "excerpt", label: "Extracto", rows: 2, source: editing.excerpt ?? "" },
              { key: "content", label: "Contenido", rows: 12, source: editing.content ?? "" },
            ]}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={editing.published ?? true}
            onChange={(e) => setEditing((s) => (s ? { ...s, published: e.target.checked } : s))}
            className="size-4 accent-electric"
          />
          Publicado
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Journal</h2>
        <button
          onClick={() => setEditing({ published: true })}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          <Plus className="size-4" /> Nuevo artículo
        </button>
      </div>
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-muted-foreground">
          Todavía no hay artículos.
        </div>
      ) : (
        <ul className="divide-y divide-white/5 rounded-2xl border border-white/10">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">
                  {p.category ?? "—"} · {new Date(p.published_at).toLocaleDateString("es-ES")}
                </div>
              </div>
              <button
                onClick={() => setEditing(p)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
              >
                Editar
              </button>
              <button
                onClick={() => remove(p.id)}
                className="rounded-full border border-white/10 p-1.5 text-blood hover:bg-blood/10"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const cls =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30";
