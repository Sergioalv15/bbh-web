import { createFileRoute } from "@tanstack/react-router";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Mail, Instagram, MapPin, Send } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { CtaButton } from "@/components/CtaButton";

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(seoQueryOptions),
  head: ({ loaderData }) => {
    const cfg = loaderData as SeoConfig | undefined;
    const base = cfg?.settings.baseUrl ?? "";
    return pageHead(cfg, "contact", {
      path: "/contact",
      jsonLd: [
        breadcrumbJsonLd(base, [
          { name: "Inicio", path: "/" },
          { name: "Contacto", path: "/contact" },
        ]),
      ],
    });
  },
  component: ContactPage,
});

const types = ["Evento", "Taller", "Artista", "Colaboración", "Prensa / otro"];

const infos = [
  { icon: Instagram, label: "Instagram", value: "@bbhassociation" },
  { icon: Mail, label: "Email", value: "contact@bbhassociation.com" },
  { icon: MapPin, label: "Base", value: "Maubeuge / Hauts-de-France" },
];

function ContactPage() {

  return (
    <SiteShell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <HeroBackdrop slot="contact_hero" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
            Intercambiamos
          </div>
          <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
            Contacto & <br className="sm:hidden" /> colaboraciones
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Artista, colaborador, espacio, escuela o estructura cultural&nbsp;: contacta con BBH
            para construir un proyecto.
          </p>
        </div>
      </section>

      {/* Form + info */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fields = new FormData(e.currentTarget);
              const subject = `[BBH] ${String(fields.get("type") || "Contacto")}`;
              const body = `Nombre: ${String(fields.get("name") || "")}\nEmail: ${String(fields.get("email") || "")}\n\n${String(fields.get("message") || "")}`;
              window.location.href = `mailto:contact@bbhassociation.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }}
            className="rounded-3xl border border-white/10 bg-surface/60 p-8 md:p-10"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre">
                <input required name="name" type="text" placeholder="Tu nombre" className="input-base" />
              </Field>
              <Field label="Email">
                <input required name="email" type="email" placeholder="tu@email.com" className="input-base" />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Tipo de solicitud">
                <select required name="type" defaultValue="" className="input-base">
                  <option value="" disabled>
                    Elegir un tipo
                  </option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Mensaje">
                <textarea
                  required
                  name="message"
                  rows={6}
                  placeholder="Cuéntanos tu proyecto…"
                  className="input-base resize-none"
                />
              </Field>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Se abrirá tu correo para revisar y enviar el mensaje.</span>
              <CtaButton type="submit" variant="primary">
                Preparar correo <Send className="size-4" />
              </CtaButton>
            </div>

            <style>{`
              .input-base {
                width: 100%;
                background: color-mix(in oklab, white 4%, transparent);
                border: 1px solid color-mix(in oklab, white 10%, transparent);
                border-radius: 0.875rem;
                padding: 0.9rem 1rem;
                font-size: 0.95rem;
                color: inherit;
                outline: none;
                transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
              }
              .input-base::placeholder { color: color-mix(in oklab, white 40%, transparent); }
              .input-base:focus {
                border-color: oklch(0.72 0.22 250 / 0.6);
                box-shadow: 0 0 0 4px oklch(0.72 0.22 250 / 0.15);
              }
            `}</style>
          </form>

          {/* infos */}
          <aside className="space-y-3">
            {infos.map((i) => (
              <div
                key={i.label}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-surface/60 p-6 card-hover"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-electric/30 bg-electric/10 text-electric-glow">
                  <i.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {i.label}
                  </div>
                  <div className="mt-1 truncate text-base font-medium text-foreground">
                    {i.value}
                  </div>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
