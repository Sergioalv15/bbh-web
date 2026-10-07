import { createFileRoute, Link } from "@tanstack/react-router";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaButton } from "@/components/CtaButton";
import { WORKSHOPS as workshops } from "@/lib/workshops.data";

export const Route = createFileRoute("/ateliers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(seoQueryOptions),
  head: ({ loaderData }) => {
    const cfg = loaderData as SeoConfig | undefined;
    const base = cfg?.settings.baseUrl ?? "";
    return pageHead(cfg, "workshops", {
      path: "/ateliers",
      jsonLd: [
        breadcrumbJsonLd(base, [
          { name: "Inicio", path: "/" },
          { name: "Talleres", path: "/ateliers" },
        ]),
      ],
    });
  },
  component: WorkshopsPage,
});

const audiences = [
  "Escuelas",
  "MJC",
  "Centros sociales",
  "Asociaciones",
  "Ayuntamientos",
  "Jóvenes artistas",
  "Estructuras culturales",
];

const formats = [
  {
    title: "Taller puntual",
    text: "Una intervención única, formato corto, pensado como un descubrimiento contundente.",
  },
  {
    title: "Ciclo de varias sesiones",
    text: "Un recorrido progresivo para construir un verdadero proyecto artístico en el tiempo.",
  },
  {
    title: "Intervención a medida",
    text: "Un contenido adaptado a tu público, tu espacio y tus objetivos pedagógicos.",
  },
  {
    title: "Presentación final o concierto de cierre",
    text: "Un escenario, una grabación o una actuación para cerrar el ciclo.",
  },
];

function WorkshopsPage() {
  return (
    <SiteShell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <HeroBackdrop slot="workshops_hero" />
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-24 pb-20 md:grid-cols-[1.2fr_1fr] md:items-end md:pt-32">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
              Transmisión
            </div>
            <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
              Talleres BBH
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Talleres en torno al rap, la escritura, la expresión artística y los oficios
              de la música.
            </p>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            BBH propone talleres accesibles y concretos para acompañar a los jóvenes, a los
            artistas emergentes y a las estructuras culturales en el descubrimiento de la creación
            musical.
          </p>
        </div>
      </section>

      {/* Workshops */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Nuestros talleres" title="4 formatos, una misma energía" />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {workshops.map((w, i) => (
            <Link
              key={w.slug}
              to="/ateliers/$slug"
              params={{ slug: w.slug }}
              className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-surface/60 p-8 card-hover"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="grid size-12 place-items-center rounded-xl border border-electric/30 bg-electric/10 text-electric-glow">
                    <w.icon className="size-5" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-black tracking-tight">
                    {w.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm text-muted-foreground">{w.text}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-electric-glow">
                    Descubrir <ArrowRight className="size-3.5" />
                  </span>
                </div>
                <span className="font-display text-5xl font-black tracking-tighter text-white/5 group-hover:text-white/10">
                  0{i + 1}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section className="border-y border-white/5 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading eyebrow="¿Para quién?" title="Un contenido adaptado a tu público" />
          <div className="mt-10 flex flex-wrap gap-3">
            {audiences.map((a) => (
              <span
                key={a}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-electric/40 hover:bg-electric/10 hover:text-electric-glow"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Formatos" title="Formatos posibles" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {formats.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-surface/60 p-6 card-hover"
            >
              <h3 className="font-display text-lg font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-10 md:p-16">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
                Proponer un taller
              </div>
              <h2 className="mt-4 font-display text-4xl font-black tracking-tighter sm:text-5xl">
                Construyamos un taller juntos.
              </h2>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Escríbenos tu contexto, tu público y tu objetivo — preparamos una propuesta
                adaptada.
              </p>
            </div>
            <div className="flex md:justify-end">
              <CtaButton to="/contact" variant="primary">
                Contactar con BBH <ArrowRight className="size-4" />
              </CtaButton>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
