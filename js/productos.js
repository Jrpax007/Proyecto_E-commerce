import { obtenerProductos } from './api.js';

const contenedor = document.getElementById("productos-container");
const selectorCategoria = document.getElementById("categorias");
const btnFiltros = document.getElementById("btn-aplicar-filtros");

const params = new URLSearchParams(window.location.search);
const categoriaInicial = params.get("categoria");

function cargarProductos(lista) {
  contenedor.innerHTML = ""; 
  lista.forEach(prod => {
    contenedor.innerHTML += `
      <div class="productos">        
          <h3>${prod.nombre}</h3>
          <img src="${prod.img}" alt="${prod.nombre}" style="max-width:150px; border-radius:8px;">
          <p>Precio: ${prod.precio}</p>
          <button onclick="agregarAlCarrito(${prod.id})">COMPRAR</button>
      </div>      
    `;
  });
}

function filtrarProductos(productos) {  
  const categoriasSeleccionadas = selectorCategoria.value;

  const productosFiltrados = productos.filter(producto => 
    categoriasSeleccionadas === "" || producto.categoria === categoriasSeleccionadas
  );  

  cargarProductos(productosFiltrados);
}
/*
function agregarAlCarrito(id) {
  console.log(`Producto ${id} agregado al carrito`);
  // Aquí podés integrar con localStorage si querés
}*/

async function init() {
  try {
    const productos = await obtenerProductos();
    cargarProductos(productos);
    if (categoriaInicial) {
      selectorCategoria.value = categoriaInicial; // deja seleccionado el <option>
      filtrarProductos(productos);
    } else {
      cargarProductos(productos);
    }

    // Escuchar el botón de filtros
    btnFiltros.addEventListener("click", () => {
      filtrarProductos(productos);
    });

  } catch (error) {
    console.error("Error cargando Productos.", error);
  }
}

init();
