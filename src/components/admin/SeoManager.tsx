import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { seoQueryOptions } from "@/hooks/use-seo";
import {
  updateSeoPage,
  updateSiteSettings,
  type SeoPage,
  type SiteSettings,
} from "@/lib/seo.functions";
import { Loader2, Save, Search, Globe, Sparkles } from "lucide-react";

const input =
  "w-full rounded-lg border border-white/10 bg-surface/60 px-3 py-2 text-sm text-foreground outline-none transition focus:border-electric/50";
const labelCls = "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className={labelCls}>{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={over ? "text-[11px] text-blood" : "text-[11px] text-muted-foreground/70"}>
      {value.length}/{max} caracteres
    </span>
  );
}

export function SeoManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(seoQueryOptions);
  const [tab, setTab] = useState<"pages" | "site">("pages");

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando el SEO…
      </div>
    );
  }

  const refresh = () => qc.invalidateQueries({ queryKey: ["seo-config"] });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-black tracking-tight">SEO y posicionamiento</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Títulos, descripciones, compartir en redes y resúmenes para las IA. Los cambios se aplican
          inmediatamente en el sitio público, el sitemap y los datos estructurados.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab("pages")}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${tab === "pages" ? "border-electric/50 bg-electric/10 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"}`}
        >
          <Search className="size-4" /> Pages
        </button>
        <button
          onClick={() => setTab("site")}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${tab === "site" ? "border-electric/50 bg-electric/10 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"}`}
        >
          <Globe className="size-4" /> Ajustes del sitio
        </button>
      </div>

      {tab === "pages" ? (
        <div className="space-y-5">
          {data.pages.map((p) => (
            <PageEditor
              key={p.pageKey}
              page={p}
              baseUrl={data.settings.baseUrl}
              onSaved={refresh}
            />
          ))}
        </div>
      ) : (
        <SettingsEditor settings={data.settings} onSaved={refresh} />
      )}
    </div>
  );
}

function PageEditor({
  page,
  baseUrl,
  onSaved,
}: {
  page: SeoPage;
  baseUrl: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(page);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => setForm(page), [page]);

  const set = <K extends keyof SeoPage>(k: K, v: SeoPage[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await updateSeoPage({
        data: {
          pageKey: form.pageKey,
          title: form.title,
          description: form.description,
          ogTitle: form.ogTitle,
          ogDescription: form.ogDescription,
          aiSummary: form.aiSummary,
          keywords: form.keywords,
          noindex: form.noindex,
          priority: form.priority,
          changefreq: form.changefreq as never,
        },
      });
      setMsg("Guardado ✓");
      onSaved();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/50">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="min-w-0">
          <span className="block font-display text-lg font-bold tracking-tight">
            {page.label || page.pageKey}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {baseUrl}
            {page.path} · {page.title || "sin título"}
          </span>
        </span>
        <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
          {open ? "Cerrar" : "Editar"}
        </span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-white/10 p-5">
          {/* Google preview */}
          <div className="rounded-xl border border-white/10 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Vista previa de Google
            </p>
            <p className="mt-2 truncate text-xs text-emerald-400/80">
              {baseUrl}
              {page.path}
            </p>
            <p className="truncate text-[17px] text-[#8ab4f8]">
              {form.title || "Título de la página"}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {form.description || "Descripción de la página…"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Título (etiqueta title)" hint="Ideal: 50–60 caracteres.">
              <input
                className={input}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                maxLength={120}
              />
              <Counter value={form.title} max={60} />
            </Field>
            <Field label="Meta descripción" hint="Ideal: 120–160 caracteres.">
              <textarea
                className={`${input} min-h-[76px]`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                maxLength={320}
              />
              <Counter value={form.description} max={160} />
            </Field>
            <Field label="Título para compartir (redes sociales)">
              <input
                className={input}
                value={form.ogTitle}
                onChange={(e) => set("ogTitle", e.target.value)}
                maxLength={160}
              />
            </Field>
            <Field label="Descripción para compartir">
              <textarea
                className={`${input} min-h-[76px]`}
                value={form.ogDescription}
                onChange={(e) => set("ogDescription", e.target.value)}
                maxLength={320}
              />
            </Field>
          </div>

          <Field
            label="Resumen para las IA (ChatGPT, Perplexity…)"
            hint="Texto factual que describe el contenido de la página. Usado por los motores de respuesta."
          >
            <textarea
              className={`${input} min-h-[96px]`}
              value={form.aiSummary}
              onChange={(e) => set("aiSummary", e.target.value)}
              maxLength={2000}
            />
          </Field>

          <Field label="Palabras clave" hint="Separadas por comas.">
            <input
              className={input}
              value={form.keywords.join(", ")}
              onChange={(e) =>
                set(
                  "keywords",
                  e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean)
                    .slice(0, 30),
                )
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Prioridad (sitemap)">
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className={input}
                value={form.priority}
                onChange={(e) => set("priority", Math.min(1, Math.max(0, Number(e.target.value))))}
              />
            </Field>
            <Field label="Frecuencia de actualización">
              <select
                className={input}
                value={form.changefreq}
                onChange={(e) => set("changefreq", e.target.value)}
              >
                {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.noindex}
                onChange={(e) => set("noindex", e.target.checked)}
              />
              <span>No indexar esta página</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{" "}
              Guardar
            </button>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsEditor({ settings, onSaved }: { settings: SiteSettings; onSaved: () => void }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => setForm(settings), [settings]);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await updateSiteSettings({ data: form });
      setMsg("Guardado ✓");
      onSaved();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-surface/50 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre del sitio">
          <input
            className={input}
            value={form.siteName}
            onChange={(e) => set("siteName", e.target.value)}
          />
        </Field>
        <Field label="URL del sitio" hint="Sirve para enlaces canónicos, compartir y sitemap.">
          <input
            className={input}
            value={form.baseUrl}
            onChange={(e) => set("baseUrl", e.target.value)}
          />
        </Field>
        <Field label="Slogan">
          <input
            className={input}
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
          />
        </Field>
        <Field label="Cuenta X / Twitter" hint="Formato: @bbhassociation">
          <input
            className={input}
            value={form.twitterHandle}
            onChange={(e) => set("twitterHandle", e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="Descripción por defecto"
        hint="Se usa cuando una página no tiene su propia descripción."
      >
        <textarea
          className={`${input} min-h-[80px]`}
          value={form.defaultDescription}
          onChange={(e) => set("defaultDescription", e.target.value)}
          maxLength={400}
        />
      </Field>

      <Field label="Resumen global para las IA">
        <textarea
          className={`${input} min-h-[110px]`}
          value={form.aiSummary}
          onChange={(e) => set("aiSummary", e.target.value)}
          maxLength={2000}
        />
      </Field>

      <Field label="Palabras clave del sitio" hint="Separadas por comas.">
        <input
          className={input}
          value={form.keywords.join(", ")}
          onChange={(e) =>
            set(
              "keywords",
              e.target.value
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
                .slice(0, 30),
            )
          }
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Correo de contacto">
          <input
            className={input}
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </Field>
        <Field label="Ville">
          <input
            className={input}
            value={form.locality}
            onChange={(e) => set("locality", e.target.value)}
          />
        </Field>
        <Field label="Región">
          <input
            className={input}
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
          />
        </Field>
        <Field label="País" hint="Código de dos letras, p. ej. FR.">
          <input
            className={input}
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            maxLength={4}
          />
        </Field>
      </div>

      <Field
        label="Redes sociales"
        hint="Una URL completa por línea (Instagram, YouTube, Spotify…)."
      >
        <textarea
          className={`${input} min-h-[90px]`}
          value={form.socialLinks.join("\n")}
          onChange={(e) =>
            set(
              "socialLinks",
              e.target.value
                .split("\n")
                .map((v) => v.trim())
                .filter(Boolean)
                .slice(0, 12),
            )
          }
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Verificación de Google Search Console"
          hint="Solo el código, no la etiqueta completa."
        >
          <input
            className={input}
            value={form.googleSiteVerification}
            onChange={(e) => set("googleSiteVerification", e.target.value)}
          />
        </Field>
        <Field label="Verificación de Bing">
          <input
            className={input}
            value={form.bingSiteVerification}
            onChange={(e) => set("bingSiteVerification", e.target.value)}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{" "}
          Guardar
        </button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3 text-electric-glow" /> sitemap.xml actualizado automáticamente
        </span>
      </div>
    </div>
  );
}
