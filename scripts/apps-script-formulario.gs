/**
 * Formulario de fechas de la Orquesta Invisible (alta, edición y baja).
 *
 * Va en el MISMO proyecto de Apps Script "Publicar fechas en la web" (cuenta de la orquesta), como un
 * archivo más (Formulario.gs). Usa la función disparar_() que ya existe ahí para avisar a GitHub.
 *
 * Lo llama la página https://www.orquestainvisible.musica.ar/fechas/ (carpeta fechas/ del repo).
 * Escribe en la pestaña "Fechas" de la planilla (la misma que lee la web) y anota cada cambio en la
 * pestaña "Cambios". La clave que se comparte con la orquesta se guarda en Propiedades de script
 * como FORM_CODIGO (no está en este archivo).
 */

var FORM_SHEET_ID = '1UMtT92XTP9xrj_abXEV3wLVwNgxh3C5c-c_U3IOHH10';
var FORM_HOJA = 'Fechas';
var FORM_HOJA_CAMBIOS = 'Cambios';
var FORM_CAMPOS = ['fecha', 'hora', 'nombre', 'lugar', 'calle', 'ciudad', 'boton', 'link', 'precio', 'organiza', 'mostrar', 'pais', 'moneda'];

function doGet() {
  return formJson_({ ok: true, mensaje: 'Formulario de fechas de la Orquesta Invisible' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var tieneLock = false;
  try {
    var pedido = JSON.parse(e.postData.contents);
    var error = formAutenticar_(pedido);
    if (error) return formJson_({ ok: false, error: error });
    lock.waitLock(20000);
    tieneLock = true;
    var quien = String(pedido.quien).replace(/\s+/g, ' ').trim().slice(0, 40);

    if (pedido.accion === 'listar') return formJson_({ ok: true, filas: formListar_() });
    if (pedido.accion === 'guardar') return formJson_(formGuardar_(pedido, quien));
    if (pedido.accion === 'borrar') return formJson_(formBorrar_(pedido, quien));
    return formJson_({ ok: false, error: 'Acción desconocida.' });
  } catch (ex) {
    return formJson_({ ok: false, error: 'Algo falló: ' + ex.message });
  } finally {
    if (tieneLock) lock.releaseLock();
  }
}

// ---------- seguridad ----------
function formAutenticar_(p) {
  var cache = CacheService.getScriptCache();
  var fallos = Number(cache.get('fallos') || 0);
  if (fallos >= 15) return 'Demasiados intentos con la clave equivocada. Esperá 15 minutos.';
  var clave = PropertiesService.getScriptProperties().getProperty('FORM_CODIGO');
  if (!clave) return 'Falta configurar la clave del formulario.';
  if (!p || String(p.codigo || '') !== clave) {
    cache.put('fallos', String(fallos + 1), 900);
    return 'La clave no es correcta.';
  }
  if (!p.quien || String(p.quien).trim().length < 2) return 'Escribí tu nombre.';
  return null;
}

// ---------- planilla ----------
function formNorm_(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function formHoja_() {
  var hoja = SpreadsheetApp.openById(FORM_SHEET_ID).getSheetByName(FORM_HOJA);
  if (!hoja) throw new Error('No encuentro la pestaña "' + FORM_HOJA + '".');
  return hoja;
}

// Encuentra la fila de encabezados y en qué columna está cada dato (igual que la tarea que arma la web)
function formMapa_(hoja) {
  var ult = Math.min(hoja.getLastRow(), 15) || 1;
  var cab = hoja.getRange(1, 1, ult, hoja.getLastColumn()).getDisplayValues();
  for (var r = 0; r < cab.length; r++) {
    var hay = cab[r].some(function (c) { return /^fecha/.test(formNorm_(c)); });
    if (!hay) continue;
    var col = {};
    cab[r].forEach(function (c, i) {
      var h = formNorm_(c);
      var clave = /^fecha/.test(h) ? 'fecha' : /^hora/.test(h) ? 'hora' : /^nombre/.test(h) ? 'nombre' : /^lugar/.test(h) ? 'lugar'
        : /^calle/.test(h) ? 'calle' : /^ciudad/.test(h) ? 'ciudad' : /^bot/.test(h) ? 'boton' : /^link/.test(h) ? 'link'
        : /^precio/.test(h) ? 'precio' : /^organiza/.test(h) ? 'organiza' : /^mostrar/.test(h) ? 'mostrar'
        : /^pais/.test(h) ? 'pais' : /^moneda/.test(h) ? 'moneda' : null;
      if (clave && col[clave] === undefined) col[clave] = i + 1;
    });
    ['fecha', 'hora', 'nombre'].forEach(function (k) {
      if (!col[k]) throw new Error('Falta la columna "' + k + '" en la planilla.');
    });
    return { filaCab: r + 1, col: col };
  }
  throw new Error('No encuentro la fila de encabezados de la planilla.');
}

function formHuella_(f) {
  return [f.fecha, f.hora, f.nombre, f.lugar].join('|');
}

function formLeerFila_(hoja, mapa, fila) {
  var ancho = hoja.getLastColumn();
  var v = hoja.getRange(fila, 1, 1, ancho).getDisplayValues()[0];
  var o = { fila: fila };
  FORM_CAMPOS.forEach(function (k) { o[k] = mapa.col[k] ? String(v[mapa.col[k] - 1]).trim() : ''; });
  o.huella = formHuella_(o);
  return o;
}

function formListar_() {
  var hoja = formHoja_();
  var mapa = formMapa_(hoja);
  var ult = hoja.getLastRow();
  var filas = [];
  for (var r = mapa.filaCab + 1; r <= ult; r++) {
    var f = formLeerFila_(hoja, mapa, r);
    if (!f.nombre && !f.fecha) continue;
    filas.push(f);
  }
  return filas;
}

function formUltimaFilaConDatos_(hoja, mapa) {
  var ult = hoja.getLastRow();
  var vals = hoja.getRange(1, 1, ult, hoja.getLastColumn()).getDisplayValues();
  for (var r = vals.length - 1; r >= mapa.filaCab; r--) {
    if (String(vals[r][mapa.col.fecha - 1]).trim() || String(vals[r][mapa.col.nombre - 1]).trim()) return r + 1;
  }
  return mapa.filaCab;
}

// ---------- validación (las mismas reglas que la tarea que arma la web) ----------
function formValidar_(d) {
  var x = {};
  x.nombre = String(d.nombre || '').trim();
  if (!x.nombre) return { error: 'Falta el nombre del evento.' };

  var m = String(d.fecha || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return { error: 'La fecha no se entiende.' };
  var dia = +m[1], mes = +m[2], anio = +m[3];
  var chk = new Date(Date.UTC(anio, mes - 1, dia, 12));
  if (mes < 1 || mes > 12 || chk.getUTCDate() !== dia || chk.getUTCMonth() !== mes - 1) return { error: 'Esa fecha no existe.' };
  x.fecha = ('0' + dia).slice(-2) + '/' + ('0' + mes).slice(-2) + '/' + anio;

  var hora = String(d.hora || '').trim();
  if (hora) {
    var h = hora.match(/^(\d{1,2}):(\d{2})$/);
    if (!h || +h[1] > 23 || +h[2] > 59) return { error: 'La hora no se entiende (usar HH:MM).' };
    x.hora = ('0' + h[1]).slice(-2) + ':' + h[2];
  } else {
    x.hora = '';
  }

  x.lugar = String(d.lugar || '').trim();
  x.calle = String(d.calle || '').trim();
  x.ciudad = String(d.ciudad || '').trim();

  x.link = String(d.link || '').trim();
  if (x.link && !/^https?:\/\//i.test(x.link)) return { error: 'El link tiene que empezar con http:// o https://' };
  x.boton = String(d.boton || '').trim();
  if (x.boton && x.boton !== 'Reservar' && x.boton !== 'Más info') return { error: 'El botón tiene que ser Reservar o Más info.' };
  if (x.boton && !x.link) return { error: 'Elegiste un botón pero falta el link.' };

  var p = String(d.precio == null ? '' : d.precio).trim();
  if (p === '') {
    x.precio = '';
  } else {
    var n = Number(p.replace(/[^\d.,]/g, '').replace(/[.,](?=\d{3}(?:\D|$))/g, '').replace(',', '.'));
    if (isNaN(n) || n < 0 || !/\d/.test(p)) return { error: 'El precio no se entiende (poné solo el número, 0 si es gratis).' };
    x.precio = n;
  }

  x.organiza = d.organiza === 'SÍ' ? 'SÍ' : 'NO';
  x.mostrar = d.mostrar === 'NO' ? 'NO' : 'SÍ';
  return { datos: x };
}

function formEscribir_(hoja, mapa, fila, x) {
  ['fecha', 'hora'].forEach(function (k) {
    if (!mapa.col[k]) return;
    var c = hoja.getRange(fila, mapa.col[k]);
    c.setNumberFormat('@');
    c.setValue(x[k]);
  });
  ['nombre', 'lugar', 'calle', 'ciudad', 'boton', 'link', 'precio', 'organiza', 'mostrar'].forEach(function (k) {
    if (!mapa.col[k]) return;
    hoja.getRange(fila, mapa.col[k]).setValue(x[k]);
  });
}

function formGuardar_(pedido, quien) {
  var v = formValidar_(pedido.datos || {});
  if (v.error) return { ok: false, error: v.error };
  var x = v.datos;
  var hoja = formHoja_();
  var mapa = formMapa_(hoja);
  var accion, fila;

  if (pedido.fila) {
    fila = Number(pedido.fila);
    if (!(fila > mapa.filaCab && fila <= hoja.getLastRow())) return { ok: false, error: 'No encuentro esa fecha. Recargá la lista.' };
    var actual = formLeerFila_(hoja, mapa, fila);
    if (actual.huella !== pedido.huella) return { ok: false, error: 'Alguien cambió esta fecha mientras la editabas. Recargá la lista y probá de nuevo.' };
    accion = 'Editó';
  } else {
    fila = formUltimaFilaConDatos_(hoja, mapa) + 1;
    accion = 'Agregó';
  }
  formEscribir_(hoja, mapa, fila, x);
  SpreadsheetApp.flush();
  formAnotar_(quien, accion, x.fecha + ' ' + x.hora + ' · ' + x.nombre + ' · ' + x.lugar);
  formAvisarWeb_();
  return { ok: true, mensaje: accion === 'Agregó' ? 'Fecha agregada.' : 'Cambios guardados.', filas: formListar_() };
}

function formBorrar_(pedido, quien) {
  var hoja = formHoja_();
  var mapa = formMapa_(hoja);
  var fila = Number(pedido.fila);
  if (!(fila > mapa.filaCab && fila <= hoja.getLastRow())) return { ok: false, error: 'No encuentro esa fecha. Recargá la lista.' };
  var actual = formLeerFila_(hoja, mapa, fila);
  if (actual.huella !== pedido.huella) return { ok: false, error: 'Alguien cambió esta fecha mientras mirabas. Recargá la lista y probá de nuevo.' };
  // se anota TODO lo que tenía, para poder recuperarla
  var copia = FORM_CAMPOS.map(function (k) { return k + '=' + actual[k]; }).join(' | ');
  formAnotar_(quien, 'Borró', copia);
  hoja.deleteRow(fila);
  SpreadsheetApp.flush();
  formAvisarWeb_();
  return { ok: true, mensaje: 'Fecha borrada. Quedó anotada en la pestaña Cambios.', filas: formListar_() };
}

function formAnotar_(quien, accion, detalle) {
  var ss = SpreadsheetApp.openById(FORM_SHEET_ID);
  var hoja = ss.getSheetByName(FORM_HOJA_CAMBIOS);
  if (!hoja) {
    hoja = ss.insertSheet(FORM_HOJA_CAMBIOS);
    hoja.appendRow(['Cuándo', 'Quién', 'Qué hizo', 'Detalle']);
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, 4).setFontWeight('bold');
  }
  var cuando = Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy HH:mm');
  hoja.appendRow([cuando, quien, accion, detalle]);
}

function formAvisarWeb_() {
  try {
    if (typeof disparar_ === 'function') disparar_();
  } catch (e) {
    console.log('No se pudo avisar a GitHub: ' + e.message);
  }
}

function formJson_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
