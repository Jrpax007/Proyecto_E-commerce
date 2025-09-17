/**
 * Toggle de Tema Oscuro/Claro:
 * Gestión de temas con persistencia en localStorage y detección del sistema.
 */

class ToggleTema {
    constructor() {
        this.selectores = {
            botonTema: '#selector-tema',
            iconoTema: '.icono-tema',
            atributoTema: 'data-tema',
            html: 'html'
        };
        
        this.clases = {
            temaOscuro: 'bi-sun-fill',
            temaClaro: 'bi-moon-fill'
        };
        
        this.claveAlmacenamiento = 'temaComponentesPC';
        this.inicializado = false;
        
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.cargarTemaGuardado();
        this.configurarEventListeners();
        this.configurarObservadorSistema();
        this.inicializado = true;
        
        console.log('Toggle de tema inicializado correctamente');
    }

    cargarTemaGuardado() {
        const temaGuardado = localStorage.getItem(this.claveAlmacenamiento);
        const preferenciaSistema = this.obtenerPreferenciaSistema();
        
        /*Prioridad: localStorage > preferencia sistema > claro por defecto*/
        if (temaGuardado === 'oscuro' || (!temaGuardado && preferenciaSistema === 'oscuro')) {
            this.activarModoOscuro();
        } else {
            this.activarModoClaro();
        }
    }

    obtenerPreferenciaSistema() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
    }

    configurarEventListeners() {
        const botonTema = document.querySelector(this.selectores.botonTema);
        
        if (botonTema) {
            /*Click del mouse*/
            botonTema.addEventListener('click', () => {
                this.alternarTema();
            });

            /*Soporte para teclado (Enter y Espaciado)*/
            botonTema.addEventListener('keypress', (evento) => {
                if (evento.key === 'Enter' || evento.key === ' ') {
                    evento.preventDefault();
                    this.alternarTema();
                }
            });

            /*Mejorar accesibilidad*/
            botonTema.setAttribute('aria-pressed', this.obtenerTemaActual() === 'oscuro');
        }

        /*Escucha los cambios en las preferencias del sistema*/
        this.configurarObservadorSistema();
    }

    configurarObservadorSistema() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const manejarCambioSistema = (evento) => {
            /*Solo cambiar si no hay preferencia guardada*/
            if (!localStorage.getItem(this.claveAlmacenamiento)) {
                if (evento.matches) {
                    this.activarModoOscuro();
                } else {
                    this.activarModoClaro();
                }
            }
        };

        /*Escucha cambios (navegadores modernos)*/
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', manejarCambioSistema);
        } else {
            /*Soporte para navegadores antiguos*/
            mediaQuery.addListener(manejarCambioSistema);
        }
    }

    alternarTema() {
        const temaActual = this.obtenerTemaActual();
        
        if (temaActual === 'oscuro') {
            this.activarModoClaro();
        } else {
            this.activarModoOscuro();
        }

        /*Actualizar los estados ARIA (accesibilidad)*/
        const botonTema = document.querySelector(this.selectores.botonTema);
        if (botonTema) {
            botonTema.setAttribute('aria-pressed', temaActual === 'claro');
        }
    }

    activarModoOscuro() {
        const html = document.documentElement;
        
        /*Aplica tema oscuro*/
        html.setAttribute(this.selectores.atributoTema, 'oscuro');
        this.actualizarIcono('oscuro');
        
        /*Guarda la preferencia*/
        localStorage.setItem(this.claveAlmacenamiento, 'oscuro');
        
        /*Dispara el evento personalizado*/
        this.dispararEventoPersonalizado('temaCambiado', { 
            tema: 'oscuro',
            fuente: 'usuario'
        });
        /*lo muestra */
        console.log('Modo oscuro activado');
    }

    activarModoClaro() {
        const html = document.documentElement;
        
        /*Aplica tema claro*/
        html.setAttribute(this.selectores.atributoTema, 'claro');
        this.actualizarIcono('claro');
        
        /*Guardar preferencia*/
        localStorage.setItem(this.claveAlmacenamiento, 'claro');
        
        /*Disparar evento personalizado*/
        this.dispararEventoPersonalizado('temaCambiado', { 
            tema: 'claro',
            fuente: 'usuario'
        });
        
        console.log('Modo claro activado');
    }

    actualizarIcono(modo) {
        const iconos = document.querySelectorAll(this.selectores.iconoTema);
        
        iconos.forEach(icono => {
            /*Limpia clases existentes*/
            icono.classList.remove(this.clases.temaClaro, this.clases.temaOscuro);
            
            /*Añadir clase correspondiente*/
            if (modo === 'oscuro') {
                icono.classList.add(this.clases.temaOscuro);
                icono.setAttribute('aria-label', 'Cambiar a modo claro');
            } else {
                icono.classList.add(this.clases.temaClaro);
                icono.setAttribute('aria-label', 'Cambiar a modo oscuro');
            }
        });
    }

    obtenerTemaActual() {
        return document.documentElement.getAttribute(this.selectores.atributoTema) || 'claro';
    }

    esModoOscuro() {
        return this.obtenerTemaActual() === 'oscuro';
    }

    esModoClaro() {
        return this.obtenerTemaActual() === 'claro';
    }

    limpiarPreferencia() {
        localStorage.removeItem(this.claveAlmacenamiento);
        this.cargarTemaGuardado(); /*Vuelve a la preferencia del sistema*/
    }

    dispararEventoPersonalizado(nombreEvento, detalle) {
        const evento = new CustomEvent(nombreEvento, { 
            detail: detalle,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(evento);
    }

    /*Métodos estáticos para uso global*/
    static alternar() {
        if (window.toggleTema) {
            window.toggleTema.alternarTema();
        }
    }

    static obtenerTema() {
        return window.toggleTema ? window.toggleTema.obtenerTemaActual() : 'claro';
    }

    static forzarTema(tema) {
        if (window.toggleTema) {
            if (tema === 'oscuro') {
                window.toggleTema.activarModoOscuro();
            } else {
                window.toggleTema.activarModoClaro();
            }
        }
    }
}

/*Inicia cuando el DOM está listo*/
document.addEventListener('DOMContentLoaded', function() {
    /*Crea una instancia global*/
    window.toggleTema = new ToggleTema();
    
    /*Escuchar eventos del cambio para actualizar componentes*/
    document.addEventListener('temaCambiado', (evento) => {
        console.log('Tema cambiado a:', evento.detail.tema);
        
        /*Actualiza los componentes que dependen del tema*/
        if (typeof window.actualizarComponentesTema === 'function') {
            window.actualizarComponentesTema(evento.detail.tema);
        }
    });
});

/*Soporte para módulos para escabilidad posterior a Backend*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToggleTema;
}
