// Rider técnico interactivo: el escenario se arma instrumento por instrumento, al tocar un instrumento
// se muestran sus necesidades y los filtros resaltan sonido / escenario / luz / logística.
// Todo lo que muestra sale de la tabla y de los <template> del propio HTML: sin JS la página se lee completa.
(function () {
    'use strict';
    var contenedor = document.getElementById('contenido');
    var svgs = [].slice.call(document.querySelectorAll('.plano svg'));
    var svg = svgs[0];
    if (!document.getElementById('escenario-interactivo') || !svg) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nodos = [].slice.call(document.querySelectorAll('.plano .nodo'));
    var filas = [].slice.call(document.querySelectorAll('.tabla-canales tbody tr[data-nodo]'));
    var aside = document.getElementById('detalle');
    var panel = document.getElementById('detalle-panel');
    var vacio = panel.innerHTML;
    var estado = document.getElementById('armado-estado');
    var actual = null, timers = [];

    // ---- Seleccionar un instrumento ----
    function seleccionar(id) {
        nodos.forEach(function (n) {
            var on = n.getAttribute('data-nodo') === id;
            n.classList.toggle('activo', on);
            n.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        filas.forEach(function (f) { f.classList.toggle('activa', f.getAttribute('data-nodo') === id); });
        var t = document.getElementById('ficha-' + id);
        if (!t) { panel.innerHTML = vacio; actual = null; aside.classList.remove('abierto'); return; }
        panel.innerHTML = '';
        panel.appendChild(t.content.cloneNode(true));
        actual = id;
        aside.classList.add('abierto');
    }
    nodos.forEach(function (n) {
        var id = n.getAttribute('data-nodo');
        n.addEventListener('click', function () { terminarArmado(); seleccionar(actual === id ? null : id); });
        n.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); terminarArmado(); seleccionar(actual === id ? null : id); }
        });
    });
    filas.forEach(function (f) {
        f.addEventListener('click', function () {
            var id = f.getAttribute('data-nodo');
            seleccionar(id);
        });
    });

    aside.querySelector('.detalle-cerrar').addEventListener('click', function () { seleccionar(null); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && actual) seleccionar(null); });

    // ---- Filtros por categoría ----
    var botones = [].slice.call(document.querySelectorAll('.filtros button[data-filtro]'));
    function filtrar(cat) {
        if (cat === 'todo') contenedor.removeAttribute('data-filtro'); else contenedor.setAttribute('data-filtro', cat);
        botones.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filtro') === cat ? 'true' : 'false'); });
    }
    botones.forEach(function (b) { b.addEventListener('click', function () { filtrar(b.getAttribute('data-filtro')); }); });
    filtrar('todo');

    // ---- Armado del escenario, de a un instrumento (en orden de canal) ----
    var ordenados = nodos.slice().sort(function (a, b) { return +a.getAttribute('data-orden') - +b.getAttribute('data-orden'); });
    var btnArmar = document.getElementById('armar-btn');
    var btnTodo = document.getElementById('mostrar-todo-btn');

    function terminarArmado() {
        timers.forEach(clearTimeout); timers = [];
        ordenados.forEach(function (n) { n.classList.add('puesto'); });
        if (estado) estado.textContent = '';
    }
    function armar() {
        terminarArmado();
        if (reduce) return;
        svgs.forEach(function (s) { s.classList.add('armando'); });
        ordenados.forEach(function (n) { n.classList.remove('puesto'); });
        // fuerza al navegador a registrar el estado inicial antes de empezar
        void svg.getBoundingClientRect();
        ordenados.forEach(function (n, i) {
            timers.push(setTimeout(function () {
                n.classList.add('puesto');
                if (estado) estado.textContent = n.getAttribute('data-resumen');
            }, 250 + i * 240));
        });
        timers.push(setTimeout(function () { if (estado) estado.textContent = estado.getAttribute('data-fin'); }, 250 + ordenados.length * 240));
    }
    if (btnArmar) btnArmar.addEventListener('click', armar);
    if (btnTodo) btnTodo.addEventListener('click', terminarArmado);

    // Con movimiento normal, el armado arranca solo la primera vez que el plano entra en pantalla.
    if (!reduce && 'IntersectionObserver' in window) {
        svgs.forEach(function (s) { s.classList.add('armando'); });
        var visto = new IntersectionObserver(function (es) {
            if (es.some(function (e) { return e.isIntersecting; })) { visto.disconnect(); armar(); }
        }, { threshold: 0.35 });
        svgs.forEach(function (s) { visto.observe(s); });
    } else {
        if (btnArmar) btnArmar.hidden = true;
        if (btnTodo) btnTodo.hidden = true;
    }
})();
