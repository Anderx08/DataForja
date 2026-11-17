/* DataForja — etapa 1: pandas y matplotlib ejecutables, Power Query, modelo y tiempo en DAX,
   y la guía para llevar todo a Power BI Desktop. Se carga después de content-guides.js. */
(function () {
  const C = window.CONTENT;
  const T = Object.fromEntries(C.tracks.map(t => [t.id, t]));
  const find = id => C.tracks.flatMap(t => t.lessons).find(l => l.id === id);
  const PD = 'import pandas as pd\nventas = pd.read_csv("ventas.csv")\n';

  /* ============================================================ PANDAS (Python completo) */
  const py11 = {
    id: 'py-11', lang: 'pandas', title: 'pandas: leer, explorar y filtrar tablas', minutes: 25, level: 'Intermedio',
    why: 'En el trabajo los datos llegan en archivos de miles de filas. pandas los carga como una tabla y te deja filtrar, calcular y resumir con una línea, sin bucles. Aquí corre Python completo: el mismo código funciona igual en tu computadora.',
    concept: [
      { h: 'Leer un archivo y mirarlo', p: 'pd.read_csv carga el archivo en un DataFrame, que es una tabla en memoria. shape dice cuántas filas y columnas tiene; head muestra las primeras filas. Es lo primero que se hace siempre.', code: PD + 'print(ventas.shape)\nprint(ventas.head(3))', lang: 'pandas' },
      { h: 'Elegir columnas', p: 'Una columna se pide con su nombre entre corchetes y comillas. Varias, con una lista dentro de los corchetes: por eso van dos pares.', code: PD + 'print(ventas[["Fecha", "Producto", "Ventas"]].head())', lang: 'pandas' },
      { h: 'Filtrar filas', p: 'La condición va entre corchetes y se aplica a toda la columna a la vez. Para combinar condiciones usa & (y) o | (o), y pon cada condición entre paréntesis.', code: PD + 'entregados = ventas[ventas["Estado"] == "Entregado"]\ngrandes = ventas[(ventas["Ventas"] > 5000) & (ventas["Año"] == 2024)]\nprint(len(entregados), len(grandes))', lang: 'pandas' },
      { h: 'Columnas nuevas y ordenar', p: 'Una columna nueva se crea asignándole un cálculo con otras columnas. sort_values ordena; ascending=False va de mayor a menor.', code: PD + 'ventas["Margen"] = ventas["Ventas"] - ventas["Costo"]\nprint(ventas.sort_values("Margen", ascending=False)[["Producto", "Margen"]].head(5))', lang: 'pandas' },
      { h: 'Resúmenes rápidos', p: 'sum, mean, nunique y value_counts responden en una línea las preguntas típicas: cuánto suma, cuál es el promedio, cuántos distintos hay, cuántos de cada uno.', code: PD + 'print(ventas["Ventas"].sum())\nprint(ventas["Cliente"].nunique())\nprint(ventas["Estado"].value_counts())', lang: 'pandas' }
    ],
    example: {
      title: 'Cuánto dinero se perdió en devoluciones',
      text: 'Atención a clientes pide el total devuelto en 2024 y los tres productos con más devoluciones. Con pandas son seis líneas.',
      code: PD + 'devueltos = ventas[(ventas["Estado"] == "Devuelto") & (ventas["Año"] == 2024)]\nprint("Líneas devueltas:", len(devueltos))\nprint("Monto devuelto:", round(devueltos["Ventas"].sum(), 2))\nprint(devueltos["Producto"].value_counts().head(3))'
    },
    practice: {
      prompt: 'Filtra las líneas de pedidos con Estado "Entregado", del Año 2024 y de la Categoria "Hogar". Imprime en una línea cuántas filas son y en la siguiente la suma de Ventas redondeada a 2 decimales.',
      starter: PD + '\n# Filtra con tres condiciones unidas por &\n\n# Imprime el número de filas y la suma de Ventas\n',
      solution: PD + 'filtro = ventas[(ventas["Estado"] == "Entregado") & (ventas["Año"] == 2024) & (ventas["Categoria"] == "Hogar")]\nprint(len(filtro))\nprint(round(filtro["Ventas"].sum(), 2))',
      hints: ['Cada condición va entre paréntesis: (ventas["Estado"] == "Entregado").', 'Únelas con &: (cond1) & (cond2) & (cond3).', 'len(filtro) da las filas; filtro["Ventas"].sum() la suma.']
    },
    extra: [
      { level: 'Básico', prompt: '¿Cuántos clientes distintos compraron en 2024? Imprime solo el número.', starter: PD + '\n', solution: PD + 'print(ventas[ventas["Año"] == 2024]["Cliente"].nunique())', hints: ['Filtra primero el año.', 'nunique() cuenta valores distintos de una columna.'] },
      { level: 'Intermedio', prompt: 'Crea la columna Margen (Ventas - Costo) e imprime las 3 líneas con mayor margen, mostrando solo las columnas Producto, Cliente y Margen.', starter: PD + '\n', solution: PD + 'ventas["Margen"] = ventas["Ventas"] - ventas["Costo"]\nprint(ventas.sort_values("Margen", ascending=False)[["Producto", "Cliente", "Margen"]].head(3))', hints: ['ventas["Margen"] = ventas["Ventas"] - ventas["Costo"]', 'sort_values("Margen", ascending=False) y luego [["Producto", "Cliente", "Margen"]].head(3).'] },
      { level: 'Reto', prompt: 'Cuenta cuántas líneas hay de cada Estado en 2023 e imprime el resultado de value_counts(). Después imprime el porcentaje de líneas canceladas de ese año con un decimal, como "Canceladas: 9.4%".', starter: PD + '\n', solution: PD + 'a2023 = ventas[ventas["Año"] == 2023]\nconteo = a2023["Estado"].value_counts()\nprint(conteo)\nprint(f"Canceladas: {conteo[\'Cancelado\'] / len(a2023) * 100:.1f}%")', hints: ['Guarda el filtro del año en una variable.', 'conteo["Cancelado"] da el número de canceladas.', 'Divide entre len(a2023) y multiplica por 100.'] }
    ],
    quiz: [
      { q: '¿Por qué ventas[ventas["Ventas"] > 5000 & ventas["Año"] == 2024] da error o un resultado raro?', options: ['Porque & no existe en pandas', 'Porque faltan paréntesis alrededor de cada condición', 'Porque hay que usar "and"', 'Porque 5000 debe ir entre comillas'], answer: 1, explain: 'En pandas & se evalúa antes que > y ==. Cada condición debe ir entre paréntesis: (ventas["Ventas"] > 5000) & (ventas["Año"] == 2024).' },
      { q: '¿Qué devuelve ventas["Estado"].value_counts()?', options: ['El número de columnas', 'Cuántas filas hay de cada valor de Estado, de mayor a menor', 'Los estados sin repetir, en orden alfabético', 'La suma de Estado'], answer: 1, explain: 'value_counts cuenta las apariciones de cada valor y las ordena de más a menos frecuente.' }
    ]
  };
  const py14 = {
    id: 'py-14', lang: 'pandas', title: 'pandas: agrupar, unir y tablas dinámicas', minutes: 25, level: 'Intermedio',
    why: 'Los reportes casi siempre piden "por algo": ventas por categoría, pedidos por país. Y los datos suelen estar repartidos en varios archivos. groupby, merge y pivot_table son el GROUP BY, el JOIN y la tabla dinámica de pandas.',
    concept: [
      { h: 'groupby: resumir por grupo', p: 'Agrupa por una columna, elige la columna a resumir y la operación. Es el mismo patrón del diccionario de la lección 5 y del GROUP BY de SQL.', code: PD + 'print(ventas.groupby("Categoria")["Ventas"].sum())', lang: 'pandas' },
      { h: 'Varias métricas a la vez', p: 'agg recibe pares nombre = (columna, operación). reset_index convierte el grupo en una columna normal.', code: PD + 'resumen = ventas.groupby("Vendedor").agg(\n    total=("Ventas", "sum"),\n    lineas=("Ventas", "count"),\n    ticket=("Ventas", "mean"),\n).round(2).sort_values("total", ascending=False)\nprint(resumen)', lang: 'pandas' },
      { h: 'merge: unir dos tablas', p: 'Une por una columna en común, como un JOIN. left_on y right_on sirven cuando la columna se llama distinto en cada tabla. how="left" conserva todas las filas de la izquierda.', code: 'import pandas as pd\npedidos = pd.read_csv("pedidos.csv")\nclientes = pd.read_csv("clientes.csv")\nunido = pedidos.merge(clientes, left_on="cliente_id", right_on="id", how="left")\nprint(unido[["fecha", "estado", "nombre", "pais"]].head())', lang: 'pandas' },
      { h: 'pivot_table: la tabla dinámica', p: 'index son las filas, columns las columnas, values lo que se resume y aggfunc la operación. Es la tabla dinámica de Excel en una línea.', code: PD + 'tabla = pd.pivot_table(ventas, index="Categoria", columns="Año", values="Ventas", aggfunc="sum")\nprint(tabla.round(0))', lang: 'pandas' }
    ],
    example: {
      title: 'Crecimiento por categoría de un año a otro',
      text: 'Con una tabla dinámica por año y una resta entre columnas obtienes el crecimiento de cada categoría.',
      code: PD + 'entregadas = ventas[ventas["Estado"] == "Entregado"]\ntabla = pd.pivot_table(entregadas, index="Categoria", columns="Año", values="Ventas", aggfunc="sum")\ntabla["Crecimiento %"] = ((tabla[2024] - tabla[2023]) / tabla[2023] * 100).round(1)\nprint(tabla.round(0))'
    },
    practice: {
      prompt: 'Calcula las ventas totales por Categoria considerando solo líneas con Estado "Entregado". Ordena de mayor a menor, redondea a 2 decimales e imprime el resultado.',
      starter: PD + '\n',
      solution: PD + 'entregadas = ventas[ventas["Estado"] == "Entregado"]\nprint(entregadas.groupby("Categoria")["Ventas"].sum().round(2).sort_values(ascending=False))',
      hints: ['Filtra primero el estado.', 'groupby("Categoria")["Ventas"].sum()', 'Encadena .round(2).sort_values(ascending=False).']
    },
    extra: [
      { level: 'Intermedio', prompt: 'Une pedidos.csv con clientes.csv (cliente_id con id) y cuenta cuántos pedidos hay por país. Imprime el resultado de value_counts sobre la columna pais.', starter: 'import pandas as pd\npedidos = pd.read_csv("pedidos.csv")\nclientes = pd.read_csv("clientes.csv")\n\n', solution: 'import pandas as pd\npedidos = pd.read_csv("pedidos.csv")\nclientes = pd.read_csv("clientes.csv")\nunido = pedidos.merge(clientes, left_on="cliente_id", right_on="id")\nprint(unido["pais"].value_counts())', hints: ['pedidos.merge(clientes, left_on="cliente_id", right_on="id")', 'unido["pais"].value_counts()'] },
      { level: 'Intermedio', prompt: 'Imprime una tabla dinámica con la suma de Ventas: el país del cliente (columna Pais) en las filas y el Año en las columnas, redondeada a 0 decimales.', starter: PD + '\n', solution: PD + 'print(pd.pivot_table(ventas, index="Pais", columns="Año", values="Ventas", aggfunc="sum").round(0))', hints: ['pd.pivot_table(ventas, index="Pais", columns="Año", values="Ventas", aggfunc="sum")', 'Termina con .round(0).'] },
      { level: 'Reto', prompt: 'Por Vendedor, calcula total de Ventas, número de pedidos distintos (columna Pedido) y ticket promedio (total / pedidos), solo para Entregado. Ordena por total de mayor a menor, redondea a 2 e imprime.', starter: PD + '\n', solution: PD + 'e = ventas[ventas["Estado"] == "Entregado"]\nr = e.groupby("Vendedor").agg(total=("Ventas", "sum"), pedidos=("Pedido", "nunique"))\nr["ticket"] = r["total"] / r["pedidos"]\nprint(r.round(2).sort_values("total", ascending=False))', hints: ['agg(total=("Ventas", "sum"), pedidos=("Pedido", "nunique"))', 'La columna ticket se calcula después: r["total"] / r["pedidos"].'] }
    ],
    quiz: [{ q: 'pedidos.merge(clientes, left_on="cliente_id", right_on="id", how="left"): ¿qué pasa con un pedido cuyo cliente no existe en clientes?', options: ['Se elimina', 'Se conserva con las columnas de clientes vacías (NaN)', 'Da error', 'Se duplica'], answer: 1, explain: 'how="left" es el LEFT JOIN de pandas: conserva todas las filas de la tabla izquierda y rellena con NaN lo que no encuentra.' }]
  };
  const PLT = 'import pandas as pd\nimport matplotlib.pyplot as plt\nventas = pd.read_csv("ventas.csv")\n';
  const VERIFY_BAR = 'import matplotlib.pyplot as plt\n_ax = plt.gca()\nprint(len(_ax.patches), _ax.get_title())\nprint([round(p.get_height()) for p in _ax.patches])';
  const py15 = {
    id: 'py-15', lang: 'pandas', title: 'Gráficos con matplotlib', minutes: 20, level: 'Intermedio',
    why: 'Una tabla dice los números; un gráfico dice la historia. Con matplotlib generas el gráfico desde el mismo script que limpia los datos, y lo guardas como imagen para un correo o una presentación.',
    concept: [
      { h: 'Barras: comparar categorías', p: 'plt.bar recibe las etiquetas y los valores. title, xlabel e ylabel ponen los textos. Aquí el gráfico aparece debajo de la salida; en tu computadora usarías plt.show() o plt.savefig("archivo.png").', code: PLT + 'por_cat = ventas.groupby("Categoria")["Ventas"].sum()\nplt.bar(por_cat.index, por_cat.values)\nplt.title("Ventas por categoría")\nplt.ylabel("Ventas")', lang: 'pandas' },
      { h: 'Líneas: evolución en el tiempo', p: 'plt.plot une los puntos en orden. Ideal para meses. marker="o" marca cada punto.', code: PLT + 'm = ventas[ventas["Año"] == 2024].groupby("Mes")["Ventas"].sum()\nplt.plot(m.index, m.values, marker="o")\nplt.title("Ventas por mes 2024")\nplt.xlabel("Mes")', lang: 'pandas' },
      { h: 'Atajo de pandas: .plot()', p: 'Una serie o tabla de pandas se puede graficar directamente con .plot(kind="bar"), kind="line" o kind="barh".', code: PLT + 'ventas.groupby("Vendedor")["Ventas"].sum().sort_values().plot(kind="barh", title="Ventas por vendedor")', lang: 'pandas' },
      { h: 'Guardar la imagen', p: 'En tu computadora, plt.savefig("ventas.png", dpi=150, bbox_inches="tight") guarda el gráfico para adjuntarlo. Llámalo antes de plt.show().', code: 'plt.savefig("ventas_por_categoria.png", dpi=150, bbox_inches="tight")', lang: 'pandas', readonly: true }
    ],
    example: {
      title: 'Comparar 2023 contra 2024 mes a mes',
      text: 'Dos líneas en el mismo gráfico, una por año, con leyenda. Es el gráfico que más se pide en una reunión de resultados.',
      code: PLT + 'for anio in [2023, 2024]:\n    m = ventas[ventas["Año"] == anio].groupby("Mes")["Ventas"].sum()\n    plt.plot(m.index, m.values, marker="o", label=str(anio))\nplt.title("Ventas por mes")\nplt.legend()\nprint("Gráfico listo")'
    },
    practice: {
      prompt: 'Haz un gráfico de barras verticales (plt.bar) con la suma de Ventas por Categoria, solo para Estado "Entregado", con el título exacto "Ventas por categoría". Deja las categorías en el orden que da groupby (alfabético). No hace falta imprimir nada.',
      starter: PLT + '\n',
      solution: PLT + 'e = ventas[ventas["Estado"] == "Entregado"]\npor_cat = e.groupby("Categoria")["Ventas"].sum()\nplt.bar(por_cat.index, por_cat.values)\nplt.title("Ventas por categoría")',
      verifyPy: VERIFY_BAR,
      verifyHint: 'El gráfico no coincide. Revisa que sean barras verticales con plt.bar, que filtres Entregado y que el título sea exactamente "Ventas por categoría".',
      hints: ['Filtra Estado == "Entregado" y agrupa por Categoria.', 'plt.bar(por_cat.index, por_cat.values)', 'plt.title("Ventas por categoría")']
    },
    extra: [
      { level: 'Intermedio', prompt: 'Haz un gráfico de líneas (plt.plot) con la suma de Ventas por Mes del Año 2024 (todos los estados), con título exacto "Ventas 2024".', starter: PLT + '\n', solution: PLT + 'm = ventas[ventas["Año"] == 2024].groupby("Mes")["Ventas"].sum()\nplt.plot(m.index, m.values)\nplt.title("Ventas 2024")', verifyPy: 'import matplotlib.pyplot as plt\n_ax = plt.gca()\n_l = _ax.get_lines()\nprint(len(_l), _ax.get_title())\nprint([round(y) for y in _l[0].get_ydata()] if _l else [])', verifyHint: 'El gráfico no coincide. Debe ser una sola línea con los 12 meses de 2024 y el título "Ventas 2024".', hints: ['Filtra Año == 2024 y agrupa por Mes.', 'plt.plot(m.index, m.values)'] },
      { level: 'Reto', prompt: 'Haz un gráfico de barras con las unidades vendidas (suma de Unidades) de los 5 productos más vendidos, de mayor a menor, con título exacto "Top 5 productos". Imprime también la serie de los 5 productos.', starter: PLT + '\n', solution: PLT + 'top = ventas.groupby("Producto")["Unidades"].sum().sort_values(ascending=False).head(5)\nprint(top)\nplt.bar(top.index, top.values)\nplt.title("Top 5 productos")', verifyPy: VERIFY_BAR, verifyHint: 'Revisa que sean 5 barras con las unidades de los productos más vendidos, de mayor a menor, y el título exacto.', hints: ['groupby("Producto")["Unidades"].sum().sort_values(ascending=False).head(5)', 'plt.bar(top.index, top.values)'] }
    ],
    quiz: [{ q: 'Quieres comparar las ventas de 4 categorías. ¿Qué gráfico eliges?', options: ['Líneas', 'Barras', 'Dispersión', 'Pastel de 20 porciones'], answer: 1, explain: 'Las barras comparan magnitudes entre categorías. Las líneas son para evolución en el tiempo.' }]
  };
  const pyLessons = T.python.lessons;
  const i11 = pyLessons.findIndex(l => l.id === 'py-11');
  pyLessons.splice(i11, 1, py11, py14, py15);
  // guía de py-11 con demostración ejecutable
  py11.guide = [{ name: 'DataFrame: la tabla de pandas', syntax: 'import pandas as pd\ndf = pd.read_csv("archivo.csv")\ndf["columna"]                      # una columna\ndf[["col1", "col2"]]               # varias\ndf[df["col"] > 100]                # filtrar\ndf["nueva"] = df["a"] * df["b"]    # columna nueva\ndf.sort_values("col", ascending=False)',
    parts: [['pd.read_csv', 'Lee el archivo y devuelve un DataFrame. También existe pd.read_excel para .xlsx.'], ['df["columna"]', 'Selecciona una columna entera. Las operaciones se aplican a todas las filas a la vez, sin bucles.'], ['df[condición]', 'Filtra filas: es el WHERE de pandas. Combina condiciones con & y |, cada una entre paréntesis.'], ['sort_values', 'Ordena por una columna. ascending=False va de mayor a menor.']],
    when: 'Cuando los datos pasan de cientos a miles de filas o vienen de Excel y vuelven a Excel.',
    read: 'Lee ventas.csv y quédate con las líneas entregadas.',
    demo: { kind: 'pandas', before: PD + 'print(ventas[["Estado", "Producto", "Ventas"]].head(6))', after: PD + 'e = ventas[ventas["Estado"] == "Entregado"]\nprint(e[["Estado", "Producto", "Ventas"]].head(6))\nprint("Filas:", len(ventas), "->", len(e))', note: 'El filtro quita las líneas que no están entregadas. Las columnas no cambian; solo desaparecen filas, igual que con WHERE.' } }];
  py14.guide = [{ name: 'groupby y merge', syntax: 'df.groupby("columna")["valor"].sum()\ndf.groupby("col").agg(nombre=("valor", "sum"))\nizq.merge(der, left_on="id_a", right_on="id_b", how="left")\npd.pivot_table(df, index="filas", columns="cols", values="valor", aggfunc="sum")',
    parts: [['groupby("col")', 'Reparte las filas en grupos, uno por cada valor distinto.'], ['["valor"].sum()', 'Qué columna resumir y cómo: sum, mean, count, nunique, max, min.'], ['merge', 'Une tablas por columnas en común. how="inner" solo coincidencias, how="left" conserva la izquierda.'], ['pivot_table', 'Resume en formato de tabla dinámica, con filas y columnas.']],
    when: 'Cuando la pregunta dice "por" o cuando los datos están repartidos en varios archivos.',
    read: 'Suma las ventas por categoría.',
    demo: { kind: 'pandas', before: PD + 'print(ventas[["Categoria", "Ventas"]].head(6))', after: PD + 'print(ventas.groupby("Categoria")["Ventas"].sum())', note: 'Cientos de filas se resumen en una por categoría.' } }];
  py15.guide = [{ name: 'matplotlib: un gráfico en tres líneas', syntax: 'import matplotlib.pyplot as plt\nplt.bar(etiquetas, valores)     # o plt.plot(x, y)\nplt.title("Título")\nplt.xlabel("Eje X"); plt.ylabel("Eje Y")\nplt.savefig("grafico.png")',
    parts: [['plt.bar / plt.barh', 'Barras verticales u horizontales: comparar categorías.'], ['plt.plot', 'Línea: evolución en el tiempo.'], ['title, xlabel, ylabel', 'Los textos del gráfico. Un buen título dice la conclusión.'], ['savefig', 'Guarda el gráfico como imagen.']],
    when: 'Para presentar resultados o explorar datos rápidamente.',
    read: 'Dibuja barras con las ventas de cada categoría.',
    demo: { kind: 'pandas', after: PLT + 'por_cat = ventas.groupby("Categoria")["Ventas"].sum()\nplt.bar(por_cat.index, por_cat.values)\nplt.title("Ventas por categoría")\nprint(por_cat.round(0))', note: 'La serie de pandas se convierte en barras: el índice son las etiquetas y los valores la altura.' } }];

  /* ============================================================ POWER QUERY (simulador) */
  const pq1 = {
    type: 'pq',
    prompt: 'Limpia esta lista de clientes como lo harías en Power Query: la primera fila tiene los encabezados, hay filas vacías, nombres y ciudades con espacios y mayúsculas desordenadas, y Monto llega como texto. Deja la tabla igual a la objetivo.',
    source: { cols: ['Column1', 'Column2', 'Column3'], rows: [['Cliente', 'Ciudad', 'Monto'], ['  ana PÉREZ ', 'monterrey', '1200'], ['', '', ''], ['LUIS gómez', 'Guadalajara ', '850.5'], ['marta ruiz', ' monterrey', '300'], ['', '', '']] },
    target: { cols: ['Cliente', 'Ciudad', 'Monto'], rows: [['Ana Pérez', 'Monterrey', 1200], ['Luis Gómez', 'Guadalajara', 850.5], ['Marta Ruiz', 'Monterrey', 300]] },
    solutionSteps: [{ op: 'promote', a: {} }, { op: 'removeEmpty', a: {} }, { op: 'trim', a: { col: 'Cliente' } }, { op: 'proper', a: { col: 'Cliente' } }, { op: 'trim', a: { col: 'Ciudad' } }, { op: 'proper', a: { col: 'Ciudad' } }, { op: 'type', a: { col: 'Monto', to: 'Número decimal' } }],
    hints: ['Empieza con "Usar la primera fila como encabezado".', 'Luego "Quitar filas en blanco".', 'En Cliente y Ciudad: primero "Recortar espacios" y después "Poner en mayúsculas cada palabra".', 'Termina cambiando el tipo de Monto a Número decimal.']
  };
  const pq2 = {
    type: 'pq', level: 'Intermedio',
    prompt: 'Este reporte tiene una columna por mes. Conviértelo al formato largo que necesita Power BI: columnas Producto, Mes y Ventas, con Ventas como número.',
    source: { cols: ['Producto', 'Ene', 'Feb', 'Mar'], rows: [['Mouse', '120', '140', '90'], ['Teclado', '80', '95', '110']] },
    target: { cols: ['Producto', 'Mes', 'Ventas'], rows: [['Mouse', 'Ene', 120], ['Mouse', 'Feb', 140], ['Mouse', 'Mar', 90], ['Teclado', 'Ene', 80], ['Teclado', 'Feb', 95], ['Teclado', 'Mar', 110]] },
    solutionSteps: [{ op: 'unpivot', a: { keep: ['Producto'] } }, { op: 'rename', a: { col: 'Atributo', name: 'Mes' } }, { op: 'rename', a: { col: 'Valor', name: 'Ventas' } }, { op: 'type', a: { col: 'Ventas', to: 'Número decimal' } }],
    hints: ['"Anular dinamización de otras columnas" con Producto como columna fija.', 'Cambia el nombre de Atributo a Mes y de Valor a Ventas.', 'Cambia el tipo de Ventas a número.']
  };
  const pq3 = {
    type: 'pq', level: 'Reto',
    prompt: 'Un vendedor manda sus ventas a mano: montos con símbolo de pesos y comas, un monto "N/D", una fila repetida y fechas en formato día/mes/año. Deja la tabla igual a la objetivo: fechas como fecha, montos como número, sin errores ni duplicados.',
    source: { cols: ['Fecha', 'Vendedor', 'Monto'], rows: [['15/03/2024', 'Ana', '$1,200.50'], ['16/03/2024', 'Luis', '$850.00'], ['16/03/2024', 'Ana', 'N/D'], ['17/03/2024', 'Sara', '$2,300.00'], ['17/03/2024', 'Sara', '$2,300.00']] },
    target: { cols: ['Fecha', 'Vendedor', 'Monto'], rows: [['2024-03-15', 'Ana', 1200.5], ['2024-03-16', 'Luis', 850], ['2024-03-17', 'Sara', 2300]] },
    solutionSteps: [{ op: 'replace', a: { col: 'Monto', find: '$', repl: '' } }, { op: 'replace', a: { col: 'Monto', find: ',', repl: '' } }, { op: 'type', a: { col: 'Monto', to: 'Número decimal' } }, { op: 'removeErrors', a: { col: 'Monto' } }, { op: 'dedupe', a: {} }, { op: 'type', a: { col: 'Fecha', to: 'Fecha' } }],
    hints: ['Antes de cambiar el tipo, reemplaza "$" y "," por nada en Monto.', 'Al cambiar Monto a número, "N/D" se convierte en Error: quítalo con "Quitar errores".', 'Quita duplicados y cambia Fecha a tipo Fecha.']
  };
  const pbi2 = find('pbi-2');
  pbi2.reading = false;
  pbi2.practice = pq1;
  pbi2.extra = [pq2, pq3];
  C.pqDatasets = [
    { name: 'Clientes con espacios y filas vacías', source: pq1.source },
    { name: 'Ventas por mes en columnas', source: pq2.source },
    { name: 'Ventas capturadas a mano', source: pq3.source },
    { name: 'Inventario con encabezados de dos filas', source: { cols: ['Column1', 'Column2', 'Column3', 'Column4'], rows: [['Reporte de inventario', '', '', ''], ['Almacén', 'Producto', 'Existencia', 'Costo'], ['Norte', 'Mouse', '15', '140'], ['', 'Teclado', '8', '520'], ['Sur', 'Mouse', '22', '140'], ['', 'Monitor', '3', '3100']] } }
  ];

  /* ============================================================ MODELO, TIEMPO Y VARIABLES EN DAX */
  const pbi3 = find('pbi-3');
  pbi3.reading = false;
  pbi3.concept.push({ h: 'El modelo de este laboratorio', p: 'El laboratorio ya tiene un modelo en estrella: la tabla de hechos Ventas y las dimensiones Calendario, Productos, Regiones y Vendedores. Una columna de una dimensión, como Productos[Categoria], filtra a Ventas. COUNTROWS(Productos) cuenta productos, no ventas. Y dentro de un iterador sobre Ventas, RELATED trae una columna de la dimensión.', code: 'Ventas Hogar = CALCULATE([Ventas Totales], Productos[Categoria] = "Hogar")\nProductos en catálogo = COUNTROWS(Productos)\nVentas a precio de lista = SUMX(Ventas, Ventas[Unidades] * RELATED(Productos[Precio]))', lang: 'dax' });
  pbi3.practice = { prompt: 'Usando la columna de la dimensión Productos (no la de Ventas), escribe las ventas de la categoría Hogar.', starter: 'CALCULATE([Ventas Totales], )', solution: 'CALCULATE(SUM(Ventas[Ventas]), Productos[Categoria] = "Hogar")', hints: ['La columna es Productos[Categoria].', 'CALCULATE([Ventas Totales], Productos[Categoria] = "Hogar")'] };
  pbi3.extra = [
    { level: 'Básico', prompt: '¿Cuántos productos tiene el catálogo? Cuenta las filas de la dimensión Productos.', starter: '', solution: 'COUNTROWS(Productos)', hints: ['COUNTROWS cuenta filas de una tabla.', 'COUNTROWS(Productos)'] },
    { level: 'Intermedio', prompt: 'Calcula las ventas a precio de lista: recorre Ventas y multiplica Unidades por el Precio que trae RELATED desde Productos.', starter: 'SUMX(Ventas, )', solution: 'SUMX(Ventas, Ventas[Unidades] * RELATED(Productos[Precio]))', hints: ['RELATED(Productos[Precio]) trae el precio de la fila relacionada.', 'SUMX(Ventas, Ventas[Unidades] * RELATED(Productos[Precio]))'] },
    { level: 'Reto', prompt: 'Calcula el promedio de ventas por producto del catálogo: recorre la dimensión Productos y promedia la medida [Ventas Totales].', starter: 'AVERAGEX(', solution: 'AVERAGEX(Productos, [Ventas Totales])', hints: ['AVERAGEX recorre una tabla y promedia una expresión.', 'Al usar una medida dentro del iterador, cada producto filtra sus ventas (transición de contexto).'] }
  ];
  pbi3.quiz.push({ q: 'En el modelo, eliges Región = Norte en un segmentador. ¿Cambia COUNTROWS(Productos)?', options: ['Sí, cuenta solo productos vendidos en el Norte', 'No: el filtro va de las dimensiones hacia Ventas, no de Ventas hacia Productos', 'Da error', 'Devuelve BLANK'], answer: 1, explain: 'Con relaciones de una dirección, Regiones filtra a Ventas pero Ventas no filtra a Productos. Por eso el catálogo sigue completo.' });

  const pbi9 = find('pbi-9');
  pbi9.reading = false;
  pbi9.concept.forEach(c => { if (c.lang === 'dax') c.readonly = false; });
  pbi9.concept.splice(1, 0, { h: 'Cómo funcionan en este laboratorio', p: 'El modelo incluye la tabla Calendario, continua y relacionada con Ventas. Las funciones de tiempo miran qué fechas están en el contexto (por ejemplo, junio de 2024 en un visual) y las convierten en otro conjunto de fechas: desde enero (DATESYTD), un año antes (SAMEPERIODLASTYEAR) o un mes antes (DATEADD). Por eso cada ejercicio indica con qué filtros se evalúa.', code: '', lang: 'text' });
  pbi9.practice = { context: { 'Año': 2024, Mes: 6 }, prompt: 'Escribe las ventas acumuladas del año (YTD). Se evalúa como en un visual filtrado en junio de 2024, así que debe sumar de enero a junio.', starter: 'CALCULATE([Ventas Totales], )', solution: 'CALCULATE(SUM(Ventas[Ventas]), DATESYTD(Calendario[Date]))', hints: ['DATESYTD(Calendario[Date]) devuelve las fechas desde el 1 de enero.', 'CALCULATE([Ventas Totales], DATESYTD(Calendario[Date]))'] };
  pbi9.extra = [
    { level: 'Básico', context: { 'Año': 2024 }, prompt: 'Escribe las ventas del mismo periodo del año anterior. Con el filtro en 2024 debe devolver las ventas de 2023.', starter: 'CALCULATE([Ventas Totales], )', solution: 'CALCULATE(SUM(Ventas[Ventas]), SAMEPERIODLASTYEAR(Calendario[Date]))', hints: ['SAMEPERIODLASTYEAR(Calendario[Date])'] },
    { level: 'Intermedio', context: { 'Año': 2024, Mes: 6 }, prompt: 'Escribe las ventas del mes anterior con DATEADD. Con el filtro en junio de 2024 debe devolver mayo de 2024.', starter: 'CALCULATE([Ventas Totales], DATEADD())', solution: 'CALCULATE(SUM(Ventas[Ventas]), DATEADD(Calendario[Date], -1, MONTH))', hints: ['DATEADD(Calendario[Date], -1, MONTH)'] },
    { level: 'Intermedio', context: { 'Año': 2024, Mes: 3 }, prompt: 'Escribe el acumulado del año con TOTALYTD. Con el filtro en marzo de 2024 suma enero, febrero y marzo.', starter: 'TOTALYTD(', solution: 'TOTALYTD(SUM(Ventas[Ventas]), Calendario[Date])', hints: ['TOTALYTD(expresión, Calendario[Date]) equivale a CALCULATE con DATESYTD.'] },
    { level: 'Reto', context: { 'Año': 2024 }, prompt: 'Escribe el crecimiento porcentual contra el año anterior: (ventas - ventas del año anterior) / ventas del año anterior, con DIVIDE.', starter: 'DIVIDE(', solution: 'DIVIDE(SUM(Ventas[Ventas]) - CALCULATE(SUM(Ventas[Ventas]), SAMEPERIODLASTYEAR(Calendario[Date])), CALCULATE(SUM(Ventas[Ventas]), SAMEPERIODLASTYEAR(Calendario[Date])))', hints: ['Año anterior: CALCULATE([Ventas Totales], SAMEPERIODLASTYEAR(Calendario[Date])).', 'DIVIDE([Ventas Totales] - AñoAnterior, AñoAnterior). Puedes usar VAR para no repetir.'] }
  ];
  const pbi11 = find('pbi-11');
  pbi11.reading = false;
  pbi11.concept.forEach(c => { if (c.lang === 'dax' && /VAR/.test(c.code)) c.readonly = false; });
  pbi11.practice = { prompt: 'Escribe el crecimiento de 2024 contra 2023 usando dos variables: Actual con las ventas de 2024 y Anterior con las de 2023, y devuelve DIVIDE(Actual - Anterior, Anterior).', starter: 'VAR Actual = CALCULATE([Ventas Totales], Ventas[Año] = 2024)\nVAR Anterior = \nRETURN\n    ', solution: 'VAR Actual = CALCULATE(SUM(Ventas[Ventas]), Ventas[Año] = 2024)\nVAR Anterior = CALCULATE(SUM(Ventas[Ventas]), Ventas[Año] = 2023)\nRETURN DIVIDE(Actual - Anterior, Anterior)', hints: ['VAR Anterior = CALCULATE([Ventas Totales], Ventas[Año] = 2023)', 'RETURN DIVIDE(Actual - Anterior, Anterior)'] };
  pbi11.extra = [
    { level: 'Intermedio', prompt: 'Esta medida tiene el error clásico: multiplica columnas sin iterador. Corrígela para que calcule el margen total fila por fila.', starter: 'Ventas[Ventas] - Ventas[Costo]', solution: 'SUMX(Ventas, Ventas[Ventas] - Ventas[Costo])', hints: ['Sin contexto de fila, una columna no tiene un solo valor.', 'Envuelve la resta en SUMX(Ventas, …).'] }
  ];

  /* ============================================================ GUÍA PARA POWER BI DESKTOP */
  C.desktopGuide = {
    steps: [
      { title: 'Instala Power BI Desktop', items: ['Es gratis y funciona en Windows. Búscalo en Microsoft Store como "Power BI Desktop" e instálalo.', 'En Mac no existe: puedes usar una máquina virtual con Windows o la versión web de Power BI, que tiene menos funciones de modelado.', 'Ábrelo y cierra la ventana de bienvenida. No necesitas iniciar sesión para trabajar en tu computadora.'] },
      { title: 'Descarga los datos e impórtalos', files: true, items: ['Descarga los tres archivos de arriba: Ventas.csv (los hechos), Productos.csv y Vendedores.csv (dimensiones).', 'En Power BI: Inicio > Obtener datos > Texto/CSV. Elige Ventas.csv y pulsa Transformar datos para abrir Power Query.', 'Revisa el ícono junto a cada columna: Fecha debe ser fecha, Unidades número entero, Ventas y Costo número decimal. Corrige el que no lo sea con clic derecho > Cambiar tipo.', 'Repite con Productos.csv y Vendedores.csv. Al terminar pulsa Cerrar y aplicar.'], checks: [['Filas en Ventas', 'COUNTROWS(Ventas)', null]] },
      { title: 'Crea la tabla de calendario', code: 'Calendario =\nADDCOLUMNS(\n    CALENDAR(DATE(2023, 1, 1), DATE(2024, 12, 31)),\n    "Año", YEAR([Date]),\n    "Mes", MONTH([Date]),\n    "MesNombre", FORMAT([Date], "MMM"),\n    "Trimestre", "T" & FORMAT([Date], "Q")\n)', items: ['Modelado > Nueva tabla, pega la fórmula y pulsa Enter.', 'Con la tabla seleccionada: Herramientas de tabla > Marcar como tabla de fechas > columna Date.', 'Selecciona la columna MesNombre > Ordenar por columna > Mes, para que los meses no salgan en orden alfabético.'] },
      { title: 'Relaciona las tablas', items: ['Ve a la vista de modelo (tercer ícono de la izquierda).', 'Arrastra Productos[Producto] sobre Ventas[Producto], Vendedores[Vendedor] sobre Ventas[Vendedor] y Calendario[Date] sobre Ventas[Fecha].', 'Cada línea debe mostrar 1 del lado de la dimensión y * del lado de Ventas, con una sola flecha hacia Ventas. Así quedó el modelo del laboratorio.'] },
      { title: 'Crea las medidas', code: 'Ventas Totales = SUM(Ventas[Ventas])\nCosto Total = SUM(Ventas[Costo])\nMargen % = DIVIDE([Ventas Totales] - [Costo Total], [Ventas Totales])\nVentas YTD = TOTALYTD([Ventas Totales], Calendario[Date])\nVentas Año Anterior = CALCULATE([Ventas Totales], SAMEPERIODLASTYEAR(Calendario[Date]))\nCrecimiento % = DIVIDE([Ventas Totales] - [Ventas Año Anterior], [Ventas Año Anterior])', items: ['Inicio > Nueva medida, una por línea.', 'Da formato: Margen % y Crecimiento % como porcentaje; las demás como moneda sin decimales.', 'Compara tus números con los de abajo. Si coinciden, tu modelo está bien armado.'], checks: [['Ventas Totales, sin filtros', 'SUM(Ventas[Ventas])', null], ['Margen %, sin filtros', 'DIVIDE(SUM(Ventas[Ventas]) - SUM(Ventas[Costo]), SUM(Ventas[Ventas]))', null, 'pct'], ['Ventas Totales con Año = 2024', 'SUM(Ventas[Ventas])', { 'Año': 2024 }], ['Crecimiento % con Año = 2024', 'DIVIDE(SUM(Ventas[Ventas]) - CALCULATE(SUM(Ventas[Ventas]), SAMEPERIODLASTYEAR(Calendario[Date])), CALCULATE(SUM(Ventas[Ventas]), SAMEPERIODLASTYEAR(Calendario[Date])))', { 'Año': 2024 }, 'pct'], ['Ventas YTD con Año = 2024 y Mes = 6', 'CALCULATE(SUM(Ventas[Ventas]), DATESYTD(Calendario[Date]))', { 'Año': 2024, Mes: 6 }]] },
      { title: 'Arma la página del informe', items: ['Tres tarjetas arriba: Ventas Totales, Margen % y Crecimiento %.', 'Un gráfico de líneas con Calendario[MesNombre] en el eje y Ventas Totales y Ventas Año Anterior como valores.', 'Un gráfico de barras con Productos[Categoria] y Ventas Totales.', 'Un segmentador de Calendario[Año] y otro de Ventas[Region], juntos en el borde superior.', 'Título con la conclusión, por ejemplo: "Ventas 2024 crecen frente a 2023; Hogar lidera".'], checks: [['Ventas de la categoría Hogar', 'CALCULATE(SUM(Ventas[Ventas]), Productos[Categoria] = "Hogar")', null], ['Ventas de la región Norte en 2024', 'CALCULATE(SUM(Ventas[Ventas]), Ventas[Region] = "Norte")', { 'Año': 2024 }]] },
      { title: 'Guarda y, si puedes, publica', items: ['Guarda el archivo .pbix con un nombre y fecha, por ejemplo ventas_2024-11.pbix.', 'Para publicar en Power BI Service necesitas una cuenta de trabajo o escuela; las cuentas personales como Gmail no pueden. Si tu empresa usa Microsoft 365, Inicio > Publicar.', 'En el Servicio puedes compartir el informe y programar la actualización. Si los datos están en tu red, hace falta una puerta de enlace.', 'Este archivo terminado es una buena pieza de portafolio: súbelo a tu repositorio junto con capturas.'] }
    ]
  };

  /* ============================================================ PLAN Y RETOS */
  C.plan.forEach(w => { const i = w.lessons.indexOf('py-11'); if (i >= 0) w.lessons.splice(i + 1, 0, 'py-14', 'py-15'); });
  C.daily.push(
    { track: 'python', q: 'En pandas, ¿cómo se combinan dos condiciones de filtro?', options: ['cond1 and cond2', '(cond1) & (cond2)', 'cond1 && cond2', 'cond1, cond2'], answer: 1, explain: 'pandas usa & y |, y cada condición entre paréntesis.' },
    { track: 'powerbi', q: '¿Qué función devuelve las fechas desde el 1 de enero hasta la fecha del contexto?', options: ['DATEADD', 'DATESYTD', 'SAMEPERIODLASTYEAR', 'CALENDAR'], answer: 1, explain: 'DATESYTD es la base del acumulado del año.' },
    { track: 'powerbi', q: 'En Power Query, una columna de meses en columnas se convierte en filas con…', options: ['Combinar consultas', 'Anular dinamización', 'Dividir columna', 'Agrupar por'], answer: 1, explain: 'Unpivot convierte columnas en pares atributo-valor.' }
  );
})();
