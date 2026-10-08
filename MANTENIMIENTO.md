# Mantenimiento del sitio

El sitio tiene **7 idiomas**. El español está en la raíz; los demás en subcarpetas:

| Idioma | Carpeta | index |
|--------|---------|-------|
| Español | raíz | `index.html` |
| Inglés | `en/` | `en/index.html` |
| Italiano | `it/` | `it/index.html` |
| Francés | `fr/` | `fr/index.html` |
| Alemán | `de/` | `de/index.html` |
| Japonés | `ja/` | `ja/index.html` |
| Portugués | `pt/` | `pt/index.html` |

**Regla general:** casi cualquier texto que cambies en una página hay que
replicarlo en las 7 versiones, traducido.

---

## Próximas fechas (se actualizan solas desde una planilla)

**Las fechas ya no se editan en el HTML.** Se cargan en una planilla de Google
("Fechas de la Orquesta Invisible (alimenta la web)", cuenta
orquestatipicainvisible@gmail.com, pestaña **Fechas**). Un minuto después de cada edición,
un Apps Script ("Publicar fechas en la web", cuenta de la orquesta) avisa a GitHub y una tarea
(`.github/workflows/fechas.yml` + `scripts/build_fechas.pl`) lee la planilla; la web queda
actualizada en ~3 minutos. (El cron de GitHub cada 30 min queda de respaldo, pero es irregular.)
La tarea reescribe, en los 7 idiomas:

- las filas de "Próximas fechas" (zona marcada con `FECHAS:INICIO` / `FECHAS:FIN`),
- el JSON-LD de eventos (`SEO-BOOST: eventos`),
- la frase "Próxima fecha: …" de la bio en español.

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

**Si hay un error en la planilla** (una fecha que no se entiende, un link sin http, etc.)
la tarea falla y **no cambia nada del sitio**; GitHub manda un mail al dueño del
repositorio con la fila y el problema. Se corrige la planilla y en la próxima corrida
queda andando. Para forzar una corrida: GitHub → pestaña *Actions* → "Actualizar fechas
desde la planilla" → *Run workflow*.

**Otros puntos que siguen siendo manuales:**

1. **links.html** (los 7): el botón destacado de entradas (`link-featured`) apunta al
   Passline de la próxima fecha. Cuando esa fecha pasa, cambiarlo al de la siguiente
   (si todavía no hay link, ponerlo en la planilla cuando exista y dejar este botón apuntando a la home).
2. **Google Calendar / agenda aparte:** ya no existen. Se descartaron la página `agenda.html` y el
   calendario "Fechas invisibles"; las fechas solo se cargan en la planilla.
3. `sitemap.xml` **no** hace falta tocarlo (solo si agregás o quitás páginas).

**Cambiar cómo se ve una fila o los textos por idioma** (botón RESERVAR, formato de hora,
descripciones): está en `scripts/build_fechas.pl` (tablas al principio del archivo).
Para probarlo sin tocar el sitio real: `perl scripts/build_fechas.pl fechas.csv .` con un
CSV de prueba (variable `TODAY=AAAA-MM-DD` simula otro día).

**Ojo al subir cambios a mano:** la tarea hace commits en `main`. Antes de subir algo desde
la compu, traer los cambios (`git pull --rebase`) para no pisarlos.


---

## Notas de prensa nuevas

En los 7 `index.html`, dentro de `<div class="press-grid-horizontal">`, copiá un
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
  Si querés poner nombres propios, editá el `alt` en los 7 `index.html`.
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
