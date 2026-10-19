// Paso 6: la prueba de crisis. Cuánto cae tu inversión en plata y qué pasa si vendés en el peor momento.

import { encabezado, idea, saber, chips, conectarChips, navegacion, conectarNav } from '../ui.js';
import { CRISIS, PERFILES, ORDEN_PERFILES } from '../datos.js';
import { pruebaCrisis } from '../calculo.js';
import { usd, porcentaje, redondear } from '../formato.js';
import { planDe } from '../estado.js';

// Tres momentos posibles: al principio, a mitad de camino y cerca de la meta.
export function aniosPosibles(plazo) {
  const candidatos = [Math.min(3, plazo - 1), Math.round(plazo / 2), plazo - 1].filter((a) => a >= 1 && a < plazo);
  return [...new Set(candidatos)].sort((a, b) => a - b);
}

export function render(raiz, { estado, acciones }) {
  const anios = aniosPosibles(estado.plazo);
  raiz.innerHTML = `
    ${encabezado(6, 'tormenta', 'LA CRISIS')}
    ${idea('Cada tanto llega una crisis fuerte y no se puede evitar. Lo que sí se puede evitar es lo que más daño hace: vender en el peor momento.')}
    <div data-contenido></div>
    ${navegacion()}`;

  const contenido = raiz.querySelector('[data-contenido]');

  if (anios.length === 0) {
    contenido.innerHTML = `<div class="info"><p>Tu plazo es de 1 año: es muy corto para invertir en cosas que se sacuden. Lo más prudente es dejar esa plata en el colchón o en bonos cortos.</p></div>`;
  } else {
    if (!anios.includes(estado.crisisAnio)) acciones.cambiar({ crisisAnio: anios[Math.floor((anios.length - 1) / 2)] });
    dibujar();
  }

  function dibujar(mensaje = '') {
    const plan = planDe(estado);
    const prueba = pruebaCrisis(plan, estado.crisisAnio);
    const anioReal = new Date().getFullYear() + estado.crisisAnio;
    const anioFin = new Date().getFullYear() + estado.plazo;
    const perfil = PERFILES[estado.perfil];
    const iPerfil = ORDEN_PERFILES.indexOf(estado.perfil);
    const casiNada = prueba.antes < 50;

    contenido.innerHTML = `
      <p class="pregunta" id="q-cuando">¿Cuándo te agarra?</p>
      ${chips('cuando', anios.map((a) => ({ valor: a, texto: `Año ${a}` })), estado.crisisAnio, 'q-cuando')}

      ${
        casiNada
          ? `<div class="resultado"><p class="frase">En ${anioReal} todavía estarías llenando tu colchón o recién arrancando: la crisis casi no te toca. Por eso el colchón va primero.</p></div>`
          : `<div class="resultado" aria-live="polite">
               <p class="rotulo">En ${anioReal}, tu inversión cae de ${usd(prueba.antes)} a</p>
               <p class="cifra mal">${usd(prueba.despues)}</p>
               <p class="nota">Son ${usd(redondear(prueba.antes) - redondear(prueba.despues), { exacto: true })} menos en pocos meses. Tu colchón no se toca: está en algo que no se mueve.</p>
             </div>
             <div class="comparar">
               <div class="tarjeta-chica"><p class="rotulo">Si aguantás</p><p class="cifra-chica bien">${usd(prueba.aguanta)}</p><p class="nota">en ${anioFin}</p></div>
               <div class="tarjeta-chica"><p class="rotulo">Si vendés en el piso</p><p class="cifra-chica mal">${usd(prueba.vende)}</p><p class="nota">y pasás todo a bonos</p></div>
             </div>`
      }

      ${saber(
        '¿Qué crisis usamos?',
        `<p>Una parecida a las peores de los últimos años: las 500 empresas de EE.UU. caen ${porcentaje(CRISIS.caidas.eeuu)} (entre 2007 y 2009 cayeron cerca de 55%),
         bitcoin ${porcentaje(CRISIS.caidas.bitcoin)} (en 2022 cayó 77%) y el oro ${porcentaje(CRISIS.caidas.oro)} (en 2008 cayó cerca de 30%). Los bonos cortos casi no se mueven.</p>
         <p>Después suponemos que todo vuelve a su camino en ${CRISIS.mesesRecuperacion / 12} años, como pasó con las acciones de EE.UU. después de 2009.
         No está garantizado: la bolsa de Japón tardó más de 30 años en volver a su máximo de 1989.</p>`,
      )}

      ${
        casiNada
          ? ''
          : `<p class="pregunta" id="q-aguanta">¿Lo aguantarías sin vender?</p>
             <div class="chips" role="group" aria-labelledby="q-aguanta">
               <button type="button" class="chip" data-aguanta="si" aria-pressed="${estado.aguanta === true}">Sí, sigo así</button>
               <button type="button" class="chip" data-aguanta="no" aria-pressed="${estado.aguanta === false}">${iPerfil > 0 ? 'No, quiero algo más prudente' : 'No, me costaría'}</button>
             </div>
             <p class="nota" data-mensaje aria-live="polite">${mensaje}</p>`
      }`;

    conectarChips(contenido, 'cuando', (valor) => {
      acciones.cambiar({ crisisAnio: Number(valor) });
      dibujar();
    });
    for (const boton of contenido.querySelectorAll('[data-aguanta]')) {
      boton.addEventListener('click', () => {
        if (boton.dataset.aguanta === 'si') {
          acciones.cambiar({ aguanta: true });
          dibujar(`Bien. Anotalo en algún lado: "en una crisis, no vendo". Te va a servir cuando llegue. Tu perfil sigue ${perfil.nombre}.`);
        } else if (iPerfil > 0) {
          const nuevo = ORDEN_PERFILES[iPerfil - 1];
          acciones.cambiar({ perfil: nuevo, aguanta: null });
          dibujar(`Listo: te pasamos a ${PERFILES[nuevo].nombre}. Mirá cómo cambia la caída.`);
        } else {
          acciones.cambiar({ aguanta: false });
          dibujar('Ya estás en el perfil más prudente. Si igual te costaría, está bien empezar con menos plata invertida y más tiempo en el colchón. Lo importante es no vender en el peor momento.');
        }
      });
    }
  }

  conectarNav(raiz, {
    alSeguir: () => acciones.siguiente('crisis'),
    alVolver: () => acciones.atras('crisis'),
  });
}
