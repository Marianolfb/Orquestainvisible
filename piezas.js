// Dossier interactivo y rider técnico: navegación, entrada de secciones, galería ampliada, videos,
// integrantes y botones de copiar. Sin librerías. Si este archivo no carga, todo el contenido se ve igual.
(function () {
    'use strict';
    var root = document.documentElement;
    root.classList.add('js-ok');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Entrada animada de cada sección (con movimiento reducido, todo se muestra directo) ----
    var reveals = [].slice.call(document.querySelectorAll('.reveal'));
    if (reduce || !('IntersectionObserver' in window)) {
        reveals.forEach(function (e) { e.classList.add('visible'); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
        reveals.forEach(function (e) { io.observe(e); });
    }

    // ---- Alto real de la barra fija (para que los títulos no queden tapados al saltar a una sección) ----
    var barra = document.getElementById('barra');
    function medirBarra() {
        if (barra) root.style.setProperty('--barra-h', barra.offsetHeight + 'px');
    }
    medirBarra();
    window.addEventListener('resize', medirBarra);

    // ---- Menú de secciones: marca la sección que se está leyendo ----
    var nav = document.querySelector('.secciones');
    var enlaces = nav ? [].slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
    var secciones = enlaces.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var actual = null, pendiente = false;
    function marcar() {
        pendiente = false;
        var tope = (barra ? barra.offsetHeight : 90) + 120, elegido = null, i;
        for (i = 0; i < secciones.length; i++) {
            var s = secciones[i];
            if (s && !s.hidden && s.getBoundingClientRect().top <= tope) elegido = i;
        }
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
            for (i = secciones.length - 1; i >= 0; i--) { if (secciones[i] && !secciones[i].hidden) { elegido = i; break; } }
        }
        if (elegido === actual) return;
        actual = elegido;
        enlaces.forEach(function (a, k) {
            if (k === elegido) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
        if (elegido !== null && nav.scrollWidth > nav.clientWidth) {
            var a = enlaces[elegido];
            nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
        }
    }
    if (enlaces.length) {
        window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(marcar); } }, { passive: true });
        marcar();
    }

    // ---- Integrantes: en el HTML están todos abiertos (se leen sin JS); acá se cierran para tocarlos ----
    [].forEach.call(document.querySelectorAll('details.integrante'), function (d) { d.removeAttribute('open'); });

    // ---- Botones de copiar (mail, teléfono) ----
    var aviso = document.querySelector('.copiado');
    function copiar(texto) {
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
        return new Promise(function (ok, fallo) {
            var t = document.createElement('textarea');
            t.value = texto; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
            document.body.appendChild(t); t.select();
            try { document.execCommand('copy') ? ok() : fallo(); } catch (e) { fallo(e); }
            document.body.removeChild(t);
        });
    }
    [].forEach.call(document.querySelectorAll('[data-copiar]'), function (b) {
        var rotulo = b.textContent;
        b.addEventListener('click', function () {
            copiar(b.getAttribute('data-copiar')).then(function () {
                b.textContent = b.getAttribute('data-ok');
                if (aviso) aviso.textContent = b.getAttribute('data-ok') + ': ' + b.getAttribute('data-copiar');
                setTimeout(function () { b.textContent = rotulo; }, 2000);
            }, function () {
                if (aviso) aviso.textContent = b.getAttribute('data-copiar');
            });
        });
    });

    // ---- Videos: la miniatura se cambia por el reproductor sólo cuando se toca (carga más rápido) ----
    [].forEach.call(document.querySelectorAll('a.yt-facade'), function (a) {
        a.addEventListener('click', function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            var f = document.createElement('iframe');
            f.src = 'https://www.youtube-nocookie.com/embed/' + a.getAttribute('data-id') + '?autoplay=1&rel=0';
            f.title = a.getAttribute('data-titulo') || '';
            f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
            f.setAttribute('allowfullscreen', '');
            a.replaceWith(f);
            f.focus();
        });
    });

    // ---- Galería con vista ampliada ----
    var galeria = document.querySelector('[data-galeria]');
    if (galeria && typeof HTMLDialogElement === 'function') {
        var fotos = [].slice.call(galeria.querySelectorAll('a.foto'));
        var L = {
            cerrar: galeria.getAttribute('data-l-cerrar'), ant: galeria.getAttribute('data-l-ant'),
            sig: galeria.getAttribute('data-l-sig'), de: galeria.getAttribute('data-l-de')
        };
        var dlg = document.createElement('dialog');
        dlg.className = 'visor';
        dlg.setAttribute('aria-label', galeria.getAttribute('data-l-titulo') || '');
        dlg.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><p class="cuenta" aria-live="polite"></p>' +
            '<button type="button" class="cerrar" aria-label="' + L.cerrar + '">&times;</button>' +
            '<button type="button" class="ant" aria-label="' + L.ant + '">&#8249;</button>' +
            '<button type="button" class="sig" aria-label="' + L.sig + '">&#8250;</button>';
        document.body.appendChild(dlg);
        var img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption'), cuenta = dlg.querySelector('.cuenta');
        var idx = 0;
        var mostrar = function (i) {
            idx = (i + fotos.length) % fotos.length;
            var a = fotos[idx], alt = a.querySelector('img').getAttribute('alt') || '';
            img.src = a.getAttribute('href'); img.alt = alt; cap.textContent = alt;
            cuenta.textContent = (idx + 1) + ' ' + L.de + ' ' + fotos.length;
            [1, -1].forEach(function (d) { var n = new Image(); n.src = fotos[(idx + d + fotos.length) % fotos.length].getAttribute('href'); });
        };
        fotos.forEach(function (a, i) {
            a.addEventListener('click', function (e) {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault(); mostrar(i); dlg.showModal();
            });
        });
        dlg.querySelector('.cerrar').addEventListener('click', function () { dlg.close(); });
        dlg.querySelector('.ant').addEventListener('click', function () { mostrar(idx - 1); });
        dlg.querySelector('.sig').addEventListener('click', function () { mostrar(idx + 1); });
        dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
        dlg.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { e.preventDefault(); mostrar(idx - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(idx + 1); }
        });
        var x0 = null;
        dlg.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
        dlg.addEventListener('touchend', function (e) {
            if (x0 === null) return;
            var dx = e.changedTouches[0].clientX - x0; x0 = null;
            if (Math.abs(dx) > 50) mostrar(idx + (dx < 0 ? 1 : -1));
        });
    }

    // ---- Botón de imprimir (rider) ----
    [].forEach.call(document.querySelectorAll('[data-imprimir]'), function (b) {
        b.addEventListener('click', function () { window.print(); });
    });
})();
