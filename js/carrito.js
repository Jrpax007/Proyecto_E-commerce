// ===============================
// Estado inicial
// ===============================
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let cuponAplicado = null;
let envioSeleccionado = "estandar"; // valor por defecto

// Referencias al DOM
const listaCarrito = document.getElementById("lista-productos-carrito");
const subtotalEl = document.getElementById("subtotal-carrito");
const descuentoEl = document.getElementById("descuento-carrito");
const totalEl = document.getElementById("total-carrito");
const contadorGlobal = document.getElementById("contador-carrito-global");
const inputCupon = document.getElementById("input-cupon");
const mensajeCupon = document.getElementById("mensaje-cupon");
const botonVaciar = document.getElementById("boton-vaciar-carrito");
const botonFinalizar = document.getElementById("boton-finalizar-compra");
const confirmacionCompra = document.getElementById("confirmacion-compra");

// ===============================
// Guardar y actualizar estado
// ===============================
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
}

function actualizarContador() {
  if (contadorGlobal) {
    const total = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);
    contadorGlobal.textContent = total;
  }
}

// ===============================
// Renderizar productos en carrito
// ===============================
function renderizarCarrito() {
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    document.getElementById("mensaje-carrito-vacio").style.display = "block";
    botonFinalizar.disabled = true;
    subtotalEl.textContent = "$0.00";
    descuentoEl.textContent = "-$0.00";
    totalEl.textContent = "$0.00";
    return;
  }

  document.getElementById("mensaje-carrito-vacio").style.display = "none";
  botonFinalizar.disabled = false;

  let subtotal = 0;

  carrito.forEach((prod, index) => {
    subtotal += prod.precio * prod.cantidad;

    listaCarrito.innerHTML += `
      <div class="producto-carrito">
        <img src="${prod.img}" alt="${prod.nombre}" width="80">
        <div class="info-producto">
          <h4>${prod.nombre}</h4>
          <p>Precio unitario: $${prod.precio}</p>
          <div class="cantidad">
            <button onclick="cambiarCantidad(${index}, -1)">-</button>
            <span>${prod.cantidad}</span>
            <button onclick="cambiarCantidad(${index}, 1)">+</button>
          </div>
        </div>
        <button onclick="eliminarDelCarrito(${index})">❌</button>
      </div>
    `;
  });

  calcularTotales(subtotal);
}

// ===============================
// Cálculos de totales
// ===============================
function calcularTotales(subtotal) {
  let descuento = 0;

  if (cuponAplicado === "DESCUENTO10") descuento = subtotal * 0.1;
  if (cuponAplicado === "DESCUENTO20") descuento = subtotal * 0.2;

  let envio = 500; // estándar
  if (envioSeleccionado === "express") envio = 800;
  if (envioSeleccionado === "retiro") envio = 0;

  const total = subtotal - descuento + envio;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  descuentoEl.textContent = `-$${descuento.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;
}

// ===============================
// Acciones del carrito
// ===============================
function agregarAlCarrito(id) {
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  // FIX: comparar siempre como string
  const producto = productos.find(p => String(p.id) === String(id));

  if (producto) {
    const existente = carrito.find(p => String(p.id) === String(id));
    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    guardarCarrito();
    renderizarCarrito();
  }
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  renderizarCarrito();
}

function cambiarCantidad(index, delta) {
  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
  guardarCarrito();
  renderizarCarrito();
}

// ===============================
// Vaciar carrito
// ===============================
if (botonVaciar) {
  botonVaciar.addEventListener("click", () => {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
  });
}

// ===============================
// Aplicar cupón
// ===============================
if (inputCupon) {
  document.getElementById("boton-aplicar-cupon").addEventListener("click", () => {
    const codigo = inputCupon.value.trim().toUpperCase();
    if (codigo === "DESCUENTO10" || codigo === "DESCUENTO20") {
      cuponAplicado = codigo;
      mensajeCupon.textContent = `Cupón ${codigo} aplicado!`;
      renderizarCarrito();
    } else {
      mensajeCupon.textContent = "Cupón inválido";
    }
  });
}

// ===============================
// Opciones de envío
// ===============================
document.querySelectorAll('input[name="opcion-envio"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    envioSeleccionado = e.target.value;
    renderizarCarrito();
  });
});

// ===============================
// Finalizar compra
// ===============================
if (botonFinalizar) {
  botonFinalizar.addEventListener("click", () => {
    if (carrito.length === 0) return;

    // Guardar detalle de la compra (opcional)
    const resumenCompra = {
      productos: carrito,
      fecha: new Date().toLocaleString(),
    };
    console.log("Compra finalizada:", resumenCompra);

    // Limpiar carrito
    carrito = [];
    guardarCarrito();
    renderizarCarrito();

    // Mostrar mensaje de confirmación
    confirmacionCompra.style.display = "block";
    confirmacionCompra.scrollIntoView({ behavior: "smooth" });
  });
}

// ===============================
// Inicialización
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  actualizarContador();
  renderizarCarrito();
});

// ===============================
// Hacer funciones accesibles globalmente
// ===============================
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.cambiarCantidad = cambiarCantidad;
