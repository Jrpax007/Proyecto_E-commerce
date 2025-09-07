/*Animación del carrusel al pasar el mouse*/
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');

    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });

    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });
});
/*Animación del carrusel al hacer scroll*/
const carousel = document.querySelector('.carousel');
window.addEventListener('scroll', () => {
    const carouselTop = carousel.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;        
    if (carouselTop < windowHeight) {
        carousel.classList.add('visible');
    } else {
        carousel.classList.remove('visible');
    }   
}); 

/*Cambio de título cuando el usuario cambia de pestaña*/
let titulos = ["Volve!", "No te lo pirdas!", "Mirá nuestras ofertas!", "¡Ofertas exclusivas!"];
let tituloOriginal = document.title;
let i = 0;
let intervalo;
/* Detecta cuando el usuario cambia de pestaña */
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        // Usuario salió de la pestaña
        intervalo = setInterval(() => {
            document.title = titulos[i];
            i = (i + 1) % titulos.length;
        }, 1500);
    } else {
        // Usuario volvió a la pestaña
        clearInterval(intervalo);
        document.title = tituloOriginal;
        i = 0; // Reinicia si quieres empezar desde el primer título
    }
});

/*Animación del HEADER al hacer scroll*/
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }
    else {
        header.classList.remove('scrolled');
    }
});

/*Suscripción al newsletter*/
const newsletterForm = document.getElementById('newsletter-form');
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value.trim();
    if (email) {
        alert(`Gracias por suscribirte con el correo: ${email}`);
        emailInput.value = '';
    }   
}); 

/*Busqueda del input */
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        alert(`Buscando productos relacionados con: ${query}`);
        /*Hacer una búsqueda usando fetch y una API (conectar con tu base de datos)
Al presionar buscar, haces una petición fetch a una API que consulta la base de datos y devuelve solo los productos que coinciden con el término.
Requiere que tengas una API REST o similar que acepte el término de búsqueda como parámetro y devuelva resultados en JSON..*/
    } else {
        alert('Por favor, ingresa un término de búsqueda.');
    }
<<<<<<< HEAD
});

/*Animación de los botones (busqueda prod) al hacer hover*/
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {//Recordar que luego hay que cambiar a la API real//
    button.addEventListener('mouseenter', () => {
        button.classList.add('hovered');
    }); 
    button.addEventListener('mouseleave', () => {
        button.classList.remove('hovered');
    });
});

/*Animación de las tarjetas de productos al hacer hover*/
const productCards = document.querySelectorAll('.producto-card');   
productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('hovered');
    });
    card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
    });
});     
/*Animación de las tarjetas de categorías al hacer hover*/
const categoryCards = document.querySelectorAll('.categoria-card');
categoryCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('hovered');
    });
    card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
    });
}); 
 



=======
});
>>>>>>> Jr_branch
