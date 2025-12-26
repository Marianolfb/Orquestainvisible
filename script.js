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