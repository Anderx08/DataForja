/* DataForja — contenido de las rutas. Todo el texto es material de aprendizaje. */
window.CONTENT = (function () {

  /* ---------------------------------------------------------------- PYTHON */
  const python = {
    id: 'python',
    name: 'Python',
    short: 'Automatiza lo repetitivo',
    tagline: 'El lenguaje que convierte tareas manuales de una hora en un script de un minuto.',
    runtime: 'python',
    lessons: [
      {
        id: 'py-1',
        title: 'Tu primer script útil',
        minutes: 12,
        level: 'Inicio',
        why: 'Cada día alguien copia números a mano para armar un mensaje, un ticket o un resumen. Con tres ideas (mostrar texto, guardar valores y combinarlos) ya puedes dejar que Python lo escriba por ti.',
        concept: [
          { h: 'print() muestra cosas en pantalla', p: 'Es la forma de ver qué está pasando. Todo lo que pongas entre paréntesis se imprime.', code: 'print("Reporte diario listo")', lang: 'python' },
          { h: 'Las variables guardan valores con nombre', p: 'Un nombre a la izquierda, un signo igual y el valor a la derecha. Usa nombres que expliquen qué contienen: ventas_hoy es mejor que x.', code: 'cliente = "Lucía Prado"\nmonto = 1250.5\narticulos = 3', lang: 'python' },
          { h: 'f-strings mezclan texto y variables', p: 'Pon una f antes de las comillas y escribe las variables entre llaves. Con :.2f pides dos decimales.', code: 'print(f"Cliente: {cliente}")\nprint(f"Total: ${monto:.2f} por {articulos} artículos")', lang: 'python' }
        ],
        example: {
          title: 'Ticket de una venta en mostrador',
          text: 'Una tienda quiere imprimir el resumen de cada venta sin armarlo a mano. Observa cómo las operaciones se hacen con las variables y el texto final queda limpio.',
          code: 'producto = "Audífonos BT"\nprecio = 899.0\ncantidad = 2\n\nsubtotal = precio * cantidad\niva = subtotal * 0.16\ntotal = subtotal + iva\n\nprint("=== TICKET ===")\nprint(f"{cantidad} x {producto}")\nprint(f"Subtotal: {subtotal:.2f}")\nprint(f"IVA 16%:  {iva:.2f}")\nprint(f"TOTAL:    {total:.2f}")',
          output: '=== TICKET ===\n2 x Audífonos BT\nSubtotal: 1798.00\nIVA 16%:  287.68\nTOTAL:    2085.68'
        },
        practice: {
          prompt: 'Calcula la propina de una cuenta de restaurante. La cuenta es de 640 y la propina es del 10%. Imprime exactamente dos líneas: "Propina: 64.00" y "Total a pagar: 704.00".',
          starter: 'cuenta = 640\nporcentaje = 0.10\n\n# Calcula la propina y el total\n\n# Imprime las dos líneas\n',
          expected: 'Propina: 64.00\nTotal a pagar: 704.00',
          solution: 'cuenta = 640\nporcentaje = 0.10\n\npropina = cuenta * porcentaje\ntotal = cuenta + propina\n\nprint(f"Propina: {propina:.2f}")\nprint(f"Total a pagar: {total:.2f}")',
          hints: ['La propina es cuenta * porcentaje.', 'Para dos decimales usa {valor:.2f} dentro de la f-string.', 'Son dos print(), uno por línea.']
        },
        quiz: [{ q: '¿Qué imprime print(f"Hay {3 + 2} tareas")?', options: ['Hay {3 + 2} tareas', 'Hay 5 tareas', 'Error: no se puede sumar dentro de llaves', 'Hay 3 + 2 tareas'], answer: 1, explain: 'Dentro de las llaves de una f-string se evalúa cualquier expresión de Python antes de insertarla en el texto.' }]
      },
      {
        id: 'py-2',
        title: 'Números y texto del mundo real',
        minutes: 15,
        level: 'Inicio',
        why: 'Los datos llegan sucios: nombres en mayúsculas, espacios de más, precios como texto. Saber transformar texto y números es el 80% del trabajo diario con datos.',
        concept: [
          { h: 'Tipos básicos', p: 'int para enteros, float para decimales, str para texto y bool para verdadero/falso. type() te dice cuál tienes.', code: 'edad = 34          # int\nprecio = 19.99     # float\nnombre = "ana"     # str\nactivo = True      # bool\nprint(type(precio))', lang: 'python' },
          { h: 'Convertir entre tipos', p: 'Lo que llega de un formulario o archivo casi siempre es texto. Conviértelo antes de operar.', code: 'cantidad = int("12")\nprecio = float("45.50")\nprint(cantidad * precio)   # 546.0\nprint(str(2024) + "-01")   # "2024-01"', lang: 'python' },
          { h: 'Métodos de texto que usarás a diario', p: 'strip() quita espacios en los extremos, title() pone mayúscula inicial, replace() sustituye, split() separa en partes.', code: 'crudo = "   maría  LÓPEZ "\nlimpio = crudo.strip().title()\nprint(limpio)                      # María  López\nprint(limpio.replace("  ", " "))   # María López\nprint("2024-03-15".split("-"))     # [\'2024\', \'03\', \'15\']', lang: 'python' },
          { h: 'Redondear y operar', p: 'round(x, 2) redondea a dos decimales. // da la división entera y % el residuo: útil para repartir o detectar pares.', code: 'print(round(2 / 3, 2))   # 0.67\nprint(17 // 5)           # 3\nprint(17 % 5)            # 2', lang: 'python' }
        ],
        example: {
          title: 'Normalizar un correo y un nombre que llegan de un formulario',
          text: 'Antes de guardar un cliente en el sistema conviene estandarizar: correo en minúsculas sin espacios, nombre con mayúsculas iniciales.',
          code: 'correo_crudo = "  Juan.Perez@EMPRESA.com "\nnombre_crudo = "juan PEREZ"\n\ncorreo = correo_crudo.strip().lower()\nnombre = nombre_crudo.strip().title()\nusuario = correo.split("@")[0]\n\nprint(f"Nombre: {nombre}")\nprint(f"Correo: {correo}")\nprint(f"Usuario: {usuario}")',
          output: 'Nombre: Juan Perez\nCorreo: juan.perez@empresa.com\nUsuario: juan.perez'
        },
        practice: {
          prompt: 'Recibes el precio como texto con símbolo: "$1,250.75". Quita el símbolo y la coma, conviértelo a número, aplica un descuento del 15% e imprime "Precio final: 1063.14".',
          starter: 'precio_texto = "$1,250.75"\n\n# 1) Limpia el texto (quita "$" y ",")\n# 2) Convierte a float\n# 3) Aplica 15% de descuento\n# 4) Imprime con dos decimales\n',
          expected: 'Precio final: 1063.14',
          solution: 'precio_texto = "$1,250.75"\n\nlimpio = precio_texto.replace("$", "").replace(",", "")\nprecio = float(limpio)\nfinal = precio * 0.85\n\nprint(f"Precio final: {final:.2f}")',
          hints: ['Encadena dos replace(): uno para "$" y otro para ",".', 'float("1250.75") convierte el texto a número.', 'Un 15% de descuento equivale a multiplicar por 0.85.']
        },
        quiz: [{ q: '¿Qué devuelve "  Hola Mundo ".strip().lower()?', options: ['"  hola mundo "', '"hola mundo"', '"Hola Mundo"', 'Error'], answer: 1, explain: 'strip() quita los espacios de los extremos y lower() pasa todo a minúsculas. Los métodos se encadenan de izquierda a derecha.' }]
      },
      {
        id: 'py-3',
        title: 'Decisiones con if / elif / else',
        minutes: 14,
        level: 'Inicio',
        why: 'Clasificar gastos, aprobar descuentos, marcar facturas vencidas: casi toda regla de negocio es un "si pasa esto, haz aquello". Python lo expresa casi igual que en español.',
        concept: [
          { h: 'La estructura', p: 'if evalúa una condición. Si es verdadera ejecuta el bloque indentado (4 espacios). elif prueba otra condición y else cubre el resto.', code: 'saldo = -250\nif saldo < 0:\n    print("Cuenta en rojo")\nelif saldo == 0:\n    print("Cuenta en cero")\nelse:\n    print("Cuenta sana")', lang: 'python' },
          { h: 'Comparaciones y combinaciones', p: '== igual, != distinto, >, <, >=, <=. Combina con and, or, not. in comprueba pertenencia.', code: 'monto = 12000\ncliente_vip = True\nif monto > 10000 and cliente_vip:\n    print("Descuento 20%")\nif "urgente" in "pedido urgente #44".lower():\n    print("Atender primero")', lang: 'python' },
          { h: 'Guardar el resultado en una variable', p: 'En lugar de imprimir dentro del if, suele ser más útil decidir un valor y usarlo después.', code: 'dias_vencido = 45\nif dias_vencido > 60:\n    estado = "Cobranza"\nelif dias_vencido > 30:\n    estado = "Recordatorio"\nelse:\n    estado = "Al corriente"\nprint(estado)', lang: 'python' }
        ],
        example: {
          title: 'Clasificar un gasto para el reporte mensual',
          text: 'Finanzas quiere etiquetar cada gasto automáticamente según su monto y si tiene factura. La regla: sin factura siempre "Revisar"; con factura, mayor a 5000 "Autorización", si no "Aprobado".',
          code: 'monto = 7300\ntiene_factura = True\n\nif not tiene_factura:\n    categoria = "Revisar"\nelif monto > 5000:\n    categoria = "Autorización"\nelse:\n    categoria = "Aprobado"\n\nprint(f"Gasto de {monto}: {categoria}")',
          output: 'Gasto de 7300: Autorización'
        },
        practice: {
          prompt: 'Calcula el envío de un pedido. Si el total es 1000 o más, el envío es gratis (0). Si es menor a 1000 pero el cliente es premium, cuesta 50. En cualquier otro caso cuesta 120. Imprime "Envío: X" con el número entero. Prueba con total = 850 y premium = True.',
          starter: 'total = 850\npremium = True\n\n# Decide el costo de envío\n\nprint(f"Envío: {envio}")',
          expected: 'Envío: 50',
          solution: 'total = 850\npremium = True\n\nif total >= 1000:\n    envio = 0\nelif premium:\n    envio = 50\nelse:\n    envio = 120\n\nprint(f"Envío: {envio}")',
          hints: ['Primero comprueba la condición de envío gratis con >=.', 'elif premium: basta, porque premium ya es True o False.', 'El else cubre a los no premium con total menor a 1000.']
        },
        quiz: [{ q: 'Con x = 15, ¿qué imprime este código?\nif x > 10:\n    print("A")\nelif x > 5:\n    print("B")', options: ['A y B', 'Solo A', 'Solo B', 'Nada'], answer: 1, explain: 'En una cadena if/elif solo se ejecuta el primer bloque cuya condición sea verdadera. Al cumplirse x > 10, el elif ni se evalúa.' }]
      },
      {
        id: 'py-4',
        title: 'Listas y bucles: trabajar con muchos datos',
        minutes: 18,
        level: 'Básico',
        why: 'Nunca tienes una venta: tienes trescientas. Las listas guardan colecciones y los bucles for repiten una acción sobre cada elemento sin copiar y pegar.',
        concept: [
          { h: 'Listas', p: 'Se escriben entre corchetes. Se accede por posición empezando en 0; -1 es el último. len() da el tamaño y append() agrega al final.', code: 'ventas = [1200, 850, 2300, 400]\nprint(ventas[0])     # 1200\nprint(ventas[-1])    # 400\nventas.append(999)\nprint(len(ventas))   # 5', lang: 'python' },
          { h: 'Recorrer con for', p: 'El bucle toma cada elemento por turno. La variable del bucle (venta) cambia en cada vuelta.', code: 'ventas = [1200, 850, 2300]\ntotal = 0\nfor venta in ventas:\n    total = total + venta\nprint(total)   # 4350', lang: 'python' },
          { h: 'Funciones que ahorran bucles', p: 'sum(), max(), min() y sorted() hacen lo más común en una línea.', code: 'ventas = [1200, 850, 2300]\nprint(sum(ventas), max(ventas), min(ventas))\nprint(sorted(ventas, reverse=True))', lang: 'python' },
          { h: 'enumerate y range', p: 'enumerate da la posición junto con el valor. range(n) genera 0..n-1 para repetir n veces.', code: 'equipo = ["Ana", "Luis", "Sara"]\nfor i, nombre in enumerate(equipo, start=1):\n    print(f"{i}. {nombre}")\nfor semana in range(1, 4):\n    print("Semana", semana)', lang: 'python' }
        ],
        example: {
          title: 'Encontrar los días que superaron la meta',
          text: 'Un gerente tiene las ventas de la semana y quiere saber qué días superaron la meta de 1500 y el promedio general.',
          code: 'dias = ["Lun", "Mar", "Mié", "Jue", "Vie"]\nventas = [1320, 1810, 1495, 2240, 1760]\nmeta = 1500\n\nsobre_meta = []\nfor dia, venta in zip(dias, ventas):\n    if venta > meta:\n        sobre_meta.append(dia)\n\npromedio = sum(ventas) / len(ventas)\nprint(f"Días sobre la meta: {sobre_meta}")\nprint(f"Promedio: {promedio:.1f}")',
          output: "Días sobre la meta: ['Mar', 'Jue', 'Vie']\nPromedio: 1725.0"
        },
        practice: {
          prompt: 'Tienes las temperaturas de un almacén por hora. Cuenta cuántas lecturas superan los 8 grados (fuera de rango para refrigerados) e imprime "Alertas: N" y luego "Máxima: X" con la temperatura más alta mostrada con un decimal.',
          starter: 'temperaturas = [4.5, 5.1, 8.4, 6.0, 9.2, 7.8, 8.1, 5.5]\nlimite = 8\n\nalertas = 0\n# Recorre la lista y cuenta las que superan el límite\n\n# Imprime los dos resultados\n',
          expected: 'Alertas: 3\nMáxima: 9.2',
          solution: 'temperaturas = [4.5, 5.1, 8.4, 6.0, 9.2, 7.8, 8.1, 5.5]\nlimite = 8\n\nalertas = 0\nfor t in temperaturas:\n    if t > limite:\n        alertas += 1\n\nprint(f"Alertas: {alertas}")\nprint(f"Máxima: {max(temperaturas):.1f}")',
          hints: ['Dentro del for, un if t > limite: y suma 1 al contador.', 'alertas += 1 es lo mismo que alertas = alertas + 1.', 'max(temperaturas) te da la mayor sin recorrer nada; muéstrala con {valor:.1f}.']
        },
        quiz: [{ q: '¿Qué imprime len([10, 20, 30][1:])?', options: ['3', '2', '20', 'Error'], answer: 1, explain: '[1:] toma desde la posición 1 hasta el final: [20, 30]. Su longitud es 2.' }]
      },
      {
        id: 'py-5',
        title: 'Diccionarios: agrupar y contar',
        minutes: 18,
        level: 'Básico',
        why: 'Ventas por región, tickets por agente, gastos por categoría. Cada vez que necesitas "cuánto hay de cada cosa", la respuesta es un diccionario.',
        concept: [
          { h: 'Clave y valor', p: 'Un diccionario asocia una clave con un valor. Se accede con corchetes y la clave. get() devuelve un valor por defecto si la clave no existe.', code: 'precios = {"café": 45, "pan": 18, "leche": 27}\nprint(precios["café"])         # 45\nprint(precios.get("agua", 0))  # 0\nprecios["agua"] = 15           # agrega o actualiza', lang: 'python' },
          { h: 'Contar con get()', p: 'El patrón más usado: para cada elemento, suma 1 a su contador, empezando en 0 si es la primera vez.', code: 'tickets = ["Ana", "Luis", "Ana", "Sara", "Ana"]\nconteo = {}\nfor agente in tickets:\n    conteo[agente] = conteo.get(agente, 0) + 1\nprint(conteo)   # {\'Ana\': 3, \'Luis\': 1, \'Sara\': 1}', lang: 'python' },
          { h: 'Recorrer un diccionario', p: 'items() da pares clave-valor. keys() solo claves, values() solo valores.', code: 'for agente, n in conteo.items():\n    print(f"{agente}: {n} tickets")\nprint(sum(conteo.values()))', lang: 'python' },
          { h: 'Listas de diccionarios', p: 'Así suelen llegar los datos de un sistema: una lista donde cada registro es un diccionario.', code: 'pedidos = [\n    {"cliente": "Ana", "monto": 500},\n    {"cliente": "Luis", "monto": 300},\n]\nfor p in pedidos:\n    print(p["cliente"], p["monto"])', lang: 'python' }
        ],
        example: {
          title: 'Ventas totales por región',
          text: 'Del sistema llegan ventas individuales. Hay que sumarlas por región para el reporte semanal.',
          code: 'ventas = [\n    {"region": "Norte", "monto": 1200},\n    {"region": "Sur", "monto": 800},\n    {"region": "Norte", "monto": 650},\n    {"region": "Centro", "monto": 1500},\n    {"region": "Sur", "monto": 400},\n]\n\npor_region = {}\nfor v in ventas:\n    r = v["region"]\n    por_region[r] = por_region.get(r, 0) + v["monto"]\n\nfor region, total in por_region.items():\n    print(f"{region}: {total}")',
          output: 'Norte: 1850\nSur: 1200\nCentro: 1500'
        },
        practice: {
          prompt: 'Agrupa los gastos por categoría sumando los montos. Después imprime cada categoría con su total en el orden en que aparecen por primera vez, con el formato "Comida: 420".',
          starter: 'gastos = [\n    {"categoria": "Comida", "monto": 150},\n    {"categoria": "Transporte", "monto": 60},\n    {"categoria": "Comida", "monto": 270},\n    {"categoria": "Oficina", "monto": 900},\n    {"categoria": "Transporte", "monto": 45},\n]\n\ntotales = {}\n# Suma los montos por categoría\n\n# Imprime "Categoria: total"\n',
          expected: 'Comida: 420\nTransporte: 105\nOficina: 900',
          solution: 'gastos = [\n    {"categoria": "Comida", "monto": 150},\n    {"categoria": "Transporte", "monto": 60},\n    {"categoria": "Comida", "monto": 270},\n    {"categoria": "Oficina", "monto": 900},\n    {"categoria": "Transporte", "monto": 45},\n]\n\ntotales = {}\nfor g in gastos:\n    cat = g["categoria"]\n    totales[cat] = totales.get(cat, 0) + g["monto"]\n\nfor cat, total in totales.items():\n    print(f"{cat}: {total}")',
          hints: ['Dentro del for, saca la categoría con g["categoria"].', 'totales[cat] = totales.get(cat, 0) + g["monto"] acumula.', 'Los diccionarios conservan el orden de inserción, así que items() ya sale ordenado como lo pide el reto.']
        },
        quiz: [{ q: '¿Para qué sirve diccionario.get("clave", 0)?', options: ['Borra la clave y devuelve 0', 'Devuelve el valor de la clave, o 0 si no existe', 'Crea la clave con valor 0 siempre', 'Devuelve la posición de la clave'], answer: 1, explain: 'get() evita el error KeyError: si la clave no está, devuelve el valor por defecto que le pases, sin modificar el diccionario.' }]
      },
      {
        id: 'py-6',
        title: 'Funciones: escribe una vez, usa siempre',
        minutes: 16,
        level: 'Básico',
        why: 'Si copias el mismo cálculo en tres lugares, tendrás tres lugares que corregir cuando cambie el IVA. Una función concentra la lógica y le pone nombre.',
        concept: [
          { h: 'Definir y llamar', p: 'def nombre(parámetros): seguido del bloque. return devuelve el resultado al que la llamó.', code: 'def con_iva(monto, tasa=0.16):\n    return monto * (1 + tasa)\n\nprint(con_iva(100))        # 116.0\nprint(con_iva(100, 0.08))  # 108.0', lang: 'python' },
          { h: 'Parámetros con valor por defecto', p: 'tasa=0.16 se usa si no la especificas. Así la función sirve para el caso común y para los especiales.', code: 'def saludo(nombre, formal=False):\n    if formal:\n        return f"Estimado/a {nombre}"\n    return f"Hola {nombre}"\n\nprint(saludo("Ana"))\nprint(saludo("Ana", formal=True))', lang: 'python' },
          { h: 'Funciones que devuelven varias cosas', p: 'Puedes devolver una tupla y desempaquetarla al llamar.', code: 'def resumen(valores):\n    return sum(valores), max(valores), min(valores)\n\ntotal, mayor, menor = resumen([5, 9, 2])\nprint(total, mayor, menor)   # 16 9 2', lang: 'python' },
          { h: 'Documentar con docstrings', p: 'La primera línea de texto dentro de la función explica qué hace. Tu yo del futuro lo agradecerá.', code: 'def descuento(precio, pct):\n    """Devuelve el precio con pct% de descuento."""\n    return round(precio * (1 - pct / 100), 2)', lang: 'python' }
        ],
        example: {
          title: 'Calcular comisiones de un equipo de ventas',
          text: 'La regla de comisión es la misma para todos: 5% base, 8% si superan 20000. Una función la aplica a cada vendedor.',
          code: 'def comision(ventas):\n    """5% base; 8% si supera 20000."""\n    tasa = 0.08 if ventas > 20000 else 0.05\n    return round(ventas * tasa, 2)\n\nequipo = {"Ana": 25000, "Luis": 15000, "Sara": 20000}\nfor nombre, ventas in equipo.items():\n    print(f"{nombre}: {comision(ventas)}")',
          output: 'Ana: 2000.0\nLuis: 750.0\nSara: 1000.0'
        },
        practice: {
          prompt: 'Escribe la función precio_final(precio, cantidad) que aplique 10% de descuento si cantidad es 10 o más, y devuelva el total redondeado a 2 decimales. Luego imprime precio_final(50.0, 12) y precio_final(50.0, 3) en líneas separadas.',
          starter: 'def precio_final(precio, cantidad):\n    # Calcula el total con descuento por volumen\n    pass\n\nprint(precio_final(50.0, 12))\nprint(precio_final(50.0, 3))',
          expected: '540.0\n150.0',
          solution: 'def precio_final(precio, cantidad):\n    total = precio * cantidad\n    if cantidad >= 10:\n        total = total * 0.9\n    return round(total, 2)\n\nprint(precio_final(50.0, 12))\nprint(precio_final(50.0, 3))',
          hints: ['Primero calcula total = precio * cantidad.', 'Si cantidad >= 10, multiplica total por 0.9.', 'No olvides el return; sin él la función devuelve None.']
        },
        quiz: [{ q: '¿Qué imprime este código?\ndef f(x):\n    x * 2\nprint(f(4))', options: ['8', '4', 'None', 'Error'], answer: 2, explain: 'La función calcula x * 2 pero no lo devuelve. Sin return, toda función devuelve None.' }]
      },
      {
        id: 'py-7',
        title: 'Ordenar, filtrar y transformar en una línea',
        minutes: 16,
        level: 'Intermedio',
        why: 'Top 5 clientes, productos sin stock, nombres en mayúsculas. Las comprensiones de listas y sorted con key resuelven estos pedidos en una línea legible.',
        concept: [
          { h: 'Comprensión de listas', p: 'Construye una lista nueva a partir de otra: [expresión for elemento in lista if condición].', code: 'precios = [120, 45, 300, 80]\ncon_iva = [p * 1.16 for p in precios]\ncaros = [p for p in precios if p > 100]\nprint(caros)   # [120, 300]', lang: 'python' },
          { h: 'sorted con key', p: 'key recibe una función que dice por qué ordenar. lambda crea una función corta en el momento.', code: 'productos = [("Mouse", 250), ("Monitor", 4200), ("Cable", 90)]\npor_precio = sorted(productos, key=lambda p: p[1], reverse=True)\nprint(por_precio[0])   # (\'Monitor\', 4200)', lang: 'python' },
          { h: 'Ordenar diccionarios por valor', p: 'items() produce pares; ordena por el segundo elemento del par.', code: 'ventas = {"Ana": 2500, "Luis": 4100, "Sara": 3300}\nranking = sorted(ventas.items(), key=lambda kv: kv[1], reverse=True)\nfor nombre, monto in ranking:\n    print(nombre, monto)', lang: 'python' },
          { h: 'Rebanadas para el top N', p: 'lista[:3] son los primeros tres. Combínalo con sorted para un top.', code: 'top3 = ranking[:3]', lang: 'python' }
        ],
        example: {
          title: 'Productos con stock bajo, ordenados por urgencia',
          text: 'Inventario necesita la lista de productos con menos de 10 unidades, del más crítico al menos crítico.',
          code: 'inventario = [\n    {"producto": "Teclado", "stock": 4},\n    {"producto": "Mouse", "stock": 25},\n    {"producto": "Monitor", "stock": 2},\n    {"producto": "Cable HDMI", "stock": 9},\n]\n\nbajo = [i for i in inventario if i["stock"] < 10]\nbajo = sorted(bajo, key=lambda i: i["stock"])\n\nfor item in bajo:\n    print(f"{item[\'producto\']}: {item[\'stock\']} unidades")',
          output: 'Monitor: 2 unidades\nTeclado: 4 unidades\nCable HDMI: 9 unidades'
        },
        practice: {
          prompt: 'De la lista de clientes, obtén los 3 que más compraron, ordenados de mayor a menor, e imprime "nombre: monto" por línea.',
          starter: 'clientes = {"Ana": 1200, "Luis": 5400, "Sara": 3300, "Pedro": 800, "Marta": 4100}\n\n# Ordena por monto descendente y toma los 3 primeros\n\n# Imprime "nombre: monto"\n',
          expected: 'Luis: 5400\nMarta: 4100\nSara: 3300',
          solution: 'clientes = {"Ana": 1200, "Luis": 5400, "Sara": 3300, "Pedro": 800, "Marta": 4100}\n\ntop = sorted(clientes.items(), key=lambda kv: kv[1], reverse=True)[:3]\n\nfor nombre, monto in top:\n    print(f"{nombre}: {monto}")',
          hints: ['sorted(clientes.items(), key=lambda kv: kv[1], reverse=True).', 'Agrega [:3] al final para quedarte con tres.', 'Desempaqueta cada par en el for: for nombre, monto in top:']
        },
        quiz: [{ q: '¿Qué produce [n * 2 for n in [1, 2, 3] if n != 2]?', options: ['[2, 4, 6]', '[2, 6]', '[1, 3]', '[4]'], answer: 1, explain: 'El if filtra el 2 antes de aplicar la expresión; quedan 1 y 3, que duplicados dan [2, 6].' }]
      },
      {
        id: 'py-8',
        title: 'Errores controlados y datos que fallan',
        minutes: 14,
        level: 'Intermedio',
        why: 'Un script que procesa mil filas y se detiene en la fila 37 por un dato vacío no sirve. try/except te deja decidir qué hacer cuando algo sale mal y seguir adelante.',
        concept: [
          { h: 'try / except', p: 'Intenta el bloque; si ocurre un error del tipo indicado, ejecuta el except en lugar de detener el programa.', code: 'dato = "N/A"\ntry:\n    valor = float(dato)\nexcept ValueError:\n    valor = 0.0\n    print("Dato inválido, uso 0")\nprint(valor)', lang: 'python' },
          { h: 'Errores comunes que verás', p: 'ValueError: conversión imposible. KeyError: clave que no existe. ZeroDivisionError: dividir entre cero. IndexError: posición fuera de la lista. TypeError: mezclar tipos incompatibles.', code: 'try:\n    promedio = 100 / 0\nexcept ZeroDivisionError:\n    promedio = 0\nprint(promedio)', lang: 'python' },
          { h: 'Validar antes de operar', p: 'A veces es más claro comprobar que atrapar: if dato.strip() == "" o if "monto" in registro.', code: 'registro = {"cliente": "Ana"}\nmonto = registro.get("monto")\nif monto is None:\n    print("Falta el monto")', lang: 'python' },
          { h: 'Registrar lo que falló', p: 'En vez de ignorar en silencio, acumula los errores en una lista y repórtalos al final. Así nadie pierde datos sin saberlo.', code: 'errores = []\nfor fila in ["12", "x", "7"]:\n    try:\n        int(fila)\n    except ValueError:\n        errores.append(fila)\nprint("Filas con problema:", errores)', lang: 'python' }
        ],
        example: {
          title: 'Sumar una columna de montos que viene con basura',
          text: 'Un archivo exportado trae montos como texto, algunos vacíos y otros con letras. El script suma los válidos y reporta los inválidos sin detenerse.',
          code: 'montos = ["1200", "", "850.50", "n/d", "300"]\n\ntotal = 0.0\ninvalidos = 0\nfor m in montos:\n    try:\n        total += float(m)\n    except ValueError:\n        invalidos += 1\n\nprint(f"Total válido: {total:.2f}")\nprint(f"Registros inválidos: {invalidos}")',
          output: 'Total válido: 2350.50\nRegistros inválidos: 2'
        },
        practice: {
          prompt: 'Calcula el ticket promedio (ventas / clientes) de cada sucursal. Si una sucursal tiene 0 clientes, imprime "Sucursal X: sin clientes" en lugar de fallar. Formato normal: "Sucursal X: 250.00".',
          starter: 'sucursales = [\n    {"nombre": "Centro", "ventas": 12500, "clientes": 50},\n    {"nombre": "Norte", "ventas": 0, "clientes": 0},\n    {"nombre": "Sur", "ventas": 9800, "clientes": 35},\n]\n\nfor s in sucursales:\n    # Usa try/except ZeroDivisionError\n    pass\n',
          expected: 'Sucursal Centro: 250.00\nSucursal Norte: sin clientes\nSucursal Sur: 280.00',
          solution: 'sucursales = [\n    {"nombre": "Centro", "ventas": 12500, "clientes": 50},\n    {"nombre": "Norte", "ventas": 0, "clientes": 0},\n    {"nombre": "Sur", "ventas": 9800, "clientes": 35},\n]\n\nfor s in sucursales:\n    try:\n        ticket = s["ventas"] / s["clientes"]\n        print(f"Sucursal {s[\'nombre\']}: {ticket:.2f}")\n    except ZeroDivisionError:\n        print(f"Sucursal {s[\'nombre\']}: sin clientes")',
          hints: ['La división va dentro del try.', 'except ZeroDivisionError: imprime el mensaje alternativo.', 'Fíjate en el formato :.2f para el ticket.']
        },
        quiz: [{ q: '¿Qué tipo de error produce int("3.5")?', options: ['TypeError', 'ValueError', 'ZeroDivisionError', 'Ninguno, devuelve 3'], answer: 1, explain: 'El texto "3.5" no es un entero válido para int(), que lanza ValueError. Para convertirlo habría que hacer int(float("3.5")).' }]
      },
      {
        id: 'py-9',
        title: 'Procesar un CSV línea por línea',
        minutes: 18,
        level: 'Intermedio',
        why: 'El CSV es la moneda común de la oficina: exportaciones del ERP, descargas del banco, reportes de ventas. Saber recorrerlo y resumirlo te hace independiente de Excel.',
        concept: [
          { h: 'Qué es un CSV', p: 'Texto plano: una fila por línea y columnas separadas por comas. La primera línea suele ser el encabezado.', code: 'csv_texto = """fecha,producto,unidades,precio\n2024-03-01,Mouse,3,250\n2024-03-01,Teclado,1,900"""', lang: 'python' },
          { h: 'Separar líneas y columnas', p: 'splitlines() parte en líneas; split(",") parte cada línea en columnas. Saltamos el encabezado con [1:].', code: 'lineas = csv_texto.splitlines()\nencabezado = lineas[0].split(",")\nfor linea in lineas[1:]:\n    fecha, producto, unidades, precio = linea.split(",")\n    print(producto, int(unidades) * float(precio))', lang: 'python' },
          { h: 'Convertir cada fila en un diccionario', p: 'zip(encabezado, valores) empareja nombre de columna con valor. dict() lo convierte en diccionario: luego accedes por nombre, no por posición.', code: 'filas = []\nfor linea in lineas[1:]:\n    valores = linea.split(",")\n    filas.append(dict(zip(encabezado, valores)))\nprint(filas[0]["producto"])   # Mouse', lang: 'python' },
          { h: 'En tu computadora: el módulo csv', p: 'Con archivos reales usa csv.DictReader, que hace todo esto y respeta comas dentro de comillas. Este laboratorio no tiene archivos, pero el patrón es idéntico.', code: 'import csv\nwith open("ventas.csv", encoding="utf-8") as f:\n    for fila in csv.DictReader(f):\n        print(fila["producto"], fila["precio"])', lang: 'python', readonly: true }
        ],
        example: {
          title: 'Resumen de ventas desde un CSV exportado',
          text: 'El reporte diario del punto de venta llega como CSV. El script calcula el ingreso total y el producto más vendido en unidades.',
          code: 'csv_texto = """fecha,producto,unidades,precio\n2024-03-01,Mouse,3,250\n2024-03-01,Teclado,1,900\n2024-03-02,Mouse,5,250\n2024-03-02,Monitor,1,4200"""\n\nlineas = csv_texto.splitlines()\nencabezado = lineas[0].split(",")\n\ningreso = 0\nunidades_por_producto = {}\nfor linea in lineas[1:]:\n    fila = dict(zip(encabezado, linea.split(",")))\n    u = int(fila["unidades"])\n    ingreso += u * float(fila["precio"])\n    unidades_por_producto[fila["producto"]] = unidades_por_producto.get(fila["producto"], 0) + u\n\nmas_vendido = max(unidades_por_producto, key=unidades_por_producto.get)\nprint(f"Ingreso total: {ingreso:.2f}")\nprint(f"Más vendido: {mas_vendido} ({unidades_por_producto[mas_vendido]} u)")',
          output: 'Ingreso total: 7100.00\nMás vendido: Mouse (8 u)'
        },
        practice: {
          prompt: 'Del CSV de asistencia, cuenta cuántas veces cada empleado llegó "tarde" e imprime solo los que tienen al menos un retardo, en el formato "Nombre: N", en el orden en que aparecen.',
          starter: 'csv_texto = """fecha,empleado,estado\n2024-05-06,Ana,puntual\n2024-05-06,Luis,tarde\n2024-05-07,Ana,tarde\n2024-05-07,Luis,tarde\n2024-05-07,Sara,puntual\n2024-05-08,Ana,tarde"""\n\nlineas = csv_texto.splitlines()\nretardos = {}\n# Recorre las filas (sin encabezado), separa por coma y cuenta los "tarde"\n\n# Imprime "Nombre: N" para quienes tengan retardos\n',
          expected: 'Luis: 2\nAna: 2',
          solution: 'csv_texto = """fecha,empleado,estado\n2024-05-06,Ana,puntual\n2024-05-06,Luis,tarde\n2024-05-07,Ana,tarde\n2024-05-07,Luis,tarde\n2024-05-07,Sara,puntual\n2024-05-08,Ana,tarde"""\n\nlineas = csv_texto.splitlines()\nretardos = {}\nfor linea in lineas[1:]:\n    fecha, empleado, estado = linea.split(",")\n    if estado == "tarde":\n        retardos[empleado] = retardos.get(empleado, 0) + 1\n\nfor nombre, n in retardos.items():\n    print(f"{nombre}: {n}")',
          hints: ['for linea in lineas[1:]: salta el encabezado.', 'Desempaqueta: fecha, empleado, estado = linea.split(",").', 'Solo cuenta cuando estado == "tarde"; el primero en llegar tarde es Luis, por eso aparece primero.']
        },
        quiz: [{ q: '¿Qué hace dict(zip(["a", "b"], [1, 2]))?', options: ['[("a", 1), ("b", 2)]', '{"a": 1, "b": 2}', '{"a": "b", 1: 2}', 'Error'], answer: 1, explain: 'zip empareja elemento a elemento y dict convierte esos pares en un diccionario clave-valor.' }]
      },
      {
        id: 'py-10',
        title: 'Proyecto: reporte semanal automático',
        minutes: 25,
        level: 'Intermedio',
        why: 'Aquí juntas todo: leer datos, limpiarlos, agrupar, ordenar, manejar errores y presentar. Es exactamente el tipo de script que ahorra una tarde cada semana.',
        concept: [
          { h: 'Divide el problema en funciones', p: 'Una función lee y limpia, otra calcula, otra presenta. Cada una se prueba sola.', code: 'def leer(csv_texto):\n    ...\ndef resumir(filas):\n    ...\ndef imprimir(resumen):\n    ...', lang: 'python' },
          { h: 'Diseña la salida antes de programar', p: 'Escribe a mano cómo quieres que se vea el reporte. Luego programa para llegar ahí. Evita adornos hasta que los números cuadren.', code: '# REPORTE SEMANAL\n# Ingreso total: 12,345.00\n# Top 3 productos: ...\n# Filas con error: 2', lang: 'python' },
          { h: 'Un script real tiene un punto de entrada', p: 'En tu computadora, el bloque if __name__ == "__main__": ejecuta el reporte solo cuando corres el archivo directamente.', code: 'if __name__ == "__main__":\n    filas = leer(open("ventas.csv").read())\n    imprimir(resumir(filas))', lang: 'python', readonly: true }
        ],
        example: {
          title: 'Reporte completo con funciones',
          text: 'Observa cómo cada función hace una sola cosa y cómo los errores se reportan sin detener el proceso.',
          code: 'DATOS = """producto,unidades,precio\nMouse,3,250\nTeclado,x,900\nMonitor,1,4200\nMouse,2,250"""\n\ndef leer(texto):\n    lineas = texto.splitlines()\n    cab = lineas[0].split(",")\n    filas, errores = [], 0\n    for l in lineas[1:]:\n        fila = dict(zip(cab, l.split(",")))\n        try:\n            fila["unidades"] = int(fila["unidades"])\n            fila["precio"] = float(fila["precio"])\n            filas.append(fila)\n        except ValueError:\n            errores += 1\n    return filas, errores\n\ndef resumir(filas):\n    por_producto = {}\n    for f in filas:\n        por_producto[f["producto"]] = por_producto.get(f["producto"], 0) + f["unidades"] * f["precio"]\n    return por_producto\n\nfilas, errores = leer(DATOS)\nresumen = resumir(filas)\nprint("REPORTE SEMANAL")\nprint(f"Ingreso total: {sum(resumen.values()):.2f}")\nfor prod, total in sorted(resumen.items(), key=lambda kv: kv[1], reverse=True):\n    print(f"  {prod}: {total:.2f}")\nprint(f"Filas con error: {errores}")',
          output: 'REPORTE SEMANAL\nIngreso total: 5450.00\n  Monitor: 4200.00\n  Mouse: 1250.00\nFilas con error: 1'
        },
        practice: {
          prompt: 'Completa la función resumen_por_vendedor(csv_texto) que devuelva un diccionario con las ventas totales (unidades * precio) por vendedor, ignorando filas con datos inválidos. Luego imprime a cada vendedor de mayor a menor como "Vendedor: total.00".',
          starter: 'DATOS = """vendedor,unidades,precio\nAna,2,500\nLuis,1,1200\nAna,,500\nSara,4,300\nLuis,2,abc\nSara,1,300"""\n\ndef resumen_por_vendedor(texto):\n    lineas = texto.splitlines()\n    totales = {}\n    for l in lineas[1:]:\n        vendedor, unidades, precio = l.split(",")\n        # Convierte y acumula; salta la fila si falla la conversión\n    return totales\n\nresumen = resumen_por_vendedor(DATOS)\n# Imprime de mayor a menor: "Vendedor: total.00"\n',
          expected: 'Sara: 1500.00\nLuis: 1200.00\nAna: 1000.00',
          solution: 'DATOS = """vendedor,unidades,precio\nAna,2,500\nLuis,1,1200\nAna,,500\nSara,4,300\nLuis,2,abc\nSara,1,300"""\n\ndef resumen_por_vendedor(texto):\n    lineas = texto.splitlines()\n    totales = {}\n    for l in lineas[1:]:\n        vendedor, unidades, precio = l.split(",")\n        try:\n            venta = int(unidades) * float(precio)\n        except ValueError:\n            continue\n        totales[vendedor] = totales.get(vendedor, 0) + venta\n    return totales\n\nresumen = resumen_por_vendedor(DATOS)\nfor vendedor, total in sorted(resumen.items(), key=lambda kv: kv[1], reverse=True):\n    print(f"{vendedor}: {total:.2f}")',
          hints: ['Envuelve la conversión int(unidades) * float(precio) en try/except ValueError.', 'continue dentro del except salta a la siguiente fila.', 'sorted(resumen.items(), key=lambda kv: kv[1], reverse=True) ordena de mayor a menor.']
        },
        quiz: [{ q: 'En un bucle, ¿qué hace continue?', options: ['Termina el bucle por completo', 'Salta al siguiente elemento sin ejecutar el resto del bloque', 'Repite el elemento actual', 'Pausa el programa'], answer: 1, explain: 'continue abandona la iteración actual y pasa a la siguiente. break, en cambio, termina el bucle entero.' }]
      },
      {
        id: 'py-11',
        title: 'pandas en 15 minutos (lectura guiada)',
        minutes: 15,
        level: 'Intermedio',
        reading: true,
        why: 'Cuando los datos pasan de cientos a cientos de miles de filas, pandas hace en una línea lo que antes te tomaba un bucle. No corre en este laboratorio, pero sí en tu computadora con pip install pandas.',
        concept: [
          { h: 'Leer un archivo', p: 'Un DataFrame es una tabla en memoria. read_csv y read_excel la llenan desde un archivo. head() muestra las primeras filas.', code: 'import pandas as pd\nventas = pd.read_csv("ventas.csv")\nprint(ventas.head())\nprint(ventas.shape)   # (filas, columnas)', lang: 'python', readonly: true },
          { h: 'Filtrar y crear columnas', p: 'Las condiciones se escriben sobre columnas completas, sin bucles.', code: 'grandes = ventas[ventas["monto"] > 1000]\nventas["con_iva"] = ventas["monto"] * 1.16\nnorte_2024 = ventas[(ventas["region"] == "Norte") & (ventas["anio"] == 2024)]', lang: 'python', readonly: true },
          { h: 'Agrupar: el equivalente a tu diccionario de totales', p: 'groupby + una agregación reemplaza todo el patrón get(k, 0) + valor.', code: 'por_region = ventas.groupby("region")["monto"].sum()\nresumen = ventas.groupby("vendedor").agg(\n    total=("monto", "sum"),\n    pedidos=("monto", "count"),\n    ticket=("monto", "mean"),\n).sort_values("total", ascending=False)', lang: 'python', readonly: true },
          { h: 'Limpiar y exportar', p: 'dropna quita vacíos, fillna rellena, str.strip() limpia texto en toda la columna, to_excel escribe el resultado.', code: 'ventas["cliente"] = ventas["cliente"].str.strip().str.title()\nventas["monto"] = pd.to_numeric(ventas["monto"], errors="coerce").fillna(0)\nresumen.to_excel("reporte_semanal.xlsx")', lang: 'python', readonly: true },
          { h: 'Puente con SQL y Power BI', p: 'pandas puede leer directamente de una base de datos y Power BI puede ejecutar scripts de Python. Las tres rutas de este curso se conectan en la práctica.', code: 'import sqlite3\ncon = sqlite3.connect("empresa.db")\ndf = pd.read_sql("SELECT * FROM pedidos WHERE estado = \'Entregado\'", con)', lang: 'python', readonly: true }
        ],
        example: {
          title: 'El reporte semanal, versión pandas',
          text: 'Compara con el proyecto anterior: lo que eran 25 líneas con bucles se convierte en 5. La lógica es la misma; el vocabulario cambia.',
          code: 'import pandas as pd\nventas = pd.read_csv("ventas.csv")\nventas["unidades"] = pd.to_numeric(ventas["unidades"], errors="coerce")\nventas = ventas.dropna(subset=["unidades", "precio"])\nventas["total"] = ventas["unidades"] * ventas["precio"]\nprint(ventas.groupby("producto")["total"].sum().sort_values(ascending=False))',
          output: 'producto\nMonitor    4200.0\nMouse      1250.0\nName: total, dtype: float64',
          readonly: true
        },
        quiz: [
          { q: '¿Qué hace ventas.groupby("region")["monto"].sum()?', options: ['Suma todos los montos sin agrupar', 'Calcula la suma de monto por cada región', 'Filtra las filas de una región', 'Ordena por región'], answer: 1, explain: 'groupby parte la tabla en grupos por región y sum() agrega el monto de cada grupo: el mismo patrón que el diccionario de totales, en una línea.' },
          { q: 'Quieres convertir una columna de texto a número y que los valores inválidos queden vacíos (NaN). ¿Qué usas?', options: ['int(columna)', 'pd.to_numeric(columna, errors="coerce")', 'columna.astype(str)', 'columna.strip()'], answer: 1, explain: 'errors="coerce" convierte lo que puede y marca el resto como NaN, que luego puedes rellenar con fillna o eliminar con dropna.' }
        ]
      }
    ]
  };

  /* ------------------------------------------------------------------- SQL */
  const sql = {
    id: 'sql',
    name: 'SQL',
    short: 'Pregunta a los datos',
    tagline: 'El idioma universal de las bases de datos. Aquí practicas sobre una base real de una empresa.',
    runtime: 'sql',
    lessons: [
      {
        id: 'sql-1',
        title: 'Ver qué hay: SELECT y FROM',
        minutes: 12,
        level: 'Inicio',
        why: 'Antes de pedir un reporte a alguien, puedes mirar los datos tú mismo. SELECT es la pregunta más básica: muéstrame estas columnas de esta tabla.',
        concept: [
          { h: 'La consulta mínima', p: 'SELECT elige columnas, FROM dice de qué tabla. El asterisco significa "todas las columnas". LIMIT corta el resultado para no traer miles de filas.', code: 'SELECT * FROM clientes LIMIT 5;', lang: 'sql' },
          { h: 'Elegir columnas', p: 'Nombra solo las que necesitas, separadas por comas. El orden en que las escribes es el orden en que salen.', code: 'SELECT nombre, ciudad, segmento\nFROM clientes\nLIMIT 10;', lang: 'sql' },
          { h: 'Renombrar con AS y calcular', p: 'Puedes operar sobre columnas y darles un alias legible. El alias solo existe en el resultado.', code: 'SELECT nombre, precio, costo,\n       precio - costo AS margen\nFROM productos;', lang: 'sql' },
          { h: 'La base de datos de este curso', p: 'Trabajarás con una empresa de distribución: clientes, productos, empleados, pedidos y detalle_pedidos. Explora el esquema en el panel lateral del laboratorio.', code: '-- Tablas: clientes, productos, empleados, pedidos, detalle_pedidos\nSELECT * FROM productos;', lang: 'sql' }
        ],
        example: {
          title: 'Lista de precios con margen',
          text: 'Compras quiere ver cada producto con su margen unitario para revisar precios.',
          code: 'SELECT nombre AS producto,\n       categoria,\n       precio,\n       precio - costo AS margen\nFROM productos\nLIMIT 6;'
        },
        practice: {
          prompt: 'Muestra el nombre, el departamento y el salario de todos los empleados. Solo esas tres columnas, en ese orden.',
          starter: 'SELECT \nFROM ',
          solution: 'SELECT nombre, departamento, salario FROM empleados;',
          hints: ['La tabla se llama empleados.', 'Separa las columnas con comas: nombre, departamento, salario.', 'No hace falta LIMIT: queremos a todos.']
        },
        quiz: [{ q: '¿Qué hace LIMIT 5 al final de una consulta?', options: ['Trae solo las columnas 1 a 5', 'Devuelve como máximo 5 filas', 'Filtra valores menores a 5', 'Ordena por la quinta columna'], answer: 1, explain: 'LIMIT recorta el número de filas devueltas. Es ideal para explorar una tabla sin traer todo.' }]
      },
      {
        id: 'sql-2',
        title: 'Filtrar con WHERE',
        minutes: 15,
        level: 'Inicio',
        why: '"Los clientes de Monterrey", "los pedidos cancelados", "productos de más de 1000". Casi toda pregunta de negocio tiene una condición. WHERE la expresa.',
        concept: [
          { h: 'Condiciones simples', p: 'Comparaciones con =, <>, >, <, >=, <=. El texto va entre comillas simples y distingue mayúsculas.', code: "SELECT nombre, ciudad\nFROM clientes\nWHERE ciudad = 'Monterrey';", lang: 'sql' },
          { h: 'Combinar con AND / OR / NOT', p: 'Usa paréntesis cuando mezcles AND y OR para que la intención quede clara.', code: "SELECT nombre, precio, categoria\nFROM productos\nWHERE precio > 1000 AND (categoria = 'Electrónica' OR categoria = 'Oficina');", lang: 'sql' },
          { h: 'IN, BETWEEN y LIKE', p: 'IN compara con una lista; BETWEEN con un rango inclusivo; LIKE busca patrones donde % es "cualquier cosa".', code: "SELECT * FROM pedidos\nWHERE estado IN ('Cancelado', 'Devuelto');\n\nSELECT * FROM productos\nWHERE precio BETWEEN 200 AND 500;\n\nSELECT * FROM clientes\nWHERE nombre LIKE 'Mar%';", lang: 'sql' },
          { h: 'Valores vacíos: NULL', p: 'NULL no es cero ni texto vacío: es "sin dato". Se comprueba con IS NULL o IS NOT NULL, nunca con =.', code: 'SELECT nombre FROM empleados\nWHERE jefe_id IS NULL;   -- quienes no reportan a nadie', lang: 'sql' }
        ],
        example: {
          title: 'Pedidos problemáticos de 2024',
          text: 'Atención a clientes quiere la lista de pedidos cancelados o devueltos durante 2024 para analizar causas.',
          code: "SELECT id, cliente_id, fecha, estado\nFROM pedidos\nWHERE estado IN ('Cancelado', 'Devuelto')\n  AND fecha BETWEEN '2024-01-01' AND '2024-12-31';"
        },
        practice: {
          prompt: 'Lista nombre, categoria y precio de los productos de la categoría Hogar cuyo precio sea menor a 800.',
          starter: "SELECT nombre, categoria, precio\nFROM productos\nWHERE ",
          solution: "SELECT nombre, categoria, precio FROM productos WHERE categoria = 'Hogar' AND precio < 800;",
          hints: ["El texto va entre comillas simples: 'Hogar'.", 'Dos condiciones se unen con AND.', 'Menor a 800 es precio < 800.']
        },
        quiz: [{ q: '¿Cuál condición encuentra a los clientes sin correo registrado?', options: ["correo = NULL", "correo = ''", 'correo IS NULL', 'correo == NULL'], answer: 2, explain: 'NULL no se compara con el signo igual. La forma correcta es IS NULL. Un texto vacío es otra cosa distinta de NULL.' }]
      },
      {
        id: 'sql-3',
        title: 'Ordenar y quitar duplicados',
        minutes: 12,
        level: 'Inicio',
        why: 'Un listado sin orden no ayuda a nadie. ORDER BY pone primero lo importante; DISTINCT responde "¿qué valores distintos hay?".',
        concept: [
          { h: 'ORDER BY', p: 'Ordena por una o varias columnas. ASC es ascendente (por defecto), DESC descendente.', code: 'SELECT nombre, salario\nFROM empleados\nORDER BY salario DESC;', lang: 'sql' },
          { h: 'Varios criterios', p: 'Primero ordena por el primero; en caso de empate, por el segundo.', code: 'SELECT nombre, departamento, salario\nFROM empleados\nORDER BY departamento ASC, salario DESC;', lang: 'sql' },
          { h: 'DISTINCT', p: 'Elimina filas repetidas del resultado. Perfecto para listar categorías, ciudades, estados.', code: 'SELECT DISTINCT ciudad FROM clientes ORDER BY ciudad;', lang: 'sql' },
          { h: 'Top N', p: 'ORDER BY más LIMIT es la receta para "los 5 más caros" o "los 3 más recientes".', code: 'SELECT nombre, precio\nFROM productos\nORDER BY precio DESC\nLIMIT 5;', lang: 'sql' }
        ],
        example: {
          title: 'Los tres empleados más recientes de Ventas',
          text: 'Recursos Humanos quiere saber quiénes son los últimos en incorporarse al equipo de Ventas.',
          code: "SELECT nombre, fecha_ingreso\nFROM empleados\nWHERE departamento = 'Ventas'\nORDER BY fecha_ingreso DESC\nLIMIT 3;"
        },
        practice: {
          prompt: 'Obtén los 4 productos con mayor margen (precio - costo). Muestra nombre y el margen con alias margen, del mayor al menor.',
          starter: 'SELECT nombre, precio - costo AS margen\nFROM productos\n',
          solution: 'SELECT nombre, precio - costo AS margen FROM productos ORDER BY margen DESC LIMIT 4;',
          ordered: true,
          hints: ['Puedes ordenar por el alias: ORDER BY margen DESC.', 'LIMIT 4 al final.', 'DESC significa de mayor a menor.']
        },
        quiz: [{ q: '¿Qué devuelve SELECT DISTINCT segmento FROM clientes?', options: ['Todos los clientes con su segmento', 'Cada segmento una sola vez', 'El número de segmentos', 'Los clientes sin segmento'], answer: 1, explain: 'DISTINCT colapsa las filas repetidas, así que cada valor de segmento aparece una sola vez.' }]
      },
      {
        id: 'sql-4',
        title: 'Resumir con funciones agregadas y GROUP BY',
        minutes: 18,
        level: 'Básico',
        why: 'Los directivos no quieren filas, quieren totales: ventas por mes, clientes por ciudad, salario promedio por departamento. GROUP BY es la herramienta número uno del reporte.',
        concept: [
          { h: 'Funciones agregadas', p: 'COUNT cuenta, SUM suma, AVG promedia, MIN y MAX dan extremos. Sin GROUP BY resumen toda la tabla en una fila.', code: 'SELECT COUNT(*) AS total_pedidos,\n       MIN(fecha) AS primero,\n       MAX(fecha) AS ultimo\nFROM pedidos;', lang: 'sql' },
          { h: 'GROUP BY: un resumen por grupo', p: 'Cada valor distinto de la columna agrupada produce una fila. Toda columna del SELECT que no esté agregada debe estar en el GROUP BY.', code: 'SELECT departamento, COUNT(*) AS empleados, AVG(salario) AS salario_prom\nFROM empleados\nGROUP BY departamento;', lang: 'sql' },
          { h: 'Agrupar por varias columnas', p: 'Produce una fila por cada combinación.', code: "SELECT ciudad, segmento, COUNT(*) AS clientes\nFROM clientes\nGROUP BY ciudad, segmento\nORDER BY clientes DESC;", lang: 'sql' },
          { h: 'ROUND para presentar', p: 'Los promedios traen muchos decimales. ROUND(x, 2) los deja en dos.', code: 'SELECT categoria, ROUND(AVG(precio), 2) AS precio_promedio\nFROM productos\nGROUP BY categoria;', lang: 'sql' }
        ],
        example: {
          title: 'Pedidos por estado',
          text: 'Operaciones quiere un conteo rápido de cuántos pedidos hay en cada estado para detectar cuellos de botella.',
          code: 'SELECT estado, COUNT(*) AS pedidos\nFROM pedidos\nGROUP BY estado\nORDER BY pedidos DESC;'
        },
        practice: {
          prompt: 'Calcula cuántos productos hay por categoría y el precio máximo de cada una. Columnas: categoria, productos, precio_max. Ordena por categoria.',
          starter: 'SELECT categoria,\n       \n       \nFROM productos\n',
          solution: 'SELECT categoria, COUNT(*) AS productos, MAX(precio) AS precio_max FROM productos GROUP BY categoria ORDER BY categoria;',
          ordered: true,
          hints: ['COUNT(*) AS productos cuenta filas por grupo.', 'MAX(precio) AS precio_max.', 'No olvides GROUP BY categoria antes del ORDER BY.']
        },
        quiz: [{ q: 'Esta consulta falla: SELECT ciudad, nombre, COUNT(*) FROM clientes GROUP BY ciudad. ¿Por qué?', options: ['COUNT necesita una columna', 'nombre no está agregado ni en el GROUP BY', 'Falta ORDER BY', 'ciudad debe ir al final'], answer: 1, explain: 'Al agrupar por ciudad hay muchos nombres por grupo. SQL no sabe cuál mostrar: cada columna debe estar agregada o en el GROUP BY.' }]
      },
      {
        id: 'sql-5',
        title: 'HAVING: filtrar grupos',
        minutes: 12,
        level: 'Básico',
        why: '"Ciudades con más de 5 clientes" o "vendedores con ventas menores a la meta" son filtros sobre el resultado agrupado, no sobre las filas originales. Para eso existe HAVING.',
        concept: [
          { h: 'WHERE filtra filas, HAVING filtra grupos', p: 'WHERE actúa antes de agrupar; HAVING después, y por eso puede usar funciones agregadas.', code: 'SELECT ciudad, COUNT(*) AS clientes\nFROM clientes\nGROUP BY ciudad\nHAVING COUNT(*) >= 4;', lang: 'sql' },
          { h: 'Ambos juntos', p: 'Primero reduces las filas con WHERE, luego agrupas, luego filtras grupos con HAVING.', code: "SELECT departamento, AVG(salario) AS prom\nFROM empleados\nWHERE fecha_ingreso < '2023-01-01'\nGROUP BY departamento\nHAVING AVG(salario) > 30000;", lang: 'sql' },
          { h: 'Orden de ejecución', p: 'FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. Entenderlo explica por qué un alias del SELECT no sirve en WHERE pero sí en ORDER BY.', code: '-- FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT', lang: 'sql' }
        ],
        example: {
          title: 'Clientes que compran con frecuencia',
          text: 'Marketing quiere identificar clientes con 8 o más pedidos para un programa de lealtad.',
          code: 'SELECT cliente_id, COUNT(*) AS pedidos\nFROM pedidos\nGROUP BY cliente_id\nHAVING COUNT(*) >= 8\nORDER BY pedidos DESC;'
        },
        practice: {
          prompt: 'Encuentra las categorías cuyo precio promedio supere 1500. Muestra categoria y el promedio redondeado a 2 decimales con alias promedio.',
          starter: 'SELECT categoria, ROUND(AVG(precio), 2) AS promedio\nFROM productos\nGROUP BY categoria\n',
          solution: 'SELECT categoria, ROUND(AVG(precio), 2) AS promedio FROM productos GROUP BY categoria HAVING AVG(precio) > 1500;',
          hints: ['El filtro va después del GROUP BY.', 'HAVING AVG(precio) > 1500.', 'En HAVING repite la función agregada, no uses WHERE.']
        },
        quiz: [{ q: '¿Cuándo usas HAVING en vez de WHERE?', options: ['Siempre que haya GROUP BY', 'Cuando la condición usa una función agregada como COUNT o SUM', 'Cuando filtras texto', 'Cuando la tabla es muy grande'], answer: 1, explain: 'HAVING existe para condiciones sobre los grupos ya formados, que necesitan agregados. Si la condición es sobre filas individuales, WHERE es más eficiente.' }]
      },
      {
        id: 'sql-6',
        title: 'JOIN: unir tablas',
        minutes: 20,
        level: 'Básico',
        why: 'Los pedidos guardan un cliente_id, no el nombre del cliente. Para un reporte legible tienes que unir tablas. Dominar JOIN separa a quien consulta de quien solo mira.',
        concept: [
          { h: 'Por qué los datos están separados', p: 'Guardar el nombre del cliente en cada pedido duplicaría información y generaría inconsistencias. Cada tabla guarda lo suyo y las claves (id) las conectan.', code: '-- pedidos.cliente_id  ->  clientes.id\n-- pedidos.empleado_id ->  empleados.id', lang: 'sql' },
          { h: 'INNER JOIN', p: 'Devuelve solo las filas que tienen pareja en ambas tablas. ON indica qué columnas coinciden. Los alias de tabla (p, c) acortan la escritura.', code: 'SELECT p.id, p.fecha, c.nombre AS cliente\nFROM pedidos AS p\nINNER JOIN clientes AS c ON c.id = p.cliente_id\nLIMIT 10;', lang: 'sql' },
          { h: 'LEFT JOIN', p: 'Conserva todas las filas de la tabla izquierda aunque no tengan pareja; las columnas de la derecha quedan NULL. Sirve para encontrar "los que no tienen".', code: 'SELECT c.nombre, p.id AS pedido\nFROM clientes AS c\nLEFT JOIN pedidos AS p ON p.cliente_id = c.id\nWHERE p.id IS NULL;   -- clientes sin pedidos', lang: 'sql' },
          { h: 'Calificar columnas', p: 'Cuando dos tablas tienen una columna con el mismo nombre (id, nombre), antepón el alias para que SQL sepa cuál quieres.', code: 'SELECT e.nombre AS empleado, j.nombre AS jefe\nFROM empleados AS e\nLEFT JOIN empleados AS j ON j.id = e.jefe_id;', lang: 'sql' }
        ],
        example: {
          title: 'Pedidos con nombre de cliente y vendedor',
          text: 'El reporte de pedidos debe mostrar nombres, no identificadores. Se unen tres tablas.',
          code: 'SELECT p.id, p.fecha, c.nombre AS cliente, e.nombre AS vendedor, p.estado\nFROM pedidos AS p\nJOIN clientes AS c ON c.id = p.cliente_id\nJOIN empleados AS e ON e.id = p.empleado_id\nORDER BY p.fecha DESC\nLIMIT 8;'
        },
        practice: {
          prompt: 'Muestra el nombre de cada cliente junto con la cantidad de pedidos que tiene, incluyendo a los clientes con cero pedidos. Columnas: cliente, pedidos. Ordena de más a menos pedidos y luego por nombre.',
          starter: 'SELECT c.nombre AS cliente, COUNT(p.id) AS pedidos\nFROM clientes AS c\n\nGROUP BY c.id\n',
          solution: 'SELECT c.nombre AS cliente, COUNT(p.id) AS pedidos FROM clientes AS c LEFT JOIN pedidos AS p ON p.cliente_id = c.id GROUP BY c.id ORDER BY pedidos DESC, cliente;',
          ordered: true,
          hints: ['Necesitas LEFT JOIN pedidos AS p ON p.cliente_id = c.id para no perder a quienes no compran.', 'COUNT(p.id) cuenta 0 cuando no hay pedidos; COUNT(*) contaría 1.', 'ORDER BY pedidos DESC, cliente.']
        },
        quiz: [{ q: 'Quieres listar todos los productos y, si los hay, sus ventas. Algunos productos nunca se vendieron y deben aparecer. ¿Qué JOIN usas?', options: ['INNER JOIN', 'LEFT JOIN desde productos', 'CROSS JOIN', 'No se puede'], answer: 1, explain: 'LEFT JOIN conserva todas las filas de la tabla izquierda (productos) aunque no tengan coincidencia en el detalle de ventas.' }]
      },
      {
        id: 'sql-7',
        title: 'Reportes completos: JOIN + GROUP BY',
        minutes: 18,
        level: 'Intermedio',
        why: '"Ventas totales por cliente", "ingresos por categoría", "ranking de vendedores": todos combinan unir tablas y resumir. Es la consulta que más vas a escribir en tu vida profesional.',
        concept: [
          { h: 'El importe vive en el detalle', p: 'Un pedido tiene varias líneas en detalle_pedidos. El importe de cada línea es cantidad * precio_unitario.', code: 'SELECT pedido_id, SUM(cantidad * precio_unitario) AS importe\nFROM detalle_pedidos\nGROUP BY pedido_id\nLIMIT 5;', lang: 'sql' },
          { h: 'Unir y agrupar a la vez', p: 'Haz los JOIN para traer el nombre y agrupa por él. Agrupa por el id para no mezclar homónimos.', code: 'SELECT c.nombre AS cliente, SUM(d.cantidad * d.precio_unitario) AS total\nFROM pedidos AS p\nJOIN clientes AS c ON c.id = p.cliente_id\nJOIN detalle_pedidos AS d ON d.pedido_id = p.id\nGROUP BY c.id\nORDER BY total DESC\nLIMIT 10;', lang: 'sql' },
          { h: 'Cuidado con los duplicados', p: 'Si unes pedidos con detalle, cada pedido se repite tantas veces como líneas tenga. COUNT(*) contaría líneas, no pedidos: usa COUNT(DISTINCT p.id).', code: 'SELECT c.nombre, COUNT(DISTINCT p.id) AS pedidos, SUM(d.cantidad * d.precio_unitario) AS total\nFROM pedidos p\nJOIN clientes c ON c.id = p.cliente_id\nJOIN detalle_pedidos d ON d.pedido_id = p.id\nGROUP BY c.id;', lang: 'sql' }
        ],
        example: {
          title: 'Ingresos por categoría de producto',
          text: 'Dirección quiere saber qué categoría genera más ingreso considerando solo pedidos entregados.',
          code: "SELECT pr.categoria, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS ingreso\nFROM detalle_pedidos AS d\nJOIN productos AS pr ON pr.id = d.producto_id\nJOIN pedidos AS p ON p.id = d.pedido_id\nWHERE p.estado = 'Entregado'\nGROUP BY pr.categoria\nORDER BY ingreso DESC;"
        },
        practice: {
          prompt: 'Ranking de vendedores: nombre del empleado (alias vendedor), número de pedidos distintos (alias pedidos) y total vendido (alias total, suma de cantidad * precio_unitario). Ordena por total descendente.',
          starter: 'SELECT e.nombre AS vendedor,\n       \n       \nFROM pedidos AS p\nJOIN empleados AS e ON e.id = p.empleado_id\n\nGROUP BY e.id\n',
          solution: 'SELECT e.nombre AS vendedor, COUNT(DISTINCT p.id) AS pedidos, SUM(d.cantidad * d.precio_unitario) AS total FROM pedidos AS p JOIN empleados AS e ON e.id = p.empleado_id JOIN detalle_pedidos AS d ON d.pedido_id = p.id GROUP BY e.id ORDER BY total DESC;',
          ordered: true,
          hints: ['Falta unir detalle_pedidos: JOIN detalle_pedidos AS d ON d.pedido_id = p.id.', 'COUNT(DISTINCT p.id) AS pedidos evita contar líneas repetidas.', 'SUM(d.cantidad * d.precio_unitario) AS total y ORDER BY total DESC.']
        },
        quiz: [{ q: 'Unes pedidos con detalle_pedidos y haces COUNT(*). El número sale mucho mayor que el total de pedidos. ¿Por qué?', options: ['La base está corrupta', 'Cada pedido aparece una vez por cada línea de detalle', 'COUNT(*) ignora NULL', 'Falta ORDER BY'], answer: 1, explain: 'Al unir con una tabla de muchas filas por pedido, cada pedido se multiplica. COUNT(DISTINCT p.id) cuenta pedidos únicos.' }]
      },
      {
        id: 'sql-8',
        title: 'Subconsultas y CTE (WITH)',
        minutes: 18,
        level: 'Intermedio',
        why: 'Algunas preguntas tienen dos pasos: "productos cuyo precio supera el promedio" o "clientes cuyo total está sobre la mediana". Las subconsultas y los CTE te dejan resolver un paso y usarlo en el siguiente.',
        concept: [
          { h: 'Subconsulta escalar', p: 'Una consulta entre paréntesis que devuelve un solo valor se puede usar como si fuera un número.', code: 'SELECT nombre, precio\nFROM productos\nWHERE precio > (SELECT AVG(precio) FROM productos);', lang: 'sql' },
          { h: 'Subconsulta con IN', p: 'Si devuelve una lista, úsala con IN.', code: "SELECT nombre FROM clientes\nWHERE id IN (SELECT cliente_id FROM pedidos WHERE estado = 'Devuelto');", lang: 'sql' },
          { h: 'CTE: consultas con nombre', p: 'WITH nombre AS (...) define una tabla temporal legible que puedes usar abajo. Es la forma más clara de encadenar pasos.', code: 'WITH totales AS (\n    SELECT pedido_id, SUM(cantidad * precio_unitario) AS importe\n    FROM detalle_pedidos\n    GROUP BY pedido_id\n)\nSELECT p.id, p.fecha, t.importe\nFROM pedidos p\nJOIN totales t ON t.pedido_id = p.id\nORDER BY t.importe DESC\nLIMIT 5;', lang: 'sql' },
          { h: 'Varios CTE encadenados', p: 'Sepáralos con comas. Cada uno puede usar los anteriores.', code: 'WITH a AS (...),\n     b AS (SELECT ... FROM a)\nSELECT * FROM b;', lang: 'sql' }
        ],
        example: {
          title: 'Clientes que gastan por encima del promedio',
          text: 'Primero calculamos el total por cliente; después comparamos cada uno contra el promedio de esos totales.',
          code: 'WITH gasto AS (\n    SELECT p.cliente_id, SUM(d.cantidad * d.precio_unitario) AS total\n    FROM pedidos p\n    JOIN detalle_pedidos d ON d.pedido_id = p.id\n    GROUP BY p.cliente_id\n)\nSELECT c.nombre, ROUND(g.total, 2) AS total\nFROM gasto g\nJOIN clientes c ON c.id = g.cliente_id\nWHERE g.total > (SELECT AVG(total) FROM gasto)\nORDER BY total DESC;'
        },
        practice: {
          prompt: 'Lista nombre y salario de los empleados que ganan más que el salario promedio de su propio departamento. Usa una subconsulta o CTE que calcule el promedio por departamento. Ordena por salario descendente.',
          starter: 'WITH prom AS (\n    SELECT departamento, AVG(salario) AS salario_prom\n    FROM empleados\n    GROUP BY departamento\n)\nSELECT e.nombre, e.salario\nFROM empleados e\n',
          solution: 'WITH prom AS (SELECT departamento, AVG(salario) AS salario_prom FROM empleados GROUP BY departamento) SELECT e.nombre, e.salario FROM empleados e JOIN prom ON prom.departamento = e.departamento WHERE e.salario > prom.salario_prom ORDER BY e.salario DESC;',
          ordered: true,
          hints: ['Une el CTE por departamento: JOIN prom ON prom.departamento = e.departamento.', 'Filtra con WHERE e.salario > prom.salario_prom.', 'Termina con ORDER BY e.salario DESC.']
        },
        quiz: [{ q: '¿Cuál es la ventaja principal de un CTE (WITH) frente a una subconsulta anidada?', options: ['Es más rápido siempre', 'Le pone nombre a un paso intermedio y se puede reutilizar, lo que hace la consulta legible', 'Permite modificar datos', 'No necesita GROUP BY'], answer: 1, explain: 'Un CTE es una consulta con nombre. Separa la lógica en pasos que se leen de arriba hacia abajo y se pueden referenciar varias veces.' }]
      },
      {
        id: 'sql-9',
        title: 'CASE WHEN y fechas',
        minutes: 16,
        level: 'Intermedio',
        why: 'Clasificar clientes en segmentos, agrupar ventas por mes, calcular antigüedad: CASE crea categorías y las funciones de fecha extraen el periodo que te interesa.',
        concept: [
          { h: 'CASE WHEN: un if dentro de SQL', p: 'Evalúa condiciones en orden y devuelve el primer resultado que coincide. ELSE cubre el resto.', code: "SELECT nombre, precio,\n       CASE\n           WHEN precio >= 3000 THEN 'Premium'\n           WHEN precio >= 800 THEN 'Medio'\n           ELSE 'Económico'\n       END AS gama\nFROM productos;", lang: 'sql' },
          { h: 'Contar condicionalmente', p: 'SUM(CASE WHEN ... THEN 1 ELSE 0 END) cuenta solo las filas que cumplen la condición. Útil para tasas y porcentajes.', code: "SELECT COUNT(*) AS pedidos,\n       SUM(CASE WHEN estado = 'Cancelado' THEN 1 ELSE 0 END) AS cancelados\nFROM pedidos;", lang: 'sql' },
          { h: 'Fechas en SQLite: strftime', p: 'strftime(\'%Y\', fecha) extrae el año como texto; \'%m\' el mes; \'%Y-%m\' año-mes, ideal para agrupar. En otros motores se usa YEAR(), MONTH() o DATE_TRUNC.', code: "SELECT strftime('%Y-%m', fecha) AS mes, COUNT(*) AS pedidos\nFROM pedidos\nGROUP BY mes\nORDER BY mes;", lang: 'sql' },
          { h: 'Diferencias de fechas', p: 'julianday convierte a número de días; restando obtienes la diferencia.', code: "SELECT nombre, ROUND((julianday('2024-12-31') - julianday(fecha_ingreso)) / 365, 1) AS anios\nFROM empleados;", lang: 'sql' }
        ],
        example: {
          title: 'Tasa de cancelación por mes',
          text: 'Operaciones sospecha que las cancelaciones subieron en ciertos meses. Esta consulta lo muestra como porcentaje.',
          code: "SELECT strftime('%Y-%m', fecha) AS mes,\n       COUNT(*) AS pedidos,\n       SUM(CASE WHEN estado = 'Cancelado' THEN 1 ELSE 0 END) AS cancelados,\n       ROUND(100.0 * SUM(CASE WHEN estado = 'Cancelado' THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_cancelados\nFROM pedidos\nGROUP BY mes\nORDER BY mes;"
        },
        practice: {
          prompt: "Clasifica a los empleados por antigüedad al 2024-12-31: 'Veterano' si llevan 5 años o más, 'Experimentado' si 2 o más, 'Nuevo' en otro caso. Columnas: nombre, antiguedad. Ordena por nombre.",
          starter: "SELECT nombre,\n       CASE\n           \n       END AS antiguedad\nFROM empleados\nORDER BY nombre;",
          solution: "SELECT nombre, CASE WHEN (julianday('2024-12-31') - julianday(fecha_ingreso)) / 365 >= 5 THEN 'Veterano' WHEN (julianday('2024-12-31') - julianday(fecha_ingreso)) / 365 >= 2 THEN 'Experimentado' ELSE 'Nuevo' END AS antiguedad FROM empleados ORDER BY nombre;",
          ordered: true,
          hints: ["Los años son (julianday('2024-12-31') - julianday(fecha_ingreso)) / 365.", 'Pon primero la condición más exigente (>= 5), luego >= 2.', "ELSE 'Nuevo' cubre el resto."]
        },
        quiz: [{ q: "¿Qué devuelve strftime('%Y-%m', '2024-07-15')?", options: ['2024', '07', '2024-07', '15-07-2024'], answer: 2, explain: '%Y es el año de 4 dígitos y %m el mes de 2 dígitos. Es el formato ideal para agrupar por mes manteniendo el orden cronológico.' }]
      },
      {
        id: 'sql-10',
        title: 'Funciones de ventana',
        minutes: 20,
        level: 'Avanzado',
        why: 'Ranking por grupo, acumulados, comparar con la fila anterior: las funciones de ventana calculan sobre un conjunto de filas sin colapsarlas como GROUP BY. Son el salto de nivel en SQL.',
        concept: [
          { h: 'OVER define la ventana', p: 'La función se aplica sobre un conjunto de filas. PARTITION BY lo divide en grupos y ORDER BY da el orden dentro de cada grupo.', code: 'SELECT nombre, departamento, salario,\n       RANK() OVER (PARTITION BY departamento ORDER BY salario DESC) AS puesto\nFROM empleados;', lang: 'sql' },
          { h: 'ROW_NUMBER, RANK, DENSE_RANK', p: 'ROW_NUMBER numera sin empates; RANK deja huecos tras un empate; DENSE_RANK no deja huecos.', code: 'SELECT nombre, precio,\n       ROW_NUMBER() OVER (ORDER BY precio DESC) AS n\nFROM productos;', lang: 'sql' },
          { h: 'Acumulados y promedios móviles', p: 'SUM OVER con ORDER BY produce un acumulado. Compara cada valor con el total usando SUM OVER () sin orden.', code: "SELECT strftime('%Y-%m', fecha) AS mes, COUNT(*) AS pedidos,\n       SUM(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', fecha)) AS acumulado\nFROM pedidos\nGROUP BY mes;", lang: 'sql' },
          { h: 'LAG y LEAD', p: 'Traen el valor de la fila anterior o siguiente. Perfectos para variación mes a mes.', code: "WITH m AS (\n  SELECT strftime('%Y-%m', fecha) AS mes, COUNT(*) AS pedidos\n  FROM pedidos GROUP BY mes\n)\nSELECT mes, pedidos,\n       pedidos - LAG(pedidos) OVER (ORDER BY mes) AS variacion\nFROM m;", lang: 'sql' }
        ],
        example: {
          title: 'El producto más vendido de cada categoría',
          text: 'Con GROUP BY solo sabrías el máximo; con una ventana sabes cuál es el producto. Se numera dentro de cada categoría y se toma el primero.',
          code: 'WITH ventas_prod AS (\n    SELECT pr.categoria, pr.nombre, SUM(d.cantidad) AS unidades\n    FROM detalle_pedidos d\n    JOIN productos pr ON pr.id = d.producto_id\n    GROUP BY pr.id\n),\nranking AS (\n    SELECT *, ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY unidades DESC) AS n\n    FROM ventas_prod\n)\nSELECT categoria, nombre, unidades\nFROM ranking\nWHERE n = 1\nORDER BY categoria;'
        },
        practice: {
          prompt: 'Para cada empleado muestra nombre, departamento, salario y la diferencia entre su salario y el salario promedio de su departamento (alias dif_vs_prom, redondeada a 2 decimales). Usa AVG con OVER (PARTITION BY ...). Ordena por departamento y luego por salario descendente.',
          starter: 'SELECT nombre, departamento, salario,\n       \nFROM empleados\n',
          solution: 'SELECT nombre, departamento, salario, ROUND(salario - AVG(salario) OVER (PARTITION BY departamento), 2) AS dif_vs_prom FROM empleados ORDER BY departamento, salario DESC;',
          ordered: true,
          hints: ['AVG(salario) OVER (PARTITION BY departamento) da el promedio del departamento en cada fila.', 'Resta: salario - AVG(...) OVER (...), y envuelve en ROUND(..., 2).', 'ORDER BY departamento, salario DESC.']
        },
        quiz: [{ q: '¿Cuál es la diferencia clave entre GROUP BY y una función de ventana?', options: ['No hay diferencia', 'GROUP BY colapsa las filas en una por grupo; la ventana mantiene todas las filas y agrega una columna calculada', 'Las ventanas solo funcionan con fechas', 'GROUP BY es más moderno'], answer: 1, explain: 'La función de ventana calcula sobre un grupo pero conserva el detalle fila a fila. Por eso sirve para rankings, acumulados y comparaciones con el grupo.' }]
      }
    ]
  };

  /* -------------------------------------------------------------- POWER BI */
  const powerbi = {
    id: 'powerbi',
    name: 'Power BI',
    short: 'Convierte datos en decisiones',
    tagline: 'Modela, mide y visualiza. Aquí escribes DAX real y lo ves reaccionar a los filtros al instante.',
    runtime: 'dax',
    lessons: [
      {
        id: 'pbi-1',
        title: 'El flujo completo de Power BI',
        minutes: 12,
        level: 'Inicio',
        reading: true,
        why: 'Power BI no es "hacer gráficas". Es un flujo: conectar datos, limpiarlos, modelarlos, medir y publicar. Si entiendes las etapas, sabrás dónde resolver cada problema.',
        concept: [
          { h: 'Las cuatro etapas', p: '1) Obtener datos: conectas a Excel, SQL, servicios web. 2) Transformar: Power Query limpia y da forma. 3) Modelar: relaciones entre tablas y medidas DAX. 4) Visualizar y publicar: informes en Power BI Desktop, compartidos en el Servicio.', code: 'Excel / SQL / API  ->  Power Query  ->  Modelo (relaciones + DAX)  ->  Informe  ->  Power BI Service', lang: 'text' },
          { h: 'Desktop y Service', p: 'Power BI Desktop (gratis, Windows) es donde construyes. Power BI Service (la nube) es donde publicas, compartes, programas actualizaciones y creas paneles.', code: '', lang: 'text' },
          { h: 'Vistas de Desktop', p: 'Vista de informe (visuales), vista de tabla (datos), vista de modelo (relaciones). Power Query se abre con "Transformar datos" y es una ventana aparte.', code: '', lang: 'text' },
          { h: 'El error más común', p: 'Arreglar datos en el visual en lugar de en Power Query o en el modelo. Regla: limpia lo más atrás posible en el flujo. Un cálculo hecho en el lugar correcto se reutiliza en todos los visuales.', code: '', lang: 'text' }
        ],
        example: {
          title: 'Un caso típico de oficina',
          text: 'Finanzas recibe cada mes un Excel de ventas por sucursal con columnas desordenadas y fechas en texto. En Power Query se arreglan los tipos y se quitan filas vacías una sola vez; cada mes basta con "Actualizar". En el modelo se crea la medida Ventas Totales. En el informe, un gráfico por mes y un segmentador por sucursal. Se publica en el Servicio y se programa la actualización diaria a las 7 am.',
          code: '',
          readonly: true
        },
        quiz: [
          { q: 'Tienes fechas que llegan como texto "15/03/2024". ¿Dónde conviene convertirlas a tipo fecha?', options: ['En cada visual', 'En Power Query, al transformar', 'En Power BI Service', 'En una medida DAX por gráfico'], answer: 1, explain: 'Los tipos de datos se corrigen una vez en Power Query y todo el modelo se beneficia. Limpiar lo más atrás posible en el flujo evita repetir trabajo.' },
          { q: '¿Para qué sirve Power BI Service?', options: ['Para construir el modelo', 'Para publicar, compartir y programar actualizaciones', 'Para escribir DAX', 'Para abrir archivos Excel'], answer: 1, explain: 'Desktop construye; Service distribuye. En el Servicio compartes informes, creas paneles y programas la actualización de datos.' }
        ]
      },
      {
        id: 'pbi-2',
        title: 'Power Query: limpiar datos sin fórmulas',
        minutes: 18,
        level: 'Inicio',
        reading: true,
        why: 'El 60% del tiempo en un proyecto de datos se va en limpiar. Power Query graba cada paso de limpieza y lo repite automáticamente cuando llegan datos nuevos.',
        concept: [
          { h: 'Pasos aplicados', p: 'Cada clic (quitar columna, cambiar tipo, filtrar) se registra como un paso. Puedes volver atrás, reordenar o borrar pasos. El resultado se recalcula al actualizar.', code: '// Pasos típicos\n1. Origen\n2. Encabezados promovidos\n3. Tipo cambiado\n4. Filas filtradas (quitar vacías)\n5. Columnas quitadas\n6. Texto recortado y limpiado', lang: 'text' },
          { h: 'El lenguaje M detrás de los clics', p: 'Cada paso genera código M. No necesitas escribirlo, pero leerlo te ayuda a entender y corregir.', code: 'let\n    Origen = Excel.Workbook(File.Contents("C:\\\\datos\\\\ventas.xlsx"), null, true),\n    Hoja = Origen{[Item="Ventas",Kind="Sheet"]}[Data],\n    Encabezados = Table.PromoteHeaders(Hoja, [PromoteAllScalars=true]),\n    Tipos = Table.TransformColumnTypes(Encabezados, {{"Fecha", type date}, {"Monto", type number}}),\n    SinVacios = Table.SelectRows(Tipos, each [Monto] <> null),\n    Limpio = Table.TransformColumns(SinVacios, {{"Cliente", Text.Trim}, {"Cliente", Text.Proper}})\nin\n    Limpio', lang: 'm' },
          { h: 'Transformaciones que usarás cada semana', p: 'Anular dinamización (unpivot) convierte columnas de meses en filas, el formato que Power BI necesita. Combinar consultas es el JOIN de Power Query. Anexar apila tablas iguales (varios meses del mismo reporte). Columna condicional es el CASE WHEN. Dividir columna separa "Apellido, Nombre".', code: '', lang: 'text' },
          { h: 'Tipos de datos: la causa número uno de errores', p: 'Si Monto es texto, no suma. Si Fecha es texto, no se puede hacer inteligencia de tiempo. Revisa el ícono junto al nombre de cada columna: ABC es texto, 123 es entero, 1.2 decimal, el calendario es fecha.', code: '', lang: 'text' }
        ],
        example: {
          title: 'De tabla cruzada a tabla larga',
          text: 'Un reporte llega con una columna por mes (Ene, Feb, Mar...). Para Power BI necesitas tres columnas: Producto, Mes, Ventas. Seleccionas la columna Producto, clic derecho, "Anular dinamización de otras columnas". Ese único paso convierte 12 columnas en filas y funciona igual cuando lleguen 24.',
          code: '// Antes (ancho)              // Después (largo)\n// Producto | Ene | Feb        // Producto | Mes | Ventas\n// Mouse    | 120 | 140        // Mouse    | Ene | 120\n// Teclado  |  80 |  95        // Mouse    | Feb | 140\n                               // Teclado  | Ene |  80\n                               // Teclado  | Feb |  95',
          readonly: true
        },
        quiz: [
          { q: 'Recibes el mismo reporte cada mes en archivos separados y quieres una sola tabla. ¿Qué operación usas?', options: ['Combinar (merge)', 'Anexar (append)', 'Anular dinamización', 'Agrupar por'], answer: 1, explain: 'Anexar apila tablas con las mismas columnas una debajo de otra. Combinar une tablas lado a lado por una clave, como un JOIN.' },
          { q: 'Una columna Monto no se suma en los visuales. ¿Cuál es la causa más probable?', options: ['Falta una relación', 'La columna está como tipo texto', 'El visual es incorrecto', 'Power BI no suma decimales'], answer: 1, explain: 'Si el tipo es texto, Power BI no la trata como número. Cambiar el tipo en Power Query resuelve el problema de raíz.' }
        ]
      },
      {
        id: 'pbi-3',
        title: 'El modelo de datos: estrella y relaciones',
        minutes: 18,
        level: 'Básico',
        reading: true,
        diagram: 'star',
        why: 'Un buen modelo hace que las medidas sean simples y los visuales rápidos. Un mal modelo obliga a escribir DAX complicado para compensar. Aprender esto temprano ahorra meses.',
        concept: [
          { h: 'Hechos y dimensiones', p: 'La tabla de hechos guarda eventos medibles: ventas, pedidos, tickets (muchas filas, columnas numéricas). Las dimensiones describen: clientes, productos, fechas, regiones (pocas filas, columnas de texto).', code: '', lang: 'text' },
          { h: 'Esquema estrella', p: 'Los hechos en el centro y las dimensiones alrededor, cada una conectada por una clave. Se llama estrella por su forma. Es el diseño recomendado por Microsoft y el que mejor entiende DAX.', code: '', lang: 'text' },
          { h: 'Relaciones y dirección del filtro', p: 'Una relación de uno a varios va de la dimensión (uno) a los hechos (varios). El filtro fluye de la dimensión hacia los hechos: al elegir una región en un segmentador, se filtran las ventas de esa región.', code: 'DimRegion[RegionID]  1 ---> *  Ventas[RegionID]', lang: 'text' },
          { h: 'La tabla de calendario', p: 'Toda inteligencia de tiempo necesita una tabla de fechas continua, marcada como tabla de fechas, relacionada con la columna de fecha de los hechos. Se puede generar con DAX.', code: 'Calendario =\nADDCOLUMNS(\n    CALENDAR(DATE(2023,1,1), DATE(2024,12,31)),\n    "Año", YEAR([Date]),\n    "Mes", FORMAT([Date], "MMM"),\n    "MesNum", MONTH([Date]),\n    "Trimestre", "T" & FORMAT([Date], "Q")\n)', lang: 'dax', readonly: true }
        ],
        example: {
          title: 'El modelo de este curso',
          text: 'En los laboratorios de Power BI trabajas con una tabla Ventas ya relacionada con sus dimensiones (Región, Categoría, Vendedor, Año). Para que puedas concentrarte en DAX, el laboratorio la muestra como una tabla plana; en Power BI real la misma información estaría en una estrella como la del diagrama.',
          code: '',
          readonly: true
        },
        quiz: [
          { q: '¿Cuál de estas es una tabla de hechos?', options: ['Clientes', 'Productos', 'Ventas', 'Calendario'], answer: 2, explain: 'Ventas registra eventos medibles (unidades, montos) y tiene muchas filas. Las otras describen entidades: son dimensiones.' },
          { q: 'En una relación uno a varios entre DimProducto y Ventas, ¿hacia dónde fluye el filtro por defecto?', options: ['De Ventas a DimProducto', 'De DimProducto a Ventas', 'En ambas direcciones siempre', 'No fluye'], answer: 1, explain: 'El filtro va del lado "uno" (la dimensión) al lado "varios" (los hechos). Así, elegir un producto filtra sus ventas.' }
        ]
      },
      {
        id: 'pbi-4',
        title: 'DAX: tu primera medida',
        minutes: 16,
        level: 'Básico',
        why: 'Una medida es un cálculo que responde a los filtros del informe. Ventas Totales, Unidades, Pedidos: con tres funciones cubres la mayoría de los indicadores de un panel.',
        concept: [
          { h: 'Qué es una medida', p: 'Una fórmula con nombre que se calcula en el momento, según el contexto del visual. La misma medida Ventas Totales da el total general en una tarjeta y el total por región en un gráfico de barras.', code: 'Ventas Totales = SUM(Ventas[Ventas])', lang: 'dax' },
          { h: 'Agregaciones básicas', p: 'SUM suma una columna, AVERAGE promedia, MIN y MAX dan extremos, COUNTROWS cuenta filas de una tabla, DISTINCTCOUNT cuenta valores únicos.', code: 'Unidades = SUM(Ventas[Unidades])\nTicket Promedio = AVERAGE(Ventas[Ventas])\nNum Ventas = COUNTROWS(Ventas)\nProductos Vendidos = DISTINCTCOUNT(Ventas[Producto])', lang: 'dax' },
          { h: 'Sintaxis que debes respetar', p: 'Tabla[Columna] para columnas. [Medida] para medidas (sin tabla). Las funciones van en mayúsculas por convención. El texto entre comillas dobles.', code: 'Costo Total = SUM(Ventas[Costo])\nMargen = [Ventas Totales] - [Costo Total]', lang: 'dax' },
          { h: 'Prueba en el laboratorio', p: 'En el laboratorio de Power BI escribes la expresión de la medida y ves el resultado. Mueve los segmentadores de Región o Año y observa cómo cambia: eso es el contexto de filtro en acción.', code: '', lang: 'text' }
        ],
        example: {
          title: 'Las medidas base de un panel de ventas',
          text: 'Con estas cuatro medidas se construye casi cualquier tarjeta del panel. Prueba cada una en el laboratorio.',
          code: 'Ventas Totales = SUM(Ventas[Ventas])\nUnidades = SUM(Ventas[Unidades])\nNum Ventas = COUNTROWS(Ventas)\nClientes Distintos = DISTINCTCOUNT(Ventas[Vendedor])'
        },
        practice: {
          prompt: 'Escribe la expresión de una medida que calcule el costo total: la suma de la columna Costo de la tabla Ventas. Solo la expresión, sin el nombre ni el signo igual.',
          starter: 'SUM(',
          solution: 'SUM(Ventas[Costo])',
          hints: ['La sintaxis de columna es Tabla[Columna].', 'La tabla es Ventas y la columna es Costo.', 'SUM(Ventas[Costo])']
        },
        quiz: [{ q: '¿Cuál es la diferencia entre COUNTROWS(Ventas) y DISTINCTCOUNT(Ventas[Producto])?', options: ['Son iguales', 'COUNTROWS cuenta filas; DISTINCTCOUNT cuenta productos distintos', 'DISTINCTCOUNT suma unidades', 'COUNTROWS solo funciona en tablas pequeñas'], answer: 1, explain: 'COUNTROWS devuelve cuántas filas quedan tras los filtros. DISTINCTCOUNT devuelve cuántos valores diferentes hay en la columna, sin importar cuántas veces se repitan.' }]
      },
      {
        id: 'pbi-5',
        title: 'Medidas vs columnas, DIVIDE y porcentajes',
        minutes: 16,
        level: 'Básico',
        why: 'Margen %, ticket promedio, costo por unidad: los indicadores que importan son razones. Y la primera gran decisión en DAX es si algo debe ser una medida o una columna calculada.',
        concept: [
          { h: 'Columna calculada vs medida', p: 'Una columna calculada se calcula fila por fila al cargar y ocupa memoria: sirve para categorizar (ej. gama de precio). Una medida se calcula al vuelo según el filtro: sirve para agregar. Regla práctica: si vas a sumarlo o mostrarlo en una tarjeta, es medida.', code: '// Columna calculada (fila a fila)\nMargen Unitario = Ventas[Ventas] - Ventas[Costo]\n\n// Medida (según filtro)\nMargen Total = SUM(Ventas[Ventas]) - SUM(Ventas[Costo])', lang: 'dax' },
          { h: 'DIVIDE en lugar de /', p: 'Dividir entre cero rompe el visual. DIVIDE(numerador, denominador, alternativa) devuelve BLANK o la alternativa en ese caso.', code: 'Margen % = DIVIDE([Margen Total], [Ventas Totales])\nCosto por Unidad = DIVIDE(SUM(Ventas[Costo]), SUM(Ventas[Unidades]), 0)', lang: 'dax' },
          { h: 'El error clásico: promediar porcentajes', p: 'El margen % de un grupo no es el promedio de los márgenes individuales: es la división de las sumas. Por eso se calcula con medidas, no con una columna de porcentaje.', code: '// Correcto\nMargen % = DIVIDE(SUM(Ventas[Ventas]) - SUM(Ventas[Costo]), SUM(Ventas[Ventas]))\n// Incorrecto: AVERAGE de una columna de porcentaje fila a fila', lang: 'dax' },
          { h: 'Reutiliza medidas', p: 'Construye medidas a partir de otras. Si cambia la definición de Ventas Totales, todas las dependientes se actualizan.', code: 'Precio Promedio = DIVIDE([Ventas Totales], [Unidades])', lang: 'dax' }
        ],
        example: {
          title: 'Margen % que reacciona a los filtros',
          text: 'En el laboratorio, escribe esta expresión y cambia la Región: el margen cambia porque cada región tiene una mezcla distinta de productos.',
          code: 'DIVIDE(SUM(Ventas[Ventas]) - SUM(Ventas[Costo]), SUM(Ventas[Ventas]))'
        },
        practice: {
          prompt: 'Escribe la expresión del precio promedio por unidad: ventas totales divididas entre unidades totales, usando DIVIDE para evitar errores por cero.',
          starter: 'DIVIDE(',
          solution: 'DIVIDE(SUM(Ventas[Ventas]), SUM(Ventas[Unidades]))',
          hints: ['El numerador es SUM(Ventas[Ventas]).', 'El denominador es SUM(Ventas[Unidades]).', 'DIVIDE(SUM(Ventas[Ventas]), SUM(Ventas[Unidades]))']
        },
        quiz: [{ q: 'Quieres mostrar en una tarjeta el margen % total de la empresa y que cambie al filtrar por año. ¿Qué creas?', options: ['Una columna calculada con el porcentaje por fila', 'Una medida con DIVIDE de las sumas', 'Una tabla nueva', 'Un segmentador'], answer: 1, explain: 'Un indicador agregado que responde a filtros siempre es una medida. Y una razón se calcula dividiendo las sumas, no promediando porcentajes.' }]
      },
      {
        id: 'pbi-6',
        title: 'Contexto de filtro y CALCULATE',
        minutes: 20,
        level: 'Intermedio',
        why: 'CALCULATE es la función más importante de DAX. Te permite cambiar los filtros bajo los que se calcula una medida: ventas de un año fijo, de una región específica, o sin ningún filtro para calcular un porcentaje del total.',
        concept: [
          { h: 'Contexto de filtro', p: 'Es el conjunto de filtros activos cuando se evalúa una medida: segmentadores, ejes del gráfico, filas de una tabla. La misma medida da resultados distintos en cada celda porque el contexto es distinto.', code: '', lang: 'text' },
          { h: 'CALCULATE modifica el contexto', p: 'CALCULATE(expresión, filtro1, filtro2...) evalúa la expresión después de aplicar los filtros. Un filtro sobre una columna reemplaza el filtro existente de esa columna.', code: 'Ventas Norte = CALCULATE([Ventas Totales], Ventas[Region] = "Norte")\nVentas 2024 = CALCULATE([Ventas Totales], Ventas[Año] = 2024)', lang: 'dax' },
          { h: 'Varios filtros', p: 'Los filtros en CALCULATE se combinan con AND. Para OR dentro de la misma columna usa IN.', code: 'Electrónica 2024 = CALCULATE([Ventas Totales], Ventas[Categoria] = "Electrónica", Ventas[Año] = 2024)\nNorte o Sur = CALCULATE([Ventas Totales], Ventas[Region] IN {"Norte", "Sur"})', lang: 'dax' },
          { h: 'Pruébalo con los segmentadores', p: 'En el laboratorio, elige Región = Sur en el segmentador y evalúa CALCULATE([Ventas Totales], Ventas[Region] = "Norte"). El resultado es Norte: CALCULATE reemplazó el filtro del segmentador. Esa es la idea central.', code: '', lang: 'text' }
        ],
        example: {
          title: 'Comparar contra un año fijo',
          text: 'Esta medida siempre devuelve las ventas de 2023 aunque el usuario filtre 2024. Sirve como referencia para medir crecimiento.',
          code: 'CALCULATE(SUM(Ventas[Ventas]), Ventas[Año] = 2023)'
        },
        practice: {
          prompt: 'Escribe una expresión que devuelva las unidades vendidas de la categoría Hogar, sin importar qué categoría tenga seleccionado el usuario. Usa CALCULATE y SUM(Ventas[Unidades]).',
          starter: 'CALCULATE(',
          solution: 'CALCULATE(SUM(Ventas[Unidades]), Ventas[Categoria] = "Hogar")',
          hints: ['El primer argumento es la expresión: SUM(Ventas[Unidades]).', 'El segundo es el filtro: Ventas[Categoria] = "Hogar".', 'El texto va entre comillas dobles.']
        },
        quiz: [{ q: 'El usuario selecciona Región = Sur. La medida es CALCULATE([Ventas], Ventas[Region] = "Norte"). ¿Qué devuelve?', options: ['Ventas de Sur', 'Ventas de Norte', 'Ventas de Norte y Sur', 'BLANK'], answer: 1, explain: 'Un filtro de CALCULATE sobre una columna reemplaza el filtro externo sobre esa misma columna. El segmentador de Sur se sobreescribe por Norte.' }]
      },
      {
        id: 'pbi-7',
        title: 'ALL, FILTER y el porcentaje del total',
        minutes: 20,
        level: 'Intermedio',
        why: '"¿Qué porcentaje de las ventas representa cada región?" requiere comparar el valor filtrado contra el total sin filtrar. ALL quita filtros y FILTER crea condiciones complejas. Con ellas resuelves la mayoría de los cálculos "avanzados" que piden los directivos.',
        concept: [
          { h: 'ALL quita filtros', p: 'ALL(Ventas) ignora todos los filtros sobre la tabla; ALL(Ventas[Region]) solo los de esa columna. Dentro de CALCULATE produce el total general.', code: 'Ventas Totales Global = CALCULATE([Ventas Totales], ALL(Ventas))\nVentas Todas las Regiones = CALCULATE([Ventas Totales], ALL(Ventas[Region]))', lang: 'dax' },
          { h: 'Porcentaje del total', p: 'Divide la medida filtrada entre la misma medida con ALL. En un gráfico por región, cada barra muestra su participación.', code: '% del Total = DIVIDE([Ventas Totales], CALCULATE([Ventas Totales], ALL(Ventas)))', lang: 'dax' },
          { h: 'FILTER para condiciones complejas', p: 'FILTER(tabla, condición) devuelve las filas que cumplen. Se usa con iteradores como SUMX o dentro de CALCULATE cuando la condición involucra varias columnas o medidas.', code: 'Ventas Grandes = SUMX(FILTER(Ventas, Ventas[Unidades] >= 10), Ventas[Ventas])\nVentas Rentables = CALCULATE([Ventas Totales], FILTER(Ventas, Ventas[Ventas] - Ventas[Costo] > 500))', lang: 'dax' },
          { h: 'SUMX: sumar fila a fila', p: 'Cuando el cálculo necesita hacerse por fila antes de sumar (precio * cantidad, o un margen por línea), usa SUMX. Recorre la tabla y suma la expresión.', code: 'Margen por Línea = SUMX(Ventas, Ventas[Ventas] - Ventas[Costo])', lang: 'dax' }
        ],
        example: {
          title: 'Participación de cada región',
          text: 'En el laboratorio, crea un gráfico de barras por Región con esta medida. Las barras suman 100%. Al filtrar un Año, las participaciones se recalculan dentro de ese año porque ALL solo quita el filtro de Región.',
          code: 'DIVIDE(SUM(Ventas[Ventas]), CALCULATE(SUM(Ventas[Ventas]), ALL(Ventas[Region])))'
        },
        practice: {
          prompt: 'Escribe una expresión que sume las ventas (columna Ventas) únicamente de las filas con 10 o más unidades. Usa SUMX con FILTER.',
          starter: 'SUMX(FILTER(',
          solution: 'SUMX(FILTER(Ventas, Ventas[Unidades] >= 10), Ventas[Ventas])',
          hints: ['FILTER(Ventas, Ventas[Unidades] >= 10) deja solo esas filas.', 'SUMX recibe la tabla filtrada y la expresión a sumar: Ventas[Ventas].', 'SUMX(FILTER(Ventas, Ventas[Unidades] >= 10), Ventas[Ventas])']
        },
        quiz: [{ q: 'En un gráfico por Región con segmentador de Año = 2024, la medida es DIVIDE([Ventas], CALCULATE([Ventas], ALL(Ventas[Region]))). ¿Contra qué se divide cada barra?', options: ['Contra el total de todos los años y regiones', 'Contra el total de 2024 de todas las regiones', 'Contra las ventas de la misma región en 2023', 'Contra cero'], answer: 1, explain: 'ALL(Ventas[Region]) solo quita el filtro de región. El filtro de Año = 2024 sigue activo, así que el denominador es el total de 2024.' }]
      },
      {
        id: 'pbi-8',
        title: 'Visuales que comunican',
        minutes: 18,
        level: 'Intermedio',
        why: 'Un panel con doce gráficos de pastel no ayuda a decidir. Elegir el visual correcto y ordenar la página hace que el lector encuentre la respuesta en segundos.',
        concept: [
          { h: 'Elige el visual por la pregunta', p: 'Comparar categorías: barras horizontales. Evolución en el tiempo: líneas. Un solo número clave: tarjeta. Detalle fila a fila: tabla o matriz. Participación: barras apiladas al 100% o un treemap, nunca más de 5 porciones en un pastel.', code: '', lang: 'text' },
          { h: 'Jerarquía de la página', p: 'Arriba a la izquierda lo más importante: tarjetas con los KPI. Debajo, la tendencia. A la derecha o abajo, el detalle. Los segmentadores juntos, en un lugar fijo. Máximo 6 a 8 visuales por página.', code: '', lang: 'text' },
          { h: 'Menos es más', p: 'Quita bordes y fondos innecesarios. Un solo color de énfasis para destacar lo importante, grises para el resto. Títulos que digan la conclusión ("Ventas crecen 12% vs 2023"), no solo el nombre del dato.', code: '', lang: 'text' },
          { h: 'Interacciones', p: 'Al hacer clic en una barra, los demás visuales se filtran (resaltado cruzado). Los segmentadores filtran la página. Las informaciones sobre herramientas (tooltips) muestran detalle sin ocupar espacio. Los marcadores guardan vistas.', code: '', lang: 'text' }
        ],
        example: {
          title: 'Diseña en el laboratorio',
          text: 'En el laboratorio de Power BI tienes un constructor de visuales: elige el tipo, el eje, la medida y los segmentadores. Crea un gráfico de barras de Ventas Totales por Región y observa cómo cambia al filtrar un Año.',
          code: ''
        },
        practice: {
          type: 'visual',
          prompt: 'En el constructor de visuales del laboratorio, arma un gráfico de barras con el eje Región y la medida Ventas Totales, y filtra el Año a 2024. Cuando lo tengas, pulsa "Comprobar visual".',
          check: { visual: 'bar', axis: 'Region', measure: 'Ventas Totales', slicer: { 'Año': '2024' } },
          hints: ['Abre el laboratorio de Power BI desde el botón del panel de práctica.', 'Tipo: Barras. Eje: Region. Medida: Ventas Totales.', 'En los segmentadores, elige Año = 2024 y vuelve a comprobar.']
        },
        quiz: [{ q: 'Quieres mostrar cómo evolucionaron las ventas mes a mes durante dos años. ¿Qué visual eliges?', options: ['Gráfico de pastel', 'Gráfico de líneas', 'Tarjeta', 'Treemap'], answer: 1, explain: 'Las líneas muestran la evolución en el tiempo y permiten comparar dos series (los dos años) con claridad.' }]
      },
      {
        id: 'pbi-9',
        title: 'Inteligencia de tiempo y publicación',
        minutes: 16,
        level: 'Avanzado',
        reading: true,
        why: '"Ventas acumuladas del año", "variación contra el mismo mes del año pasado": son las preguntas más frecuentes de un directivo. Con una tabla de calendario y tres funciones las respondes. Después, publicar y automatizar cierra el ciclo.',
        concept: [
          { h: 'Requisitos', p: 'Una tabla de calendario continua (sin días faltantes), marcada como tabla de fechas, relacionada con la fecha de los hechos. Los visuales usan las columnas del calendario, no la fecha de los hechos.', code: '', lang: 'text' },
          { h: 'Las tres funciones esenciales', p: 'DATESYTD acumula desde el inicio del año. SAMEPERIODLASTYEAR desplaza el periodo un año atrás. DATEADD desplaza n periodos (días, meses, trimestres, años).', code: 'Ventas YTD = CALCULATE([Ventas Totales], DATESYTD(Calendario[Date]))\nVentas Año Anterior = CALCULATE([Ventas Totales], SAMEPERIODLASTYEAR(Calendario[Date]))\nVentas Mes Anterior = CALCULATE([Ventas Totales], DATEADD(Calendario[Date], -1, MONTH))\nCrecimiento % = DIVIDE([Ventas Totales] - [Ventas Año Anterior], [Ventas Año Anterior])', lang: 'dax', readonly: true },
          { h: 'Publicar y actualizar', p: 'Desde Desktop: Publicar, eliges un área de trabajo. En el Servicio configuras la actualización programada (hasta 8 veces al día en licencia Pro). Si los datos están en tu red local necesitas una puerta de enlace (gateway).', code: '', lang: 'text' },
          { h: 'Seguridad a nivel de fila (RLS)', p: 'Define roles con filtros DAX para que cada usuario vea solo sus datos. Un gerente regional ve solo su región sin necesidad de informes separados.', code: '// Rol "Gerente Norte", filtro sobre la tabla Region\n[Region] = "Norte"\n\n// Dinámico: cada usuario ve su región según su correo\n[CorreoGerente] = USERPRINCIPALNAME()', lang: 'dax', readonly: true },
          { h: 'Buenas prácticas de cierre', p: 'Oculta columnas técnicas (ids). Da formato a las medidas (moneda, %). Organiza las medidas en carpetas. Documenta con descripciones. Versiona el archivo .pbix con fecha.', code: '', lang: 'text' }
        ],
        example: {
          title: 'El panel ejecutivo completo',
          text: 'Tarjetas: Ventas Totales, Crecimiento %, Margen %. Línea: Ventas y Ventas Año Anterior por mes. Barras: % del Total por Región. Tabla: top 10 productos. Segmentadores: Año y Región. Publicado en el área "Dirección", actualizado a diario a las 6 am, con RLS por región. Ese es un entregable completo de Power BI.',
          code: '',
          readonly: true
        },
        quiz: [
          { q: 'Quieres comparar las ventas de cada mes con el mismo mes del año anterior. ¿Qué función usas?', options: ['DATESYTD', 'SAMEPERIODLASTYEAR', 'ALL', 'FILTER'], answer: 1, explain: 'SAMEPERIODLASTYEAR desplaza el periodo seleccionado exactamente un año atrás, respetando la granularidad del visual (día, mes, trimestre).' },
          { q: 'Tus datos están en un SQL Server dentro de la red de la empresa y quieres que el informe publicado se actualice solo cada mañana. ¿Qué necesitas?', options: ['Publicar dos veces', 'Una puerta de enlace (gateway) y una actualización programada', 'Exportar a Excel', 'Una columna calculada'], answer: 1, explain: 'El Servicio en la nube no puede ver tu red local por sí mismo. La puerta de enlace hace el puente y la actualización programada ejecuta la carga sin intervención.' }
        ]
      }
    ]
  };

  /* ------------------------------------------------------------- RETOS DIARIOS */
  const daily = [
    { track: 'python', q: '¿Qué imprime print(10 // 3, 10 % 3)?', options: ['3 1', '3.33 1', '3 0', '1 3'], answer: 0, explain: '// es división entera (3) y % el residuo (1).' },
    { track: 'sql', q: '¿Qué cláusula filtra grupos después de un GROUP BY?', options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], answer: 1, explain: 'HAVING actúa sobre los grupos formados; WHERE sobre las filas antes de agrupar.' },
    { track: 'powerbi', q: '¿Qué función de DAX modifica el contexto de filtro de una expresión?', options: ['SUM', 'CALCULATE', 'DIVIDE', 'COUNTROWS'], answer: 1, explain: 'CALCULATE evalúa una expresión bajo filtros nuevos o modificados.' },
    { track: 'python', q: '¿Qué devuelve "a,b,,c".split(",")?', options: ["['a','b','c']", "['a','b','','c']", "'abc'", 'Error'], answer: 1, explain: 'split conserva los campos vacíos entre separadores consecutivos.' },
    { track: 'sql', q: 'Quieres todos los clientes aunque no tengan pedidos. ¿Qué JOIN?', options: ['INNER JOIN', 'LEFT JOIN desde clientes', 'RIGHT JOIN desde clientes', 'Ninguno'], answer: 1, explain: 'LEFT JOIN conserva todas las filas de la tabla izquierda.' },
    { track: 'powerbi', q: '¿Dónde conviene corregir el tipo de dato de una columna?', options: ['En el visual', 'En Power Query', 'En una medida', 'En el Servicio'], answer: 1, explain: 'Lo más atrás posible en el flujo: Power Query.' },
    { track: 'python', q: '¿Qué hace diccionario.get("x", 0) si "x" no existe?', options: ['Error', 'Devuelve 0', 'Crea "x"', 'Devuelve None'], answer: 1, explain: 'Devuelve el valor por defecto sin modificar el diccionario.' },
    { track: 'sql', q: '¿Cómo se comprueba que una columna no tiene dato?', options: ['= NULL', 'IS NULL', "= ''", '== NULL'], answer: 1, explain: 'NULL solo se evalúa con IS NULL / IS NOT NULL.' },
    { track: 'powerbi', q: 'Para el % del total por región, ¿qué quita el filtro de región en el denominador?', options: ['FILTER', 'ALL(Ventas[Region])', 'SUMX', 'VALUES'], answer: 1, explain: 'ALL sobre la columna elimina ese filtro y deja los demás.' },
    { track: 'python', q: '¿Qué produce sorted([3,1,2], reverse=True)?', options: ['[1,2,3]', '[3,2,1]', '[2,1,3]', 'None'], answer: 1, explain: 'reverse=True ordena de mayor a menor.' },
    { track: 'sql', q: '¿Qué función de ventana numera filas sin dejar huecos por empates?', options: ['RANK', 'ROW_NUMBER', 'LAG', 'SUM OVER'], answer: 1, explain: 'ROW_NUMBER asigna números consecutivos únicos.' },
    { track: 'powerbi', q: 'Un indicador que debe reaccionar a los segmentadores es...', options: ['Una columna calculada', 'Una medida', 'Una tabla', 'Un marcador'], answer: 1, explain: 'Las medidas se evalúan según el contexto de filtro.' }
  ];

  /* ---------------------------------------------------------- PLAN 8 SEMANAS */
  const plan = [
    { week: 1, title: 'Fundamentos', lessons: ['py-1', 'py-2', 'sql-1', 'sql-2'] },
    { week: 2, title: 'Decidir y ordenar', lessons: ['py-3', 'sql-3', 'pbi-1'] },
    { week: 3, title: 'Colecciones y resúmenes', lessons: ['py-4', 'py-5', 'sql-4'] },
    { week: 4, title: 'Limpieza y filtros de grupo', lessons: ['pbi-2', 'sql-5', 'py-6'] },
    { week: 5, title: 'Unir tablas y modelar', lessons: ['sql-6', 'pbi-3', 'py-7'] },
    { week: 6, title: 'Primeras medidas', lessons: ['pbi-4', 'pbi-5', 'sql-7', 'py-8'] },
    { week: 7, title: 'Contexto y pasos encadenados', lessons: ['pbi-6', 'sql-8', 'py-9'] },
    { week: 8, title: 'Nivel profesional', lessons: ['pbi-7', 'pbi-8', 'sql-9', 'sql-10', 'py-10', 'py-11', 'pbi-9'] }
  ];

  const badges = [
    { id: 'first', name: 'Primer paso', desc: 'Completaste tu primera lección.', test: s => s.completed.length >= 1 },
    { id: 'py-start', name: 'Pythonista', desc: 'Tres lecciones de Python completadas.', test: s => s.completed.filter(x => x.startsWith('py-')).length >= 3 },
    { id: 'sql-start', name: 'Consultor', desc: 'Tres lecciones de SQL completadas.', test: s => s.completed.filter(x => x.startsWith('sql-')).length >= 3 },
    { id: 'pbi-start', name: 'Modelador', desc: 'Tres lecciones de Power BI completadas.', test: s => s.completed.filter(x => x.startsWith('pbi-')).length >= 3 },
    { id: 'ten', name: 'Constancia', desc: 'Diez lecciones completadas.', test: s => s.completed.length >= 10 },
    { id: 'streak3', name: 'Racha de 3', desc: 'Tres días seguidos aprendiendo.', test: s => s.bestStreak >= 3 },
    { id: 'streak7', name: 'Racha de 7', desc: 'Una semana completa sin faltar.', test: s => s.bestStreak >= 7 },
    { id: 'py-done', name: 'Python completo', desc: 'Toda la ruta de Python.', test: s => python.lessons.every(l => s.completed.includes(l.id)) },
    { id: 'sql-done', name: 'SQL completo', desc: 'Toda la ruta de SQL.', test: s => sql.lessons.every(l => s.completed.includes(l.id)) },
    { id: 'pbi-done', name: 'Power BI completo', desc: 'Toda la ruta de Power BI.', test: s => powerbi.lessons.every(l => s.completed.includes(l.id)) },
    { id: 'all', name: 'Forjador de datos', desc: 'Las tres rutas completas.', test: s => [python, sql, powerbi].every(t => t.lessons.every(l => s.completed.includes(l.id))) }
  ];

  return { tracks: [python, sql, powerbi], daily, plan, badges };
})();
