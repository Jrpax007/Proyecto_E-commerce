/*Datos de ejemplo (simulacion de productos)*/
const productos = [
    { id: 1, nombre: "Procesador Intel i7", precio: 350, categoria: "cpu", imagen: "assets/cpu1.webp" },
    { id: 2, nombre: "GeForce RTX 4070", precio: 600, categoria: "gpu", imagen: "assets/gpu1.webp" },
    { id: 3, nombre: "Memoria RAM 16GB DDR4", precio: 80, categoria: "ram", imagen: "assets/ram1.webp" },
    { id: 4, nombre: "SSD 1TB NVMe", precio: 120, categoria: "almacenamiento", imagen: "assets/ssd1.webp" },
    { id: 5, nombre: "Procesador AMD Ryzen 5", precio: 200, categoria: "cpu", imagen: "assets/cpu2.webp" },
    { id: 6, nombre: "GeForce RTX 3060", precio: 400, categoria: "gpu", imagen: "assets/gpu2.webp" }
];

/*Cargar productos en el grid*/
function cargarProductos(productosArray) {
    const grid = document.getElementById("grid-productos");
    grid.innerHTML = "";

    productosArray.forEach(producto => {
        const card = document.createElement("div");
        card.className = "producto-card";
        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio}</p>
            <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>`;
            /*------------->  AGREGAR LO QUE FALTE DE DETALLES ACÁ  <--------------------*/
        grid.appendChild(card);
    });
}

/*Filtro de productos*/
function filtrarProductos() {
    const precioMin = parseInt(document.getElementById("precio-min").value);
    const precioMax = parseInt(document.getElementById("precio-max").value);
    const categoriasSeleccionadas = Array.from(document.querySelectorAll('input[name="categoria"]:checked')).map(cb => cb.value);

    const productosFiltrados = productos.filter(producto => {
        const cumplePrecio = producto.precio >= precioMin && producto.precio <= precioMax;
        const cumpleCategoria = categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(producto.categoria);
        return cumplePrecio && cumpleCategoria;
    });

    cargarProductos(productosFiltrados);
}

/*Eventos*/
document.addEventListener("DOMContentLoaded", () => {
    /*Cargar todos los productos inicialmente*/
    cargarProductos(productos);

    /*Configurar rangos de precios*/
    const precioMin = document.getElementById("precio-min");
    const precioMax = document.getElementById("precio-max");
    const valorPrecioMin = document.getElementById("valor-precio-min");
    const valorPrecioMax = document.getElementById("valor-precio-max");

    precioMin.addEventListener("input", () => {
        valorPrecioMin.textContent = precioMin.value;
    });

    precioMax.addEventListener("input", () => {
        valorPrecioMax.textContent = precioMax.value;
    });

    /*Aplicar filtros cuando se hace clic en el botón*/
    document.getElementById("btn-aplicar-filtros").addEventListener("click", filtrarProductos);
});

/*Función para agregar al carrito (simulada)*/
function agregarAlCarrito(id) {
    console.log(`Producto ${id} agregado al carrito`);
    /*--------->   Acá va la integración con localStorage  <--------------*/
}