/* DataForja — guías de uso de Python y Power BI ("Cómo se usa").
   Mismo formato que las de SQL: sintaxis, partes, cuándo usarla, cómo se lee y un antes/después.
   demo.kind: 'python' (se ejecuta), 'dax' (se evalúa por grupo), 'static' (tablas fijas). */
(function () {
  const C = window.CONTENT;
  const find = id => C.tracks.flatMap(t => t.lessons).find(l => l.id === id);
  const set = (id, g) => { const l = find(id); if (l) l.guide = g; };

  /* ============================================================ PYTHON */
  set('py-1', [
    { name: 'Variables, print() y f-strings', syntax: `nombre_variable = valor\nprint(f"Texto {variable} y {otra:.2f}")`,
      parts: [['nombre = valor', 'Guarda un valor con un nombre. El nombre va a la izquierda, sin espacios ni acentos, y describe lo que contiene: total_ventas, no x.'], ['print( … )', 'Muestra en pantalla lo que pongas dentro.'], ['f"…"', 'La f antes de las comillas convierte el texto en una plantilla.'], ['{variable}', 'Dentro de las llaves va una variable o un cálculo; Python pone su valor.'], [':.2f', 'Formato opcional: dos decimales. :.0f sin decimales, :.1f uno.']],
      when: 'Para guardar datos que vas a reutilizar y para armar mensajes, tickets o reportes con números bien presentados.',
      read: 'Guarda 1250.5 en monto e imprime "Total: 1250.50".',
      demo: { kind: 'python', before: `monto = 1250.5\niva = monto * 0.16\nprint("Total:", monto + iva)`, after: `monto = 1250.5\niva = monto * 0.16\nprint(f"Total: {monto + iva:.2f}")`, note: 'Con print y comas el número sale con todos sus decimales. Con una f-string y :.2f queda listo para un ticket.' } }
  ]);
  set('py-2', [
    { name: 'Métodos de texto y conversiones', syntax: `texto.strip()          # quita espacios de los extremos\ntexto.lower() / .upper() / .title()\ntexto.replace("viejo", "nuevo")\ntexto.split(",")        # parte en una lista\nint("12")  float("4.5")  str(2024)`,
      parts: [['texto.metodo()', 'Los métodos se escriben con un punto después del texto. Devuelven un texto nuevo; el original no cambia.'], ['encadenar', 'Puedes aplicar varios seguidos: texto.strip().title() primero quita espacios y luego pone mayúsculas.'], ['split(separador)', 'Convierte un texto en una lista de partes. Sin argumento separa por espacios.'], ['int() / float() / str()', 'Cambian el tipo. Un número que llega como texto no se puede sumar hasta convertirlo.']],
      when: 'Siempre que el dato venga de un formulario, un Excel o un sistema: casi nunca llega limpio.',
      read: 'Quita los espacios del nombre y ponlo con mayúscula inicial.',
      demo: { kind: 'python', before: `crudo = "   maría  LÓPEZ "\nprint("[" + crudo + "]")\nprint("8" + "5")`, after: `crudo = "   maría  LÓPEZ "\nlimpio = " ".join(crudo.split()).title()\nprint("[" + limpio + "]")\nprint(int("8") + int("5"))`, note: 'Los corchetes muestran los espacios. Después de limpiar, el nombre queda uniforme. Y "8" + "5" une textos (85) hasta que los conviertes a número (13).' } }
  ]);
  set('py-3', [
    { name: 'if, elif y else: tomar decisiones', syntax: `if condición:\n    acción_si_se_cumple\nelif otra_condición:\n    otra_acción\nelse:\n    acción_por_defecto`,
      parts: [['condición', 'Algo que es verdadero o falso: monto > 1000, estado == "Pagado", "vip" in etiquetas.'], [':', 'Los dos puntos al final de la línea son obligatorios.'], ['sangría', 'Las líneas de dentro llevan 4 espacios. Así sabe Python qué pertenece al bloque.'], ['elif', 'Se revisa solo si las anteriores fueron falsas. Puedes poner tantos como necesites.'], ['else', 'Opcional. Se ejecuta si ninguna condición se cumplió.']],
      when: 'Cada vez que una regla de negocio dice "si pasa esto, haz aquello": aprobar, clasificar, alertar.',
      read: 'Si el monto pasa de 10000 es Alto; si pasa de 3000, Medio; si no, Bajo.',
      demo: { kind: 'python', after: `for monto in [800, 4500, 12000]:\n    if monto > 10000:\n        nivel = "Alto"\n    elif monto > 3000:\n        nivel = "Medio"\n    else:\n        nivel = "Bajo"\n    print(monto, "->", nivel)`, note: 'Cada monto recorre las condiciones de arriba abajo y se queda en la primera que se cumple.' } }
  ]);
  set('py-4', [
    { name: 'Listas y bucles for', syntax: `lista = [valor1, valor2, valor3]\nlista.append(nuevo)\nlista[0]   lista[-1]   len(lista)\n\nfor elemento in lista:\n    hacer_algo(elemento)`,
      parts: [['[ … ]', 'Una lista guarda varios valores en orden, separados por comas.'], ['lista[0]', 'Acceso por posición. Se cuenta desde 0; -1 es el último.'], ['for elemento in lista:', 'Repite el bloque una vez por cada valor. La variable elemento toma un valor distinto en cada vuelta.'], ['acumulador', 'Una variable creada antes del bucle (total = 0) que se actualiza en cada vuelta.']],
      when: 'Cuando tienes muchos datos del mismo tipo y quieres hacer lo mismo con cada uno: sumar ventas, revisar temperaturas, enviar avisos.',
      read: 'Para cada venta de la lista, súmala al total.',
      demo: { kind: 'python', before: `ventas = [1200, 850, 2300]\nprint(ventas)`, after: `ventas = [1200, 850, 2300]\ntotal = 0\nfor v in ventas:\n    total += v\n    print("sumo", v, "| total acumulado:", total)`, note: 'El bucle da tres vueltas. En cada una, v vale un elemento distinto y el total crece.' } }
  ]);
  set('py-5', [
    { name: 'Diccionarios: contar y agrupar', syntax: `d = {"clave": valor}\nd["clave"]                 # leer\nd.get("clave", 0)          # leer sin error si no existe\nd[clave] = d.get(clave, 0) + 1   # contar\nfor clave, valor in d.items():`,
      parts: [['{ "clave": valor }', 'Asocia cada clave con un valor. Las claves no se repiten.'], ['d["clave"]', 'Lee el valor. Si la clave no existe da KeyError.'], ['d.get(clave, 0)', 'Lee el valor o devuelve 0 si no existe. Es la base del patrón para contar y sumar.'], ['d.items()', 'Da los pares clave-valor para recorrerlos con for.']],
      when: 'Cuando necesitas "cuánto hay de cada cosa": tickets por agente, ventas por región, gastos por categoría.',
      read: 'Para cada ticket, súmale 1 al contador de su agente.',
      demo: { kind: 'python', before: `tickets = ["Ana", "Luis", "Ana", "Sara", "Ana", "Luis"]\nprint(tickets)`, after: `tickets = ["Ana", "Luis", "Ana", "Sara", "Ana", "Luis"]\nconteo = {}\nfor agente in tickets:\n    conteo[agente] = conteo.get(agente, 0) + 1\nfor agente, n in conteo.items():\n    print(agente, n)`, note: 'La lista repite nombres; el diccionario los agrupa y cuenta: el mismo resultado que un GROUP BY en SQL.' } }
  ]);
  set('py-6', [
    { name: 'def: crear tus propias funciones', syntax: `def nombre_funcion(parametro1, parametro2=valor_por_defecto):\n    """Qué hace la función."""\n    resultado = …\n    return resultado`,
      parts: [['def nombre(…):', 'Define la función. El nombre describe la acción: calcular_iva, limpiar_correo.'], ['parámetros', 'Los datos que recibe. Con =valor tienen un valor por defecto y se pueden omitir al llamarla.'], ['"""docstring"""', 'Una línea que explica qué hace. Opcional pero muy útil.'], ['return', 'Devuelve el resultado a quien la llamó. Sin return, la función devuelve None.']],
      when: 'Cuando repites el mismo cálculo en varios lugares o quieres darle nombre a una regla de negocio.',
      read: 'Define con_iva(monto): devuelve el monto más 16%.',
      demo: { kind: 'python', before: `print(round(100 * 1.16, 2))\nprint(round(250 * 1.16, 2))\nprint(round(980 * 1.16, 2))`, after: `def con_iva(monto, tasa=0.16):\n    return round(monto * (1 + tasa), 2)\n\nfor m in [100, 250, 980]:\n    print(con_iva(m))`, note: 'Misma salida, pero la regla vive en un solo lugar. Si el IVA cambia, se corrige una línea.' } }
  ]);
  set('py-7', [
    { name: 'Comprensiones y sorted con key', syntax: `[expresión for x in lista if condición]\nsorted(lista, key=lambda x: criterio, reverse=True)\nlista[:3]   # los 3 primeros`,
      parts: [['[ … for x in lista ]', 'Construye una lista nueva aplicando la expresión a cada elemento.'], ['if condición', 'Opcional: solo incluye los elementos que la cumplen.'], ['key=lambda x: …', 'Indica por qué ordenar: lambda es una función corta. x[1] ordena por el segundo valor de cada tupla.'], ['reverse=True', 'Ordena de mayor a menor.']],
      when: 'Para filtrar, transformar u ordenar listas en una línea: los productos caros, el top 3 de clientes.',
      read: 'Dame los precios mayores a 100.',
      demo: { kind: 'python', before: `precios = [120, 45, 300, 80]\ncaros = []\nfor p in precios:\n    if p > 100:\n        caros.append(p)\nprint(caros)`, after: `precios = [120, 45, 300, 80]\ncaros = [p for p in precios if p > 100]\nprint(caros)\nprint(sorted(precios, reverse=True)[:3])`, note: 'Las cinco líneas del bucle se vuelven una. La última línea ordena de mayor a menor y toma los tres primeros.' } }
  ]);
  set('py-8', [
    { name: 'try y except: que un error no detenga todo', syntax: `try:\n    código_que_puede_fallar\nexcept TipoDeError:\n    qué_hacer_si_falla`,
      parts: [['try:', 'Python intenta ejecutar este bloque.'], ['except ValueError:', 'Si ocurre ese tipo de error, salta aquí en vez de detenerse. Nombra el error concreto: ValueError, KeyError, ZeroDivisionError.'], ['qué hacer', 'Usar un valor por defecto, contar el error o guardarlo en una lista para revisarlo después.']],
      when: 'Al procesar datos que pueden venir mal: textos vacíos, divisiones entre cero, claves que faltan.',
      read: 'Intenta convertir el texto a número; si no se puede, cuéntalo como inválido.',
      demo: { kind: 'python', before: `for t in ["10", "x", "5"]:\n    print(int(t))`, after: `invalidos = 0\nfor t in ["10", "x", "5"]:\n    try:\n        print(int(t))\n    except ValueError:\n        invalidos += 1\nprint("Inválidos:", invalidos)`, note: 'Sin try el programa se detiene en "x" y nunca llega al 5. Con try procesa todo y reporta lo que falló.' } }
  ]);
  set('py-9', [
    { name: 'Leer un CSV y convertir cada fila en diccionario', syntax: `lineas = texto.splitlines()\nencabezado = lineas[0].split(",")\nfor linea in lineas[1:]:\n    fila = dict(zip(encabezado, linea.split(",")))\n    fila["columna"]`,
      parts: [['splitlines()', 'Parte el texto en una lista de líneas.'], ['lineas[0]', 'La primera línea es el encabezado con los nombres de las columnas.'], ['lineas[1:]', 'Todas las líneas menos la primera: los datos.'], ['dict(zip(…))', 'Empareja cada nombre de columna con su valor. Así lees fila["precio"] en vez de recordar posiciones.'], ['conversión', 'Todo llega como texto: usa int() o float() antes de operar.']],
      when: 'Con cualquier exportación de un sistema, un banco o un punto de venta. En tu computadora harías lo mismo con el módulo csv o con pandas.',
      read: 'Para cada línea de datos, arma un diccionario con los nombres del encabezado.',
      demo: { kind: 'python', before: `texto = """producto,unidades,precio\nMouse,3,250\nTeclado,1,900"""\nprint(texto.splitlines())`, after: `texto = """producto,unidades,precio\nMouse,3,250\nTeclado,1,900"""\nlineas = texto.splitlines()\nencabezado = lineas[0].split(",")\nfor linea in lineas[1:]:\n    fila = dict(zip(encabezado, linea.split(",")))\n    print(fila["producto"], int(fila["unidades"]) * float(fila["precio"]))`, note: 'Primero son solo líneas de texto. Después cada fila tiene nombres de columna y se puede calcular con ella.' } }
  ]);
  set('py-10', [
    { name: 'La estructura de un script de reporte', syntax: `def leer(texto):\n    """Convierte el texto en filas limpias."""\n\ndef resumir(filas):\n    """Calcula totales y agrupaciones."""\n\ndef imprimir(resumen):\n    """Presenta el resultado."""\n\nfilas, errores = leer(DATOS)\nimprimir(resumir(filas))`,
      parts: [['leer', 'Lee, convierte tipos y separa las filas inválidas. Devuelve datos limpios.'], ['resumir', 'Hace las cuentas: no imprime nada.'], ['imprimir', 'Solo presenta. Si cambia el formato del reporte, solo tocas esta función.'], ['al final', 'Unas pocas líneas que llaman a las funciones en orden.']],
      when: 'En cuanto un script pasa de 20 líneas o lo vas a correr cada semana. Separar en pasos permite probar y corregir cada uno.',
      read: 'Lee los datos, resúmelos e imprime el reporte.' }
  ]);
  set('py-11', [
    { name: 'pandas: el mismo análisis con tablas completas', syntax: `import pandas as pd\ndf = pd.read_csv("archivo.csv")\ndf[df["monto"] > 1000]                      # filtrar\ndf["total"] = df["unidades"] * df["precio"]  # columna nueva\ndf.groupby("region")["monto"].sum()          # agrupar\ndf.to_excel("salida.xlsx", index=False)      # exportar`,
      parts: [['DataFrame (df)', 'Una tabla en memoria, como una hoja de Excel.'], ['df["columna"]', 'Selecciona una columna entera. Las operaciones se aplican a todas las filas a la vez, sin bucles.'], ['df[condición]', 'Filtra filas: es el WHERE de pandas.'], ['groupby().sum()', 'Agrupa y resume: es el GROUP BY de pandas.']],
      when: 'Cuando los datos pasan de cientos a miles de filas, o vienen de Excel y vuelven a Excel. Se instala en tu computadora con pip install pandas.',
      read: 'Lee ventas.csv y suma el monto por región.',
      demo: { kind: 'static', before: { cols: ['region', 'monto'], rows: [['Norte', 1200], ['Sur', 800], ['Norte', 650], ['Centro', 1500], ['Sur', 400]] }, after: { cols: ['region', 'monto'], rows: [['Centro', 1500], ['Norte', 1850], ['Sur', 1200]] }, beforeLabel: 'df', afterLabel: 'df.groupby("region")["monto"].sum()', note: 'Mismo resultado que el diccionario de la lección 5, en una línea. pandas ordena los grupos alfabéticamente.' } }
  ]);
  set('py-12', [
    { name: 'class: datos y comportamiento juntos', syntax: `class NombreClase:\n    def __init__(self, dato1, dato2):\n        self.dato1 = dato1\n        self.dato2 = dato2\n\n    def metodo(self):\n        return self.dato1 * 2\n\nobjeto = NombreClase(valor1, valor2)\nobjeto.metodo()`,
      parts: [['class Nombre:', 'Define un molde. Por convención el nombre empieza con mayúscula.'], ['__init__', 'Se ejecuta al crear cada objeto y guarda sus datos en self.'], ['self', 'El objeto concreto. self.saldo es el saldo de esa cuenta y no de otra.'], ['métodos', 'Funciones dentro de la clase que usan los datos del objeto.'], ['Clase(…)', 'Crea un objeto nuevo con esos datos.']],
      when: 'Cuando una entidad del negocio (empleado, factura, cuenta) tiene datos y reglas propias que se usan juntas.',
      read: 'Crea un empleado con nombre y salario y pregúntale su salario anual.',
      demo: { kind: 'python', after: `class Empleado:\n    def __init__(self, nombre, salario):\n        self.nombre = nombre\n        self.salario = salario\n\n    def salario_anual(self):\n        return self.salario * 12\n\nfor e in [Empleado("Ana", 30000), Empleado("Luis", 22000)]:\n    print(e.nombre, e.salario_anual())`, note: 'Dos objetos del mismo molde, cada uno con sus propios datos. El cálculo vive dentro de la clase.' } }
  ]);
  set('py-13', [
    { name: 'json y requests: datos de internet', syntax: `import json, requests\nr = requests.get(url, params={"moneda": "USD"}, timeout=10)\nif r.status_code == 200:\n    datos = r.json()          # diccionarios y listas\ndatos = json.loads(texto)     # de texto JSON a Python\ntexto = json.dumps(datos)     # de Python a texto JSON`,
      parts: [['requests.get(url)', 'Pide los datos a una API. params arma la parte ?moneda=USD de la dirección.'], ['status_code', '200 es éxito; 401 falta autorización; 404 no existe; 429 demasiadas peticiones.'], ['r.json() / json.loads()', 'Convierten la respuesta en diccionarios y listas que recorres como ya sabes.'], ['timeout', 'Cuántos segundos esperar antes de rendirse. Ponlo siempre.']],
      when: 'Para traer tipos de cambio, datos de otro sistema o de un servicio en la nube sin copiarlos a mano.',
      read: 'Pide el tipo de cambio a la API y lee el campo valor.' }
  ]);

  /* ============================================================ POWER BI */
  set('pbi-1', [
    { name: 'Dónde se resuelve cada cosa', lang: 'text', syntax: `Obtener datos  →  Power Query  →  Modelo  →  Informe  →  Service\n(conectar)       (limpiar)       (relacionar     (visuales)    (publicar y\n                                  y medir)                       actualizar)`,
      parts: [['Power Query', 'Tipos de dato, filas vacías, columnas sobrantes, unir y apilar tablas.'], ['Modelo', 'Relaciones entre tablas, tabla de calendario y medidas DAX.'], ['Informe', 'Visuales, segmentadores, diseño de la página.'], ['Service', 'Compartir, programar actualizaciones, seguridad por usuario.']],
      when: 'Antes de arreglar algo, decide en qué etapa va. Regla: resuélvelo lo más a la izquierda posible.',
      read: 'Las fechas llegan como texto: eso se arregla en Power Query, no en el gráfico.',
      demo: { kind: 'static', single: true, after: { cols: ['Problema', 'Dónde se resuelve'], rows: [['Una columna Monto no suma', 'Power Query: cambiar tipo a decimal'], ['Hay que unir 12 archivos mensuales', 'Power Query: anexar consultas'], ['Necesito Ventas Totales en varias páginas', 'Modelo: una medida DAX'], ['El segmentador de región no filtra las ventas', 'Modelo: revisar la relación'], ['El gráfico de pastel tiene 15 porciones', 'Informe: cambiar a barras'], ['Los datos no se actualizan solos', 'Service: actualización programada']] }, note: 'Cada problema tiene una etapa natural. Arreglarlo después en el flujo obliga a repetir el arreglo.' } }
  ]);
  set('pbi-2', [
    { name: 'Las transformaciones de Power Query más usadas', lang: 'm', syntax: `Table.TransformColumnTypes(t, {{"Fecha", type date}, {"Monto", type number}})\nTable.SelectRows(t, each [Monto] <> null)\nTable.UnpivotOtherColumns(t, {"Producto"}, "Mes", "Ventas")\nTable.Combine({EneroT, FebreroT})          // anexar\nTable.NestedJoin(Ventas, "ClienteID", Clientes, "ID", "C")  // combinar`,
      parts: [['Cambiar tipo', 'Inicio > Tipo de datos. Primer paso de casi toda consulta.'], ['Filtrar filas', 'La flecha del encabezado de la columna. Quita vacíos, totales y filas basura.'], ['Anular dinamización', 'Selecciona las columnas fijas (Producto) > clic derecho > Anular dinamización de otras columnas.'], ['Anexar / Combinar', 'Anexar apila tablas iguales; combinar une por una clave, como un JOIN.']],
      when: 'Cada vez que importas datos. No necesitas escribir M: cada clic lo genera, pero leerlo te ayuda a entender y corregir pasos.',
      read: 'Convierte las columnas de meses en filas, conservando Producto.',
      demo: { kind: 'static', before: { cols: ['Producto', 'Ene', 'Feb', 'Mar'], rows: [['Mouse', 120, 140, 90], ['Teclado', 80, 95, 110]] }, after: { cols: ['Producto', 'Mes', 'Ventas'], rows: [['Mouse', 'Ene', 120], ['Mouse', 'Feb', 140], ['Mouse', 'Mar', 90], ['Teclado', 'Ene', 80], ['Teclado', 'Feb', 95], ['Teclado', 'Mar', 110]] }, beforeLabel: 'Formato ancho (como llega)', afterLabel: 'Formato largo (después del unpivot)', note: 'Una tabla de 2 filas y 4 columnas se convierte en 6 filas y 3 columnas. Ahora Mes es una columna que se puede usar en un eje o un segmentador.' } }
  ]);
  set('pbi-3', [
    { name: 'Relaciones y tabla de calendario', lang: 'dax', syntax: `// Relación (vista de modelo): arrastra la clave de la dimensión a la de los hechos\nDimProducto[ProductoID]  1 ──→ *  Ventas[ProductoID]\n\nCalendario =\nADDCOLUMNS(\n    CALENDAR(DATE(2023, 1, 1), DATE(2024, 12, 31)),\n    "Año", YEAR([Date]),\n    "Mes", MONTH([Date])\n)`,
      parts: [['1 → *', 'Uno a varios: un producto aparece muchas veces en Ventas. El filtro fluye del lado 1 al lado *.'], ['Clave', 'La columna que identifica cada fila de la dimensión; no debe repetirse.'], ['CALENDAR', 'Genera una fila por día entre dos fechas: la tabla continua que pide la inteligencia de tiempo.'], ['Marcar como tabla de fechas', 'Clic derecho en Calendario > Marcar como tabla de fechas.']],
      when: 'Al armar el modelo, antes de escribir medidas. Un buen modelo estrella hace que las medidas sean cortas.',
      read: 'Cada producto de DimProducto filtra sus muchas filas de Ventas.',
      demo: { kind: 'static', before: { cols: ['ProductoID', 'Producto', 'Categoria'], rows: [[1, 'Mouse', 'Electrónica'], [2, 'Cafetera', 'Hogar']] }, after: { cols: ['VentaID', 'ProductoID', 'Unidades'], rows: [[101, 1, 3], [102, 2, 1], [103, 1, 5], [104, 1, 2]] }, beforeLabel: 'DimProducto (lado 1)', afterLabel: 'Ventas (lado *)', note: 'Si eliges Mouse en un segmentador de DimProducto, la relación deja en Ventas solo las filas con ProductoID 1: las ventas 101, 103 y 104.' } }
  ]);
  set('pbi-4', [
    { name: 'Medidas: una fórmula que responde a los filtros', syntax: `Nombre de la medida = FUNCIÓN(Tabla[Columna])\n\nVentas Totales = SUM(Ventas[Ventas])\nNum Ventas = COUNTROWS(Ventas)\nProductos = DISTINCTCOUNT(Ventas[Producto])`,
      parts: [['Nombre =', 'Así se llamará la medida en el panel de campos. Va entre corchetes cuando la usas en otra: [Ventas Totales].'], ['Tabla[Columna]', 'Referencia a una columna: siempre con el nombre de la tabla delante.'], ['SUM / AVERAGE / MIN / MAX', 'Agregan una columna numérica.'], ['COUNTROWS / DISTINCTCOUNT', 'Cuentan filas o valores distintos.']],
      when: 'Para cualquier número que vaya en una tarjeta, un gráfico o una tabla. Se crea en Modelado > Nueva medida.',
      read: 'Ventas Totales es la suma de la columna Ventas.',
      demo: { kind: 'dax', by: 'Region', cols: [['Ventas Totales', 'SUM(Ventas[Ventas])'], ['Num Ventas', 'COUNTROWS(Ventas)'], ['Productos', 'DISTINCTCOUNT(Ventas[Producto])']], note: 'Las mismas tres fórmulas dan un resultado distinto en cada fila, porque cada fila filtra su región. La fila Total no tiene filtro.' } }
  ]);
  set('pbi-5', [
    { name: 'DIVIDE y las razones bien calculadas', syntax: `DIVIDE(numerador, denominador)\nDIVIDE(numerador, denominador, valor_si_cero)\n\nMargen % = DIVIDE([Ventas Totales] - [Costo Total], [Ventas Totales])`,
      parts: [['numerador / denominador', 'Normalmente dos medidas o dos SUM.'], ['valor_si_cero', 'Opcional. Lo que devuelve si el denominador es cero o está vacío. Sin él devuelve BLANK.'], ['Dividir sumas', 'Un porcentaje se calcula dividiendo los totales, no promediando porcentajes fila por fila.']],
      when: 'Margen %, ticket promedio, costo por unidad, tasa de conversión: cualquier indicador que sea una división.',
      read: 'Margen % es la diferencia entre ventas y costo dividida entre las ventas.',
      demo: { kind: 'dax', by: 'Categoria', cols: [['Margen % (correcto)', 'DIVIDE(SUM(Ventas[Ventas]) - SUM(Ventas[Costo]), SUM(Ventas[Ventas]))', 'pct'], ['Promedio de % por fila (incorrecto)', 'AVERAGEX(Ventas, DIVIDE(Ventas[Ventas] - Ventas[Costo], Ventas[Ventas]))', 'pct']], note: 'Las dos columnas no coinciden. El promedio de porcentajes da el mismo peso a una venta de 300 que a una de 30,000; la división de sumas es el margen real.' } }
  ]);
  set('pbi-6', [
    { name: 'CALCULATE: cambiar los filtros de una medida', syntax: `CALCULATE(\n    expresión,\n    Tabla[Columna] = valor,\n    otro_filtro\n)`,
      parts: [['expresión', 'La medida o agregación que quieres calcular: [Ventas Totales], SUM(Ventas[Unidades]).'], ['filtro', 'Una condición sobre una columna. Reemplaza el filtro que ya hubiera en esa misma columna.'], ['varios filtros', 'Se separan con comas y se aplican a la vez (AND). Para varios valores de una columna usa IN {"A", "B"}.']],
      when: 'Para medidas con un filtro fijo (ventas de 2024, ventas de Norte) y como base de los porcentajes y comparaciones.',
      read: 'Calcula Ventas Totales pero solo para 2024.',
      demo: { kind: 'dax', by: 'Region', cols: [['Ventas Totales', '[Ventas Totales]'], ['Ventas 2024', 'CALCULATE([Ventas Totales], Ventas[Año] = 2024)'], ['Ventas Norte', 'CALCULATE([Ventas Totales], Ventas[Region] = "Norte")']], note: 'Ventas 2024 respeta la región de cada fila y añade el año. Ventas Norte repite el mismo número en todas las filas: su filtro reemplaza el de la región.' } }
  ]);
  set('pbi-7', [
    { name: 'ALL: el total para calcular porcentajes', syntax: `CALCULATE([Medida], ALL(Tabla[Columna]))   // quita el filtro de esa columna\nCALCULATE([Medida], ALL(Tabla))            // quita todos los filtros\n\n% del Total = DIVIDE([Medida], CALCULATE([Medida], ALL(Tabla[Columna])))`,
      parts: [['ALL(Tabla[Columna])', 'Ignora el filtro de esa columna y conserva los demás (por ejemplo, el año).'], ['ALL(Tabla)', 'Ignora todos los filtros de la tabla.'], ['DIVIDE(parte, total)', 'La parte es la medida normal; el total es la misma medida con ALL.']],
      when: 'Participación de cada región, categoría o vendedor sobre el total.',
      read: 'Divide las ventas de cada región entre las ventas de todas las regiones.',
      demo: { kind: 'dax', by: 'Region', cols: [['Ventas', '[Ventas Totales]'], ['Todas las regiones', 'CALCULATE([Ventas Totales], ALL(Ventas[Region]))'], ['% del total', 'DIVIDE([Ventas Totales], CALCULATE([Ventas Totales], ALL(Ventas[Region])))', 'pct']], note: 'La columna del medio vale lo mismo en todas las filas: es el denominador. La última suma 100%.' } },
    { name: 'SUMX y FILTER: calcular fila por fila', syntax: `SUMX(tabla, expresión_por_fila)\nFILTER(tabla, condición)\n\nSUMX(FILTER(Ventas, Ventas[Unidades] >= 10), Ventas[Ventas])`,
      parts: [['SUMX', 'Recorre la tabla, calcula la expresión en cada fila y suma los resultados. También existen AVERAGEX, MAXX, COUNTX.'], ['FILTER', 'Devuelve solo las filas que cumplen la condición. Se usa dentro de un iterador o de CALCULATE.'], ['contexto de fila', 'Dentro de SUMX y FILTER puedes usar columnas directamente porque se evalúan fila por fila.']],
      when: 'Cuando el cálculo necesita hacerse por fila antes de sumar, o la condición es compleja (varias columnas, comparar con una medida).',
      read: 'Suma las ventas solo de las filas con 10 unidades o más.',
      demo: { kind: 'dax', by: 'Categoria', cols: [['Todas las ventas', 'SUM(Ventas[Ventas])'], ['Ventas de 10+ unidades', 'SUMX(FILTER(Ventas, Ventas[Unidades] >= 10), Ventas[Ventas])'], ['Filas de 10+ unidades', 'COUNTROWS(FILTER(Ventas, Ventas[Unidades] >= 10))']], note: 'FILTER deja solo las ventas grandes de cada categoría y SUMX las suma. En Oficina hay muchas menos filas así: sus productos son caros y se venden de a pocos.' } }
  ]);
  set('pbi-8', [
    { name: 'Elegir el visual según la pregunta', lang: 'text', syntax: `¿Comparar categorías?        → Barras horizontales\n¿Evolución en el tiempo?      → Líneas\n¿Un número clave?             → Tarjeta\n¿Detalle fila por fila?       → Tabla o matriz\n¿Participación (pocas partes)?→ Barras al 100% o treemap`,
      parts: [['Eje', 'La dimensión que reparte los datos: Región, Mes, Categoría.'], ['Valores', 'Las medidas que se dibujan.'], ['Segmentadores', 'Filtran toda la página; ponlos juntos y siempre en el mismo lugar.'], ['Título', 'Que diga la conclusión, no solo el nombre del dato.']],
      when: 'Al diseñar cada visual: primero escribe la pregunta que responde, luego elige el tipo.',
      read: 'Quiero comparar regiones: uso barras con Región en el eje y Ventas Totales como valor.',
      demo: { kind: 'dax', by: 'Region', cols: [['Ventas Totales', '[Ventas Totales]'], ['Margen %', '[Margen %]', 'pct']], note: 'Esta tabla es lo que dibuja un gráfico de barras por región: cada fila es una barra. En el laboratorio puedes construirlo con el constructor de visuales.' } }
  ]);
  set('pbi-9', [
    { name: 'Inteligencia de tiempo', syntax: `Ventas YTD = CALCULATE([Ventas Totales], DATESYTD(Calendario[Date]))\nVentas Año Anterior = CALCULATE([Ventas Totales], SAMEPERIODLASTYEAR(Calendario[Date]))\nVentas Mes Anterior = CALCULATE([Ventas Totales], DATEADD(Calendario[Date], -1, MONTH))`,
      parts: [['DATESYTD', 'Todas las fechas desde el 1 de enero hasta la fecha del contexto: el acumulado del año.'], ['SAMEPERIODLASTYEAR', 'El mismo periodo, un año atrás. Funciona por día, mes o trimestre según el visual.'], ['DATEADD(fechas, n, periodo)', 'Desplaza n días, meses, trimestres o años.'], ['Calendario[Date]', 'Siempre la columna de fecha de la tabla de calendario marcada, nunca la de los hechos.']],
      when: 'Acumulados del año, comparaciones contra el año o el mes anterior. Requieren la tabla de calendario de la lección 3.',
      read: 'Calcula las ventas del mismo periodo del año pasado.',
      demo: { kind: 'static', single: true, after: { cols: ['Mes', 'Ventas', 'Ventas YTD', 'Año anterior', 'Crecimiento %'], rows: [['Ene 2024', '100', '100', '90', '11.1%'], ['Feb 2024', '120', '220', '110', '9.1%'], ['Mar 2024', '80', '300', '95', '-15.8%']] }, note: 'Ejemplo ilustrativo con números redondos. YTD acumula mes a mes; Año anterior trae el mismo mes de 2023; Crecimiento % compara ambos.' } }
  ]);
  set('pbi-10', [
    { name: 'Comparar periodos con CALCULATE', syntax: `Ventas 2024 = CALCULATE([Ventas Totales], Ventas[Año] = 2024)\nVentas 2023 = CALCULATE([Ventas Totales], Ventas[Año] = 2023)\nCrecimiento % = DIVIDE([Ventas 2024] - [Ventas 2023], [Ventas 2023])`,
      parts: [['Fijar un periodo', 'CALCULATE con el año reemplaza cualquier filtro de año del usuario.'], ['Variación', 'Resta simple de las dos medidas.'], ['Crecimiento %', 'La variación dividida entre el periodo base, con DIVIDE por si el base está vacío.']],
      when: 'Comparaciones de año completo cuando todavía no tienes tabla de calendario.',
      read: '¿Cuánto crecieron las ventas de 2024 frente a 2023 en cada región?',
      demo: { kind: 'dax', by: 'Region', cols: [['2023', 'CALCULATE([Ventas Totales], Ventas[Año] = 2023)'], ['2024', 'CALCULATE([Ventas Totales], Ventas[Año] = 2024)'], ['Crecimiento %', 'DIVIDE(CALCULATE([Ventas Totales], Ventas[Año] = 2024) - CALCULATE([Ventas Totales], Ventas[Año] = 2023), CALCULATE([Ventas Totales], Ventas[Año] = 2023))', 'pct']], note: 'Cada región conserva su filtro y CALCULATE añade el año. Así se ve qué regiones explican el crecimiento total.' } }
  ]);
  set('pbi-11', [
    { name: 'VAR y RETURN: medidas legibles y más rápidas', syntax: `Nombre =\nVAR Actual = [Ventas Totales]\nVAR Anterior = [Ventas Año Anterior]\nRETURN\n    DIVIDE(Actual - Anterior, Anterior)`,
      parts: [['VAR nombre = …', 'Guarda un resultado intermedio. Se calcula una sola vez aunque lo uses varias veces.'], ['RETURN', 'La expresión final que devuelve la medida.'], ['depurar', 'Para revisar un paso, cambia temporalmente RETURN por el nombre de una variable.']],
      when: 'En cualquier medida que repita un cálculo o tenga más de una línea.',
      read: 'Guarda las ventas actuales y las del año anterior, y devuelve el crecimiento.' }
  ]);
})();
