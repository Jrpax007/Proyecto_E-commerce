
  import { getProducts } from 'js/api.js'; // Ajustá la ruta según dónde esté tu api.js

  async function renderFeaturedProducts() {
    const products = await getProducts();

    const grid = document.querySelector('.productos-destacados .productos-grid');
    grid.innerHTML = ''; // Limpia el contenido anterior

    // Opcional: elegir solo algunos como destacados (ej. los 4 primeros)
    const destacados = products.slice(0, 4);

    destacados.forEach(prod => {
      const card = document.createElement('div');
      card.classList.add('producto-card');
      card.innerHTML = `
        <img src="${prod.imagen || './assets/images/pngwing.com.png'}" alt="${prod.nombre}">
        <h3>${prod.nombre}</h3>
        <p class="precio">$${prod.precio}</p>
        <button>Añadir al carrito</button>
      `;
      grid.appendChild(card);
    });
  }

  renderFeaturedProducts();
