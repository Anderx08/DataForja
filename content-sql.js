/* DataForja — refuerzo de la ruta SQL:
   documentación de la base, lección para conocerla, explicaciones paso a paso,
   errores comunes y más ejercicios por lección. Se carga después de content-learn.js. */
(function () {
  const C = window.CONTENT;
  const sql = C.tracks.find(t => t.id === 'sql');
  const L = Object.fromEntries(sql.lessons.map(l => [l.id, l]));

  /* ============================================================ DOCUMENTACIÓN DE LA BASE */
  C.sqlSchema = {
    company: 'Distribuidora Andina: vende productos de electrónica, hogar, oficina y deportes a clientes de seis países. Los pedidos son de 2023 y 2024.',
    tables: [
      { name: 'clientes', grain: 'Una fila = un cliente.', desc: 'Quién compra.', cols: [
        ['id', 'INTEGER', 'Clave primaria. Identifica al cliente.', 'PK'],
        ['nombre', 'TEXT', 'Nombre del cliente.'],
        ['ciudad', 'TEXT', 'Ciudad, por ejemplo Monterrey o Bogotá.'],
        ['pais', 'TEXT', 'México, Colombia, Perú, Chile, Argentina o Costa Rica (sin acento en el nombre de la columna).'],
        ['segmento', 'TEXT', "'Corporativo', 'Pyme' o 'Particular'."],
        ['fecha_alta', 'TEXT', 'Fecha de registro, formato AAAA-MM-DD.'],
        ['correo', 'TEXT', 'Correo electrónico. Puede ser NULL (sin dato).']
      ] },
      { name: 'productos', grain: 'Una fila = un producto del catálogo.', desc: 'Qué se vende.', cols: [
        ['id', 'INTEGER', 'Clave primaria.', 'PK'],
        ['nombre', 'TEXT', 'Nombre del producto.'],
        ['categoria', 'TEXT', "'Electrónica', 'Hogar', 'Oficina' o 'Deportes'."],
        ['precio', 'REAL', 'Precio de lista actual.'],
        ['costo', 'REAL', 'Lo que le cuesta a la empresa una unidad.']
      ] },
      { name: 'empleados', grain: 'Una fila = un empleado.', desc: 'El equipo; los de Ventas atienden pedidos.', cols: [
        ['id', 'INTEGER', 'Clave primaria.', 'PK'],
        ['nombre', 'TEXT', 'Nombre del empleado.'],
        ['departamento', 'TEXT', "'Dirección', 'Ventas', 'Logística', 'Finanzas' o 'Soporte'."],
        ['salario', 'REAL', 'Salario mensual.'],
        ['fecha_ingreso', 'TEXT', 'Fecha de contratación, AAAA-MM-DD.'],
        ['jefe_id', 'INTEGER', 'id del jefe en esta misma tabla. NULL para la directora.', 'FK', 'empleados']
      ] },
      { name: 'pedidos', grain: 'Una fila = un pedido (la cabecera, sin productos).', desc: 'Cada compra de un cliente.', cols: [
        ['id', 'INTEGER', 'Clave primaria. Número de pedido.', 'PK'],
        ['cliente_id', 'INTEGER', 'Quién compró: apunta a clientes.id.', 'FK', 'clientes'],
        ['empleado_id', 'INTEGER', 'Vendedor que lo atendió: apunta a empleados.id.', 'FK', 'empleados'],
        ['fecha', 'TEXT', 'Fecha del pedido, AAAA-MM-DD.'],
        ['estado', 'TEXT', "'Entregado', 'En camino', 'Pendiente', 'Cancelado' o 'Devuelto'."]
      ] },
      { name: 'detalle_pedidos', grain: 'Una fila = una línea de un pedido: un producto con su cantidad.', desc: 'Qué productos lleva cada pedido. Aquí vive el dinero.', cols: [
        ['id', 'INTEGER', 'Clave primaria de la línea.', 'PK'],
        ['pedido_id', 'INTEGER', 'A qué pedido pertenece: apunta a pedidos.id.', 'FK', 'pedidos'],
        ['producto_id', 'INTEGER', 'Qué producto: apunta a productos.id.', 'FK', 'productos'],
        ['cantidad', 'INTEGER', 'Unidades vendidas en esta línea.'],
        ['precio_unitario', 'REAL', 'Precio cobrado por unidad. Puede ser menor al de lista si hubo descuento.']
      ] }
    ],
    tips: [
      'El importe de una línea es cantidad * precio_unitario. El total de un pedido es la suma de sus líneas.',
      'Los textos se comparan exactamente: \'Entregado\' no es igual a \'entregado\'.',
      'Las fechas son texto en formato AAAA-MM-DD, por eso se pueden comparar con < y > y agrupar con strftime.'
    ]
  };

  /* ============================================================ LECCIÓN 0: CONOCE LA BASE */
  const sql0 = {
    id: 'sql-0',
    title: 'Conoce la base de datos antes de consultar',
    minutes: 15,
    level: 'Inicio',
    diagram: 'er',
    why: 'Antes de escribir una consulta, un analista mira qué tablas hay, qué representa cada fila y cómo se conectan. Saltarse este paso es la causa número uno de resultados equivocados. Todos los ejercicios de esta ruta usan esta misma base.',
    concept: [
      { h: 'La empresa del curso', p: 'Trabajas en una distribuidora que vende a clientes de seis países. Tiene cinco tablas: clientes, productos, empleados, pedidos y detalle_pedidos. Haz clic en cada tabla del diagrama de abajo para ver sus columnas y sus primeras filas.', code: '', lang: 'text' },
      { h: 'Qué representa una fila', p: 'Es la pregunta más importante. En pedidos, una fila es un pedido completo. En detalle_pedidos, una fila es un producto dentro de un pedido. Un pedido con tres productos tiene una fila en pedidos y tres en detalle_pedidos. Por eso el dinero se suma en detalle_pedidos.', code: '-- Las 4 líneas del pedido 5\nSELECT * FROM detalle_pedidos WHERE pedido_id = 5;', lang: 'sql' },
      { h: 'Claves: cómo se conectan las tablas', p: 'Cada tabla tiene un id (clave primaria) que identifica la fila. Las columnas que terminan en _id son claves foráneas: guardan el id de una fila de otra tabla. pedidos.cliente_id dice qué cliente compró; en clientes buscas la fila con ese id para saber su nombre.', code: '-- El pedido 5 lo hizo el cliente con este id\nSELECT id, cliente_id, empleado_id FROM pedidos WHERE id = 5;', lang: 'sql' },
      { h: 'Cuatro consultas para explorar cualquier tabla', p: 'Cuando llegues a una base que no conoces, empieza siempre así: mira unas filas, cuéntalas, revisa los valores posibles de las columnas de texto y consulta su estructura.', code: 'SELECT * FROM pedidos LIMIT 5;\n\nSELECT COUNT(*) AS filas FROM pedidos;\n\nSELECT DISTINCT estado FROM pedidos;\n\nPRAGMA table_info(pedidos);', lang: 'sql' }
    ],
    example: {
      title: 'Seguir un pedido de punta a punta',
      text: 'Esta consulta junta las cinco tablas para contar la historia completa del pedido 5: quién lo compró, quién lo vendió y qué productos llevaba. Ejecútala y fíjate en que hay una fila por producto. Todavía no necesitas entender el JOIN: lo verás en la lección 7.',
      code: 'SELECT p.id AS pedido, p.fecha, c.nombre AS cliente, e.nombre AS vendedor,\n       pr.nombre AS producto, d.cantidad, d.precio_unitario,\n       d.cantidad * d.precio_unitario AS importe\nFROM pedidos p\nJOIN clientes c ON c.id = p.cliente_id\nJOIN empleados e ON e.id = p.empleado_id\nJOIN detalle_pedidos d ON d.pedido_id = p.id\nJOIN productos pr ON pr.id = d.producto_id\nWHERE p.id = 5;'
    },
    practice: {
      prompt: '¿Cuántas líneas de pedido hay en total? Cuenta las filas de detalle_pedidos y devuelve una sola columna llamada lineas.',
      starter: 'SELECT COUNT(*) AS \nFROM ',
      solution: 'SELECT COUNT(*) AS lineas FROM detalle_pedidos;',
      hints: ['COUNT(*) cuenta filas.', 'La tabla es detalle_pedidos.', 'El alias se escribe después de AS: AS lineas.']
    },
    extra: [
      { level: 'Básico', prompt: 'Muestra todas las columnas de las líneas del pedido 5 (tabla detalle_pedidos).', starter: 'SELECT *\nFROM detalle_pedidos\nWHERE ', solution: 'SELECT * FROM detalle_pedidos WHERE pedido_id = 5;', hints: ['La columna que indica el pedido es pedido_id.', 'WHERE pedido_id = 5'] },
      { level: 'Básico', prompt: 'Lista los estados posibles de un pedido, sin repetir, en orden alfabético.', starter: 'SELECT DISTINCT \nFROM pedidos\nORDER BY ', solution: 'SELECT DISTINCT estado FROM pedidos ORDER BY estado;', ordered: true, hints: ['DISTINCT quita repetidos.', 'ORDER BY estado ordena de la A a la Z.'] },
      { level: 'Intermedio', prompt: 'Muestra el id, el cliente_id y el estado del pedido 12. Después, en otra consulta aparte, podrías buscar ese cliente en la tabla clientes: aquí solo devuelve la fila del pedido.', starter: 'SELECT \nFROM pedidos\nWHERE ', solution: 'SELECT id, cliente_id, estado FROM pedidos WHERE id = 12;', hints: ['Tres columnas separadas por comas.', 'WHERE id = 12'] }
    ],
    quiz: [
      { q: 'Un pedido incluye 3 productos distintos. ¿Cuántas filas ocupa en detalle_pedidos?', options: ['1', '3', 'Depende de las unidades', '0, porque está en pedidos'], answer: 1, explain: 'detalle_pedidos tiene una fila por producto dentro del pedido, sin importar cuántas unidades lleve cada uno.' },
      { q: '¿Dónde está el nombre del vendedor que atendió un pedido?', options: ['En pedidos.vendedor', 'En empleados, buscando la fila cuyo id es pedidos.empleado_id', 'En detalle_pedidos', 'En clientes'], answer: 1, explain: 'pedidos solo guarda el número del vendedor (empleado_id). El nombre está en empleados, en la fila con ese id.' }
    ]
  };
  sql.lessons.unshift(sql0);

  /* ============================================================ PASO A PASO Y ERRORES COMUNES */
  const deeper = {
    'sql-1': {
      steps: ['FROM productos: SQL toma la tabla completa (20 filas).', 'SELECT nombre, precio, precio - costo AS margen: de cada fila conserva esas columnas y calcula la nueva.', 'LIMIT: si lo hay, corta el resultado a ese número de filas.'],
      pitfalls: [
        { bad: 'SELECT nombre precio FROM productos;', good: 'SELECT nombre, precio FROM productos;', why: 'Sin coma, SQL interpreta precio como un alias de nombre: obtienes una sola columna llamada precio con los nombres dentro.' },
        { bad: 'SELECT * FROM producto;', good: 'SELECT * FROM productos;', why: 'El nombre de la tabla debe ser exacto. En esta base todas las tablas están en plural.' }
      ]
    },
    'sql-2': {
      steps: ['FROM pedidos: toma todas las filas.', 'WHERE: revisa la condición fila por fila y descarta las que no la cumplen.', 'SELECT: de las filas que quedaron, muestra las columnas pedidas.'],
      pitfalls: [
        { bad: "WHERE ciudad = Monterrey", good: "WHERE ciudad = 'Monterrey'", why: 'Sin comillas simples, SQL cree que Monterrey es el nombre de una columna.' },
        { bad: 'WHERE correo = NULL', good: 'WHERE correo IS NULL', why: 'Nada es igual a NULL, ni siquiera NULL. La comparación nunca es verdadera y la consulta devuelve cero filas.' },
        { bad: "WHERE estado = 'cancelado'", good: "WHERE estado = 'Cancelado'", why: 'La comparación de texto es exacta. Revisa los valores reales con SELECT DISTINCT estado FROM pedidos.' },
        { bad: "WHERE categoria = 'Hogar' OR categoria = 'Oficina' AND precio < 500", good: "WHERE (categoria = 'Hogar' OR categoria = 'Oficina') AND precio < 500", why: 'AND se evalúa antes que OR. Sin paréntesis, el límite de precio solo se aplica a Oficina.' }
      ]
    },
    'sql-3': {
      steps: ['FROM y WHERE: se eligen las filas.', 'SELECT: se arman las columnas, incluidos los alias.', 'ORDER BY: se ordena el resultado; aquí ya puedes usar los alias del SELECT.', 'LIMIT: se cortan las primeras N filas del resultado ordenado.'],
      pitfalls: [
        { bad: 'SELECT nombre, precio FROM productos LIMIT 5 ORDER BY precio DESC;', good: 'SELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 5;', why: 'LIMIT siempre va al final. Además, recortar antes de ordenar no daría el top 5 real.' },
        { bad: 'SELECT DISTINCT ciudad, nombre FROM clientes;', good: 'SELECT DISTINCT ciudad FROM clientes;', why: 'DISTINCT se aplica a la fila completa. Si incluyes nombre, cada combinación ciudad + nombre es distinta y las ciudades se repiten.' }
      ]
    },
    'sql-4': {
      steps: ['FROM y WHERE: se eligen las filas.', 'GROUP BY departamento: las filas se reparten en montones, uno por cada valor distinto.', 'Funciones agregadas: COUNT, SUM o AVG se calculan dentro de cada montón.', 'SELECT: devuelve una fila por montón.'],
      pitfalls: [
        { bad: 'SELECT departamento, nombre, COUNT(*) FROM empleados GROUP BY departamento;', good: 'SELECT departamento, COUNT(*) FROM empleados GROUP BY departamento;', why: 'nombre no está agrupado ni agregado. SQLite no da error y muestra un nombre cualquiera del grupo; SQL Server y PostgreSQL sí fallan. En ambos casos el dato no tiene sentido.' },
        { bad: 'SELECT COUNT(correo) FROM clientes;  -- "total de clientes"', good: 'SELECT COUNT(*) FROM clientes;', why: 'COUNT(columna) ignora los NULL. Para contar filas usa COUNT(*).' }
      ]
    },
    'sql-5': {
      steps: ['FROM y WHERE: se filtran filas individuales.', 'GROUP BY: se forman los grupos.', 'HAVING: se descartan los grupos que no cumplen la condición.', 'SELECT y ORDER BY: se muestran y ordenan los grupos que quedaron.'],
      pitfalls: [
        { bad: 'SELECT pais, COUNT(*) FROM clientes WHERE COUNT(*) >= 5 GROUP BY pais;', good: 'SELECT pais, COUNT(*) FROM clientes GROUP BY pais HAVING COUNT(*) >= 5;', why: 'WHERE se ejecuta antes de agrupar, cuando todavía no existe ningún conteo. SQL responde con un error de uso de agregación.' },
        { bad: "... GROUP BY departamento HAVING departamento = 'Ventas'", good: "... WHERE departamento = 'Ventas' GROUP BY departamento", why: 'Funciona, pero agrupa todo para luego tirar casi todo. Las condiciones sobre filas van en WHERE.' }
      ]
    },
    'sql-6': {
      steps: ['FROM pedidos AS p: empieza por la tabla principal.', 'JOIN clientes AS c ON c.id = p.cliente_id: para cada pedido busca el cliente cuyo id coincide y pega sus columnas a la derecha.', 'Con LEFT JOIN, si no encuentra pareja, conserva la fila y rellena las columnas de la derecha con NULL.', 'WHERE y SELECT trabajan sobre esa tabla combinada.'],
      pitfalls: [
        { bad: 'SELECT * FROM pedidos, clientes;', good: 'SELECT * FROM pedidos p JOIN clientes c ON c.id = p.cliente_id;', why: 'Sin condición de unión, cada pedido se combina con cada cliente: 320 × 40 = 12,800 filas sin sentido.' },
        { bad: 'JOIN clientes c ON c.id = p.id', good: 'JOIN clientes c ON c.id = p.cliente_id', why: 'Unir por las columnas equivocadas no da error: da resultados que parecen válidos pero son falsos. Une siempre clave foránea con clave primaria.' },
        { bad: 'SELECT id, nombre FROM pedidos p JOIN clientes c ON c.id = p.cliente_id;', good: 'SELECT p.id, c.nombre FROM pedidos p JOIN clientes c ON c.id = p.cliente_id;', why: 'id existe en las dos tablas. Antepón el alias para que SQL sepa cuál quieres.' }
      ]
    },
    'sql-7': {
      steps: ['FROM pedidos JOIN detalle_pedidos: cada pedido se repite una vez por cada producto que lleva.', 'JOIN clientes: a cada línea se le pega el nombre del cliente.', 'WHERE estado = \'Entregado\': se quitan las líneas de pedidos no entregados.', 'GROUP BY cliente y SUM(cantidad * precio_unitario): se suma el importe de todas sus líneas.'],
      pitfalls: [
        { bad: 'COUNT(*) AS pedidos', good: 'COUNT(DISTINCT p.id) AS pedidos', why: 'Después del JOIN con el detalle, COUNT(*) cuenta líneas de producto, no pedidos.' },
        { bad: 'SUM(d.cantidad * pr.precio)', good: 'SUM(d.cantidad * d.precio_unitario)', why: 'productos.precio es el precio de lista de hoy. Lo que realmente se cobró, con descuentos, está en precio_unitario.' }
      ]
    },
    'sql-8': {
      steps: ['SQL ejecuta primero la subconsulta o el CTE.', 'Si devuelve un solo valor, la consulta principal lo usa como un número más.', 'Si devuelve una tabla, la consulta principal la usa como si fuera otra tabla de la base.'],
      pitfalls: [
        { bad: 'WHERE salario > (SELECT salario FROM empleados WHERE departamento = \'Ventas\')', good: 'WHERE salario > (SELECT AVG(salario) FROM empleados WHERE departamento = \'Ventas\')', why: 'La subconsulta devuelve varias filas. SQLite usa la primera en silencio; otros motores dan error. Asegúrate de que devuelva un solo valor.' },
        { bad: 'WHERE id NOT IN (SELECT jefe_id FROM empleados)', good: 'WHERE id NOT IN (SELECT jefe_id FROM empleados WHERE jefe_id IS NOT NULL)', why: 'Si la subconsulta contiene un NULL, NOT IN no devuelve ninguna fila.' }
      ]
    },
    'sql-9': {
      steps: ['CASE revisa los WHEN de arriba abajo en cada fila.', 'Devuelve el valor del primer WHEN verdadero y deja de evaluar.', 'Si ninguno se cumple, devuelve el ELSE, o NULL si no hay ELSE.'],
      pitfalls: [
        { bad: "CASE WHEN precio >= 800 THEN 'Medio' WHEN precio >= 3000 THEN 'Premium' END", good: "CASE WHEN precio >= 3000 THEN 'Premium' WHEN precio >= 800 THEN 'Medio' END", why: 'Un producto de 5000 cumple la primera condición y nunca llega a Premium. Pon primero la condición más exigente.' },
        { bad: 'SUM(cancelados) * 100 / COUNT(*)', good: 'SUM(cancelados) * 100.0 / COUNT(*)', why: 'Entre enteros, la división descarta los decimales: 7 * 100 / 30 da 23 en lugar de 23.33.' }
      ]
    },
    'sql-10': {
      steps: ['Se ejecuta la consulta normal: FROM, WHERE, GROUP BY.', 'Sobre ese resultado, OVER define una ventana: PARTITION BY la divide en grupos y ORDER BY ordena dentro de cada uno.', 'La función de ventana añade una columna a cada fila sin colapsarlas.', 'Al final se aplica el ORDER BY de la consulta.'],
      pitfalls: [
        { bad: 'SELECT ... WHERE ROW_NUMBER() OVER (...) = 1', good: 'WITH r AS (SELECT ..., ROW_NUMBER() OVER (...) AS n FROM ...) SELECT ... FROM r WHERE n = 1', why: 'Las funciones de ventana se calculan después de WHERE. Para filtrar por ellas, envuelve la consulta en un CTE.' },
        { bad: 'SUM(ingreso) OVER () AS acumulado', good: 'SUM(ingreso) OVER (ORDER BY mes) AS acumulado', why: 'Sin ORDER BY dentro de OVER obtienes el total general en todas las filas, no un acumulado.' }
      ]
    },
    'sql-11': {
      steps: ['Escribe primero un SELECT con el mismo WHERE que usarás.', 'Revisa que devuelva exactamente las filas que quieres cambiar.', 'Cambia SELECT por UPDATE o DELETE manteniendo el WHERE.', 'Vuelve a consultar para verificar el resultado.'],
      pitfalls: [
        { bad: "UPDATE productos SET precio = 0;", good: "UPDATE productos SET precio = 0 WHERE id = 7;", why: 'Sin WHERE cambian todas las filas de la tabla.' },
        { bad: 'DELETE FROM pedidos WHERE id = 3;', good: 'DELETE FROM detalle_pedidos WHERE pedido_id = 3;\nDELETE FROM pedidos WHERE id = 3;', why: 'Si borras el pedido primero, sus líneas quedan huérfanas, apuntando a un pedido que ya no existe.' },
        { bad: "INSERT INTO productos VALUES ('Hub', 'Electrónica', 450, 260);", good: "INSERT INTO productos (nombre, categoria, precio, costo) VALUES ('Hub', 'Electrónica', 450, 260);", why: 'Sin nombrar columnas debes dar un valor para cada una, en orden. Nombrarlas es más claro y resiste cambios en la tabla.' }
      ]
    }
  };
  for (const [id, d] of Object.entries(deeper)) if (L[id]) L[id].deeper = d;

  /* ============================================================ MÁS EJERCICIOS */
  const more = {
    'sql-1': [
      { level: 'Básico', prompt: 'Muestra el nombre y la fecha_alta de todos los clientes.', starter: 'SELECT \nFROM clientes;', solution: 'SELECT nombre, fecha_alta FROM clientes;', hints: ['Dos columnas separadas por coma.'] },
      { level: 'Intermedio', prompt: 'Muestra el nombre, el salario mensual y el salario anual de cada empleado (salario * 12) con el alias salario_anual.', starter: 'SELECT nombre, salario, \nFROM empleados;', solution: 'SELECT nombre, salario, salario * 12 AS salario_anual FROM empleados;', hints: ['Puedes multiplicar una columna en el SELECT.', 'salario * 12 AS salario_anual'] },
      { level: 'Reto', prompt: 'Muestra nombre, precio, costo y el margen porcentual de cada producto: (precio - costo) / precio * 100, redondeado a 1 decimal con ROUND(valor, 1) y alias margen_pct.', starter: 'SELECT nombre, precio, costo,\n       \nFROM productos;', solution: 'SELECT nombre, precio, costo, ROUND((precio - costo) / precio * 100, 1) AS margen_pct FROM productos;', hints: ['Usa paréntesis para restar antes de dividir.', 'ROUND((precio - costo) / precio * 100, 1) AS margen_pct'] }
    ],
    'sql-2': [
      { level: 'Básico', prompt: 'Lista nombre y ciudad de los clientes del segmento Corporativo.', starter: 'SELECT nombre, ciudad\nFROM clientes\nWHERE ', solution: "SELECT nombre, ciudad FROM clientes WHERE segmento = 'Corporativo';", hints: ["El valor exacto es 'Corporativo', con mayúscula inicial."] },
      { level: 'Básico', prompt: 'Lista nombre y país de los clientes cuyo nombre empieza con M.', starter: 'SELECT nombre, pais\nFROM clientes\nWHERE ', solution: "SELECT nombre, pais FROM clientes WHERE nombre LIKE 'M%';", hints: ["LIKE 'M%' significa: empieza con M y sigue cualquier cosa."] },
      { level: 'Intermedio', prompt: 'Empleados que ingresaron de 2022 en adelante: nombre y fecha_ingreso.', starter: 'SELECT nombre, fecha_ingreso\nFROM empleados\nWHERE ', solution: "SELECT nombre, fecha_ingreso FROM empleados WHERE fecha_ingreso >= '2022-01-01';", hints: ['Las fechas en formato AAAA-MM-DD se comparan como texto.', "fecha_ingreso >= '2022-01-01'"] },
      { level: 'Reto', prompt: 'Pedidos de 2023 que no estén ni entregados ni cancelados: id, fecha y estado.', starter: 'SELECT id, fecha, estado\nFROM pedidos\nWHERE ', solution: "SELECT id, fecha, estado FROM pedidos WHERE estado NOT IN ('Entregado', 'Cancelado') AND fecha BETWEEN '2023-01-01' AND '2023-12-31';", hints: ["NOT IN ('Entregado', 'Cancelado') excluye los dos estados.", "Combina con AND fecha BETWEEN '2023-01-01' AND '2023-12-31'."] }
    ],
    'sql-3': [
      { level: 'Básico', prompt: 'Lista los países distintos de los clientes en orden alfabético.', starter: 'SELECT \nFROM clientes\n', solution: 'SELECT DISTINCT pais FROM clientes ORDER BY pais;', ordered: true, hints: ['DISTINCT pais y ORDER BY pais.'] },
      { level: 'Intermedio', prompt: 'Los 5 productos más baratos: nombre y precio, del más barato al más caro.', starter: 'SELECT nombre, precio\nFROM productos\n', solution: 'SELECT nombre, precio FROM productos ORDER BY precio LIMIT 5;', ordered: true, hints: ['Ascendente es el orden por defecto.', 'LIMIT 5 al final.'] },
      { level: 'Reto', prompt: 'Empleados ordenados por departamento de la A a la Z y, dentro de cada departamento, del más reciente al más antiguo: nombre, departamento y fecha_ingreso.', starter: 'SELECT nombre, departamento, fecha_ingreso\nFROM empleados\n', solution: 'SELECT nombre, departamento, fecha_ingreso FROM empleados ORDER BY departamento, fecha_ingreso DESC;', ordered: true, hints: ['Dos criterios separados por coma.', 'ORDER BY departamento, fecha_ingreso DESC'] }
    ],
    'sql-4': [
      { level: 'Básico', prompt: 'Precio promedio por categoría, redondeado a 2 decimales con alias precio_promedio. Ordena por categoría.', starter: 'SELECT categoria, \nFROM productos\n', solution: 'SELECT categoria, ROUND(AVG(precio), 2) AS precio_promedio FROM productos GROUP BY categoria ORDER BY categoria;', ordered: true, hints: ['ROUND(AVG(precio), 2) AS precio_promedio', 'GROUP BY categoria ORDER BY categoria'] },
      { level: 'Intermedio', prompt: 'Número de pedidos que atendió cada vendedor: empleado_id y pedidos, de más a menos pedidos.', starter: 'SELECT empleado_id, \nFROM pedidos\n', solution: 'SELECT empleado_id, COUNT(*) AS pedidos FROM pedidos GROUP BY empleado_id ORDER BY pedidos DESC;', ordered: true, hints: ['COUNT(*) AS pedidos', 'Agrupa por empleado_id.'] },
      { level: 'Reto', prompt: 'Los 5 productos (producto_id) con más unidades vendidas en detalle_pedidos: producto_id y unidades (suma de cantidad). De mayor a menor; en empate, por producto_id.', starter: 'SELECT producto_id, \nFROM detalle_pedidos\n', solution: 'SELECT producto_id, SUM(cantidad) AS unidades FROM detalle_pedidos GROUP BY producto_id ORDER BY unidades DESC, producto_id LIMIT 5;', ordered: true, hints: ['SUM(cantidad) AS unidades', 'ORDER BY unidades DESC, producto_id LIMIT 5'] }
    ],
    'sql-5': [
      { level: 'Básico', prompt: 'Países con al menos 5 clientes: pais y clientes.', starter: 'SELECT pais, COUNT(*) AS clientes\nFROM clientes\nGROUP BY pais\n', solution: 'SELECT pais, COUNT(*) AS clientes FROM clientes GROUP BY pais HAVING COUNT(*) >= 5;', hints: ['HAVING COUNT(*) >= 5'] },
      { level: 'Intermedio', prompt: 'Vendedores (empleado_id) con más de 60 pedidos: empleado_id y pedidos, de más a menos.', starter: 'SELECT empleado_id, COUNT(*) AS pedidos\nFROM pedidos\n', solution: 'SELECT empleado_id, COUNT(*) AS pedidos FROM pedidos GROUP BY empleado_id HAVING COUNT(*) > 60 ORDER BY pedidos DESC;', ordered: true, hints: ['GROUP BY empleado_id HAVING COUNT(*) > 60', 'ORDER BY pedidos DESC al final.'] },
      { level: 'Reto', prompt: 'Categorías con al menos 4 productos y cuyo producto más caro supere 3000: categoria, productos y precio_max. Ordena por categoría.', starter: 'SELECT categoria, COUNT(*) AS productos, MAX(precio) AS precio_max\nFROM productos\nGROUP BY categoria\n', solution: 'SELECT categoria, COUNT(*) AS productos, MAX(precio) AS precio_max FROM productos GROUP BY categoria HAVING COUNT(*) >= 4 AND MAX(precio) > 3000 ORDER BY categoria;', ordered: true, hints: ['HAVING admite varias condiciones con AND.', 'HAVING COUNT(*) >= 4 AND MAX(precio) > 3000'] }
    ],
    'sql-6': [
      { level: 'Básico', prompt: 'Pedidos en estado Pendiente con el nombre y la ciudad del cliente: id (del pedido), cliente y ciudad. Ordena por id.', starter: 'SELECT p.id, c.nombre AS cliente, c.ciudad\nFROM pedidos p\nJOIN clientes c ON \n', solution: "SELECT p.id, c.nombre AS cliente, c.ciudad FROM pedidos p JOIN clientes c ON c.id = p.cliente_id WHERE p.estado = 'Pendiente' ORDER BY p.id;", ordered: true, hints: ['ON c.id = p.cliente_id', "WHERE p.estado = 'Pendiente' ORDER BY p.id"] },
      { level: 'Intermedio', prompt: 'Las líneas del pedido 5 con el nombre del producto: producto, cantidad y precio_unitario. Ordena por producto.', starter: 'SELECT pr.nombre AS producto, d.cantidad, d.precio_unitario\nFROM detalle_pedidos d\n', solution: 'SELECT pr.nombre AS producto, d.cantidad, d.precio_unitario FROM detalle_pedidos d JOIN productos pr ON pr.id = d.producto_id WHERE d.pedido_id = 5 ORDER BY producto;', ordered: true, hints: ['JOIN productos pr ON pr.id = d.producto_id', 'WHERE d.pedido_id = 5'] },
      { level: 'Reto', prompt: 'Empleados que no tienen ningún pedido asignado: nombre y departamento, ordenados por nombre.', starter: 'SELECT e.nombre, e.departamento\nFROM empleados e\nLEFT JOIN pedidos p ON \n', solution: 'SELECT e.nombre, e.departamento FROM empleados e LEFT JOIN pedidos p ON p.empleado_id = e.id WHERE p.id IS NULL ORDER BY e.nombre;', ordered: true, hints: ['LEFT JOIN conserva a todos los empleados.', 'Los que no tienen pedidos quedan con p.id en NULL: WHERE p.id IS NULL.'] }
    ],
    'sql-7': [
      { level: 'Básico', prompt: 'Ingreso total por país del cliente, considerando todos los pedidos: pais e ingreso (suma de cantidad * precio_unitario, redondeada a 2). De mayor a menor.', starter: 'SELECT c.pais, \nFROM pedidos p\nJOIN clientes c ON c.id = p.cliente_id\nJOIN detalle_pedidos d ON d.pedido_id = p.id\n', solution: 'SELECT c.pais, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS ingreso FROM pedidos p JOIN clientes c ON c.id = p.cliente_id JOIN detalle_pedidos d ON d.pedido_id = p.id GROUP BY c.pais ORDER BY ingreso DESC;', ordered: true, hints: ['GROUP BY c.pais', 'ORDER BY ingreso DESC'] },
      { level: 'Intermedio', prompt: 'Por categoría de producto: unidades vendidas (suma de cantidad) y pedidos distintos en que aparece. Columnas categoria, unidades y pedidos; ordena por categoría.', starter: 'SELECT pr.categoria, \nFROM detalle_pedidos d\nJOIN productos pr ON pr.id = d.producto_id\n', solution: 'SELECT pr.categoria, SUM(d.cantidad) AS unidades, COUNT(DISTINCT d.pedido_id) AS pedidos FROM detalle_pedidos d JOIN productos pr ON pr.id = d.producto_id GROUP BY pr.categoria ORDER BY pr.categoria;', ordered: true, hints: ['SUM(d.cantidad) AS unidades', 'COUNT(DISTINCT d.pedido_id) AS pedidos'] },
      { level: 'Reto', prompt: 'Ticket promedio por segmento de cliente, solo pedidos entregados: segmento y ticket (ingreso entre pedidos distintos, redondeado a 2). De mayor a menor.', starter: 'SELECT c.segmento,\n       \nFROM pedidos p\nJOIN clientes c ON c.id = p.cliente_id\nJOIN detalle_pedidos d ON d.pedido_id = p.id\n', solution: "SELECT c.segmento, ROUND(SUM(d.cantidad * d.precio_unitario) / COUNT(DISTINCT p.id), 2) AS ticket FROM pedidos p JOIN clientes c ON c.id = p.cliente_id JOIN detalle_pedidos d ON d.pedido_id = p.id WHERE p.estado = 'Entregado' GROUP BY c.segmento ORDER BY ticket DESC;", ordered: true, hints: ["WHERE p.estado = 'Entregado'", 'ticket = SUM(importe) / COUNT(DISTINCT p.id)'] }
    ],
    'sql-8': [
      { level: 'Básico', prompt: 'Empleados que ganan más que el salario promedio de toda la empresa: nombre y salario, de mayor a menor.', starter: 'SELECT nombre, salario\nFROM empleados\nWHERE salario > ()\n', solution: 'SELECT nombre, salario FROM empleados WHERE salario > (SELECT AVG(salario) FROM empleados) ORDER BY salario DESC;', ordered: true, hints: ['La subconsulta es SELECT AVG(salario) FROM empleados.'] },
      { level: 'Intermedio', prompt: 'Clientes que han comprado al menos un producto de la categoría Deportes: nombre, en orden alfabético.', starter: 'SELECT nombre\nFROM clientes\nWHERE id IN (\n    \n)\nORDER BY nombre;', solution: "SELECT nombre FROM clientes WHERE id IN (SELECT p.cliente_id FROM pedidos p JOIN detalle_pedidos d ON d.pedido_id = p.id JOIN productos pr ON pr.id = d.producto_id WHERE pr.categoria = 'Deportes') ORDER BY nombre;", ordered: true, hints: ['La subconsulta une pedidos, detalle_pedidos y productos.', "Devuelve p.cliente_id con WHERE pr.categoria = 'Deportes'."] },
      { level: 'Reto', prompt: "Con un CTE calcula el ingreso de cada mes (strftime('%Y-%m', fecha) AS mes, ingreso redondeado a 2) y devuelve solo los meses cuyo ingreso supera el promedio mensual. Columnas mes e ingreso; ordena por mes.", starter: "WITH mensual AS (\n    SELECT strftime('%Y-%m', p.fecha) AS mes,\n           ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS ingreso\n    FROM pedidos p\n    JOIN detalle_pedidos d ON d.pedido_id = p.id\n    GROUP BY mes\n)\nSELECT mes, ingreso\nFROM mensual\n", solution: "WITH mensual AS (SELECT strftime('%Y-%m', p.fecha) AS mes, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS ingreso FROM pedidos p JOIN detalle_pedidos d ON d.pedido_id = p.id GROUP BY mes) SELECT mes, ingreso FROM mensual WHERE ingreso > (SELECT AVG(ingreso) FROM mensual) ORDER BY mes;", ordered: true, hints: ['El CTE ya está escrito.', 'WHERE ingreso > (SELECT AVG(ingreso) FROM mensual)'] }
    ],
    'sql-9': [
      { level: 'Básico', prompt: "Número de pedidos por mes de 2024: mes (formato AAAA-MM) y pedidos. Ordena por mes.", starter: "SELECT strftime('%Y-%m', fecha) AS mes, \nFROM pedidos\n", solution: "SELECT strftime('%Y-%m', fecha) AS mes, COUNT(*) AS pedidos FROM pedidos WHERE fecha BETWEEN '2024-01-01' AND '2024-12-31' GROUP BY mes ORDER BY mes;", ordered: true, hints: ["Filtra con WHERE fecha BETWEEN '2024-01-01' AND '2024-12-31'.", 'GROUP BY mes ORDER BY mes'] },
      { level: 'Intermedio', prompt: "Clasifica a los clientes por fecha_alta: 'Antiguo' si es anterior a 2021, 'Reciente' si es de 2023 en adelante y 'Intermedio' el resto. Cuenta cuántos hay de cada tipo: tipo y clientes, ordenado por tipo.", starter: "SELECT CASE\n           \n       END AS tipo,\n       COUNT(*) AS clientes\nFROM clientes\nGROUP BY tipo\nORDER BY tipo;", solution: "SELECT CASE WHEN fecha_alta < '2021-01-01' THEN 'Antiguo' WHEN fecha_alta >= '2023-01-01' THEN 'Reciente' ELSE 'Intermedio' END AS tipo, COUNT(*) AS clientes FROM clientes GROUP BY tipo ORDER BY tipo;", ordered: true, hints: ["WHEN fecha_alta < '2021-01-01' THEN 'Antiguo'", "WHEN fecha_alta >= '2023-01-01' THEN 'Reciente' ELSE 'Intermedio'"] },
      { level: 'Reto', prompt: 'Los 5 clientes con más días entre su primer y su último pedido: cliente (nombre) y dias (redondeado a entero con ROUND). De mayor a menor; en empate, por nombre.', starter: 'SELECT c.nombre AS cliente,\n       ROUND(julianday(MAX(p.fecha)) - julianday(MIN(p.fecha))) AS dias\nFROM clientes c\nJOIN pedidos p ON p.cliente_id = c.id\n', solution: 'SELECT c.nombre AS cliente, ROUND(julianday(MAX(p.fecha)) - julianday(MIN(p.fecha))) AS dias FROM clientes c JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id ORDER BY dias DESC, cliente LIMIT 5;', ordered: true, hints: ['GROUP BY c.id', 'ORDER BY dias DESC, cliente LIMIT 5'] }
    ],
    'sql-10': [
      { level: 'Básico', prompt: 'Numera los productos de cada categoría del más caro al más barato: categoria, nombre, precio y posicion (ROW_NUMBER). Ordena por categoria y posicion.', starter: 'SELECT categoria, nombre, precio,\n       \nFROM productos\n', solution: 'SELECT categoria, nombre, precio, ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY precio DESC) AS posicion FROM productos ORDER BY categoria, posicion;', ordered: true, hints: ['ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY precio DESC) AS posicion'] },
      { level: 'Intermedio', prompt: 'Ingreso de cada mes de 2024 (pedidos entregados) y su acumulado del año: mes, ingreso y acumulado, ambos redondeados a 2. Ordena por mes.', starter: "WITH m AS (\n    SELECT strftime('%Y-%m', p.fecha) AS mes, SUM(d.cantidad * d.precio_unitario) AS ingreso\n    FROM pedidos p\n    JOIN detalle_pedidos d ON d.pedido_id = p.id\n    WHERE p.estado = 'Entregado' AND p.fecha BETWEEN '2024-01-01' AND '2024-12-31'\n    GROUP BY mes\n)\nSELECT mes, ROUND(ingreso, 2) AS ingreso,\n       \nFROM m\nORDER BY mes;", solution: "WITH m AS (SELECT strftime('%Y-%m', p.fecha) AS mes, SUM(d.cantidad * d.precio_unitario) AS ingreso FROM pedidos p JOIN detalle_pedidos d ON d.pedido_id = p.id WHERE p.estado = 'Entregado' AND p.fecha BETWEEN '2024-01-01' AND '2024-12-31' GROUP BY mes) SELECT mes, ROUND(ingreso, 2) AS ingreso, ROUND(SUM(ingreso) OVER (ORDER BY mes), 2) AS acumulado FROM m ORDER BY mes;", ordered: true, hints: ['ROUND(SUM(ingreso) OVER (ORDER BY mes), 2) AS acumulado'] },
      { level: 'Reto', prompt: 'Variación de pedidos mes a mes en 2024 con LAG: mes, pedidos, anterior (pedidos del mes previo) y variacion (pedidos - anterior). Ordena por mes.', starter: "WITH m AS (\n    SELECT strftime('%Y-%m', fecha) AS mes, COUNT(*) AS pedidos\n    FROM pedidos\n    WHERE fecha BETWEEN '2024-01-01' AND '2024-12-31'\n    GROUP BY mes\n)\nSELECT mes, pedidos,\n       \nFROM m\nORDER BY mes;", solution: "WITH m AS (SELECT strftime('%Y-%m', fecha) AS mes, COUNT(*) AS pedidos FROM pedidos WHERE fecha BETWEEN '2024-01-01' AND '2024-12-31' GROUP BY mes) SELECT mes, pedidos, LAG(pedidos) OVER (ORDER BY mes) AS anterior, pedidos - LAG(pedidos) OVER (ORDER BY mes) AS variacion FROM m ORDER BY mes;", ordered: true, hints: ['LAG(pedidos) OVER (ORDER BY mes) AS anterior', 'El primer mes no tiene anterior: queda en NULL.'] }
    ],
    'sql-11': [
      { level: 'Básico', type: 'sql-modify', prompt: "La clienta con id 1 no tiene correo registrado. Guarda 'maria.fernandez@correo.com' en su columna correo.", starter: 'UPDATE clientes\nSET \nWHERE ;', solution: "UPDATE clientes SET correo = 'maria.fernandez@correo.com' WHERE id = 1;", verify: 'SELECT id, nombre, correo FROM clientes WHERE id = 1;', hints: ["SET correo = 'maria.fernandez@correo.com'", 'WHERE id = 1'] },
      { level: 'Intermedio', type: 'sql-modify', prompt: "Agrega el producto 'Hub USB-C' de categoría Electrónica con precio 450 y costo 260. Después aplica un 5% de descuento al precio de todos los productos de Electrónica.", starter: "INSERT INTO productos (nombre, categoria, precio, costo)\nVALUES ();\n\nUPDATE productos\nSET \nWHERE ;", solution: "INSERT INTO productos (nombre, categoria, precio, costo) VALUES ('Hub USB-C', 'Electrónica', 450, 260); UPDATE productos SET precio = precio * 0.95 WHERE categoria = 'Electrónica';", verify: "SELECT nombre, ROUND(precio, 2) AS precio FROM productos WHERE categoria = 'Electrónica' ORDER BY nombre;", hints: ['Primero el INSERT, luego el UPDATE: así el producto nuevo también recibe el descuento.', "UPDATE productos SET precio = precio * 0.95 WHERE categoria = 'Electrónica';"] },
      { level: 'Reto', type: 'sql-modify', prompt: 'Elimina los pedidos cancelados de 2023 junto con sus líneas de detalle. Borra primero las líneas para no dejar datos huérfanos.', starter: "DELETE FROM detalle_pedidos\nWHERE pedido_id IN (\n    \n);\n\nDELETE FROM pedidos\nWHERE ;", solution: "DELETE FROM detalle_pedidos WHERE pedido_id IN (SELECT id FROM pedidos WHERE estado = 'Cancelado' AND fecha < '2024-01-01'); DELETE FROM pedidos WHERE estado = 'Cancelado' AND fecha < '2024-01-01';", verify: 'SELECT (SELECT COUNT(*) FROM pedidos) AS pedidos, (SELECT COUNT(*) FROM detalle_pedidos) AS lineas;', hints: ["La subconsulta es SELECT id FROM pedidos WHERE estado = 'Cancelado' AND fecha < '2024-01-01'.", 'El segundo DELETE usa la misma condición sobre pedidos.'] }
    ]
  };
  for (const [id, list] of Object.entries(more)) if (L[id]) L[id].extra = [...(L[id].extra || []), ...list];

  /* ============================================================ GUÍAS DE USO
     Por cada instrucción: sintaxis, qué hace cada parte, cuándo usarla, cómo leerla
     y un antes/después que se calcula con datos reales al abrir la lección. */
  const guides = {
    'sql-0': [
      { name: 'SELECT * … LIMIT: mirar una tabla', syntax: 'SELECT *\nFROM nombre_tabla\nLIMIT 5;',
        parts: [['SELECT *', 'El asterisco pide todas las columnas. Úsalo solo para explorar; en un reporte nombra las columnas.'], ['FROM nombre_tabla', 'La tabla que quieres ver. El nombre debe ser exacto.'], ['LIMIT 5', 'Muestra solo 5 filas, suficiente para entender qué hay.']],
        when: 'Siempre que llegues a una tabla nueva: antes de filtrar o sumar, mira cómo son sus datos.',
        read: 'Muéstrame todas las columnas de clientes, solo 5 filas.',
        demo: { after: 'SELECT * FROM clientes LIMIT 5', note: 'Cinco filas bastan para ver los nombres de las columnas, los formatos (las fechas son AAAA-MM-DD) y que correo puede venir vacío.' } }
    ],
    'sql-1': [
      { name: 'SELECT y FROM: elegir columnas', syntax: 'SELECT columna1, columna2, expresión AS alias\nFROM tabla\nLIMIT n;',
        parts: [['SELECT', 'Empieza toda consulta. Después va la lista de columnas que quieres ver, separadas por comas, en el orden en que quieres verlas.'], ['expresión', 'Un cálculo con columnas: precio - costo, salario * 12. Se calcula fila por fila.'], ['AS alias', 'El nombre que tendrá la columna en el resultado. Opcional, pero imprescindible para las calculadas.'], ['FROM tabla', 'De qué tabla salen los datos.'], ['LIMIT n', 'Opcional. Corta el resultado a n filas.']],
        when: 'En todas las consultas. Pide solo las columnas que necesitas: el resultado es más claro y más rápido.',
        read: 'Dame el nombre y el margen (precio menos costo) de cada producto.',
        demo: { before: 'SELECT * FROM productos LIMIT 4', after: 'SELECT nombre, precio - costo AS margen FROM productos LIMIT 4', note: 'Las cinco columnas originales se convierten en dos: una existente y una calculada que no existe en la tabla.' } }
    ],
    'sql-2': [
      { name: 'WHERE: quedarte solo con las filas que cumplen', syntax: "SELECT columnas\nFROM tabla\nWHERE columna operador valor\n  AND otra_condición;",
        parts: [['WHERE', 'Va después de FROM. Revisa cada fila y conserva solo las que cumplen la condición.'], ['operador', '= igual, <> distinto, > mayor, < menor, >= mayor o igual, <= menor o igual.'], ['valor', "Números tal cual (1000). Textos y fechas entre comillas simples ('Hogar', '2024-01-01')."], ['AND / OR / NOT', 'AND exige las dos condiciones, OR basta con una, NOT invierte. Si mezclas AND con OR, usa paréntesis.']],
        when: 'Cada vez que la pregunta diga "solo los…", "los de…", "los que…": solo los pedidos cancelados, los clientes de Lima, los productos de menos de 500.',
        read: 'Dame los productos de Hogar u Oficina que cuesten menos de 1000.',
        demo: { before: "SELECT nombre, categoria, precio FROM productos WHERE categoria IN ('Hogar', 'Oficina')", after: "SELECT nombre, categoria, precio FROM productos WHERE categoria IN ('Hogar', 'Oficina') AND precio < 1000", note: 'La segunda condición elimina las filas de 1000 o más. Las columnas no cambian; solo desaparecen filas.' } },
      { name: 'IN, BETWEEN, LIKE e IS NULL: atajos para condiciones', syntax: "WHERE estado IN ('Cancelado', 'Devuelto')\nWHERE precio BETWEEN 100 AND 500\nWHERE nombre LIKE 'Mar%'\nWHERE correo IS NULL",
        parts: [['IN (lista)', 'Equivale a varios OR: estado = A OR estado = B.'], ['BETWEEN a AND b', 'Rango que incluye los dos extremos. Sirve para números y fechas.'], ['LIKE patrón', '% significa "cualquier texto" y _ "un carácter". \'Mar%\' empieza con Mar; \'%ez\' termina en ez; \'%ana%\' contiene ana.'], ['IS NULL / IS NOT NULL', 'La única forma correcta de buscar datos vacíos.']],
        when: 'Cuando la condición tiene varios valores posibles, un rango o un patrón de texto.',
        read: 'Dame los clientes cuyo nombre empieza con Mar.',
        demo: { after: "SELECT nombre, ciudad FROM clientes WHERE nombre LIKE 'Mar%'", note: 'Encuentra María, Marcos, Mariana, Martín, Marta y Mario: todos empiezan con "Mar", sin importar lo que siga.' } }
    ],
    'sql-3': [
      { name: 'ORDER BY y LIMIT: ordenar y quedarte con los primeros', syntax: 'SELECT columnas\nFROM tabla\nORDER BY columna1 DESC, columna2 ASC\nLIMIT n;',
        parts: [['ORDER BY columna', 'Ordena el resultado por esa columna. Puedes usar un alias del SELECT.'], ['ASC / DESC', 'ASC de menor a mayor (o A a Z), es el valor por defecto. DESC de mayor a menor.'], ['columna2', 'Desempate: se usa solo cuando dos filas tienen el mismo valor en la primera.'], ['LIMIT n', 'Siempre al final. Con ORDER BY forma el patrón "top N".']],
        when: 'Para cualquier ranking: los 5 más caros, los 10 clientes que más compran, los empleados más recientes.',
        read: 'Dame los 5 empleados que más ganan.',
        demo: { before: 'SELECT nombre, departamento, salario FROM empleados', after: 'SELECT nombre, departamento, salario FROM empleados ORDER BY salario DESC LIMIT 5', note: 'Primero se ordena toda la tabla de mayor a menor salario y después se cortan las 5 primeras filas.' } },
      { name: 'DISTINCT: ver cada valor una sola vez', syntax: 'SELECT DISTINCT columna\nFROM tabla;',
        parts: [['DISTINCT', 'Va justo después de SELECT y elimina las filas repetidas del resultado.'], ['columna', 'Si pones varias columnas, se eliminan las combinaciones repetidas, no cada columna por separado.']],
        when: 'Para saber qué valores existen: qué países, qué estados, qué categorías.',
        read: '¿En qué países tenemos clientes?',
        demo: { before: 'SELECT pais FROM clientes LIMIT 12', after: 'SELECT DISTINCT pais FROM clientes ORDER BY pais', note: 'La columna pais tiene 40 filas con muchos México repetidos; DISTINCT las reduce a los 6 países distintos.' } }
    ],
    'sql-4': [
      { name: 'Funciones agregadas: resumir muchas filas en un número', syntax: 'SELECT COUNT(*) AS filas,\n       SUM(columna) AS total,\n       AVG(columna) AS promedio,\n       MIN(columna) AS minimo,\n       MAX(columna) AS maximo\nFROM tabla;',
        parts: [['COUNT(*)', 'Cuenta filas.'], ['COUNT(columna)', 'Cuenta solo las filas donde esa columna no es NULL.'], ['SUM / AVG', 'Suma y promedio de una columna numérica.'], ['MIN / MAX', 'El valor más pequeño y el más grande. Funciona también con fechas y textos.']],
        when: 'Cuando la pregunta pide un total, un conteo o un promedio: cuántos pedidos hay, cuánto suma la nómina.',
        read: '¿Cuántos empleados hay en Ventas, cuánto suman sus salarios y cuál es el promedio?',
        demo: { before: "SELECT nombre, salario FROM empleados WHERE departamento = 'Ventas'", after: "SELECT COUNT(*) AS empleados, SUM(salario) AS nomina, AVG(salario) AS promedio FROM empleados WHERE departamento = 'Ventas'", note: 'Cinco filas se resumen en una sola. Sin GROUP BY, las agregadas siempre devuelven una fila.' } },
      { name: 'GROUP BY: un resumen por cada grupo', syntax: 'SELECT columna_grupo,\n       AGREGADA(columna) AS alias\nFROM tabla\nGROUP BY columna_grupo;',
        parts: [['columna_grupo', 'La columna que define los grupos: cada valor distinto será una fila del resultado.'], ['AGREGADA(columna)', 'Se calcula dentro de cada grupo por separado.'], ['GROUP BY', 'Va después de WHERE. Debe incluir todas las columnas del SELECT que no estén dentro de una agregada.']],
        when: 'Cuando la pregunta dice "por": ventas por mes, empleados por departamento, pedidos por estado.',
        read: 'Para cada departamento, dame cuántos empleados tiene y su salario promedio.',
        demo: { before: 'SELECT departamento, nombre, salario FROM empleados ORDER BY departamento', after: 'SELECT departamento, COUNT(*) AS empleados, ROUND(AVG(salario), 2) AS promedio FROM empleados GROUP BY departamento', note: 'Las 12 filas se reparten en 5 montones, uno por departamento, y cada montón se resume en una fila.' } }
    ],
    'sql-5': [
      { name: 'HAVING: filtrar los grupos ya resumidos', syntax: 'SELECT columna_grupo, AGREGADA(columna) AS alias\nFROM tabla\nWHERE condición_de_filas\nGROUP BY columna_grupo\nHAVING condición_con_agregada;',
        parts: [['WHERE', 'Filtra filas antes de agrupar. No puede usar COUNT, SUM, etc.'], ['HAVING', 'Filtra grupos después de agrupar. Es donde van las condiciones con agregadas.'], ['condición_con_agregada', 'Por ejemplo COUNT(*) >= 5 o SUM(importe) > 100000.']],
        when: 'Cuando el filtro es sobre el resumen: los países con al menos 5 clientes, los vendedores con más de 60 pedidos.',
        read: 'Dame los países que tienen 5 clientes o más.',
        demo: { before: 'SELECT pais, COUNT(*) AS clientes FROM clientes GROUP BY pais', after: 'SELECT pais, COUNT(*) AS clientes FROM clientes GROUP BY pais HAVING COUNT(*) >= 5', note: 'Primero se cuentan los clientes de los 6 países; HAVING descarta los grupos con menos de 5.' } }
    ],
    'sql-6': [
      { name: 'JOIN: traer columnas de otra tabla', syntax: 'SELECT a.columna, b.columna\nFROM tabla_a AS a\nJOIN tabla_b AS b ON b.id = a.tabla_b_id;',
        parts: [['tabla_a AS a', 'La tabla principal con un alias corto. El alias evita escribir el nombre completo.'], ['JOIN tabla_b AS b', 'La tabla de la que quieres traer columnas. JOIN a secas es INNER JOIN.'], ['ON b.id = a.tabla_b_id', 'La regla de emparejamiento: la clave primaria de una tabla con la clave foránea de la otra. Revísala en el diagrama.'], ['a.columna / b.columna', 'Antepón el alias para indicar de qué tabla sale cada columna.']],
        when: 'Cuando los datos que necesitas están en dos tablas: el pedido tiene cliente_id pero tú necesitas el nombre del cliente.',
        read: 'Para cada pedido, busca el cliente cuyo id es igual a cliente_id y dame su nombre.',
        demo: { before: 'SELECT id, cliente_id, fecha FROM pedidos ORDER BY id LIMIT 5', after: 'SELECT p.id, p.cliente_id, c.nombre AS cliente, p.fecha FROM pedidos p JOIN clientes c ON c.id = p.cliente_id ORDER BY p.id LIMIT 5', note: 'El número cliente_id se convierte en un nombre legible. Las filas siguen siendo una por pedido.' } },
      { name: 'LEFT JOIN: conservar las filas sin pareja', syntax: 'SELECT a.columna, b.columna\nFROM tabla_a AS a\nLEFT JOIN tabla_b AS b ON b.a_id = a.id;',
        parts: [['LEFT JOIN', 'Conserva todas las filas de la tabla de la izquierda (la del FROM), tengan o no pareja.'], ['sin pareja', 'Las columnas de la tabla derecha quedan en NULL.'], ['WHERE b.id IS NULL', 'Patrón para encontrar "los que no tienen": clientes sin pedidos, empleados sin ventas.']],
        when: 'Cuando no quieres perder a nadie en el resultado, o cuando buscas precisamente a los que no tienen coincidencia.',
        read: 'Dame todos los empleados con su número de pedidos, aunque sea cero.',
        demo: { before: 'SELECT e.nombre, COUNT(p.id) AS pedidos FROM empleados e JOIN pedidos p ON p.empleado_id = e.id GROUP BY e.id', after: 'SELECT e.nombre, COUNT(p.id) AS pedidos FROM empleados e LEFT JOIN pedidos p ON p.empleado_id = e.id GROUP BY e.id', note: 'Con JOIN solo aparecen los 5 vendedores. Con LEFT JOIN aparecen los 12 empleados; los que no venden quedan con 0.' } }
    ],
    'sql-7': [
      { name: 'La receta del reporte: unir, filtrar, agrupar', syntax: 'SELECT dimension,\n       COUNT(DISTINCT p.id) AS pedidos,\n       SUM(d.cantidad * d.precio_unitario) AS total\nFROM pedidos p\nJOIN detalle_pedidos d ON d.pedido_id = p.id\nJOIN otra_tabla x ON x.id = p.otra_id\nWHERE filtro\nGROUP BY dimension\nORDER BY total DESC;',
        parts: [['FROM pedidos JOIN detalle_pedidos', 'Une la cabecera con sus líneas: el dinero está en el detalle.'], ['JOIN otra_tabla', 'Trae la dimensión por la que quieres agrupar: cliente, producto, vendedor.'], ['WHERE', 'Filtra antes de sumar, por ejemplo solo pedidos entregados.'], ['COUNT(DISTINCT p.id)', 'Cuenta pedidos y no líneas.'], ['GROUP BY dimension', 'Una fila por cliente, producto o vendedor.']],
        when: 'Para casi cualquier reporte de negocio: ventas por cliente, ingreso por categoría, ranking de vendedores.',
        read: 'Para el cliente 3, dame cuántos pedidos tiene y cuánto ha comprado en total.',
        demo: { before: 'SELECT p.id AS pedido, c.nombre AS cliente, d.cantidad * d.precio_unitario AS importe FROM pedidos p JOIN clientes c ON c.id = p.cliente_id JOIN detalle_pedidos d ON d.pedido_id = p.id WHERE c.id = 3 ORDER BY p.id LIMIT 10', after: 'SELECT c.nombre AS cliente, COUNT(DISTINCT p.id) AS pedidos, SUM(d.cantidad * d.precio_unitario) AS total FROM pedidos p JOIN clientes c ON c.id = p.cliente_id JOIN detalle_pedidos d ON d.pedido_id = p.id WHERE c.id = 3 GROUP BY c.id', note: 'Antes: una fila por línea de producto, con pedidos repetidos. Después: una sola fila con los pedidos distintos y la suma de todos los importes.' } }
    ],
    'sql-8': [
      { name: 'Subconsulta: usar el resultado de otra consulta', syntax: 'SELECT columnas\nFROM tabla\nWHERE columna > (SELECT AVG(columna) FROM tabla);',
        parts: [['( … )', 'Una consulta completa entre paréntesis. Se ejecuta primero.'], ['valor único', 'Si devuelve un solo número, la usas como cualquier número: en WHERE, en SELECT o en un cálculo.'], ['IN ( … )', 'Si devuelve una lista de valores, úsala con IN.']],
        when: 'Cuando para responder necesitas antes un dato calculado: el promedio, el máximo, la lista de clientes que devolvieron algo.',
        read: 'Dame los productos más caros que el precio promedio.',
        demo: { before: 'SELECT ROUND(AVG(precio), 2) AS promedio FROM productos', after: 'SELECT nombre, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) ORDER BY precio DESC', note: 'La subconsulta calcula el promedio (izquierda) y la consulta principal lo usa como límite (derecha).' } },
      { name: 'WITH: ponerle nombre a un paso intermedio', syntax: 'WITH nombre_paso AS (\n    SELECT …\n)\nSELECT …\nFROM nombre_paso;',
        parts: [['WITH nombre_paso AS', 'Define una tabla temporal con nombre que solo existe durante esta consulta.'], ['( SELECT … )', 'La consulta que calcula el paso intermedio.'], ['FROM nombre_paso', 'Abajo la usas como si fuera una tabla más. Puedes encadenar varios pasos separados por comas.']],
        when: 'Cuando la pregunta tiene dos etapas: primero calcular el total de cada pedido y después analizar esos totales.',
        read: 'Primero calcula el importe de cada pedido; después dime el mayor y el promedio.',
        demo: { before: 'SELECT pedido_id, SUM(cantidad * precio_unitario) AS importe FROM detalle_pedidos GROUP BY pedido_id LIMIT 6', after: 'WITH t AS (SELECT pedido_id, SUM(cantidad * precio_unitario) AS importe FROM detalle_pedidos GROUP BY pedido_id) SELECT COUNT(*) AS pedidos, MAX(importe) AS mayor, ROUND(AVG(importe), 2) AS promedio FROM t', note: 'El paso t (izquierda, primeras filas) tiene un importe por pedido. La consulta final resume esa tabla intermedia.' } }
    ],
    'sql-9': [
      { name: 'CASE WHEN: crear categorías con reglas', syntax: "CASE\n    WHEN condición1 THEN 'valor1'\n    WHEN condición2 THEN 'valor2'\n    ELSE 'valor por defecto'\nEND AS alias",
        parts: [['WHEN … THEN …', 'Si la condición se cumple, devuelve ese valor. Se revisan en orden y gana la primera verdadera.'], ['ELSE', 'Lo que devuelve si ninguna se cumple. Sin ELSE devuelve NULL.'], ['END AS alias', 'Cierra el CASE y le pone nombre a la columna nueva.']],
        when: 'Para clasificar (gamas de precio, antigüedad, segmentos) y para contar condicionalmente dentro de SUM.',
        read: 'Si el precio es 3000 o más, ponle Premium; si es 800 o más, Medio; si no, Económico.',
        demo: { before: "SELECT nombre, precio FROM productos WHERE categoria = 'Oficina'", after: "SELECT nombre, precio, CASE WHEN precio >= 3000 THEN 'Premium' WHEN precio >= 800 THEN 'Medio' ELSE 'Económico' END AS gama FROM productos WHERE categoria = 'Oficina'", note: 'Las filas no cambian; se añade una columna calculada con la regla.' } },
      { name: 'strftime: sacar partes de una fecha', syntax: "strftime('%Y', fecha)     -- año: 2024\nstrftime('%m', fecha)     -- mes: 07\nstrftime('%Y-%m', fecha)  -- año-mes: 2024-07\njulianday(f2) - julianday(f1)  -- días entre fechas",
        parts: [["'%Y'", 'Año de cuatro dígitos.'], ["'%m' y '%d'", 'Mes y día con dos dígitos.'], ["'%Y-%m'", 'Año-mes: el formato ideal para agrupar por mes, porque se ordena bien.'], ['julianday', 'Convierte una fecha en número de días para poder restarlas.']],
        when: 'Para agrupar por año o por mes y para calcular antigüedad o días transcurridos. En SQL Server se usa YEAR() y FORMAT(); en PostgreSQL, EXTRACT y DATE_TRUNC.',
        read: 'De cada pedido, dame su año, su mes y su año-mes.',
        demo: { before: 'SELECT id, fecha FROM pedidos LIMIT 4', after: "SELECT id, fecha, strftime('%Y', fecha) AS anio, strftime('%m', fecha) AS mes, strftime('%Y-%m', fecha) AS anio_mes FROM pedidos LIMIT 4", note: 'De una sola fecha salen tres columnas listas para agrupar.' } }
    ],
    'sql-10': [
      { name: 'OVER: calcular sobre un grupo sin perder filas', syntax: 'FUNCIÓN(columna) OVER (\n    PARTITION BY columna_grupo\n    ORDER BY columna_orden\n) AS alias',
        parts: [['FUNCIÓN', 'ROW_NUMBER, RANK o DENSE_RANK para numerar; SUM, AVG, COUNT para totales y promedios; LAG y LEAD para la fila anterior o la siguiente.'], ['PARTITION BY', 'Opcional. Divide las filas en grupos; el cálculo se reinicia en cada grupo.'], ['ORDER BY (dentro de OVER)', 'Opcional. Ordena dentro del grupo; necesario para rankings, acumulados y LAG.'], ['Diferencia con GROUP BY', 'GROUP BY colapsa las filas. OVER las mantiene todas y añade una columna.']],
        when: 'Rankings por grupo, comparar cada fila con el promedio de su grupo, acumulados y variaciones contra el periodo anterior.',
        read: 'Para cada empleado, dame su puesto dentro de su departamento y el salario promedio de ese departamento.',
        demo: { before: "SELECT nombre, departamento, salario FROM empleados WHERE departamento IN ('Ventas', 'Logística') ORDER BY departamento", after: "SELECT nombre, departamento, salario, RANK() OVER (PARTITION BY departamento ORDER BY salario DESC) AS puesto, ROUND(AVG(salario) OVER (PARTITION BY departamento), 2) AS prom_depto FROM empleados WHERE departamento IN ('Ventas', 'Logística') ORDER BY departamento, puesto", note: 'Siguen las mismas 8 filas. Cada una gana su puesto y el promedio de su departamento, calculados por separado para Ventas y Logística.' } }
    ],
    'sql-11': [
      { name: 'UPDATE: cambiar valores existentes', syntax: 'UPDATE tabla\nSET columna = nuevo_valor\nWHERE condición;',
        parts: [['UPDATE tabla', 'La tabla que vas a modificar.'], ['SET columna = valor', 'Qué columna cambia y a qué valor. Puede usar la columna misma: precio = precio * 1.05. Varias se separan con comas.'], ['WHERE', 'Qué filas cambian. Sin WHERE cambian todas.']],
        when: 'Corregir un dato, aplicar un aumento, actualizar un estado.',
        read: 'Sube 5% el precio de los productos de Oficina.',
        demo: { before: "SELECT nombre, precio FROM productos WHERE categoria = 'Oficina'", after: "UPDATE productos SET precio = ROUND(precio * 1.05, 2) WHERE categoria = 'Oficina'; SELECT nombre, precio FROM productos WHERE categoria = 'Oficina'", note: 'Antes y después del UPDATE. Esta vista usa una copia de la base, así que no altera tus ejercicios.' } },
      { name: 'INSERT y DELETE: agregar y borrar filas', syntax: "INSERT INTO tabla (columna1, columna2)\nVALUES ('valor1', 'valor2');\n\nDELETE FROM tabla\nWHERE condición;",
        parts: [['INSERT INTO tabla (columnas)', 'Nombra las columnas que vas a llenar; las demás quedan con su valor por defecto o NULL. El id se genera solo.'], ['VALUES (…)', 'Los valores en el mismo orden que las columnas.'], ['DELETE FROM … WHERE', 'Borra las filas que cumplen la condición. Prueba antes el mismo WHERE con un SELECT.']],
        when: 'Dar de alta un registro nuevo o eliminar registros duplicados, de prueba u obsoletos.',
        read: 'Agrega el producto Hub USB-C de Electrónica.',
        demo: { after: "INSERT INTO productos (nombre, categoria, precio, costo) VALUES ('Hub USB-C', 'Electrónica', 450, 260); SELECT id, nombre, categoria, precio FROM productos ORDER BY id DESC LIMIT 3", note: 'El producto nuevo recibe el id 21 automáticamente. También en una copia de la base.' } }
    ]
  };
  for (const [id, g] of Object.entries(guides)) { const lesson = sql.lessons.find(x => x.id === id); if (lesson) lesson.guide = g; }

  /* Plan: la lección de la base va primero */
  if (C.plan[0] && !C.plan[0].lessons.includes('sql-0')) C.plan[0].lessons.splice(2, 0, 'sql-0');
})();
