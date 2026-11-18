/* DataForja — etapa 3: ruta de estadística aplicada, SQL en otros motores y glosario. */
(function () {
  const C = window.CONTENT;
  const T = Object.fromEntries(C.tracks.map(t => [t.id, t]));

  /* ============================================================ ESTADÍSTICA APLICADA */
  const MED = 'def mediana(datos):\n    s = sorted(datos)\n    n = len(s)\n    mitad = n // 2\n    if n % 2 == 1:\n        return s[mitad]\n    return (s[mitad - 1] + s[mitad]) / 2\n';
  const STD = 'import math\n\ndef promedio(datos):\n    return sum(datos) / len(datos)\n\ndef desviacion(datos):\n    m = promedio(datos)\n    return math.sqrt(sum((x - m) ** 2 for x in datos) / (len(datos) - 1))\n';
  const CORR = 'import math\n\ndef correlacion(x, y):\n    mx = sum(x) / len(x)\n    my = sum(y) / len(y)\n    cov = sum((a - mx) * (b - my) for a, b in zip(x, y))\n    sx = math.sqrt(sum((a - mx) ** 2 for a in x))\n    sy = math.sqrt(sum((b - my) ** 2 for b in y))\n    return cov / (sx * sy)\n';
  const stats = {
    id: 'stats', name: 'Estadística', short: 'Leer los números con criterio',
    tagline: 'Calcular un promedio es fácil; saber cuándo engaña es lo que distingue a un analista. Cinco ideas que vas a usar en cada reporte.',
    runtime: 'python',
    lessons: [
      {
        id: 'st-1', title: 'Promedio, mediana y valores atípicos', minutes: 20, level: 'Inicio',
        why: 'Un solo pedido gigante puede hacer que el "ticket promedio" no represente a ningún cliente real. Saber cuándo usar el promedio y cuándo la mediana evita conclusiones equivocadas en reportes de ventas, salarios o tiempos de entrega.',
        concept: [
          { h: 'Promedio (media)', p: 'Suma todos los valores y divide entre cuántos son. Usa toda la información, pero un valor extremo lo arrastra.', code: 'tickets = [320, 450, 380, 410, 395, 12000, 430, 360]\nprint(sum(tickets) / len(tickets))', lang: 'python' },
          { h: 'Mediana', p: 'Ordena los valores y toma el del centro (o el promedio de los dos centrales si son pares). Los extremos no la mueven: por eso describe mejor al cliente "típico".', code: MED + '\ntickets = [320, 450, 380, 410, 395, 12000, 430, 360]\nprint(mediana(tickets))', lang: 'python' },
          { h: 'Cuándo usar cada una', p: 'Si promedio y mediana son parecidos, los datos son simétricos y el promedio está bien. Si el promedio es mucho mayor, hay valores altos que lo jalan: reporta la mediana o ambos. Salarios, precios de vivienda y tickets casi siempre necesitan la mediana.', code: '', lang: 'text' },
          { h: 'Detectar valores atípicos', p: 'Una regla simple: marca como atípico lo que supere, por ejemplo, tres veces la mediana. No se borran sin pensar: primero se investiga si es un error de captura o un cliente real excepcional.', code: MED + '\ntickets = [320, 450, 380, 410, 395, 12000, 430, 360]\nm = mediana(tickets)\nprint([t for t in tickets if t > 3 * m])', lang: 'python' }
        ],
        example: { title: 'El ticket "promedio" que no existe', text: 'El promedio dice que un cliente gasta más de 1,800; en realidad casi todos gastan alrededor de 400. Un pedido corporativo de 12,000 distorsiona el promedio, no la mediana.', code: MED + '\ntickets = [320, 450, 380, 410, 395, 12000, 430, 360]\nprint(f"Promedio: {sum(tickets) / len(tickets):.2f}")\nprint(f"Mediana: {mediana(tickets):.2f}")' },
        practice: { prompt: 'En una empresa pequeña, los salarios mensuales son los de la lista (el último es del director). Imprime "Promedio: X" y "Mediana: Y", ambos con 2 decimales, usando la función mediana.', starter: MED + '\nsalarios = [18000, 21000, 19500, 22000, 20500, 250000, 19000]\n\n', solution: MED + '\nsalarios = [18000, 21000, 19500, 22000, 20500, 250000, 19000]\n\nprint(f"Promedio: {sum(salarios) / len(salarios):.2f}")\nprint(f"Mediana: {mediana(salarios):.2f}")', hints: ['Promedio: sum(salarios) / len(salarios).', 'La función mediana ya está escrita: mediana(salarios).'] },
        extra: [
          { level: 'Intermedio', prompt: 'Quita los valores atípicos (los mayores a 3 veces la mediana) y vuelve a calcular el promedio. Imprime "Atípicos: [...]" con la lista y "Promedio sin atípicos: X" con 2 decimales.', starter: MED + '\nsalarios = [18000, 21000, 19500, 22000, 20500, 250000, 19000]\nm = mediana(salarios)\n\n', solution: MED + '\nsalarios = [18000, 21000, 19500, 22000, 20500, 250000, 19000]\nm = mediana(salarios)\n\natipicos = [s for s in salarios if s > 3 * m]\nresto = [s for s in salarios if s <= 3 * m]\nprint(f"Atípicos: {atipicos}")\nprint(f"Promedio sin atípicos: {sum(resto) / len(resto):.2f}")', hints: ['Usa dos comprensiones: una para los atípicos y otra para el resto.'] },
          { type: 'predict', level: 'Leer código', ask: 'output', lines: 1, prompt: 'Sin ejecutarlo, ¿qué imprime?', code: MED + '\nprint(mediana([7, 1, 9, 3]))', explain: 'Ordenados: 1, 3, 7, 9. Son pares, así que la mediana es el promedio de 3 y 7: 5.0.', hints: ['Ordena primero la lista.'] }
        ],
        quiz: [{ q: 'El promedio de los tiempos de entrega es 9 días y la mediana es 3. ¿Qué indica?', options: ['Que los datos son simétricos', 'Que hay algunas entregas muy tardadas que jalan el promedio hacia arriba', 'Que la mediana está mal calculada', 'Que la mayoría tarda 9 días'], answer: 1, explain: 'Cuando el promedio es mucho mayor que la mediana, unos pocos valores altos lo arrastran. La experiencia típica la describe la mediana: la mitad de las entregas tarda 3 días o menos.' }],
        guide: [{ name: 'Medidas de tendencia central', syntax: 'promedio = sum(datos) / len(datos)\nmediana = valor central de sorted(datos)\n# pandas: df["col"].mean()   df["col"].median()\n# Excel: PROMEDIO()   MEDIANA()\n# SQL: AVG(col)   (la mediana necesita funciones de ventana)',
          parts: [['Promedio', 'Usa todos los valores; sensible a extremos.'], ['Mediana', 'El valor del centro; resistente a extremos.'], ['Moda', 'El valor más frecuente; útil para categorías.'], ['Valor atípico', 'Un dato muy alejado del resto. Se investiga antes de decidir qué hacer con él.']],
          when: 'Cada vez que reportes un "valor típico": ticket, salario, tiempo de respuesta, precio.',
          read: 'La mitad de los clientes gasta menos de 402.50.',
          demo: { kind: 'python', before: 'tickets = [320, 450, 380, 410, 395, 430, 360]\nprint(round(sum(tickets) / len(tickets), 2))', after: 'tickets = [320, 450, 380, 410, 395, 430, 360, 12000]\nprint(round(sum(tickets) / len(tickets), 2))', note: 'Agregar un solo pedido de 12,000 multiplica el promedio por más de cuatro. La mediana apenas cambia: de 395 a 402.5.' } }]
      },
      {
        id: 'st-2', title: 'Dispersión: desviación estándar y percentiles', minutes: 20, level: 'Básico',
        why: 'Dos vendedores pueden tener el mismo promedio y ser muy distintos: uno vende parejo y el otro tiene días buenísimos y días en cero. La dispersión mide qué tan confiable es el promedio y es la base para fijar metas y alertas.',
        concept: [
          { h: 'Rango', p: 'Máximo menos mínimo. Es simple pero depende solo de dos valores, así que un atípico lo infla.', code: 'ventas = [100, 105, 98, 102, 101, 99]\nprint(max(ventas) - min(ventas))', lang: 'python' },
          { h: 'Desviación estándar', p: 'Mide la distancia típica de cada valor al promedio, en las mismas unidades que los datos. Pequeña: datos parejos. Grande: datos dispersos. Se divide entre n - 1 cuando los datos son una muestra.', code: STD + '\nprint(round(desviacion([100, 105, 98, 102, 101, 99]), 2))\nprint(round(desviacion([40, 180, 95, 150, 60, 120]), 2))', lang: 'python' },
          { h: 'Percentiles', p: 'El percentil 90 es el valor por debajo del cual queda el 90% de los datos. Sirve para metas realistas ("el 90% de las entregas llega en X días") y para detectar casos extremos.', code: 'import math\ntiempos = sorted([2, 3, 3, 4, 2, 5, 3, 12, 4, 3])\nposicion = math.ceil(0.9 * len(tiempos)) - 1\nprint(tiempos[posicion])', lang: 'python' }
        ],
        example: { title: 'Mismo promedio, distinto riesgo', text: 'Los dos vendedores promedian 100.8 y 107.5 al día, pero uno es mucho más predecible. Para planear inventario o metas, la desviación importa tanto como el promedio.', code: STD + '\na = [100, 105, 98, 102, 101, 99]\nb = [40, 180, 95, 150, 60, 120]\nprint(f"A: promedio {promedio(a):.1f}, desviación {desviacion(a):.1f}")\nprint(f"B: promedio {promedio(b):.1f}, desviación {desviacion(b):.1f}")' },
        practice: { prompt: 'Compara la estabilidad de dos sucursales. Imprime "Norte: X" y "Sur: Y" con la desviación estándar de cada una (2 decimales) y luego "Más estable: Norte" o "Más estable: Sur" según cuál tenga menor desviación.', starter: STD + '\nnorte = [220, 235, 210, 228, 240, 215, 225]\nsur = [150, 310, 190, 280, 120, 260, 300]\n\n', solution: STD + '\nnorte = [220, 235, 210, 228, 240, 215, 225]\nsur = [150, 310, 190, 280, 120, 260, 300]\n\ndn = desviacion(norte)\nds = desviacion(sur)\nprint(f"Norte: {dn:.2f}")\nprint(f"Sur: {ds:.2f}")\nprint("Más estable: " + ("Norte" if dn < ds else "Sur"))', hints: ['La función desviacion ya está escrita.', 'Compara dn < ds para decidir.'] },
        extra: [
          { level: 'Intermedio', prompt: 'Calcula el percentil 90 de los tiempos de respuesta del soporte (método de rango más cercano: ordena y toma la posición ceil(0.9 * n) - 1). Imprime "P90: X minutos".', starter: 'import math\nrespuestas = [12, 8, 15, 30, 9, 11, 14, 60, 10, 13, 9, 16, 12, 45, 11, 10, 8, 14, 12, 20]\n\n', solution: 'import math\nrespuestas = [12, 8, 15, 30, 9, 11, 14, 60, 10, 13, 9, 16, 12, 45, 11, 10, 8, 14, 12, 20]\n\ns = sorted(respuestas)\nprint(f"P90: {s[math.ceil(0.9 * len(s)) - 1]} minutos")', hints: ['Ordena con sorted.', 'La posición es math.ceil(0.9 * len(s)) - 1.'] }
        ],
        quiz: [{ q: 'Dos productos venden en promedio 50 unidades diarias. El A tiene desviación 2 y el B desviación 25. ¿Cuál necesita más inventario de seguridad?', options: ['El A', 'El B', 'Los dos igual', 'Ninguno'], answer: 1, explain: 'La demanda del B varía mucho: algunos días venderá 80 o más. Para no quedarse sin existencias necesita un colchón mayor.' }],
        guide: [{ name: 'Medidas de dispersión', syntax: 'rango = max(datos) - min(datos)\ndesviación = raíz( suma((x - promedio)²) / (n - 1) )\npercentil p = valor en la posición ceil(p × n) - 1 de los datos ordenados\n# pandas: df["col"].std()   df["col"].quantile(0.9)',
          parts: [['Rango', 'Distancia entre el mínimo y el máximo.'], ['Desviación estándar', 'Distancia típica al promedio, en las mismas unidades.'], ['Percentil', 'Qué valor deja por debajo un porcentaje de los datos. P50 es la mediana.'], ['n - 1', 'Se usa cuando los datos son una muestra; con todos los datos de la población se divide entre n.']],
          when: 'Para saber qué tan confiable es un promedio, fijar metas y definir alertas.',
          read: 'El 90% de las respuestas tarda 30 minutos o menos.',
          demo: { kind: 'python', after: STD + '\nfor nombre, datos in [("Parejo", [100, 105, 98, 102, 101, 99]), ("Disperso", [40, 180, 95, 150, 60, 120])]:\n    print(nombre, round(promedio(datos), 1), round(desviacion(datos), 1))', note: 'Promedios parecidos, desviaciones muy distintas: 2.5 contra 53.3.' } }]
      },
      {
        id: 'st-3', title: 'Distribuciones e histogramas', minutes: 20, level: 'Básico',
        why: 'Antes de resumir datos con un número, conviene ver su forma: si se concentran en un valor, si tienen dos grupos o una cola larga. Un histograma muestra en segundos lo que un promedio esconde.',
        concept: [
          { h: 'Agrupar en intervalos', p: 'Un histograma cuenta cuántos valores caen en cada intervalo (por ejemplo, de 0 a 499, de 500 a 999). La división entera // da el número de intervalo directamente.', code: 'montos = [120, 480, 510, 950, 1020, 330, 760, 1480, 220, 640]\nconteo = {}\nfor m in montos:\n    b = m // 500\n    conteo[b] = conteo.get(b, 0) + 1\nprint(conteo)', lang: 'python' },
          { h: 'Dibujarlo con texto', p: 'Repetir un carácter tantas veces como el conteo da un histograma rápido, sin librerías. En pandas o Excel se hace con un clic, pero la idea es la misma.', code: 'conteo = {0: 4, 1: 4, 2: 2}\nfor b in sorted(conteo):\n    print(f"{b * 500}-{b * 500 + 499}: " + "#" * conteo[b])', lang: 'python' },
          { h: 'Formas comunes', p: 'Simétrica (campana): promedio y mediana parecidos. Sesgada a la derecha (cola larga de valores altos): típica en ingresos, tickets y tiempos. Bimodal (dos picos): suele indicar dos grupos mezclados, como clientes minoristas y mayoristas.', code: '', lang: 'text' }
        ],
        example: { title: 'Dos tipos de cliente escondidos', text: 'Los tickets forman dos grupos: compras chicas de mostrador y compras grandes de empresas. El promedio cae justo en medio, donde casi no hay clientes.', code: 'tickets = [210, 260, 240, 300, 280, 230, 2900, 3100, 2800, 250, 3000, 270]\nconteo = {}\nfor t in tickets:\n    b = t // 1000\n    conteo[b] = conteo.get(b, 0) + 1\nfor b in range(0, 4):\n    print(f"{b * 1000}-{b * 1000 + 999}: " + "#" * conteo.get(b, 0))\nprint("Promedio:", round(sum(tickets) / len(tickets)))' },
        practice: { prompt: 'Haz el histograma de los montos en intervalos de 500 (0-499, 500-999, 1000-1499, 1500-1999 y 2000-2499). Imprime una línea por intervalo, incluso los vacíos, con el formato "0-499: ### (3)": un # por valor y el conteo entre paréntesis.', starter: 'montos = [120, 480, 510, 950, 1020, 330, 760, 1480, 220, 640, 2100, 590, 870, 410, 1250]\n\n', solution: 'montos = [120, 480, 510, 950, 1020, 330, 760, 1480, 220, 640, 2100, 590, 870, 410, 1250]\n\nconteo = {}\nfor m in montos:\n    b = m // 500\n    conteo[b] = conteo.get(b, 0) + 1\nfor b in range(5):\n    n = conteo.get(b, 0)\n    print(f"{b * 500}-{b * 500 + 499}: " + "#" * n + f" ({n})")', hints: ['m // 500 da el número de intervalo.', 'Recorre range(5) para incluir los vacíos con conteo.get(b, 0).'] },
        extra: [
          { level: 'Intermedio', prompt: 'Encuentra la moda (la categoría más frecuente) de los métodos de pago e imprime "Moda: X (N veces)".', starter: 'pagos = ["tarjeta", "efectivo", "tarjeta", "transferencia", "tarjeta", "efectivo", "tarjeta", "transferencia", "efectivo", "tarjeta"]\n\n', solution: 'pagos = ["tarjeta", "efectivo", "tarjeta", "transferencia", "tarjeta", "efectivo", "tarjeta", "transferencia", "efectivo", "tarjeta"]\n\nconteo = {}\nfor p in pagos:\n    conteo[p] = conteo.get(p, 0) + 1\nmoda = max(conteo, key=conteo.get)\nprint(f"Moda: {moda} ({conteo[moda]} veces)")', hints: ['Cuenta con un diccionario.', 'max(conteo, key=conteo.get) da la clave más frecuente.'] }
        ],
        quiz: [{ q: 'Un histograma de tickets muestra dos picos separados. ¿Qué conviene hacer?', options: ['Reportar solo el promedio', 'Investigar si hay dos tipos de cliente y analizarlos por separado', 'Borrar el pico más pequeño', 'Usar un gráfico de pastel'], answer: 1, explain: 'Dos picos suelen ser dos poblaciones mezcladas. Un solo promedio no describe a ninguna de las dos.' }],
        guide: [{ name: 'Histograma', syntax: 'intervalo = valor // ancho\nconteo[intervalo] += 1\n# pandas: df["col"].plot(kind="hist", bins=10)\n# Power BI: gráfico de columnas con un eje agrupado ("Nuevo grupo" > intervalos)',
          parts: [['Ancho del intervalo', 'Ni muy fino (puro ruido) ni muy grueso (se pierde la forma). Prueba varios.'], ['Conteo', 'Cuántos valores caen en cada intervalo.'], ['Forma', 'Simétrica, sesgada o con varios picos: decide qué resumen usar.']],
          when: 'Antes de resumir cualquier columna numérica importante.',
          read: 'Cuenta cuántos montos caen en cada tramo de 500.',
          demo: { kind: 'python', after: 'montos = [120, 480, 510, 950, 1020, 330, 760, 1480, 220, 640, 2100, 590]\nconteo = {}\nfor m in montos:\n    conteo[m // 500] = conteo.get(m // 500, 0) + 1\nfor b in range(5):\n    print(f"{b * 500}-{b * 500 + 499}: " + "#" * conteo.get(b, 0))', note: 'La mayoría de los montos está por debajo de 1,000, con una cola hacia la derecha: una distribución sesgada.' } }]
      },
      {
        id: 'st-4', title: 'Correlación no es causalidad', minutes: 20, level: 'Intermedio',
        why: '"Cuando sube la publicidad, suben las ventas" puede ser cierto y aun así la publicidad no ser la causa. Medir la correlación es fácil; interpretarla bien evita decisiones caras basadas en coincidencias.',
        concept: [
          { h: 'El coeficiente de correlación (r)', p: 'Va de -1 a 1. Cerca de 1: cuando una variable sube, la otra también. Cerca de -1: una sube y la otra baja. Cerca de 0: no hay relación lineal. Como guía: 0.7 o más es fuerte, entre 0.4 y 0.7 moderada.', code: CORR + '\nprint(round(correlacion([1, 2, 3, 4], [2, 4, 6, 8]), 2))\nprint(round(correlacion([1, 2, 3, 4], [8, 6, 4, 2]), 2))', lang: 'python' },
          { h: 'Variables ocultas', p: 'Las ventas de helados y de aires acondicionados están muy correlacionadas, pero ninguna causa la otra: las dos dependen del calor. Antes de concluir causa, pregunta qué otra cosa podría mover a ambas.', code: CORR + '\nhelados = [20, 35, 60, 80, 95]\naires = [5, 9, 15, 21, 24]\nprint(round(correlacion(helados, aires), 2))', lang: 'python' },
          { h: 'Cómo acercarse a la causa', p: 'Un experimento (prueba A/B: una parte recibe el cambio y otra no, elegidas al azar) es la forma más confiable. Sin experimento, compara grupos parecidos y busca un mecanismo que lo explique.', code: '', lang: 'text' }
        ],
        example: { title: 'Más vendedores, más ventas… ¿o al revés?', text: 'Las sucursales con más vendedores venden más, pero la empresa asigna más vendedores donde ya hay más clientes. La correlación es alta y la causa va, al menos en parte, en sentido contrario.', code: CORR + '\nvendedores = [3, 5, 4, 8, 6, 10]\nventas = [120, 210, 160, 340, 250, 400]\nprint(f"r = {correlacion(vendedores, ventas):.2f}")' },
        practice: { prompt: 'Calcula la correlación entre la inversión en publicidad y las ventas. Imprime "r = X" con 2 decimales y en otra línea la fuerza: "Fuerte" si el valor absoluto de r es 0.7 o más, "Moderada" si es 0.4 o más y "Débil" en otro caso.', starter: CORR + '\npublicidad = [10, 15, 20, 25, 30, 35, 40]\nventas = [110, 135, 150, 180, 175, 215, 230]\n\n', solution: CORR + '\npublicidad = [10, 15, 20, 25, 30, 35, 40]\nventas = [110, 135, 150, 180, 175, 215, 230]\n\nr = correlacion(publicidad, ventas)\nprint(f"r = {r:.2f}")\nif abs(r) >= 0.7:\n    print("Fuerte")\nelif abs(r) >= 0.4:\n    print("Moderada")\nelse:\n    print("Débil")', hints: ['La función correlacion ya está escrita.', 'abs(r) da el valor absoluto.'] },
        extra: [
          { type: 'predict', level: 'Leer código', ask: 'output', lines: 1, prompt: 'Sin ejecutarlo, ¿qué imprime?', code: CORR + '\nprint(round(correlacion([1, 2, 3], [30, 20, 10]), 1))', explain: 'Cuando una sube la otra baja en proporción exacta: correlación perfecta negativa, -1.0.', hints: ['Mira la dirección: cuando x sube, ¿qué hace y?'] }
        ],
        quiz: [{ q: 'En las tiendas, la venta de paraguas y la de botas de lluvia tienen r = 0.9. ¿Qué se puede concluir?', options: ['Vender paraguas provoca vender botas', 'Las dos suben juntas, probablemente por una causa común: la lluvia', 'Hay un error en los datos', 'No hay relación'], answer: 1, explain: 'Una correlación alta indica que se mueven juntas. La explicación más probable es una variable común, el clima, no que una cause la otra.' }],
        guide: [{ name: 'Correlación', syntax: 'r = cov(x, y) / (desv(x) × desv(y))     # entre -1 y 1\n# pandas: df["x"].corr(df["y"])\n# Excel: COEF.DE.CORREL(x, y)',
          parts: [['r cercano a 1', 'Se mueven juntas en la misma dirección.'], ['r cercano a -1', 'Se mueven en direcciones opuestas.'], ['r cercano a 0', 'Sin relación lineal (puede haber una relación curva).'], ['Causalidad', 'Requiere un experimento o un argumento sólido; r no la demuestra.']],
          when: 'Para explorar qué variables se mueven juntas antes de investigar por qué.',
          read: 'Publicidad y ventas tienen una correlación fuerte y positiva.',
          demo: { kind: 'python', after: CORR + '\nprint(round(correlacion([10, 20, 30, 40], [12, 25, 29, 41]), 2))\nprint(round(correlacion([10, 20, 30, 40], [40, 10, 35, 15]), 2))', note: 'La primera pareja sube junta (r alto); la segunda no tiene un patrón claro (r cercano a cero o negativo).' } }]
      },
      {
        id: 'st-5', title: 'Comparaciones justas: tasas y la paradoja de Simpson', minutes: 25, level: 'Intermedio',
        why: 'Comparar números absolutos entre grupos de distinto tamaño engaña, y un porcentaje mal leído también. Esta lección cubre los tres errores de comparación más frecuentes en reportes: totales en vez de tasas, puntos porcentuales contra porcentaje y la paradoja de Simpson.',
        concept: [
          { h: 'Tasas en lugar de totales', p: 'La sucursal grande siempre tendrá más quejas. Para comparar, divide entre el tamaño: quejas por cada 1,000 ventas.', code: 'quejas = {"Centro": 120, "Norte": 30}\nventas = {"Centro": 40000, "Norte": 6000}\nfor s in quejas:\n    print(s, round(quejas[s] / ventas[s] * 1000, 1), "por cada 1,000 ventas")', lang: 'python' },
          { h: 'Puntos porcentuales contra porcentaje', p: 'Si la conversión pasa de 4% a 5%, subió 1 punto porcentual, que es un aumento del 25%. Los dos números son correctos; confundirlos exagera o minimiza el cambio.', code: 'antes, despues = 4.0, 5.0\nprint("Puntos porcentuales:", despues - antes)\nprint("Aumento relativo %:", round((despues - antes) / antes * 100, 1))', lang: 'python' },
          { h: 'La paradoja de Simpson', p: 'Una campaña puede ganar en cada segmento y perder en el total, si los segmentos tienen tamaños distintos. Siempre que compares grupos, revisa también los subgrupos.', code: '', lang: 'text' }
        ],
        example: { title: 'La campaña que gana en todo y pierde en total', text: 'La campaña A convierte mejor en móvil y en escritorio, pero en el total parece peor, porque la mayoría de su tráfico vino de escritorio, donde todos convierten menos.', code: 'datos = {\n    "A": {"móvil": (81, 87), "escritorio": (192, 263)},\n    "B": {"móvil": (234, 270), "escritorio": (55, 80)},\n}\nfor camp, seg in datos.items():\n    for nombre, (compras, visitas) in seg.items():\n        print(camp, nombre, f"{compras / visitas * 100:.1f}%")\n    tc = sum(c for c, v in seg.values())\n    tv = sum(v for c, v in seg.values())\n    print(camp, "TOTAL", f"{tc / tv * 100:.1f}%")' },
        practice: { prompt: 'Con los datos de dos campañas por segmento, imprime la conversión (compras / visitas en %, un decimal) de cada campaña en cada segmento y en total, con el formato "A móvil: 93.1%". Al final imprime "Gana en total: X" con la campaña de mayor conversión total.', starter: 'datos = {\n    "A": {"móvil": (81, 87), "escritorio": (192, 263)},\n    "B": {"móvil": (234, 270), "escritorio": (55, 80)},\n}\n\n', solution: 'datos = {\n    "A": {"móvil": (81, 87), "escritorio": (192, 263)},\n    "B": {"móvil": (234, 270), "escritorio": (55, 80)},\n}\n\ntotales = {}\nfor camp, seg in datos.items():\n    for nombre, (compras, visitas) in seg.items():\n        print(f"{camp} {nombre}: {compras / visitas * 100:.1f}%")\n    tc = sum(c for c, v in seg.values())\n    tv = sum(v for c, v in seg.values())\n    totales[camp] = tc / tv\n    print(f"{camp} total: {totales[camp] * 100:.1f}%")\nprint("Gana en total: " + max(totales, key=totales.get))', hints: ['Recorre datos.items() y luego seg.items().', 'El total suma compras y visitas de los dos segmentos antes de dividir.', 'max(totales, key=totales.get) da la ganadora.'] },
        extra: [
          { level: 'Básico', prompt: 'La tasa de devoluciones pasó de 8% a 6%. Imprime "Cambio: -2.0 puntos porcentuales" y "Cambio relativo: -25.0%".', starter: 'antes = 8.0\ndespues = 6.0\n\n', solution: 'antes = 8.0\ndespues = 6.0\n\nprint(f"Cambio: {despues - antes:.1f} puntos porcentuales")\nprint(f"Cambio relativo: {(despues - antes) / antes * 100:.1f}%")', hints: ['Puntos porcentuales: la resta.', 'Relativo: la resta dividida entre el valor de antes, por 100.'] }
        ],
        quiz: [
          { q: 'La conversión subió de 2% a 3%. ¿Cuál afirmación es correcta?', options: ['Subió 1%', 'Subió 1 punto porcentual, un aumento relativo del 50%', 'Subió 3 puntos', 'Subió 150%'], answer: 1, explain: 'La diferencia es de 1 punto porcentual; en términos relativos, 1 sobre 2 es un 50% más.' },
          { q: 'Una sucursal tiene 200 quejas y otra 50. ¿Qué falta para decir cuál atiende peor?', options: ['Nada: la primera atiende peor', 'Saber cuántas ventas o clientes tiene cada una, para comparar tasas', 'Saber el nombre del gerente', 'Un gráfico de pastel'], answer: 1, explain: 'Sin el tamaño de cada sucursal no se puede comparar. Con 200 quejas en 100,000 ventas atiende mejor que con 50 quejas en 5,000.' }
        ],
        guide: [{ name: 'Comparar con justicia', syntax: 'tasa = eventos / base × 1000          # por cada 1,000\npuntos porcentuales = tasa_nueva - tasa_anterior\ncambio relativo = (nuevo - anterior) / anterior × 100',
          parts: [['Base', 'El tamaño del grupo: ventas, clientes, visitas.'], ['Puntos porcentuales', 'Diferencia entre dos porcentajes.'], ['Cambio relativo', 'Cuánto cambió respecto a su valor inicial.'], ['Subgrupos', 'Revisa los segmentos: la conclusión del total puede invertirse.']],
          when: 'Siempre que compares grupos de distinto tamaño o reportes cambios en porcentajes.',
          read: 'Norte tiene 5.0 quejas por cada 1,000 ventas y Centro 3.0.',
          demo: { kind: 'python', before: 'quejas = {"Centro": 120, "Norte": 30}\nfor s, q in quejas.items():\n    print(s, q, "quejas")', after: 'quejas = {"Centro": 120, "Norte": 30}\nventas = {"Centro": 40000, "Norte": 6000}\nfor s in quejas:\n    print(s, round(quejas[s] / ventas[s] * 1000, 1), "por cada 1,000 ventas")', note: 'En totales Centro parece cuatro veces peor; en tasa, Norte es la que tiene más quejas por venta.' } }]
      }
    ],
    cheatsheet: [
      { h: 'Valor típico', items: [['promedio = sum(x) / len(x)', 'Media: sensible a extremos'], ['mediana = centro de sorted(x)', 'Resistente a extremos; úsala en salarios y tickets'], ['moda = max(conteo, key=conteo.get)', 'El valor más frecuente']] },
      { h: 'Dispersión', items: [['max(x) - min(x)', 'Rango'], ['raíz(suma((x - m)²) / (n - 1))', 'Desviación estándar de una muestra'], ['sorted(x)[ceil(0.9 * n) - 1]', 'Percentil 90 (rango más cercano)']] },
      { h: 'Relación entre variables', items: [['r = cov / (desv_x × desv_y)', 'Correlación entre -1 y 1'], ['|r| ≥ 0.7 fuerte · 0.4–0.7 moderada', 'Guía de interpretación'], ['Correlación ≠ causa', 'Busca variables ocultas; prueba con experimentos A/B']] },
      { h: 'Comparar', items: [['eventos / base × 1000', 'Tasa por cada 1,000'], ['nuevo − anterior', 'Puntos porcentuales'], ['(nuevo − anterior) / anterior × 100', 'Cambio relativo'], ['Revisa los subgrupos', 'Paradoja de Simpson']] },
      { h: 'En las herramientas', items: [['df["x"].mean() .median() .std() .quantile(0.9) .corr(df["y"])', 'pandas'], ['AVG() · ROUND(AVG(), 2)', 'SQL (la mediana requiere funciones de ventana)'], ['AVERAGE · MEDIAN · STDEV.S · PERCENTILE.INC', 'DAX']] }
    ]
  };
  C.tracks.push(stats);

  /* ============================================================ SQL EN OTROS MOTORES */
  const sql15 = {
    id: 'sql-15', title: 'Del SQLite a SQL Server y PostgreSQL', minutes: 20, level: 'Avanzado',
    why: 'En una empresa casi nunca usarás SQLite: lo normal es SQL Server, PostgreSQL o MySQL. El 90% de lo que aprendiste es idéntico; cambian unas pocas funciones de fechas, texto y límites. Saber esas diferencias te deja trabajar en cualquier motor desde el primer día.',
    concept: [
      { h: 'Lo que no cambia', p: 'SELECT, WHERE, JOIN, GROUP BY, HAVING, ORDER BY, subconsultas, CTE, CASE y funciones de ventana funcionan igual en todos los motores modernos.', code: '', lang: 'text' },
      { h: 'Limitar filas', p: 'SQLite, PostgreSQL y MySQL usan LIMIT al final. SQL Server usa TOP justo después de SELECT, o OFFSET … FETCH al final.', code: '-- SQLite / PostgreSQL / MySQL\nSELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 5;\n\n-- SQL Server\nSELECT TOP 5 nombre, precio FROM productos ORDER BY precio DESC;', lang: 'sql' },
      { h: 'Fechas', p: 'Es donde más cambian. SQLite usa strftime; SQL Server YEAR(), MONTH(), FORMAT() y DATEDIFF(); PostgreSQL EXTRACT(), DATE_TRUNC() y resta de fechas.', code: "-- SQLite\nSELECT strftime('%Y', fecha) AS anio FROM pedidos;\n-- SQL Server\nSELECT YEAR(fecha) AS anio FROM pedidos;\n-- PostgreSQL\nSELECT EXTRACT(YEAR FROM fecha) AS anio FROM pedidos;", lang: 'sql' },
      { h: 'Texto y nulos', p: 'Concatenar: || en SQLite y PostgreSQL, + o CONCAT en SQL Server. Reemplazar nulos: COALESCE funciona en todos; SQL Server también tiene ISNULL e IFNULL existe en SQLite y MySQL.', code: "-- SQLite / PostgreSQL\nSELECT nombre || ' (' || ciudad || ')' FROM clientes;\n-- SQL Server\nSELECT CONCAT(nombre, ' (', ciudad, ')') FROM clientes;", lang: 'sql' }
    ],
    guide: [{ name: 'Tabla de equivalencias', syntax: '-- Pregunta: ¿cómo se escribe esto en mi motor?\n-- Regla: si existe en el estándar (COALESCE, CASE, CAST), úsalo:\n-- funciona igual en todos.',
      parts: [['LIMIT / TOP', 'La diferencia más visible.'], ['Fechas', 'Cada motor tiene sus funciones; la lógica (extraer año, agrupar por mes) es la misma.'], ['COALESCE', 'Estándar: prefierelo sobre ISNULL o IFNULL.'], ['Concatenar', '|| es el estándar; SQL Server usa + o CONCAT.']],
      when: 'Al pasar una consulta de un motor a otro o al leer documentación de otro motor.',
      read: 'En SQL Server, TOP 5 hace lo que en SQLite hace LIMIT 5.',
      demo: { kind: 'static', single: true, after: { cols: ['Tarea', 'SQLite', 'SQL Server', 'PostgreSQL'], rows: [['Primeras 5 filas', 'LIMIT 5', 'SELECT TOP 5 …', 'LIMIT 5'], ['Año de una fecha', "strftime('%Y', f)", 'YEAR(f)', 'EXTRACT(YEAR FROM f)'], ['Año-mes', "strftime('%Y-%m', f)", "FORMAT(f, 'yyyy-MM')", "TO_CHAR(f, 'YYYY-MM')"], ['Días entre fechas', 'julianday(b) - julianday(a)', 'DATEDIFF(day, a, b)', 'b - a'], ['Fecha de hoy', "date('now')", 'GETDATE()', 'CURRENT_DATE'], ['Reemplazar nulos', 'COALESCE / IFNULL', 'COALESCE / ISNULL', 'COALESCE'], ['Concatenar', 'a || b', 'a + b o CONCAT(a, b)', 'a || b'], ['Convertir tipo', 'CAST(x AS INTEGER)', 'CAST(x AS INT)', 'CAST(x AS INTEGER) o x::int'], ['Mayúsculas', 'UPPER(x)', 'UPPER(x)', 'UPPER(x)'], ['Texto con patrón', "LIKE 'A%'", "LIKE 'A%'", "LIKE 'A%' o ILIKE"]] }, note: 'Con esta tabla puedes traducir casi cualquier consulta del curso. La estructura de la consulta no cambia; solo algunas funciones.' } }],
    practice: { prompt: 'Esta consulta es de SQL Server: SELECT TOP 3 nombre, salario FROM empleados ORDER BY salario DESC. Escríbela para SQLite.', starter: '', solution: 'SELECT nombre, salario FROM empleados ORDER BY salario DESC LIMIT 3;', ordered: true, hints: ['TOP n se convierte en LIMIT n al final.'] },
    extra: [
      { level: 'Intermedio', prompt: "Traduce a SQLite esta consulta de SQL Server: SELECT YEAR(fecha) AS anio, COUNT(*) AS pedidos FROM pedidos GROUP BY YEAR(fecha) ORDER BY anio.", starter: '', solution: "SELECT strftime('%Y', fecha) AS anio, COUNT(*) AS pedidos FROM pedidos GROUP BY anio ORDER BY anio;", ordered: true, hints: ["YEAR(fecha) en SQLite es strftime('%Y', fecha)."] },
      { level: 'Intermedio', prompt: "Traduce a SQLite esta consulta de SQL Server: SELECT nombre, ISNULL(correo, 'sin correo') AS correo FROM clientes WHERE pais = 'Perú'. Usa la función estándar.", starter: '', solution: "SELECT nombre, COALESCE(correo, 'sin correo') AS correo FROM clientes WHERE pais = 'Perú';", hints: ['COALESCE funciona en todos los motores.'] },
      { level: 'Reto', prompt: "Traduce a SQLite esta consulta de PostgreSQL: SELECT TO_CHAR(fecha, 'YYYY-MM') AS mes, COUNT(*) AS pedidos FROM pedidos WHERE EXTRACT(YEAR FROM fecha) = 2024 GROUP BY 1 ORDER BY 1.", starter: '', solution: "SELECT strftime('%Y-%m', fecha) AS mes, COUNT(*) AS pedidos FROM pedidos WHERE strftime('%Y', fecha) = '2024' GROUP BY 1 ORDER BY 1;", ordered: true, hints: ["TO_CHAR(fecha, 'YYYY-MM') es strftime('%Y-%m', fecha).", "strftime devuelve texto: compara con '2024' entre comillas."] }
    ],
    quiz: [
      { q: '¿Qué función para reemplazar nulos funciona igual en SQLite, SQL Server y PostgreSQL?', options: ['ISNULL', 'IFNULL', 'COALESCE', 'NVL'], answer: 2, explain: 'COALESCE es parte del estándar SQL y la soportan todos los motores principales.' },
      { q: 'En SQL Server, ¿cómo se piden las 10 primeras filas?', options: ['LIMIT 10 al final', 'SELECT TOP 10 …', 'ROWNUM <= 10', 'FIRST 10'], answer: 1, explain: 'SQL Server usa TOP después de SELECT (o OFFSET … FETCH). LIMIT es de SQLite, PostgreSQL y MySQL.' }
    ]
  };
  T.sql.lessons.push(sql15);
  T.sql.cheatsheet.push({ h: 'Traducir entre motores', items: [['LIMIT 5  ↔  SELECT TOP 5', 'SQLite/PostgreSQL ↔ SQL Server'], ["strftime('%Y', f)  ↔  YEAR(f)  ↔  EXTRACT(YEAR FROM f)", 'Año: SQLite, SQL Server, PostgreSQL'], ['julianday(b) - julianday(a)  ↔  DATEDIFF(day, a, b)', 'Días entre fechas'], ['a || b  ↔  CONCAT(a, b)', 'Concatenar'], ['COALESCE(x, 0)', 'Reemplazar nulos: funciona en todos']] });

  /* ============================================================ GLOSARIO */
  C.glossary = [
    ['Tabla', 'sql', 'sql-0', 'Conjunto de datos organizado en filas y columnas sobre un mismo tema: clientes, pedidos, productos.'],
    ['Fila (registro)', 'sql', 'sql-0', 'Una entrada de la tabla. Saber qué representa una fila (un pedido, una línea de pedido) es clave para no contar de más.'],
    ['Clave primaria', 'sql', 'sql-0', 'Columna que identifica cada fila de forma única, normalmente id.'],
    ['Clave foránea', 'sql', 'sql-0', 'Columna que guarda la clave primaria de otra tabla y así las relaciona, como pedidos.cliente_id.'],
    ['NULL', 'sql', 'sql-2', 'Ausencia de dato. No es cero ni texto vacío; se consulta con IS NULL.'],
    ['Función agregada', 'sql', 'sql-4', 'Resume varias filas en un valor: COUNT, SUM, AVG, MIN, MAX.'],
    ['GROUP BY', 'sql', 'sql-4', 'Agrupa filas por los valores de una columna para calcular agregadas por grupo.'],
    ['HAVING', 'sql', 'sql-5', 'Filtra grupos después de agrupar; admite funciones agregadas.'],
    ['JOIN', 'sql', 'sql-6', 'Une filas de dos tablas que cumplen una condición, normalmente clave foránea igual a clave primaria.'],
    ['LEFT JOIN', 'sql', 'sql-6', 'JOIN que conserva todas las filas de la tabla izquierda, aunque no tengan pareja.'],
    ['Subconsulta', 'sql', 'sql-8', 'Consulta dentro de otra, que se ejecuta primero y entrega un valor o una tabla.'],
    ['CTE', 'sql', 'sql-8', 'Common Table Expression: una consulta con nombre definida con WITH, para escribir en pasos.'],
    ['Función de ventana', 'sql', 'sql-10', 'Cálculo sobre un grupo de filas que no las colapsa: ROW_NUMBER, RANK, SUM OVER, LAG.'],
    ['Transacción', 'sql', 'sql-11', 'Grupo de cambios que se confirman (COMMIT) o se deshacen (ROLLBACK) juntos.'],
    ['Índice', 'sql', 'sql-12', 'Estructura que acelera las búsquedas por una columna a cambio de escrituras algo más lentas.'],
    ['Normalización', 'sql', 'sql-12', 'Diseñar tablas para que cada dato se guarde en un solo lugar.'],
    ['Dialecto SQL', 'sql', 'sql-15', 'La variante de SQL de cada motor (SQL Server, PostgreSQL…). Difieren sobre todo en fechas y límites.'],
    ['Variable', 'python', 'py-1', 'Nombre que guarda un valor para usarlo después.'],
    ['f-string', 'python', 'py-1', 'Texto con f delante donde se insertan valores entre llaves: f"Total: {x:.2f}".'],
    ['Tipo de dato', 'python', 'py-2', 'Clase de valor: entero (int), decimal (float), texto (str), booleano (bool).'],
    ['Lista', 'python', 'py-4', 'Colección ordenada de valores entre corchetes.'],
    ['Bucle for', 'python', 'py-4', 'Repite un bloque una vez por cada elemento de una colección.'],
    ['Diccionario', 'python', 'py-5', 'Colección de pares clave-valor; ideal para contar y agrupar.'],
    ['Función', 'python', 'py-6', 'Bloque de código con nombre que recibe parámetros y devuelve un resultado con return.'],
    ['Comprensión de listas', 'python', 'py-7', 'Forma corta de crear una lista a partir de otra: [x * 2 for x in lista if x > 0].'],
    ['Excepción', 'python', 'py-8', 'Error que ocurre al ejecutar; try y except permiten manejarlo sin detener el programa.'],
    ['CSV', 'python', 'py-9', 'Archivo de texto con una fila por línea y columnas separadas por comas.'],
    ['DataFrame', 'python', 'py-11', 'La tabla de pandas: filas y columnas con nombre, en memoria.'],
    ['groupby', 'python', 'py-14', 'Método de pandas que agrupa filas para resumirlas, como GROUP BY.'],
    ['merge', 'python', 'py-14', 'Método de pandas que une dos tablas por columnas en común, como JOIN.'],
    ['NaN', 'python', 'py-16', 'Valor faltante en pandas (Not a Number).'],
    ['Modelo en estrella', 'powerbi', 'pbi-3', 'Diseño con una tabla de hechos en el centro y dimensiones alrededor.'],
    ['Tabla de hechos', 'powerbi', 'pbi-3', 'Tabla de eventos medibles con muchas filas: ventas, movimientos, tickets.'],
    ['Dimensión', 'powerbi', 'pbi-3', 'Tabla que describe y filtra a los hechos: productos, clientes, calendario.'],
    ['Relación', 'powerbi', 'pbi-3', 'Conexión entre una dimensión (lado 1) y los hechos (lado *) por una clave.'],
    ['Medida', 'powerbi', 'pbi-4', 'Fórmula DAX que se calcula según los filtros del visual.'],
    ['Columna calculada', 'powerbi', 'pbi-5', 'Columna nueva calculada fila por fila al cargar el modelo.'],
    ['Contexto de filtro', 'powerbi', 'pbi-6', 'Los filtros activos cuando se evalúa una medida: segmentadores, ejes, filas de la tabla.'],
    ['CALCULATE', 'powerbi', 'pbi-6', 'Función DAX que evalúa una expresión con filtros modificados.'],
    ['Contexto de fila', 'powerbi', 'pbi-7', 'La fila actual dentro de un iterador o una columna calculada.'],
    ['Iterador', 'powerbi', 'pbi-7', 'Función que recorre una tabla fila por fila: SUMX, AVERAGEX, FILTER.'],
    ['Transición de contexto', 'powerbi', 'pbi-7', 'Cuando una medida se usa dentro de un iterador, la fila actual se convierte en filtros.'],
    ['Power Query', 'powerbi', 'pbi-2', 'El editor donde se limpian y transforman los datos antes del modelo.'],
    ['Código M', 'powerbi', 'pbi-2', 'El lenguaje que genera cada paso de Power Query.'],
    ['Anular dinamización', 'powerbi', 'pbi-2', 'Convierte columnas (como meses) en filas de pares atributo-valor.'],
    ['Tabla de calendario', 'powerbi', 'pbi-9', 'Tabla con un día por fila, continua y marcada como tabla de fechas.'],
    ['Inteligencia de tiempo', 'powerbi', 'pbi-9', 'Funciones DAX que comparan periodos: DATESYTD, SAMEPERIODLASTYEAR, DATEADD.'],
    ['Segmentador', 'powerbi', 'pbi-8', 'Control visual que filtra toda la página.'],
    ['Puerta de enlace', 'powerbi', 'pbi-9', 'Programa que conecta Power BI Service con datos de la red de la empresa.'],
    ['RLS', 'powerbi', 'pbi-9', 'Seguridad a nivel de fila: cada usuario ve solo sus datos.'],
    ['Media', 'stats', 'st-1', 'Promedio: la suma dividida entre la cantidad de valores.'],
    ['Mediana', 'stats', 'st-1', 'El valor central de los datos ordenados; resistente a extremos.'],
    ['Valor atípico', 'stats', 'st-1', 'Dato muy alejado del resto; se investiga antes de excluirlo.'],
    ['Desviación estándar', 'stats', 'st-2', 'Distancia típica de los valores a su promedio.'],
    ['Percentil', 'stats', 'st-2', 'Valor por debajo del cual queda un porcentaje de los datos; P50 es la mediana.'],
    ['Histograma', 'stats', 'st-3', 'Gráfico de cuántos valores caen en cada intervalo.'],
    ['Correlación', 'stats', 'st-4', 'Medida entre -1 y 1 de qué tanto dos variables se mueven juntas.'],
    ['Punto porcentual', 'stats', 'st-5', 'Diferencia entre dos porcentajes: de 4% a 5% es un punto porcentual.'],
    ['Paradoja de Simpson', 'stats', 'st-5', 'Cuando una tendencia en cada subgrupo se invierte al juntar los grupos.']
  ];

  /* ============================================================ INSIGNIAS Y PLAN */
  C.badges.push(
    { id: 'stats-done', name: 'Ojo estadístico', desc: 'Toda la ruta de Estadística.', test: s => stats.lessons.every(l => s.completed.includes(l.id)) },
    { id: 'desktop', name: 'En el mundo real', desc: 'Terminaste la guía de Power BI Desktop.', test: s => !!s.desktopGuideDone },
    { id: 'cert', name: 'Certificado', desc: 'Obtuviste tu primer certificado de ruta.', test: s => !!(s.certs && Object.keys(s.certs).length) }
  );
  C.plan.splice(C.plan.length - 1, 0, { week: 12, title: 'Estadística para analistas y otros motores', lessons: ['st-1', 'st-2', 'st-3', 'st-4', 'st-5', 'sql-15'] });
  C.plan.forEach((w, i) => { w.week = i + 1; });
  C.daily.push(
    { track: 'stats', q: 'Los salarios tienen promedio 40,000 y mediana 22,000. ¿Qué describe mejor al empleado típico?', options: ['El promedio', 'La mediana', 'Los dos igual', 'Ninguno'], answer: 1, explain: 'Unos pocos salarios muy altos jalan el promedio; la mediana representa al empleado del centro.' },
    { track: 'stats', q: 'Dos variables tienen r = -0.85. ¿Qué significa?', options: ['Que no tienen relación', 'Que cuando una sube, la otra tiende a bajar', 'Que una causa la otra', 'Que el cálculo está mal'], answer: 1, explain: 'Una correlación negativa fuerte indica que se mueven en direcciones opuestas; no dice cuál causa cuál.' },
    { track: 'sql', q: 'En SQL Server, ¿cómo se escribe LIMIT 5?', options: ['LIMIT 5', 'SELECT TOP 5', 'FIRST 5', 'ROWS 5'], answer: 1, explain: 'SQL Server usa TOP después de SELECT.' }
  );
})();
