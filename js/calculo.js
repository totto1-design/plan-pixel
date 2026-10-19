// Motor de cálculo de Plan Pixel: funciones puras, sin nada de pantallas.
// Todo se calcula en "dólares de hoy" (ya descontada la inflación de EE.UU.).
// Las reglas están acordadas con el usuario: ver CLAUDE.md, "Reglas del cálculo".
//
// Un "plan" es un objeto con:
//   aporte           dólares por mes al empezar
//   crecimiento      cuánto sube el aporte cada 12 meses (0.02 = 2%)
//   objetivoColchon  dólares que tiene que juntar el colchón antes de invertir
//   yaTengo          dólares que ya hay en el colchón
//   pesos            proporción de cada parte (mismo orden que PARTES; suman 1)
//   meses            duración del plan
//   partes           (opcional) lista de partes con comisión y mínimo; por defecto PARTES

import { PARTES, CORRELACIONES, INFLACION_EEUU, CRISIS } from './datos.js';

export function rendimientoReal(nominal, inflacion = INFLACION_EEUU) {
  return (1 + nominal) / (1 + inflacion) - 1;
}

// El aporte sube una vez por año (meses 0 a 11 igual, del 12 al 23 un escalón más, etc.).
export function aporteDelMes(aporte, crecimiento, mes) {
  return aporte * Math.pow(1 + crecimiento, Math.floor(mes / 12));
}

export function totalAportado(aporte, crecimiento, meses) {
  let total = 0;
  for (let m = 0; m < meses; m++) total += aporteDelMes(aporte, crecimiento, m);
  return total;
}

// Cuántos aportes hacen falta para completar el colchón (0 si ya está completo).
export function mesesParaColchon(objetivo, yaTengo, aporte, crecimiento, tope = 1200) {
  let falta = objetivo - yaTengo;
  if (falta <= 0) return 0;
  if (!(aporte > 0)) return Infinity;
  for (let m = 0; m < tope; m++) {
    falta -= aporteDelMes(aporte, crecimiento, m);
    if (falta <= 1e-9) return m + 1;
  }
  return Infinity;
}

// Cuánto caería la cartera entera en la crisis de prueba.
export function caidaEnCrisis(pesos, caidas = CRISIS.caidas, partes = PARTES) {
  return partes.reduce((suma, parte, k) => suma + pesos[k] * (caidas[parte.id] ?? 0), 0);
}

// En 2 de cada 3 años, el rendimiento real de una parte queda dentro de este rango.
export function rangoTipico(parte, inflacion = INFLACION_EEUU) {
  const mu = Math.log(1 + rendimientoReal(parte.rendimiento, inflacion));
  return { bajo: Math.exp(mu - parte.volatilidad) - 1, alto: Math.exp(mu + parte.volatilidad) - 1 };
}

// Números al azar con semilla fija (mulberry32), para que los resultados no cambien cada vez.
export function crearAzar(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Normales estándar con el método de Box-Muller.
function crearNormal(azar) {
  let guardado = null;
  return function () {
    if (guardado !== null) {
      const valor = guardado;
      guardado = null;
      return valor;
    }
    let u = 0;
    while (u === 0) u = azar();
    const v = azar();
    const radio = Math.sqrt(-2 * Math.log(u));
    guardado = radio * Math.sin(2 * Math.PI * v);
    return radio * Math.cos(2 * Math.PI * v);
  };
}

export function cholesky(matriz) {
  const n = matriz.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let suma = matriz[i][j];
      for (let k = 0; k < j; k++) suma -= L[i][k] * L[j][k];
      L[i][j] = i === j ? Math.sqrt(suma) : suma / L[j][j];
    }
  }
  return L;
}

// Genera, para cada mes y cada futuro, cuánto se multiplica cada parte (en dólares de hoy).
// El rendimiento supuesto es la mediana: la mitad de los años rinde más y la mitad menos.
// Se guarda mes por mes (datos[(mes * futuros + futuro) * partes + parte]): así, alargar el
// plazo agrega meses al final sin cambiar los anteriores, y los resultados no saltan.
export function generarFactores({
  futuros,
  meses,
  semilla,
  partes = PARTES,
  correlaciones = CORRELACIONES,
  inflacion = INFLACION_EEUU,
}) {
  const n = partes.length;
  const L = cholesky(correlaciones);
  const media = partes.map((p) => Math.log(1 + rendimientoReal(p.rendimiento, inflacion)) / 12);
  const desvio = partes.map((p) => p.volatilidad / Math.sqrt(12));
  const normal = crearNormal(crearAzar(semilla));
  const e = new Float64Array(n);
  const factores = { datos: new Float32Array(0), futuros, meses: 0, partes: n };

  factores.extender = (hasta) => {
    if (hasta <= factores.meses) return factores;
    const datos = new Float32Array(hasta * futuros * n);
    datos.set(factores.datos);
    let i = factores.meses * futuros * n;
    for (let m = factores.meses; m < hasta; m++) {
      for (let s = 0; s < futuros; s++) {
        for (let k = 0; k < n; k++) e[k] = normal();
        for (let k = 0; k < n; k++) {
          let z = 0;
          for (let j = 0; j <= k; j++) z += L[k][j] * e[j];
          datos[i++] = Math.exp(media[k] + desvio[k] * z);
        }
      }
    }
    factores.datos = datos;
    factores.meses = hasta;
    return factores;
  };

  return factores.extender(meses);
}

// Un solo futuro en el que cada parte rinde exactamente lo supuesto (el "camino medio").
export function factoresMedios({ meses, partes = PARTES, inflacion = INFLACION_EEUU }) {
  const n = partes.length;
  const porMes = partes.map((p) => Math.pow(1 + rendimientoReal(p.rendimiento, inflacion), 1 / 12));
  const datos = new Float64Array(meses * n);
  for (let m = 0; m < meses; m++) for (let k = 0; k < n; k++) datos[m * n + k] = porMes[k];
  return { datos, futuros: 1, meses, partes: n };
}

function suma(lista) {
  let total = 0;
  for (let i = 0; i < lista.length; i++) total += lista[i];
  return total;
}

// Las compras no dependen de cómo le vaya al mercado: cada mes, primero el colchón; lo que sobra
// se reparte según los pesos; cada parte junta hasta llegar a su mínimo y ahí compra todo lo
// juntado, pagando la comisión. Se calcula una vez y vale para los 1.000 futuros.
function cronograma(plan, partes) {
  const n = partes.length;
  const meses = plan.meses;
  const compras = new Float64Array(meses * n);
  const juntadoTotal = new Float64Array(meses);
  const puestoAcumulado = new Float64Array(meses);
  const juntado = new Float64Array(n);
  let colchon = plan.yaTengo ?? 0;
  let puesto = 0;
  for (let m = 0; m < meses; m++) {
    let disponible = aporteDelMes(plan.aporte, plan.crecimiento, m);
    if (colchon < plan.objetivoColchon) {
      const alColchon = Math.min(disponible, plan.objetivoColchon - colchon);
      colchon += alColchon;
      disponible -= alColchon;
    }
    if (disponible > 0) {
      puesto += disponible;
      for (let k = 0; k < n; k++) {
        if (!(plan.pesos[k] > 0)) continue;
        juntado[k] += disponible * plan.pesos[k];
        if (juntado[k] >= partes[k].minimo - 1e-9) {
          compras[m * n + k] = juntado[k] * (1 - partes[k].comision);
          juntado[k] = 0;
        }
      }
    }
    juntadoTotal[m] = suma(juntado);
    puestoAcumulado[m] = puesto;
  }
  return { compras, juntadoTotal, puestoAcumulado };
}

// Simula el plan mes a mes en cada futuro: cada mes se suman las compras y después todo rinde.
// Devuelve el valor final de lo invertido (sin el colchón) y el valor al cierre de cada año.
export function simular(plan, factores, opciones = {}) {
  if (opciones.crisis || opciones.detallado) return simularDetallado(plan, factores, opciones);
  const partes = plan.partes ?? PARTES;
  const n = partes.length;
  const meses = plan.meses;
  if (factores.meses < meses) throw new Error('Los factores no alcanzan para tantos meses');
  const { datos, futuros } = factores;
  const anios = Math.ceil(meses / 12);
  const porAnio = opciones.soloFinales ? null : new Float64Array(futuros * (anios + 1));
  const puestoPorAnio = new Float64Array(anios + 1);
  const finales = new Float64Array(futuros);
  const { compras, juntadoTotal, puestoAcumulado } = cronograma(plan, partes);
  const invertido = new Float64Array(n);

  for (let m = 11; m < meses; m += 12) puestoPorAnio[(m + 1) / 12] = puestoAcumulado[m];
  puestoPorAnio[anios] = puestoAcumulado[meses - 1];

  for (let s = 0; s < futuros; s++) {
    invertido.fill(0);
    for (let m = 0; m < meses; m++) {
      const base = (m * futuros + s) * n;
      const compra = m * n;
      for (let k = 0; k < n; k++) invertido[k] = (invertido[k] + compras[compra + k]) * datos[base + k];
      if (porAnio && ((m + 1) % 12 === 0 || m === meses - 1)) {
        porAnio[s * (anios + 1) + Math.ceil((m + 1) / 12)] = suma(invertido) + juntadoTotal[m];
      }
    }
    finales[s] = suma(invertido) + juntadoTotal[meses - 1];
  }
  return { finales, porAnio, puestoPorAnio, anios, futuros, crisis: null };
}

// La misma simulación, paso a paso, con la prueba de crisis.
// opciones.crisis = { mes, caidas, mesesRecuperacion, refugio, vende }
function simularDetallado(plan, factores, opciones) {
  const partes = plan.partes ?? PARTES;
  const n = partes.length;
  const meses = plan.meses;
  if (factores.meses < meses) throw new Error('Los factores no alcanzan para tantos meses');
  const { datos, futuros } = factores;
  const anios = Math.ceil(meses / 12);
  const porAnio = opciones.soloFinales ? null : new Float64Array(futuros * (anios + 1));
  const puestoPorAnio = new Float64Array(anios + 1);
  const finales = new Float64Array(futuros);
  const invertido = new Float64Array(n);
  const juntado = new Float64Array(n);

  const crisis = opciones.crisis ?? null;
  const refugio = crisis ? crisis.refugio ?? 0 : 0;
  const recuperacion = crisis
    ? partes.map((p) => Math.pow(1 / (1 - (crisis.caidas[p.id] ?? 0)), 1 / crisis.mesesRecuperacion))
    : null;
  const pesosRefugio = partes.map((_, k) => (k === refugio ? 1 : 0));
  let marcaCrisis = null;

  for (let s = 0; s < futuros; s++) {
    invertido.fill(0);
    juntado.fill(0);
    let colchon = plan.yaTengo ?? 0;
    let puesto = 0;
    let pesos = plan.pesos;

    for (let m = 0; m < meses; m++) {
      if (crisis && m === crisis.mes) {
        const antes = suma(invertido) + suma(juntado);
        for (let k = 0; k < n; k++) invertido[k] *= 1 - (crisis.caidas[partes[k].id] ?? 0);
        const despues = suma(invertido) + suma(juntado);
        if (crisis.vende) {
          let vendido = 0;
          for (let k = 0; k < n; k++) {
            if (k === refugio) continue;
            vendido += invertido[k] + juntado[k];
            invertido[k] = 0;
            juntado[k] = 0;
          }
          invertido[refugio] += vendido;
          pesos = pesosRefugio;
        }
        marcaCrisis = { antes, despues };
      }

      let disponible = aporteDelMes(plan.aporte, plan.crecimiento, m);
      if (colchon < plan.objetivoColchon) {
        const alColchon = Math.min(disponible, plan.objetivoColchon - colchon);
        colchon += alColchon;
        disponible -= alColchon;
      }
      if (disponible > 0) {
        puesto += disponible;
        for (let k = 0; k < n; k++) {
          if (!(pesos[k] > 0)) continue;
          juntado[k] += disponible * pesos[k];
          if (juntado[k] >= partes[k].minimo - 1e-9) {
            invertido[k] += juntado[k] * (1 - partes[k].comision);
            juntado[k] = 0;
          }
        }
      }

      const base = (m * futuros + s) * n;
      const recuperando = crisis && m >= crisis.mes && m < crisis.mes + crisis.mesesRecuperacion;
      for (let k = 0; k < n; k++) {
        invertido[k] *= recuperando ? datos[base + k] * recuperacion[k] : datos[base + k];
      }

      if ((m + 1) % 12 === 0 || m === meses - 1) {
        const anio = Math.ceil((m + 1) / 12);
        if (porAnio) porAnio[s * (anios + 1) + anio] = suma(invertido) + suma(juntado);
        if (s === 0) puestoPorAnio[anio] = puesto;
      }
    }
    finales[s] = suma(invertido) + suma(juntado);
  }
  return { finales, porAnio, puestoPorAnio, anios, futuros, crisis: marcaCrisis };
}

// Percentil con interpolación sobre una lista ya ordenada (q entre 0 y 1).
export function percentil(ordenados, q) {
  const n = ordenados.length;
  if (n === 0) return NaN;
  const posicion = q * (n - 1);
  const i = Math.floor(posicion);
  const resto = posicion - i;
  return i + 1 < n ? ordenados[i] * (1 - resto) + ordenados[i + 1] * resto : ordenados[i];
}

// "De 10 futuros, en N llegás": se redondea para abajo, para no prometer de más
// (65% se muestra como 6 de 10, no como 7).
export function deDiez(chances) {
  return Math.floor(chances * 10 + 1e-9);
}

export function proporcionQueLlega(finales, meta) {
  let llegan = 0;
  for (let i = 0; i < finales.length; i++) if (finales[i] >= meta - 0.005) llegan++;
  return llegan / finales.length;
}

// Tres caminos (malo, medio, bueno) año por año y cuántos futuros llegan a la meta.
export function resumir(resultado, meta) {
  const { finales, porAnio, puestoPorAnio, anios, futuros } = resultado;
  const caminos = { malo: [], medio: [], bueno: [] };
  const columna = new Float64Array(futuros);
  for (let anio = 0; anio <= anios; anio++) {
    for (let s = 0; s < futuros; s++) columna[s] = porAnio[s * (anios + 1) + anio];
    columna.sort();
    caminos.malo.push(percentil(columna, 0.1));
    caminos.medio.push(percentil(columna, 0.5));
    caminos.bueno.push(percentil(columna, 0.9));
  }
  const chances = proporcionQueLlega(finales, meta);
  return {
    caminos,
    puesto: Array.from(puestoPorAnio),
    chances,
    deDiez: deDiez(chances),
    malo: caminos.malo[anios],
    medio: caminos.medio[anios],
    bueno: caminos.bueno[anios],
  };
}

// El aporte mensual más chico con el que se llega a la meta en "objetivo" de los futuros.
export function aporteNecesario(plan, factores, meta, objetivo = 0.7) {
  if (!(meta > 0)) return 0;
  const llega = (aporte) =>
    proporcionQueLlega(simular({ ...plan, aporte }, factores, { soloFinales: true }).finales, meta) >= objetivo;
  let alto = Math.max(plan.aporte, 10);
  let vueltas = 0;
  while (!llega(alto)) {
    alto *= 2;
    if (++vueltas > 20) return Infinity;
  }
  let bajo = 0;
  while (alto - bajo > 0.5) {
    const medio = (alto + bajo) / 2;
    if (llega(medio)) alto = medio;
    else bajo = medio;
  }
  return alto;
}

// Prueba de crisis sobre el camino medio: cuánto cae, y cómo termina si aguantás o si vendés.
export function pruebaCrisis(plan, anio, opciones = {}) {
  const partes = plan.partes ?? PARTES;
  const indiceBonos = partes.findIndex((p) => p.id === 'bonos');
  const crisis = {
    mes: anio * 12,
    caidas: opciones.caidas ?? CRISIS.caidas,
    mesesRecuperacion: opciones.mesesRecuperacion ?? CRISIS.mesesRecuperacion,
    refugio: opciones.refugio ?? (indiceBonos >= 0 ? indiceBonos : 0),
  };
  const factores = factoresMedios({ meses: plan.meses, partes, inflacion: opciones.inflacion });
  const aguanta = simular(plan, factores, { crisis, soloFinales: true });
  const vende = simular(plan, factores, { crisis: { ...crisis, vende: true }, soloFinales: true });
  return {
    antes: aguanta.crisis ? aguanta.crisis.antes : 0,
    despues: aguanta.crisis ? aguanta.crisis.despues : 0,
    aguanta: aguanta.finales[0],
    vende: vende.finales[0],
  };
}

// Qué hacer con la plata: este mes y desde que se completa el colchón.
// cadaMeses = cada cuántos meses se llega al mínimo para comprar esa parte.
export function planDelMes(plan) {
  const partes = plan.partes ?? PARTES;
  const yaTengo = plan.yaTengo ?? 0;
  const faltaColchon = Math.max(0, plan.objetivoColchon - yaTengo);
  const alColchon = Math.min(plan.aporte, faltaColchon);
  const aInvertir = plan.aporte - alColchon;
  const mesesColchon = mesesParaColchon(plan.objetivoColchon, yaTengo, plan.aporte, plan.crecimiento);
  const desde = mesesColchon;
  const repartir = (monto) =>
    partes
      .map((parte, k) => {
        const parteDelMonto = monto * plan.pesos[k];
        let cadaMeses = 1;
        if (parteDelMonto < parte.minimo - 1e-9) cadaMeses = Math.ceil(parte.minimo / parteDelMonto - 1e-9);
        return { id: parte.id, monto: parteDelMonto, cadaMeses };
      })
      .filter((r) => r.monto > 0);
  return {
    esteMes: { alColchon, aInvertir, reparto: aInvertir > 0 ? repartir(aInvertir) : [] },
    mesesColchon,
    desde,
    reparto: Number.isFinite(desde) ? repartir(aporteDelMes(plan.aporte, plan.crecimiento, desde)) : [],
  };
}

// Mini-lección: qué pasa si la misma plata se reparte en más partes.
export function leccionPartes(inversionMensual, minimo, cantidades = [4, 10]) {
  return cantidades.map((cantidad) => {
    const porParte = inversionMensual / cantidad;
    const cadaMeses = porParte >= minimo ? 1 : Math.ceil(minimo / porParte);
    return { partes: cantidad, porParte, cadaMeses };
  });
}
