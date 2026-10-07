import { useEffect, useState } from "react";
import { adminListEvents, upsertEvent, deleteEvent, duplicateEvent } from "@/lib/events.functions";
import {
  EVENT_TYPES,
  EVENT_STATUSES,
  slugify,
  isValidSlug,
  formatEventDate,
  type EventRecord,
} from "@/lib/events.shared";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { MediaField } from "@/components/admin/MediaPicker";
import { TranslationsEditor } from "@/components/admin/TranslationsEditor";
import type { Translations } from "@/lib/i18n";

import type { Block } from "@/lib/blocks.shared";
import { Plus, Trash2, Copy, ExternalLink } from "lucide-react";

const empty: Partial<EventRecord> = {
  slug: "",
  title: "",
  short_description: "",
  full_description: "",
  event_type: "concert",
  status: "upcoming",
  featured: false,
  start_date: null,
  end_date: null,
  start_time: "",
  end_time: "",
  venue_name: "",
  address: "",
  city: "",
  postal_code: "",
  country: "FR",
  ticket_price: null,
  currency: "EUR",
  is_free: false,
  ticket_url: "",
  main_image: "",
  image_alt: "",
  artists: [],
  organizer: "BBH Association",
  partners: [],
  contact_email: "",
  contact_phone: "",
  cta_label: "",
  cta_url: "",
  seo_title: "",
  seo_description: "",
  ai_summary: "",
  noindex: false,
  published: false,
  sort_order: 100,
  blocks: [],
  hero_video: "",
  hero_video_poster: "",
};

const field =
  "w-full rounded-xl border border-white/10 bg-background px-4 py-2.5 text-sm outline-none transition focus:border-electric/50";
const label = "text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground";

export function EventsManager() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [editing, setEditing] = useState<Partial<EventRecord> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh() {
    try {
      setEvents(await adminListEvents());
    } catch (err) {
      setError((err as Error).message);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  function set<K extends keyof EventRecord>(key: K, value: EventRecord[K]) {
    setEditing((prev) => ({ ...(prev ?? {}), [key]: value }));
  }

  async function save() {
    if (!editing) return;
    setError(null);
    if (!editing.title?.trim()) return setError("El título es obligatorio.");
    const slug = editing.slug?.trim() || slugify(editing.title);
    if (!isValidSlug(slug))
      return setError("El enlace (slug) solo debe contener minúsculas, números y guiones.");

    setSaving(true);
    try {
      await upsertEvent({
        data: {
          ...(empty as Record<string, unknown>),
          ...(editing as Record<string, unknown>),
          slug,
          gallery: editing.gallery ?? [],
          blocks: editing.blocks ?? [],
          hero_video: editing.hero_video ?? "",
          hero_video_poster: editing.hero_video_poster ?? "",
          social_links: editing.social_links ?? [],
          artists: editing.artists ?? [],
          partners: editing.partners ?? [],
          translations: editing.translations ?? {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      setNotice("Evento guardado.");
      setEditing(null);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar definitivamente este evento?")) return;
    try {
      await deleteEvent({ data: { id } });
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function duplicate(id: string) {
    try {
      await duplicateEvent({ data: { id } });
      setNotice("Borrador creado.");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tighter">Eventos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea, publica y actualiza los eventos mostrados en el sitio.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-full bg-electric px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
        >
          <Plus className="size-4" /> Nuevo evento
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {notice && !error && (
        <p className="rounded-xl border border-electric/30 bg-electric/10 px-4 py-3 text-sm text-electric-glow">
          {notice}
        </p>
      )}

      {editing && (
        <div className="space-y-5 rounded-3xl border border-white/10 bg-surface/60 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className={label}>Título *</p>
              <input
                className={`${field} mt-2`}
                value={editing.title ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setEditing((prev) => ({
                    ...(prev ?? {}),
                    title: v,
                    slug: prev?.id ? prev.slug : slugify(v),
                  }));
                }}
              />
            </div>
            <div>
              <p className={label}>Enlace (slug)</p>
              <input
                className={`${field} mt-2`}
                value={editing.slug ?? ""}
                onChange={(e) => set("slug", slugify(e.target.value))}
              />
            </div>
            <div>
              <p className={label}>Type</p>
              <select
                className={`${field} mt-2`}
                value={editing.event_type ?? "concert"}
                onChange={(e) => set("event_type", e.target.value)}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className={label}>Estado</p>
              <select
                className={`${field} mt-2`}
                value={editing.status ?? "upcoming"}
                onChange={(e) => set("status", e.target.value)}
              >
                {EVENT_STATUSES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className={label}>Fecha de inicio</p>
              <input
                type="date"
                className={`${field} mt-2`}
                value={editing.start_date ?? ""}
                onChange={(e) => set("start_date", e.target.value || null)}
              />
            </div>
            <div>
              <p className={label}>Fecha de fin</p>
              <input
                type="date"
                className={`${field} mt-2`}
                value={editing.end_date ?? ""}
                onChange={(e) => set("end_date", e.target.value || null)}
              />
            </div>
            <div>
              <p className={label}>Hora de inicio</p>
              <input
                className={`${field} mt-2`}
                placeholder="20:00"
                value={editing.start_time ?? ""}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div>
              <p className={label}>Hora de fin</p>
              <input
                className={`${field} mt-2`}
                placeholder="23:30"
                value={editing.end_time ?? ""}
                onChange={(e) => set("end_time", e.target.value)}
              />
            </div>
            <div>
              <p className={label}>Lugar</p>
              <input
                className={`${field} mt-2`}
                value={editing.venue_name ?? ""}
                onChange={(e) => set("venue_name", e.target.value)}
              />
            </div>
            <div>
              <p className={label}>Ciudad</p>
              <input
                className={`${field} mt-2`}
                value={editing.city ?? ""}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div>
              <p className={label}>Dirección</p>
              <input
                className={`${field} mt-2`}
                value={editing.address ?? ""}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
            <div>
              <p className={label}>Código postal</p>
              <input
                className={`${field} mt-2`}
                value={editing.postal_code ?? ""}
                onChange={(e) => set("postal_code", e.target.value)}
              />
            </div>
            <div>
              <p className={label}>Precio (€) — vacío si no está definido</p>
              <input
                type="number"
                step="0.01"
                className={`${field} mt-2`}
                value={editing.ticket_price ?? ""}
                onChange={(e) =>
                  set("ticket_price", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
            <div>
              <p className={label}>Enlace de venta de entradas</p>
              <input
                className={`${field} mt-2`}
                placeholder="https://…"
                value={editing.ticket_url ?? ""}
                onChange={(e) => set("ticket_url", e.target.value)}
              />
            </div>
            <div>
              <p className={label}>Artistas (separados por comas)</p>
              <input
                className={`${field} mt-2`}
                value={(editing.artists ?? []).join(", ")}
                onChange={(e) =>
                  set(
                    "artists",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
            </div>
            <div>
              <p className={label}>Partners (separados por comas)</p>
              <input
                className={`${field} mt-2`}
                value={(editing.partners ?? []).join(", ")}
                onChange={(e) =>
                  set(
                    "partners",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
            </div>
            <div>
              <p className={label}>Correo de contacto</p>
              <input
                className={`${field} mt-2`}
                value={editing.contact_email ?? ""}
                onChange={(e) => set("contact_email", e.target.value)}
              />
            </div>
            <div>
              <p className={label}>Orden de visualización</p>
              <input
                type="number"
                className={`${field} mt-2`}
                value={editing.sort_order ?? 100}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <p className={label}>Resumen breve (listado)</p>
            <textarea
              rows={2}
              className={`${field} mt-2`}
              value={editing.short_description ?? ""}
              onChange={(e) => set("short_description", e.target.value)}
            />
          </div>
          <div>
            <p className={label}>Descripción completa</p>
            <textarea
              rows={6}
              className={`${field} mt-2`}
              value={editing.full_description ?? ""}
              onChange={(e) => set("full_description", e.target.value)}
            />
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/40 p-5">
            <p className={label}>Traducciones (ES / EN)</p>
            <div className="mt-3">
              <TranslationsEditor
                value={(editing.translations ?? {}) as Translations}
                onChange={(t: Translations) => set("translations", t as never)}
                fields={[
                  { key: "title", label: "Título", source: editing.title ?? "" },
                  {
                    key: "short_description",
                    label: "Descripción corta",
                    rows: 3,
                    source: editing.short_description ?? "",
                  },
                  {
                    key: "full_description",
                    label: "Descripción completa",
                    rows: 6,
                    source: editing.full_description ?? "",
                  },
                ]}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/40 p-5">
            <MediaField
              kind="video"
              label="Vídeo de portada (MP4, opcional)"
              value={editing.hero_video ?? ""}
              poster={editing.hero_video_poster ?? ""}
              onChange={(m) =>
                setEditing((prev) => ({
                  ...(prev ?? {}),
                  hero_video: m.path,
                  hero_video_poster: m.posterPath,
                }))
              }
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/40 p-5">
            <BlockEditor
              blocks={(editing.blocks ?? []) as Block[]}
              onChange={(next) => set("blocks", next)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className={label}>Título SEO</p>
              <input
                className={`${field} mt-2`}
                value={editing.seo_title ?? ""}
                onChange={(e) => set("seo_title", e.target.value)}
              />
            </div>
            <div>
              <p className={label}>Descripción SEO</p>
              <input
                className={`${field} mt-2`}
                value={editing.seo_description ?? ""}
                onChange={(e) => set("seo_description", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-5 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.published ?? false}
                onChange={(e) => set("published", e.target.checked)}
              />
              Publicado
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.featured ?? false}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Destacado
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.is_free ?? false}
                onChange={(e) => set("is_free", e.target.checked)}
              />
              Entrada libre
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.noindex ?? false}
                onChange={(e) => set("noindex", e.target.checked)}
              />
              Ocultar a los motores de búsqueda
            </label>
          </div>

          <div className="flex gap-3">
            <button
              disabled={saving}
              onClick={save}
              className="rounded-full bg-electric px-6 py-2.5 text-sm font-semibold text-background disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="rounded-full border border-white/10 px-6 py-2.5 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-surface/40 p-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-bold tracking-tight">{e.title}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                    e.published
                      ? "bg-electric/15 text-electric-glow"
                      : "bg-white/10 text-muted-foreground"
                  }`}
                >
                  {e.published ? "Publicado" : "Borrador"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                /{e.slug} · {formatEventDate(e.start_date) || "fecha por definir"} ·{" "}
                {e.city || "lugar por definir"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/evenements/${e.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver ${e.title}`}
                className="grid size-9 place-items-center rounded-full border border-white/10 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-4" />
              </a>
              <button
                onClick={() => duplicate(e.id)}
                aria-label={`Duplicar ${e.title}`}
                className="grid size-9 place-items-center rounded-full border border-white/10 text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-4" />
              </button>
              <button
                onClick={() => setEditing(e)}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold"
              >
                Editar
              </button>
              <button
                onClick={() => remove(e.id)}
                aria-label={`Eliminar ${e.title}`}
                className="grid size-9 place-items-center rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay ningún evento por el momento.</p>
        )}
      </div>
    </div>
  );
}
