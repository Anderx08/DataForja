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

  /* Plan: la lección de la base va primero */
  if (C.plan[0] && !C.plan[0].lessons.includes('sql-0')) C.plan[0].lessons.splice(2, 0, 'sql-0');
})();
