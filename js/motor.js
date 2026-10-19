// Puente entre las pantallas y el cálculo: genera los 1.000 futuros una sola vez (y los alarga
// si el plazo crece) y recuerda el último resultado para no recalcular de más.

import { SIMULACION } from './datos.js';
import { generarFactores, simular, resumir, aporteNecesario, proporcionQueLlega } from './calculo.js';

let factores = null;
let ultimo = { clave: null, resultado: null };

function factoresPara(meses) {
  if (!factores) factores = generarFactores({ futuros: SIMULACION.futuros, meses, semilla: SIMULACION.semilla });
  return factores.extender(meses);
}

export function futuros(plan, meta) {
  const clave = JSON.stringify({ plan, meta });
  if (ultimo.clave !== clave) {
    const datos = factoresPara(plan.meses);
    const resultado = resumir(simular(plan, datos), meta);
    resultado.necesario = aporteNecesario(plan, datos, meta, SIMULACION.chancesObjetivo);
    ultimo = { clave, resultado };
  }
  return ultimo.resultado;
}

export function chancesCon(plan, meta) {
  return proporcionQueLlega(simular(plan, factoresPara(plan.meses), { soloFinales: true }).finales, meta);
}
