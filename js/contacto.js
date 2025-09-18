/**
 * Sistema de Validación de Formulario de Contacto.
 * Validación en tiempo real y envío de formularios.
 */

class ValidadorFormulario {
    constructor() {
        this.selectores = {
            formulario: '#formulario-contacto',
            campoNombre: '#nombre-completo',
            campoEmail: '#email',
            campoTelefono: '#telefono',
            campoTipoConsulta: '#tipo-consulta',
            campoMensaje: '#mensaje',
            campoTerminos: '#acepto-terminos',
            grupoPreferencia: '.grupo-radio',
            botonEnviar: 'button[type="submit"]',
            mensajeConfirmacion: '#mensaje-confirmacion',
            botonNuevaConsulta: '#boton-nueva-consulta',
            camposRadio: 'input[name="preferencia-contacto"]'
        };

        this.expresiones = {
            nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            telefono: /^[\d\s\+\-\(\)]{7,20}$/,
            mensaje: /^[\s\S]{10,1000}$/
        };

        this.estados = {
            nombre: { valido: false, mensaje: '' },
            email: { valido: false, mensaje: '' },
            telefono: { valido: true, mensaje: '' },
            tipoConsulta: { valido: false, mensaje: '' },
            preferenciaContacto: { valido: false, mensaje: '' },
            mensaje: { valido: false, mensaje: '' },
            terminos: { valido: false, mensaje: '' }
        };

        this.inicializado = false;
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;

        this.configurarEventListeners();
        this.configurarValidacionEnTiempoReal();
        this.inicializado = true;

        console.log('Validador de formulario inicializado correctamente');
    }

    configurarEventListeners() {
        const formulario = document.querySelector(this.selectores.formulario);
        const botonNuevaConsulta = document.querySelector(this.selectores.botonNuevaConsulta);

        if (formulario) {
            formulario.addEventListener('submit', (evento) => {
                evento.preventDefault();
                this.procesarEnvio();
            });
        }

        if (botonNuevaConsulta) {
            botonNuevaConsulta.addEventListener('click', () => {
                this.resetearFormulario();
            });
        }

        /*Validar formulario al cambiar cualquier campo*/
        formulario.addEventListener('input', () => {
            this.actualizarEstadoBotonEnviar();
        });

        formulario.addEventListener('change', () => {
            this.actualizarEstadoBotonEnviar();
        });
    }

    configurarValidacionEnTiempoReal() {
        /*Validación del nombre*/
        const campoNombre = document.querySelector(this.selectores.campoNombre);
        if (campoNombre) {
            campoNombre.addEventListener('blur', () => {
                this.validarNombre(campoNombre.value);
            });
            campoNombre.addEventListener('input', () => {
                this.limpiarError('nombre');
            });
        }

        /*Validación del email*/
        const campoEmail = document.querySelector(this.selectores.campoEmail);
        if (campoEmail) {
            campoEmail.addEventListener('blur', () => {
                this.validarEmail(campoEmail.value);
            });
            campoEmail.addEventListener('input', () => {
                this.limpiarError('email');
            });
        }

        /*Validación del teléfono*/
        const campoTelefono = document.querySelector(this.selectores.campoTelefono);
        if (campoTelefono) {
            campoTelefono.addEventListener('blur', () => {
                this.validarTelefono(campoTelefono.value);
            });
            campoTelefono.addEventListener('input', () => {
                this.limpiarError('telefono');
            });
        }

        /*Validación del tipo de consulta*/
        const campoTipoConsulta = document.querySelector(this.selectores.campoTipoConsulta);
        if (campoTipoConsulta) {
            campoTipoConsulta.addEventListener('change', () => {
                this.validarTipoConsulta(campoTipoConsulta.value);
            });
        }

        /*Validación del mensaje*/
        const campoMensaje = document.querySelector(this.selectores.campoMensaje);
        if (campoMensaje) {
            campoMensaje.addEventListener('blur', () => {
                this.validarMensaje(campoMensaje.value);
            });
            campoMensaje.addEventListener('input', () => {
                this.limpiarError('mensaje');
                this.actualizarContadorCaracteres(campoMensaje.value);
            });
        }

        /*Validación de los términos*/
        const campoTerminos = document.querySelector(this.selectores.campoTerminos);
        if (campoTerminos) {
            campoTerminos.addEventListener('change', () => {
                this.validarTerminos(campoTerminos.checked);
            });
        }

        /*Validación de preferencia de contacto*/
        const radiosContacto = document.querySelectorAll(this.selectores.camposRadio);
        radiosContacto.forEach(radio => {
            radio.addEventListener('change', () => {
                this.validarPreferenciaContacto();
            });
        });

        /*Contador de caracteres para el mensaje*/
        this.inicializarContadorCaracteres();
    }

    inicializarContadorCaracteres() {
        const campoMensaje = document.querySelector(this.selectores.campoMensaje);
        if (!campoMensaje) return;

        const contador = document.createElement('div');
        contador.className = 'contador-caracteres';
        contador.style.cssText = `
            font-size: 0.8rem;
            color: var(--color-texto-secundario);
            text-align: right;
            margin-top: 0.25rem;
        `;

        campoMensaje.parentNode.appendChild(contador);
        this.actualizarContadorCaracteres(campoMensaje.value);
    }

    actualizarContadorCaracteres(texto) {
        const contador = document.querySelector('.contador-caracteres');
        if (!contador) return;

        const longitud = texto.length;
        const maximo = 1000;
        const porcentaje = (longitud / maximo) * 100;

        contador.textContent = `${longitud}/${maximo} caracteres`;

        /*Cambiar color según el porcentaje*/
        if (porcentaje > 90) {
            contador.style.color = 'var(--color-peligro)';
        } else if (porcentaje > 75) {
            contador.style.color = 'var(--color-advertencia)';
        } else {
            contador.style.color = 'var(--color-texto-secundario)';
        }
    }

    validarNombre(valor) {
        valor = valor.trim();
        
        if (!valor) {
            this.mostrarError('nombre', 'El nombre completo es obligatorio');
            return false;
        }

        if (valor.length < 2) {
            this.mostrarError('nombre', 'El nombre debe tener al menos 2 caracteres');
            return false;
        }

        if (valor.length > 50) {
            this.mostrarError('nombre', 'El nombre no puede exceder los 50 caracteres');
            return false;
        }

        if (!this.expresiones.nombre.test(valor)) {
            this.mostrarError('nombre', 'Solo se permiten letras y espacios');
            return false;
        }

        this.mostrarExito('nombre');
        this.estados.nombre = { valido: true, mensaje: '' };
        return true;
    }

    validarEmail(valor) {
        valor = valor.trim();
        
        if (!valor) {
            this.mostrarError('email', 'El email es obligatorio');
            return false;
        }

        if (!this.expresiones.email.test(valor)) {
            this.mostrarError('email', 'Formato de email inválido');
            return false;
        }

        /*Validación adicional de dominio*/
        const dominio = valor.split('@')[1];
        if (dominio) {
            const partesDominio = dominio.split('.');
            if (partesDominio.length < 2 || partesDominio[partesDominio.length - 1].length < 2) {
                this.mostrarError('email', 'El dominio del email parece inválido');
                return false;
            }
        }

        this.mostrarExito('email');
        this.estados.email = { valido: true, mensaje: '' };
        return true;
    }

    validarTelefono(valor) {
        valor = valor.trim();
        
        if (valor && !this.expresiones.telefono.test(valor)) {
            this.mostrarError('telefono', 'Formato de teléfono inválido. Use solo números, espacios, +, - o ()');
            this.estados.telefono = { valido: false, mensaje: 'Formato inválido' };
            return false;
        }

        if (valor && valor.replace(/\D/g, '').length < 7) {
            this.mostrarError('telefono', 'El número de teléfono debe tener al menos 7 dígitos');
            return false;
        }

        this.limpiarError('telefono');
        this.estados.telefono = { valido: true, mensaje: '' };
        return true;
    }

    validarTipoConsulta(valor) {
        if (!valor) {
            this.mostrarError('tipoConsulta', 'Selecciona un tipo de consulta');
            return false;
        }

        this.limpiarError('tipoConsulta');
        this.estados.tipoConsulta = { valido: true, mensaje: '' };
        return true;
    }

    validarPreferenciaContacto() {
        const seleccionado = document.querySelector('input[name="preferencia-contacto"]:checked');
        
        if (!seleccionado) {
            this.mostrarError('preferenciaContacto', 'Selecciona una preferencia de contacto');
            return false;
        }

        this.limpiarError('preferenciaContacto');
        this.estados.preferenciaContacto = { valido: true, mensaje: '' };
        return true;
    }

    validarMensaje(valor) {
        valor = valor.trim();
        
        if (!valor) {
            this.mostrarError('mensaje', 'El mensaje es obligatorio');
            return false;
        }

        if (valor.length < 10) {
            this.mostrarError('mensaje', 'El mensaje debe tener al menos 10 caracteres');
            return false;
        }

        if (valor.length > 1000) {
            this.mostrarError('mensaje', 'El mensaje no puede exceder los 1000 caracteres');
            return false;
        }

        this.mostrarExito('mensaje');
        this.estados.mensaje = { valido: true, mensaje: '' };
        return true;
    }

    validarTerminos(aceptado) {
        if (!aceptado) {
            this.mostrarError('terminos', 'Debes aceptar los términos y condiciones');
            return false;
        }

        this.limpiarError('terminos');
        this.estados.terminos = { valido: true, mensaje: '' };
        return true;
    }

    validarFormularioCompleto() {
        const campos = [
            this.validarNombre(document.querySelector(this.selectores.campoNombre)?.value || ''),
            this.validarEmail(document.querySelector(this.selectores.campoEmail)?.value || ''),
            this.validarTelefono(document.querySelector(this.selectores.campoTelefono)?.value || ''),
            this.validarTipoConsulta(document.querySelector(this.selectores.campoTipoConsulta)?.value || ''),
            this.validarPreferenciaContacto(),
            this.validarMensaje(document.querySelector(this.selectores.campoMensaje)?.value || ''),
            this.validarTerminos(document.querySelector(this.selectores.campoTerminos)?.checked || false)
        ];

        return campos.every(valido => valido);
    }

    async procesarEnvio() {
        if (!this.validarFormularioCompleto()) {
            this.mostrarNotificacion('Por favor, corrige los errores del formulario', 'error');
            
            /*Scroll al primer error*/
            const primerError = document.querySelector('.error');
            if (primerError) {
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            return;
        }

        this.mostrarEstadoCarga(true);

        try {
            const datosFormulario = this.obtenerDatosFormulario();
            const resultado = await this.enviarFormulario(datosFormulario);
            
            if (resultado.success) {
                this.mostrarConfirmacion();
                this.limpiarFormulario();
            } else {
                throw new Error(resultado.message || 'Error en el envío');
            }
        } catch (error) {
            console.error('Error en el envío:', error);
            this.mostrarNotificacion('Error al enviar el formulario. Intenta nuevamente.', 'error');
        } finally {
            this.mostrarEstadoCarga(false);
        }
    }

    obtenerDatosFormulario() {
        const preferencia = document.querySelector('input[name="preferencia-contacto"]:checked');
        
        return {
            nombre: document.querySelector(this.selectores.campoNombre).value.trim(),
            email: document.querySelector(this.selectores.campoEmail).value.trim(),
            telefono: document.querySelector(this.selectores.campoTelefono).value.trim() || null,
            tipoConsulta: document.querySelector(this.selectores.campoTipoConsulta).value,
            preferenciaContacto: preferencia ? preferencia.value : null,
            fechaContacto: document.querySelector('#fecha-contacto')?.value || null,
            mensaje: document.querySelector(this.selectores.campoMensaje).value.trim(),
            terminosAceptados: true,
            fechaEnvio: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            idioma: navigator.language,
            zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /*async enviarFormulario(datos) {
        if (typeof window.api !== 'undefined' && window.api.enviarFormularioContacto) {
            return await window.api.enviarFormularioContacto(datos);
        }

        --Simulación de envío para desarrollo
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Mensaje enviado correctamente',
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString()
                });
            }, 2000);
        });
    }*/

    mostrarError(campo, mensaje) {
        const elementoError = document.querySelector(`#error-${campo}`);
        const elementoInput = document.querySelector(this.selectores[`campo${this.capitalizar(campo)}`]);

        if (elementoError) {
            elementoError.textContent = mensaje;
            elementoError.style.display = 'block';
        }

        if (elementoInput) {
            elementoInput.classList.add('error');
            elementoInput.classList.remove('exito');
        }

        this.estados[campo] = { valido: false, mensaje: mensaje };
    }

    mostrarExito(campo) {
        const elementoError = document.querySelector(`#error-${campo}`);
        const elementoInput = document.querySelector(this.selectores[`campo${this.capitalizar(campo)}`]);

        if (elementoError) {
            elementoError.style.display = 'none';
        }

        if (elementoInput) {
            elementoInput.classList.remove('error');
            elementoInput.classList.add('exito');
        }
    }

    limpiarError(campo) {
        const elementoError = document.querySelector(`#error-${campo}`);
        const elementoInput = document.querySelector(this.selectores[`campo${this.capitalizar(campo)}`]);

        if (elementoError) {
            elementoError.style.display = 'none';
        }

        if (elementoInput) {
            elementoInput.classList.remove('error', 'exito');
        }
    }

    capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    mostrarEstadoCarga(cargando) {
        const botonEnviar = document.querySelector(this.selectores.botonEnviar);
        const formulario = document.querySelector(this.selectores.formulario);

        if (botonEnviar) {
            if (cargando) {
                botonEnviar.innerHTML = '<i class="bi bi-arrow-repeat girando"></i> Enviando...';
                botonEnviar.disabled = true;
            } else {
                botonEnviar.innerHTML = '<i class="bi bi-send"></i> Enviar Consulta';
                botonEnviar.disabled = false;
            }
        }

        if (formulario) {
            formulario.style.opacity = cargando ? 0.7 : 1;
            formulario.style.pointerEvents = cargando ? 'none' : 'auto';
        }
    }

    mostrarConfirmacion() {
        const formulario = document.querySelector(this.selectores.formulario);
        const mensajeConfirmacion = document.querySelector(this.selectores.mensajeConfirmacion);

        if (formulario && mensajeConfirmacion) {
            formulario.style.display = 'none';
            mensajeConfirmacion.hidden = false;
            mensajeConfirmacion.style.display = 'block';
            
            /*Scroll a la confirmación*/
            mensajeConfirmacion.scrollIntoView({ behavior: 'smooth' });
        }
    }

    resetearFormulario() {
        const formulario = document.querySelector(this.selectores.formulario);
        const mensajeConfirmacion = document.querySelector(this.selectores.mensajeConfirmacion);

        if (formulario && mensajeConfirmacion) {
            formulario.reset();
            formulario.style.display = 'block';
            mensajeConfirmacion.hidden = true;
            mensajeConfirmacion.style.display = 'none';

            /*Resetea los estados de la validación*/
            Object.keys(this.estados).forEach(campo => {
                this.estados[campo] = { valido: false, mensaje: '' };
                this.limpiarError(campo);
            });

            /*Resetea el contador de caracteres*/
            this.actualizarContadorCaracteres('');

            /*Actualiza el botón de enviar*/
            this.actualizarEstadoBotonEnviar();
        }
    }

    limpiarFormulario() {
        const formulario = document.querySelector(this.selectores.formulario);
        if (formulario) {
            formulario.reset();
            
            /*Limpia las clases de validación*/
            const inputs = formulario.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('error', 'exito');
            });

            /*Limpia los mensajes de error*/
            const errores = formulario.querySelectorAll('.mensaje-error');
            errores.forEach(error => error.style.display = 'none');

            /*Resetea los estados*/
            Object.keys(this.estados).forEach(campo => {
                this.estados[campo] = { valido: false, mensaje: '' };
            });

            /*Resetea el contador*/
            this.actualizarContadorCaracteres('');

            /*Actualiza el botón*/
            this.actualizarEstadoBotonEnviar();
        }
    }

    actualizarEstadoBotonEnviar() {
        const botonEnviar = document.querySelector(this.selectores.botonEnviar);
        if (!botonEnviar) return;

        /*Verifica si todos los campos obligatorios están completos*/
        const formularioValido = Object.values(this.estados).every(estado => estado.valido);
        botonEnviar.disabled = !formularioValido;
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion(mensaje, tipo);
            return;
        }

        /*Implementación básica de notificación*/
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.innerHTML = `
            <i class="bi ${this.obtenerIconoNotificacion(tipo)}"></i>
            <span>${mensaje}</span>
        `;

        /*Estilos básicos que se le agrega*/
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
        }, 5000);
    }

    obtenerIconoNotificacion(tipo) {
        const iconos = {
            exito: 'bi-check-circle-fill',
            error: 'bi-exclamation-circle-fill',
            info: 'bi-info-circle-fill',
            advertencia: 'bi-exclamation-triangle-fill'
        };
        return iconos[tipo] || 'bi-info-circle-fill';
    }

    obtenerColorNotificacion(tipo) {
        const colores = {
            exito: '#22c55e',
            error: '#ef4444',
            info: '#3b82f6',
            advertencia: '#f59e0b'
        };
        return colores[tipo] || '#3b82f6';
    }

    /*Métodos estáticos para uso global*/
/**
 * Valida el formulario utilizando el método `validarFormularioCompleto` de `validadorFormulario`.
 * Retorna `true` si el formulario es válido, `false` si no lo es.
 */
    static validar() {
        if (window.validadorFormulario) {
            return window.validadorFormulario.validarFormularioCompleto();
        }
        return false;
    }
/**
 * Resetea el formulario llamando al método `resetearFormulario` de `validadorFormulario`.
 * Este método limpia todos los campos del formulario.
 */
    static resetear() {
        if (window.validadorFormulario) {
            window.validadorFormulario.resetearFormulario();
        }
    }
/**
 * Envía el formulario procesando el envío a través del método `procesarEnvio` de `validadorFormulario`.
 * Este método maneja la lógica de envío del formulario.
 */
    static enviar() {
        if (window.validadorFormulario) {
            window.validadorFormulario.procesarEnvio();
        }
    }
}

/*Inicialización cuando el DOM está listo*/
document.addEventListener('DOMContentLoaded', function() {
    window.validadorFormulario = new ValidadorFormulario();
});

/*Soporte para módulos para escabilidad posterior a Backend*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidadorFormulario;
}
