/* app.js — interfaz: navegación, lecciones, terminal, paneles visuales, quiz, chuleta */
(function () {
'use strict';
const { LESSONS, RETOS, QUIZ, CHEAT, mkCtx } = window.GitLessons;
const Sim = window.GitSim;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const k in (props || {})) {
    if (k === 'class') e.className = props[k];
    else if (k === 'html') e.innerHTML = props[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), props[k]);
    else if (props[k] !== false && props[k] != null) e.setAttribute(k, props[k]);
  }
  kids.flat().forEach(c => { if (c == null || c === false) return; e.append(c.nodeType ? c : document.createTextNode(c)); });
  return e;
}
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
};

/* ───────── estado ───────── */
const progress = store.get('gfl_progress_v1', { lessons: {}, retos: {}, quiz: 0 });
const S = { tab: 'learn', kind: 'lessons', item: null, st: null, done: [], sub: 'teoria', explain: true, hist: [], hi: 0, locked: false, prev: new Set(), scenario: null, hintShown: {}, solShown: {}, won: false };
const saveProgress = () => store.set('gfl_progress_v1', progress);

const TABS = [['learn', 'Aprender'], ['retos', 'Retos'], ['lab', 'Laboratorio libre'], ['cheat', 'Chuleta'], ['quiz', 'Quiz']];

/* ───────── cabecera ───────── */
function renderNav() {
  const nav = $('#nav'); nav.innerHTML = '';
  TABS.forEach(([id, label]) => nav.append(h('button', { class: S.tab === id ? 'on' : '', onclick: () => showTab(id) }, label)));
}
function renderProg() {
  const l = Object.keys(progress.lessons).length, r = Object.keys(progress.retos).length;
  $('#prog').innerHTML = `<span>Lecciones <b>${l}/${LESSONS.length}</b></span><span>Retos <b>${r}/${RETOS.length}</b></span>`;
}

/* ───────── navegación ───────── */
function showTab(tab) {
  S.tab = tab; renderNav();
  const layout = $('#main'), isPage = tab === 'cheat' || tab === 'quiz';
  layout.classList.toggle('full', isPage);
  layout.classList.toggle('nolist', tab === 'lab');
  $('#page').hidden = !isPage;
  $('#seg').style.display = isPage ? 'none' : '';
  if (isPage) { if (tab === 'cheat') renderCheat(); else renderQuiz(); return; }
  if (tab === 'learn') { S.kind = 'lessons'; openItem(S.item && LESSONS.includes(S.item) ? S.item : (LESSONS.find(l => !progress.lessons[l.id]) || LESSONS[0])); }
  else if (tab === 'retos') { S.kind = 'retos'; openItem(S.item && RETOS.includes(S.item) ? S.item : RETOS[0]); }
  else openLab(S.scenario || 'vacio');
}
function setPane(p) {
  $('#main').classList.toggle('pane-term', p === 'term');
  $$('#seg button').forEach(b => b.classList.toggle('on', b.dataset.pane === p));
  if (p === 'term') setTimeout(() => $('#tin').focus(), 50);
}

/* ───────── entorno ───────── */
function buildEnv(setup) {
  const st = Sim.newState();
  for (const c of setup) Sim.run(st, c);
  st.history = []; st.cmdHistory = [];
  return st;
}
function resetEnv(msg) {
  S.st = buildEnv(S.setup || []);
  S.done = (S.item && S.item.tasks || []).map(() => false);
  S.won = false; S.prev = new Set(); S.hist = []; S.hi = 0;
  $('#tout').innerHTML = '';
  termLine([['Terminal simulada de GitFlow Lab. Escribe ', 'dim'], ['help', 'c'], [' para ver los comandos, o sigue la misión de la izquierda.', 'dim']]);
  if (msg) termLine([[msg, 'dim']]);
  updatePrompt(); refreshZones();
}

/* ───────── terminal ───────── */
function termLine(segs, cls) {
  const d = h('div', { class: 'l' + (cls ? ' ' + cls : '') });
  if (!segs.length) d.innerHTML = '&nbsp;';
  segs.forEach(([t, c]) => d.append(h('span', { class: c ? 'c-' + c : '' }, t)));
  if (!segs.length || segs.every(s => s[0] === '')) d.innerHTML = '&nbsp;';
  $('#tout').append(d); return d;
}
function printResult(lines) {
  lines.forEach(l => termLine(l.segs.map(s => [s.t, s.c])));
}
function promptParts() {
  const st = S.st; let path = st.cwd; const home = Sim.HOME;
  if (path === home) path = '~'; else if (path.startsWith(home + '/')) path = '~' + path.slice(home.length);
  const R = Sim.H.getRepo(st, st.cwd); let br = '';
  if (R) { const hd = R.repo.head; br = hd.type === 'branch' ? hd.name : 'HEAD:' + hd.id.slice(0, 7); if (R.repo.merging) br += '|MERGING'; }
  return { path, br };
}
function updatePrompt() {
  if (!S.st) return;
  const { path, br } = promptParts(), p = $('#ps1');
  p.innerHTML = '';
  p.append(h('span', { class: 'pu' }, 'dev@kdna'), h('span', { class: 'pd' }, ':'), h('span', { class: 'pp' }, path));
  if (br) p.append(h('span', { class: 'pb' }, ' (' + br + ')'));
  p.append(h('span', { class: 'pd' }, '$ '));
}
function scrollTerm() { const b = $('#tbody'); b.scrollTop = b.scrollHeight; }
function echoPrompt(line) {
  const { path, br } = promptParts();
  const d = h('div', { class: 'l' }, h('span', { class: 'c-g' }, 'dev@kdna'), h('span', { class: 'c-dim' }, ':'), h('span', { class: 'c-b' }, path), br ? h('span', { class: 'c-y' }, ' (' + br + ')') : '', h('span', { class: 'c-dim' }, '$ '), h('span', {}, line));
  $('#tout').append(d);
}
function execute(line) {
  const st = S.st;
  echoPrompt(line);
  if (!line.trim()) { scrollTerm(); return; }
  S.hist.push(line); S.hi = S.hist.length;
  const res = Sim.run(st, line);
  if (res.clear) $('#tout').innerHTML = '';
  printResult(res.lines);
  if (S.explain && res.ok) { const ex = Sim.explain(line); if (ex) termLine([['ⓘ ' + ex, '']], 'explain'); }
  updatePrompt(); refreshZones(); evaluate();
  scrollTerm();
  if (res.editor) openEditor(res.editor);
}
function bindTerminal() {
  const inp = $('#tin');
  $('#tbody').addEventListener('click', e => { if (getSelection().toString() === '') inp.focus(); });
  inp.addEventListener('keydown', e => {
    if (S.locked) { e.preventDefault(); return; }
    if (e.key === 'Enter') { e.preventDefault(); const v = inp.value; inp.value = ''; execute(v); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (S.hi > 0) { S.hi--; inp.value = S.hist[S.hi] || ''; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (S.hi < S.hist.length) { S.hi++; inp.value = S.hist[S.hi] || ''; } }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const r = Sim.complete(S.st, inp.value);
      if (!r.list.length) return;
      if (r.list.length === 1) inp.value = r.head + r.list[0] + (r.list[0].endsWith('/') ? '' : ' ');
      else if (r.completed.length > r.word.length) inp.value = r.head + r.completed;
      else { echoPrompt(inp.value); termLine([[r.list.join('   '), 'c']]); scrollTerm(); }
    }
    else if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); $('#tout').innerHTML = ''; }
    else if (e.ctrlKey && e.key.toLowerCase() === 'c') { e.preventDefault(); echoPrompt(inp.value + '^C'); inp.value = ''; scrollTerm(); }
  });
  $('#explainSw').addEventListener('change', e => { S.explain = e.target.checked; store.set('gfl_explain', S.explain); });
  $('#btnReset').addEventListener('click', () => { resetEnv('Escenario reiniciado.'); renderLesson(); });
}
function insertCmd(cmd) {
  const inp = $('#tin');
  if (window.matchMedia('(max-width:860px)').matches) setPane('term');
  inp.value = cmd; inp.focus();
  toast('Comando insertado: pulsa Enter para ejecutarlo');
}

/* ───────── editor (nano) ───────── */
let editing = null;
function openEditor(ed) {
  editing = ed; S.locked = true;
  $('#nanoTitle').textContent = 'GNU nano 7.2 — ' + ed.name;
  $('#nanoText').value = ed.content;
  $('#editor').hidden = false;
  setTimeout(() => { const t = $('#nanoText'); t.focus(); t.setSelectionRange(t.value.length, t.value.length); }, 30);
}
function closeEditor(save) {
  if (!editing) return;
  if (save) {
    let v = $('#nanoText').value; if (v && !v.endsWith('\n')) v += '\n';
    Sim.saveFile(S.st, editing.path, v);
    termLine([['[ Guardado: ' + editing.name + ' ]', 'dim']]);
  } else termLine([['[ Cancelado, sin cambios ]', 'dim']]);
  editing = null; S.locked = false; $('#editor').hidden = true;
  refreshZones(); evaluate(); scrollTerm(); $('#tin').focus();
}
function bindEditor() {
  $('#nanoSave').addEventListener('click', () => closeEditor(true));
  $('#nanoCancel').addEventListener('click', () => closeEditor(false));
  $('#nanoText').addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeEditor(false); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); closeEditor(true); }
    else if (e.key === 'Tab') { e.preventDefault(); const t = e.target, s = t.selectionStart; t.value = t.value.slice(0, s) + '  ' + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = s + 2; }
  });
}

/* ───────── paneles "4 zonas" ───────── */
function refreshZones() {
  const z = $('#zones'), v = Sim.view(S.st), cur = new Set();
  z.innerHTML = '';
  const mk = (cls, title, sub, body) => h('div', { class: 'zone ' + cls }, h('header', {}, h('span', {}, title), sub), h('div', { class: 'zb' }, body));
  const isNew = k => { cur.add(k); return !S.prev.has(k); };
  if (!v) {
    const msg = t => h('div', { class: 'empty' }, t);
    z.append(
      mk('wd', '1 · Directorio de trabajo', '', msg('Tus archivos aparecerán aquí cuando estés dentro de un repositorio (git init).')),
      mk('st', '2 · Staging', '', msg('Lo que prepares con git add.')),
      mk('lr', '3 · Repo local', '', msg('Tus commits (el historial).')),
      mk('rr', '4 · GitHub', '', msg('La copia remota, tras git remote add + git push.')));
    S.prev = cur; return;
  }
  const st = { untracked: 'nuevo', modified: 'modificado', clean: '', ignored: 'ignorado', deleted: 'borrado', conflict: 'CONFLICTO', staged: 'preparado' };
  const wBody = h('div', {});
  if (!v.work.length) wBody.append(h('div', { class: 'empty' }, 'La carpeta está vacía.'));
  v.work.forEach(f => { const k = 'w:' + f.path + ':' + f.state; wBody.append(h('div', { class: 'it ' + f.state + (isNew(k) ? ' new' : '') }, h('i', { class: 'dot' }), f.path, st[f.state] ? h('span', { class: 'tg' }, st[f.state]) : '')); });
  const sBody = h('div', {});
  if (!v.staged.length) sBody.append(h('div', { class: 'empty' }, 'Vacío. Usa git add para preparar cambios.'));
  v.staged.forEach(f => { const k = 's:' + f.path + ':' + f.kind; sBody.append(h('div', { class: 'it staged' + (isNew(k) ? ' new' : '') }, h('i', { class: 'dot' }), f.path, h('span', { class: 'tg' }, f.kind === 'new file' ? 'nuevo' : f.kind === 'deleted' ? 'borrado' : 'modificado'))); });
  const lBody = h('div', {});
  if (v.merging) lBody.append(h('div', { class: 'mergebar' }, 'Merge en curso: resuelve los conflictos, git add y git commit.'));
  if (!v.commits.length) lBody.append(h('div', { class: 'empty' }, 'Aún no hay commits.'));
  const cm = (c, remote) => h('div', { class: 'cm' + (isNew((remote ? 'r:' : 'l:') + c.id + c.labels.join()) ? ' new' : '') }, h('span', { class: 'h' }, c.short), h('span', { class: 'm' }, (c.merge ? '⑂ ' : '') + c.msg), c.labels.map(l => h('span', { class: 'lb' + (l.startsWith('HEAD') ? ' head' : /^origin\//.test(l) || remote ? ' rem' : '') }, l)));
  v.commits.forEach(c => lBody.append(cm(c, false)));
  const rBody = h('div', {});
  let rSub = '';
  if (!v.remote) rBody.append(h('div', { class: 'empty' }, 'Sin remoto. Conecta GitHub con git remote add origin URL.'));
  else {
    rBody.append(h('div', { class: 'empty' }, v.remote.url));
    if (!v.remote.commits.length) rBody.append(h('div', { class: 'empty' }, v.remote.exists ? 'Vacío. Falta tu primer git push.' : 'Aún no existe: haz git push.'));
    v.remote.commits.forEach(c => rBody.append(cm(c, true)));
  }
  if (v.tracking && (v.tracking.ahead || v.tracking.behind)) rSub = h('span', { class: 'badge warn' }, (v.tracking.ahead ? '↑' + v.tracking.ahead + ' ' : '') + (v.tracking.behind ? '↓' + v.tracking.behind : ''));
  else if (v.tracking) rSub = h('span', { class: 'badge ok' }, 'al día');
  z.append(
    mk('wd', '1 · Directorio de trabajo', h('small', {}, v.name + '/'), wBody),
    mk('st', '2 · Staging', h('small', {}, v.staged.length + ' cambio(s)'), sBody),
    mk('lr', '3 · Repo local', h('span', { class: 'badge' }, v.branch), lBody),
    mk('rr', '4 · GitHub', rSub || h('small', {}, 'origin'), rBody));
  S.prev = cur;
}

/* ───────── lecciones ───────── */
function renderSide() {
  const side = $('#side'); side.innerHTML = '';
  if (S.tab === 'learn') {
    side.append(h('h4', {}, 'Lecciones'));
    LESSONS.forEach(l => side.append(h('button', { class: (S.item === l ? 'on ' : '') + (progress.lessons[l.id] ? 'done' : ''), onclick: () => openItem(l) }, h('span', { class: 'num' }, h('span', {}, l.n)), l.title)));
  } else if (S.tab === 'retos') {
    side.append(h('h4', {}, 'Retos prácticos'));
    RETOS.forEach(l => side.append(h('button', { class: (S.item === l ? 'on ' : '') + (progress.retos[l.id] ? 'done' : ''), onclick: () => openItem(l) }, h('span', { class: 'num' }, h('span', {}, l.n)), h('span', {}, l.title, h('br'), h('small', { style: 'color:var(--dim)' }, l.tag)))));
  }
}
function openItem(item) {
  S.item = item; S.kind = S.tab === 'retos' ? 'retos' : 'lessons';
  S.setup = item.setup; S.sub = S.tab === 'retos' ? 'mision' : 'teoria';
  S.hintShown = {}; S.solShown = {};
  resetEnv('Escenario cargado: ' + item.title + '.');
  renderSide(); renderLesson();
  $('#lesson').scrollTop = 0; setPane('lesson');
}
function renderLesson() {
  const it = S.item, box = $('#lesson'); if (!it) return;
  box.innerHTML = '';
  const isReto = S.tab === 'retos';
  const done = S.done.filter(Boolean).length, total = it.tasks.length;
  box.append(h('div', { class: 'lhead' }, h('span', { class: 'pill' }, (isReto ? 'Reto ' + it.n + ' · ' : 'Lección ' + it.n + ' · ') + it.tag), h('h2', {}, it.title), h('p', {}, it.summary)));
  const tabs = isReto ? [['mision', 'Misión']] : [['teoria', 'Teoría'], ['cmds', 'Comandos'], ['mision', 'Misión']];
  box.append(h('div', { class: 'subtabs' }, tabs.map(([id, label]) => h('button', { class: S.sub === id ? 'on' : '', onclick: () => { S.sub = id; renderLesson(); box.scrollTop = 0; } }, label, id === 'mision' ? h('span', { class: 'cnt' }, done + '/' + total) : ''))));
  const c = h('div', { class: 'lcontent' }); box.append(c);
  if (S.sub === 'teoria') {
    c.append(h('div', { html: it.body }));
    c.append(h('div', { class: 'mission-actions' }, h('button', { class: 'btn', onclick: () => { S.sub = 'mision'; renderLesson(); box.scrollTop = 0; } }, 'Empezar la misión →')));
  } else if (S.sub === 'cmds') {
    c.append(h('p', {}, 'Haz clic en un comando para copiarlo a la terminal.'));
    const t = h('div', { class: 'cmdtable' });
    it.cmds.forEach(([cmd, d]) => { const code = h('code', { title: 'Insertar en la terminal', onclick: () => insertCmd(cmd.replace(/&gt;/g, '>').replace(/&lt;/g, '<')) }); code.innerHTML = cmd; t.append(h('div', { class: 'cmdrow' }, code, h('span', { html: d }))); });
    c.append(t);
  } else renderMission(c);
}
function renderMission(c) {
  const it = S.item, isReto = S.tab === 'retos';
  c.append(h('div', { class: 'mission' }));
  const m = c.lastChild;
  if (isReto) m.append(h('div', { class: 'brief', html: it.body }));
  else m.append(h('p', {}, 'Escribe los comandos en la terminal. Cada paso se marca solo cuando lo logras.'));
  const cur = S.done.findIndex(d => !d);
  const ul = h('ul', { class: 'tasks' });
  it.tasks.forEach((t, i) => {
    const li = h('li', { class: 'task' + (S.done[i] ? ' done' : '') + (!isReto && i === cur ? ' cur' : '') }, h('span', { class: 'chk' }));
    const body = h('div', {}); body.append(h('div', { class: 'tt', html: t.t }));
    if (!isReto && i === cur) {
      const hint = h('div', { class: 'hint' });
      if (t.hint) hint.append(h('span', { html: t.hint }));
      else hint.append(h('span', {}, 'Escribe:'));
      (t.sol || []).forEach(cmd => hint.append(h('button', { class: 'chip', title: 'Insertar en la terminal', onclick: () => insertCmd(cmd.replace(/\\\\n/g, '\\n')) }, cmd)));
      body.append(hint);
    }
    li.append(body); ul.append(li);
  });
  m.append(ul);
  if (isReto) {
    const acts = h('div', { class: 'mission-actions' });
    acts.append(h('button', { class: 'btn ghost sm', onclick: () => { S.hintShown[it.id] = !S.hintShown[it.id]; renderLesson(); } }, S.hintShown[it.id] ? 'Ocultar pista' : 'Dame una pista'));
    acts.append(h('button', { class: 'btn ghost sm', onclick: () => { S.solShown[it.id] = !S.solShown[it.id]; renderLesson(); } }, S.solShown[it.id] ? 'Ocultar solución' : 'Ver solución'));
    m.append(acts);
    if (S.hintShown[it.id]) m.append(h('div', { class: 'hintbox' }, it.hintText));
    if (S.solShown[it.id]) { const b = h('div', { class: 'hintbox' }, h('b', {}, 'Una posible solución (clic para insertar):'), h('div', { class: 'hint' }, it.solAll.map(cmd => h('button', { class: 'chip', onclick: () => insertCmd(cmd.replace(/\\\\n/g, '\\n')) }, cmd)))); m.append(b); }
  }
  if (S.done.every(Boolean) && S.done.length) {
    const idx = (isReto ? RETOS : LESSONS).indexOf(it), next = (isReto ? RETOS : LESSONS)[idx + 1];
    const win = h('div', { class: 'win' }, h('h4', {}, isReto ? '¡Reto superado!' : '¡Lección completada!'), h('p', {}, isReto ? 'Resolviste el problema con tus propias manos. Eso es lo que cuenta.' : 'Todos los pasos hechos. Sigue con la siguiente cuando quieras.'));
    const acts = h('div', { class: 'mission-actions' });
    if (next) acts.append(h('button', { class: 'btn', onclick: () => openItem(next) }, 'Siguiente: ' + next.title + ' →'));
    else if (!isReto) acts.append(h('button', { class: 'btn', onclick: () => showTab('retos') }, 'Ahora, ¡a los retos! →'));
    else acts.append(h('button', { class: 'btn', onclick: () => showTab('quiz') }, 'Prueba el quiz final →'));
    acts.append(h('button', { class: 'btn ghost', onclick: () => { resetEnv('Escenario reiniciado.'); renderLesson(); } }, '↺ Repetir'));
    win.append(acts); m.append(win);
  } else {
    m.append(h('div', { class: 'mission-actions' }, h('button', { class: 'btn ghost sm', onclick: () => { resetEnv('Escenario reiniciado.'); renderLesson(); } }, '↺ Reiniciar escenario')));
  }
}
function evaluate() {
  const it = S.item; if (!it || !S.st || S.tab === 'lab') return;
  const ctx = mkCtx(S.st), isReto = S.tab === 'retos';
  let changed = false;
  const prevDone = S.done.slice();
  it.tasks.forEach((t, i) => {
    let ok = false;
    try { ok = !!t.check(ctx); } catch (e) { ok = false; }
    if (isReto) { if (S.done[i] !== (ok && S.st.history.length > 0)) { S.done[i] = ok && S.st.history.length > 0; changed = true; } }
    else if (!S.done[i] && ok) { S.done[i] = true; changed = true; }
  });
  if (!changed) return;
  const all = S.done.every(Boolean);
  if (all && !S.won) {
    S.won = true;
    const p = isReto ? progress.retos : progress.lessons; p[it.id] = true; saveProgress(); renderProg(); renderSide();
    termLine([['★ ' + (isReto ? 'Reto superado' : 'Lección completada') + '. Mira el panel de la izquierda.', 'g']]);
    toast(isReto ? '¡Reto superado!' : '¡Lección completada!');
  } else if (!all) S.won = false;
  else if (prevDone.some(Boolean) && S.sub === 'mision') { /* ya ganó */ }
  if (S.sub === 'mision') { const keep = $('#lesson .lcontent') ? $('#lesson .lcontent').scrollTop : 0; renderLesson(); const c2 = $('#lesson .lcontent'); if (c2) c2.scrollTop = keep; }
  else { const b = $('.subtabs .cnt'); if (b) b.textContent = S.done.filter(Boolean).length + '/' + S.done.length; }
}

/* ───────── laboratorio libre ───────── */
const L = id => LESSONS.find(l => l.id === id).setup;
const LAB = [
  ['vacio', 'Entorno vacío', [...L('terminal'), 'git config --global user.name "Ana Torres"', 'git config --global user.email "ana@kdnastudio.com"'], 'Partes de cero: carpeta personal y tu identidad ya configurada.'],
  ['historial', 'Proyecto con historial', L('ramas'), 'Un repo "sitio" con 2 commits. Ideal para ramas, diff y reset.'],
  ['remoto', 'Proyecto conectado a GitHub', L('pr'), 'Repo "tienda" ya subido a GitHub. Practica push, pull, ramas y PR.'],
  ['conflicto', 'Listo para un conflicto', L('conflictos'), 'Repo "sitio" subido a GitHub. Provoca un conflicto con colega editar.'],
  ['clon', 'Clonar un repo ajeno', L('colaborar'), 'Tienes identidad configurada; clona demo-web de GitHub.']
];
function openLab(id) {
  const sc = LAB.find(x => x[0] === id) || LAB[0];
  S.scenario = sc[0]; S.item = { id: 'lab', tasks: [], setup: sc[2] }; S.setup = sc[2];
  resetEnv('Laboratorio libre: ' + sc[1] + '.');
  const box = $('#lesson'); box.innerHTML = '';
  box.append(h('div', { class: 'lhead' }, h('span', { class: 'pill' }, 'Sin guion'), h('h2', {}, 'Laboratorio libre'), h('p', {}, 'Experimenta sin misiones. Equivocarte aquí no cuesta nada: reinicia cuando quieras.')));
  const c = h('div', { class: 'lcontent' }); box.append(c);
  c.append(h('h4', {}, 'Elige un escenario'));
  const sc2 = h('div', { class: 'lab-sc' });
  LAB.forEach(x => sc2.append(h('button', { class: 'btn sm' + (x[0] === S.scenario ? '' : ' ghost'), onclick: () => openLab(x[0]) }, x[1])));
  c.append(sc2, h('p', {}, sc[3]));
  c.append(h('h4', {}, 'Ideas para probar'), h('ul', { class: 'list', html: '<li>Crea una rama, haz commits y fusiónala con <code>git merge</code>.</li><li>Rompe algo a propósito y usa <code>git restore</code> o <code>git reset</code>.</li><li>Haz push, luego <code>colega push</code> y trae lo nuevo con <code>git pull</code>.</li><li>Provoca un conflicto: edita un archivo y luego <code>colega editar archivo "texto"</code>.</li><li>Mira cómo se mueven los archivos entre las 4 zonas debajo de la terminal.</li>' }));
  c.append(h('h4', {}, 'Comandos del simulador'), h('div', { class: 'cmdtable' },
    [['colega push', 'Marta (tu colega) sube un cambio a GitHub.'], ['colega editar archivo "texto"', 'Marta reescribe un archivo y lo sube (para crear conflictos).'], ['github pr-merge rama', 'Simula el botón "Merge pull request".'], ['nano archivo', 'Editor de texto en ventana.'], ['help', 'Lista de comandos.']].map(([cmd, d]) => h('div', { class: 'cmdrow' }, h('code', { onclick: () => insertCmd(cmd) }, cmd), h('span', {}, d)))));
  renderSide(); setPane('lesson');
}

/* ───────── chuleta ───────── */
function renderCheat() {
  const p = $('#page'); p.innerHTML = '';
  p.append(h('h2', {}, 'Chuleta de comandos'), h('p', { class: 'lead' }, 'Todo lo del curso en una sola página. Haz clic en cualquier comando para copiarlo.'));
  const inp = h('input', { class: 'search', type: 'search', placeholder: 'Buscar (ej: rama, push, deshacer)…', 'aria-label': 'Buscar comando' });
  const grid = h('div', { class: 'cheat-grid' });
  const draw = () => {
    const q = inp.value.trim().toLowerCase(); grid.innerHTML = '';
    CHEAT.forEach(g => {
      const items = g.items.filter(([c, d]) => !q || (c + ' ' + d + ' ' + g.g).toLowerCase().includes(q));
      if (!items.length) return;
      const card = h('div', { class: 'card' }, h('h3', {}, g.g));
      items.forEach(([c, d]) => card.append(h('div', { class: 'crow' }, h('button', { title: 'Copiar', onclick: () => copy(c) }, c), h('span', {}, d))));
      grid.append(card);
    });
    if (!grid.children.length) grid.append(h('p', { class: 'lead' }, 'Nada coincide con tu búsqueda.'));
  };
  inp.addEventListener('input', draw); draw();
  p.append(inp, grid);
}
function copy(t) {
  const done = () => toast('Copiado: ' + t);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done); else done();
}

/* ───────── quiz ───────── */
function renderQuiz() {
  const p = $('#page'); p.innerHTML = '';
  const state = { i: 0, score: 0, answered: false };
  const box = h('div', { class: 'quiz' });
  p.append(h('h2', {}, 'Quiz final'), h('p', { class: 'lead' }, QUIZ.length + ' preguntas para comprobar lo que aprendiste. Mejor puntuación: ' + (progress.quiz || 0) + '/' + QUIZ.length + '.'), box);
  const draw = () => {
    box.innerHTML = '';
    if (state.i >= QUIZ.length) {
      if (state.score > (progress.quiz || 0)) { progress.quiz = state.score; saveProgress(); }
      const pct = Math.round(state.score / QUIZ.length * 100);
      box.append(h('div', { class: 'score' }, state.score + '/' + QUIZ.length), h('p', {}, pct >= 80 ? '¡Excelente! Ya manejas el flujo de Git. Ve por los retos que no hayas hecho.' : pct >= 50 ? 'Vas bien. Repasa las lecciones donde fallaste y vuelve a intentarlo.' : 'Normal al principio. Haz las lecciones con calma y reintenta.'), h('button', { class: 'btn', onclick: () => { state.i = 0; state.score = 0; draw(); } }, 'Reintentar'));
      return;
    }
    const q = QUIZ[state.i]; state.answered = false;
    box.append(h('div', { class: 'qbar' }, h('i', { style: 'width:' + (state.i / QUIZ.length * 100) + '%' })), h('div', { class: 'dim', style: 'font-size:13px;margin-bottom:6px' }, 'Pregunta ' + (state.i + 1) + ' de ' + QUIZ.length), h('div', { class: 'qq' }, q.q));
    const opts = h('div', { class: 'qopts' }); box.append(opts);
    const exp = h('div'); box.append(exp);
    q.o.forEach((o, k) => {
      const b = h('button', { class: 'qopt', onclick: () => {
        if (state.answered) return; state.answered = true;
        $$('.qopt', opts).forEach((x, j) => { x.disabled = true; if (j === q.a) x.classList.add('ok'); });
        if (k === q.a) state.score++; else b.classList.add('no');
        exp.append(h('div', { class: 'qexp' }, h('b', {}, k === q.a ? 'Correcto. ' : 'No exactamente. '), q.e), h('div', { class: 'mission-actions' }, h('button', { class: 'btn', onclick: () => { state.i++; draw(); } }, state.i === QUIZ.length - 1 ? 'Ver resultado' : 'Siguiente →')));
      } }, o);
      opts.append(b);
    });
  };
  draw();
}

/* ───────── toast ───────── */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1800);
}

/* ───────── arranque ───────── */
function init() {
  S.explain = store.get('gfl_explain', true); $('#explainSw').checked = S.explain;
  bindTerminal(); bindEditor();
  $$('#seg button').forEach(b => b.addEventListener('click', () => setPane(b.dataset.pane)));
  renderProg();
  const first = LESSONS.find(l => !progress.lessons[l.id]) || LESSONS[0];
  S.item = first; showTab('learn');
}
init();
})();
