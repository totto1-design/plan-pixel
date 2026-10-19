// Supuestos y datos de Plan Pixel.
// Los supuestos y las reglas se acordaron con el usuario (ver CLAUDE.md, "Reglas del cálculo"):
// no se cambian sin preguntarle. Los datos públicos llevan su fuente y su fecha.

export const REVISADO = '19/10/2026';

// Inflación anual de EE.UU. que se descuenta para hablar en "dólares de hoy".
export const INFLACION_EEUU = 0.025;

// Las cuatro partes genéricas de las carteras de ejemplo.
// rendimiento: tasa anual compuesta esperada en dólares (antes de descontar la inflación).
// volatilidad: cuánto se sacude en un año.
// comision y minimo: costos aproximados al comprar (varían según la plataforma).
export const PARTES = [
  {
    id: 'bonos',
    nombre: 'Bonos cortos de EE.UU.',
    corto: 'Bonos',
    rendimiento: 0.04,
    volatilidad: 0.03,
    comision: 0,
    minimo: 1,
    queEs: 'Préstamos de corto plazo al gobierno de EE.UU. Casi no se mueven y rinden poco: son la parte tranquila del plan.',
    instrumento: 'Fondo común de inversión en dólares de bonos cortos',
    plataforma: 'broker o banco',
  },
  {
    id: 'eeuu',
    nombre: 'Las 500 empresas más grandes de EE.UU.',
    corto: 'EE.UU.',
    rendimiento: 0.06,
    volatilidad: 0.16,
    comision: 0.0075,
    minimo: 15,
    queEs: 'Un fondo que sigue al índice S&P 500: con una sola compra tenés un pedacito de 500 empresas. Es el motor del plan.',
    instrumento: 'CEDEAR de un fondo que sigue al S&P 500',
    plataforma: 'broker de bolsa',
  },
  {
    id: 'oro',
    nombre: 'Oro',
    corto: 'Oro',
    rendimiento: 0.04,
    volatilidad: 0.15,
    comision: 0.0075,
    minimo: 15,
    queEs: 'Suele aguantar cuando otras cosas caen, pero no genera ganancias propias: vale lo que otro esté dispuesto a pagar por él.',
    instrumento: 'CEDEAR de un fondo de oro',
    plataforma: 'broker de bolsa',
  },
  {
    id: 'bitcoin',
    nombre: 'Bitcoin',
    corto: 'Bitcoin',
    rendimiento: 0.12,
    volatilidad: 0.5,
    comision: 0.005,
    minimo: 5,
    queEs: 'Una moneda digital con cantidad limitada. Puede multiplicarse o caer 75% en un año: por eso va en una porción chica.',
    instrumento: 'Bitcoin',
    plataforma: 'plataforma de cripto',
  },
];

// Cuánto se mueven juntas las partes (mismo orden que PARTES).
// Las acciones y bitcoin suelen caer juntos; los bonos casi no acompañan.
export const CORRELACIONES = [
  [1.0, 0.0, 0.2, 0.0],
  [0.0, 1.0, 0.1, 0.4],
  [0.2, 0.1, 1.0, 0.1],
  [0.0, 0.4, 0.1, 1.0],
];

export const PERFILES = {
  prudente: { nombre: 'Prudente', pesos: { bonos: 0.55, eeuu: 0.3, oro: 0.1, bitcoin: 0.05 } },
  equilibrado: { nombre: 'Equilibrado', pesos: { bonos: 0.3, eeuu: 0.5, oro: 0.1, bitcoin: 0.1 } },
  decidido: { nombre: 'Decidido', pesos: { bonos: 0.1, eeuu: 0.65, oro: 0.1, bitcoin: 0.15 } },
};

export const ORDEN_PERFILES = ['prudente', 'equilibrado', 'decidido'];

export const RESPUESTAS_RIESGO = [
  { id: 'vendo', texto: 'Vendo todo para no perder más', perfil: 'prudente' },
  { id: 'espero', texto: 'Espero: ya va a volver', perfil: 'equilibrado' },
  { id: 'compro', texto: 'Compro más: está barato', perfil: 'decidido' },
];

// Prueba de crisis: caídas parecidas a las peores de los últimos años.
export const CRISIS = {
  caidas: { bonos: 0, eeuu: 0.5, oro: 0.25, bitcoin: 0.75 },
  mesesRecuperacion: 48,
};

export const SIMULACION = {
  futuros: 1000,
  semilla: 20261019,
  plazoMaximo: 40,
  chancesObjetivo: 0.7,
};

export const DOLAR_MEP = {
  valor: 1544,
  fecha: '19/10/2026',
};

// Ejemplo realista armado con datos públicos. Se puede borrar con "Empezar de cero".
export const EJEMPLO = {
  aporte: 191588,
  gasto: 528319,
  crecimiento: 0.02,
  meses: 3,
  metaTipo: 'Libertad',
  meta: 30000,
  plazo: 15,
  fuentes: {
    aporte: '10% del sueldo promedio registrado (RIPTE, junio 2026).',
    gasto: 'Canasta básica total de un adulto (INDEC, septiembre 2026).',
    meta: 'Un número redondo para empezar: cambialo por el tuyo.',
  },
};

export const FUENTES = [
  {
    tema: 'Acciones de EE.UU.',
    texto: 'J.P. Morgan espera 7,5% por año para las grandes empresas de EE.UU. (Long-Term Capital Market Assumptions 2027, datos a septiembre 2026).',
    url: 'https://am.jpmorgan.com/us/en/asset-management/adv/insights/portfolio-insights/ltcma/',
  },
  {
    tema: 'Acciones de EE.UU.',
    texto: 'Vanguard espera entre 3,9% y 5,9% por año en los próximos 10 años (modelo de enero 2026).',
    url: 'https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html',
  },
  {
    tema: 'Dólar MEP',
    texto: 'Dólar bolsa (MEP), precio de venta del 19/10/2026: $1.544 (DolarApi).',
    url: 'https://dolarapi.com/v1/dolares/bolsa',
  },
  {
    tema: 'Sueldo del ejemplo',
    texto: 'RIPTE (sueldo promedio de trabajadores registrados), junio 2026: $1.915.879.',
    url: 'https://www.argentina.gob.ar/trabajo/seguridadsocial/ripte',
  },
  {
    tema: 'Gasto del ejemplo',
    texto: 'Canasta básica total de un adulto (INDEC), septiembre 2026: $528.319.',
    url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-43-149',
  },
];
