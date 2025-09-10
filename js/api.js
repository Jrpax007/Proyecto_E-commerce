const contenedor = document.getElementById("productos");

fetch('https://api.jsonbin.io/v3/b/68c1c90eae596e708fea0842', {
  method: 'GET',
  headers: {
    'X-Master-Key': '$2a$10$EpKmoU.n9rs1XdiiqcusTeK5SDhd81RMQoZ/zYgNP2WPsxPoi9Shu',   // tu clave privada
    'X-Access-Key': 'OPCIONAL',
    'Content-Type': 'application/json'
  }
})
.then(res => {
  if (!res.ok) throw new Error('Error al traer el bin');
  return res.json();
})
.then(data => {
 // console.log('Datos del bin:', data);
 const productos = data.record;
 localStorage.setItem('productos', JSON.stringify(productos));

 productos.forEach(prod => {
  contenedor.innerHTML += `
  <div id="productos-container">
      <div class="producto">
        <h3>${prod.nombre}</h3>
        <img src="${prod.img}" alt="${prod.nombre}" style="max-width:150px; border-radius:8px;"></img>
        <p> Precio: ${prod.precio}</p>
        <button> COMPRAR </button>
      </div>
   </div>  
      `
 })
})
.catch(err => console.error('Hubo un problema con el fetch:', err));