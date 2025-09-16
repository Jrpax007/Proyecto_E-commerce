/**
 * Sistema de Búsqueda en Tiempo Real.
 * Búsqueda y filtrado avanzado con sugerencias.
 */

class Buscador {
    constructor() {
        this.selectores = {
            inputBusqueda: '#busqueda-global',
            botonBuscar: '#boton-buscar',
            contenedorSugerencias: '#sugerencias-busqueda',
            overlaySugerencias: '#overlay-sugerencias',
            formBusqueda: '.contenedor-busqueda'
        };

        this.estado = {
            termino: '',
            sugerencias: [],
            mostrandoSugerencias: false,
            indiceSeleccionado: -1,
            timeoutBusqueda: null,
            cargando: false
        };

        this.config = {
            delayBusqueda: 300,
            maxSugerencias: 5,
            minCaracteres: 2
        };

        this.inicializado = false;
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;

        this.crearEstructuraDOM();
        this.configurarEventListeners();
        this.inicializado = true;

        console.log('Sistema de búsqueda inicializado correctamente');
    }

    crearEstructuraDOM() {
        /*Crea un contenedor de sugerencias si no existe*/
        if (!document.querySelector(this.selectores.contenedorSugerencias)) {
            const contenedor = document.createElement('div');
            contenedor.id = 'sugerencias-busqueda';
            contenedor.className = 'sugerencias-busqueda';
            contenedor.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--color-tarjeta);
                border: 1px solid var(--color-borde);
                border-radius: var(--radio-borde);
                margin-top: 0.5rem;
                box-shadow: var(--sombra-elevada);
                z-index: 1000;
                display: none;
                max-height: 300px;
                overflow-y: auto;
            `;

            const formBusqueda = document.querySelector(this.selectores.formBusqueda);
            if (formBusqueda) {
                formBusqueda.style.position = 'relative';
                formBusqueda.appendChild(contenedor);
            }
        }

        /*Crear overlay si no existe*/
        if (!document.querySelector(this.selectores.overlaySugerencias)) {
            const overlay = document.createElement('div');
            overlay.id = 'overlay-sugerencias';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: transparent;
                z-index: 999;
                display: none;
            `;

            overlay.addEventListener('click', () => {
                this.ocultarSugerencias();
            });

            document.body.appendChild(overlay);
        }
    }

    configurarEventListeners() {
        const input = document.querySelector(this.selectores.inputBusqueda);
        const boton = document.querySelector(this.selectores.botonBuscar);

        if (!input) return;

        /*Evento del input para búsqueda en tiempo real*/
        input.addEventListener('input', (e) => {
            this.manejarInput(e.target.value);
        });

        /*Evento del focus para mostrar sugerencias*/
        input.addEventListener('focus', () => {
            if (this.estado.termino.length >= this.config.minCaracteres) {
                this.mostrarSugerencias();
            }
        });

        /*Evento keydown para navegación con teclado*/
        input.addEventListener('keydown', (e) => {
            this.manejarTeclado(e);
        });

        /*Evento del click en botón de búsqueda*/
        if (boton) {
            boton.addEventListener('click', () => {
                this.ejecutarBusqueda(this.estado.termino);
            });
        }

        /*Evento para cerrar sugerencias al hacer clic fuera*/
        document.addEventListener('click', (e) => {
            if (!e.target.closest(this.selectores.formBusqueda)) {
                this.ocultarSugerencias();
            }
        });

        /*Evento para manejar cambios de tema*/
        document.addEventListener('temaCambiado', () => {
            this.actualizarEstilos();
        });
    }

    manejarInput(termino) {
        this.estado.termino = termino.trim();
        
        /*Cancela el timeout para evitar que se ejecute innecesariamente.*/
        if (this.estado.timeoutBusqueda) {
            clearTimeout(this.estado.timeoutBusqueda);
        }

        if (this.estado.termino.length >= this.config.minCaracteres) {
            /*Muestra el estado de carga mientras se buscan las sugerencias.*/
            this.mostrarEstadoCarga();
            
            /* Ejecuta la búsqueda después de un retraso para evitar muchas solicitudes continuas. */
            this.estado.timeoutBusqueda = setTimeout(() => {
                this.obtenerSugerencias(this.estado.termino);
            }, this.config.delayBusqueda);
        } else {
            this.ocultarSugerencias();
            this.estado.sugerencias = [];
        }
    }

    async obtenerSugerencias(termino) {
        if (this.estado.cargando) return;
        
        this.estado.cargando = true;

        try {
            let resultados = [];
            
            /*Intenta obtener de la API primero*/
            if (typeof window.api !== 'undefined' && window.api.estaConectado()) {
                resultados = await window.api.buscarProductos(termino);
            } else {
                /*Si no hay conexión, realiza una búsqueda local en los datos existentes.*/
                resultados = await this.busquedaLocal(termino);
            }

            this.estado.sugerencias = resultados.slice(0, this.config.maxSugerencias);
            this.mostrarSugerencias();

        } catch (error) {
            console.error('Error obteniendo sugerencias:', error);
            this.estado.sugerencias = [];
            this.ocultarSugerencias();
        } finally {
            this.estado.cargando = false;
        }
    }

    async busquedaLocal(termino) {
        /*Simula una búsqueda local en un conjunto de datos pre-cargados.*/
        try {
            const productos = await obtenerProductos();
            const terminoLower = termino.toLowerCase();
            
            return productos.filter(producto =>
                producto.nombre.toLowerCase().includes(terminoLower) ||
                producto.categoria.toLowerCase().includes(terminoLower) ||
                (producto.descripcion && producto.descripcion.toLowerCase().includes(terminoLower)) ||
                (producto.marca && producto.marca.toLowerCase().includes(terminoLower))
            );
        } catch (error) {
            console.error('Error en búsqueda local:', error);
            return [];
        }
    }

    mostrarSugerencias() {
        const contenedor = document.querySelector(this.selectores.contenedorSugerencias);
        const overlay = document.querySelector(this.selectores.overlaySugerencias);
        
        if (!contenedor || this.estado.sugerencias.length === 0) {
            this.ocultarSugerencias();
            return;
        }

        /* Genera el HTML de las sugerencias y las muestra */
        contenedor.innerHTML = this.generarHTMLSugerencias();
        contenedor.style.display = 'block';
        
        if (overlay) {
            overlay.style.display = 'block';
        }

        this.estado.mostrandoSugerencias = true;
        this.configurarEventListenersSugerencias();
    }

    generarHTMLSugerencias() {
        return `
            <div class="lista-sugerencias">
                ${this.estado.sugerencias.map((producto, index) => `
                    <div class="sugerencia-item ${index === this.estado.indiceSeleccionado ? 'seleccionado' : ''}" 
                        data-producto-id="${producto.id}" 
                        data-index="${index}">
                        <div class="sugerencia-imagen">
                            <img src="${producto.img || '../assets/images/placeholder.webp'}" 
                                alt="${producto.nombre}"
                                onerror="this.src='../assets/images/placeholder.webp'">
                        </div>
                        <div class="sugerencia-info">
                            <div class="sugerencia-nombre">${this.resaltarCoincidencias(producto.nombre, this.estado.termino)}</div>
                            <div class="sugerencia-categoria">${this.formatearCategoria(producto.categoria)}</div>
                            <div class="sugerencia-precio">${this.formatearPrecio(producto.precio)}</div>
                        </div>
                    </div>
                `).join('')}
                
                ${this.estado.sugerencias.length > 0 ? `
                    <div class="sugerencia-ver-todos" data-action="ver-todos">
                        <i class="bi bi-search"></i>
                        Ver todos los resultados para "${this.estado.termino}"
                    </div>
                ` : ''}
            </div>
        `;
    }

    resaltarCoincidencias(texto, termino) {
        if (!termino) return texto;
        
        const regex = new RegExp(`(${termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return texto.replace(regex, '<mark>$1</mark>');
    }

    formatearCategoria(categoria) {
        const categorias = {
            'cpu': 'Procesador',
            'gpu': 'Tarjeta Gráfica',
            'ram': 'Memoria RAM',
            'motherboard': 'Motherboard',
            'almacenamiento': 'Almacenamiento',
            'fuente': 'Fuente de Poder',
            'gabinete': 'Gabinete',
            'refrigeracion': 'Refrigeración'
        };
        
        return categorias[categoria] || categoria;
    }

    formatearPrecio(precio) {
        if (typeof window.api?.formatearPrecio === 'function') {
            return window.api.formatearPrecio(precio);
        }
        return `$${precio.toFixed(2)}`;
    }

    configurarEventListenersSugerencias() {
        const items = document.querySelectorAll('.sugerencia-item');
        const verTodos = document.querySelector('.sugerencia-ver-todos');
        
        items.forEach(item => {
            item.addEventListener('click', () => {
                const productoId = item.getAttribute('data-producto-id');
                this.seleccionarProducto(productoId);
            });
            
            item.addEventListener('mouseenter', () => {
                const index = parseInt(item.getAttribute('data-index'));
                this.seleccionarSugerencia(index);
            });
        });
        
        if (verTodos) {
            verTodos.addEventListener('click', () => {
                this.ejecutarBusqueda(this.estado.termino);
            });
        }
    }

    seleccionarSugerencia(index) {
        this.estado.indiceSeleccionado = index;
        
        /*Actualiza la clase 'seleccionado' en los elementos*/
        document.querySelectorAll('.sugerencia-item').forEach((item, i) => {
            item.classList.toggle('seleccionado', i === index);
        });
    }

    async seleccionarProducto(productoId) {
        try {
            const producto = await obtenerProductoPorId(productoId);
            if (producto) {
                /* Navegar a la página de detalles del producto */
                this.ocultarSugerencias();
                
                /*En una implementación real, esto navegaría a la página de detalles*/
                console.log('Producto seleccionado:', producto);
                
                if (typeof window.mostrarNotificacion === 'function') {
                    window.mostrarNotificacion(`Producto seleccionado: ${producto.nombre}`, 'info');
                }
                
                /*Simulación de navegación*/
                /*window.location.href = `pages/detalles.html?id=${producto.id}`;*/
            }
        } catch (error) {
            console.error('Error al seleccionar producto:', error);
        }
    }

    manejarTeclado(evento) {
        if (!this.estado.mostrandoSugerencias) return;
        
        switch (evento.key) {
            case 'ArrowDown':
                evento.preventDefault();
                this.moverSeleccion(1);
                break;
                
            case 'ArrowUp':
                evento.preventDefault();
                this.moverSeleccion(-1);
                break;
                
            case 'Enter':
                evento.preventDefault();
                this.confirmarSeleccion();
                break;
                
            case 'Escape':
                evento.preventDefault();
                this.ocultarSugerencias();
                break;
                
            case 'Tab':
                this.ocultarSugerencias();
                break;
        }
    }

    moverSeleccion(direccion) {
        const maxIndex = this.estado.sugerencias.length - 1;
        let nuevoIndice = this.estado.indiceSeleccionado + direccion;
        
        if (nuevoIndice < 0) nuevoIndice = maxIndex;
        if (nuevoIndice > maxIndex) nuevoIndice = 0;
        
        this.seleccionarSugerencia(nuevoIndice);
        
        /*Scroll al elemento seleccionado*/
        const elemento = document.querySelector(`[data-index="${nuevoIndice}"]`);
        if (elemento) {
            elemento.scrollIntoView({ block: 'nearest' });
        }
    }

    confirmarSeleccion() {
        if (this.estado.indiceSeleccionado >= 0) {
            const producto = this.estado.sugerencias[this.estado.indiceSeleccionado];
            this.seleccionarProducto(producto.id);
        } else {
            this.ejecutarBusqueda(this.estado.termino);
        }
    }

    ejecutarBusqueda(termino) {
        if (!termino.trim()) {
            if (typeof window.mostrarNotificacion === 'function') {
                window.mostrarNotificacion('Ingresa un término de búsqueda', 'info');
            }
            return;
        }

        this.ocultarSugerencias();
        
        /*Guarda historial de búsqueda*/
        this.guardarEnHistorial(termino);
        
        /*Redirige a página de productos con término de búsqueda*/
        const url = new URL('pages/productos.html', window.location.origin);
        url.searchParams.set('busqueda', termino);
        window.location.href = url.toString();
    }

    guardarEnHistorial(termino) {
        try {
            const historial = JSON.parse(localStorage.getItem('historialBusquedas') || '[]');
            
            /*Evita duplicados*/
            if (!historial.includes(termino)) {
                historial.unshift(termino);
                
                /*Mantiene un máximo de 10 búsquedas*/
                if (historial.length > 10) {
                    historial.pop();
                }
                
                localStorage.setItem('historialBusquedas', JSON.stringify(historial));
            }
        } catch (error) {
            console.error('Error guardando en historial:', error);
        }
    }

    obtenerHistorial() {
        try {
            return JSON.parse(localStorage.getItem('historialBusquedas') || '[]');
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return [];
        }
    }
    /*Muestra un indicador de carga mientras se obtienen sugerencias*/
    mostrarEstadoCarga() {
        const contenedor = document.querySelector(this.selectores.contenedorSugerencias);
        if (!contenedor) return;
        
        contenedor.innerHTML = `
            <div class="sugerencia-cargando">
                <div class="cargador-pequeno"></div>
                <span>Buscando...</span>
            </div>
        `;
        contenedor.style.display = 'block';
        
        /*Aplicar estilos al cargador*/
        const cargador = contenedor.querySelector('.cargador-pequeno');
        if (cargador) {
            cargador.style.cssText = `
                width: 20px;
                height: 20px;
                border: 2px solid var(--color-borde);
                border-top: 2px solid var(--color-primario);
                border-radius: 50%;
                animation: girar 1s linear infinite;
            `;
        }
    }

    ocultarSugerencias() {
        const contenedor = document.querySelector(this.selectores.contenedorSugerencias);
        const overlay = document.querySelector(this.selectores.overlaySugerencias);
        
        if (contenedor) {
            contenedor.style.display = 'none';
            contenedor.innerHTML = '';
        }
        
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        this.estado.mostrandoSugerencias = false;
        this.estado.indiceSeleccionado = -1;
    }

    actualizarEstilos() {
        /*Reaplicar estilos cuando cambia el tema*/
        const contenedor = document.querySelector(this.selectores.contenedorSugerencias);
        if (contenedor) {
            contenedor.style.background = 'var(--color-tarjeta)';
            contenedor.style.borderColor = 'var(--color-borde)';
        }
    }

    limpiarBusqueda() {
        const input = document.querySelector(this.selectores.inputBusqueda);
        if (input) {
            input.value = '';
        }
        
        this.estado.termino = '';
        this.estado.sugerencias = [];
        this.ocultarSugerencias();
    }

    /*Métodos estáticos para uso global*/
/**
 * Ejecuta la búsqueda utilizando el objeto `buscador` global si está disponible.
 */
    static buscar(termino) {
        if (window.buscador) {
            window.buscador.ejecutarBusqueda(termino);
        }
    }

/**
 * Establece el foco en el campo de búsqueda con el id `#busqueda-global`.
 */
    static focus() {
        const input = document.querySelector('#busqueda-global');
        if (input) {
            input.focus();
        }
    }

/**
 * Limpia el campo de búsqueda utilizando el objeto `buscador` global si está disponible.
 */
    static limpiar() {
        if (window.buscador) {
            window.buscador.limpiarBusqueda();
        }
    }
}

/*Inicialización cuando el DOM está listo*/
document.addEventListener('DOMContentLoaded', function() {
    window.buscador = new Buscador();
});

/*Soporte para módulos para escabilidad posterior a Backend*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Buscador;
}