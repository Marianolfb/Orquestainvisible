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
                // En lugar de texto, le asignamos la LLAVE de traducción
                this.setAttribute('data-key', 'btn_ver_menos');
                revealElements(); 
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

