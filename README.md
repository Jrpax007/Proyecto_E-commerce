
Proyecto E-commerce – Fuera De Serie Componentes

Tienda online de Fuera De Serie Componentes desarrollada con HTML, CSS y JavaScript.
Este proyecto forma parte de la tecnicatura en Programación II (UTN) y se utiliza como práctica para aplicar conceptos de programación web, manipulación del DOM, almacenamiento local y consumo de datos desde un JSON.

/**************************************************************************************************************/

📋 Contenido

Descripción

Características

Tecnologías

Instalación y uso

Estructura del proyecto

Próximas mejoras
/**************************************************************************************************************/

📝 Descripción

El proyecto simula un e-commerce de hardware donde el usuario puede:

Explorar un catálogo completo de componentes de PC

Ver productos destacados (cargados dinámicamente desde localStorage)

Filtrar por categoría, marca, precio u ofertas

Añadir productos al carrito y gestionarlos (sumar, restar, eliminar)

Ver subtotales, aplicar cupones de descuento y costos de envío

Realizar simulación de compra con validaciones de formularios

/**************************************************************************************************************/

🚀 Características principales

Catálogo dinámico cargado desde products.json o API JSONBin

Filtros de productos por categoría, marca y ofertas

Carrito persistente con localStorage

Cálculo automático de subtotal, descuentos y total con envío

Página de información con secciones: Quiénes somos, Términos y condiciones, Política de privacidad, FAQ

Diseño responsive con CSS y Bootstrap Icons

Accesibilidad mediante etiquetas ARIA y buenas prácticas semánticas

/**************************************************************************************************************/

🛠 Tecnologías utilizadas

Frontend: HTML5, CSS3, JavaScript ES6+

Datos: JSON local (products.json) y JSONBin

Storage: localStorage para carrito y destacados

UI: Bootstrap Icons, CSS Grid, Flexbox

/**************************************************************************************************************/

🔧 Instalación y uso

Clonar el repositorio:

git clone https://github.com/Jrpax007/Proyecto_E-commerce.git
cd Proyecto_E-commerce


Abrir el archivo index.html en tu navegador o usar una extensión tipo Live Server en VS Code para servirlo localmente.

El catálogo cargará los productos desde products.json.
Para usar la API externa, configurar el fetch en api.js con tu Master Key de JSONBin.

📁 Estructura del proyecto
Proyecto_E-commerce/
├── index.html               # Página principal
├── pages/
│   ├── productos.html       # Catálogo de productos
│   └── info.html            # Sección de FAQ, Términos, etc.
├── assets/
│   ├── icons/               # Favicons e íconos
│   └── images/              # Imágenes varias
├── css/
│   └── styles.css           # Estilos principales
├── js/
│   ├── productos.js         # Renderizado y filtros de productos
│   ├── carrito.js           # Lógica del carrito de compras
│   ├── api.js               # Conexión a JSONBin/local JSON
│   └── utils.js             # Funciones auxiliares
├── data/
│   └── products.json        # Base de datos local de productos
└── README.md

/**************************************************************************************************************/

🛣 Próximas mejoras

 Implementar autenticación de usuarios

 Integrar pasarela de pagos simulada

 Agregar paginación de productos

 Optimizar accesibilidad y SEO

 /**************************************************************************************************************/

📌 Proyecto Programación II – UTN realizado por:
        * Geronimo Carlucci
        * Patricicio Valla Benseny
        * Carlos Pairoux
        * Agustina Piccirilli
        * Diego Bufalari 