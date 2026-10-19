// Paso 4: cuánto riesgo aguantás. Una pregunta concreta lleva a un perfil y a una cartera de 4 partes.

import { encabezado, idea, saber, chips, conectarChips, navegacion, conectarNav, ocultarError } from '../ui.js';
import { PARTES, PERFILES, ORDEN_PERFILES, RESPUESTAS_RIESGO } from '../datos.js';
import { caidaEnCrisis, rangoTipico, leccionPartes, rendimientoReal } from '../calculo.js';
import { usd, porcentaje } from '../formato.js';
import { planDe } from '../estado.js';

export function validar(estado) {
  return estado.perfil ? null : 'Elegí una respuesta: no hay una correcta, es para conocerte.';
}

function cartera(perfil) {
  const pesos = PERFILES[perfil].pesos;
  const barras = PARTES.map(
    (p) => `<span class="seg-${p.id}" style="width:${pesos[p.id] * 100}%" title="${p.corto} ${porcentaje(pesos[p.id])}"></span>`,
  ).join('');
  const partes = PARTES.map((p) => {
    const rango = rangoTipico(p);
    return saber(
      `<span class="muestra seg-${p.id}"></span>${p.nombre}<span class="porc">${porcentaje(pesos[p.id])}</span>`,
      `<p>${p.queEs}</p>
       <p class="nota">Supuesto: rinde ${porcentaje(p.rendimiento, 1)} por año en dólares (${porcentaje(rendimientoReal(p.rendimiento), 1)} descontando la inflación).
       En 2 de cada 3 años, el resultado queda entre ${porcentaje(rango.bajo)} y +${porcentaje(rango.alto)}.</p>`,
      'parte',
    );
  }).join('');
  return `<div class="barra-cartera" aria-hidden="true">${barras}</div>${partes}`;
}

export function render(raiz, { estado, acciones }) {
  raiz.innerHTML = `
    ${encabezado(4, 'rayo', 'TU RIESGO')}
    ${idea('Lo que más rinde a largo plazo es lo que más se sacude en el camino. Lo importante es cuánto sacudón aguantás sin vender.')}

    <p class="pregunta" id="q-riesgo">Invertiste US$1.000 y en un mes valen US$600. ¿Qué hacés?</p>
    <div class="opciones" role="group" aria-labelledby="q-riesgo">
      ${RESPUESTAS_RIESGO.map(
        (r) => `<button type="button" class="opcion" data-respuesta="${r.id}" aria-pressed="${estado.respuestaRiesgo === r.id}">${r.texto}</button>`,
      ).join('')}
    </div>
    <p class="nota">No hay respuesta correcta. Es para que la cartera sea una que puedas sostener.</p>

    <div data-resultado></div>
    ${navegacion()}`;

  const zona = raiz.querySelector('[data-resultado]');

  const mostrarPerfil = () => {
    if (!estado.perfil) {
      zona.innerHTML = '';
      return;
    }
    const plan = planDe(estado);
    const caida = caidaEnCrisis(plan.pesos);
    const minimoCedear = PARTES.find((p) => p.id === 'eeuu').minimo;
    const [pocas, muchas] = leccionPartes(plan.aporte, minimoCedear);
    zona.innerHTML = `
      <div class="resultado">
        <p class="rotulo">Tu perfil</p>
        <p class="nombre-perfil">${PERFILES[estado.perfil].nombre.toUpperCase()}</p>
        ${cartera(estado.perfil)}
        <p class="nota">En una crisis fuerte, esta cartera podría caer cerca de <strong>${porcentaje(caida)}</strong>. Lo probás en el paso 6.</p>
      </div>
      ${estado.plazo < 5 ? `<div class="aviso">Ojo: tu plazo es de ${estado.plazo === 1 ? '1 año' : `${estado.plazo} años`}. Con menos de 5 años, una caída te puede agarrar justo cuando necesitás la plata: conviene un perfil prudente.</div>` : ''}
      <p class="pregunta" id="q-perfil">¿Querés probar otro perfil?</p>
      ${chips('perfil', ORDEN_PERFILES.map((id) => ({ valor: id, texto: PERFILES[id].nombre })), estado.perfil, 'q-perfil')}
      ${saber(
        '¿Y si lo repartís en más partes?',
        `<p>Las 500 empresas de EE.UU. ya son 500 partes en una sola compra. Sumar muchas cosas más casi no reparte el riesgo, y con poca plata trae un problema: los mínimos de compra.</p>
         <p>Con tu aporte de <strong>${usd(plan.aporte, { exacto: true })}</strong> por mes, y un CEDEAR que sale unos ${usd(minimoCedear)}:</p>
         <ul>
           <li>En <strong>${pocas.partes} partes</strong>, a cada una le tocan ${usd(pocas.porParte, { exacto: true })}: ${pocas.cadaMeses === 1 ? 'alcanza para comprar todas, todos los meses.' : `tenés que juntar ${pocas.cadaMeses} meses para comprar cada una.`}</li>
           <li>En <strong>${muchas.partes} partes</strong>, a cada una le tocan ${usd(muchas.porParte, { exacto: true })}: ${muchas.cadaMeses === 1 ? 'alcanza, pero son 10 compras por mes para seguir.' : `tenés que juntar ${muchas.cadaMeses} meses para comprar cada una, y son 10 cosas para seguir.`}</li>
         </ul>
         <p><strong>Con poca plata, menos partes es mejor.</strong></p>`,
      )}`;
    conectarChips(zona, 'perfil', (valor) => {
      acciones.cambiar({ perfil: valor });
      mostrarPerfil();
    });
  };

  for (const boton of raiz.querySelectorAll('[data-respuesta]')) {
    boton.addEventListener('click', () => {
      for (const otro of raiz.querySelectorAll('[data-respuesta]')) otro.setAttribute('aria-pressed', String(otro === boton));
      const respuesta = RESPUESTAS_RIESGO.find((r) => r.id === boton.dataset.respuesta);
      acciones.cambiar({ respuestaRiesgo: respuesta.id, perfil: respuesta.perfil, aguanta: null });
      ocultarError(raiz);
      mostrarPerfil();
    });
  }
  conectarNav(raiz, {
    validar: () => validar(estado),
    alSeguir: () => acciones.siguiente('riesgo'),
    alVolver: () => acciones.atras('riesgo'),
  });
  mostrarPerfil();
}
