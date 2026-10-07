import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, MoveDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteShell } from "@/components/SiteShell";
import { AnimatedContent } from "@/components/AnimatedContent";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import hero from "@/assets/hero-bbh-live.jpg";
import scenes from "@/assets/card-scenes.jpg";
import artists from "@/assets/card-artistes.jpg";
import workshops from "@/assets/card-ateliers.jpg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(seoQueryOptions),
  head: ({ loaderData }) => {
    const cfg = loaderData as SeoConfig | undefined;
    return pageHead(cfg, "home", {
      path: "/",
      jsonLd: [breadcrumbJsonLd(cfg?.settings.baseUrl ?? "", [{ name: "Inicio", path: "/" }])],
    });
  },
  component: Home,
});

const stories = [
  { number: "01", kicker: "BBH LIVE", title: "LA ESCENA NOS UNE.", text: "Rap, encuentros y energía compartida. Un espacio para que la cultura urbana se escuche y se viva.", image: scenes, alt: "Público y escenario en un concierto de cultura urbana", to: "/evenements", cta: "Explorar eventos" },
  { number: "02", kicker: "ARTISTAS", title: "LA VOZ ES DE QUIEN LA CREA.", text: "Una red abierta a voces y disciplinas que construyen su propio camino.", image: artists, alt: "Retrato de un artista bajo iluminación violeta", to: "/artistes", cta: "Conocer artistas" },
  { number: "03", kicker: "TALLERES", title: "CREAR TAMBIÉN ES APRENDER.", text: "Escritura, estudio y expresión: herramientas para pasar de la idea a la práctica.", image: workshops, alt: "Sesión creativa de música y escritura", to: "/ateliers", cta: "Ver talleres" },
] as const;

function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const storyImageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const storyCopyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [motion, setMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("bbh-motion");
    setMotion(saved === "on" || (saved !== "off" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches));
    setMotionReady(true);
  }, []);

  useEffect(() => {
    if (!motionReady) return;
    window.localStorage.setItem("bbh-motion", motion ? "on" : "off");
    if (!motion) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      if (heroImageRef.current && heroRef.current) {
        gsap.fromTo(heroImageRef.current, { scale: 1.04, yPercent: 0 }, { scale: 1.28, yPercent: 15, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true } });
      }
      if (heroTitleRef.current && heroRef.current) {
        gsap.to(heroTitleRef.current, { yPercent: 24, opacity: 0.45, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true } });
      }
    });
    media.add("(min-width: 800px)", () => {
      if (storyRef.current) {
        const panels = storyCopyRefs.current.filter(Boolean);
        const images = storyImageRefs.current.filter(Boolean);
        gsap.set(images.slice(1), { clipPath: "inset(100% 0 0 0)" });
        const timeline = gsap.timeline({ scrollTrigger: { trigger: storyRef.current, start: "top top", end: "+=270%", scrub: 0.5, pin: true, anticipatePin: 1 } });
        for (let i = 1; i < stories.length; i++) {
          timeline.to(panels[i - 1], { autoAlpha: 0, y: -45, duration: 0.35 }, i);
          timeline.fromTo(panels[i], { autoAlpha: 0, y: 45 }, { autoAlpha: 1, y: 0, duration: 0.35 }, i + 0.36);
          timeline.to(images[i], { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease: "none" }, i);
        }
        timeline.to({}, { duration: 0.5 });
      }
    });
    return () => { media.revert(); ctx.revert(); };
  }, [motion, motionReady]);

  return (
    <SiteShell>
      <section className="bbh-hero" ref={heroRef} aria-labelledby="bbh-hero-title">
        <img className="bbh-hero-image" src={hero} ref={heroImageRef} alt="Artista actuando en un escenario iluminado en azul y violeta" fetchPriority="high" />
        <div className="bbh-hero-shade" />
        <div className="bbh-hero-content">
          <div className="bbh-topline"><span>BBH ASSOCIATION / CULTURA URBANA</span><span>MAUBEUGE · HAUTS-DE-FRANCE</span></div>
          <h1 id="bbh-hero-title" ref={heroTitleRef}>ALL FOR<br /><em>THE</em> CULTURE<span className="bbh-dot">.</span></h1>
          <div className="bbh-hero-bottom">
            <div><p className="bbh-kicker">NO BARRIERS — MUSIC / ART / CULTURE</p><p className="bbh-hero-intro">Una asociación para encontrarnos, crear y llevar la cultura urbana más lejos.</p></div>
            <Link to="/a-propos" className="bbh-round-link" aria-label="Descubre BBH"><ArrowDownRight size={29} /></Link>
          </div>
        </div>
        <div className="bbh-hero-scroll"><MoveDown size={14} /> DESLIZA PARA EXPLORAR</div>
      </section>

      <section className="bbh-manifesto">
        <div className="bbh-section-tag">01 / EL MOVIMIENTO</div>
        <AnimatedContent active={motion} className="bbh-manifesto-inner">
          <p>NO ESPERAMOS A QUE<br />NOS DEN <span>UN ESCENARIO.</span></p>
          <div className="bbh-manifesto-foot"><span>LO CREAMOS JUNTOS.</span><p>BBH conecta artistas, públicos y espacios culturales a través de la música, el arte y la creación colectiva.</p></div>
        </AnimatedContent>
      </section>

      <section className={`bbh-story ${!motion ? "bbh-story-static" : ""}`} ref={storyRef} aria-label="El universo BBH">
        <div className="bbh-story-visual">
          {stories.map((story, i) => <img key={story.number} src={story.image} alt={story.alt} ref={(el) => { storyImageRefs.current[i] = el; }} className="bbh-story-image" style={{ zIndex: i + 1 }} />)}
          <div className="bbh-story-visual-label">EL UNIVERSO BBH <span>↗</span></div>
        </div>
        <div className="bbh-story-right">
          <div className="bbh-story-rail"><span>02 / EN ACCIÓN</span><span>BBH / 2026</span></div>
          <div className="bbh-story-stage">
            {stories.map((story, i) => <div key={story.number} ref={(el) => { storyCopyRefs.current[i] = el; }} className={`bbh-story-copy ${motion && i ? "bbh-story-later" : ""}`}>
              <span className="bbh-story-index">{story.number} / 03</span>
              <p className="bbh-kicker">{story.kicker}</p>
              <h2>{story.title}</h2>
              <p className="bbh-story-description">{story.text}</p>
              <Link to={story.to} className="bbh-text-link">{story.cta} <ArrowUpRight size={19} /></Link>
            </div>)}
          </div>
          <div className="bbh-story-progress"><span>SCROLL / DISCOVER</span><span>01 — 03</span></div>
        </div>
      </section>

      <section className="bbh-formats">
        <div className="bbh-formats-header"><span className="bbh-section-tag">03 / EN CONSTANTE MOVIMIENTO</span><h2>MUCHAS FORMAS.<br /><i>UNA MISMA CULTURA.</i></h2></div>
        <div className="bbh-formats-grid">
          <Link to="/evenements" className="bbh-format-item"><span>01 / LIVE</span><strong>ESCENARIOS<br />ABIERTOS</strong><ArrowUpRight /></Link>
          <Link to="/musique" className="bbh-format-item"><span>02 / MÚSICA</span><strong>SONIDO EN<br />MOVIMIENTO</strong><ArrowUpRight /></Link>
          <Link to="/ateliers" className="bbh-format-item"><span>03 / CREACIÓN</span><strong>IDEAS EN<br />PRÁCTICA</strong><ArrowUpRight /></Link>
          <Link to="/journal" className="bbh-format-item"><span>04 / HISTORIAS</span><strong>VOCES QUE<br />CUENTAN</strong><ArrowUpRight /></Link>
        </div>
      </section>

      <section className="bbh-join"><span className="bbh-section-tag">04 / ENTRA EN LA CONVERSACIÓN</span><h2>LA CULTURA<br />SE HACE <em>CONTIGO.</em></h2><div><p>¿Eres artista, espacio cultural o quieres construir algo con BBH?</p><Link to="/contact" className="bbh-join-link">Hablemos <ArrowUpRight /></Link></div></section>
      <div className="bbh-motion-control"><button type="button" onClick={() => setMotion((value) => !value)} aria-pressed={motion}>{motion ? "Pausar animaciones" : "Activar animaciones"}</button></div>
    </SiteShell>
  );
}
