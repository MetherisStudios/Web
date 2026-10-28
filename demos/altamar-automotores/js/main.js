/* ==========================================================
   CONFIGURACIÓN — lo único que hay que tocar para cambiar
   el WhatsApp, el mail o el formulario.
   ========================================================== */
const CONFIG = {
  comercio: "Altamar Automotores",

  // Número de WhatsApp con código de país, sin + ni espacios (ej.: 59899123456)
  whatsapp: "59898100017", // número de Metheris Studios (demo)

  // Mail que se muestra en la sección de contacto
  mail: "metherisstudios@gmail.com",

  // Clave de Web3Forms (las consultas llegan al mail con el que se creó la clave)
  web3formsClave: "31bd8c3d-df41-4206-a1cd-f258cb680201",

  // Texto que va al principio de cada mensaje de WhatsApp (en una web real se deja vacío: "")
  prefijoMensaje: "[Demo Altamar Automotores]",

  // Horarios: 0 = domingo, 1 = lunes ... 6 = sábado. Cada día, una lista de tramos ["desde", "hasta"].
  horarios: {
    0: [],
    1: [["09:00", "18:30"]],
    2: [["09:00", "18:30"]],
    3: [["09:00", "18:30"]],
    4: [["09:00", "18:30"]],
    5: [["09:00", "18:30"]],
    6: [["09:00", "13:00"]],
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
   Altamar Automotores — asistente "¿Qué auto te conviene?"
   ========================================================== */

const PUNTAJES = {
  uso: { ciudad: { compacto: 2 }, ruta: { sedan: 2, suv: 1 }, mixto: { compacto: 1, sedan: 1, suv: 2 } },
  personas: { pocos: { compacto: 2, sedan: 1 }, familia: { compacto: 1, sedan: 2, suv: 1 }, muchos: { suv: 3 } },
  prioridad: { consumo: { compacto: 2, sedan: 1 }, confort: { sedan: 2, suv: 1 }, espacio: { sedan: 1, suv: 2 } },
};

const RECOMENDACION = {
  compacto: {
    titulo: "Un compacto",
    texto: "Gasta poco, se estaciona en cualquier lado y alcanza de sobra para el día a día. Es la opción más económica de mantener.",
    auto: "auto-compacto",
  },
  sedan: {
    titulo: "Un sedán",
    texto: "Más estable y silencioso en ruta, con buen baúl y lugar cómodo para cuatro. Un equilibrio entre consumo y confort.",
    auto: "auto-sedan",
  },
  suv: {
    titulo: "Una SUV",
    texto: "Más espacio para pasajeros y equipaje, posición de manejo alta y comodidad para viajes largos en familia.",
    auto: "auto-suv",
  },
};

const ETIQUETAS = {
  ciudad: "en la ciudad", ruta: "en ruta", mixto: "en ciudad y ruta",
  pocos: "1 o 2 personas", familia: "3 o 4 personas", muchos: "5 o más personas o mucha carga",
  consumo: "que gaste poco", confort: "que sea cómodo", espacio: "que tenga espacio",
};

function iniciarAsistente() {
  const respuestas = {};
  const preguntas = $$("[data-pregunta]");

  const actualizar = () => {
    const n = Object.keys(respuestas).length;
    $("[data-progreso]").style.width = (n / 3) * 100 + "%";
    $$(".car").forEach((c) => c.classList.remove("is-match"));

    if (n < 3) {
      $("[data-resultado-vacio]").hidden = false;
      $("[data-resultado-lleno]").hidden = true;
      $("[data-faltan]").textContent = "Falta" + (3 - n === 1 ? " 1 respuesta" : "n " + (3 - n) + " respuestas");
      return;
    }

    const total = { compacto: 0, sedan: 0, suv: 0 };
    Object.entries(respuestas).forEach(([preg, valor]) => {
      Object.entries(PUNTAJES[preg][valor]).forEach(([tipo, pts]) => (total[tipo] += pts));
    });
    // En empate gana el orden: compacto, sedán, SUV (el más económico primero)
    const ganador = Object.keys(total).reduce((a, b) => (total[b] > total[a] ? b : a));
    const rec = RECOMENDACION[ganador];

    $("[data-res-titulo]").textContent = rec.titulo;
    $("[data-res-texto]").textContent = rec.texto;
    $("[data-res-ver]").href = "#" + rec.auto;
    $("[data-res-wa]").href = linkWhatsApp(
      "Hola, usé el asistente de la web. Lo voy a usar " + ETIQUETAS[respuestas.uso] +
      ", para " + ETIQUETAS[respuestas.personas] + " y busco " + ETIQUETAS[respuestas.prioridad] +
      ". Me recomendó " + rec.titulo.toLowerCase() + ". ¿Qué opciones tienen?"
    );
    $("[data-resultado-vacio]").hidden = true;
    const lleno = $("[data-resultado-lleno]");
    lleno.hidden = true;
    void lleno.offsetWidth;
    lleno.hidden = false;
    document.getElementById(rec.auto).classList.add("is-match");
  };

  preguntas.forEach((q) => {
    $$(".choice", q).forEach((btn) =>
      btn.addEventListener("click", () => {
        $$(".choice", q).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        respuestas[q.dataset.pregunta] = btn.dataset.valor;
        q.classList.add("is-done");
        actualizar();
      })
    );
  });

  $("[data-reiniciar]").addEventListener("click", () => {
    Object.keys(respuestas).forEach((k) => delete respuestas[k]);
    preguntas.forEach((q) => {
      q.classList.remove("is-done");
      $$(".choice", q).forEach((b) => b.setAttribute("aria-pressed", "false"));
    });
    actualizar();
  });
}

function iniciarComercio() {
  iniciarAsistente();
}
