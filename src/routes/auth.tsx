import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hasBrowserSupabaseConfig } from "@/lib/local-mode";
import { SiteShell } from "@/components/SiteShell";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string } =>
    typeof s.next === "string" && s.next ? { next: s.next } : {},

  head: () => ({
    meta: [
      { title: "Inicia sesión — BBH Association" },
      { name: "description", content: "Espacio de administración BBH." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function safeNext(next: string): string | null {
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  try {
    const url = new URL(next, "http://bbh.invalid");
    if (url.origin !== "http://bbh.invalid") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/**
 * Map known, safe Supabase Auth errors to Spanish; anything unexpected falls
 * back to a generic message so raw backend details never reach the visitor.
 */
function authErrorToEs(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials"))
    return "Email o contraseña incorrectos.";
  if (msg.includes("already registered") || msg.includes("email address is already"))
    return "Ya existe una cuenta con este email.";
  if (msg.includes("not confirmed") || msg.includes("email_not_confirmed"))
    return "Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
  if (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("over_request_rate_limit")
  )
    return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const target = safeNext(next ?? "");

  useEffect(() => {
    if (!hasBrowserSupabaseConfig()) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        if (target) window.location.replace(target);
        else navigate({ to: "/admin" });
      }
    });
  }, [navigate, target]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasBrowserSupabaseConfig()) return;
    setError(null);
    setLoading(true);
    const emailRedirectTo = target ? `${window.location.origin}${target}` : window.location.origin;
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password, options: { emailRedirectTo } });
    const { error } = await fn;
    setLoading(false);
    if (error) {
      setError(authErrorToEs(error.message));
      return;
    }
    if (target) window.location.replace(target);
    else navigate({ to: "/admin" });
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-16 -z-10 select-none text-center font-display text-[22vw] font-black leading-none tracking-tighter text-white/[0.035]">
          BBH
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl gap-16 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-electric-glow">
              <ShieldCheck className="size-3.5" /> Espacio privado
            </div>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-6xl">
              {mode === "signin" ? "Control Room" : "Crear cuenta"}
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground">
              Portal de administración reservado al equipo BBH. Los accesos de administrador se
              asignan manualmente — una cuenta de visitante no desbloquea nada del lado público.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Volver al sitio
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-surface/40 p-8 backdrop-blur-xl md:p-10">
            {!hasBrowserSupabaseConfig() && <p role="status" className="mb-5 border-l-2 border-electric pl-4 text-sm text-foreground">El acceso de administración estará disponible cuando se configure la conexión del sitio.</p>}
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Contraseña
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
                />
              </label>
              {error && (
                <p className="rounded-lg border border-blood/30 bg-blood/10 px-3 py-2 text-sm text-blood">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !hasBrowserSupabaseConfig()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-50"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {mode === "signin" ? "Iniciar sesión" : "Crear la cuenta"}
              </button>
            </form>

            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-6 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? "Crear cuenta" : "Ya tengo una cuenta"}
            </button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
