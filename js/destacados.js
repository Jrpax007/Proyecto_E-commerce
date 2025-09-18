document.addEventListener("DOMContentLoaded", () => {
  const gridDestacados = document.getElementById("grid-productos-destacados");

  // Recuperar productos del localStorage
  const productos = JSON.parse(localStorage.getItem("productos")) || [];

  if (productos.length === 0) {
    gridDestacados.innerHTML = "<p>No hay productos destacados</p>";
    return;
  }

  // Mezclar los productos de forma aleatoria (Fisher-Yates shuffle)
  const productosMezclados = [...productos];
  for (let i = productosMezclados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [productosMezclados[i], productosMezclados[j]] = [productosMezclados[j], productosMezclados[i]];
  }

  // Tomar 6 productos random
  const destacados = productosMezclados.slice(0, 6);

  // Renderizar destacados
  gridDestacados.innerHTML = "";
  destacados.forEach(prod => {
    gridDestacados.innerHTML += `
      <a href="pages/productos.html?categoria=${encodeURIComponent(prod.categoria)}" class="tarjeta-producto">
        <img src="${Array.isArray(prod.img) ? prod.img[0] : prod.img}" alt="${prod.nombre}" loading="lazy">
        <h3>${prod.nombre}</h3>
        <p>$${prod.precio}</p>
      </a>
    `;
  });
});
