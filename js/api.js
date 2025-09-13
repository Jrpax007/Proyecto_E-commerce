
export async function obtenerProductos() {
  const res = await fetch('https://api.jsonbin.io/v3/b/68c1c90eae596e708fea0842', {
    method: 'GET',
    headers: {
      'X-Master-Key': '$2a$10$EpKmoU.n9rs1XdiiqcusTeK5SDhd81RMQoZ/zYgNP2WPsxPoi9Shu',
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) throw new Error('Error al traer los productos');
  const data = await res.json();
  const productos = data.record;
  localStorage.setItem('productos', JSON.stringify(productos));
  return productos;
}
