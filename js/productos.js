import { obtenerProductos } from "./api.js";


// Referencias al DOM
const grid = document.getElementById("grid-productos");
const filtroCategoria = document.getElementById("filtro-categoria");

const botonFiltros = document.getElementById("boton-aplicar-filtros");
const ordenSelect = document.getElementById("orden-productos");
const contadorResultados = document.getElementById("contador-resultados");

const btnAnterior = document.getElementById("boton-pagina-anterior");
const btnSiguiente = document.getElementById("boton-pagina-siguiente");
const numerosPagina = document.getElementById("numeros-pagina");

let productos = [];
let productosFiltrados = [];

// Configuración de paginación
let paginaActual = 1;
const productosPorPagina = 8; // cantidad de productos por página

// ===============================
// Renderizar productos paginados
// ===============================
function renderizarProductos(lista) {
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = `<p>No se encontraron productos</p>`;
    contadorResultados.textContent = "Mostrando 0 productos";
    return;
  }

  // Calcular índices
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const paginaProductos = lista.slice(inicio, fin);

  paginaProductos.forEach(prod => {
    grid.innerHTML += `
      <div class="tarjeta-producto">
        <img src="${prod.img}" alt="${prod.nombre}" loading="lazy">
        <h3>${prod.nombre}</h3>
        <p>$${prod.precio}</p>
        <button onclick="agregarAlCarrito(${prod.id})" class="boton boton-primario">
          <i class="bi bi-cart-plus"></i> Agregar
        </button>
      </div>
    `;
  });

  contadorResultados.textContent = `Mostrando ${paginaProductos.length} de ${lista.length} productos`;
  renderizarPaginacion(lista.length);
}

// ===============================
// Renderizar controles de paginación
// ===============================
function renderizarPaginacion(totalProductos) {
  const totalPaginas = Math.ceil(totalProductos / productosPorPagina);

  // Botones prev/next
  btnAnterior.disabled = paginaActual === 1;
  btnSiguiente.disabled = paginaActual === totalPaginas;

  // Números de página
  numerosPagina.innerHTML = "";
  for (let i = 1; i <= totalPaginas; i++) {
    const span = document.createElement("span");
    span.textContent = i;
    span.classList.add("numero-pagina");
    if (i === paginaActual) span.classList.add("pagina-activa");

    span.addEventListener("click", () => {
      paginaActual = i;
      renderizarProductos(productosFiltrados);
    });

    numerosPagina.appendChild(span);
  }
}

// ===============================
// Aplicar filtros
// ===============================
function aplicarFiltros() {
  const categoria = filtroCategoria.value;   
  productosFiltrados = productos.filter(p => {    
    if (categoria === "oferta") {
      return p.oferta === "true";
    }
    return categoria === "" || p.categoria === categoria;
  });

  aplicarOrden();
  paginaActual = 1; // reset al aplicar filtros
  renderizarProductos(productosFiltrados);
}

// ===============================
// Ordenamiento
// ===============================
function aplicarOrden() {
  const orden = ordenSelect.value;
  if (orden === "nombre") {
    productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (orden === "precio-asc") {
    productosFiltrados.sort((a, b) => a.precio - b.precio);
  } else if (orden === "precio-desc") {
    productosFiltrados.sort((a, b) => b.precio - a.precio);
  } else if (orden === "popularidad") {
    productosFiltrados.sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0));
  }
}

// ===============================
// Inicialización
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  productos = await obtenerProductos();  
  localStorage.setItem("productos", JSON.stringify(productos));
  productosFiltrados = [...productos];
  renderizarProductos(productos);
 // Detectar categoría desde la URL
  const params = new URLSearchParams(window.location.search);
  const categoriaParam = params.get("categoria");
 if (categoriaParam) {
    if (categoriaParam === "oferta") {
      // mostrar ofertas
      productosFiltrados = productos.filter(p => p.oferta === "true");
      renderizarProductos(productosFiltrados);
    } else {
      // seleccionar categoría normal
      filtroCategoria.value = categoriaParam;
      aplicarFiltros();
    }
  }

  // Listeners
  botonFiltros.addEventListener("click", aplicarFiltros);
  ordenSelect.addEventListener("change", () => {
    aplicarOrden();
    renderizarProductos(productosFiltrados);
  });

  btnAnterior.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderizarProductos(productosFiltrados);
    }
  });

  btnSiguiente.addEventListener("click", () => {
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderizarProductos(productosFiltrados);
    }
  });
});
