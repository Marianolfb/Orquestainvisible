// Medición de clics con Google Analytics: cuenta cuántas personas tocan entradas, contrataciones,
// press kit, Spotify, redes, videos y notas de prensa. No cambia nada de lo que se ve.
// Los eventos aparecen en Google Analytics → Informes → Interacción → Eventos.
(function () {
    function texto(el, selector) {
        var e = el && el.querySelector(selector);
        return e ? e.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function clasificar(el) {
        if (el.id === 'open-spotify-btn') return ['abrir_reproductor_spotify'];
        if (el.classList.contains('yt-facade')) return ['ver_video', { video: el.getAttribute('data-id') || '' }];
        var href = el.getAttribute('href') || '';
        if (!href) return null;
        var fila = el.closest('.show-row');
        var fecha = fila ? texto(fila, '.show-date') : '';
        if (/passline\.com|entradas\.orquestainvisible/.test(href)) return ['clic_reservar', { fecha: fecha }];
        if (fila) return ['clic_mas_info_fecha', { fecha: fecha }];
        if (href.indexOf('wa.me/') >= 0) return ['clic_contrataciones'];
        if (href.indexOf('mailto:') === 0) return ['clic_mail'];
        if (/press-kit|drive\.google\.com/.test(href)) return ['clic_press_kit', { archivo: href.split('/').pop() }];
        var nota = el.closest('.press-card');
        if (nota) return ['clic_nota_prensa', { medio: texto(nota, 'h3') }];
        if (el.closest('.hero-botones')) return [href === '#huella' ? 'clic_portada_disco' : 'clic_portada_fechas'];
        if (/open\.spotify\.com/.test(href)) return ['clic_spotify'];
        if (/instagram\.com/.test(href)) return ['clic_instagram'];
        if (/youtube\.com|youtu\.be/.test(href)) return ['clic_youtube'];
        return null;
    }

    document.addEventListener('click', function (e) {
        var el = e.target.closest && e.target.closest('a, button');
        if (!el || typeof gtag !== 'function') return;
        var r = clasificar(el);
        if (r) gtag('event', r[0], Object.assign({ transport_type: 'beacon' }, r[1] || {}));
    }, true);
})();
