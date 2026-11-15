/* DataForja — base de datos de práctica (SQLite en el navegador).
   Datos generados de forma determinista para que los ejercicios siempre den el mismo resultado. */
window.SQLDB = (function () {
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  const rand = rng(20241113);
  const pick = arr => arr[Math.floor(rand() * arr.length)];
  const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const pad = n => String(n).padStart(2, '0');
  const q = s => "'" + String(s).replace(/'/g, "''") + "'";

  /* ---- clientes ---- */
  const ciudades = [
    ['Monterrey', 'México'], ['Guadalajara', 'México'], ['Ciudad de México', 'México'], ['Querétaro', 'México'],
    ['Puebla', 'México'], ['Bogotá', 'Colombia'], ['Medellín', 'Colombia'], ['Lima', 'Perú'],
    ['Santiago', 'Chile'], ['Buenos Aires', 'Argentina'], ['San José', 'Costa Rica']
  ];
  const nombresCli = [
    'María Fernández', 'Juan Pérez', 'Lucía Prado', 'Carlos Ortega', 'Ana Beltrán', 'Marcos Ruiz', 'Sofía Castillo',
    'Diego Navarro', 'Valentina Ríos', 'Martín Salas', 'Camila Torres', 'Andrés Molina', 'Mariana López', 'Jorge Herrera',
    'Paula Vega', 'Ricardo Peña', 'Daniela Cruz', 'Fernando Ibarra', 'Gabriela Soto', 'Héctor Lara', 'Isabel Mendoza',
    'Pablo Guerrero', 'Renata Flores', 'Sebastián Aguilar', 'Marta Delgado', 'Tomás Carrillo', 'Elena Quintero',
    'Rodrigo Campos', 'Natalia Rojas', 'Óscar Varela', 'Carolina Núñez', 'Emilio Serrano', 'Patricia Luna', 'Raúl Cordero',
    'Julia Benítez', 'Alejandro Paredes', 'Verónica Márquez', 'Mario Escobar', 'Adriana Villalobos', 'Gustavo Montes'
  ];
  const segmentos = ['Corporativo', 'Pyme', 'Particular'];
  const clientes = nombresCli.map((nombre, i) => {
    const [ciudad, pais] = ciudades[i % ciudades.length];
    const y = between(2019, 2024), m = between(1, 12), d = between(1, 28);
    const correo = rand() < 0.12 ? null : nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(' ', '.') + '@correo.com';
    return { id: i + 1, nombre, ciudad, pais, segmento: segmentos[i % 3 === 0 ? 0 : (i % 3 === 1 ? 1 : 2)], fecha_alta: `${y}-${pad(m)}-${pad(d)}`, correo };
  });

  /* ---- productos ---- */
  const productos = [
    ['Mouse inalámbrico', 'Electrónica', 250, 140], ['Teclado mecánico', 'Electrónica', 900, 520], ['Monitor 24"', 'Electrónica', 4200, 3100],
    ['Audífonos BT', 'Electrónica', 899, 480], ['Webcam HD', 'Electrónica', 650, 380], ['Disco SSD 1TB', 'Electrónica', 1500, 1050],
    ['Cafetera', 'Hogar', 1200, 700], ['Licuadora', 'Hogar', 780, 420], ['Lámpara LED', 'Hogar', 350, 160],
    ['Aspiradora', 'Hogar', 2900, 1900], ['Set de sartenes', 'Hogar', 1450, 800],
    ['Silla ergonómica', 'Oficina', 3800, 2300], ['Escritorio', 'Oficina', 5200, 3400], ['Archivero', 'Oficina', 2100, 1300],
    ['Resma de papel', 'Oficina', 95, 60], ['Pizarrón blanco', 'Oficina', 680, 390],
    ['Bicicleta urbana', 'Deportes', 6500, 4300], ['Mancuernas 10kg', 'Deportes', 900, 520], ['Tapete yoga', 'Deportes', 320, 150],
    ['Botella térmica', 'Deportes', 280, 120]
  ].map((p, i) => ({ id: i + 1, nombre: p[0], categoria: p[1], precio: p[2], costo: p[3] }));

  /* ---- empleados ---- */
  const empleados = [
    { id: 1, nombre: 'Laura Montiel', departamento: 'Dirección', salario: 95000, fecha_ingreso: '2015-03-02', jefe_id: null },
    { id: 2, nombre: 'Ana López', departamento: 'Ventas', salario: 38000, fecha_ingreso: '2018-06-11', jefe_id: 1 },
    { id: 3, nombre: 'Luis Mora', departamento: 'Ventas', salario: 34500, fecha_ingreso: '2021-02-15', jefe_id: 2 },
    { id: 4, nombre: 'Sara Ruiz', departamento: 'Ventas', salario: 36000, fecha_ingreso: '2019-09-01', jefe_id: 2 },
    { id: 5, nombre: 'Pedro Díaz', departamento: 'Ventas', salario: 29000, fecha_ingreso: '2023-04-17', jefe_id: 2 },
    { id: 6, nombre: 'Marta Gil', departamento: 'Ventas', salario: 31000, fecha_ingreso: '2022-11-07', jefe_id: 2 },
    { id: 7, nombre: 'Iván Soto', departamento: 'Logística', salario: 27000, fecha_ingreso: '2020-01-20', jefe_id: 1 },
    { id: 8, nombre: 'Rosa Medina', departamento: 'Logística', salario: 25500, fecha_ingreso: '2024-02-05', jefe_id: 7 },
    { id: 9, nombre: 'Jorge Lira', departamento: 'Logística', salario: 26000, fecha_ingreso: '2017-08-14', jefe_id: 7 },
    { id: 10, nombre: 'Elena Prieto', departamento: 'Finanzas', salario: 52000, fecha_ingreso: '2016-05-30', jefe_id: 1 },
    { id: 11, nombre: 'Hugo Cano', departamento: 'Finanzas', salario: 41000, fecha_ingreso: '2022-03-21', jefe_id: 10 },
    { id: 12, nombre: 'Nadia Ferrer', departamento: 'Soporte', salario: 24000, fecha_ingreso: '2023-10-09', jefe_id: 1 }
  ];
  const vendedores = [2, 3, 4, 5, 6];

  /* ---- pedidos + detalle ---- */
  const estados = ['Entregado', 'Entregado', 'Entregado', 'Entregado', 'Entregado', 'En camino', 'Pendiente', 'Cancelado', 'Devuelto'];
  const pedidos = [], detalle = [];
  // pesos: algunos clientes compran mucho, otros nunca
  const sinPedidos = new Set([7, 19, 33, 38]);
  const frecuentes = new Set([1, 3, 8, 14, 22, 27]);
  let detId = 1;
  for (let id = 1; id <= 320; id++) {
    let cliente;
    if (rand() < 0.35) cliente = pick([...frecuentes]);
    else { do { cliente = between(1, clientes.length); } while (sinPedidos.has(cliente)); }
    const y = rand() < 0.45 ? 2023 : 2024, m = between(1, 12), d = between(1, 28);
    const estado = pick(estados);
    pedidos.push({ id, cliente_id: cliente, empleado_id: pick(vendedores), fecha: `${y}-${pad(m)}-${pad(d)}`, estado });
    const lineas = between(1, 4);
    const usados = new Set();
    for (let k = 0; k < lineas; k++) {
      let prod; do { prod = between(1, productos.length); } while (usados.has(prod));
      usados.add(prod);
      const p = productos[prod - 1];
      const descuento = rand() < 0.2 ? 0.9 : 1;
      detalle.push({ id: detId++, pedido_id: id, producto_id: prod, cantidad: p.precio > 3000 ? between(1, 2) : between(1, 12), precio_unitario: Math.round(p.precio * descuento * 100) / 100 });
    }
  }
  pedidos.sort((a, b) => a.fecha < b.fecha ? -1 : 1).forEach((p, i) => { const old = p.id; p.id = i + 1; p._old = old; });
  const remap = {}; pedidos.forEach(p => { remap[p._old] = p.id; delete p._old; });
  detalle.forEach(d => { d.pedido_id = remap[d.pedido_id]; });
  detalle.sort((a, b) => a.pedido_id - b.pedido_id).forEach((d, i) => { d.id = i + 1; });

  const v = x => x === null || x === undefined ? 'NULL' : (typeof x === 'number' ? x : q(x));
  let sql = `
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, ciudad TEXT, pais TEXT, segmento TEXT, fecha_alta TEXT, correo TEXT);
CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, categoria TEXT, precio REAL, costo REAL);
CREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, departamento TEXT, salario REAL, fecha_ingreso TEXT, jefe_id INTEGER REFERENCES empleados(id));
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER REFERENCES clientes(id), empleado_id INTEGER REFERENCES empleados(id), fecha TEXT, estado TEXT);
CREATE TABLE detalle_pedidos (id INTEGER PRIMARY KEY, pedido_id INTEGER REFERENCES pedidos(id), producto_id INTEGER REFERENCES productos(id), cantidad INTEGER, precio_unitario REAL);
`;
  sql += 'INSERT INTO clientes VALUES ' + clientes.map(c => `(${c.id},${v(c.nombre)},${v(c.ciudad)},${v(c.pais)},${v(c.segmento)},${v(c.fecha_alta)},${v(c.correo)})`).join(',') + ';\n';
  sql += 'INSERT INTO productos VALUES ' + productos.map(p => `(${p.id},${v(p.nombre)},${v(p.categoria)},${p.precio},${p.costo})`).join(',') + ';\n';
  sql += 'INSERT INTO empleados VALUES ' + empleados.map(e => `(${e.id},${v(e.nombre)},${v(e.departamento)},${e.salario},${v(e.fecha_ingreso)},${v(e.jefe_id)})`).join(',') + ';\n';
  sql += 'INSERT INTO pedidos VALUES ' + pedidos.map(p => `(${p.id},${p.cliente_id},${p.empleado_id},${v(p.fecha)},${v(p.estado)})`).join(',') + ';\n';
  sql += 'INSERT INTO detalle_pedidos VALUES ' + detalle.map(d => `(${d.id},${d.pedido_id},${d.producto_id},${d.cantidad},${d.precio_unitario})`).join(',') + ';\n';

  const schema = [
    { table: 'clientes', desc: 'Quién compra', cols: ['id', 'nombre', 'ciudad', 'pais', 'segmento', 'fecha_alta', 'correo'], rows: clientes.length },
    { table: 'productos', desc: 'Catálogo con precio y costo', cols: ['id', 'nombre', 'categoria', 'precio', 'costo'], rows: productos.length },
    { table: 'empleados', desc: 'Equipo; jefe_id apunta a empleados.id', cols: ['id', 'nombre', 'departamento', 'salario', 'fecha_ingreso', 'jefe_id'], rows: empleados.length },
    { table: 'pedidos', desc: 'Una fila por pedido', cols: ['id', 'cliente_id', 'empleado_id', 'fecha', 'estado'], rows: pedidos.length },
    { table: 'detalle_pedidos', desc: 'Líneas de cada pedido', cols: ['id', 'pedido_id', 'producto_id', 'cantidad', 'precio_unitario'], rows: detalle.length }
  ];

  return { sql, schema };
})();
