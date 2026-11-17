/* DataForja — simulador didáctico de Power Query.
   Una tabla de origen, una lista de "pasos aplicados" como en Power BI, el código M que generan
   y una comprobación contra la tabla objetivo. Las transformaciones imitan las del editor real. */
window.PQ = (function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ERR = { __err: true };
  const isErr = v => v && v.__err;
  const empty = v => v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
  const clone = t => ({ cols: t.cols.slice(), rows: t.rows.map(r => r.slice()), types: (t.types || t.cols.map(() => 'any')).slice() });
  const idx = (t, c) => { const i = t.cols.indexOf(c); if (i < 0) throw new Error(`La columna "${c}" no existe en este paso. Columnas: ${t.cols.join(', ')}.`); return i; };
  const mapCol = (t, c, fn) => { const i = idx(t, c); t.rows.forEach(r => { if (!isErr(r[i])) r[i] = fn(r[i]); }); return t; };
  const proper = s => String(s).toLowerCase().replace(/(^|[\s\-'])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  function toNumber(v) {
    if (typeof v === 'number') return v;
    if (empty(v)) return null;
    const s = String(v).trim();
    if (!/^-?\d+(\.\d+)?$/.test(s)) return ERR;
    return parseFloat(s);
  }
  function toDate(v) {
    if (empty(v)) return null;
    const s = String(v).trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return s;
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return ERR;
  }
  const TYPE_LABEL = { number: '1.2', int: '123', text: 'ABC', date: 'fecha', any: 'ABC 123' };

  /* ------------------------------------------------------------ operaciones */
  const OPS = {
    promote: { label: 'Usar la primera fila como encabezado', group: 'Tabla', params: [],
      fn: t => { if (!t.rows.length) throw new Error('No hay filas para usar como encabezado.'); return { cols: t.rows[0].map(v => String(v ?? '')), rows: t.rows.slice(1), types: t.rows[0].map(() => 'any') }; },
      m: () => 'Table.PromoteHeaders(#"{prev}", [PromoteAllScalars=true])', step: 'Encabezados promovidos' },
    removeTop: { label: 'Quitar filas superiores', group: 'Filas', params: [{ k: 'n', label: 'Número de filas', type: 'number' }],
      fn: (t, a) => { t.rows = t.rows.slice(Math.max(0, parseInt(a.n, 10) || 0)); return t; },
      m: a => `Table.Skip(#"{prev}", ${parseInt(a.n, 10) || 0})`, step: 'Filas superiores quitadas' },
    removeEmpty: { label: 'Quitar filas en blanco', group: 'Filas', params: [],
      fn: t => { t.rows = t.rows.filter(r => r.some(v => !empty(v))); return t; },
      m: () => 'Table.SelectRows(#"{prev}", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null})))', step: 'Filas en blanco quitadas' },
    filter: { label: 'Filtrar filas', group: 'Filas', params: [{ k: 'col', label: 'Columna', type: 'col' }, { k: 'op', label: 'Condición', type: 'select', options: ['no está vacío', 'es igual a', 'no es igual a', 'es mayor que', 'es menor que', 'contiene'] }, { k: 'value', label: 'Valor', type: 'text', optional: true }],
      fn: (t, a) => {
        const i = idx(t, a.col);
        const val = a.value; const nv = parseFloat(val);
        const test = v => {
          if (isErr(v)) return false;
          switch (a.op) {
            case 'no está vacío': return !empty(v);
            case 'es igual a': return String(v ?? '') === String(val ?? '');
            case 'no es igual a': return String(v ?? '') !== String(val ?? '');
            case 'es mayor que': return typeof v === 'number' ? v > nv : String(v) > String(val);
            case 'es menor que': return typeof v === 'number' ? v < nv : String(v) < String(val);
            case 'contiene': return String(v ?? '').includes(String(val ?? ''));
          }
          return true;
        };
        t.rows = t.rows.filter(r => test(r[i])); return t;
      },
      m: a => { const c = `[${a.col}]`; const v = isNaN(parseFloat(a.value)) ? `"${a.value}"` : a.value; return `Table.SelectRows(#"{prev}", each ${({ 'no está vacío': `${c} <> null and ${c} <> ""`, 'es igual a': `${c} = ${v}`, 'no es igual a': `${c} <> ${v}`, 'es mayor que': `${c} > ${v}`, 'es menor que': `${c} < ${v}`, 'contiene': `Text.Contains(${c}, "${a.value}")` })[a.op]})`; }, step: 'Filas filtradas' },
    dedupe: { label: 'Quitar duplicados', group: 'Filas', params: [],
      fn: t => { const seen = new Set(); t.rows = t.rows.filter(r => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; }); return t; },
      m: () => 'Table.Distinct(#"{prev}")', step: 'Duplicados quitados' },
    removeErrors: { label: 'Quitar errores', group: 'Filas', params: [{ k: 'col', label: 'Columna', type: 'col' }],
      fn: (t, a) => { const i = idx(t, a.col); t.rows = t.rows.filter(r => !isErr(r[i])); return t; },
      m: a => `Table.RemoveRowsWithErrors(#"{prev}", {"${a.col}"})`, step: 'Errores quitados' },
    removeCol: { label: 'Quitar columna', group: 'Columnas', params: [{ k: 'col', label: 'Columna', type: 'col' }],
      fn: (t, a) => { const i = idx(t, a.col); t.cols.splice(i, 1); t.types.splice(i, 1); t.rows.forEach(r => r.splice(i, 1)); return t; },
      m: a => `Table.RemoveColumns(#"{prev}", {"${a.col}"})`, step: 'Columnas quitadas' },
    rename: { label: 'Cambiar nombre de columna', group: 'Columnas', params: [{ k: 'col', label: 'Columna', type: 'col' }, { k: 'name', label: 'Nombre nuevo', type: 'text' }],
      fn: (t, a) => { const i = idx(t, a.col); if (!a.name) throw new Error('Escribe el nombre nuevo.'); t.cols[i] = a.name; return t; },
      m: a => `Table.RenameColumns(#"{prev}", {{"${a.col}", "${a.name}"}})`, step: 'Columnas con nombre cambiado' },
    type: { label: 'Cambiar tipo', group: 'Columnas', params: [{ k: 'col', label: 'Columna', type: 'col' }, { k: 'to', label: 'Tipo', type: 'select', options: ['Número decimal', 'Número entero', 'Texto', 'Fecha'] }],
      fn: (t, a) => {
        const i = idx(t, a.col);
        const f = a.to === 'Texto' ? (v => v === null ? null : String(v)) : a.to === 'Fecha' ? toDate : a.to === 'Número entero' ? (v => { const n = toNumber(v); return isErr(n) || n === null ? n : Math.round(n); }) : toNumber;
        t.rows.forEach(r => { r[i] = f(r[i]); });
        t.types[i] = a.to === 'Texto' ? 'text' : a.to === 'Fecha' ? 'date' : a.to === 'Número entero' ? 'int' : 'number';
        return t;
      },
      m: a => `Table.TransformColumnTypes(#"{prev}", {{"${a.col}", ${({ 'Número decimal': 'type number', 'Número entero': 'Int64.Type', 'Texto': 'type text', 'Fecha': 'type date' })[a.to]}}})`, step: 'Tipo cambiado' },
    trim: { label: 'Recortar espacios', group: 'Texto', params: [{ k: 'col', label: 'Columna', type: 'col' }],
      fn: (t, a) => mapCol(t, a.col, v => typeof v === 'string' ? v.trim() : v),
      m: a => `Table.TransformColumns(#"{prev}", {{"${a.col}", Text.Trim, type text}})`, step: 'Texto recortado' },
    proper: { label: 'Poner en mayúsculas cada palabra', group: 'Texto', params: [{ k: 'col', label: 'Columna', type: 'col' }],
      fn: (t, a) => mapCol(t, a.col, v => typeof v === 'string' ? proper(v) : v),
      m: a => `Table.TransformColumns(#"{prev}", {{"${a.col}", Text.Proper, type text}})`, step: 'Poner En Mayúsculas Cada Palabra' },
    upper: { label: 'MAYÚSCULAS', group: 'Texto', params: [{ k: 'col', label: 'Columna', type: 'col' }],
      fn: (t, a) => mapCol(t, a.col, v => typeof v === 'string' ? v.toUpperCase() : v),
      m: a => `Table.TransformColumns(#"{prev}", {{"${a.col}", Text.Upper, type text}})`, step: 'Texto en mayúsculas' },
    lower: { label: 'minúsculas', group: 'Texto', params: [{ k: 'col', label: 'Columna', type: 'col' }],
      fn: (t, a) => mapCol(t, a.col, v => typeof v === 'string' ? v.toLowerCase() : v),
      m: a => `Table.TransformColumns(#"{prev}", {{"${a.col}", Text.Lower, type text}})`, step: 'Texto en minúsculas' },
    replace: { label: 'Reemplazar valores', group: 'Texto', params: [{ k: 'col', label: 'Columna', type: 'col' }, { k: 'find', label: 'Valor que buscar', type: 'text' }, { k: 'repl', label: 'Reemplazar con', type: 'text', optional: true }],
      fn: (t, a) => mapCol(t, a.col, v => v === null ? v : String(v).split(a.find ?? '').join(a.repl ?? '')),
      m: a => `Table.ReplaceValue(#"{prev}", "${a.find}", "${a.repl || ''}", Replacer.ReplaceText, {"${a.col}"})`, step: 'Valor reemplazado' },
    split: { label: 'Dividir columna por delimitador', group: 'Texto', params: [{ k: 'col', label: 'Columna', type: 'col' }, { k: 'delim', label: 'Delimitador', type: 'text' }],
      fn: (t, a) => {
        const i = idx(t, a.col); const d = a.delim || ',';
        const parts = t.rows.map(r => r[i] === null ? [null] : String(r[i]).split(d).map(x => x.trim()));
        const n = Math.max(2, ...parts.map(p => p.length));
        const names = Array.from({ length: n }, (_, k) => `${a.col}.${k + 1}`);
        t.cols.splice(i, 1, ...names); t.types.splice(i, 1, ...names.map(() => 'text'));
        t.rows.forEach((r, ri) => r.splice(i, 1, ...names.map((_, k) => parts[ri][k] ?? null)));
        return t;
      },
      m: a => `Table.SplitColumn(#"{prev}", "${a.col}", Splitter.SplitTextByDelimiter("${a.delim}"))`, step: 'Dividir columna por delimitador' },
    fillDown: { label: 'Rellenar hacia abajo', group: 'Columnas', params: [{ k: 'col', label: 'Columna', type: 'col' }],
      fn: (t, a) => { const i = idx(t, a.col); let last = null; t.rows.forEach(r => { if (empty(r[i])) r[i] = last; else last = r[i]; }); return t; },
      m: a => `Table.FillDown(#"{prev}", {"${a.col}"})`, step: 'Relleno hacia abajo' },
    unpivot: { label: 'Anular dinamización de otras columnas', group: 'Columnas', params: [{ k: 'keep', label: 'Columnas que se quedan fijas', type: 'cols' }],
      fn: (t, a) => {
        const keep = (a.keep || []).filter(Boolean); if (!keep.length) throw new Error('Elige al menos una columna fija.');
        const ki = keep.map(c => idx(t, c)); const others = t.cols.map((c, i) => i).filter(i => !ki.includes(i));
        const rows = [];
        t.rows.forEach(r => others.forEach(i => { if (!empty(r[i])) rows.push([...ki.map(k => r[k]), t.cols[i], r[i]]); }));
        return { cols: [...keep, 'Atributo', 'Valor'], rows, types: [...ki.map(k => t.types[k]), 'text', 'any'] };
      },
      m: a => `Table.UnpivotOtherColumns(#"{prev}", {${(a.keep || []).map(c => `"${c}"`).join(', ')}}, "Atributo", "Valor")`, step: 'Columna de anulación de dinamización' }
  };

  function apply(source, steps) {
    let t = clone(source); const out = [];
    for (const st of steps) {
      try { t = OPS[st.op].fn(clone(t), st.a || {}); out.push({ ok: true, table: t }); }
      catch (e) { out.push({ ok: false, err: e.message, table: t }); break; }
    }
    return { table: t, trace: out };
  }
  function mCode(steps) {
    const lines = ['let', '    Origen = Excel.CurrentWorkbook(){[Name="Datos"]}[Content]'];
    let prev = 'Origen'; const used = {};
    steps.forEach(st => {
      const base = OPS[st.op].step; used[base] = (used[base] || 0) + 1;
      const name = used[base] > 1 ? `${base}${used[base]}` : base;
      lines[lines.length - 1] += ',';
      lines.push(`    #"${name}" = ${OPS[st.op].m(st.a || {}).replace('#"{prev}"', prev === 'Origen' ? 'Origen' : `#"${prev}"`)}`);
      prev = name;
    });
    lines.push('in', `    ${prev === 'Origen' ? 'Origen' : `#"${prev}"`}`);
    return lines.join('\n');
  }
  function stepLabel(st) {
    const o = OPS[st.op]; const a = st.a || {};
    const det = o.params.map(p => p.type === 'cols' ? (a[p.k] || []).join(', ') : a[p.k]).filter(x => x !== undefined && x !== '').join(' · ');
    return o.label + (det ? ': ' + det : '');
  }

  /* ------------------------------------------------------------ comparación */
  const cellKey = v => isErr(v) ? 'Error' : v === null || v === undefined ? 'null' : typeof v === 'number' ? 'n:' + Math.round(v * 100) / 100 : 's:' + v;
  function compare(t, target) {
    if (t.cols.join('|') !== target.cols.join('|')) return { ok: false, why: `Las columnas no coinciden. Tienes: ${t.cols.join(', ')}. Se esperan: ${target.cols.join(', ')}.` };
    if (t.rows.length !== target.rows.length) return { ok: false, why: `Tienes ${t.rows.length} filas y se esperan ${target.rows.length}.` };
    for (let i = 0; i < t.rows.length; i++) for (let j = 0; j < t.cols.length; j++) {
      const a = t.rows[i][j], b = target.rows[i][j];
      if (cellKey(a) !== cellKey(b)) {
        let tip = '';
        if (typeof b === 'number' && typeof a === 'string') tip = ' Parece que falta cambiar el tipo de la columna a número.';
        else if (isErr(a)) tip = ' Hay un error en esa celda: limpia el texto antes de cambiar el tipo, o quita las filas con error.';
        else if (typeof a === 'string' && typeof b === 'string' && a.trim() === b.trim()) tip = ' Sobran espacios: prueba Recortar.';
        else if (typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase()) tip = ' Cambia mayúsculas y minúsculas.';
        return { ok: false, why: `La fila ${i + 1}, columna "${t.cols[j]}" tiene ${fmt(a)} y se espera ${fmt(b)}.${tip}` };
      }
    }
    return { ok: true };
  }
  const fmt = v => isErr(v) ? 'Error' : v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : `"${v}"`;

  /* ------------------------------------------------------------ interfaz */
  function inferType(t, i) { if (t.types && t.types[i] && t.types[i] !== 'any') return t.types[i]; const vals = t.rows.map(r => r[i]).filter(v => !empty(v)); return vals.length && vals.every(v => typeof v === 'number') ? 'number' : 'any'; }
  function tableHTML(t, max) {
    max = max || 40;
    return `<div class="pq-table-wrap"><table class="pq-table"><thead><tr><th class="pq-rn"></th>${t.cols.map((c, i) => `<th><span class="pq-type">${TYPE_LABEL[inferType(t, i)]}</span>${esc(c)}</th>`).join('')}</tr></thead><tbody>${t.rows.slice(0, max).map((r, ri) => `<tr><td class="pq-rn">${ri + 1}</td>${r.map(v => isErr(v) ? '<td class="pq-err">Error</td>' : v === null || v === undefined ? '<td class="pq-null">null</td>' : `<td class="${typeof v === 'number' ? 'num' : ''}">${esc(v === '' ? '' : v)}${typeof v === 'string' && /^\s|\s$/.test(v) ? '<span class="pq-space" title="Espacios al inicio o al final">·</span>' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${t.rows.length > max ? `<p class="pq-more">Mostrando ${max} de ${t.rows.length} filas.</p>` : `<p class="pq-more">${t.rows.length} filas · ${t.cols.length} columnas</p>`}`;
  }

  function mount(host, cfg) {
    let steps = [];
    try { const saved = cfg.stateKey && cfg.store && cfg.store.get(cfg.stateKey); if (Array.isArray(saved)) steps = saved; } catch (e) { /* sin borrador */ }
    const persist = () => { if (cfg.stateKey && cfg.store) cfg.store.set(cfg.stateKey, steps); };
    let hintN = 0;
    host.innerHTML = `
      <div class="pq">
        <div class="pq-main">
          <div class="pq-bar"><span class="pq-title">Vista previa</span><span class="pq-step-name"></span></div>
          <div class="pq-preview"></div>
          <div class="pq-add">
            <label class="pq-lbl">Agregar un paso
              <select class="select pq-op"><option value="">Elige una transformación…</option>${['Tabla', 'Filas', 'Columnas', 'Texto'].map(g => `<optgroup label="${g}">${Object.entries(OPS).filter(([, o]) => o.group === g).map(([k, o]) => `<option value="${k}">${esc(o.label)}</option>`).join('')}</optgroup>`).join('')}</select>
            </label>
            <div class="pq-params"></div>
            <button class="btn btn-small btn-primary pq-apply" disabled>Aplicar paso</button>
          </div>
          <p class="pq-msg" hidden></p>
        </div>
        <aside class="pq-side">
          <p class="pq-title">Pasos aplicados</p>
          <ol class="pq-steps"></ol>
          <div class="pq-actions">
            ${cfg.target ? '<button class="btn btn-small btn-primary pq-check">Comprobar</button>' : ''}
            ${cfg.target ? '<button class="btn btn-small btn-ghost pq-target">Ver tabla objetivo</button>' : ''}
            ${cfg.hints && cfg.hints.length ? '<button class="btn btn-small btn-ghost pq-hint">Pista</button>' : ''}
            ${cfg.solutionSteps ? '<button class="btn btn-small btn-ghost pq-sol">Ver solución</button>' : ''}
            <button class="btn btn-small btn-text pq-reset">Reiniciar</button>
          </div>
          <div class="pq-hints"></div>
          <details class="pq-m"><summary>Código M generado (Editor avanzado)</summary><pre><code></code></pre></details>
        </aside>
      </div>
      <div class="pq-target-box" hidden><p class="pq-title">Tabla objetivo</p></div>`;
    const $ = s => host.querySelector(s);
    const opSel = $('.pq-op'), params = $('.pq-params'), applyBtn = $('.pq-apply'), msg = $('.pq-msg');
    let current = cfg.source;
    function render() {
      const r = apply(cfg.source, steps); current = r.table;
      const bad = r.trace.findIndex(x => !x.ok);
      $('.pq-preview').innerHTML = tableHTML(r.table);
      $('.pq-step-name').textContent = steps.length ? 'después de: ' + OPS[steps[steps.length - 1].op].step : 'Origen';
      $('.pq-steps').innerHTML = `<li class="pq-origin">Origen</li>` + steps.map((st, i) => `<li class="${bad === i ? 'bad' : ''}"><span>${esc(stepLabel(st))}</span><button class="pq-del" data-i="${i}" title="Quitar este paso" aria-label="Quitar el paso ${i + 1}">×</button></li>`).join('');
      host.querySelectorAll('.pq-del').forEach(b => b.addEventListener('click', () => { steps.splice(+b.dataset.i); persist(); render(); }));
      $('.pq-m code').textContent = mCode(steps);
      if (bad >= 0) { msg.hidden = false; msg.className = 'pq-msg bad'; msg.textContent = `El paso ${bad + 1} falló: ${r.trace[bad].err} Quítalo con la × para seguir.`; }
      else msg.hidden = true;
      if (opSel.value) buildParams();
    }
    function buildParams() {
      const o = OPS[opSel.value]; applyBtn.disabled = !o;
      if (!o) { params.innerHTML = ''; return; }
      params.innerHTML = o.params.map(p => {
        if (p.type === 'col') return `<label class="pq-lbl">${p.label}<select class="select" data-k="${p.k}">${current.cols.map(c => `<option>${esc(c)}</option>`).join('')}</select></label>`;
        if (p.type === 'cols') return `<fieldset class="pq-cols"><legend>${p.label}</legend>${current.cols.map(c => `<label><input type="checkbox" data-k="${p.k}" value="${esc(c)}"> ${esc(c)}</label>`).join('')}</fieldset>`;
        if (p.type === 'select') return `<label class="pq-lbl">${p.label}<select class="select" data-k="${p.k}">${p.options.map(x => `<option>${esc(x)}</option>`).join('')}</select></label>`;
        return `<label class="pq-lbl">${p.label}<input class="input" data-k="${p.k}" ${p.type === 'number' ? 'type="number" min="0"' : ''} placeholder="${p.optional ? '(puede quedar vacío)' : ''}"></label>`;
      }).join('') || '<p class="pq-more">Este paso no necesita opciones.</p>';
    }
    opSel.addEventListener('change', buildParams);
    applyBtn.addEventListener('click', () => {
      const o = OPS[opSel.value]; if (!o) return;
      const a = {};
      o.params.forEach(p => {
        if (p.type === 'cols') a[p.k] = [...params.querySelectorAll(`input[data-k="${p.k}"]:checked`)].map(x => x.value);
        else { const el = params.querySelector(`[data-k="${p.k}"]`); a[p.k] = el ? el.value : ''; }
      });
      steps.push({ op: opSel.value, a }); persist();
      opSel.value = ''; params.innerHTML = ''; applyBtn.disabled = true;
      render();
    });
    const tgt = $('.pq-target');
    if (tgt) tgt.addEventListener('click', () => { const box = host.querySelector('.pq-target-box'); box.hidden = !box.hidden; if (!box.querySelector('table')) box.insertAdjacentHTML('beforeend', tableHTML(cfg.target)); tgt.textContent = box.hidden ? 'Ver tabla objetivo' : 'Ocultar tabla objetivo'; });
    const chk = $('.pq-check');
    if (chk) chk.addEventListener('click', () => { const r = apply(cfg.source, steps); if (r.trace.some(x => !x.ok)) { cfg.onCheck(false, 'Hay un paso con error. Quítalo antes de comprobar.'); return; } const c = compare(r.table, cfg.target); cfg.onCheck(c.ok, c.ok ? `La tabla quedó igual a la objetivo con ${steps.length} pasos.` : c.why); });
    const hb = $('.pq-hint');
    if (hb) hb.addEventListener('click', () => { if (hintN < cfg.hints.length) { $('.pq-hints').insertAdjacentHTML('beforeend', `<p class="hint"><b>Pista ${hintN + 1}.</b> ${esc(cfg.hints[hintN])}</p>`); hintN++; } if (hintN >= cfg.hints.length) { hb.disabled = true; hb.textContent = 'Sin más pistas'; } });
    const sb = $('.pq-sol');
    if (sb) sb.addEventListener('click', () => { $('.pq-hints').insertAdjacentHTML('beforeend', `<div class="hint"><b>Una solución posible:</b><ol>${cfg.solutionSteps.map(st => `<li>${esc(stepLabel(st))}</li>`).join('')}</ol><button class="btn btn-small pq-load">Cargar estos pasos</button></div>`); sb.disabled = true; $('.pq-load').addEventListener('click', () => { steps = JSON.parse(JSON.stringify(cfg.solutionSteps)); persist(); render(); }); });
    $('.pq-reset').addEventListener('click', () => { steps = []; persist(); render(); });
    render();
    return { getSteps: () => steps, setSteps: s => { steps = s; render(); }, table: () => current };
  }

  return { OPS, apply, mCode, compare, mount, tableHTML, ERR };
})();
