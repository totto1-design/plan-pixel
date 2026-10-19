// Gráfico de los tres caminos (malo, medio, bueno), la meta y lo que pusiste. SVG simple.

import { usd } from './formato.js';

const ANCHO = 320;
const ALTO = 200;
const MARGEN = { izq: 6, der: 74, arr: 16, aba: 22 };

export function graficoCaminos({ caminos, puesto, meta, anioInicio }) {
  const anios = caminos.medio.length - 1;
  const maximo = Math.max(meta, ...caminos.bueno, 1) * 1.08;
  const x = (anio) => MARGEN.izq + (anio / anios) * (ANCHO - MARGEN.izq - MARGEN.der);
  const y = (valor) => MARGEN.arr + (1 - valor / maximo) * (ALTO - MARGEN.arr - MARGEN.aba);
  const linea = (serie) => serie.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  // Etiquetas al final de cada camino, separadas para que no se pisen.
  const etiquetas = [
    { clase: 'bueno', valor: caminos.bueno[anios] },
    { clase: 'medio', valor: caminos.medio[anios] },
    { clase: 'malo', valor: caminos.malo[anios] },
  ].map((e) => ({ ...e, y: y(e.valor) + 4 }));
  for (let i = 1; i < etiquetas.length; i++) {
    etiquetas[i].y = Math.max(etiquetas[i].y, etiquetas[i - 1].y + 15);
  }
  const desborde = etiquetas[etiquetas.length - 1].y - (ALTO - MARGEN.aba + 4);
  if (desborde > 0) for (const e of etiquetas) e.y -= desborde;

  const yMeta = y(meta);
  const descripcion =
    `En ${anioInicio + anios}: camino bueno ${usd(caminos.bueno[anios])}, medio ${usd(caminos.medio[anios])}, ` +
    `malo ${usd(caminos.malo[anios])}. Tu meta: ${usd(meta)}. Lo que pusiste: ${usd(puesto[anios])}.`;

  return `
    <svg viewBox="0 0 ${ANCHO} ${ALTO}" role="img" aria-label="${descripcion}">
      <line class="g-base" x1="${MARGEN.izq}" y1="${ALTO - MARGEN.aba}" x2="${ANCHO - MARGEN.der}" y2="${ALTO - MARGEN.aba}"/>
      <line class="g-meta" x1="${MARGEN.izq}" y1="${yMeta}" x2="${ANCHO - MARGEN.der}" y2="${yMeta}"/>
      <text class="g-texto chico" x="${MARGEN.izq + 2}" y="${yMeta - 5}">TU META ${usd(meta)}</text>
      <polyline class="g-puesto" points="${linea(puesto)}"/>
      <polyline class="g-malo" points="${linea(caminos.malo)}"/>
      <polyline class="g-medio" points="${linea(caminos.medio)}"/>
      <polyline class="g-bueno" points="${linea(caminos.bueno)}"/>
      ${etiquetas
        .map((e) => `<text class="g-texto ${e.clase}" x="${ANCHO - MARGEN.der + 6}" y="${e.y.toFixed(1)}">${usd(e.valor)}</text>`)
        .join('')}
      <text class="g-texto chico" x="${MARGEN.izq}" y="${ALTO - 6}">${anioInicio}</text>
      <text class="g-texto chico" x="${ANCHO - MARGEN.der}" y="${ALTO - 6}" text-anchor="end">${anioInicio + anios}</text>
    </svg>`;
}
