// Arranque de Plan Pixel: navegación entre pasos, barra de progreso, guardado y modo noche.

import { cargar, guardar, estadoEjemplo, estadoVacio, pasoIncompleto } from './estado.js';
import { icono } from './pixel.js';
import * as inicio from './pantallas/inicio.js';
import * as aporte from './pantallas/aporte.js';
import * as colchon from './pantallas/colchon.js';
import * as meta from './pantallas/meta.js';
import * as riesgo from './pantallas/riesgo.js';
import * as futuro from './pantallas/futuro.js';
import * as crisis from './pantallas/crisis.js';
import * as plan from './pantallas/plan.js';
import * as supuestos from './pantallas/supuestos.js';

const PANTALLAS = { inicio, aporte, colchon, meta, riesgo, futuro, crisis, plan, supuestos };
const PASOS = ['aporte', 'colchon', 'meta', 'riesgo', 'futuro', 'crisis', 'plan'];
const NOMBRES = ['Aporte', 'Colchón', 'Meta', 'Riesgo', 'Futuro', 'Crisis', 'Tu plan'];

let estado = cargar() ?? estadoEjemplo();
let anterior = 'inicio';
const raiz = document.getElementById('pantalla');
const progreso = document.getElementById('progreso');

const acciones = {
  cambiar(cambios) {
    Object.assign(estado, cambios);
    guardar(estado);
  },
  tocar(campo) {
    estado.tocado[campo] = true;
    guardar(estado);
  },
  ir(id) {
    if (location.hash === `#${id}`) mostrar();
    else location.hash = id;
  },
  siguiente(actual) {
    acciones.ir(PASOS[PASOS.indexOf(actual) + 1] ?? 'plan');
  },
  atras(actual) {
    const i = PASOS.indexOf(actual);
    acciones.ir(i <= 0 ? 'inicio' : PASOS[i - 1]);
  },
  volver() {
    acciones.ir(anterior && anterior !== 'supuestos' ? anterior : 'inicio');
  },
  recargar() {
    mostrar({ mantenerScroll: true });
  },
  empezar(conEjemplo) {
    estado = conEjemplo ? estadoEjemplo() : estadoVacio();
    estado.iniciado = true;
    guardar(estado);
    acciones.ir('aporte');
  },
  seguir() {
    acciones.ir(estado.ultimo ?? 'aporte');
  },
  reiniciar() {
    estado = estadoEjemplo();
    guardar(estado);
    acciones.ir('inicio');
  },
  // Cambia entre pesos y dólares y convierte lo que ya estaba escrito.
  cambiarMoneda(nueva) {
    if (nueva === estado.moneda) return;
    const factor = nueva === 'USD' ? 1 / estado.mep : estado.mep;
    for (const campo of ['aporte', 'gasto', 'yaTengo']) {
      if (estado[campo] != null) estado[campo] = Math.round(estado[campo] * factor);
    }
    estado.moneda = nueva;
    guardar(estado);
    mostrar({ mantenerScroll: true });
  },
};

function dibujarProgreso(id) {
  const indice = PASOS.indexOf(id);
  progreso.hidden = indice < 0;
  if (indice < 0) return;
  progreso.innerHTML = PASOS.map((paso, i) => {
    const visitado = estado.visitados.includes(paso);
    const clase = i === indice ? 'actual' : i < indice || visitado ? 'hecho' : '';
    const accesible = `Paso ${i + 1}: ${NOMBRES[i]}${i === indice ? ' (estás acá)' : ''}`;
    return `<button type="button" class="${clase}" data-paso="${paso}" aria-label="${accesible}" ${visitado || i <= indice ? '' : 'disabled'}><span></span></button>`;
  }).join('');
}

progreso.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-paso]');
  if (boton && !boton.disabled) acciones.ir(boton.dataset.paso);
});

function mostrar({ mantenerScroll = false } = {}) {
  let id = location.hash.slice(1) || 'inicio';
  if (!PANTALLAS[id]) id = 'inicio';

  if (PASOS.includes(id)) {
    if (!estado.iniciado) estado.iniciado = true;
    // No se puede saltar a un paso si falta completar uno anterior.
    const falta = pasoIncompleto(estado);
    if (falta && PASOS.indexOf(id) > PASOS.indexOf(falta)) {
      location.replace(`#${falta}`);
      return;
    }
    if (!estado.visitados.includes(id)) estado.visitados.push(id);
    estado.ultimo = id;
    guardar(estado);
  }
  if (id !== 'supuestos') anterior = id;

  dibujarProgreso(id);
  raiz.innerHTML = '';
  PANTALLAS[id].render(raiz, { estado, acciones });
  if (!mantenerScroll) {
    window.scrollTo(0, 0);
    raiz.querySelector('h1')?.focus({ preventScroll: true });
  }
}

// Modo noche: sigue al teléfono, salvo que la persona lo cambie a mano.
const botonTema = document.getElementById('boton-tema');

function temaActual() {
  const elegido = document.documentElement.dataset.tema;
  if (elegido) return elegido;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'noche' : 'claro';
}

function pintarBotonTema() {
  const noche = temaActual() === 'noche';
  botonTema.innerHTML = icono(noche ? 'sol' : 'luna', 3);
  botonTema.setAttribute('aria-label', noche ? 'Pasar a modo día' : 'Pasar a modo noche');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', noche ? '#141B33' : '#F6EFDF');
}

botonTema.addEventListener('click', () => {
  const nuevo = temaActual() === 'noche' ? 'claro' : 'noche';
  document.documentElement.dataset.tema = nuevo;
  try {
    localStorage.setItem('planpixel.tema', nuevo);
  } catch {
    // Sin almacenamiento: el cambio dura hasta cerrar la página.
  }
  pintarBotonTema();
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', pintarBotonTema);

document.getElementById('logo').innerHTML = icono('moneda', 2);
window.addEventListener('hashchange', () => mostrar());
pintarBotonTema();
mostrar();
