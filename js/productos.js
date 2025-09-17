/**
 * Sistema de Gestión de Productos:
 * Catálogo, filtros, búsqueda y paginación
 */

class GestorProductos {
    constructor() {
        this.selectores = {
            gridProductos: '#grid-productos',
            gridDestacados: '#grid-productos-destacados',
            contadorResultados: '#contador-resultados',
            filtroCategoria: '#filtro-categoria',
            filtroPrecio: '#filtro-precio',
            precioMin: '#precio-min',
            precioMax: '#precio-max',
            ordenProductos: '#orden-productos',
            botonFiltrar: '#boton-aplicar-filtros',
            botonLimpiar: '#boton-limpiar-filtros',
            paginacionAnterior: '#boton-pagina-anterior',
            paginacionSiguiente: '#boton-pagina-siguiente',
            numerosPagina: '#numeros-pagina',
            busquedaGlobal: '#busqueda-global',
            botonBuscar: '#boton-buscar'
        };

        this.estado = {
            productos: [],
            productosFiltrados: [],
            filtros: {
                categoria: '',
                precioMax: 10000,
                marcas: [],
                orden: 'nombre',
                paginaActual: 1,
                productosPorPagina: 12,
                terminoBusqueda: ''
            },
            cargando: false,
            error: null
        };

        this.inicializado = false;
        this.inicializar();
    }

    /*async inicializar() {
        if (this.inicializado) return;

        try {
            await this.cargarProductos();
            this.configurarEventListeners();
            this.procesarParametrosURL();
            this.aplicarFiltros();
            this.inicializado = true;

            console.log('Gestor de productos inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando gestor de productos:', error);
            this.mostrarError('Error al inicializar el sistema de productos');
        }
    }*/

    /*async cargarProductos() {
        if (this.estado.cargando) return;

        this.estado.cargando = true;
        this.mostrarEstadoCarga();

        try {
            // Obtener productos desde la API
            this.estado.productos = await obtenerProductos();
            this.estado.error = null;

            // Cargar productos destacados
            await this.cargarProductosDestacados();

        } catch (error) {
            console.error('Error cargando productos:', error);
            this.estado.error = error.message;
            this.mostrarError('No se pudieron cargar los productos');
        } finally {
            this.estado.cargando = false;
        }
    }*/

    /*async cargarProductosDestacados() {
        try {
            const gridDestacados = document.querySelector(this.selectores.gridDestacados);
            if (!gridDestacados) return;

            // Simular productos destacados (los 4 primeros)
            const destacados = this.estado.productos.slice(0, 4);
            this.mostrarProductosEnGrid(destacados, gridDestacados);

        } catch (error) {
            console.error('Error cargando productos destacados:', error);
        }
    }*/

    configurarEventListeners() {
        /*Filtro por categoría*/
        const filtroCategoria = document.querySelector(this.selectores.filtroCategoria);
        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', (evento) => {
                this.estado.filtros.categoria = evento.target.value;
                this.estado.filtros.paginaActual = 1;
                this.aplicarFiltros();
            });
        }

        /*Filtro por precio*/
        const filtroPrecio = document.querySelector(this.selectores.filtroPrecio);
        if (filtroPrecio) {
            filtroPrecio.addEventListener('input', (evento) => {
                this.estado.filtros.precioMax = parseInt(evento.target.value);
                this.actualizarDisplayPrecio();
                this.estado.filtros.paginaActual = 1;
            });
        }

        /*Botón aplicar filtros*/
        const botonFiltrar = document.querySelector(this.selectores.botonFiltrar);
        if (botonFiltrar) {
            botonFiltrar.addEventListener('click', () => {
                this.aplicarFiltros();
            });
        }

        /*Botón limpiar filtros*/
        const botonLimpiar = document.querySelector(this.selectores.botonLimpiar);
        if (botonLimpiar) {
            botonLimpiar.addEventListener('click', () => {
                this.limpiarFiltros();
            });
        }

        /*Ordenamiento*/
        const ordenProductos = document.querySelector(this.selectores.ordenProductos);
        if (ordenProductos) {
            ordenProductos.addEventListener('change', (evento) => {
                this.estado.filtros.orden = evento.target.value;
                this.aplicarFiltros();
            });
        }

        /*Paginación*/
        const pagAnterior = document.querySelector(this.selectores.paginacionAnterior);
        const pagSiguiente = document.querySelector(this.selectores.paginacionSiguiente);

        if (pagAnterior) {
            pagAnterior.addEventListener('click', () => {
                this.cambiarPagina(this.estado.filtros.paginaActual - 1);
            });
        }

        if (pagSiguiente) {
            pagSiguiente.addEventListener('click', () => {
                this.cambiarPagina(this.estado.filtros.paginaActual + 1);
            });
        }

        /*Búsqueda en tiempo real con debounce*/
        /*debounce = retarda 300miliseg la busqueda luego que deja de escribir*/
        const buscador = document.querySelector(this.selectores.busquedaGlobal);
        if (buscador) {
            buscador.addEventListener('input', this.debounce((evento) => {
                this.realizarBusqueda(evento.target.value);
            }, 300));
        }

        /*Botón de búsqueda*/
        const botonBuscar = document.querySelector(this.selectores.botonBuscar);
        if (botonBuscar) {
            botonBuscar.addEventListener('click', () => {
                const buscador = document.querySelector(this.selectores.busquedaGlobal);
                if (buscador) {
                    this.realizarBusqueda(buscador.value);
                }
            });
        }

        /*Manejar cambios de tema*/
        document.addEventListener('temaCambiado', () => {
            this.actualizarVista();
        });
    }

    procesarParametrosURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        /*Categoría desde URL*/
        const categoriaURL = urlParams.get('categoria');
        if (categoriaURL) {
            this.estado.filtros.categoria = categoriaURL;
            this.actualizarSelectorCategoria(categoriaURL);
        }

        /*Búsqueda desde URL*/
        const busquedaURL = urlParams.get('busqueda');
        if (busquedaURL) {
            this.realizarBusqueda(busquedaURL);
            const buscador = document.querySelector(this.selectores.busquedaGlobal);
            if (buscador) {
                buscador.value = busquedaURL;
            }
        }
    }

    aplicarFiltros() {
        if (this.estado.productos.length === 0) return;

        try {
            /*Aplica filtros*/
            this.estado.productosFiltrados = this.estado.productos.filter(producto => {
                /*Filtro por categoría*/
                if (this.estado.filtros.categoria && producto.categoria !== this.estado.filtros.categoria) {
                    return false;
                }

                /*Filtro por precio*/
                if (producto.precio > this.estado.filtros.precioMax) {
                    return false;
                }

                /*Filtro por marcas*/
                if (this.estado.filtros.marcas.length > 0 && !this.estado.filtros.marcas.includes(producto.marca)) {
                    return false;
                }

                /*Filtro por búsqueda*/
                if (this.estado.filtros.terminoBusqueda) {
                    const termino = this.estado.filtros.terminoBusqueda.toLowerCase();
                    const coincideNombre = producto.nombre.toLowerCase().includes(termino);
                    const coincideDescripcion = producto.descripcion && producto.descripcion.toLowerCase().includes(termino);
                    const coincideCategoria = producto.categoria.toLowerCase().includes(termino);
                    const coincideMarca = producto.marca && producto.marca.toLowerCase().includes(termino);
                    
                    if (!(coincideNombre || coincideDescripcion || coincideCategoria || coincideMarca)) {
                        return false;
                    }
                }

                return true;
            });

            /*Aplicar ordenamiento*/
            this.ordenarProductos();

            /*Actualizar vista*/
            this.actualizarVista();
            this.actualizarPaginacion();
            this.actualizarContadorResultados();

        } catch (error) {
            console.error('Error aplicando filtros:', error);
            this.mostrarError('Error al aplicar los filtros');
        }
    }

    ordenarProductos() {
        switch (this.estado.filtros.orden) {
            case 'precio-asc':
                this.estado.productosFiltrados.sort((a, b) => a.precio - b.precio);
                break;
            case 'precio-desc':
                this.estado.productosFiltrados.sort((a, b) => b.precio - a.precio);
                break;
            case 'popularidad':
                /*Ordenar por stock (simulando popularidad)*/
                this.estado.productosFiltrados.sort((a, b) => (b.stock || 0) - (a.stock || 0));
                break;
            case 'nombre':
            default:
                this.estado.productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
        }
    }

    actualizarVista() {
        const grid = document.querySelector(this.selectores.gridProductos);
        if (!grid) return;

        /*Calcular productos para la página actual*/
        const inicio = (this.estado.filtros.paginaActual - 1) * this.estado.filtros.productosPorPagina;
        const fin = inicio + this.estado.filtros.productosPorPagina;
        const productosPagina = this.estado.productosFiltrados.slice(inicio, fin);

        if (productosPagina.length === 0) {
            this.mostrarSinResultados();
            return;
        }

        /*Genera HTML de los productos*/
        grid.innerHTML = productosPagina.map(producto => this.generarHTMLProducto(producto)).join('');

        /*Configura escuchadores (liesteners) para los botones*/
        this.configurarEventListenersProductos();
    }

    generarHTMLProducto(producto) {
        const precioFormateado = typeof window.api?.formatearPrecio === 'function' 
            ? window.api.formatearPrecio(producto.precio)
            : `$${producto.precio.toFixed(2)}`;

        return `
            <div class="tarjeta-producto" data-producto-id="${producto.id}">
                <div class="imagen-producto">
                    <img src="${producto.img || '../assets/images/placeholder.webp'}" 
                        alt="${producto.nombre}"
                        onerror="this.src='../assets/images/placeholder.webp'">
                    ${producto.stock < 5 ? `
                        <span class="badge-descuento">Poco stock</span>
                    ` : ''}
                    ${producto.precioOriginal > producto.precio ? `
                        <span class="badge-descuento">-${Math.round((1 - producto.precio/producto.precioOriginal) * 100)}%</span>
                    ` : ''}
                </div>
                
                <div class="contenido-producto">
                    <h3 class="nombre-producto">${producto.nombre}</h3>
                    <p class="categoria-producto">${this.formatearCategoria(producto.categoria)}</p>
                    
                    ${producto.descripcion ? `
                        <p class="descripcion-producto">${this.acortarTexto(producto.descripcion, 80)}</p>
                    ` : ''}
                    
                    <div class="precio-producto">
                        ${producto.precioOriginal && producto.precioOriginal > producto.precio ? `
                            <span class="precio-original">${typeof window.api?.formatearPrecio === 'function' 
                                ? window.api.formatearPrecio(producto.precioOriginal)
                                : `$${producto.precioOriginal.toFixed(2)}`}</span>
                        ` : ''}
                        <span class="precio-actual">${precioFormateado}</span>
                    </div>
                    
                    <div class="acciones-producto">
                        <button class="boton boton-primario boton-agregar-carrito" 
                                data-producto-id="${producto.id}"
                                aria-label="Agregar al carrito">
                            <i class="bi bi-cart-plus"></i>
                            Agregar
                        </button>
                        
                        <button class="boton boton-secundario boton-ver-detalles"
                                data-producto-id="${producto.id}"
                                aria-label="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
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

    acortarTexto(texto, longitudMaxima) {
        if (texto.length <= longitudMaxima) return texto;
        return texto.substring(0, longitudMaxima) + '...';
    }

    configurarEventListenersProductos() {
        /*Botones agregar al carrito*/
        const botonesAgregar = document.querySelectorAll('.boton-agregar-carrito');
        botonesAgregar.forEach(boton => {
            boton.addEventListener('click', (evento) => {
                const idProducto = evento.currentTarget.dataset.productoId;
                this.agregarAlCarrito(idProducto);
            });
        });

        /*Botones ver detalles*/
        const botonesDetalles = document.querySelectorAll('.boton-ver-detalles');
        botonesDetalles.forEach(boton => {
            boton.addEventListener('click', (evento) => {
                const idProducto = evento.currentTarget.dataset.productoId;
                this.verDetallesProducto(idProducto);
            });
        });
    }

    /*async agregarAlCarrito(idProducto) {
        try {
            const producto = await obtenerProductoPorId(idProducto);
            if (producto && window.carrito) {
                const agregado = window.carrito.agregarProducto(producto);
                
                if (agregado) {
                    // Efecto visual de confirmación
                    const boton = document.querySelector(`[data-producto-id="${idProducto}"] .boton-agregar-carrito`);
                    if (boton) {
                        boton.classList.add('agregado');
                        boton.innerHTML = '<i class="bi bi-check"></i> Agregado';
                        
                        setTimeout(() => {
                            boton.classList.remove('agregado');
                            boton.innerHTML = '<i class="bi bi-cart-plus"></i> Agregar';
                        }, 2000);
                    }
                }
            }
        } catch (error) {
            console.error('Error agregando al carrito:', error);
            this.mostrarNotificacion('Error al agregar producto', 'error');
        }
    }*/

    /*async verDetallesProducto(idProducto) {
        // En una implementación real, esto navegaría a la página de detalles
        console.log('Ver detalles del producto:', idProducto);
        
        // Simulación: mostrar información en consola
        try {
            const producto = await obtenerProductoPorId(idProducto);
            console.log('Detalles del producto:', producto);
            
            this.mostrarNotificacion(`Viendo detalles de: ${producto.nombre}`, 'info');
        } catch (error) {
            console.error('Error cargando detalles:', error);
        }
    }*/

    actualizarPaginacion() {
        const totalPaginas = Math.ceil(this.estado.productosFiltrados.length / this.estado.filtros.productosPorPagina);
        const botonAnterior = document.querySelector(this.selectores.paginacionAnterior);
        const botonSiguiente = document.querySelector(this.selectores.paginacionSiguiente);
        const contenedorNumeros = document.querySelector(this.selectores.numerosPagina);

        /*Actualiza estado de botones*/
        if (botonAnterior) {
            botonAnterior.disabled = this.estado.filtros.paginaActual <= 1;
        }

        if (botonSiguiente) {
            botonSiguiente.disabled = this.estado.filtros.paginaActual >= totalPaginas;
        }

        /*Actualiza números de página*/
        if (contenedorNumeros) {
            contenedorNumeros.innerHTML = this.generarNumerosPagina(totalPaginas);
        }
    }

    generarNumerosPagina(totalPaginas) {
        let numeros = '';
        const paginaActual = this.estado.filtros.paginaActual;
        
        /*Muestra como máximo 5 números alrededor de la página actual*/
        const inicio = Math.max(1, paginaActual - 2);
        const fin = Math.min(totalPaginas, inicio + 4);
        
        for (let i = inicio; i <= fin; i++) {
            numeros += `
                <button class="numero-pagina ${i === paginaActual ? 'pagina-activa' : ''}" 
                        onclick="gestorProductos.cambiarPagina(${i})">
                    ${i}
                </button>
            `;
        }
        
        return numeros;
    }

    cambiarPagina(nuevaPagina) {
        const totalPaginas = Math.ceil(this.estado.productosFiltrados.length / this.estado.filtros.productosPorPagina);
        
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            this.estado.filtros.paginaActual = nuevaPagina;
            this.aplicarFiltros();
            
            /*Scroll suave hacia arriba*/
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    actualizarContadorResultados() {
        const contador = document.querySelector(this.selectores.contadorResultados);
        if (contador) {
            const total = this.estado.productosFiltrados.length;
            const inicio = (this.estado.filtros.paginaActual - 1) * this.estado.filtros.productosPorPagina + 1;
            const fin = Math.min(inicio + this.estado.filtros.productosPorPagina - 1, total);
            
            contador.textContent = `Mostrando ${inicio}-${fin} de ${total} producto${total !== 1 ? 's' : ''}`;
        }
    }

    actualizarDisplayPrecio() {
        const precioMax = document.querySelector(this.selectores.precioMax);
        if (precioMax) {
            precioMax.textContent = `$${this.estado.filtros.precioMax}`;
        }
    }

    actualizarSelectorCategoria(categoria) {
        const selector = document.querySelector(this.selectores.filtroCategoria);
        if (selector) {
            selector.value = categoria;
        }
    }

    /*async realizarBusqueda(termino) {
        this.estado.filtros.terminoBusqueda = termino.trim();
        this.estado.filtros.paginaActual = 1;
        
        if (!termino.trim()) {
            this.aplicarFiltros();
            return;
        }

        try {
            this.mostrarEstadoCarga();
            this.aplicarFiltros();
        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.mostrarError('Error al realizar la búsqueda');
        }
    }*/

    limpiarFiltros() {
        this.estado.filtros = {
            categoria: '',
            precioMax: 10000,
            marcas: [],
            orden: 'nombre',
            paginaActual: 1,
            productosPorPagina: 12,
            terminoBusqueda: ''
        };

        /*Resetea controles UI*/
        const selectorCategoria = document.querySelector(this.selectores.filtroCategoria);
        const selectorPrecio = document.querySelector(this.selectores.filtroPrecio);
        const selectorOrden = document.querySelector(this.selectores.ordenProductos);
        const buscador = document.querySelector(this.selectores.busquedaGlobal);

        if (selectorCategoria) selectorCategoria.value = '';
        if (selectorPrecio) selectorPrecio.value = '10000';
        if (selectorOrden) selectorOrden.value = 'nombre';
        if (buscador) buscador.value = '';

        this.actualizarDisplayPrecio();
        this.aplicarFiltros();
        
        /*Limpia los parámetros de URL*/
        const url = new URL(window.location);
        url.search = '';
        window.history.replaceState({}, '', url);
    }

    mostrarProductosEnGrid(productos, gridElement) {
        if (!gridElement) return;

        gridElement.innerHTML = productos.map(producto => this.generarHTMLProducto(producto)).join('');
        this.configurarEventListenersProductos();
    }

    mostrarEstadoCarga() {
        const grid = document.querySelector(this.selectores.gridProductos);
        if (grid) {
            grid.innerHTML = `
                <div class="estado-carga">
                    <div class="cargador"></div>
                    <p>Cargando productos...</p>
                </div>
            `;
        }
    }

    mostrarSinResultados() {
        const grid = document.querySelector(this.selectores.gridProductos);
        if (grid) {
            grid.innerHTML = `
                <div class="sin-resultados">
                    <i class="bi bi-search"></i>
                    <h3>No se encontraron productos</h3>
                    <p>${this.estado.filtros.terminoBusqueda 
                        ? `No hay resultados para "${this.estado.filtros.terminoBusqueda}"` 
                        : 'Intenta ajustar los filtros o realizar otra búsqueda'}</p>
                    <button class="boton boton-primario" onclick="gestorProductos.limpiarFiltros()">
                        <i class="bi bi-x-circle"></i> Limpiar filtros
                    </button>
                </div>
            `;
        }
    }

    mostrarError(mensaje) {
        const grid = document.querySelector(this.selectores.gridProductos);
        if (grid) {
            grid.innerHTML = `
                <div class="error-carga">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${mensaje}</p>
                    <button class="boton boton-primario" onclick="gestorProductos.cargarProductos()">
                        <i class="bi bi-arrow-repeat"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion(mensaje, tipo);
            return;
        }

        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    }

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

    /*Métodos estáticos para uso global*/
    /**
 * Actualiza los productos llamando al método `cargarProductos` de `gestorProductos` si existe.
 * El método se ejecuta de forma asíncrona.
 */
    static async actualizarProductos() {
        if (window.gestorProductos) {
            await window.gestorProductos.cargarProductos();
        }
    }

/**
 * Aplica un filtro de categoría a los productos y reinicia la página a la primera.
 * Actualiza el estado de los filtros globales dentro de `gestorProductos`.
 */
    static aplicarFiltroCategoria(categoria) {
        if (window.gestorProductos) {
            window.gestorProductos.estado.filtros.categoria = categoria;
            window.gestorProductos.estado.filtros.paginaActual = 1;
            window.gestorProductos.aplicarFiltros();
        }
    }
}

/*Inicialización cuando el DOM está listo*/
document.addEventListener('DOMContentLoaded', function() {
    window.gestorProductos = new GestorProductos();
});

/*Soporte para módulos para escabilidad posterior a Backend*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestorProductos;
}
