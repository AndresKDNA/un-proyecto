/* engine.js — Simulador de terminal + sistema de archivos virtual + Git + GitHub simulado.
   Sin dependencias: corre en el navegador y en Node (para pruebas). */
(function (root) {
'use strict';

const HOME = '/home/dev';
const dict = () => Object.create(null);
const short = id => id.slice(0, 7);
const plural = (n, s, p) => n + ' ' + (n === 1 ? s : p);

/* ───────────── utilidades ───────────── */
function hash(s) {
  let h1 = 0xdeadbeef ^ s.length, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}
function sha(seed) { const a = hash(seed), b = hash(a + seed), c = hash(b + a); return (a + b + c).slice(0, 40); }
const sl = s => (s == null || s === '') ? [] : s.replace(/\n$/, '').split('\n');
const jl = a => a.length ? a.join('\n') + '\n' : '';

function lineDiff(a, b) {
  const n = a.length, m = b.length;
  const t = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  const ops = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ t: ' ', s: a[i] }); i++; j++; }
    else if (t[i + 1][j] >= t[i][j + 1]) ops.push({ t: '-', s: a[i++] });
    else ops.push({ t: '+', s: b[j++] });
  }
  while (i < n) ops.push({ t: '-', s: a[i++] });
  while (j < m) ops.push({ t: '+', s: b[j++] });
  return ops;
}

/* merge de 3 vías a nivel de líneas */
function changesOf(base, other) {
  const ops = lineDiff(base, other); let i = 0, cur = null; const out = [];
  for (const op of ops) {
    if (op.t === ' ') { if (cur) { out.push(cur); cur = null; } i++; }
    else if (op.t === '-') { if (!cur) cur = { s: i, e: i, lines: [] }; cur.e = i + 1; i++; }
    else { if (!cur) cur = { s: i, e: i, lines: [] }; cur.lines.push(op.s); }
  }
  if (cur) out.push(cur);
  return out;
}
function applyRange(base, s, e, list) {
  const lines = []; let p = s;
  for (const ch of list) { lines.push(...base.slice(p, ch.s), ...ch.lines); p = ch.e; }
  lines.push(...base.slice(p, e));
  return lines;
}
function merge3Lines(base, ours, theirs, label) {
  const A = changesOf(base, ours), B = changesOf(base, theirs);
  let ia = 0, ib = 0, pos = 0, conflict = false; const out = [];
  while (ia < A.length || ib < B.length) {
    const a = A[ia], b = B[ib];
    if (a && b && a.e >= b.s && b.e >= a.s) {
      let s = Math.min(a.s, b.s), e = Math.max(a.e, b.e), ja = ia + 1, jb = ib + 1;
      for (;;) {
        let ext = false;
        if (A[ja] && A[ja].s <= e) { e = Math.max(e, A[ja].e); ja++; ext = true; }
        if (B[jb] && B[jb].s <= e) { e = Math.max(e, B[jb].e); jb++; ext = true; }
        if (!ext) break;
      }
      out.push(...base.slice(pos, s));
      const mine = applyRange(base, s, e, A.slice(ia, ja)), their = applyRange(base, s, e, B.slice(ib, jb));
      if (mine.join('\n') === their.join('\n')) out.push(...mine);
      else { conflict = true; out.push('<<<<<<< HEAD', ...mine, '=======', ...their, '>>>>>>> ' + label); }
      pos = e; ia = ja; ib = jb;
    } else {
      const ch = (!b || (a && a.s <= b.s)) ? A[ia++] : B[ib++];
      out.push(...base.slice(pos, ch.s), ...ch.lines); pos = ch.e;
    }
  }
  out.push(...base.slice(pos));
  return { text: jl(out), conflict };
}
/* merge de árboles: devuelve {tree (limpio), work (con marcadores), conflicts[]} */
function merge3Trees(base, ours, theirs, label) {
  const tree = dict(), work = dict(), conflicts = [];
  const paths = new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)]);
  for (const p of paths) {
    const b = base[p], o = ours[p], t = theirs[p];
    let res, wres;
    if (o === t) res = o;
    else if (o === b) res = t;
    else if (t === b) res = o;
    else if (o === undefined || t === undefined) { res = o; wres = o !== undefined ? o : t; conflicts.push(p); }
    else {
      const m = merge3Lines(sl(b), sl(o), sl(t), label);
      if (m.conflict) { res = o; wres = m.text; conflicts.push(p); } else res = m.text;
    }
    if (res !== undefined) tree[p] = res;
    work[p] = wres !== undefined ? wres : res;
  }
  return { tree, work, conflicts };
}

/* ───────────── rutas y sistema de archivos virtual ───────────── */
function normPath(cwd, p) {
  if (!p || p === '~') p = HOME; else if (p.startsWith('~/')) p = HOME + p.slice(1);
  const parts = (p.startsWith('/') ? p : cwd + '/' + p).split('/'), out = [];
  for (const s of parts) { if (!s || s === '.') continue; if (s === '..') out.pop(); else out.push(s); }
  return '/' + out.join('/');
}
function getNode(st, path) {
  let n = st.fs;
  if (path === '/') return n;
  for (const s of path.split('/').slice(1)) {
    if (!n || n.type !== 'dir' || !(s in n.children)) return null;
    n = n.children[s];
  }
  return n;
}
function splitPath(path) { const i = path.lastIndexOf('/'); return [i === 0 ? '/' : path.slice(0, i), path.slice(i + 1)]; }
function mkdirp(st, path) {
  let n = st.fs;
  for (const s of path.split('/').slice(1)) {
    if (!(s in n.children)) n.children[s] = { type: 'dir', children: dict() };
    n = n.children[s];
    if (n.type !== 'dir') return null;
  }
  return n;
}
function writeFile(st, path, content) {
  const [d, name] = splitPath(path), dn = getNode(st, d);
  if (!dn || dn.type !== 'dir') return false;
  if (dn.children[name] && dn.children[name].type === 'dir') return false;
  dn.children[name] = { type: 'file', content };
  return true;
}
function removeNode(st, path) {
  const [d, name] = splitPath(path), dn = getNode(st, d);
  if (dn && dn.type === 'dir') delete dn.children[name];
}
function cat(st, path) { const n = getNode(st, path); return n && n.type === 'file' ? n.content : null; }
function fixCwd(st) { while (st.cwd !== '/' && !getNode(st, st.cwd)) st.cwd = splitPath(st.cwd)[0]; }

/* ───────────── repositorios ───────────── */
function newRepo(branch) {
  return {
    head: { type: 'branch', name: branch }, branches: dict(), index: dict(),
    remotes: dict(), remoteRefs: dict(), upstream: dict(), config: dict(),
    stash: [], tags: dict(), merging: null
  };
}
function makeGitDir(repo) {
  return {
    type: 'dir', repo, children: Object.assign(dict(), {
      HEAD: { type: 'file', content: 'ref: refs/heads/' + repo.head.name + '\n' },
      config: { type: 'file', content: '[core]\n\trepositoryformatversion = 0\n\tbare = false\n' },
      objects: { type: 'dir', children: dict() },
      refs: { type: 'dir', children: dict() }
    })
  };
}
function syncGitDir(R) {
  const h = R.node.children['.git'].children.HEAD;
  h.content = R.repo.head.type === 'branch' ? 'ref: refs/heads/' + R.repo.head.name + '\n' : R.repo.head.id + '\n';
}
function repoRoot(st, path) {
  let p = path;
  for (;;) {
    const n = getNode(st, p);
    if (n && n.type === 'dir' && n.children['.git'] && n.children['.git'].repo) return p;
    if (p === '/') return null;
    p = splitPath(p)[0];
  }
}
function getRepo(st, path) {
  const r = repoRoot(st, path); if (!r) return null;
  const node = getNode(st, r);
  return { root: r, node, repo: node.children['.git'].repo };
}
const headId = repo => repo.head.type === 'branch' ? (repo.branches[repo.head.name] || null) : repo.head.id;
const commitOf = (st, id) => st.world.objects[id];
const treeOf = (st, id) => id ? commitOf(st, id).tree : dict();
const headTree = (st, R) => treeOf(st, headId(R.repo));

function ancestors(st, id) {
  const set = new Set(); const q = id ? [id] : [];
  while (q.length) { const x = q.pop(); if (set.has(x)) continue; set.add(x); q.push(...commitOf(st, x).parents); }
  return set;
}
const isAncestor = (st, a, b) => ancestors(st, b).has(a);
function mergeBase(st, a, b) {
  const sa = ancestors(st, a); let best = null; const seen = new Set(); const q = [b];
  while (q.length) {
    const x = q.pop(); if (seen.has(x)) continue; seen.add(x);
    if (sa.has(x)) { if (!best || commitOf(st, x).seq > commitOf(st, best).seq) best = x; continue; }
    q.push(...commitOf(st, x).parents);
  }
  return best;
}
function createCommit(st, parents, tree, msg, author, time) {
  const w = st.world, seq = ++w.seq;
  const id = sha(msg + parents.join() + seq + JSON.stringify(tree));
  w.objects[id] = { id, parents, tree: Object.assign(dict(), tree), msg, author, time: time || Date.now(), seq };
  return id;
}

/* archivos de trabajo */
function workingFiles(st, rootPath) {
  const out = dict();
  (function walk(path, rel) {
    const n = getNode(st, path);
    for (const name of Object.keys(n.children).sort()) {
      if (name === '.git' && rel === '') continue;
      const c = n.children[name], r = rel ? rel + '/' + name : name;
      if (c.type === 'dir') walk(path + '/' + name, r); else out[r] = c.content;
    }
  })(rootPath, '');
  return out;
}
function writeWork(st, rootPath, rel, content) { const p = rootPath + '/' + rel; mkdirp(st, splitPath(p)[0]); writeFile(st, p, content); }
function removeWork(st, rootPath, rel) {
  removeNode(st, rootPath + '/' + rel);
  let d = splitPath(rootPath + '/' + rel)[0];
  while (d !== rootPath && d.length > rootPath.length) {
    const n = getNode(st, d);
    if (n && n.type === 'dir' && Object.keys(n.children).length === 0) { removeNode(st, d); d = splitPath(d)[0]; } else break;
  }
}

/* .gitignore */
function globRe(g) {
  let s = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') { if (g[i + 1] === '*') { s += '.*'; i++; } else s += '[^/]*'; }
    else if (c === '?') s += '[^/]';
    else s += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + s + '$');
}
function parseIgnore(text) {
  return (text || '').split('\n').map(l => l.replace(/\r$/, '').trim()).filter(l => l && !l.startsWith('#')).map(l => {
    let neg = false, dirOnly = false;
    if (l.startsWith('!')) { neg = true; l = l.slice(1); }
    if (l.endsWith('/')) { dirOnly = true; l = l.slice(0, -1); }
    const anchored = l.includes('/');
    if (l.startsWith('/')) l = l.slice(1);
    return { neg, dirOnly, anchored, re: globRe(l) };
  });
}
function isIgnored(rules, rel) {
  const segs = rel.split('/');
  for (let i = 0; i < segs.length; i++) {
    const isDir = i < segs.length - 1, cand = segs.slice(0, i + 1).join('/');
    let ign = false;
    for (const r of rules) {
      if (r.dirOnly && !isDir) continue;
      if (r.re.test(r.anchored ? cand : segs[i])) ign = !r.neg;
    }
    if (ign) return true;
  }
  return false;
}
const ignoreRules = (st, R) => parseIgnore(cat(st, R.root + '/.gitignore'));

/* estado del repo */
function statusInfo(st, R) {
  const head = headTree(st, R), idx = R.repo.index, work = workingFiles(st, R.root), rules = ignoreRules(st, R);
  const conflicts = R.repo.merging ? R.repo.merging.conflicts.slice() : [];
  const staged = [], unstaged = [], untrackedFiles = [];
  for (const p of Object.keys(idx).sort()) {
    if (conflicts.includes(p)) continue;
    if (!(p in head)) staged.push({ path: p, kind: 'new file' });
    else if (head[p] !== idx[p]) staged.push({ path: p, kind: 'modified' });
  }
  for (const p of Object.keys(head).sort()) if (!(p in idx)) staged.push({ path: p, kind: 'deleted' });
  for (const p of Object.keys(idx).sort()) {
    if (conflicts.includes(p)) continue;
    if (!(p in work)) unstaged.push({ path: p, kind: 'deleted' });
    else if (work[p] !== idx[p]) unstaged.push({ path: p, kind: 'modified' });
  }
  for (const p of Object.keys(work).sort()) if (!(p in idx) && !isIgnored(rules, p)) untrackedFiles.push(p);
  const untracked = [];
  for (const p of untrackedFiles) {
    const i = p.indexOf('/'); let shown = p;
    if (i > 0) { const d = p.slice(0, i); if (!Object.keys(idx).some(x => x.startsWith(d + '/'))) shown = d + '/'; }
    if (!untracked.includes(shown)) untracked.push(shown);
  }
  return { staged, unstaged, untracked, untrackedFiles, conflicts, work, head, idx, rules };
}
function trackingInfo(st, R) {
  const repo = R.repo; if (repo.head.type !== 'branch') return null;
  const up = repo.upstream[repo.head.name]; if (!up) return null;
  const refName = up.remote + '/' + up.branch, ref = repo.remoteRefs[refName];
  if (!ref) return null;
  const local = headId(repo);
  const aL = local ? ancestors(st, local) : new Set(), aR = ancestors(st, ref);
  let ahead = 0, behind = 0;
  for (const x of aL) if (!aR.has(x)) ahead++;
  for (const x of aR) if (!aL.has(x)) behind++;
  return { refName, ahead, behind };
}

/* ───────────── salida de terminal ───────────── */
class Out {
  constructor() { this.lines = []; }
  p(text, cls) { String(text === undefined ? '' : text).split('\n').forEach(t => this.lines.push({ segs: [{ t, c: cls || '' }] })); return this; }
  segs(arr) { this.lines.push({ segs: arr.map(([t, c]) => ({ t, c: c || '' })) }); return this; }
  text() { return this.lines.map(l => l.segs.map(s => s.t).join('')).join('\n'); }
}

/* ───────────── mundo remoto (GitHub simulado) ───────────── */
const normUrl = u => u.replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '').replace(/\/$/, '').toLowerCase();
const validUrl = u => /^(https?:\/\/[\w.-]+\/[\w.-]+\/[\w.-]+|git@[\w.-]+:[\w.-]+\/[\w.-]+)(\.git)?\/?$/.test(u);
function getRemoteRepo(st, url) { return st.world.remotes[normUrl(url)] || null; }
function ensureRemoteRepo(st, url) {
  if (!validUrl(url)) return null;
  const k = normUrl(url);
  if (!st.world.remotes[k]) st.world.remotes[k] = { url, branches: dict(), tags: dict() };
  return st.world.remotes[k];
}
function seedWorld(st) {
  const A = { name: 'Equipo Kdna', email: 'equipo@kdnastudio.com' };
  const t1 = Object.assign(dict(), { 'README.md': '# Demo Web\n\nProyecto de ejemplo para practicar Git.\n' });
  const t2 = Object.assign(dict(), t1, { 'index.html': '<h1>Demo Web</h1>\n' });
  const t3 = Object.assign(dict(), t2, { 'style.css': 'h1 { color: teal; }\n' });
  const c1 = createCommit(st, [], t1, 'Primer commit: README', A, Date.UTC(2026, 8, 18, 15, 0, 0));
  const c2 = createCommit(st, [c1], t2, 'Agrega index.html', A, Date.UTC(2026, 8, 19, 15, 0, 0));
  const c3 = createCommit(st, [c2], t3, 'Agrega estilos', A, Date.UTC(2026, 8, 20, 15, 0, 0));
  const r = ensureRemoteRepo(st, 'https://github.com/kdnastudio/demo-web.git');
  r.branches.main = c3;
}

/* ───────────── estado global ───────────── */
function newState() {
  const st = {
    fs: { type: 'dir', children: Object.assign(dict(), { home: { type: 'dir', children: Object.assign(dict(), { dev: { type: 'dir', children: dict() } }) } }) },
    cwd: HOME, globalConfig: dict(), world: { objects: dict(), remotes: dict(), seq: 0 },
    history: [], lastRepoRoot: null, cmdHistory: []
  };
  seedWorld(st);
  return st;
}

/* ───────────── helpers de git ───────────── */
function needRepo(c) {
  const R = getRepo(c.st, c.st.cwd);
  if (!R) { c.out.p('fatal: not a git repository (or any of the parent directories): .git', 'r'); return null; }
  c.st.lastRepoRoot = R.root;
  return R;
}
const cfgGet = (c, R, key) => (R && R.repo.config[key]) || c.st.globalConfig[key];
function relOf(c, R, arg) {
  const abs = normPath(c.st.cwd, arg);
  if (abs === R.root) return '';
  if (abs.startsWith(R.root + '/')) return abs.slice(R.root.length + 1);
  c.out.p(`fatal: ${arg}: '${arg}' is outside repository at '${R.root}'`, 'r');
  return null;
}
const matchSpec = (rel, p) => rel === '' || p === rel || p.startsWith(rel + '/');

function checkoutTree(c, R, newTree, oldTree, force) {
  const st = c.st, idx = R.repo.index, work = workingFiles(st, R.root);
  const union = new Set([...Object.keys(oldTree), ...Object.keys(newTree)]);
  if (!force) {
    const block = [];
    for (const p of union) if (oldTree[p] !== newTree[p]) {
      if (idx[p] !== oldTree[p] || work[p] !== oldTree[p]) block.push(p);
    }
    if (block.length) return block;
  }
  const newIdx = dict();
  for (const p of Object.keys(newTree)) newIdx[p] = (!force && oldTree[p] === newTree[p] && p in idx) ? idx[p] : newTree[p];
  if (!force) for (const p of Object.keys(idx)) if (!(p in newTree) && !(p in oldTree)) newIdx[p] = idx[p];
  for (const p of union) {
    if (force || oldTree[p] !== newTree[p]) {
      if (p in newTree) writeWork(st, R.root, p, newTree[p]); else if (p in work) removeWork(st, R.root, p);
    }
  }
  R.repo.index = newIdx;
  return null;
}
function diffStat(o, n) {
  const paths = [...new Set([...Object.keys(o), ...Object.keys(n)])].sort();
  let files = 0, ins = 0, del = 0; const lines = [], modes = [];
  for (const p of paths) {
    if (o[p] === n[p]) continue;
    files++;
    const ops = lineDiff(sl(o[p]), sl(n[p]));
    const a = ops.filter(x => x.t === '+').length, d = ops.filter(x => x.t === '-').length;
    ins += a; del += d;
    lines.push(` ${p} | ${a + d} ${'+'.repeat(Math.min(a, 20))}${'-'.repeat(Math.min(d, 20))}`);
    if (o[p] === undefined) modes.push(` create mode 100644 ${p}`);
    else if (n[p] === undefined) modes.push(` delete mode 100644 ${p}`);
  }
  const summary = files ? ` ${plural(files, 'file', 'files')} changed` + (ins ? `, ${plural(ins, 'insertion', 'insertions')}(+)` : '') + (del ? `, ${plural(del, 'deletion', 'deletions')}(-)` : '') : '';
  return { lines, modes, summary, files };
}
function printStat(out, o, n, withLines) {
  const s = diffStat(o, n);
  if (withLines) s.lines.forEach(l => out.p(l));
  if (s.summary) out.p(s.summary);
  s.modes.forEach(l => out.p(l));
}
function printDiff(out, pairs) {
  for (const [p, o, n] of pairs) {
    if (o === n) continue;
    const h = s => hash(s || '').slice(0, 7);
    out.p(`diff --git a/${p} b/${p}`, 'b');
    if (o === undefined) out.p('new file mode 100644', 'b'); else if (n === undefined) out.p('deleted file mode 100644', 'b');
    out.p(`index ${h(o)}..${h(n)}${o !== undefined && n !== undefined ? ' 100644' : ''}`, 'b');
    out.p('--- ' + (o === undefined ? '/dev/null' : 'a/' + p), 'b');
    out.p('+++ ' + (n === undefined ? '/dev/null' : 'b/' + p), 'b');
    const a = sl(o), b = sl(n);
    out.p(`@@ -${a.length ? '1,' + a.length : '0,0'} +${b.length ? '1,' + b.length : '0,0'} @@`, 'c');
    for (const op of lineDiff(a, b)) out.p(op.t + op.s, op.t === '+' ? 'g' : op.t === '-' ? 'r' : '');
  }
}
function treePairs(o, n, filter) {
  return [...new Set([...Object.keys(o), ...Object.keys(n)])].sort().filter(p => !filter || filter(p)).map(p => [p, o[p], n[p]]);
}

/* revisiones: HEAD, HEAD~2, HEAD^, rama, origin/rama, etiqueta, hash */
function parseRev(c, R, s) {
  const st = c.st, repo = R.repo; let m, base = s, steps = 0;
  if ((m = s.match(/^(.*?)(?:~(\d+)|(\^+))$/))) { base = m[1]; steps = m[2] !== undefined ? +m[2] : m[3].length; }
  let id = null;
  if (base === 'HEAD' || base === '@') id = headId(repo);
  else if (repo.branches[base]) id = repo.branches[base];
  else if (repo.remoteRefs[base]) id = repo.remoteRefs[base];
  else if (repo.tags[base]) id = repo.tags[base];
  else if (/^[0-9a-f]{4,40}$/.test(base)) { const hits = Object.keys(st.world.objects).filter(k => k.startsWith(base)); if (hits.length === 1) id = hits[0]; }
  if (!id) return null;
  for (let i = 0; i < steps; i++) { const cm = commitOf(st, id); if (!cm.parents.length) return null; id = cm.parents[0]; }
  return id;
}
function badRev(c, s) { c.out.p(`fatal: ambiguous argument '${s}': unknown revision or path not in the working tree.`, 'r'); return false; }

function authorOf(c, R) { return { name: cfgGet(c, R, 'user.name'), email: cfgGet(c, R, 'user.email') }; }
function needIdentity(c, R) {
  if (cfgGet(c, R, 'user.name') && cfgGet(c, R, 'user.email')) return true;
  c.out.p('Author identity unknown\n\n*** Please tell me who you are.\n\nRun\n\n  git config --global user.email "you@example.com"\n  git config --global user.name "Your Name"\n\nto set your account\'s default identity.\n\nfatal: unable to auto-detect email address', 'r');
  return false;
}
function setHeadCommit(R, id) {
  if (R.repo.head.type === 'branch') R.repo.branches[R.repo.head.name] = id; else R.repo.head.id = id;
}
function tzStr(d) { const o = -d.getTimezoneOffset(), s = o >= 0 ? '+' : '-', a = Math.abs(o); return s + String(Math.floor(a / 60)).padStart(2, '0') + String(a % 60).padStart(2, '0'); }
function dateStr(t) {
  const d = new Date(t), D = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], z = n => String(n).padStart(2, '0');
  return `${D[d.getDay()]} ${M[d.getMonth()]} ${d.getDate()} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())} ${d.getFullYear()} ${tzStr(d)}`;
}
function decorations(st, R) {
  const repo = R.repo, map = {}; const add = (id, l) => { if (id) (map[id] = map[id] || []).push(l); };
  const hid = headId(repo);
  if (repo.head.type === 'branch') { if (hid) add(hid, 'HEAD -> ' + repo.head.name); } else add(hid, 'HEAD');
  for (const b of Object.keys(repo.branches)) if (!(repo.head.type === 'branch' && repo.head.name === b)) add(repo.branches[b], b);
  for (const r of Object.keys(repo.remoteRefs)) add(repo.remoteRefs[r], r);
  for (const t of Object.keys(repo.tags)) add(repo.tags[t], 'tag: ' + t);
  return map;
}
function pathArgs(args) { const i = args.indexOf('--'); return i >= 0 ? args.slice(i + 1) : args.filter(a => !a.startsWith('-')); }

/* ───────────── comandos git ───────────── */
const GIT = {};

GIT.init = (c, args) => {
  let branch = 'main', target = c.st.cwd;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-b' || a === '--initial-branch') branch = args[++i] || 'main';
    else if (a.startsWith('--initial-branch=')) branch = a.split('=')[1];
    else if (!a.startsWith('-')) target = normPath(c.st.cwd, a);
  }
  if (c.st.globalConfig['init.defaultbranch'] && !args.some(a => a.startsWith('-b') || a.startsWith('--initial'))) branch = c.st.globalConfig['init.defaultbranch'];
  const node = mkdirp(c.st, target);
  if (!node || node.type !== 'dir') { c.out.p('fatal: cannot mkdir ' + target, 'r'); return false; }
  if (node.children['.git']) { c.out.p(`Reinitialized existing Git repository in ${target}/.git/`); return true; }
  node.children['.git'] = makeGitDir(newRepo(branch));
  c.st.lastRepoRoot = target;
  c.out.p(`Initialized empty Git repository in ${target}/.git/`);
  return true;
};

GIT.config = (c, args) => {
  const R = getRepo(c.st, c.st.cwd);
  const global = args.includes('--global') || args.includes('--system');
  const rest = args.filter(a => !a.startsWith('--') && a !== '-l');
  if (args.includes('--list') || args.includes('-l')) {
    const merged = Object.assign(dict(), c.st.globalConfig, R ? R.repo.config : {});
    Object.keys(merged).forEach(k => c.out.p(k + '=' + merged[k]));
    return true;
  }
  if (args.includes('--unset')) { delete (global || !R ? c.st.globalConfig : R.repo.config)[rest[0].toLowerCase()]; return true; }
  if (rest.length === 1) {
    const v = cfgGet(c, R, rest[0].toLowerCase());
    if (v === undefined) return false;
    c.out.p(v); return true;
  }
  if (rest.length >= 2) {
    if (!global && !R) { c.out.p('fatal: not in a git directory', 'r'); return false; }
    (global ? c.st.globalConfig : R.repo.config)[rest[0].toLowerCase()] = rest.slice(1).join(' ');
    return true;
  }
  c.out.p('usage: git config [--global] <nombre> [<valor>]', 'r'); return false;
};

GIT.add = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const specs = args.filter(a => !a.startsWith('-') || a === '-');
  const all = args.includes('-A') || args.includes('--all'), force = args.includes('-f') || args.includes('--force'), upd = args.includes('-u') || args.includes('--update');
  if (!specs.length && !all && !upd) { c.out.p('Nothing specified, nothing added.\nhint: Maybe you wanted to say \'git add .\'?', 'y'); return true; }
  const info = statusInfo(c.st, R), idx = R.repo.index, work = info.work;
  const rels = all ? [''] : upd && !specs.length ? [''] : [];
  for (const s of specs) { const r = relOf(c, R, s); if (r === null) return false; rels.push(r); }
  const ignoredHit = [];
  for (const rel of rels) {
    const files = Object.keys(work).filter(p => matchSpec(rel, p));
    const tracked = Object.keys(idx).filter(p => matchSpec(rel, p));
    if (!files.length && !tracked.length) { c.out.p(`fatal: pathspec '${args.filter(a => !a.startsWith('-'))[rels.indexOf(rel)] || '.'}' did not match any files`, 'r'); return false; }
    for (const p of files) {
      if (!(p in idx) && isIgnored(info.rules, p)) { if (rel !== '' && p === rel || (rel !== '' && !force && files.length)) ignoredHit.push(p); if (!force) continue; }
      if (upd && !(p in idx)) continue;
      idx[p] = work[p];
      if (R.repo.merging) R.repo.merging.conflicts = R.repo.merging.conflicts.filter(x => x !== p);
    }
    for (const p of tracked) if (!(p in work)) delete idx[p];
  }
  if (ignoredHit.length) {
    c.out.p('The following paths are ignored by one of your .gitignore files:\n' + [...new Set(ignoredHit)].join('\n') + '\nhint: Use -f if you really want to add them.', 'y');
    return false;
  }
  return true;
};

GIT.rm = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const cached = args.includes('--cached'), force = args.includes('-f') || args.includes('--force');
  const specs = args.filter(a => !a.startsWith('-')); const info = statusInfo(c.st, R), idx = R.repo.index;
  for (const s of specs) {
    const rel = relOf(c, R, s); if (rel === null) return false;
    const files = Object.keys(idx).filter(p => matchSpec(rel, p));
    if (!files.length) { c.out.p(`fatal: pathspec '${s}' did not match any files`, 'r'); return false; }
    for (const p of files) {
      if (!cached && !force && p in info.work && info.work[p] !== idx[p]) {
        c.out.p(`error: the following file has local modifications:\n    ${p}\n(use --cached to keep the file, or -f to force removal)`, 'r'); return false;
      }
      delete idx[p];
      if (!cached) removeWork(c.st, R.root, p);
      c.out.p(`rm '${p}'`);
    }
  }
  return true;
};

function printStatus(c, R, sm) {
  const o = c.out, st = c.st, repo = R.repo, info = statusInfo(st, R);
  const trk = trackingInfo(st, R);
  if (sm) {
    if (sm === 'b') {
      o.p('## ' + (repo.head.type === 'branch' ? repo.head.name : 'HEAD (no branch)') + (trk ? '...' + trk.refName + (trk.ahead || trk.behind ? ' [' + [trk.ahead ? 'ahead ' + trk.ahead : '', trk.behind ? 'behind ' + trk.behind : ''].filter(Boolean).join(', ') + ']' : '') : ''));
    }
    const map = dict();
    info.staged.forEach(s => { map[s.path] = [s.kind === 'new file' ? 'A' : s.kind === 'deleted' ? 'D' : 'M', ' ']; });
    info.unstaged.forEach(s => { const e = map[s.path] || [' ', ' ']; e[1] = s.kind === 'deleted' ? 'D' : 'M'; map[s.path] = e; });
    info.conflicts.forEach(p => { map[p] = ['U', 'U']; });
    Object.keys(map).sort().forEach(p => o.segs([[map[p][0], map[p][0] === ' ' ? '' : 'g'], [map[p][1], map[p][1] === ' ' ? '' : 'r'], [' ' + p, '']]));
    info.untracked.forEach(p => o.segs([['??', 'r'], [' ' + p, '']]));
    return;
  }
  o.p(repo.head.type === 'branch' ? 'On branch ' + repo.head.name : 'HEAD detached at ' + short(headId(repo) || ''));
  if (trk) {
    if (!trk.ahead && !trk.behind) o.p(`Your branch is up to date with '${trk.refName}'.`);
    else if (trk.ahead && !trk.behind) o.p(`Your branch is ahead of '${trk.refName}' by ${plural(trk.ahead, 'commit', 'commits')}.\n  (use "git push" to publish your local commits)`);
    else if (!trk.ahead && trk.behind) o.p(`Your branch is behind '${trk.refName}' by ${plural(trk.behind, 'commit', 'commits')}, and can be fast-forwarded.\n  (use "git pull" to update your local branch)`);
    else o.p(`Your branch and '${trk.refName}' have diverged,\nand have ${trk.ahead} and ${trk.behind} different commits each, respectively.\n  (use "git pull" if you want to integrate the remote branch with yours)`);
  }
  if (!headId(repo)) o.p('\nNo commits yet');
  if (info.conflicts.length) {
    o.p('\nYou have unmerged paths.\n  (fix conflicts and run "git commit")\n  (use "git merge --abort" to abort the merge)');
    o.p('\nUnmerged paths:\n  (use "git add <file>..." to mark resolution)');
    info.conflicts.forEach(p => o.p('\tboth modified:   ' + p, 'r'));
  }
  if (info.staged.length) {
    o.p('\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)');
    info.staged.forEach(s => o.p(`\t${(s.kind + ':').padEnd(12)} ${s.path}`, 'g'));
  }
  if (info.unstaged.length) {
    o.p('\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)');
    info.unstaged.forEach(s => o.p(`\t${(s.kind + ':').padEnd(12)} ${s.path}`, 'r'));
  }
  if (info.untracked.length) {
    o.p('\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)');
    info.untracked.forEach(p => o.p('\t' + p, 'r'));
  }
  if (!info.staged.length && !info.conflicts.length) {
    if (info.unstaged.length) o.p('\nno changes added to commit (use "git add" and/or "git commit -a")');
    else if (info.untracked.length) o.p('\nnothing added to commit but untracked files present (use "git add" to track)');
    else if (!headId(repo)) o.p('\nnothing to commit (create/copy files and use "git add" to track)');
    else o.p('\nnothing to commit, working tree clean');
  }
}
GIT.status = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const sflag = args.some(a => /^-[a-z]*s/.test(a) || a === '--short');
  printStatus(c, R, sflag ? (args.some(a => /^-[a-z]*b/.test(a)) ? 'b' : 's') : null);
  return true;
};

GIT.commit = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, repo = R.repo, o = c.out;
  const msgs = []; let all = false, amend = false, allowEmpty = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--amend') amend = true;
    else if (a === '--allow-empty') allowEmpty = true;
    else if (a === '--no-edit') { /* se acepta */ }
    else if (a === '--message') msgs.push(args[++i]);
    else if (a.startsWith('--message=')) msgs.push(a.slice(10));
    else if (a === '--all') all = true;
    else if (/^-[a-zA-Z]+$/.test(a)) {
      if (a.includes('a')) all = true;
      if (a.endsWith('m')) msgs.push(args[++i]);
    }
  }
  if (msgs.some(m => m === undefined)) { o.p('error: switch `m\' requires a value', 'r'); return false; }
  const info0 = statusInfo(st, R);
  if (info0.conflicts.length) { o.p('error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use \'git add/rm <file>\'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.', 'r'); return false; }
  if (all) {
    for (const p of Object.keys(repo.index)) { if (p in info0.work) repo.index[p] = info0.work[p]; else delete repo.index[p]; }
  }
  const tree = repo.index, head = headId(repo), headT = treeOf(st, head);
  const diff = diffStat(headT, tree);
  const merging = repo.merging;
  if (!diff.files && !amend && !allowEmpty && !merging) {
    const info = statusInfo(st, R);
    o.p(repo.head.type === 'branch' ? 'On branch ' + repo.head.name : 'HEAD detached');
    if (info.unstaged.length) { o.p('Changes not staged for commit:'); info.unstaged.forEach(s => o.p(`\t${s.kind}:   ${s.path}`, 'r')); o.p('\nno changes added to commit (use "git add" and/or "git commit -a")'); }
    else if (info.untracked.length) { o.p('Untracked files:'); info.untracked.forEach(p => o.p('\t' + p, 'r')); o.p('\nnothing added to commit but untracked files present (use "git add" to track)'); }
    else o.p('nothing to commit, working tree clean');
    return false;
  }
  if (!needIdentity(c, R)) return false;
  let msg = msgs.join('\n\n');
  if (!msg) {
    if (merging) msg = merging.message;
    else if (amend && head) msg = commitOf(st, head).msg;
    else { o.p('Aborting commit due to empty commit message.\nhint: usa  git commit -m "tu mensaje"  (en el simulador no hay editor).', 'r'); return false; }
  }
  const parents = amend && head ? commitOf(st, head).parents.slice() : merging ? [head, merging.theirs] : head ? [head] : [];
  const id = createCommit(st, parents, tree, msg, authorOf(c, R));
  setHeadCommit(R, id); repo.merging = null;
  const where = repo.head.type === 'branch' ? repo.head.name : 'detached HEAD';
  o.p(`[${where}${!parents.length ? ' (root-commit)' : ''} ${short(id)}] ${msg.split('\n')[0]}`);
  if (!merging) printStat(o, amend && head ? treeOf(st, parents[0] || null) : headT, tree, false);
  return true;
};

GIT.diff = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, staged = args.includes('--staged') || args.includes('--cached');
  const pos = args.filter(a => !a.startsWith('-')); const info = statusInfo(st, R);
  const revs = []; const paths = [];
  const di = args.indexOf('--'); const before = di >= 0 ? args.slice(0, di).filter(a => !a.startsWith('-')) : pos;
  if (di >= 0) args.slice(di + 1).forEach(p => paths.push(p));
  for (const a of before) {
    if (a.includes('..')) { const [x, y] = a.split('..'); revs.push(parseRev(c, R, x), parseRev(c, R, y)); continue; }
    const r = parseRev(c, R, a);
    if (r) revs.push(r); else { paths.push(a); }
  }
  if (revs.some(r => !r)) return badRev(c, before.join(' '));
  const specs = paths.map(p => relOf(c, R, p)); if (specs.includes(null)) return false;
  const filter = specs.length ? p => specs.some(s => matchSpec(s, p)) : null;
  let pairs;
  if (revs.length >= 2) pairs = treePairs(treeOf(st, revs[0]), treeOf(st, revs[1]), filter);
  else if (revs.length === 1) pairs = treePairs(treeOf(st, revs[0]), Object.assign(dict(), info.work), filter).filter(([p]) => p in info.idx || p in treeOf(st, revs[0]));
  else if (staged) pairs = treePairs(info.head, info.idx, filter);
  else pairs = treePairs(info.idx, info.work, filter).filter(([p]) => p in info.idx);
  printDiff(c.out, pairs);
  return true;
};

GIT.log = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, repo = R.repo, o = c.out;
  if (!headId(repo) && !args.includes('--all')) { o.p(`fatal: your current branch '${repo.head.name}' does not have any commits yet`, 'r'); return false; }
  const one = args.includes('--oneline') || args.includes('--pretty=oneline') || args.includes('--pretty=short') || args.includes('--format=oneline');
  let limit = Infinity;
  args.forEach((a, i) => { if (a === '-n') limit = +args[i + 1]; else if (/^-n\d+$/.test(a)) limit = +a.slice(2); else if (/^-\d+$/.test(a)) limit = +a.slice(1); });
  let starts = [];
  if (args.includes('--all')) { starts = Object.values(repo.branches).concat(Object.values(repo.remoteRefs)); if (headId(repo)) starts.push(headId(repo)); }
  else {
    const given = args.filter((a, i) => !a.startsWith('-') && args[i - 1] !== '-n');
    if (given.length) { for (const g of given) { const r = parseRev(c, R, g); if (!r) return badRev(c, g); starts.push(r); } } else starts.push(headId(repo));
  }
  const set = new Set(); starts.forEach(s => ancestors(st, s).forEach(x => set.add(x)));
  const list = [...set].map(id => commitOf(st, id)).sort((a, b) => b.seq - a.seq).slice(0, limit);
  const deco = decorations(st, R), graph = args.includes('--graph');
  list.forEach((cm, i) => {
    const d = deco[cm.id], dstr = d ? ' (' + d.join(', ') + ')' : '', gp = graph ? '* ' : '';
    if (one) o.segs([[gp, 'r'], [short(cm.id), 'y'], [dstr, 'c'], [' ' + cm.msg.split('\n')[0], '']]);
    else {
      o.segs([[gp + 'commit ' + cm.id, 'y'], [dstr, 'c']]);
      if (cm.parents.length > 1) o.p('Merge: ' + cm.parents.map(short).join(' '));
      o.p(`Author: ${cm.author.name} <${cm.author.email}>\nDate:   ${dateStr(cm.time)}\n`);
      o.p(cm.msg.split('\n').map(l => '    ' + l).join('\n'));
      if (i < list.length - 1) o.p('');
    }
  });
  return true;
};

GIT.show = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const rev = args.filter(a => !a.startsWith('-'))[0] || 'HEAD', id = parseRev(c, R, rev);
  if (!id) return badRev(c, rev);
  const cm = commitOf(c.st, id), o = c.out;
  o.segs([['commit ' + cm.id, 'y']]);
  o.p(`Author: ${cm.author.name} <${cm.author.email}>\nDate:   ${dateStr(cm.time)}\n\n` + cm.msg.split('\n').map(l => '    ' + l).join('\n') + '\n');
  printDiff(o, treePairs(cm.parents.length ? treeOf(c.st, cm.parents[0]) : dict(), cm.tree));
  return true;
};

GIT.branch = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, repo = R.repo, o = c.out;
  const flags = args.filter(a => a.startsWith('-')), pos = args.filter(a => !a.startsWith('-'));
  if (flags.includes('--show-current')) { o.p(repo.head.type === 'branch' ? repo.head.name : ''); return true; }
  const del = flags.includes('-d') || flags.includes('-D') || flags.includes('--delete');
  const mv = flags.includes('-m') || flags.includes('-M');
  const upFlag = args.find(a => a.startsWith('--set-upstream-to=')) || (flags.includes('-u') ? 'x=' + pos[0] : null);
  if (upFlag) {
    const ref = upFlag.split('=')[1]; const [rm, ...br] = ref.split('/');
    if (!repo.remoteRefs[ref]) { o.p(`fatal: the requested upstream branch '${ref}' does not exist`, 'r'); return false; }
    repo.upstream[repo.head.name] = { remote: rm, branch: br.join('/') };
    o.p(`branch '${repo.head.name}' set up to track '${ref}'.`); return true;
  }
  if (del) {
    for (const n of pos) {
      if (!(n in repo.branches)) { o.p(`error: branch '${n}' not found.`, 'r'); return false; }
      if (repo.head.type === 'branch' && repo.head.name === n) { o.p(`error: cannot delete branch '${n}' used by worktree at '${R.root}'`, 'r'); return false; }
      const tip = repo.branches[n];
      if (!flags.includes('-D') && !isAncestor(st, tip, headId(repo))) { o.p(`error: the branch '${n}' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D ${n}'.`, 'r'); return false; }
      delete repo.branches[n]; delete repo.upstream[n];
      o.p(`Deleted branch ${n} (was ${short(tip)}).`);
    }
    return true;
  }
  if (mv) {
    const nw = pos[pos.length - 1], old = pos.length > 1 ? pos[0] : repo.head.name;
    if (!nw) { o.p('fatal: branch name required', 'r'); return false; }
    if (nw !== old && nw in repo.branches && !flags.includes('-M')) { o.p(`fatal: a branch named '${nw}' already exists`, 'r'); return false; }
    if (old in repo.branches) { repo.branches[nw] = repo.branches[old]; if (nw !== old) delete repo.branches[old]; }
    if (repo.upstream[old] && nw !== old) { repo.upstream[nw] = repo.upstream[old]; delete repo.upstream[old]; }
    if (repo.head.type === 'branch' && repo.head.name === old) repo.head.name = nw;
    syncGitDir(R); return true;
  }
  if (pos.length) {
    const n = pos[0];
    if (n in repo.branches) { o.p(`fatal: a branch named '${n}' already exists`, 'r'); return false; }
    const start = pos[1] ? parseRev(c, R, pos[1]) : headId(repo);
    if (!start) { o.p(`fatal: not a valid object name: '${pos[1] || repo.head.name}'`, 'r'); return false; }
    repo.branches[n] = start; return true;
  }
  const showAll = flags.includes('-a') || flags.includes('--all'), showR = flags.includes('-r') || flags.includes('--remotes'), verbose = flags.includes('-v') || flags.includes('-vv');
  if (!showR) {
    const names = Object.keys(repo.branches).sort();
    if (repo.head.type === 'branch' && !(repo.head.name in repo.branches)) names.unshift(repo.head.name);
    if (repo.head.type !== 'branch') o.p('* (HEAD detached at ' + short(headId(repo)) + ')', 'g');
    for (const n of names) {
      const cur = repo.head.type === 'branch' && repo.head.name === n, tip = repo.branches[n];
      const extra = verbose && tip ? ' ' + short(tip) + ' ' + commitOf(st, tip).msg.split('\n')[0] : '';
      o.p((cur ? '* ' : '  ') + n + extra, cur ? 'g' : '');
    }
  }
  if (showAll || showR) Object.keys(repo.remoteRefs).sort().forEach(n => o.p('  remotes/' + n, 'r'));
  return true;
};

function switchTo(c, R, name, create, start, isCheckout) {
  const st = c.st, repo = R.repo, o = c.out;
  const cur = repo.head.type === 'branch' ? repo.head.name : null;
  if (create) {
    if (name in repo.branches) { o.p(`fatal: a branch named '${name}' already exists`, 'r'); return false; }
    if (!headId(repo) && !start) { repo.head = { type: 'branch', name }; syncGitDir(R); o.p(`Switched to a new branch '${name}'`); return true; }
    const sid = start ? parseRev(c, R, start) : headId(repo);
    if (!sid) { o.p(`fatal: invalid reference: ${start}`, 'r'); return false; }
    const block = checkoutTree(c, R, treeOf(st, sid), headTree(st, R), false);
    if (block) return blocked(c, block, isCheckout);
    repo.branches[name] = sid; repo.head = { type: 'branch', name };
    if (start && repo.remoteRefs[start]) { const [rm, ...b] = start.split('/'); repo.upstream[name] = { remote: rm, branch: b.join('/') }; o.p(`branch '${name}' set up to track '${start}'.`); }
    syncGitDir(R); o.p(`Switched to a new branch '${name}'`); return true;
  }
  if (cur === name) { o.p(`Already on '${name}'`); return true; }
  if (name in repo.branches) {
    const block = checkoutTree(c, R, treeOf(st, repo.branches[name]), headTree(st, R), false);
    if (block) return blocked(c, block, isCheckout);
    repo.head = { type: 'branch', name }; syncGitDir(R);
    o.p(`Switched to branch '${name}'`);
    const trk = trackingInfo(st, R);
    if (trk) o.p(!trk.ahead && !trk.behind ? `Your branch is up to date with '${trk.refName}'.` : trk.ahead && !trk.behind ? `Your branch is ahead of '${trk.refName}' by ${plural(trk.ahead, 'commit', 'commits')}.` : !trk.ahead ? `Your branch is behind '${trk.refName}' by ${plural(trk.behind, 'commit', 'commits')}, and can be fast-forwarded.` : `Your branch and '${trk.refName}' have diverged.`);
    return true;
  }
  const remoteName = Object.keys(repo.remotes).find(rm => repo.remoteRefs[rm + '/' + name]);
  if (remoteName) {
    const sid = repo.remoteRefs[remoteName + '/' + name];
    const block = checkoutTree(c, R, treeOf(st, sid), headTree(st, R), false);
    if (block) return blocked(c, block, isCheckout);
    repo.branches[name] = sid; repo.upstream[name] = { remote: remoteName, branch: name }; repo.head = { type: 'branch', name }; syncGitDir(R);
    o.p(`branch '${name}' set up to track '${remoteName}/${name}'.\nSwitched to a new branch '${name}'`); return true;
  }
  const rid = parseRev(c, R, name);
  if (rid && !isCheckout) { o.p(`fatal: a branch is expected, got commit '${name}'`, 'r'); return false; }
  if (rid) {
    const block = checkoutTree(c, R, treeOf(st, rid), headTree(st, R), false);
    if (block) return blocked(c, block, isCheckout);
    repo.head = { type: 'detached', id: rid }; syncGitDir(R);
    o.p(`Note: switching to '${name}'.\n\nYou are in 'detached HEAD' state. Puedes mirar el código, pero lo que commitees\nse perderá si no creas una rama (git switch -c <nombre>).\n\nHEAD is now at ${short(rid)} ${commitOf(st, rid).msg.split('\n')[0]}`); return true;
  }
  o.p(isCheckout ? `error: pathspec '${name}' did not match any file(s) known to git` : `fatal: invalid reference: ${name}`, 'r');
  return false;
}
function blocked(c, list, isCheckout) {
  c.out.p(`error: Your local changes to the following files would be overwritten by ${isCheckout ? 'checkout' : 'switch'}:\n${list.map(p => '\t' + p).join('\n')}\nPlease commit your changes or stash them before you switch branches.\nAborting`, 'r');
  return false;
}
GIT.switch = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const ci = args.findIndex(a => a === '-c' || a === '--create' || a === '-C');
  if (ci >= 0) return switchTo(c, R, args[ci + 1], true, args[ci + 2], false);
  const name = args.filter(a => !a.startsWith('-'))[0];
  if (!name) { c.out.p('fatal: missing branch or commit argument', 'r'); return false; }
  return switchTo(c, R, name, false, null, false);
};
GIT.checkout = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const bi = args.findIndex(a => a === '-b' || a === '-B');
  if (bi >= 0) return switchTo(c, R, args[bi + 1], true, args[bi + 2], true);
  const di = args.indexOf('--');
  if (di >= 0) return GIT.restore(c, args.slice(di + 1).length ? ['--', ...args.slice(di + 1)] : []);
  const name = args.filter(a => !a.startsWith('-'))[0];
  if (!name) { c.out.p('fatal: missing argument', 'r'); return false; }
  if (!(name in R.repo.branches) && !parseRev(c, R, name) && getNode(c.st, normPath(c.st.cwd, name)) && !Object.keys(R.repo.remotes).some(rm => R.repo.remoteRefs[rm + '/' + name])) return GIT.restore(c, ['--', ...args.filter(a => !a.startsWith('-'))]);
  if (name === '.') return GIT.restore(c, ['--', '.']);
  return switchTo(c, R, name, false, null, true);
};

GIT.restore = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, repo = R.repo, stagedOnly = args.includes('--staged') || args.includes('-S'), both = args.includes('--worktree') || args.includes('-W');
  const srcArg = args.find(a => a.startsWith('--source=')); const specs = pathArgs(args);
  if (!specs.length) { c.out.p('fatal: you must specify path(s) to restore', 'r'); return false; }
  const head = headTree(st, R), info = statusInfo(st, R);
  const srcTree = srcArg ? treeOf(st, parseRev(c, R, srcArg.split('=')[1])) : null;
  for (const s of specs) {
    const rel = relOf(c, R, s); if (rel === null) return false;
    const known = new Set([...Object.keys(repo.index), ...Object.keys(head), ...(srcTree ? Object.keys(srcTree) : [])]);
    const files = [...known].filter(p => matchSpec(rel, p));
    if (!files.length) { c.out.p(`error: pathspec '${s}' did not match file(s) known to git`, 'r'); return false; }
    for (const p of files) {
      if (stagedOnly) { const src = srcTree || head; if (p in src) repo.index[p] = src[p]; else delete repo.index[p]; if (!both) continue; }
      const src = stagedOnly ? (srcTree || head) : (srcTree || repo.index);
      if (p in src) writeWork(st, R.root, p, src[p]); else if (p in info.work) removeWork(st, R.root, p);
      if (srcTree && !stagedOnly) { if (p in srcTree) repo.index[p] = repo.index[p]; }
    }
  }
  return true;
};

GIT.reset = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, repo = R.repo, o = c.out;
  const mode = args.includes('--hard') ? 'hard' : args.includes('--soft') ? 'soft' : 'mixed';
  const pos = args.filter(a => !a.startsWith('-'));
  const di = args.indexOf('--');
  let rev = 'HEAD', paths = [];
  if (di >= 0) { paths = args.slice(di + 1); const b = args.slice(0, di).filter(a => !a.startsWith('-')); if (b[0]) rev = b[0]; }
  else if (pos.length) { if (parseRev(c, R, pos[0])) { rev = pos[0]; paths = pos.slice(1); } else paths = pos; }
  const target = parseRev(c, R, rev);
  if (!target && headId(repo)) return badRev(c, rev);
  const tt = treeOf(st, target);
  if (paths.length) {
    for (const s of paths) {
      const rel = relOf(c, R, s); if (rel === null) return false;
      for (const p of new Set([...Object.keys(repo.index), ...Object.keys(tt)])) if (matchSpec(rel, p)) { if (p in tt) repo.index[p] = tt[p]; else delete repo.index[p]; }
    }
    const info = statusInfo(st, R);
    if (info.unstaged.length) { o.p('Unstaged changes after reset:'); info.unstaged.forEach(u => o.p((u.kind === 'deleted' ? 'D' : 'M') + '\t' + u.path)); }
    return true;
  }
  const oldTree = headTree(st, R);
  if (target) setHeadCommit(R, target);
  if (mode === 'hard') {
    const oldIdx = Object.assign(dict(), repo.index);
    const work = workingFiles(st, R.root);
    for (const p of new Set([...Object.keys(oldTree), ...Object.keys(oldIdx), ...Object.keys(tt)])) {
      if (p in tt) writeWork(st, R.root, p, tt[p]); else if (p in work) removeWork(st, R.root, p);
    }
    repo.index = Object.assign(dict(), tt); repo.merging = null;
    o.p(`HEAD is now at ${short(target)} ${commitOf(st, target).msg.split('\n')[0]}`);
  } else if (mode === 'mixed') {
    repo.index = Object.assign(dict(), tt);
    const info = statusInfo(st, R);
    if (info.unstaged.length) { o.p('Unstaged changes after reset:'); info.unstaged.forEach(u => o.p((u.kind === 'deleted' ? 'D' : 'M') + '\t' + u.path)); }
  }
  return true;
};

GIT.stash = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, repo = R.repo, o = c.out, sub = args[0] && !args[0].startsWith('-') ? args[0] : 'push';
  const label = e => `WIP on ${e.branch}: ${e.head ? short(e.head) + ' ' + commitOf(st, e.head).msg.split('\n')[0] : '(sin commits)'}`;
  if (sub === 'list') { repo.stash.forEach((e, i) => o.p(`stash@{${i}}: ${label(e)}`)); return true; }
  if (sub === 'clear') { repo.stash = []; return true; }
  if (sub === 'drop') { if (!repo.stash.length) { o.p('No stash entries found.', 'r'); return false; } const e = repo.stash.shift(); o.p(`Dropped refs/stash@{0} (${short(sha(label(e)))})`); return true; }
  if (sub === 'pop' || sub === 'apply') {
    if (!repo.stash.length) { o.p('No stash entries found.', 'r'); return false; }
    const e = repo.stash[0];
    for (const p of Object.keys(e.changes)) { if (e.changes[p] === null) removeWork(st, R.root, p); else writeWork(st, R.root, p, e.changes[p]); }
    if (sub === 'pop') repo.stash.shift();
    printStatus(c, R);
    if (sub === 'pop') o.p(`Dropped refs/stash@{0} (${short(sha(label(e)))})`);
    return true;
  }
  if (sub !== 'push' && sub !== 'save') { o.p(`error: unknown subcommand: ${sub}`, 'r'); return false; }
  const head = headTree(st, R), idx = repo.index, work = workingFiles(st, R.root), changes = dict();
  for (const p of new Set([...Object.keys(idx), ...Object.keys(head)])) if (work[p] !== head[p] || idx[p] !== head[p]) changes[p] = p in work ? work[p] : null;
  if (!Object.keys(changes).length) { o.p('No local changes to save'); return true; }
  const entry = { changes, branch: repo.head.type === 'branch' ? repo.head.name : '(detached)', head: headId(repo) };
  repo.stash.unshift(entry);
  for (const p of Object.keys(changes)) { if (p in head) writeWork(st, R.root, p, head[p]); else removeWork(st, R.root, p); }
  repo.index = Object.assign(dict(), head);
  o.p('Saved working directory and index state ' + label(entry));
  return true;
};

GIT.tag = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const repo = R.repo, o = c.out, st = c.st;
  if (args.includes('-d')) { const n = args[args.indexOf('-d') + 1]; if (!(n in repo.tags)) { o.p(`error: tag '${n}' not found.`, 'r'); return false; } o.p(`Deleted tag '${n}' (was ${short(repo.tags[n])})`); delete repo.tags[n]; return true; }
  const pos = []; let msg = null;
  for (let i = 0; i < args.length; i++) { if (args[i] === '-m') msg = args[++i]; else if (!args[i].startsWith('-')) pos.push(args[i]); }
  if (!pos.length) { Object.keys(repo.tags).sort().forEach(t => o.p(t)); return true; }
  if (pos[0] in repo.tags) { o.p(`fatal: tag '${pos[0]}' already exists`, 'r'); return false; }
  const id = pos[1] ? parseRev(c, R, pos[1]) : headId(repo);
  if (!id) { o.p('fatal: Failed to resolve \'HEAD\' as a valid ref.', 'r'); return false; }
  if (args.includes('-a') && !msg) { o.p('fatal: usa -m "mensaje" para la etiqueta anotada (el simulador no abre editor).', 'r'); return false; }
  repo.tags[pos[0]] = id; return true;
};

/* ----- merge ----- */
function doMerge(c, R, theirId, label, opts) {
  const st = c.st, repo = R.repo, o = c.out, ours = headId(repo);
  opts = opts || {};
  if (!ours) { // rama sin commits: avance rápido directo
    setHeadCommit(R, theirId); checkoutTree(c, R, treeOf(st, theirId), dict(), true);
    o.p('Fast-forward'); return true;
  }
  if (isAncestor(st, theirId, ours)) { o.p('Already up to date.'); return true; }
  const oursT = treeOf(st, ours), theirsT = treeOf(st, theirId);
  if (isAncestor(st, ours, theirId) && !opts.noFF) {
    const block = checkoutTree(c, R, theirsT, oursT, false);
    if (block) { o.p(`error: Your local changes to the following files would be overwritten by merge:\n${block.map(p => '\t' + p).join('\n')}\nPlease commit your changes or stash them before you merge.\nAborting`, 'r'); return false; }
    setHeadCommit(R, theirId);
    o.p(`Updating ${short(ours)}..${short(theirId)}\nFast-forward`);
    printStat(o, oursT, theirsT, true);
    return true;
  }
  const info = statusInfo(st, R);
  if (info.staged.length || info.unstaged.length) {
    o.p('error: Your local changes would be overwritten by merge.\nPlease commit your changes or stash them before you merge.\nAborting', 'r'); return false;
  }
  if (!needIdentity(c, R)) return false;
  const baseId = mergeBase(st, ours, theirId), baseT = treeOf(st, baseId);
  const m = merge3Trees(baseT, oursT, theirsT, opts.markerLabel || label.replace(/^Merge /, '').replace(/^branch '(.*)'.*$/, '$1'));
  const work = workingFiles(st, R.root);
  for (const p of new Set([...Object.keys(m.work), ...Object.keys(work)])) {
    if (p in m.work && m.work[p] !== undefined) { if (work[p] !== m.work[p]) writeWork(st, R.root, p, m.work[p]); }
    else if (p in work && (p in oursT || p in theirsT)) removeWork(st, R.root, p);
  }
  const message = opts.message || label;
  if (m.conflicts.length) {
    repo.index = Object.assign(dict(), m.tree);
    repo.merging = { theirs: theirId, conflicts: m.conflicts.slice(), message, label };
    m.conflicts.forEach(p => o.p(`CONFLICT (content): Merge conflict in ${p}`, 'r'));
    o.p('Automatic merge failed; fix conflicts and then commit the result.', 'r');
    return false;
  }
  repo.index = Object.assign(dict(), m.tree);
  const id = createCommit(st, [ours, theirId], m.tree, message, authorOf(c, R));
  setHeadCommit(R, id);
  o.p("Merge made by the 'ort' strategy.");
  printStat(o, oursT, m.tree, true);
  return true;
}
GIT.merge = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, repo = R.repo, o = c.out;
  if (args.includes('--abort')) {
    if (!repo.merging) { o.p('fatal: There is no merge to abort (MERGE_HEAD missing).', 'r'); return false; }
    const t = headTree(st, R), work = workingFiles(st, R.root);
    for (const p of new Set([...Object.keys(t), ...Object.keys(work)])) { if (p in t) { if (work[p] !== t[p]) writeWork(st, R.root, p, t[p]); } else if (p in work && p in repo.index) removeWork(st, R.root, p); }
    repo.index = Object.assign(dict(), t); repo.merging = null; return true;
  }
  const mi = args.findIndex(a => a === '-m'); const message = mi >= 0 ? args[mi + 1] : null;
  const name = args.filter((a, i) => !a.startsWith('-') && args[i - 1] !== '-m')[0];
  if (!name) { o.p('fatal: No remote for the current branch / indica la rama a fusionar: git merge <rama>', 'r'); return false; }
  if (repo.merging) { o.p('error: Merging is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use \'git add/rm <file>\'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.', 'r'); return false; }
  const id = parseRev(c, R, name);
  if (!id) { o.p(`merge: ${name} - not something we can merge`, 'r'); return false; }
  const cur = repo.head.type === 'branch' ? repo.head.name : 'HEAD';
  const label = repo.remoteRefs[name] ? `Merge remote-tracking branch '${name}'` : `Merge branch '${name}'` + (cur !== 'main' && cur !== 'master' ? ` into ${cur}` : '');
  return doMerge(c, R, id, label, { noFF: args.includes('--no-ff'), message });
};

GIT.revert = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, o = c.out, rev = args.filter(a => !a.startsWith('-'))[0] || 'HEAD';
  const id = parseRev(c, R, rev); if (!id) return badRev(c, rev);
  const cm = commitOf(st, id);
  if (cm.parents.length !== 1) { o.p('error: revertir este commit (raíz o merge) no está soportado en el simulador', 'r'); return false; }
  const info = statusInfo(st, R);
  if (info.staged.length || info.unstaged.length) { o.p('error: your local changes would be overwritten by revert.\nhint: commit your changes or stash them to proceed.\nfatal: revert failed', 'r'); return false; }
  if (!needIdentity(c, R)) return false;
  const oursT = headTree(st, R), m = merge3Trees(cm.tree, oursT, treeOf(st, cm.parents[0]), 'parent of ' + short(id));
  if (m.conflicts.length) { o.p(`error: could not revert ${short(id)}... ${cm.msg.split('\n')[0]}\nhint: hay conflictos; el simulador cancela el revert.`, 'r'); return false; }
  checkoutTree(c, R, m.tree, oursT, false);
  const msg = `Revert "${cm.msg.split('\n')[0]}"\n\nThis reverts commit ${id}.`;
  const nid = createCommit(st, [headId(R.repo)], m.tree, msg, authorOf(c, R));
  setHeadCommit(R, nid);
  o.p(`[${R.repo.head.name} ${short(nid)}] Revert "${cm.msg.split('\n')[0]}"`);
  printStat(o, oursT, m.tree, false);
  return true;
};

/* ----- remotos ----- */
GIT.remote = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const repo = R.repo, o = c.out, sub = args[0];
  if (!sub || sub === '-v' || sub === '--verbose') {
    for (const n of Object.keys(repo.remotes)) {
      if (sub) { o.p(`${n}\t${repo.remotes[n]} (fetch)`); o.p(`${n}\t${repo.remotes[n]} (push)`); } else o.p(n);
    }
    return true;
  }
  if (sub === 'add') {
    const [, name, url] = args;
    if (!name || !url) { o.p('usage: git remote add <nombre> <url>', 'r'); return false; }
    if (name in repo.remotes) { o.p(`error: remote ${name} already exists.`, 'r'); return false; }
    if (!validUrl(url)) { o.p(`fatal: '${url}' no parece una URL válida (ej: https://github.com/usuario/repo.git)`, 'r'); return false; }
    repo.remotes[name] = url; return true;
  }
  if (sub === 'remove' || sub === 'rm') {
    if (!(args[1] in repo.remotes)) { o.p(`error: No such remote: '${args[1]}'`, 'r'); return false; }
    delete repo.remotes[args[1]];
    Object.keys(repo.remoteRefs).filter(k => k.startsWith(args[1] + '/')).forEach(k => delete repo.remoteRefs[k]);
    return true;
  }
  if (sub === 'set-url') { if (!(args[1] in repo.remotes)) { o.p(`error: No such remote '${args[1]}'`, 'r'); return false; } repo.remotes[args[1]] = args[2]; return true; }
  if (sub === 'get-url') { if (!(args[1] in repo.remotes)) { o.p(`error: No such remote '${args[1]}'`, 'r'); return false; } o.p(repo.remotes[args[1]]); return true; }
  o.p(`error: Unknown subcommand: ${sub}`, 'r'); return false;
};
function remoteFail(c, name) {
  c.out.p(`fatal: '${name}' does not appear to be a git repository\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.`, 'r');
  return false;
}
function doFetch(c, R, remoteName, prune) {
  const repo = R.repo, o = c.out, url = repo.remotes[remoteName];
  const rr = getRemoteRepo(c.st, url);
  if (!rr) { o.p(`ERROR: Repository not found.\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.`, 'r'); return null; }
  let header = false; const hdr = () => { if (!header) { o.p('From ' + url.replace(/\.git$/, '')); header = true; } };
  for (const b of Object.keys(rr.branches)) {
    const ref = remoteName + '/' + b, old = repo.remoteRefs[ref], nw = rr.branches[b];
    if (old === nw) continue;
    hdr();
    if (!old) o.p(` * [new branch]      ${b.padEnd(10)} -> ${ref}`);
    else o.p(`   ${short(old)}..${short(nw)}  ${b.padEnd(10)} -> ${ref}`);
    repo.remoteRefs[ref] = nw;
  }
  if (prune) for (const ref of Object.keys(repo.remoteRefs)) if (ref.startsWith(remoteName + '/') && !(ref.slice(remoteName.length + 1) in rr.branches)) { hdr(); o.p(` - [deleted]         (none)     -> ${ref}`); delete repo.remoteRefs[ref]; }
  for (const t of Object.keys(rr.tags)) if (!(t in repo.tags)) { hdr(); o.p(` * [new tag]         ${t.padEnd(10)} -> ${t}`); repo.tags[t] = rr.tags[t]; }
  return rr;
}
GIT.fetch = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const repo = R.repo, name = args.filter(a => !a.startsWith('-'))[0] || (repo.upstream[repo.head.name] && repo.upstream[repo.head.name].remote) || 'origin';
  if (!(name in repo.remotes)) return remoteFail(c, name);
  return !!doFetch(c, R, name, args.includes('-p') || args.includes('--prune'));
};
GIT.pull = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, repo = R.repo, o = c.out, pos = args.filter(a => !a.startsWith('-'));
  const up = repo.head.type === 'branch' ? repo.upstream[repo.head.name] : null;
  if (!pos.length && !up) {
    const br = repo.head.type === 'branch' ? repo.head.name : 'main';
    o.p(`There is no tracking information for the current branch.\nPlease specify which branch you want to merge with.\nSee git-pull(1) for details.\n\n    git pull <remote> <branch>\n\nIf you wish to set tracking information for this branch you can do so with:\n\n    git branch --set-upstream-to=origin/<branch> ${br}`, 'r');
    return false;
  }
  const rname = pos[0] || up.remote, bname = pos[1] || (up && up.branch) || pos[0];
  if (!(rname in repo.remotes)) return remoteFail(c, rname);
  if (args.includes('--rebase') || args.includes('-r')) o.p('[simulador] --rebase no está implementado: se hace un merge normal.', 'y');
  const rr = doFetch(c, R, rname, false); if (!rr) return false;
  const tip = rr.branches[bname];
  if (!tip) { o.p(`fatal: couldn't find remote ref ${bname}`, 'r'); return false; }
  const info = statusInfo(st, R);
  if (repo.merging) { o.p('error: Pulling is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use \'git add/rm <file>\'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.', 'r'); return false; }
  void info;
  const cur = repo.head.type === 'branch' ? repo.head.name : 'HEAD';
  return doMerge(c, R, tip, `Merge branch '${bname}' of ${repo.remotes[rname].replace(/\.git$/, '')}` + (cur !== bname ? ` into ${cur}` : ''), { markerLabel: rname + '/' + bname });
};
GIT.push = (c, args) => {
  const R = needRepo(c); if (!R) return false;
  const st = c.st, repo = R.repo, o = c.out;
  const setUp = args.includes('-u') || args.includes('--set-upstream'), force = args.includes('-f') || args.includes('--force') || args.includes('--force-with-lease');
  const del = args.includes('--delete') || args.includes('-d'), tagsAll = args.includes('--tags');
  const pos = args.filter(a => !a.startsWith('-'));
  const cur = repo.head.type === 'branch' ? repo.head.name : null;
  const up = cur ? repo.upstream[cur] : null;
  let rname = pos[0];
  if (!rname) {
    if (up) rname = up.remote;
    else if (cur && !tagsAll) { o.p(`fatal: The current branch ${cur} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${cur}\n\nTo have this happen automatically for branches without a tracking\nupstream, see 'push.autoSetupRemote' in 'git help config'.`, 'r'); return false; }
    else rname = 'origin';
  }
  if (!(rname in repo.remotes)) return remoteFail(c, rname);
  const url = repo.remotes[rname].replace(/\.git$/, '') + (repo.remotes[rname].endsWith('.git') ? '.git' : '');
  const rr = ensureRemoteRepo(st, repo.remotes[rname]);
  if (!rr) return remoteFail(c, rname);
  const refs = []; // {src, dst, kind}
  if (del) { for (const b of pos.slice(1)) refs.push({ del: true, dst: b }); }
  else if (tagsAll) { for (const t of Object.keys(repo.tags)) refs.push({ tag: t }); }
  else if (pos.length >= 2) {
    for (const spec of pos.slice(1)) {
      const [src, dst] = spec.includes(':') ? spec.split(':') : [spec, spec];
      if (src in repo.tags && !(src in repo.branches)) refs.push({ tag: src }); else refs.push({ src, dst });
    }
  } else if (cur) refs.push({ src: cur, dst: up && up.remote === rname ? up.branch : cur });
  let headerShown = false, failed = false, anyChange = false;
  const hdr = () => { if (!headerShown) { o.p('To ' + url); headerShown = true; } };
  for (const r of refs) {
    if (r.del) {
      if (!(r.dst in rr.branches)) { o.p(`error: unable to delete '${r.dst}': remote ref does not exist`, 'r'); failed = true; continue; }
      delete rr.branches[r.dst]; delete repo.remoteRefs[rname + '/' + r.dst]; hdr(); o.p(` - [deleted]         ${r.dst}`); anyChange = true; continue;
    }
    if (r.tag) {
      if (rr.tags[r.tag] === repo.tags[r.tag]) continue;
      if (!anyChange) o.p('Enumerating objects: 1, done.\nTotal 1 (delta 0), reused 0 (delta 0)');
      rr.tags[r.tag] = repo.tags[r.tag]; hdr(); o.p(` * [new tag]         ${r.tag} -> ${r.tag}`); anyChange = true; continue;
    }
    const local = repo.branches[r.src];
    if (!local) { o.p(`error: src refspec ${r.src} does not match any\nerror: failed to push some refs to '${url}'`, 'r'); return false; }
    const remoteTip = rr.branches[r.dst];
    if (remoteTip === local) { if (setUp && cur) { repo.upstream[cur] = { remote: rname, branch: r.dst }; } continue; }
    if (remoteTip && !isAncestor(st, remoteTip, local) && !force) {
      hdr(); o.p(` ! [rejected]        ${r.src} -> ${r.dst} (fetch first)`, 'r'); failed = true; continue;
    }
    const newCount = [...ancestors(st, local)].filter(x => !remoteTip || !ancestors(st, remoteTip).has(x)).length;
    const objs = newCount * 2 + 1;
    o.p(`Enumerating objects: ${objs}, done.\nCounting objects: 100% (${objs}/${objs}), done.\nWriting objects: 100% (${objs}/${objs}), ${objs * 143} bytes | ${objs * 143} bytes/s, done.\nTotal ${objs} (delta 0), reused 0 (delta 0), pack-reused 0`);
    hdr();
    if (!remoteTip) o.p(` * [new branch]      ${r.src} -> ${r.dst}`);
    else if (!isAncestor(st, remoteTip, local)) o.p(` + ${short(remoteTip)}...${short(local)} ${r.src} -> ${r.dst} (forced update)`);
    else o.p(`   ${short(remoteTip)}..${short(local)}  ${r.src} -> ${r.dst}`);
    rr.branches[r.dst] = local; repo.remoteRefs[rname + '/' + r.dst] = local; anyChange = true;
    if (setUp) { repo.upstream[r.src] = { remote: rname, branch: r.dst }; o.p(`branch '${r.src}' set up to track '${rname}/${r.dst}'.`); }
  }
  if (failed) { o.p(`error: failed to push some refs to '${url}'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. This is usually caused by another repository pushing to\nhint: the same ref. If you want to integrate the remote changes, use\nhint: 'git pull' before pushing again.`, 'y'); return false; }
  if (!anyChange) o.p('Everything up-to-date');
  return true;
};
GIT.clone = (c, args) => {
  const st = c.st, o = c.out, pos = args.filter(a => !a.startsWith('-'));
  const url = pos[0];
  if (!url) { o.p('fatal: You must specify a repository to clone.', 'r'); return false; }
  const rr = validUrl(url) ? getRemoteRepo(st, url) : null;
  const name = pos[1] || url.replace(/\.git$/, '').replace(/\/$/, '').split(/[\/:]/).pop();
  const dir = normPath(st.cwd, name);
  o.p(`Cloning into '${name}'...`);
  if (!rr) { o.p(`remote: Repository not found.\nfatal: repository '${url}' not found`, 'r'); return false; }
  const ex = getNode(st, dir);
  if (ex && (ex.type !== 'dir' || Object.keys(ex.children).length)) { o.p(`fatal: destination path '${name}' already exists and is not an empty directory.`, 'r'); return false; }
  const node = mkdirp(st, dir);
  const branch = 'main' in rr.branches ? 'main' : Object.keys(rr.branches)[0] || 'main';
  const repo = newRepo(branch); node.children['.git'] = makeGitDir(repo);
  repo.remotes.origin = url;
  const n = Object.keys(st.world.objects).length;
  if (!Object.keys(rr.branches).length) { o.p('warning: You appear to have cloned an empty repository.'); return true; }
  o.p(`remote: Enumerating objects: ${n}, done.\nremote: Counting objects: 100% (${n}/${n}), done.\nremote: Total ${n} (delta 0), reused 0 (delta 0), pack-reused 0\nReceiving objects: 100% (${n}/${n}), done.`);
  for (const b of Object.keys(rr.branches)) repo.remoteRefs['origin/' + b] = rr.branches[b];
  for (const t of Object.keys(rr.tags)) repo.tags[t] = rr.tags[t];
  const tip = rr.branches[branch]; repo.branches[branch] = tip; repo.upstream[branch] = { remote: 'origin', branch };
  const tree = treeOf(st, tip); repo.index = Object.assign(dict(), tree);
  for (const p of Object.keys(tree)) writeWork(st, dir, p, tree[p]);
  return true;
};

const GIT_LIST = ['init', 'config', 'add', 'rm', 'status', 'commit', 'diff', 'log', 'show', 'branch', 'switch', 'checkout', 'restore', 'reset', 'stash', 'tag', 'merge', 'revert', 'remote', 'fetch', 'pull', 'push', 'clone'];
function gitMain(c, args) {
  const sub = args[0], o = c.out;
  if (!sub || sub === 'help' || sub === '--help' || sub === '-h') {
    o.p('uso: git <comando> [<argumentos>]\n\nComandos disponibles en el simulador:\n');
    o.p('  empezar        init  clone  config\n  cambios        status  add  rm  diff  commit  restore  reset  stash\n  historial      log  show  tag  revert\n  ramas          branch  switch  checkout  merge\n  remoto         remote  fetch  pull  push', 'c');
    o.p('\nTip: escribe  git <comando> --help  no existe aquí; usa la pestaña "Chuleta" para ver cada uno explicado.');
    return true;
  }
  if (sub === '--version' || sub === 'version') { o.p('git version 2.46.0'); return true; }
  if (args.includes('--help') && GIT[sub]) { o.p(`(En el simulador no hay manual de 'git ${sub}'. Mira la pestaña "Chuleta" o la explicación de la lección.)`, 'y'); return true; }
  if (!GIT[sub]) { o.p(`git: '${sub}' is not a git command. See 'git --help'.`, 'r'); return false; }
  const ok = GIT[sub](c, args.slice(1)) !== false;
  const R = getRepo(c.st, c.st.cwd); if (R) { syncGitDir(R); c.st.lastRepoRoot = R.root; }
  return ok;
}

/* ───────────── comandos de shell ───────────── */
const SH = {};
const lsEntry = (name, n) => [name + (n.type === 'dir' ? '/' : ''), n.type === 'dir' ? 'b' : ''];
SH.pwd = c => { c.out.p(c.st.cwd); return true; };
SH.whoami = c => { c.out.p('dev'); return true; };
SH.date = c => { c.out.p(dateStr(Date.now())); return true; };
SH.clear = c => { c.clear = true; return true; };
SH.help = c => {
  c.out.p('Comandos de terminal disponibles:', 'c');
  c.out.p('  pwd  ls [-la]  cd  mkdir [-p]  touch  cat  echo  rm [-rf]  mv  cp [-r]  tree\n  nano <archivo>  (editor)   history   clear\n\nY el verdadero protagonista:  git <comando>   (escribe  git help)\n\nSimuladores (no existen en la vida real):\n  colega push / colega editar <archivo> "texto"   → un compañero sube cambios a GitHub\n  github pr-merge <rama>                         → el botón "Merge pull request"');
  return true;
};
SH.ls = (c, args) => {
  const flags = args.filter(a => a.startsWith('-')).join(''), paths = args.filter(a => !a.startsWith('-'));
  const all = flags.includes('a'), long = flags.includes('l');
  const target = paths[0] ? normPath(c.st.cwd, paths[0]) : c.st.cwd, n = getNode(c.st, target);
  if (!n) { c.out.p(`ls: cannot access '${paths[0]}': No such file or directory`, 'r'); return false; }
  if (n.type === 'file') { c.out.p(paths[0]); return true; }
  let names = Object.keys(n.children).sort();
  if (!all) names = names.filter(x => !x.startsWith('.'));
  if (all) names = ['.', '..', ...names];
  const meta = nm => nm === '.' || nm === '..' ? { type: 'dir' } : n.children[nm];
  if (long) {
    names.forEach(nm => { const e = meta(nm), size = e.type === 'file' ? e.content.length : 4096; c.out.segs([[(e.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--') + ' 1 dev dev ' + String(size).padStart(5) + ' oct  3 10:00 ', ''], ...[lsEntry(nm, e)]]); });
  } else if (names.length) {
    const segs = []; names.forEach(nm => { segs.push(lsEntry(nm, meta(nm))); segs.push(['  ', '']); }); c.out.segs(segs);
  }
  return true;
};
SH.cd = (c, args) => {
  const p = normPath(c.st.cwd, args[0] || '~'), n = getNode(c.st, p);
  if (!n) { c.out.p(`bash: cd: ${args[0]}: No such file or directory`, 'r'); return false; }
  if (n.type !== 'dir') { c.out.p(`bash: cd: ${args[0]}: Not a directory`, 'r'); return false; }
  c.st.cwd = p; return true;
};
SH.mkdir = (c, args) => {
  const parents = args.includes('-p'); let ok = true;
  for (const a of args.filter(x => !x.startsWith('-'))) {
    const p = normPath(c.st.cwd, a);
    if (getNode(c.st, p)) { if (!parents) { c.out.p(`mkdir: cannot create directory '${a}': File exists`, 'r'); ok = false; } continue; }
    const [d] = splitPath(p);
    if (!parents && !getNode(c.st, d)) { c.out.p(`mkdir: cannot create directory '${a}': No such file or directory`, 'r'); ok = false; continue; }
    mkdirp(c.st, p);
  }
  return ok;
};
SH.touch = (c, args) => {
  let ok = true;
  for (const a of args) {
    const p = normPath(c.st.cwd, a), n = getNode(c.st, p);
    if (n) continue;
    if (!writeFile(c.st, p, '')) { c.out.p(`touch: cannot touch '${a}': No such file or directory`, 'r'); ok = false; }
  }
  return ok;
};
SH.cat = (c, args) => {
  if (!args.length) { c.out.p('cat: indica un archivo (ej: cat README.md)', 'r'); return false; }
  let ok = true;
  for (const a of args) {
    const n = getNode(c.st, normPath(c.st.cwd, a));
    if (!n) { c.out.p(`cat: ${a}: No such file or directory`, 'r'); ok = false; }
    else if (n.type === 'dir') { c.out.p(`cat: ${a}: Is a directory`, 'r'); ok = false; }
    else if (n.content) c.out.p(n.content.replace(/\n$/, ''));
  }
  return ok;
};
SH.echo = (c, args) => {
  let interpret = false; const a = args.slice();
  while (a[0] === '-e' || a[0] === '-n') { if (a[0] === '-e') interpret = true; a.shift(); }
  let s = a.join(' '); if (interpret) s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  c.out.p(s); return true;
};
SH.rm = (c, args) => {
  const flags = args.filter(a => a.startsWith('-')).join(''), rec = /[rR]/.test(flags), force = flags.includes('f'); let ok = true;
  for (const a of args.filter(x => !x.startsWith('-'))) {
    const p = normPath(c.st.cwd, a), n = getNode(c.st, p);
    if (!n) { if (!force) { c.out.p(`rm: cannot remove '${a}': No such file or directory`, 'r'); ok = false; } continue; }
    if (p === '/' || p === HOME) { c.out.p(`rm: it is dangerous to operate recursively on '${a}'`, 'r'); ok = false; continue; }
    if (n.type === 'dir' && !rec) { c.out.p(`rm: cannot remove '${a}': Is a directory`, 'r'); ok = false; continue; }
    removeNode(c.st, p);
  }
  fixCwd(c.st); return ok;
};
function copyNode(n) { return n.type === 'file' ? { type: 'file', content: n.content } : { type: 'dir', children: Object.assign(dict(), ...Object.keys(n.children).map(k => ({ [k]: copyNode(n.children[k]) }))) }; }
function moveCopy(c, args, move) {
  const rec = args.some(a => /^-[a-zA-Z]*[rR]/.test(a)), pos = args.filter(a => !a.startsWith('-'));
  if (pos.length < 2) { c.out.p((move ? 'mv' : 'cp') + ': falta el destino (uso: ' + (move ? 'mv' : 'cp') + ' origen destino)', 'r'); return false; }
  const dst = pos.pop(); let dp = normPath(c.st.cwd, dst), dn = getNode(c.st, dp), ok = true;
  for (const s of pos) {
    const sp = normPath(c.st.cwd, s), sn = getNode(c.st, sp);
    if (!sn) { c.out.p(`${move ? 'mv' : 'cp'}: cannot stat '${s}': No such file or directory`, 'r'); ok = false; continue; }
    if (sn.type === 'dir' && !move && !rec) { c.out.p(`cp: -r not specified; omitting directory '${s}'`, 'r'); ok = false; continue; }
    const finalP = dn && dn.type === 'dir' ? dp + '/' + splitPath(sp)[1] : dp;
    const [d, name] = splitPath(finalP), dd = getNode(c.st, d);
    if (!dd || dd.type !== 'dir') { c.out.p(`cannot create '${dst}': No such file or directory`, 'r'); ok = false; continue; }
    dd.children[name] = copyNode(sn);
    if (move && finalP !== sp) removeNode(c.st, sp);
  }
  fixCwd(c.st); return ok;
}
SH.mv = (c, a) => moveCopy(c, a, true);
SH.cp = (c, a) => moveCopy(c, a, false);
SH.tree = c => {
  const n = getNode(c.st, c.st.cwd); c.out.p('.', 'b');
  let dirs = 0, files = 0;
  (function walk(node, prefix) {
    const names = Object.keys(node.children).filter(x => !x.startsWith('.')).sort();
    names.forEach((nm, i) => {
      const e = node.children[nm], last = i === names.length - 1;
      c.out.segs([[prefix + (last ? '└── ' : '├── '), ''], [nm, e.type === 'dir' ? 'b' : '']]);
      if (e.type === 'dir') { dirs++; walk(e, prefix + (last ? '    ' : '│   ')); } else files++;
    });
  })(n, '');
  c.out.p(`\n${plural(dirs, 'directory', 'directories')}, ${plural(files, 'file', 'files')}`);
  return true;
};
SH.history = c => { c.st.cmdHistory.forEach((h, i) => c.out.p(String(i + 1).padStart(4) + '  ' + h)); return true; };
SH.nano = SH.vim = SH.vi = SH.code = (c, args, name) => {
  const a = args.filter(x => !x.startsWith('-'))[0];
  if (!a || a === '.') { c.out.p(`uso: ${name} <archivo>   (abre el editor del simulador)`, 'y'); return false; }
  const p = normPath(c.st.cwd, a), n = getNode(c.st, p);
  if (n && n.type === 'dir') { c.out.p(`${name}: ${a} es un directorio`, 'r'); return false; }
  const [d] = splitPath(p); if (!getNode(c.st, d)) { c.out.p(`${name}: no existe la carpeta de ${a}`, 'r'); return false; }
  c.editor = { path: p, name: a, content: n ? n.content : '' };
  return true;
};
SH.ssh = (c, args) => {
  if (args.includes('-T') && args.some(a => /git@github\.com/.test(a))) { c.out.p("Hi kdnastudio! You've successfully authenticated, but GitHub does not provide shell access."); return true; }
  c.out.p('ssh: en el simulador solo funciona:  ssh -T git@github.com', 'y'); return false;
};
SH.exit = c => { c.out.p('(en el simulador no puedes cerrar la terminal; ¡sigue practicando!)', 'y'); return true; };

/* simuladores */
SH.colega = (c, args) => {
  const R = getRepo(c.st, c.st.cwd), o = c.out;
  if (!R || !R.repo.remotes.origin) { o.p('colega: este repo no tiene remoto "origin". Primero conéctalo con git remote add / git clone.', 'r'); return false; }
  const rr = ensureRemoteRepo(c.st, R.repo.remotes.origin), up = R.repo.head.type === 'branch' && R.repo.upstream[R.repo.head.name];
  const br = up ? up.branch : 'main', tip = rr.branches[br] || null, tree = Object.assign(dict(), treeOf(c.st, tip));
  const A = { name: 'Marta Ruiz', email: 'marta@kdnastudio.com' };
  let msg;
  if (args[0] === 'editar' && args[1]) {
    tree[args[1]] = (args.slice(2).join(' ') || 'Cambio de Marta') + '\n'; msg = `Marta edita ${args[1]}`;
  } else if (args[0] === 'push' || !args.length) {
    const prev = tree['colega.txt'] || ''; tree['colega.txt'] = prev + 'Nota de Marta #' + (sl(prev).length + 1) + '\n'; msg = 'Marta agrega nota en colega.txt';
  } else { o.p('uso: colega push   |   colega editar <archivo> "texto"', 'y'); return false; }
  const id = createCommit(c.st, tip ? [tip] : [], tree, msg, A);
  rr.branches[br] = id;
  o.p(`[simulador] Marta (tu colega) hizo push a origin/${br}: "${msg}"`, 'm');
  o.p('Tu repo local todavía NO lo sabe. ¿Cómo lo traes? (git fetch / git pull)', 'dim');
  return true;
};
SH.github = (c, args) => {
  const R = getRepo(c.st, c.st.cwd), o = c.out;
  if (args[0] !== 'pr-merge' || !args[1]) { o.p('uso: github pr-merge <rama>   (simula el botón "Merge pull request" en GitHub)', 'y'); return false; }
  if (!R || !R.repo.remotes.origin) { o.p('github: este repo no tiene remoto origin', 'r'); return false; }
  const rr = ensureRemoteRepo(c.st, R.repo.remotes.origin), b = args[1], bt = rr.branches[b], mt = rr.branches.main;
  if (!bt) { o.p(`github: la rama '${b}' no existe en GitHub (¿hiciste git push de esa rama?)`, 'r'); return false; }
  if (!mt) { o.p('github: no existe la rama main en GitHub', 'r'); return false; }
  const n = (rr.prCount = (rr.prCount || 0) + 1);
  if (isAncestor(c.st, bt, mt)) { o.p('github: esa rama ya está fusionada en main', 'y'); return false; }
  const base = mergeBase(c.st, mt, bt), m = merge3Trees(treeOf(c.st, base), treeOf(c.st, mt), treeOf(c.st, bt), b);
  if (m.conflicts.length) { o.p('github: This branch has conflicts that must be resolved', 'r'); return false; }
  const id = createCommit(c.st, [mt, bt], m.tree, `Merge pull request #${n} from kdnastudio/${b}`, { name: 'GitHub', email: 'noreply@github.com' });
  rr.branches.main = id;
  o.p(`[simulador] Pull Request #${n} fusionado en main (botón verde de GitHub).`, 'm');
  o.p('Tu repo local todavía no lo sabe: cambia a main y haz git pull.', 'dim');
  return true;
};

/* ───────────── intérprete ───────────── */
function tokenize(line) {
  const toks = []; let cur = '', q = null, has = false;
  const push = () => { if (cur || has) { toks.push({ v: cur, q: has }); cur = ''; has = false; } };
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === q) q = null; else if (ch === '\\' && q === '"' && (line[i + 1] === '"' || line[i + 1] === '\\')) cur += line[++i]; else cur += ch; }
    else if (ch === '"' || ch === "'") { q = ch; has = true; }
    else if (/\s/.test(ch)) push();
    else if (ch === '&' && line[i + 1] === '&') { push(); toks.push({ v: '&&', op: '&&' }); i++; }
    else if (ch === '>') { push(); if (line[i + 1] === '>') { toks.push({ v: '>>', op: '>>' }); i++; } else toks.push({ v: '>', op: '>' }); }
    else cur += ch;
  }
  if (q) return null;
  push(); return toks;
}
function runSingle(st, toks, out) {
  const c = { st, out, clear: false, editor: null };
  let redir = null; const words = [];
  for (let i = 0; i < toks.length; i++) {
    if (toks[i].op === '>' || toks[i].op === '>>') { if (!toks[i + 1]) { out.p('bash: syntax error near unexpected token `newline\'', 'r'); return { ok: false }; } redir = { mode: toks[i].op, target: toks[i + 1].v }; i++; }
    else words.push(toks[i].v);
  }
  if (!words.length) return { ok: true };
  const cmd = words[0], args = words.slice(1);
  let sub = out;
  if (redir) { c.out = sub = new Out(); }
  let ok;
  if (cmd === 'git') ok = gitMain(c, args);
  else if (SH[cmd]) ok = SH[cmd](c, args, cmd) !== false;
  else { c.out.p(`bash: ${cmd}: command not found`, 'r'); ok = false; }
  if (redir) {
    const p = normPath(st.cwd, redir.target), n = getNode(st, p);
    if (n && n.type === 'dir') { out.p(`bash: ${redir.target}: Is a directory`, 'r'); return { ok: false }; }
    const text = sub.text() + (sub.lines.length ? '\n' : '');
    const prev = redir.mode === '>>' && n ? n.content : '';
    if (!writeFile(st, p, prev + text)) { out.p(`bash: ${redir.target}: No such file or directory`, 'r'); return { ok: false }; }
  }
  return { ok, clear: c.clear, editor: c.editor };
}
function run(st, line) {
  const out = new Out(); line = line.trim();
  const res = { lines: out.lines, ok: true, clear: false, editor: null };
  if (!line) return res;
  st.cmdHistory.push(line);
  const toks = tokenize(line);
  if (!toks) { out.p('bash: comillas sin cerrar (falta cerrar una " o \')', 'r'); res.ok = false; }
  else {
    const groups = [[]]; toks.forEach(t => { if (t.op === '&&') groups.push([]); else groups[groups.length - 1].push(t); });
    for (const g of groups) {
      const r = runSingle(st, g, out);
      if (r.clear) res.clear = true;
      if (r.editor) res.editor = r.editor;
      if (!r.ok) { res.ok = false; break; }
    }
  }
  st.history.push({ cmd: line, out: out.text(), ok: res.ok });
  return res;
}

/* ───────────── ayudas de UI ───────────── */
const EXPLAIN = [
  [/^git init/, 'Crea el repositorio: aparece la carpeta oculta .git donde Git guardará todo el historial.'],
  [/^git clone/, 'Descarga una copia completa del repositorio remoto (archivos + historial) y la conecta como "origin".'],
  [/^git config/, 'Guarda tu identidad (nombre y correo). Git la escribe en cada commit que hagas.'],
  [/^git status/, 'Muestra en qué estado están tus archivos: sin seguimiento, modificados o listos para commit.'],
  [/^git add/, 'Mueve cambios del directorio de trabajo al área de preparación (staging). Es la "foto" que irá en el próximo commit.'],
  [/^git commit/, 'Guarda para siempre lo que está en staging como un punto en el historial, con tu mensaje.'],
  [/^git diff/, 'Compara líneas: sin opciones muestra lo NO preparado; con --staged lo que ya está en staging.'],
  [/^git log/, 'Muestra el historial de commits, del más nuevo al más viejo.'],
  [/^git show/, 'Muestra un commit concreto con los cambios que introdujo.'],
  [/^git restore --staged/, 'Saca un archivo del staging (no pierde tus cambios, solo "des-prepara").'],
  [/^git restore/, 'Descarta los cambios del archivo en tu carpeta y lo deja como en el último add/commit. ¡No hay vuelta atrás!'],
  [/^git reset --hard/, 'Mueve la rama a otro commit y BORRA los cambios de tus archivos. Úsalo con cuidado.'],
  [/^git reset/, 'Mueve la rama / saca del staging según la opción (--soft, --mixed, --hard).'],
  [/^git rm/, 'Borra un archivo y lo registra en Git. Con --cached solo deja de seguirlo (el archivo queda en tu disco).'],
  [/^git stash/, 'Guarda tus cambios sin commit en un cajón temporal para dejar el directorio limpio; luego los recuperas con pop.'],
  [/^git branch/, 'Lista, crea o borra ramas (líneas de trabajo paralelas).'],
  [/^git (switch|checkout)/, 'Cambia de rama (o crea una con -c / -b). Tus archivos cambian al estado de esa rama.'],
  [/^git merge/, 'Une el historial de otra rama dentro de la rama actual. Si ambas tocaron lo mismo, habrá conflicto.'],
  [/^git remote add/, 'Registra una dirección remota (GitHub) con un nombre corto; por convención se llama origin.'],
  [/^git remote/, 'Lista los remotos configurados.'],
  [/^git push/, 'Sube tus commits locales al remoto. -u recuerda la relación para poder usar solo "git push" después.'],
  [/^git fetch/, 'Trae lo nuevo del remoto SIN tocar tus archivos. Solo actualiza origin/rama.'],
  [/^git pull/, 'fetch + merge: trae lo nuevo del remoto y lo une con tu rama actual.'],
  [/^git tag/, 'Marca un commit con una etiqueta fija (por ejemplo una versión v1.0).'],
  [/^git revert/, 'Crea un commit NUEVO que deshace otro commit. Seguro para historia ya publicada.'],
  [/^colega/, 'Comando del simulador: tu compañero sube cambios a GitHub mientras tú trabajas.'],
  [/^github pr-merge/, 'Comando del simulador: equivale al botón verde "Merge pull request" de GitHub.'],
  [/^(mkdir)/, 'Crea una carpeta.'], [/^cd /, 'Entra a una carpeta (cd .. sube un nivel).'],
  [/^ls/, 'Lista los archivos de la carpeta (-a muestra los ocultos como .git).'],
  [/^touch/, 'Crea un archivo vacío.'], [/^cat/, 'Imprime el contenido de un archivo.'],
  [/^echo.*>>/, 'Agrega texto al final del archivo (>> añade, > sobrescribe).'],
  [/^echo.*>/, 'Escribe el texto en un archivo (> sobrescribe todo el contenido).'],
  [/^pwd/, 'Muestra en qué carpeta estás.'], [/^rm/, 'Borra archivos/carpetas (en la terminal real NO hay papelera).'],
  [/^nano/, 'Abre un editor de texto sencillo.']
];
function explain(line) { const l = line.trim(); for (const [re, t] of EXPLAIN) if (re.test(l)) return t; return null; }

function complete(st, line) {
  const m = line.match(/^(.*?)(\S*)$/), head = m[1], word = m[2], toks = head.trim().split(/\s+/).filter(Boolean);
  let cands = [];
  if (!toks.length) cands = [...Object.keys(SH), 'git'].filter(x => x.startsWith(word));
  else if (toks[0] === 'git' && toks.length === 1) cands = GIT_LIST.concat(['help']).filter(x => x.startsWith(word));
  else {
    const slash = word.lastIndexOf('/'), dirPart = slash >= 0 ? word.slice(0, slash + 1) : '', base = word.slice(slash + 1);
    const n = getNode(st, normPath(st.cwd, dirPart || '.'));
    if (n && n.type === 'dir') cands = Object.keys(n.children).filter(x => x.startsWith(base) && (base || !x.startsWith('.'))).sort().map(x => dirPart + x + (n.children[x].type === 'dir' ? '/' : ''));
  }
  if (!cands.length) return { head, list: [], word };
  let pre = cands[0]; for (const x of cands) while (!x.startsWith(pre)) pre = pre.slice(0, -1);
  return { head, list: cands, word, completed: pre };
}

/* vista para los paneles visuales */
function view(st) {
  const R = getRepo(st, st.cwd) || (st.lastRepoRoot && getNode(st, st.lastRepoRoot) && getRepo(st, st.lastRepoRoot));
  if (!R) return null;
  const repo = R.repo, info = statusInfo(st, R), rules = info.rules;
  const workList = [], seenIgn = new Set();
  const headT = info.head, idx = info.idx;
  for (const p of Object.keys(info.work)) {
    if (!(p in idx) && isIgnored(rules, p)) {
      const segs = p.split('/'); let top = p;
      for (let i = 0; i < segs.length; i++) { const cand = segs.slice(0, i + 1).join('/'); if (isIgnored(rules, cand + (i < segs.length - 1 ? '/x' : ''))) { top = cand + (i < segs.length - 1 ? '/' : ''); break; } }
      if (!seenIgn.has(top)) { seenIgn.add(top); workList.push({ path: top, state: 'ignored' }); }
      continue;
    }
    let state = 'clean';
    if (info.conflicts.includes(p)) state = 'conflict'; else if (!(p in idx)) state = 'untracked'; else if (info.work[p] !== idx[p]) state = 'modified'; else if (idx[p] !== headT[p]) state = 'staged';
    workList.push({ path: p, state });
  }
  for (const p of Object.keys(idx)) if (!(p in info.work)) workList.push({ path: p, state: 'deleted' });
  workList.sort((a, b) => a.path.localeCompare(b.path));
  const set = new Set(); [...Object.values(repo.branches), ...Object.values(repo.remoteRefs), headId(repo)].filter(Boolean).forEach(s => ancestors(st, s).forEach(x => set.add(x)));
  const deco = decorations(st, R);
  const commits = [...set].map(id => commitOf(st, id)).sort((a, b) => b.seq - a.seq).slice(0, 14).map(cm => ({ id: cm.id, short: short(cm.id), msg: cm.msg.split('\n')[0], labels: deco[cm.id] || [], merge: cm.parents.length > 1 }));
  const origin = repo.remotes.origin ? getRemoteRepo(st, repo.remotes.origin) : null;
  let remote = null;
  if (repo.remotes.origin) {
    remote = { url: repo.remotes.origin.replace(/^https:\/\//, '').replace(/\.git$/, ''), exists: !!origin, commits: [] };
    if (origin) {
      const rs = new Set(); Object.values(origin.branches).forEach(s => ancestors(st, s).forEach(x => rs.add(x)));
      const rl = {}; Object.keys(origin.branches).forEach(b => (rl[origin.branches[b]] = rl[origin.branches[b]] || []).push(b));
      remote.commits = [...rs].map(id => commitOf(st, id)).sort((a, b) => b.seq - a.seq).slice(0, 10).map(cm => ({ id: cm.id, short: short(cm.id), msg: cm.msg.split('\n')[0], labels: rl[cm.id] || [], merge: cm.parents.length > 1 }));
    }
  }
  return { root: R.root, name: R.root.split('/').pop(), branch: repo.head.type === 'branch' ? repo.head.name : 'HEAD', work: workList, staged: info.staged, commits, remote, merging: !!repo.merging, tracking: trackingInfo(st, R) };
}

root.GitSim = {
  newState, run, view, explain, complete, HOME,
  H: { getRepo, getNode, cat, statusInfo, headTree, headId, commitOf, ancestors, isAncestor, normPath, workingFiles, isIgnored, parseIgnore, getRemoteRepo, treeOf, ensureRemoteRepo, dict, ignoreRules },
  saveFile(st, path, content) { writeFile(st, path, content); }
};
if (typeof module !== 'undefined') module.exports = root.GitSim;
})(typeof window !== 'undefined' ? window : globalThis);
