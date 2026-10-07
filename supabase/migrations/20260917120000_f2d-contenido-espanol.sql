-- F2-D APROBADA
-- Contenido visible en la web traducido a español (idioma por defecto).
-- Aditiva: solo UPDATEs sobre los seeds existentes; no borra nada.

-- 0) El español pasa a ser el idioma por defecto del sitio
update public.site_settings
   set default_locale = 'es',
       fallback_locale = 'es'
 where id = 1;

alter table public.site_settings alter column default_locale set default 'es';
alter table public.site_settings alter column fallback_locale set default 'es';

-- 1) site_settings (textos globales de marca/SEO)
update public.site_settings set
  tagline = 'Elevar la cultura urbana',
  default_description = 'BBH Association crea eventos, talleres y proyectos culturales en torno al rap y la música en Hauts-de-France.',
  ai_summary = 'BBH Association es una asociación cultural independiente de Hauts-de-France (Francia) dedicada a la cultura urbana. Organiza eventos en directo (BBH LIVE, open mics, showcases), dinamiza talleres de escritura de rap y de iniciación al estudio, acompaña a artistas emergentes y publica la música y el diario del artista REVERSEFLOW.',
  keywords = ARRAY['asociación cultura urbana','rap Hauts-de-France','taller escritura rap','showcase rap Lille','BBH Association','Reverseflow']
where id = 1;

-- 2) seo_pages: todas las páginas (label, título, descripciones)
update public.seo_pages set
  label = 'Inicio',
  title = 'BBH Association — Elevar la cultura urbana',
  description = 'Asociación de cultura urbana en Hauts-de-France: eventos en directo, talleres de escritura de rap, acompañamiento de artistas y proyectos musicales.',
  og_title = 'BBH Association — Elevar la cultura urbana',
  og_description = 'Eventos, talleres, artistas y proyectos culturales en torno al rap y la música.',
  ai_summary = 'Página de inicio de BBH Association: presentación del movimiento, cifras clave, pilares (eventos en directo, talleres creativos, red de artistas) y acceso a los eventos y al roster.',
  keywords = ARRAY['asociación cultura urbana','rap Hauts-de-France','BBH Association']
where page_key = 'home';

update public.seo_pages set
  label = 'Eventos',
  title = 'Eventos BBH — Shows, open mics y showcases',
  description = 'Todos los eventos BBH: BBH LIVE, open mics, showcases y encuentros en torno a la cultura urbana en Hauts-de-France.',
  og_title = 'Eventos BBH — Shows, open mics y showcases',
  og_description = 'Shows, open mics, showcases y encuentros en torno a la cultura urbana.',
  ai_summary = 'Programación de BBH Association: próximos eventos, formato insignia BBH LIVE, archivo de las noches pasadas y razones para venir.',
  keywords = ARRAY['concierto rap Lille','open mic Hauts-de-France','showcase rap']
where page_key = 'events';

update public.seo_pages set
  label = 'Talleres',
  title = 'Talleres BBH — Rap, escritura, estudio y expresión',
  description = 'Talleres de escritura de rap, iniciación a la grabación, expresión artística y acompañamiento de artistas para escuelas, MJC y entidades culturales.',
  og_title = 'Talleres BBH — Rap, escritura y estudio',
  og_description = 'Talleres accesibles y concretos para acompañar a los jóvenes y a los artistas emergentes.',
  ai_summary = 'Talleres ofrecidos por BBH Association: escritura de rap, iniciación a la grabación en estudio, expresión artística y acompañamiento de artistas. Formatos puntuales, ciclos o intervenciones a medida para escuelas, MJC, centros sociales y entidades.',
  keywords = ARRAY['taller escritura rap','taller estudio música','intervención escolar rap']
where page_key = 'workshops';

update public.seo_pages set
  label = 'Artistas',
  title = 'Artistas BBH — El roster',
  description = 'El roster BBH: REVERSEFLOW y los artistas acompañados por la asociación en torno a la escena urbana independiente.',
  og_title = 'Artistas BBH — El roster',
  og_description = 'Descubre a los artistas acompañados por BBH Association.',
  ai_summary = 'Roster de BBH Association. Artista principal: REVERSEFLOW, rapero y autor-compositor de Hauts-de-France.',
  keywords = ARRAY['artista rap independiente','Reverseflow','roster BBH']
where page_key = 'artists';

update public.seo_pages set
  label = 'Música',
  title = 'Música de REVERSEFLOW — Escucha y archivo · BBH',
  description = 'Escucha los temas de REVERSEFLOW: lanzamientos, archivo completo, letras, créditos y reproductor de audio integrado.',
  og_title = 'REVERSEFLOW — Música',
  og_description = 'Escucha los temas de REVERSEFLOW: lanzamientos, archivo y reproductor integrado.',
  ai_summary = 'Catálogo musical de REVERSEFLOW alojado por BBH Association: tema destacado, archivo de lanzamientos, escucha en línea, letras y créditos.',
  keywords = ARRAY['Reverseflow música','escuchar rap francés','nuevo tema rap']
where page_key = 'music';

update public.seo_pages set
  label = 'Diario',
  title = 'Diario de REVERSEFLOW — Estudio, sesiones y bastidores · BBH',
  description = 'El cuaderno de bitácora de REVERSEFLOW: sesiones de estudio, bastidores, fechas, inspiraciones y anuncios de lanzamientos.',
  og_title = 'Diario de REVERSEFLOW',
  og_description = 'Sesiones de estudio, bastidores, fechas e inspiraciones.',
  ai_summary = 'Diario de artista de REVERSEFLOW publicado por BBH Association: entradas sobre las sesiones de estudio, los bastidores, las fechas de conciertos y los lanzamientos.',
  keywords = ARRAY['diario artista rap','bastidores estudio rap','Reverseflow actualidad']
where page_key = 'journal';

update public.seo_pages set
  label = 'Sobre nosotros',
  title = 'Sobre nosotros — BBH Association',
  description = 'La historia, la visión, las misiones y los valores de BBH Association, asociación de cultura urbana de Hauts-de-France.',
  og_title = 'Sobre BBH Association',
  og_description = 'Creamos nuestros propios espacios para la cultura urbana.',
  ai_summary = 'Presentación de BBH Association: origen del proyecto, visión (conectar artistas, espacios y públicos), misiones (escenarios, acompañamiento, talleres, comunidad) y valores.',
  keywords = ARRAY['asociación cultural Hauts-de-France','asociación cultura urbana']
where page_key = 'about';

update public.seo_pages set
  label = 'Contacto',
  title = 'Contacto y partenariados — BBH Association',
  description = 'Contacta con BBH Association para un evento, un taller, un partenariado o un acompañamiento artístico.',
  og_title = 'Contacto — BBH Association',
  og_description = 'Artista, espacio, escuela o socio: construyamos algo juntos.',
  ai_summary = 'Página de contacto de BBH Association para solicitudes de eventos, talleres, partenariados y acompañamiento artístico.',
  keywords = ARRAY['contacto asociación rap','partenariado cultural Hauts-de-France']
where page_key = 'contact';

-- 3) nav_links: menú de cabecera y pie (mismas URL, etiquetas en español)
update public.nav_links set label = 'Inicio'        where url = '/';
update public.nav_links set label = 'Música'        where url = '/musique';
update public.nav_links set label = 'Eventos'       where url = '/evenements';
update public.nav_links set label = 'Talleres'      where url = '/ateliers';
update public.nav_links set label = 'Artistas'      where url = '/artistes';
update public.nav_links set label = 'Diario'        where url = '/journal';
update public.nav_links set label = 'Sobre nosotros' where url = '/a-propos';
update public.nav_links set label = 'Contacto'      where url = '/contact';

-- 4) site_content: textos CMS (heroes, botones, secciones)
update public.site_content set text_value = 'Asociación cultural · Hauts-de-France'            where content_key = 'home.hero.eyebrow';
update public.site_content set text_value = 'Elevar la cultura urbana'                         where content_key = 'home.hero.subtitle';
update public.site_content set text_value = 'Eventos, talleres y proyectos culturales en torno al rap y la música.' where content_key = 'home.hero.intro';
update public.site_content set text_value = 'Descubrir'                                        where content_key = 'home.hero.primary_button';
update public.site_content set text_value = 'Contáctanos'                                     where content_key = 'home.hero.secondary_button';
update public.site_content set text_value = 'Programación'                                     where content_key = 'events.hero.eyebrow';
update public.site_content set text_value = 'Eventos BBH'                                      where content_key = 'events.hero.title';
update public.site_content set text_value = 'Shows, open mics, showcases y encuentros en torno a la cultura urbana.' where content_key = 'events.hero.subtitle';
update public.site_content set text_value = 'Un formato pensado para dar a conocer a artistas independientes en un ambiente íntimo, enérgico y auténtico.' where content_key = 'events.featured.description';
update public.site_content set text_value = 'Próximos eventos'                                 where content_key = 'events.upcoming.title';
update public.site_content set text_value = 'Por el momento no hay próximos eventos.'          where content_key = 'events.upcoming.empty';
update public.site_content set text_value = 'Eventos pasados'                                  where content_key = 'events.past.title';
update public.site_content set text_value = 'Transmisión'                                      where content_key = 'workshops.hero.eyebrow';
update public.site_content set text_value = 'Talleres BBH'                                     where content_key = 'workshops.hero.title';
update public.site_content set text_value = 'Escritura, grabación, expresión y acompañamiento artístico.' where content_key = 'workshops.hero.subtitle';
update public.site_content set text_value = 'El colectivo'                                     where content_key = 'artists.hero.eyebrow';
update public.site_content set text_value = 'Artistas BBH'                                     where content_key = 'artists.hero.title';
update public.site_content set text_value = 'La escena que hace vivir el movimiento.'          where content_key = 'artists.hero.subtitle';
update public.site_content set text_value = 'Música'                                           where content_key = 'music.hero.title';
update public.site_content set text_value = 'Lanzamientos, canciones y universo sonoro de la escena BBH.' where content_key = 'music.hero.subtitle';
update public.site_content set text_value = 'Diario'                                           where content_key = 'journal.hero.eyebrow';
update public.site_content set text_value = 'El diario BBH'                                    where content_key = 'journal.hero.title';
update public.site_content set text_value = 'Bastidores, reflexiones y actualidad del colectivo.' where content_key = 'journal.hero.description';
update public.site_content set text_value = 'Nuestra historia'                                 where content_key = 'about.hero.eyebrow';
update public.site_content set text_value = 'Sobre nosotros'                                   where content_key = 'about.hero.title';
update public.site_content set text_value = 'Nuestra misión'                                   where content_key = 'about.mission.title';
update public.site_content set text_value = 'Escríbenos'                                       where content_key = 'contact.hero.eyebrow';
update public.site_content set text_value = 'Contacto'                                         where content_key = 'contact.hero.title';
update public.site_content set text_value = 'Partenariados, talleres, programación: hablemos.' where content_key = 'contact.hero.subtitle';
update public.site_content set text_value = 'Únete al movimiento BBH'                          where content_key = 'global.footer.cta_title';
update public.site_content set text_value = 'Contáctanos'                                      where content_key = 'global.footer.cta_button';

-- 5) artists: ficha de REVERSEFLOW
update public.artists set
  role = 'Fundador de BBH · Artista',
  origin = 'España / Francia',
  genres = array['Rap','Trap','Experimental'],
  bio = 'Artista español afincado en Francia, Reverseflow desarrolla un universo entre el rap, la energía del directo, la estética oscura y la visión independiente. A través de BBH crea sus propios espacios para conectar artistas, eventos y cultura urbana.',
  badge = 'Fundador / Artista BBH'
where slug = 'reverseflow';

-- 6) events: títulos y descripciones en español
update public.events set
  short_description = 'Showcases internacionales, ambiente urbano y artistas independientes reunidos en torno a la escena BBH.',
  full_description = 'BBH LIVE vuelve con una segunda edición en Lille Wazemmes. Una noche pensada para la escena: showcases internacionales, artistas independientes y un ambiente urbano íntimo y enérgico.'
where slug = 'bbh-live-vol-2-lille-wazemmes';

update public.events set
  title = 'Showcase de Reverseflow',
  short_description = 'Actuación en directo en torno al universo de Reverseflow y la escena BBH.',
  full_description = 'Un showcase dedicado por completo al universo de Reverseflow: directo, intercambio con el público y descubrimiento de la escena BBH.'
where slug = 'reverseflow-showcase';

update public.events set
  short_description = 'El primer BBH LIVE de todos, en Maubeuge.',
  full_description = 'Primera edición del formato insignia BBH LIVE, organizada en Maubeuge.'
where slug = 'bbh-live-vol-1-maubeuge';

update public.events set
  short_description = 'Escenario abierto para los artistas de la región.',
  full_description = 'Un escenario abierto donde cada artista puede venir a presentar su texto ante un público acogedor.'
where slug = 'open-mic-bbh';

update public.events set
  title = 'Encuentro de artistas independientes',
  short_description = 'Un espacio de intercambio entre artistas independientes de la escena urbana.',
  full_description = 'Encuentro profesional y humano entre artistas independientes: intercambio de experiencias, contactos y consejos.'
where slug = 'rencontre-artistes-independants';