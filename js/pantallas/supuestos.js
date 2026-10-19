// Supuestos y fuentes: todo lo que la app da por cierto, a la vista.

import { PARTES, INFLACION_EEUU, CRISIS, SIMULACION, FUENTES, REVISADO, DOLAR_MEP } from '../datos.js';
import { rangoTipico, rendimientoReal } from '../calculo.js';
import { usd, pesos, porcentaje } from '../formato.js';

export function render(raiz, { acciones }) {
  const filas = PARTES.map((p) => {
    const rango = rangoTipico(p);
    return `
      <li>
        <p class="fila-titulo"><span><span class="muestra seg-${p.id}"></span>${p.nombre}</span><strong>${porcentaje(p.rendimiento, 1)}</strong></p>
        <p class="nota">${porcentaje(rendimientoReal(p.rendimiento), 1)} por año descontando la inflación. En 2 de cada 3 años, entre ${porcentaje(rango.bajo)} y +${porcentaje(rango.alto)}.
        Comprar: ${p.comision > 0 ? `comisión ~${porcentaje(p.comision, 2)}` : 'sin comisión de entrada'}, mínimo ~${usd(p.minimo)}.</p>
      </li>`;
  }).join('');

  raiz.innerHTML = `
    <h1 class="titulo" tabindex="-1"><span>SUPUESTOS Y FUENTES</span></h1>
    <p>Todo lo que la app da por cierto para hacer las cuentas. Son <strong>supuestos, no predicciones</strong>. Revisados el ${REVISADO}.</p>

    <h2 class="subtitulo">Cuánto rinde cada parte por año, en dólares</h2>
    <ul class="lista-supuestos">${filas}</ul>
    <p class="nota">Para las acciones de EE.UU. usamos un punto medio entre lo que esperan dos de las gestoras más grandes del mundo (ver fuentes). Para bitcoin, 12% es un supuesto optimista: nadie sabe cuánto va a rendir, y puede caer muchísimo.</p>

    <h2 class="subtitulo">Cómo calculamos</h2>
    <ul class="puntos">
      <li>Todo en <strong>dólares de hoy</strong>: descontamos ${porcentaje(INFLACION_EEUU, 1)} de inflación de EE.UU. por año.</li>
      <li>Probamos <strong>${SIMULACION.futuros.toLocaleString('es-AR')} futuros</strong> mes a mes, con subas y bajas al azar según lo que rinde y cuánto se sacude cada parte. Las acciones y bitcoin a veces caen juntos.</li>
      <li><strong>Primero el colchón:</strong> todo el aporte va al colchón hasta completarlo; después, todo a invertir según tu perfil. El colchón no rinde ni pierde (en dólares de hoy).</li>
      <li><strong>Mínimos de compra:</strong> si a una parte le toca menos que su mínimo, se junta hasta llegar y ahí se compra.</li>
      <li><strong>Crisis de prueba:</strong> EE.UU. −${porcentaje(CRISIS.caidas.eeuu)}, bitcoin −${porcentaje(CRISIS.caidas.bitcoin)}, oro −${porcentaje(CRISIS.caidas.oro)}, bonos sin cambios, y vuelta al camino en ${CRISIS.mesesRecuperacion / 12} años.</li>
      <li>Los pesos se pasan a dólares con el dólar MEP de ${pesos(DOLAR_MEP.valor)} (${DOLAR_MEP.fecha}), y lo podés cambiar en el paso 1.</li>
    </ul>

    <h2 class="subtitulo">Qué no incluye</h2>
    <p>Impuestos (como Bienes Personales), costos de mantener la cuenta, la diferencia entre el precio de compra y el de venta, ni los cambios del dólar MEP. Las comisiones y los mínimos son aproximados: cada plataforma tiene los suyos.</p>

    <h2 class="subtitulo">Fuentes</h2>
    <ul class="puntos">
      ${FUENTES.map((f) => `<li><strong>${f.tema}:</strong> ${f.texto} <a href="${f.url}" target="_blank" rel="noopener">Ver fuente</a></li>`).join('')}
    </ul>

    <div class="nav"><button type="button" class="boton secundario" data-accion="volver">‹ VOLVER</button></div>`;

  raiz.querySelector('[data-accion="volver"]').addEventListener('click', acciones.volver);
}
