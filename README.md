# Plan Pixel

Una guía paso a paso para aprender a invertir **armando tu propio plan**, con números reales de Argentina. Terminás sabiendo qué hacer este mes con tu plata.

**Es educativa: no es asesoramiento financiero.** Los resultados son estimaciones con supuestos (a la vista en la app, con sus fuentes), y la decisión es de cada persona. Lo que cargás queda solo en tu navegador.

## Los pasos

1. **Tu aporte:** cuánto podés poner por mes, en pesos o en dólares (dólar MEP).
2. **Tu colchón:** el fondo de emergencia, y en cuánto tiempo se completa.
3. **Tu meta:** para qué y para cuándo, en dólares de hoy.
4. **Tu riesgo:** una pregunta concreta que lleva a una cartera simple de 4 partes.
5. **Tu futuro:** 1.000 futuros posibles, tres caminos y cuántos llegan a tu meta.
6. **La crisis:** cuánto podría caer tu ahorro y qué pasa si vendés en el peor momento.
7. **Tu plan:** qué hacer este mes, cuánto va a cada parte y dónde se compra.

## Cómo está hecha

Sitio estático, sin compilación: HTML, CSS y JavaScript.

- `index.html` y `css/estilos.css`: la página y el estilo (modo día y modo noche).
- `js/datos.js`: supuestos, perfiles y datos públicos con su fuente.
- `js/calculo.js`: el cálculo, separado de las pantallas.
- `js/pantallas/`: un archivo por paso.
- `tests/`: pruebas del cálculo con casos conocidos (abrir `tests/index.html`).

Para probarla en una PC con Windows sin instalar nada: `.claude/serve.ps1` levanta un servidor local en http://localhost:8766/.
