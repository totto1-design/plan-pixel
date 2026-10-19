// Lo que la persona va cargando. Se guarda solo en su navegador (localStorage).

import { DOLAR_MEP, EJEMPLO, PARTES, PERFILES } from './datos.js';

const CLAVE = 'planpixel.plan.v1';

export function estadoEjemplo() {
  return {
    version: 1,
    iniciado: false,
    ejemplo: true,
    tocado: {},
    visitados: [],
    ultimo: null,
    moneda: 'ARS',
    mep: DOLAR_MEP.valor,
    aporte: EJEMPLO.aporte,
    crecimiento: EJEMPLO.crecimiento,
    gasto: EJEMPLO.gasto,
    meses: EJEMPLO.meses,
    yaTengo: 0,
    metaTipo: EJEMPLO.metaTipo,
    meta: EJEMPLO.meta,
    plazo: EJEMPLO.plazo,
    respuestaRiesgo: null,
    perfil: null,
    crisisAnio: null,
    aguanta: null,
  };
}

export function estadoVacio() {
  return { ...estadoEjemplo(), ejemplo: false, aporte: null, gasto: null, meta: null, metaTipo: null, plazo: 10 };
}

export function cargar() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return null;
    const guardado = JSON.parse(texto);
    if (!guardado || guardado.version !== 1) return null;
    return { ...estadoEjemplo(), ...guardado };
  } catch {
    return null;
  }
}

export function guardar(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Sin almacenamiento (modo privado, por ejemplo): la app sigue andando, solo no recuerda.
  }
}

export function enDolares(estado, valor) {
  if (valor == null) return null;
  return estado.moneda === 'ARS' ? valor / estado.mep : valor;
}

export function enPesos(estado, dolares) {
  return dolares * estado.mep;
}

// El estado convertido en el "plan" que entiende el motor de cálculo.
export function planDe(estado) {
  const perfil = PERFILES[estado.perfil ?? 'equilibrado'];
  return {
    aporte: enDolares(estado, estado.aporte) ?? 0,
    crecimiento: estado.crecimiento,
    objetivoColchon: (enDolares(estado, estado.gasto) ?? 0) * estado.meses,
    yaTengo: enDolares(estado, estado.yaTengo) ?? 0,
    pesos: PARTES.map((p) => perfil.pesos[p.id]),
    meses: estado.plazo * 12,
  };
}

// El primer paso que falta completar, para no dejar saltear pasos.
export function pasoIncompleto(estado) {
  if (!(estado.aporte > 0)) return 'aporte';
  if (!(estado.gasto > 0)) return 'colchon';
  if (!(estado.meta > 0) || !(estado.plazo >= 1)) return 'meta';
  if (!estado.perfil) return 'riesgo';
  return null;
}
