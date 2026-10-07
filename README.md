# BBH website — local development

This is a new, self-contained development copy of the existing BBH website. It keeps the TanStack Start routes, CMS, media tools, authentication and admin code, and adds an editorial visual home page. Nothing has been deployed or connected to a live database during this remodel.

## Run locally

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4174 --strictPort
```

Open <http://127.0.0.1:4174/>. Without Supabase credentials, public pages render from local reference content and show empty catalog states. Admin login is visibly unavailable. The contact form prepares an email in the visitor's mail app; it does not submit to a server or claim delivery.

`npm run typecheck` and `npm run build` verify the project. The local preview is intentionally marked `noindex`. Production indexing requires an explicit `VITE_PUBLIC_INDEXABLE=true` decision and a verified canonical URL.

## Source and visual provenance

- Code base: safe extracted copy of the supplied previous website at `C:\dev\bbh-reference-20261007`; no `.git`, secrets, `node_modules`, logs or generated build output were copied.
- Conceptual direction: supplied BBH universe at `C:\dev\bbh-universe`. Its formats are future scope, not announcements of active programs.
- Photography: four bundled images already present in the previous site's `src/assets`.
- Motion: GSAP ScrollTrigger drives the hero and a three-scene desktop narrative. `AnimatedContent` adapts a React Bits component; see [third-party notices](THIRD_PARTY_NOTICES.md). Visitors can pause or activate motion, and system reduced-motion settings are respected by default. The mobile story uses readable static panels.

See [content inventory](docs/CONTENT_INVENTORY.md) and [feature status](docs/FEATURES.md) before connecting a real backend or publishing.
