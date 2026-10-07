import { optimizeImage } from "@/lib/image-optimize";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  createSiteImageUploadUrl,
  resetSiteImage,
  upsertSiteImage,
  mediaUrl,
} from "@/lib/site-images.functions";
import {
  MEDIA_ANCHORS,
  MEDIA_GROUPS,
  MEDIA_SLOTS,
  type MediaGroupKey,
  type MediaSlotDef,
} from "@/lib/media-slots";
import { Loader2, UploadCloud, RotateCcw, ImageIcon, Check, Trash2 } from "lucide-react";

type Row = {
  slot: string;
  storage_path: string;
  alt_text: string;
  title: string;
  caption: string;
  object_position: string;
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const BRAND_EXTRA_MIME = ["image/svg+xml"];
const MAX_BYTES = 8 * 1024 * 1024;

export function MediaManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<MediaGroupKey>("accueil");
  const queryClient = useQueryClient();

  async function refresh() {
    const { data, error } = await supabase
      .from("site_images")
      .select("slot, storage_path, alt_text, title, caption, object_position");
    if (error) {
      toast.error("No se pueden cargar los medios: " + error.message);
      setLoading(false);
      return;
    }
    setRows((data ?? []) as Row[]);
    setLoading(false);
    queryClient.invalidateQueries({ queryKey: ["site-images"] });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const m = new Map<MediaGroupKey, number>();
    for (const def of MEDIA_SLOTS) {
      if (rows.some((r) => r.slot === def.slot)) {
        m.set(def.group, (m.get(def.group) ?? 0) + 1);
      }
    }
    return m;
  }, [rows]);

  if (loading && rows.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando…
      </div>
    );
  }

  const groupDef = MEDIA_GROUPS.find((g) => g.key === group)!;
  const slots = MEDIA_SLOTS.filter((s) => s.group === group);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Gestión de medios</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Todas las imágenes del sitio, organizadas por página. Cada visual conserva su marco, sus
          overlays y sus dimensiones: solo ajustas la imagen, su encuadre y sus textos. Las portadas
          de canciones y las cubiertas de artículos se gestionan en las pestañas Música y Journal.
        </p>
      </div>

      {/* Page groups */}
      <nav aria-label="Secciones de medios" className="flex flex-wrap gap-2">
        {MEDIA_GROUPS.map((g) => {
          const total = MEDIA_SLOTS.filter((s) => s.group === g.key).length;
          const done = counts.get(g.key) ?? 0;
          const active = g.key === group;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => setGroup(g.key)}
              aria-current={active ? "true" : undefined}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${
                active
                  ? "border-electric bg-electric/15 text-electric-glow"
                  : "border-white/10 text-muted-foreground hover:bg-white/5"
              }`}
            >
              {g.label}
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums">
                {done}/{total}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
        Página : {groupDef.path}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {slots.map((def) => (
          <SlotCard
            key={def.slot}
            def={def}
            row={rows.find((r) => r.slot === def.slot)}
            onChanged={refresh}
          />
        ))}
      </div>
    </div>
  );
}

function SlotCard({
  def,
  row,
  onChanged,
}: {
  def: MediaSlotDef;
  row?: Row;
  onChanged: () => void;
}) {
  const allowSvg = def.group === "identite";
  const accepted = allowSvg ? [...ALLOWED_MIME, ...BRAND_EXTRA_MIME] : ALLOWED_MIME;

  const [alt, setAlt] = useState(row?.alt_text ?? def.defaultAlt);
  const [title, setTitle] = useState(row?.title ?? "");
  const [caption, setCaption] = useState(row?.caption ?? "");
  const [pos, setPos] = useState(row?.object_position ?? "center center");
  const [busy, setBusy] = useState<"upload" | "save" | "reset" | null>(null);
  const [progress, setProgress] = useState(0);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAlt(row?.alt_text ?? def.defaultAlt);
    setTitle(row?.title ?? "");
    setCaption(row?.caption ?? "");
    setPos(row?.object_position ?? "center center");
    setPendingPath(null);
    setPreviewUrl(null);
  }, [
    row?.storage_path,
    row?.alt_text,
    row?.title,
    row?.caption,
    row?.object_position,
    def.defaultAlt,
  ]);

  const savedUrl = row ? mediaUrl(row.storage_path) : undefined;
  const shownUrl = previewUrl ?? savedUrl ?? def.fallback;

  const dirty =
    !!pendingPath ||
    alt.trim() !== (row?.alt_text ?? def.defaultAlt).trim() ||
    title !== (row?.title ?? "") ||
    caption !== (row?.caption ?? "") ||
    pos !== (row?.object_position ?? "center center");

  function validate(f: File): string | null {
    const okType = accepted.includes(f.type) || (allowSvg && f.name.toLowerCase().endsWith(".svg"));
    if (!okType) {
      return allowSvg
        ? "Formato no compatible. Usa JPG, PNG, WebP, AVIF o SVG."
        : "Formato no compatible. Usa JPG, PNG, WebP o AVIF.";
    }
    if (f.size > MAX_BYTES) return "Archivo demasiado pesado (máx. 8 Mo).";
    if (f.size === 0) return "Archivo vacío.";
    return null;
  }

  function uploadWithProgress(url: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`El almacenamiento rechazó el archivo (${xhr.status}).`));
      xhr.onerror = () => reject(new Error("Conexión interrumpida durante el envío."));
      xhr.send(file);
    });
  }

  async function pick(f: File) {
    const err = validate(f);
    if (err) {
      toast.error(err);
      return;
    }
    setBusy("upload");
    setProgress(0);
    try {
      const optimized = await optimizeImage(f);
      const ext = (optimized.name.split(".").pop() ?? "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const path = `${def.slot}/${crypto.randomUUID()}.${ext || "jpg"}`;
      const { signedUrl } = await createSiteImageUploadUrl({ data: { path } });
      await uploadWithProgress(signedUrl, optimized);
      setPendingPath(path);
      setPreviewUrl(URL.createObjectURL(optimized));

      toast.success("Imagen enviada. Haz clic en Guardar para aplicarla.");
    } catch (e) {
      toast.error("Fallo en el envío: " + (e as Error).message);
    } finally {
      setBusy(null);
      setProgress(0);
    }
  }

  async function save() {
    if (!alt.trim()) {
      toast.error("El texto alternativo es obligatorio (accesibilidad y SEO).");
      return;
    }
    const storagePath = pendingPath ?? row?.storage_path;
    if (!storagePath) {
      toast.error("Elige primero una imagen para importar.");
      return;
    }
    setBusy("save");
    try {
      await upsertSiteImage({
        data: {
          slot: def.slot,
          storagePath,
          alt: alt.trim(),
          title: title.trim(),
          caption: caption.trim(),
          objectPosition: pos,
        },
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingPath(null);
      toast.success("Medio actualizado");
      onChanged();
    } catch (e) {
      toast.error("No se puede guardar: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!row) return;
    const label = def.fallback
      ? "¿Restaurar la imagen por defecto de esta sección?"
      : "¿Eliminar esta imagen? La sección volverá a su degradado original.";
    if (!confirm(label)) return;
    setBusy("reset");
    try {
      await resetSiteImage({ data: { slot: def.slot } });
      toast.success("Medio restablecido");
      onChanged();
    } catch (e) {
      toast.error("Eliminación imposible: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) pick(f);
  }

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30";
  const labelCls =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground";

  return (
    <section className="rounded-2xl border border-white/10 bg-surface/40 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-electric-glow">
            {def.slot}
          </div>
          <h3 className="mt-1 font-display text-lg font-bold">{def.label}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{def.hint}</p>
        </div>
        {row && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-electric/30 bg-electric/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-electric-glow">
            <Check className="size-3" /> Personalizada
          </span>
        )}
      </div>

      <FramingPreview
        url={shownUrl}
        aspect={def.aspect}
        position={pos}
        onPositionChange={setPos}
        onDrop={onDrop}
      />

      {busy === "upload" && (
        <div className="mt-2" role="status" aria-live="polite">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-electric transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Enviando… {progress}%</div>
        </div>
      )}

      <div className="mt-3">
        <div className={labelCls}>Encuadre (punto de enfoque)</div>
        <AnchorGrid value={pos} onChange={setPos} />
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className={labelCls}>Texto alternativo (obligatorio)</span>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            maxLength={200}
            className={inputCls}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Título (opcional)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Leyenda (opcional)</span>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={400}
              className={inputCls}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={accepted.join(",")}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pick(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50"
        >
          {busy === "upload" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <UploadCloud className="size-3.5" />
          )}
          {row ? "Reemplazar la imagen" : "Importar una imagen"}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy !== null || !dirty}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
        >
          {busy === "save" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Guardar
        </button>
        {row && (
          <button
            type="button"
            onClick={remove}
            disabled={busy !== null}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/5 disabled:opacity-50"
          >
            {busy === "reset" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : def.fallback ? (
              <RotateCcw className="size-3.5" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            {def.fallback ? "Restablecer" : "Eliminar"}
          </button>
        )}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground/70">
        Formatos admitidos: JPG, PNG, WebP, AVIF{allowSvg ? ", SVG" : ""} · Máx. 8 Mo
      </p>
    </section>
  );
}

/* -------------- Framing preview with draggable focus point -------------- */

function parsePosition(pos: string): { x: number; y: number } {
  const parts = pos.trim().split(/\s+/);
  const map = (v: string) => {
    if (v === "left" || v === "top") return 0;
    if (v === "right" || v === "bottom") return 100;
    if (v === "center") return 50;
    const m = v.match(/^([\d.]+)%$/);
    return m ? Math.max(0, Math.min(100, parseFloat(m[1]))) : 50;
  };
  return { x: map(parts[0] ?? "center"), y: map(parts[1] ?? "center") };
}

function formatPosition(x: number, y: number) {
  return `${Math.round(x)}% ${Math.round(y)}%`;
}

function FramingPreview({
  url,
  aspect,
  position,
  onPositionChange,
  onDrop,
}: {
  url?: string;
  aspect: string;
  position: string;
  onPositionChange: (pos: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const { x, y } = useMemo(() => parsePosition(position), [position]);

  function updateFromEvent(clientX: number, clientY: number) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 100;
    const ny = ((clientY - rect.top) / rect.height) * 100;
    onPositionChange(
      formatPosition(Math.max(0, Math.min(100, nx)), Math.max(0, Math.min(100, ny))),
    );
  }

  return (
    <div
      ref={wrapRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(true);
        updateFromEvent(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        updateFromEvent(e.clientX, e.clientY);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      className={`relative w-full overflow-hidden rounded-xl border border-white/10 bg-black ${aspect} cursor-crosshair select-none touch-none`}
    >
      {url ? (
        <img
          src={url}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon className="size-8" />
          <span className="text-[11px]">Sin imagen — degradado original</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-full w-px bg-white/10" />
        <div className="absolute left-2/3 top-0 h-full w-px bg-white/10" />
        <div className="absolute top-1/3 left-0 h-px w-full bg-white/10" />
        <div className="absolute top-2/3 left-0 h-px w-full bg-white/10" />
      </div>
      <div
        className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-electric shadow-[0_0_0_3px_rgba(0,0,0,0.5)]"
        style={{ left: `${x}%`, top: `${y}%` }}
      />
      <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-mono text-white/80">
        {formatPosition(x, y)}
      </div>
    </div>
  );
}

function AnchorGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { x, y } = parsePosition(value);
  const activeIdx = (y < 34 ? 0 : y > 66 ? 6 : 3) + (x < 34 ? 0 : x > 66 ? 2 : 1);
  return (
    <div
      role="group"
      aria-label="Punto de enfoque de la imagen"
      className="grid w-40 grid-cols-3 gap-1 rounded-lg border border-white/10 bg-black/40 p-1.5"
    >
      {MEDIA_ANCHORS.map((a, i) => (
        <button
          key={a.value}
          type="button"
          onClick={() => onChange(a.value)}
          aria-pressed={i === activeIdx}
          className={`flex aspect-square items-center justify-center rounded text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${
            i === activeIdx
              ? "bg-electric text-black"
              : "bg-white/5 text-muted-foreground hover:bg-white/10"
          }`}
          aria-label={a.label}
        >
          <span aria-hidden="true">{a.icon}</span>
        </button>
      ))}
    </div>
  );
}
