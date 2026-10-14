# MUNA — tienda digital (PA2 Diseño de Negocios Digitales)

Sitio demostrativo de cuidado personal: catálogo dinámico de 7 productos con filtros, carrito con cantidades,
test de rutina de 8 preguntas paso a paso, consulta de envíos por distrito o ubicación, botón flotante de WhatsApp
y código QR hacia el test.

## Archivos
- `index.html` — estructura semántica (header, nav, main, section, footer)
- `styles.css` — estilos de marca, Grid/Flexbox y adaptación a celular
- `script.js` — carrito, filtros, validación del formulario, envíos, geolocalización, WhatsApp y QR

## Publicar en GitHub Pages
1. Crea un repositorio público llamado `MUNA`.
2. Sube `index.html`, `styles.css`, `script.js` y este `README.md` a la raíz del repositorio.
3. Abre **Settings → Pages** → **Deploy from a branch** → rama `main`, carpeta `/ (root)` → **Save**.
4. Espera 1–3 minutos y abre la URL que muestra GitHub (ej. `https://USUARIO.github.io/MUNA/`).

## WhatsApp
Todos los botones abren el WhatsApp de MUNA (940 999 440). Para cambiarlo, edita `WHATSAPP_NUMBER` al inicio de `script.js`
(código de país 51 + número, sin espacios).

## Alcance y límites
- Productos, precios, plazos y costos de envío son referenciales (proyecto académico).
- El carrito funciona en el navegador; no guarda pedidos en una base de datos.
- El pedido se envía como mensaje de WhatsApp; la web no procesa pagos reales.
- La ubicación solo se usa en el navegador para sugerir la zona de envío; no se guarda.
- El QR se genera automáticamente con la URL publicada.
