# Mantenimiento del sitio

El sitio tiene **6 idiomas**. El español está en la raíz; los demás en subcarpetas:

| Idioma | Carpeta | index |
|--------|---------|-------|
| Español | raíz | `index.html` |
| Inglés | `en/` | `en/index.html` |
| Italiano | `it/` | `it/index.html` |
| Francés | `fr/` | `fr/index.html` |
| Alemán | `de/` | `de/index.html` |
| Japonés | `ja/` | `ja/index.html` |

**Regla general:** casi cualquier texto que cambies en una página hay que
replicarlo en las 6 versiones, traducido.

---

## Después de cada fecha (concierto / milonga)

En los **6 `index.html`**, sección `<section id="conciertos">` ("Próximas fechas"):

1. **Borrar** el bloque `<div class="show-row reveal"> … </div>` de la fecha que
   ya pasó.
2. Si esa fecha era la **primera** (la que se ve sin desplegar), subí la
   siguiente: sacá una `<div class="show-row reveal">` de adentro de
   `<div id="extra-shows" style="display: none;">` y ponela como primera.
3. **Agregar** las fechas nuevas al final, en orden cronológico. Cada fila:

   ```html
   <div class="show-row reveal">
       <div class="show-date">DD.MM.AA </div>          <!-- japonés: AAAA.MM.DD -->
       <div class="show-info">
           <h3>NOMBRE DEL LUGAR</h3>
           <p>HH:MM HS - Dirección, CABA</p>            <!-- traducir hora y "HS" -->
       </div>
       <div class="show-action">
           <a href="URL-DE-ENTRADAS" target="_blank" class="btn-ticket">RESERVAR</a>
       </div>
   </div>
   ```

   - El link de entradas es de Passline (uno por fecha).
   - Si no hay link de entradas todavía, poné
     `<a href="agenda.html" class="btn-ticket">+INFO</a>`.
   - Traducciones del botón: RESERVAR / BOOK NOW / PRENOTA / RÉSERVER / RESERVIEREN / 予約する
   - Traducciones de "HS": HS / PM / — / — / Uhr / (nada; en japonés va `21:00 ／ …`)

4. **Bio:** solo en `index.html` (ES), el último párrafo de `<section id="bio">`
   dice *"Próxima fecha: Sábado XX de … de 20XX"*. Actualizala o borrá esa frase.

5. `sitemap.xml` **no** hace falta tocarlo (solo si agregás o quitás páginas).

---

## Notas de prensa nuevas

En los 6 `index.html`, dentro de `<div class="press-grid-horizontal">`, copiá un
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
  Si querés poner nombres propios, editá el `alt` en los 6 `index.html`.
- **Relatos**: el retrato del autor está en `Fotos/integrantes/`. Para cambiarlo,
  reemplazá el archivo con el mismo nombre. Si falta, la foto se oculta sola.

---

## Traducciones pendientes de revisión nativa

Alemán, italiano, francés y **japonés** se hicieron con IA. Cuando tengas la
revisión de alguien nativo, reemplazá el texto en la carpeta del idioma
(`de/`, `it/`, `fr/`, `ja/`). Prioridad: japonés y alemán.

---

## Publicar los cambios

1. En **GitHub Desktop**: escribí un resumen abajo a la izquierda y "Commit to …".
2. Botón **"Push origin"** (si estás en `main`), o **"Publish branch"** + Pull
   Request si querés revisar antes de que salga en vivo.
3. El sitio se actualiza solo en ~1 minuto.

> Si después de publicar ves algo "sin estilo" o una foto deformada, casi seguro
> es tu navegador con el CSS viejo en caché: recargá con **Ctrl + Shift + R**.
