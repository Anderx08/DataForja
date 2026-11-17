/* DataForja — aplicación */
(function () {
  'use strict';
  const C = window.CONTENT;
  const TRACKS = Object.fromEntries(C.tracks.map(t => [t.id, t]));
  const LESSONS = {};
  C.tracks.forEach(t => t.lessons.forEach((l, i) => { LESSONS[l.id] = l; l.track = t.id; l.index = i; }));
  const ALL_LESSONS = C.tracks.flatMap(t => t.lessons);
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================ estado */
  const DEFAULT_MEASURES = [
    { name: 'Ventas Totales', expr: 'SUM(Ventas[Ventas])' },
    { name: 'Costo Total', expr: 'SUM(Ventas[Costo])' },
    { name: 'Unidades', expr: 'SUM(Ventas[Unidades])' },
    { name: 'Margen', expr: '[Ventas Totales] - [Costo Total]' },
    { name: 'Margen %', expr: 'DIVIDE([Margen], [Ventas Totales])' },
    { name: 'Num Ventas', expr: 'COUNTROWS(Ventas)' }
  ];
  const KEY = 'dataforja-v1';
  const freshState = theme => ({
    completed: [], xp: 0, streak: 0, bestStreak: 0, lastDay: null,
    practice: {}, quiz: {}, daily: {}, badges: [], theme: theme || 'system', last: null,
    measures: DEFAULT_MEASURES.slice(), visual: { type: 'bar', axis: 'Region', measure: 'Ventas Totales' }, slicers: {},
    drafts: {}, srs: {}, reviewCorrect: 0, exams: {}, projects: {}
  });
  let state = freshState();
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) state = Object.assign(state, JSON.parse(raw)); } catch (e) { /* sin almacenamiento */ }
    if (!Array.isArray(state.measures) || !state.measures.length) state.measures = DEFAULT_MEASURES.slice();
    for (const k of ['srs', 'exams', 'projects', 'practice', 'quiz', 'drafts']) if (!state[k] || typeof state[k] !== 'object') state[k] = {};
    // Las respuestas de retos anteriores a esta versión entran al repaso para hoy.
    for (const [lid, picks] of Object.entries(state.quiz)) {
      const l = LESSONS[lid]; if (!l || !l.quiz) continue;
      for (const [qi, pick] of Object.entries(picks)) {
        const id = `L:${lid}:${qi}`;
        if (!state.srs[id] && l.quiz[qi]) state.srs[id] = { box: pick === l.quiz[qi].answer ? 1 : 0, due: today() };
      }
    }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento */ } }
  const today = () => new Date().toISOString().slice(0, 10);
  function touchStreak() {
    const t = today();
    if (state.lastDay === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    state.streak = state.lastDay === y.toISOString().slice(0, 10) ? state.streak + 1 : 1;
    state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
    state.lastDay = t;
  }
  function addXP(n, why) {
    state.xp += n; touchStreak(); save(); renderTopbar();
    toast(`+${n} XP`, why);
    checkBadges();
  }
  function checkBadges() {
    for (const b of C.badges) {
      if (!state.badges.includes(b.id) && b.test(state)) { state.badges.push(b.id); save(); toast('Insignia desbloqueada', b.name, 'badge'); }
    }
  }
  const trackProgress = t => { const done = t.lessons.filter(l => state.completed.includes(l.id)).length; return { done, total: t.lessons.length, pct: Math.round(100 * done / t.lessons.length) }; };

  /* ============================================================ repaso espaciado (cajas de Leitner) */
  const INTERVALS = [1, 3, 7, 14, 30, 60];
  const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const fmtDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const SRS_ITEMS = {};
  C.tracks.forEach(t => {
    t.lessons.forEach(l => (l.quiz || []).forEach((q, qi) => { SRS_ITEMS[`L:${l.id}:${qi}`] = { ...q, track: t.id, lesson: l.id }; }));
    if (t.exam) t.exam.questions.forEach((q, qi) => { SRS_ITEMS[`E:${t.id}:${qi}`] = { ...q, track: t.id, lesson: q.lesson }; });
  });
  C.daily.forEach((q, i) => { SRS_ITEMS[`D:${i}`] = { ...q, track: q.track, lesson: null }; });
  // Primera respuesta: correcta va a la caja 1 (vuelve en 3 días); incorrecta a la caja 0 (mañana).
  // En el repaso: correcta sube una caja; incorrecta vuelve a la caja 0.
  function srsRecord(id, correct, fromReview) {
    if (!SRS_ITEMS[id]) return;
    const prev = state.srs[id];
    let box;
    if (!prev) box = correct ? 1 : 0;
    else if (fromReview) box = correct ? Math.min(prev.box + 1, INTERVALS.length - 1) : 0;
    else box = correct ? prev.box : 0;
    state.srs[id] = { box, due: addDays(today(), INTERVALS[box]) };
  }
  const dueIds = () => Object.entries(state.srs).filter(([id, it]) => SRS_ITEMS[id] && it.due <= today()).map(([id]) => id);
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ============================================================ criterio para completar una lección */
  const quizOk = (l, qi) => !!(state.quiz[l.id] && state.quiz[l.id][qi] === l.quiz[qi].answer);
  function requirements(l) {
    const r = [];
    if (l.practice) r.push({ label: l.practice.type === 'visual' ? 'Construir y comprobar el visual' : 'Superar la práctica', ok: !!state.practice[l.id] });
    if (l.quiz) r.push({ label: l.quiz.length > 1 ? `Responder bien los ${l.quiz.length} retos rápidos` : 'Responder bien el reto rápido', ok: l.quiz.every((q, qi) => quizOk(l, qi)) });
    return r;
  }
  function tryComplete(l) {
    if (state.completed.includes(l.id)) return false;
    const reqs = requirements(l);
    if (!reqs.length || !reqs.every(x => x.ok)) return false;
    state.completed.push(l.id); save();
    addXP(100, 'Lección completada: ' + l.title);
    const t = TRACKS[l.track]; const nx = t.lessons[l.index + 1];
    if (nx) setTimeout(() => toast('Siguiente lección', nx.title), 600);
    else if (t.exam) setTimeout(() => toast('Ruta terminada', 'Ya puedes presentar el examen final de ' + t.name), 600);
    return true;
  }

  /* ============================================================ UI básicos */
  let toastTimer;
  function toast(title, sub, kind) {
    const host = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast-' + kind : '');
    el.innerHTML = `<strong>${esc(title)}</strong>${sub ? `<span>${esc(sub)}</span>` : ''}`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3200);
  }
  function icon(name) {
    const d = {
      python: '<path d="M12 2c-3.3 0-5 1.5-5 3.5V8h5v1H5.5C3.5 9 2 10.5 2 13.5S3.5 18 5.5 18H7v-2.5c0-2 1.7-3.5 3.5-3.5h4c1.7 0 3-1.3 3-3V5.5C17.5 3.5 15.3 2 12 2zm-2 2.2a1 1 0 110 2 1 1 0 010-2z"/><path d="M17 8v2.5c0 2-1.7 3.5-3.5 3.5h-4C7.8 14 7 15.3 7 17v1.5c0 2 2.2 3.5 5 3.5s5-1.5 5-3.5V16h-5v-1h6.5c2 0 3.5-1.5 3.5-4.5S20.5 8 18.5 8H17zm-3 10a1 1 0 110 2 1 1 0 010-2z"/>',
      sql: '<path d="M12 3C7 3 4 4.5 4 6.5v11C4 19.5 7 21 12 21s8-1.5 8-3.5v-11C20 4.5 17 3 12 3zm0 2c3.9 0 6 1.1 6 1.5S15.9 8 12 8 6 6.9 6 6.5 8.1 5 12 5zm6 12.5c0 .4-2.1 1.5-6 1.5s-6-1.1-6-1.5V15c1.5.8 3.7 1.2 6 1.2s4.5-.4 6-1.2v2.5zm0-5c0 .4-2.1 1.5-6 1.5s-6-1.1-6-1.5V10c1.5.8 3.7 1.2 6 1.2s4.5-.4 6-1.2v2.5z"/>',
      powerbi: '<path d="M3 13h4v8H3zM9 9h4v12H9zM15 5h4v16h-4zM21 2h-3v1.5h1.4L15 7.9 12.5 5.4 7.5 10.4l1 1 4-4 2.5 2.5L20.5 4.5V6H22V2z"/>',
      flame: '<path d="M12 2s1 3 3.5 5.5S19 12 19 15a7 7 0 01-14 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 1.5-5 3-7 .5 2 2 3 3 4 .5-1 .5-2.5-1-4.5C13 4 12 2 12 2z"/>',
      xp: '<path d="M12 2l2.6 6.3L21 9l-5 4.3L17.5 20 12 16.6 6.5 20 8 13.3 3 9l6.4-.7z"/>',
      check: '<path d="M9.5 17.5L4 12l1.5-1.5 4 4 9-9L20 7z"/>',
      play: '<path d="M7 4l12 8-12 8z"/>',
      lab: '<path d="M9 2h6v2h-1v5.3l5.2 8.7A2 2 0 0117.5 21h-11a2 2 0 01-1.7-3L10 9.3V4H9zm3 2v5.9L8.2 16h7.6L12 9.9V4z"/>',
      book: '<path d="M4 4h7a2 2 0 012 2v14a2 2 0 00-2-2H4zm16 0h-7a2 2 0 00-2 2v14a2 2 0 012-2h7z"/>',
      lock: '<path d="M7 10V7a5 5 0 0110 0v3h1a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-9a1 1 0 011-1zm2 0h6V7a3 3 0 00-6 0z"/>',
      sun: '<path d="M12 7a5 5 0 110 10 5 5 0 010-10zm0-5h0v3h0zm0 17v3zM2 12h3zm17 0h3zM4.9 4.9l2.1 2.1zm12.1 12.1l2.1 2.1zM4.9 19.1l2.1-2.1zm12.1-12.1l2.1-2.1z" stroke="currentColor" stroke-width="2" fill="none"/>',
      moon: '<path d="M20 15.5A8.5 8.5 0 0110.5 4a7 7 0 109.5 11.5z"/>',
      star: '<path d="M12 3l2.5 5.5L20 9l-4.2 3.8L17 19l-5-2.8L7 19l1.2-6.2L4 9l5.5-.5z"/>',
      arrow: '<path d="M5 12h12l-4.5-4.5L14 6l6 6-6 6-1.5-1.5L17 12z"/>',
      menu: '<path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>',
      close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" fill="none"/>',
      target: '<path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 4a6 6 0 100 12 6 6 0 000-12zm0 4a2 2 0 110 4 2 2 0 010-4z"/>',
      copy: '<path d="M8 4h10a2 2 0 012 2v10h-2V6H8zm-4 4h10a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V10a2 2 0 012-2zm0 2v10h10V10z"/>'
    }[name] || '';
    return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${d}</svg>`;
  }
  function ring(pct, size, stroke) {
    size = size || 48; stroke = stroke || 5;
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
  }

  /* ============================================================ resaltado de código */
  const KW = {
    python: 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield print len range str int float list dict set sum max min sorted enumerate zip round abs input open type isinstance',
    sql: 'SELECT FROM WHERE AND OR NOT IN BETWEEN LIKE IS NULL AS ORDER BY ASC DESC LIMIT GROUP HAVING JOIN INNER LEFT RIGHT OUTER ON DISTINCT COUNT SUM AVG MIN MAX ROUND CASE WHEN THEN ELSE END WITH OVER PARTITION ROW_NUMBER RANK DENSE_RANK LAG LEAD INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE DROP UNION ALL EXISTS STRFTIME JULIANDAY COALESCE CAST INTEGER TEXT REAL',
    dax: 'SUM AVERAGE MIN MAX COUNT COUNTA DISTINCTCOUNT COUNTROWS SUMX AVERAGEX MINX MAXX COUNTX CALCULATE CALCULATETABLE FILTER ALL ALLSELECTED VALUES DISTINCT TOPN RANKX DIVIDE IF SWITCH AND OR NOT TRUE FALSE BLANK ISBLANK ROUND ROUNDUP ROUNDDOWN INT ABS SELECTEDVALUE HASONEVALUE FORMAT CONCATENATE RELATED DATESYTD SAMEPERIODLASTYEAR DATEADD TOTALYTD CALENDAR ADDCOLUMNS YEAR MONTH DATE IN VAR RETURN USERPRINCIPALNAME',
    m: 'let in each type date number text null true false Table Text Excel File Sheet',
    text: ''
  };
  const KWSET = Object.fromEntries(Object.entries(KW).map(([k, v]) => [k, new Set(v.split(' ').map(x => x.toLowerCase()))]));
  function highlight(code, lang) {
    lang = KWSET[lang] ? lang : 'text';
    const kw = KWSET[lang];
    const comment = lang === 'python' ? /#[^\n]*/y : lang === 'sql' ? /--[^\n]*/y : lang === 'dax' || lang === 'm' ? /\/\/[^\n]*/y : null;
    let out = '', i = 0;
    const src = code;
    while (i < src.length) {
      const ch = src[i];
      if (comment) { comment.lastIndex = i; const m = comment.exec(src); if (m) { out += `<span class="tk-c">${esc(m[0])}</span>`; i += m[0].length; continue; } }
      if (ch === '"' || ch === "'") {
        if (lang === 'python' && src.startsWith(ch.repeat(3), i)) {
          const end = src.indexOf(ch.repeat(3), i + 3); const j = end < 0 ? src.length : end + 3;
          out += `<span class="tk-s">${esc(src.slice(i, j))}</span>`; i = j; continue;
        }
        let j = i + 1; while (j < src.length && src[j] !== ch && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
        j = Math.min(j + 1, src.length);
        out += `<span class="tk-s">${esc(src.slice(i, j))}</span>`; i = j; continue;
      }
      if (lang === 'dax' && ch === '[') { const j = src.indexOf(']', i); const k = j < 0 ? src.length : j + 1; out += `<span class="tk-b">${esc(src.slice(i, k))}</span>`; i = k; continue; }
      if (/[0-9]/.test(ch) && !/[\p{L}_]/u.test(src[i - 1] || '')) { let j = i; while (j < src.length && /[0-9._]/.test(src[j])) j++; out += `<span class="tk-n">${esc(src.slice(i, j))}</span>`; i = j; continue; }
      if (/[\p{L}_]/u.test(ch)) {
        let j = i; while (j < src.length && /[\p{L}\p{N}_]/u.test(src[j])) j++;
        const word = src.slice(i, j); let k = j; while (k < src.length && src[k] === ' ') k++;
        const isFn = src[k] === '(';
        const cls = kw.has(word.toLowerCase()) ? (isFn ? 'tk-f' : 'tk-k') : (isFn ? 'tk-f' : '');
        out += cls ? `<span class="${cls}">${esc(word)}</span>` : esc(word); i = j; continue;
      }
      if (/[=<>!+\-*\/%&|^~]/.test(ch)) { out += `<span class="tk-o">${esc(ch)}</span>`; i++; continue; }
      out += esc(ch); i++;
    }
    return out;
  }
  function codeBlock(code, lang, opts) {
    opts = opts || {};
    const id = 'cb' + Math.random().toString(36).slice(2, 8);
    const runnable = opts.runnable && (lang === 'python' || lang === 'sql' || lang === 'dax');
    // Las consultas de lectura (SELECT, WITH, PRAGMA) se pueden ejecutar ahí mismo para ver qué devuelven.
    const stripped = String(code).split('\n').filter(x => !x.trim().startsWith('--')).join('\n').trim();
    const inline = lang === 'sql' && !opts.noRun && !/\.\.\./.test(code) && stripped && stripped.split(/;\s*\n/).every(s => /^(SELECT|WITH|PRAGMA)\b/i.test(s.trim()) || !s.trim());
    return `<div class="code" data-lang="${lang}" id="${id}">
      <div class="code-bar"><span class="code-lang">${esc(lang === 'm' ? 'Power Query M' : lang === 'dax' ? 'DAX' : lang === 'text' ? 'esquema' : lang)}</span>
        <div class="code-actions">
          ${inline ? `<button class="btn-mini btn-mini-run" data-runsql="${id}" title="Ejecutar esta consulta aquí">${icon('play')}Ejecutar aquí</button>` : ''}
          ${runnable ? `<button class="btn-mini" data-send="${id}" title="Enviar al editor de práctica">${icon('arrow')}Al editor</button>` : ''}
          <button class="btn-mini" data-copy="${id}" title="Copiar">${icon('copy')}Copiar</button>
        </div></div>
      <pre class="code-pre"><code data-raw="${esc(code)}">${highlight(code, lang)}</code></pre>${inline ? '<div class="inline-out" hidden></div>' : ''}</div>`;
  }

  /* ============================================================ editor */
  function makeEditor(host, opts) {
    opts = opts || {};
    const lang = opts.lang || 'python';
    host.classList.add('editor');
    host.innerHTML = `<div class="editor-gutter" aria-hidden="true"></div><pre class="editor-hl" aria-hidden="true"><code></code></pre><textarea class="editor-ta" spellcheck="false" autocapitalize="off" autocomplete="off" id="${opts.id || 'ed' + Math.random().toString(36).slice(2, 7)}" aria-label="${esc(opts.label || 'Editor de código')}"></textarea>`;
    const ta = $('.editor-ta', host), hl = $('.editor-hl code', host), gut = $('.editor-gutter', host);
    let ready = false;
    function sync() {
      const v = ta.value;
      hl.innerHTML = highlight(v, lang) + '\n';
      const n = v.split('\n').length;
      gut.innerHTML = Array.from({ length: n }, (_, i) => `<span>${i + 1}</span>`).join('');
      hl.parentElement.scrollTop = ta.scrollTop; hl.parentElement.scrollLeft = ta.scrollLeft; gut.scrollTop = ta.scrollTop;
      if (ready && opts.onChange) opts.onChange(v);
    }
    ta.addEventListener('input', sync);
    ta.addEventListener('scroll', () => { hl.parentElement.scrollTop = ta.scrollTop; hl.parentElement.scrollLeft = ta.scrollLeft; gut.scrollTop = ta.scrollTop; });
    ta.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (opts.onRun) opts.onRun(); return; }
      if (e.key === 'Tab') {
        e.preventDefault(); const s = ta.selectionStart, en = ta.selectionEnd; const ind = lang === 'python' ? '    ' : '  ';
        ta.value = ta.value.slice(0, s) + ind + ta.value.slice(en); ta.selectionStart = ta.selectionEnd = s + ind.length; sync(); return;
      }
      if (e.key === 'Enter') {
        const s = ta.selectionStart; const before = ta.value.slice(0, s); const line = before.slice(before.lastIndexOf('\n') + 1);
        let ind = (line.match(/^\s*/) || [''])[0]; if (lang === 'python' && /:\s*$/.test(line)) ind += '    ';
        if (ind) { e.preventDefault(); ta.value = before + '\n' + ind + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 1 + ind.length; sync(); }
      }
    });
    ta.value = opts.value || ''; sync(); ready = true;
    return { get: () => ta.value, set: v => { ta.value = v; sync(); }, focus: () => ta.focus(), el: ta };
  }

  /* ============================================================ runtimes */
  const loaded = {};
  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('No se pudo cargar ' + src)); document.head.appendChild(s); });
    return loaded[src];
  }
  const RT = {
    async python() {
      if (window.Sk && window.Sk.builtinFiles) return;
      await loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js');
    },
    db: null,
    async sql() {
      if (RT.db) return RT.db;
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js');
      const SQL = RT.SQL || await window.initSqlJs({ locateFile: () => 'sql-wasm.wasm' });
      RT.SQL = SQL;
      RT.db = new SQL.Database(); RT.db.run(window.SQLDB.sql);
      return RT.db;
    },
    resetDb() { if (RT.db) { RT.db.close(); RT.db = null; } return RT.sql(); },
    // Base nueva e intacta, independiente de los cambios que el usuario haya hecho en el laboratorio.
    async pristine() { await RT.sql(); const db = new RT.SQL.Database(); db.run(window.SQLDB.sql); return db; }
  };
  function runPython(code, stdin) {
    return new Promise(resolve => {
      let out = ''; const lines = (stdin || '').split('\n'); let li = 0;
      const Sk = window.Sk;
      Sk.configure({
        output: t => { out += t; },
        read: f => { if (!Sk.builtinFiles || Sk.builtinFiles.files[f] === undefined) throw `El módulo "${f.replace(/^src\/lib\//, '').replace(/\.js$/, '')}" no está disponible en este laboratorio.`; return Sk.builtinFiles.files[f]; },
        __future__: Sk.python3, execLimit: 6000,
        inputfunTakesPrompt: true,
        inputfun: p => { if (p) out += p; const v = li < lines.length ? lines[li++] : ''; out += v + '\n'; return Promise.resolve(v); }
      });
      Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true))
        .then(() => resolve({ ok: true, out }), e => resolve({ ok: false, out, err: pyError(e) }));
    });
  }
  function pyError(e) {
    let msg = e && e.toString ? e.toString() : String(e);
    msg = msg.replace(/on line (\d+)/, 'en la línea $1').replace(/^TimeLimitError.*/, 'El programa tardó demasiado. ¿Tienes un bucle infinito?');
    const tips = [
      [/NameError: name '(.+?)' is not defined/, 'NameError: la variable "$1" no está definida. ¿La escribiste igual que al crearla? ¿La creaste antes de usarla?'],
      [/SyntaxError: bad input/, 'SyntaxError: hay un error de escritura. Revisa dos puntos al final de if/for/def, paréntesis y comillas.'],
      [/IndentationError/, 'IndentationError: la indentación no es consistente. Usa 4 espacios dentro de cada bloque.'],
      [/ZeroDivisionError/, 'ZeroDivisionError: división entre cero.'],
      [/TypeError: unsupported operand type\(s\) for \+: 'int' and 'str'/, 'TypeError: no puedes sumar un número con un texto. Convierte con str() o int().'],
      [/TypeError: cannot concatenate 'str' and '(int|float)' objects/, 'TypeError: no puedes unir texto con un número. Usa una f-string o str().'],
      [/KeyError: (.+)/, 'KeyError: la clave $1 no existe en el diccionario. Usa .get(clave, valor_por_defecto) si puede faltar.'],
      [/IndexError/, 'IndexError: esa posición no existe en la lista. Recuerda que empiezan en 0.'],
      [/ValueError: invalid literal for int\(\)/, 'ValueError: ese texto no se puede convertir a número entero.']
    ];
    for (const [re, rep] of tips) { const m = msg.match(re); if (m) { const extra = (msg.match(/en la línea \d+/) || [''])[0]; return rep.replace('$1', m[1] || '') + (extra ? ' (' + extra + ')' : ''); } }
    return msg;
  }
  const norm = s => String(s || '').replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').trim();

  function runSQL(q) {
    try {
      const t0 = performance.now();
      const res = RT.db.exec(q);
      return { ok: true, results: res, ms: performance.now() - t0 };
    } catch (e) { return { ok: false, err: sqlError(e.message) }; }
  }
  function sqlError(m) {
    return m.replace(/^no such table: (\w+)/, 'La tabla "$1" no existe. Tablas: clientes, productos, empleados, pedidos, detalle_pedidos.')
      .replace(/^no such column: ([\w.]+)/, 'La columna "$1" no existe. Revisa el esquema en el panel lateral.')
      .replace(/^near "(.+?)": syntax error/, 'Error de sintaxis cerca de "$1". Revisa comas, paréntesis y el orden de las cláusulas.')
      .replace(/^ambiguous column name: (\w+)/, 'La columna "$1" existe en varias tablas: antepón el alias de la tabla (p.ej. c.$1).')
      .replace(/^incomplete input/, 'La consulta está incompleta.');
  }
  function sqlRows(results) { if (!results || !results.length) return { columns: [], values: [] }; return results[results.length - 1]; }
  function sqlCompare(user, sol, ordered) {
    const cell = v => typeof v === 'number' ? String(Math.round(v * 100) / 100) : String(v);
    const rowsU = user.values.map(r => r.map(cell).join('\u0001')), rowsS = sol.values.map(r => r.map(cell).join('\u0001'));
    if (user.columns.length !== sol.columns.length) return { ok: false, why: `Se esperaban ${sol.columns.length} columnas y tu consulta devuelve ${user.columns.length}.` };
    if (rowsU.length !== rowsS.length) return { ok: false, why: `Se esperaban ${rowsS.length} filas y tu consulta devuelve ${rowsU.length}.` };
    if (!ordered) { rowsU.sort(); rowsS.sort(); }
    for (let i = 0; i < rowsU.length; i++) if (rowsU[i] !== rowsS[i]) return { ok: false, why: ordered ? `La fila ${i + 1} no coincide. Revisa el orden (ORDER BY) y los cálculos.` : 'El número de filas coincide pero los valores no. Revisa filtros y cálculos.' };
    return { ok: true };
  }
  function tableHTML(cols, values, max) {
    max = max || 200;
    if (!cols.length) return '<p class="muted">La consulta no devolvió columnas.</p>';
    const rows = values.slice(0, max);
    return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(v => `<td class="${typeof v === 'number' ? 'num' : ''}">${v === null ? '<i class="null">NULL</i>' : esc(typeof v === 'number' ? (Number.isInteger(v) ? v : Math.round(v * 100) / 100) : v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${values.length > max ? `<p class="muted small">Mostrando ${max} de ${values.length} filas.</p>` : ''}`;
  }

  /* ============================================================ DAX helpers */
  const measuresMap = () => window.DAX.makeMeasures(state.measures);
  const slicerFilters = () => Object.entries(state.slicers).filter(([, v]) => v !== '' && v != null).map(([c, v]) => window.DAX.slicerFilter(c, v));

  /* ============================================================ gráficos */
  function renderChart(host, cfg) {
    const { type, categories, values, label, fmt } = cfg;
    const f = fmt || (v => window.DAX.format(v));
    host.innerHTML = '';
    if (type === 'card') {
      const v = values[0];
      host.innerHTML = `<div class="kpi"><div class="kpi-label">${esc(label)}</div><div class="kpi-value">${esc(f(v))}</div><div class="kpi-sub">${esc(categories[0] || '')}</div></div>`;
      return;
    }
    if (type === 'table') {
      host.innerHTML = tableHTML([cfg.axisLabel || 'Categoría', label], categories.map((c, i) => [c, values[i] === null ? null : Math.round((values[i] || 0) * 100) / 100]));
      return;
    }
    const W = 640, H = type === 'bar' ? Math.max(180, 28 * categories.length + 50) : 300;
    const pad = { l: type === 'bar' ? 110 : 56, r: 24, t: 18, b: type === 'bar' ? 30 : 44 };
    const vals = values.map(v => v == null ? 0 : v);
    const maxV = Math.max(0, ...vals), minV = Math.min(0, ...vals);
    const nice = n => { if (n === 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(Math.abs(n)))); const m = n / p; const s = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10; return s * p; };
    const step = nice((maxV - minV) / 4); const top = Math.ceil(maxV / step) * step || step; const bottom = Math.floor(minV / step) * step;
    const ticks = []; for (let t = bottom; t <= top + 1e-9; t += step) ticks.push(Math.round(t * 1e6) / 1e6);
    const short = v => Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1).replace(/\.0$/, '') + ' M' : Math.abs(v) >= 1e3 ? (v / 1e3).toFixed(1).replace(/\.0$/, '') + ' k' : (Number.isInteger(v) ? String(v) : v.toFixed(2));
    const isPct = label && /%/.test(label);
    const fmtTick = v => isPct ? Math.round(v * 100) + '%' : short(v);
    let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)} por ${esc(cfg.axisLabel || '')}">`;
    const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    if (type === 'bar') {
      const x = v => pad.l + ((v - bottom) / (top - bottom)) * plotW;
      ticks.forEach(t => { svg += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${pad.t}" y2="${H - pad.b}"/><text class="tick" x="${x(t)}" y="${H - pad.b + 16}" text-anchor="middle">${esc(fmtTick(t))}</text>`; });
      const bh = Math.min(22, plotH / categories.length - 6);
      categories.forEach((c, i) => {
        const y = pad.t + (i + 0.5) * (plotH / categories.length) - bh / 2; const v = vals[i];
        const x0 = x(Math.min(0, v)), x1 = x(Math.max(0, v));
        svg += `<text class="cat" x="${pad.l - 8}" y="${y + bh / 2 + 4}" text-anchor="end">${esc(String(c).length > 14 ? String(c).slice(0, 13) + '…' : c)}</text>`;
        svg += `<rect class="mark" data-i="${i}" x="${x0}" y="${y}" width="${Math.max(2, x1 - x0)}" height="${bh}" rx="3"/>`;
        if (categories.length <= 12) svg += `<text class="val" x="${x1 + 6}" y="${y + bh / 2 + 4}">${esc(f(values[i]))}</text>`;
        svg += `<rect class="hit" data-i="${i}" x="${pad.l}" y="${pad.t + i * (plotH / categories.length)}" width="${plotW}" height="${plotH / categories.length}"/>`;
      });
    } else {
      const y = v => pad.t + (1 - (v - bottom) / (top - bottom)) * plotH;
      ticks.forEach(t => { svg += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}"/><text class="tick" x="${pad.l - 8}" y="${y(t) + 4}" text-anchor="end">${esc(fmtTick(t))}</text>`; });
      const n = categories.length; const slot = plotW / n;
      const labelEvery = Math.ceil(n / 12);
      categories.forEach((c, i) => { if (i % labelEvery === 0) svg += `<text class="cat" x="${pad.l + (i + 0.5) * slot}" y="${H - pad.b + 18}" text-anchor="middle">${esc(String(c).length > 10 ? String(c).slice(0, 9) + '…' : c)}</text>`; });
      if (type === 'column') {
        const bw = Math.min(40, slot * 0.6);
        categories.forEach((c, i) => {
          const v = vals[i]; const cx = pad.l + (i + 0.5) * slot; const y0 = y(Math.max(0, v)), y1 = y(Math.min(0, v));
          svg += `<rect class="mark" data-i="${i}" x="${cx - bw / 2}" y="${y0}" width="${bw}" height="${Math.max(2, y1 - y0)}" rx="3"/>`;
          if (n <= 8) svg += `<text class="val" x="${cx}" y="${y0 - 6}" text-anchor="middle">${esc(f(values[i]))}</text>`;
          svg += `<rect class="hit" data-i="${i}" x="${pad.l + i * slot}" y="${pad.t}" width="${slot}" height="${plotH}"/>`;
        });
      } else {
        const pts = categories.map((c, i) => [pad.l + (i + 0.5) * slot, y(vals[i])]);
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        svg += `<path class="area" d="${d} L${pts[pts.length - 1][0]} ${y(Math.max(0, bottom))} L${pts[0][0]} ${y(Math.max(0, bottom))} Z"/><path class="line" d="${d}"/>`;
        pts.forEach((p, i) => { svg += `<circle class="dot" data-i="${i}" cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 5 : 3.5}"/><rect class="hit" data-i="${i}" x="${pad.l + i * slot}" y="${pad.t}" width="${slot}" height="${plotH}"/>`; });
        if (n <= 12) pts.forEach((p, i) => { if (i === 0 || i === pts.length - 1 || vals[i] === maxV) svg += `<text class="val" x="${p[0]}" y="${p[1] - 10}" text-anchor="middle">${esc(f(values[i]))}</text>`; });
      }
      svg += `<line class="axis" x1="${pad.l}" x2="${W - pad.r}" y1="${y(Math.max(0, bottom))}" y2="${y(Math.max(0, bottom))}"/>`;
    }
    svg += '</svg>';
    host.innerHTML = svg + '<div class="tip" hidden></div>';
    const tip = $('.tip', host);
    host.addEventListener('mousemove', e => {
      const t = e.target.closest('[data-i]'); if (!t) { tip.hidden = true; $$('.mark.hot,.dot.hot', host).forEach(m => m.classList.remove('hot')); return; }
      const i = +t.dataset.i; $$('.mark,.dot', host).forEach(m => m.classList.toggle('hot', +m.dataset.i === i));
      tip.hidden = false; tip.innerHTML = `<b>${esc(categories[i])}</b><span>${esc(label)}: ${esc(f(values[i]))}</span>`;
      const r = host.getBoundingClientRect(); tip.style.left = Math.min(e.clientX - r.left + 12, r.width - tip.offsetWidth - 8) + 'px'; tip.style.top = (e.clientY - r.top - 36) + 'px';
    });
    host.addEventListener('mouseleave', () => { tip.hidden = true; });
  }

  /* ============================================================ enrutador */
  function route() {
    const h = (location.hash || '#inicio').slice(1);
    if (h === 'inicio' || h === '') return { view: 'home' };
    if (TRACKS[h]) return { view: 'track', id: h };
    if (LESSONS[h]) return { view: 'lesson', id: h };
    if (h === 'plan') return { view: 'plan' };
    if (h === 'logros') return { view: 'badges' };
    if (/^lab-(python|sql|powerbi)$/.test(h)) return { view: 'lab', id: h.slice(4) };
    if (/^chuleta-(python|sql|powerbi)$/.test(h)) return { view: 'cheat', id: h.slice(8) };
    if (h === 'repaso') return { view: 'review' };
    if (h === 'proyectos') return { view: 'projects' };
    if (/^proyecto-/.test(h) && PROJECTS[h.slice(9)]) return { view: 'project', id: h.slice(9) };
    if (/^examen-(python|sql|powerbi)$/.test(h)) return { view: 'exam', id: h.slice(7) };
    return { view: 'home' };
  }
  const PROJECTS = Object.fromEntries((C.projects || []).map(p => [p.id, p]));
  function renderCheat(app, t) {
    app.innerHTML = `<section class="page-head" style="--tc: var(--${t.id})">
      <p class="crumbs"><a href="#inicio">Inicio</a> › <a href="#${t.id}">${esc(t.name)}</a> › Chuleta</p>
      <p class="eyebrow" style="color: var(--tc)">${icon(t.id)} Referencia rápida</p>
      <h1>Chuleta de ${esc(t.name)}</h1>
      <p class="lead">Lo que más se usa, en una página. Cada bloque enlaza con lo que practicaste en las lecciones; tenla abierta mientras trabajas.</p>
      <div class="cta-row"><a class="btn btn-ghost" href="#lab-${t.id}">${icon('lab')}Abrir laboratorio</a><a class="btn btn-ghost" href="#${t.id}">${icon('book')}Ver lecciones</a></div>
    </section>
    <section class="cheat" style="--tc: var(--${t.id})">${(t.cheatsheet || []).map(sec => `<div class="cheat-sec"><h2>${esc(sec.h)}</h2>${sec.items.map(([code, desc]) => `<div class="cheat-item"><pre class="cheat-code"><code>${highlight(code, t.runtime === 'dax' ? (/^(=|let|Table\.|Text\.)/.test(code) || /Table\.|each/.test(code) ? 'm' : 'dax') : t.runtime)}</code></pre><p>${esc(desc)}</p></div>`).join('')}</div>`).join('')}</section>`;
  }
  const go = h => { location.hash = h; };
  function render() {
    const r = route();
    const app = $('#app');
    document.body.dataset.view = r.view;
    $$('.nav a').forEach(a => { const href = a.getAttribute('href'); a.classList.toggle('active', href === location.hash || (r.view === 'lesson' && href === '#' + LESSONS[r.id].track) || ((r.view === 'cheat') && href === '#' + r.id) || (r.view === 'lab' && href === '#lab-python') || ((r.view === 'exam' || r.view === 'project') && href === '#proyectos') || (r.view === 'home' && href === '#inicio')); });
    clearInterval(demoTimer);
    if (r.view === 'home') renderHome(app);
    else if (r.view === 'track') renderTrack(app, TRACKS[r.id]);
    else if (r.view === 'lesson') renderLesson(app, LESSONS[r.id]);
    else if (r.view === 'plan') renderPlan(app);
    else if (r.view === 'badges') renderBadges(app);
    else if (r.view === 'lab') renderLab(app, r.id);
    else if (r.view === 'cheat') renderCheat(app, TRACKS[r.id]);
    else if (r.view === 'review') renderReview(app);
    else if (r.view === 'projects') renderProjects(app);
    else if (r.view === 'project') renderProject(app, PROJECTS[r.id]);
    else if (r.view === 'exam') renderExam(app, TRACKS[r.id]);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    $('#nav').classList.remove('open');
  }
  function renderTopbar() {
    $('#xp').textContent = state.xp.toLocaleString('es-MX');
    $('#streak').textContent = state.streak || 0;
    const due = dueIds().length; const dc = $('#due-count');
    if (dc) { dc.textContent = due; dc.hidden = !due; }
    const themeBtn = $('#theme');
    themeBtn.innerHTML = state.theme === 'dark' ? icon('moon') : state.theme === 'light' ? icon('sun') : icon('sun') + icon('moon');
    themeBtn.title = 'Tema: ' + (state.theme === 'system' ? 'automático' : state.theme === 'dark' ? 'oscuro' : 'claro');
  }
  function applyTheme() {
    if (state.theme === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = state.theme;
  }

  /* ============================================================ inicio */
  const DEMOS = [
    { lang: 'python', code: 'ventas = {"Norte": 1850, "Sur": 1200, "Centro": 1500}\ntop = max(ventas, key=ventas.get)\nprint(f"Mejor región: {top}")', out: 'Mejor región: Norte' },
    { lang: 'sql', code: "SELECT categoria, SUM(precio) AS total\nFROM productos\nGROUP BY categoria\nORDER BY total DESC\nLIMIT 1;", out: 'Deportes | 8000' },
    { lang: 'dax', code: 'Margen % =\nDIVIDE(\n    SUM(Ventas[Ventas]) - SUM(Ventas[Costo]),\n    SUM(Ventas[Ventas])\n)', out: '42.6 %' }
  ];
  let demoTimer;
  function renderHome(app) {
    clearInterval(demoTimer);
    const total = ALL_LESSONS.length, done = state.completed.length;
    const nextLesson = state.last && LESSONS[state.last] && !state.completed.includes(state.last) ? LESSONS[state.last] : ALL_LESSONS.find(l => !state.completed.includes(l.id)) || ALL_LESSONS[0];
    const day = Math.floor(Date.now() / 86400000);
    const dIdx = day % C.daily.length;
    const dq = C.daily[dIdx];
    const dailyDone = state.daily && state.daily.day === day;
    const due = dueIds().length, deck = Object.keys(state.srs).filter(id => SRS_ITEMS[id]).length;
    const mastered = Object.entries(state.srs).filter(([id, it]) => SRS_ITEMS[id] && it.box >= 3).length;
    const nextDue = Object.values(state.srs).map(it => it.due).filter(d => d > today()).sort()[0];
    const projDone = (C.projects || []).filter(p => state.projects[p.id] && state.projects[p.id].done).length;
    const examsPassed = C.tracks.filter(t => state.exams[t.id] && state.exams[t.id].passed).length;
    app.innerHTML = `
    <section class="hero">
      <div class="hero-text">
        <p class="eyebrow">Plataforma de aprendizaje práctico</p>
        <h1>Aprende Python, SQL y Power BI <em>haciendo.</em></h1>
        <p class="lead">Tres rutas, un mismo método: cada lección parte de un problema real de oficina, te explica lo justo y te pone a escribir código que se ejecuta aquí mismo, en tu navegador. Sin instalar nada.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="#${nextLesson.id}">${icon('play')}${done ? 'Continuar: ' + esc(nextLesson.title) : 'Empezar la primera lección'}</a>
          <a class="btn btn-ghost" href="#plan">Ver el plan de estudio</a>
        </div>
        <ul class="hero-points">
          <li>${icon('check')}Python real en el navegador</li>
          <li>${icon('check')}Base de datos SQLite con 5 tablas</li>
          <li>${icon('check')}Motor DAX con contexto de filtro</li>
        </ul>
      </div>
      <div class="hero-demo" id="demo">
        <div class="demo-tabs">${DEMOS.map((d, i) => `<span class="demo-tab ${i === 0 ? 'on' : ''}" data-i="${i}">${esc(d.lang === 'dax' ? 'Power BI · DAX' : d.lang.toUpperCase())}</span>`).join('')}</div>
        <pre class="demo-code"><code id="demo-code"></code></pre>
        <div class="demo-out"><span class="demo-arrow">›</span><span id="demo-out"></span></div>
        <canvas class="embers" id="embers" aria-hidden="true"></canvas>
      </div>
    </section>

    <section class="stats">
      <div class="stat"><span class="stat-n">${done}<small>/${total}</small></span><span class="stat-l">lecciones completadas</span></div>
      <div class="stat"><span class="stat-n">${state.xp.toLocaleString('es-MX')}</span><span class="stat-l">puntos de experiencia</span></div>
      <div class="stat"><span class="stat-n">${state.streak || 0}<small> días</small></span><span class="stat-l">racha actual</span></div>
      <div class="stat"><span class="stat-n">${state.badges.length}<small>/${C.badges.length}</small></span><span class="stat-l"><a href="#logros">insignias</a></span></div>
    </section>

    <section class="tracks">
      ${C.tracks.map(t => { const p = trackProgress(t); const next = t.lessons.find(l => !state.completed.includes(l.id)); return `
      <a class="track-card" href="#${t.id}" style="--tc: var(--${t.id})">
        <div class="track-head"><span class="track-ic">${icon(t.id)}</span><span class="track-ring">${ring(p.pct, 44, 4)}<b>${p.pct}%</b></span></div>
        <h2>${esc(t.name)}</h2>
        <p class="track-short">${esc(t.short)}</p>
        <p class="track-tag">${esc(t.tagline)}</p>
        <div class="track-foot"><span>${p.done} de ${p.total} lecciones</span><span class="link">${next ? 'Siguiente: ' + esc(next.title) : 'Ruta completa'} ${icon('arrow')}</span></div>
      </a>`; }).join('')}
    </section>

    <section class="two-col">
      <div class="card daily" id="daily">
        <p class="eyebrow">${icon('target')} Reto del día · ${esc(TRACKS[dq.track].name)}</p>
        <h3>${esc(dq.q)}</h3>
        <div class="options">${dq.options.map((o, i) => `<button class="opt ${dailyDone ? (i === dq.answer ? 'right' : (state.daily.pick === i ? 'wrong' : '')) : ''}" data-i="${i}" ${dailyDone ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>
        <p class="explain" ${dailyDone ? '' : 'hidden'}>${esc(dq.explain)}</p>
      </div>
      <div class="card review-home ${due ? 'has-due' : ''}">
        <p class="eyebrow">${icon('flame')} Repaso espaciado</p>
        ${deck ? `
          <div class="review-home-n"><span class="stat-n">${due}</span><span>${due === 1 ? 'pregunta pendiente hoy' : 'preguntas pendientes hoy'}</span></div>
          <p class="muted small">${mastered} de ${deck} preguntas dominadas. ${due ? 'Diez minutos de repaso hoy valen más que una hora dentro de un mes.' : (nextDue ? 'Próximo repaso: ' + esc(fmtDate(nextDue)) + '.' : '')}</p>
          <a class="btn ${due ? 'btn-primary' : 'btn-ghost'}" href="#repaso">${icon('play')}${due ? 'Empezar el repaso' : 'Ver mi repaso'}</a>`
        : `<h3>Lo que aprendes vuelve justo antes de olvidarse</h3>
          <p class="muted small">Cada pregunta que respondas en las lecciones entra aquí y regresa a los 1, 3, 7, 14, 30 y 60 días. Empieza una lección para llenar tu repaso.</p>`}
      </div>
    </section>

    <section class="labs-strip prove-strip">
      <div><p class="eyebrow">${icon('target')} Demuestra lo aprendido</p><h3>Proyectos integradores y exámenes finales</h3><p class="muted">Dos casos de negocio que recorren SQL, Python y Power BI con los mismos datos, y un examen por ruta con nota y recomendaciones de repaso. ${projDone}/${(C.projects || []).length} proyectos y ${examsPassed}/3 exámenes aprobados.</p></div>
      <div class="labs-links"><a class="btn btn-primary" href="#proyectos">${icon('arrow')}Ver proyectos y exámenes</a></div>
    </section>

    <section class="labs-strip">
      <div><p class="eyebrow">${icon('lab')} Laboratorios libres</p><h3>Experimenta sin guion</h3><p class="muted">Los mismos motores de las lecciones, sin ejercicio: un intérprete de Python, una base SQL con cinco tablas y un estudio DAX con segmentadores y constructor de visuales.</p></div>
      <div class="labs-links">
        <a class="btn btn-ghost" href="#lab-python" style="--tc: var(--python)">${icon('python')}Python</a>
        <a class="btn btn-ghost" href="#lab-sql" style="--tc: var(--sql)">${icon('sql')}SQL</a>
        <a class="btn btn-ghost" href="#lab-powerbi" style="--tc: var(--powerbi)">${icon('powerbi')}Estudio DAX</a>
      </div>
    </section>`;

    // demo animada
    let di = 0;
    const codeEl = $('#demo-code'), outEl = $('#demo-out');
    function showDemo(i, animate) {
      di = i; $$('.demo-tab').forEach((t, k) => t.classList.toggle('on', k === i));
      const d = DEMOS[i];
      if (!animate) { codeEl.innerHTML = highlight(d.code, d.lang); outEl.textContent = d.out; return; }
      let n = 0; outEl.textContent = '';
      const step = () => { n = Math.min(d.code.length, n + 2); codeEl.innerHTML = highlight(d.code.slice(0, n), d.lang) + '<span class="caret"></span>'; if (n < d.code.length) setTimeout(step, 14); else { codeEl.innerHTML = highlight(d.code, d.lang); setTimeout(() => { outEl.textContent = d.out; }, 250); } };
      step();
    }
    showDemo(0, !reduced);
    $$('.demo-tab').forEach(t => t.addEventListener('click', () => { clearInterval(demoTimer); showDemo(+t.dataset.i, !reduced); }));
    if (!reduced) demoTimer = setInterval(() => showDemo((di + 1) % DEMOS.length, true), 6500);
    embers($('#embers'));

    $$('#daily .opt').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i; state.daily = { day, pick: i }; srsRecord('D:' + dIdx, i === dq.answer, false); save(); renderTopbar();
      $$('#daily .opt').forEach((o, k) => { o.disabled = true; o.classList.toggle('right', k === dq.answer); o.classList.toggle('wrong', k === i && i !== dq.answer); });
      $('#daily .explain').hidden = false;
      if (i === dq.answer) addXP(15, 'Reto del día'); else { touchStreak(); save(); }
    }));
  }
  function embers(canvas) {
    if (!canvas || reduced) { if (canvas) canvas.remove(); return; }
    const ctx = canvas.getContext('2d'); let w, h, parts = [];
    const resize = () => { const r = canvas.parentElement.getBoundingClientRect(); w = canvas.width = r.width; h = canvas.height = r.height; };
    resize(); window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < 26; i++) parts.push({ x: Math.random() * w, y: h + Math.random() * h, r: 1 + Math.random() * 2, s: 0.25 + Math.random() * 0.6, a: Math.random() });
    const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e4572e';
    function frame() {
      if (!document.body.contains(canvas)) return;
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = accent();
      for (const p of parts) { p.y -= p.s; p.x += Math.sin(p.y / 30) * 0.3; p.a -= 0.004; if (p.y < -5 || p.a <= 0) { p.y = h + 5; p.x = Math.random() * w; p.a = 0.6 + Math.random() * 0.4; } ctx.globalAlpha = Math.max(0, p.a) * 0.7; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1; requestAnimationFrame(frame);
    }
    frame();
  }

  /* ============================================================ ruta */
  function lessonRow(l, compact) {
    const done = state.completed.includes(l.id);
    const reqs = requirements(l);
    const partial = !done && reqs.some(r => r.ok) ? `<span class="lesson-reqs">${reqs.map(r => `<span class="${r.ok ? 'ok' : ''}">${r.ok ? icon('check') : '○'} ${esc(r.label.replace(/^(Superar|Responder bien|Construir y comprobar) /, '').replace(/^(la|el|los \d+) /, ''))}</span>`).join('')}</span>` : '';
    return `<a class="lesson-row ${done ? 'done' : ''} ${compact ? 'compact' : ''}" href="#${l.id}">
      <span class="lesson-num">${done ? icon('check') : l.index + 1}</span>
      <span class="lesson-info"><span class="lesson-title">${esc(l.title)}</span>${compact ? '' : `<span class="lesson-meta">${l.reading ? 'Lectura guiada' : 'Práctica'} · ${l.minutes} min · ${esc(l.level)}${l.extra ? ` · ${l.extra.length} ejercicios extra` : ''}</span>${partial}`}</span>
    </a>`;
  }
  function examCardHTML(t) {
    const ex = state.exams[t.id]; const p = trackProgress(t);
    const status = ex ? (ex.passed ? `<span class="chip chip-done">${icon('check')} Aprobado · mejor nota ${ex.best}%</span>` : `<span class="chip chip-warn">Mejor nota ${ex.best}% · se aprueba con ${t.exam.passMark}%</span>`) : `<span class="chip">Sin presentar</span>`;
    return `<a class="exam-card" href="#examen-${t.id}" style="--tc: var(--${t.id})">
      <span class="exam-ic">${icon('target')}</span>
      <span class="exam-info"><b>Examen final de ${esc(t.name)}</b><span class="muted small">${t.exam.questions.length} preguntas y ${t.exam.tasks.length} tareas prácticas · ${p.done < p.total ? `recomendado al terminar las ${p.total} lecciones` : 'ya completaste la ruta'}</span></span>
      ${status}
    </a>`;
  }
  function renderTrack(app, t) {
    const p = trackProgress(t);
    const next = t.lessons.find(l => !state.completed.includes(l.id));
    app.innerHTML = `
    <section class="track-hero" style="--tc: var(--${t.id})">
      <div class="track-hero-text">
        <p class="eyebrow">${icon(t.id)} Ruta de ${esc(t.name)}</p>
        <h1>${esc(t.short)}</h1>
        <p class="lead">${esc(t.tagline)}</p>
        <div class="cta-row">
          ${next ? `<a class="btn btn-primary" href="#${next.id}">${icon('play')}${p.done ? 'Continuar' : 'Empezar'}: ${esc(next.title)}</a>` : '<span class="btn btn-primary">Ruta completa</span>'}
          <a class="btn btn-ghost" href="#lab-${t.id}">${icon('lab')}Abrir laboratorio</a>
          <a class="btn btn-ghost" href="#chuleta-${t.id}">${icon('book')}Chuleta de referencia</a>
        </div>
        <p class="muted small">${t.lessons.length} lecciones · ${t.lessons.reduce((n, l) => n + (l.practice ? 1 : 0) + (l.extra ? l.extra.length : 0), 0)} ejercicios comprobados · ${t.lessons.reduce((n, l) => n + l.minutes, 0)} minutos en total</p>
      </div>
      <div class="track-hero-ring">${ring(p.pct, 120, 10)}<div><b>${p.pct}%</b><span>${p.done} de ${p.total}</span></div></div>
    </section>
    <section class="lesson-list">${t.lessons.map(l => lessonRow(l)).join('')}</section>
    ${t.exam ? `<section class="track-exam">${examCardHTML(t)}</section>` : ''}`;
  }

  /* ============================================================ base de datos visible
     Fichas de tablas, diagrama y recuadros "Datos para este ejercicio". */
  const SCHEMA = C.sqlSchema || { tables: [], tips: [], company: '' };
  const SCHEMA_T = Object.fromEntries(SCHEMA.tables.map(t => [t.name, t]));
  function tablesIn(text) {
    const set = new Set();
    String(text || '').replace(/\b(?:FROM|JOIN|INTO|UPDATE|table_info\()\s*([a-z_]+)/gi, (_, n) => { if (SCHEMA_T[n.toLowerCase()]) set.add(n.toLowerCase()); return _; });
    return SCHEMA.tables.map(t => t.name).filter(n => set.has(n));
  }
  function tableCardHTML(name) {
    const t = SCHEMA_T[name];
    return `<div class="tcard" data-table="${name}">
      <div class="tcard-head"><b><code>${name}</code></b><span>${esc(t.desc)} ${esc(t.grain)}</span></div>
      <div class="tbl-wrap"><table class="tbl cols"><thead><tr><th>Columna</th><th>Tipo</th><th>Qué guarda</th></tr></thead><tbody>${t.cols.map(([c, ty, d, k]) => `<tr><td><code>${c}</code>${k ? ` <span class="key key-${k.toLowerCase()}">${k}</span>` : ''}</td><td>${ty}</td><td class="wrap">${esc(d)}</td></tr>`).join('')}</tbody></table></div>
      <button class="btn btn-small btn-ghost tsample">${icon('play')}Ver 5 filas de ejemplo</button>
      <div class="tsample-out"></div>
    </div>`;
  }
  const tableChipsHTML = names => `<div class="tchips">${names.map(n => `<button class="tchip" data-t="${n}" aria-expanded="false">${icon('sql')}${n}</button>`).join('')}</div><div class="tdetail"></div>`;
  function bindSamples(root) {
    $$('.tsample', root).forEach(btn => btn.addEventListener('click', async () => {
      const card = btn.closest('.tcard'); const out = $('.tsample-out', card);
      out.innerHTML = '<p class="muted small">Cargando…</p>';
      try {
        const db = await RT.pristine();
        const r = db.exec(`SELECT * FROM ${card.dataset.table} LIMIT 5`); db.close();
        out.innerHTML = tableHTML(r[0].columns, r[0].values) + `<p class="muted small">Así se ve la tabla con <code>SELECT * FROM ${card.dataset.table} LIMIT 5;</code></p>`;
        btn.hidden = true;
      } catch (e) { out.innerHTML = `<p class="err">${esc(e.message || e)}</p>`; }
    }));
  }
  function bindTableChips(root) {
    $$('.tchip', root).forEach(b => b.addEventListener('click', () => {
      const box = b.parentElement.nextElementSibling;
      const open = b.getAttribute('aria-expanded') === 'true';
      $$('.tchip', b.parentElement).forEach(x => x.setAttribute('aria-expanded', 'false'));
      if (open) { box.innerHTML = ''; return; }
      b.setAttribute('aria-expanded', 'true');
      box.innerHTML = tableCardHTML(b.dataset.t);
      bindSamples(box);
    }));
  }
  function erDiagram() {
    const BW = 220, RH = 20, HH = 30;
    const pos = { clientes: [20, 20], pedidos: [300, 20], empleados: [580, 20], productos: [20, 250], detalle_pedidos: [300, 250] };
    const fy = (t, c) => pos[t][1] + HH + RH * SCHEMA_T[t].cols.findIndex(x => x[0] === c) + RH / 2;
    const box = name => {
      const [x, y] = pos[name]; const t = SCHEMA_T[name]; const h = HH + RH * t.cols.length + 6;
      return `<g class="er-t" data-table="${name}" tabindex="0" role="button" aria-label="Ver la tabla ${name}">
        <rect class="er-box" x="${x}" y="${y}" width="${BW}" height="${h}" rx="8"/>
        <path class="er-head" d="M${x} ${y + 8}a8 8 0 0 1 8-8h${BW - 16}a8 8 0 0 1 8 8v${HH - 8}h-${BW}z"/>
        <text class="er-name" x="${x + 12}" y="${y + 20}">${name}</text>
        ${t.cols.map(([c, ty, , k], i) => { const yy = y + HH + RH * i + 14; return `<text class="er-col ${k ? 'k' : ''}" x="${x + 12}" y="${yy}">${k ? `<tspan class="er-key">${k} </tspan>` : ''}${c}</text><text class="er-type" x="${x + BW - 10}" y="${yy}" text-anchor="end">${ty}</text>`; }).join('')}
      </g>`;
    };
    const lab = (x, y, s) => `<text class="er-card" x="${x}" y="${y}">${s}</text>`;
    const y1 = fy('pedidos', 'cliente_id'), y2 = fy('clientes', 'id');
    const y3 = fy('pedidos', 'empleado_id'), y4 = fy('empleados', 'id');
    const y5 = fy('detalle_pedidos', 'producto_id'), y6 = fy('productos', 'id');
    const y7 = fy('empleados', 'jefe_id'); const xr = 580 + BW;
    const pedBottom = 20 + HH + RH * 5 + 6;
    return `<div class="diagram-wrap"><svg viewBox="0 0 840 400" class="er" role="img" aria-label="Diagrama de la base: clientes, productos, empleados, pedidos y detalle_pedidos con sus relaciones">
      <path class="er-rel" d="M300 ${y1} C270 ${y1}, 270 ${y2}, 240 ${y2}"/>${lab(286, y1 - 5, 'N')}${lab(244, y2 - 5, '1')}
      <path class="er-rel" d="M520 ${y3} C550 ${y3}, 550 ${y4}, 580 ${y4}"/>${lab(524, y3 - 5, 'N')}${lab(568, y4 - 5, '1')}
      <path class="er-rel" d="M410 250 L410 ${pedBottom}"/>${lab(416, 244, 'N')}${lab(416, pedBottom + 14, '1')}
      <path class="er-rel" d="M300 ${y5} C270 ${y5}, 270 ${y6}, 240 ${y6}"/>${lab(286, y5 - 5, 'N')}${lab(244, y6 - 5, '1')}
      <path class="er-rel" d="M${xr} ${y7} C${xr + 40} ${y7}, ${xr + 40} ${y4}, ${xr} ${y4}"/>${lab(xr + 4, y7 - 5, 'N')}${lab(xr + 4, y4 - 5, '1')}
      ${Object.keys(pos).map(box).join('')}
    </svg></div>`;
  }
  function erSectionHTML() {
    return `<p class="eyebrow">Diagrama de la base de datos</p>
      <p class="muted small">${esc(SCHEMA.company)} Toca una tabla para ver sus columnas y sus primeras filas. PK es la clave primaria, FK una clave foránea; la línea va del lado N (muchos) al lado 1.</p>
      ${erDiagram()}
      <div id="er-detail"></div>
      <ul class="db-tips">${SCHEMA.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }
  function bindER(root) {
    $$('.er-t', root).forEach(g => {
      const open = () => { $$('.er-t', root).forEach(x => x.classList.toggle('on', x === g)); const d = $('#er-detail'); d.innerHTML = tableCardHTML(g.dataset.table); bindSamples(d); d.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }); };
      g.addEventListener('click', open);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }
  function sqlDataBoxHTML(p, sfx, exam) {
    const names = tablesIn((p.solution || '') + ' ' + (p.verify || ''));
    if (!names.length) return '';
    return `<div class="data-box">
      <p class="eyebrow">${icon('sql')} Datos para este ejercicio</p>
      <p class="small muted">Tablas que necesitas. Toca una para ver sus columnas y filas de ejemplo.</p>
      ${tableChipsHTML(names)}
      ${exam ? '' : `<div class="expect small" id="expect-${sfx}">Calculando el resultado esperado…</div>`}
    </div>`;
  }
  function daxDataBoxHTML(o) {
    const data = o.dax ? o.dax.data : { columns: window.DAX.columns, rows: window.DAX.rows };
    const names = o.dax ? [...o.dax.measures.values()].map(m => m.name) : state.measures.map(m => m.name);
    const first = data.rows[0] || {};
    const type = c => typeof first[c] === 'number' ? 'número' : 'texto';
    return `<div class="data-box">
      <p class="eyebrow">${icon('powerbi')} Datos para este ejercicio</p>
      <p class="small">Tabla <code>Ventas</code> · ${data.rows.length.toLocaleString('es-MX')} filas · ${o.dax ? 'una fila por línea de pedido' : 'una fila por venta'}. Escribe sus columnas como <code>Ventas[Columna]</code>.</p>
      <div class="colchips">${data.columns.map(c => `<span class="colchip">${esc(c)}<small>${type(c)}</small></span>`).join('')}</div>
      <p class="small">Medidas que ya existen y puedes usar: ${names.map(n => `<code>[${esc(n)}]</code>`).join(' ')}</p>
      <details class="sample-rows"><summary>Ver 5 filas de ejemplo</summary>${tableHTML(data.columns, data.rows.slice(0, 5).map(r => data.columns.map(c => r[c])))}</details>
    </div>`;
  }

  /* ============================================================ prácticas reutilizables
     Las usan las lecciones, los exámenes y los proyectos. */
  function diffHint(got, exp) {
    const g = got.split('\n'), e = exp.split('\n');
    if (g.length !== e.length) return `Se esperaban ${e.length} líneas y tu programa imprime ${g.length}.`;
    for (let i = 0; i < e.length; i++) if (g[i] !== e[i]) return `La línea ${i + 1} no coincide. Esperado: "${e[i]}". Obtenido: "${g[i]}".`;
    return 'La salida casi coincide; revisa espacios y mayúsculas.';
  }
  const solutionOutputs = new Map();
  async function pythonExpected(p) {
    if (p.expected != null) return p.expected;
    if (!solutionOutputs.has(p.solution)) { const r = await runPython(p.solution, ''); solutionOutputs.set(p.solution, r.ok ? r.out : null); }
    return solutionOutputs.get(p.solution);
  }
  function practiceHTML(p, sfx, o) {
    const lang = o.lang;
    const helpers = !o.exam && p.hints && p.hints.length;
    return `<section class="practice ${o.passed ? 'passed' : ''} ${o.extra ? 'practice-extra' : ''}" id="practice-${sfx}">
        <div class="practice-head"><p class="eyebrow">${esc(o.title)}</p>${o.passed ? `<span class="chip chip-done">${icon('check')} Superada</span>` : ''}</div>
        <p class="prompt">${esc(p.prompt)}</p>
        ${lang === 'sql' ? sqlDataBoxHTML(p, sfx, o.exam) : ''}
        ${lang === 'dax' && p.type !== 'visual' ? daxDataBoxHTML(o) : ''}
        ${p.type === 'visual' ? `
          <div class="cta-row"><a class="btn btn-ghost" href="#lab-powerbi">${icon('lab')}Abrir el laboratorio de Power BI</a><button class="btn btn-primary" id="check-visual-${sfx}">${icon('check')}Comprobar visual</button></div>
          <div class="result" id="result-${sfx}" hidden></div>` : `
          ${lang === 'dax' ? `<div class="dax-row"><span class="dax-name">Medida =</span></div>` : ''}
          <div id="editor-${sfx}"></div>
          ${lang === 'python' && !o.exam ? `<details class="stdin"><summary>Entrada para input() (una línea por llamada)</summary><textarea id="stdin-${sfx}" rows="2" placeholder="Si tu programa usa input(), escribe aquí las respuestas"></textarea></details>` : ''}
          <div class="toolbar">
            <button class="btn btn-primary" id="check-${sfx}">${icon('check')}Comprobar</button>
            <button class="btn btn-ghost" id="run-${sfx}">${icon('play')}Ejecutar</button>
            ${helpers ? `<button class="btn btn-ghost" id="hint-${sfx}">Pista</button><button class="btn btn-ghost" id="solution-${sfx}">Ver solución</button>` : ''}
            <button class="btn btn-text" id="reset-${sfx}">Reiniciar</button>
            ${p.type === 'sql-modify' ? `<button class="btn btn-text" id="resetdb-${sfx}">Restaurar base de datos</button>` : ''}
            <span class="kbd muted">Ctrl + Enter ejecuta</span>
          </div>
          <div class="hints" id="hints-${sfx}"></div>
          <div class="result" id="result-${sfx}" hidden></div>
          <div class="output" id="out-${sfx}" hidden></div>
          <div class="solution" id="solution-box-${sfx}" hidden></div>`}
      </section>`;
  }
  function markPassedUI(sfx) {
    const sec = $('#practice-' + sfx); if (!sec) return;
    sec.classList.add('passed');
    const h = $('.practice-head', sec); if (h && !$('.chip-done', h)) h.insertAdjacentHTML('beforeend', `<span class="chip chip-done">${icon('check')} Superada</span>`);
  }
  // o: { lang, draftKey, label, exam, dax: { data, measures } | null, onPass() }
  function mountPractice(p, sfx, o) {
    const S = id => $('#' + id + '-' + sfx);
    const lang = o.lang;
    const pass = () => { markPassedUI(sfx); if (o.onPass) o.onPass(); };
    if (p.type === 'visual') {
      S('check-visual').addEventListener('click', () => {
        const c = p.check; const v = state.visual || {}; const problems = [];
        if (v.type !== c.visual) problems.push('el tipo de visual debe ser Barras');
        if (v.axis !== c.axis) problems.push('el eje debe ser ' + c.axis);
        if (v.measure !== c.measure) problems.push('la medida debe ser ' + c.measure);
        for (const [k, val] of Object.entries(c.slicer)) if (String(state.slicers[k] || '') !== val) problems.push(`el segmentador ${k} debe estar en ${val}`);
        const r = S('result'); r.hidden = false;
        if (!problems.length) { r.className = 'result ok'; r.innerHTML = `<b>${icon('check')} Visual correcto.</b> Barras de Ventas Totales por Región, filtradas a 2024.`; pass(); }
        else { r.className = 'result bad'; r.innerHTML = `<b>Todavía no.</b> Revisa en el laboratorio: ${esc(problems.join('; '))}.`; }
      });
      return null;
    }
    const sec = $('#practice-' + sfx);
    if (sec) bindTableChips(sec);
    if (S('resetdb')) S('resetdb').addEventListener('click', async () => { await RT.resetDb(); toast('Base de datos restaurada', 'Volvió a su estado original'); });
    if (lang === 'sql' && S('expect')) (async () => {
      const box = S('expect');
      try {
        await RT.sql();
        if (p.type === 'sql-modify') {
          box.innerHTML = `<b>Cómo se comprueba:</b> se restaura la base, se ejecuta tu código y se compara el resultado de esta consulta con el de la solución: <code>${esc(p.verify)}</code>`;
          return;
        }
        const r = runSQL(p.solution); if (!r.ok) { box.remove(); return; }
        const rs = sqlRows(r.results); const n = rs.values.length;
        box.innerHTML = `<b>Resultado esperado:</b> ${n} ${n === 1 ? 'fila' : 'filas'} con ${rs.columns.length === 1 ? 'la columna' : `${rs.columns.length} columnas`}: ${rs.columns.map(c => `<code>${esc(c)}</code>`).join(', ')}${p.ordered ? ', en el orden que pide el enunciado' : ''}. <button class="btn-link peek">Ver las primeras filas</button><div class="peek-out"></div>`;
        $('.peek', box).addEventListener('click', ev => {
          ev.target.hidden = true;
          $('.peek-out', box).innerHTML = tableHTML(rs.columns, rs.values.slice(0, 3)) + `<p class="muted small">Úsalo para confirmar la forma del resultado, no para copiar números.</p>`;
        });
      } catch (err) { box.remove(); }
    })();
    const draftKey = o.draftKey;
    const e = makeEditor(S('editor'), {
      lang, id: 'ed-' + String(sfx).replace(/\W/g, '-'), label: o.label || 'Editor de práctica',
      value: draftKey && state.drafts[draftKey] != null ? state.drafts[draftKey] : p.starter,
      onRun: () => runPractice(false),
      onChange: v => { if (!draftKey) return; state.drafts[draftKey] = v; clearTimeout(e._t); e._t = setTimeout(save, 400); }
    });
    S('run').addEventListener('click', () => runPractice(false));
    S('check').addEventListener('click', () => runPractice(true));
    S('reset').addEventListener('click', () => { e.set(p.starter); if (draftKey) { delete state.drafts[draftKey]; save(); } S('result').hidden = true; S('out').hidden = true; });
    if (S('hint')) {
      let hintN = 0;
      S('hint').addEventListener('click', () => { if (hintN < p.hints.length) { const h = document.createElement('p'); h.className = 'hint'; h.innerHTML = `<b>Pista ${hintN + 1}.</b> ${esc(p.hints[hintN])}`; S('hints').appendChild(h); hintN++; } if (hintN >= p.hints.length) { S('hint').disabled = true; S('hint').textContent = 'Sin más pistas'; } });
      S('solution').addEventListener('click', () => {
        const box = S('solution-box');
        if (box.hidden && !box.dataset.confirm) {
          box.hidden = false; box.dataset.confirm = '1';
          box.innerHTML = `<p>Ver la solución ahora reduce lo que aprendes. ¿Seguro? <button class="btn btn-small sol-yes">Sí, mostrar</button> <button class="btn btn-small btn-text sol-no">Intentar un poco más</button></p>`;
          $('.sol-yes', box).addEventListener('click', () => { box.innerHTML = `<p class="eyebrow">Solución de referencia</p>${codeBlock(p.solution, lang)}<button class="btn btn-small sol-load">Cargar en el editor</button>`; $('.sol-load', box).addEventListener('click', () => e.set(p.solution)); bindCodeActions(box, () => {}); });
          $('.sol-no', box).addEventListener('click', () => { box.hidden = true; delete box.dataset.confirm; });
        } else box.hidden = !box.hidden;
      });
    }
    const daxRun = expr => o.dax
      ? window.DAX.withData(o.dax.data, () => window.DAX.run(expr, { measures: o.dax.measures }))
      : window.DAX.run(expr, { measures: measuresMap() });
    async function runPractice(check) {
      const code = e.get(); const out = S('out'), res = S('result');
      out.hidden = false; res.hidden = true;
      out.innerHTML = `<div class="output-bar">Ejecutando…</div>`;
      try {
        if (lang === 'python') {
          await RT.python();
          const r = await runPython(code, (S('stdin') || {}).value || '');
          out.innerHTML = `<div class="output-bar">Salida</div><pre>${esc(r.out) || '<span class="muted">(sin salida)</span>'}</pre>${r.ok ? '' : `<pre class="err">${esc(r.err)}</pre>`}`;
          if (check) {
            const expected = await pythonExpected(p);
            if (!r.ok) showResult(false, 'El programa terminó con un error. Corrígelo y vuelve a comprobar.');
            else if (expected == null) showResult(false, 'No se pudo calcular la salida esperada. Recarga la página e inténtalo de nuevo.');
            else if (norm(r.out) === norm(expected)) showResult(true, 'Tu salida coincide exactamente con la esperada.');
            else showResult(false, diffHint(norm(r.out), norm(expected)));
          }
        } else if (lang === 'sql' && p.type === 'sql-modify') {
          await RT.sql();
          const r = runSQL(code);
          if (!r.ok) { out.innerHTML = `<div class="output-bar">Error</div><pre class="err">${esc(r.err)}</pre>`; if (check) showResult(false, 'Alguna instrucción tiene un error. Corrígela y vuelve a comprobar.'); return; }
          const after = sqlRows(runSQL(p.verify).results);
          out.innerHTML = `<div class="output-bar">Estado de la tabla tras tus cambios</div>${tableHTML(after.columns, after.values)}`;
          if (check) {
            await RT.resetDb(); runSQL(p.solution); const expected = sqlRows(runSQL(p.verify).results);
            await RT.resetDb(); runSQL(code); const mine = sqlRows(runSQL(p.verify).results);
            const c = sqlCompare(mine, expected, true);
            showResult(c.ok, c.ok ? 'La tabla quedó exactamente como se esperaba.' : 'La tabla no quedó como se esperaba. ' + c.why);
          }
        } else if (lang === 'sql') {
          await RT.sql();
          const r = runSQL(code);
          if (!r.ok) { out.innerHTML = `<div class="output-bar">Error</div><pre class="err">${esc(r.err)}</pre>`; if (check) showResult(false, 'La consulta tiene un error. Corrígela y vuelve a comprobar.'); return; }
          const rs = sqlRows(r.results);
          out.innerHTML = `<div class="output-bar">Resultado · ${rs.values.length} filas · ${r.ms.toFixed(1)} ms</div>${tableHTML(rs.columns, rs.values)}`;
          if (check) {
            const sol = sqlRows(runSQL(p.solution).results);
            const c = sqlCompare(rs, sol, p.ordered);
            showResult(c.ok, c.ok ? 'El resultado coincide con la consulta de referencia.' : c.why);
          }
        } else if (lang === 'dax') {
          try {
            const v = daxRun(code);
            out.innerHTML = `<div class="output-bar">Resultado (sin filtros)</div><div class="kpi small"><div class="kpi-value">${esc(window.DAX.format(v))}</div></div>`;
            if (check) {
              const expected = daxRun(p.solution);
              const ok = typeof v === 'number' && typeof expected === 'number' ? Math.abs(v - expected) < 0.005 : String(v) === String(expected);
              showResult(ok, ok ? 'La medida devuelve el valor esperado.' : `El valor esperado es ${window.DAX.format(expected)} y tu expresión devuelve ${window.DAX.format(v)}.`);
            }
          } catch (err) { out.innerHTML = `<div class="output-bar">Error</div><pre class="err">${esc(err.message)}</pre>`; if (check) showResult(false, 'La expresión tiene un error. Corrígela y vuelve a comprobar.'); }
        }
      } catch (err) { out.innerHTML = `<div class="output-bar">Error</div><pre class="err">${esc(err.message || err)}</pre>`; }
    }
    function showResult(ok, msg) {
      const res = S('result'); res.hidden = false; res.className = 'result ' + (ok ? 'ok' : 'bad');
      res.innerHTML = `<b>${ok ? icon('check') + ' Correcto.' : 'Todavía no.'}</b> ${esc(msg)}`;
      if (ok) pass();
    }
    return e;
  }

  /* ============================================================ lección */
  function renderLesson(app, l) {
    const t = TRACKS[l.track];
    state.last = l.id; save();
    const prev = t.lessons[l.index - 1], next = t.lessons[l.index + 1];
    const done = state.completed.includes(l.id);
    const pr = l.practice;
    const practices = [l.practice, ...(l.extra || [])].filter(Boolean);
    const runnableLang = t.runtime;
    const pKey = i => i === 0 ? l.id : l.id + ':' + i;
    const quizState = state.quiz[l.id] || {};
    const footHTML = () => {
      const isDone = state.completed.includes(l.id);
      const reqs = requirements(l);
      return `${isDone
        ? `<div class="reqs reqs-done"><span class="chip chip-done">${icon('check')} Lección completada</span><p class="muted small">Sus preguntas volverán en tu repaso espaciado para que no se olviden.</p></div>`
        : `<div class="reqs"><p class="eyebrow">Para completar esta lección</p><ul>${reqs.map(r => `<li class="${r.ok ? 'ok' : ''}"><span class="req-ic">${r.ok ? icon('check') : ''}</span>${esc(r.label)}</li>`).join('')}</ul><p class="muted small">La lección se marca sola al cumplir todo. Los ejercicios extra son opcionales y dan puntos adicionales.</p></div>`}
        <div class="pager">
          ${prev ? `<a class="btn btn-ghost" href="#${prev.id}">‹ ${esc(prev.title)}</a>` : ''}
          ${next ? `<a class="btn btn-ghost" href="#${next.id}">${esc(next.title)} ›</a>` : (t.exam ? `<a class="btn btn-primary" href="#examen-${t.id}">${icon('target')}Examen final de ${esc(t.name)} ›</a>` : `<a class="btn btn-ghost" href="#${t.id}">Volver a la ruta ›</a>`)}
        </div>`;
    };
    function refreshCompletion() {
      const justDone = tryComplete(l);
      $('#lesson-foot').innerHTML = footHTML();
      if (justDone) {
        const chips = $('.lesson .chips'); if (chips && !$('.chip-done', chips)) chips.insertAdjacentHTML('beforeend', `<span class="chip chip-done">${icon('check')} Completada</span>`);
        const item = $(`.side-item[href="#${l.id}"]`); if (item) { item.classList.add('done'); $('span', item).innerHTML = icon('check'); }
      }
    }
    const quizItemHTML = (q, qi) => {
      const picked = quizState[qi];
      const answered = picked !== undefined;
      const right = answered && picked === q.answer;
      return `<div class="quiz-q" data-q="${qi}">
        <h3>${esc(q.q).replace(/\n/g, '<br>')}</h3>
        <div class="options">${q.options.map((o, i) => `<button class="opt ${answered ? (i === q.answer && right ? 'right' : (picked === i && !right ? 'wrong' : '')) : ''}" data-i="${i}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>
        <p class="explain" ${answered ? '' : 'hidden'}>${esc(q.explain)}</p>
        <div class="quiz-retry" ${answered && !right ? '' : 'hidden'}><button class="btn btn-small btn-ghost retry">Intentar de nuevo</button><span class="muted small">Esta pregunta volverá mañana en tu repaso.</span></div>
      </div>`;
    };
    app.innerHTML = `
    <div class="lesson-layout" style="--tc: var(--${t.id})">
      <aside class="lesson-side">
        <a class="side-track" href="#${t.id}">${icon(t.id)} ${esc(t.name)} <small>${trackProgress(t).done}/${t.lessons.length}</small></a>
        <nav class="side-list">${t.lessons.map(x => `<a class="side-item ${x.id === l.id ? 'on' : ''} ${state.completed.includes(x.id) ? 'done' : ''}" href="#${x.id}"><span>${state.completed.includes(x.id) ? icon('check') : x.index + 1}</span>${esc(x.title)}</a>`).join('')}<a class="side-item side-extra" href="#chuleta-${t.id}"><span>${icon('book')}</span>Chuleta de referencia</a><a class="side-item side-extra" href="#lab-${t.id}"><span>${icon('lab')}</span>Laboratorio</a></nav>
      </aside>
      <article class="lesson">
        <p class="crumbs"><a href="#inicio">Inicio</a> › <a href="#${t.id}">${esc(t.name)}</a> › Lección ${l.index + 1}</p>
        <h1>${esc(l.title)}</h1>
        <div class="chips"><span class="chip">${l.minutes} min</span><span class="chip">${esc(l.level)}</span>${l.reading ? '<span class="chip">Lectura guiada</span>' : '<span class="chip">Con práctica</span>'}${done ? `<span class="chip chip-done">${icon('check')} Completada</span>` : ''}</div>

        <section class="why"><p class="eyebrow">Por qué importa</p><p>${esc(l.why)}</p></section>

        ${runnableLang === 'sql' && l.diagram !== 'er' ? (() => {
          const used = tablesIn([...practices.map(p => (p.solution || '') + ' ' + (p.verify || '')), l.example && l.example.code, ...l.concept.map(c => c.code)].join(' '));
          const names = used.length ? used : SCHEMA.tables.map(t => t.name);
          return `<section class="db-ref"><details>
            <summary><span class="db-ref-t">${icon('sql')} Base de datos de esta lección</span><span class="muted small">${names.join(' · ')}</span></summary>
            <div class="db-ref-body"><p class="small muted">${esc(SCHEMA.company)} Estas son las tablas que usan los ejemplos y ejercicios de esta lección. Toca una para ver sus columnas.</p>
            ${tableChipsHTML(names)}
            <p class="small"><a href="#sql-0">Ver el diagrama completo de la base y cómo se relacionan las tablas</a></p></div>
          </details></section>`;
        })() : ''}

        ${l.guide ? `<section class="guides">
          <p class="eyebrow">Cómo se usa</p>
          ${l.guide.map((g, gi) => `<article class="guide">
            <h2>${esc(g.name)}</h2>
            <div class="guide-grid">
              <div class="guide-syntax">
                <p class="guide-label">Sintaxis</p>
                <pre class="pf-code"><code>${highlight(g.syntax, 'sql')}</code></pre>
                <dl class="parts">${g.parts.map(([k, v]) => `<div><dt><code>${esc(k)}</code></dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
              </div>
              <div class="guide-side">
                <div><p class="guide-label">Cuándo usarla</p><p>${esc(g.when)}</p></div>
                <div><p class="guide-label">Cómo se lee en español</p><p class="read">«${esc(g.read)}»</p></div>
              </div>
            </div>
            ${g.demo ? `<div class="demo-ba" id="demo-${gi}">
              <p class="guide-label">${g.demo.before ? 'Antes y después, con datos reales' : 'Resultado con datos reales'}</p>
              <div class="ba-grid ${g.demo.before ? '' : 'single'}">
                ${g.demo.before ? `<div class="ba-col"><p class="ba-h">Antes</p><pre class="ba-q"><code>${highlight(g.demo.before, 'sql')}</code></pre><div class="ba-out"><p class="muted small">Cargando…</p></div></div><div class="ba-arrow" aria-hidden="true">›</div>` : ''}
                <div class="ba-col"><p class="ba-h">${g.demo.before ? 'Después' : 'Consulta'}</p><pre class="ba-q"><code>${highlight(g.demo.after, 'sql')}</code></pre><div class="ba-out"><p class="muted small">Cargando…</p></div></div>
              </div>
              <p class="ba-note">${esc(g.demo.note)}</p>
            </div>` : ''}
          </article>`).join('')}
        </section>` : ''}

        <section class="concepts">
          <p class="eyebrow">${l.guide ? 'Ejemplos para practicar' : 'Concepto'}</p>
          ${l.concept.map(c => `<div class="concept"><h3>${esc(c.h)}</h3>${c.p ? `<p>${esc(c.p)}</p>` : ''}${c.code ? codeBlock(c.code, c.lang || runnableLang, { runnable: !c.readonly && !l.reading && pr && pr.type !== 'visual' }) : ''}</div>`).join('')}
        </section>

        ${l.diagram === 'star' ? `<section class="diagram">${starDiagram()}</section>` : ''}
        ${l.diagram === 'er' ? `<section class="diagram er-section">${erSectionHTML()}</section>` : ''}

        ${l.deeper ? `<section class="deeper">
          <div class="steps-card"><p class="eyebrow">Cómo lo ejecuta SQL, paso a paso</p><ol class="exec-steps">${l.deeper.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
          <div class="pitfalls"><p class="eyebrow">Errores comunes</p>${l.deeper.pitfalls.map(p => `<div class="pitfall">
            <div class="pf-row"><span class="chip chip-bad">Así no</span><pre class="pf-code"><code>${highlight(p.bad, 'sql')}</code></pre></div>
            <div class="pf-row"><span class="chip chip-done">Así sí</span><pre class="pf-code"><code>${highlight(p.good, 'sql')}</code></pre></div>
            <p class="pf-why">${esc(p.why)}</p></div>`).join('')}</div>
        </section>` : ''}

        ${l.example ? `<section class="example">
          <p class="eyebrow">Ejemplo de oficina</p>
          <h3>${esc(l.example.title)}</h3>
          <p>${esc(l.example.text)}</p>
          ${l.example.code ? codeBlock(l.example.code, runnableLang === 'dax' ? 'dax' : runnableLang, { runnable: !l.example.readonly && !l.reading && pr && pr.type !== 'visual' }) : ''}
          ${l.example.code && !l.example.readonly && !l.reading ? `<div class="example-run"><button class="btn btn-small" id="run-example">${icon('play')}Ejecutar ejemplo</button><div class="output" id="example-out" hidden></div></div>` : ''}
          ${l.example.output ? `<div class="output static"><div class="output-bar">Salida</div><pre>${esc(l.example.output)}</pre></div>` : ''}
        </section>` : ''}

        ${practices.map((p, i) => practiceHTML(p, i, { lang: runnableLang, title: i === 0 ? 'Práctica' : `Ejercicio extra ${i}${p.level ? ' · ' + p.level : ''}`, passed: !!state.practice[pKey(i)], extra: i > 0 })).join('')}

        ${l.quiz ? `<section class="quiz" id="quiz">
          <p class="eyebrow">Reto rápido</p>
          ${l.quiz.map(quizItemHTML).join('')}
        </section>` : ''}

        <footer class="lesson-foot" id="lesson-foot">${footHTML()}</footer>
      </article>
    </div>`;

    // editores + acciones de cada práctica
    const eds = practices.map((p, i) => mountPractice(p, i, {
      lang: runnableLang, draftKey: pKey(i), label: i === 0 ? 'Editor de práctica' : 'Editor del ejercicio extra ' + i,
      onPass: () => {
        const key = pKey(i);
        if (state.practice[key]) return;
        state.practice[key] = true; save();
        addXP(i === 0 ? 50 : 30, i === 0 ? 'Práctica superada' : 'Ejercicio extra superado');
        if (i === 0) refreshCompletion();
      }
    }));
    const ed = eds[0] || null;
    // ejemplo ejecutable
    const runEx = $('#run-example');
    if (runEx) runEx.addEventListener('click', async () => {
      const box = $('#example-out'); box.hidden = false; box.innerHTML = '<div class="output-bar">Ejecutando…</div>';
      try {
        if (runnableLang === 'python') { await RT.python(); const r = await runPython(l.example.code, ''); box.innerHTML = `<div class="output-bar">Salida</div><pre>${esc(r.out)}</pre>${r.ok ? '' : `<pre class="err">${esc(r.err)}</pre>`}`; }
        else if (runnableLang === 'sql') { await RT.sql(); const r = runSQL(l.example.code); if (!r.ok) box.innerHTML = `<pre class="err">${esc(r.err)}</pre>`; else { const rs = sqlRows(r.results); box.innerHTML = `<div class="output-bar">Resultado · ${rs.values.length} filas</div>${tableHTML(rs.columns, rs.values)}`; } }
        else if (runnableLang === 'dax') {
          const ms = measuresMap(); const lines = l.example.code.split('\n').filter(x => x.trim() && !x.trim().startsWith('//'));
          const defs = lines.every(x => /^[^=()\[\]]+=\s*\S/.test(x)) ? lines.map(x => { const m = x.match(/^([^=()\[\]]+)=\s*(.+)$/); return [m[1].trim(), m[2]]; }) : [['Resultado', l.example.code.replace(/^[^=()\[\]]+=\s*/, '')]];
          box.innerHTML = `<div class="output-bar">Resultado (sin filtros)</div>` + defs.map(([n, ex]) => { try { return `<div class="kpi small"><div class="kpi-label">${esc(n)}</div><div class="kpi-value">${esc(window.DAX.format(window.DAX.run(ex, { measures: ms })))}</div></div>`; } catch (e) { return `<pre class="err">${esc(n + ': ' + e.message)}</pre>`; } }).join('');
        }
      } catch (e) { box.innerHTML = `<pre class="err">${esc(e.message || e)}</pre>`; }
    });
    // reto rápido: un error no bloquea la lección; se reintenta y la pregunta entra al repaso de mañana
    $$('#quiz .quiz-q').forEach(qEl => {
      const qi = +qEl.dataset.q, q = l.quiz[qi];
      const srsId = `L:${l.id}:${qi}`;
      $$('.opt', qEl).forEach(b => b.addEventListener('click', () => {
        const i = +b.dataset.i; const right = i === q.answer;
        state.quiz[l.id] = state.quiz[l.id] || {};
        const firstTry = !state.srs[srsId];
        state.quiz[l.id][qi] = i;
        srsRecord(srsId, right, false); save();
        $$('.opt', qEl).forEach((o, k) => { o.disabled = true; o.classList.toggle('right', right && k === q.answer); o.classList.toggle('wrong', k === i && !right); });
        $('.explain', qEl).hidden = false;
        $('.quiz-retry', qEl).hidden = right;
        if (right && firstTry) addXP(20, 'Reto rápido'); else { touchStreak(); save(); renderTopbar(); }
        if (right) refreshCompletion();
      }));
      $('.retry', qEl).addEventListener('click', () => {
        $$('.opt', qEl).forEach(o => { o.disabled = false; o.classList.remove('right', 'wrong'); });
        $('.explain', qEl).hidden = true; $('.quiz-retry', qEl).hidden = true;
      });
    });
    // lecciones que ya cumplían los requisitos con progreso anterior
    if (!done && requirements(l).every(r => r.ok)) refreshCompletion();
    // guías de uso: cada antes/después se calcula sobre una copia limpia de la base
    if (l.guide) (async () => {
      for (let gi = 0; gi < l.guide.length; gi++) {
        const d = l.guide[gi].demo; const box = $('#demo-' + gi); if (!d || !box) continue;
        const outs = $$('.ba-out', box); const queries = d.before ? [d.before, d.after] : [d.after];
        for (let k = 0; k < queries.length; k++) {
          try {
            const db = await RT.pristine();
            let res; try { res = db.exec(queries[k]); } finally { db.close(); }
            const rs = res[res.length - 1];
            outs[k].innerHTML = rs ? `${tableHTML(rs.columns, rs.values, 15)}<p class="muted small">${rs.values.length} ${rs.values.length === 1 ? 'fila' : 'filas'}</p>` : '<p class="muted small">Sin filas</p>';
          } catch (e) { outs[k].innerHTML = `<p class="err small">${esc(sqlError(e.message))}</p>`; }
        }
      }
    })();
    // base de datos visible
    const dbRef = $('.db-ref', app); if (dbRef) bindTableChips(dbRef);
    const er = $('.er-section', app); if (er) bindER(er);
    // bloques de código: copiar / enviar / ejecutar aquí
    bindCodeActions(app,code => { if (ed) { ed.set(code); $('#practice-0').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); ed.focus(); } });
  }
  function bindCodeActions(root, onSend) {
    $$('[data-runsql]', root).forEach(b => b.addEventListener('click', async () => {
      const blk = $('#' + b.dataset.runsql); const out = $('.inline-out', blk);
      if (!out.hidden && out.dataset.done) { out.hidden = true; b.innerHTML = icon('play') + 'Ejecutar aquí'; return; }
      out.hidden = false; out.innerHTML = '<div class="output-bar">Ejecutando…</div>';
      try {
        const db = await RT.pristine();
        let results;
        try { results = db.exec($('code', blk).dataset.raw); } finally { db.close(); }
        out.innerHTML = results.length
          ? results.map((rs, k) => `<div class="output-bar">${results.length > 1 ? `Consulta ${k + 1} · ` : ''}Resultado · ${rs.values.length} ${rs.values.length === 1 ? 'fila' : 'filas'}</div>${tableHTML(rs.columns, rs.values, 25)}`).join('')
          : '<div class="output-bar">La consulta no devolvió filas</div>';
        out.dataset.done = '1'; b.innerHTML = icon('close') + 'Ocultar resultado';
      } catch (e) { out.innerHTML = `<div class="output-bar">Error</div><pre class="err">${esc(sqlError(e.message))}</pre>`; }
    }));
    $$('[data-copy]', root).forEach(b => b.addEventListener('click', async () => {
      const code = $('#' + b.dataset.copy + ' code').dataset.raw;
      try { await navigator.clipboard.writeText(code); b.innerHTML = icon('check') + 'Copiado'; } catch (e) { const r = document.createRange(); r.selectNodeContents($('#' + b.dataset.copy + ' code')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selecciona y copia'; }
      setTimeout(() => { b.innerHTML = icon('copy') + 'Copiar'; }, 1600);
    }));
    $$('[data-send]', root).forEach(b => b.addEventListener('click', () => {
      let code = $('#' + b.dataset.send + ' code').dataset.raw;
      if (b.closest('.code').dataset.lang === 'dax') { const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')); code = (lines[0] || '').replace(/^[^=()\[\]]+=\s*/, '') + (lines.length > 1 ? '\n' + lines.slice(1).join('\n') : ''); }
      onSend(code);
    }));
  }
  function starDiagram() {
    const dim = (x, y, name, cols) => `<g transform="translate(${x} ${y})"><rect class="d-box dim" width="140" height="64" rx="8"/><text class="d-title" x="70" y="22" text-anchor="middle">${name}</text><text class="d-cols" x="70" y="44" text-anchor="middle">${cols}</text></g>`;
    return `<p class="eyebrow">Esquema estrella del modelo</p><div class="diagram-wrap"><svg viewBox="0 0 560 330" class="star" role="img" aria-label="Esquema estrella: la tabla Ventas en el centro conectada a cuatro dimensiones">
      <line class="d-line" x1="280" y1="165" x2="90" y2="60"/><line class="d-line" x1="280" y1="165" x2="470" y2="60"/><line class="d-line" x1="280" y1="165" x2="90" y2="270"/><line class="d-line" x1="280" y1="165" x2="470" y2="270"/>
      <text class="d-card" x="150" y="100">1</text><text class="d-card" x="225" y="140">*</text>
      <text class="d-card" x="405" y="100">1</text><text class="d-card" x="330" y="140">*</text>
      <text class="d-card" x="150" y="240">1</text><text class="d-card" x="225" y="200">*</text>
      <text class="d-card" x="405" y="240">1</text><text class="d-card" x="330" y="200">*</text>
      <g transform="translate(200 120)"><rect class="d-box fact" width="160" height="90" rx="10"/><text class="d-title" x="80" y="26" text-anchor="middle">Ventas (hechos)</text><text class="d-cols" x="80" y="48" text-anchor="middle">FechaID · RegionID · ProductoID</text><text class="d-cols" x="80" y="66" text-anchor="middle">VendedorID · Unidades · Ventas · Costo</text></g>
      ${dim(20, 28, 'DimCalendario', 'Fecha · Año · Mes · Trimestre')}${dim(400, 28, 'DimRegion', 'RegionID · Region · Pais')}${dim(20, 238, 'DimProducto', 'ProductoID · Producto · Categoria')}${dim(400, 238, 'DimVendedor', 'VendedorID · Vendedor · Equipo')}
    </svg></div><p class="muted small">Cada dimensión (lado 1) filtra a los hechos (lado *). Los visuales usan las columnas de las dimensiones; las medidas agregan los hechos.</p>`;
  }

  /* ============================================================ plan / logros */
  function renderPlan(app) {
    // Un elemento del plan puede ser una lección, un proyecto (proyecto-x) o un examen (examen-x).
    const item = id => {
      if (LESSONS[id]) { const l = LESSONS[id]; return { done: state.completed.includes(id), tc: l.track, ic: icon(l.track), title: l.title, meta: l.minutes + ' min' }; }
      if (id.startsWith('proyecto-')) { const p = PROJECTS[id.slice(9)]; return { done: !!(state.projects[p.id] && state.projects[p.id].done), tc: 'accent', ic: icon('lab'), title: 'Proyecto: ' + p.title, meta: p.minutes + ' min' }; }
      const t = TRACKS[id.slice(7)]; return { done: !!(state.exams[t.id] && state.exams[t.id].passed), tc: t.id, ic: icon('target'), title: 'Examen final de ' + t.name, meta: '45 min' };
    };
    app.innerHTML = `<section class="page-head"><p class="eyebrow">Plan sugerido</p><h1>Diez semanas, tres rutas entrelazadas</h1><p class="lead">Alternar Python, SQL y Power BI cada semana refuerza las ideas comunes: filtrar, agrupar, unir, medir. Tres o cuatro lecciones por semana, más diez minutos diarios de repaso, equivalen a unas dos horas semanales. La última semana aplica todo en proyectos y exámenes.</p>
      <ol class="method-list method-inline"><li><b>Por qué importa:</b> el problema real.</li><li><b>Concepto</b> con código ejecutable.</li><li><b>Ejemplo de oficina.</b></li><li><b>Práctica comprobada</b> y ejercicios extra.</li><li><b>Reto rápido</b> que entra al repaso.</li></ol></section>
    <section class="weeks">${C.plan.map(w => { const items = w.lessons.map(id => [id, item(id)]); const done = items.filter(([, x]) => x.done).length; return `<div class="week ${done === items.length ? 'done' : ''}"><div class="week-head"><span class="week-n">Semana ${w.week}</span><h3>${esc(w.title)}</h3><span class="muted">${done}/${items.length}</span></div>${items.map(([id, x]) => `<a class="week-item ${x.done ? 'done' : ''}" href="#${id}" style="--tc: var(--${x.tc})"><span class="dot-t">${x.ic}</span><span>${esc(x.title)}</span><small>${esc(x.meta)}</small></a>`).join('')}</div>`; }).join('')}</section>`;
  }
  function renderBadges(app) {
    app.innerHTML = `<section class="page-head"><p class="eyebrow">Logros</p><h1>Insignias</h1><p class="lead">Se desbloquean solas al avanzar. ${state.badges.length} de ${C.badges.length} conseguidas.</p></section>
    <section class="badges">${C.badges.map(b => { const got = state.badges.includes(b.id); return `<div class="badge ${got ? 'got' : ''}"><span class="badge-ic">${icon(got ? 'star' : 'lock')}</span><h3>${esc(b.name)}</h3><p>${esc(b.desc)}</p></div>`; }).join('')}</section>
    <section class="card danger-zone"><h3>Reiniciar progreso</h3><p class="muted">Borra lecciones completadas, puntos, rachas e insignias de este navegador. No se puede deshacer.</p><button class="btn btn-ghost" id="reset-all">Borrar todo mi progreso</button><span id="reset-confirm" hidden> ¿Seguro? <button class="btn btn-small" id="reset-yes">Sí, borrar</button></span></section>`;
    $('#reset-all').addEventListener('click', () => { $('#reset-confirm').hidden = false; });
    $('#reset-yes').addEventListener('click', () => { state = freshState(state.theme); save(); renderTopbar(); go('inicio'); toast('Progreso borrado'); });
  }

  /* ============================================================ repaso espaciado */
  const BOX_LABELS = ['Mañana', '3 días', '1 semana', '2 semanas', '1 mes', '2 meses'];
  function renderReview(app, summary) {
    const due = dueIds();
    const deckIds = Object.keys(state.srs).filter(id => SRS_ITEMS[id]);
    const boxes = INTERVALS.map((_, b) => deckIds.filter(id => state.srs[id].box === b).length);
    const maxBox = Math.max(1, ...boxes);
    const mastered = deckIds.filter(id => state.srs[id].box >= 3).length;
    const upcoming = deckIds.map(id => state.srs[id].due).filter(d => d > today()).sort();
    const nextDue = upcoming[0];
    const nextCount = upcoming.filter(d => d === nextDue).length;
    app.innerHTML = `<section class="page-head">
      <p class="eyebrow">${icon('flame')} Repaso espaciado</p>
      <h1>Repasa justo antes de olvidar</h1>
      <p class="lead">Cada pregunta que respondes vive en una caja. Si aciertas sube a la siguiente y vuelve más tarde; si fallas regresa a la primera y vuelve mañana. Así dedicas tu tiempo a lo que todavía no dominas.</p>
    </section>
    <section class="stats">
      <div class="stat"><span class="stat-n">${due.length}</span><span class="stat-l">pendientes hoy</span></div>
      <div class="stat"><span class="stat-n">${deckIds.length}</span><span class="stat-l">preguntas en tu repaso</span></div>
      <div class="stat"><span class="stat-n">${mastered}</span><span class="stat-l">dominadas (2 semanas o más)</span></div>
      <div class="stat"><span class="stat-n">${(state.reviewCorrect || 0).toLocaleString('es-MX')}</span><span class="stat-l">aciertos en repasos</span></div>
    </section>
    <div class="review-layout">
      <section id="review-area" class="review-area"></section>
      <aside class="card boxes">
        <p class="eyebrow">Tus cajas</p>
        <p class="muted small">Cuándo vuelve cada pregunta después de acertarla.</p>
        ${boxes.map((n, b) => `<div class="box-row"><span class="box-l">${BOX_LABELS[b]}</span><span class="box-bar"><span style="width:${Math.round(100 * n / maxBox)}%"></span></span><span class="box-n">${n}</span></div>`).join('')}
      </aside>
    </div>`;
    const area = $('#review-area');
    let html = summary || '';
    if (!deckIds.length) {
      const first = ALL_LESSONS.find(l => !state.completed.includes(l.id)) || ALL_LESSONS[0];
      html += `<div class="card review-empty"><h3>Tu repaso está vacío</h3><p class="muted">Las preguntas entran aquí cuando respondes un reto rápido en una lección, el reto del día o un examen. Empieza por una lección y vuelve mañana.</p><a class="btn btn-primary" href="#${first.id}">${icon('play')}Ir a ${esc(first.title)}</a></div>`;
    } else if (due.length) {
      html += `<div class="card review-start"><h3>${due.length} ${due.length === 1 ? 'pregunta te espera' : 'preguntas te esperan'} hoy</h3><p class="muted">Unos ${Math.max(1, Math.round(due.length * 0.5))} minutos. Las que falles se repiten al final de la sesión y vuelven mañana.</p><button class="btn btn-primary" id="start-review">${icon('play')}Empezar el repaso</button></div>`;
    } else {
      html += `<div class="card review-start"><h3>Nada pendiente hoy</h3><p class="muted">${nextDue ? `Tu próximo repaso es el ${esc(fmtDate(nextDue))}, con ${nextCount} ${nextCount === 1 ? 'pregunta' : 'preguntas'}.` : ''} Si quieres practicar ahora, puedes repasar diez preguntas al azar sin cambiar tu calendario.</p><button class="btn btn-ghost" id="practice-review">${icon('play')}Practicar sin afectar el calendario</button></div>`;
    }
    area.innerHTML = html;
    const sb = $('#start-review'); if (sb) sb.addEventListener('click', () => startReview(app, due, false));
    const pb = $('#practice-review'); if (pb) pb.addEventListener('click', () => startReview(app, shuffle(deckIds).slice(0, 10), true));
  }
  function startReview(app, ids, practiceMode) {
    const s = { queue: shuffle(ids).map(id => ({ id, retry: false })), pos: 0, correct: 0, answered: 0, practiceMode, xp: 0 };
    showReviewCard(app, s);
  }
  function showReviewCard(app, s) {
    const area = $('#review-area');
    if (!area) return;
    if (s.pos >= s.queue.length) return finishReview(app, s);
    const { id, retry } = s.queue[s.pos];
    const it = SRS_ITEMS[id];
    const src = it.lesson ? LESSONS[it.lesson] : null;
    const order = shuffle(it.options.map((_, i) => i));
    area.innerHTML = `<div class="review-card" style="--tc: var(--${it.track})">
      <div class="review-top"><span class="chip chip-track">${icon(it.track)} ${esc(TRACKS[it.track].name)}</span>${retry ? '<span class="chip chip-warn">Segunda vuelta</span>' : ''}${s.practiceMode ? '<span class="chip">Práctica libre</span>' : ''}<span class="review-count">${s.pos + 1} de ${s.queue.length}</span></div>
      <div class="review-bar"><span style="width:${Math.round(100 * s.pos / s.queue.length)}%"></span></div>
      <h3>${esc(it.q).replace(/\n/g, '<br>')}</h3>
      <div class="options">${order.map(i => `<button class="opt" data-i="${i}">${esc(it.options[i])}</button>`).join('')}</div>
      <p class="explain" hidden>${esc(it.explain)}${src ? ` <a href="#${src.id}">Repasar la lección «${esc(src.title)}»</a>` : ''}</p>
      <div class="review-next" hidden><span class="muted small next-when"></span><button class="btn btn-primary next">Siguiente</button></div>
    </div>`;
    const card = $('.review-card', area);
    $$('.opt', card).forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i, right = i === it.answer;
      $$('.opt', card).forEach(o => { o.disabled = true; const k = +o.dataset.i; o.classList.toggle('right', k === it.answer); o.classList.toggle('wrong', k === i && !right); });
      if (!retry) {
        s.answered++;
        if (right) { s.correct++; if (!s.practiceMode) { s.xp += 10; state.reviewCorrect = (state.reviewCorrect || 0) + 1; } }
        if (!s.practiceMode) { srsRecord(id, right, true); save(); }
        if (!right) s.queue.push({ id, retry: true });
      }
      $('.explain', card).hidden = false;
      $('.next-when', card).textContent = s.practiceMode ? '' : retry ? (right ? 'Bien. Mañana la vuelves a ver para fijarla.' : 'Volverá mañana.') : right ? `Volverá el ${fmtDate(state.srs[id].due)}.` : 'Volverá mañana. Antes de terminar te la vuelvo a preguntar.';
      $('.review-next', card).hidden = false;
      const nx = $('.next', card); nx.focus();
      nx.addEventListener('click', () => { s.pos++; showReviewCard(app, s); });
    }));
  }
  function finishReview(app, s) {
    if (s.xp) addXP(s.xp, `Repaso: ${s.correct} de ${s.answered} correctas`); else { touchStreak(); save(); renderTopbar(); }
    const pct = s.answered ? Math.round(100 * s.correct / s.answered) : 0;
    const summary = `<div class="card review-summary"><p class="eyebrow">${icon('check')} Repaso terminado</p><h3>${s.correct} de ${s.answered} correctas a la primera (${pct}%)</h3><p class="muted">${s.practiceMode ? 'Fue una práctica libre: tu calendario no cambió.' : pct >= 80 ? 'Buen nivel de retención. Las acertadas vuelven más espaciadas.' : 'Las que fallaste vuelven mañana. Si alguna se repite, abre su lección desde la explicación.'}</p></div>`;
    renderReview(app, summary);
  }

  /* ============================================================ exámenes finales */
  function renderExam(app, t) {
    const ex = t.exam, st = state.exams[t.id], p = trackProgress(t);
    app.innerHTML = `<section class="page-head exam-head" style="--tc: var(--${t.id})">
      <p class="crumbs"><a href="#inicio">Inicio</a> › <a href="#${t.id}">${esc(t.name)}</a> › Examen final</p>
      <p class="eyebrow" style="color: var(--tc)">${icon('target')} Examen final</p>
      <h1>Examen final de ${esc(t.name)}</h1>
      <p class="lead">Preguntas nuevas, distintas de los retos de las lecciones, para comprobar que puedes aplicar lo aprendido. No hay pistas ni soluciones a la vista. Al terminar ves tu nota, qué fallaste y qué lecciones repasar.</p>
      <ul class="exam-facts">
        <li><b>${ex.questions.length}</b> preguntas de opción múltiple</li>
        <li><b>${ex.tasks.length}</b> tareas prácticas que valen doble</li>
        <li>Se aprueba con <b>${ex.passMark}%</b></li>
        <li>Unos <b>45</b> minutos</li>
      </ul>
      ${st ? `<p class="exam-status">${st.passed ? `<span class="chip chip-done">${icon('check')} Aprobado</span>` : `<span class="chip chip-warn">Aún no aprobado</span>`} Mejor nota: <b>${st.best}%</b> · Último intento: ${st.last}% · ${st.attempts} ${st.attempts === 1 ? 'intento' : 'intentos'}</p>` : ''}
      ${p.done < p.total ? `<p class="muted small">Te faltan ${p.total - p.done} lecciones de esta ruta. Puedes presentarlo igual: las preguntas que falles te dirán qué estudiar.</p>` : ''}
      <div class="cta-row"><button class="btn btn-primary" id="start-exam">${icon('play')}${st ? 'Volver a presentarlo' : 'Empezar el examen'}</button><a class="btn btn-ghost" href="#chuleta-${t.id}">${icon('book')}Repasar la chuleta antes</a></div>
    </section>
    <section id="exam-area"></section>`;
    $('#start-exam').addEventListener('click', () => startExam(app, t));
  }
  function startExam(app, t) {
    const ex = t.exam;
    const att = { qs: shuffle(ex.questions.map((_, qi) => qi)).map(qi => ({ qi, order: shuffle(ex.questions[qi].options.map((_, i) => i)) })), answers: {}, tasks: {} };
    $('#start-exam').closest('.cta-row').hidden = true;
    const area = $('#exam-area');
    area.innerHTML = `<div class="exam-body" style="--tc: var(--${t.id})">
      ${att.qs.map((x, n) => { const q = ex.questions[x.qi]; return `<div class="exam-q card" data-qi="${x.qi}">
        <p class="eyebrow">Pregunta ${n + 1} de ${att.qs.length}</p>
        <h3>${esc(q.q).replace(/\n/g, '<br>')}</h3>
        <div class="options" role="radiogroup">${x.order.map(i => `<button class="opt" role="radio" aria-checked="false" data-i="${i}">${esc(q.options[i])}</button>`).join('')}</div>
      </div>`; }).join('')}
      ${ex.tasks.map((task, k) => practiceHTML(task, 'x' + k, { lang: t.runtime, title: `Tarea práctica ${k + 1} de ${ex.tasks.length} · vale el doble`, exam: true })).join('')}
      <div class="exam-foot card">
        <p id="exam-progress" class="muted"></p>
        <div class="cta-row"><button class="btn btn-primary" id="submit-exam">${icon('check')}Entregar examen</button></div>
        <div id="exam-confirm" hidden></div>
      </div>
    </div>`;
    const progress = () => { $('#exam-progress').textContent = `Respondidas: ${Object.keys(att.answers).length} de ${att.qs.length} preguntas · Tareas superadas: ${Object.keys(att.tasks).length} de ${ex.tasks.length}. Puedes cambiar tus respuestas hasta entregar.`; };
    $$('.exam-q', area).forEach(qEl => {
      const qi = +qEl.dataset.qi;
      $$('.opt', qEl).forEach(b => b.addEventListener('click', () => {
        att.answers[qi] = +b.dataset.i;
        $$('.opt', qEl).forEach(o => { const on = o === b; o.classList.toggle('selected', on); o.setAttribute('aria-checked', on ? 'true' : 'false'); });
        progress();
      }));
    });
    ex.tasks.forEach((task, k) => mountPractice(task, 'x' + k, { lang: t.runtime, exam: true, label: 'Editor de la tarea ' + (k + 1), onPass: () => { att.tasks[k] = true; progress(); } }));
    progress();
    area.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    $('#submit-exam').addEventListener('click', () => {
      const missing = att.qs.length - Object.keys(att.answers).length;
      const box = $('#exam-confirm');
      if (missing && box.hidden) {
        box.hidden = false;
        box.innerHTML = `<p class="result bad">Te faltan ${missing} ${missing === 1 ? 'pregunta' : 'preguntas'} sin responder; cuentan como incorrectas. <button class="btn btn-small" id="force-submit">Entregar de todas formas</button> <button class="btn btn-small btn-text" id="keep-going">Seguir respondiendo</button></p>`;
        $('#force-submit').addEventListener('click', () => gradeExam(app, t, att));
        $('#keep-going').addEventListener('click', () => { box.hidden = true; });
        return;
      }
      gradeExam(app, t, att);
    });
  }
  function gradeExam(app, t, att) {
    const ex = t.exam;
    const results = att.qs.map(x => { const q = ex.questions[x.qi]; const pick = att.answers[x.qi]; return { qi: x.qi, q, pick, right: pick === q.answer }; });
    const correct = results.filter(r => r.right).length;
    const tasksOk = Object.keys(att.tasks).length;
    const score = Math.round(100 * (correct + 2 * tasksOk) / (ex.questions.length + 2 * ex.tasks.length));
    const prev = state.exams[t.id];
    const passedNow = score >= ex.passMark;
    state.exams[t.id] = { best: Math.max(score, prev ? prev.best : 0), last: score, passed: !!(prev && prev.passed) || passedNow, date: today(), attempts: (prev ? prev.attempts : 0) + 1 };
    results.forEach(r => srsRecord(`E:${t.id}:${r.qi}`, r.right, false));
    save();
    if (passedNow && !(prev && prev.passed)) addXP(150, 'Examen de ' + t.name + ' aprobado'); else { touchStreak(); save(); renderTopbar(); checkBadges(); }
    const wrong = results.filter(r => !r.right);
    const byLesson = {};
    wrong.forEach(r => { byLesson[r.q.lesson] = (byLesson[r.q.lesson] || 0) + 1; });
    const lessonsToReview = Object.entries(byLesson).sort((a, b) => b[1] - a[1]);
    const area = $('#exam-area');
    area.innerHTML = `<div class="exam-result card ${passedNow ? 'pass' : 'fail'}" style="--tc: var(--${t.id})">
      <div class="score-ring">${ring(score, 132, 11)}<div><b>${score}%</b><span>${passedNow ? 'Aprobado' : 'No aprobado'}</span></div></div>
      <div class="score-text">
        <p class="eyebrow">${passedNow ? icon('check') + ' Examen aprobado' : 'Resultado'}</p>
        <h2>${passedNow ? `Dominas lo esencial de ${esc(t.name)}` : `Te faltan ${ex.passMark - score} puntos para aprobar`}</h2>
        <p>${correct} de ${ex.questions.length} preguntas correctas · ${tasksOk} de ${ex.tasks.length} tareas prácticas superadas.</p>
        <p class="muted small">Las preguntas que fallaste ya están en tu repaso para mañana; las acertadas volverán en unos días.</p>
        <div class="cta-row"><button class="btn btn-ghost" id="retake">Volver a presentarlo</button><a class="btn btn-ghost" href="#repaso">${icon('flame')}Ir a mi repaso</a></div>
      </div>
    </div>
    ${lessonsToReview.length ? `<section class="card exam-review"><p class="eyebrow">Qué repasar primero</p><ul class="review-lessons">${lessonsToReview.map(([lid, n]) => { const l = LESSONS[lid]; return `<li><a href="#${lid}">${esc(l ? l.title : lid)}</a><span class="muted small">${n} ${n === 1 ? 'fallo' : 'fallos'}</span></li>`; }).join('')}</ul></section>` : ''}
    ${wrong.length ? `<section class="exam-wrong"><p class="eyebrow">Tus errores, explicados</p>${wrong.map(r => `<div class="card wrong-item"><h3>${esc(r.q.q).replace(/\n/g, '<br>')}</h3>
      <p><span class="chip chip-bad">Tu respuesta</span> ${r.pick === undefined ? '<i>Sin responder</i>' : esc(r.q.options[r.pick])}</p>
      <p><span class="chip chip-done">Correcta</span> ${esc(r.q.options[r.q.answer])}</p>
      <p class="explain">${esc(r.q.explain)}</p></div>`).join('')}</section>` : ''}`;
    $('#retake').addEventListener('click', () => renderExam(app, t));
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ============================================================ proyectos integradores */
  const KIND = { sql: { label: 'SQL', lang: 'sql', tc: 'sql' }, python: { label: 'Python', lang: 'python', tc: 'python' }, dax: { label: 'Power BI · DAX', lang: 'dax', tc: 'powerbi' }, desktop: { label: 'Power BI Desktop', lang: null, tc: 'powerbi' } };
  const projKey = (pr, i) => `proj:${pr.id}:${i}`;
  const projProgress = pr => { const steps = pr.steps.map((s, i) => [s, i]).filter(([s]) => s.kind !== 'desktop'); return { done: steps.filter(([, i]) => state.practice[projKey(pr, i)]).length, total: steps.length }; };
  function toCSV(rs) {
    const cell = v => { if (v === null || v === undefined) return ''; const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return [rs.columns.map(cell).join(','), ...rs.values.map(r => r.map(cell).join(','))].join('\n');
  }
  const projCache = {};
  async function projectData(pr) {
    if (projCache[pr.id]) return projCache[pr.id];
    const db = await RT.pristine();
    const q = sql => { const r = db.exec(sql); return r.length ? r[r.length - 1] : { columns: [], values: [] }; };
    const dataset = q(C.projectDatasetSQL);
    const stepResults = {};
    pr.steps.forEach((s, i) => { if (s.kind === 'sql') stepResults[i] = q(s.practice.solution); });
    db.close();
    const daxData = { columns: dataset.columns, rows: dataset.values.map(v => Object.fromEntries(dataset.columns.map((c, k) => [c, v[k]]))) };
    projCache[pr.id] = { dataset, stepResults, daxData };
    return projCache[pr.id];
  }
  function renderProjects(app) {
    app.innerHTML = `<section class="page-head">
      <p class="eyebrow">${icon('target')} Demuestra lo aprendido</p>
      <h1>Proyectos y exámenes</h1>
      <p class="lead">En el trabajo real las herramientas no van por separado: se extrae con SQL, se analiza con Python y se presenta en Power BI. Cada proyecto recorre ese flujo completo con los mismos datos y termina en un panel que puedes construir en Power BI Desktop.</p>
    </section>
    <section class="projects">${(C.projects || []).map(pr => { const pp = projProgress(pr); const st = state.projects[pr.id] || {}; return `
      <a class="project-card" href="#proyecto-${pr.id}">
        <div class="project-top"><span class="chip">${pr.minutes} min · ${esc(pr.level)}</span>${st.done ? `<span class="chip chip-done">${icon('check')} Completado</span>` : pp.done ? `<span class="chip chip-warn">${pp.done} de ${pp.total} pasos</span>` : ''}</div>
        <h2>${esc(pr.title)}</h2>
        <p>${esc(pr.summary)}</p>
        <div class="flow">${pr.steps.map((s, i) => `<span class="flow-step ${state.practice[projKey(pr, i)] ? 'ok' : ''}" style="--tc: var(--${KIND[s.kind].tc})">${esc(KIND[s.kind].label)}</span>`).join('<span class="flow-arrow">›</span>')}</div>
        <span class="link">${st.done ? 'Revisar el proyecto' : pp.done ? 'Continuar el proyecto' : 'Empezar el proyecto'} ${icon('arrow')}</span>
      </a>`; }).join('')}</section>
    <section class="page-head small-head"><p class="eyebrow">${icon('target')} Exámenes finales</p><h2>Un examen por ruta</h2><p class="muted">Preguntas nuevas y tareas prácticas sin pistas. Se aprueba con 70% y lo puedes repetir las veces que quieras.</p></section>
    <section class="exam-list">${C.tracks.filter(t => t.exam).map(examCardHTML).join('')}</section>`;
  }
  async function renderProject(app, pr) {
    const st = state.projects[pr.id] = state.projects[pr.id] || { done: false, checklist: {} };
    st.checklist = st.checklist || {};
    const headProgress = () => { const pp = projProgress(pr); return `<div class="proj-progress"><span class="box-bar"><span style="width:${Math.round(100 * pp.done / pp.total)}%"></span></span><span>${pp.done} de ${pp.total} pasos comprobados${st.done ? ` · <b>${icon('check')} Proyecto completado</b>` : ''}</span></div>`; };
    app.innerHTML = `<section class="page-head proj-head">
      <p class="crumbs"><a href="#inicio">Inicio</a> › <a href="#proyectos">Proyectos</a> › ${esc(pr.title)}</p>
      <p class="eyebrow">${icon('lab')} Proyecto integrador · ${pr.minutes} min · ${esc(pr.level)}</p>
      <h1>${esc(pr.title)}</h1>
      <div class="proj-brief">
        <div><h3>El caso</h3><p>${esc(pr.context)}</p></div>
        <div><h3>Entregable</h3><p>${esc(pr.deliverable)}</p><h3>Vas a practicar</h3><div class="chips">${pr.skills.map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div></div>
      </div>
      <div id="proj-progress">${headProgress()}</div>
    </section>
    <div id="proj-steps" class="proj-steps"><p class="muted">Preparando los datos del proyecto…</p></div>`;
    let data;
    try { data = await projectData(pr); }
    catch (e) { $('#proj-steps').innerHTML = `<p class="err">No se pudieron cargar los datos: ${esc(e.message || e)}. Revisa tu conexión y recarga la página.</p>`; return; }
    const r = route(); if (r.view !== 'project' || r.id !== pr.id) return;
    const measures = window.DAX.makeMeasures(pr.measures);
    const practiceFor = (s) => {
      if (s.kind !== 'python') return s.practice;
      const csv = toCSV(data.stepResults[s.feedsFrom]);
      return { ...s.practice, starter: s.practice.starter.replace('{{CSV}}', csv), solution: s.practice.solution.replace('{{CSV}}', csv) };
    };
    const host = $('#proj-steps');
    host.innerHTML = pr.steps.map((s, i) => {
      const k = KIND[s.kind]; const passed = !!state.practice[projKey(pr, i)];
      const inputNote = s.kind === 'python' ? `<p class="muted small">Datos de entrada: ${data.stepResults[s.feedsFrom].values.length} filas, el resultado de la consulta del paso ${s.feedsFrom + 1}.</p>` : '';
      return `<section class="proj-step ${passed ? 'done' : ''}" id="step-${i}" style="--tc: var(--${k.tc})">
        <div class="step-rail"><span class="step-num">${passed ? icon('check') : i + 1}</span></div>
        <div class="step-body">
          <div class="step-head"><span class="chip chip-track">${esc(k.label)}</span><h2>${esc(s.title)}</h2></div>
          <p class="step-explain">${esc(s.explain)}</p>
          ${inputNote}
          ${s.kind === 'desktop' ? desktopStepHTML(pr, s, i) : practiceHTML(practiceFor(s), 'p' + i, { lang: k.lang, title: 'Tu tarea', passed, dax: s.kind === 'dax' ? { data: data.daxData, measures } : null })}
        </div>
      </section>`;
    }).join('');
    pr.steps.forEach((s, i) => {
      if (s.kind === 'desktop') return bindDesktopStep(pr, s, i, data, st);
      mountPractice(practiceFor(s), 'p' + i, {
        lang: KIND[s.kind].lang, draftKey: projKey(pr, i), label: 'Editor del paso ' + (i + 1),
        dax: s.kind === 'dax' ? { data: data.daxData, measures } : null,
        onPass: () => {
          const key = projKey(pr, i);
          if (state.practice[key]) return;
          state.practice[key] = true; save();
          addXP(60, 'Paso ' + (i + 1) + ' del proyecto superado');
          const sec = $('#step-' + i); sec.classList.add('done'); $('.step-num', sec).innerHTML = icon('check');
          const pp = projProgress(pr);
          if (pp.done === pp.total && !st.done) { st.done = true; save(); addXP(200, 'Proyecto completado: ' + pr.title); setTimeout(() => toast('Proyecto completado', 'Ahora llévalo a Power BI Desktop en el último paso'), 700); }
          $('#proj-progress').innerHTML = headProgress();
        }
      });
    });
  }
  function desktopStepHTML(pr, s, i) {
    const st = state.projects[pr.id];
    const doneN = s.checklist.filter((_, k) => st.checklist[k]).length;
    return `<div class="desktop-step">
      <div class="dl-row"><button class="btn btn-primary" id="dl-${i}">${icon('arrow')}Descargar ${esc(s.download.name)}</button><button class="btn btn-ghost" id="copy-${i}">${icon('copy')}Copiar CSV</button></div>
      <p class="muted small">Si tu navegador bloquea la descarga, usa Copiar CSV y pégalo en un archivo nuevo con extensión .csv.</p>
      <textarea class="csv-fallback" id="csv-${i}" rows="6" readonly hidden aria-label="Contenido CSV"></textarea>
      <div class="preview card"><p class="eyebrow">Vista previa del resultado esperado</p><p class="muted small" id="preview-cap-${i}"></p><div class="chart-host" id="preview-${i}"></div></div>
      <div class="checklist"><p class="eyebrow">Lista de verificación · <span id="ck-n-${i}">${doneN} de ${s.checklist.length}</span></p>
        ${s.checklist.map((c, k) => `<label class="ck"><input type="checkbox" id="ck-${pr.id}-${k}" data-k="${k}" ${st.checklist[k] ? 'checked' : ''}><span>${esc(c)}</span></label>`).join('')}
      </div>
    </div>`;
  }
  function bindDesktopStep(pr, s, i, data, st) {
    const rs = s.download.source === 'dataset' ? data.dataset : data.stepResults[+s.download.source.replace('step', '')];
    const csv = toCSV(rs);
    $('#dl-' + i).addEventListener('click', () => {
      try {
        const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
        const a = document.createElement('a'); a.href = url; a.download = s.download.name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        toast('Descarga iniciada', `${s.download.name} · ${rs.values.length} filas`);
      } catch (e) { toast('No se pudo descargar', 'Usa Copiar CSV'); }
    });
    $('#copy-' + i).addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(csv); toast('CSV copiado', `${rs.values.length} filas`); }
      catch (e) { const ta = $('#csv-' + i); ta.hidden = false; ta.value = csv; ta.focus(); ta.select(); toast('Selecciona y copia', 'El texto ya está seleccionado'); }
    });
    $$(`.ck input`, $('#step-' + i)).forEach(cb => cb.addEventListener('change', () => {
      st.checklist[+cb.dataset.k] = cb.checked; save();
      $('#ck-n-' + i).textContent = `${s.checklist.filter((_, k) => st.checklist[k]).length} de ${s.checklist.length}`;
      if (s.checklist.every((_, k) => st.checklist[k]) && !st.deliverable) { st.deliverable = true; save(); addXP(100, 'Panel terminado en Power BI Desktop'); }
    }));
    const prevHost = $('#preview-' + i), cap = $('#preview-cap-' + i);
    if (s.preview === 'monthly') {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const vals = meses.map((_, m) => data.daxData.rows.filter(r => r['Año'] === 2024 && r.Mes === m + 1 && r.Estado === 'Entregado').reduce((t, r) => t + r.Ventas, 0));
      cap.textContent = 'Ventas Totales por mes de 2024, solo pedidos entregados. Así debe verse tu gráfico de líneas.';
      renderChart(prevHost, { type: 'line', categories: meses, values: vals, label: 'Ventas Totales', axisLabel: 'Mes' });
    } else if (s.preview === 'segments') {
      const res = data.stepResults[0]; const ci = res.columns.indexOf('ultima_compra'), pi = res.columns.indexOf('pedidos');
      const corte = Date.UTC(2024, 11, 31);
      const seg = row => { const d = Math.round((corte - Date.parse(row[ci] + 'T00:00:00Z')) / 86400000); return d > 180 ? 'Perdido' : d > 60 ? 'En riesgo' : row[pi] >= 10 ? 'Leal' : 'Activo'; };
      const order = ['Leal', 'Activo', 'En riesgo', 'Perdido'];
      const counts = order.map(o => res.values.filter(v => seg(v) === o).length);
      cap.textContent = 'Clientes por segmento. Tu gráfico de barras en Power BI debe dar los mismos conteos que el paso 2.';
      renderChart(prevHost, { type: 'bar', categories: order, values: counts, label: 'Clientes', axisLabel: 'Segmento' });
    }
  }

  /* ============================================================ laboratorios */
  const PY_SNIPPETS = [
    { n: 'Hola mundo', c: 'nombre = "Ana"\nprint(f"Hola, {nombre}. Hoy es un buen día para aprender.")' },
    { n: 'Ticket con IVA', c: 'precio = 899.0\ncantidad = 2\nsubtotal = precio * cantidad\ntotal = subtotal * 1.16\nprint(f"Subtotal: {subtotal:.2f}")\nprint(f"Total con IVA: {total:.2f}")' },
    { n: 'Agrupar ventas por región', c: 'ventas = [\n    {"region": "Norte", "monto": 1200},\n    {"region": "Sur", "monto": 800},\n    {"region": "Norte", "monto": 650},\n]\ntotales = {}\nfor v in ventas:\n    totales[v["region"]] = totales.get(v["region"], 0) + v["monto"]\nfor r, t in sorted(totales.items(), key=lambda kv: kv[1], reverse=True):\n    print(f"{r}: {t}")' },
    { n: 'Leer un CSV en texto', c: 'csv = """producto,unidades,precio\nMouse,3,250\nTeclado,1,900"""\nlineas = csv.splitlines()\ncab = lineas[0].split(",")\nfor l in lineas[1:]:\n    fila = dict(zip(cab, l.split(",")))\n    print(fila["producto"], int(fila["unidades"]) * float(fila["precio"]))' },
    { n: 'Usar input()', c: 'nombre = input("¿Cómo te llamas? ")\nedad = int(input("¿Cuántos años tienes? "))\nprint(f"{nombre}, en 10 años tendrás {edad + 10}.")' },
    { n: 'Módulo random y math', c: 'import random\nimport math\nrandom.seed(7)\nmuestra = [random.randint(1, 100) for _ in range(5)]\nprint("Muestra:", muestra)\nprint("Raíz de la suma:", round(math.sqrt(sum(muestra)), 2))' }
  ];
  const SQL_SNIPPETS = [
    { n: 'Explorar clientes', c: 'SELECT * FROM clientes LIMIT 10;' },
    { n: 'Pedidos por estado', c: 'SELECT estado, COUNT(*) AS pedidos\nFROM pedidos\nGROUP BY estado\nORDER BY pedidos DESC;' },
    { n: 'Top 5 clientes por gasto', c: 'SELECT c.nombre, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS total\nFROM pedidos p\nJOIN clientes c ON c.id = p.cliente_id\nJOIN detalle_pedidos d ON d.pedido_id = p.id\nGROUP BY c.id\nORDER BY total DESC\nLIMIT 5;' },
    { n: 'Ventas por mes', c: "SELECT strftime('%Y-%m', p.fecha) AS mes, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS ventas\nFROM pedidos p\nJOIN detalle_pedidos d ON d.pedido_id = p.id\nWHERE p.estado = 'Entregado'\nGROUP BY mes\nORDER BY mes;" },
    { n: 'Clientes sin pedidos', c: 'SELECT c.nombre, c.ciudad\nFROM clientes c\nLEFT JOIN pedidos p ON p.cliente_id = c.id\nWHERE p.id IS NULL;' },
    { n: 'Ranking por departamento (ventana)', c: 'SELECT nombre, departamento, salario,\n       RANK() OVER (PARTITION BY departamento ORDER BY salario DESC) AS puesto\nFROM empleados\nORDER BY departamento, puesto;' }
  ];
  const DAX_SNIPPETS = [
    'SUM(Ventas[Ventas])', '[Margen %]', 'CALCULATE([Ventas Totales], Ventas[Region] = "Norte")',
    'DIVIDE([Ventas Totales], CALCULATE([Ventas Totales], ALL(Ventas[Region])))',
    'SUMX(FILTER(Ventas, Ventas[Unidades] >= 10), Ventas[Ventas])',
    'CALCULATE([Ventas Totales], Ventas[Año] = 2024) - CALCULATE([Ventas Totales], Ventas[Año] = 2023)',
    'RANKX(ALL(Ventas[Region]), [Ventas Totales])', 'SELECTEDVALUE(Ventas[Region], "Todas las regiones")'
  ];
  function renderLab(app, which) {
    app.innerHTML = `<div class="lab">
      <div class="lab-tabs">
        <a class="lab-tab ${which === 'python' ? 'on' : ''}" href="#lab-python" style="--tc: var(--python)">${icon('python')}Python</a>
        <a class="lab-tab ${which === 'sql' ? 'on' : ''}" href="#lab-sql" style="--tc: var(--sql)">${icon('sql')}SQL</a>
        <a class="lab-tab ${which === 'powerbi' ? 'on' : ''}" href="#lab-powerbi" style="--tc: var(--powerbi)">${icon('powerbi')}Estudio DAX</a>
      </div>
      <div class="lab-body" id="lab-body" style="--tc: var(--${which})"></div></div>`;
    const body = $('#lab-body');
    if (which === 'python') labPython(body); else if (which === 'sql') labSQL(body); else labPBI(body);
  }
  function labPython(body) {
    body.innerHTML = `<div class="lab-grid">
      <div class="lab-main">
        <div class="lab-bar"><h2>Intérprete de Python</h2><select id="snips" class="select" aria-label="Ejemplos"><option value="">Cargar un ejemplo…</option>${PY_SNIPPETS.map((s, i) => `<option value="${i}">${esc(s.n)}</option>`).join('')}</select></div>
        <div id="editor"></div>
        <details class="stdin"><summary>Entrada para input() (una línea por llamada)</summary><textarea id="stdin" rows="2"></textarea></details>
        <div class="toolbar"><button class="btn btn-primary" id="run">${icon('play')}Ejecutar</button><button class="btn btn-text" id="clear">Limpiar</button><span class="kbd muted">Ctrl + Enter</span><span class="muted small" id="rt-status"></span></div>
        <div class="output" id="out"><div class="output-bar">Salida</div><pre class="muted">Ejecuta algo para ver el resultado aquí.</pre></div>
      </div>
      <aside class="lab-side"><h3>Qué puedes usar</h3><p class="muted">Este intérprete corre Python 3 en el navegador (Skulpt). Soporta el núcleo del lenguaje: variables, listas, diccionarios, funciones, clases, comprensiones, f-strings, try/except, y módulos como math, random, string y time.</p><p class="muted">No incluye archivos, pandas ni paquetes externos: para eso usa Python en tu computadora; las lecciones 9 a 11 te muestran el puente.</p><h3>Atajos</h3><ul class="muted small"><li>Tab inserta 4 espacios</li><li>Enter respeta la indentación</li><li>Ctrl + Enter ejecuta</li></ul></aside></div>`;
    const ed = makeEditor($('#editor'), { lang: 'python', id: 'ed-lab-py', value: state.drafts['lab-python'] || PY_SNIPPETS[1].c, onRun: run, onChange: v => { state.drafts['lab-python'] = v; clearTimeout(ed._t); ed._t = setTimeout(save, 400); } });
    $('#snips').addEventListener('change', e => { if (e.target.value !== '') ed.set(PY_SNIPPETS[+e.target.value].c); e.target.value = ''; });
    $('#run').addEventListener('click', run); $('#clear').addEventListener('click', () => ed.set(''));
    async function run() {
      const out = $('#out'); out.innerHTML = '<div class="output-bar">Ejecutando…</div>';
      try { $('#rt-status').textContent = window.Sk ? '' : 'Cargando intérprete…'; await RT.python(); $('#rt-status').textContent = ''; const r = await runPython(ed.get(), $('#stdin').value); out.innerHTML = `<div class="output-bar">Salida</div><pre>${esc(r.out) || '<span class="muted">(sin salida)</span>'}</pre>${r.ok ? '' : `<pre class="err">${esc(r.err)}</pre>`}`; touchStreak(); save(); }
      catch (e) { out.innerHTML = `<pre class="err">${esc(e.message || e)}</pre>`; }
    }
  }
  function labSQL(body) {
    body.innerHTML = `<div class="lab-grid">
      <div class="lab-main">
        <div class="lab-bar"><h2>Consola SQL</h2><select id="snips" class="select" aria-label="Ejemplos"><option value="">Cargar un ejemplo…</option>${SQL_SNIPPETS.map((s, i) => `<option value="${i}">${esc(s.n)}</option>`).join('')}</select></div>
        <div id="editor"></div>
        <div class="toolbar"><button class="btn btn-primary" id="run">${icon('play')}Ejecutar</button><button class="btn btn-text" id="reset-db">Restaurar base de datos</button><span class="kbd muted">Ctrl + Enter</span><span class="muted small" id="rt-status"></span></div>
        <div class="output" id="out"><div class="output-bar">Resultado</div><pre class="muted">Ejecuta una consulta para ver la tabla aquí.</pre></div>
      </div>
      <aside class="lab-side"><h3>Esquema</h3><p class="muted small">SQLite real. Haz clic en una tabla para verla.</p>
        <div class="schema">${window.SQLDB.schema.map(t => `<div class="schema-t"><button class="schema-name" data-t="${t.table}">${esc(t.table)} <small>${t.rows} filas</small></button><p class="muted small">${esc(t.desc)}</p><div class="schema-cols">${t.cols.map(c => `<code>${c}</code>`).join('')}</div></div>`).join('')}</div>
        <h3>Relaciones</h3><p class="small"><a href="#sql-0">Ver el diagrama y qué guarda cada columna</a></p><p class="muted small">pedidos.cliente_id → clientes.id<br>pedidos.empleado_id → empleados.id<br>detalle_pedidos.pedido_id → pedidos.id<br>detalle_pedidos.producto_id → productos.id<br>empleados.jefe_id → empleados.id</p></aside></div>`;
    const ed = makeEditor($('#editor'), { lang: 'sql', id: 'ed-lab-sql', value: state.drafts['lab-sql'] || SQL_SNIPPETS[2].c, onRun: run, onChange: v => { state.drafts['lab-sql'] = v; clearTimeout(ed._t); ed._t = setTimeout(save, 400); } });
    $('#snips').addEventListener('change', e => { if (e.target.value !== '') ed.set(SQL_SNIPPETS[+e.target.value].c); e.target.value = ''; });
    $('#run').addEventListener('click', run);
    $('#reset-db').addEventListener('click', async () => { await RT.resetDb(); toast('Base de datos restaurada'); });
    $$('.schema-name').forEach(b => b.addEventListener('click', () => { ed.set(`SELECT * FROM ${b.dataset.t} LIMIT 20;`); run(); }));
    async function run() {
      const out = $('#out'); out.innerHTML = '<div class="output-bar">Ejecutando…</div>';
      try {
        $('#rt-status').textContent = RT.db ? '' : 'Cargando SQLite…'; await RT.sql(); $('#rt-status').textContent = '';
        const r = runSQL(ed.get());
        if (!r.ok) { out.innerHTML = `<div class="output-bar">Error</div><pre class="err">${esc(r.err)}</pre>`; return; }
        if (!r.results.length) { out.innerHTML = `<div class="output-bar">Listo</div><pre class="muted">La instrucción se ejecutó sin devolver filas.</pre>`; return; }
        const rs = sqlRows(r.results); out.innerHTML = `<div class="output-bar">Resultado · ${rs.values.length} filas · ${r.ms.toFixed(1)} ms</div>${tableHTML(rs.columns, rs.values)}`;
        touchStreak(); save();
      } catch (e) { out.innerHTML = `<pre class="err">${esc(e.message || e)}</pre>`; }
    }
  }
  function labPBI(body) {
    const D = window.DAX;
    const dims = D.dimensionCols;
    body.innerHTML = `<div class="pbi">
      <section class="pbi-slicers card">
        <p class="eyebrow">Segmentadores (contexto de filtro)</p>
        <div class="slicers">${dims.filter(d => d !== 'Producto' && d !== 'MesNombre').map(d => `<label class="slicer"><span>${esc(d)}</span><select class="select" data-col="${d}" id="sl-${d.replace(/\W/g, '')}"><option value="">Todos</option>${D.distinctValues(d).map(v => `<option value="${esc(v)}" ${String(state.slicers[d] || '') === String(v) ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`).join('')}<button class="btn btn-text" id="clear-slicers">Quitar filtros</button></div>
        <p class="muted small" id="rows-count"></p>
      </section>
      <section class="pbi-measures card">
        <div class="pbi-head"><p class="eyebrow">Medidas del modelo</p><button class="btn btn-small" id="add-measure">+ Nueva medida</button></div>
        <div class="measures" id="measures"></div>
        <form class="measure-form" id="measure-form" hidden>
          <input class="input" id="m-name" placeholder="Nombre de la medida" aria-label="Nombre de la medida">
          <div id="m-editor"></div>
          <div class="toolbar"><button class="btn btn-primary btn-small" type="submit">Guardar</button><button class="btn btn-text btn-small" type="button" id="m-cancel">Cancelar</button><span class="err small" id="m-err"></span></div>
        </form>
      </section>
      <section class="pbi-eval card">
        <p class="eyebrow">Evaluar una expresión DAX</p>
        <div id="eval-editor"></div>
        <div class="toolbar"><button class="btn btn-primary" id="eval">${icon('play')}Evaluar</button><select id="dax-snips" class="select" aria-label="Ejemplos"><option value="">Ejemplos…</option>${DAX_SNIPPETS.map((s, i) => `<option value="${i}">${esc(s)}</option>`).join('')}</select><span class="kbd muted">Ctrl + Enter</span></div>
        <div class="kpi" id="eval-out"><div class="kpi-label">Resultado con los filtros actuales</div><div class="kpi-value muted">—</div></div>
      </section>
      <section class="pbi-visual card">
        <p class="eyebrow">Constructor de visuales</p>
        <div class="visual-controls">
          <label>Tipo<select class="select" id="v-type">${[['bar', 'Barras'], ['column', 'Columnas'], ['line', 'Líneas'], ['card', 'Tarjeta'], ['table', 'Tabla']].map(([v, n]) => `<option value="${v}" ${state.visual.type === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <label>Eje<select class="select" id="v-axis">${dims.map(d => `<option value="${d}" ${state.visual.axis === d ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
          <label>Medida<select class="select" id="v-measure"></select></label>
        </div>
        <div class="chart-host" id="chart"></div>
      </section>
      <section class="pbi-data card">
        <details><summary>Ver la tabla Ventas (${D.rows.length} filas)</summary><div id="data-table"></div></details>
      </section>
    </div>`;
    const measureEd = makeEditor($('#m-editor'), { lang: 'dax', id: 'ed-measure', label: 'Expresión de la medida' });
    const evalEd = makeEditor($('#eval-editor'), { lang: 'dax', id: 'ed-eval', value: state.drafts['lab-dax'] || 'CALCULATE([Ventas Totales], Ventas[Region] = "Norte")', onRun: evaluate, onChange: v => { state.drafts['lab-dax'] = v; clearTimeout(evalEd._t); evalEd._t = setTimeout(save, 400); } });
    let editing = null;
    function renderMeasures() {
      const ms = measuresMap(); const sl = slicerFilters();
      $('#measures').innerHTML = state.measures.map((m, i) => {
        let val; try { val = D.format(D.run(m.expr, { measures: ms, slicers: sl })); } catch (e) { val = '<span class="err">' + esc(e.message) + '</span>'; }
        return `<div class="measure"><div class="measure-top"><b>${esc(m.name)}</b><span class="measure-val">${val}</span></div><code class="measure-expr">${highlight(m.expr, 'dax')}</code><div class="measure-actions"><button class="btn-mini" data-edit="${i}">Editar</button><button class="btn-mini" data-use="${i}">Evaluar</button>${DEFAULT_MEASURES.some(d => d.name === m.name) ? '' : `<button class="btn-mini" data-del="${i}">Borrar</button>`}</div></div>`;
      }).join('');
      $$('[data-edit]', body).forEach(b => b.addEventListener('click', () => openForm(+b.dataset.edit)));
      $$('[data-use]', body).forEach(b => b.addEventListener('click', () => { evalEd.set('[' + state.measures[+b.dataset.use].name + ']'); evaluate(); }));
      $$('[data-del]', body).forEach(b => b.addEventListener('click', () => { state.measures.splice(+b.dataset.del, 1); save(); refresh(); }));
      const sel = $('#v-measure'); sel.innerHTML = state.measures.map(m => `<option value="${esc(m.name)}" ${state.visual.measure === m.name ? 'selected' : ''}>${esc(m.name)}</option>`).join('');
      if (!state.measures.some(m => m.name === state.visual.measure)) state.visual.measure = state.measures[0].name;
    }
    function openForm(i) {
      editing = i; const f = $('#measure-form'); f.hidden = false; $('#m-err').textContent = '';
      $('#m-name').value = i == null ? '' : state.measures[i].name; measureEd.set(i == null ? '' : state.measures[i].expr); $('#m-name').focus();
    }
    $('#add-measure').addEventListener('click', () => openForm(null));
    $('#m-cancel').addEventListener('click', () => { $('#measure-form').hidden = true; });
    $('#measure-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#m-name').value.trim(), expr = measureEd.get().trim();
      if (!name) { $('#m-err').textContent = 'Pon un nombre a la medida.'; return; }
      if (editing == null && state.measures.some(m => m.name.toLowerCase() === name.toLowerCase())) { $('#m-err').textContent = 'Ya existe una medida con ese nombre.'; return; }
      try { const test = state.measures.slice(); if (editing == null) test.push({ name, expr }); else test[editing] = { name, expr }; D.run(expr, { measures: D.makeMeasures(test) }); }
      catch (err) { $('#m-err').textContent = err.message; return; }
      if (editing == null) state.measures.push({ name, expr }); else state.measures[editing] = { name, expr };
      save(); $('#measure-form').hidden = true; refresh(); toast('Medida guardada', name);
    });
    function evaluate() {
      const out = $('#eval-out');
      try { const v = D.run(evalEd.get(), { measures: measuresMap(), slicers: slicerFilters() }); out.innerHTML = `<div class="kpi-label">Resultado con los filtros actuales</div><div class="kpi-value">${esc(D.format(v))}</div><div class="kpi-sub">${esc(slicerText())}</div>`; out.classList.remove('bad'); touchStreak(); save(); }
      catch (e) { out.classList.add('bad'); out.innerHTML = `<div class="kpi-label">Error</div><p class="err">${esc(e.message)}</p>`; }
    }
    const slicerText = () => { const parts = Object.entries(state.slicers).filter(([, v]) => v).map(([k, v]) => `${k} = ${v}`); return parts.length ? parts.join(' · ') : 'Sin filtros: todas las filas'; };
    $('#eval').addEventListener('click', evaluate);
    $('#dax-snips').addEventListener('change', e => { if (e.target.value !== '') { evalEd.set(DAX_SNIPPETS[+e.target.value]); evaluate(); } e.target.value = ''; });
    $$('.slicers select').forEach(s => s.addEventListener('change', () => { state.slicers[s.dataset.col] = s.value; save(); refresh(); }));
    $('#clear-slicers').addEventListener('click', () => { state.slicers = {}; save(); $$('.slicers select').forEach(s => { s.value = ''; }); refresh(); });
    ['v-type', 'v-axis', 'v-measure'].forEach(id => $('#' + id).addEventListener('change', () => { state.visual = { type: $('#v-type').value, axis: $('#v-axis').value, measure: $('#v-measure').value }; save(); drawVisual(); }));
    function drawVisual() {
      const host = $('#chart'); const { type, axis, measure } = state.visual;
      const m = state.measures.find(x => x.name === measure); if (!m) return;
      const ms = measuresMap(); const sl = slicerFilters();
      try {
        if (type === 'card') { const v = D.run(m.expr, { measures: ms, slicers: sl }); renderChart(host, { type, categories: [slicerText()], values: [v], label: measure }); return; }
        const cats = D.distinctValues(axis).filter(c => !state.slicers[axis] || String(state.slicers[axis]) === String(c));
        const values = cats.map(c => { try { return D.run(m.expr, { measures: ms, slicers: sl, extraFilters: [D.slicerFilter(axis, c)] }); } catch (e) { return null; } });
        const pairs = cats.map((c, i) => [c, values[i]]).filter(p => p[1] !== null);
        renderChart(host, { type, categories: pairs.map(p => p[0]), values: pairs.map(p => p[1]), label: measure, axisLabel: axis });
      } catch (e) { host.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
    }
    function refresh() {
      renderMeasures(); drawVisual();
      const n = D.rows.filter(r => slicerFilters().every(f => f.fn(r))).length;
      $('#rows-count').textContent = `${n.toLocaleString('es-MX')} de ${D.rows.length.toLocaleString('es-MX')} filas pasan el filtro · ${slicerText()}`;
      if (!$('#eval-out .kpi-value').classList.contains('muted')) evaluate();
    }
    $('#data-table').innerHTML = tableHTML(D.columns, D.rows.slice(0, 60).map(r => D.columns.map(c => r[c])), 60);
    refresh();
  }

  /* ============================================================ arranque */
  function init() {
    load(); applyTheme(); renderTopbar();
    $('#theme').addEventListener('click', () => { state.theme = state.theme === 'system' ? 'dark' : state.theme === 'dark' ? 'light' : 'system'; save(); applyTheme(); renderTopbar(); });
    $('#menu').addEventListener('click', () => $('#nav').classList.toggle('open'));
    window.addEventListener('hashchange', render);
    render();
    checkBadges();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
