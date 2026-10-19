// Paso 3: para qué y para cuándo. La meta va en dólares de hoy.

import {
  encabezado, idea, etiquetaEjemplo, chips, conectarChips, campoMonto, conectarMonto,
  navegacion, conectarNav, ocultarError,
} from '../ui.js';
import { EJEMPLO, INFLACION_EEUU } from '../datos.js';
import { totalAportado, mesesParaColchon } from '../calculo.js';
import { usd, porcentaje, redondear } from '../formato.js';
import { planDe } from '../estado.js';

const TIPOS = ['Libertad', 'Casa', 'Estudios', 'Retiro', 'Otra'];

export function validar(estado) {
  return estado.meta > 0 ? null : 'Escribí cuánto querés juntar, en dólares.';
}

export function render(raiz, { estado, acciones }) {
  const mostrarEjemplo = estado.ejemplo && !estado.tocado.meta;
  raiz.innerHTML = `
    ${encabezado(3, 'bandera', 'TU META')}
    ${idea('Una meta con fecha te ayuda a no tocar la plata cuando el mercado se pone feo.')}

    <p class="pregunta" id="q-tipo">¿Para qué es?</p>
    ${chips('tipo', TIPOS.map((t) => ({ valor: t, texto: t })), estado.metaTipo, 'q-tipo')}

    <label class="pregunta" for="meta">¿Cuánto querés juntar?</label>
    <div class="campo">
      ${campoMonto('meta', estado.meta, '30.000')}
      <span class="sufijo">US$</span>
    </div>
    ${mostrarEjemplo ? etiquetaEjemplo(EJEMPLO.fuentes.meta) : ''}

    <label class="pregunta" for="plazo">¿Para cuándo?</label>
    <div class="deslizador">
      <input id="plazo" type="range" min="1" max="40" step="1" value="${estado.plazo}">
      <output for="plazo" data-plazo></output>
    </div>

    <div class="info">
      <span class="etiqueta">DÓLARES DE HOY</span>
      <p data-dolares-hoy></p>
    </div>

    <div class="resultado" aria-live="polite">
      <p class="rotulo" data-rotulo></p>
      <p class="cifra" data-sin-invertir></p>
      <p class="nota" data-comparacion></p>
    </div>
    ${navegacion()}`;

  const actualizar = () => {
    const anioFin = new Date().getFullYear() + estado.plazo;
    raiz.querySelector('[data-plazo]').textContent =
      `${estado.plazo === 1 ? '1 año' : `${estado.plazo} años`} · ${anioFin}`;
    const meta = estado.meta > 0 ? usd(estado.meta, { exacto: true }) : 'tu meta';
    raiz.querySelector('[data-dolares-hoy]').textContent =
      `En ${anioFin}, ${meta} van a comprar menos que hoy, porque en EE.UU. también hay inflación ` +
      `(suponemos ${porcentaje(INFLACION_EEUU, 1)} por año). Todos los números de la app ya la descuentan: muestran lo que podrías comprar hoy.`;

    // Cuánto juntarías solo ahorrando, después de llenar el colchón.
    const plan = planDe(estado);
    const meses = estado.plazo * 12;
    const mesesColchon = Math.min(meses, mesesParaColchon(plan.objetivoColchon, plan.yaTengo, plan.aporte, plan.crecimiento));
    const total = totalAportado(plan.aporte, plan.crecimiento, meses);
    const alColchon = Math.max(0, plan.objetivoColchon - plan.yaTengo);
    const sinInvertir = Math.max(0, total - Math.min(total, alColchon));
    raiz.querySelector('[data-rotulo]').textContent = `Solo ahorrando, sin invertir, en ${anioFin} tendrías`;
    raiz.querySelector('[data-sin-invertir]').textContent = Number.isFinite(mesesColchon) ? usd(sinInvertir) : '—';
    const comparacion = raiz.querySelector('[data-comparacion]');
    if (!(estado.meta > 0)) comparacion.textContent = '';
    else if (sinInvertir >= estado.meta) comparacion.textContent = 'Ya llegás sin invertir. Invertir te ayudaría a llegar antes o a que te sobre.';
    else comparacion.textContent = `Te faltarían ${usd(estado.meta - redondear(sinInvertir), { exacto: true })}: eso es lo que tiene que hacer el interés compuesto (o un aporte más grande).`;
  };

  conectarChips(raiz, 'tipo', (valor) => acciones.cambiar({ metaTipo: valor }));
  conectarMonto(raiz.querySelector('#meta'), (valor) => {
    acciones.cambiar({ meta: valor });
    acciones.tocar('meta');
    ocultarError(raiz);
    actualizar();
  });
  raiz.querySelector('#plazo').addEventListener('input', (evento) => {
    acciones.cambiar({ plazo: Number(evento.target.value) });
    actualizar();
  });
  conectarNav(raiz, {
    validar: () => validar(estado),
    alSeguir: () => acciones.siguiente('meta'),
    alVolver: () => acciones.atras('meta'),
  });
  actualizar();
}
