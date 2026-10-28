/* ==========================================================
   CONFIGURACIÓN — lo único que hay que tocar para cambiar
   el WhatsApp, el mail o el formulario.
   ========================================================== */
const CONFIG = {
  comercio: "Almacén El Trigal",

  // Número de WhatsApp con código de país, sin + ni espacios (ej.: 59899123456)
  whatsapp: "59898100017", // número de Metheris Studios (demo)

  // Mail que se muestra en la sección de contacto
  mail: "metherisstudios@gmail.com",

  // Clave de Web3Forms (las consultas llegan al mail con el que se creó la clave)
  web3formsClave: "31bd8c3d-df41-4206-a1cd-f258cb680201",

  // Texto que va al principio de cada mensaje de WhatsApp (en una web real se deja vacío: "")
  prefijoMensaje: "[Demo Almacén El Trigal]",

  // Horarios: 0 = domingo, 1 = lunes ... 6 = sábado. Cada día, una lista de tramos ["desde", "hasta"].
  horarios: {
    0: [["09:00", "13:00"]],
    1: [["08:00", "13:00"], ["16:00", "21:00"]],
    2: [["08:00", "13:00"], ["16:00", "21:00"]],
    3: [["08:00", "13:00"], ["16:00", "21:00"]],
    4: [["08:00", "13:00"], ["16:00", "21:00"]],
    5: [["08:00", "13:00"], ["16:00", "21:00"]],
    6: [["08:00", "13:00"], ["16:00", "21:00"]],
  },
};

/* ==========================================================
   Funciones comunes (no hace falta tocar nada de acá abajo)
   ========================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Arma el link de WhatsApp con el mensaje ya escrito. */
function linkWhatsApp(mensaje) {
  const numero = String(CONFIG.whatsapp).replace(/\D/g, "");
  const texto = CONFIG.prefijoMensaje ? CONFIG.prefijoMensaje + " " + mensaje : mensaje;
  return "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
}

function abrirWhatsApp(mensaje) {
  window.open(linkWhatsApp(mensaje), "_blank", "noopener");
}

/* ---------- Pantalla de entrada (2 segundos) ---------- */
function iniciarIntro() {
  const intro = $(".intro");
  if (!intro) return;
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    intro.classList.add("is-done");
    document.body.style.overflow = "";
  }, 2000);
}

/* ---------- Links de WhatsApp (data-wa="mensaje") ---------- */
function iniciarLinksWhatsApp() {
  $$("[data-wa]").forEach((a) => {
    a.href = linkWhatsApp(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-tel]").forEach((a) => {
    a.href = "tel:+" + String(CONFIG.whatsapp).replace(/\D/g, "");
  });
  $$("[data-tel-texto]").forEach((el) => { el.textContent = formatearTelefono(CONFIG.whatsapp); });
  $$("[data-mail]").forEach((a) => {
    a.href = "mailto:" + CONFIG.mail;
    if (!a.children.length) a.textContent = CONFIG.mail;
  });
  $$("[data-mail-texto]").forEach((el) => { el.textContent = CONFIG.mail; });
}

function formatearTelefono(num) {
  const d = String(num).replace(/\D/g, "");
  // Uruguay: 598 9X XXX XXX
  if (d.startsWith("598") && d.length === 11) {
    return "0" + d.slice(3, 5) + " " + d.slice(5, 8) + " " + d.slice(8);
  }
  return "+" + d;
}

/* ---------- Header y menú ---------- */
function iniciarHeader() {
  const header = $(".header");
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const abierto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!abierto));
      nav.classList.toggle("is-open", !abierto);
    });
    $$("a", nav).forEach((a) =>
      a.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      })
    );
  }
}

/* ---------- Aparición suave ---------- */
function iniciarReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => obs.observe(el));
}

/* ---------- Horarios: marca el día de hoy y si está abierto ---------- */
function iniciarHorarios() {
  const lista = $("[data-horarios]");
  if (!lista || !CONFIG.horarios) return;
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const ahora = new Date();
  const hoy = ahora.getDay();
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();

  lista.innerHTML = orden
    .map((d) => {
      const tramos = CONFIG.horarios[d];
      const texto = tramos && tramos.length ? tramos.map((t) => t[0] + " a " + t[1]).join(" y ") : "Cerrado";
      return '<li class="' + (d === hoy ? "is-today" : "") + '"><span>' + dias[d] + "</span><span>" + texto + "</span></li>";
    })
    .join("");

  const estado = $("[data-estado]");
  if (!estado) return;
  const aMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const tramosHoy = CONFIG.horarios[hoy] || [];
  const abierto = tramosHoy.some((t) => {
    const ini = aMin(t[0]);
    let fin = aMin(t[1]);
    if (fin <= ini) fin += 24 * 60; // cierra después de medianoche
    return minutos >= ini && minutos < fin;
  });
  estado.textContent = abierto ? "Abierto ahora" : "Cerrado en este momento";
  estado.classList.add(abierto ? "is-open" : "is-closed");
}

/* ---------- Formulario con validación + Web3Forms ---------- */
const REGLAS = {
  nombre: (v) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{2,40}$/.test(v.trim()) && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/.test(v) ? "" : "Escribí tu nombre solo con letras (mínimo 2).",
  apellido: (v) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{2,40}$/.test(v.trim()) && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/.test(v) ? "" : "Escribí tu apellido solo con letras (mínimo 2).",
  correo: (v) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim()) ? "" : "Ingresá un correo válido, por ejemplo nombre@gmail.com.",
  telefono: (v) => {
    const t = v.replace(/[\s\-().]/g, "");
    const uy = /^(09\d{7}|9\d{7}|2\d{7}|4\d{7}|\+5989\d{7}|\+598[24]\d{7})$/;
    const intl = /^\+(?!598)\d{8,15}$/;
    return uy.test(t) || intl.test(t) ? "" : "Ingresá un teléfono válido, por ejemplo 099 123 456.";
  },
  tipo: (v) => (v ? "" : "Elegí el tipo de consulta."),
  mensaje: (v) => {
    const t = v.trim();
    if (t.length < 15) return "Contanos un poco más (mínimo 15 caracteres).";
    if (t.split(/\s+/).filter((p) => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/.test(p)).length < 3) return "Escribí tu consulta con al menos tres palabras.";
    if (/(.)\1{5,}/.test(t)) return "El mensaje parece no tener sentido. Revisalo, por favor.";
    return "";
  },
};

function iniciarFormulario() {
  const form = $("#form-contacto");
  if (!form) return;
  const estado = $(".form__status", form);
  const boton = $("button[type=submit]", form);

  const validarCampo = (input) => {
    const regla = REGLAS[input.dataset.regla];
    if (!regla) return true;
    const error = regla(input.value);
    const field = input.closest(".field");
    field.classList.toggle("has-error", !!error);
    $(".field__error", field).textContent = error;
    input.setAttribute("aria-invalid", error ? "true" : "false");
    return !error;
  };

  $$("[data-regla]", form).forEach((input) => {
    input.addEventListener("blur", () => validarCampo(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("has-error")) validarCampo(input);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    estado.className = "form__status";
    const campos = $$("[data-regla]", form);
    const validos = campos.map(validarCampo);
    if (validos.includes(false)) {
      const primero = campos[validos.indexOf(false)];
      primero.focus();
      return;
    }
    if (form.querySelector(".hp input").checked) return; // anti-spam

    if (!CONFIG.web3formsClave || CONFIG.web3formsClave.startsWith("PEGAR")) {
      estado.textContent = "Este formulario todavía no tiene la clave de Web3Forms configurada. Mientras tanto, escribinos por WhatsApp.";
      estado.className = "form__status is-error";
      return;
    }

    const datos = new FormData(form);
    const payload = {
      access_key: CONFIG.web3formsClave,
      subject: "Nueva consulta desde la web de " + CONFIG.comercio,
      from_name: CONFIG.comercio + " (web)",
      replyto: datos.get("Correo electrónico"),
      "Nombre": datos.get("Nombre"),
      "Apellido": datos.get("Apellido"),
      "Correo electrónico": datos.get("Correo electrónico"),
      "Teléfono": datos.get("Teléfono"),
      "Tipo de consulta": datos.get("Tipo de consulta"),
      "Mensaje": datos.get("Mensaje"),
    };

    boton.disabled = true;
    const textoBoton = boton.textContent;
    boton.textContent = "Enviando…";
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        form.reset();
        estado.textContent = "¡Listo! Recibimos tu consulta y te respondemos a la brevedad.";
        estado.className = "form__status is-ok";
      } else {
        throw new Error(json.message || "Error");
      }
    } catch (err) {
      estado.textContent = "No pudimos enviar el mensaje. Probá de nuevo en unos minutos o escribinos por WhatsApp.";
      estado.className = "form__status is-error";
    } finally {
      boton.disabled = false;
      boton.textContent = textoBoton;
    }
  });
}

/* ---------- Pestañas genéricas ---------- */
function iniciarTabs(contenedor, onChange) {
  const tabs = $$(".tab", contenedor);
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      onChange(tab.dataset.tab);
    })
  );
}

function formatearPesos(n) {
  return "$ " + n.toLocaleString("es-UY");
}

function escaparHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarIntro();
  iniciarLinksWhatsApp();
  iniciarHeader();
  iniciarHorarios();
  iniciarFormulario();
  if (typeof iniciarComercio === "function") iniciarComercio();
  iniciarReveal();
  const anio = $("[data-anio]");
  if (anio) anio.textContent = new Date().getFullYear();
});

/* ==========================================================
   Almacén El Trigal — zonas de envío y lista de compras
   ========================================================== */

const ZONAS = {
  "Salinas": { llega: true, dias: "Todos los días", horario: "Pedidos hasta las 19:00 llegan en el día", costo: "Sin cargo desde $ 1.500" },
  "Marindia": { llega: true, dias: "Todos los días", horario: "Pedidos hasta las 19:00 llegan en el día", costo: "$ 80 · sin cargo desde $ 2.000" },
  "Neptunia": { llega: true, dias: "Todos los días", horario: "Pedidos hasta las 18:00 llegan en el día", costo: "$ 80 · sin cargo desde $ 2.000" },
  "Pinamar": { llega: true, dias: "Todos los días", horario: "Pedidos hasta las 18:00 llegan en el día", costo: "$ 100 · sin cargo desde $ 2.500" },
  "Atlántida": { llega: true, dias: "Martes, jueves y sábados", horario: "Entregas de 16:00 a 20:00", costo: "$ 150" },
  "Parque del Plata": { llega: true, dias: "Martes, jueves y sábados", horario: "Entregas de 16:00 a 20:00", costo: "$ 150" },
  "Otra zona": { llega: false },
};

const PRODUCTOS = {
  almacen: ["Arroz", "Fideos", "Harina", "Azúcar", "Yerba", "Aceite", "Sal", "Café", "Galletitas", "Puré de tomate", "Lentejas", "Atún"],
  frescos: ["Leche", "Pan", "Huevos", "Manteca", "Yogur", "Queso crema", "Papas", "Cebolla", "Tomates", "Bananas", "Manzanas", "Lechuga"],
  fiambreria: ["Jamón cocido", "Queso de sándwich", "Salame", "Mortadela", "Queso rallado", "Paleta"],
  limpieza: ["Detergente", "Lavandina", "Jabón en polvo", "Papel higiénico", "Rollo de cocina", "Esponjas"],
};

const lista = []; // { nombre, cantidad }
let zonaElegida = "";
let pago = "Efectivo";
let categoria = "almacen";

function iniciarZonas() {
  const cont = $("[data-zonas]");
  cont.innerHTML = Object.keys(ZONAS)
    .map((z) => '<button class="choice" type="button" aria-pressed="false" data-zona="' + z + '">' + z + "</button>")
    .join("");

  cont.addEventListener("click", (e) => {
    const b = e.target.closest("[data-zona]");
    if (!b) return;
    zonaElegida = b.dataset.zona;
    $$("[data-zona]", cont).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const z = ZONAS[zonaElegida];
    const res = $("[data-zona-resultado]");
    if (z.llega) {
      res.innerHTML =
        '<div class="zone-result__body">' +
        '<span class="zone-result__badge is-yes">✓ Llegamos a ' + escaparHTML(zonaElegida) + "</span>" +
        "<h3>" + escaparHTML(z.dias) + "</h3>" +
        "<dl><dt>Entrega</dt><dd>" + escaparHTML(z.horario) + "</dd><dt>Envío</dt><dd>" + escaparHTML(z.costo) + "</dd></dl>" +
        "<small>El costo te lo confirmamos junto con el total del pedido.</small>" +
        '<a class="btn btn--accent" href="#lista">Armar mi lista</a></div>';
    } else {
      res.innerHTML =
        '<div class="zone-result__body">' +
        '<span class="zone-result__badge is-maybe">Lo vemos con vos</span>' +
        "<h3>Escribinos y lo coordinamos</h3>" +
        "<p>Si estás fuera de estas zonas, contanos dónde estás y vemos cómo hacerte llegar el pedido.</p>" +
        '<a class="btn btn--wa" href="' + linkWhatsApp("Hola, ¿hacen envíos a mi zona? Estoy en: ") + '" target="_blank" rel="noopener">Consultar por WhatsApp</a></div>';
    }
    $("[data-zona-nota]").textContent = "Barrio: " + zonaElegida + (z.llega ? " · " + z.dias.toLowerCase() : "");
  });
}

function dibujarProductos() {
  const cont = $("[data-productos]");
  cont.innerHTML = PRODUCTOS[categoria]
    .map((p, i) => {
      const esta = lista.some((x) => x.nombre === p);
      return '<button type="button" class="product' + (esta ? " is-added" : "") + '" data-producto="' + p + '" style="animation-delay:' + i * 25 + 'ms"><span class="plus">' + (esta ? "✓" : "+") + "</span>" + p + "</button>";
    })
    .join("");
}

function dibujarLista() {
  const ul = $("[data-lista]");
  if (!lista.length) {
    ul.innerHTML = '<li class="basket__empty">Todavía está vacía. Tocá un producto para sumarlo.</li>';
  } else {
    ul.innerHTML = lista
      .map(
        (it, i) =>
          "<li><span>" + escaparHTML(it.nombre) + '</span><span class="mini-qty" data-i="' + i + '">' +
          '<button type="button" data-q="-1" aria-label="Menos ' + escaparHTML(it.nombre) + '">−</button>' +
          "<output>" + it.cantidad + "</output>" +
          '<button type="button" data-q="1" aria-label="Más ' + escaparHTML(it.nombre) + '">+</button></span></li>'
      )
      .join("");
  }
  $("[data-enviar-lista]").disabled = !lista.length;
  $("[data-vaciar]").hidden = !lista.length;
  dibujarProductos();
}

function agregar(nombre) {
  const existente = lista.find((x) => x.nombre.toLowerCase() === nombre.toLowerCase());
  if (existente) existente.cantidad = Math.min(existente.cantidad + 1, 50);
  else lista.push({ nombre, cantidad: 1 });
  dibujarLista();
}

function iniciarLista() {
  iniciarTabs($(".shop__catalog"), (cat) => { categoria = cat; dibujarProductos(); });
  dibujarProductos();

  $("[data-productos]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-producto]");
    if (b) agregar(b.dataset.producto);
  });

  $("[data-agregar]").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#l-otro");
    const v = input.value.trim();
    if (v.length < 2 || !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/.test(v)) { input.focus(); return; }
    agregar(v);
    input.value = "";
  });

  $("[data-lista]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-q]");
    if (!b) return;
    const i = Number(b.closest("[data-i]").dataset.i);
    lista[i].cantidad += Number(b.dataset.q);
    if (lista[i].cantidad <= 0) lista.splice(i, 1);
    dibujarLista();
  });

  $("[data-vaciar]").addEventListener("click", () => { lista.length = 0; dibujarLista(); });

  $$("[data-pago]").forEach((b) =>
    b.addEventListener("click", () => {
      pago = b.dataset.pago;
      $$("[data-pago]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    })
  );

  const error = (input, texto) => {
    const field = input.closest(".field");
    field.classList.toggle("has-error", !!texto);
    $(".field__error", field).textContent = texto || "";
    return !texto;
  };

  $("[data-enviar-lista]").addEventListener("click", () => {
    const nombre = $("#l-nombre");
    const dir = $("#l-direccion");
    const okN = error(nombre, /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{2,40}$/.test(nombre.value.trim()) ? "" : "Escribí tu nombre solo con letras.");
    const okD = error(dir, dir.value.trim().length >= 6 ? "" : "Escribí la dirección de entrega.");
    if (!okN) { nombre.focus(); return; }
    if (!okD) { dir.focus(); return; }
    const msj =
      "Hola, soy " + nombre.value.trim() + ". Quiero hacer este pedido:\n" +
      lista.map((it) => "• " + it.cantidad + " × " + it.nombre).join("\n") +
      "\n\nDirección: " + dir.value.trim() +
      (zonaElegida ? "\nBarrio: " + zonaElegida : "") +
      "\nPago: " + pago.toLowerCase() +
      "\n\n¿Me confirman el total y el horario de entrega?";
    abrirWhatsApp(msj);
  });
}

function iniciarComercio() {
  iniciarZonas();
  iniciarLista();
}
