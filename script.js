// ===== Configuración =====
// Escribe aquí el número de WhatsApp Business de MUNA con código de país, sin + ni espacios (ej. '51987654321').
// Si queda vacío, WhatsApp se abre y el usuario elige a quién enviar el mensaje (modo demostrativo).
const WHATSAPP_NUMBER = '';

const products = {
  gel:     { name: 'Gel de ducha',     price: 29.90 },
  locion:  { name: 'Loción corporal',  price: 34.90 },
  manteca: { name: 'Manteca corporal', price: 39.90 }
};

// Plazos y operadores referenciales por zona (Sección 3 del documento: Shalom + DHL)
const shippingZones = {
  'lima-centro': { zone: 'Lima Metropolitana (zona centro-sur)', op: 'Courier local o recojo en agencia Shalom', time: '24 a 48 horas', cost: 'desde S/ 10' },
  'lima-norte':  { zone: 'Lima Norte',  op: 'Courier local o recojo en agencia Shalom', time: '24 a 72 horas', cost: 'desde S/ 12' },
  'lima-sur':    { zone: 'Lima Sur',    op: 'Courier local o recojo en agencia Shalom', time: '24 a 72 horas', cost: 'desde S/ 12' },
  'lima-este':   { zone: 'Lima Este',   op: 'Courier local o recojo en agencia Shalom', time: '24 a 72 horas', cost: 'desde S/ 12' },
  'callao':      { zone: 'Callao',      op: 'Courier local o recojo en agencia Shalom', time: '24 a 72 horas', cost: 'desde S/ 12' },
  'prov-costa':  { zone: 'Provincias de la costa', op: 'Shalom (envío a agencia)', time: '2 a 4 días hábiles', cost: 'desde S/ 15' },
  'prov-sierra': { zone: 'Provincias de la sierra', op: 'Shalom (envío a agencia)', time: '3 a 5 días hábiles', cost: 'desde S/ 18' },
  'prov-selva':  { zone: 'Provincias de la selva', op: 'Shalom (envío a agencia)', time: '4 a 7 días hábiles', cost: 'desde S/ 20' },
  'intl':        { zone: 'Envío internacional', op: 'DHL Express', time: '3 a 7 días hábiles según destino', cost: 'cotización por WhatsApp' }
};

const cart = {};
let selectedZone = '';
const $ = id => document.getElementById(id);
const money = n => 'S/ ' + n.toFixed(2);

function waLink(text) {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ===== Carrito =====
function renderCart() {
  let count = 0, total = 0, html = '';
  Object.keys(cart).forEach(id => {
    const p = products[id], q = cart[id];
    count += q; total += p.price * q;
    html += `<div class="cart-line">
      <span>${p.name}<br><small>${money(p.price * q)}</small></span>
      <span class="qty">
        <button data-dec="${id}" aria-label="Quitar una unidad de ${p.name}">−</button>
        <b aria-label="Cantidad">${q}</b>
        <button data-inc="${id}" aria-label="Agregar una unidad de ${p.name}">+</button>
        <button class="rm" data-remove="${id}" aria-label="Eliminar ${p.name}">Quitar</button>
      </span></div>`;
  });
  $('count').textContent = count;
  $('items').innerHTML = html || 'Tu bolsa está vacía.';
  $('total').textContent = money(total);
}

$('items').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.inc) cart[b.dataset.inc]++;
  if (b.dataset.dec) { cart[b.dataset.dec]--; if (cart[b.dataset.dec] <= 0) delete cart[b.dataset.dec]; }
  if (b.dataset.remove) delete cart[b.dataset.remove];
  renderCart();
});

function addToCart(id) { cart[id] = (cart[id] || 0) + 1; }

document.querySelectorAll('.add').forEach(b => b.addEventListener('click', () => {
  addToCart(b.dataset.id);
  renderCart();
  toast('Producto agregado a tu bolsa');
}));

function openCart() { $('overlay').hidden = false; document.body.classList.add('no-scroll'); $('closeCart').focus(); }
function closeCart() { $('overlay').hidden = true; document.body.classList.remove('no-scroll'); $('openCart').focus(); }
$('openCart').addEventListener('click', openCart);
$('closeCart').addEventListener('click', closeCart);
$('overlay').addEventListener('click', e => { if (e.target === $('overlay')) closeCart(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('overlay').hidden) closeCart(); });

$('checkout').addEventListener('click', () => {
  const ids = Object.keys(cart);
  if (!ids.length) { toast('Agrega un producto antes de continuar'); return; }
  const lines = ids.map(id => `${products[id].name} x ${cart[id]}`);
  const total = ids.reduce((s, id) => s + products[id].price * cart[id], 0);
  const z = shippingZones[selectedZone];
  const envio = z ? ` Envío a: ${z.zone} (${z.op}).` : ' Envío: por coordinar.';
  const msg = `Hola, MUNA. Quiero hacer este pedido: ${lines.join(', ')}. Total referencial de productos: ${money(total)}. Pago preferido: ${$('payMethod').value}.${envio}`;
  window.open(waLink(msg), '_blank', 'noopener');
});

// ===== Menú móvil =====
$('menuBtn').addEventListener('click', () => {
  const open = $('nav').classList.toggle('open');
  $('menuBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
  $('menuBtn').setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  $('menuBtn').textContent = open ? '×' : '☰';
});
document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => {
  $('nav').classList.remove('open');
  $('menuBtn').setAttribute('aria-expanded', 'false');
  $('menuBtn').textContent = '☰';
}));

// ===== Filtro de productos =====
document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
  const f = chip.dataset.filter;
  document.querySelectorAll('.chip').forEach(c => { c.classList.toggle('active', c === chip); c.setAttribute('aria-pressed', c === chip); });
  document.querySelectorAll('.card').forEach(card => card.classList.toggle('hide', f !== 'todos' && card.dataset.cat !== f));
}));

// ===== Recomendador de rutina =====
$('routineForm').addEventListener('submit', e => {
  e.preventDefault();
  const fields = ['need', 'aroma', 'ritual'];
  let ok = true;
  fields.forEach(id => { const empty = !$(id).value; $(id).classList.toggle('invalid', empty); if (empty) ok = false; });
  $('formError').hidden = ok;
  if (!ok) { $(fields.find(id => !$(id).value)).focus(); return; }

  const need = $('need').value, aroma = $('aroma').value, ritual = $('ritual').value;
  const map = { 'limpieza': 'gel', 'hidratación': 'locion', 'nutrición': 'manteca' };
  let ids = [map[need]];
  if (ritual === 'completa') ids = ids.concat(Object.keys(products).filter(id => !ids.includes(id)));

  $('result').innerHTML = `<h3>Tu rutina sugerida</h3>
    <p>Según tu interés en <b>${need}</b>, tu preferencia de aroma <b>${aroma}</b> y una rutina ${ritual === 'simple' ? 'simple' : 'completa'}, te sugerimos:</p>
    <ul>${ids.map(id => `<li>${products[id].name} · ${money(products[id].price)}</li>`).join('')}</ul>
    <p>Esta sugerencia es orientativa. Los aromas son preferencias conceptuales del proyecto.</p>
    <button type="button" class="btn" id="addRoutine">Agregar rutina a la bolsa</button>`;
  // En celular el resultado aparece debajo del botón: lo llevamos a la vista
  $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('result').focus({ preventScroll: true });
  $('addRoutine').addEventListener('click', () => {
    ids.forEach(addToCart);
    renderCart();
    toast('Rutina agregada a tu bolsa');
    openCart();
  });
});
['need', 'aroma', 'ritual'].forEach(id => $(id).addEventListener('change', () => $(id).classList.remove('invalid')));

// ===== Envíos: selección de zona y geolocalización =====
function showShipping(key, viaGeo) {
  selectedZone = key;
  const z = shippingZones[key];
  if (!z) { $('shipResult').innerHTML = ''; $('shipSummary').textContent = 'elige tu zona en la sección Envíos'; return; }
  $('shipResult').innerHTML = `${viaGeo ? 'Según tu ubicación: ' : ''}<b>${z.zone}</b><br>
    Operador sugerido: <b>${z.op}</b><br>
    Plazo estimado: <b>${z.time}</b> · Costo: <b>${z.cost}</b> <small>(referencial)</small>`;
  $('shipSummary').textContent = `${z.zone} · ${z.time}`;
}
$('district').addEventListener('change', e => showShipping(e.target.value, false));

function distanceKm(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180, R = 6371;
  const a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lon2 - lon1) * r / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

$('geoBtn').addEventListener('click', () => {
  if (!('geolocation' in navigator)) { toast('Tu navegador no permite usar la ubicación'); return; }
  $('shipResult').textContent = 'Buscando tu ubicación…';
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    const inPeru = lat > -18.4 && lat < 0.1 && lon > -81.4 && lon < -68.6;
    let key;
    if (!inPeru) key = 'intl';
    else if (distanceKm(lat, lon, -12.0464, -77.0428) < 40) key = 'lima-centro';
    else if (lon < -77.5 || lat < -15) key = 'prov-costa';
    else if (lon > -76) key = 'prov-selva';
    else key = 'prov-sierra';
    $('district').value = key;
    showShipping(key, true);
  }, () => {
    $('shipResult').textContent = 'No pudimos obtener tu ubicación. Elige tu zona en la lista.';
  }, { timeout: 10000, maximumAge: 600000 });
});

// ===== WhatsApp flotante =====
$('waFloat').href = waLink('Hola, MUNA. Quisiera consultar sobre sus productos y rutinas.');

// ===== Código QR hacia el recomendador =====
(function setupQR() {
  const isWeb = location.protocol.startsWith('http');
  const target = isWeb ? `${location.origin}${location.pathname}?utm_source=qr#personaliza` : '';
  if (isWeb) {
    $('qrImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(target)}`;
    $('qrUrl').textContent = target.replace('https://', '');
  } else {
    $('qrImg').hidden = true;
    $('qrUrl').textContent = 'El QR aparece cuando la página está publicada en GitHub Pages.';
  }
  if (new URLSearchParams(location.search).get('utm_source') === 'qr') {
    setTimeout(() => toast('¡Bienvenida! Llegaste desde nuestro código QR'), 600);
  }
})();

$('year').textContent = new Date().getFullYear();
renderCart();
