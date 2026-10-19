// Bienvenida: qué es la app, el aviso de que no es asesoramiento y por dónde empezar.

import { icono } from '../pixel.js';

export function render(raiz, { estado, acciones }) {
  const yaEmpezo = estado.iniciado;
  raiz.innerHTML = `
    <section class="inicio">
      <div class="moneda-grande">${icono('moneda', 8)}</div>
      <h1 class="titulo-inicio" tabindex="-1">ARMÁ TU PLAN</h1>
      <p class="bajada">Aprendé a invertir armando tu propio plan, con números reales de Argentina.</p>
      <p class="suave">7 pasos, unos 10 minutos. Terminás sabiendo qué hacer este mes con tu plata.</p>
      <div class="aviso">
        <strong>Es para aprender.</strong> No es asesoramiento financiero: la app hace las cuentas y vos decidís.
        Los resultados son estimaciones, no promesas.
      </div>
      ${
        yaEmpezo
          ? `<button type="button" class="boton ancho" data-accion="seguir">SEGUIR ›</button>
             <button type="button" class="enlace" data-accion="reiniciar">Empezar de nuevo (borra tu plan)</button>`
          : `<button type="button" class="boton ancho" data-accion="ejemplo">EMPEZAR ›</button>
             <p class="suave chico">Arranca con un ejemplo armado con datos públicos. Lo cambiás por tus números en cada paso.</p>
             <button type="button" class="enlace" data-accion="cero">Empezar de cero, sin ejemplo</button>`
      }
    </section>`;

  const boton = (nombre) => raiz.querySelector(`[data-accion="${nombre}"]`);
  if (yaEmpezo) {
    boton('seguir').addEventListener('click', acciones.seguir);
    boton('reiniciar').addEventListener('click', () => {
      if (window.confirm('¿Empezar de nuevo? Se borra el plan guardado en este navegador.')) acciones.reiniciar();
    });
  } else {
    boton('ejemplo').addEventListener('click', () => acciones.empezar(true));
    boton('cero').addEventListener('click', () => acciones.empezar(false));
  }
}
