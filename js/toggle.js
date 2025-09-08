document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-icon');
    
    // Verificamos si ya hay un tema almacenado en el localStorage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.classList.remove('bi-moon-fill');
        themeToggle.classList.add('bi-sun-fill');
    }

    // Evento para cambiar el tema al hacer clic
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.classList.remove('bi-moon-fill');
            themeToggle.classList.add('bi-sun-fill');
            localStorage.setItem('theme', 'dark'); // Guardamos la preferencia
        } else {
            themeToggle.classList.remove('bi-sun-fill');
            themeToggle.classList.add('bi-moon-fill');
            localStorage.removeItem('theme'); // Eliminamos la preferencia
        }
    });
});
