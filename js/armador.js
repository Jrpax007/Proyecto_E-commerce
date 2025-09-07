/*Datos de componentes*/
const componentes = [  
    { id: 1, nombre: "Intel i7-12700K", precio: 350, categoria: "cpu", imagen: "assets/cpu1.webp" },  
    { id: 2, nombre: "AMD Ryzen 7 5800X", precio: 300, categoria: "cpu", imagen: "assets/cpu2.webp" },  
    { id: 3, nombre: "NVIDIA RTX 4070", precio: 600, categoria: "gpu", imagen: "assets/gpu1.webp" },  
    // Más componentes...  
];  

let carrito = [];  

/* Funcion para generar las cards de componentes  */
function renderizarComponentes() {  
    const grid = document.getElementById("grid-componentes");  
    grid.innerHTML = componentes.map(componente => `  
        <div class="card-componente" data-categoria="${componente.categoria}">  
            <img src="${componente.imagen}" alt="${componente.nombre}">  
            <h3>${componente.nombre}</h3>  
            <p>${componente.precio} USD</p>  
            <button onclick="agregarAlCarrito(${componente.id})">Agregar</button>  
        </div>  
    `).join("");  
}  

/* Funcion para agregar al carrito */
function agregarAlCarrito(id) {  
    const componente = componentes.find(c => c.id === id);  
    carrito.push(componente);  
    actualizarCarrito();  
}  

/*Funcion para actualizar carrito y total */ 
function actualizarCarrito() {  
    const carritoItems = document.getElementById("carrito-items");  
    carritoItems.innerHTML = carrito.map(item => `  
        <div class="carrito-item">  
            <p>${item.nombre} - ${item.precio} USD</p>  
        </div>  
    `).join("");  

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);  
    document.getElementById("precio-total").textContent = total;  
}  

/* Funcion para finalizar la compra */ 
document.getElementById("btn-finalizar").addEventListener("click", () => {  
    alert("Compra finalizada (simulación). Total: " + carrito.reduce((sum, item) => sum + item.precio, 0) + " USD");  
    carrito = [];  
    actualizarCarrito();  
});  

/* Renderizar componentes al cargar la página */  
document.addEventListener("DOMContentLoaded", renderizarComponentes);  