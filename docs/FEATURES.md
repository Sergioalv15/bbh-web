# Feature status and launch checks

The following public routes render locally without a backend: home, events, workshops, artists, music, journal, about, contact and auth. Existing detail routes, admin panels and server functions remain in the project. Content lists are empty until Supabase is configured; this is explicit local reference behavior, not fetched data.

The home page uses a GSAP scroll-linked hero and pinned image narrative on desktop. Mobile presents the three scenes as normal document sections. Motion can be toggled, and the OS reduced-motion preference starts it off. The React Bits-derived entry effect is limited to the manifesto section.

Before production, provide the documented Supabase environment variables, verify the database migrations and roles, test uploads/auth/contact flow against a staging instance, replace the previous site's canonical URL and social image, review all CMS text and dated events, confirm image rights and React Bits/GSAP licensing, and deliberately enable indexing. Do not copy credentials into this repository.

Known inherited security concern: `src/lib/media.functions.ts` contains a permissive `pathIsPublic()` check for private media signed URLs. Audit and constrain it to published content before connecting production data. This remodel did not run a live database, media storage or deployment. The contact form currently opens the visitor's email app; a server delivery workflow would require a separate integration and end-to-end verification.
