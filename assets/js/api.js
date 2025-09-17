/**
 * Sistema de API y Gestión de Datos.
 * Comunicación con backend y gestión de datos local.
 */

class GestorAPI {
    constructor() {
        /*-----------------------------------------------------------CONECTAR DESDE ACÁ */
        this.urlBase = 'http://localhost:3000';
        this.rutaDatosLocales = '../mock/data.json';
        this.timeout = 5000;
        
        this.cache = {
            productos: null,
            categorias: null,
            ultimaActualizacion: null,
            tiempoValidez: 5 * 60 * 1000 // 5 minutos
        };
        
        this.estado = {
            conectado: false,
            modoOffline: false
        };
        
        this.inicializar();
    }

    /*async inicializar() {
        await this.verificarConexion();
        this.configurarEventListeners();
        console.log('Gestor de API inicializado');
    }

    async verificarConexion() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const respuesta = await fetch(`${this.urlBase}/health`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            this.estado.conectado = respuesta.ok;
            this.estado.modoOffline = !respuesta.ok;
            
            if (!respuesta.ok) {
                console.warn('API no disponible, usando modo offline');
            }
            
            return respuesta.ok;
        } catch (error) {
            this.estado.conectado = false;
            this.estado.modoOffline = true;
            console.warn('Error de conexión con la API:', error.message);
            return false;
        }
    }*/

    configurarEventListeners() {
        /*Reconectar cuando se recupera la conexión*/
        window.addEventListener('online', async () => {
            console.log('Conexión restaurada, verificando API...');
            const conectado = await this.verificarConexion();
            if (conectado) {
                this.limpiarCache();
                this.dispararEvento('conexionRestaurada');
            }
        });

        window.addEventListener('offline', () => {
            console.log('Conexión perdida, activando modo offline');
            this.estado.modoOffline = true;
            this.dispararEvento('modoOfflineActivado');
        });

        /*Limpia el cache periódicamente*/
        setInterval(() => {
            if (this.cacheEsValido()) {
                this.limpiarCache();
            }
        }, this.cache.tiempoValidez);
    }

    /*async obtenerProductos(categoria = null, forzarActualizacion = false) {
        try {
            let productos = await this.obtenerDatos('productos', forzarActualizacion);
            
            if (categoria) {
                productos = productos.filter(producto => 
                    producto.categoria.toLowerCase() === categoria.toLowerCase()
                );
            }
            
            return productos;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw new Error('No se pudieron cargar los productos');
        }
    }

    async obtenerProductoPorId(id) {
        try {
            const productos = await this.obtenerDatos('productos');
            const producto = productos.find(p => p.id === parseInt(id));
            
            if (!producto) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }
            
            return producto;
        } catch (error) {
            console.error('Error al obtener producto por ID:', error);
            throw error;
        }
    }

    async buscarProductos(termino) {
        try {
            const productos = await this.obtenerDatos('productos');
            const terminoLower = termino.toLowerCase().trim();
            
            if (!terminoLower) return productos;
            
            return productos.filter(producto =>
                producto.nombre.toLowerCase().includes(terminoLower) ||
                producto.categoria.toLowerCase().includes(terminoLower) ||
                (producto.descripcion && producto.descripcion.toLowerCase().includes(terminoLower)) ||
                (producto.marca && producto.marca.toLowerCase().includes(terminoLower))
            );
        } catch (error) {
            console.error('Error al buscar productos:', error);
            throw new Error('Error en la búsqueda de productos');
        }
    }

    async obtenerCategorias(forzarActualizacion = false) {
        try {
            return await this.obtenerDatos('categorias', forzarActualizacion);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return this.obtenerCategoriasRespaldo();
        }
    }

    async obtenerDatos(tipo, forzarActualizacion = false) {
        if (!forzarActualizacion && this.cacheEsValido() && this.cache[tipo]) {
            return this.cache[tipo];
        }
        
        try {
            const datos = await this.obtenerDesdeAPI(`/${tipo}`);
            this.actualizarCache(tipo, datos);
            return datos;
        } catch (error) {
            console.warn(`API no disponible para ${tipo}, usando datos locales:`, error);
            
            try {
                const datos = await this.obtenerDesdeLocal(tipo);
                this.actualizarCache(tipo, datos);
                return datos;
            } catch (errorLocal) {
                console.error(`Error al cargar datos locales para ${tipo}:`, errorLocal);
                return this.obtenerDatosRespaldo(tipo);
            }
        }
    }

    async obtenerDesdeAPI(endpoint) {
        if (this.estado.modoOffline) {
            throw new Error('Modo offline activado');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const respuesta = await fetch(`${this.urlBase}${endpoint}`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status} ${respuesta.statusText}`);
            }
            
            const datos = await respuesta.json();
            return Array.isArray(datos) ? datos : datos[tipo] || datos;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Timeout: La API no respondió a tiempo');
            }
            
            throw new Error(`Error de API: ${error.message}`);
        }
    }

    async obtenerDesdeLocal(tipo) {
        try {
            const respuesta = await fetch(this.rutaDatosLocales);
            
            if (!respuesta.ok) {
                throw new Error(`Error cargando datos locales: ${respuesta.status}`);
            }
            
            const datos = await respuesta.json();
            
            // Manejar diferentes estructuras de datos
            if (datos[tipo]) {
                return datos[tipo];
            } else if (Array.isArray(datos)) {
                return datos;
            } else if (datos.productos && tipo === 'productos') {
                return datos.productos;
            } else if (datos.categorias && tipo === 'categorias') {
                return datos.categorias;
            }
            
            throw new Error('Estructura de datos local inválida');
        } catch (error) {
            console.error('Error al cargar datos locales:', error);
            throw error;
        }
    }*/

    obtenerDatosRespaldo(tipo) {
        console.warn(`Usando datos de respaldo para ${tipo}`);
        
        if (tipo === 'productos') {
            return [
                {
                    id: 1,
                    nombre: "Procesador Intel Core i7-12700K",
                    precio: 350,
                    categoria: "cpu",
                    img: "../assets/images/Procesadores/1.webp",
                    descripcion: "Procesador Intel Core i7 de 12ma generación con 12 núcleos y 20 hilos",
                    especificaciones: {
                        socket: "LGA1700",
                        nucleos: 12,
                        hilos: 20,
                        frecuencia: "3.6GHz",
                        turbo: "5.0GHz"
                    },
                    stock: 15,
                    marca: "Intel"
                },
                {
                    id: 2,
                    nombre: "AMD Ryzen 7 5800X",
                    precio: 300,
                    categoria: "cpu",
                    img: "../assets/images/Procesadores/2.webp",
                    descripcion: "Procesador AMD Ryzen 7 de alto rendimiento para gaming y productividad",
                    especificaciones: {
                        socket: "AM4",
                        nucleos: 8,
                        hilos: 16,
                        frecuencia: "3.8GHz",
                        turbo: "4.7GHz"
                    },
                    stock: 8,
                    marca: "AMD"
                }
            ];
        } else if (tipo === 'categorias') {
            return [
                {
                    id: "cpu",
                    nombre: "Procesadores",
                    descripcion: "Unidades centrales de procesamiento",
                    cantidad: 2
                },
                {
                    id: "gpu",
                    nombre: "Tarjetas Gráficas",
                    descripcion: "Unidades de procesamiento gráfico",
                    cantidad: 0
                }
            ];
        }
        
        return [];
    }

    obtenerCategoriasRespaldo() {
        return [
            {
                id: "cpu",
                nombre: "Procesadores",
                descripcion: "Unidades centrales de procesamiento",
                cantidad: 4
            },
            {
                id: "gpu",
                nombre: "Tarjetas Gráficas",
                descripcion: "Unidades de procesamiento gráfico",
                cantidad: 2
            }
        ];
    }

    cacheEsValido() {
        return this.cache.ultimaActualizacion && 
            (Date.now() - this.cache.ultimaActualizacion) < this.cache.tiempoValidez;
    }

    actualizarCache(tipo, datos) {
        this.cache[tipo] = datos;
        this.cache.ultimaActualizacion = Date.now();
    }

    limpiarCache() {
        this.cache = {
            productos: null,
            categorias: null,
            ultimaActualizacion: null,
            tiempoValidez: 5 * 60 * 1000
        };
        console.log('Cache limpiado');
    }

    /*async enviarFormularioContacto(datosFormulario) {
        try {
            const respuesta = await fetch(`${this.urlBase}/contacto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...datosFormulario,
                    origen: 'web',
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }),
                timeout: this.timeout
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error en envío: ${respuesta.status}`);
            }
            
            return await respuesta.json();
        } catch (error) {
            console.warn('Error enviando formulario, simulando éxito:', error);
            
            // Simular éxito para desarrollo
            return {
                success: true,
                message: "Mensaje recibido correctamente",
                id: this.generarIdUnico(),
                timestamp: new Date().toISOString()
            };
        }
    }

    async guardarConfiguracionPC(configuracion) {
        try {
            const respuesta = await fetch(`${this.urlBase}/configuraciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...configuracion,
                    fecha: new Date().toISOString(),
                    componentes: configuracion.componentes.map(comp => ({
                        id: comp.id,
                        nombre: comp.nombre,
                        categoria: comp.categoria,
                        precio: comp.precio
                    }))
                }),
                timeout: this.timeout
            });
            
            return await respuesta.json();
        } catch (error) {
            console.warn('Error guardando configuración, simulando éxito:', error);
            
            return {
                success: true,
                id: this.generarIdUnico(),
                ...configuracion,
                fecha: new Date().toISOString()
            };
        }
    }*/

    formatearPrecio(precio) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(precio);
    }

    generarIdUnico() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /*async subirImagen(archivo) {
        if (this.estado.modoOffline) {
            return this.simularSubidaImagen(archivo);
        }

        try {
            const formData = new FormData();
            formData.append('imagen', archivo);
            formData.append('nombre', archivo.name);
            formData.append('tipo', archivo.type);
            formData.append('tamaño', archivo.size);
            
            const respuesta = await fetch(`${this.urlBase}/upload`, {
                method: 'POST',
                body: formData,
                timeout: this.timeout
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error subiendo imagen: ${respuesta.status}`);
            }
            
            return await respuesta.json();
        } catch (error) {
            console.warn('Error subiendo imagen, usando URL temporal:', error);
            return this.simularSubidaImagen(archivo);
        }
    }*/

    simularSubidaImagen(archivo) {
        return {
            success: true,
            url: URL.createObjectURL(archivo),
            nombre: archivo.name,
            temporal: true,
            mensaje: 'Imagen almacenada temporalmente (modo offline)'
        };
    }

    estaConectado() {
        return this.estado.conectado;
    }

    esModoOffline() {
        return this.estado.modoOffline;
    }

    dispararEvento(nombreEvento, datos = {}) {
        const evento = new CustomEvent(nombreEvento, {
            detail: {
                ...datos,
                timestamp: new Date().toISOString()
            },
            bubbles: true
        });
        
        document.dispatchEvent(evento);
    }

    // Método para probar la conexión manualmente
    /*async probarConexion() {
        const conectado = await this.verificarConexion();
        this.dispararEvento('pruebaConexion', { conectado });
        return conectado;
    }
}*/

/*Funciones globales para fácil acceso*/
window.obtenerProductos = async (categoria = null) => {
    if (!window.api) {
        console.error('API no inicializada');
        return [];
    }
    return await window.api.obtenerProductos(categoria);
};

window.obtenerProductoPorId = async (id) => {
    if (!window.api) {
        console.error('API no inicializada');
        return null;
    }
    return await window.api.obtenerProductoPorId(id);
};

window.buscarProductos = async (termino) => {
    if (!window.api) {
        console.error('API no inicializada');
        return [];
    }
    return await window.api.buscarProductos(termino);
};

window.obtenerCategorias = async () => {
    if (!window.api) {
        console.error('API no inicializada');
        return [];
    }
    return await window.api.obtenerCategorias();
};

/*Inicialización cuando el DOM esté listo*/
document.addEventListener('DOMContentLoaded', async function() {
    window.api = new GestorAPI();
    
    /*Verifica la conexión al cargar*/
    const conectado = await window.api.verificarConexion();
    
    if (!conectado) {
        window.api.dispararEvento('modoOfflineActivado');
    }
    
    /*Escucha los eventos de cambio de conexión*/
    document.addEventListener('modoOfflineActivado', () => {
        console.log('Modo offline activado');
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion('Modo offline activado. Algunas funciones pueden estar limitadas.', 'advertencia');
        }
    });
    
    document.addEventListener('conexionRestaurada', () => {
        console.log('Conexión restaurada');
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion('Conexión restaurada', 'exito');
        }
    });
});

/*Soporte para módulos para escabilidad posterior a Backend*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestorAPI;
}