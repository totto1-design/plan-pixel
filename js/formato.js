// Cómo se muestran los números y las fechas en pantalla.

const entero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

// Las estimaciones se redondean para no mostrar una precisión que no tienen.
export function redondear(valor) {
  const abs = Math.abs(valor);
  const paso = abs >= 10000 ? 100 : abs >= 1000 ? 10 : 1;
  return Math.round(valor / paso) * paso;
}

// usd(31437) → "US$31.400" (estimación) · usd(1026, { exacto: true }) → "US$1.026"
export function usd(valor, { exacto = false } = {}) {
  if (!Number.isFinite(valor)) return '—';
  const v = exacto ? Math.round(valor) : redondear(valor);
  return (v < 0 ? '−' : '') + 'US$' + entero.format(Math.abs(v));
}

export function pesos(valor) {
  if (!Number.isFinite(valor)) return '—';
  const v = Math.round(valor);
  return (v < 0 ? '−' : '') + '$' + entero.format(Math.abs(v));
}

export function numero(valor) {
  return entero.format(Math.round(valor));
}

// porcentaje(0.025, 1) → "2,5%"
export function porcentaje(valor, decimales = 0) {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: decimales }).format(valor * 100) + '%';
}

// Lee lo que escribió la persona: "$ 191.588" → 191588. Vacío → null.
export function leerNumero(texto) {
  const limpio = String(texto ?? '').replace(/[^\d]/g, '');
  return limpio === '' ? null : Number(limpio);
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function sumarMeses(fecha, cantidad) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + cantidad, 1);
}

export function mesYAnio(fecha) {
  return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

export function duracion(meses) {
  if (meses < 12) return meses === 1 ? '1 mes' : `${meses} meses`;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const textoAnios = anios === 1 ? '1 año' : `${anios} años`;
  if (resto === 0) return textoAnios;
  return `${textoAnios} y ${resto === 1 ? '1 mes' : `${resto} meses`}`;
}
