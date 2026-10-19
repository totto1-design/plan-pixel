// Paso 7: tu plan. Qué hacer este mes, cuánto va a cada parte y dónde se compra.

import { encabezado, saber } from '../ui.js';
import { PARTES, PERFILES } from '../datos.js';
import { planDelMes } from '../calculo.js';
import { futuros } from '../motor.js';
import { usd, pesos, porcentaje, mesYAnio, sumarMeses } from '../formato.js';
import { planDe, enPesos } from '../estado.js';
import { fraseChances } from './futuro.js';

const parte = (id) => PARTES.find((p) => p.id === id);

function cuandoComprar(r) {
  return r.cadaMeses === 1 ? 'todos los meses' : `juntá ${r.cadaMeses} meses y comprá (mínimo ~${usd(parte(r.id).minimo)})`;
}

function comoSeCompra(p) {
  const comision = p.comision > 0 ? `comisión ~${porcentaje(p.comision, 2)}` : 'sin comisión de entrada';
  return `${p.instrumento} · ${p.plataforma} · ${comision}`;
}

// Texto para copiar o compartir.
export function textoDelPlan(estado, calculo, resultado) {
  const hoy = new Date();
  const lineas = [`Mi plan · Plan Pixel · ${mesYAnio(hoy)}`, ''];
  if (calculo.esteMes.alColchon > 0) {
    lineas.push(`Este mes: ${usd(calculo.esteMes.alColchon, { exacto: true })} a mi colchón (fondo money market en dólares).`);
  }
  if (calculo.reparto.length > 0) {
    const desde = calculo.desde === 0 ? 'Desde este mes' : `Desde ${mesYAnio(sumarMeses(hoy, calculo.desde))}`;
    lineas.push(`${desde}, cada mes:`);
    for (const r of calculo.reparto) {
      const p = parte(r.id);
      const como = p.instrumento === p.nombre ? p.plataforma : p.instrumento;
      lineas.push(`• ${p.corto}: ${usd(r.monto, { exacto: true })} (${como}; ${cuandoComprar(r)})`);
    }
  }
  lineas.push('');
  lineas.push(`Meta: ${usd(estado.meta, { exacto: true })} en dólares de hoy, para ${hoy.getFullYear() + estado.plazo}. Perfil ${PERFILES[estado.perfil].nombre}.`);
  lineas.push(fraseChances(resultado.chances, estado.meta).replace(/<\/?strong>/g, '').replace('llegás a tu meta', 'llego a mi meta'));
  if (resultado.chances < 0.7 && Number.isFinite(resultado.necesario)) {
    lineas.push(`Para llegar en 7 de cada 10 futuros necesito ${usd(Math.ceil(resultado.necesario / 5) * 5, { exacto: true })} por mes.`);
  }
  if (estado.crecimiento > 0) lineas.push(`Cada año subo el aporte ${porcentaje(estado.crecimiento)}.`);
  lineas.push('En una crisis, no vendo.');
  lineas.push('');
  lineas.push('Es una estimación para aprender, no un asesoramiento financiero.');
  return lineas.join('\n');
}

export function render(raiz, { estado, acciones }) {
  const plan = planDe(estado);
  const calculo = planDelMes(plan);
  const resultado = futuros(plan, estado.meta);
  const hoy = new Date();
  const desdeTexto = calculo.desde === 0 ? 'DESDE ESTE MES' : `DESDE ${mesYAnio(sumarMeses(hoy, calculo.desde)).toUpperCase()}`;
  const filaParte = (r) => {
    const p = parte(r.id);
    return `
      <li class="fila-parte">
        <span class="muestra seg-${p.id}"></span>
        <div>
          <p class="fila-titulo"><span>${p.nombre}</span><strong>${usd(r.monto, { exacto: true })}</strong></p>
          <p class="nota">≈ ${pesos(enPesos(estado, r.monto))} · ${cuandoComprar(r)}</p>
          <p class="nota">${comoSeCompra(p)}</p>
        </div>
      </li>`;
  };
  const esteMesInvierte = calculo.esteMes.reparto.length > 0;

  raiz.innerHTML = `
    ${encabezado(7, 'planilla', 'TU PLAN')}

    <div class="resultado plan">
      <span class="etiqueta">ESTE MES · ${mesYAnio(hoy).toUpperCase()}</span>
      ${
        calculo.esteMes.alColchon > 0
          ? `<p class="cifra">${usd(calculo.esteMes.alColchon, { exacto: true })} → tu colchón</p>
             <p class="nota">≈ ${pesos(enPesos(estado, calculo.esteMes.alColchon))} · Fondo money market en dólares o cuenta remunerada · banco o broker · sin comisión</p>
             ${calculo.mesesColchon > 1 ? `<p class="nota">Seguís así ${calculo.mesesColchon - 1 === 1 ? '1 mes más' : `${calculo.mesesColchon - 1} meses más`} hasta completarlo.</p>` : ''}`
          : ''
      }
      ${esteMesInvierte ? `<p class="rotulo">${calculo.esteMes.alColchon > 0 ? 'Y lo que sobra, a invertir:' : 'A invertir:'}</p><ul class="lista-partes">${calculo.esteMes.reparto.map(filaParte).join('')}</ul>` : ''}
    </div>

    ${
      calculo.desde > 0 && calculo.reparto.length > 0
        ? `<div class="resultado plan">
             <span class="etiqueta">${desdeTexto}, CADA MES</span>
             <ul class="lista-partes">${calculo.reparto.map(filaParte).join('')}</ul>
           </div>`
        : ''
    }

    <ul class="recordatorios">
      <li>Meta: <strong>${usd(estado.meta, { exacto: true })}</strong> para ${hoy.getFullYear() + estado.plazo} · perfil ${PERFILES[estado.perfil].nombre}.</li>
      <li>${fraseChances(resultado.chances, estado.meta)}</li>
      ${
        resultado.chances < 0.7 && Number.isFinite(resultado.necesario)
          ? `<li>Para llegar en 7 de cada 10 futuros: <strong>${usd(Math.ceil(resultado.necesario / 5) * 5, { exacto: true })}</strong> por mes.</li>`
          : ''
      }
      ${estado.crecimiento > 0 ? `<li>Cada año, subí el aporte ${porcentaje(estado.crecimiento)}.</li>` : ''}
      <li>En una crisis, no vendas.</li>
    </ul>

    <div class="botonera">
      <button type="button" class="boton" data-accion="copiar">COPIAR</button>
      <button type="button" class="boton secundario" data-accion="compartir">COMPARTIR</button>
    </div>
    <p class="nota centrado" data-copiado aria-live="polite">Tu plan se guarda solo en este navegador.</p>
    <textarea class="texto-plan" data-texto-plan readonly rows="12" aria-label="Tu plan en texto" hidden></textarea>

    ${saber(
      '¿Qué instrumentos hay en Argentina?',
      `<ul class="instrumentos">
         <li><strong>Fondo money market</strong> (en pesos o en dólares): para el colchón. Se saca en el día y rinde poco.</li>
         <li><strong>Plazo fijo:</strong> en pesos, a 30 días o más. Sirve para plata en pesos que vas a usar pronto.</li>
         <li><strong>Fondos comunes de inversión:</strong> juntan la plata de muchas personas y la invierten en bonos, acciones o una mezcla.</li>
         <li><strong>CEDEARs:</strong> se compran en pesos en la bolsa argentina y representan acciones o fondos de afuera, como uno que sigue al S&amp;P 500. Siguen al dólar.</li>
         <li><strong>Bonos:</strong> préstamos a un gobierno o a una empresa. Los de EE.UU. están entre los más seguros. Los argentinos rinden más porque tienen más riesgo.</li>
         <li><strong>Cripto:</strong> monedas digitales como bitcoin. Se compran en plataformas de cripto y se mueven muchísimo.</li>
       </ul>
       <p class="nota">Ninguno de estos es una recomendación: son los tipos de inversión que existen, para que sepas qué buscar.</p>`,
    )}
    ${saber(
      '¿Cómo elijo dónde comprar?',
      `<p>Para CEDEARs y fondos en dólares necesitás una cuenta en un <strong>broker de bolsa</strong> (en la CNV figuran como ALyC). Para bitcoin, una <strong>plataforma de cripto</strong> registrada en la CNV como proveedor de servicios de activos virtuales (PSAV).</p>
       <p>Fijate que estén registrados en la CNV (cnv.gov.ar), que las comisiones estén claras, y empezá con poco para aprender a usarlos.</p>`,
    )}

    <div class="aviso">Es para aprender: no es asesoramiento financiero. Los resultados son estimaciones con supuestos, y la decisión es tuya.</div>

    <div class="nav">
      <button type="button" class="boton secundario" data-accion="atras" aria-label="Volver al paso anterior">‹</button>
      <button type="button" class="boton secundario" data-accion="editar">CAMBIAR ALGO</button>
    </div>
    <button type="button" class="enlace" data-accion="reiniciar">Empezar de nuevo (borra tu plan)</button>`;

  const aviso = raiz.querySelector('[data-copiado]');
  const texto = () => textoDelPlan(estado, calculo, resultado);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto());
      aviso.textContent = 'Copiado. Pegalo donde quieras (notas, WhatsApp, mail).';
    } catch {
      // Si el navegador no deja copiar solo, mostramos el texto para copiarlo a mano.
      const caja = raiz.querySelector('[data-texto-plan]');
      caja.value = texto();
      caja.hidden = false;
      caja.focus();
      caja.select();
      aviso.textContent = 'Este navegador no dejó copiar solo: el texto quedó seleccionado acá abajo para que lo copies.';
    }
  };
  raiz.querySelector('[data-accion="copiar"]').addEventListener('click', copiar);
  raiz.querySelector('[data-accion="compartir"]').addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi plan · Plan Pixel', text: texto() });
      } catch {
        // La persona cerró el menú de compartir: no hace falta avisar nada.
      }
    } else {
      await copiar();
    }
  });
  raiz.querySelector('[data-accion="atras"]').addEventListener('click', () => acciones.atras('plan'));
  raiz.querySelector('[data-accion="editar"]').addEventListener('click', () => acciones.ir('aporte'));
  raiz.querySelector('[data-accion="reiniciar"]').addEventListener('click', () => {
    if (window.confirm('¿Empezar de nuevo? Se borra el plan guardado en este navegador.')) acciones.reiniciar();
  });
}
