// Función para el efecto de revelado (Scroll Reveal)
function reveal() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150; // Distancia en px para activar

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

// Escuchar el evento de scroll
window.addEventListener("scroll", reveal);

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

function togglePlayer() {
    const player = document.getElementById('player');
    const openBtn = document.getElementById('openBtn');

    if (player.classList.contains('player-hidden')) {
        player.classList.remove('player-hidden');
        openBtn.style.display = 'none';
    } else {
        player.classList.add('player-hidden');
        openBtn.style.display = 'block';
    }
}

const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

window.addEventListener("mousemove", function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    // Actualiza la posición del punto
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Actualiza la posición del contorno con un ligero delay (por el CSS transition)
    cursorOutline.style.left = `${posX - 15}px`;
    cursorOutline.style.top = `${posY - 15}px`;
});

// Efecto de escala al pasar por links o botones
const links = document.querySelectorAll("a, button, .btn-ticket");
links.forEach(link => {
    link.addEventListener("mouseenter", () => {
        cursorOutline.classList.add("cursor-hover");
    });
    link.addEventListener("mouseleave", () => {
        cursorOutline.classList.remove("cursor-hover");
    });
});

const slides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;

function nextSlide() {
    // Quitamos la clase active de la foto actual
    slides[currentSlide].classList.remove('active');
    
    // Pasamos a la siguiente (y volvemos a la primera si llegamos al final)
    currentSlide = (currentSlide + 1) % slides.length;
    
    // Añadimos la clase active a la nueva foto
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

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const logo = document.querySelector('.logo');

    // Si el scroll baja más de 200px (puedes ajustar este número)
    if (window.scrollY > 200) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.nav-links');

// Abrir y cerrar al tocar la hamburguesa
menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});

// Cerrar el menú al tocar cualquier link (importante para navegar en la misma página)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('is-active');
        menuLinks.classList.remove('active');
    });
});

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

const i18n = {
    es: {
        nav_video: "EN VIVO",
        nav_fechas: "PRÓXIMAS FECHAS",
        nav_bio: "NOSOTROS",
        nav_prensa: "PRENSA",
        nav_fotos: "FOTOS",
        nav_contacto: "CONTACTO",
        hero_subtitle: "Orquesta Típica",
        tit_fechas: "PRÓXIMAS FECHAS",
        show_place_1: "La tierra invisible",
        show_detail_1: "21:00 HS - Centenera 1099, CABA",
        show_place_2: "Palacio Libertad",
        show_detail_2: "Sarmiento 151, CABA",
        btn_reservar: "RESERVAR",
        btn_reservar2: "+INFO",
        tit_nosotros: "Sobre nosotros",
        bio_p1: "La Orquesta Invisible es una orquesta de tango contemporáneo de Buenos Aires dirigida por el bandoneonista Julio Coviello, un artista con más de 25 años de trayectoria en la escena del tango argentino.",
        bio_p2: "La agrupación formada por músicos y músicas de diferentes generaciones y vertientes,  reinventa el formato tradicional de la orquesta típica a través de composiciones originales, la creación colectiva y un potente sonido acústico que tiene sus raíces en la Época de Oro del tango, pero impulsado por una energía moderna y urbana.",
        bio_p3: "En su año de debut, el proyecto fue seleccionado para la programación oficial del Festival de Tango de Buenos Aires gracias a la trayectoria de Coviello en agrupaciones fundamentales del género como el Cuarteto Cedrón y la Orquesta Típica Fernández Fierro.",
        bio_p4:"Con una fuerte presencia escénica, un repertorio propio y una visión del tango como patrimonio cultural vivo, la Orquesta Invisible ofrece un sonido argentino auténtico y vanguardista para festivales de world music y escenarios internacionales.",
        tit_prensa: "PRENSA",
        quote_coviello: '"Y los mayores esfuerzos de la humanidad no fueron esfuerzos por cuestiones económicas, ¿no? Fueron esfuerzos por convicciones, por ideas, por querer cambiar las cosas, por querer dejar plasmada en la realidad una creencia o una idea."',
        date_mayo: "MAYO 2025",
        date_sept: "SEPTIEMBRE 2025",
        date_dic: "DICIEMBRE 2025",
        p_p12: '"En este proyecto jugamos por la camiseta."',
        p_2x4: "Entrevista de radio con Paula Sterczek",
        p_t21: '"La propuesta es que la orquesta “sea invisible” y que cada uno de los integrantes vaya siendo cada vez más visible."',
        p_estoes: '"Hacía rato que tenía ganas de armar una orquesta. Tener un escenario propio para poder ensayar y para poder presentarse es algo que te da tranquilidad e independencia para elegir el repertorio, la música que uno quiere hacer y para bancar los ciclos."',
        p_cultura: '"Seguir las olas de qué es lo que te hace trabajar más o menos, qué es lo que te hace llegar a más gente en Instagram, no siempre te lleva muy lejos, las olas terminan al toque en la playa. Uno quisiera ser una corriente submarina."',
        leer_nota: "LEER NOTA →",
        escuchar: "ESCUCHAR →",
        pk_title: "DESCARGAR PRESS KIT",
        pk_desc: "(PDF, FOTOS HD, RIDER)",
        nav_sp: "SPOTIFY",
        nav_yt: "YOUTUBE",
        footer_contacto: "CONTACTO: orquestatipicainvisible@gmail.com",
        btn_ver_mas: "VER TODAS LAS FECHAS", 
        btn_ver_menos: "VER MENOS",
        btn_prensa_mas: "VER MÁS NOTAS",
        btn_prensa_menos: "VER MENOS"
    },
    en: {
        nav_video: "LIVE",
        nav_fechas: "UPCOMING DATES",
        nav_bio: "ABOUT US",
        nav_prensa: "PRESS",
        nav_fotos: "PHOTOS",
        nav_contacto: "CONTACT",
        hero_subtitle: "Typical Orchestra",
        tit_fechas: "UPCOMING SHOWS",
        show_place_1: "La tierra invisible",
        show_detail_1: "9:00 PM - Centenera 1099, Buenos Aires",
        show_place_2: "Palacio Libertad",
        show_detail_2: "Sarmiento 151, Buenos Aires",
        btn_reservar: "BOOK NOW",
        btn_reservar2: "+INFO",
        tit_nosotros: "About us",
        bio_p1: "La Orquesta Invisible is a contemporary tango orchestra from Buenos Aires led by bandoneonist Julio Coviello, an artist with a career spanning more than 25 years in the Argentine tango scene.",
        bio_p2: "The ensemble, formed by musicians from different generations and backgrounds, reinvents the traditional orquesta típica format through original compositions, collective creation, and a powerful acoustic sound that is rooted in Tango’s Golden Age but driven by a modern and urban energy.",
        bio_p3: "In its debut year, the project was selected for the official programming of the Buenos Aires Tango Festival, thanks to Coviello's trajectory in fundamental groups of the genre such as Cuarteto Cedrón and Orquesta Típica Fernández Fierro.",
        bio_p4: "With a strong stage presence, its own repertoire, and a vision of tango as a living cultural heritage, La Orquesta Invisible offers an authentic and avant-garde Argentine sound for world music festivals and international stages.",
        tit_prensa: "PRESS",
        quote_coviello: '"The greatest efforts of humanity were not for economic reasons. They were efforts for convictions, for ideas, for wanting to change things, for wanting to embody a belief or an idea in reality."',
        date_mayo: "MAY 2025",
        date_sept: "SEPTEMBER 2025",
        date_dic: "DECEMBER 2025",
        p_p12: '"In this project, we play for the love of it."',
        p_2x4: "Radio interview with Paula Sterczek",
        p_t21: '"The proposal is for the orchestra to be \"invisible\" so that each of its members can become increasingly visible."',
        p_estoes: '"I had wanted to put together an orchestra for a long time. Having our own stage to rehearse and perform is something that gives you peace of mind and independence to choose the repertoire, the music you want to make, and to sustain the cycles."',
        p_cultura: '"Following the waves of what makes you work more or less, what makes you reach more people on Instagram, doesn\'t always take you very far; the waves end immediately on the beach. One would rather be an underwater current."',
        leer_nota: "READ MORE →",
        escuchar: "LISTEN →",
        pk_title: "DOWNLOAD PRESS KIT",
        pk_desc: "(PDF, HD PHOTOS, RIDER)",
        nav_sp: "SPOTIFY",
        nav_yt: "YOUTUBE",
        footer_contacto: "CONTACT: orquestatipicainvisible@gmail.com",
        btn_ver_mas: "VIEW ALL DATES", 
        btn_ver_menos: "SHOW LESS",
        btn_prensa_mas: "MORE PRESS ARTICLES",
        btn_prensa_menos: "SHOW LESS"
    }
};

function changeLanguage(lang) {
    // Forzamos que sea 'es' o 'en'
    if (lang !== 'en' && lang !== 'es') lang = 'es';

    console.log("Cambiando a:", lang); // Para que veas en la consola si detecta el clic

    localStorage.setItem('selectedLang', lang);
    document.documentElement.lang = lang;

    // 1. Actualizar el botón del dropdown
    const btn = document.getElementById('current-lang');
    if (btn) btn.textContent = lang.toUpperCase();

    // 2. Traducir todos los elementos con data-key
    const elements = document.querySelectorAll('[data-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (i18n[lang][key]) {
            el.innerHTML = i18n[lang][key];
        }
    });
}

// Inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que el DOM está listo para manipular
    setTimeout(() => {
        const savedLang = localStorage.getItem('selectedLang') || 'es';
        changeLanguage(savedLang);
    }, 50); 
});

document.addEventListener('DOMContentLoaded', function() {
    const btnToggle = document.getElementById('btn-toggle-shows');
    const extraShows = document.getElementById('extra-shows');

    if (btnToggle && extraShows) {
        btnToggle.addEventListener('click', function() {
            const isHidden = extraShows.style.display === "none" || extraShows.style.display === "";
            
            if (isHidden) {
                extraShows.style.display = "block";
                // En lugar de texto, le asignamos la LLAVE de traducción
                this.setAttribute('data-key', 'btn_ver_menos');
                reveal(); 
            } else {
                extraShows.style.display = "none";
                this.setAttribute('data-key', 'btn_ver_mas');
                document.getElementById('conciertos').scrollIntoView({ behavior: 'smooth' });
            }
            
            // Forzamos la traducción inmediata del botón tras el cambio de llave
            const currentLang = document.documentElement.lang || 'es';
            this.innerHTML = i18n[currentLang][this.getAttribute('data-key')];
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

// Aparecer suavemente tras 1 segundo de carga
window.addEventListener('load', () => {
    const player = document.getElementById('spotify-player');
    const btn = document.getElementById('open-spotify-btn');
    
    // Verificamos si el ancho de pantalla es mayor a 480px (PC/Tablet horizontal)
    if (window.innerWidth > 768) {
        setTimeout(() => {
            player.style.display = 'block';
            setTimeout(() => player.classList.add('visible'), 50);
            if (btn) btn.style.display = 'none';
        }, 1000);
    } else {
        // En pantallas pequeñas, nos aseguramos de que el botón de apertura sea visible
        if (btn) {
            btn.style.display = 'flex';
            btn.classList.add('pulse-animation');
        }
    }
});

// Función para mostrar/ocultar
function toggleSpotify(show) {
    const player = document.getElementById('spotify-player');
    const btn = document.getElementById('open-spotify-btn');

    if (show) {
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

function toggleSpotify(show) {
    const player = document.getElementById('spotify-player');
    const btn = document.getElementById('open-spotify-btn');

    if (show) {
        player.style.display = 'block';
        // Forzamos un pequeño reflow para que la animación de 2.5s se active
        setTimeout(() => player.classList.add('visible'), 50);
        btn.style.display = 'none';
        btn.classList.remove('pulse-animation');
    } else {
        player.classList.remove('visible');
        setTimeout(() => {
            player.style.display = 'none';
            btn.style.display = 'flex';
            btn.classList.add('pulse-animation'); // Añade un brillo al aparecer
        }, 1000); 
    }
}