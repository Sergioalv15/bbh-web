// Adapted from React Bits AnimatedContent by David Haz.
// https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/AnimatedContent/AnimatedContent.jsx
// License and changes: see THIRD_PARTY_NOTICES.md.
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function AnimatedContent({ children, className = "", active }: { children: ReactNode; className?: string; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    const tween = gsap.fromTo(el, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(el, { clearProps: "transform,opacity" }); };
  }, [active]);
  return <div ref={ref} className={className}>{children}</div>;
}
