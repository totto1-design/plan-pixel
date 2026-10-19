// Íconos pixel art dibujados con texto: cada letra es un color, cada punto es transparente.
// Los colores salen de variables CSS, así cambian solos en el modo noche.

const COLORES = {
  K: 'px-tinta',
  Y: 'px-oro',
  O: 'px-naranja',
  G: 'px-verde',
  B: 'px-azul',
  W: 'px-claro',
  P: 'px-papel',
};

const MAPAS = {
  moneda: [
    '....KKKK....',
    '..KKYYYYKK..',
    '.KYYYYYYYYK.',
    '.KYWYYKYYOK.',
    'KYWYYKKKYYOK',
    'KYWYKYKYYYOK',
    'KYYYYKKKYYOK',
    'KYYYYYKYKYOK',
    '.KYYYKKKYOK.',
    '.KYYYYKYYOK.',
    '..KKOOOOKK..',
    '....KKKK....',
  ],
  escudo: [
    'KKKKKKKK',
    'KGGGGGGK',
    'KGWGGGGK',
    'KGWGGGGK',
    '.KGGGGK.',
    '.KGGGGK.',
    '..KGGK..',
    '...KK...',
  ],
  bandera: [
    'KOOOOO..',
    'KOOOOOO.',
    'KOOOOO..',
    'K.......',
    'K.......',
    'K.......',
    'K.......',
    'KK......',
  ],
  rayo: [
    '....KKK.',
    '...KYYK.',
    '..KYYK..',
    '.KYYYYK.',
    '..KYYK..',
    '.KYYK...',
    '.KYK....',
    '.KK.....',
  ],
  grafico: [
    'K......G',
    'K.....GG',
    'K....G..',
    'K.G.G...',
    'K.GG....',
    'K.......',
    'KKKKKKKK',
    '........',
  ],
  tormenta: [
    '..KKKK..',
    '.KBBBBKK',
    'KBBBBBBK',
    'KKKKKKKK',
    '...YY...',
    '..YY....',
    '...YY...',
    '..Y.....',
  ],
  planilla: [
    '..KKKK..',
    'KKPKKPKK',
    'KPPPPPPK',
    'KPKKKKPK',
    'KPPPPPPK',
    'KPKKKPPK',
    'KPPPPPPK',
    'KKKKKKKK',
  ],
  luna: [
    '..KKKK..',
    '.KK.....',
    'KK......',
    'KK......',
    'KK......',
    'KK.....K',
    '.KK..KK.',
    '..KKKK..',
  ],
  sol: [
    'Y..Y..Y.',
    '.Y.Y.Y..',
    '..YYY...',
    'YYYYYYY.',
    '..YYY...',
    '.Y.Y.Y..',
    'Y..Y..Y.',
    '........',
  ],
};

// icono('moneda', 3) → <svg> de 36×36 px. Si lleva etiqueta, se anuncia a lectores de pantalla.
export function icono(nombre, escala = 3, etiqueta = '') {
  const mapa = MAPAS[nombre];
  const alto = mapa.length;
  const ancho = mapa[0].length;
  let rectangulos = '';
  mapa.forEach((fila, y) => {
    let x = 0;
    while (x < ancho) {
      const color = fila[x];
      let largo = 1;
      while (x + largo < ancho && fila[x + largo] === color) largo++;
      if (COLORES[color]) {
        rectangulos += `<rect x="${x}" y="${y}" width="${largo}" height="1" class="${COLORES[color]}"/>`;
      }
      x += largo;
    }
  });
  const accesible = etiqueta ? `role="img" aria-label="${etiqueta}"` : 'aria-hidden="true"';
  return `<svg class="pixel" width="${ancho * escala}" height="${alto * escala}" viewBox="0 0 ${ancho} ${alto}" shape-rendering="crispEdges" ${accesible}>${rectangulos}</svg>`;
}
