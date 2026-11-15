/* DataForja — ampliación de contenido: ejercicios extra, lecciones nuevas y chuletas de referencia.
   Se carga después de content.js y modifica window.CONTENT en el sitio. */
(function () {
  const C = window.CONTENT;
  const T = Object.fromEntries(C.tracks.map(t => [t.id, t]));
  const L = {}; C.tracks.forEach(t => t.lessons.forEach(l => { L[l.id] = l; }));

  /* ============================================================ EJERCICIOS EXTRA */
  const extra = {
    'py-1': [
      { prompt: 'Arma una etiqueta de envío. Con nombre = "Carla Ruiz", ciudad = "Puebla", paquetes = 3 y peso = 2.5 (kilos por paquete), imprime dos líneas: "Destinatario: Carla Ruiz (Puebla)" y "Paquetes: 3 · Peso total: 7.5 kg" (el peso con un decimal).',
        starter: 'nombre = "Carla Ruiz"\nciudad = "Puebla"\npaquetes = 3\npeso = 2.5\n\n# Imprime las dos líneas de la etiqueta\n',
        expected: 'Destinatario: Carla Ruiz (Puebla)\nPaquetes: 3 · Peso total: 7.5 kg',
        solution: 'nombre = "Carla Ruiz"\nciudad = "Puebla"\npaquetes = 3\npeso = 2.5\n\nprint(f"Destinatario: {nombre} ({ciudad})")\nprint(f"Paquetes: {paquetes} · Peso total: {paquetes * peso:.1f} kg")',
        hints: ['Los paréntesis alrededor de la ciudad van dentro del texto de la f-string.', 'El peso total es paquetes * peso; puedes calcularlo dentro de las llaves.', 'Copia el separador · tal cual (es un carácter normal).'] },
      { prompt: 'Convierte dólares a pesos. Con monto_usd = 250 y tipo_cambio = 17.35, imprime "250 USD = 4337.50 MXN".',
        starter: 'monto_usd = 250\ntipo_cambio = 17.35\n\n',
        expected: '250 USD = 4337.50 MXN',
        solution: 'monto_usd = 250\ntipo_cambio = 17.35\n\nprint(f"{monto_usd} USD = {monto_usd * tipo_cambio:.2f} MXN")',
        hints: ['Multiplica monto_usd * tipo_cambio.', 'Usa :.2f para los dos decimales del resultado.'] }
    ],
    'py-2': [
      { prompt: 'Normaliza "  CARLOS   mendoza" (tiene espacios dobles). Imprime "Nombre: Carlos Mendoza" y, en la segunda línea, "Iniciales: CM".',
        starter: 'crudo = "  CARLOS   mendoza"\n\n# Pista: split() sin argumentos separa por cualquier cantidad de espacios\n',
        expected: 'Nombre: Carlos Mendoza\nIniciales: CM',
        solution: 'crudo = "  CARLOS   mendoza"\n\npartes = crudo.split()\nlimpio = " ".join(partes).title()\niniciales = partes[0][0].upper() + partes[1][0].upper()\n\nprint(f"Nombre: {limpio}")\nprint(f"Iniciales: {iniciales}")',
        hints: ['crudo.split() devuelve ["CARLOS", "mendoza"] sin importar los espacios.', '" ".join(partes) vuelve a unir con un solo espacio; luego .title().', 'La inicial de cada parte es parte[0]; conviértela a mayúscula con .upper().'] },
      { prompt: 'La fecha llega como texto "2024-07-15". Sepárala e imprime "Día: 15, Mes: 07, Año: 2024" y en otra línea el año siguiente como número: "2025".',
        starter: 'fecha = "2024-07-15"\n\n',
        expected: 'Día: 15, Mes: 07, Año: 2024\n2025',
        solution: 'fecha = "2024-07-15"\n\nanio, mes, dia = fecha.split("-")\nprint(f"Día: {dia}, Mes: {mes}, Año: {anio}")\nprint(int(anio) + 1)',
        hints: ['fecha.split("-") da tres textos; puedes desempaquetarlos: anio, mes, dia = ...', 'Para sumar 1 al año primero conviértelo con int().'] }
    ],
    'py-3': [
      { prompt: 'Calcula el índice de masa corporal (peso / altura al cuadrado) con peso = 82 y altura = 1.75 y clasifícalo: menor a 18.5 "Bajo peso", menor a 25 "Normal", menor a 30 "Sobrepeso", si no "Obesidad". Imprime "IMC: 26.8 - Sobrepeso" (un decimal).',
        starter: 'peso = 82\naltura = 1.75\n\nimc = peso / altura ** 2\n# Clasifica y luego imprime\n',
        expected: 'IMC: 26.8 - Sobrepeso',
        solution: 'peso = 82\naltura = 1.75\n\nimc = peso / altura ** 2\nif imc < 18.5:\n    categoria = "Bajo peso"\nelif imc < 25:\n    categoria = "Normal"\nelif imc < 30:\n    categoria = "Sobrepeso"\nelse:\n    categoria = "Obesidad"\n\nprint(f"IMC: {imc:.1f} - {categoria}")',
        hints: ['Ordena las condiciones de menor a mayor con elif; cada una solo se evalúa si la anterior falló.', 'El formato :.1f deja un decimal.'] },
      { prompt: 'Aplica un cupón. Si codigo es "VERANO20" el descuento es 20; si es "BIENVENIDA" es 10; cualquier otro, 0. Con total = 1500 y codigo = "VERANO20" imprime "Descuento: 20%" y "Total: 1200.00".',
        starter: 'codigo = "VERANO20"\ntotal = 1500\n\n',
        expected: 'Descuento: 20%\nTotal: 1200.00',
        solution: 'codigo = "VERANO20"\ntotal = 1500\n\nif codigo == "VERANO20":\n    descuento = 20\nelif codigo == "BIENVENIDA":\n    descuento = 10\nelse:\n    descuento = 0\n\nprint(f"Descuento: {descuento}%")\nprint(f"Total: {total * (1 - descuento / 100):.2f}")',
        hints: ['Compara textos con ==; distingue mayúsculas.', 'El total final es total * (1 - descuento / 100).'] }
    ],
    'py-4': [
      { prompt: 'Las horas trabajadas de la semana son [8, 9.5, 7, 8, 10]. Imprime "Horas: 42.5" y "Extras: 2.5" (lo que supera 40).',
        starter: 'horas = [8, 9.5, 7, 8, 10]\n\n',
        expected: 'Horas: 42.5\nExtras: 2.5',
        solution: 'horas = [8, 9.5, 7, 8, 10]\n\ntotal = sum(horas)\nextras = total - 40\nprint(f"Horas: {total}")\nprint(f"Extras: {extras}")',
        hints: ['sum(horas) suma toda la lista.', 'Las extras son total - 40.'] },
      { prompt: 'Encuentra el mes con menos ventas. Con meses = ["Ene", "Feb", "Mar", "Abr"] y ventas = [1200, 980, 1500, 1100], imprime "Peor mes: Feb (980)".',
        starter: 'meses = ["Ene", "Feb", "Mar", "Abr"]\nventas = [1200, 980, 1500, 1100]\n\n# Pista: lista.index(valor) da la posición de un valor\n',
        expected: 'Peor mes: Feb (980)',
        solution: 'meses = ["Ene", "Feb", "Mar", "Abr"]\nventas = [1200, 980, 1500, 1100]\n\nminimo = min(ventas)\nposicion = ventas.index(minimo)\nprint(f"Peor mes: {meses[posicion]} ({minimo})")',
        hints: ['min(ventas) da el valor más bajo.', 'ventas.index(minimo) da su posición, y meses[posicion] el nombre del mes.'] }
    ],
    'py-5': [
      { prompt: 'Actualiza un inventario con movimientos. Parte de stock = {"Mouse": 5, "Teclado": 0, "Monitor": 2} y aplica movimientos = [("Mouse", -2), ("Teclado", 10), ("Cable", 4)] (los productos nuevos empiezan en 0). Imprime el stock final ordenado por nombre como "Producto: cantidad".',
        starter: 'stock = {"Mouse": 5, "Teclado": 0, "Monitor": 2}\nmovimientos = [("Mouse", -2), ("Teclado", 10), ("Cable", 4)]\n\nfor producto, cantidad in movimientos:\n    pass\n\n# Imprime ordenado por nombre\n',
        expected: 'Cable: 4\nMonitor: 2\nMouse: 3\nTeclado: 10',
        solution: 'stock = {"Mouse": 5, "Teclado": 0, "Monitor": 2}\nmovimientos = [("Mouse", -2), ("Teclado", 10), ("Cable", 4)]\n\nfor producto, cantidad in movimientos:\n    stock[producto] = stock.get(producto, 0) + cantidad\n\nfor producto, cantidad in sorted(stock.items()):\n    print(f"{producto}: {cantidad}")',
        hints: ['stock.get(producto, 0) + cantidad funciona tanto para productos existentes como nuevos.', 'sorted(stock.items()) ordena los pares por la clave (el nombre).'] },
      { prompt: 'Calcula el promedio de cada alumno. Con calificaciones = {"Ana": [90, 85, 100], "Luis": [70, 65, 80]} imprime "Ana: 91.7" y "Luis: 71.7" (un decimal).',
        starter: 'calificaciones = {"Ana": [90, 85, 100], "Luis": [70, 65, 80]}\n\n',
        expected: 'Ana: 91.7\nLuis: 71.7',
        solution: 'calificaciones = {"Ana": [90, 85, 100], "Luis": [70, 65, 80]}\n\nfor nombre, notas in calificaciones.items():\n    promedio = sum(notas) / len(notas)\n    print(f"{nombre}: {promedio:.1f}")',
        hints: ['Recorre con for nombre, notas in calificaciones.items().', 'El promedio es sum(notas) / len(notas).'] }
    ],
    'py-6': [
      { prompt: 'Escribe es_bisiesto(anio): un año es bisiesto si es divisible entre 4 y no entre 100, o si es divisible entre 400. Imprime el resultado para 2024, 1900 y 2000 (una línea cada uno).',
        starter: 'def es_bisiesto(anio):\n    pass\n\nprint(es_bisiesto(2024))\nprint(es_bisiesto(1900))\nprint(es_bisiesto(2000))',
        expected: 'True\nFalse\nTrue',
        solution: 'def es_bisiesto(anio):\n    return (anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0\n\nprint(es_bisiesto(2024))\nprint(es_bisiesto(1900))\nprint(es_bisiesto(2000))',
        hints: ['Divisible entre 4 se escribe anio % 4 == 0.', 'Puedes devolver directamente la expresión booleana con return.'] },
      { prompt: 'Escribe iniciales(nombre_completo) que devuelva las iniciales en mayúsculas. iniciales("ana maría lópez") debe imprimir "AML".',
        starter: 'def iniciales(nombre_completo):\n    pass\n\nprint(iniciales("ana maría lópez"))',
        expected: 'AML',
        solution: 'def iniciales(nombre_completo):\n    letras = [palabra[0].upper() for palabra in nombre_completo.split()]\n    return "".join(letras)\n\nprint(iniciales("ana maría lópez"))',
        hints: ['nombre_completo.split() separa las palabras.', 'Toma palabra[0].upper() de cada una y únelas con "".join(lista).'] }
    ],
    'py-7': [
      { prompt: 'De emails = ["Ana@Empresa.com", "luis@gmail.com", "SARA@empresa.com"], obtén en una comprensión los correos corporativos (terminan en @empresa.com, sin importar mayúsculas) ya en minúsculas, e imprime la lista.',
        starter: 'emails = ["Ana@Empresa.com", "luis@gmail.com", "SARA@empresa.com"]\n\ncorporativos = []\nprint(corporativos)',
        expected: "['ana@empresa.com', 'sara@empresa.com']",
        solution: 'emails = ["Ana@Empresa.com", "luis@gmail.com", "SARA@empresa.com"]\n\ncorporativos = [e.lower() for e in emails if e.lower().endswith("@empresa.com")]\nprint(corporativos)',
        hints: ['Primero pasa cada correo a minúsculas con .lower().', 'endswith("@empresa.com") comprueba la terminación.'] },
      { prompt: 'Ordena a los empleados por departamento (A-Z) y, dentro de cada departamento, por salario de mayor a menor. Imprime "departamento nombre salario" por línea.',
        starter: 'empleados = [\n    {"nombre": "Ana", "dep": "Ventas", "sal": 30000},\n    {"nombre": "Luis", "dep": "TI", "sal": 45000},\n    {"nombre": "Sara", "dep": "Ventas", "sal": 35000},\n]\n\n# Pista: key puede devolver una tupla; un número negativo invierte ese criterio\n',
        expected: 'TI Luis 45000\nVentas Sara 35000\nVentas Ana 30000',
        solution: 'empleados = [\n    {"nombre": "Ana", "dep": "Ventas", "sal": 30000},\n    {"nombre": "Luis", "dep": "TI", "sal": 45000},\n    {"nombre": "Sara", "dep": "Ventas", "sal": 35000},\n]\n\nordenados = sorted(empleados, key=lambda e: (e["dep"], -e["sal"]))\nfor e in ordenados:\n    print(f"{e[\'dep\']} {e[\'nombre\']} {e[\'sal\']}")',
        hints: ['key=lambda e: (e["dep"], -e["sal"]) ordena por departamento y, en empate, por salario descendente.', 'Recorre la lista ordenada e imprime los tres campos separados por espacio.'] }
    ],
    'py-8': [
      { prompt: 'Valida edades que llegan como texto: ["34", "abc", "", "27", "-5"]. Una edad es válida si se convierte a entero y es mayor o igual a 0. Imprime "Válidas: 2" e "Inválidas: 3".',
        starter: 'edades = ["34", "abc", "", "27", "-5"]\nvalidas = 0\ninvalidas = 0\n\nfor e in edades:\n    pass\n\nprint(f"Válidas: {validas}")\nprint(f"Inválidas: {invalidas}")',
        expected: 'Válidas: 2\nInválidas: 3',
        solution: 'edades = ["34", "abc", "", "27", "-5"]\nvalidas = 0\ninvalidas = 0\n\nfor e in edades:\n    try:\n        n = int(e)\n    except ValueError:\n        invalidas += 1\n        continue\n    if n >= 0:\n        validas += 1\n    else:\n        invalidas += 1\n\nprint(f"Válidas: {validas}")\nprint(f"Inválidas: {invalidas}")',
        hints: ['int("") y int("abc") lanzan ValueError: atrápalo y cuenta una inválida.', 'Si la conversión funciona, todavía hay que comprobar que n >= 0.'] },
      { prompt: 'Busca precios en un diccionario que puede no tenerlos. Con precios = {"café": 45} y pedidos = ["café", "té"], imprime "café: 45" y "Sin precio: té" usando try/except KeyError.',
        starter: 'precios = {"café": 45}\npedidos = ["café", "té"]\n\nfor p in pedidos:\n    pass\n',
        expected: 'café: 45\nSin precio: té',
        solution: 'precios = {"café": 45}\npedidos = ["café", "té"]\n\nfor p in pedidos:\n    try:\n        print(f"{p}: {precios[p]}")\n    except KeyError:\n        print(f"Sin precio: {p}")',
        hints: ['precios[p] lanza KeyError cuando la clave no existe.', 'El print normal va dentro del try; el mensaje alternativo en el except.'] }
    ],
    'py-9': [
      { prompt: 'Este CSV usa punto y coma como separador. Suma la columna ventas e imprime "Total: 2000".',
        starter: 'csv_texto = """nombre;ventas\nAna;1200\nLuis;800"""\n\n',
        expected: 'Total: 2000',
        solution: 'csv_texto = """nombre;ventas\nAna;1200\nLuis;800"""\n\ntotal = 0\nfor linea in csv_texto.splitlines()[1:]:\n    nombre, ventas = linea.split(";")\n    total += int(ventas)\n\nprint(f"Total: {total}")',
        hints: ['split(";") en lugar de split(",").', 'Salta el encabezado con [1:] y convierte ventas con int().'] },
      { prompt: 'Genera un CSV de salida. A partir de filas = [("Mouse", 3, 250), ("Teclado", 1, 900)] imprime el encabezado "producto,total" y una línea por producto con el total (unidades * precio): "Mouse,750" y "Teclado,900".',
        starter: 'filas = [("Mouse", 3, 250), ("Teclado", 1, 900)]\n\nprint("producto,total")\n',
        expected: 'producto,total\nMouse,750\nTeclado,900',
        solution: 'filas = [("Mouse", 3, 250), ("Teclado", 1, 900)]\n\nprint("producto,total")\nfor producto, unidades, precio in filas:\n    print(f"{producto},{unidades * precio}")',
        hints: ['Desempaqueta cada tupla en el for: for producto, unidades, precio in filas.', 'Imprime producto y total separados por una coma, sin espacios.'] }
    ],
    'py-10': [
      { prompt: 'Amplía el reporte: usando la función resumen_por_vendedor ya escrita, imprime "Mejor vendedor: Sara (1500.00)" y luego "Total equipo: 3700.00".',
        starter: 'DATOS = """vendedor,unidades,precio\nAna,2,500\nLuis,1,1200\nAna,,500\nSara,4,300\nLuis,2,abc\nSara,1,300"""\n\ndef resumen_por_vendedor(texto):\n    totales = {}\n    for l in texto.splitlines()[1:]:\n        vendedor, unidades, precio = l.split(",")\n        try:\n            venta = int(unidades) * float(precio)\n        except ValueError:\n            continue\n        totales[vendedor] = totales.get(vendedor, 0) + venta\n    return totales\n\nresumen = resumen_por_vendedor(DATOS)\n# Pista: max(diccionario, key=diccionario.get) da la clave con mayor valor\n',
        expected: 'Mejor vendedor: Sara (1500.00)\nTotal equipo: 3700.00',
        solution: 'DATOS = """vendedor,unidades,precio\nAna,2,500\nLuis,1,1200\nAna,,500\nSara,4,300\nLuis,2,abc\nSara,1,300"""\n\ndef resumen_por_vendedor(texto):\n    totales = {}\n    for l in texto.splitlines()[1:]:\n        vendedor, unidades, precio = l.split(",")\n        try:\n            venta = int(unidades) * float(precio)\n        except ValueError:\n            continue\n        totales[vendedor] = totales.get(vendedor, 0) + venta\n    return totales\n\nresumen = resumen_por_vendedor(DATOS)\nmejor = max(resumen, key=resumen.get)\nprint(f"Mejor vendedor: {mejor} ({resumen[mejor]:.2f})")\nprint(f"Total equipo: {sum(resumen.values()):.2f}")',
        hints: ['max(resumen, key=resumen.get) devuelve el nombre con el total más alto.', 'sum(resumen.values()) suma todos los totales.'] }
    ],
    'sql-1': [
      { prompt: 'Muestra nombre, ciudad y país de todos los clientes, en ese orden de columnas.', starter: 'SELECT \nFROM clientes;', solution: 'SELECT nombre, ciudad, pais FROM clientes;', hints: ['Las columnas se separan con comas.', 'La columna de país se llama pais, sin acento.'] },
      { prompt: 'Lista cada producto con su precio y el precio con IVA (precio * 1.16) con alias precio_con_iva. Columnas: nombre, precio, precio_con_iva.', starter: 'SELECT nombre, precio, \nFROM productos;', solution: 'SELECT nombre, precio, precio * 1.16 AS precio_con_iva FROM productos;', hints: ['Puedes multiplicar una columna directamente en el SELECT.', 'El alias se pone con AS precio_con_iva.'] }
    ],
    'sql-2': [
      { prompt: 'Muestra id, fecha y estado de los pedidos de 2024 que estén "Pendiente" o "En camino".', starter: 'SELECT id, fecha, estado\nFROM pedidos\nWHERE ', solution: "SELECT id, fecha, estado FROM pedidos WHERE estado IN ('Pendiente', 'En camino') AND fecha BETWEEN '2024-01-01' AND '2024-12-31';", hints: ["estado IN ('Pendiente', 'En camino') cubre los dos estados.", "El año se filtra con BETWEEN '2024-01-01' AND '2024-12-31'."] },
      { prompt: 'Lista nombre y ciudad de los clientes que no tienen correo registrado.', starter: 'SELECT nombre, ciudad\nFROM clientes\nWHERE ', solution: 'SELECT nombre, ciudad FROM clientes WHERE correo IS NULL;', hints: ['Sin dato se comprueba con IS NULL.', 'No uses = NULL: nunca devuelve filas.'] }
    ],
    'sql-3': [
      { prompt: 'Obtén los 3 clientes más antiguos (menor fecha_alta). Columnas: nombre, fecha_alta.', starter: 'SELECT nombre, fecha_alta\nFROM clientes\n', solution: 'SELECT nombre, fecha_alta FROM clientes ORDER BY fecha_alta LIMIT 3;', ordered: true, hints: ['Ascendente es el orden por defecto, así que basta ORDER BY fecha_alta.', 'LIMIT 3 al final.'] },
      { prompt: 'Lista los departamentos distintos que existen, en orden alfabético.', starter: 'SELECT \nFROM empleados\n', solution: 'SELECT DISTINCT departamento FROM empleados ORDER BY departamento;', ordered: true, hints: ['DISTINCT va justo después de SELECT.', 'ORDER BY departamento los ordena de la A a la Z.'] }
    ],
    'sql-4': [
      { prompt: 'Cuenta cuántos clientes hay por país. Columnas: pais, clientes. Ordena de más a menos clientes y, en empate, por país.', starter: 'SELECT pais, \nFROM clientes\n', solution: 'SELECT pais, COUNT(*) AS clientes FROM clientes GROUP BY pais ORDER BY clientes DESC, pais;', ordered: true, hints: ['COUNT(*) AS clientes con GROUP BY pais.', 'ORDER BY clientes DESC, pais.'] },
      { prompt: 'Calcula la nómina (suma de salarios) de cada departamento. Columnas: departamento, nomina. Ordena por nómina descendente.', starter: 'SELECT departamento, \nFROM empleados\n', solution: 'SELECT departamento, SUM(salario) AS nomina FROM empleados GROUP BY departamento ORDER BY nomina DESC;', ordered: true, hints: ['SUM(salario) AS nomina.', 'Puedes ordenar por el alias: ORDER BY nomina DESC.'] }
    ],
    'sql-5': [
      { prompt: 'Muestra los departamentos con más de 2 empleados. Columnas: departamento, empleados.', starter: 'SELECT departamento, COUNT(*) AS empleados\nFROM empleados\nGROUP BY departamento\n', solution: 'SELECT departamento, COUNT(*) AS empleados FROM empleados GROUP BY departamento HAVING COUNT(*) > 2;', hints: ['El filtro sobre el conteo va en HAVING.', 'HAVING COUNT(*) > 2.'] },
      { prompt: 'Encuentra los clientes (cliente_id) con 20 o más pedidos. Columnas: cliente_id, pedidos. Ordena por pedidos descendente.', starter: 'SELECT cliente_id, COUNT(*) AS pedidos\nFROM pedidos\n', solution: 'SELECT cliente_id, COUNT(*) AS pedidos FROM pedidos GROUP BY cliente_id HAVING COUNT(*) >= 20 ORDER BY pedidos DESC;', ordered: true, hints: ['Agrupa por cliente_id.', 'HAVING COUNT(*) >= 20 y después ORDER BY pedidos DESC.'] }
    ],
    'sql-6': [
      { prompt: 'Lista los pedidos cancelados con el nombre del vendedor. Columnas: id, fecha, vendedor. Ordena por fecha.', starter: 'SELECT p.id, p.fecha, e.nombre AS vendedor\nFROM pedidos AS p\n', solution: "SELECT p.id, p.fecha, e.nombre AS vendedor FROM pedidos AS p JOIN empleados AS e ON e.id = p.empleado_id WHERE p.estado = 'Cancelado' ORDER BY p.fecha;", ordered: true, hints: ['JOIN empleados AS e ON e.id = p.empleado_id.', "WHERE p.estado = 'Cancelado' y ORDER BY p.fecha."] },
      { prompt: 'Muestra a cada empleado con el nombre de su jefe (NULL si no tiene). Columnas: empleado, jefe. Ordena por el id del empleado.', starter: 'SELECT e.nombre AS empleado, \nFROM empleados AS e\n', solution: 'SELECT e.nombre AS empleado, j.nombre AS jefe FROM empleados AS e LEFT JOIN empleados AS j ON j.id = e.jefe_id ORDER BY e.id;', ordered: true, hints: ['Es un self join: la misma tabla dos veces con alias distintos (e y j).', 'LEFT JOIN para no perder a quien no tiene jefe.'] }
    ],
    'sql-7': [
      { prompt: 'Top 5 productos por unidades vendidas. Columnas: producto, unidades. De mayor a menor.', starter: 'SELECT pr.nombre AS producto, \nFROM detalle_pedidos AS d\nJOIN productos AS pr ON pr.id = d.producto_id\n', solution: 'SELECT pr.nombre AS producto, SUM(d.cantidad) AS unidades FROM detalle_pedidos AS d JOIN productos AS pr ON pr.id = d.producto_id GROUP BY pr.id ORDER BY unidades DESC LIMIT 5;', ordered: true, hints: ['SUM(d.cantidad) AS unidades.', 'GROUP BY pr.id, ORDER BY unidades DESC, LIMIT 5.'] },
      { prompt: 'Ingreso por ciudad del cliente considerando solo pedidos entregados. Columnas: ciudad, ingreso (redondeado a 2 decimales). Ordena por ingreso descendente.', starter: 'SELECT c.ciudad, \nFROM pedidos AS p\nJOIN clientes AS c ON c.id = p.cliente_id\nJOIN detalle_pedidos AS d ON d.pedido_id = p.id\n', solution: "SELECT c.ciudad, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS ingreso FROM pedidos AS p JOIN clientes AS c ON c.id = p.cliente_id JOIN detalle_pedidos AS d ON d.pedido_id = p.id WHERE p.estado = 'Entregado' GROUP BY c.ciudad ORDER BY ingreso DESC;", ordered: true, hints: ["Filtra WHERE p.estado = 'Entregado' antes de agrupar.", 'GROUP BY c.ciudad y ordena por el alias ingreso.'] }
    ],
    'sql-8': [
      { prompt: 'Productos más caros que el precio promedio de su propia categoría. Columnas: nombre, categoria, precio. Ordena por categoria y luego precio descendente.', starter: 'WITH prom AS (\n    SELECT categoria, AVG(precio) AS precio_prom\n    FROM productos\n    GROUP BY categoria\n)\nSELECT p.nombre, p.categoria, p.precio\nFROM productos p\n', solution: 'WITH prom AS (SELECT categoria, AVG(precio) AS precio_prom FROM productos GROUP BY categoria) SELECT p.nombre, p.categoria, p.precio FROM productos p JOIN prom ON prom.categoria = p.categoria WHERE p.precio > prom.precio_prom ORDER BY p.categoria, p.precio DESC;', ordered: true, hints: ['Une el CTE por categoría.', 'WHERE p.precio > prom.precio_prom.'] },
      { prompt: 'Nombres de los clientes que nunca han tenido un pedido cancelado (incluye a quienes no han comprado). Ordena por nombre.', starter: 'SELECT nombre\nFROM clientes\nWHERE id NOT IN (\n    \n)\nORDER BY nombre;', solution: "SELECT nombre FROM clientes WHERE id NOT IN (SELECT cliente_id FROM pedidos WHERE estado = 'Cancelado') ORDER BY nombre;", ordered: true, hints: ["La subconsulta devuelve los cliente_id con estado = 'Cancelado'.", 'NOT IN excluye esos ids.'] }
    ],
    'sql-9': [
      { prompt: 'Cuenta los pedidos por año. Columnas: anio, pedidos. Ordena por anio.', starter: "SELECT strftime('%Y', fecha) AS anio, \nFROM pedidos\n", solution: "SELECT strftime('%Y', fecha) AS anio, COUNT(*) AS pedidos FROM pedidos GROUP BY anio ORDER BY anio;", ordered: true, hints: ["strftime('%Y', fecha) extrae el año.", 'Agrupa y ordena por el alias anio.'] },
      { prompt: "Clasifica los productos en gamas ('Premium' si precio >= 3000, 'Medio' si >= 800, 'Económico' el resto) y cuenta cuántos hay por gama. Columnas: gama, productos. Ordena por gama.", starter: "SELECT CASE\n           \n       END AS gama,\n       COUNT(*) AS productos\nFROM productos\nGROUP BY gama\nORDER BY gama;", solution: "SELECT CASE WHEN precio >= 3000 THEN 'Premium' WHEN precio >= 800 THEN 'Medio' ELSE 'Económico' END AS gama, COUNT(*) AS productos FROM productos GROUP BY gama ORDER BY gama;", ordered: true, hints: ['Escribe los WHEN de mayor a menor umbral.', 'Se puede agrupar por el alias gama en SQLite.'] }
    ],
    'sql-10': [
      { prompt: 'Para cada cliente, la fecha de su pedido más reciente, usando ROW_NUMBER. Columnas: cliente_id, fecha. Ordena por cliente_id.', starter: 'WITH numerados AS (\n    SELECT cliente_id, fecha,\n           ROW_NUMBER() OVER (PARTITION BY cliente_id ORDER BY fecha DESC) AS n\n    FROM pedidos\n)\nSELECT cliente_id, fecha\nFROM numerados\n', solution: 'WITH numerados AS (SELECT cliente_id, fecha, ROW_NUMBER() OVER (PARTITION BY cliente_id ORDER BY fecha DESC) AS n FROM pedidos) SELECT cliente_id, fecha FROM numerados WHERE n = 1 ORDER BY cliente_id;', ordered: true, hints: ['Dentro de cada cliente, el pedido más reciente tiene n = 1.', 'WHERE n = 1 y ORDER BY cliente_id.'] },
      { prompt: 'Muestra nombre, departamento, salario y el salario acumulado dentro de su departamento según el orden de ingreso (alias acumulado). Ordena por departamento y fecha_ingreso.', starter: 'SELECT nombre, departamento, salario,\n       \nFROM empleados\n', solution: 'SELECT nombre, departamento, salario, SUM(salario) OVER (PARTITION BY departamento ORDER BY fecha_ingreso) AS acumulado FROM empleados ORDER BY departamento, fecha_ingreso;', ordered: true, hints: ['SUM(salario) OVER (PARTITION BY departamento ORDER BY fecha_ingreso).', 'El ORDER BY dentro de OVER es lo que convierte la suma en acumulado.'] }
    ],
    'pbi-4': [
      { prompt: 'Escribe la expresión del precio de lista promedio: el promedio de la columna Precio.', starter: '', solution: 'AVERAGE(Ventas[Precio])', hints: ['La función es AVERAGE.', 'AVERAGE(Ventas[Precio])'] },
      { prompt: 'Escribe la expresión que cuenta cuántos vendedores distintos tienen ventas.', starter: '', solution: 'DISTINCTCOUNT(Ventas[Vendedor])', hints: ['Cuenta valores únicos de una columna.', 'DISTINCTCOUNT(Ventas[Vendedor])'] }
    ],
    'pbi-5': [
      { prompt: 'Escribe la expresión del margen porcentual: (ventas - costo) / ventas, con DIVIDE y sumas.', starter: 'DIVIDE(', solution: 'DIVIDE(SUM(Ventas[Ventas]) - SUM(Ventas[Costo]), SUM(Ventas[Ventas]))', hints: ['El numerador es la resta de las dos sumas.', 'El denominador es SUM(Ventas[Ventas]).'] },
      { prompt: 'Escribe la expresión del costo por unidad vendida (costo total entre unidades totales), devolviendo 0 si no hay unidades.', starter: 'DIVIDE(', solution: 'DIVIDE(SUM(Ventas[Costo]), SUM(Ventas[Unidades]), 0)', hints: ['DIVIDE acepta un tercer argumento: el valor alternativo.', 'DIVIDE(SUM(Ventas[Costo]), SUM(Ventas[Unidades]), 0)'] }
    ],
    'pbi-6': [
      { prompt: 'Escribe una expresión que devuelva las ventas totales de la vendedora "Ana López", sin importar los filtros del usuario sobre Vendedor.', starter: 'CALCULATE(', solution: 'CALCULATE(SUM(Ventas[Ventas]), Ventas[Vendedor] = "Ana López")', hints: ['El filtro es sobre la columna Vendedor.', 'El nombre va entre comillas dobles, con acento.'] },
      { prompt: 'Cuenta las filas de ventas de 2024 en las regiones Norte y Sur (usa IN para las regiones).', starter: 'CALCULATE(COUNTROWS(Ventas), ', solution: 'CALCULATE(COUNTROWS(Ventas), Ventas[Region] IN {"Norte", "Sur"}, Ventas[Año] = 2024)', hints: ['Los filtros de CALCULATE se separan con comas y se combinan con AND.', 'Ventas[Region] IN {"Norte", "Sur"} y Ventas[Año] = 2024.'] }
    ],
    'pbi-7': [
      { prompt: 'Escribe el porcentaje sobre el total global: ventas filtradas entre las ventas sin ningún filtro (ALL sobre toda la tabla).', starter: 'DIVIDE(SUM(Ventas[Ventas]), ', solution: 'DIVIDE(SUM(Ventas[Ventas]), CALCULATE(SUM(Ventas[Ventas]), ALL(Ventas)))', hints: ['El denominador es CALCULATE(SUM(Ventas[Ventas]), ALL(Ventas)).', 'ALL(Ventas) quita todos los filtros; ALL(Ventas[Region]) solo el de región.'] },
      { prompt: 'Calcula el promedio de ventas por región: itera las regiones con VALUES y promedia la medida [Ventas Totales].', starter: 'AVERAGEX(', solution: 'AVERAGEX(VALUES(Ventas[Region]), [Ventas Totales])', hints: ['VALUES(Ventas[Region]) da una fila por región.', 'AVERAGEX evalúa [Ventas Totales] en cada región gracias a la transición de contexto.'] },
      { prompt: 'Cuenta cuántas ventas tienen un margen (Ventas - Costo) superior a 2000. Usa COUNTROWS con FILTER.', starter: 'COUNTROWS(FILTER(', solution: 'COUNTROWS(FILTER(Ventas, Ventas[Ventas] - Ventas[Costo] > 2000))', hints: ['Dentro de FILTER puedes restar columnas porque hay contexto de fila.', 'COUNTROWS(FILTER(Ventas, Ventas[Ventas] - Ventas[Costo] > 2000))'] }
    ]
  };
  for (const [id, list] of Object.entries(extra)) if (L[id]) L[id].extra = list;

  /* ============================================================ LECCIONES NUEVAS */
  T.python.lessons.push(
    {
      id: 'py-12', title: 'Clases: modelar cosas del negocio', minutes: 18, level: 'Intermedio',
      why: 'Cuando un empleado, una factura o un producto tienen datos y comportamiento juntos, un diccionario se queda corto. Una clase agrupa ambos y hace que el código se lea como el negocio que describe.',
      concept: [
        { h: 'Definir una clase', p: '__init__ se ejecuta al crear el objeto y guarda los datos en self. Los métodos son funciones que reciben self y trabajan con esos datos.', code: 'class Empleado:\n    def __init__(self, nombre, salario):\n        self.nombre = nombre\n        self.salario = salario\n\n    def salario_anual(self):\n        return self.salario * 12\n\nana = Empleado("Ana", 30000)\nprint(ana.salario_anual())   # 360000', lang: 'python' },
        { h: 'Métodos que cambian el estado', p: 'Un método puede modificar los atributos. Así la regla (por ejemplo, cómo se aplica un aumento) vive en un solo lugar.', code: 'class Empleado:\n    def __init__(self, nombre, salario):\n        self.nombre = nombre\n        self.salario = salario\n\n    def aumentar(self, porcentaje):\n        self.salario = round(self.salario * (1 + porcentaje / 100), 2)\n\nluis = Empleado("Luis", 20000)\nluis.aumentar(10)\nprint(luis.salario)   # 22000.0', lang: 'python' },
        { h: '__str__ para imprimir bonito', p: 'Define cómo se muestra el objeto al hacer print().', code: 'class Producto:\n    def __init__(self, nombre, precio):\n        self.nombre = nombre\n        self.precio = precio\n\n    def __str__(self):\n        return f"{self.nombre} (${self.precio:.2f})"\n\nprint(Producto("Mouse", 250))   # Mouse ($250.00)', lang: 'python' },
        { h: 'Listas de objetos', p: 'Se combinan con todo lo anterior: recorrer, filtrar, ordenar por un atributo.', code: 'equipo = [Empleado("Ana", 30000), Empleado("Luis", 22000)]\ntotal = sum(e.salario for e in equipo)\nmayor = max(equipo, key=lambda e: e.salario)\nprint(total, mayor.nombre)', lang: 'python' }
      ],
      example: {
        title: 'Una cuenta por cobrar con su lógica dentro',
        text: 'La factura sabe calcular su total con IVA y si está vencida según los días transcurridos. Quien la usa no necesita conocer las reglas.',
        code: 'class Factura:\n    def __init__(self, folio, subtotal, dias_credito):\n        self.folio = folio\n        self.subtotal = subtotal\n        self.dias_credito = dias_credito\n\n    def total(self):\n        return round(self.subtotal * 1.16, 2)\n\n    def estado(self, dias_transcurridos):\n        if dias_transcurridos > self.dias_credito:\n            return "Vencida"\n        return "Vigente"\n\nf = Factura("A-102", 5000, 30)\nprint(f"Factura {f.folio}: total {f.total()}")\nprint(f.estado(12))\nprint(f.estado(45))',
        output: 'Factura A-102: total 5800.0\nVigente\nVencida'
      },
      practice: {
        prompt: 'Crea la clase CuentaBancaria con __init__(self, titular, saldo), un método depositar(monto) que sume al saldo y un método retirar(monto) que reste solo si hay saldo suficiente y, si no, imprima "Fondos insuficientes". Luego ejecuta: cuenta de "Ana" con 1000, depositar 500, retirar 2000, retirar 300, e imprime "Saldo de Ana: 1200".',
        starter: 'class CuentaBancaria:\n    def __init__(self, titular, saldo):\n        pass\n\n    def depositar(self, monto):\n        pass\n\n    def retirar(self, monto):\n        pass\n\ncuenta = CuentaBancaria("Ana", 1000)\ncuenta.depositar(500)\ncuenta.retirar(2000)\ncuenta.retirar(300)\nprint(f"Saldo de {cuenta.titular}: {cuenta.saldo}")',
        expected: 'Fondos insuficientes\nSaldo de Ana: 1200',
        solution: 'class CuentaBancaria:\n    def __init__(self, titular, saldo):\n        self.titular = titular\n        self.saldo = saldo\n\n    def depositar(self, monto):\n        self.saldo += monto\n\n    def retirar(self, monto):\n        if monto > self.saldo:\n            print("Fondos insuficientes")\n        else:\n            self.saldo -= monto\n\ncuenta = CuentaBancaria("Ana", 1000)\ncuenta.depositar(500)\ncuenta.retirar(2000)\ncuenta.retirar(300)\nprint(f"Saldo de {cuenta.titular}: {cuenta.saldo}")',
        hints: ['En __init__ guarda self.titular = titular y self.saldo = saldo.', 'retirar comprueba if monto > self.saldo antes de restar.', 'El mensaje "Fondos insuficientes" se imprime una sola vez (el retiro de 2000).']
      },
      extra: [
        { prompt: 'Crea la clase Producto con nombre, precio y stock, y un método vender(cantidad) que reste del stock y devuelva el importe (cantidad * precio). Con Producto("Mouse", 250, 10): vende 3 e imprime "Importe: 750" y "Stock: 7".',
          starter: 'class Producto:\n    pass\n\nmouse = Producto("Mouse", 250, 10)\nimporte = mouse.vender(3)\nprint(f"Importe: {importe}")\nprint(f"Stock: {mouse.stock}")',
          expected: 'Importe: 750\nStock: 7',
          solution: 'class Producto:\n    def __init__(self, nombre, precio, stock):\n        self.nombre = nombre\n        self.precio = precio\n        self.stock = stock\n\n    def vender(self, cantidad):\n        self.stock -= cantidad\n        return cantidad * self.precio\n\nmouse = Producto("Mouse", 250, 10)\nimporte = mouse.vender(3)\nprint(f"Importe: {importe}")\nprint(f"Stock: {mouse.stock}")',
          hints: ['__init__(self, nombre, precio, stock) guarda los tres atributos.', 'vender resta self.stock -= cantidad y devuelve cantidad * self.precio.'] }
      ],
      quiz: [{ q: '¿Qué es self dentro de un método?', options: ['El nombre de la clase', 'El objeto concreto sobre el que se llamó el método', 'Una variable global', 'El primer argumento que pasa el usuario'], answer: 1, explain: 'self es el objeto en cuestión. Por eso self.saldo es el saldo de esa cuenta y no de otra. Python lo pasa automáticamente al llamar cuenta.retirar(300).' }]
    },
    {
      id: 'py-13', title: 'JSON y APIs: datos que vienen de internet (lectura guiada)', minutes: 14, level: 'Intermedio', reading: true,
      why: 'Tipos de cambio, clima, datos de tu propio sistema: casi todo servicio moderno entrega JSON por una API. Saber pedirlo y leerlo abre la puerta a automatizaciones que hoy haces copiando de una página web.',
      concept: [
        { h: 'JSON se parece a los diccionarios', p: 'Un texto JSON se convierte en diccionarios y listas de Python con json.loads; el camino inverso es json.dumps. Después lo recorres exactamente como ya sabes.', code: 'import json\n\ntexto = \'{"cliente": "Ana", "pedidos": [{"id": 1, "total": 500}, {"id": 2, "total": 300}]}\'\ndatos = json.loads(texto)\nprint(datos["cliente"])\nprint(sum(p["total"] for p in datos["pedidos"]))   # 800', lang: 'python', readonly: true },
        { h: 'Pedir datos a una API con requests', p: 'pip install requests. get() descarga; .json() convierte la respuesta. Revisa status_code: 200 es éxito.', code: 'import requests\n\nr = requests.get("https://api.ejemplo.com/tipo-cambio", params={"moneda": "USD"})\nif r.status_code == 200:\n    datos = r.json()\n    print(datos["valor"])\nelse:\n    print("Error", r.status_code)', lang: 'python', readonly: true },
        { h: 'Autenticación y límites', p: 'Muchas APIs piden una clave (API key) en la cabecera. Guárdala en una variable de entorno, nunca en el código. Respeta los límites de peticiones y maneja los errores de red con try/except.', code: 'import os\nheaders = {"Authorization": f"Bearer {os.environ[\'API_KEY\']}"}\ntry:\n    r = requests.get(url, headers=headers, timeout=10)\n    r.raise_for_status()\nexcept requests.RequestException as e:\n    print("Falló la petición:", e)', lang: 'python', readonly: true },
        { h: 'Guardar y compartir resultados', p: 'json.dump escribe en archivo; pandas convierte listas de diccionarios en tablas con pd.DataFrame(lista) y de ahí a Excel.', code: 'with open("respaldo.json", "w", encoding="utf-8") as f:\n    json.dump(datos, f, ensure_ascii=False, indent=2)\n\nimport pandas as pd\npd.DataFrame(datos["pedidos"]).to_excel("pedidos.xlsx", index=False)', lang: 'python', readonly: true }
      ],
      example: {
        title: 'Actualizar el tipo de cambio cada mañana',
        text: 'Un script pide el tipo de cambio a una API pública, lo guarda con la fecha en un CSV acumulado y Power BI lee ese CSV. Con el programador de tareas de Windows corre a las 7 am sin intervención.',
        code: 'import requests, csv\nfrom datetime import date\n\nr = requests.get("https://api.ejemplo.com/usd-mxn", timeout=10)\nvalor = r.json()["valor"]\nwith open("tipo_cambio.csv", "a", newline="", encoding="utf-8") as f:\n    csv.writer(f).writerow([date.today().isoformat(), valor])\nprint("Guardado", valor)',
        readonly: true
      },
      quiz: [
        { q: '¿Qué hace json.loads(texto)?', options: ['Descarga un archivo', 'Convierte texto JSON en diccionarios y listas de Python', 'Guarda un diccionario en disco', 'Valida una API key'], answer: 1, explain: 'loads = load string. Convierte el texto JSON en estructuras de Python. json.dumps hace lo contrario.' },
        { q: '¿Dónde conviene guardar una API key?', options: ['En el código, al inicio del archivo', 'En una variable de entorno o un archivo fuera del repositorio', 'En un comentario', 'En el nombre del archivo'], answer: 1, explain: 'Una clave en el código termina compartida sin querer. Las variables de entorno la mantienen fuera del código y de los repositorios.' }
      ]
    }
  );

  T.sql.lessons.push(
    {
      id: 'sql-11', title: 'Modificar datos: INSERT, UPDATE y DELETE', minutes: 16, level: 'Intermedio',
      why: 'Consultar es la mitad del trabajo. Dar de alta un cliente, corregir un precio o eliminar un registro duplicado también se hace con SQL, y hacerlo con cuidado evita desastres.',
      concept: [
        { h: 'INSERT: agregar filas', p: 'Nombra las columnas explícitamente; así la instrucción sigue funcionando si la tabla cambia.', code: "INSERT INTO clientes (nombre, ciudad, pais, segmento, fecha_alta)\nVALUES ('Nuevo Cliente SA', 'Querétaro', 'México', 'Pyme', '2024-11-01');", lang: 'sql' },
        { h: 'UPDATE: cambiar valores', p: 'Siempre con WHERE. Un UPDATE sin WHERE cambia todas las filas de la tabla.', code: "UPDATE productos\nSET precio = precio * 1.05\nWHERE categoria = 'Oficina';", lang: 'sql' },
        { h: 'DELETE: eliminar filas', p: 'También siempre con WHERE. Antes de borrar, ejecuta el mismo WHERE con un SELECT para ver qué se va a ir.', code: "SELECT * FROM pedidos WHERE estado = 'Cancelado' AND fecha < '2023-03-01';\n-- si es lo esperado:\nDELETE FROM pedidos WHERE estado = 'Cancelado' AND fecha < '2023-03-01';", lang: 'sql' },
        { h: 'Transacciones', p: 'BEGIN agrupa varias instrucciones; COMMIT las confirma y ROLLBACK las deshace. En producción, cualquier cambio masivo va dentro de una transacción.', code: 'BEGIN;\nUPDATE empleados SET salario = salario * 1.03;\n-- revisas...\nROLLBACK;   -- o COMMIT;', lang: 'sql' }
      ],
      example: {
        title: 'Alta de producto y ajuste de precio en una sola operación',
        text: 'Se agrega un producto nuevo y se corrige el precio de otro. La consulta final confirma el resultado. En este laboratorio los cambios se mantienen hasta que pulses "Restaurar base de datos".',
        code: "INSERT INTO productos (nombre, categoria, precio, costo)\nVALUES ('Hub USB-C', 'Electrónica', 450, 260);\n\nUPDATE productos SET precio = 270 WHERE nombre = 'Botella térmica';\n\nSELECT nombre, categoria, precio FROM productos WHERE nombre IN ('Hub USB-C', 'Botella térmica');"
      },
      practice: {
        type: 'sql-modify',
        prompt: "Da de alta a la empleada 'Paula Ortiz' en el departamento 'Soporte' con salario 26000, fecha de ingreso '2024-11-01' y jefe_id 1. Después sube un 10% el salario de todo el departamento Soporte. La plataforma verificará el resultado consultando la tabla.",
        starter: "INSERT INTO empleados (nombre, departamento, salario, fecha_ingreso, jefe_id)\nVALUES ();\n\nUPDATE empleados\nSET \nWHERE ;",
        solution: "INSERT INTO empleados (nombre, departamento, salario, fecha_ingreso, jefe_id) VALUES ('Paula Ortiz', 'Soporte', 26000, '2024-11-01', 1); UPDATE empleados SET salario = salario * 1.10 WHERE departamento = 'Soporte';",
        verify: "SELECT nombre, departamento, ROUND(salario, 2), fecha_ingreso, jefe_id FROM empleados WHERE departamento = 'Soporte' ORDER BY nombre;",
        hints: ['Los valores del INSERT van en el mismo orden que las columnas listadas; el texto entre comillas simples.', "UPDATE empleados SET salario = salario * 1.10 WHERE departamento = 'Soporte'.", 'Puedes ejecutar varias instrucciones separadas por punto y coma.']
      },
      quiz: [{ q: 'Ejecutas UPDATE productos SET precio = 0; sin WHERE. ¿Qué pasa?', options: ['Solo cambia el primer producto', 'Error de sintaxis', 'Todos los productos quedan con precio 0', 'Nada, falta el COMMIT'], answer: 2, explain: 'Sin WHERE, UPDATE afecta a todas las filas. Por eso se recomienda escribir primero el SELECT con el mismo WHERE y trabajar dentro de una transacción.' }]
    },
    {
      id: 'sql-12', title: 'Diseñar tablas: claves, tipos e índices (lectura guiada)', minutes: 14, level: 'Avanzado', reading: true,
      why: 'Tarde o temprano te toca crear la tabla que otros consultarán. Unas pocas decisiones (claves, tipos, relaciones) determinan si los reportes serán fáciles o una pesadilla.',
      concept: [
        { h: 'CREATE TABLE con claves', p: 'Cada tabla tiene una clave primaria (id). Las claves foráneas declaran las relaciones y evitan pedidos de clientes inexistentes.', code: 'CREATE TABLE pedidos (\n    id INTEGER PRIMARY KEY,\n    cliente_id INTEGER NOT NULL REFERENCES clientes(id),\n    fecha DATE NOT NULL,\n    estado TEXT NOT NULL DEFAULT \'Pendiente\',\n    total DECIMAL(12, 2)\n);', lang: 'sql' },
        { h: 'Elegir tipos de datos', p: 'Enteros para ids y conteos, DECIMAL para dinero (nunca FLOAT), DATE o TIMESTAMP para fechas, TEXT o VARCHAR para texto, BOOLEAN para sí/no. Un tipo correcto hace que las comparaciones y los ordenamientos funcionen.', code: '', lang: 'text' },
        { h: 'Normalizar lo justo', p: 'No repitas el nombre del cliente en cada pedido: guárdalo una vez en clientes y referencia su id. Pero tampoco separes todo en veinte tablas: la regla práctica es que cada hecho se guarde en un solo lugar.', code: '', lang: 'text' },
        { h: 'Índices para consultas rápidas', p: 'Un índice acelera filtros y JOIN sobre una columna, a cambio de escrituras un poco más lentas. Indexa las claves foráneas y las columnas por las que filtras siempre (fecha, estado).', code: 'CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);\nCREATE INDEX idx_pedidos_fecha ON pedidos(fecha);', lang: 'sql' },
        { h: 'Vistas: consultas guardadas', p: 'Una vista encapsula una consulta compleja con un nombre. Ideal para que Power BI lea una tabla ya limpia y unida.', code: 'CREATE VIEW v_ventas AS\nSELECT p.id, p.fecha, c.nombre AS cliente, pr.categoria, d.cantidad * d.precio_unitario AS importe\nFROM pedidos p\nJOIN clientes c ON c.id = p.cliente_id\nJOIN detalle_pedidos d ON d.pedido_id = p.id\nJOIN productos pr ON pr.id = d.producto_id;', lang: 'sql' }
      ],
      example: {
        title: 'De una hoja de Excel a tres tablas',
        text: 'Una hoja con columnas Cliente, Ciudad, Producto, Cantidad, Precio, Fecha se convierte en clientes (id, nombre, ciudad), productos (id, nombre, precio) y ventas (id, cliente_id, producto_id, cantidad, fecha). El precio histórico se copia a ventas para que un cambio de lista no altere las ventas pasadas. Esa es exactamente la estructura de la base que has usado en este curso.',
        code: '', readonly: true
      },
      quiz: [
        { q: '¿Qué tipo de dato conviene para montos de dinero?', options: ['FLOAT', 'DECIMAL o NUMERIC', 'TEXT', 'INTEGER siempre'], answer: 1, explain: 'FLOAT acumula errores de redondeo (0.1 + 0.2 no da 0.3). DECIMAL guarda cantidades exactas con los decimales que indiques.' },
        { q: '¿Para qué sirve una clave foránea (REFERENCES)?', options: ['Para acelerar consultas', 'Para garantizar que el valor exista en la tabla relacionada', 'Para ordenar la tabla', 'Para cifrar datos'], answer: 1, explain: 'La clave foránea impide, por ejemplo, insertar un pedido con un cliente_id que no existe. Mantiene la integridad entre tablas.' }
      ]
    }
  );

  T.powerbi.lessons.push(
    {
      id: 'pbi-10', title: 'Comparar periodos: crecimiento y variación', minutes: 16, level: 'Intermedio',
      why: '"¿Crecimos respecto al año pasado?" es la primera pregunta de cualquier dirección. Aquí la respondes con lo que ya sabes (CALCULATE sobre el año) y dejas lista la base para la inteligencia de tiempo.',
      concept: [
        { h: 'Fijar cada periodo con CALCULATE', p: 'Dos medidas, una por año. Como el filtro de Año se reemplaza, funcionan aunque el usuario tenga otro año seleccionado.', code: 'Ventas 2024 = CALCULATE([Ventas Totales], Ventas[Año] = 2024)\nVentas 2023 = CALCULATE([Ventas Totales], Ventas[Año] = 2023)', lang: 'dax' },
        { h: 'Variación absoluta y porcentual', p: 'La diferencia y la razón de las dos medidas. DIVIDE evita el error cuando el año base no tiene datos.', code: 'Variación = [Ventas 2024] - [Ventas 2023]\nCrecimiento % = DIVIDE([Ventas 2024] - [Ventas 2023], [Ventas 2023])', lang: 'dax' },
        { h: 'Periodo anterior relativo al seleccionado', p: 'Si el usuario elige un año en un segmentador, SELECTEDVALUE lo lee y restas 1 para obtener el anterior. Es el mismo patrón de SAMEPERIODLASTYEAR, pero hecho a mano.', code: 'Ventas Año Anterior =\nVAR AnioSel = SELECTEDVALUE(Ventas[Año])\nRETURN CALCULATE([Ventas Totales], Ventas[Año] = AnioSel - 1)\n\n// En este laboratorio escribe la versión sin VAR:\nCALCULATE([Ventas Totales], Ventas[Año] = SELECTEDVALUE(Ventas[Año]) - 1)', lang: 'dax' },
        { h: 'Cuándo pasar a la tabla de calendario', p: 'Este enfoque sirve para años completos. Para meses, trimestres o acumulados necesitas una tabla de calendario y las funciones de la lección 9. La lógica (fijar un periodo y comparar) es la misma.', code: '', lang: 'text' }
      ],
      example: {
        title: 'Crecimiento por región',
        text: 'En el laboratorio crea un gráfico de barras por Región con esta medida y verás qué regiones crecieron más de 2023 a 2024.',
        code: 'DIVIDE(CALCULATE(SUM(Ventas[Ventas]), Ventas[Año] = 2024) - CALCULATE(SUM(Ventas[Ventas]), Ventas[Año] = 2023), CALCULATE(SUM(Ventas[Ventas]), Ventas[Año] = 2023))'
      },
      practice: {
        prompt: 'Escribe la expresión de la variación en unidades vendidas entre 2024 y 2023 (unidades de 2024 menos unidades de 2023), usando CALCULATE sobre SUM(Ventas[Unidades]).',
        starter: 'CALCULATE(SUM(Ventas[Unidades]), Ventas[Año] = 2024) - ',
        solution: 'CALCULATE(SUM(Ventas[Unidades]), Ventas[Año] = 2024) - CALCULATE(SUM(Ventas[Unidades]), Ventas[Año] = 2023)',
        hints: ['Son dos CALCULATE idénticos salvo por el año.', 'Resta el de 2023 al de 2024.']
      },
      extra: [
        { prompt: 'Escribe el crecimiento porcentual del margen (ventas menos costo) de 2024 frente a 2023, usando DIVIDE y la medida [Margen].', starter: 'DIVIDE(', solution: 'DIVIDE(CALCULATE([Margen], Ventas[Año] = 2024) - CALCULATE([Margen], Ventas[Año] = 2023), CALCULATE([Margen], Ventas[Año] = 2023))', hints: ['Fija cada año con CALCULATE([Margen], Ventas[Año] = ...).', 'Numerador: 2024 menos 2023. Denominador: 2023.'] }
      ],
      quiz: [{ q: 'El usuario selecciona Año = 2024. ¿Qué devuelve CALCULATE([Ventas Totales], Ventas[Año] = 2023)?', options: ['Ventas de 2024', 'Ventas de 2023', 'La suma de ambos años', 'BLANK'], answer: 1, explain: 'El filtro de CALCULATE sobre la columna Año reemplaza al del segmentador. Por eso una medida "año base" siempre devuelve el mismo periodo, ideal para comparar.' }]
    },
    {
      id: 'pbi-11', title: 'Errores frecuentes de DAX y cómo depurarlos (lectura guiada)', minutes: 14, level: 'Avanzado', reading: true,
      why: 'Todo el que escribe DAX se topa con los mismos cinco problemas. Reconocerlos de inmediato te ahorra horas y te enseña a pensar en contextos, que es la verdadera habilidad.',
      concept: [
        { h: '1. "No se puede determinar un único valor para la columna"', p: 'Usaste Ventas[Ventas] directamente en una medida, sin agregación. Una medida se evalúa sobre muchas filas: envuélvela en SUM, o usa SUMX si necesitas calcular fila por fila.', code: '// Mal\nMargen = Ventas[Ventas] - Ventas[Costo]\n// Bien\nMargen = SUMX(Ventas, Ventas[Ventas] - Ventas[Costo])', lang: 'dax', readonly: true },
        { h: '2. El total de la tabla no es la suma de las filas', p: 'Es normal en razones y porcentajes: el total se recalcula con su propio contexto (todas las filas), no sumando los parciales. Si necesitas la suma de los parciales, usa SUMX sobre VALUES de la dimensión.', code: 'Total por Suma de Regiones = SUMX(VALUES(Ventas[Region]), [Margen %])', lang: 'dax', readonly: true },
        { h: '3. El filtro de CALCULATE no hace lo que esperas', p: 'Recuerda: un filtro sobre una columna reemplaza el filtro existente de esa columna. Si quieres sumar al filtro existente en lugar de reemplazarlo, usa KEEPFILTERS. Si la condición mezcla columnas, usa FILTER.', code: 'Solo Norte dentro de lo seleccionado = CALCULATE([Ventas Totales], KEEPFILTERS(Ventas[Region] = "Norte"))', lang: 'dax', readonly: true },
        { h: '4. Inteligencia de tiempo que devuelve BLANK', p: 'Casi siempre: la tabla de calendario no está marcada como tabla de fechas, no es continua, o el visual usa la fecha de los hechos en lugar de la del calendario.', code: '', lang: 'text' },
        { h: '5. Medidas lentas', p: 'Evita FILTER sobre la tabla de hechos completa cuando basta un filtro de columna; prefiere CALCULATE(..., Ventas[Region] = "Norte") a CALCULATE(..., FILTER(Ventas, Ventas[Region] = "Norte")). Usa variables (VAR) para no repetir cálculos. Reduce columnas calculadas con mucha cardinalidad.', code: 'Crecimiento % =\nVAR Actual = [Ventas Totales]\nVAR Anterior = [Ventas Año Anterior]\nRETURN DIVIDE(Actual - Anterior, Anterior)', lang: 'dax', readonly: true },
        { h: 'Cómo depurar', p: 'Pon la medida en una tabla junto a la dimensión y mira fila por fila. Divide una medida larga en medidas pequeñas y comprueba cada una. Usa el Analizador de rendimiento (Performance Analyzer) para ver qué visual es lento. DAX Studio y Tabular Editor son las herramientas externas estándar.', code: '', lang: 'text' }
      ],
      example: {
        title: 'Diagnóstico de un panel que "da números raros"',
        text: 'El Margen % total mostraba 38% mientras cada región estaba entre 40% y 45%. Causa: la medida era AVERAGE de una columna calculada de porcentaje por fila; las filas con unidades grandes pesaban igual que las pequeñas. Solución: DIVIDE de las sumas. Diez minutos de depuración, una regla aprendida para siempre.',
        code: '', readonly: true
      },
      quiz: [
        { q: 'Una medida da error al escribir Ventas[Precio] * Ventas[Unidades]. ¿Cuál es la corrección?', options: ['Convertirla en columna calculada obligatoriamente', 'SUMX(Ventas, Ventas[Precio] * Ventas[Unidades])', 'Quitar el asterisco', 'Usar ALL'], answer: 1, explain: 'La medida no tiene contexto de fila. SUMX recorre la tabla y multiplica en cada fila antes de sumar.' },
        { q: 'El total de una columna de porcentajes en una tabla no coincide con la suma de las filas. ¿Es un error?', options: ['Sí, siempre', 'No: el total se evalúa en su propio contexto; para un porcentaje es lo correcto', 'Solo si hay segmentadores', 'Sí, falta ORDER BY'], answer: 1, explain: 'Cada celda, incluido el total, evalúa la medida con su contexto. Un porcentaje del total no debe sumarse fila a fila; el total correcto es la división de las sumas.' }
      ]
    }
  );

  /* ============================================================ CHULETAS */
  const cheatsheets = {
    python: [
      { h: 'Lo básico', items: [['x = 5  # entero\np = 2.5  # decimal\ns = "texto"\nok = True', 'Variables y tipos'], ['print(f"Total: {total:.2f}")', 'f-string con 2 decimales'], ['int("12")  float("4.5")  str(7)', 'Conversiones'], ['17 // 5  # 3\n17 % 5   # 2\n2 ** 3   # 8', 'División entera, residuo, potencia']] },
      { h: 'Texto', items: [['s.strip()  s.lower()  s.upper()  s.title()', 'Limpiar y cambiar mayúsculas'], ['s.replace("a", "b")\ns.split(",")\n",".join(lista)', 'Sustituir, separar, unir'], ['s.startswith("A")  s.endswith(".csv")\n"x" in s', 'Comprobar contenido'], ['s.splitlines()', 'Separar por líneas']] },
      { h: 'Listas', items: [['lista[0]  lista[-1]  lista[1:3]', 'Acceso y rebanadas'], ['lista.append(x)  len(lista)\nsum(l)  max(l)  min(l)', 'Agregar y resumir'], ['sorted(l, key=lambda x: x[1], reverse=True)', 'Ordenar por criterio'], ['[x * 2 for x in l if x > 0]', 'Comprensión con filtro'], ['for i, x in enumerate(l, start=1):\nfor a, b in zip(l1, l2):', 'Recorrer con índice o en paralelo']] },
      { h: 'Diccionarios', items: [['d = {"a": 1}\nd["b"] = 2\nd.get("c", 0)', 'Crear, agregar, leer seguro'], ['for k, v in d.items():', 'Recorrer pares'], ['d[k] = d.get(k, 0) + v', 'Patrón contar / acumular'], ['max(d, key=d.get)', 'Clave con mayor valor']] },
      { h: 'Control y funciones', items: [['if a > b and not c:\nelif x in lista:\nelse:', 'Condiciones'], ['def f(x, tasa=0.16):\n    """Qué hace."""\n    return x * (1 + tasa)', 'Función con valor por defecto'], ['try:\n    n = int(s)\nexcept ValueError:\n    n = 0', 'Manejo de errores'], ['continue  # siguiente vuelta\nbreak     # salir del bucle', 'Control del bucle']] },
      { h: 'Archivos y pandas (en tu PC)', items: [['with open("f.csv", encoding="utf-8") as f:\n    for fila in csv.DictReader(f):', 'Leer CSV'], ['df = pd.read_csv("ventas.csv")\ndf = pd.read_excel("ventas.xlsx")', 'Cargar tabla'], ['df[df["monto"] > 1000]\ndf.groupby("region")["monto"].sum()', 'Filtrar y agrupar'], ['df.to_excel("salida.xlsx", index=False)', 'Exportar']] }
    ],
    sql: [
      { h: 'Orden de las cláusulas', items: [['SELECT ... FROM ... [JOIN ...]\nWHERE ... GROUP BY ... HAVING ...\nORDER BY ... LIMIT ...', 'Así se escribe'], ['FROM → WHERE → GROUP BY → HAVING\n→ SELECT → ORDER BY → LIMIT', 'Así se ejecuta (por eso un alias del SELECT no sirve en WHERE)']] },
      { h: 'Filtros', items: [["WHERE ciudad = 'Lima' AND precio > 100", 'Comparación y AND/OR'], ["WHERE estado IN ('A', 'B')\nWHERE precio BETWEEN 10 AND 20\nWHERE nombre LIKE 'Mar%'", 'Lista, rango, patrón'], ['WHERE correo IS NULL\nWHERE correo IS NOT NULL', 'Valores vacíos'], ["WHERE fecha >= '2024-01-01'", 'Fechas como texto ISO']] },
      { h: 'Agregar', items: [['COUNT(*)  COUNT(DISTINCT x)\nSUM(x)  AVG(x)  MIN(x)  MAX(x)', 'Funciones agregadas'], ['GROUP BY columna\nHAVING COUNT(*) > 5', 'Agrupar y filtrar grupos'], ['ROUND(AVG(precio), 2)', 'Redondear'], ['SUM(CASE WHEN estado = \'Cancelado\' THEN 1 ELSE 0 END)', 'Conteo condicional']] },
      { h: 'Unir tablas', items: [['FROM pedidos p\nJOIN clientes c ON c.id = p.cliente_id', 'INNER JOIN: solo coincidencias'], ['LEFT JOIN pedidos p ON p.cliente_id = c.id\nWHERE p.id IS NULL', 'LEFT JOIN: todos los de la izquierda; con IS NULL, los que no tienen'], ['COUNT(DISTINCT p.id)', 'Evitar duplicados por el detalle']] },
      { h: 'Avanzado', items: [['WITH t AS (SELECT ...)\nSELECT * FROM t', 'CTE'], ['WHERE precio > (SELECT AVG(precio) FROM productos)', 'Subconsulta escalar'], ['ROW_NUMBER() OVER (PARTITION BY dep ORDER BY salario DESC)', 'Ranking por grupo'], ['SUM(x) OVER (ORDER BY fecha)\nLAG(x) OVER (ORDER BY fecha)', 'Acumulado y fila anterior'], ["CASE WHEN x >= 10 THEN 'Alto' ELSE 'Bajo' END", 'Clasificar']] },
      { h: 'Fechas por motor', items: [["strftime('%Y-%m', fecha)", 'SQLite'], ['DATE_TRUNC(\'month\', fecha)\nEXTRACT(YEAR FROM fecha)', 'PostgreSQL'], ['FORMAT(fecha, \'yyyy-MM\')\nYEAR(fecha)  DATEDIFF(day, a, b)', 'SQL Server'], ['DATE_FORMAT(fecha, \'%Y-%m\')', 'MySQL']] },
      { h: 'Modificar', items: [['INSERT INTO t (a, b) VALUES (1, 2);', 'Insertar'], ['UPDATE t SET a = 1 WHERE id = 5;', 'Actualizar (siempre WHERE)'], ['DELETE FROM t WHERE id = 5;', 'Borrar (siempre WHERE)'], ['BEGIN; ... COMMIT; / ROLLBACK;', 'Transacción']] }
    ],
    powerbi: [
      { h: 'Flujo y Desktop', items: [['Obtener datos → Transformar (Power Query)\n→ Modelar (relaciones, medidas) → Visualizar → Publicar', 'Las etapas'], ['Vista informe · Vista tabla · Vista modelo', 'Las tres vistas'], ['Ctrl+S guardar · F5 actualizar visuales\nCtrl+Shift+V pegar formato', 'Atajos útiles']] },
      { h: 'Power Query', items: [['Usar primera fila como encabezado\nCambiar tipo · Quitar filas en blanco\nRecortar · Limpiar · Poner en mayúsculas cada palabra', 'Limpieza básica'], ['Anular dinamización de columnas', 'De ancho (meses en columnas) a largo'], ['Combinar consultas (merge)\nAnexar consultas (append)', 'JOIN y apilar'], ['Columna condicional · Columna personalizada\nDividir columna por delimitador', 'Transformar columnas'], ['= Table.SelectRows(Origen, each [Monto] <> null)', 'M: filtrar nulos']] },
      { h: 'Modelo', items: [['Hechos (muchas filas, números)\nDimensiones (pocas filas, descripciones)', 'Estrella'], ['Dimensión 1 → * Hechos', 'Dirección del filtro'], ['Calendario = CALENDAR(DATE(2023,1,1), DATE(2024,12,31))\nMarcar como tabla de fechas', 'Tabla de fechas'], ['Ocultar ids · Formato a medidas\nCarpetas de visualización', 'Orden y limpieza']] },
      { h: 'DAX esencial', items: [['SUM  AVERAGE  MIN  MAX\nCOUNTROWS  DISTINCTCOUNT', 'Agregaciones'], ['SUMX(Tabla, expr)  AVERAGEX  MAXX', 'Iteradores (fila a fila)'], ['CALCULATE(expr, filtro1, filtro2)', 'Cambiar el contexto de filtro'], ['ALL(Tabla)  ALL(Tabla[Col])  ALLSELECTED', 'Quitar filtros'], ['FILTER(Tabla, condición)\nVALUES(Tabla[Col])', 'Tablas filtradas / valores distintos'], ['DIVIDE(a, b, 0)  IF  SWITCH  BLANK()', 'Lógica segura'], ['VAR x = ... RETURN ...', 'Variables']] },
      { h: 'Patrones que siempre piden', items: [['% del total =\nDIVIDE([V], CALCULATE([V], ALL(Ventas[Region])))', 'Participación'], ['Ventas YTD = CALCULATE([V], DATESYTD(Calendario[Date]))', 'Acumulado del año'], ['Año anterior = CALCULATE([V], SAMEPERIODLASTYEAR(Calendario[Date]))\nCrecimiento % = DIVIDE([V] - [Año anterior], [Año anterior])', 'Comparar con el año pasado'], ['RANKX(ALL(Ventas[Region]), [V])', 'Ranking'], ['Ticket promedio = DIVIDE([V], [Num Ventas])', 'Promedio correcto']] },
      { h: 'Visuales y publicación', items: [['Comparar: barras · Tiempo: líneas\nKPI: tarjeta · Detalle: tabla/matriz', 'Elegir el visual'], ['KPI arriba a la izquierda · 6 a 8 visuales\nUn color de énfasis · Títulos con conclusión', 'Diseño de la página'], ['Publicar → Área de trabajo → Actualización programada\n(gateway si los datos son locales)', 'Service'], ['Modelado → Administrar roles → filtro DAX', 'Seguridad a nivel de fila']] }
    ]
  };
  C.tracks.forEach(t => { t.cheatsheet = cheatsheets[t.id]; });

  /* ============================================================ PLAN */
  C.plan.push({ week: 9, title: 'Profundizar', lessons: ['py-12', 'sql-11', 'pbi-10', 'py-13', 'sql-12', 'pbi-11'] });

  /* ============================================================ RETOS DIARIOS EXTRA */
  C.daily.push(
    { track: 'python', q: '¿Qué imprime print(type(round(2.5)))?', options: ["<class 'float'>", "<class 'int'>", "<class 'str'>", 'Error'], answer: 1, explain: 'round() sin decimales devuelve un entero.' },
    { track: 'sql', q: '¿Qué instrucción deshace los cambios de una transacción?', options: ['COMMIT', 'ROLLBACK', 'UNDO', 'DELETE'], answer: 1, explain: 'ROLLBACK revierte todo lo hecho desde BEGIN.' },
    { track: 'powerbi', q: 'Una medida con Ventas[Precio] * Ventas[Unidades] da error. ¿Qué falta?', options: ['Un ALL', 'Un iterador como SUMX', 'Un segmentador', 'Una relación'], answer: 1, explain: 'Sin contexto de fila, las columnas no se pueden multiplicar directamente; SUMX lo resuelve.' },
    { track: 'python', q: '¿Qué atributo recibe siempre un método de clase como primer parámetro?', options: ['this', 'cls', 'self', 'obj'], answer: 2, explain: 'self representa al objeto concreto sobre el que se llama el método.' },
    { track: 'sql', q: '¿Qué tipo conviene para guardar dinero?', options: ['FLOAT', 'DECIMAL', 'TEXT', 'REAL'], answer: 1, explain: 'DECIMAL es exacto; FLOAT y REAL acumulan errores de redondeo.' },
    { track: 'powerbi', q: '¿Qué función lee el único valor seleccionado en un segmentador?', options: ['VALUES', 'SELECTEDVALUE', 'FILTER', 'ALL'], answer: 1, explain: 'SELECTEDVALUE devuelve el valor si hay uno solo, o la alternativa que le indiques.' }
  );
})();
