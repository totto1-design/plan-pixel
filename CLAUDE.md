# Plan Pixel 2: guía del proyecto

Documento base para Claude Code. Si algo de este documento contradice el código, este documento manda y hay que preguntarle al usuario. La misión y los principios están en @VISION.md.

## Quién es el usuario y cómo trabajar con él

- Estudiante argentino (zona horaria America/Buenos_Aires) en su último año de la carrera. Quiere empezar a invertir y armar un fondo de emergencia, con un horizonte de más de 10 años.
- **No sabe programar.** Claude hace todo lo técnico y explica cada paso en lenguaje simple, sin jerga. Cuando él tenga que hacer algo (crear una cuenta, copiar una clave), darle instrucciones **de a un paso** y esperar a que confirme.
- Hablarle en **español rioplatense**.
- Le gusta decidir con opciones, de a un tema por vez, con **preguntas interactivas**. Analizar cuál conviene más y marcarla como **"(recomendado)"**.
- **Pocas sesiones que avancen mucho:** agrupar las preguntas en una sola tanda, decidir uno lo menor (y contárselo), probar todo antes de mostrárselo y no pedir confirmación para cosas chicas.
- **Antes de construir algo grande o visual, mostrarle un boceto** (imagen o maqueta simple) y recién después construir.
- Cada cosa nueva tiene que justificar qué decisión o qué aprendizaje aporta. Nada de opciones avanzadas "por las dudas".
- Ya tiene cuenta de GitHub.

## Cómo trabajamos cada sesión

- **Al empezar:** leer "Estado y próximo paso" y contarle en 2 o 3 líneas dónde quedamos y qué sigue. Él no tiene que repetir contexto.
- **Durante:** cada vez que se termina algo importante, actualizar "Estado y próximo paso" en el momento (la sesión se puede cortar).
- **Al cerrar:** cuando diga "cerramos" (o algo parecido), dejar esa sección al día y darle un resumen corto de lo logrado y de lo que sigue.

## Decisiones tomadas

**19/10/2026 (arranque, desde el primer mensaje):**
- Proyecto nuevo desde cero. El primer intento (carpeta `plan-pixel` en el Escritorio del usuario) queda solo como referencia de reglas, fuentes y textos: **no se copia su código ni su diseño**. Su `MI-PLAN.txt` es privado: no se sube a ningún lado.
- Formato: **guía paso a paso para aprender armando tu plan**. Cada paso = un concepto + una decisión. Termina en una tarjeta "Tu plan" con qué hacer este mes.
- Primera versión **chica y muy pulida**, pensada primero para celular y que ande bien en PC.
- Estilo **pixel art liviano** (tipografía, íconos, colores, detalles). **Sin** escenas animadas grandes, personajes ni logros.
- Incertidumbre en lenguaje concreto ("de 10 futuros posibles, en 7 llegás") o tres caminos (malo, medio, bueno) en montos. Nunca percentiles ni jerga.
- Supuestos honestos y con fuente a la vista, presentados como supuestos, no predicciones.
- Ejemplo realista con datos públicos (RIPTE, canasta básica INDEC, dólar MEP), con fuentes y botón "Empezar de cero".
- **Afuera por ahora:** noticias y semáforo, "analista" mensual, opciones avanzadas (tipos de retorno, rendimiento de la reserva, vacaciones, donaciones, redistribución), carteras de muchos activos con deslizadores, precios automáticos diarios.

**19/10/2026 (primera tanda de preguntas):**
- Nombre: **Plan Pixel**.
- Pasos: Bienvenida → **Aporte → Colchón → Meta → Riesgo → Futuro → Crisis → Tu plan** (una pantalla por paso, con barra de progreso).
- Carteras de ejemplo de **4 partes genéricas**: bonos cortos de EE.UU., las 500 empresas más grandes de EE.UU., oro y bitcoin. El colchón va siempre aparte.
- Supuestos: **punto medio de los expertos**: acciones de EE.UU. 6% anual, bonos cortos 4%, inflación de EE.UU. 2,5% (en dólares).
- Cálculo: **1.000 futuros al azar** (Monte Carlo).
- Incertidumbre: **tres caminos (malo, medio, bueno) + "de 10 futuros, en N llegás"**.
- Colchón: **primero el colchón completo**, después todo a invertir.
- Estilo: **"Cuaderno pixel"** (fondo crema, tinta azul oscuro, verde y naranja) **+ modo noche** (pedido del usuario).
- Publicación: **instalar Git y GitHub CLI**; el usuario inicia sesión una vez y después Claude publica cada cambio.
- Decidido por Claude (avisado): dólar MEP fijo con fecha y fuente, editable; colchón de 3 a 6 meses con guía; pregunta de riesgo "tus US$1.000 pasan a US$600" → Prudente / Equilibrado / Decidido; mini-lección "¿y si lo repartís en muchas partes?" en el paso de riesgo.

## Reglas del cálculo (no cambiar sin preguntar)

Se acuerdan con el usuario. Una vez acordadas, quedan escritas acá y no se cambian sin preguntarle.

Acordadas el 19/10/2026 (boceto aprobado ese día). Viven en `js/datos.js` y `js/calculo.js`.

- **Todo en dólares de hoy:** los montos se descuentan por la inflación de EE.UU. (**2,5% anual**). Los aportes en pesos se pasan a dólares con el **dólar MEP** (fijo, con fecha y fuente; editable).
- **Supuestos por parte** (rendimiento anual compuesto en dólares / volatilidad anual): bonos cortos de EE.UU. **4% / 3%**, 500 empresas de EE.UU. **6% / 16%**, oro **4% / 15%**, bitcoin **12% / 50%**. Correlaciones: EE.UU.–bitcoin 0,4; bonos–oro 0,2; EE.UU.–oro 0,1; oro–bitcoin 0,1; el resto 0. (Volatilidades y correlaciones: elegidas por Claude, contadas al usuario.)
- **Perfiles** (bonos / EE.UU. / oro / bitcoin): **Prudente 55/30/10/5**, **Equilibrado 30/50/10/10**, **Decidido 10/65/10/15**. La pregunta "tus US$1.000 pasan a US$600": vendo todo → Prudente, espero → Equilibrado, compro más → Decidido. La persona puede cambiarlo.
- **Colchón primero:** todo el aporte va al colchón (gasto esencial × meses, 3 a 6) hasta completarlo; después, todo a invertir. El colchón rinde igual que la inflación (en dólares de hoy no crece ni se achica) y no cuenta para la meta.
- **Aporte mensual** que crece 0%, 2% o 5% por año (en dólares de hoy), escalonado cada 12 meses.
- **Cada aporte se reparte** según los porcentajes del perfil. Lo comprado no se vende ni se rebalancea.
- **Mínimo de compra:** si a una parte le toca menos que su mínimo, **se junta (sin rendir) hasta llegar y ahí se compra todo lo juntado**. Mínimos aproximados: CEDEAR US$15, cripto US$5, fondo común US$1.
- **Comisiones aproximadas** (al comprar): CEDEAR 0,75%, cripto 0,5%, fondo común 0%.
- **1.000 futuros al azar** (Monte Carlo mensual, semilla fija para que los resultados no salten): rendimientos lognormales correlacionados; el rendimiento anual supuesto es la mediana.
- **Tres caminos:** malo = 1 de cada 10 futuros termina peor; medio = mitad; bueno = 1 de cada 10 termina mejor. **"De 10 futuros, en N llegás"** = proporción de futuros cuya inversión final ≥ meta, **redondeada hacia abajo** a décimos (65% = "6 de 10"; así no contradice al aporte necesario). **Aporte necesario** = el mínimo que llega en **7 de cada 10** futuros.
- **Prueba de crisis** (sobre el camino medio): caída instantánea de EE.UU. −50%, bitcoin −75%, oro −25%, bonos 0%; después todo vuelve a su camino en **4 años**. "Si vendés en el piso": pasás todo a bonos y seguís aportando solo a bonos.
- **No incluye:** impuestos, costos de mantenimiento de cuenta, diferencia entre precio de compra y venta, ni cambios del dólar MEP.

## Técnica

- Sitio estático **sin compilación** (HTML, CSS y JavaScript), en varios archivos ordenados y legibles. **El cálculo va separado de las pantallas** y se prueba con casos conocidos.
- En la PC no hay Python, Node ni Git. Para probar en local: servidor chico de PowerShell (HttpListener) en `.claude/serve.ps1`, configurado en `.claude/launch.json`.
- Publicación en **GitHub Pages desde la primera versión** para probarla en el celular.
- Más adelante: app instalable (PWA) y datos diarios con GitHub Actions (DolarApi sin clave para el dólar MEP; Finnhub y CoinGecko con claves gratuitas guardadas como secrets de GitHub, nunca en el código ni en el sitio).

## Cuidados

- **Nada de datos personales ni claves en el repo público.** Los datos del usuario (su cartera, sus montos) van en la carpeta `privado/`, que queda fuera del repo con `.gitignore`.
- Lo que la persona carga en la app se guarda solo en su navegador.
- La app nunca se presenta como asesoramiento financiero ni recomienda un producto o un broker en particular.

## Estado y próximo paso

**19/10/2026: primera versión construida y probada.** Hecho: investigación, tanda de preguntas, boceto aprobado, reglas acordadas, app completa (bienvenida + 7 pasos + supuestos y fuentes, modo día y noche, celular y PC) y 24 pruebas del cálculo en verde (`tests/index.html`). Probada como principiante con el ejemplo y desde cero.

**19/10/2026: publicada.** App: **https://totto1-design.github.io/plan-pixel/** · Repo público: https://github.com/totto1-design/plan-pixel (rama `main`, Pages desde la raíz). Se instalaron Git 2.55 y GitHub CLI 2.102 con winget; sesión iniciada como `totto1-design`, y Git usa esa sesión (`gh auth setup-git`). En PowerShell, refrescar el PATH antes de usar `git`/`gh` si no los encuentra. Los commits usan el mail privado de GitHub (`337902685+totto1-design@users.noreply.github.com`, configurado solo en este repo). Para publicar un cambio: `git add -A`, `git commit` y `git push` (Pages se actualiza solo en 1 o 2 minutos). Probada en la dirección real: 24 de 24 pruebas OK.

**Siguiente:** que el usuario la pruebe en su celular y nos cuente qué le cambiaría. Después, según lo que diga: ajustes, y ofrecerle convertirla en app instalable (PWA).

Ideas para después (no prometidas): PWA instalable, dólar MEP automático (DolarApi), precios reales de CEDEAR para los mínimos.

## Notas técnicas

- Estructura: `index.html`, `css/estilos.css`, `js/datos.js` (supuestos y fuentes), `js/calculo.js` (cálculo puro), `js/motor.js` (genera los futuros una vez y cachea), `js/estado.js` (lo que carga la persona, en localStorage), `js/ui.js`, `js/pixel.js` (íconos dibujados con texto), `js/grafico.js`, `js/pantallas/*.js` (un archivo por paso), `tests/` (pruebas).
- Letra pixel: **Jersey 10** (Google Fonts). Se descartaron Press Start 2P (las mayúsculas con tilde salen chiquitas: "DóLARES") y Pixelify Sans (la C mayúscula parece una O).
- Los futuros se guardan mes por mes, así alargar el plazo no cambia los meses anteriores. Las compras se calculan una sola vez (no dependen del mercado), y eso hace el cálculo ~4 veces más rápido.
- Servidor local: `.claude/serve.ps1` en el puerto 8766 (no sirve la carpeta `privado/`).

## Datos verificados (19/10/2026, re-verificar al usarlos)

- **J.P. Morgan LTCMA:** edición 2026 = 6,7% anual para grandes empresas de EE.UU.; **edición 2027 (datos a sept. 2026) = 7,5%** (subió 0,8 puntos); cartera global balanceada 7,0%. Fuente: am.jpmorgan.com, sección LTCMA.
- **Vanguard:** 3,9% a 5,9% anual a 10 años para acciones de EE.UU. (modelo de enero 2026). Fuente: corporate.vanguard.com, "Setting realistic expectations".
- **Dólar MEP:** $1.536,70 compra / $1.544,10 venta (DolarApi, `https://dolarapi.com/v1/dolares/bolsa`, 19/10/2026).
- **Canasta Básica Total (INDEC), septiembre 2026:** $528.319 por adulto equivalente (línea de pobreza).
- **RIPTE:** junio 2026 $1.915.878,76 (argentina.gob.ar, oficial); agosto 2026 $1.982.518,19 (informe de la Secretaría de Trabajo citado en prensa; confirmar en la página oficial).
- **Costos de comprar CEDEARs:** comisión de 0,5% a 0,8% + IVA + derecho de mercado (≈0,05% a 0,08%), o sea ≈0,65% a 1% por compra (comparadores de prensa; varía por broker). Ratio del CEDEAR de SPY: 60 a 1.
