import { createFileRoute } from "@tanstack/react-router";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Mic, Users, BookOpen, Radio } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { SectionHeading } from "@/components/SectionHeading";
import { ImageCard } from "@/components/ImageCard";

export const Route = createFileRoute("/a-propos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(seoQueryOptions),
  head: ({ loaderData }) => {
    const cfg = loaderData as SeoConfig | undefined;
    const base = cfg?.settings.baseUrl ?? "";
    return pageHead(cfg, "about", {
      path: "/a-propos",
      jsonLd: [
        breadcrumbJsonLd(base, [
          { name: "Inicio", path: "/" },
          { name: "Sobre nosotros", path: "/a-propos" },
        ]),
      ],
    });
  },
  component: AboutPage,
});

const missions = [
  { icon: Radio, title: "Crear escenarios" },
  { icon: Users, title: "Acompañar a los artistas" },
  { icon: BookOpen, title: "Transmitir con los talleres" },
  { icon: Mic, title: "Construir una comunidad" },
];

const values = [
  "Independencia",
  "Cultura",
  "Transmisión",
  "Diversidad",
  "Autenticidad",
  "Comunidad",
];

function AboutPage() {
  return (
    <SiteShell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <HeroBackdrop slot="about_hero" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-24 pb-20 md:grid-cols-[1.2fr_1fr] md:items-end md:pt-32">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
              Nuestra historia
            </div>
            <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
              Sobre <span className="text-gradient-blue">BBH</span>.
            </h1>
          </div>
          <p className="max-w-md text-lg text-muted-foreground">
            BBH Association nació de una idea simple&nbsp;: no esperar a que se abran las puertas,
            sino crear nuestros propios espacios para la cultura urbana.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <ImageCard
            label="Nuestro territorio"
            title="Hauts-de-France"
            subtitle="Base operativa"
            tone="blue"
            aspect="aspect-[4/5]"
            slot="about_vision"
          />
          <div>
            <SectionHeading
              eyebrow="Nuestra visión"
              title="Conectar universos, abrir el escenario."
              description="Queremos conectar a los artistas, los espacios, los públicos y las estructuras en torno a proyectos concretos: eventos, talleres, acompañamiento y encuentros."
            />
          </div>
        </div>
      </section>

      {/* Missions */}
      <section className="border-y border-white/5 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading eyebrow="Nuestras misiones" title="Lo que hacemos, concretamente." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {missions.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-white/10 bg-surface/60 p-7 card-hover"
              >
                <div className="grid size-12 place-items-center rounded-xl border border-electric/30 bg-electric/10 text-electric-glow">
                  <m.icon className="size-5" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold tracking-tight">{m.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Nuestros valores" title="Nuestros valores" />
        <div className="mt-10 flex flex-wrap gap-3">
          {values.map((v) => (
            <span
              key={v}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-foreground transition hover:border-electric/40 hover:text-electric-glow"
            >
              {v}
            </span>
          ))}
        </div>
      </section>

      {/* All for the culture */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-10 md:p-20">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
              Manifeste
            </div>
            <h2 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
              Todo por <br className="hidden sm:block" />
              la <span className="text-gradient-blue">cultura.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              BBH no es solo un nombre. Es una manera de reunir universos diferentes
              en torno a una misma energía.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
