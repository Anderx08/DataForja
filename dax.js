/* DataForja — motor DAX didáctico.
   Modelo en estrella: la tabla de hechos Ventas y las dimensiones Calendario, Productos,
   Regiones y Vendedores, con relaciones de una dirección (dimensión filtra a hechos).
   Implementa agregaciones, iteradores, CALCULATE, ALL, FILTER, RELATED, inteligencia de tiempo
   (DATESYTD, SAMEPERIODLASTYEAR, DATEADD, TOTALYTD…) y VAR/RETURN, con contexto de filtro y de fila. */
window.DAX = (function () {

  /* ------------------------------------------------------------ datos */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const rand = rng(777);
  const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const pick = arr => arr[Math.floor(rand() * arr.length)];
  const regiones = ['Norte', 'Sur', 'Centro', 'Este'];
  const catalogo = {
    'Electrónica': [['Mouse inalámbrico', 250, 140], ['Teclado mecánico', 900, 520], ['Audífonos BT', 899, 480]],
    'Hogar': [['Cafetera', 1200, 700], ['Licuadora', 780, 420], ['Lámpara LED', 350, 160]],
    'Oficina': [['Silla ergonómica', 3800, 2300], ['Archivero', 2100, 1300], ['Pizarrón blanco', 680, 390]],
    'Deportes': [['Mancuernas 10kg', 900, 520], ['Tapete yoga', 320, 150], ['Botella térmica', 280, 120]]
  };
  const vendedores = ['Ana López', 'Luis Mora', 'Sara Ruiz', 'Pedro Díaz', 'Marta Gil'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const pad = n => String(n).padStart(2, '0');
  let rows = [];
  let id = 1;
  for (const anio of [2023, 2024]) {
    for (let mes = 1; mes <= 12; mes++) {
      const n = between(14, 20);
      for (let k = 0; k < n; k++) {
        const cat = pick(Object.keys(catalogo));
        const [producto, precio, costoU] = pick(catalogo[cat]);
        const crecimiento = anio === 2024 ? 1.12 : 1;
        const unidades = Math.max(1, Math.round(between(1, precio > 2000 ? 4 : 18) * crecimiento));
        rows.push({
          ID: id++, 'Año': anio, Mes: mes, MesNombre: meses[mes - 1], Trimestre: 'T' + Math.ceil(mes / 3), Fecha: `${anio}-${pad(mes)}-${pad(between(1, 28))}`,
          Region: regiones[(k + mes) % 4], Categoria: cat, Producto: producto, Vendedor: vendedores[(k * 3 + mes) % vendedores.length],
          Unidades: unidades, Precio: precio, Ventas: unidades * precio, Costo: unidades * costoU
        });
      }
    }
  }
  let columns = ['ID', 'Año', 'Mes', 'MesNombre', 'Trimestre', 'Fecha', 'Region', 'Categoria', 'Producto', 'Vendedor', 'Unidades', 'Precio', 'Ventas', 'Costo'];
  const dimensionCols = ['Año', 'Trimestre', 'MesNombre', 'Region', 'Categoria', 'Producto', 'Vendedor'];
  const sortOrder = { MesNombre: meses };

  /* ------------------------------------------------------------ modelo */
  // Cada dimensión expone columnas con su nombre propio y apunta a la columna equivalente de Ventas.
  const DIMS = {
    calendario: { name: 'Calendario', key: 'Date', cols: { Date: 'Fecha', 'Año': 'Año', Mes: 'Mes', MesNombre: 'MesNombre', Trimestre: 'Trimestre' } },
    productos: { name: 'Productos', key: 'Producto', cols: { Producto: 'Producto', Categoria: 'Categoria', Precio: 'Precio' } },
    regiones: { name: 'Regiones', key: 'Region', cols: { Region: 'Region' } },
    vendedores: { name: 'Vendedores', key: 'Vendedor', cols: { Vendedor: 'Vendedor' } }
  };
  const DATE_COLS = ['Fecha', 'Año', 'Mes', 'MesNombre', 'Trimestre'];
  const ucolsOf = d => [...new Set(Object.values(d.cols))];
  // Calendario continuo: un día por fila, de enero del primer año a diciembre del último.
  const iso = d => d.toISOString().slice(0, 10);
  const CAL_ROWS = (() => {
    const out = []; const d = new Date(Date.UTC(2023, 0, 1)); const end = Date.UTC(2024, 11, 31);
    while (d.getTime() <= end) {
      const m = d.getUTCMonth() + 1;
      out.push({ __virtual: true, Fecha: iso(d), 'Año': d.getUTCFullYear(), Mes: m, MesNombre: meses[m - 1], Trimestre: 'T' + Math.ceil(m / 3) });
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return out;
  })();
  const CAL_SET = new Set(CAL_ROWS.map(r => r.Fecha));

  /* ------------------------------------------------------------ errores */
  class DaxError extends Error { constructor(msg, pos) { super(msg); this.pos = pos; } }

  /* ------------------------------------------------------------ tokenizer */
  function tokenize(src) {
    const toks = [];
    let i = 0;
    const isIdStart = c => /[\p{L}_]/u.test(c);
    const isId = c => /[\p{L}\p{N}_]/u.test(c);
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '-' && src[i + 1] === '-') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '"') {
        let j = i + 1, s = '';
        while (j < src.length) {
          if (src[j] === '"') { if (src[j + 1] === '"') { s += '"'; j += 2; continue; } break; }
          s += src[j++];
        }
        if (j >= src.length) throw new DaxError('Falta cerrar las comillas dobles del texto.', i);
        toks.push({ t: 'str', v: s, pos: i }); i = j + 1; continue;
      }
      if (c === "'") {
        let j = i + 1; while (j < src.length && src[j] !== "'") j++;
        if (j >= src.length) throw new DaxError('Falta cerrar la comilla simple del nombre de tabla.', i);
        toks.push({ t: 'id', v: src.slice(i + 1, j), pos: i }); i = j + 1; continue;
      }
      if (c === '[') {
        let j = i + 1; while (j < src.length && src[j] !== ']') j++;
        if (j >= src.length) throw new DaxError('Falta cerrar el corchete ].', i);
        toks.push({ t: 'bracket', v: src.slice(i + 1, j).trim(), pos: i }); i = j + 1; continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let j = i; while (j < src.length && /[0-9.]/.test(src[j])) j++;
        toks.push({ t: 'num', v: parseFloat(src.slice(i, j)), pos: i }); i = j; continue;
      }
      if (isIdStart(c)) {
        let j = i; while (j < src.length && isId(src[j])) j++;
        toks.push({ t: 'id', v: src.slice(i, j), pos: i }); i = j; continue;
      }
      const two = src.slice(i, i + 2);
      if (['<>', '<=', '>=', '&&', '||'].includes(two)) { toks.push({ t: 'op', v: two, pos: i }); i += 2; continue; }
      if ('=<>+-*/&(),{}^'.includes(c)) { toks.push({ t: 'op', v: c, pos: i }); i++; continue; }
      throw new DaxError(`Carácter no reconocido: "${c}"`, i);
    }
    toks.push({ t: 'eof', pos: src.length });
    return toks;
  }

  /* ------------------------------------------------------------ parser */
  function parse(src) {
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const next = () => toks[p++];
    const isOp = v => peek().t === 'op' && peek().v === v;
    const isKw = v => peek().t === 'id' && peek().v.toUpperCase() === v;
    const expect = v => { if (!isOp(v)) throw new DaxError(`Se esperaba "${v}"`, peek().pos); return next(); };

    function parseExpr() {
      if (!isKw('VAR')) return parseOr();
      const vars = [];
      while (isKw('VAR')) {
        next();
        const nameTok = next();
        if (nameTok.t !== 'id') throw new DaxError('Después de VAR va el nombre de la variable.', nameTok.pos);
        expect('=');
        vars.push([nameTok.v, parseOr()]);
      }
      if (!isKw('RETURN')) throw new DaxError('Después de las variables falta RETURN con la expresión final.', peek().pos);
      next();
      return { k: 'let', vars, body: parseExpr() };
    }
    function parseOr() { let l = parseAnd(); while (isOp('||')) { next(); l = { k: 'bin', op: '||', l, r: parseAnd() }; } return l; }
    function parseAnd() { let l = parseNot(); while (isOp('&&')) { next(); l = { k: 'bin', op: '&&', l, r: parseNot() }; } return l; }
    function parseNot() { if (isKw('NOT') && !(toks[p + 1].t === 'op' && toks[p + 1].v === '(')) { next(); return { k: 'not', e: parseNot() }; } return parseCmp(); }
    function parseCmp() {
      let l = parseConcat();
      while (true) {
        if (peek().t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().v)) { const op = next().v; l = { k: 'bin', op, l, r: parseConcat() }; }
        else if (isKw('IN')) { next(); l = { k: 'in', l, r: parsePrimary() }; }
        else break;
      }
      return l;
    }
    function parseConcat() { let l = parseAdd(); while (isOp('&')) { next(); l = { k: 'bin', op: '&', l, r: parseAdd() }; } return l; }
    function parseAdd() { let l = parseMul(); while (isOp('+') || isOp('-')) { const op = next().v; l = { k: 'bin', op, l, r: parseMul() }; } return l; }
    function parseMul() { let l = parsePow(); while (isOp('*') || isOp('/')) { const op = next().v; l = { k: 'bin', op, l, r: parsePow() }; } return l; }
    function parsePow() { let l = parseUnary(); while (isOp('^')) { next(); l = { k: 'bin', op: '^', l, r: parseUnary() }; } return l; }
    function parseUnary() { if (isOp('-')) { next(); return { k: 'neg', e: parseUnary() }; } if (isOp('+')) { next(); return parseUnary(); } return parsePrimary(); }
    function parsePrimary() {
      const t = peek();
      if (t.t === 'num') { next(); return { k: 'num', v: t.v }; }
      if (t.t === 'str') { next(); return { k: 'str', v: t.v }; }
      if (t.t === 'bracket') { next(); return { k: 'measure', name: t.v, pos: t.pos }; }
      if (t.t === 'op' && t.v === '(') { next(); const e = parseExpr(); expect(')'); return e; }
      if (t.t === 'op' && t.v === '{') {
        next(); const items = [];
        if (!isOp('}')) { items.push(parseOr()); while (isOp(',')) { next(); items.push(parseOr()); } }
        expect('}'); return { k: 'list', items };
      }
      if (t.t === 'id') {
        next();
        if (peek().t === 'bracket') { const b = next(); return { k: 'col', table: t.v, col: b.v, pos: t.pos }; }
        if (isOp('(')) {
          next(); const args = [];
          if (!isOp(')')) { args.push(parseExpr()); while (isOp(',')) { next(); args.push(parseExpr()); } }
          expect(')');
          return { k: 'fn', name: t.v.toUpperCase(), args, pos: t.pos };
        }
        return { k: 'table', name: t.v, pos: t.pos };
      }
      if (t.t === 'eof') throw new DaxError('La expresión termina de forma inesperada. ¿Falta cerrar un paréntesis?', t.pos);
      throw new DaxError(`No se esperaba "${t.v}" aquí.`, t.pos);
    }
    const ast = parseExpr();
    if (peek().t !== 'eof') throw new DaxError(`Texto sobrante a partir de "${peek().v}". Revisa comas y paréntesis.`, peek().pos);
    return ast;
  }

  /* ------------------------------------------------------------ utilidades de evaluación */
  const isTable = v => v && typeof v === 'object' && v.__table;
  const tbl = (rowsArr, meta) => ({ __table: true, rows: rowsArr, meta: meta || null });

  function filteredRows(ctx) {
    let r = rows;
    for (const f of ctx.filters) r = r.filter(f.fn);
    return r;
  }
  // tabla de valores distintos (filas virtuales: solo tienen las columnas pedidas)
  function distinctRows(source, cols) {
    const seen = new Set(); const out = [];
    for (const r of source) {
      const key = cols.map(c => String(r[c])).join('\u0001');
      if (!seen.has(key)) { seen.add(key); const v = { __virtual: true }; cols.forEach(c => { v[c] = r[c]; }); out.push(v); }
    }
    return out;
  }
  // filas de una dimensión en el contexto: solo la filtran los filtros sobre sus propias columnas
  function dimRows(dkey, ctx) {
    const d = DIMS[dkey]; const uc = ucolsOf(d);
    const src = dkey === 'calendario' ? CAL_ROWS : distinctRows(rows, uc);
    const fs = ctx.filters.filter(f => uc.includes(f.col) || (dkey === 'calendario' && DATE_COLS.includes(f.col)));
    return src.filter(r => fs.every(f => f.fn(r)));
  }
  // transición de contexto: una fila se convierte en filtros
  function transition(filters, row) {
    if (row.__virtual) {
      const cols = Object.keys(row).filter(k => k !== '__virtual');
      let out = filters.filter(f => !cols.includes(f.col));
      for (const c of cols) { const v = row[c]; out.push({ col: c, fn: r => String(r[c]) === String(v) }); }
      return out;
    }
    return [...filters, { col: '*row', fn: x => x === row }];
  }
  function checkCol(col, pos) {
    const found = columns.find(c => c.toLowerCase() === col.toLowerCase());
    if (!found) throw new DaxError(`La columna [${col}] no existe en Ventas. Columnas disponibles: ${columns.join(', ')}.`, pos);
    return found;
  }
  // Tabla[Columna] → columna real de Ventas
  function resolve(table, col, pos) {
    const t = String(table).toLowerCase();
    if (t === 'ventas') return checkCol(col, pos);
    const d = DIMS[t];
    if (!d) throw new DaxError(`La tabla "${table}" no existe. Tablas del modelo: Ventas, Calendario, Productos, Regiones y Vendedores.`, pos);
    const key = Object.keys(d.cols).find(k => k.toLowerCase() === String(col).toLowerCase());
    if (!key) throw new DaxError(`La columna ${d.name}[${col}] no existe. Columnas de ${d.name}: ${Object.keys(d.cols).join(', ')}.`, pos);
    return checkCol(d.cols[key], pos);
  }
  const tableKey = (name, pos) => {
    const t = String(name).toLowerCase();
    if (t === 'ventas' || DIMS[t]) return t;
    throw new DaxError(`La tabla "${name}" no existe. Tablas del modelo: Ventas, Calendario, Productos, Regiones y Vendedores.`, pos);
  };
  function colsIn(ast, acc = new Set()) {
    if (!ast || typeof ast !== 'object') return acc;
    if (ast.k === 'col') acc.add(resolve(ast.table, ast.col, ast.pos));
    for (const key of Object.keys(ast)) {
      const v = ast[key];
      if (Array.isArray(v)) v.forEach(x => Array.isArray(x) ? x.forEach(y => colsIn(y, acc)) : colsIn(x, acc));
      else if (v && typeof v === 'object' && v.k) colsIn(v, acc);
    }
    return acc;
  }
  const num = v => (v === null || v === undefined || v === '') ? 0 : (typeof v === 'boolean' ? (v ? 1 : 0) : (typeof v === 'number' ? v : (isNaN(parseFloat(v)) ? 0 : parseFloat(v))));
  function cmp(a, b) {
    if (typeof a === 'string' || typeof b === 'string') {
      const sa = a === null || a === undefined ? '' : String(a).toLowerCase();
      const sb = b === null || b === undefined ? '' : String(b).toLowerCase();
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    }
    const na = num(a), nb = num(b);
    return na < nb ? -1 : na > nb ? 1 : 0;
  }
  const truthy = v => v !== null && v !== undefined && v !== 0 && v !== false && v !== '';

  /* ------------------------------------------------------------ fechas */
  function shiftDate(s, n, unit) {
    const [y, m, d] = s.split('-').map(Number);
    if (unit === 'DAY') { const x = new Date(Date.UTC(y, m - 1, d + n)); return iso(x); }
    const months = unit === 'YEAR' ? 12 * n : unit === 'QUARTER' ? 3 * n : n;
    const total = (y * 12 + (m - 1)) + months; const ny = Math.floor(total / 12), nm = total % 12;
    const last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
    return `${ny}-${pad(nm + 1)}-${pad(Math.min(d, last))}`;
  }
  function contextDates(ctx) {
    const fs = ctx.filters.filter(f => DATE_COLS.includes(f.col));
    return CAL_ROWS.filter(r => fs.every(f => f.fn(r))).map(r => r.Fecha);
  }
  function datesArg(ast, ctx) {
    if (!ast) throw new DaxError('Falta la columna de fechas: Calendario[Date].', 0);
    if (ast.k === 'col') return contextDates(ctx);
    const t = evalTable(ast, ctx);
    if (t.meta && t.meta.dates) return [...t.meta.dates].sort();
    throw new DaxError('Se esperaba una columna de fechas, por ejemplo Calendario[Date].', ast.pos || 0);
  }
  const dateTable = arr => tbl([], { dates: new Set(arr.filter(x => CAL_SET.has(x))) });
  function periodToDate(ctx, ast, unit) {
    const ds = datesArg(ast, ctx); if (!ds.length) return dateTable([]);
    const max = ds[ds.length - 1]; const [y, m] = max.split('-').map(Number);
    const startM = unit === 'YEAR' ? 1 : unit === 'QUARTER' ? 3 * Math.floor((m - 1) / 3) + 1 : m;
    const from = `${y}-${pad(startM)}-01`;
    return dateTable(CAL_ROWS.map(r => r.Fecha).filter(f => f >= from && f <= max));
  }
  const unitArg = a => { const u = a && a.k === 'table' ? a.name.toUpperCase() : ''; if (!['DAY', 'MONTH', 'QUARTER', 'YEAR'].includes(u)) throw new DaxError('El intervalo debe ser DAY, MONTH, QUARTER o YEAR.', a ? a.pos : 0); return u; };

  /* ------------------------------------------------------------ tablas */
  function evalTable(ast, ctx) {
    if (ast.k === 'table') {
      if (ctx.vars && ctx.vars.has(ast.name.toLowerCase())) { const v = ctx.vars.get(ast.name.toLowerCase()); if (isTable(v)) return v; throw new DaxError(`La variable ${ast.name} no es una tabla.`, ast.pos); }
      const k = tableKey(ast.name, ast.pos);
      return k === 'ventas' ? tbl(filteredRows(ctx)) : tbl(dimRows(k, ctx), { dim: k });
    }
    if (ast.k === 'fn') {
      const n = ast.name;
      if (n === 'ALL' || n === 'ALLNOBLANKROW' || n === 'REMOVEFILTERS') {
        if (!ast.args.length) return tbl(rows, { all: true });
        const a0 = ast.args[0];
        if (a0.k === 'table') { const k = tableKey(a0.name, a0.pos); return k === 'ventas' ? tbl(rows, { all: true }) : tbl(dimRows(k, { filters: [] }), { dim: k }); }
        if (a0.k === 'col') {
          const cols = ast.args.map(a => { if (a.k !== 'col') throw new DaxError('Los argumentos de ALL deben ser columnas.', ast.pos); return resolve(a.table, a.col, a.pos); });
          return tbl(distinctRows(rows, cols), { allCols: cols, valuesOf: cols.length === 1 ? cols[0] : null });
        }
        throw new DaxError('ALL necesita una tabla o columnas como argumento.', ast.pos);
      }
      if (n === 'ALLSELECTED') return tbl(rows.filter(r => ctx.slicers.every(f => f.fn(r))), { all: true });
      if (n === 'FILTER') {
        if (ast.args.length !== 2) throw new DaxError('FILTER necesita dos argumentos: FILTER(tabla, condición).', ast.pos);
        const base = evalTable(ast.args[0], ctx);
        return tbl(base.rows.filter(r => truthy(evaluate(ast.args[1], { ...ctx, row: r }))), { dim: base.meta && base.meta.dim });
      }
      if (n === 'VALUES' || n === 'DISTINCT') {
        const a = ast.args[0];
        if (a && a.k === 'col') { const col = resolve(a.table, a.col, a.pos); return tbl(distinctRows(filteredRows(ctx), [col]), { valuesOf: col }); }
        if (a && a.k === 'table') return evalTable(a, ctx);
        throw new DaxError('VALUES necesita una columna: VALUES(Ventas[Region]).', ast.pos);
      }
      if (n === 'TOPN') {
        const k = num(evaluate(ast.args[0], ctx));
        const base = evalTable(ast.args[1], ctx);
        const desc = !(ast.args[3] && ((ast.args[3].k === 'num' && ast.args[3].v === 1) || (ast.args[3].k === 'table' && ast.args[3].name.toUpperCase() === 'ASC')));
        const scored = base.rows.map(r => ({ r, s: num(evaluate(ast.args[2], { ...ctx, row: r })) }));
        scored.sort((a, b) => desc ? b.s - a.s : a.s - b.s);
        return tbl(scored.slice(0, k).map(x => x.r), base.meta);
      }
      if (n === 'CALCULATETABLE') return evalTable(ast.args[0], applyCalculateFilters(ast.args.slice(1), ctx));
      if (n === 'DATESYTD') return periodToDate(ctx, ast.args[0], 'YEAR');
      if (n === 'DATESQTD') return periodToDate(ctx, ast.args[0], 'QUARTER');
      if (n === 'DATESMTD') return periodToDate(ctx, ast.args[0], 'MONTH');
      if (n === 'SAMEPERIODLASTYEAR') return dateTable(datesArg(ast.args[0], ctx).map(d => shiftDate(d, -1, 'YEAR')));
      if (n === 'DATEADD') {
        if (ast.args.length < 3) throw new DaxError('DATEADD necesita tres argumentos: DATEADD(Calendario[Date], -1, MONTH).', ast.pos);
        const nn = num(evaluate(ast.args[1], ctx)); const u = unitArg(ast.args[2]);
        return dateTable(datesArg(ast.args[0], ctx).map(d => shiftDate(d, nn, u)));
      }
      if (n === 'PREVIOUSMONTH' || n === 'PREVIOUSYEAR' || n === 'PREVIOUSQUARTER') {
        const ds = datesArg(ast.args[0], ctx); if (!ds.length) return dateTable([]);
        const [y, m] = ds[0].split('-').map(Number);
        let from, to;
        if (n === 'PREVIOUSYEAR') { from = `${y - 1}-01-01`; to = `${y - 1}-12-31`; }
        else if (n === 'PREVIOUSMONTH') { from = shiftDate(`${y}-${pad(m)}-01`, -1, 'MONTH'); to = shiftDate(`${y}-${pad(m)}-01`, -1, 'DAY'); }
        else { const qs = 3 * Math.floor((m - 1) / 3) + 1; from = shiftDate(`${y}-${pad(qs)}-01`, -3, 'MONTH'); to = shiftDate(`${y}-${pad(qs)}-01`, -1, 'DAY'); }
        return dateTable(CAL_ROWS.map(r => r.Fecha).filter(f => f >= from && f <= to));
      }
      if (n === 'DATESBETWEEN') {
        const a = String(evaluate(ast.args[1], ctx)), b = String(evaluate(ast.args[2], ctx));
        return dateTable(CAL_ROWS.map(r => r.Fecha).filter(f => f >= a && f <= b));
      }
    }
    throw new DaxError('Aquí se esperaba una tabla (Ventas, Productos, ALL(...), FILTER(...), VALUES(...)).', ast.pos || 0);
  }
  const TABLE_FNS = ['FILTER', 'VALUES', 'DISTINCT', 'TOPN', 'CALCULATETABLE', 'DATESYTD', 'DATESQTD', 'DATESMTD', 'SAMEPERIODLASTYEAR', 'DATEADD', 'PREVIOUSMONTH', 'PREVIOUSYEAR', 'PREVIOUSQUARTER', 'DATESBETWEEN'];

  function applyCalculateFilters(filterArgs, ctx) {
    let filters = ctx.filters.slice();
    if (ctx.row) filters = transition(filters, ctx.row); // transición de contexto
    for (const f of filterArgs) {
      if (f.k === 'fn' && (f.name === 'ALL' || f.name === 'REMOVEFILTERS' || f.name === 'ALLSELECTED')) {
        if (f.name === 'ALLSELECTED') { filters = ctx.slicers.slice(); continue; }
        const a0 = f.args[0];
        if (!a0) { filters = []; continue; }
        if (a0.k === 'table') {
          const k = tableKey(a0.name, a0.pos);
          if (k === 'ventas') filters = [];
          else { const uc = ucolsOf(DIMS[k]); filters = filters.filter(x => !uc.includes(x.col) && !(k === 'calendario' && DATE_COLS.includes(x.col))); }
          continue;
        }
        const cols = f.args.map(a => resolve(a.table, a.col, a.pos));
        filters = filters.filter(x => !cols.includes(x.col));
        continue;
      }
      if (f.k === 'fn' && f.name === 'KEEPFILTERS') {
        const inner = f.args[0]; const cols = [...colsIn(inner)];
        const evalCtx = { ...ctx, row: null, filters: [] };
        filters.push({ col: cols.length === 1 ? cols[0] : '*keep', fn: r => truthy(evaluate(inner, { ...evalCtx, row: r })) });
        continue;
      }
      if ((f.k === 'fn' && TABLE_FNS.includes(f.name)) || f.k === 'table') {
        const t = evalTable(f, { ...ctx, row: null });
        if (t.meta && t.meta.dates) {
          const set = t.meta.dates;
          filters = filters.filter(x => !DATE_COLS.includes(x.col));
          filters.push({ col: 'Fecha', fn: r => set.has(r.Fecha) });
        } else if (t.meta && t.meta.valuesOf) {
          const col = t.meta.valuesOf; const set = new Set(t.rows.map(r => r[col]));
          filters = filters.filter(x => x.col !== col); filters.push({ col, fn: r => set.has(r[col]) });
        } else if (t.rows.length && t.rows[0].__virtual) {
          const vcols = Object.keys(t.rows[0]).filter(k => k !== '__virtual');
          const keys = new Set(t.rows.map(v => vcols.map(c => String(v[c])).join('\u0001')));
          filters = filters.filter(x => !vcols.includes(x.col));
          filters.push({ col: vcols.length === 1 ? vcols[0] : '*table', fn: r => keys.has(vcols.map(c => String(r[c])).join('\u0001')) });
        } else if (t.meta && t.meta.dim && !t.rows.length) {
          filters.push({ col: '*table', fn: () => false });
        } else {
          const set = new Set(t.rows);
          const cols = f.k === 'fn' && f.name === 'FILTER' ? [...colsIn(f.args[1])] : [];
          if (cols.length === 1) filters = filters.filter(x => x.col !== cols[0]);
          filters.push({ col: cols.length === 1 ? cols[0] : '*table', fn: r => set.has(r) });
        }
        continue;
      }
      // predicado booleano sobre una columna
      const cols = [...colsIn(f)];
      if (cols.length === 0) throw new DaxError('Un filtro de CALCULATE debe referirse a una columna, por ejemplo Ventas[Region] = "Norte".', f.pos || 0);
      if (cols.length > 1) throw new DaxError(`Un filtro de CALCULATE solo puede usar una columna (${cols.join(', ')}). Para condiciones con varias columnas usa FILTER(Ventas, condición).`, f.pos || 0);
      const col = cols[0];
      const evalCtx = { ...ctx, row: null, filters: [] };
      filters = filters.filter(x => x.col !== col && !(col === 'Fecha' && DATE_COLS.includes(x.col)));
      filters.push({ col, fn: r => truthy(evaluate(f, { ...evalCtx, row: r })) });
    }
    return { ...ctx, filters, row: null };
  }

  function aggregate(name, ast, ctx) {
    const a = ast.args[0];
    if (!a) throw new DaxError(`${name} necesita una columna: ${name}(Ventas[Ventas]).`, ast.pos);
    if (a.k !== 'col') {
      if ((name === 'MAX' || name === 'MIN') && ast.args.length === 2) {
        const x = evaluate(ast.args[0], ctx), y = evaluate(ast.args[1], ctx);
        return name === 'MAX' ? (cmp(x, y) >= 0 ? x : y) : (cmp(x, y) <= 0 ? x : y);
      }
      throw new DaxError(`${name} necesita una columna (Tabla[Columna]). Para una expresión por fila usa ${name}X(tabla, expresión).`, ast.pos);
    }
    const col = resolve(a.table, a.col, a.pos);
    const tk = tableKey(a.table, a.pos);
    const src = tk === 'ventas' ? filteredRows(ctx) : dimRows(tk, ctx);
    const vals = src.map(r => r[col]).filter(v => v !== null && v !== undefined);
    if (name === 'COUNT' || name === 'COUNTA') return vals.length || null;
    if (name === 'DISTINCTCOUNT') return new Set(vals).size || null;
    if (!vals.length) return null;
    if (name === 'SUM') return vals.reduce((s, v) => s + num(v), 0);
    if (name === 'AVERAGE') return vals.reduce((s, v) => s + num(v), 0) / vals.length;
    if (name === 'MIN') return vals.reduce((m, v) => cmp(v, m) < 0 ? v : m, vals[0]);
    if (name === 'MAX') return vals.reduce((m, v) => cmp(v, m) > 0 ? v : m, vals[0]);
    throw new DaxError(`Agregación desconocida ${name}`, ast.pos);
  }

  function iterate(name, ast, ctx) {
    if (ast.args.length < 2) throw new DaxError(`${name} necesita dos argumentos: ${name}(tabla, expresión).`, ast.pos);
    const t = evalTable(ast.args[0], ctx);
    const vals = [];
    for (const r of t.rows) {
      const v = evaluate(ast.args[1], { ...ctx, row: r });
      if (v !== null && v !== undefined) vals.push(v);
    }
    if (name === 'COUNTX') return vals.length || null;
    if (!vals.length) return null;
    if (name === 'SUMX') return vals.reduce((s, v) => s + num(v), 0);
    if (name === 'AVERAGEX') return vals.reduce((s, v) => s + num(v), 0) / vals.length;
    if (name === 'MINX') return vals.reduce((m, v) => cmp(v, m) < 0 ? v : m, vals[0]);
    if (name === 'MAXX') return vals.reduce((m, v) => cmp(v, m) > 0 ? v : m, vals[0]);
    throw new DaxError(`Iterador desconocido ${name}`, ast.pos);
  }

  function evaluate(ast, ctx) {
    switch (ast.k) {
      case 'num': return ast.v;
      case 'str': return ast.v;
      case 'let': {
        const vars = new Map(ctx.vars || []);
        for (const [name, expr] of ast.vars) vars.set(name.toLowerCase(), evaluate(expr, { ...ctx, vars }));
        return evaluate(ast.body, { ...ctx, vars });
      }
      case 'list': return { __list: true, items: ast.items.map(i => evaluate(i, ctx)) };
      case 'neg': return -num(evaluate(ast.e, ctx));
      case 'not': return !truthy(evaluate(ast.e, ctx));
      case 'in': {
        const v = evaluate(ast.l, ctx); const list = evaluate(ast.r, ctx);
        const items = list && list.__list ? list.items : (isTable(list) ? list.rows.map(r => r[list.meta && list.meta.valuesOf]) : [list]);
        return items.some(x => cmp(x, v) === 0);
      }
      case 'bin': {
        const op = ast.op;
        if (op === '&&') return truthy(evaluate(ast.l, ctx)) && truthy(evaluate(ast.r, ctx));
        if (op === '||') return truthy(evaluate(ast.l, ctx)) || truthy(evaluate(ast.r, ctx));
        const l = evaluate(ast.l, ctx), r = evaluate(ast.r, ctx);
        if (isTable(l) || isTable(r)) throw new DaxError('No se puede operar directamente con una tabla. Usa una agregación (SUM, COUNTROWS...) o un iterador (SUMX).', ast.l.pos || 0);
        switch (op) {
          case '+': return (l === null && r === null) ? null : num(l) + num(r);
          case '-': return (l === null && r === null) ? null : num(l) - num(r);
          case '*': return (l === null || r === null) ? null : num(l) * num(r);
          case '/': if (num(r) === 0) throw new DaxError('División entre cero. Usa DIVIDE(numerador, denominador) para evitarlo.', ast.pos || 0); return num(l) / num(r);
          case '^': return Math.pow(num(l), num(r));
          case '&': return (l === null ? '' : String(l)) + (r === null ? '' : String(r));
          case '=': return cmp(l, r) === 0;
          case '<>': return cmp(l, r) !== 0;
          case '<': return cmp(l, r) < 0;
          case '>': return cmp(l, r) > 0;
          case '<=': return cmp(l, r) <= 0;
          case '>=': return cmp(l, r) >= 0;
        }
        throw new DaxError('Operador no soportado ' + op, ast.pos || 0);
      }
      case 'col': {
        const col = resolve(ast.table, ast.col, ast.pos);
        if (ctx.row) {
          if (ctx.row.__virtual && !(col in ctx.row)) throw new DaxError(`La tabla de este iterador no tiene la columna ${ast.table}[${ast.col}]. Itera sobre Ventas, usa RELATED o una medida.`, ast.pos);
          return ctx.row[col] === undefined ? null : ctx.row[col];
        }
        const rs = filteredRows(ctx); const set = new Set(rs.map(r => r[col]));
        if (set.size === 1) return [...set][0];
        throw new DaxError(`La columna ${ast.table}[${ast.col}] tiene muchos valores en este contexto. Para usarla como número necesitas una agregación (SUM) o un iterador (SUMX). Para un texto, usa SELECTEDVALUE.`, ast.pos);
      }
      case 'table': {
        if (ctx.vars && ctx.vars.has(ast.name.toLowerCase())) return ctx.vars.get(ast.name.toLowerCase());
        return evalTable(ast, ctx);
      }
      case 'measure': {
        const m = ctx.measures.get(ast.name.toLowerCase());
        if (!m) throw new DaxError(`La medida [${ast.name}] no existe. Créala en el panel de medidas o revisa el nombre.`, ast.pos);
        if ((ctx.depth || 0) > 40) throw new DaxError(`Referencia circular al evaluar [${ast.name}].`, ast.pos);
        let nctx = { ...ctx, depth: (ctx.depth || 0) + 1, vars: null };
        if (ctx.row) nctx = { ...nctx, filters: transition(ctx.filters, ctx.row), row: null };
        if (!m.ast) m.ast = parse(m.expr);
        return evaluate(m.ast, nctx);
      }
      case 'fn': return callFn(ast, ctx);
    }
    throw new DaxError('Expresión no reconocida.', 0);
  }

  function callFn(ast, ctx) {
    const n = ast.name, args = ast.args;
    const arg = i => evaluate(args[i], ctx);
    switch (n) {
      case 'SUM': case 'AVERAGE': case 'MIN': case 'MAX': case 'COUNT': case 'COUNTA': case 'DISTINCTCOUNT':
        return aggregate(n, ast, ctx);
      case 'SUMX': case 'AVERAGEX': case 'MINX': case 'MAXX': case 'COUNTX':
        return iterate(n, ast, ctx);
      case 'COUNTROWS': {
        const t = args.length ? evalTable(args[0], ctx) : tbl(filteredRows(ctx));
        return t.rows.length || (t.meta && t.meta.dates ? t.meta.dates.size || null : null);
      }
      case 'CALCULATE': {
        if (!args.length) throw new DaxError('CALCULATE necesita al menos una expresión.', ast.pos);
        return evaluate(args[0], applyCalculateFilters(args.slice(1), ctx));
      }
      case 'TOTALYTD': case 'TOTALQTD': case 'TOTALMTD': {
        if (args.length < 2) throw new DaxError(`${n} necesita dos argumentos: ${n}(expresión, Calendario[Date]).`, ast.pos);
        const fake = { k: 'fn', name: n === 'TOTALYTD' ? 'DATESYTD' : n === 'TOTALQTD' ? 'DATESQTD' : 'DATESMTD', args: [args[1]], pos: ast.pos };
        return evaluate(args[0], applyCalculateFilters([fake, ...args.slice(2)], ctx));
      }
      case 'DIVIDE': {
        if (args.length < 2) throw new DaxError('DIVIDE necesita numerador y denominador: DIVIDE(a, b, [alternativa]).', ast.pos);
        const a = arg(0), b = arg(1);
        if (b === null || num(b) === 0) return args[2] ? arg(2) : null;
        return num(a) / num(b);
      }
      case 'IF': {
        if (args.length < 2) throw new DaxError('IF necesita una condición y un resultado: IF(condición, si_verdadero, [si_falso]).', ast.pos);
        return truthy(arg(0)) ? arg(1) : (args[2] ? arg(2) : null);
      }
      case 'SWITCH': {
        const v = arg(0);
        for (let i = 1; i + 1 < args.length; i += 2) if (cmp(v, arg(i)) === 0) return arg(i + 1);
        return args.length % 2 === 0 ? arg(args.length - 1) : null;
      }
      case 'AND': return truthy(arg(0)) && truthy(arg(1));
      case 'OR': return truthy(arg(0)) || truthy(arg(1));
      case 'NOT': return !truthy(arg(0));
      case 'TRUE': return true;
      case 'FALSE': return false;
      case 'BLANK': return null;
      case 'ISBLANK': return arg(0) === null || arg(0) === undefined;
      case 'COALESCE': { for (let i = 0; i < args.length; i++) { const v = arg(i); if (v !== null && v !== undefined) return v; } return null; }
      case 'ROUND': { const x = num(arg(0)), d = args[1] ? num(arg(1)) : 0; const f = Math.pow(10, d); return Math.round(x * f) / f; }
      case 'ROUNDUP': { const x = num(arg(0)), d = args[1] ? num(arg(1)) : 0; const f = Math.pow(10, d); return Math.ceil(x * f) / f; }
      case 'ROUNDDOWN': case 'TRUNC': { const x = num(arg(0)), d = args[1] ? num(arg(1)) : 0; const f = Math.pow(10, d); return Math.trunc(x * f) / f; }
      case 'INT': return Math.floor(num(arg(0)));
      case 'ABS': return Math.abs(num(arg(0)));
      case 'SQRT': return Math.sqrt(num(arg(0)));
      case 'YEAR': return Number(String(arg(0)).slice(0, 4));
      case 'MONTH': return Number(String(arg(0)).slice(5, 7));
      case 'DAY': return Number(String(arg(0)).slice(8, 10));
      case 'DATE': return `${num(arg(0))}-${pad(num(arg(1)))}-${pad(num(arg(2)))}`;
      case 'HASONEVALUE': { const col = resolve(args[0].table, args[0].col, args[0].pos); return new Set(filteredRows(ctx).map(r => r[col])).size === 1; }
      case 'SELECTEDVALUE': {
        if (!args[0] || args[0].k !== 'col') throw new DaxError('SELECTEDVALUE necesita una columna: SELECTEDVALUE(Ventas[Region], "Todas").', ast.pos);
        const col = resolve(args[0].table, args[0].col, args[0].pos); const set = new Set(filteredRows(ctx).map(r => r[col]));
        return set.size === 1 ? [...set][0] : (args[1] ? arg(1) : null);
      }
      case 'RELATED': {
        if (!args[0] || args[0].k !== 'col') throw new DaxError('RELATED necesita una columna de una dimensión: RELATED(Productos[Categoria]).', ast.pos);
        if (!ctx.row) throw new DaxError('RELATED solo funciona dentro de un iterador sobre Ventas (SUMX, FILTER…) o en una columna calculada.', ast.pos);
        const col = resolve(args[0].table, args[0].col, args[0].pos);
        return ctx.row[col] === undefined ? null : ctx.row[col];
      }
      case 'CONCATENATE': return String(arg(0) ?? '') + String(arg(1) ?? '');
      case 'FORMAT': {
        const v = arg(0); const fmt = String(arg(1) || '');
        if (typeof v === 'number') {
          if (/%/.test(fmt)) return (v * 100).toFixed((fmt.split('.')[1] || '').replace(/[^0]/g, '').length) + '%';
          const dec = (fmt.split('.')[1] || '').length;
          return v.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        }
        return v === null ? '' : String(v);
      }
      case 'UPPER': return String(arg(0) ?? '').toUpperCase();
      case 'LOWER': return String(arg(0) ?? '').toLowerCase();
      case 'LEN': return String(arg(0) ?? '').length;
      case 'RANKX': {
        const t = evalTable(args[0], ctx);
        const scores = t.rows.map(r => num(evaluate(args[1], { ...ctx, row: r })));
        const current = args[2] ? num(evaluate(args[2], ctx)) : num(evaluate(args[1], ctx));
        const desc = !(args[4] && args[4].k === 'table' && args[4].name.toUpperCase() === 'ASC');
        return 1 + scores.filter(s => desc ? s > current : s < current).length;
      }
      case 'KEEPFILTERS': throw new DaxError('KEEPFILTERS solo se usa como filtro dentro de CALCULATE.', ast.pos);
      case 'ALL': case 'ALLSELECTED': case 'REMOVEFILTERS': case 'FILTER': case 'VALUES': case 'DISTINCT': case 'TOPN': case 'CALCULATETABLE':
      case 'DATESYTD': case 'DATESQTD': case 'DATESMTD': case 'SAMEPERIODLASTYEAR': case 'DATEADD': case 'PREVIOUSMONTH': case 'PREVIOUSYEAR': case 'PREVIOUSQUARTER': case 'DATESBETWEEN':
        return evalTable(ast, ctx);
    }
    throw new DaxError(`La función ${n} no está disponible en este laboratorio. Funciones soportadas: SUM, AVERAGE, MIN, MAX, COUNT, DISTINCTCOUNT, COUNTROWS, SUMX, AVERAGEX, MAXX, MINX, COUNTX, CALCULATE, FILTER, ALL, REMOVEFILTERS, ALLSELECTED, KEEPFILTERS, VALUES, TOPN, RANKX, RELATED, DIVIDE, IF, SWITCH, AND, OR, NOT, BLANK, ISBLANK, COALESCE, ROUND, INT, ABS, SELECTEDVALUE, HASONEVALUE, FORMAT, DATESYTD, DATESQTD, DATESMTD, TOTALYTD, SAMEPERIODLASTYEAR, DATEADD, PREVIOUSMONTH, PREVIOUSYEAR, DATESBETWEEN, YEAR, MONTH, DATE y VAR/RETURN.`, ast.pos);
  }

  /* ------------------------------------------------------------ API pública */
  function makeMeasures(defs) {
    const map = new Map();
    for (const d of defs) map.set(d.name.toLowerCase(), { name: d.name, expr: d.expr, ast: null });
    return map;
  }
  function run(expr, opts) {
    opts = opts || {};
    const slicers = opts.slicers || [];
    const ctx = { filters: [...slicers, ...(opts.extraFilters || [])], slicers, row: null, measures: opts.measures || new Map(), depth: 0, vars: null };
    const ast = parse(expr);
    const v = evaluate(ast, ctx);
    if (isTable(v)) throw new DaxError('La expresión devuelve una tabla, no un valor. Una medida debe devolver un número o texto: envuélvela en COUNTROWS(...) o en una agregación.', 0);
    if (v && v.__list) throw new DaxError('La expresión devuelve una lista. Una medida debe devolver un solo valor.', 0);
    return v;
  }
  function distinctValues(col) {
    const set = new Set(rows.map(r => r[col]));
    const arr = [...set];
    if (sortOrder[col]) arr.sort((a, b) => sortOrder[col].indexOf(a) - sortOrder[col].indexOf(b));
    else arr.sort((a, b) => cmp(a, b));
    return arr;
  }
  function slicerFilter(col, value) {
    return { col, fn: r => String(r[col]) === String(value) };
  }
  function format(v) {
    if (v === null || v === undefined) return '(en blanco)';
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number') {
      if (Number.isInteger(v)) return v.toLocaleString('es-MX');
      return v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return String(v);
  }
  // Evalúa fn usando otra tabla "Ventas" (por ejemplo, la de un proyecto) y restaura la original al terminar.
  function withData(data, fn) {
    const prevRows = rows, prevCols = columns;
    rows = data.rows; columns = data.columns;
    try { return fn(); } finally { rows = prevRows; columns = prevCols; }
  }
  // Descripción del modelo para la interfaz
  const model = {
    fact: { name: 'Ventas', grain: 'una fila por venta', cols: columns.slice() },
    dims: Object.values(DIMS).map(d => ({ name: d.name, key: d.key, cols: Object.keys(d.cols), joins: d.cols[d.key] }))
  };

  return { rows, columns, dimensionCols, model, calendarRows: CAL_ROWS, parse, run, makeMeasures, distinctValues, slicerFilter, format, withData, DaxError };
})();
