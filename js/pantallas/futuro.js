// Paso 5: qué puede pasar. Tres caminos, cuántos de 10 futuros llegan y qué cambia si subís el aporte.

import { encabezado, idea, saber, diez, navegacion, conectarNav } from '../ui.js';
import { SIMULACION } from '../datos.js';
import { futuros, chancesCon } from '../motor.js';
import { deDiez } from '../calculo.js';
import { graficoCaminos } from '../grafico.js';
import { usd } from '../formato.js';
import { planDe } from '../estado.js';

// "De 10 futuros, en 6 llegás", con cuidado en los extremos.
export function fraseChances(chances, meta) {
  const cuantos = deDiez(chances);
  const objetivo = `a tu meta de ${usd(meta, { exacto: true })}`;
  if (chances === 1) return `En los 1.000 futuros que probamos llegás ${objetivo}.`;
  if (chances === 0) return `En ninguno de los 1.000 futuros llegás ${objetivo}.`;
  if (chances >= 0.95) return `En casi todos los futuros (más de 9 de cada 10) llegás ${objetivo}.`;
  if (cuantos === 0) return `En menos de 1 de cada 10 futuros llegás ${objetivo}.`;
  return `De 10 futuros posibles, en <strong>${cuantos}</strong> llegás ${objetivo}.`;
}

function fraseCorta(chances, aporte) {
  const cuantos = deDiez(chances);
  const conAporte = `Con ${usd(aporte, { exacto: true })} por mes`;
  if (chances >= 0.95) return `${conAporte} llegás en casi todos los futuros.`;
  if (cuantos === 0) return `${conAporte} llegás en menos de 1 de cada 10.`;
  return `${conAporte} llegás en ${cuantos} de cada 10.`;
}

function consejo(chances) {
  if (chances >= 0.7) return 'Vas bien encaminado.';
  if (chances >= 0.4) return 'Estás cerca: subir un poco el aporte o el plazo ayuda mucho.';
  return 'Así como está, es difícil. Probá con más aporte, más plazo o una meta más chica.';
}

export function render(raiz, { estado, acciones }) {
  const plan = planDe(estado);
  const resultado = futuros(plan, estado.meta);
  const anioInicio = new Date().getFullYear();
  const aporteActual = Math.round(plan.aporte);
  const necesario = Number.isFinite(resultado.necesario) ? Math.ceil(resultado.necesario / 5) * 5 : null;
  const maximo = Math.max(50, Math.ceil(Math.max(aporteActual * 3, (necesario ?? 0) * 1.5) / 10) * 10);

  raiz.innerHTML = `
    ${encabezado(5, 'grafico', 'TU FUTURO')}
    ${idea(`Nadie sabe qué va a pasar. Por eso probamos ${SIMULACION.futuros.toLocaleString('es-AR')} futuros posibles, con años buenos y malos mezclados al azar, y te mostramos tres.`)}

    <figure class="grafico">${graficoCaminos({ caminos: resultado.caminos, puesto: resultado.puesto, meta: estado.meta, anioInicio })}</figure>
    <ul class="leyenda">
      <li><span class="trazo bueno"></span><span><strong>Bueno:</strong> solo 1 de cada 10 futuros termina mejor.</span></li>
      <li><span class="trazo medio"></span><span><strong>Medio:</strong> la mitad termina mejor y la mitad peor.</span></li>
      <li><span class="trazo malo"></span><span><strong>Malo:</strong> solo 1 de cada 10 termina peor.</span></li>
      <li><span class="trazo puesto"></span><span>Lo que pusiste vos (el colchón no está en el gráfico).</span></li>
    </ul>

    <div class="resultado" aria-live="polite">
      ${diez(resultado.deDiez)}
      <p class="frase">${fraseChances(resultado.chances, estado.meta)}</p>
      <p class="nota">${consejo(resultado.chances)}</p>
    </div>

    <label class="pregunta" for="probar">¿Y si ponés otro monto por mes?</label>
    <div class="deslizador">
      <input id="probar" type="range" min="10" max="${maximo}" step="5" value="${Math.min(maximo, Math.max(10, Math.round(aporteActual / 5) * 5))}">
      <output for="probar" data-probar></output>
    </div>
    <p class="nota" data-probar-frase aria-live="polite"></p>
    <button type="button" class="boton secundario chico" data-usar hidden>USAR ESTE APORTE</button>
    <p class="nota">${
      necesario === null
        ? 'Con estos números, ni con un aporte muy grande se llega: probá con más plazo.'
        : `Para llegar en 7 de cada 10 futuros, necesitás <strong>${usd(necesario, { exacto: true })}</strong> por mes.`
    }</p>

    ${saber(
      '¿De dónde salen estos números?',
      `<p>Para cada futuro simulamos tu plan mes a mes: primero el colchón, después cada parte de tu cartera, con sus comisiones y mínimos de compra.
       Cada mes cada parte sube o baja al azar, según lo que suponemos que rinde y cuánto se sacude. Las acciones y bitcoin a veces caen juntos.</p>
       <p>Son <strong>supuestos, no predicciones</strong>: el futuro real puede ser mejor o peor que todos estos.</p>
       <p><a href="#supuestos">Ver todos los supuestos y sus fuentes</a></p>`,
    )}
    ${navegacion()}`;

  const deslizador = raiz.querySelector('#probar');
  const salida = raiz.querySelector('[data-probar]');
  const frase = raiz.querySelector('[data-probar-frase]');
  const usar = raiz.querySelector('[data-usar]');
  let pendiente = false;

  const probar = () => {
    pendiente = false;
    const aporte = Number(deslizador.value);
    salida.textContent = usd(aporte, { exacto: true });
    frase.textContent = fraseCorta(chancesCon({ ...plan, aporte }, estado.meta), aporte);
    usar.hidden = Math.abs(aporte - aporteActual) < 5;
  };

  deslizador.addEventListener('input', () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(probar);
    }
  });
  usar.addEventListener('click', () => {
    const dolares = Number(deslizador.value);
    acciones.cambiar({ aporte: estado.moneda === 'ARS' ? Math.round(dolares * estado.mep) : dolares });
    acciones.tocar('aporte');
    acciones.recargar();
  });
  conectarNav(raiz, {
    alSeguir: () => acciones.siguiente('futuro'),
    alVolver: () => acciones.atras('futuro'),
  });
  probar();
}
