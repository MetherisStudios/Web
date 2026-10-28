/* =========================================================
   DecoArt · main.js
   ---------------------------------------------------------
   DATOS PARA CAMBIAR (todo está acá, en un solo lugar):
   - whatsapp: número con código de país, sin + ni espacios.
     Ej.: 099 905 880  ->  59899905880
   - web3formsKey: la clave que te da web3forms.com para el
     mail donde DecoArt va a recibir las consultas.
   ========================================================= */
const CONFIG = {
  whatsapp: '59899905880',
  web3formsKey: 'PEGAR_AQUI_LA_CLAVE_DE_WEB3FORMS',
  asunto: 'Nueva consulta desde la web de DecoArt'
};

/* =========================================================
   STENCILS DISPONIBLES (las frases que se pueden pedir)
   ---------------------------------------------------------
   - Para sacar o agregar una frase, editá esta lista.
   - Cuando tengas la foto del stencil, guardala en img/stencils/
     como PNG con fondo transparente (la letra en negro) y agregala así:
       { frase: 'Home sweet home', imagen: 'img/stencils/home-sweet-home.png' }
     Para el colgante de 3 tablitas, una imagen por tabla:
       { frase: 'Amar, soñar, reír', tablas: ['img/stencils/amar.png', 'img/stencils/sonar.png', 'img/stencils/reir.png'] }
     Mientras no haya imagen, la web muestra la frase con una letra stencil parecida.
   ========================================================= */
const STENCILS = [
  { frase: 'Disfruta cada momento' },
  { frase: 'Home sweet home' },
  { frase: 'Amar, soñar, reír' },
  { frase: 'Sigue creciendo' },
  { frase: 'En esta casa hay amor del bueno' },
  { frase: 'Si puedes soñarlo puedes hacerlo' },
  { frase: 'La vida no se mide en minutos, se mide en momentos' },
  { frase: 'Love' },
  { frase: 'Planta semillas de amor' },
  { frase: 'Piensa, cree, sueña y atrévete' },
  { frase: 'Eres mi persona favorita' },
  { frase: 'Aquí vive el amor' },
  { frase: 'Cargando éxito' },
  { frase: 'Colecciona momentos, no cosas' }
];

document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- WhatsApp: todos los botones usan el número de CONFIG ---------- */
function waLink(mensaje) {
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(mensaje);
}
function numeroLocal(n) {
  // 59899905880 -> 099 905 880
  let local = n.startsWith('598') ? '0' + n.slice(3) : n;
  return local.length === 9 ? local.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : local;
}
document.querySelectorAll('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); });
document.querySelectorAll('.wa-number').forEach(el => { el.textContent = numeroLocal(CONFIG.whatsapp); });

/* ---------- Pantalla de entrada (≈2 segundos) ---------- */
(function intro() {
  const el = document.getElementById('intro');
  const body = document.body;
  if (!el) return;
  const listo = () => {
    if (body.classList.contains('is-ready')) return;
    body.classList.remove('is-loading'); body.classList.add('is-ready');
    // Si se abrió con un link de diseño (#arma-tu-cartel), ir directo ahí
    const destino = location.hash && document.getElementById(location.hash.slice(1));
    if (destino) destino.scrollIntoView({ behavior: 'instant', block: 'start' });
  };

  if (reduceMotion) { el.classList.add('is-gone'); listo(); return; }

  let terminado = false;
  const cubrir = () => {
    if (terminado) return;
    terminado = true;
    el.classList.add('is-cover');
    setTimeout(() => { el.classList.add('is-reveal'); listo(); }, 420);
    setTimeout(() => { el.classList.add('is-gone'); }, 1000);
  };
  const t = setTimeout(cubrir, 1500);
  el.addEventListener('click', () => { clearTimeout(t); cubrir(); });
  // Por si algo falla, nunca dejar la web bloqueada
  setTimeout(() => { el.classList.add('is-gone'); listo(); }, 4500);
})();

/* ---------- Pinceladas de los títulos al aparecer ---------- */
(function pinceladas() {
  const items = document.querySelectorAll('.paint');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach(i => i.classList.add('is-painted'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-painted'); io.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  items.forEach(i => io.observe(i));
})();

/* ---------- Menú del celular y sección activa ---------- */
(function menu() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const cerrar = () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); };
  burger.addEventListener('click', () => {
    const abierto = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(abierto));
    burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrar));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

  if (!('IntersectionObserver' in window)) return;
  const links = [...nav.querySelectorAll('a')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => io.observe(s));
})();

/* ---------- Visor de fotos de la galería ---------- */
(function visor() {
  const lb = document.getElementById('lightbox');
  const botones = [...document.querySelectorAll('.gallery [data-index]')];
  if (!lb || !botones.length) return;
  const img = lb.querySelector('img');
  const cap = lb.querySelector('figcaption');
  const fotos = botones.map(b => { const i = b.querySelector('img'); return { src: i.getAttribute('src'), alt: i.alt }; });
  let actual = 0, origen = null;

  const mostrar = n => {
    actual = (n + fotos.length) % fotos.length;
    img.src = fotos[actual].src; img.alt = fotos[actual].alt; cap.textContent = fotos[actual].alt;
    img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
  };
  const abrir = n => { origen = document.activeElement; mostrar(n); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.lightbox__close').focus(); };
  const cerrar = () => { lb.hidden = true; document.body.style.overflow = ''; if (origen) origen.focus(); };

  botones.forEach((b, i) => b.addEventListener('click', () => abrir(i)));
  lb.querySelector('.lightbox__close').addEventListener('click', cerrar);
  lb.querySelector('.lightbox__prev').addEventListener('click', () => mostrar(actual - 1));
  lb.querySelector('.lightbox__next').addEventListener('click', () => mostrar(actual + 1));
  lb.addEventListener('click', e => { if (e.target === lb) cerrar(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') cerrar();
    if (e.key === 'ArrowLeft') mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
    if (e.key === 'Tab') { // mantener el foco dentro del visor
      const f = [...lb.querySelectorAll('button')];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  // Deslizar con el dedo en el celular
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();

/* ---------- Armá tu cartel ---------- */
(function disenador() {
  const form = document.getElementById('maker');
  const preview = document.getElementById('preview');
  const btn = document.getElementById('maker-wa');
  const cajaFrases = document.getElementById('frases');
  if (!form) return;

  const COLORES = [
    { n: 'rosa', c: '#EE7BB0' }, { n: 'amarillo', c: '#F6D04D' }, { n: 'celeste', c: '#6EC6E8' },
    { n: 'verde', c: '#8ED46A' }, { n: 'naranja', c: '#FF8A3D' }, { n: 'lila', c: '#B98BE8' },
    { n: 'turquesa', c: '#3FC1B0' }, { n: 'rojo', c: '#E2463A' }, { n: 'blanco', c: '#FFFFFF' }
  ];
  const TINTAS = [
    { n: 'negro', c: '#1F1A1C' }, { n: 'marrón', c: '#4A3226' }, { n: 'violeta', c: '#6A3FA0' },
    { n: 'fucsia', c: '#C2366F' }, { n: 'blanco', c: '#FFFFFF' }
  ];
  const FUENTE = "700 1px 'Stardos Stencil', Georgia, serif"; // la letra es siempre stencil
  const FORMAS = { cuadrado: 'Cuadrado', rectangular: 'Rectangular', redondo: 'Redondo', colgante: 'Colgante de 3 tablitas' };
  const FONDOS = { pinceladas: 'Pinceladas', franjas: 'Franjas', liso: 'Un solo color' };

  let elegidos = ['rosa', 'amarillo', 'celeste'];
  let tinta = 'negro';
  let actual = 0;            // índice del stencil elegido en STENCILS
  let formaAnterior = null;
  let estado = null;         // lo que eligió la persona, para el link y la imagen

  const hex = n => COLORES.find(c => c.n === n).c;
  const lista = arr => arr.length === 1 ? arr[0] : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
  const escapar = s => s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  /* --- Botones: frases (stencils), colores y color de letra --- */
  STENCILS.forEach((s, i) => {
    const l = document.createElement('label');
    l.innerHTML = `<input type="radio" name="frase" value="${i}"${i === 0 ? ' checked' : ''}><span>${escapar(s.frase)}</span>`;
    cajaFrases.appendChild(l);
  });

  const sw = document.getElementById('swatches');
  COLORES.forEach(col => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'swatch'; b.style.setProperty('--c', col.c);
    b.dataset.color = col.n; b.setAttribute('aria-label', 'Color ' + col.n); b.title = col.n;
    b.addEventListener('click', () => {
      if (elegidos.includes(col.n)) {
        if (elegidos.length > 1) elegidos = elegidos.filter(x => x !== col.n);
      } else {
        if (elegidos.length >= 3) elegidos.shift();
        elegidos.push(col.n);
      }
      dibujar();
    });
    sw.appendChild(b);
  });
  const ik = document.getElementById('inks');
  TINTAS.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ink'; b.style.setProperty('--c', t.c);
    b.dataset.ink = t.n; b.setAttribute('aria-label', 'Letra color ' + t.n); b.title = t.n;
    b.addEventListener('click', () => { tinta = t.n; dibujar(); });
    ik.appendChild(b);
  });
  form.addEventListener('change', dibujar);

  /* --- Fondos --- */
  function fondoCSS(tipo, cols) {
    const c = cols.map(hex);
    if (tipo === 'liso') return c[0];
    if (tipo === 'franjas') {
      const n = 6, paso = 100 / n, partes = [];
      for (let i = 0; i < n; i++) partes.push(`${c[i % c.length]} ${(i * paso).toFixed(2)}% ${((i + 1) * paso).toFixed(2)}%`);
      return `linear-gradient(90deg, ${partes.join(', ')})`;
    }
    const ini = 12, fin = 88, paso = (fin - ini) / c.length, partes = [`transparent 0 ${ini}%`];
    c.forEach((col, i) => partes.push(`${col} ${(ini + i * paso).toFixed(1)}% ${(ini + (i + 1) * paso).toFixed(1)}%`));
    partes.push(`transparent ${fin}%`);
    return `linear-gradient(122deg, ${partes.join(', ')}), #F5F0E8`;
  }
  function fondoTabla(i) {
    const unColor = [elegidos[i % elegidos.length]];
    if (estado.fondo === 'pinceladas') return `linear-gradient(100deg, transparent 0 8%, ${hex(unColor[0])} 8% 92%, transparent 92%), #F5F0E8`;
    return fondoCSS(estado.fondo, estado.fondo === 'franjas' ? elegidos : unColor);
  }

  function partirEnTablas(texto) {
    if (/,/.test(texto)) {
      const p = texto.split(',').map(s => s.trim()).filter(Boolean);
      if (p.length >= 2 && p.length <= 3) return p;
    }
    const pal = texto.split(/\s+/).filter(Boolean);
    if (pal.length <= 3) return pal;
    const total = texto.length, grupos = [[], [], []];
    let g = 0, acum = 0;
    pal.forEach((w, i) => {
      const restantes = pal.length - i;
      if (g < 2 && acum >= total * (g + 1) / 3 - w.length / 2 && grupos[g].length && restantes > 2 - g) g++;
      grupos[g].push(w); acum += w.length + 1;
    });
    return grupos.filter(x => x.length).map(x => x.join(' '));
  }

  /* Qué va en cada tabla: la imagen del stencil si está cargada, si no el texto */
  function contenidoTablas() {
    const s = STENCILS[actual];
    if (estado.forma === 'colgante') {
      if (s.tablas && s.tablas.length) return s.tablas.map(src => ({ imagen: src }));
      return partirEnTablas(s.frase).map(t => ({ texto: t }));
    }
    return [s.imagen ? { imagen: s.imagen } : { texto: s.frase }];
  }

  /* --- Vista previa --- */
  function tablaHTML(clase, fondo, cont, colorTinta) {
    const dentro = cont.imagen
      ? `<div class="board__stencil" style="-webkit-mask-image:url('${cont.imagen}');mask-image:url('${cont.imagen}');background:${colorTinta}"></div>`
      : `<div class="board__text" style="font:${FUENTE};color:${colorTinta};${tinta === 'blanco' ? 'text-shadow:0 1px 2px rgba(0,0,0,.25);' : ''}">${escapar(cont.texto)}</div>`;
    return `<div class="board ${clase}"><div class="board__paint" style="background:${fondo}"></div>` +
      `<div class="board__grain"></div><span class="board__hole"></span>${dentro}</div>`;
  }

  function ajustarTexto() {
    preview.querySelectorAll('.board__text').forEach(t => {
      const b = t.parentElement, tabla = b.classList.contains('board--tabla');
      const maxH = b.clientHeight * (tabla ? 0.78 : 0.72);
      let size = Math.min(b.clientWidth * 0.2, tabla ? b.clientHeight * 0.62 : 80);
      t.style.fontSize = size + 'px';
      while (size > 10 && (t.scrollHeight > maxH || t.scrollWidth > t.clientWidth + 1)) { size -= 1; t.style.fontSize = size + 'px'; }
    });
  }

  function dibujar() {
    actual = Math.min(+(form.frase && form.frase.value) || 0, STENCILS.length - 1);
    estado = { forma: form.forma.value, fondo: form.fondo.value, tinta, colores: elegidos.slice(), frase: STENCILS[actual].frase };

    sw.querySelectorAll('.swatch').forEach(b => {
      const i = elegidos.indexOf(b.dataset.color);
      b.setAttribute('aria-pressed', String(i >= 0));
      if (i >= 0) b.dataset.n = i + 1; else delete b.dataset.n;
    });
    ik.querySelectorAll('.ink').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ink === tinta)));

    const colorTinta = TINTAS.find(t => t.n === tinta).c;
    const partes = contenidoTablas();
    let html;
    if (estado.forma === 'colgante') {
      html = '<div class="piece"><div class="tablas">' + partes.map((p, i) =>
        (i ? '<span class="link"></span>' : '') + tablaHTML('board--tabla', fondoTabla(i), p, colorTinta)).join('') + '</div></div>';
    } else {
      html = '<div class="piece">' + tablaHTML('board--' + estado.forma, fondoCSS(estado.fondo, elegidos), partes[0], colorTinta) + '</div>';
    }
    preview.innerHTML = html;
    if (formaAnterior !== null && formaAnterior !== estado.forma && !reduceMotion) preview.firstChild.classList.add('is-pop');
    formaAnterior = estado.forma;
    preview.setAttribute('aria-label', `Vista previa: cartel ${FORMAS[estado.forma].toLowerCase()}, fondo ${FONDOS[estado.fondo].toLowerCase()} en ${lista(elegidos)}, con la frase ${estado.frase} en ${tinta}`);
    ajustarTexto();

    const msg = 'Hola DecoArt! Quiero encargar este cartel:\n' +
      `• Frase: "${estado.frase}"\n` +
      `• Forma: ${FORMAS[estado.forma]}\n` +
      `• Fondo: ${FONDOS[estado.fondo]} en ${lista(estado.fondo === 'liso' ? elegidos.slice(0, 1) : elegidos)}\n` +
      `• Color de letra: ${tinta}\n` +
      `Así lo armé: ${enlaceDiseno()}\n` +
      '¿Me pasan precio y tiempo de entrega?';
    btn.href = waLink(msg);
  }

  /* --- Link que abre la web con este mismo diseño --- */
  function enlaceDiseno() {
    const p = new URLSearchParams({ f: estado.forma, b: estado.fondo, c: estado.colores.join(','), i: estado.tinta, t: estado.frase });
    return location.href.split('#')[0].split('?')[0] + '?' + p.toString() + '#arma-tu-cartel';
  }
  function aplicarDesdeURL() {
    const p = new URLSearchParams(location.search);
    if (!p.has('f')) return;
    const marcar = (nombre, valor) => {
      const r = form.querySelector(`input[name="${nombre}"][value="${CSS.escape(valor || '')}"]`);
      if (r) r.checked = true;
    };
    marcar('forma', p.get('f')); marcar('fondo', p.get('b'));
    const idx = STENCILS.findIndex(s => s.frase === p.get('t'));
    if (idx >= 0) marcar('frase', String(idx));
    const cols = (p.get('c') || '').split(',').filter(n => COLORES.some(c => c.n === n)).slice(0, 3);
    if (cols.length) elegidos = cols;
    if (TINTAS.some(t => t.n === p.get('i'))) tinta = p.get('i');
  }

  /* --- Imagen del diseño (para guardar o mandar por WhatsApp) --- */
  function cargarImagen(src) {
    return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  }
  function envolverTexto(ctx, texto, anchoMax) {
    const lineas = []; let linea = '';
    texto.split(/\s+/).filter(Boolean).forEach(pal => {
      const prueba = linea ? linea + ' ' + pal : pal;
      if (ctx.measureText(prueba).width > anchoMax && linea) { lineas.push(linea); linea = pal; } else linea = prueba;
    });
    if (linea) lineas.push(linea);
    return lineas;
  }
  function textoEnCartel(ctx, texto, cx, cy, ancho, alto, color) {
    let size = Math.min(ancho * 0.22, alto * 0.62), lineas;
    for (; size > 12; size -= 2) {
      ctx.font = FUENTE.replace('1px', size + 'px');
      lineas = envolverTexto(ctx, texto, ancho);
      if (Math.max(...lineas.map(l => ctx.measureText(l).width)) <= ancho && lineas.length * size * 1.1 <= alto) break;
    }
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (color === '#FFFFFF') { ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2; }
    const y0 = cy - (lineas.length - 1) * size * 1.1 / 2;
    lineas.forEach((l, i) => ctx.fillText(l, cx, y0 + i * size * 1.1));
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  }
  async function stencilEnCartel(ctx, src, cx, cy, ancho, alto, color) {
    const im = await cargarImagen(src);
    if (!im) return;
    const k = Math.min(ancho / im.width, alto / im.height), w = im.width * k, h = im.height * k;
    const tmp = document.createElement('canvas'); tmp.width = Math.ceil(w); tmp.height = Math.ceil(h);
    const t = tmp.getContext('2d');
    t.drawImage(im, 0, 0, w, h); t.globalCompositeOperation = 'source-in'; t.fillStyle = color; t.fillRect(0, 0, w, h);
    ctx.drawImage(tmp, cx - w / 2, cy - h / 2);
  }
  function pintarFondo(ctx, x, y, w, h, tipo, cols, angulo) {
    const c = cols.map(hex), base = '#F5F0E8';
    ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
    if (tipo === 'liso') { ctx.fillStyle = c[0]; ctx.fillRect(x, y, w, h); return; }
    if (tipo === 'franjas') {
      for (let i = 0; i < 6; i++) { ctx.fillStyle = c[i % c.length]; ctx.fillRect(x + i * w / 6, y, w / 6 + 1, h); }
      return;
    }
    const a = (angulo || 122) * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
    const largo = Math.abs(w * dx) + Math.abs(h * dy), cx = x + w / 2, cy = y + h / 2;
    const g = ctx.createLinearGradient(cx - dx * largo / 2, cy - dy * largo / 2, cx + dx * largo / 2, cy + dy * largo / 2);
    const ini = angulo === 100 ? 0.08 : 0.12, fin = 1 - ini, paso = (fin - ini) / c.length;
    g.addColorStop(0, base); g.addColorStop(ini, base);
    c.forEach((col, i) => { g.addColorStop(ini + i * paso + 0.0001, col); g.addColorStop(ini + (i + 1) * paso, col); });
    g.addColorStop(fin + 0.0001, base); g.addColorStop(1, base);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  function vetas(ctx, x, y, w, h) {
    ctx.strokeStyle = 'rgba(120,90,60,.07)'; ctx.lineWidth = 1;
    for (let i = x; i < x + w; i += 6) { ctx.beginPath(); ctx.moveTo(i, y); ctx.lineTo(i + 3, y + h); ctx.stroke(); }
  }
  async function tablaEnCanvas(ctx, o) {
    const forma = () => { ctx.beginPath(); if (o.redondo) ctx.arc(o.x + o.w / 2, o.y + o.h / 2, o.w / 2, 0, Math.PI * 2); else ctx.rect(o.x, o.y, o.w, o.h); };
    ctx.save(); ctx.shadowColor = 'rgba(60,35,15,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 24;
    forma(); ctx.fillStyle = '#F5F0E8'; ctx.fill(); ctx.restore();
    ctx.save(); forma(); ctx.clip(); pintarFondo(ctx, o.x, o.y, o.w, o.h, o.fondo, o.cols, o.angulo); vetas(ctx, o.x, o.y, o.w, o.h); ctx.restore();
    ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + (o.redondo ? 26 : 20), 8, 0, Math.PI * 2); ctx.fillStyle = 'rgba(80,55,30,.55)'; ctx.fill();
    const color = TINTAS.find(t => t.n === estado.tinta).c;
    const aw = o.w * (o.redondo ? 0.7 : 0.84), ah = o.h * (o.tabla ? 0.74 : (o.redondo ? 0.62 : 0.7));
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2 + (o.tabla ? 4 : 0);
    if (o.cont.imagen) await stencilEnCartel(ctx, o.cont.imagen, cx, cy, aw, ah, color);
    else textoEnCartel(ctx, o.cont.texto, cx, cy, aw, ah, color);
  }
  function cordon(ctx, x, y1, y2) {
    ctx.save(); ctx.strokeStyle = '#A28B6C'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke(); ctx.restore();
  }

  async function generarImagen() {
    const W = 1080, H = 1350, PANEL = 300, pared = H - PANEL;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    try { await document.fonts.load(FUENTE.replace('1px', '60px')); await document.fonts.load("600 40px 'Fredoka'"); await document.fonts.load("700 30px 'Nunito'"); } catch (e) {}

    ctx.fillStyle = '#E6D2B6'; ctx.fillRect(0, 0, W, pared);
    for (let i = 0; i < W; i += 180) { ctx.fillStyle = (i / 180) % 2 ? '#E9D8C0' : '#E2CDB0'; ctx.fillRect(i, 0, 178, pared); ctx.fillStyle = '#D5BE9E'; ctx.fillRect(i + 178, 0, 2, pared); }
    const vig = ctx.createRadialGradient(W / 2, pared / 2, pared * 0.3, W / 2, pared / 2, pared * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(110,70,30,.22)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, pared);
    const clavoY = 90;
    ctx.beginPath(); ctx.arc(W / 2, clavoY, 14, 0, Math.PI * 2); ctx.fillStyle = '#7B532F'; ctx.fill();

    const partes = contenidoTablas();
    if (estado.forma === 'colgante') {
      const tw = 720, th = 160, gap = 44, total = partes.length * th + (partes.length - 1) * gap;
      let y = Math.max(clavoY + 70, (pared - total) / 2 + 30);
      cordon(ctx, W / 2, clavoY, y);
      for (let i = 0; i < partes.length; i++) {
        if (i) cordon(ctx, W / 2, y - gap, y);
        await tablaEnCanvas(ctx, {
          x: (W - tw) / 2, y, w: tw, h: th, tabla: true, cont: partes[i], fondo: estado.fondo,
          angulo: estado.fondo === 'pinceladas' ? 100 : null,
          cols: estado.fondo === 'franjas' ? estado.colores : [estado.colores[i % estado.colores.length]]
        });
        y += th + gap;
      }
    } else {
      const [w, h] = { cuadrado: [620, 620], rectangular: [520, 650], redondo: [640, 640] }[estado.forma];
      const y = Math.max(clavoY + 80, (pared - h) / 2 + 30);
      cordon(ctx, W / 2, clavoY, y + 20);
      await tablaEnCanvas(ctx, { x: (W - w) / 2, y, w, h, redondo: estado.forma === 'redondo', cont: partes[0], fondo: estado.fondo, cols: estado.colores });
    }

    ctx.fillStyle = '#FFFDF9'; ctx.fillRect(0, pared, W, PANEL);
    ['#E04A2F', '#FF8A3D', '#F6C944', '#7DC94E', '#6EC6E8', '#6E87BF', '#C062DE'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * W / 7, pared, W / 7 + 1, 10); });
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#2B2140';
    ctx.font = "600 46px 'Fredoka', sans-serif"; ctx.fillText('Mi cartel DecoArt', 60, pared + 82);
    ctx.font = "700 30px 'Nunito', sans-serif"; ctx.fillStyle = '#5E5470';
    [`Forma: ${FORMAS[estado.forma]}`, `Fondo: ${FONDOS[estado.fondo]} en ${lista(estado.fondo === 'liso' ? estado.colores.slice(0, 1) : estado.colores)}`, `Color de letra: ${estado.tinta}`]
      .forEach((l, i) => ctx.fillText(l, 60, pared + 140 + i * 44, 720));
    const logo = await cargarImagen('img/logo-chico.webp');
    if (logo) { const lw = 200, lh = lw * logo.height / logo.width; ctx.drawImage(logo, W - lw - 50, pared + (PANEL - lh) / 2 + 6, lw, lh); }
    return new Promise(res => cv.toBlob(res, 'image/jpeg', 0.9));
  }

  const btnImg = document.getElementById('maker-img');
  if (btnImg) btnImg.addEventListener('click', async () => {
    const texto = btnImg.querySelector('span');
    texto.textContent = 'Preparando…'; btnImg.disabled = true;
    try {
      const blob = await generarImagen();
      const archivo = new File([blob], 'mi-cartel-decoart.jpg', { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [archivo] }) && matchMedia('(pointer: coarse)').matches) {
        try { await navigator.share({ files: [archivo], title: 'Mi cartel DecoArt' }); }
        catch (e) { if (e.name !== 'AbortError') throw e; }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = archivo.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
    } catch (e) {
      alert('No se pudo generar la imagen. Probá de nuevo o mandanos el pedido por WhatsApp.');
    } finally {
      texto.textContent = 'Guardar imagen'; btnImg.disabled = false;
    }
  });

  aplicarDesdeURL();
  dibujar();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarTexto);
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(ajustarTexto, 150); });
})();

/* ---------- Formulario de contacto (Web3Forms) ---------- */
(function formulario() {
  const form = document.getElementById('form-contacto');
  if (!form) return;
  const estado = document.getElementById('f-estado');
  const enviar = document.getElementById('f-enviar');
  document.getElementById('w3f-key').value = CONFIG.web3formsKey;

  const soloLetras = /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u;
  const normalizarTel = v => {
    let d = v.replace(/[\s\-().]/g, '');
    if (d.startsWith('+598')) d = d.slice(4);
    else if (d.startsWith('00598')) d = d.slice(5);
    else if (/^598\d{8}$/.test(d)) d = d.slice(3);
    if (/^9\d{7}$/.test(d)) d = '0' + d; // celular escrito sin el 0 inicial
    return d;
  };

  const reglas = {
    'f-nombre': v => !v.trim() ? 'Escribí tu nombre.'
      : v.trim().length < 2 ? 'El nombre es muy corto.'
      : !soloLetras.test(v.trim()) ? 'Usá solo letras, sin números ni símbolos.' : '',
    'f-apellido': v => !v.trim() ? 'Escribí tu apellido.'
      : v.trim().length < 2 ? 'El apellido es muy corto.'
      : !soloLetras.test(v.trim()) ? 'Usá solo letras, sin números ni símbolos.' : '',
    'f-correo': v => !v.trim() ? 'Escribí tu correo para poder responderte.'
      : !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? 'Revisá el correo, por ejemplo: nombre@gmail.com' : '',
    'f-telefono': v => {
      if (!v.trim()) return 'Escribí tu teléfono.';
      if (/[^\d\s\-+().]/.test(v)) return 'El teléfono solo puede tener números.';
      const d = normalizarTel(v);
      return /^09\d{7}$/.test(d) || /^[24]\d{7}$/.test(d) ? '' : 'Escribí un teléfono uruguayo válido, por ejemplo 099 123 456.';
    },
    'f-tipo': v => v ? '' : 'Elegí el tipo de consulta.',
    'f-mensaje': v => {
      const t = v.trim();
      if (!t) return 'Contanos qué necesitás.';
      if (t.length < 15) return 'Contanos un poco más (al menos 15 caracteres).';
      const palabras = t.split(/\s+/).filter(p => /\p{L}{2,}/u.test(p));
      if (palabras.length < 3) return 'Escribí tu consulta con algunas palabras más.';
      if (/(.)\1{5,}/.test(t)) return 'El mensaje tiene caracteres repetidos. Revisalo, por favor.';
      const letras = (t.match(/\p{L}/gu) || []).length;
      if (letras / t.replace(/\s/g, '').length < 0.6) return 'El mensaje parece no tener texto real.';
      return '';
    }
  };

  const validar = id => {
    const campo = document.getElementById(id);
    const msg = reglas[id](campo.value);
    const caja = campo.closest('.field');
    const err = document.getElementById('e-' + id.slice(2));
    err.textContent = msg;
    caja.classList.toggle('is-invalid', !!msg);
    caja.classList.toggle('is-valid', !msg);
    campo.setAttribute('aria-invalid', String(!!msg));
    campo.setAttribute('aria-describedby', err.id);
    return !msg;
  };

  Object.keys(reglas).forEach(id => {
    const campo = document.getElementById(id);
    campo.addEventListener('blur', () => { if (campo.value || campo.closest('.field').classList.contains('is-invalid')) validar(id); });
    campo.addEventListener('input', () => { if (campo.closest('.field').classList.contains('is-invalid')) validar(id); });
    campo.addEventListener('change', () => { if (id === 'f-tipo') validar(id); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    estado.textContent = ''; estado.className = 'form__status';
    const ids = Object.keys(reglas);
    const ok = ids.map(validar).every(Boolean);
    if (!ok) {
      const primero = form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');
      if (primero) primero.focus();
      return;
    }
    if (form.botcheck.checked) return; // robot

    if (!CONFIG.web3formsKey || CONFIG.web3formsKey.startsWith('PEGAR')) {
      estado.textContent = 'El formulario todavía no está conectado. Mientras tanto, escribinos por WhatsApp.';
      estado.classList.add('is-err');
      return;
    }

    const datos = {
      access_key: CONFIG.web3formsKey,
      subject: CONFIG.asunto,
      from_name: 'Web de DecoArt',
      replyto: form['Correo electrónico'].value.trim(),
      'Nombre': form['Nombre'].value.trim(),
      'Apellido': form['Apellido'].value.trim(),
      'Correo electrónico': form['Correo electrónico'].value.trim(),
      'Teléfono': form['Teléfono'].value.trim(),
      'Tipo de consulta': form['Tipo de consulta'].value,
      'Mensaje': form['Mensaje'].value.trim()
    };

    enviar.disabled = true;
    enviar.querySelector('span').textContent = 'Enviando…';
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(datos)
      });
      const j = await r.json();
      if (r.ok && j.success) {
        estado.textContent = '¡Gracias! Recibimos tu consulta y te vamos a responder pronto.';
        estado.classList.add('is-ok');
        form.reset();
        form.querySelectorAll('.field').forEach(f => f.classList.remove('is-valid', 'is-invalid'));
      } else {
        throw new Error(j.message || 'error');
      }
    } catch (err) {
      estado.textContent = 'No se pudo enviar. Probá de nuevo en un rato o escribinos por WhatsApp.';
      estado.classList.add('is-err');
    } finally {
      enviar.disabled = false;
      enviar.querySelector('span').textContent = 'Enviar consulta';
    }
  });
})();

document.getElementById('anio').textContent = new Date().getFullYear();
