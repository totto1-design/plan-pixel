// Pruebas del cálculo con casos conocidos. Abrir tests/index.html con el servidor local.

import {
  rendimientoReal, aporteDelMes, totalAportado, mesesParaColchon, caidaEnCrisis, generarFactores,
  factoresMedios, simular, percentil, proporcionQueLlega, resumir, aporteNecesario, pruebaCrisis,
  planDelMes, leccionPartes, deDiez,
} from '../js/calculo.js';
import { PARTES, PERFILES, SIMULACION } from '../js/datos.js';
import { usd, pesos, leerNumero, porcentaje, duracion } from '../js/formato.js';
import { estadoEjemplo, planDe } from '../js/estado.js';
import { aniosPosibles } from '../js/pantallas/crisis.js';

const resultados = [];

function prueba(nombre, fn) {
  try {
    const detalle = fn();
    resultados.push({ nombre, ok: true, detalle });
  } catch (error) {
    resultados.push({ nombre, ok: false, detalle: error.message });
  }
}

function cerca(real, esperado, tolerancia, que = '') {
  if (!(Math.abs(real - esperado) <= tolerancia)) {
    throw new Error(`${que} dio ${real}, se esperaba ${esperado} ± ${tolerancia}`);
  }
}

function igual(real, esperado, que = '') {
  if (real !== esperado) throw new Error(`${que} dio ${JSON.stringify(real)}, se esperaba ${JSON.stringify(esperado)}`);
}

// Una sola parte de prueba, sin rendimiento ni costos salvo que se indique.
const parte = (extra = {}) => ({ id: 'x', rendimiento: 0, volatilidad: 0, comision: 0, minimo: 0, ...extra });

function planSimple({ aporte = 100, meses = 12, partes = [parte()], pesos = [1], objetivoColchon = 0, crecimiento = 0 } = {}) {
  return { aporte, crecimiento, objetivoColchon, yaTengo: 0, pesos, meses, partes };
}

function finalDeterministico(plan, opciones) {
  const factores = factoresMedios({ meses: plan.meses, partes: plan.partes, inflacion: 0 });
  return simular(plan, factores, opciones).finales[0];
}

prueba('Rendimiento real: 6% con 2,5% de inflación es 3,41%', () => {
  cerca(rendimientoReal(0.06, 0.025), 0.034146, 1e-5);
});

prueba('El aporte sube una vez por año', () => {
  cerca(aporteDelMes(100, 0.1, 11), 100, 1e-9, 'mes 11');
  cerca(aporteDelMes(100, 0.1, 12), 110, 1e-9, 'mes 12');
  cerca(aporteDelMes(100, 0.1, 24), 121, 1e-9, 'mes 24');
  cerca(totalAportado(100, 0.1, 24), 1200 + 1320, 1e-9, 'total de 2 años');
});

prueba('Colchón: US$1.026 con US$128 por mes se completa en 9 meses', () => {
  igual(mesesParaColchon(1026, 0, 128, 0), 9, 'meses');
  igual(mesesParaColchon(1024, 0, 128, 0), 8, 'justo 8');
  igual(mesesParaColchon(1000, 1000, 128, 0), 0, 'ya completo');
  igual(mesesParaColchon(500, 0, 0, 0), Infinity, 'sin aporte');
});

prueba('Sin rendimiento ni costos, el final es lo que pusiste', () => {
  cerca(finalDeterministico(planSimple({ meses: 24 })), 2400, 1e-6);
});

prueba('Interés compuesto: 12% anual con US$100 por mes durante un año', () => {
  const plan = planSimple({ partes: [parte({ rendimiento: 0.12 })] });
  let esperado = 0;
  for (let m = 0; m < 12; m++) esperado += 100 * Math.pow(1.12, (12 - m) / 12);
  cerca(finalDeterministico(plan), esperado, 1e-6);
  return `US$${esperado.toFixed(2)}`;
});

prueba('Comisión de 1%: de US$1.000 quedan US$990', () => {
  cerca(finalDeterministico(planSimple({ meses: 10, partes: [parte({ comision: 0.01 })] })), 990, 1e-6);
});

prueba('Mínimo de compra: se junta hasta llegar y ahí se compra', () => {
  // US$10 por mes, mínimo US$15, comisión 10%: mes 1 junta 10; mes 2 compra 20 (quedan 18); mes 3 junta 10.
  cerca(finalDeterministico(planSimple({ aporte: 10, meses: 3, partes: [parte({ minimo: 15, comision: 0.1 })] })), 28, 1e-6);
});

prueba('Primero el colchón: con colchón de US$300 solo se invierten 2 de 5 aportes', () => {
  const plan = planSimple({ meses: 5, objetivoColchon: 300 });
  const factores = factoresMedios({ meses: 5, partes: plan.partes, inflacion: 0 });
  const r = simular(plan, factores);
  cerca(r.finales[0], 200, 1e-6, 'invertido');
  cerca(r.puestoPorAnio[1], 200, 1e-6, 'puesto');
});

prueba('Percentiles con interpolación', () => {
  const lista = Float64Array.from({ length: 101 }, (_, i) => i + 1);
  cerca(percentil(lista, 0.1), 11, 1e-9, 'P10');
  cerca(percentil(lista, 0.5), 51, 1e-9, 'P50');
  cerca(percentil(lista, 0.9), 91, 1e-9, 'P90');
});

prueba('Chances: llegar justo cuenta como llegar', () => {
  const finales = Float64Array.from([2400]);
  igual(proporcionQueLlega(finales, 2400), 1, 'justo');
  igual(proporcionQueLlega(finales, 2401), 0, 'un dólar más');
});

prueba('Aporte necesario sin volatilidad: US$2.400 en 24 meses son US$100 por mes', () => {
  const plan = planSimple({ aporte: 30, meses: 24 });
  const factores = factoresMedios({ meses: 24, partes: plan.partes, inflacion: 0 });
  cerca(aporteNecesario(plan, factores, 2400, 0.7), 100, 0.5);
});

prueba('Caída en la crisis de prueba según el perfil', () => {
  const caida = (id) => caidaEnCrisis(PARTES.map((p) => PERFILES[id].pesos[p.id]));
  cerca(caida('prudente'), 0.2125, 1e-9, 'prudente');
  cerca(caida('equilibrado'), 0.35, 1e-9, 'equilibrado');
  cerca(caida('decidido'), 0.4625, 1e-9, 'decidido');
});

prueba('Crisis: cae 50%, si aguantás se recupera; si vendés, no', () => {
  const partes = [parte({ id: 'bonos' }), parte({ id: 'riesgo' })];
  const plan = planSimple({ meses: 24, partes, pesos: [0, 1] });
  const r = pruebaCrisis(plan, 1, { caidas: { bonos: 0, riesgo: 0.5 }, mesesRecuperacion: 12, inflacion: 0 });
  cerca(r.antes, 1200, 1e-6, 'antes');
  cerca(r.despues, 600, 1e-6, 'después');
  let esperado = 1200;
  for (let j = 1; j <= 12; j++) esperado += 100 * Math.pow(2, j / 12);
  cerca(r.aguanta, esperado, 1e-6, 'si aguantás');
  cerca(r.vende, 1800, 1e-6, 'si vendés');
});

prueba('Futuros al azar: la mediana anual es el rendimiento supuesto y el sacudón es el supuesto', () => {
  const f = generarFactores({ futuros: 4000, meses: 12, semilla: 7, partes: [parte({ rendimiento: 0.05, volatilidad: 0.2 })], correlaciones: [[1]], inflacion: 0 });
  const anuales = new Float64Array(4000);
  for (let s = 0; s < 4000; s++) {
    let total = 1;
    for (let m = 0; m < 12; m++) total *= f.datos[m * 4000 + s];
    anuales[s] = total;
  }
  anuales.sort();
  cerca(percentil(anuales, 0.5), 1.05, 0.02, 'mediana');
  const logs = Array.from(anuales, Math.log);
  const media = logs.reduce((a, b) => a + b, 0) / logs.length;
  const desvio = Math.sqrt(logs.reduce((a, b) => a + (b - media) ** 2, 0) / logs.length);
  cerca(desvio, 0.2, 0.01, 'volatilidad');
  return `mediana ${percentil(anuales, 0.5).toFixed(4)}, volatilidad ${desvio.toFixed(4)}`;
});

prueba('Futuros al azar: dos partes con correlación 0,4 se mueven juntas', () => {
  const partes = [parte({ volatilidad: 0.2 }), parte({ volatilidad: 0.2 })];
  const f = generarFactores({ futuros: 3000, meses: 12, semilla: 11, partes, correlaciones: [[1, 0.4], [0.4, 1]], inflacion: 0 });
  const a = [];
  const b = [];
  for (let i = 0; i < f.datos.length; i += 2) {
    a.push(Math.log(f.datos[i]));
    b.push(Math.log(f.datos[i + 1]));
  }
  const media = (x) => x.reduce((s, v) => s + v, 0) / x.length;
  const ma = media(a);
  const mb = media(b);
  let cov = 0;
  let va = 0;
  let vb = 0;
  for (let i = 0; i < a.length; i++) {
    cov += (a[i] - ma) * (b[i] - mb);
    va += (a[i] - ma) ** 2;
    vb += (b[i] - mb) ** 2;
  }
  const correlacion = cov / Math.sqrt(va * vb);
  cerca(correlacion, 0.4, 0.03);
  return `correlación ${correlacion.toFixed(3)}`;
});

prueba('Misma semilla, mismos futuros', () => {
  const opciones = { futuros: 2, meses: 3, semilla: 99 };
  igual(generarFactores(opciones).datos[5], generarFactores(opciones).datos[5]);
});

prueba('Alargar el plazo no cambia los meses que ya estaban', () => {
  const corto = generarFactores({ futuros: 50, meses: 24, semilla: 5 });
  const largo = generarFactores({ futuros: 50, meses: 12, semilla: 5 }).extender(36);
  for (let i = 0; i < corto.datos.length; i++) igual(largo.datos[i], corto.datos[i], `dato ${i}`);
});

prueba('El cálculo rápido y el paso a paso dan lo mismo', () => {
  const estado = { ...estadoEjemplo(), perfil: 'decidido' };
  const plan = planDe(estado);
  const factores = generarFactores({ futuros: 40, meses: plan.meses, semilla: 3 });
  const rapido = simular(plan, factores);
  const detallado = simular(plan, factores, { detallado: true });
  for (let s = 0; s < 40; s++) cerca(rapido.finales[s], detallado.finales[s], 1e-6 * detallado.finales[s], `futuro ${s}`);
  for (let i = 0; i < rapido.porAnio.length; i++) cerca(rapido.porAnio[i], detallado.porAnio[i], 1e-6 * (detallado.porAnio[i] + 1), `año ${i}`);
  for (let i = 0; i < rapido.puestoPorAnio.length; i++) cerca(rapido.puestoPorAnio[i], detallado.puestoPorAnio[i], 1e-6, `puesto ${i}`);
});

prueba('"De 10 futuros": 65% son 6, no 7', () => {
  igual(deDiez(0.654), 6, '65%');
  igual(deDiez(0.7), 7, '70%');
  igual(deDiez(0.099), 0, '9,9%');
  igual(deDiez(1), 10, '100%');
});

prueba('Plan del mes del ejemplo: colchón primero, oro cada 2 meses', () => {
  const plan = { aporte: 124, crecimiento: 0, objetivoColchon: 1026, yaTengo: 0, pesos: [0.3, 0.5, 0.1, 0.1], meses: 180 };
  const r = planDelMes(plan);
  cerca(r.esteMes.alColchon, 124, 1e-9, 'al colchón');
  igual(r.esteMes.reparto.length, 0, 'nada a invertir este mes');
  igual(r.mesesColchon, 9, 'meses de colchón');
  const por = Object.fromEntries(r.reparto.map((x) => [x.id, x]));
  cerca(por.eeuu.monto, 62, 1e-9, 'EE.UU.');
  igual(por.eeuu.cadaMeses, 1, 'EE.UU. todos los meses');
  igual(por.oro.cadaMeses, 2, 'oro cada 2 meses');
  igual(por.bitcoin.cadaMeses, 1, 'bitcoin todos los meses');
});

prueba('Mini-lección: con US$124, 10 partes no llegan a un CEDEAR', () => {
  const [cuatro, diez] = leccionPartes(124, 15);
  igual(cuatro.cadaMeses, 1, '4 partes');
  igual(diez.cadaMeses, 2, '10 partes');
});

prueba('Años posibles para la crisis', () => {
  igual(JSON.stringify(aniosPosibles(15)), '[3,8,14]', 'plazo 15');
  igual(JSON.stringify(aniosPosibles(3)), '[2]', 'plazo 3');
  igual(JSON.stringify(aniosPosibles(1)), '[]', 'plazo 1');
});

prueba('Formatos de números', () => {
  igual(usd(31437), 'US$31.400', 'estimación grande');
  igual(usd(1026.4, { exacto: true }), 'US$1.026', 'exacto');
  igual(usd(-5400), '−US$5.400', 'negativo');
  igual(pesos(191588), '$191.588', 'pesos');
  igual(leerNumero('$ 191.588'), 191588, 'leer');
  igual(leerNumero(''), null, 'vacío');
  igual(porcentaje(0.025, 1), '2,5%', 'porcentaje');
  igual(duracion(9), '9 meses', 'duración');
  igual(duracion(14), '1 año y 2 meses', 'duración larga');
});

prueba('Ejemplo completo con 1.000 futuros: resultados razonables y rápidos', () => {
  const estado = { ...estadoEjemplo(), perfil: 'equilibrado' };
  const plan = planDe(estado);
  const inicio = performance.now();
  const factores = generarFactores({ futuros: SIMULACION.futuros, meses: plan.meses, semilla: SIMULACION.semilla });
  const generar = performance.now() - inicio;
  const r = resumir(simular(plan, factores), estado.meta);
  const necesario = aporteNecesario(plan, factores, estado.meta, 0.7);
  const total = performance.now() - inicio;
  if (!(r.malo < r.medio && r.medio < r.bueno)) throw new Error('los caminos no están ordenados');
  if (!(r.medio > 15000 && r.medio < 45000)) throw new Error(`camino medio raro: ${r.medio}`);
  if (total > 3000) throw new Error(`tardó demasiado: ${total.toFixed(0)} ms`);
  const crisis = pruebaCrisis(plan, 8);
  if (!(crisis.vende < crisis.aguanta)) throw new Error('vender en el piso debería terminar peor');
  return `aporte US$${plan.aporte.toFixed(0)} · malo ${usd(r.malo)} · medio ${usd(r.medio)} · bueno ${usd(r.bueno)} · ` +
    `llegan ${r.deDiez} de 10 (${(r.chances * 100).toFixed(1)}%) · necesario US$${necesario.toFixed(0)} · ` +
    `crisis año 8: ${usd(crisis.antes)} → ${usd(crisis.despues)}, aguanta ${usd(crisis.aguanta)}, vende ${usd(crisis.vende)} · ` +
    `generar ${generar.toFixed(0)} ms, todo ${total.toFixed(0)} ms`;
});

const lista = document.getElementById('lista');
for (const r of resultados) {
  const item = document.createElement('li');
  item.className = r.ok ? 'ok' : 'falla';
  item.textContent = `${r.ok ? 'OK' : 'FALLA'} · ${r.nombre}${r.detalle ? ` → ${r.detalle}` : ''}`;
  lista.append(item);
}
const fallas = resultados.filter((r) => !r.ok).length;
const resumen = document.getElementById('resumen');
resumen.textContent = fallas === 0 ? `${resultados.length} de ${resultados.length} pruebas OK` : `${fallas} de ${resultados.length} pruebas fallaron`;
resumen.className = fallas === 0 ? 'ok' : 'falla';
resumen.dataset.estado = fallas === 0 ? 'ok' : 'falla';
