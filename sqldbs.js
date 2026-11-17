/* DataForja — bases de datos de otros negocios, con datos sucios a propósito.
   rrhh: Grupo Talento (servicios). inventario: Ferretera del Norte (distribución).
   Datos deterministas: los ejercicios siempre dan lo mismo. */
window.SQLDBS = (function () {
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const pad = n => String(n).padStart(2, '0');
  const q = s => s === null || s === undefined ? 'NULL' : typeof s === 'number' ? s : "'" + String(s).replace(/'/g, "''") + "'";
  const insert = (table, rows) => rows.length ? `INSERT INTO ${table} VALUES ${rows.map(r => '(' + r.map(q).join(',') + ')').join(',')};\n` : '';

  /* ============================================================ RRHH */
  const rrhh = (() => {
    const rand = rng(4242);
    const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
    const pick = a => a[Math.floor(rand() * a.length)];
    const deps = [[1, 'Operaciones', 2400000], [2, 'Ventas', 1800000], [3, 'Tecnología', 2100000], [4, 'Finanzas', 900000], [5, 'Recursos Humanos', 600000], [6, 'Atención a Clientes', 1200000]];
    const puestos = { 1: ['Analista de operaciones', 'Coordinador logístico', 'Supervisor'], 2: ['Ejecutivo de ventas', 'Gerente de cuenta'], 3: ['Desarrollador', 'Analista de datos', 'Soporte técnico'], 4: ['Contador', 'Analista financiero'], 5: ['Reclutador', 'Generalista de RH'], 6: ['Agente', 'Supervisor de turno'] };
    const nombres = ['Ana', 'Luis', 'Sofía', 'Carlos', 'Valeria', 'Jorge', 'Camila', 'Diego', 'Mariana', 'Andrés', 'Daniela', 'Ricardo', 'Paula', 'Héctor', 'Lucía', 'Fernando', 'Gabriela', 'Pablo', 'Renata', 'Tomás', 'Elena', 'Rodrigo', 'Natalia', 'Óscar', 'Carolina', 'Emilio', 'Patricia', 'Raúl', 'Julia', 'Mario'];
    const apellidos = ['García', 'Martínez', 'López', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Ortiz', 'Castillo', 'Vargas'];
    const ciudades = ['Ciudad de México', 'CDMX', 'cdmx', 'Guadalajara', 'guadalajara ', 'Monterrey', 'Monterrey', 'Puebla'];
    const emps = [];
    for (let id = 1; id <= 64; id++) {
      const dep = deps[(id * 7) % deps.length][0];
      let nombre = pick(nombres) + ' ' + pick(apellidos);
      const dirt = rand();
      if (dirt < 0.12) nombre = '  ' + nombre + ' ';
      else if (dirt < 0.22) nombre = nombre.toUpperCase();
      else if (dirt < 0.3) nombre = nombre.toLowerCase();
      const y = between(2018, 2024), m = between(1, 12), d = between(1, 28);
      const ingreso = `${y}-${pad(m)}-${pad(d)}`;
      let baja = null;
      if (rand() < 0.28) { const by = Math.min(2024, y + between(0, 3)); const bm = by === y ? Math.min(12, m + between(1, 6)) : between(1, 12); baja = `${by}-${pad(bm)}-${pad(between(1, 28))}`; }
      const base = { 1: 18000, 2: 22000, 3: 32000, 4: 26000, 5: 21000, 6: 14000 }[dep];
      const salario = rand() < 0.06 ? null : Math.round((base + between(-3000, 9000)) / 100) * 100;
      emps.push([id, nombre, dep, pick(puestos[dep]), ingreso, baja, salario, pick(ciudades)]);
    }
    const aus = []; let aid = 1;
    const motivos = ['Enfermedad', 'Enfermedad', 'Personal', 'Vacaciones', 'Vacaciones', 'Vacaciones', 'enfermedad'];
    for (const e of emps) {
      const n = between(0, 5);
      for (let k = 0; k < n; k++) {
        const y = pick([2023, 2024]);
        aus.push([aid++, e[0], `${y}-${pad(between(1, 12))}-${pad(between(1, 28))}`, between(1, 5), pick(motivos)]);
      }
    }
    const evals = []; let vid = 1;
    for (const e of emps) for (const anio of [2023, 2024]) if (rand() < 0.8) evals.push([vid++, e[0], anio, between(2, 5)]);
    const sql = `CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT, presupuesto_anual REAL);
CREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER REFERENCES departamentos(id), puesto TEXT, fecha_ingreso TEXT, fecha_baja TEXT, salario_mensual REAL, ciudad TEXT);
CREATE TABLE ausencias (id INTEGER PRIMARY KEY, empleado_id INTEGER REFERENCES empleados(id), fecha TEXT, dias INTEGER, motivo TEXT);
CREATE TABLE evaluaciones (id INTEGER PRIMARY KEY, empleado_id INTEGER REFERENCES empleados(id), anio INTEGER, calificacion INTEGER);
` + insert('departamentos', deps) + insert('empleados', emps) + insert('ausencias', aus) + insert('evaluaciones', evals);
    const schema = {
      label: 'RRHH', company: 'Grupo Talento, empresa de servicios con 64 personas. Los datos vienen del sistema de nómina y tienen problemas reales: nombres con espacios y mayúsculas desordenadas, ciudades escritas de varias formas, salarios faltantes y un motivo de ausencia en minúsculas.',
      tables: [
        { name: 'departamentos', grain: 'Una fila = un departamento.', desc: 'Áreas de la empresa.', cols: [['id', 'INTEGER', 'Clave primaria.', 'PK'], ['nombre', 'TEXT', 'Nombre del departamento.'], ['presupuesto_anual', 'REAL', 'Presupuesto de nómina del año.']] },
        { name: 'empleados', grain: 'Una fila = una persona, activa o dada de baja.', desc: 'Plantilla histórica.', cols: [['id', 'INTEGER', 'Clave primaria.', 'PK'], ['nombre', 'TEXT', 'Nombre. Puede traer espacios extra o mayúsculas desordenadas.'], ['departamento_id', 'INTEGER', 'Apunta a departamentos.id.', 'FK'], ['puesto', 'TEXT', 'Puesto.'], ['fecha_ingreso', 'TEXT', 'AAAA-MM-DD.'], ['fecha_baja', 'TEXT', 'AAAA-MM-DD si dejó la empresa; NULL si sigue activo.'], ['salario_mensual', 'REAL', 'Puede ser NULL (dato faltante).'], ['ciudad', 'TEXT', 'Escrita de varias formas: CDMX, cdmx, Ciudad de México…']] },
        { name: 'ausencias', grain: 'Una fila = un periodo de ausencia.', desc: 'Faltas, permisos y vacaciones.', cols: [['id', 'INTEGER', 'Clave primaria.', 'PK'], ['empleado_id', 'INTEGER', 'Apunta a empleados.id.', 'FK'], ['fecha', 'TEXT', 'Día en que inicia.'], ['dias', 'INTEGER', 'Días de ausencia.'], ['motivo', 'TEXT', "'Enfermedad', 'Personal' o 'Vacaciones' (con alguna variante en minúsculas)."]] },
        { name: 'evaluaciones', grain: 'Una fila = la evaluación anual de una persona.', desc: 'Desempeño del 1 al 5.', cols: [['id', 'INTEGER', 'Clave primaria.', 'PK'], ['empleado_id', 'INTEGER', 'Apunta a empleados.id.', 'FK'], ['anio', 'INTEGER', '2023 o 2024.'], ['calificacion', 'INTEGER', 'Del 1 al 5.']] }
      ]
    };
    return { sql, schema };
  })();

  /* ============================================================ INVENTARIO */
  const inventario = (() => {
    const rand = rng(9090);
    const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
    const pick = a => a[Math.floor(rand() * a.length)];
    const almacenes = [[1, 'Almacén Norte', 'Monterrey'], [2, 'Almacén Centro', 'Querétaro'], [3, 'Almacén Sur', 'Puebla']];
    const proveedores = [[1, 'Herramex', 'México', 5], [2, 'ToolPro Inc.', 'Estados Unidos', 12], [3, 'Fijaciones del Bajío', 'México', 4], [4, 'Pinturas Andinas', 'Colombia', 15], [5, 'ElectroPartes', 'México', 7]];
    const cats = [['Herramientas', ['Martillo', 'Desarmador plano', 'Pinzas', 'Llave inglesa', 'Taladro', 'Sierra caladora'], 1], ['Fijaciones', ['Tornillo 1"', 'Taquete 1/4', 'Clavo 2"', 'Ancla expansiva'], 3], ['Pintura', ['Pintura blanca 4L', 'Brocha 3"', 'Rodillo', 'Sellador 4L'], 4], ['Electricidad', ['Cable calibre 12', 'Apagador', 'Contacto doble', 'Foco LED', 'Cinta aislante'], 5], ['Seguridad', ['Guantes', 'Lentes de seguridad', 'Casco', 'Botas'], 2]];
    const prods = []; let pid = 1;
    for (const [cat, items, prov] of cats) for (const nombre of items) {
      const costo = { Herramientas: between(90, 1800), Fijaciones: between(1, 25), Pintura: between(45, 650), Electricidad: between(8, 320), Seguridad: between(40, 900) }[cat];
      let catTxt = cat; const r = rand();
      if (r < 0.15) catTxt = cat.toLowerCase(); else if (r < 0.25) catTxt = cat + ' '; else if (r < 0.32) catTxt = cat.toUpperCase();
      const sku = cat.slice(0, 3).toUpperCase() + '-' + String(100 + pid);
      prods.push([pid, rand() < 0.2 ? sku.toLowerCase() : sku, nombre, catTxt, costo, 0, prov]);
      pid++;
    }
    const movs = []; let mid = 1;
    const tipos = ['entrada', 'salida', 'salida', 'salida'];
    for (let day = 0; day < 180; day++) {
      const dt = new Date(Date.UTC(2024, 6, 1 + day));
      const iso = dt.toISOString().slice(0, 10);
      const n = between(2, 5);
      for (let k = 0; k < n; k++) {
        const p = pick(prods), a = pick(almacenes);
        let tipo = pick(tipos); const tr = rand();
        if (tr < 0.06) tipo = tipo.toUpperCase(); else if (tr < 0.1) tipo = tipo[0].toUpperCase() + tipo.slice(1); else if (tr < 0.13) tipo = ' ' + tipo;
        const cantidad = tipo.trim().toLowerCase() === 'entrada' ? between(5, 30) : between(1, 15);
        const fecha = rand() < 0.08 ? `${pad(dt.getUTCDate())}/${pad(dt.getUTCMonth() + 1)}/${dt.getUTCFullYear()}` : iso;
        const row = [mid++, fecha, a[0], p[0], tipo, rand() < 0.03 ? null : cantidad, 'REF-' + (10000 + mid)];
        movs.push(row);
        if (rand() < 0.04) movs.push([mid++, row[1], row[2], row[3], row[4], row[5], row[6]]);
      }
    }
    // saldo inicial: una entrada grande por producto y almacén el 30 de junio
    const iniciales = []; let iid = 100000;
    for (const p of prods) for (const a of almacenes) iniciales.push([iid++, '2024-06-30', a[0], p[0], 'entrada', between(40, 160), 'SALDO-INICIAL']);
    // Punto de reorden según la existencia real (con datos limpios): unos productos quedan por debajo y otros no.
    const seenRef = new Set(); const stock = {};
    for (const m of iniciales.concat(movs)) {
      const key = [m[6], m[2], m[3], m[1]].join('|'); if (seenRef.has(key)) continue; seenRef.add(key);
      const sign = m[4].trim().toLowerCase() === 'entrada' ? 1 : -1;
      stock[m[3]] = (stock[m[3]] || 0) + sign * (m[5] || 0);
    }
    for (const p of prods) p[5] = Math.max(20, Math.round(stock[p[0]] * (0.55 + rand() * 0.9)));
    const sql = `CREATE TABLE almacenes (id INTEGER PRIMARY KEY, nombre TEXT, ciudad TEXT);
CREATE TABLE proveedores (id INTEGER PRIMARY KEY, nombre TEXT, pais TEXT, dias_entrega INTEGER);
CREATE TABLE productos (id INTEGER PRIMARY KEY, sku TEXT, nombre TEXT, categoria TEXT, costo_unitario REAL, punto_reorden INTEGER, proveedor_id INTEGER REFERENCES proveedores(id));
CREATE TABLE movimientos (id INTEGER PRIMARY KEY, fecha TEXT, almacen_id INTEGER REFERENCES almacenes(id), producto_id INTEGER REFERENCES productos(id), tipo TEXT, cantidad INTEGER, referencia TEXT);
` + insert('almacenes', almacenes) + insert('proveedores', proveedores) + insert('productos', prods) + insert('movimientos', iniciales.concat(movs));
    const schema = {
      label: 'Inventario', company: 'Ferretera del Norte: tres almacenes y 23 productos. Los movimientos se capturan a mano y tienen problemas típicos: tipos escritos de varias formas, algunas fechas en formato DD/MM/AAAA, cantidades vacías, renglones duplicados y categorías con mayúsculas y espacios inconsistentes.',
      tables: [
        { name: 'almacenes', grain: 'Una fila = un almacén.', desc: 'Dónde se guarda la mercancía.', cols: [['id', 'INTEGER', 'Clave primaria.', 'PK'], ['nombre', 'TEXT', 'Nombre.'], ['ciudad', 'TEXT', 'Ciudad.']] },
        { name: 'proveedores', grain: 'Una fila = un proveedor.', desc: 'Quién surte cada producto.', cols: [['id', 'INTEGER', 'Clave primaria.', 'PK'], ['nombre', 'TEXT', 'Nombre.'], ['pais', 'TEXT', 'País.'], ['dias_entrega', 'INTEGER', 'Días que tarda en surtir un pedido.']] },
        { name: 'productos', grain: 'Una fila = un producto del catálogo.', desc: 'Qué se vende.', cols: [['id', 'INTEGER', 'Clave primaria.', 'PK'], ['sku', 'TEXT', 'Código; algunos vienen en minúsculas.'], ['nombre', 'TEXT', 'Nombre.'], ['categoria', 'TEXT', 'Categoría con mayúsculas y espacios inconsistentes.'], ['costo_unitario', 'REAL', 'Costo por unidad.'], ['punto_reorden', 'INTEGER', 'Si la existencia baja de aquí, hay que pedir.'], ['proveedor_id', 'INTEGER', 'Apunta a proveedores.id.', 'FK']] },
        { name: 'movimientos', grain: 'Una fila = una entrada o salida de mercancía.', desc: 'El kárdex: la existencia es la suma de entradas menos salidas.', cols: [['id', 'INTEGER', 'Clave primaria.', 'PK'], ['fecha', 'TEXT', 'Casi siempre AAAA-MM-DD; algunas en DD/MM/AAAA.'], ['almacen_id', 'INTEGER', 'Apunta a almacenes.id.', 'FK'], ['producto_id', 'INTEGER', 'Apunta a productos.id.', 'FK'], ['tipo', 'TEXT', "'entrada' o 'salida', escrito de varias formas (Salida, SALIDA, ' salida')."], ['cantidad', 'INTEGER', 'Unidades. Puede ser NULL.'], ['referencia', 'TEXT', 'Folio. Los renglones duplicados repiten el mismo folio.']] }
      ]
    };
    return { sql, schema };
  })();

  return { rrhh, inventario };
})();
