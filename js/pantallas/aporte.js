// Paso 1: cuánto podés poner por mes, en pesos o en dólares, y si lo subís cada año.

import {
  encabezado, idea, saber, etiquetaEjemplo, chips, conectarChips, campoMonto, conectarMonto,
  selectorMoneda, conectarMoneda, navegacion, conectarNav, ocultarError,
} from '../ui.js';
import { DOLAR_MEP, EJEMPLO } from '../datos.js';
import { totalAportado } from '../calculo.js';
import { usd, pesos, leerNumero, numero } from '../formato.js';
import { enDolares } from '../estado.js';

export function validar(estado) {
  return estado.aporte > 0 ? null : 'Escribí cuánto podés apartar por mes, aunque sea poco.';
}

export function render(raiz, { estado, acciones }) {
  const mostrarEjemplo = estado.ejemplo && !estado.tocado.aporte;
  raiz.innerHTML = `
    ${encabezado(1, 'moneda', 'TU APORTE')}
    ${idea('Poner un poco todos los meses le gana a poner mucho una vez. Con tiempo, las ganancias empiezan a generar sus propias ganancias: eso es el interés compuesto.')}

    <label class="pregunta" for="aporte">¿Cuánto podés apartar por mes para tu plan?</label>
    <div class="campo">
      ${campoMonto('aporte', estado.aporte, estado.moneda === 'ARS' ? '100.000' : '100')}
      ${selectorMoneda(estado.moneda)}
    </div>
    <p class="nota" data-conversion></p>
    ${mostrarEjemplo ? etiquetaEjemplo(EJEMPLO.fuentes.aporte) : ''}

    ${saber(
      '¿Qué es el dólar MEP?',
      `<p>Es el dólar que se compra de forma legal en la bolsa, a través de un broker. Es el que vas a usar para invertir en cosas en dólares.</p>
       <p>Usamos <strong>${pesos(DOLAR_MEP.valor)}</strong>, el precio del ${DOLAR_MEP.fecha}. Si cambió, ponelo acá:</p>
       <label class="campo-chico">Dólar MEP en pesos <input id="mep" type="text" inputmode="numeric" value="${numero(estado.mep)}"></label>`,
    )}

    <p class="pregunta" id="q-crece">¿Lo subís un poco cada año?</p>
    ${chips('crecimiento', [
      { valor: 0, texto: 'No' },
      { valor: 0.02, texto: '+2% por año' },
      { valor: 0.05, texto: '+5% por año' },
    ], estado.crecimiento, 'q-crece')}
    <p class="nota">Si tu sueldo crece, subí también el aporte: es de lo que más acelera un plan.</p>

    <div class="resultado" aria-live="polite">
      <p class="rotulo" data-rotulo></p>
      <p class="cifra" data-total></p>
      <p class="nota">Sin contar ganancias. Lo que suma invertir lo ves en el paso 5.</p>
    </div>
    ${navegacion()}`;

  const actualizar = () => {
    const aporteUsd = enDolares(estado, estado.aporte);
    const conversion = raiz.querySelector('[data-conversion]');
    if (estado.aporte > 0) {
      conversion.textContent =
        estado.moneda === 'ARS'
          ? `= ${usd(aporteUsd, { exacto: true })} por mes, al dólar MEP de ${pesos(estado.mep)}.`
          : `= ${pesos(estado.aporte * estado.mep)} por mes, al dólar MEP de ${pesos(estado.mep)}.`;
    } else {
      conversion.textContent = '';
    }
    raiz.querySelector('[data-rotulo]').textContent = `En ${estado.plazo} años ponés en total`;
    raiz.querySelector('[data-total]').textContent =
      aporteUsd > 0 ? usd(totalAportado(aporteUsd, estado.crecimiento, estado.plazo * 12)) : '—';
  };

  conectarMonto(raiz.querySelector('#aporte'), (valor) => {
    acciones.cambiar({ aporte: valor });
    acciones.tocar('aporte');
    ocultarError(raiz);
    actualizar();
  });
  conectarMoneda(raiz, acciones.cambiarMoneda);
  conectarChips(raiz, 'crecimiento', (valor) => {
    acciones.cambiar({ crecimiento: Number(valor) });
    actualizar();
  });
  const campoMep = raiz.querySelector('#mep');
  campoMep.addEventListener('input', () => {
    const valor = leerNumero(campoMep.value);
    if (valor > 0) {
      acciones.cambiar({ mep: valor });
      actualizar();
    }
  });
  conectarNav(raiz, {
    validar: () => validar(estado),
    alSeguir: () => acciones.siguiente('aporte'),
    alVolver: () => acciones.atras('aporte'),
  });
  actualizar();
}
