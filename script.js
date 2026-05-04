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
    link.addEventListener('click', (e) => {
        // Verificamos si el link que tocamos NO pertenece al selector de idiomas
        // Usamos .closest para ver si el link está dentro de 'lang-switcher'
        if (!link.closest('.lang-switcher')) {
            menu.classList.remove('is-active');
            menuLinks.classList.remove('active');
            document.body.style.overflow = 'auto'; // Si estabas bloqueando el scroll
        }
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