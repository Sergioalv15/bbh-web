import { PenLine, Mic2, Sparkles, Compass, type LucideIcon } from "lucide-react";

export type Workshop = {
  slug: string;
  icon: LucideIcon;
  title: string;
  text: string;
  /** Longer editorial description used on the detail page. */
  detail: string;
  audience: string;
  duration: string;
  slot: string;
};

export const WORKSHOPS: Workshop[] = [
  {
    slug: "atelier-ecriture-rap",
    icon: PenLine,
    title: "Taller de escritura rap",
    text: "Aprender a transformar una idea, una emoción o una historia en texto, estrofa, estribillo o actuación.",
    detail:
      "Un taller de escritura concebido como un espacio de expresión: encontrar el tema, estructurar una estrofa, trabajar las rimas, el flow y la presencia. Cada participante se lleva un texto terminado y herramientas concretas para seguir por su cuenta.",
    audience: "Escuelas, centros de juventud, centros sociales, jóvenes artistas",
    duration: "2h a 3h por sesión",
    slot: "workshops_hero",
  },
  {
    slug: "initiation-enregistrement",
    icon: Mic2,
    title: "Iniciación a la grabación",
    text: "Descubrir las bases del estudio, del micrófono, de la toma de voz y de la creación de un tema.",
    detail:
      "Descubrimiento del estudio: material, colocación del micrófono, toma de voz, escucha crítica y bases de la mezcla. El taller termina con la grabación de una toma real, que el grupo escucha y comenta en conjunto.",
    audience: "Entidades culturales, asociaciones, jóvenes artistas",
    duration: "3h a una jornada completa",
    slot: "workshops_hero",
  },
  {
    slug: "expression-artistique",
    icon: Sparkles,
    title: "Expresión artística",
    text: "Crear un espacio donde cada persona pueda ganar confianza, escribir, hablar, actuar y desarrollar su voz.",
    detail:
      "Un espacio centrado en la confianza: hablar en público, gestionar los nervios, presencia escénica y respeto por la palabra del otro. El objetivo no es tanto la actuación como la capacidad de expresarse ante un grupo.",
    audience: "Escuelas, centros de juventud, centros sociales, ayuntamientos",
    duration: "2h por sesión",
    slot: "workshops_hero",
  },
  {
    slug: "accompagnement-artistes",
    icon: Compass,
    title: "Acompañamiento a artistas",
    text: "Consejos sobre la identidad artística, la preparación de directos, los lanzamientos musicales y la construcción de un proyecto.",
    detail:
      "Un acompañamiento individual o en pequeño grupo: clarificar la identidad artística, preparar un directo, planificar un lanzamiento, estructurar un proyecto a lo largo de varios meses. Basado en la experiencia real del colectivo BBH.",
    audience: "Artistas independientes, proyectos emergentes",
    duration: "Ciclo de varias sesiones",
    slot: "workshops_hero",
  },
];

export function findWorkshop(slug: string): Workshop | undefined {
  return WORKSHOPS.find((w) => w.slug === slug);
}
