/* ==========================================================
   CONFIGURACIÓN — lo único que hay que tocar para cambiar
   el WhatsApp, el mail o el formulario.
   ========================================================== */
const CONFIG = {
  comercio: "Casa Brasero",

  // Número de WhatsApp con código de país, sin + ni espacios (ej.: 59899123456)
  whatsapp: "59898100017", // número de Metheris Studios (demo)

  // Mail que se muestra en la sección de contacto
  mail: "metherisstudios@gmail.com",

  // Clave de Web3Forms (las consultas llegan al mail con el que se creó la clave)
  web3formsClave: "31bd8c3d-df41-4206-a1cd-f258cb680201",

  // Texto que va al principio de cada mensaje de WhatsApp (en una web real se deja vacío: "")
  prefijoMensaje: "[Demo Casa Brasero]",

  // Horarios: 0 = domingo, 1 = lunes ... 6 = sábado. Cada día, una lista de tramos ["desde", "hasta"].
  horarios: {
    0: [["12:00", "15:30"], ["20:00", "00:30"]],
    1: [],
    2: [["12:00", "15:30"], ["20:00", "00:30"]],
    3: [["12:00", "15:30"], ["20:00", "00:30"]],
    4: [["12:00", "15:30"], ["20:00", "00:30"]],
    5: [["12:00", "15:30"], ["20:00", "01:00"]],
    6: [["12:00", "15:30"], ["20:00", "01:00"]],
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
   Casa Brasero — carta, pedido y reservas
   ========================================================== */

const CARTA = {
  parrilla: [
    { id: "asado", nombre: "Asado de tira", desc: "Porción individual, a la leña.", precio: 690 },
    { id: "entrana", nombre: "Entraña", desc: "Jugosa, con sal parrillera.", precio: 790 },
    { id: "vacio", nombre: "Vacío", desc: "Cocción lenta, bien tierno.", precio: 720 },
    { id: "pollo", nombre: "Pollo deshuesado", desc: "Marinado con limón y ajo.", precio: 560 },
    { id: "chorizo", nombre: "Chorizo", desc: "De cerdo, artesanal.", precio: 160 },
    { id: "provoleta", nombre: "Provoleta", desc: "Con orégano y aceite de oliva.", precio: 320 },
  ],
  platos: [
    { id: "milanesa", nombre: "Milanesa napolitana", desc: "Con papas fritas.", precio: 590 },
    { id: "chivito", nombre: "Chivito al plato", desc: "Lomo, jamón, queso, huevo y ensalada rusa.", precio: 690 },
    { id: "pasta", nombre: "Pasta casera del día", desc: "Preguntá cuál tenemos hoy.", precio: 490 },
    { id: "ensalada", nombre: "Ensalada completa", desc: "Hojas verdes, tomate, huevo y zanahoria.", precio: 390 },
  ],
  guarniciones: [
    { id: "fritas", nombre: "Papas fritas", desc: "Cortadas a mano.", precio: 220 },
    { id: "mixta", nombre: "Ensalada mixta", desc: "Lechuga, tomate y cebolla.", precio: 210 },
    { id: "pure", nombre: "Puré de papas", desc: "Casero, con manteca.", precio: 200 },
    { id: "boniato", nombre: "Boniato al rescoldo", desc: "Asado entre las brasas.", precio: 230 },
  ],
  postres: [
    { id: "flan", nombre: "Flan casero", desc: "Con dulce de leche o crema.", precio: 230 },
    { id: "panqueque", nombre: "Panqueque de dulce de leche", desc: "Caramelizado con azúcar.", precio: 260 },
    { id: "helado", nombre: "Helado artesanal", desc: "Dos bochas a elección.", precio: 220 },
  ],
};

const pedido = {}; // id -> cantidad
let entrega = "retiro";
let categoriaActual = "parrilla";

function buscarPlato(id) {
  for (const cat of Object.values(CARTA)) {
    const p = cat.find((x) => x.id === id);
    if (p) return p;
  }
  return null;
}

function dibujarCarta() {
  const lista = $("[data-menu]");
  lista.innerHTML = CARTA[categoriaActual]
    .map((p, i) => {
      const cant = pedido[p.id] || 0;
      return (
        '<li class="menu-item" style="animation-delay:' + i * 40 + 'ms">' +
        "<div><h3>" + escaparHTML(p.nombre) + "</h3><p>" + escaparHTML(p.desc) + "</p></div>" +
        '<span class="menu-item__price">' + formatearPesos(p.precio) + "</span>" +
        '<div class="qty' + (cant ? "" : " is-zero") + '" data-id="' + p.id + '">' +
        '<button type="button" data-menos aria-label="Quitar ' + escaparHTML(p.nombre) + '">−</button>' +
        "<output>" + cant + "</output>" +
        '<button type="button" data-mas aria-label="Sumar ' + escaparHTML(p.nombre) + '">+</button>' +
        "</div></li>"
      );
    })
    .join("");
}

function dibujarPedido() {
  const ids = Object.keys(pedido).filter((id) => pedido[id] > 0);
  const lista = $("[data-pedido-lista]");
  let total = 0;
  let cantidad = 0;
  if (!ids.length) {
    lista.innerHTML = '<li class="order__empty">Todavía no sumaste nada. Elegí de la carta.</li>';
  } else {
    lista.innerHTML = ids
      .map((id) => {
        const p = buscarPlato(id);
        const sub = p.precio * pedido[id];
        total += sub;
        cantidad += pedido[id];
        return "<li><span><b>" + pedido[id] + "×</b>" + escaparHTML(p.nombre) + "</span><span>" + formatearPesos(sub) + "</span></li>";
      })
      .join("");
  }
  $("[data-pedido-total]").textContent = formatearPesos(total);
  $("[data-pedido-cantidad]").textContent = cantidad + (cantidad === 1 ? " ítem" : " ítems");
  $("[data-pedido-enviar]").disabled = !ids.length;
  const caja = $(".order__total");
  caja.classList.remove("is-bump");
  void caja.offsetWidth;
  caja.classList.add("is-bump");
}

function iniciarPedido() {
  iniciarTabs($(".menu"), (cat) => {
    categoriaActual = cat;
    dibujarCarta();
  });
  dibujarCarta();

  $("[data-menu]").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.closest(".qty").dataset.id;
    const actual = pedido[id] || 0;
    pedido[id] = btn.hasAttribute("data-mas") ? Math.min(actual + 1, 20) : Math.max(actual - 1, 0);
    const qty = btn.closest(".qty");
    qty.querySelector("output").textContent = pedido[id];
    qty.classList.toggle("is-zero", pedido[id] === 0);
    dibujarPedido();
  });

  $$("[data-entrega]").forEach((b) =>
    b.addEventListener("click", () => {
      entrega = b.dataset.entrega;
      $$("[data-entrega]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $("[data-direccion]").hidden = entrega !== "envio";
      if (entrega === "envio") $("#p-direccion").focus();
    })
  );

  $("[data-pedido-enviar]").addEventListener("click", () => {
    const ids = Object.keys(pedido).filter((id) => pedido[id] > 0);
    if (!ids.length) return;
    const dir = $("#p-direccion");
    if (entrega === "envio" && dir.value.trim().length < 6) {
      dir.focus();
      dir.style.borderColor = "#c2410c";
      dir.placeholder = "Escribí la dirección para el envío";
      return;
    }
    dir.style.borderColor = "";
    let total = 0;
    const lineas = ids.map((id) => {
      const p = buscarPlato(id);
      total += p.precio * pedido[id];
      return "• " + pedido[id] + " × " + p.nombre;
    });
    const msj =
      "Hola, quiero hacer este pedido:\n" + lineas.join("\n") +
      "\n\nTotal estimado: " + formatearPesos(total) +
      "\nEntrega: " + (entrega === "envio" ? "envío a " + dir.value.trim() : "retiro en el local") +
      "\n\n¿Me confirman el total y la demora?";
    abrirWhatsApp(msj);
  });
}

/* ---------- Reservas ---------- */
const HORAS_TURNO = {
  mediodia: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"],
  noche: ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"],
};

function iniciarReservas() {
  const form = $("[data-reserva]");
  const fecha = $("#r-fecha");
  const hora = $("#r-hora");
  const nombre = $("#r-nombre");
  let turno = "";
  let personas = 2;

  const hoy = new Date();
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  fecha.min = iso(hoy);
  const max = new Date(hoy);
  max.setDate(max.getDate() + 60);
  fecha.max = iso(max);

  const error = (input, texto) => {
    const field = input.closest(".field");
    field.classList.toggle("has-error", !!texto);
    $(".field__error", field).textContent = texto || "";
    return !texto;
  };

  const validarFecha = () => {
    if (!fecha.value) return error(fecha, "Elegí el día.");
    const d = new Date(fecha.value + "T12:00:00");
    if (d.getDay() === 1) return error(fecha, "Los lunes estamos cerrados. Elegí otro día.");
    if (fecha.value < fecha.min) return error(fecha, "Elegí un día de hoy en adelante.");
    return error(fecha, "");
  };
  fecha.addEventListener("change", validarFecha);

  $$("[data-turno]").forEach((b) =>
    b.addEventListener("click", () => {
      turno = b.dataset.turno;
      $$("[data-turno]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $("[data-error-turno]").textContent = "";
      hora.disabled = false;
      hora.innerHTML = '<option value="">Elegí la hora</option>' + HORAS_TURNO[turno].map((h) => "<option>" + h + "</option>").join("");
    })
  );

  $$("[data-personas]").forEach((b) =>
    b.addEventListener("click", () => {
      personas = Math.min(20, Math.max(1, personas + Number(b.dataset.personas)));
      $("[data-personas-valor]").textContent = personas;
    })
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const okFecha = validarFecha();
    const okTurno = !!turno;
    $("[data-error-turno]").textContent = okTurno ? "" : "Elegí mediodía o noche.";
    const okHora = okTurno ? error(hora, hora.value ? "" : "Elegí la hora.") : false;
    const okNombre = error(nombre, /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{2,40}$/.test(nombre.value.trim()) ? "" : "Escribí un nombre solo con letras.");
    if (!(okFecha && okTurno && okHora && okNombre)) return;

    const d = new Date(fecha.value + "T12:00:00");
    const diaTexto = d.toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" });
    const nota = $("#r-nota").value.trim();
    const msj =
      "Hola, quiero reservar una mesa:\n" +
      "• Día: " + diaTexto + "\n" +
      "• Hora: " + hora.value + "\n" +
      "• Personas: " + personas + "\n" +
      "• A nombre de: " + nombre.value.trim() +
      (nota ? "\n• Comentario: " + nota : "") +
      "\n\n¿Me confirman si hay lugar?";
    abrirWhatsApp(msj);
  });
}

function iniciarComercio() {
  iniciarPedido();
  iniciarReservas();
}
