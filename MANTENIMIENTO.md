# Mantenimiento del sitio

El sitio tiene **3 idiomas**. El español está en la raíz; los demás en subcarpetas:

| Idioma | Carpeta | index |
|--------|---------|-------|
| Español | raíz | `index.html` |
| Inglés | `en/` | `en/index.html` |
| Alemán | `de/` | `de/index.html` |

**Regla general:** casi cualquier texto que cambies en una página hay que
replicarlo en las 3 versiones, traducido.

**Idiomas que se sacaron (21/10/2026):** italiano, portugués, francés y japonés. Sus carpetas
(`it/`, `pt/`, `fr/`, `ja/`) ya no tienen contenido: cada página es un aviso mínimo que
redirige (meta refresh + JavaScript + `canonical`) a la equivalente: italiano y portugués van al
español; francés y japonés, al inglés. No hace falta mantenerlas ni agregarles nada. Se sacaron
del menú de idiomas, de los `hreflang`, del `sitemap.xml` y del script de fechas. Quien quiera
leer la web en otro idioma puede usar el traductor del navegador. Para volver a sumar un idioma
habría que recrear la carpeta completa. Recomendado (lo hace la persona dueña de Cloudflare):
agregar ahí reglas de redirección permanente (301) de `/it/*`, `/pt/*` → español y `/fr/*`,
`/ja/*` → inglés, que es más fuerte para Google que el aviso.

--------|---------|-------|
| Español | raíz | `index.html` |
| Inglés | `en/` | `en/index.html` |
| Italiano | `it/` | `it/index.html` |
| Francés | `fr/` | `fr/index.html` |
| Alemán | `de/` | `de/index.html` |
| Japonés | `ja/` | `ja/index.html` |
| Portugués | `pt/` | `pt/index.html` |

**Regla general:** casi cualquier texto que cambies en una página hay que
replicarlo en las 3 versiones, traducido.

---

## Próximas fechas (se actualizan solas desde una planilla)

**Las fechas ya no se editan en el HTML.** Se cargan en una planilla de Google
("Fechas de la Orquesta Invisible (alimenta la web)", cuenta
orquestatipicainvisible@gmail.com, pestaña **Fechas**). Un minuto después de cada edición,
un Apps Script ("Publicar fechas en la web", cuenta de la orquesta) avisa a GitHub y una tarea
(`.github/workflows/fechas.yml` + `scripts/build_fechas.pl`) lee la planilla; la web queda
actualizada en ~3 minutos. (El cron de GitHub cada 30 min queda de respaldo, pero es irregular.)
La tarea reescribe, en los 3 idiomas:

- las filas de "Próximas fechas" (zona marcada con `FECHAS:INICIO` / `FECHAS:FIN`),
- el JSON-LD de eventos (`SEO-BOOST: eventos`),
- la frase "Próxima fecha: …" de la bio en español: es la próxima fecha del **ciclo en La Tierra
  Invisible** (filas cuyo Lugar dice "La Tierra Invisible" o cuya calle es Centenera 1099), no
  la próxima fecha a secas. Si no hay ninguna cargada, dice "a confirmar".

**Qué hacer:** agregar, editar o borrar filas en la planilla (la pestaña "Cómo usar"
explica cada columna). Se ven siempre las 2 próximas fechas y el resto aparece al tocar
"ver todas las fechas" (cambiable con `$VISIBLES` en el script). Los shows pasados
desaparecen solos y una fila con fecha pasada se ignora aunque tenga otros datos raros.
No hace falta tocar el sitio.

**Botón de cada fecha:** en la planilla, la columna "Botón" es un menú con dos opciones.
*Reservar* muestra el botón RESERVAR (traducido) con el link de entradas (Passline).
*Más info* muestra +INFO y abre la página del evento (por ejemplo la de la Milonga Federal).
Si se deja vacío, esa fecha **no muestra botón** (no hay nada automático). Si se elige un botón
hay que cargar también el Link; si falta, la tarea avisa con un error y no cambia nada.

**No editar a mano** esas zonas en los `index.html`: la próxima corrida las pisa.

**Apps Script del aviso:** proyecto independiente "Publicar fechas en la web" (script.google.com,
cuenta de la orquesta). Usa un token de GitHub (fine-grained, solo el repo, permiso Actions: Read and write)
guardado en Configuración del proyecto → Propiedades de script → `GITHUB_TOKEN`. Si el token vence,
crear otro, reemplazar esa propiedad y correr `configurar` de nuevo. Para publicar sin editar la
planilla: correr `publicarAhora` desde el editor.

**Formulario para cargar fechas sin entrar a la planilla:** `https://www.orquestainvisible.musica.ar/fechas/`
(carpeta `fechas/` del repo; `fechas.orquestainvisible.musica.ar` redirige ahí). Pide nombre y la clave de la
orquesta; permite agregar, editar y borrar fechas. Por detrás escribe en la misma pestaña "Fechas" y anota cada
cambio (quién, cuándo y todo lo que se borró) en la pestaña **Cambios** de la planilla, y avisa a GitHub.
- El código está en `scripts/apps-script-formulario.gs`: va como archivo "Formulario" en el proyecto de Apps Script
  "Publicar fechas en la web" (el mismo del aviso a GitHub).
- La **clave** está en Propiedades de script → `FORM_CODIGO`. Para cambiarla, se cambia ahí (y se avisa a la orquesta).
- La dirección de la implementación (Aplicación web, termina en `/exec`) está en `fechas/index.html`, variable `URL_SCRIPT`.
  Si se crea una implementación nueva, cambiar esa línea. Si solo se edita el código, usar "Administrar implementaciones →
  editar → Versión nueva" para que no cambie la dirección.
- Si alguien borra una fecha por error, está completa en la pestaña Cambios.
- La planilla sigue funcionando igual si alguien la edita directo.

**Si hay un error en la planilla** (una fecha que no se entiende, un link sin http, etc.)
la tarea falla y **no cambia nada del sitio**; GitHub manda un mail al dueño del
repositorio con la fila y el problema. Se corrige la planilla y en la próxima corrida
queda andando. Para forzar una corrida: GitHub → pestaña *Actions* → "Actualizar fechas
desde la planilla" → *Run workflow*.

**Otros puntos que siguen siendo manuales:**

1. **links.html** (los 7): el botón destacado de entradas (`link-featured`) apunta a la cartelera
   propia (`https://entradas.orquestainvisible.musica.ar`), así que ya no hay que cambiarlo fecha a fecha.
2. **Google Calendar / agenda aparte:** ya no existen. Se descartaron la página `agenda.html` y el
   calendario "Fechas invisibles"; las fechas solo se cargan en la planilla.
3. `sitemap.xml` **no** hace falta tocarlo (solo si agregás o quitás páginas).
4. **Bandsintown:** cada fecha nueva hay que cargarla también en Bandsintown for Artists
   (página de la orquesta: https://www.bandsintown.com/a/15651746-orquesta-invisible).
   **Spotify toma los conciertos de ahí** (y los muestra en el perfil de la orquesta en ~24 h);
   la planilla no los manda sola.

**Cambiar cómo se ve una fila o los textos por idioma** (botón RESERVAR, formato de hora,
descripciones): está en `scripts/build_fechas.pl` (tablas al principio del archivo).
Para probarlo sin tocar el sitio real: `perl scripts/build_fechas.pl fechas.csv .` con un
CSV de prueba (variable `TODAY=AAAA-MM-DD` simula otro día).

**Ojo al subir cambios a mano:** la tarea hace commits en `main`. Antes de subir algo desde
la compu, traer los cambios (`git pull --rebase`) para no pisarlos.


---

## Orden de la página (pedido de la orquesta, 19/10/2026)

Portada (con los botones a Próximas fechas y al disco) → **Fotos** (sin título visible; el
título queda oculto para buscadores) → **Sobre nosotros** → **En vivo** (videos, avanzan solos)
→ **Prensa** (las notas avanzan solas; se frenan con el mouse encima o al usar las flechas)
→ **Integrantes** → **Relatos** (también avanzan solos) → **Huella** → **Próximas fechas** → **Material de descarga**
(press kit) → redes y contacto. El menú sigue el mismo orden. Si se cambia el orden, hacerlo
igual en los 3 `index.html`.

## Disco e integrantes

- **«Huella»** (`<section id="huella">`): tapa en `Fotos/huella-tapa.webp`,
  año y los 11 temas en orden de Spotify, con botón al álbum. Si sale otro disco, se agrega una
  sección igual en los 3 `index.html` (y en el JSON-LD `album` del grupo).
- **Integrantes** (`<section id="integrantes">`): foto, nombre e instrumento en los 3 idiomas.
  Retratos 4:5 en `Fotos/integrantes/retratos/<nombre-apellido>.webp` (480×600), con el crédito
  debajo de la grilla. **Al tocar la foto se abre la biografía**: el texto de cada uno está en un
  `<template id="bio-<nombre-apellido>">` dentro de la misma página (así Google lee las biografías). Las biografías salen del documento de la orquesta (Google Docs). Si cambia la
  formación, actualizar la grilla y las biografías en los 3 `index.html` y la lista `member` del
  JSON-LD del grupo.

## Google (título y descripción)

En el `<head>` de cada `index.html`, el título (`<title>`, `og:title`, `twitter:title`) y la
descripción (`description`, `og:description`, `twitter:description`) van **iguales** entre sí y
traducidos en los 3 idiomas. Apuntan a búsquedas como "tango contemporáneo", "tango actual",
"nuevo tango" y "orquesta típica". Los géneros están en el JSON-LD del grupo (`genre`).

## Reproductor de Spotify

El reproductor flotante arranca **cerrado** en compu y celular: se ve el botón redondo y al
tocarlo se abre (y recién ahí se baja de Spotify). Está en `script.js` ("Reproductor de Spotify").

## Estilos

Todo el sitio comparte una sola línea: fondo negro, rojo tango (`--accent-color`), títulos y
botones en Oswald, textos en Roboto Mono. Las reglas que la unifican (botones, tarjetas,
fotos, flechas, ancho de contenido de 1200 px) están al final de `style.css`, en el bloque
«MEJORAS (octubre 2026)». Si se cambia `style.css`, subir el número de `?v=` en los
`<link>` de los 3 `index.html` y de los relatos, para que nadie vea la versión vieja.

El menú de tres rayitas se usa hasta 1279 px de ancho (celulares y tablets); de ahí para arriba,
el menú horizontal. Si se agrega una sección al menú, revisar que en 1280 px siga entrando en
un renglón en los 3 idiomas (el japonés es el más largo).

## Press kit (descargas)

En la sección Material de descarga, al final de la página (`<section id="descargas">`, dentro
`<div class="press-kit-container" id="press-kit">`), hay una tarjeta por archivo
(con botones ES / EN) y se descargan directo desde la web los archivos de la carpeta `press-kit/`:

| Archivo | Qué es |
|---------|--------|
| `orquesta-invisible-dossier-es.pdf` / `-en.pdf` | Dossier |
| `orquesta-invisible-rider-es.pdf` / `-en.pdf` | Rider técnico |
| `orquesta-invisible-bio-es.docx` / `-en.docx` | Bio corta y larga (Word, para copiar) |
| `orquesta-invisible-logo.zip` | Logo negro y blanco (para imprimir y para web) |

Para actualizar uno, **reemplazar el archivo con el mismo nombre** y subir: no hay que tocar los
HTML. "Fotos en alta" lleva a la carpeta del Drive. El botón "EPK" del pie y el de `links.html`
llevan a este bloque.

## Medición de clics

`medicion.js` (cargado en las 42 páginas) avisa a Google Analytics cuando alguien toca:
`clic_reservar`, `clic_mas_info_fecha` (con la fecha), `clic_contrataciones`, `clic_mail`,
`clic_press_kit` (con el archivo), `clic_nota_prensa` (con el medio), `clic_portada_fechas`,
`clic_portada_disco`, `clic_spotify`, `abrir_reproductor_spotify`, `ver_video`,
`clic_instagram` y `clic_youtube`. Se ven en Google Analytics → Informes → Interacción →
Eventos (tardan hasta 48 h en aparecer; en "Tiempo real" se ven al momento).

## Notas de prensa nuevas

En los 3 `index.html`, dentro de `<div class="press-grid-horizontal">`, copiá un
bloque `<div class="press-card"> … </div>` y completá fecha, medio, cita, imagen y
enlace. Poné la foto del portal en `Prensa/`.

- Orden acordado: las **2 primeras** tarjetas son la nota más reciente de
  **Página 12** y de **Tango 21**; el resto por fecha (más nueva primero).
- No repetir medio, salvo Página 12 y Tango 21 (dos de cada uno).
- Botón según el tipo: `LEER NOTA →` (nota escrita) o `VER ENTREVISTA →` /
  `ESCUCHAR →` (radio / video). Traducirlo en cada idioma.

---

## Fotos

- **Galería** (`<section id="galeria">`): cada `<img>` tiene un `alt` descriptivo
  en el idioma de la página. Hoy dice el rol del músico ("bandoneonista", etc.).
  Si querés poner nombres propios, editá el `alt` en los 3 `index.html`.
- **Relatos**: el retrato del autor está en `Fotos/integrantes/`. Para cambiarlo,
  reemplazá el archivo con el mismo nombre. Si falta, la foto se oculta sola.

---

## Traducciones pendientes de revisión nativa

Alemán, italiano, francés, **japonés** y **portugués** se hicieron con IA. Cuando
tengas la revisión de alguien nativo, reemplazá el texto en la carpeta del idioma
(`de/`, `it/`, `fr/`, `ja/`, `pt/`). Prioridad: japonés y alemán.

---

## Publicar los cambios

1. En **GitHub Desktop**: escribí un resumen abajo a la izquierda y "Commit to …".
2. Botón **"Push origin"** (si estás en `main`), o **"Publish branch"** + Pull
   Request si querés revisar antes de que salga en vivo.
3. El sitio se actualiza solo en ~1 minuto.

> Si después de publicar ves algo "sin estilo" o una foto deformada, casi seguro
> es tu navegador con el CSS viejo en caché: recargá con **Ctrl + Shift + R**.

## Favicon y logo en la barra (21/10/2026)

- **Favicon:** terracota (`#c65d3e`), el anillo con la "I" y tres ondas, sin texto. Archivos en la raíz:
  `favicon.svg`, `favicon.ico` (16/32/48), `favicon.png` (64) y `apple-touch-icon.png` (180, fondo negro).
  Están enlazados en el `<head>` de todas las páginas con `?v=2` (si se cambia el dibujo, subir ese número).
  Las fuentes de diseño y el logo grande con texto están en la carpeta `Logo bandoneón (propuesta)` del escritorio.
- **Barra fija de arriba:** en `index.html`, `en/` y `de/`, al bajar más de 50 px la barra se pone negra y
  aparece el logo (la marca `favicon.svg` + "ORQUESTA INVISIBLE"). Lo hace `script.js` (agrega la clase
  `scrolled`) y el estilo está al final de `style.css`.

## Velocidad (21/10/2026)

Medido en celular con conexión lenta (1,6 Mbps) y caché vacía: antes la página bajaba ~2,2 MB y 44 archivos
antes de poder mostrarse (la portada tardaba ~11 s); ahora baja ~0,5 MB de imágenes y la portada aparece en ~3 s.
Qué se hizo y qué hay que respetar:

- **Fotos de la galería:** llevan `data-src="Fotos/N.webp"` (no `src`) y `script.js` las baja cuando se acercan
  a la pantalla. Para sumar una foto, copiá una línea de `<div class="swiper-slide">` y respetá `data-src`,
  `width` y `height`; no uses `loading="lazy"` en esa galería.
- **Portada:** cada foto tiene dos tamaños, `fotoN.webp` (compu, 1920 px) y `fotoN-m.webp` (celular, 960 px).
  Si cambiás una foto de la portada, generá las dos. La primera está en el CSS (`.hero-primera`) y precargada
  en el `<head>`; las otras salen de `data-bg` / `data-bg-m`.
- **Swiper** está en `vendor/swiper/` (versión 11.2.10), ya no se baja de un CDN.
- **Google Analytics** se carga 1,5 s después de que la página terminó de cargar, para no competir con las fotos.
- Las fotos originales pesadas (`Fotos/*.jpg`, 106 MB) están en el repositorio pero la web **no las usa**;
  sólo se usan los `.webp`. No las linkees desde la web.

### Segunda tanda de velocidad (21/10/2026)

- **Biografías:** se probó sacarlas a archivos aparte, pero se volvió atrás (21/10/2026): quedan dentro de cada `index.html`, en `<template>`, porque así Google lee ese texto como parte de la página.
- **Tipografías propias:** Oswald (700) y Roboto Mono están en `fonts/` y declaradas en un `<style>` del `<head>`;
  ya no se piden a Google Fonts.
- **Swiper se baja sólo cuando hace falta** (al acercarse a un carrusel o 2,5 s después de cargar). Lo pide `script.js`; ya no hay
  `<script>` de Swiper en el HTML.
- **Google Analytics** se carga con el primer toque, scroll o movimiento del mouse (o a los 6 s). Está en un script chico de cada `<head>`.
- **Miniaturas de los videos** de "En vivo": `Fotos/videos/<id-de-YouTube>.webp` (antes se bajaban de YouTube). Si se agrega un video,
  guardar su miniatura ahí (`https://i.ytimg.com/vi_webp/<id>/sddefault.webp`).
