/* DataForja — evaluación y aplicación: exámenes finales, proyectos integradores e insignias.
   Se carga después de content.js y content-extra.js. */
(function () {
  const C = window.CONTENT;
  const T = Object.fromEntries(C.tracks.map(t => [t.id, t]));

  /* ============================================================ EXÁMENES FINALES
     Preguntas nuevas (no repiten los retos de las lecciones) para medir transferencia.
     Cada pregunta indica la lección que la respalda, para recomendar repaso al fallar. */
  T.python.exam = {
    passMark: 70,
    questions: [
      { lesson: 'py-1', q: '¿Qué imprime este código?\nx = 7\ny = 2\nprint(f"{x / y:.1f}")', options: ['3', '3.5', '3.50', '4'], answer: 1, explain: 'La división / siempre da decimal (3.5) y :.1f lo muestra con un decimal.' },
      { lesson: 'py-2', q: '¿Qué devuelve "  Hola ".strip().upper()?', options: ['"  HOLA "', '"HOLA"', '"Hola"', '"hola"'], answer: 1, explain: 'strip() quita los espacios de los extremos y upper() pasa todo a mayúsculas.' },
      { lesson: 'py-2', q: '¿Qué imprime print(int("08") + float("1.5"))?', options: ['9.5', '81.5', 'Error: "08" no es un número válido', '9'], answer: 0, explain: 'int("08") es 8 (los ceros a la izquierda se aceptan). 8 + 1.5 = 9.5.' },
      { lesson: 'py-3', q: '¿Qué valor queda en r?\nx = 15\nif x > 10 and x < 20:\n    r = "A"\nelif x > 5:\n    r = "B"\nelse:\n    r = "C"', options: ['"A"', '"B"', '"A" y luego "B"', '"C"'], answer: 0, explain: 'La primera condición es verdadera, así que se ejecuta ese bloque y el resto de la cadena se ignora.' },
      { lesson: 'py-4', q: '¿Qué imprime este código?\nl = [3, 1, 2]\nl.append(5)\nprint(l[-2], len(l))', options: ['5 4', '2 4', '2 3', '1 4'], answer: 1, explain: 'Tras append la lista es [3, 1, 2, 5]. l[-2] es el penúltimo (2) y la longitud es 4.' },
      { lesson: 'py-4', q: '¿Qué imprime este código?\ntotal = 0\nfor n in range(1, 5):\n    total += n\nprint(total)', options: ['15', '10', '4', '5'], answer: 1, explain: 'range(1, 5) genera 1, 2, 3 y 4 (el 5 no se incluye). Suman 10.' },
      { lesson: 'py-5', q: '¿Qué imprime este código?\nd = {"a": 1}\nd["b"] = d.get("b", 0) + 1\nd["a"] += 1\nprint(d)', options: ["{'a': 1, 'b': 1}", "{'a': 2, 'b': 1}", "{'a': 2, 'b': 0}", 'KeyError'], answer: 1, explain: 'get("b", 0) devuelve 0 porque "b" no existe, así que b queda en 1. Después a pasa de 1 a 2.' },
      { lesson: 'py-5', q: 'Tienes la lista de tickets cerrados y quieres saber cuántos cerró cada agente. ¿Qué estructura usas para acumular?', options: ['Una lista ordenada', 'Un diccionario agente → contador', 'Un texto concatenado', 'Una tupla'], answer: 1, explain: 'Contar por categoría es el caso típico del diccionario: la clave es el agente y el valor su contador.' },
      { lesson: 'py-6', q: '¿Qué imprime este código?\ndef f(x, y=2):\n    return x * y\nprint(f(3), f(3, 3))', options: ['6 6', '6 9', '9 9', 'Error: falta y'], answer: 1, explain: 'Sin segundo argumento se usa y=2 (3 × 2 = 6). Con f(3, 3) el valor por defecto se reemplaza (9).' },
      { lesson: 'py-7', q: '¿Qué produce [n for n in range(6) if n % 2 == 0]?', options: ['[2, 4, 6]', '[0, 2, 4]', '[0, 2, 4, 6]', '[1, 3, 5]'], answer: 1, explain: 'range(6) va de 0 a 5, y el filtro conserva los pares: 0, 2 y 4.' },
      { lesson: 'py-7', q: '¿Qué devuelve sorted(["bb", "a", "ccc"], key=len, reverse=True)?', options: ["['a', 'bb', 'ccc']", "['ccc', 'bb', 'a']", "['bb', 'a', 'ccc']", "['ccc', 'a', 'bb']"], answer: 1, explain: 'key=len ordena por longitud y reverse=True pone primero la más larga.' },
      { lesson: 'py-8', q: '¿Qué imprime este código?\ntry:\n    x = int("3.0")\nexcept ValueError:\n    x = -1\nprint(x)', options: ['3', '3.0', '-1', 'Error sin capturar'], answer: 2, explain: 'int() no acepta un texto con punto decimal: lanza ValueError, el except lo captura y x vale -1.' },
      { lesson: 'py-9', q: '¿Cuántos elementos tiene "a,b,,c".split(",")?', options: ['3', '4', '5', '2'], answer: 1, explain: 'Entre las dos comas seguidas hay un campo vacío: ["a", "b", "", "c"]. En un CSV real eso es un dato faltante.' },
      { lesson: 'py-12', q: 'En una clase, ¿cuándo se ejecuta el método __init__?', options: ['Cada vez que se imprime el objeto', 'Al crear un objeto nuevo de esa clase', 'Al borrar el objeto', 'Solo si se llama explícitamente objeto.__init__()'], answer: 1, explain: '__init__ inicializa el objeto en el momento de crearlo, por ejemplo Empleado("Ana", 30000).' },
      { lesson: 'py-13', q: '¿Qué devuelve json.loads(\'{"a": [1, 2]}\')["a"][1]?', options: ['1', '2', '[1, 2]', 'Un texto "2"'], answer: 1, explain: 'loads convierte el texto en un diccionario; ["a"] es la lista [1, 2] y [1] su segundo elemento: el número 2.' }
    ],
    tasks: [
      { prompt: 'Totales por región. Con la lista de ventas dada, imprime el total de cada región ordenado de mayor a menor, una línea por región con el formato "Region: total".',
        starter: 'ventas = [("Norte", 1200), ("Sur", 800), ("Norte", 500), ("Centro", 950), ("Sur", 300)]\n\n',
        expected: 'Norte: 1700\nSur: 1100\nCentro: 950',
        solution: 'ventas = [("Norte", 1200), ("Sur", 800), ("Norte", 500), ("Centro", 950), ("Sur", 300)]\n\ntotales = {}\nfor region, monto in ventas:\n    totales[region] = totales.get(region, 0) + monto\n\nfor region, total in sorted(totales.items(), key=lambda kv: kv[1], reverse=True):\n    print(f"{region}: {total}")',
        hints: [] },
      { prompt: 'Escribe limpiar_monto(texto) que convierta textos como "$1,200.50" en número (1200.5) y devuelva None si el texto no se puede convertir. Imprime el resultado para cada elemento de la lista, uno por línea.',
        starter: 'def limpiar_monto(texto):\n    pass\n\nfor t in ["$1,200.50", "abc", "300"]:\n    print(limpiar_monto(t))',
        expected: '1200.5\nNone\n300.0',
        solution: 'def limpiar_monto(texto):\n    limpio = texto.replace("$", "").replace(",", "")\n    try:\n        return float(limpio)\n    except ValueError:\n        return None\n\nfor t in ["$1,200.50", "abc", "300"]:\n    print(limpiar_monto(t))',
        hints: [] }
    ]
  };

  T.sql.exam = {
    passMark: 70,
    questions: [
      { lesson: 'sql-1', q: '¿Cuál es el orden correcto de las cláusulas al escribir una consulta?', options: ['SELECT, WHERE, FROM, GROUP BY', 'SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY', 'FROM, SELECT, ORDER BY, WHERE', 'SELECT, FROM, GROUP BY, WHERE, ORDER BY'], answer: 1, explain: 'Se escribe SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT. WHERE siempre va antes de agrupar.' },
      { lesson: 'sql-2', q: '¿Cuántas filas devuelve SELECT * FROM clientes WHERE correo = NULL?', options: ['Las que no tienen correo', 'Ninguna, siempre', 'Todas', 'Da error de sintaxis'], answer: 1, explain: 'Cualquier comparación con NULL usando = resulta desconocida, nunca verdadera. Se debe usar IS NULL.' },
      { lesson: 'sql-2', q: 'WHERE precio BETWEEN 100 AND 200, ¿incluye un producto de precio 200?', options: ['Sí, BETWEEN incluye ambos extremos', 'No, excluye el extremo superior', 'Solo si el precio es entero', 'Depende del ORDER BY'], answer: 0, explain: 'BETWEEN es inclusivo en los dos extremos: equivale a precio >= 100 AND precio <= 200.' },
      { lesson: 'sql-2', q: '¿Qué nombres encuentra WHERE nombre LIKE \'%ez\'?', options: ['Los que empiezan con "ez"', 'Los que terminan en "ez"', 'Los que contienen exactamente "ez"', 'Los de 2 letras'], answer: 1, explain: 'El % representa cualquier texto. Al estar al inicio, el patrón exige que el nombre termine en "ez" (Pérez, López…).' },
      { lesson: 'sql-3', q: '¿Qué devuelve SELECT nombre FROM empleados ORDER BY salario DESC LIMIT 1?', options: ['El empleado con menor salario', 'El empleado con mayor salario', 'El primer empleado registrado', 'Todos ordenados'], answer: 1, explain: 'DESC ordena de mayor a menor y LIMIT 1 se queda con la primera fila.' },
      { lesson: 'sql-4', q: 'En una tabla de 40 clientes, 6 no tienen correo. ¿Qué devuelven COUNT(*) y COUNT(correo)?', options: ['40 y 40', '40 y 34', '34 y 34', '34 y 40'], answer: 1, explain: 'COUNT(*) cuenta filas; COUNT(columna) ignora los NULL de esa columna.' },
      { lesson: 'sql-4', q: '¿Por qué falla SELECT ciudad, nombre, COUNT(*) FROM clientes GROUP BY ciudad?', options: ['COUNT necesita una columna', 'nombre no está en el GROUP BY ni dentro de una agregación', 'Falta ORDER BY', 'ciudad debe ir al final'], answer: 1, explain: 'Cada grupo tiene muchos nombres y SQL no sabe cuál mostrar. Las columnas del SELECT deben estar agrupadas o agregadas.' },
      { lesson: 'sql-5', q: 'Quieres las ciudades con más de 3 clientes. ¿Dónde va la condición COUNT(*) > 3?', options: ['En WHERE', 'En HAVING', 'En ORDER BY', 'En SELECT'], answer: 1, explain: 'Una condición sobre una agregación filtra grupos, y eso es trabajo de HAVING. WHERE actúa antes de agrupar.' },
      { lesson: 'sql-6', q: '¿Qué devuelve FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL?', options: ['Todos los pedidos', 'Los clientes que no tienen ningún pedido', 'Los pedidos sin cliente', 'Nada, LEFT JOIN no admite WHERE'], answer: 1, explain: 'LEFT JOIN conserva a todos los clientes; los que no tienen pareja quedan con las columnas de pedidos en NULL.' },
      { lesson: 'sql-6', q: 'Hay 10 clientes y 3 de ellos nunca han comprado. ¿Cuántos clientes distintos aparecen en clientes INNER JOIN pedidos?', options: ['10', '7', '3', '13'], answer: 1, explain: 'INNER JOIN solo conserva las filas con coincidencia en ambas tablas: los 7 clientes que sí tienen pedidos.' },
      { lesson: 'sql-7', q: 'Unes pedidos con detalle_pedidos y quieres saber cuántos pedidos hay. ¿Qué usas?', options: ['COUNT(*)', 'COUNT(DISTINCT p.id)', 'SUM(p.id)', 'MAX(p.id)'], answer: 1, explain: 'Cada pedido se repite tantas veces como líneas tenga. COUNT(DISTINCT p.id) cuenta cada pedido una sola vez.' },
      { lesson: 'sql-8', q: '¿Qué ventaja principal tiene WITH (un CTE) frente a anidar subconsultas?', options: ['Siempre es más rápido', 'Da nombre a pasos intermedios y la consulta se lee de arriba abajo', 'Permite borrar datos', 'Evita usar JOIN'], answer: 1, explain: 'Un CTE es una consulta con nombre: separa la lógica en pasos legibles que puedes reutilizar en la consulta principal.' },
      { lesson: 'sql-9', q: 'Precio = 3500. ¿Qué devuelve CASE WHEN precio >= 800 THEN \'Medio\' WHEN precio >= 3000 THEN \'Premium\' ELSE \'Económico\' END?', options: ["'Premium'", "'Medio'", "'Económico'", 'Ambos'], answer: 1, explain: 'CASE devuelve el primer WHEN verdadero. 3500 >= 800 ya se cumple, así que nunca llega a Premium: por eso las condiciones más exigentes van primero.' },
      { lesson: 'sql-10', q: 'Salarios 100, 100 y 90 ordenados de mayor a menor. ¿Qué devuelve RANK()?', options: ['1, 2, 3', '1, 1, 2', '1, 1, 3', '1, 2, 2'], answer: 2, explain: 'RANK da el mismo puesto en los empates y deja un hueco después. DENSE_RANK daría 1, 1, 2; ROW_NUMBER 1, 2, 3.' },
      { lesson: 'sql-11', q: '¿Qué hace UPDATE productos SET precio = precio * 1.1; sin WHERE?', options: ['Nada, falta WHERE', 'Sube 10% el precio de todos los productos', 'Solo cambia el primero', 'Da error'], answer: 1, explain: 'Sin WHERE, UPDATE afecta a todas las filas. Por eso se prueba antes con un SELECT y se trabaja dentro de una transacción.' }
    ],
    tasks: [
      { prompt: 'Clientes de México con más de 5 pedidos entregados. Columnas: nombre, pedidos. Ordena por pedidos de mayor a menor y, en empate, por nombre.',
        starter: 'SELECT c.nombre, \nFROM clientes c\n',
        solution: "SELECT c.nombre, COUNT(*) AS pedidos FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE c.pais = 'México' AND p.estado = 'Entregado' GROUP BY c.id HAVING COUNT(*) > 5 ORDER BY pedidos DESC, c.nombre;",
        ordered: true, hints: [] },
      { prompt: 'El producto con más ingreso de cada categoría (ingreso = suma de cantidad * precio_unitario). Columnas: categoria, producto, ingreso redondeado a 2 decimales. Ordena por categoria.',
        starter: 'WITH ingresos AS (\n    \n)\nSELECT categoria, producto, ingreso\nFROM ingresos\n',
        solution: 'WITH ing AS (SELECT pr.categoria, pr.nombre AS producto, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS ingreso FROM detalle_pedidos d JOIN productos pr ON pr.id = d.producto_id GROUP BY pr.id), r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY ingreso DESC) AS n FROM ing) SELECT categoria, producto, ingreso FROM r WHERE n = 1 ORDER BY categoria;',
        ordered: true, hints: [] }
    ]
  };

  T.powerbi.exam = {
    passMark: 70,
    questions: [
      { lesson: 'pbi-1', q: 'Una columna de fechas llega como texto. ¿Dónde conviene convertirla a tipo fecha?', options: ['En cada visual', 'En Power Query, como un paso de transformación', 'En una medida DAX', 'En Power BI Service'], answer: 1, explain: 'Los tipos se corrigen una sola vez, lo más atrás posible en el flujo. Todo el modelo se beneficia.' },
      { lesson: 'pbi-2', q: 'Un reporte llega con una columna por mes (Ene, Feb, Mar…). ¿Qué transformación lo deja listo para Power BI?', options: ['Combinar consultas', 'Anular dinamización de columnas (unpivot)', 'Agrupar por', 'Dividir columna'], answer: 1, explain: 'Unpivot convierte las columnas de meses en filas (Mes, Valor), el formato largo que necesitan las medidas y los visuales.' },
      { lesson: 'pbi-2', q: 'Recibes el mismo reporte cada mes en archivos separados. ¿Cómo los unes en una tabla?', options: ['Anexar consultas (append)', 'Combinar consultas (merge)', 'Una relación', 'Una medida'], answer: 0, explain: 'Anexar apila tablas con las mismas columnas. Combinar las une lado a lado por una clave, como un JOIN.' },
      { lesson: 'pbi-3', q: '¿Cuál de estas tablas es una dimensión?', options: ['Ventas por línea de pedido', 'Movimientos de inventario', 'Productos con su categoría', 'Registro de tickets atendidos'], answer: 2, explain: 'Productos describe entidades y tiene pocas filas: es una dimensión. Las otras registran eventos medibles: son hechos.' },
      { lesson: 'pbi-3', q: 'Relación uno a varios entre DimRegion y Ventas. Eliges "Norte" en un segmentador de DimRegion. ¿Qué pasa?', options: ['Se filtran las ventas del Norte', 'Se filtra DimRegion pero no las ventas', 'Nada, hace falta una medida', 'Se filtran todas las tablas del modelo'], answer: 0, explain: 'El filtro fluye del lado uno (dimensión) al lado varios (hechos).' },
      { lesson: 'pbi-4', q: 'Ventas tiene 1,000 filas de 25 productos distintos. ¿Qué devuelven COUNTROWS(Ventas) y DISTINCTCOUNT(Ventas[Producto])?', options: ['25 y 1,000', '1,000 y 25', '1,000 y 1,000', '25 y 25'], answer: 1, explain: 'COUNTROWS cuenta filas; DISTINCTCOUNT cuenta valores únicos de una columna.' },
      { lesson: 'pbi-5', q: 'Quieres una tarjeta con el margen % que cambie al usar los segmentadores. ¿Qué creas?', options: ['Una columna calculada de margen por fila', 'Una medida con DIVIDE de las sumas', 'Una tabla calculada', 'Un marcador'], answer: 1, explain: 'Un indicador que responde a filtros es una medida, y una razón se calcula dividiendo sumas, no promediando porcentajes.' },
      { lesson: 'pbi-5', q: '¿Por qué usar DIVIDE(a, b) en lugar de a / b?', options: ['Es más rápido', 'Devuelve BLANK (o una alternativa) cuando b es cero, en vez de un error', 'Redondea el resultado', 'Solo funciona con enteros'], answer: 1, explain: 'DIVIDE maneja la división entre cero, que en un visual con muchos filtros ocurre con frecuencia.' },
      { lesson: 'pbi-6', q: 'El segmentador tiene Región = Sur. ¿Qué devuelve CALCULATE([Ventas Totales], Ventas[Region] = "Norte")?', options: ['Ventas de Sur', 'Ventas de Norte', 'Ventas de Norte más Sur', 'BLANK'], answer: 1, explain: 'Un filtro de CALCULATE sobre una columna reemplaza el filtro existente de esa misma columna.' },
      { lesson: 'pbi-6', q: '¿Cómo se combinan dos filtros en CALCULATE([V], Ventas[Año] = 2024, Ventas[Region] = "Norte")?', options: ['Con OR', 'Con AND: ventas del Norte en 2024', 'Solo aplica el último', 'Da error'], answer: 1, explain: 'Los argumentos de filtro de CALCULATE se aplican todos a la vez, es decir, con AND.' },
      { lesson: 'pbi-7', q: 'Gráfico por Región, segmentador Año = 2024. ¿Contra qué se divide cada barra en DIVIDE([V], CALCULATE([V], ALL(Ventas[Region])))?', options: ['Contra el total de todos los años', 'Contra el total de 2024 de todas las regiones', 'Contra 2023', 'Contra la misma región'], answer: 1, explain: 'ALL(Ventas[Region]) solo quita el filtro de región; el de año sigue activo.' },
      { lesson: 'pbi-7', q: 'Necesitas sumar Precio × Unidades fila por fila. ¿Qué función usas?', options: ['SUM(Ventas[Precio]) * SUM(Ventas[Unidades])', 'SUMX(Ventas, Ventas[Precio] * Ventas[Unidades])', 'CALCULATE(Ventas[Precio] * Ventas[Unidades])', 'DIVIDE'], answer: 1, explain: 'SUMX recorre cada fila, multiplica y luego suma. Multiplicar las dos sumas da un número sin sentido.' },
      { lesson: 'pbi-8', q: 'Quieres mostrar la evolución mensual de las ventas de dos años. ¿Qué visual eliges?', options: ['Gráfico circular', 'Gráfico de líneas', 'Tarjeta', 'Mapa'], answer: 1, explain: 'Las líneas muestran evolución en el tiempo y permiten comparar dos series.' },
      { lesson: 'pbi-9', q: 'SAMEPERIODLASTYEAR devuelve BLANK en todos los meses. ¿Cuál es la causa más probable?', options: ['Falta un segmentador', 'No hay una tabla de calendario continua, marcada y relacionada', 'El informe no está publicado', 'Falta ORDER BY'], answer: 1, explain: 'La inteligencia de tiempo necesita una tabla de fechas continua, marcada como tabla de fechas y relacionada con los hechos.' },
      { lesson: 'pbi-11', q: 'En una tabla por región, el total de la columna Margen % no es la suma de las filas. ¿Es un error?', options: ['Sí, siempre debe coincidir', 'No: el total se evalúa con su propio contexto, y para un porcentaje es lo correcto', 'Sí, falta SUMX', 'Solo si hay segmentadores'], answer: 1, explain: 'Cada celda, incluido el total, evalúa la medida con su contexto. Sumar porcentajes de filas no tiene sentido.' }
    ],
    tasks: [
      { prompt: 'Escribe la expresión que devuelve las ventas (columna Ventas) de la categoría Oficina en 2024.',
        starter: '', solution: 'CALCULATE(SUM(Ventas[Ventas]), Ventas[Categoria] = "Oficina", Ventas[Año] = 2024)', hints: [] },
      { prompt: 'Escribe la participación de la región Norte sobre las ventas totales de todas las regiones y años, usando DIVIDE, CALCULATE y ALL.',
        starter: 'DIVIDE(', solution: 'DIVIDE(CALCULATE(SUM(Ventas[Ventas]), Ventas[Region] = "Norte"), CALCULATE(SUM(Ventas[Ventas]), ALL(Ventas)))', hints: [] }
    ]
  };

  /* ============================================================ PROYECTOS INTEGRADORES
     Cada proyecto recorre el flujo real: extraer con SQL, analizar con Python y medir con DAX
     sobre los mismos datos, y termina llevándolo a Power BI Desktop. */
  C.projectDatasetSQL = `SELECT p.id AS Pedido, p.fecha AS Fecha, CAST(strftime('%Y', p.fecha) AS INTEGER) AS "Año", CAST(strftime('%m', p.fecha) AS INTEGER) AS Mes,
  pr.categoria AS Categoria, pr.nombre AS Producto, c.nombre AS Cliente, c.ciudad AS Ciudad, c.pais AS Pais, c.segmento AS Segmento,
  e.nombre AS Vendedor, p.estado AS Estado, d.cantidad AS Unidades,
  ROUND(d.cantidad * d.precio_unitario, 2) AS Ventas, ROUND(d.cantidad * pr.costo, 2) AS Costo
FROM detalle_pedidos d
JOIN pedidos p ON p.id = d.pedido_id
JOIN productos pr ON pr.id = d.producto_id
JOIN clientes c ON c.id = p.cliente_id
JOIN empleados e ON e.id = p.empleado_id
ORDER BY p.fecha, p.id`;

  const projectMeasures = [
    { name: 'Ventas Totales', expr: 'SUM(Ventas[Ventas])' },
    { name: 'Costo Total', expr: 'SUM(Ventas[Costo])' },
    { name: 'Pedidos', expr: 'DISTINCTCOUNT(Ventas[Pedido])' }
  ];

  C.projects = [
    {
      id: 'ventas',
      title: 'Cierre de ventas 2024',
      minutes: 60,
      level: 'Intermedio',
      summary: 'Dirección comercial pide el reporte de cierre del año: cómo se comportó cada mes, dónde hubo caídas y qué indicadores presentar.',
      context: 'Es enero. La directora comercial necesita para el lunes el cierre de 2024: ingreso por mes, el mejor y el peor mes, las caídas fuertes que hay que explicar, el ticket promedio y el margen. Los datos están en la base de pedidos. Vas a extraerlos con SQL, analizarlos con Python, construir las medidas en DAX y armar el panel en Power BI Desktop.',
      deliverable: 'Un resumen ejecutivo en texto y un panel con tarjetas de KPI, la tendencia mensual y el ingreso por categoría.',
      skills: ['GROUP BY por mes', 'JOIN pedidos y detalle', 'Recorrer y comparar en Python', 'CALCULATE con varios filtros', 'Panel en Power BI Desktop'],
      measures: projectMeasures,
      steps: [
        {
          kind: 'sql', title: 'Extraer el ingreso mensual',
          explain: 'Solo cuentan los pedidos entregados de 2024. El importe vive en el detalle, así que hay que unir pedidos con detalle_pedidos y contar pedidos distintos.',
          practice: {
            prompt: 'Obtén, para cada mes de 2024, el número de pedidos entregados y su ingreso. Columnas: mes (formato AAAA-MM), pedidos (pedidos distintos) e ingreso (suma de cantidad * precio_unitario, redondeada a 2 decimales). Ordena por mes.',
            starter: "SELECT strftime('%Y-%m', p.fecha) AS mes,\n       \nFROM pedidos p\nJOIN detalle_pedidos d ON d.pedido_id = p.id\nWHERE \nGROUP BY mes\nORDER BY mes;",
            solution: "SELECT strftime('%Y-%m', p.fecha) AS mes, COUNT(DISTINCT p.id) AS pedidos, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS ingreso FROM pedidos p JOIN detalle_pedidos d ON d.pedido_id = p.id WHERE p.estado = 'Entregado' AND p.fecha BETWEEN '2024-01-01' AND '2024-12-31' GROUP BY mes ORDER BY mes;",
            ordered: true,
            hints: ["Filtra con WHERE p.estado = 'Entregado' AND p.fecha BETWEEN '2024-01-01' AND '2024-12-31'.", 'COUNT(DISTINCT p.id) AS pedidos evita contar líneas de detalle como pedidos.', 'ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS ingreso.']
          }
        },
        {
          kind: 'python', title: 'Analizar el año con Python', feedsFrom: 0,
          explain: 'El resultado de tu consulta ya está cargado en el editor como CSV, exactamente como lo exportarías desde el sistema. Ahora toca convertir la tabla en conclusiones.',
          practice: {
            prompt: 'Con los datos del paso anterior imprime: "Ingreso 2024: X" (2 decimales); "Mejor mes: AAAA-MM (X)" y "Peor mes: AAAA-MM (X)" según el ingreso; la línea "Caídas mayores al 20%:" y, debajo, cada mes cuyo ingreso cayó más de 20% respecto al mes anterior como "  AAAA-MM: -X.X%" (dos espacios al inicio, un decimal).',
            starter: '# Resultado del paso 1, exportado como CSV\nCSV = """{{CSV}}"""\n\nfilas = []\nfor linea in CSV.splitlines()[1:]:\n    mes, pedidos, ingreso = linea.split(",")\n    filas.append((mes, int(pedidos), float(ingreso)))\n\n# 1) Ingreso total del año\n# 2) Mejor y peor mes según el ingreso\n# 3) Meses con caída mayor al 20% frente al mes anterior\n',
            solution: 'CSV = """{{CSV}}"""\n\nfilas = []\nfor linea in CSV.splitlines()[1:]:\n    mes, pedidos, ingreso = linea.split(",")\n    filas.append((mes, int(pedidos), float(ingreso)))\n\ntotal = sum(f[2] for f in filas)\nmejor = max(filas, key=lambda f: f[2])\npeor = min(filas, key=lambda f: f[2])\nprint(f"Ingreso 2024: {total:.2f}")\nprint(f"Mejor mes: {mejor[0]} ({mejor[2]:.2f})")\nprint(f"Peor mes: {peor[0]} ({peor[2]:.2f})")\nprint("Caídas mayores al 20%:")\nfor i in range(1, len(filas)):\n    anterior = filas[i - 1][2]\n    actual = filas[i][2]\n    cambio = (actual - anterior) / anterior\n    if cambio < -0.20:\n        print(f"  {filas[i][0]}: {cambio * 100:.1f}%")',
            hints: ['El total es sum(f[2] for f in filas).', 'max(filas, key=lambda f: f[2]) devuelve la tupla del mejor mes; su nombre es [0] y su ingreso [2].', 'Recorre desde i = 1 y compara filas[i][2] con filas[i - 1][2]: cambio = (actual - anterior) / anterior.']
          }
        },
        {
          kind: 'dax', title: 'Medida: ticket promedio',
          explain: 'Ahora los mismos datos están cargados como la tabla Ventas de un modelo de Power BI, una fila por línea de pedido, con las columnas Pedido, Fecha, Año, Mes, Categoria, Producto, Cliente, Ciudad, Pais, Segmento, Vendedor, Estado, Unidades, Ventas y Costo. Tienes disponibles las medidas [Ventas Totales], [Costo Total] y [Pedidos].',
          practice: {
            prompt: 'Escribe la expresión del ticket promedio de 2024: ventas divididas entre pedidos distintos, solo de pedidos entregados y del año 2024. Comprueba que coincide con ingreso total entre pedidos totales del paso 1.',
            starter: 'CALCULATE(\n    ,\n    Ventas[Estado] = "Entregado",\n    Ventas[Año] = 2024\n)',
            solution: 'CALCULATE(DIVIDE(SUM(Ventas[Ventas]), DISTINCTCOUNT(Ventas[Pedido])), Ventas[Estado] = "Entregado", Ventas[Año] = 2024)',
            hints: ['El primer argumento de CALCULATE es DIVIDE([Ventas Totales], [Pedidos]).', 'Los dos filtros ya están escritos en el código inicial.']
          }
        },
        {
          kind: 'dax', title: 'Medida: margen % del año',
          explain: 'El margen se calcula con las sumas, no promediando márgenes de cada línea. Usa el mismo contexto que en el paso anterior.',
          practice: {
            prompt: 'Escribe el margen porcentual de 2024 para pedidos entregados: (ventas - costo) / ventas.',
            starter: 'CALCULATE(\n    DIVIDE(),\n    Ventas[Estado] = "Entregado",\n    Ventas[Año] = 2024\n)',
            solution: 'CALCULATE(DIVIDE(SUM(Ventas[Ventas]) - SUM(Ventas[Costo]), SUM(Ventas[Ventas])), Ventas[Estado] = "Entregado", Ventas[Año] = 2024)',
            hints: ['Numerador: [Ventas Totales] - [Costo Total].', 'Denominador: [Ventas Totales].']
          }
        },
        {
          kind: 'desktop', title: 'Armar el panel en Power BI Desktop',
          explain: 'Descarga los datos y construye el panel con lo que ya probaste aquí. Abajo tienes una vista previa del resultado esperado. Este paso lo marcas tú al terminar.',
          download: { name: 'ventas_detalle.csv', source: 'dataset' },
          preview: 'monthly',
          checklist: [
            'Importar ventas_detalle.csv (Obtener datos > Texto/CSV) y revisar en Power Query que Fecha sea tipo fecha y Ventas y Costo sean decimales.',
            'Crear una tabla Calendario con CALENDAR, marcarla como tabla de fechas y relacionarla con Ventas[Fecha].',
            'Crear las medidas Ventas Totales, Pedidos, Ticket Promedio y Margen % que escribiste en los pasos 3 y 4.',
            'Agregar tarjetas para Ventas Totales, Ticket Promedio y Margen %, con un segmentador de Estado fijado en Entregado.',
            'Agregar un gráfico de líneas de Ventas Totales por mes del Calendario y un gráfico de barras por Categoria.',
            'Escribir un título que diga la conclusión, por ejemplo cuál fue el mejor mes y qué mes cayó.'
          ]
        }
      ]
    },
    {
      id: 'clientes',
      title: 'Clientes en riesgo de abandono',
      minutes: 60,
      level: 'Intermedio',
      summary: 'Marketing quiere saber qué clientes valiosos dejaron de comprar para llamarlos antes de perderlos.',
      context: 'El equipo de marketing tiene presupuesto para una campaña de retención, pero solo puede llamar a unos pocos clientes. Quiere una segmentación simple basada en cuándo compró cada cliente por última vez, cuántas veces y cuánto gastó (análisis RFM: recencia, frecuencia y monto). Vas a calcular esos datos con SQL, segmentar con Python, medir la base activa con DAX y dejar la segmentación en Power BI.',
      deliverable: 'Una lista priorizada de clientes en riesgo y un panel con el conteo de clientes por segmento.',
      skills: ['MAX y COUNT por cliente', 'Diferencias de fechas', 'Reglas con if/elif', 'DISTINCTCOUNT con filtros', 'Columna condicional en Power Query'],
      measures: projectMeasures,
      steps: [
        {
          kind: 'sql', title: 'Calcular recencia, frecuencia y monto',
          explain: 'Un renglón por cliente con su última compra, sus pedidos y su gasto, considerando solo pedidos entregados.',
          practice: {
            prompt: 'Para cada cliente con pedidos entregados obtén: cliente (nombre), ultima_compra (fecha más reciente), pedidos (pedidos distintos) y gasto (suma de cantidad * precio_unitario, redondeada a 2). Ordena por gasto de mayor a menor.',
            starter: 'SELECT c.nombre AS cliente,\n       \nFROM clientes c\nJOIN pedidos p ON p.cliente_id = c.id\nJOIN detalle_pedidos d ON d.pedido_id = p.id\n',
            solution: "SELECT c.nombre AS cliente, MAX(p.fecha) AS ultima_compra, COUNT(DISTINCT p.id) AS pedidos, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS gasto FROM clientes c JOIN pedidos p ON p.cliente_id = c.id JOIN detalle_pedidos d ON d.pedido_id = p.id WHERE p.estado = 'Entregado' GROUP BY c.id ORDER BY gasto DESC;",
            ordered: true,
            hints: ["Filtra WHERE p.estado = 'Entregado' antes de agrupar.", 'MAX(p.fecha) AS ultima_compra y COUNT(DISTINCT p.id) AS pedidos.', 'GROUP BY c.id y ORDER BY gasto DESC.']
          }
        },
        {
          kind: 'python', title: 'Segmentar clientes con reglas', feedsFrom: 0,
          explain: 'El resultado del paso 1 ya está en el editor. La función dias_entre ya está escrita y calcula los días desde la última compra hasta el 31 de diciembre de 2024.',
          practice: {
            prompt: 'Clasifica a cada cliente con estas reglas, en este orden: más de 180 días sin comprar es "Perdido"; más de 60 días es "En riesgo"; 10 pedidos o más es "Leal"; el resto es "Activo". Imprime el conteo de cada segmento en el orden Leal, Activo, En riesgo, Perdido ("Segmento: N"). Luego imprime "Clientes en riesgo:" y debajo cada cliente en riesgo, de mayor a menor gasto, como "  Nombre: gasto (N días)" con el gasto a 2 decimales.',
            starter: '# Resultado del paso 1, exportado como CSV\nCSV = """{{CSV}}"""\n\ndef ordinal(fecha):\n    a, m, d = [int(x) for x in fecha.split("-")]\n    dias_mes = [31, 29 if a % 4 == 0 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]\n    return (a - 1) * 365 + (a - 1) // 4 + sum(dias_mes[:m - 1]) + d\n\ndef dias_entre(fecha, corte="2024-12-31"):\n    return ordinal(corte) - ordinal(fecha)\n\nclientes = []\nfor linea in CSV.splitlines()[1:]:\n    cliente, ultima, pedidos, gasto = linea.split(",")\n    clientes.append({"cliente": cliente, "dias": dias_entre(ultima), "pedidos": int(pedidos), "gasto": float(gasto)})\n\ndef segmento(c):\n    # Aplica las reglas en orden\n    pass\n\n# Cuenta por segmento e imprime el reporte\n',
            solution: 'CSV = """{{CSV}}"""\n\ndef ordinal(fecha):\n    a, m, d = [int(x) for x in fecha.split("-")]\n    dias_mes = [31, 29 if a % 4 == 0 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]\n    return (a - 1) * 365 + (a - 1) // 4 + sum(dias_mes[:m - 1]) + d\n\ndef dias_entre(fecha, corte="2024-12-31"):\n    return ordinal(corte) - ordinal(fecha)\n\nclientes = []\nfor linea in CSV.splitlines()[1:]:\n    cliente, ultima, pedidos, gasto = linea.split(",")\n    clientes.append({"cliente": cliente, "dias": dias_entre(ultima), "pedidos": int(pedidos), "gasto": float(gasto)})\n\ndef segmento(c):\n    if c["dias"] > 180:\n        return "Perdido"\n    elif c["dias"] > 60:\n        return "En riesgo"\n    elif c["pedidos"] >= 10:\n        return "Leal"\n    return "Activo"\n\nconteo = {"Leal": 0, "Activo": 0, "En riesgo": 0, "Perdido": 0}\nfor c in clientes:\n    conteo[segmento(c)] += 1\nfor nombre, n in conteo.items():\n    print(f"{nombre}: {n}")\n\nprint("Clientes en riesgo:")\nfor c in sorted(clientes, key=lambda c: c["gasto"], reverse=True):\n    if segmento(c) == "En riesgo":\n        print(f"  {c[\'cliente\']}: {c[\'gasto\']:.2f} ({c[\'dias\']} días)")',
            hints: ['segmento(c) usa if c["dias"] > 180 / elif c["dias"] > 60 / elif c["pedidos"] >= 10 / return "Activo".', 'Inicializa conteo = {"Leal": 0, "Activo": 0, "En riesgo": 0, "Perdido": 0} para fijar el orden.', 'Ordena con sorted(clientes, key=lambda c: c["gasto"], reverse=True) y filtra los "En riesgo".']
          }
        },
        {
          kind: 'dax', title: 'Medida: base activa del segundo semestre',
          explain: 'Los mismos datos están como tabla Ventas, una fila por línea de pedido. Un cliente activo es quien tuvo al menos un pedido entregado en el periodo.',
          practice: {
            prompt: 'Escribe la expresión que cuenta los clientes distintos con pedidos entregados en el segundo semestre de 2024 (Mes de 7 a 12).',
            starter: 'CALCULATE(\n    DISTINCTCOUNT(),\n    \n)',
            solution: 'CALCULATE(DISTINCTCOUNT(Ventas[Cliente]), Ventas[Estado] = "Entregado", Ventas[Año] = 2024, Ventas[Mes] >= 7)',
            hints: ['Cuenta valores únicos de Ventas[Cliente].', 'Tres filtros: Estado, Año y Ventas[Mes] >= 7.']
          }
        },
        {
          kind: 'dax', title: 'Medida: gasto promedio por cliente',
          explain: 'El gasto promedio por cliente es una razón: ventas entre clientes distintos, en el mismo contexto.',
          practice: {
            prompt: 'Escribe el gasto promedio por cliente en 2024 para pedidos entregados: ventas totales divididas entre clientes distintos.',
            starter: 'CALCULATE(\n    DIVIDE(),\n    Ventas[Estado] = "Entregado",\n    Ventas[Año] = 2024\n)',
            solution: 'CALCULATE(DIVIDE(SUM(Ventas[Ventas]), DISTINCTCOUNT(Ventas[Cliente])), Ventas[Estado] = "Entregado", Ventas[Año] = 2024)',
            hints: ['Numerador: [Ventas Totales].', 'Denominador: DISTINCTCOUNT(Ventas[Cliente]).']
          }
        },
        {
          kind: 'desktop', title: 'Llevar la segmentación a Power BI',
          explain: 'En Power BI la segmentación no se hace con Python sino con una columna condicional en Power Query, con las mismas reglas. Descarga el resumen de clientes del paso 1 y repite la lógica allí. Este paso lo marcas tú al terminar.',
          download: { name: 'clientes_resumen.csv', source: 'step0' },
          preview: 'segments',
          checklist: [
            'Importar clientes_resumen.csv y confirmar en Power Query que ultima_compra es fecha y gasto es decimal.',
            'Agregar una columna personalizada DiasSinComprar = Duration.Days(#date(2024, 12, 31) - [ultima_compra]).',
            'Agregar una columna condicional Segmento con las reglas del paso 2, en el mismo orden.',
            'Crear la medida Clientes = COUNTROWS(clientes_resumen) y un gráfico de barras de Clientes por Segmento.',
            'Agregar una tabla con los clientes En riesgo ordenada por gasto, con formato condicional en DiasSinComprar.',
            'Comparar los conteos con los del paso 2: deben coincidir.'
          ]
        }
      ]
    }
  ];

  /* ============================================================ INSIGNIAS NUEVAS */
  const examPassed = (s, t) => !!(s.exams && s.exams[t] && s.exams[t].passed);
  const projDone = (s, id) => !!(s.projects && s.projects[id] && s.projects[id].done);
  C.badges.push(
    { id: 'review25', name: 'Memoria de acero', desc: '25 respuestas correctas en el repaso espaciado.', test: s => (s.reviewCorrect || 0) >= 25 },
    { id: 'exam-python', name: 'Examen de Python', desc: 'Aprobaste el examen final de Python.', test: s => examPassed(s, 'python') },
    { id: 'exam-sql', name: 'Examen de SQL', desc: 'Aprobaste el examen final de SQL.', test: s => examPassed(s, 'sql') },
    { id: 'exam-powerbi', name: 'Examen de Power BI', desc: 'Aprobaste el examen final de Power BI.', test: s => examPassed(s, 'powerbi') },
    { id: 'project-1', name: 'Primer proyecto', desc: 'Completaste un proyecto integrador.', test: s => C.projects.some(p => projDone(s, p.id)) },
    { id: 'project-all', name: 'Analista completo', desc: 'Completaste todos los proyectos integradores.', test: s => C.projects.every(p => projDone(s, p.id)) }
  );

  /* ============================================================ PLAN */
  C.plan.push({ week: 10, title: 'Demostrar lo aprendido', lessons: ['proyecto-ventas', 'examen-sql', 'examen-python', 'proyecto-clientes', 'examen-powerbi'] });
})();
