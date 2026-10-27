// Rider técnico interactivo. El dibujo copia el de la hoja 1 del PDF original.
// Al tocar un instrumento se ven sus micrófonos, soporte, monitor y silla, y se resalta su monitor.
// Al tocar un monitor (Mix) se resaltan los instrumentos que lo escuchan.
// El escenario se arma instrumento por instrumento, en orden de canal, y después los monitores.
// Todo lo que muestra sale de la tabla y de los <template> del propio HTML: sin JS la página se lee completa.
(function () {
    'use strict';
    var svg = document.getElementById('plano-svg');
    if (!svg) return;
    var plano = svg.parentNode;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var piezas = [].slice.call(svg.querySelectorAll('.pieza'));
    var instrumentos = piezas.filter(function (p) { return p.classList.contains('inst'); });
    var monitores = piezas.filter(function (p) { return p.classList.contains('monitor'); });
    var filas = [].slice.call(document.querySelectorAll('.tabla-canales tbody tr[data-nodo]'));
    var aside = document.getElementById('detalle');
    var panel = document.getElementById('detalle-panel');
    var vacio = panel.innerHTML;
    var estado = document.getElementById('armado-estado');
    var actual = null, timers = [];

    function mixesDe(el) { return (el.getAttribute('data-mix') || '').split(' '); }

    function limpiar() {
        piezas.forEach(function (p) { p.classList.remove('rel'); p.setAttribute('aria-pressed', 'false'); });
        filas.forEach(function (f) { f.classList.remove('activa'); });
        plano.removeAttribute('data-sel');
        panel.innerHTML = vacio;
        aside.classList.remove('abierto');
        actual = null;
    }

    function mostrarFicha(idTemplate) {
        var t = document.getElementById(idTemplate);
        if (!t) return;
        panel.innerHTML = '';
        panel.appendChild(t.content.cloneNode(true));
        aside.classList.add('abierto');
    }

    // Instrumento: se resalta él, sus micrófonos y su(s) monitor(es)
    function elegirInstrumento(id) {
        if (actual === 'i:' + id) { limpiar(); return; }
        limpiar();
        var inst = svg.querySelector('.inst[data-nodo="' + id + '"]');
        if (!inst) return;
        var mixes = mixesDe(inst);
        inst.classList.add('rel'); inst.setAttribute('aria-pressed', 'true');
        monitores.forEach(function (m) { if (mixes.indexOf(m.getAttribute('data-mix')) >= 0) m.classList.add('rel'); });
        filas.forEach(function (f) { f.classList.toggle('activa', f.getAttribute('data-nodo') === id); });
        plano.setAttribute('data-sel', '');
        mostrarFicha('ficha-' + id);
        actual = 'i:' + id;
    }

    // Monitor: se resalta él y los instrumentos que lo escuchan
    function elegirMonitor(mix) {
        if (actual === 'm:' + mix) { limpiar(); return; }
        limpiar();
        var mon = svg.querySelector('.monitor[data-mix="' + mix + '"]');
        if (!mon) return;
        mon.classList.add('rel'); mon.setAttribute('aria-pressed', 'true');
        var ids = [];
        instrumentos.forEach(function (i) {
            if (mixesDe(i).indexOf(mix) >= 0) { i.classList.add('rel'); ids.push(i.getAttribute('data-nodo')); }
        });
        filas.forEach(function (f) { f.classList.toggle('activa', ids.indexOf(f.getAttribute('data-nodo')) >= 0); });
        plano.setAttribute('data-sel', '');
        mostrarFicha('ficha-mix-' + mix);
        actual = 'm:' + mix;
    }

    function activar(p) {
        terminarArmado();
        if (p.classList.contains('inst')) elegirInstrumento(p.getAttribute('data-nodo'));
        else elegirMonitor(p.getAttribute('data-mix'));
    }
    piezas.forEach(function (p) {
        p.addEventListener('click', function () { activar(p); });
        p.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activar(p); }
        });
    });
    filas.forEach(function (f) {
        f.addEventListener('click', function () { terminarArmado(); elegirInstrumento(f.getAttribute('data-nodo')); });
    });
    aside.querySelector('.detalle-cerrar').addEventListener('click', limpiar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && actual) limpiar(); });

    // ---- Armado del escenario: instrumentos en orden de canal y después los monitores ----
    var ordenados = piezas.slice().sort(function (a, b) { return +a.getAttribute('data-orden') - +b.getAttribute('data-orden'); });
    var btnArmar = document.getElementById('armar-btn');
    var btnTodo = document.getElementById('mostrar-todo-btn');

    function terminarArmado() {
        timers.forEach(clearTimeout); timers = [];
        ordenados.forEach(function (p) { p.classList.add('puesto'); });
        if (estado) estado.textContent = '';
    }
    function armar() {
        terminarArmado();
        if (reduce) return;
        limpiar();
        svg.classList.add('armando');
        ordenados.forEach(function (p) { p.classList.remove('puesto'); });
        void svg.getBoundingClientRect();
        var t = 250;
        ordenados.forEach(function (p) {
            timers.push(setTimeout(function () {
                p.classList.add('puesto');
                if (estado) estado.textContent = p.getAttribute('data-resumen');
            }, t));
            t += p.classList.contains('inst') ? 260 : 120;
        });
        timers.push(setTimeout(function () { if (estado) estado.textContent = estado.getAttribute('data-fin'); }, t));
    }
    if (btnArmar) btnArmar.addEventListener('click', armar);
    if (btnTodo) btnTodo.addEventListener('click', terminarArmado);

    // Con movimiento normal, el armado arranca solo la primera vez que el dibujo entra en pantalla.
    if (!reduce && 'IntersectionObserver' in window) {
        svg.classList.add('armando');
        var visto = new IntersectionObserver(function (es) {
            if (es[0].isIntersecting) { visto.disconnect(); armar(); }
        }, { threshold: 0.3 });
        visto.observe(svg);
    } else {
        if (btnArmar) btnArmar.hidden = true;
        if (btnTodo) btnTodo.hidden = true;
    }
})();
