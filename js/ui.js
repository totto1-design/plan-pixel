// Piezas de pantalla que se repiten en todos los pasos.

import { icono } from './pixel.js';
import { numero, leerNumero } from './formato.js';

export const TOTAL_PASOS = 7;

export function encabezado(paso, nombreIcono, titulo) {
  return `
    <p class="paso-num">Paso ${paso} de ${TOTAL_PASOS}</p>
    <h1 class="titulo" tabindex="-1">${icono(nombreIcono, nombreIcono === 'moneda' ? 2 : 3)}<span>${titulo}</span></h1>`;
}

export function idea(texto) {
  return `<div class="idea"><span class="etiqueta">LA IDEA</span><p>${texto}</p></div>`;
}

export function saber(titulo, contenido, clase = '') {
  return `<details class="saber ${clase}"><summary>${titulo}</summary><div class="saber-cuerpo">${contenido}</div></details>`;
}

export function etiquetaEjemplo(texto) {
  return `<p class="ejemplo"><span class="etiqueta">EJEMPLO</span> ${texto}</p>`;
}

// Botones para elegir una opción. opciones = [{ valor, texto }]
export function chips(nombre, opciones, elegido, idPregunta) {
  const botones = opciones
    .map(
      (o) =>
        `<button type="button" class="chip" data-valor="${o.valor}" aria-pressed="${String(o.valor) === String(elegido)}">${o.texto}</button>`,
    )
    .join('');
  return `<div class="chips" role="group" aria-labelledby="${idPregunta}" data-chips="${nombre}">${botones}</div>`;
}

export function conectarChips(raiz, nombre, alElegir) {
  const grupo = raiz.querySelector(`[data-chips="${nombre}"]`);
  grupo.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.chip');
    if (!boton) return;
    for (const otro of grupo.querySelectorAll('.chip')) otro.setAttribute('aria-pressed', String(otro === boton));
    alElegir(boton.dataset.valor);
  });
}

export function campoMonto(id, valor, placeholder = '0') {
  const texto = valor == null ? '' : numero(valor);
  return `<input class="monto" id="${id}" type="text" inputmode="numeric" autocomplete="off" placeholder="${placeholder}" value="${texto}">`;
}

// Avisa cada vez que cambia el número y le pone los puntos de miles al salir del campo.
export function conectarMonto(input, alCambiar) {
  input.addEventListener('input', () => alCambiar(leerNumero(input.value)));
  input.addEventListener('blur', () => {
    const valor = leerNumero(input.value);
    input.value = valor == null ? '' : numero(valor);
  });
}

export function selectorMoneda(moneda) {
  return `
    <div class="moneda" role="group" aria-label="Moneda">
      <button type="button" data-moneda="ARS" aria-pressed="${moneda === 'ARS'}">$</button>
      <button type="button" data-moneda="USD" aria-pressed="${moneda === 'USD'}">US$</button>
    </div>`;
}

export function conectarMoneda(raiz, alCambiar) {
  for (const boton of raiz.querySelectorAll('[data-moneda]')) {
    boton.addEventListener('click', () => alCambiar(boton.dataset.moneda));
  }
}

export function navegacion(texto = 'SIGUIENTE') {
  return `
    <p class="error" data-error role="alert" hidden></p>
    <div class="nav">
      <button type="button" class="boton secundario" data-accion="atras" aria-label="Volver al paso anterior">‹</button>
      <button type="button" class="boton" data-accion="siguiente">${texto} ›</button>
    </div>`;
}

export function conectarNav(raiz, { validar, alSeguir, alVolver }) {
  const error = raiz.querySelector('[data-error]');
  raiz.querySelector('[data-accion="atras"]').addEventListener('click', alVolver);
  raiz.querySelector('[data-accion="siguiente"]').addEventListener('click', () => {
    const problema = validar ? validar() : null;
    if (problema) {
      error.textContent = problema;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    alSeguir();
  });
}

export function ocultarError(raiz) {
  const error = raiz.querySelector('[data-error]');
  if (error) error.hidden = true;
}

// Diez cuadraditos: pintados los futuros que llegan a la meta.
export function diez(cuantos) {
  let cuadros = '';
  for (let i = 0; i < 10; i++) cuadros += `<span class="${i < cuantos ? 'si' : ''}"></span>`;
  return `<div class="diez" aria-hidden="true">${cuadros}</div>`;
}
