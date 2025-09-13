import { obtenerProductos } from './api.js';

const contenedor = document.getElementById("productos-container");

function cargarProductos(lista) {
  contenedor.innerHTML = ""; 
  lista.forEach(prod => {
    contenedor.innerHTML += `
      <div ="productos">
        <div class="producto">
          <h3>${prod.nombre}</h3>
          <img src="${prod.img}" alt="${prod.nombre}" style="max-width:150px; border-radius:8px;">
          <p>Precio: ${prod.precio}</p>
          <button onclick="agregarAlCarrito(${prod.id})">COMPRAR</button>
        </div>
      </div>
    `;
  });
}

function filtrarProductos(productos) {
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

function agregarAlCarrito(id) {
  console.log(`Producto ${id} agregado al carrito`);
  // Aquí podés integrar con localStorage si querés
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const productos = await obtenerProductos();
    cargarProductos(productos);

    const precioMin = document.getElementById("precio-min");
    const precioMax = document.getElementById("precio-max");
    const valorPrecioMin = document.getElementById("valor-precio-min");
    const valorPrecioMax = document.getElementById("valor-precio-max");

    precioMin.addEventListener("input", () => valorPrecioMin.textContent = precioMin.value);
    precioMax.addEventListener("input", () => valorPrecioMax.textContent = precioMax.value);

    document.getElementById("btn-aplicar-filtros").addEventListener("click", () => filtrarProductos(productos));
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
});
