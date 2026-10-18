// Smooth Scroll para los enlaces del menú
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const revealElements = () => {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealElements);

// Ejecutar una vez al cargar por si ya hay elementos visibles
revealElements();

const slides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;

function nextSlide() {
    // Quitamos la clase active de la foto actual
    slides[currentSlide].classList.remove('active');
    
    // Pasamos a la siguiente (y volvemos a la primera si llegamos al final)
    currentSlide = (currentSlide + 1) % slides.length;
    
    // Añadimos la clase active a la nueva foto (si todavía no se bajó, se baja ahora)
    cargarFondo(slides[currentSlide]);
    slides[currentSlide].classList.add('active');
}

// Cambia la foto cada 5000 milisegundos (5 segundos)
setInterval(nextSlide, 5000);

window.addEventListener('scroll', function() {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        // Cuando bajas más de 50px, se pone negra y aparece el borde
        nav.style.background = 'black';
        nav.style.borderBottom = '2px solid var(--accent-color)';
    } else {
        // Cuando estás arriba de todo, vuelve a ser transparente
        nav.style.background = 'transparent';
        nav.style.borderBottom = 'none';
    }
});

const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.nav-links');

if (menu && menuLinks) {
    // Abrir y cerrar al tocar la hamburguesa
    menu.addEventListener('click', function() {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    });

    // Cerrar el menú al tocar cualquier link (importante para navegar en la misma página)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            // El selector de idiomas ahora son enlaces reales a otra URL: los dejamos pasar
            if (!link.closest('.lang-switcher')) {
                menu.classList.remove('is-active');
                menuLinks.classList.remove('active');
                document.body.style.overflow = 'auto'; // Si estabas bloqueando el scroll
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper(".mySwiper", {
        slidesPerView: 'auto', // Ajusta el ancho según la foto
        centeredSlides: true,  // La foto activa queda en el centro
        spaceBetween: 20,      // Espacio entre fotos
        loop: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        }
    });
});

const slider = document.querySelector('.press-gallery-container');
let isDown = false;
let startX;
let scrollLeft;

if (slider) {
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
}

const swiperRelatos = new Swiper('.relatosSwiper', {
    slidesPerView: 'auto', // Esto permite que se vea un pedazo del siguiente
    spaceBetween: 20,      // Espacio entre tarjetas
    centeredSlides: false, // Empezar desde la izquierda
    loop: true,
    grabCursor: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    }
});

const videoSwiper = new Swiper('.videoSwiper', {
    slidesPerView: 1, // Muestra un video a la vez
    spaceBetween: 30, // Espacio entre slides
    loop: true,       // Para que vuelva al principio al terminar
    navigation: {
        nextEl: '.videoSwiper .swiper-button-next',
        prevEl: '.videoSwiper .swiper-button-prev',
    },
    pagination: {
        el: '.videoSwiper .swiper-pagination',
        clickable: true,
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const btnToggle = document.getElementById('btn-toggle-shows');
    const extraShows = document.getElementById('extra-shows');

    if (btnToggle && extraShows) {
        btnToggle.addEventListener('click', function() {
            const isHidden = extraShows.style.display === "none" || extraShows.style.display === "";

            if (isHidden) {
                extraShows.style.display = "block";
                this.textContent = this.getAttribute('data-less') || 'VER MENOS';
                revealElements();
            } else {
                extraShows.style.display = "none";
                this.textContent = this.getAttribute('data-more') || 'VER TODAS LAS FECHAS';
                document.getElementById('conciertos').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.press-gallery-container');
    const nextBtn = document.getElementById('press-next-btn');
    const prevBtn = document.getElementById('press-prev-btn');

    if (nextBtn && prevBtn && container) {
        // Al hacer clic en "Siguiente"
        nextBtn.addEventListener('click', () => {
            const cardWidth = document.querySelector('.press-card').offsetWidth + 30; // Ancho nota + gap
            container.scrollLeft += cardWidth;
        });

        // Al hacer clic en "Anterior"
        prevBtn.addEventListener('click', () => {
            const cardWidth = document.querySelector('.press-card').offsetWidth + 30;
            container.scrollLeft -= cardWidth;
        });
    }
});

// Reproductor de Spotify: arranca cerrado; se abre con el botón redondo (en compu y en celular)
window.addEventListener('load', () => {
    const btn = document.getElementById('open-spotify-btn');
    if (btn) {
        btn.style.display = 'flex';
        btn.classList.add('pulse-animation');
    }
});

// Función para mostrar/ocultar
function toggleSpotify(show) {
    const player = document.getElementById('spotify-player');
    const btn = document.getElementById('open-spotify-btn');

    if (show) {
        cargarSpotify();
        player.style.display = 'block';
        setTimeout(() => player.classList.add('visible'), 10);
        btn.style.display = 'none';
    } else {
        player.classList.remove('visible');
        // Esperamos a que termine la animación para ocultar y mostrar el botón verde
        setTimeout(() => {
            player.style.display = 'none';
            btn.style.display = 'flex';
        }, 800);
    }
}

// Fotos 2 y 3 de la portada: se bajan cuando la página ya cargó, así la primera aparece antes
function cargarFondo(slide) {
    if (slide && slide.dataset.bg) {
        slide.style.backgroundImage = "url('" + slide.dataset.bg + "')";
        delete slide.dataset.bg;
    }
}

window.addEventListener('load', function () {
    slides.forEach(cargarFondo);
});

// Reproductor de Spotify: se baja recién cuando se muestra (en el celular, al tocar el botón verde)
function cargarSpotify() {
    const frame = document.querySelector('#spotify-player iframe[data-src]');
    if (frame) {
        frame.src = frame.dataset.src;
        frame.removeAttribute('data-src');
    }
}

// Videos: el reproductor de YouTube se carga recién cuando tocan la miniatura
document.addEventListener('click', function (e) {
    const btn = e.target.closest('.yt-facade');
    if (!btn) return;
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube.com/embed/' + btn.dataset.id + '?autoplay=1';
    frame.title = btn.getAttribute('aria-label') || '';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    frame.setAttribute('frameborder', '0');
    btn.replaceWith(frame);
});
