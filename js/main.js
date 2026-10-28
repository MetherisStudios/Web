/* Metheris Studios — interacción global */
(function () {
  'use strict';

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── Traducciones (EN). El español sale del HTML. ───────── */
  var EN = {
    'intro.skip': 'skip_',
    'nav.home': 'Home', 'nav.services': 'Services', 'nav.about': 'About', 'nav.contact': 'Contact', 'nav.menu': 'menu_',
    'hero.meta1': '// studios — web design & development',
    'hero.meta2': '<b>landing pages</b> · catalogs · custom tools',
    'band.tag': '// landing pages for businesses',
    'band.h1': 'Get found. Get chosen.',
    'band.p': 'Fast landing pages: built in no time and loading instantly. Customers find you, understand what you offer and message you on WhatsApp.',
    'cta.packages': 'See packages', 'cta.wa': 'Message us on WhatsApp', 'cta.wa2': "Let's talk on WhatsApp", 'cta.form': 'Go to the form',
    'plans.tag': '// packages',
    'plans.h2': 'Pick what your project needs.',
    'plans.lead': 'Three starting points with a fixed price. You pay once for the website and choose whether you want monthly maintenance.',
    'plan1.kicker': 'to get started', 'plan1.f1': 'One page with your business, photos and information', 'plan1.f2': 'Contact via WhatsApp and a form to your email', 'plan1.f3': 'Built to look perfect on mobile',
    'plan2.badge': 'recommended', 'plan2.kicker': 'to sell more', 'plan2.f1': 'Everything in Basic', 'plan2.f2': 'One custom interactive tool: financing calculator, quote builder or booking system', 'plan2.f3': 'Several WhatsApp buttons with custom messages', 'plan2.f4': 'Style and design made to order',
    'plan3.kicker': 'with catalog', 'plan3.f1': 'Everything in Standard', 'plan3.f2': 'Product catalog with orders straight to WhatsApp', 'plan3.f3': 'Any extra features you need, always within a landing page',
    'plan.go': 'see details',
    'custom.title': "Your project doesn't fit these packages?",
    'custom.p': "Tell us what you need and we'll help you plan a custom project.",
    'maint.1': 'Basic maintenance <b>25 USD/month</b>', 'maint.2': 'Plus maintenance <b>60 USD/month</b>', 'maint.3': 'One-off changes <b>15 to 40 USD</b>',
    'demos.tag': '// demos', 'demos.h2': 'See how yours could look.', 'demos.lead': 'One real project and three sample websites for fictional businesses. Open them, tap around and try them on your phone.', 'demos.go': 'View demo', 'demos.note': 'DecoArt is a real business. The names, prices and details in the other three demos are made up.', 'work1.kicker': 'real project · small business in Marindia', 'work1.f1': 'Hand-painted signs and honey candles', 'work1.f2': 'Build your sign: pick shape, background and colors, and the order goes out via WhatsApp', 'work1.go': 'View the site', 'demo1.kicker': 'grill & restaurant', 'demo1.f1': 'Menu with orders sent via WhatsApp', 'demo1.f2': 'Takeaway, delivery or table booking', 'demo2.kicker': 'car dealer', 'demo2.f1': 'Featured cars with direct inquiries', 'demo2.f2': 'Assistant that suggests the right financing', 'demo3.kicker': 'grocery with delivery', 'demo3.f1': 'Shopping list sent via WhatsApp', 'demo3.f2': 'Delivery days and cost by neighborhood',
    'process.tag': '// how we work', 'process.h2': 'From a chat to your website, live.',
    'step1.t': 'We talk', 'step1.p': 'You tell us about your business and your goals. Together we pick the package that fits.',
    'step2.t': 'We design and build', 'step2.p': 'We show you the proposal and adjust it with you until it looks the way you pictured it.',
    'step3.t': 'We launch', 'step3.p': 'We publish the site on your domain. If you want, we keep looking after it every month.',
    'studio.tag': '// the studio', 'studio.h2': 'Small studio. <span>Solid results.</span>',
    'studio.p': "We're <b>Metheris</b>, a digital studio focused on landing pages. We build them <b>fast</b>, they load <b>instantly</b> and they're made so your customers get in touch.",
    'studio.cta': 'Meet the studio',
    'final.tag': '// contact', 'final.big': 'Shall we start your website?',
    'foot.pages': 'PAGES', 'foot.plans': 'PACKAGES', 'foot.contact': 'CONTACT', 'foot.made': '// written line by line'
  };
  var TICKER = {
    es: ['landing pages', 'catálogos con pedido por WhatsApp', 'calculadoras de financiación', 'reserva de turnos', 'formularios al mail', 'webs bilingües', 'mantenimiento mensual', 'diseño a medida'],
    en: ['landing pages', 'catalogs with WhatsApp orders', 'financing calculators', 'booking systems', 'forms to your inbox', 'bilingual websites', 'monthly maintenance', 'custom design']
  };
  var EN2 = {
    'cta.ask': 'Ask on WhatsApp',
    'sv.tag': '// services', 'sv.word': 'services',
    'sv.lead': 'Fast landing pages with fixed prices and no surprises. You pay for the website once and choose whether we keep looking after it every month.',
    'sv.once': 'USD · one-time',
    'sv.b.for': "For businesses that don't have a website yet and need a clean, clear presence online.",
    'sv.b.cta': 'I want Basic',
    'sv.b.1': 'One page that presents your business', 'sv.b.2': 'Your photos and key info: what you do and how to find you',
    'sv.b.3': 'WhatsApp button and a form that lands in your inbox', 'sv.b.4': 'Works on phones, tablets and computers', 'sv.b.5': 'Links to your social media',
    'sv.e.kicker': 'to sell more · recommended',
    'sv.e.for': 'For businesses that want the website to help them sell, with a tool built for their industry.',
    'sv.e.cta': 'I want Standard',
    'sv.e.1': 'Everything in Basic Landing',
    'sv.e.2': '<b>One custom interactive tool.</b><br><span class="muted">For example, a financing calculator, a quote builder or a booking system.</span>',
    'sv.e.3': 'Several WhatsApp buttons with messages ready for what your customer is asking about',
    'sv.e.4': 'Style and design made to order: colors, animations and details from your brand',
    'sv.p.for': 'For businesses with products that want to show them and get orders straight on WhatsApp.',
    'sv.p.cta': 'I want Plus',
    'sv.p.1': 'Everything in Standard Landing', 'sv.p.2': 'Product catalog with photos, price and description',
    'sv.p.3': 'Order straight on WhatsApp from each product', 'sv.p.4': 'Any extra features you want, always within a landing page',
    'mt.tag': '// maintenance', 'mt.h2': 'Your website, always up to date.',
    'mt.lead': 'Choose whether we take care of your website every month, or ask for one-off changes when you need them.',
    'mt.b.for': 'for Basic and Standard', 'mt.b.name': 'Basic Maintenance', 'mt.month': 'USD/month',
    'mt.check': 'Monthly check that everything works', 'mt.b.2': 'Up to 3 changes per month',
    'mt.30': 'Changes applied within 30 hours of your request',
    'mt.p.for': 'for Plus Landing', 'mt.p.name': 'Plus Maintenance', 'mt.p.2': 'Up to 25 new catalog items per month',
    'mt.p.3': 'Unlimited removal of sold items', 'mt.p.4': 'Unlimited stock updates',
    'mt.s.for': 'no monthly plan', 'mt.s.name': 'One-off changes', 'mt.s.1': 'You only pay when you need a change', 'mt.s.2': 'The price depends on what needs to be changed',
    'mt.cta': 'Ask about maintenance',
    'ab.tag': '// about', 'ab.word': 'about us',
    'ab.lead': 'A digital studio focused on one thing: fast landing pages that get you found and get you chosen.',
    'ab.term': '<span class="t-p">$</span> metheris --about\n<span class="t-o">→</span> digital studio\n<span class="t-o">→</span> focus: landing pages\n<span class="t-o">→</span> goal: get you found and get you chosen\n\n<span class="t-p">$</span> metheris --speed\n<span class="t-o">→</span> build: <b>fast</b>\n<span class="t-o">→</span> load: <b>instant</b>\n<span class="t-o">→</span> wasted steps: <b>0</b>\n\n<span class="t-p">$</span> <span class="cur"></span>',
    'ab.who.tag': '// who we are', 'ab.who.h2': 'Small studio, big focus.',
    'ab.p1': "We build landing pages and nothing else. That focus lets us deliver them fast, without endless processes, and make them load instantly on any phone.",
    'ab.p2': "We show you the proposal, adjust it with you and publish it. Whether it's your first website or a redesign, it looks good and works from day one.",
    'ab.rules.tag': '// how we think', 'ab.rules.h2': 'Three rules we follow.',
    'ab.r1.t': 'Focused on landing pages', 'ab.r1.p': 'We do one thing and do it well: one-screen pages that present your business and lead to contact.',
    'ab.r2.t': 'Built fast', 'ab.r2.p': 'Your landing page ready in little time, without endless processes or extra meetings.',
    'ab.r3.t': 'Loads instantly', 'ab.r3.p': 'Lightweight pages that open fast on any phone, even with a weak signal.',
    'ct.tag': '// contact', 'ct.word': "let's talk", 'ct.lead': "Tell us about your project. We'll reply through the channel you choose.",
    'ct.big': 'Write to us.',
    'ct.card.p': 'WhatsApp is the fastest way. If you prefer, fill in the form and your message goes straight to our inbox.',
    'f.name': 'First name', 'f.name.ph': 'Your first name', 'f.last': 'Last name', 'f.last.ph': 'Your last name',
    'f.email': 'Email', 'f.phone': 'Phone', 'f.pkg': 'What are you interested in?', 'f.custom': 'Custom', 'f.unsure': 'Not sure yet',
    'f.msg': 'Your project', 'f.msg.ph': 'Tell us about your business and what you need', 'f.send': 'Send message'
  };
  Object.keys(EN2).forEach(function (k) { EN[k] = EN2[k]; });

  var WA_NUMBER = '59898100017';
  var WA = {
    es: {
      general: 'Hola Metheris! Quiero consultar por una web para mi negocio.',
      basica: 'Hola Metheris! Me interesa la Landing Básica (70 USD). ¿Me pasás más info?',
      estandar: 'Hola Metheris! Me interesa la Landing Estándar (120 USD). ¿Me pasás más info?',
      plus: 'Hola Metheris! Me interesa la Landing Plus con catálogo (200 USD). ¿Me pasás más info?',
      custom: 'Hola Metheris! Tengo un proyecto que no entra en los paquetes y quiero que me asesoren.',
      maint: 'Hola Metheris! Quiero consultar por el mantenimiento mensual de mi web.'
    },
    en: {
      general: "Hi Metheris! I'd like to ask about a website for my business.",
      basica: "Hi Metheris! I'm interested in the Basic Landing (70 USD). Could you send me more info?",
      estandar: "Hi Metheris! I'm interested in the Standard Landing (120 USD). Could you send me more info?",
      plus: "Hi Metheris! I'm interested in the Plus Landing with catalog (200 USD). Could you send me more info?",
      custom: "Hi Metheris! I have a project that doesn't fit the packages and I'd like some advice.",
      maint: "Hi Metheris! I'd like to ask about monthly maintenance for my website."
    }
  };
  function waLink(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
  function updateWa(lang) {
    var set = WA[lang] || WA.es;
    document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waLink(set[a.dataset.wa] || set.general); });
  }

  window.METHERIS_EN = window.METHERIS_EN || {};
  Object.keys(window.METHERIS_EN).forEach(function (k) { EN[k] = window.METHERIS_EN[k]; });

  var ES = {};
  document.querySelectorAll('[data-i18n]').forEach(function (el) { ES[el.dataset.i18n] = el.textContent; });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) { ES[el.dataset.i18nHtml] = el.innerHTML; });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { ES[el.dataset.i18nPh] = el.getAttribute('placeholder'); });

  function setLang(lang) {
    var dict = lang === 'en' ? EN : ES;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { var v = dict[el.dataset.i18n]; if (v != null) el.textContent = v; });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { var v = dict[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { var v = dict[el.dataset.i18nPh]; if (v != null) el.setAttribute('placeholder', v); });
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    fillTicker(lang);
    updateWa(lang);
    store.set('metheris-lang', lang);
    document.dispatchEvent(new CustomEvent('metheris:lang', { detail: lang }));
  }
  window.metherisLang = function () { return document.documentElement.lang === 'en' ? 'en' : 'es'; };

  function fillTicker(lang) {
    var t = document.getElementById('ticker');
    if (!t) return;
    var items = TICKER[lang] || TICKER.es;
    var html = '';
    for (var r = 0; r < 2; r++) items.forEach(function (i) { html += '<span>' + i + '</span>'; });
    t.innerHTML = html;
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });
  setLang(store.get('metheris-lang') === 'en' ? 'en' : 'es');

  /* ───────── Intro de terminal (una vez por visita) ───────── */
  var intro = document.getElementById('intro');
  if (intro) {
    var seen = store.sget('metheris-intro');
    if (seen || reduce) {
      intro.remove();
    } else {
      var typeEl = document.getElementById('intro-type');
      var subEl = document.getElementById('intro-sub');
      var word = 'metheris', sub = '// studios', i = 0, j = 0, done = false;
      var finish = function () {
        if (done) return; done = true;
        store.sset('metheris-intro', '1');
        intro.classList.add('is-out');
        setTimeout(function () { intro.remove(); }, 750);
      };
      var typeSub = function () {
        if (j <= sub.length) { subEl.textContent = sub.slice(0, j++); setTimeout(typeSub, 38); }
        else setTimeout(finish, 520);
      };
      var typeWord = function () {
        if (i <= word.length) { typeEl.textContent = word.slice(0, i++); setTimeout(typeWord, 85); }
        else setTimeout(typeSub, 180);
      };
      setTimeout(typeWord, 280);
      document.getElementById('intro-skip').addEventListener('click', finish);
      intro.addEventListener('click', finish);
      setTimeout(finish, 4200);
    }
  }

  /* ───────── Header y menú ───────── */
  var header = document.getElementById('header');
  var onScroll = function () {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    var s = document.getElementById('studio-star');
    if (s && !reduce) s.style.transform = 'rotate(' + (window.scrollY * 0.08).toFixed(2) + 'deg)';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = document.getElementById('menu-btn');
  var links = document.getElementById('nav-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ───────── Cursor estrella ───────── */
  var cur = document.getElementById('star-cursor');
  if (cur && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    var x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      cur.classList.toggle('is-hover', !!(e.target.closest && e.target.closest('a, button, input, textarea, select, label')));
    });
    (function loop() {
      cx += (x - cx) * 0.28; cy += (y - cy) * 0.28;
      cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) rotate(' + (cx * 0.15).toFixed(1) + 'deg)';
      requestAnimationFrame(loop);
    })();
  }

  /* ───────── Terminal de Nosotros: se reescribe al verla ───────── */
  var term = document.getElementById('term-body');
  if (term && !reduce && 'IntersectionObserver' in window) {
    var typing = false;
    var typeTerm = function () {
      if (typing) return; typing = true;
      var html = term.innerHTML;
      var tmp = document.createElement('div'); tmp.innerHTML = html;
      var total = tmp.textContent.length, shown = 0;
      var clip = function (node, left) {
        var out = node.cloneNode(false);
        for (var k = 0; k < node.childNodes.length && left > 0; k++) {
          var ch = node.childNodes[k];
          if (ch.nodeType === 3) { var t = ch.textContent.slice(0, left); out.appendChild(document.createTextNode(t)); left -= t.length; }
          else { var r = clip(ch, left); out.appendChild(r.node); left = r.left; }
        }
        return { node: out, left: left };
      };
      var step = function () {
        shown = Math.min(total, shown + 3);
        var r = clip(tmp, shown);
        term.innerHTML = r.node.innerHTML + (shown < total ? '<span class="cur"></span>' : '');
        if (shown < total) setTimeout(step, 22); else { term.innerHTML = html; typing = false; }
      };
      step();
    };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { typeTerm(); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(term);
    document.addEventListener('metheris:lang', function () { if (!typing) return; });
  }

  /* ───────── Formulario de contacto ─────────
     Para recibir los mensajes en tu mail, pegá tu clave de Web3Forms acá.
     Si queda vacía, el formulario arma el mensaje y abre WhatsApp. */
  var WEB3FORMS_KEY = '';

  var form = document.getElementById('contact-form');
  if (form) {
    var T = {
      es: { req: 'Completá este campo.', name: 'Usá solo letras.', email: 'Revisá el mail, parece incompleto.', phone: 'Usá solo números (mínimo 8).', msg: 'Contanos un poco más (mínimo 15 caracteres).', sending: 'Enviando…', ok: '¡Listo! Recibimos tu mensaje y te respondemos pronto.', fail: 'No se pudo enviar. Probá de nuevo o escribinos por WhatsApp.', wa: 'Abrimos WhatsApp con tu consulta lista para enviar.', waLink: 'Abrir WhatsApp' },
      en: { req: 'Please fill in this field.', name: 'Use letters only.', email: 'Check the email, it looks incomplete.', phone: 'Use numbers only (at least 8).', msg: 'Tell us a bit more (at least 15 characters).', sending: 'Sending…', ok: "Done! We got your message and we'll reply soon.", fail: "Couldn't send it. Try again or message us on WhatsApp.", wa: 'We opened WhatsApp with your message ready to send.', waLink: 'Open WhatsApp' }
    };
    var t = function () { return T[window.metherisLang()]; };
    var rules = {
      nombre: function (v) { return !v ? t().req : (/^[A-Za-zÀ-ÿÑñ' ]{2,40}$/.test(v) ? '' : t().name); },
      apellido: function (v) { return !v ? t().req : (/^[A-Za-zÀ-ÿÑñ' ]{2,40}$/.test(v) ? '' : t().name); },
      email: function (v) { return !v ? t().req : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : t().email); },
      telefono: function (v) { var d = v.replace(/[\s+\-()]/g, ''); return !v ? t().req : (/^\d{8,15}$/.test(d) ? '' : t().phone); },
      mensaje: function (v) { return v.length >= 15 ? '' : (v ? t().msg : t().req); }
    };
    var check = function (name) {
      var el = form.elements[name], v = el.value.trim(), err = rules[name](v);
      var f = el.closest('.field');
      f.classList.toggle('is-error', !!err);
      f.querySelector('.field__err').textContent = err;
      return !err;
    };
    Object.keys(rules).forEach(function (n) {
      form.elements[n].addEventListener('blur', function () { if (form.elements[n].value) check(n); });
      form.elements[n].addEventListener('input', function () { if (form.elements[n].closest('.field').classList.contains('is-error')) check(n); });
    });
    form.elements.telefono.addEventListener('input', function (e) { e.target.value = e.target.value.replace(/[^\d\s+\-()]/g, ''); });

    var status = document.getElementById('f-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      Object.keys(rules).forEach(function (n) { if (!check(n)) ok = false; });
      if (!ok) { var first = form.querySelector('.is-error input, .is-error textarea'); if (first) first.focus(); return; }
      var d = {
        nombre: form.elements.nombre.value.trim(), apellido: form.elements.apellido.value.trim(),
        email: form.elements.email.value.trim(), telefono: form.elements.telefono.value.trim(),
        paquete: (form.querySelector('input[name="paquete"]:checked') || {}).value || '-',
        mensaje: form.elements.mensaje.value.trim()
      };
      if (WEB3FORMS_KEY) {
        status.textContent = t().sending;
        fetch('https://api.web3forms.com/submit', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY, subject: 'Nueva consulta web: ' + d.nombre + ' ' + d.apellido, from_name: 'Web Metheris Studios',
            'Nombre': d.nombre, 'Apellido': d.apellido, 'Mail': d.email, 'Teléfono': d.telefono, 'Le interesa': d.paquete, 'Mensaje': d.mensaje
          })
        }).then(function (r) { return r.json(); }).then(function (r) {
          if (r.success) { status.textContent = t().ok; form.reset(); } else { status.textContent = t().fail; }
        }).catch(function () { status.textContent = t().fail; });
      } else {
        var text = (window.metherisLang() === 'en' ? 'Hi Metheris! I\'m ' : 'Hola Metheris! Soy ') + d.nombre + ' ' + d.apellido + '.\n' +
          (window.metherisLang() === 'en' ? 'Interested in: ' : 'Me interesa: ') + d.paquete + '\n\n' + d.mensaje + '\n\n' + d.email + ' · ' + d.telefono;
        var url = waLink(text);
        status.innerHTML = '';
        status.append(t().wa + ' ');
        var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = t().waLink; a.style.fontWeight = '700';
        status.append(a);
        try { window.open(url, '_blank', 'noopener'); } catch (err) {}
      }
    });
  }
})();
