/**
 * scripts.js - Funcionalidades generales del sitio:
 * Animaciones, efectos y utilidades comunes
 */

class ScriptsGenerales {
    constructor() {
        this.selectores = {
            scrollBtn: '.indicador-desplazamiento',
            themeToggle: '#selector-tema',
            menuHamburguesa: '#boton-menu-movil',
            navegacion: '#navegacion-principal',
            formularioNewsletter: '#formulario-newsletter',
            enlacesInternos: 'a[href^="#"]',
            elementosAnimados: '.fade-in, .slide-in, .scale-in'
        };

        this.estado = {
            menuAbierto: false,
            ultimoScroll: 0,
            temaActual: 'claro'
        };

        this.inicializado = false;
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;

        this.configurarScrollSuave();
        this.configurarAnimacionesScroll();
        this.configurarMenuHamburguesa();
        this.configurarNewsletter();
        this.configurarEfectosHover();
        this.configurarTitleDinamico();
        this.configurarPreloadImagenes();
        this.configurarValidacionFormularios();
        this.configurarTooltips();

        this.inicializado = true;
        console.log('Scripts generales inicializados correctamente');
    }

    /*SCROLL SUAVE Y NAVEGACIÓN*/
    configurarScrollSuave() {
        /*Scroll a secciones específicas*/
        const scrollBtn = document.querySelector(this.selectores.scrollBtn);
        if (scrollBtn) {
            scrollBtn.addEventListener('click', () => {
                this.scrollToSection('.seccion-categorias');
            });
        }

        /*Scroll suave para enlaces internos*/
        document.querySelectorAll(this.selectores.enlacesInternos).forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    this.scrollToElement(target);
                }
            });
        });

        /*Scroll to top functionality*/
        this.configurarBotonScrollTop();
    }

    scrollToSection(selector, offset = 80) {
        const target = document.querySelector(selector);
        if (target) {
            this.scrollToElement(target, offset);
        }
    }

    scrollToElement(element, offset = 80) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    configurarBotonScrollTop() {
        const scrollTopBtn = document.createElement('button');
        scrollTopBtn.innerHTML = '<i class="bi bi-chevron-up"></i>';
        scrollTopBtn.className = 'scroll-top-btn';
        scrollTopBtn.setAttribute('aria-label', 'Volver arriba');
        
        scrollTopBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: var(--color-primario);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            box-shadow: var(--sombra-elevada);
            z-index: 1000;
            transition: var(--transicion-normal);
        `;

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(scrollTopBtn);

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.style.display = 'flex';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });
    }

    /*ANIMACIONES AL SCROLL*/
    configurarAnimacionesScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    /*Agrega un delay progresivo para los elementos en grid*/
                    if (entry.target.parentElement.classList.contains('grid-categorias') || 
                        entry.target.parentElement.classList.contains('grid-productos')) {
                        const index = Array.from(entry.target.parentElement.children).indexOf(entry.target);
                        entry.target.style.transitionDelay = `${index * 0.1}s`;
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        /*Toma los elementos con clases de animación*/
        document.querySelectorAll(this.selectores.elementosAnimados).forEach(el => {
            observer.observe(el);
        });

        /*Efecto de aparición en el header al hacer scroll*/
        this.configurarHeaderScroll();
    }

    configurarHeaderScroll() {
        const header = document.querySelector('.encabezado-principal');
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.classList.add('scrolled');
                
                if (currentScroll > lastScroll && currentScroll > 200) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            } else {
                header.classList.remove('scrolled');
                header.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        });
    }

    /*MENÚ HAMBURGUESA*/
    configurarMenuHamburguesa() {
        const menuBtn = document.querySelector(this.selectores.menuHamburguesa);
        const navegacion = document.querySelector(this.selectores.navegacion);

        if (!menuBtn || !navegacion) return;

        menuBtn.addEventListener('click', () => {
            this.estado.menuAbierto = !this.estado.menuAbierto;
            this.toggleMenu(menuBtn, navegacion);
        });

        /*Cerrar menú al hacer clic fuera*/
        document.addEventListener('click', (e) => {
            if (this.estado.menuAbierto && 
                !menuBtn.contains(e.target) && 
                !navegacion.contains(e.target)) {
                this.estado.menuAbierto = false;
                this.toggleMenu(menuBtn, navegacion);
            }
        });

        /*Cerrar menú al redimensionar*/
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.estado.menuAbierto) {
                this.estado.menuAbierto = false;
                this.toggleMenu(menuBtn, navegacion);
            }
        });
    }

    toggleMenu(menuBtn, navegacion) {
        if (this.estado.menuAbierto) {
            menuBtn.setAttribute('aria-expanded', 'true');
            navegacion.classList.add('activo');
            document.body.style.overflow = 'hidden';
        } else {
            menuBtn.setAttribute('aria-expanded', 'false');
            navegacion.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }

    /*NEWSLETTER*/
    configurarNewsletter() {
        const newsletterForm = document.querySelector(this.selectores.formularioNewsletter);
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailInput = document.getElementById('email-newsletter');
                const email = emailInput.value.trim();

                if (this.validarEmail(email)) {
                    await this.suscribirNewsletter(email);
                    emailInput.value = '';
                } else {
                    this.mostrarNotificacion('Ingresa un email válido', 'error');
                }
            });
        }
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    async suscribirNewsletter(email) {
        try {
            /*Simula el envío a la API*/
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            /*Guarda en el localStorage*/
            const suscriptores = JSON.parse(localStorage.getItem('newsletterSuscriptores') || '[]');
            if (!suscriptores.includes(email)) {
                suscriptores.push(email);
                localStorage.setItem('newsletterSuscriptores', JSON.stringify(suscriptores));
            }

            this.mostrarNotificacion('¡Te has suscrito al newsletter!', 'exito');
        } catch (error) {
            this.mostrarNotificacion('Error al suscribirse', 'error');
        }
    }

    /*EFECTOS HOVER Y MICRO-INTERACCIONES*/
    configurarEfectosHover() {
        /*Efectos en las tarjetas*/
        this.configurarHoverElements('.tarjeta-producto, .tarjeta-categoria', {
            scale: 1.02,
            translateY: -5,
            shadow: true
        });

        /*Efectos en los botones*/
        this.configurarHoverElements('.boton:not(.boton-cantidad)', {
            scale: 1.05,
            translateY: -2,
            shadow: true
        });

        /*Efectos en los enlaces de navegación*/
        this.configurarHoverElements('.enlace-navegacion', {
            scale: 1.05,
            color: 'var(--color-primario)'
        });

        /*Efectos en los iconos*/
        this.configurarHoverElements('.controles-encabezado .enlace-carrito, .selector-tema', {
            scale: 1.1,
            rotate: 5
        });
    }

    configurarHoverElements(selector, options) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(el => {
            /*Guarda el estilo original*/
            const originalTransition = el.style.transition;
            
            el.addEventListener('mouseenter', () => {
                el.style.transition = 'all 0.3s ease';
                if (options.scale) el.style.transform = `scale(${options.scale})`;
                if (options.translateY) el.style.transform += ` translateY(${options.translateY}px)`;
                if (options.shadow) el.style.boxShadow = 'var(--shadow-hover)';
                if (options.color) el.style.color = options.color;
                if (options.rotate) el.style.transform += ` rotate(${options.rotate}deg)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
                el.style.boxShadow = '';
                el.style.color = '';
                el.style.transition = originalTransition;
            });
        });
    }

    /* CAMBIO DE TÍTULO DINÁMICO EN LA PESTAÑA*/
    configurarTitleDinamico() {
        let tituloOriginal = document.title;
        let titulosAlternativos = [
            "¡Volvé! 📢 Tenemos novedades",
            "Ofertas especiales 🔥 No te las pierdas",
            "Componentes de calidad 💻 Armá tu PC ideal",
            "¡Los mejores precios! 🎯 Envío gratis"
        ];
        
        let intervalo;
        let indice = 0;

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                /*Si el usuario cambió de pestaña*/
                intervalo = setInterval(() => {
                    document.title = titulosAlternativos[indice];
                    indice = (indice + 1) % titulosAlternativos.length;
                }, 2000);
            } else {
                /*Si el usuario volvió a la pestaña*/
                clearInterval(intervalo);
                document.title = tituloOriginal;
                indice = 0;
            }
        });
    }

    /*PRELOAD DE IMÁGENES - (Optimiza las cargas de imagenes)*/
    configurarPreloadImagenes() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src') || img.getAttribute('src');
                    
                    if (src && img.getAttribute('src') !== src) {
                        img.src = src;
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.1
        });

        images.forEach(img => {
            if (img.complete) return;
            observer.observe(img);
        });
    }

    /*VALIDACIÓN DE FORMULARIO*/
    configurarValidacionFormularios() {
        const forms = document.querySelectorAll('form:not([novalidate])');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validarFormulario(form)) {
                    e.preventDefault();
                    this.mostrarNotificacion('Por favor, completa todos los campos requeridos correctamente', 'error');
                }
            });

            /*Validación en tiempo real*/
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validarCampo(input);
                });

                input.addEventListener('input', () => {
                    this.limpiarError(input);
                });
            });
        });
    }

    validarFormulario(form) {
        let valido = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

        inputs.forEach(input => {
            if (!this.validarCampo(input)) {
                valido = false;
            }
        });

        return valido;
    }

    validarCampo(input) {
        const valor = input.value.trim();
        const tipo = input.type;
        const nombre = input.name;

        /*Limpia si hubiera error previo*/
        this.limpiarError(input);

        /*Validaciones específicas*/
        if (valor === '') {
            this.mostrarError(input, 'Este campo es obligatorio');
            return false;
        }

        if (tipo === 'email' && !this.validarEmail(valor)) {
            this.mostrarError(input, 'Ingresa un email válido');
            return false;
        }

        if (tipo === 'tel' && valor !== '' && !this.validarTelefono(valor)) {
            this.mostrarError(input, 'Ingresa un número de teléfono válido');
            return false;
        }

        if (nombre === 'nombre-completo' && valor.length < 2) {
            this.mostrarError(input, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }

        return true;
    }

    validarTelefono(telefono) {
        const regex = /^[\d\s\+\-\(\)]{7,15}$/;
        return regex.test(telefono);
    }

    mostrarError(input, mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mensaje-error';
        errorDiv.textContent = mensaje;
        errorDiv.style.cssText = `
            color: var(--color-peligro);
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;

        input.classList.add('error');
        input.parentNode.appendChild(errorDiv);
    }

    limpiarError(input) {
        input.classList.remove('error');
        const errorDiv = input.parentNode.querySelector('.mensaje-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    /*TOOLTIPS Y ELEMENTOS INTERACTIVOS*//*((---------------------------------------------ADECUAR LO QUE VE CORTADO)) */
    configurarTooltips() {
        /*Tooltips para iconos*/
        const elementosConTooltip = document.querySelectorAll('[aria-label]:not([aria-label=""])');
        
        elementosConTooltip.forEach(elemento => {
            elemento.addEventListener('mouseenter', (e) => {
                this.mostrarTooltip(e, elemento.getAttribute('aria-label'));
            });

            elemento.addEventListener('mouseleave', () => {
                this.ocultarTooltip();
            });

            elemento.addEventListener('focus', (e) => {
                this.mostrarTooltip(e, elemento.getAttribute('aria-label'));
            });

            elemento.addEventListener('blur', () => {
                this.ocultarTooltip();
            });
        });
    }

    mostrarTooltip(evento, texto) {
        /*Eliminar tooltip existente*/
        this.ocultarTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = texto;
        
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            z-index: 9999;
            white-space: nowrap;
            pointer-events: none;
        `;

        document.body.appendChild(tooltip);

        /*Posicionamiento --------------------------------------------- ESTO DE SE DEBE REVISAR BIEN */ 
        const rect = evento.target.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;

        /*Guardar referencia*/
        evento.target._tooltip = tooltip;
    }

    ocultarTooltip() {
        const tooltipExistente = document.querySelector('.tooltip');
        if (tooltipExistente) {
            tooltipExistente.remove();
        }
    }

    /*NOTIFICACIONES GLOBALES*/
    mostrarNotificacion(mensaje, tipo = 'info') {
        /*Crear elemento de notificación*/
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion-global notificacion-${tipo}`;
        
        notificacion.innerHTML = `
            <i class="bi ${this.obtenerIconoNotificacion(tipo)}"></i>
            <span>${mensaje}</span>
            <button class="cerrar-notificacion" aria-label="Cerrar notificación">
                <i class="bi bi-x"></i>
            </button>
        `;

        /*Agregado de Estilos*/
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${this.obtenerColorNotificacion(tipo)};
            color: white;
            border-radius: 0.75rem;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            box-shadow: var(--sombra-elevada);
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notificacion);

        /*Animación de entrada*/
        setTimeout(() => {
            notificacion.style.transform = 'translateX(0)';
        }, 100);

        /*Botón cerrar*/
        const botonCerrar = notificacion.querySelector('.cerrar-notificacion');
        botonCerrar.addEventListener('click', () => {
            this.cerrarNotificacion(notificacion);
        });

        /*Cerrar automáticamente*/
        setTimeout(() => {
            this.cerrarNotificacion(notificacion);
        }, 5000);

        return notificacion;
    }

    cerrarNotificacion(notificacion) {
        notificacion.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }

    obtenerIconoNotificacion(tipo) {
        const iconos = {
            exito: 'bi-check-circle-fill',
            error: 'bi-exclamation-circle-fill',
            info: 'bi-info-circle-fill',
            advertencia: 'bi-exclamation-triangle-fill',
            carga: 'bi-arrow-repeat'
        };
        return iconos[tipo] || 'bi-info-circle-fill';
    }

    obtenerColorNotificacion(tipo) {
        const colores = {
            exito: 'var(--color-exito)',
            error: 'var(--color-peligro)',
            info: 'var(--color-informacion)',
            advertencia: 'var(--color-advertencia)',
            carga: 'var(--color-secundario)'
        };
        return colores[tipo] || 'var(--color-informacion)';
    }

    /*UTILIDADES GLOBALES*/
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /*Métodos estáticos para uso global*/
    
    static formatearPrecio(precio) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(precio);
    }

    static obtenerParametroURL(nombre) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(nombre);
    }

    static scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/*Inicializar cuando el DOM esté listo*/
document.addEventListener('DOMContentLoaded', () => {
    window.scriptsGenerales = new ScriptsGenerales();
    
    /*Hacer funciones disponibles globalmente*/
    window.mostrarNotificacion = (mensaje, tipo) => {
        return window.scriptsGenerales.mostrarNotificacion(mensaje, tipo);
    };
    
    window.formatearPrecio = ScriptsGenerales.formatearPrecio;
    window.obtenerParametroURL = ScriptsGenerales.obtenerParametroURL;
});

/*Soporte para módulos para escabilidad posterior a Backend*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScriptsGenerales;
}
