/* Validación y envío del formulario de contacto (simulado) */
const formulario = document.getElementById('formulario-contacto');  
document.getElementById('email').addEventListener('blur', function() {  
    const email = this.value;  
    const error = document.getElementById('error-email');  
    if (!email.includes('@')) {  
        error.textContent = 'Ingrese un email válido';  
        error.style.display = 'block';  
    } else {  
        error.style.display = 'none';  
    }  
});  

/* Manejar el envío del formulario */
formulario.addEventListener('submit', function(e) {  
    e.preventDefault();
    
    /*Simular envío*/
    console.log('Datos del formulario:', {  
        nombre: document.getElementById('nombre').value,  
        email: document.getElementById('email').value,  
        telefono: document.getElementById('telefono').value,  
        fecha: document.getElementById('fecha').value,  
        consulta: document.getElementById('consulta').value,  
        contacto: document.querySelector('input[name="contacto"]:checked').value,  
        terminos: document.getElementById('terminos').checked  
    });  
    alert('Consulta enviada (simulación)');  
    formulario.reset();  
});  