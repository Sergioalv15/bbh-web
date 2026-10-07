import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { siteImagesQueryOptions } from "@/hooks/use-site-images";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { PlayerProvider } from "@/contexts/player-context";
import { LocaleProvider } from "@/lib/i18n";
import { GlobalPlayerBar } from "@/components/player/GlobalPlayerBar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página no se ha cargado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo salió mal de nuestro lado. Puedes intentar recargar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ loaderData }) => {
    const settings = (loaderData as SeoConfig | undefined)?.settings;

    const meta: Array<Record<string, unknown>> = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0a0a0f" },
      { name: "author", content: settings?.siteName ?? "BBH Association" },
      { property: "og:site_name", content: settings?.siteName ?? "BBH Association" },
      { property: "og:locale", content: "es_ES" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "BBH Association — Elevar la cultura urbana" },
      {
        name: "description",
        content:
          settings?.defaultDescription ??
          "BBH Association crea eventos, talleres y proyectos culturales alrededor del rap y la música en Hauts-de-France.",
      },
    ];
    if (settings?.googleSiteVerification) {
      meta.push({ name: "google-site-verification", content: settings.googleSiteVerification });
    }
    if (settings?.bingSiteVerification) {
      meta.push({ name: "msvalidate.01", content: settings.bingSiteVerification });
    }

    return {
      meta,
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
        },
      ],
      scripts: settings
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify(organizationJsonLd(settings)),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify(websiteJsonLd(settings)),
            },
          ]
        : [],
    };
  },
  shellComponent: RootShell,
  loader: async ({ context }) => {
    // Prime the editable-media cache during SSR so images render in the
    // first HTML payload (no flash, better LCP).
    context.queryClient.ensureQueryData(siteImagesQueryOptions);
    return context.queryClient.ensureQueryData(seoQueryOptions);
  },
  component: RootComponent,

  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <PlayerProvider>
          <div className="pb-24">
            <Outlet />
          </div>
          <GlobalPlayerBar />
        </PlayerProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
