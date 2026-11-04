/* MUNA — Delivery + Checkout interno (simulación, sin cobros ni backend) */
(function () {
  'use strict';
  const get = id => document.getElementById(id);
  const zoneSelect = get('district'), result = get('shipResult');
  const previewZone = get('mdZonePreview'), previewTime = get('mdTimePreview');
  const checkout = get('munaCheckout'), form = get('munaCheckoutForm'), content = get('mcCheckoutContent');
  let currentItems = [];
  let lastFocused = null;
  const safe = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const moneyLocal = n => 'S/ ' + Number(n).toFixed(2);
  function updateShippingPreview() {
    const zone = window.shippingZones && window.shippingZones[zoneSelect.value];
    // Las constantes globales de script.js no se exponen en window; usar el texto del resumen existente.
    const raw = result.textContent.trim();
    previewZone.textContent = zoneSelect.value ? zoneSelect.selectedOptions[0].textContent.trim() : 'Selecciona tu zona para consultar cobertura.';
    previewTime.textContent = raw ? raw.replace(/\s+/g,' ').slice(0,240) : 'Costos y plazos referenciales; se confirman antes del despacho.';
  }
  zoneSelect.addEventListener('change', () => setTimeout(updateShippingPreview,0));
  get('geoBtn').addEventListener('click', () => setTimeout(updateShippingPreview,1500));
  updateShippingPreview();
  const cartButton = get('deliveryToCart');
  cartButton.addEventListener('click',() => {
    // Se muestra el carrito original para no duplicar su estado.
    get('openCart').click();
  });
  function openCheckout(detail) {
    const items = detail.items || [];
    if (!items.length) return;
    currentItems = items;
    lastFocused = document.activeElement;
    form.reset();
    get('mcSuccess').hidden=true;
    content.hidden=false;
    const opts = zoneSelect.innerHTML;
    get('mcZone').innerHTML = opts;
    get('mcZone').value = detail.zone || zoneSelect.value || '';
    get('mcAddress').value = get('deliveryAddress').value.trim();
    get('mcReference').value = get('deliveryReference').value.trim();
    get('mcApartment').value = get('deliveryApartment').value.trim();
    const existingPayment = get('payMethod')?.value;
    const candidate = Array.from(get('mcPayment').options).find(o => o.value.startsWith(existingPayment || '_'));
    if (candidate) get('mcPayment').value=candidate.value;
    get('mcItems').innerHTML = items.map(i => '<div class="md-cart-item"><span>'+safe(i.name)+' × '+Number(i.quantity)+'</span><strong>'+moneyLocal(i.price*i.quantity)+'</strong></div>').join('');
    get('mcTotal').textContent=moneyLocal(items.reduce((sum,i)=>sum+i.price*i.quantity,0));
    get('mcShipping').textContent='Referencial; confirmar con MUNA';
    get('mcError').hidden=true;
    checkout.hidden=false;
    document.body.classList.add('no-scroll');
    get('mcName').focus();
    updateModalZone();
  }
  function updateModalZone(){
    const option=get('mcZone').value;
    const previous = zoneSelect.value;
    if(option && option!==previous){zoneSelect.value=option;zoneSelect.dispatchEvent(new Event('change',{bubbles:true}));}
    const text=result.textContent.trim();
    get('mcShipping').textContent = text ? text.replace(/\s+/g,' ').slice(0,115) : 'Pendiente de cotización';
  }
  get('mcZone').addEventListener('change',updateModalZone);
  function closeCheckout(){
    checkout.hidden=true;
    document.body.classList.remove('no-scroll');
    if(lastFocused && lastFocused.focus)lastFocused.focus();
  }
  document.addEventListener('muna:open-checkout',e=>openCheckout(e.detail||{}));
  get('mcClose').addEventListener('click',closeCheckout);
  checkout.addEventListener('click',e=>{if(e.target===checkout)closeCheckout();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && !checkout.hidden)closeCheckout();});
  function validate() {
    const name=get('mcName').value.trim(), phone=get('mcPhone').value.trim(), address=get('mcAddress').value.trim(), zone=get('mcZone').value;
    if(name.length<3)return 'Escribe tu nombre completo.';
    if(!/^\+?[0-9\s()-]{9,20}$/.test(phone) || phone.replace(/\D/g,'').length<9)return 'Ingresa un celular válido (al menos 9 dígitos).';
    if(!zone)return 'Elige tu zona de entrega.';
    if(address.length<7)return 'Escribe una dirección más detallada (mínimo 7 caracteres).';
    if(get('mcEmail').value && !get('mcEmail').checkValidity())return 'Verifica el formato del correo.';
    return '';
  }
  const KEY = 'muna_demo_orders_v1';
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const error=validate();
    if(error){get('mcError').textContent=error;get('mcError').hidden=false;return;}
    get('mcError').hidden=true;
    const data={
      id:'MUNA-DEMO-'+Date.now().toString(36).toUpperCase(),
      fecha:new Date().toISOString(),estado:'Solo demostración, no recibido por MUNA',
      customer:{name:get('mcName').value.trim(),phone:get('mcPhone').value.trim(),email:get('mcEmail').value.trim()},
      delivery:{zone:get('mcZone').selectedOptions[0].textContent.trim(),address:get('mcAddress').value.trim(),reference:get('mcReference').value.trim(),apartment:get('mcApartment').value.trim()},
      payment:get('mcPayment').value,
      items:currentItems.map(i=>({name:i.name,quantity:i.quantity,price:i.price})),
      total:currentItems.reduce((n,i)=>n+i.quantity*i.price,0)
    };
    // Guarda una copia únicamente en este navegador. NO representa venta ni envío a servidor.
    let saved=[];
    try{saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(saved))saved=[];}catch{}
    try{localStorage.setItem(KEY,JSON.stringify([data,...saved].slice(0,12)));}catch{}
    content.hidden=true;
    const success=get('mcSuccess');
    success.hidden=false;
    success.replaceChildren();
    const icon=document.createElement('span');icon.className='md-success-icon';icon.textContent='✓';
    const title=document.createElement('h3');title.textContent='Pedido de prueba registrado';
    const p=document.createElement('p');p.textContent='Código '+data.id+'. Esta demostración se guardó solo en tu navegador; MUNA todavía no ha recibido el pedido.';
    const details=document.createElement('div');details.className='md-success-details';
    details.textContent='Nombre: '+data.customer.name+'\nZona: '+data.delivery.zone+'\nDirección: '+data.delivery.address+(data.delivery.reference?'\nReferencia: '+data.delivery.reference:'')+'\nProductos: '+data.items.map(i=>i.name+' × '+i.quantity).join(', ')+'\nTotal productos: '+moneyLocal(data.total)+'\nEnvío: por confirmar. No se realizó ningún cobro.';
    const controls=document.createElement('div');controls.className='md-success-buttons';
    const copy=document.createElement('button');copy.type='button';copy.className='btn md-primary';copy.textContent='Copiar resumen';
    copy.addEventListener('click',()=>{const txt=details.textContent; if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>copy.textContent='Resumen copiado').catch(()=>copy.textContent='No se pudo copiar');}else copy.textContent='Copia manualmente el resumen';});
    const close=document.createElement('button');close.type='button';close.className='btn ghost';close.textContent='Volver a la tienda';close.addEventListener('click',closeCheckout);
    controls.append(copy,close);success.append(icon,title,p,details,controls);
  });
})();
