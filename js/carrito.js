/**
 * Sistema de Carrito de Compras.
 * Gestión completa del carrito con localStorage y sincronización.
 */

class CarritoCompra {
    constructor() {
        this.claveAlmacenamiento = 'carritoComponentesPC';
        this.version = '1.0.0';
        
        this.selectores = {
            contadorCarrito: '#contador-carrito-global',
            listaProductos: '#lista-productos-carrito',
            mensajeVacio: '#mensaje-carrito-vacio',
            subtotal: '#subtotal-carrito',
            descuento: '#descuento-carrito',
            total: '#total-carrito',
            botonVaciar: '#boton-vaciar-carrito',
            botonFinalizar: '#boton-finalizar-compra',
            inputCupon: '#input-cupon',
            botonAplicarCupon: '#boton-aplicar-cupon',
            mensajeCupon: '#mensaje-cupon'
        };

        this.estado = {
            productos: [],
            cupon: null,
            envio: 'estandar',
            descuentoAplicado: 0
        };

        this.inicializado = false;
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;

        this.cargarCarrito();
        this.configurarEventListeners();
        this.configurarSincronizacion();
        this.actualizarVista();
        this.inicializado = true;

        console.log('Carrito de compras inicializado correctamente');
    }

    obtenerCarrito() {
        try {
            const carritoGuardado = localStorage.getItem(this.claveAlmacenamiento);
            if (!carritoGuardado) return [];

            const datos = JSON.parse(carritoGuardado);
            
            // Validar estructura del carrito
            if (datos && Array.isArray(datos.productos)) {
                return datos.productos;
            }
            
            return [];
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            return [];
        }
    }

    guardarCarrito() {
        try {
            const datos = {
                productos: this.estado.productos,
                version: this.version,
                actualizado: new Date().toISOString()
            };

            localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(datos));
            this.actualizarContador();
            this.actualizarVista();

            this.dispararEventoPersonalizado('carritoActualizado', {
                productos: this.estado.productos,
                total: this.calcularTotal(),
                cantidad: this.obtenerTotalProductos()
            });

        } catch (error) {
            console.error('Error al guardar el carrito:', error);
            this.mostrarNotificacion('Error al guardar el carrito', 'error');
        }
    }

    cargarCarrito() {
        this.estado.productos = this.obtenerCarrito();
    }

    configurarEventListeners() {
        /*Botón para vaciar carrito*/
        const botonVaciar = document.querySelector(this.selectores.botonVaciar);
        if (botonVaciar) {
            botonVaciar.addEventListener('click', () => this.vaciarCarrito());
        }

        /*Botón para finalizar compra*/
        const botonFinalizar = document.querySelector(this.selectores.botonFinalizar);
        if (botonFinalizar) {
            botonFinalizar.addEventListener('click', () => this.finalizarCompra());
        }

        /*Aplicar cupón*/
        const botonAplicarCupon = document.querySelector(this.selectores.botonAplicarCupon);
        if (botonAplicarCupon) {
            botonAplicarCupon.addEventListener('click', () => this.aplicarCupon());
        }

        /*Al hacer enter en el input de cupón*/
        const inputCupon = document.querySelector(this.selectores.inputCupon);
        if (inputCupon) {
            inputCupon.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.aplicarCupon();
            });
        }

        /*Opciones de envío*/
        const opcionesEnvio = document.querySelectorAll('input[name="opcion-envio"]');
        opcionesEnvio.forEach(opcion => {
            opcion.addEventListener('change', (e) => {
                this.estado.envio = e.target.value;
                this.actualizarVista();
            });
        });

        /*Escucha el cambio de tema*/
        document.addEventListener('temaCambiado', () => {
            this.actualizarVista();
        });
    }

    configurarSincronizacion() {
        window.addEventListener('storage', (evento) => {
            if (evento.key === this.claveAlmacenamiento) {
                this.cargarCarrito();
                this.actualizarVista();
                this.mostrarNotificacion('Carrito actualizado desde otra pestaña', 'info');
            }
        });
    }

    agregarProducto(producto, cantidad = 1) {
        if (!producto || !producto.id) {
            console.error('Producto inválido:', producto);
            return false;
        }

        const productoExistente = this.estado.productos.find(p => p.id === producto.id);
        
        if (productoExistente) {
            productoExistente.cantidad += cantidad;
        } else {
            this.estado.productos.push({
                ...producto,
                cantidad: cantidad,
                agregadoEl: new Date().toISOString(),
                precioOriginal: producto.precio
            });
        }

        this.guardarCarrito();
        this.mostrarNotificacion('Producto agregado al carrito', 'exito');
        return true;
    }

    eliminarProducto(idProducto) {
        this.estado.productos = this.estado.productos.filter(producto => producto.id !== idProducto);
        this.guardarCarrito();
        this.mostrarNotificacion('Producto eliminado del carrito', 'info');
    }

    actualizarCantidad(idProducto, nuevaCantidad) {
        const producto = this.estado.productos.find(p => p.id === idProducto);
        
        if (producto) {
            if (nuevaCantidad <= 0) {
                this.eliminarProducto(idProducto);
            } else {
                producto.cantidad = Math.max(1, nuevaCantidad);
                this.guardarCarrito();
            }
        }
    }

    vaciarCarrito() {
        if (this.estado.productos.length === 0) return;

        if (confirm('¿Estás seguro de que querés vaciar el carrito? Se eliminarán todos los productos.')) {
            this.estado.productos = [];
            this.estado.cupon = null;
            this.estado.descuentoAplicado = 0;
            this.guardarCarrito();
            this.mostrarNotificacion('Carrito vaciado', 'info');
        }
    }

    calcularSubtotal() {
        return this.estado.productos.reduce((total, producto) => {
            return total + (producto.precio * producto.cantidad);
        }, 0);
    }

    calcularCostoEnvio() {
        const subtotal = this.calcularSubtotal();
        
        /*Envío gratis para compras mayores a $50,000*/
        if (subtotal > 50000) return 0;

        const costos = {
            estandar: 500,
            express: 800,
            retiro: 0
        };

        return costos[this.estado.envio] || 0;
    }

    aplicarCupon() {
        const input = document.querySelector(this.selectores.inputCupon);
        const mensaje = document.querySelector(this.selectores.mensajeCupon);
        
        if (!input || !mensaje) return;

        const codigo = input.value.trim().toUpperCase();
        
        if (!codigo) {
            this.mostrarErrorCupon('Ingresá un código de cupón');
            return;
        }

        /*Simulación de cupones (en producción vendría de una API)*/
        const cupones = {
            'DESCUENTO10': { descuento: 0.1, tipo: 'porcentaje' },
            'DESCUENTO20': { descuento: 0.2, tipo: 'porcentaje' },
            'ENVIOGRATIS': { descuento: 0, tipo: 'envio_gratis' },
            'BIENVENIDA': { descuento: 1000, tipo: 'monto_fijo' }
        };

        const cupon = cupones[codigo];

        if (!cupon) {
            this.mostrarErrorCupon('Cupón inválido o expirado');
            return;
        }

        this.estado.cupon = { codigo, ...cupon };
        this.estado.descuentoAplicado = this.calcularDescuento();
        
        this.mostrarExitoCupon(`¡Cupón "${codigo}" aplicado correctamente!`);
        input.value = '';
        this.actualizarVista();
    }

    calcularDescuento() {
        if (!this.estado.cupon) return 0;

        const subtotal = this.calcularSubtotal();
        const cupon = this.estado.cupon;

        switch (cupon.tipo) {
            case 'porcentaje':
                return subtotal * cupon.descuento;
            
            case 'monto_fijo':
                return Math.min(cupon.descuento, subtotal);
            
            case 'envio_gratis':
                return this.calcularCostoEnvio();
            
            default:
                return 0;
        }
    }

    calcularTotal() {
        const subtotal = this.calcularSubtotal();
        const envio = this.calcularCostoEnvio();
        const descuento = this.calcularDescuento();

        return Math.max(0, subtotal + envio - descuento);
    }

/**
 * Este método actualiza el contador de productos en el carrito:
 * Actualiza el texto del contador con el total de productos (`totalItems`).
 * Muestra u oculta el contador dependiendo del número de productos (si hay productos, lo muestra; si no, lo oculta).
 * Establece el atributo `data-count` en el contador con el número total de productos.
 * El atributo `data-count` se puede usar desde CSS o JavaScript
 * */
    actualizarContador() {
        const contador = document.querySelector(this.selectores.contadorCarrito);
        if (contador) {
            const totalItems = this.obtenerTotalProductos();
            contador.textContent = totalItems;
            contador.style.display = totalItems > 0 ? 'block' : 'none';
            
            /*Actualizar atributo data-count para CSS*/
            contador.setAttribute('data-count', totalItems);
        }
    }

    actualizarVista() {
        this.actualizarListaProductos();
        this.actualizarTotales();
        this.actualizarEstadoBotonFinalizar();
    }

    actualizarListaProductos() {
        const contenedor = document.querySelector(this.selectores.listaProductos);
        const mensajeVacio = document.querySelector(this.selectores.mensajeVacio);
        
        if (!contenedor) return;

        if (this.estado.productos.length === 0) {
            if (mensajeVacio) mensajeVacio.style.display = 'block';
            contenedor.innerHTML = '';
            return;
        }

        if (mensajeVacio) mensajeVacio.style.display = 'none';

        contenedor.innerHTML = this.estado.productos.map(producto => `
            <div class="item-carrito" data-producto-id="${producto.id}">
                <div class="imagen-item-carrito">
                    <img src="${producto.img || '../assets/images/placeholder.webp'}" 
                        alt="${producto.nombre}" 
                        onerror="this.src='../assets/images/placeholder.webp'">
                </div>
                
                <div class="info-item-carrito">
                    <h4 class="nombre-producto">${producto.nombre}</h4>
                    <p class="precio-unitario">$${producto.precio.toFixed(2)} c/u</p>
                    
                    <div class="controles-cantidad">
                        <button class="boton-cantidad" onclick="carrito.actualizarCantidad(${producto.id}, ${producto.cantidad - 1})" 
                                aria-label="Reducir cantidad" ${producto.cantidad <= 1 ? 'disabled' : ''}>
                            −
                        </button>
                        
                        <span class="cantidad-actual">${producto.cantidad}</span>
                        
                        <button class="boton-cantidad" onclick="carrito.actualizarCantidad(${producto.id}, ${producto.cantidad + 1})" 
                                aria-label="Aumentar cantidad">
                            +
                        </button>
                    </div>
                </div>
                
                <div class="precio-item-carrito">
                    <span class="subtotal-producto">$${(producto.precio * producto.cantidad).toFixed(2)}</span>
                    <button class="boton-eliminar" onclick="carrito.eliminarProducto(${producto.id})" 
                            aria-label="Eliminar producto">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    actualizarTotales() {
        const subtotal = this.calcularSubtotal();
        const descuento = this.calcularDescuento();
        const envio = this.calcularCostoEnvio();
        const total = this.calcularTotal();

        this.actualizarElementoTexto(this.selectores.subtotal, `$${subtotal.toFixed(2)}`);
        this.actualizarElementoTexto(this.selectores.descuento, `-$${descuento.toFixed(2)}`);
        this.actualizarElementoTexto(this.selectores.total, `$${total.toFixed(2)}`);

        /*Actualizar el costo de envío*/
        const elementosEnvio = document.querySelectorAll('.precio-envio');
        elementosEnvio.forEach(el => {
            const tipo = el.closest('.opcion-envio')?.querySelector('input')?.value;
            if (tipo === this.estado.envio) {
                el.textContent = envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`;
            }
        });
    }

    actualizarElementoTexto(selector, texto) {
        const elemento = document.querySelector(selector);
        if (elemento) elemento.textContent = texto;
    }

    actualizarEstadoBotonFinalizar() {
        const boton = document.querySelector(this.selectores.botonFinalizar);
        if (boton) {
            boton.disabled = this.estado.productos.length === 0;
        }
    }

    mostrarErrorCupon(mensaje) {
        const elemento = document.querySelector(this.selectores.mensajeCupon);
        if (elemento) {
            elemento.textContent = mensaje;
            elemento.setAttribute('data-tipo', 'error');
            elemento.style.display = 'block';
            
            setTimeout(() => {
                elemento.style.display = 'none';
            }, 3000);
        }
    }

    mostrarExitoCupon(mensaje) {
        const elemento = document.querySelector(this.selectores.mensajeCupon);
        if (elemento) {
            elemento.textContent = mensaje;
            elemento.setAttribute('data-tipo', 'exito');
            elemento.style.display = 'block';
        }
    }

    obtenerTotalProductos() {
        return this.estado.productos.reduce((total, producto) => total + producto.cantidad, 0);
    }

    obtenerCantidadProducto(idProducto) {
        const producto = this.estado.productos.find(p => p.id === idProducto);
        return producto ? producto.cantidad : 0;
    }

    finalizarCompra() {
        if (this.estado.productos.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'error');
            return;
        }

        this.mostrarNotificacion('Procesando compra...', 'carga');

        /*Simulación de proceso de compra*/
        setTimeout(() => {
            const resumenCompra = {
                productos: this.estado.productos,
                subtotal: this.calcularSubtotal(),
                descuento: this.calcularDescuento(),
                envio: this.calcularCostoEnvio(),
                total: this.calcularTotal(),
                fecha: new Date().toISOString(),
                cupon: this.estado.cupon?.codigo || null
            };

            console.log('Compra finalizada:', resumenCompra);
            
            this.mostrarNotificacion('¡Compra realizada con éxito!', 'exito');
            
            /*Limpiar el carrito después de un compra exitosa*/
            this.vaciarCarrito();
            
        }, 2000);
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        /*Se intenta usar el sistema de notificaciones global si existe*/
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion(mensaje, tipo);
            return;
        }

        /*Implementación básica de la notificación*/
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.innerHTML = `
            <i class="bi ${this.obtenerIconoNotificacion(tipo)}"></i>
            <span>${mensaje}</span>
        `;

        /*Estilos básicos que se le agregan*/
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${this.obtenerColorNotificacion(tipo)};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        document.body.appendChild(notificacion);

        /*Remueve automáticamente*/
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 3000);
    }

    obtenerIconoNotificacion(tipo) {
        const iconos = {
            exito: 'bi-check-circle-fill',
            error: 'bi-exclamation-circle-fill',
            info: 'bi-info-circle-fill',
            carga: 'bi-arrow-repeat',
            advertencia: 'bi-exclamation-triangle-fill'
        };
        return iconos[tipo] || 'bi-info-circle-fill';
    }

    obtenerColorNotificacion(tipo) {
        const colores = {
            exito: '#22c55e',
            error: '#ef4444',
            info: '#3b82f6',
            carga: '#64748b',
            advertencia: '#f59e0b'
        };
        return colores[tipo] || '#3b82f6';
    }

    dispararEventoPersonalizado(nombreEvento, detalle) {
        const evento = new CustomEvent(nombreEvento, { 
            detail: detalle,
            bubbles: true
        });
        document.dispatchEvent(evento);
    }

    /*Métodos estáticos para uso global*/
/**
 * Agrega un producto al carrito con una cantidad específica (por defecto 1).
 * Si `carrito` está disponible en `window`, se llama al método `agregarProducto` del carrito.
 * Retorna `false` si no se encuentra el carrito.
 */
    static agregarProducto(producto, cantidad = 1) {
        if (window.carrito) {
            return window.carrito.agregarProducto(producto, cantidad);
        }
        return false;
    }

    /**
 * Toma el número total de productos en el carrito.
 * Si `carrito` está disponible en `window`, se llama al método `obtenerTotalProductos`.
 * Retorna `0` si no se encuentra el carrito.
 */
    static obtenerCantidadTotal() {
        return window.carrito ? window.carrito.obtenerTotalProductos() : 0;
    }

/**
 * Vacía el carrito de compras.
 * Si `carrito` está disponible en `window`, se llama al método `vaciarCarrito` para eliminar todos los productos.
 */
    static vaciar() {
        if (window.carrito) {
            window.carrito.vaciarCarrito();
        }
    }
}

/*Inicialización cuando el DOM está listo*/
document.addEventListener('DOMContentLoaded', function() {
    window.carrito = new CarritoCompra();
});

/*Soporte para módulos para escabilidad posterior a Backend*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CarritoCompra;
}