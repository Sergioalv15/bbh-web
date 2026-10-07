import heroBbhLive from "@/assets/hero-bbh-live.jpg";
import cardScenes from "@/assets/card-scenes.jpg";
import cardAteliers from "@/assets/card-ateliers.jpg";
import cardArtistes from "@/assets/card-artistes.jpg";

/**
 * Central registry of every editable image on the site.
 * Each entry has a stable `slot` key stored in `public.site_images`.
 * Adding a new editable image = add an entry here + use the slot in the page.
 */

export const MEDIA_GROUPS = [
  { key: "accueil", label: "Inicio", path: "/" },
  { key: "evenements", label: "Eventos", path: "/evenements" },
  { key: "ateliers", label: "Talleres", path: "/ateliers" },
  { key: "artistes", label: "Artistas", path: "/artistes" },
  { key: "musique", label: "Música", path: "/musique" },
  { key: "journal", label: "Diario", path: "/journal" },
  { key: "a-propos", label: "Sobre nosotros", path: "/a-propos" },
  { key: "contact", label: "Contacto", path: "/contact" },
  { key: "identite", label: "Identidad visual", path: "—" },
  { key: "seo", label: "Imágenes SEO y redes sociales", path: "—" },
] as const;

export type MediaGroupKey = (typeof MEDIA_GROUPS)[number]["key"];

export type MediaSlotDef = {
  slot: string;
  group: MediaGroupKey;
  label: string;
  hint: string;
  aspect: string;
  defaultAlt: string;
  /** Bundled image used when no custom image is uploaded. */
  fallback?: string;
  /** Purely decorative background: alt stays empty on the site. */
  decorative?: boolean;
};

export const MEDIA_SLOTS: MediaSlotDef[] = [
  /* ---------------- Accueil ---------------- */
  {
    slot: "home_hero",
    group: "accueil",
    label: "Hero — BBH LIVE Vol.2",
    hint: "Gran tarjeta vertical de la página de inicio.",
    aspect: "aspect-[4/5]",
    fallback: heroBbhLive,
    defaultAlt: "BBH LIVE — escenario rap iluminado en azul y violeta",
  },
  {
    slot: "home_card_scenes",
    group: "accueil",
    label: "Tarjeta — Escenarios y showcases",
    hint: "Primera tarjeta de la fila bajo el hero.",
    aspect: "aspect-[5/6]",
    fallback: cardScenes,
    defaultAlt: "Público de un showcase BBH LIVE en Hauts-de-France",
  },
  {
    slot: "home_card_ateliers",
    group: "accueil",
    label: "Tarjeta — Talleres",
    hint: "Segunda tarjeta de la fila bajo el hero.",
    aspect: "aspect-[5/6]",
    fallback: cardAteliers,
    defaultAlt: "Sesión de taller de escritura rap en el estudio",
  },
  {
    slot: "home_card_artistes",
    group: "accueil",
    label: "Tarjeta — Artistas BBH",
    hint: "Tercera tarjeta de la fila bajo el hero.",
    aspect: "aspect-[5/6]",
    fallback: cardArtistes,
    defaultAlt: "Retrato editorial de un artista del roster BBH",
  },

  /* ---------------- Événements ---------------- */
  {
    slot: "events_hero",
    fallback: cardScenes,
    group: "evenements",
    label: "Cabecera — Eventos",
    hint: "Imagen de fondo de la parte superior de la página. Vacío = se conserva el degradado actual.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Concierto de rap organizado por BBH Association",
    decorative: true,
  },
  {
    slot: "events_featured_bbhlive",
    fallback: heroBbhLive,
    group: "evenements",
    label: "Formato destacado — BBH LIVE",
    hint: "Gran tarjeta vertical de la sección « Destacado ».",
    aspect: "aspect-[4/5]",
    defaultAlt: "Noche BBH LIVE, formato emblemático de la asociación",
  },
  {
    slot: "events_upcoming_1",
    group: "evenements",
    label: "Próximo evento 1 — BBH LIVE Vol.2",
    hint: "Imagen de la primera tarjeta « Próximos eventos ».",
    aspect: "aspect-[16/10]",
    defaultAlt: "Cartel del BBH LIVE Vol.2 en Lille Wazemmes",
  },
  {
    slot: "events_upcoming_2",
    group: "evenements",
    label: "Próximo evento 2 — Reverseflow Showcase",
    hint: "Imagen de la segunda tarjeta « Próximos eventos ».",
    aspect: "aspect-[16/10]",
    defaultAlt: "Cartel del showcase Reverseflow en Maubeuge",
  },
  {
    slot: "events_past_1",
    group: "evenements",
    label: "Archivo 1 — BBH LIVE Vol.1",
    hint: "Primera tarjeta de los eventos pasados.",
    aspect: "aspect-[4/5]",
    defaultAlt: "BBH LIVE Vol.1 en Maubeuge",
  },
  {
    slot: "events_past_2",
    group: "evenements",
    label: "Archivo 2 — Open Mic BBH",
    hint: "Segunda tarjeta de los eventos pasados.",
    aspect: "aspect-[4/5]",
    defaultAlt: "Open Mic BBH, escenario abierto para artistas emergentes",
  },
  {
    slot: "events_past_3",
    group: "evenements",
    label: "Archivo 3 — Encuentro de artistas",
    hint: "Tercera tarjeta de los eventos pasados.",
    aspect: "aspect-[4/5]",
    defaultAlt: "Encuentro de artistas independientes organizado por BBH",
  },

  /* ---------------- Ateliers ---------------- */
  {
    slot: "workshops_hero",
    fallback: cardAteliers,
    group: "ateliers",
    label: "Cabecera — Talleres",
    hint: "Imagen de fondo de la parte superior de la página. Vacío = se conserva el degradado actual.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Taller de escritura rap impartido por BBH Association",
    decorative: true,
  },

  /* ---------------- Artistes ---------------- */
  {
    slot: "artists_hero",
    fallback: cardArtistes,
    group: "artistes",
    label: "Cabecera — Artistas",
    hint: "Imagen de fondo de la parte superior de la página. Vacío = se conserva el degradado actual.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Roster de artistas de BBH Association",
    decorative: true,
  },
  {
    slot: "artist_reverseflow",
    group: "artistes",
    label: "Portrait — REVERSEFLOW",
    hint: "Foto mostrada en la ficha del roster.",
    aspect: "aspect-square",
    fallback: cardArtistes,
    defaultAlt: "Retrato de REVERSEFLOW, fundador de BBH Association",
  },

  /* ---------------- Musique ---------------- */
  {
    slot: "music_hero",
    fallback: heroBbhLive,
    group: "musique",
    label: "Cabecera — Música",
    hint: "Imagen de fondo de la parte superior de la página. Vacío = se conserva el degradado actual.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Lanzamientos musicales de REVERSEFLOW y del sello BBH",
    decorative: true,
  },

  /* ---------------- Journal ---------------- */
  {
    slot: "journal_hero",
    fallback: cardArtistes,
    group: "journal",
    label: "Cabecera — Diario",
    hint: "Imagen de fondo de la parte superior de la página. Vacío = se conserva el degradado actual.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Detrás de cámaras y cuaderno de bitácora de los artistas BBH",
    decorative: true,
  },

  /* ---------------- À propos ---------------- */
  {
    slot: "about_hero",
    fallback: cardScenes,
    group: "a-propos",
    label: "Cabecera — Sobre nosotros",
    hint: "Imagen de fondo de la parte superior de la página. Vacío = se conserva el degradado actual.",
    aspect: "aspect-[16/7]",
    defaultAlt: "El equipo de BBH Association en un evento",
    decorative: true,
  },
  {
    slot: "about_vision",
    fallback: cardScenes,
    group: "a-propos",
    label: "Nuestro territorio — Hauts-de-France",
    hint: "Gran tarjeta vertical de la sección « Nuestra visión ».",
    aspect: "aspect-[4/5]",
    defaultAlt: "Territorio de acción de BBH en Hauts-de-France",
  },

  /* ---------------- Contact ---------------- */
  {
    slot: "contact_hero",
    fallback: cardAteliers,
    group: "contact",
    label: "Cabecera — Contacto",
    hint: "Imagen de fondo de la parte superior de la página. Vacío = se conserva el degradado actual.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Contactar a BBH Association para una colaboración",
    decorative: true,
  },

  /* ---------------- Identité visuelle ---------------- */
  {
    slot: "brand_logo",
    group: "identite",
    label: "Logo BBH (navegación y pie de página)",
    hint: "Sustituye al logo tipográfico « BBH ». Se recomienda fondo transparente (PNG/WebP/SVG).",
    aspect: "aspect-[3/1]",
    defaultAlt: "Logo de BBH Association",
  },

  /* ---------------- SEO ---------------- */
  {
    slot: "seo_default_og",
    group: "seo",
    label: "Imagen para compartir por defecto",
    hint: "Se usa en las redes sociales cuando una página no tiene imagen propia. Formato recomendado: 1200 × 630 px.",
    aspect: "aspect-[1200/630]",
    defaultAlt: "BBH Association — cultura urbana en Hauts-de-France",
  },
];

export const MEDIA_SLOT_KEYS = MEDIA_SLOTS.map((s) => s.slot);

export function isMediaSlot(value: string): boolean {
  return MEDIA_SLOT_KEYS.includes(value);
}

export function getMediaSlotDef(slot: string): MediaSlotDef | undefined {
  return MEDIA_SLOTS.find((s) => s.slot === slot);
}

/** Anchors used by the object-position control. */
export const MEDIA_ANCHORS: { label: string; icon: string; value: string }[] = [
  { label: "Superior izquierda", icon: "↖", value: "left top" },
  { label: "Superior", icon: "↑", value: "center top" },
  { label: "Superior derecha", icon: "↗", value: "right top" },
  { label: "Izquierda", icon: "←", value: "left center" },
  { label: "Centro", icon: "•", value: "center center" },
  { label: "Derecha", icon: "→", value: "right center" },
  { label: "Inferior izquierda", icon: "↙", value: "left bottom" },
  { label: "Inferior", icon: "↓", value: "center bottom" },
  { label: "Inferior derecha", icon: "↘", value: "right bottom" },
];
