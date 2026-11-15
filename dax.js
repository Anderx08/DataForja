/* DataForja — motor DAX didáctico.
   Implementa un subconjunto de DAX (agregaciones, CALCULATE, ALL, FILTER, iteradores, lógica)
   sobre una tabla de hechos plana "Ventas", con contexto de filtro y contexto de fila reales. */
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
          ID: id++, 'Año': anio, Mes: mes, MesNombre: meses[mes - 1], Fecha: `${anio}-${String(mes).padStart(2, '0')}-${String(between(1, 28)).padStart(2, '0')}`,
          Region: regiones[(k + mes) % 4], Categoria: cat, Producto: producto, Vendedor: vendedores[(k * 3 + mes) % vendedores.length],
          Unidades: unidades, Precio: precio, Ventas: unidades * precio, Costo: unidades * costoU
        });
      }
    }
  }
  let columns = ['ID', 'Año', 'Mes', 'MesNombre', 'Fecha', 'Region', 'Categoria', 'Producto', 'Vendedor', 'Unidades', 'Precio', 'Ventas', 'Costo'];
  const dimensionCols = ['Año', 'MesNombre', 'Region', 'Categoria', 'Producto', 'Vendedor'];
  const sortOrder = { MesNombre: meses };

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
      if (t.t === 'op' && t.v === '(') { next(); const e = parseOr(); expect(')'); return e; }
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
          if (!isOp(')')) { args.push(parseOr()); while (isOp(',')) { next(); args.push(parseOr()); } }
          expect(')');
          return { k: 'fn', name: t.v.toUpperCase(), args, pos: t.pos };
        }
        return { k: 'table', name: t.v, pos: t.pos };
      }
      if (t.t === 'eof') throw new DaxError('La expresión termina de forma inesperada. ¿Falta cerrar un paréntesis?', t.pos);
      throw new DaxError(`No se esperaba "${t.v}" aquí.`, t.pos);
    }
    const ast = parseOr();
    if (peek().t !== 'eof') throw new DaxError(`Texto sobrante a partir de "${peek().v}". Revisa comas y paréntesis.`, peek().pos);
    return ast;
  }

  /* ------------------------------------------------------------ evaluación */
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
  function colsIn(ast, acc = new Set()) {
    if (!ast || typeof ast !== 'object') return acc;
    if (ast.k === 'col') acc.add(ast.col);
    for (const key of Object.keys(ast)) {
      const v = ast[key];
      if (Array.isArray(v)) v.forEach(x => colsIn(x, acc));
      else if (v && typeof v === 'object' && v.k) colsIn(v, acc);
    }
    return acc;
  }
  function checkTable(name, pos) {
    if (name.toLowerCase() !== 'ventas') throw new DaxError(`La tabla "${name}" no existe en este modelo. La tabla de hechos se llama Ventas.`, pos);
  }
  function checkCol(col, pos) {
    const found = columns.find(c => c.toLowerCase() === col.toLowerCase());
    if (!found) throw new DaxError(`La columna [${col}] no existe en Ventas. Columnas disponibles: ${columns.join(', ')}.`, pos);
    return found;
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

  function evalTable(ast, ctx) {
    if (ast.k === 'table') { checkTable(ast.name, ast.pos); return tbl(filteredRows(ctx)); }
    if (ast.k === 'fn') {
      const n = ast.name;
      if (n === 'ALL' || n === 'ALLNOBLANKROW') {
        if (!ast.args.length) throw new DaxError('ALL necesita una tabla o una columna: ALL(Ventas) o ALL(Ventas[Region]).', ast.pos);
        if (ast.args[0].k === 'table') { checkTable(ast.args[0].name, ast.pos); return tbl(rows, { all: true }); }
        if (ast.args[0].k === 'col') {
          const cols = ast.args.map(a => { if (a.k !== 'col') throw new DaxError('Los argumentos de ALL deben ser columnas de la misma tabla.', ast.pos); return checkCol(a.col, a.pos); });
          return tbl(distinctRows(rows, cols), { allCols: cols, valuesOf: cols.length === 1 ? cols[0] : null });
        }
        throw new DaxError('ALL necesita una tabla o columnas como argumento.', ast.pos);
      }
      if (n === 'ALLSELECTED') { checkTable(ast.args[0] && ast.args[0].name || 'Ventas', ast.pos); return tbl(rows.filter(r => ctx.slicers.every(f => f.fn(r))), { all: true }); }
      if (n === 'FILTER') {
        if (ast.args.length !== 2) throw new DaxError('FILTER necesita dos argumentos: FILTER(tabla, condición).', ast.pos);
        const base = evalTable(ast.args[0], ctx);
        const out = base.rows.filter(r => truthy(evaluate(ast.args[1], { ...ctx, row: r })));
        return tbl(out);
      }
      if (n === 'VALUES' || n === 'DISTINCT') {
        const a = ast.args[0];
        if (a && a.k === 'col') {
          const col = checkCol(a.col, a.pos);
          return tbl(distinctRows(filteredRows(ctx), [col]), { valuesOf: col });
        }
        if (a && a.k === 'table') return tbl(filteredRows(ctx));
        throw new DaxError('VALUES necesita una columna: VALUES(Ventas[Region]).', ast.pos);
      }
      if (n === 'TOPN') {
        const k = num(evaluate(ast.args[0], ctx));
        const base = evalTable(ast.args[1], ctx);
        const desc = !(ast.args[3] && ast.args[3].k === 'num' && ast.args[3].v === 1) && !(ast.args[3] && ast.args[3].k === 'id' && ast.args[3].v.toUpperCase() === 'ASC');
        const scored = base.rows.map(r => ({ r, s: num(evaluate(ast.args[2], { ...ctx, row: r })) }));
        scored.sort((a, b) => desc ? b.s - a.s : a.s - b.s);
        return tbl(scored.slice(0, k).map(x => x.r));
      }
      if (n === 'CALCULATETABLE') {
        const nctx = applyCalculateFilters(ast.args.slice(1), ctx);
        return evalTable(ast.args[0], nctx);
      }
    }
    throw new DaxError('Aquí se esperaba una tabla (Ventas, ALL(...), FILTER(...), VALUES(...)).', ast.pos || 0);
  }

  function applyCalculateFilters(filterArgs, ctx) {
    let filters = ctx.filters.slice();
    if (ctx.row) filters = transition(filters, ctx.row); // transición de contexto
    for (const f of filterArgs) {
      if (f.k === 'fn' && (f.name === 'ALL' || f.name === 'ALLSELECTED')) {
        if (!f.args.length || f.args[0].k === 'table') filters = f.name === 'ALLSELECTED' ? ctx.slicers.slice() : [];
        else { const cols = f.args.map(a => checkCol(a.col, a.pos)); filters = filters.filter(x => !cols.includes(x.col)); }
        continue;
      }
      if (f.k === 'fn' && (f.name === 'FILTER' || f.name === 'VALUES' || f.name === 'TOPN' || f.name === 'CALCULATETABLE') || f.k === 'table') {
        const t = evalTable(f, { ...ctx, row: null });
        if (t.meta && t.meta.valuesOf) {
          const col = t.meta.valuesOf; const set = new Set(t.rows.map(r => r[col]));
          filters = filters.filter(x => x.col !== col); filters.push({ col, fn: r => set.has(r[col]) });
        } else if (t.rows.length && t.rows[0].__virtual) {
          const vcols = Object.keys(t.rows[0]).filter(k => k !== '__virtual');
          const keys = new Set(t.rows.map(v => vcols.map(c => String(v[c])).join('\u0001')));
          filters = filters.filter(x => !vcols.includes(x.col));
          filters.push({ col: vcols.length === 1 ? vcols[0] : '*table', fn: r => keys.has(vcols.map(c => String(r[c])).join('\u0001')) });
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
      const col = checkCol(cols[0]);
      const evalCtx = { ...ctx, row: null, filters: [] };
      filters = filters.filter(x => x.col !== col);
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
    checkTable(a.table, a.pos);
    const col = checkCol(a.col, a.pos);
    const rs = filteredRows(ctx);
    const vals = rs.map(r => r[col]).filter(v => v !== null && v !== undefined);
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
        checkTable(ast.table, ast.pos);
        const col = checkCol(ast.col, ast.pos);
        if (ctx.row) {
          if (ctx.row.__virtual && !(col in ctx.row)) throw new DaxError(`La tabla de este iterador solo tiene la columna [${Object.keys(ctx.row).filter(k => k !== '__virtual').join(', ')}]. Para usar Ventas[${col}] por fila, itera sobre Ventas o usa una medida.`, ast.pos);
          return ctx.row[col] === undefined ? null : ctx.row[col];
        }
        // sin contexto de fila: si el filtro deja un único valor, se puede devolver (como SELECTEDVALUE)
        const rs = filteredRows(ctx); const set = new Set(rs.map(r => r[col]));
        if (set.size === 1) return [...set][0];
        throw new DaxError(`La columna Ventas[${col}] tiene muchos valores en este contexto. Para usarla como número necesitas una agregación (SUM(Ventas[${col}])) o un iterador (SUMX). Para un texto, usa SELECTEDVALUE.`, ast.pos);
      }
      case 'table': {
        checkTable(ast.name, ast.pos);
        return tbl(filteredRows(ctx));
      }
      case 'measure': {
        const m = ctx.measures.get(ast.name.toLowerCase());
        if (!m) throw new DaxError(`La medida [${ast.name}] no existe. Créala en el panel de medidas o revisa el nombre.`, ast.pos);
        if ((ctx.depth || 0) > 40) throw new DaxError(`Referencia circular al evaluar [${ast.name}].`, ast.pos);
        let nctx = { ...ctx, depth: (ctx.depth || 0) + 1 };
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
        return t.rows.length || null;
      }
      case 'CALCULATE': {
        if (!args.length) throw new DaxError('CALCULATE necesita al menos una expresión.', ast.pos);
        const nctx = applyCalculateFilters(args.slice(1), ctx);
        return evaluate(args[0], nctx);
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
      case 'ROUND': { const x = num(arg(0)), d = args[1] ? num(arg(1)) : 0; const f = Math.pow(10, d); return Math.round(x * f) / f; }
      case 'ROUNDUP': { const x = num(arg(0)), d = args[1] ? num(arg(1)) : 0; const f = Math.pow(10, d); return Math.ceil(x * f) / f; }
      case 'ROUNDDOWN': case 'TRUNC': { const x = num(arg(0)), d = args[1] ? num(arg(1)) : 0; const f = Math.pow(10, d); return Math.trunc(x * f) / f; }
      case 'INT': return Math.floor(num(arg(0)));
      case 'ABS': return Math.abs(num(arg(0)));
      case 'SQRT': return Math.sqrt(num(arg(0)));
      case 'HASONEVALUE': { const col = checkCol(args[0].col, args[0].pos); return new Set(filteredRows(ctx).map(r => r[col])).size === 1; }
      case 'SELECTEDVALUE': {
        if (!args[0] || args[0].k !== 'col') throw new DaxError('SELECTEDVALUE necesita una columna: SELECTEDVALUE(Ventas[Region], "Todas").', ast.pos);
        const col = checkCol(args[0].col, args[0].pos); const set = new Set(filteredRows(ctx).map(r => r[col]));
        return set.size === 1 ? [...set][0] : (args[1] ? arg(1) : null);
      }
      case 'CONCATENATE': return String(arg(0) ?? '') + String(arg(1) ?? '');
      case 'FORMAT': {
        const v = arg(0); const fmt = String(arg(1) || '');
        if (typeof v === 'number') {
          if (/%/.test(fmt)) return (v * 100).toFixed((fmt.split('.')[1] || '').length) + '%';
          const dec = (fmt.split('.')[1] || '').length;
          return v.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        }
        return v === null ? '' : String(v);
      }
      case 'UPPER': return String(arg(0) ?? '').toUpperCase();
      case 'LOWER': return String(arg(0) ?? '').toLowerCase();
      case 'LEN': return String(arg(0) ?? '').length;
      case 'ALL': case 'ALLSELECTED': case 'FILTER': case 'VALUES': case 'DISTINCT': case 'TOPN': case 'CALCULATETABLE':
        return evalTable(ast, ctx);
      case 'RANKX': {
        const t = evalTable(args[0], ctx);
        const scores = t.rows.map(r => num(evaluate(args[1], { ...ctx, row: r })));
        const current = args[2] ? num(evaluate(args[2], ctx)) : num(evaluate(args[1], ctx));
        const desc = !(args[4] && args[4].k === 'id' && args[4].v.toUpperCase() === 'ASC');
        return 1 + scores.filter(s => desc ? s > current : s < current).length;
      }
      case 'RELATED': throw new DaxError('RELATED no hace falta aquí: este modelo didáctico usa una sola tabla plana (Ventas). En un modelo estrella, RELATED trae una columna de la dimensión relacionada.', ast.pos);
      case 'DATESYTD': case 'SAMEPERIODLASTYEAR': case 'DATEADD': case 'TOTALYTD': case 'PREVIOUSMONTH':
        throw new DaxError(`${n} necesita una tabla de calendario marcada como tabla de fechas. Este laboratorio no la incluye; la lección 9 explica cómo funciona.`, ast.pos);
    }
    throw new DaxError(`La función ${n} no está disponible en este laboratorio. Funciones soportadas: SUM, AVERAGE, MIN, MAX, COUNT, DISTINCTCOUNT, COUNTROWS, SUMX, AVERAGEX, MAXX, MINX, COUNTX, CALCULATE, FILTER, ALL, ALLSELECTED, VALUES, TOPN, RANKX, DIVIDE, IF, SWITCH, AND, OR, NOT, BLANK, ISBLANK, ROUND, INT, ABS, SELECTEDVALUE, HASONEVALUE, FORMAT, CONCATENATE.`, ast.pos);
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
    const ctx = { filters: [...slicers, ...(opts.extraFilters || [])], slicers, row: null, measures: opts.measures || new Map(), depth: 0 };
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

  return { rows, columns, dimensionCols, parse, run, makeMeasures, distinctValues, slicerFilter, format, withData, DaxError };
})();
