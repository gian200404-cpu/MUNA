// ===== Configuración =====
// Número de WhatsApp de MUNA con código de país (51 = Perú), sin + ni espacios.
const WHATSAPP_NUMBER = '51940999440';

// ===== Catálogo (precios referenciales del proyecto académico) =====
const products = {
  gel:            { name: 'Gel de ducha',     desc: 'Limpieza suave diaria',            cat: 'limpieza',    price: 29.90, bg: 'sage',  pack: '',          label: 'limpieza suave' },
  jabon:          { name: 'Jabón en barra',   desc: 'Limpieza natural, sin plástico',   cat: 'limpieza',    price: 19.90, bg: 'sand',  pack: 'bar',       label: 'jabón natural' },
  locion:         { name: 'Loción corporal',  desc: 'Hidratación ligera diaria',        cat: 'hidratacion', price: 34.90, bg: 'pink',  pack: 'tall',      label: 'hidratación' },
  aceite:         { name: 'Aceite corporal',  desc: 'Hidratación intensa y brillo',     cat: 'nutricion',   price: 44.90, bg: 'peach', pack: 'oil',       label: 'aceite' },
  manteca:        { name: 'Manteca corporal', desc: 'Nutrición profunda',               cat: 'nutricion',   price: 39.90, bg: 'green', pack: 'jarpack',   label: 'nutrición' },
  shampoo:        { name: 'Shampoo',          desc: 'Limpieza para tu tipo de cabello', cat: 'cabello',     price: 32.90, bg: 'mist',  pack: 'hair',      label: 'shampoo' },
  acondicionador: { name: 'Acondicionador',   desc: 'Suavidad y desenredo',             cat: 'cabello',     price: 32.90, bg: 'lilac', pack: 'hair cond', label: 'acondicionador' }
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

// ===== Catálogo dinámico =====
function renderCatalog() {
  $('productGrid').innerHTML = Object.entries(products).map(([id, p]) => `
    <article class="card" data-cat="${p.cat}">
      <div class="product-image ${p.bg}"><div class="pack ${p.pack}">MUNA<small>${p.label}</small></div></div>
      <div class="card-row"><h3>${p.name}</h3><span class="price">${money(p.price)}</span></div>
      <p>${p.desc}</p>
      <button class="add" data-id="${id}">Agregar a la bolsa</button>
    </article>`).join('');
}
$('productGrid').addEventListener('click', e => {
  const b = e.target.closest('.add');
  if (!b) return;
  addToCart(b.dataset.id);
  renderCart();
  toast(products[b.dataset.id].name + ' agregado a tu bolsa');
});

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

// ===== Cuestionario de rutina (8 preguntas, paso a paso) =====
const questions = [
  { id: 'piel', q: '¿Cómo sientes tu piel la mayor parte del tiempo?', opts: [
    ['seca', 'Seca o tirante'], ['normal', 'Normal, sin molestias'], ['grasa', 'Grasa o con brillo'], ['sensible', 'Sensible, se irrita fácilmente']] },
  { id: 'meta', q: '¿Qué te gustaría lograr principalmente?', opts: [
    ['limpieza', 'Sentirme limpia y fresca'], ['hidratacion', 'Mantener mi piel hidratada'], ['nutricion', 'Suavidad y nutrición profunda'], ['relajo', 'Relajarme y tener un momento para mí']] },
  { id: 'cabello', q: '¿Cómo describirías tu cabello?', opts: [
    ['seco', 'Seco, maltratado o teñido'], ['graso', 'Graso, se ensucia rápido'], ['normal', 'Normal'], ['rizado', 'Rizado u ondulado'], ['no', 'No busco productos para el cabello']] },
  { id: 'aroma', q: '¿Qué aromas prefieres?', opts: [
    ['floral', 'Floral y delicado'], ['fresco', 'Fresco y cítrico'], ['dulce', 'Dulce y cálido'], ['neutro', 'Suave o sin aroma']] },
  { id: 'textura', q: '¿Qué textura disfrutas más en la piel?', opts: [
    ['ligera', 'Ligera, que se absorba rápido'], ['cremosa', 'Cremosa y envolvente'], ['oleosa', 'Oleosa, tipo aceite']] },
  { id: 'tiempo', q: '¿Cuánto tiempo le dedicas a tu rutina?', opts: [
    ['rapida', '5 minutos, algo rápido'], ['media', 'Entre 10 y 15 minutos'], ['ritual', 'Me encanta un ritual completo']] },
  { id: 'eco', q: '¿Prefieres opciones con menos plástico?', opts: [
    ['si', 'Sí, prefiero opciones eco (en barra)'], ['igual', 'Me da igual, prefiero lo práctico']] },
  { id: 'presupuesto', q: '¿Cuál es tu presupuesto aproximado?', opts: [
    ['60', 'Hasta S/ 60'], ['120', 'Entre S/ 60 y S/ 120'], ['999', 'Más de S/ 120']] }
];
const answers = {};
let quizStep = 0;

function renderQuiz() {
  $('quizSteps').innerHTML = questions.map((qq, i) => `
    <fieldset class="quiz-step" data-step="${i}" ${i ? 'hidden' : ''}>
      <legend>${qq.q}</legend>
      ${qq.opts.map(([v, t]) => `
        <label class="opt"><input type="radio" name="${qq.id}" value="${v}"><span>${t}</span></label>`).join('')}
    </fieldset>`).join('');
  showStep(0);
}

function showStep(i) {
  quizStep = i;
  document.querySelectorAll('.quiz-step').forEach(f => { f.hidden = Number(f.dataset.step) !== i; });
  $('quizCount').textContent = `Pregunta ${i + 1} de ${questions.length}`;
  $('quizBar').style.width = `${((i + 1) / questions.length) * 100}%`;
  $('quizPrev').style.visibility = i === 0 ? 'hidden' : 'visible';
  $('quizNext').textContent = i === questions.length - 1 ? 'Ver mi rutina ✓' : 'Siguiente →';
  $('quizError').hidden = true;
}

function nextStep() {
  const qq = questions[quizStep];
  if (!answers[qq.id]) { $('quizError').hidden = false; return; }
  if (quizStep < questions.length - 1) showStep(quizStep + 1);
  else showResult();
}

$('quizSteps').addEventListener('change', e => {
  if (e.target.type !== 'radio') return;
  answers[e.target.name] = e.target.value;
  $('quizError').hidden = true;
  // En celular avanzamos solos para que sea más rápido (menos toques)
  if (quizStep < questions.length - 1) setTimeout(nextStep, 250);
});
$('quizNext').addEventListener('click', nextStep);
$('quizPrev').addEventListener('click', () => { if (quizStep > 0) showStep(quizStep - 1); });

// Lógica de recomendación: elige productos según el perfil y explica el porqué
function recommend(a) {
  const picks = [];
  const add = (id, step, order, prio, reason) => picks.push({ id, step, order, prio, reason });

  // 1. Limpieza corporal
  if (a.eco === 'si') add('jabon', 'Limpieza corporal', 1, 1, 'Prefieres opciones sin envase plástico, y limpia sin resecar.');
  else add('gel', 'Limpieza corporal', 1, 1, {
    grasa: 'Su textura fresca ayuda a retirar el exceso de grasa.',
    sensible: 'Limpieza suave, pensada para no irritar la piel sensible.',
    seca: 'Limpia con suavidad sin dejar la piel tirante.'
  }[a.piel] || 'Limpieza diaria suave y práctica.');

  // 2. Hidratación o nutrición principal
  let main;
  if (a.textura === 'oleosa' || a.meta === 'relajo') {
    main = 'aceite';
    add('aceite', 'Hidratación', 4, 2, a.meta === 'relajo' ? 'Ideal para un masaje relajante después de la ducha.' : 'Te gusta la textura oleosa y deja la piel con brillo natural.');
  } else if (a.piel === 'seca' || a.meta === 'nutricion' || (a.textura === 'cremosa' && a.piel !== 'grasa')) {
    main = 'manteca';
    add('manteca', 'Nutrición', 4, 2, a.piel === 'seca' ? 'Tu piel es seca: la manteca nutre en profundidad y calma la tirantez.' : 'Textura cremosa que deja la piel suave por más tiempo.');
  } else {
    main = 'locion';
    add('locion', 'Hidratación', 4, 2, {
      grasa: 'Hidrata sin sensación pesada ni brillo extra.',
      sensible: 'Hidratación ligera y sencilla para piel sensible.'
    }[a.piel] || 'Hidratación ligera que se absorbe rápido.');
  }

  // 3. Cabello
  if (a.cabello !== 'no') {
    add('shampoo', 'Lavado del cabello', 2, 3, {
      seco: 'Limpia con suavidad sin quitar la humedad del cabello.',
      graso: 'Ayuda a controlar el exceso de grasa en la raíz.',
      rizado: 'Limpia sin quitar la definición de tus rizos.',
      normal: 'Limpieza equilibrada para uso frecuente.'
    }[a.cabello]);
    if (!(a.cabello === 'graso' && a.tiempo === 'rapida')) {
      add('acondicionador', 'Acondicionado', 3, 4, {
        seco: 'Aporta suavidad y ayuda a reparar las puntas.',
        graso: 'Aplícalo solo de medios a puntas para no engrasar la raíz.',
        rizado: 'Ayuda a definir y controlar el frizz.',
        normal: 'Desenreda y deja el cabello suave.'
      }[a.cabello]);
    }
  }

  // 4. Paso extra si tiene más tiempo
  if (a.tiempo === 'ritual' || (a.tiempo === 'media' && a.piel === 'seca')) {
    const extra = main === 'aceite' ? 'manteca' : 'aceite';
    add(extra, 'Paso extra (noche)', 5, 5, 'Para tu ritual: aplícalo por la noche y potencia la hidratación mientras descansas.');
  }

  // 5. Ajuste al presupuesto (se quitan primero los pasos menos importantes)
  const limit = Number(a.presupuesto);
  // Con presupuesto ajustado, el jabón en barra rinde más y deja espacio para hidratar
  if (limit <= 60 && picks[0].id === 'gel') {
    picks[0].id = 'jabon';
    picks[0].reason = 'Opción rendidora y económica para tu presupuesto; limpia sin resecar.';
  }
  let sum = 0;
  const kept = [], left = [];
  picks.sort((x, y) => x.prio - y.prio).forEach(p => {
    const price = products[p.id].price;
    if (p.prio === 1 || sum + price <= limit) { kept.push(p); sum += price; } else left.push(p);
  });
  kept.sort((x, y) => x.order - y.order);
  return { kept, left, total: sum };
}

function showResult() {
  const a = answers;
  const { kept, left, total } = recommend(a);
  const label = (qid, v) => questions.find(q => q.id === qid).opts.find(o => o[0] === v)[1].toLowerCase();
  const perfil = { limpieza: 'Frescura diaria', hidratacion: 'Hidratación equilibrada', nutricion: 'Nutrición profunda', relajo: 'Momento de calma' }[a.meta];
  const aromaTxt = a.piel === 'sensible' && a.aroma !== 'neutro'
    ? 'Por tu piel sensible te sugerimos las versiones suaves o sin aroma.'
    : `Te sugerimos las versiones con aroma <b>${label('aroma', a.aroma)}</b>.`;

  $('quizSteps').hidden = true;
  document.querySelector('.quiz-nav').hidden = true;
  document.querySelector('.quiz-progress').hidden = true;
  $('quizCount').hidden = true;

  $('result').innerHTML = `
    <p class="eyebrow">TU PERFIL MUNA</p>
    <h3>Rutina “${perfil}”</h3>
    <p class="profile-tags"><span>Piel ${label('piel', a.piel).split(',')[0]}</span>${a.cabello !== 'no' ? `<span>Cabello ${label('cabello', a.cabello).split(',')[0]}</span>` : ''}<span>${label('tiempo', a.tiempo)}</span></p>
    <ol class="routine">
      ${kept.map((p, i) => `<li><span class="step-n">${i + 1}</span><div><small>${p.step}</small><b>${products[p.id].name}</b> · ${money(products[p.id].price)}<p>${p.reason}</p></div></li>`).join('')}
    </ol>
    <p>${aromaTxt}</p>
    ${left.length ? `<p class="budget-note">Para respetar tu presupuesto dejamos fuera: ${left.map(p => products[p.id].name).join(', ')}. Puedes agregarlo cuando quieras.</p>` : ''}
    <p class="routine-total">Total de tu rutina: <b>${money(total)}</b></p>
    <button type="button" class="btn wide" id="addRoutine">Agregar rutina a la bolsa</button>
    <a class="btn ghost wide" id="askRoutine" target="_blank" rel="noopener">Consultar esta rutina por WhatsApp</a>
    <button type="button" class="link-btn" id="restartQuiz">Volver a responder</button>
    <p class="quiz-note">Recomendación orientativa del proyecto. Si tienes alguna condición de la piel, consulta con un dermatólogo.</p>`;

  $('askRoutine').href = waLink(`Hola, MUNA. Hice el test y me salió la rutina "${perfil}": ${kept.map(p => products[p.id].name).join(', ')} (total ${money(total)}). ¿Me ayudan con mi pedido?`);
  $('addRoutine').addEventListener('click', () => {
    kept.forEach(p => addToCart(p.id));
    renderCart();
    toast('Rutina agregada a tu bolsa');
    openCart();
  });
  $('restartQuiz').addEventListener('click', () => {
    Object.keys(answers).forEach(k => delete answers[k]);
    $('result').innerHTML = '';
    $('quizSteps').hidden = false;
    document.querySelector('.quiz-nav').hidden = false;
    document.querySelector('.quiz-progress').hidden = false;
    $('quizCount').hidden = false;
    renderQuiz();
    $('personaliza').scrollIntoView({ behavior: 'smooth' });
  });
  // En celular llevamos la vista al resultado
  $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('result').focus({ preventScroll: true });
}

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
renderCatalog();
renderQuiz();
renderCart();
