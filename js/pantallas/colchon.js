// Paso 2: el colchón (fondo de emergencia). Gasto esencial × meses, y en cuánto tiempo se completa.

import {
  encabezado, idea, saber, etiquetaEjemplo, chips, conectarChips, campoMonto, conectarMonto,
  selectorMoneda, conectarMoneda, navegacion, conectarNav, ocultarError,
} from '../ui.js';
import { EJEMPLO } from '../datos.js';
import { mesesParaColchon } from '../calculo.js';
import { usd, pesos, mesYAnio, sumarMeses, duracion } from '../formato.js';
import { enDolares } from '../estado.js';

export function validar(estado) {
  return estado.gasto > 0 ? null : 'Escribí cuánto gastás por mes en lo esencial.';
}

export function render(raiz, { estado, acciones }) {
  const mostrarEjemplo = estado.ejemplo && !estado.tocado.gasto;
  raiz.innerHTML = `
    ${encabezado(2, 'escudo', 'TU COLCHÓN')}
    ${idea('Antes de invertir, armá un colchón: plata para imprevistos, como que se rompa algo o quedarte sin trabajo. Así nunca tenés que vender tus inversiones en un mal momento.')}

    <label class="pregunta" for="gasto">¿Cuánto gastás por mes en lo esencial?</label>
    <p class="nota">Comida, transporte, servicios, y alquiler si pagás: lo mínimo para vivir un mes.</p>
    <div class="campo">
      ${campoMonto('gasto', estado.gasto, estado.moneda === 'ARS' ? '500.000' : '350')}
      ${selectorMoneda(estado.moneda)}
    </div>
    <p class="nota" data-conversion></p>
    ${mostrarEjemplo ? etiquetaEjemplo(EJEMPLO.fuentes.gasto) : ''}

    <p class="pregunta" id="q-meses">¿Cuántos meses querés cubrir?</p>
    ${chips('meses', [3, 4, 5, 6].map((m) => ({ valor: m, texto: String(m) })), estado.meses, 'q-meses')}
    <p class="nota">3 si vivís con tu familia y tu ingreso es estable. 6 si vivís solo o tu ingreso cambia mucho.</p>

    ${saber(
      '¿Ya tenés algo ahorrado para esto?',
      `<label class="campo-chico">Lo que ya tenés, en ${estado.moneda === 'ARS' ? 'pesos' : 'dólares'}
         ${campoMonto('ya-tengo', estado.yaTengo || null, '0')}</label>`,
    )}

    <div class="resultado dos" aria-live="polite">
      <div><p class="rotulo">Tu colchón</p><p class="cifra" data-objetivo></p></div>
      <div><p class="rotulo" data-rotulo-tiempo>Lo completás en</p><p class="cifra" data-tiempo></p></div>
      <p class="nota ancho" data-cuando></p>
    </div>

    ${saber(
      '¿Dónde se guarda el colchón?',
      `<p>En algo que casi no se mueva y que puedas sacar en el día: un <strong>fondo money market en dólares</strong> o una cuenta remunerada en dólares, en tu banco o en un broker.</p>
       <p>No en acciones ni en cripto: justo cuando lo necesitás, pueden estar abajo. Rinde poco, y está bien: su trabajo es estar ahí.</p>`,
    )}
    ${navegacion()}`;

  const actualizar = () => {
    const gastoUsd = enDolares(estado, estado.gasto);
    const conversion = raiz.querySelector('[data-conversion]');
    conversion.textContent =
      estado.gasto > 0
        ? estado.moneda === 'ARS'
          ? `= ${usd(gastoUsd, { exacto: true })} por mes.`
          : `= ${pesos(estado.gasto * estado.mep)} por mes.`
        : '';

    const objetivo = (gastoUsd ?? 0) * estado.meses;
    const yaTengo = enDolares(estado, estado.yaTengo) ?? 0;
    const aporteUsd = enDolares(estado, estado.aporte) ?? 0;
    const meses = mesesParaColchon(objetivo, yaTengo, aporteUsd, estado.crecimiento);
    raiz.querySelector('[data-objetivo]').textContent = objetivo > 0 ? usd(objetivo, { exacto: true }) : '—';
    const tiempo = raiz.querySelector('[data-tiempo]');
    const cuando = raiz.querySelector('[data-cuando]');
    if (!(objetivo > 0)) {
      tiempo.textContent = '—';
      cuando.textContent = '';
    } else if (meses === 0) {
      tiempo.textContent = 'Listo';
      cuando.textContent = 'Ya lo tenés completo: todo tu aporte puede ir a invertir desde este mes.';
    } else if (!Number.isFinite(meses)) {
      tiempo.textContent = '—';
      cuando.textContent = 'Con este aporte no se llega a completar. Volvé al paso 1 y probá con un poco más.';
    } else {
      tiempo.textContent = duracion(meses);
      const ultimoMes = sumarMeses(new Date(), meses - 1);
      cuando.textContent = `Lo terminás de juntar en ${mesYAnio(ultimoMes)}. Hasta entonces, todo tu aporte va al colchón; después, todo a invertir.`;
    }
  };

  conectarMonto(raiz.querySelector('#gasto'), (valor) => {
    acciones.cambiar({ gasto: valor });
    acciones.tocar('gasto');
    ocultarError(raiz);
    actualizar();
  });
  conectarMonto(raiz.querySelector('#ya-tengo'), (valor) => {
    acciones.cambiar({ yaTengo: valor ?? 0 });
    actualizar();
  });
  conectarMoneda(raiz, acciones.cambiarMoneda);
  conectarChips(raiz, 'meses', (valor) => {
    acciones.cambiar({ meses: Number(valor) });
    actualizar();
  });
  conectarNav(raiz, {
    validar: () => validar(estado),
    alSeguir: () => acciones.siguiente('colchon'),
    alVolver: () => acciones.atras('colchon'),
  });
  actualizar();
}
