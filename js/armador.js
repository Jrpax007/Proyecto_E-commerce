/**
 * Sistema Armador de PC - Ensamblaje de componentes.
 * Selección compatible de componentes y presupuesto.
 */

class ArmadorPC {
    constructor() {
        this.selectores = {
            gridComponentes: '#grid-componentes',
            listaComponentes: '#lista-componentes',
            estadoCompatibilidad: '#estado-compatibilidad',
            subtotalConfiguracion: '#subtotal-configuracion',
            totalConfiguracion: '#total-configuracion',
            botonGuardar: '#boton-guardar-configuracion',
            botonAgregarCarrito: '#boton-agregar-carrito',
            botonLimpiar: '#boton-limpiar-configuracion',
            filtroCategoria: '#filtro-categoria-armador',
            ordenComponentes: '#orden-componentes',
            progresoCompletado: '#progreso-completado',
            porcentajeCompletado: '#porcentaje-completado',
            listaCompatibilidad: '#lista-compatibilidad',
            paginacionAnterior: '#boton-pagina-anterior-componentes',
            paginacionSiguiente: '#boton-pagina-siguiente-componentes',
            numerosPagina: '#numeros-pagina-componentes'
        };

        this.componentesSeleccionados = {
            cpu: null,
            gpu: null,
            ram: null,
            motherboard: null,
            almacenamiento: null,
            fuente: null,
            gabinete: null,
            refrigeracion: null
        };

        this.categorias = ['cpu', 'gpu', 'ram', 'motherboard', 'almacenamiento', 'fuente', 'gabinete', 'refrigeracion'];
        
        this.estado = {
            componentes: [],
            componentesFiltrados: [],
            filtros: {
                categoria: 'todos',
                orden: 'precio',
                pagina: 1,
                componentesPorPagina: 9
            },
            cargando: false,
            configuracionValida: false
        };

        this.reglasCompatibilidad = {
            socket: {
                descripcion: 'El socket del procesador debe coincidir con el de la motherboard',
                validar: (cpu, motherboard) => {
                    if (!cpu || !motherboard) return true;
                    return cpu.especificaciones?.socket === motherboard.especificaciones?.socket;
                }
            },
            ram: {
                descripcion: 'El tipo de RAM debe ser compatible con la motherboard',
                validar: (ram, motherboard) => {
                    if (!ram || !motherboard) return true;
                    return ram.especificaciones?.tipo === motherboard.especificaciones?.ramTipo;
                }
            },
            fuente: {
                descripcion: 'La fuente debe tener suficiente potencia para los componentes',
                validar: (fuente, componentes) => {
                    if (!fuente) return true;
                    
                    const consumoTotal = this.calcularConsumoEnergia(componentes);
                    const potenciaFuente = fuente.especificaciones?.potencia || 0;
                    
                    return potenciaFuente >= consumoTotal * 1.2;
                }
            },
            gabinete: {
                descripcion: 'El gabinete debe soportar el tamaño de los componentes',
                validar: (gabinete, componentes) => {
                    if (!gabinete) return true;
                    
                    const gpu = componentes.gpu;
                    if (gpu && gabinete.especificaciones?.maxGpuLength) {
                        const longitudGPU = gpu.especificaciones?.longitud || 0;
                        return longitudGPU <= gabinete.especificaciones.maxGpuLength;
                    }
                    
                    return true;
                }
            }
        };

        this.inicializado = false;
        this.inicializar();
    }

    /*async inicializar() {
        if (this.inicializado) return;

        try {
            await this.cargarComponentes();
            this.configurarEventListeners();
            this.actualizarVista();
            this.inicializado = true;
            console.log('Armador de PC inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando armador de PC:', error);
            this.mostrarError('Error al inicializar el armador de PC');
        }
    }

    async cargarComponentes() {
        if (this.estado.cargando) return;

        this.estado.cargando = true;
        this.mostrarEstadoCarga();

        try {
            this.estado.componentes = await obtenerProductos();
            this.aplicarFiltros();
            this.estado.error = null;
        } catch (error) {
            console.error('Error cargando componentes:', error);
            this.estado.error = error.message;
            this.mostrarError('No se pudieron cargar los componentes');
        } finally {
            this.estado.cargando = false;
        }
    }*/

    configurarEventListeners() {
        const filtroCategoria = document.querySelector(this.selectores.filtroCategoria);
        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', (evento) => {
                this.estado.filtros.categoria = evento.target.value;
                this.estado.filtros.pagina = 1;
                this.aplicarFiltros();
            });
        }

        const ordenComponentes = document.querySelector(this.selectores.ordenComponentes);
        if (ordenComponentes) {
            ordenComponentes.addEventListener('change', (evento) => {
                this.estado.filtros.orden = evento.target.value;
                this.aplicarFiltros();
            });
        }

        const botonLimpiar = document.querySelector(this.selectores.botonLimpiar);
        if (botonLimpiar) {
            botonLimpiar.addEventListener('click', () => {
                this.limpiarConfiguracion();
            });
        }

        const botonGuardar = document.querySelector(this.selectores.botonGuardar);
        if (botonGuardar) {
            botonGuardar.addEventListener('click', () => {
                this.guardarConfiguracion();
            });
        }

        const botonAgregarCarrito = document.querySelector(this.selectores.botonAgregarCarrito);
        if (botonAgregarCarrito) {
            botonAgregarCarrito.addEventListener('click', () => {
                this.agregarAlCarrito();
            });
        }

        const pagAnterior = document.querySelector(this.selectores.paginacionAnterior);
        const pagSiguiente = document.querySelector(this.selectores.paginacionSiguiente);

        if (pagAnterior) {
            pagAnterior.addEventListener('click', () => {
                this.cambiarPagina(this.estado.filtros.pagina - 1);
            });
        }

        if (pagSiguiente) {
            pagSiguiente.addEventListener('click', () => {
                this.cambiarPagina(this.estado.filtros.pagina + 1);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.ocultarDetallesComponente();
            }
        });
    }

    aplicarFiltros() {
        if (this.estado.componentes.length === 0) return;

        try {
            this.estado.componentesFiltrados = this.estado.componentes.filter(componente => {
                if (this.estado.filtros.categoria !== 'todos' && 
                    componente.categoria !== this.estado.filtros.categoria) {
                    return false;
                }
                return true;
            });

            this.ordenarComponentes();
            this.actualizarVista();
            this.actualizarPaginacion();

        } catch (error) {
            console.error('Error aplicando filtros:', error);
            this.mostrarError('Error al aplicar los filtros');
        }
    }

    ordenarComponentes() {
        switch (this.estado.filtros.orden) {
            case 'precio':
                this.estado.componentesFiltrados.sort((a, b) => a.precio - b.precio);
                break;
            case 'nombre':
                this.estado.componentesFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'popularidad':
                this.estado.componentesFiltrados.sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0));
                break;
        }
    }

    actualizarVista() {
        this.actualizarGridComponentes();
        this.actualizarListaComponentes();
        this.actualizarResumenPrecios();
        this.actualizarCompatibilidad();
        this.actualizarProgreso();
        this.actualizarEstadoBotones();
    }

    actualizarGridComponentes() {
        const grid = document.querySelector(this.selectores.gridComponentes);
        if (!grid) return;

        const inicio = (this.estado.filtros.pagina - 1) * this.estado.filtros.componentesPorPagina;
        const fin = inicio + this.estado.filtros.componentesPorPagina;
        const componentesPagina = this.estado.componentesFiltrados.slice(inicio, fin);

        if (componentesPagina.length === 0) {
            this.mostrarSinResultados();
            return;
        }

        grid.innerHTML = componentesPagina.map(componente => 
            this.generarHTMLComponente(componente)
        ).join('');

        this.configurarEventListenersComponentes();
    }

    generarHTMLComponente(componente) {
        const yaSeleccionado = this.componentesSeleccionados[componente.categoria]?.id === componente.id;
        const precioFormateado = typeof window.api?.formatearPrecio === 'function' 
            ? window.api.formatearPrecio(componente.precio)
            : `$${componente.precio.toFixed(2)}`;

        return `
            <div class="tarjeta-componente ${yaSeleccionado ? 'seleccionado' : ''}" 
                data-componente-id="${componente.id}" 
                data-categoria="${componente.categoria}">
                
                <div class="imagen-componente">
                    <img src="${componente.img || '../assets/images/placeholder.webp'}" 
                        alt="${componente.nombre}"
                        onerror="this.src='../assets/images/placeholder.webp'">
                    ${componente.stock < 3 ? `
                        <span class="badge-stock">Poco stock</span>
                    ` : ''}
                </div>
                
                <div class="contenido-componente">
                    <h4 class="nombre-componente">${componente.nombre}</h4>
                    <p class="categoria-componente">${this.formatearCategoria(componente.categoria)}</p>
                    
                    ${componente.especificaciones ? `
                        <div class="especificaciones">
                            ${this.generarEspecificaciones(componente.especificaciones)}
                        </div>
                    ` : ''}
                    
                    <div class="precio-componente">${precioFormateado}</div>
                    
                    <div class="acciones-componente">
                        <button class="boton ${yaSeleccionado ? 'boton-secundario' : 'boton-primario'} boton-seleccionar"
                                data-componente-id="${componente.id}"
                                data-categoria="${componente.categoria}">
                            ${yaSeleccionado ? '<i class="bi bi-check"></i> Seleccionado' : '<i class="bi bi-plus"></i> Seleccionar'}
                        </button>
                        
                        <button class="boton boton-secundario boton-detalles"
                                data-componente-id="${componente.id}">
                            <i class="bi bi-info"></i>
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

    generarEspecificaciones(especificaciones) {
        let html = '';
        const especificacionesMostrar = {};
        
        for (const [key, value] of Object.entries(especificaciones)) {
            if (value && typeof value !== 'object') {
                especificacionesMostrar[key] = value;
            }
        }
        
        const keys = Object.keys(especificacionesMostrar).slice(0, 3);
        
        keys.forEach(key => {
            html += `<div class="especificacion"><strong>${this.formatearKeyEspecificacion(key)}:</strong> ${especificacionesMostrar[key]}</div>`;
        });
        
        return html;
    }

    formatearKeyEspecificacion(key) {
        const mapping = {
            'socket': 'Socket',
            'nucleos': 'Núcleos',
            'hilos': 'Hilos',
            'frecuencia': 'Frecuencia',
            'vram': 'VRAM',
            'potencia': 'Potencia',
            'capacidad': 'Capacidad',
            'tipo': 'Tipo',
            'ramSlots': 'Slots RAM',
            'ramTipo': 'Tipo RAM',
            'maxGpuLength': 'Máx. GPU'
        };
        
        return mapping[key] || key;
    }

    configurarEventListenersComponentes() {
        const botonesSeleccionar = document.querySelectorAll('.boton-seleccionar');
        botonesSeleccionar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const componenteId = boton.getAttribute('data-componente-id');
                const categoria = boton.getAttribute('data-categoria');
                this.seleccionarComponente(componenteId, categoria);
            });
        });

        const botonesDetalles = document.querySelectorAll('.boton-detalles');
        botonesDetalles.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const componenteId = boton.getAttribute('data-componente-id');
                this.mostrarDetallesComponente(componenteId);
            });
        });
    }

    /*async seleccionarComponente(componenteId, categoria) {
        try {
            const componente = await obtenerProductoPorId(componenteId);
            if (!componente) return;

            if (this.componentesSeleccionados[categoria]?.id === componente.id) {
                this.deseleccionarComponente(categoria);
                return;
            }

            this.componentesSeleccionados[categoria] = componente;
            this.actualizarVista();
            this.verificarCompatibilidad();
            this.mostrarNotificacion(`${this.formatearCategoria(categoria)} seleccionado: ${componente.nombre}`, 'exito');

        } catch (error) {
            console.error('Error seleccionando componente:', error);
            this.mostrarNotificacion('Error al seleccionar el componente', 'error');
        }
    }*/

    deseleccionarComponente(categoria) {
        this.componentesSeleccionados[categoria] = null;
        this.actualizarVista();
        this.verificarCompatibilidad();
        this.mostrarNotificacion(`${this.formatearCategoria(categoria)} deseleccionado`, 'info');
    }

    /*async mostrarDetallesComponente(componenteId) {
        try {
            const componente = await obtenerProductoPorId(componenteId);
            if (!componente) return;
            this.mostrarModalDetalles(componente);
        } catch (error) {
            console.error('Error mostrando detalles:', error);
            this.mostrarNotificacion('Error al cargar los detalles', 'error');
        }
    }*/

    mostrarModalDetalles(componente) {
        const modal = document.createElement('div');
        modal.className = 'modal-detalles';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color-tarjeta);
            border-radius: var(--radio-borde);
            padding: var(--espaciado-xl);
            box-shadow: var(--sombra-elevada);
            z-index: 10000;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        modal.innerHTML = `
            <div class="modal-header">
                <h3>${componente.nombre}</h3>
                <button class="cerrar-modal" aria-label="Cerrar">
                    <i class="bi bi-x"></i>
                </button>
            </div>
            <div class="modal-content">
                <img src="${componente.img || '../assets/images/placeholder.webp'}" 
                    alt="${componente.nombre}"
                    style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radio-borde); margin-bottom: var(--espaciado-l);">
                
                <div class="especificaciones-completas">
                    <h4>Especificaciones</h4>
                    ${this.generarEspecificacionesCompletas(componente.especificaciones)}
                </div>
                
                <div class="precio-detalle">
                    <strong>Precio: ${typeof window.api?.formatearPrecio === 'function' 
                        ? window.api.formatearPrecio(componente.precio)
                        : `$${componente.precio.toFixed(2)}`}</strong>
                </div>
                
                ${componente.descripcion ? `
                    <div class="descripcion-detalle">
                        <h4>Descripción</h4>
                        <p>${componente.descripcion}</p>
                    </div>
                ` : ''}
                
                <div class="stock-detalle">
                    <strong>Stock: ${componente.stock} unidades</strong>
                </div>
            </div>
            <div class="modal-actions">
                <button class="boton boton-primario seleccionar-desde-modal" 
                        data-componente-id="${componente.id}"
                        data-categoria="${componente.categoria}">
                    <i class="bi bi-check"></i> Seleccionar
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.cerrar-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.seleccionar-desde-modal').addEventListener('click', () => {
            this.seleccionarComponente(componente.id, componente.categoria);
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    generarEspecificacionesCompletas(especificaciones) {
        if (!especificaciones) return '<p>No hay especificaciones disponibles</p>';
        
        let html = '<div class="grid-especificaciones">';
        
        for (const [key, value] of Object.entries(especificaciones)) {
            if (value && typeof value !== 'object') {
                html += `
                    <div class="especificacion-item">
                        <strong>${this.formatearKeyEspecificacion(key)}:</strong>
                        <span>${value}</span>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        return html;
    }

    verificarCompatibilidad() {
        const problemas = [];
        const componentes = this.componentesSeleccionados;

        if (componentes.cpu && componentes.motherboard) {
            if (componentes.cpu.especificaciones?.socket !== componentes.motherboard.especificaciones?.socket) {
                problemas.push('El socket del procesador no coincide con la motherboard');
            }
        }

        if (componentes.ram && componentes.motherboard) {
            if (componentes.ram.especificaciones?.tipo !== componentes.motherboard.especificaciones?.ramTipo) {
                problemas.push('El tipo de RAM no es compatible con la motherboard');
            }
        }

        if (componentes.fuente) {
            const consumoTotal = this.calcularConsumoEnergia(componentes);
            const potenciaFuente = componentes.fuente.especificaciones?.potencia || 0;
            
            if (potenciaFuente < consumoTotal * 1.2) {
                problemas.push('La fuente no tiene suficiente potencia para los componentes');
            }
        }

        if (componentes.gpu && componentes.gabinete) {
            const longitudGPU = componentes.gpu.especificaciones?.longitud || 0;
            const maxGpuLength = componentes.gabinete.especificaciones?.maxGpuLength || 0;
            
            if (longitudGPU > maxGpuLength) {
                problemas.push('La tarjeta gráfica no cabe en el gabinete');
            }
        }

        this.actualizarUICompatibilidad(problemas);
        this.estado.configuracionValida = problemas.length === 0;
    }

    calcularConsumoEnergia(componentes) {
        let consumoTotal = 0;
        
        if (componentes.cpu) consumoTotal += componentes.cpu.especificaciones?.tdp || 0;
        if (componentes.gpu) consumoTotal += componentes.gpu.especificaciones?.tdp || 0;
        if (componentes.ram) consumoTotal += (componentes.ram.especificaciones?.consumo || 0) * (componentes.ram.especificaciones?.cantidad || 1);
        if (componentes.almacenamiento) consumoTotal += componentes.almacenamiento.especificaciones?.consumo || 0;
        if (componentes.motherboard) consumoTotal += componentes.motherboard.especificaciones?.consumo || 0;
        if (componentes.refrigeracion) consumoTotal += componentes.refrigeracion.especificaciones?.consumo || 0;

        return consumoTotal + 50;
    }

    actualizarUICompatibilidad(problemas) {
        const listaCompatibilidad = document.querySelector(this.selectores.listaCompatibilidad);
        const estadoCompatibilidad = document.querySelector(this.selectores.estadoCompatibilidad);
        
        if (!listaCompatibilidad || !estadoCompatibilidad) return;

        if (problemas.length === 0) {
            estadoCompatibilidad.innerHTML = '<span class="compatibilidad-ok"><i class="bi bi-check-circle"></i> Configuración compatible</span>';
            listaCompatibilidad.innerHTML = '';
        } else {
            estadoCompatibilidad.innerHTML = '<span class="compatibilidad-error"><i class="bi bi-exclamation-circle"></i> Problemas de compatibilidad</span>';
            listaCompatibilidad.innerHTML = problemas.map(problema => 
                `<li class="problema-compatibilidad"><i class="bi bi-x-circle"></i> ${problema}</li>`
            ).join('');
        }
    }

    actualizarListaComponentes() {
        const lista = document.querySelector(this.selectores.listaComponentes);
        if (!lista) return;

        lista.innerHTML = this.categorias.map(categoria => {
            const componente = this.componentesSeleccionados[categoria];
            return `
                <div class="item-lista-componente ${componente ? 'seleccionado' : 'vacio'}">
                    <div class="icono-categoria">
                        <i class="bi ${this.obtenerIconoCategoria(categoria)}"></i>
                    </div>
                    <div class="info-componente">
                        <span class="nombre-categoria">${this.formatearCategoria(categoria)}</span>
                        <span class="nombre-componente">${componente ? componente.nombre : 'No seleccionado'}</span>
                    </div>
                    ${componente ? `
                        <button class="boton boton-texto boton-quitar" data-categoria="${categoria}">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');

        document.querySelectorAll('.boton-quitar').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const categoria = boton.getAttribute('data-categoria');
                this.deseleccionarComponente(categoria);
            });
        });
    }

    obtenerIconoCategoria(categoria) {
        const iconos = {
            'cpu': 'bi-cpu',
            'gpu': 'bi-gpu-card',
            'ram': 'bi-memory',
            'motherboard': 'bi-motherboard',
            'almacenamiento': 'bi-hdd',
            'fuente': 'bi-plug',
            'gabinete': 'bi-pc',
            'refrigeracion': 'bi-fan'
        };
        return iconos[categoria] || 'bi-pc';
    }

    actualizarResumenPrecios() {
        const subtotal = document.querySelector(this.selectores.subtotalConfiguracion);
        const total = document.querySelector(this.selectores.totalConfiguracion);
        
        if (!subtotal || !total) return;

        const precioTotal = this.calcularPrecioTotal();
        const precioSubtotal = precioTotal;

        subtotal.textContent = typeof window.api?.formatearPrecio === 'function' 
            ? window.api.formatearPrecio(precioSubtotal)
            : `$${precioSubtotal.toFixed(2)}`;

        total.textContent = typeof window.api?.formatearPrecio === 'function' 
            ? window.api.formatearPrecio(precioTotal)
            : `$${precioTotal.toFixed(2)}`;
    }

    calcularPrecioTotal() {
        return Object.values(this.componentesSeleccionados).reduce((total, componente) => {
            return total + (componente?.precio || 0);
        }, 0);
    }

    actualizarProgreso() {
        const progreso = document.querySelector(this.selectores.progresoCompletado);
        const porcentaje = document.querySelector(this.selectores.porcentajeCompletado);
        
        if (!progreso || !porcentaje) return;

        const componentesSeleccionados = Object.values(this.componentesSeleccionados).filter(c => c !== null).length;
        const porcentajeCompletado = (componentesSeleccionados / this.categorias.length) * 100;

        progreso.style.width = `${porcentajeCompletado}%`;
        porcentaje.textContent = `${Math.round(porcentajeCompletado)}% completado`;
    }

    actualizarEstadoBotones() {
        const botonGuardar = document.querySelector(this.selectores.botonGuardar);
        const botonAgregarCarrito = document.querySelector(this.selectores.botonAgregarCarrito);
        
        if (botonGuardar) {
            botonGuardar.disabled = !this.estado.configuracionValida;
        }
        
        if (botonAgregarCarrito) {
            botonAgregarCarrito.disabled = !this.estado.configuracionValida;
        }
    }

    limpiarConfiguracion() {
        this.categorias.forEach(categoria => {
            this.componentesSeleccionados[categoria] = null;
        });
        
        this.estado.configuracionValida = false;
        this.actualizarVista();
        this.mostrarNotificacion('Configuración limpiada', 'info');
    }

    guardarConfiguracion() {
        if (!this.estado.configuracionValida) {
            this.mostrarNotificacion('La configuración no es compatible', 'error');
            return;
        }

        localStorage.setItem('configuracionPC', JSON.stringify(this.componentesSeleccionados));
        this.mostrarNotificacion('Configuración guardada correctamente', 'exito');
    }

    agregarAlCarrito() {
        if (!this.estado.configuracionValida) {
            this.mostrarNotificacion('La configuración no es compatible', 'error');
            return;
        }

        const componentes = Object.values(this.componentesSeleccionados).filter(c => c !== null);
        
        componentes.forEach(componente => {
            window.api.agregarAlCarrito(componente.id, 1);
        });

        this.mostrarNotificacion('Componentes agregados al carrito', 'exito');
    }

    mostrarNotificacion(mensaje, tipo) {
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.textContent = mensaje;
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: var(--espaciado-md) var(--espaciado-lg);
            background: ${tipo === 'error' ? '#dc3545' : tipo === 'exito' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: var(--radio-borde);
            z-index: 10001;
        `;

        document.body.appendChild(notificacion);

        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 3000);
    }

    mostrarError(mensaje) {
        this.mostrarNotificacion(mensaje, 'error');
    }

    mostrarEstadoCarga() {
        /*Implementar estado de carga si es necesario*/
    }

    mostrarSinResultados() {
        const grid = document.querySelector(this.selectores.gridComponentes);
        if (grid) {
            grid.innerHTML = `
                <div class="sin-resultados">
                    <i class="bi bi-search"></i>
                    <h3>No se encontraron componentes</h3>
                    <p>Intenta con otros filtros o categorías</p>
                </div>
            `;
        }
    }

    cambiarPagina(pagina) {
        if (pagina < 1 || pagina > this.obtenerTotalPaginas()) return;
        
        this.estado.filtros.pagina = pagina;
        this.aplicarFiltros();
    }

    obtenerTotalPaginas() {
        return Math.ceil(this.estado.componentesFiltrados.length / this.estado.filtros.componentesPorPagina);
    }

    actualizarPaginacion() {
        /*Implementar lógica de paginación si es necesario*/
    }

    ocultarDetallesComponente() {
        const modal = document.querySelector('.modal-detalles');
        if (modal) {
            document.body.removeChild(modal);
        }
    }
}
/*Soporte para módulos para escabilidad posterior a Backend*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArmadorPC;
}
