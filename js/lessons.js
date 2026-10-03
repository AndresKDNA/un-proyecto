/* lessons.js — contenido del curso: lecciones guiadas, retos, quiz y chuleta. */
(function (root) {
'use strict';

const CFG = ['git config --global user.name "Ana Torres"', 'git config --global user.email "ana@kdnastudio.com"'];
const URL = n => 'https://github.com/kdnastudio/' + n + '.git';

/* ayudante para los checks: se construye por cada evaluación */
function mkCtx(st) {
  const H = root.GitSim.H, ctx = { st, cwd: st.cwd, H };
  ctx.ran = re => st.history.some(h => h.ok && re.test(h.cmd));
  ctx.count = re => st.history.filter(h => h.ok && re.test(h.cmd)).length;
  ctx.out = (cre, ore) => st.history.some(h => cre.test(h.cmd) && ore.test(h.out));
  ctx.file = p => H.cat(st, p.startsWith('/') ? p : '/home/dev/' + p);
  ctx.isDir = p => { const n = H.getNode(st, p); return !!n && n.type === 'dir'; };
  ctx.exists = p => !!H.getNode(st, p);
  ctx.repo = p => { const R = H.getRepo(st, p); return R && R.root === p ? R : null; };
  ctx.tip = (R, b) => R.repo.branches[b] || null;
  ctx.headId = R => H.headId(R.repo);
  ctx.treeAt = id => id ? H.treeOf(st, id) : H.dict();
  ctx.headTree = R => ctx.treeAt(ctx.headId(R));
  ctx.remoteTip = (url, b) => { const r = H.getRemoteRepo(st, url); return (r && r.branches[b]) || null; };
  ctx.remoteRepo = url => H.getRemoteRepo(st, url);
  ctx.count_commits = R => { const h = ctx.headId(R); return h ? H.ancestors(st, h).size : 0; };
  ctx.info = R => H.statusInfo(st, R);
  ctx.commit = id => H.commitOf(st, id);
  ctx.ignored = (R, rel) => H.isIgnored(H.ignoreRules(st, R), rel);
  ctx.branch = R => R.repo.head.type === 'branch' ? R.repo.head.name : null;
  ctx.clean = R => { const i = ctx.info(R); return !i.staged.length && !i.unstaged.length && !i.untracked.length; };
  return ctx;
}

const FLOW = `<div class="flow">
  <div class="flow-box wd"><b>Directorio de trabajo</b><span>tus archivos, tal como los editas</span></div>
  <div class="flow-arrow"><code>git add</code>→</div>
  <div class="flow-box st"><b>Staging (index)</b><span>la "foto" que preparas</span></div>
  <div class="flow-arrow"><code>git commit</code>→</div>
  <div class="flow-box lr"><b>Repositorio local</b><span>historial guardado en tu PC</span></div>
  <div class="flow-arrow"><code>git push</code>→</div>
  <div class="flow-box rr"><b>GitHub (remoto)</b><span>copia en la nube</span></div>
</div>
<div class="flow-back"><code>git pull</code> / <code>git fetch</code> traen los cambios de vuelta: GitHub → tu repositorio local</div>`;

/* ═══════════════ LECCIONES ═══════════════ */
const LESSONS = [
{
  id: 'terminal', n: 0, title: 'La terminal en 5 minutos', tag: 'Base',
  summary: 'Antes de Git necesitas moverte por carpetas y crear archivos desde la terminal.',
  body: `<p>Git se usa casi siempre desde la <b>terminal</b> (una ventana donde escribes comandos en vez de hacer clic). No te asustes: solo necesitas ocho comandos para empezar.</p>
  <p>La terminal siempre está "parada" en una carpeta. El texto <code>dev@kdna:~$</code> es el <b>prompt</b>: te dice quién eres, dónde estás (<code>~</code> = tu carpeta personal) y espera tus órdenes. Cuando estés dentro de un repositorio, entre paréntesis verás también la rama, por ejemplo <code>(main)</code>.</p>
  <div class="tip"><b>Cómo practicar:</b> escribe cada comando en la terminal simulada y pulsa <kbd>Enter</kbd>. Puedes hacer clic en los comandos <span class="fake-code">azules</span> de la misión para insertarlos solos. <kbd>↑</kbd> repite comandos anteriores y <kbd>Tab</kbd> autocompleta nombres.</div>`,
  cmds: [
    ['pwd', 'Muestra la carpeta actual ("print working directory").'],
    ['ls  /  ls -a', 'Lista archivos. Con <code>-a</code> también los ocultos (los que empiezan con punto, como <code>.git</code>).'],
    ['cd carpeta  /  cd ..', 'Entra a una carpeta / sube un nivel.'],
    ['mkdir nombre', 'Crea una carpeta.'],
    ['touch archivo', 'Crea un archivo vacío.'],
    ['echo "texto" &gt; archivo', 'Escribe texto en un archivo (<code>&gt;</code> sobrescribe, <code>&gt;&gt;</code> agrega al final).'],
    ['cat archivo', 'Muestra el contenido de un archivo.'],
    ['nano archivo', 'Abre un editor de texto sencillo (aquí abre una ventanita).']
  ],
  setup: [],
  tasks: [
    { t: 'Averigua en qué carpeta estás', sol: ['pwd'], check: c => c.ran(/^pwd$/) },
    { t: 'Crea una carpeta llamada <b>practica</b>', sol: ['mkdir practica'], check: c => c.isDir('/home/dev/practica') },
    { t: 'Entra a la carpeta <b>practica</b>', sol: ['cd practica'], check: c => c.cwd === '/home/dev/practica' },
    { t: 'Crea el archivo <b>hola.txt</b> con el texto Hola Git', sol: ['echo "Hola Git" > hola.txt'], hint: 'Usa <code>echo "Hola Git" &gt; hola.txt</code> (o <code>nano hola.txt</code>)', check: c => (c.file('/home/dev/practica/hola.txt') || '').includes('Hola Git') },
    { t: 'Lee el contenido del archivo', sol: ['cat hola.txt'], check: c => c.ran(/^cat\s+hola\.txt/) },
    { t: 'Lista los archivos <b>incluyendo los ocultos</b>', sol: ['ls -a'], check: c => c.ran(/^ls\s+-\w*a/) },
    { t: 'Vuelve a la carpeta anterior', sol: ['cd ..'], check: c => c.cwd === '/home/dev' && c.ran(/^cd \.\.\/?$/) }
  ]
},
{
  id: 'conceptos', n: 1, title: 'Qué es Git y qué es GitHub', tag: 'Concepto',
  summary: 'Las 4 zonas por las que viaja tu código. Si entiendes este dibujo, entiendes Git.',
  body: `<p><b>Git</b> es un programa que vive en tu computador y <b>guarda el historial</b> de tu proyecto: cada versión, quién la hizo y por qué. Es como un "control de cambios" de Word, pero para carpetas enteras y mucho más potente.</p>
  <p><b>GitHub</b> es una página web (un servicio) donde subes una copia de tu repositorio para respaldarlo, compartirlo y trabajar en equipo. Git y GitHub <u>no son lo mismo</u>: Git funciona sin internet; GitHub es solo un lugar remoto donde guardar tus repos (existen también GitLab y Bitbucket).</p>
  <h4>El viaje de un cambio: 4 zonas</h4>${FLOW}
  <ul class="list">
    <li><b>Directorio de trabajo:</b> los archivos que ves y editas.</li>
    <li><b>Staging:</b> sala de preparación. Eliges <i>qué</i> cambios irán en el próximo commit.</li>
    <li><b>Repositorio local:</b> la carpeta oculta <code>.git</code>. Cada <b>commit</b> es una foto permanente con mensaje, autor y fecha.</li>
    <li><b>Remoto (GitHub):</b> la copia en la nube. Se sincroniza con <code>push</code> (subir) y <code>pull</code> (bajar).</li>
  </ul>
  <div class="tip"><b>Mira el panel "Las 4 zonas"</b> debajo de la terminal: se irá llenando a medida que practiques. Es tu mapa en vivo.</div>
  <h4>Vocabulario esencial</h4>
  <ul class="list"><li><b>Repositorio (repo):</b> proyecto + su historial.</li><li><b>Commit:</b> punto guardado en el historial.</li><li><b>Rama (branch):</b> línea de trabajo paralela.</li><li><b>HEAD:</b> "dónde estás parado" ahora mismo.</li><li><b>origin:</b> nombre por defecto del remoto.</li></ul>`,
  cmds: [
    ['git --version', 'Comprueba que Git está instalado y su versión.'],
    ['git help', 'Lista de comandos disponibles (en el simulador).']
  ],
  setup: [],
  tasks: [
    { t: 'Comprueba la versión de Git', sol: ['git --version'], check: c => c.ran(/^git --version/) },
    { t: 'Mira la lista de comandos de Git', sol: ['git help'], check: c => c.ran(/^git help/) }
  ]
},
{
  id: 'init', n: 2, title: 'Crear el proyecto: git init', tag: 'Empezar',
  summary: 'Crea una carpeta, conviértela en repositorio y dile a Git quién eres.',
  body: `<p>Todo proyecto con Git empieza igual: <b>una carpeta</b> y un <code>git init</code>. Ese comando crea la carpeta oculta <code>.git</code>, que es el "cerebro" del repositorio. <u>Nunca borres ni edites a mano</u> esa carpeta.</p>
  <p>Antes de tu primer commit, Git necesita saber quién eres: tu nombre y correo quedarán grabados en cada commit. Se configura <b>una sola vez</b> por computador con <code>--global</code>.</p>
  <div class="tip"><b>Tip:</b> usa el mismo correo que tienes en tu cuenta de GitHub; así GitHub te atribuye tus commits.</div>`,
  cmds: [
    ['git init', 'Convierte la carpeta actual en un repositorio nuevo.'],
    ['git config --global user.name "Tu Nombre"', 'Tu nombre para los commits (una vez por PC).'],
    ['git config --global user.email "tu@correo.com"', 'Tu correo para los commits.'],
    ['git config --list', 'Muestra toda la configuración activa.'],
    ['git status', 'Estado actual del repo (lo usarás cientos de veces).']
  ],
  setup: [],
  tasks: [
    { t: 'Crea la carpeta <b>mi-proyecto</b>', sol: ['mkdir mi-proyecto'], check: c => c.isDir('/home/dev/mi-proyecto') },
    { t: 'Entra a <b>mi-proyecto</b>', sol: ['cd mi-proyecto'], check: c => c.cwd === '/home/dev/mi-proyecto' },
    { t: 'Inicializa el repositorio', sol: ['git init'], check: c => !!c.repo('/home/dev/mi-proyecto') },
    { t: 'Mira los archivos ocultos y encuentra la carpeta <b>.git</b>', sol: ['ls -a'], check: c => c.ran(/^ls\s+-\w*a/) },
    { t: 'Configura tu <b>nombre</b> (global)', sol: ['git config --global user.name "Ana Torres"'], hint: 'Pon tu nombre real entre comillas: <code>git config --global user.name "Tu Nombre"</code>', check: c => !!c.st.globalConfig['user.name'] },
    { t: 'Configura tu <b>correo</b> (global)', sol: ['git config --global user.email "ana@kdnastudio.com"'], hint: '<code>git config --global user.email "tu@correo.com"</code>', check: c => !!c.st.globalConfig['user.email'] },
    { t: 'Consulta el estado del repositorio', sol: ['git status'], check: c => c.ran(/^git status/) }
  ]
},
{
  id: 'primer-commit', n: 3, title: 'README y tu primer commit', tag: 'Empezar',
  summary: 'El ciclo que repetirás toda la vida: editar → status → add → commit.',
  body: `<p>El <b>README.md</b> es la portada del proyecto: lo primero que se ve en GitHub. Se escribe en Markdown (<code># Título</code> = título grande).</p>
  <h4>El ciclo básico</h4>
  <ol class="list"><li>Editas archivos.</li><li><code>git status</code> para ver qué cambió (rojo = sin preparar, verde = preparado).</li><li><code>git add archivo</code> para elegir qué entra en el commit.</li><li><code>git commit -m "mensaje"</code> para guardar la foto.</li></ol>
  <p>Un buen mensaje de commit dice <b>qué hiciste</b>, corto y claro: <code>"Agrega README"</code>, <code>"Corrige error del login"</code>. Evita <code>"cambios"</code> o <code>"asdf"</code>.</p>
  <div class="tip"><b>Atajo:</b> <code>git add .</code> prepara <i>todo</i> lo que cambió. Cómodo, pero revisa antes con <code>git status</code> para no subir cosas que no quieres.</div>`,
  cmds: [
    ['nano README.md', 'Abre el editor (en el simulador: una ventana con Guardar).'],
    ['git add README.md', 'Prepara ese archivo para el commit.'],
    ['git add .', 'Prepara todos los cambios de la carpeta actual.'],
    ['git commit -m "mensaje"', 'Guarda los cambios preparados con un mensaje.'],
    ['git log', 'Historial completo.'],
    ['git log --oneline', 'Historial compacto: una línea por commit.']
  ],
  setup: ['mkdir mi-proyecto', 'cd mi-proyecto', 'git init', ...CFG],
  tasks: [
    { t: 'Crea el archivo <b>README.md</b> con un título', sol: ['echo "# Mi proyecto" > README.md'], hint: '<code>echo "# Mi proyecto" &gt; README.md</code> o abre el editor con <code>nano README.md</code>', check: c => (c.file('/home/dev/mi-proyecto/README.md') || '').trim().length > 1 },
    { t: 'Mira el estado: README.md aparece como <b>sin seguimiento</b> (rojo)', sol: ['git status'], check: c => c.ran(/^git status/) },
    { t: 'Prepara README.md con <b>git add</b>', sol: ['git add README.md'], check: c => { const R = c.repo('/home/dev/mi-proyecto'); return R && 'README.md' in R.repo.index; } },
    { t: 'Vuelve a mirar el estado: ahora está en verde', sol: ['git status'], check: c => c.count(/^git status/) >= 2 },
    { t: 'Haz tu primer <b>commit</b>', sol: ['git commit -m "Agrega README"'], check: c => { const R = c.repo('/home/dev/mi-proyecto'); return R && c.count_commits(R) >= 1; } },
    { t: 'Mira el historial en una línea', sol: ['git log --oneline'], check: c => c.ran(/^git log/) }
  ]
},
{
  id: 'gitignore', n: 4, title: '.gitignore: lo que NO se sube', tag: 'Buenas prácticas',
  summary: 'Contraseñas, dependencias y basura nunca deben entrar al repositorio.',
  body: `<p>Hay archivos que <b>nunca</b> deben ir al repositorio:</p>
  <ul class="list"><li><code>.env</code> — contraseñas y claves API (¡un error clásico y peligroso!).</li><li><code>node_modules/</code> — miles de archivos que se reinstalan con <code>npm install</code>.</li><li><code>*.log</code>, archivos temporales, carpetas <code>bin/</code> <code>obj/</code>, etc.</li></ul>
  <p>Para eso existe el archivo <b>.gitignore</b>: una lista de patrones que Git ignora. Va en la raíz del proyecto y <u>sí se sube</u> (así todo el equipo ignora lo mismo).</p>
  <pre class="code">node_modules/   # una carpeta completa
.env            # un archivo concreto
*.log           # cualquier archivo que termine en .log
!importante.log # excepción: este sí</pre>
  <div class="warn"><b>Ojo:</b> .gitignore solo afecta a archivos que Git <i>aún no sigue</i>. Si ya hiciste commit de un <code>.env</code>, ignorarlo después no lo borra del historial (verás cómo arreglarlo en el reto "Secreto subido por error").</div>`,
  cmds: [
    ['nano .gitignore', 'Crea/edita el archivo con la lista de patrones.'],
    ['git status', 'Comprueba que los ignorados ya no aparecen.'],
    ['git add .', 'Ahora sí es seguro: lo ignorado no entra.'],
    ['git add -f archivo', 'Fuerza añadir un archivo ignorado (casi nunca lo necesitas).']
  ],
  setup: [...CFG, 'mkdir tienda', 'cd tienda', 'git init', 'echo "# Tienda" > README.md', 'git add README.md', 'git commit -m "Primer commit"',
    'echo "<h1>Hola</h1>" > index.html', 'mkdir node_modules', 'echo "module.exports = 1" > node_modules/lib.js', 'echo "API_KEY=sk-123-muy-secreta" > .env', 'echo "error 500" > debug.log'],
  tasks: [
    { t: 'Mira el desastre: <b>git status</b> lista .env, node_modules y debug.log', sol: ['git status'], check: c => c.out(/^git status/, /node_modules/) },
    { t: 'Crea <b>.gitignore</b> que ignore <code>node_modules/</code>, <code>.env</code> y <code>*.log</code>', sol: ['echo -e "node_modules/\\n.env\\n*.log" > .gitignore'], hint: 'Lo más fácil: <code>nano .gitignore</code>, escribe una línea por patrón y pulsa Guardar.', check: c => { const R = c.repo('/home/dev/tienda'); return R && c.ignored(R, '.env') && c.ignored(R, 'node_modules/lib.js') && c.ignored(R, 'debug.log'); } },
    { t: 'Comprueba con <b>git status</b>: ya no aparecen los 3 archivos peligrosos', sol: ['git status'], check: c => { const R = c.repo('/home/dev/tienda'); if (!R || !c.ran(/^git status/)) return false; const f = c.info(R).untrackedFiles; return f.includes('.gitignore') && !f.some(p => /^(\.env|debug\.log|node_modules)/.test(p)) && c.out(/^git status/, /\.gitignore/) && c.st.history.filter(h => /^git status/.test(h.cmd)).some(h => !/node_modules/.test(h.out)); } },
    { t: 'Prepara todo con <b>git add .</b>', sol: ['git add .'], check: c => { const R = c.repo('/home/dev/tienda'); return R && '.gitignore' in R.repo.index && 'index.html' in R.repo.index && !('.env' in R.repo.index); } },
    { t: 'Haz commit', sol: ['git commit -m "Agrega index y .gitignore"'], check: c => { const R = c.repo('/home/dev/tienda'); const t = R && c.headTree(R); return t && '.gitignore' in t && 'index.html' in t && !('.env' in t) && !Object.keys(t).some(p => p.startsWith('node_modules')); } },
    { t: 'Confirma que el árbol de trabajo está limpio', sol: ['git status'], check: c => { const R = c.repo('/home/dev/tienda'); return R && c.clean(R) && c.out(/^git status/, /working tree clean/); } }
  ]
},
{
  id: 'historial', n: 5, title: 'Ver cambios y deshacer errores', tag: 'Esencial',
  summary: 'diff para ver qué cambió; restore y reset para arrepentirte sin drama.',
  body: `<p>Git te deja <b>mirar</b> y <b>deshacer</b>. Estas son tus "máquinas del tiempo", de la más suave a la más drástica:</p>
  <table class="tbl"><tr><th>Situación</th><th>Comando</th></tr>
  <tr><td>Quiero ver qué cambié (sin preparar)</td><td><code>git diff</code></td></tr>
  <tr><td>Quiero ver qué hay preparado</td><td><code>git diff --staged</code></td></tr>
  <tr><td>Hice <code>add</code> por error</td><td><code>git restore --staged archivo</code></td></tr>
  <tr><td>Quiero tirar mis cambios de un archivo</td><td><code>git restore archivo</code> <span class="bad">¡irreversible!</span></td></tr>
  <tr><td>Hice un commit y quiero deshacerlo</td><td><code>git reset --hard HEAD~1</code> <span class="bad">borra el commit y sus cambios</span></td></tr></table>
  <p><code>HEAD~1</code> significa "un commit antes del actual". Líneas verdes con <code>+</code> son agregadas y rojas con <code>-</code> son borradas.</p>
  <div class="warn"><b>Regla de oro:</b> <code>reset --hard</code> y <code>restore</code> descartan trabajo sin avisar. Úsalos solo en commits <u>que aún no subiste</u>. Si ya hiciste push, usa <code>git revert</code> (lección 11).</div>`,
  cmds: [
    ['git diff', 'Cambios sin preparar, línea por línea.'],
    ['git diff --staged', 'Cambios ya preparados (lo que entraría al commit).'],
    ['git restore --staged archivo', 'Saca el archivo del staging; tus cambios se conservan.'],
    ['git restore archivo', 'Vuelve el archivo a como estaba en el último commit/staging.'],
    ['git reset --soft HEAD~1', 'Deshace el commit pero deja los cambios preparados.'],
    ['git reset --hard HEAD~1', 'Deshace el commit y descarta los cambios.']
  ],
  setup: [...CFG, 'mkdir app', 'cd app', 'git init', 'echo "console.log(1)" > app.js', 'git add .', 'git commit -m "Version 1"', 'echo "console.log(2)" >> app.js', 'git add .', 'git commit -m "Version 2"', 'echo "console.log(3)" >> app.js'],
  tasks: [
    { t: 'Mira qué cambiaste en <b>app.js</b>', sol: ['git diff'], check: c => c.out(/^git diff/, /\+console\.log\(3\)/) },
    { t: 'Prepara el cambio y mira lo preparado con <b>git diff --staged</b>', sol: ['git add app.js', 'git diff --staged'], check: c => c.ran(/^git diff (--staged|--cached)/) },
    { t: 'Te arrepentiste del add: sácalo del staging (el cambio sigue en el archivo)', sol: ['git restore --staged app.js'], check: c => { const R = c.repo('/home/dev/app'); return R && c.ran(/^git restore --staged/) && !c.info(R).staged.length && (c.file('/home/dev/app/app.js') || '').includes('console.log(3)'); } },
    { t: 'Ahora descarta el cambio del archivo por completo', sol: ['git restore app.js'], check: c => c.ran(/^git restore app\.js/) && !(c.file('/home/dev/app/app.js') || '').includes('console.log(3)') },
    { t: 'Haz un commit "malo": agrega una línea <code>ERROR</code> y commitea con mensaje <b>Commit con error</b>', sol: ['echo "ERROR" >> app.js', 'git commit -am "Commit con error"'], hint: '<code>echo "ERROR" &gt;&gt; app.js</code> y luego <code>git commit -am "Commit con error"</code> (la <code>-a</code> añade y commitea en un paso)', check: c => c.ran(/Commit con error/) },
    { t: 'Deshaz ese commit malo con <b>git reset --hard HEAD~1</b>', sol: ['git reset --hard HEAD~1'], check: c => { const R = c.repo('/home/dev/app'); return R && c.ran(/^git reset --hard/) && c.count_commits(R) === 2 && !(c.file('/home/dev/app/app.js') || '').includes('ERROR'); } },
    { t: 'Confirma con <b>git log --oneline</b> que volviste a 2 commits', sol: ['git log --oneline'], check: c => c.count(/^git log/) >= 1 && c.out(/^git log/, /Version 2/) && !c.st.history.slice(-1)[0].out.includes('Commit con error') }
  ]
},
{
  id: 'ramas', n: 6, title: 'Ramas y merge', tag: 'Esencial',
  summary: 'Trabaja en una función nueva sin romper lo que ya funciona, y únela después.',
  body: `<p>Una <b>rama</b> es una línea de historia paralela. <code>main</code> es tu rama principal (la que "funciona"). Para cada función nueva o arreglo creas una rama, trabajas tranquilo, y cuando está lista la <b>fusionas</b> (<i>merge</i>) en main.</p>
  <div class="diagram"><svg viewBox="0 0 560 130" role="img" aria-label="Diagrama de ramas">
    <line x1="30" y1="40" x2="530" y2="40" class="ln"/><line x1="170" y1="40" x2="230" y2="100" class="ln"/><line x1="230" y1="100" x2="350" y2="100" class="ln br"/><line x1="350" y1="100" x2="410" y2="40" class="ln br"/>
    <circle cx="60" cy="40" r="9" class="c"/><circle cx="170" cy="40" r="9" class="c"/><circle cx="260" cy="100" r="9" class="c b"/><circle cx="330" cy="100" r="9" class="c b"/><circle cx="410" cy="40" r="11" class="c m"/><circle cx="500" cy="40" r="9" class="c"/>
    <text x="14" y="22" class="t">main</text><text x="240" y="130" class="t">feature-login</text><text x="385" y="22" class="t">merge</text></svg></div>
  <p>Como el historial de <code>main</code> no cambió mientras trabajabas, a veces el merge es un simple "avance rápido" (<i>fast-forward</i>): Git solo mueve el puntero de main. Si ambas ramas avanzaron, Git crea un <b>commit de merge</b>.</p>
  <div class="tip">Al cambiar de rama <b>tus archivos cambian</b>: verás desaparecer o aparecer archivos. Es normal, ¡es como viajar en el tiempo!</div>`,
  cmds: [
    ['git branch', 'Lista las ramas (la actual lleva *).'],
    ['git switch -c nombre', 'Crea una rama nueva y cambia a ella.'],
    ['git switch nombre', 'Cambia a una rama existente (también sirve <code>git checkout nombre</code>).'],
    ['git merge nombre', 'Fusiona la rama "nombre" dentro de la rama actual.'],
    ['git branch -d nombre', 'Borra una rama ya fusionada.'],
    ['git log --oneline --graph', 'Historial con forma de ramas.']
  ],
  setup: [...CFG, 'mkdir sitio', 'cd sitio', 'git init', 'echo "<h1>Sitio</h1>" > index.html', 'git add .', 'git commit -m "Agrega index"', 'echo "h1 { color: red }" > style.css', 'git add .', 'git commit -m "Agrega estilos"'],
  tasks: [
    { t: 'Lista las ramas que existen', sol: ['git branch'], check: c => c.ran(/^git branch$/) },
    { t: 'Crea y entra a la rama <b>feature-login</b>', sol: ['git switch -c feature-login'], check: c => { const R = c.repo('/home/dev/sitio'); return R && 'feature-login' in R.repo.branches; } },
    { t: 'En esa rama crea <b>login.html</b> y haz commit', sol: ['echo "<form></form>" > login.html', 'git add login.html', 'git commit -m "Agrega login"'], hint: '<code>echo "&lt;form&gt;&lt;/form&gt;" &gt; login.html</code>, luego <code>git add login.html</code> y <code>git commit -m "Agrega login"</code>', check: c => { const R = c.repo('/home/dev/sitio'); const t = R && c.treeAt(c.tip(R, 'feature-login')); return t && 'login.html' in t; } },
    { t: 'Vuelve a la rama <b>main</b>', sol: ['git switch main'], check: c => { const R = c.repo('/home/dev/sitio'); return R && c.branch(R) === 'main' && R.repo.branches['feature-login'] && c.ran(/^git switch main|^git checkout main/); } },
    { t: 'Haz <b>ls</b> y comprueba que login.html <u>no existe</u> en main (¡viaje en el tiempo!)', sol: ['ls'], check: c => c.ran(/^ls/) && !c.exists('/home/dev/sitio/login.html') && c.cwd === '/home/dev/sitio' },
    { t: 'Fusiona la rama: <b>git merge feature-login</b>', sol: ['git merge feature-login'], check: c => { const R = c.repo('/home/dev/sitio'); return R && c.branch(R) === 'main' && 'login.html' in c.headTree(R); } },
    { t: 'Mira el historial con forma de ramas', sol: ['git log --oneline --graph'], check: c => c.ran(/^git log.*--graph/) },
    { t: 'Borra la rama ya fusionada', sol: ['git branch -d feature-login'], check: c => { const R = c.repo('/home/dev/sitio'); return R && c.ran(/^git branch -d/) && !('feature-login' in R.repo.branches); } }
  ]
},
{
  id: 'github', n: 7, title: 'Conectar con GitHub: remote y push', tag: 'GitHub',
  summary: 'Crea el repositorio vacío en GitHub, conéctalo y sube tu historial.',
  body: `<h4>Paso A — Crear el repositorio en GitHub (en el navegador)</h4>
  <div class="mock">
    <div class="mock-bar"><i></i><i></i><i></i><span>github.com/new</span></div>
    <div class="mock-body"><div class="mock-h">Create a new repository</div>
      <div class="mock-row"><label>Repository name *</label><div class="mock-inp">mi-sitio</div></div>
      <div class="mock-row"><label>Visibility</label><div class="mock-inp">○ Public &nbsp; ● Private</div></div>
      <div class="mock-row warn2"><label>Initialize this repository with:</label><div class="mock-inp">☐ Add a README &nbsp; ☐ .gitignore &nbsp; ☐ license &nbsp; <b>← déjalos SIN marcar</b></div></div>
      <div class="mock-btn">Create repository</div></div></div>
  <p>Déjalo <b>vacío</b> (sin README) porque ya tienes uno en tu PC; si no, los historiales chocarían. GitHub te mostrará una URL como <code>https://github.com/tuusuario/mi-sitio.git</code>.</p>
  <h4>Paso B — Conectar y subir (en tu terminal)</h4>
  <ol class="list"><li><code>git remote add origin URL</code> — "origin" es el apodo de esa URL.</li><li><code>git branch -M main</code> — asegura que tu rama se llame <code>main</code>.</li><li><code>git push -u origin main</code> — sube tu rama. La <code>-u</code> recuerda el vínculo: desde ahora basta <code>git push</code>.</li></ol>
  <h4>¿Y la contraseña?</h4>
  <p>GitHub <b>ya no acepta tu contraseña</b> en la terminal. Tienes dos caminos: <b>HTTPS + token</b> (un "Personal Access Token" que creas en <i>Settings → Developer settings</i> y pegas cuando te lo pida) o <b>SSH</b> (generas una llave con <code>ssh-keygen</code> y subes la pública a GitHub; después nunca más te piden nada). El simulador no pide credenciales, pero en tu PC real lo verás.</p>
  <div class="tip">Prueba con <code>ssh -T git@github.com</code> en el simulador para ver el mensaje de "autenticación correcta".</div>`,
  cmds: [
    ['git remote add origin URL', 'Registra el remoto con el nombre <code>origin</code>.'],
    ['git remote -v', 'Muestra los remotos y sus URLs.'],
    ['git branch -M main', 'Renombra la rama actual a main.'],
    ['git push -u origin main', 'Primera subida: sube y recuerda <code>origin/main</code> como destino.'],
    ['git push', 'Las siguientes veces: sube tus commits nuevos.']
  ],
  setup: [...CFG, 'mkdir mi-sitio', 'cd mi-sitio', 'git init', 'echo "# Mi sitio" > README.md', 'git add .', 'git commit -m "Primer commit"', 'echo "<h1>Hola</h1>" > index.html', 'git add .', 'git commit -m "Agrega index"'],
  tasks: [
    { t: 'Conecta el remoto <b>origin</b> con la URL <code>https://github.com/kdnastudio/mi-sitio.git</code>', sol: ['git remote add origin ' + URL('mi-sitio')], check: c => { const R = c.repo('/home/dev/mi-sitio'); return R && !!R.repo.remotes.origin; } },
    { t: 'Verifica el remoto con <b>git remote -v</b>', sol: ['git remote -v'], check: c => c.ran(/^git remote -v/) },
    { t: 'Asegura el nombre de la rama: <b>git branch -M main</b>', sol: ['git branch -M main'], check: c => c.ran(/^git branch -M main/) },
    { t: 'Sube por primera vez con <b>git push -u origin main</b>', sol: ['git push -u origin main'], check: c => { const R = c.repo('/home/dev/mi-sitio'); return R && c.remoteTip(R.repo.remotes.origin || '', 'main') === c.tip(R, 'main') && !!c.tip(R, 'main'); } },
    { t: 'Comprueba con <b>git status</b> que estás al día con origin/main', sol: ['git status'], check: c => c.out(/^git status/, /up to date with 'origin\/main'/) },
    { t: 'Haz un cambio en el README, commit y <b>git push</b> (sin más parámetros)', sol: ['echo "Sitio de prueba" >> README.md', 'git commit -am "Actualiza README"', 'git push'], check: c => { const R = c.repo('/home/dev/mi-sitio'); return R && c.count_commits(R) >= 3 && c.remoteTip(R.repo.remotes.origin || '', 'main') === c.tip(R, 'main'); } }
  ]
},
{
  id: 'colaborar', n: 8, title: 'Clonar, fetch y pull', tag: 'GitHub',
  summary: 'Descarga un repo ajeno y mantente al día con lo que sube tu equipo.',
  body: `<p><b>Clonar</b> (<code>git clone URL</code>) descarga el repositorio completo con todo su historial y deja configurado el remoto <code>origin</code>. No necesitas <code>git init</code>.</p>
  <p>Cuando un compañero sube cambios, <b>tu copia local no se entera sola</b>. Tienes dos opciones:</p>
  <table class="tbl"><tr><th>Comando</th><th>Qué hace</th></tr><tr><td><code>git fetch</code></td><td>Trae lo nuevo pero <b>no toca tus archivos</b>. Solo actualiza <code>origin/main</code>. Seguro para "echar un vistazo".</td></tr><tr><td><code>git pull</code></td><td><code>fetch</code> + <code>merge</code>: trae y <b>une</b> con tu rama actual.</td></tr></table>
  <div class="tip">En esta lección existe un comando mágico <code>colega push</code> que <b>simula</b> a Marta subiendo cambios a GitHub. No existe en la vida real: es solo para que practiques sin necesitar otra persona.</div>
  <div class="warn"><b>Hábito sano:</b> haz <code>git pull</code> <u>antes</u> de empezar a trabajar y antes de hacer push.</div>`,
  cmds: [
    ['git clone URL', 'Descarga el repo en una carpeta nueva.'],
    ['git fetch', 'Descarga novedades sin mezclar.'],
    ['git pull', 'Descarga y mezcla con tu rama.'],
    ['git status', 'Te avisa si estás "behind" (atrasado) o "ahead" (adelantado).'],
    ['colega push', '<i>(simulador)</i> Marta sube un cambio a GitHub.']
  ],
  setup: [...CFG],
  tasks: [
    { t: 'Clona <code>https://github.com/kdnastudio/demo-web.git</code>', sol: ['git clone ' + URL('demo-web')], check: c => !!c.repo('/home/dev/demo-web') },
    { t: 'Entra a la carpeta <b>demo-web</b>', sol: ['cd demo-web'], check: c => c.cwd === '/home/dev/demo-web' },
    { t: 'Mira el historial que descargaste', sol: ['git log --oneline'], check: c => c.out(/^git log/, /Agrega estilos/) },
    { t: 'Haz que tu colega Marta suba un cambio: <b>colega push</b>', sol: ['colega push'], check: c => c.ran(/^colega/) },
    { t: 'Trae las novedades sin mezclar: <b>git fetch</b>', sol: ['git fetch'], check: c => { const R = c.repo('/home/dev/demo-web'); return R && R.repo.remoteRefs['origin/main'] !== R.repo.branches.main; } },
    { t: 'Mira <b>git status</b>: dirá que estás <i>behind</i> (atrasado)', sol: ['git status'], check: c => c.out(/^git status/, /behind/) },
    { t: 'Mezcla las novedades con <b>git pull</b>', sol: ['git pull'], check: c => { const R = c.repo('/home/dev/demo-web'); return R && R.repo.remoteRefs['origin/main'] === R.repo.branches.main && c.exists('/home/dev/demo-web/colega.txt'); } },
    { t: 'Crea <b>notas.txt</b>, haz commit y <b>git push</b>', sol: ['echo "Mis notas" > notas.txt', 'git add .', 'git commit -m "Agrega notas"', 'git push'], check: c => { const R = c.repo('/home/dev/demo-web'); return R && 'notas.txt' in c.headTree(R) && c.remoteTip(R.repo.remotes.origin, 'main') === c.tip(R, 'main'); } }
  ]
},
{
  id: 'conflictos', n: 9, title: 'Conflictos de merge', tag: 'Avanzado',
  summary: 'Dos personas editaron la misma línea. No es un error: es Git pidiéndote que decidas.',
  body: `<p>Un <b>conflicto</b> ocurre cuando dos versiones cambiaron <u>la misma zona</u> de un archivo y Git no puede adivinar cuál es la correcta. Te deja el archivo marcado así:</p>
  <pre class="code"><span class="m1">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</span>
Titulo: Version de Ana        <span class="dim">← lo tuyo (rama actual)</span>
<span class="m2">=======</span>
Titulo: Version de Luis       <span class="dim">← lo que viene de la otra rama</span>
<span class="m1">&gt;&gt;&gt;&gt;&gt;&gt;&gt; origin/main</span></pre>
  <h4>Cómo resolverlo (siempre igual)</h4>
  <ol class="list"><li>Abre el archivo, <b>decide</b> qué texto queda y <b>borra las 3 líneas de marcas</b> (<code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>).</li><li><code>git add archivo</code> — le dices a Git "ya lo resolví".</li><li><code>git commit -m "..."</code> — cierra el merge.</li><li><code>git push</code>.</li></ol>
  <div class="tip">Si te asustas a mitad: <code>git merge --abort</code> te devuelve al estado de antes del merge. Sin consecuencias.</div>
  <p>En el simulador <code>git pull</code> usa merge (el comportamiento clásico).</p>`,
  cmds: [
    ['git pull', 'Si hay choque, te avisa con <code>CONFLICT</code>.'],
    ['git status', 'Lista "Unmerged paths": los archivos en conflicto.'],
    ['nano archivo', 'Editas y quitas las marcas.'],
    ['git add archivo', 'Marca el conflicto como resuelto.'],
    ['git commit -m "..."', 'Finaliza el merge.'],
    ['git merge --abort', 'Cancela todo y vuelve atrás.']
  ],
  setup: [...CFG, 'mkdir sitio', 'cd sitio', 'git init', 'echo "Titulo: Mi sitio" > README.md', 'git add .', 'git commit -m "Primer commit"', 'git remote add origin ' + URL('sitio-conflicto'), 'git push -u origin main'],
  tasks: [
    { t: 'Cambia el README a <code>Titulo: Version de Ana</code> y haz commit', sol: ['echo "Titulo: Version de Ana" > README.md', 'git commit -am "Titulo de Ana"'], check: c => { const R = c.repo('/home/dev/sitio'); return R && (c.headTree(R)['README.md'] || '').includes('Ana'); } },
    { t: 'Tu colega edita la misma línea en GitHub: <code>colega editar README.md "Titulo: Version de Luis"</code>', sol: ['colega editar README.md "Titulo: Version de Luis"'], check: c => c.ran(/^colega editar/) },
    { t: 'Intenta subir con <b>git push</b>: GitHub lo <u>rechaza</u>', sol: ['git push'], check: c => c.out(/^git push/, /rejected/) },
    { t: 'Haz <b>git pull</b> para traer lo de Luis: aparecerá el <b>CONFLICT</b>', sol: ['git pull'], check: c => { const R = c.repo('/home/dev/sitio'); return R && !!R.repo.merging; } },
    { t: 'Mira cómo quedó el archivo con <b>cat README.md</b>', sol: ['cat README.md'], check: c => c.ran(/^cat README\.md/) && (c.file('/home/dev/sitio/README.md') || '').includes('<<<<<<<') },
    { t: 'Resuelve: deja el archivo solo con <code>Titulo: Version final</code> (sin marcas)', sol: ['echo "Titulo: Version final" > README.md'], hint: '<code>nano README.md</code>, borra todo y escribe <code>Titulo: Version final</code>; o <code>echo "Titulo: Version final" &gt; README.md</code>', check: c => { const f = c.file('/home/dev/sitio/README.md') || ''; const R = c.repo('/home/dev/sitio'); return R && !!R.repo.merging && f.includes('Version final') && !/[<=>]{7}/.test(f); } },
    { t: 'Marca como resuelto: <b>git add README.md</b>', sol: ['git add README.md'], check: c => { const R = c.repo('/home/dev/sitio'); return R && R.repo.merging && R.repo.merging.conflicts.length === 0; } },
    { t: 'Cierra el merge con <b>git commit</b>', sol: ['git commit -m "Resuelvo conflicto del titulo"'], check: c => { const R = c.repo('/home/dev/sitio'); return R && !R.repo.merging && c.commit(c.headId(R)).parents.length === 2; } },
    { t: 'Ahora sí: <b>git push</b>', sol: ['git push'], check: c => { const R = c.repo('/home/dev/sitio'); return R && c.ran(/^git push/) && c.remoteTip(R.repo.remotes.origin, 'main') === c.tip(R, 'main'); } }
  ]
},
{
  id: 'pr', n: 10, title: 'Flujo profesional: rama + Pull Request', tag: 'Flujo real',
  summary: 'Así trabajan los equipos: nunca se commitea directo a main.',
  body: `<p>En equipos reales <b>main está protegida</b>: nadie hace push directo. El flujo estándar (llamado <i>GitHub Flow</i>) es:</p>
  <div class="steps">
    <div><b>1</b> Actualiza main<br><code>git switch main</code><br><code>git pull</code></div>
    <div><b>2</b> Crea una rama<br><code>git switch -c feature/x</code></div>
    <div><b>3</b> Trabaja y commitea<br><code>git add</code> · <code>git commit</code></div>
    <div><b>4</b> Sube la rama<br><code>git push -u origin feature/x</code></div>
    <div><b>5</b> Pull Request en GitHub<br>revisión del equipo</div>
    <div><b>6</b> Merge del PR<br>botón verde</div>
    <div><b>7</b> Limpia<br><code>git switch main</code><br><code>git pull</code><br><code>git branch -d feature/x</code></div>
  </div>
  <p>Un <b>Pull Request</b> (PR) es una petición en GitHub: "por favor revisen y fusionen mi rama en main". Es donde se comenta el código, corren los tests y se aprueba.</p>
  <div class="tip">El paso 5-6 ocurre en la página web de GitHub. Aquí lo simulas con <code>github pr-merge rama</code> (equivale al botón verde "Merge pull request").</div>`,
  cmds: [
    ['git switch -c feature/nombre', 'Rama nueva para tu tarea (el <code>/</code> es solo estilo).'],
    ['git push -u origin feature/nombre', 'Sube la rama a GitHub.'],
    ['github pr-merge feature/nombre', '<i>(simulador)</i> Acepta el Pull Request.'],
    ['git push origin --delete rama', 'Borra la rama en GitHub.']
  ],
  setup: [...CFG, 'mkdir tienda', 'cd tienda', 'git init', 'echo "# Tienda" > README.md', 'echo "<h1>Tienda</h1>" > index.html', 'git add .', 'git commit -m "Base de la tienda"', 'git remote add origin ' + URL('tienda-pr'), 'git push -u origin main'],
  tasks: [
    { t: 'Crea la rama <b>feature/contacto</b> y entra a ella', sol: ['git switch -c feature/contacto'], check: c => { const R = c.repo('/home/dev/tienda'); return R && c.branch(R) === 'feature/contacto'; } },
    { t: 'Crea <b>contacto.html</b> y haz commit en esa rama', sol: ['echo "<h1>Contacto</h1>" > contacto.html', 'git add .', 'git commit -m "Agrega pagina de contacto"'], check: c => { const R = c.repo('/home/dev/tienda'); const t = R && c.treeAt(c.tip(R, 'feature/contacto')); return t && 'contacto.html' in t; } },
    { t: 'Sube la rama: <b>git push -u origin feature/contacto</b>', sol: ['git push -u origin feature/contacto'], check: c => { const R = c.repo('/home/dev/tienda'); return R && !!c.remoteTip(R.repo.remotes.origin, 'feature/contacto'); } },
    { t: '"Aprueba" el Pull Request: <b>github pr-merge feature/contacto</b>', sol: ['github pr-merge feature/contacto'], check: c => { const R = c.repo('/home/dev/tienda'); const t = R && c.treeAt(c.remoteTip(R.repo.remotes.origin, 'main')); return t && 'contacto.html' in t; } },
    { t: 'Vuelve a <b>main</b>', sol: ['git switch main'], check: c => { const R = c.repo('/home/dev/tienda'); return R && c.branch(R) === 'main' && c.ran(/^git switch main|^git checkout main/); } },
    { t: 'Trae el merge del PR con <b>git pull</b>', sol: ['git pull'], check: c => { const R = c.repo('/home/dev/tienda'); return R && c.branch(R) === 'main' && 'contacto.html' in c.headTree(R); } },
    { t: 'Borra la rama local ya fusionada', sol: ['git branch -d feature/contacto'], check: c => { const R = c.repo('/home/dev/tienda'); return R && c.ran(/^git branch -d/) && !('feature/contacto' in R.repo.branches); } },
    { t: 'Borra también la rama en GitHub: <b>git push origin --delete feature/contacto</b>', sol: ['git push origin --delete feature/contacto'], check: c => { const R = c.repo('/home/dev/tienda'); return R && !c.remoteTip(R.repo.remotes.origin, 'feature/contacto') && c.ran(/--delete/); } }
  ]
},
{
  id: 'extras', n: 11, title: 'Stash, tags y revert', tag: 'Extras útiles',
  summary: 'Guardar trabajo a medias, marcar versiones y deshacer algo ya publicado.',
  body: `<h4>git stash — el cajón temporal</h4>
  <p>Estás a medias en algo y necesitas cambiar de rama sin hacer un commit feo. <code>git stash</code> guarda tus cambios en un cajón y deja el directorio limpio; <code>git stash pop</code> los devuelve.</p>
  <h4>git tag — marcar versiones</h4>
  <p>Un <b>tag</b> es una etiqueta fija sobre un commit, ideal para versiones: <code>v1.0</code>. Los tags <u>no se suben solos</u>: <code>git push origin v1.0</code>.</p>
  <h4>git revert — deshacer lo ya publicado</h4>
  <p>Si ya hiciste push de un commit malo, <b>no reescribas la historia</b> (tus compañeros ya la bajaron). Usa <code>git revert</code>: crea un commit <u>nuevo</u> que hace lo contrario del malo. La historia se conserva y es seguro.</p>
  <table class="tbl"><tr><th>¿Ya hiciste push?</th><th>Usa</th></tr><tr><td>No</td><td><code>git reset --hard HEAD~1</code></td></tr><tr><td>Sí</td><td><code>git revert HEAD</code></td></tr></table>`,
  cmds: [
    ['git stash', 'Guarda cambios sin commit y deja todo limpio.'],
    ['git stash list', 'Ver lo guardado.'],
    ['git stash pop', 'Recupera lo último guardado.'],
    ['git tag -a v1.0 -m "texto"', 'Crea una etiqueta anotada en el commit actual.'],
    ['git push origin v1.0', 'Sube esa etiqueta a GitHub.'],
    ['git revert HEAD', 'Crea un commit que deshace el último commit.']
  ],
  setup: [...CFG, 'mkdir panel', 'cd panel', 'git init', 'echo "# Panel" > README.md', 'git add .', 'git commit -m "Inicio"', 'git remote add origin ' + URL('panel'), 'git push -u origin main'],
  tasks: [
    { t: 'Modifica el README (agrega una línea con <code>echo "En proceso" &gt;&gt; README.md</code>)', sol: ['echo "En proceso" >> README.md'], check: c => (c.file('/home/dev/panel/README.md') || '').includes('En proceso') },
    { t: 'Guarda el trabajo a medias con <b>git stash</b> (el README vuelve a la normalidad)', sol: ['git stash'], check: c => { const R = c.repo('/home/dev/panel'); return R && R.repo.stash.length === 1 && c.clean(R); } },
    { t: 'Recupéralo con <b>git stash pop</b>', sol: ['git stash pop'], check: c => { const R = c.repo('/home/dev/panel'); return R && R.repo.stash.length === 0 && (c.file('/home/dev/panel/README.md') || '').includes('En proceso'); } },
    { t: 'Commitea el cambio: <code>git commit -am "Actualiza README"</code>', sol: ['git commit -am "Actualiza README"'], check: c => { const R = c.repo('/home/dev/panel'); return R && c.count_commits(R) === 2; } },
    { t: 'Etiqueta la versión: <b>git tag -a v1.0 -m "Primera version"</b>', sol: ['git tag -a v1.0 -m "Primera version"'], check: c => { const R = c.repo('/home/dev/panel'); return R && 'v1.0' in R.repo.tags; } },
    { t: 'Sube la etiqueta: <b>git push origin v1.0</b>', sol: ['git push origin v1.0'], check: c => { const R = c.repo('/home/dev/panel'); const r = R && c.remoteRepo(R.repo.remotes.origin); return r && 'v1.0' in r.tags; } },
    { t: 'Deshaz el último commit de forma segura: <b>git revert HEAD</b>', sol: ['git revert HEAD'], check: c => { const R = c.repo('/home/dev/panel'); return R && c.commit(c.headId(R)).msg.startsWith('Revert') && c.count_commits(R) === 3; } },
    { t: 'Mira el resultado con <b>git log --oneline</b>', sol: ['git log --oneline'], check: c => c.out(/^git log/, /Revert/) }
  ]
}
];

/* ═══════════════ RETOS ═══════════════ */
const RETOS = [
{
  id: 'r1', n: 1, title: 'Proyecto desde cero', tag: 'Fácil',
  summary: 'Todo el flujo inicial sin ayuda.',
  body: `<p>Crea el proyecto completo desde cero:</p><ul class="list"><li>Una carpeta <b>tienda</b> convertida en repo (tu identidad ya está configurada).</li><li>Un <b>README.md</b> y un <b>.gitignore</b> que ignore <code>node_modules/</code> y <code>.env</code>.</li><li>Un commit con ambos archivos.</li><li>Conectado a <code>https://github.com/kdnastudio/tienda.git</code> como <b>origin</b> y subido.</li></ul>`,
  setup: [...CFG],
  hintText: 'Orden lógico: mkdir → cd → init → crear archivos → add → commit → remote add → push -u.',
  solAll: ['mkdir tienda', 'cd tienda', 'git init', 'echo "# Tienda" > README.md', 'echo -e "node_modules/\\n.env" > .gitignore', 'git add .', 'git commit -m "Inicio"', 'git remote add origin ' + URL('tienda'), 'git push -u origin main'],
  tasks: [
    { t: 'Existe el repo <b>tienda</b> con al menos un commit', check: c => { const R = c.repo('/home/dev/tienda'); return R && c.count_commits(R) >= 1; } },
    { t: 'El commit contiene <b>README.md</b> y <b>.gitignore</b>', check: c => { const R = c.repo('/home/dev/tienda'); const t = R && c.headTree(R); return t && 'README.md' in t && '.gitignore' in t; } },
    { t: '.gitignore ignora <code>.env</code> y <code>node_modules/</code>', check: c => { const R = c.repo('/home/dev/tienda'); return R && c.ignored(R, '.env') && c.ignored(R, 'node_modules/x.js'); } },
    { t: 'Está conectado a GitHub y la rama main quedó subida', check: c => { const R = c.repo('/home/dev/tienda'); return R && R.repo.remotes.origin && c.remoteTip(R.repo.remotes.origin, 'main') === c.tip(R, 'main') && !!c.tip(R, 'main'); } }
  ]
},
{
  id: 'r2', n: 2, title: 'Secreto subido por error', tag: 'Medio',
  summary: 'Un .env quedó dentro del repositorio. Sácalo sin borrar el archivo de tu disco.',
  body: `<p>Alguien hizo commit del archivo <code>.env</code> (con una contraseña) en el proyecto <b>api</b>. Objetivos:</p><ul class="list"><li><code>.env</code> debe dejar de estar en el repositorio (en el último commit).</li><li>El archivo <code>.env</code> <b>debe seguir existiendo</b> en tu carpeta.</li><li>Debe quedar ignorado para que no vuelva a pasar.</li><li>Todo commiteado y el directorio limpio.</li></ul>
  <div class="warn">En la vida real, además debes <b>cambiar esa contraseña</b>: aunque la quites ahora, sigue en el historial antiguo.</div>`,
  setup: [...CFG, 'mkdir api', 'cd api', 'git init', 'echo "# API" > README.md', 'echo "DB_PASS=super-secreto" > .env', 'git add .', 'git commit -m "Primer commit"'],
  hintText: 'Piensa: ¿qué comando deja de seguir un archivo pero lo conserva en disco? (pista: --cached). Luego .gitignore.',
  solAll: ['echo ".env" > .gitignore', 'git rm --cached .env', 'git add .gitignore', 'git commit -m "Dejo de rastrear .env"'],
  tasks: [
    { t: '.env ya <u>no</u> está en el último commit', check: c => { const R = c.repo('/home/dev/api'); return R && c.headId(R) && !('.env' in c.headTree(R)) && c.count_commits(R) >= 2; } },
    { t: 'El archivo .env <u>sigue</u> en tu carpeta', check: c => (c.file('/home/dev/api/.env') || '').includes('DB_PASS') },
    { t: '.env está en el .gitignore', check: c => { const R = c.repo('/home/dev/api'); return R && c.ignored(R, '.env'); } },
    { t: 'Árbol de trabajo limpio', check: c => { const R = c.repo('/home/dev/api'); return R && c.clean(R) && '.gitignore' in c.headTree(R); } }
  ]
},
{
  id: 'r3', n: 3, title: 'Push rechazado', tag: 'Medio',
  summary: 'GitHub no te deja subir. Averigua por qué y arréglalo.',
  body: `<p>Estás en el proyecto <b>web</b>. Hiciste un commit local, pero tu colega Marta subió algo antes. Si intentas <code>git push</code>... prueba y lee el mensaje.</p><p><b>Objetivo:</b> que tu commit (<code>index.html</code>) y el de Marta (<code>colega.txt</code>) estén <u>los dos</u> en GitHub y en tu PC, con local y remoto idénticos.</p>`,
  setup: [...CFG, 'mkdir web', 'cd web', 'git init', 'echo "# Web" > README.md', 'git add .', 'git commit -m "Inicio"', 'git remote add origin ' + URL('web'), 'git push -u origin main', 'colega push', 'echo "<p>hola</p>" > index.html', 'git add .', 'git commit -m "Agrega index"'],
  hintText: 'El remoto tiene commits que tú no tienes. Primero tráelos (pull), luego sube.',
  solAll: ['git pull', 'git push'],
  tasks: [
    { t: 'Tu PC tiene <b>colega.txt</b> y <b>index.html</b>', check: c => { const R = c.repo('/home/dev/web'); const t = R && c.headTree(R); return t && 'colega.txt' in t && 'index.html' in t; } },
    { t: 'GitHub y tu PC apuntan al <u>mismo commit</u> en main', check: c => { const R = c.repo('/home/dev/web'); return R && c.remoteTip(R.repo.remotes.origin, 'main') === c.tip(R, 'main'); } }
  ]
},
{
  id: 'r4', n: 4, title: 'Hotfix urgente sin perder trabajo', tag: 'Medio',
  summary: 'Tienes trabajo a medias y llega un bug urgente.',
  body: `<p>En <b>app</b> estás editando <code>README.md</code> (cambios sin commit). De repente hay que corregir <code>bug.txt</code> (cambiar su contenido a <code>corregido</code>) <b>en una rama llamada hotfix</b> y fusionarla en main.</p><p><b>Objetivos:</b> la rama <code>hotfix</code> existe, main ya contiene la corrección fusionada, estás en <code>main</code> y tu trabajo a medias del README <u>sigue sin commitear</u> en tu carpeta.</p>`,
  setup: [...CFG, 'mkdir app', 'cd app', 'git init', 'echo "# App" > README.md', 'echo "version con bug" > bug.txt', 'git add .', 'git commit -m "Inicio"', 'echo "mi trabajo a medias" >> README.md'],
  hintText: 'Dos caminos: git stash (guardar y recuperar) o simplemente crear la rama (Git lleva contigo los cambios que no chocan).',
  solAll: ['git stash', 'git switch -c hotfix', 'echo "corregido" > bug.txt', 'git commit -am "Corrige bug"', 'git switch main', 'git merge hotfix', 'git stash pop'],
  tasks: [
    { t: 'Existe la rama <b>hotfix</b>', check: c => { const R = c.repo('/home/dev/app'); return R && 'hotfix' in R.repo.branches; } },
    { t: 'main contiene la corrección (<code>bug.txt</code> = corregido)', check: c => { const R = c.repo('/home/dev/app'); const t = R && c.treeAt(c.tip(R, 'main')); return t && (t['bug.txt'] || '').includes('corregido'); } },
    { t: 'Estás en <b>main</b>', check: c => { const R = c.repo('/home/dev/app'); return R && c.branch(R) === 'main'; } },
    { t: 'Tu trabajo a medias del README sigue en la carpeta <u>sin commitear</u>', check: c => { const R = c.repo('/home/dev/app'); return R && (c.file('/home/dev/app/README.md') || '').includes('trabajo a medias') && !(c.headTree(R)['README.md'] || '').includes('trabajo a medias'); } }
  ]
},
{
  id: 'r5', n: 5, title: 'Conflicto entre ramas', tag: 'Difícil',
  summary: 'main y diseno cambiaron la misma línea. Fusiónalas conservando lo mejor de cada una.',
  body: `<p>En el proyecto <b>portada</b>, <code>main</code> cambió el título a <code>&lt;h1&gt;Hola&lt;/h1&gt;</code> y la rama <code>diseno</code> a <code>&lt;h1&gt;Bienvenidos&lt;/h1&gt;</code>. Estás en <code>main</code>.</p><p><b>Objetivo:</b> fusiona <code>diseno</code> en main; el resultado final de <code>index.html</code> debe contener <u>ambas palabras</u> (Hola y Bienvenidos), sin marcas de conflicto, con el merge commit hecho.</p>`,
  setup: [...CFG, 'mkdir portada', 'cd portada', 'git init', 'echo "<h1>Titulo</h1>" > index.html', 'git add .', 'git commit -m "Inicio"', 'git switch -c diseno', 'echo "<h1>Bienvenidos</h1>" > index.html', 'git commit -am "Titulo de diseno"', 'git switch main', 'echo "<h1>Hola</h1>" > index.html', 'git commit -am "Titulo en main"'],
  hintText: 'git merge diseno → CONFLICT → editar el archivo → git add → git commit.',
  solAll: ['git merge diseno', 'echo "<h1>Hola y Bienvenidos</h1>" > index.html', 'git add index.html', 'git commit -m "Fusiono diseno"'],
  tasks: [
    { t: 'Estás en main y el merge commit está hecho (2 padres)', check: c => { const R = c.repo('/home/dev/portada'); return R && c.branch(R) === 'main' && !R.repo.merging && c.commit(c.headId(R)).parents.length === 2; } },
    { t: 'index.html contiene <b>Hola</b> y <b>Bienvenidos</b>', check: c => { const f = c.file('/home/dev/portada/index.html') || ''; return f.includes('Hola') && f.includes('Bienvenidos'); } },
    { t: 'Sin marcas de conflicto en el archivo', check: c => { const f = c.file('/home/dev/portada/index.html') || ''; const R = c.repo('/home/dev/portada'); return R && f.length > 0 && !/[<=>]{7}/.test(f) && !R.repo.merging && c.commit(c.headId(R)).parents.length === 2; } }
  ]
},
{
  id: 'r6', n: 6, title: 'Deshacer algo ya publicado', tag: 'Difícil',
  summary: 'Un post malo ya está en GitHub. Arréglalo sin reescribir la historia.',
  body: `<p>En <b>blog</b> hiciste commit y <u>push</u> de <code>post.txt</code> con contenido equivocado. Tus compañeros ya podrían haberlo descargado.</p><p><b>Objetivo:</b> que <code>post.txt</code> desaparezca del último estado de main, GitHub y tu PC queden iguales, y el historial <b>conserve</b> el commit malo (3 commits o más, nada de borrar historia).</p>`,
  setup: [...CFG, 'mkdir blog', 'cd blog', 'git init', 'echo "# Blog" > README.md', 'git add .', 'git commit -m "Inicio"', 'git remote add origin ' + URL('blog'), 'git push -u origin main', 'echo "contenido malo" > post.txt', 'git add .', 'git commit -m "Publica post malo"', 'git push'],
  hintText: 'Si ya está publicado, NO uses reset --hard. Existe un comando que crea un commit contrario.',
  solAll: ['git revert HEAD', 'git push'],
  tasks: [
    { t: 'post.txt ya no está en el último commit de main', check: c => { const R = c.repo('/home/dev/blog'); return R && !('post.txt' in c.headTree(R)); } },
    { t: 'El historial conserva el commit malo (≥ 3 commits)', check: c => { const R = c.repo('/home/dev/blog'); return R && c.count_commits(R) >= 3; } },
    { t: 'GitHub y tu PC están iguales', check: c => { const R = c.repo('/home/dev/blog'); return R && c.remoteTip(R.repo.remotes.origin, 'main') === c.tip(R, 'main') && !('post.txt' in c.treeAt(c.remoteTip(R.repo.remotes.origin, 'main'))); } }
  ]
},
{
  id: 'r7', n: 7, title: 'Lanzamiento v1.0.0', tag: 'Fácil',
  summary: 'Marca la versión y publícala.',
  body: `<p>El proyecto <b>release</b> está listo para lanzar. Crea una etiqueta anotada <code>v1.0.0</code> (con un mensaje) sobre el último commit y <u>súbela</u> a GitHub.</p>`,
  setup: [...CFG, 'mkdir release', 'cd release', 'git init', 'echo "# App" > README.md', 'git add .', 'git commit -m "Version estable"', 'git remote add origin ' + URL('release'), 'git push -u origin main'],
  hintText: 'git tag -a ... -m ... y luego recuerda: los tags no se suben solos.',
  solAll: ['git tag -a v1.0.0 -m "Lanzamiento"', 'git push origin v1.0.0'],
  tasks: [
    { t: 'La etiqueta <b>v1.0.0</b> existe en tu repo y apunta al último commit', check: c => { const R = c.repo('/home/dev/release'); return R && R.repo.tags['v1.0.0'] === c.headId(R); } },
    { t: 'La etiqueta está también en GitHub', check: c => { const R = c.repo('/home/dev/release'); const r = R && c.remoteRepo(R.repo.remotes.origin); return r && !!r.tags['v1.0.0']; } }
  ]
},
{
  id: 'r8', n: 8, title: 'Jefe final: flujo completo', tag: 'Jefe final',
  summary: 'Clonar, rama, push, PR, pull y limpieza. Todo junto.',
  body: `<p>Demuestra todo lo aprendido:</p><ol class="list"><li>Clona <code>https://github.com/kdnastudio/demo-web.git</code>.</li><li>Crea la rama <code>feature/footer</code> con un archivo <code>footer.html</code> y commit.</li><li>Sube la rama a GitHub y "aprueba" el Pull Request.</li><li>Vuelve a main y actualiza tu copia local.</li><li>Borra la rama local <code>feature/footer</code>.</li></ol>`,
  setup: [...CFG],
  hintText: 'Es exactamente el flujo de la lección 10, pero empezando con un clone.',
  solAll: ['git clone ' + URL('demo-web'), 'cd demo-web', 'git switch -c feature/footer', 'echo "<footer>Kdna</footer>" > footer.html', 'git add .', 'git commit -m "Agrega footer"', 'git push -u origin feature/footer', 'github pr-merge feature/footer', 'git switch main', 'git pull', 'git branch -d feature/footer'],
  tasks: [
    { t: 'El repo está clonado en <b>demo-web</b>', check: c => !!c.repo('/home/dev/demo-web') },
    { t: 'En GitHub, main ya contiene <b>footer.html</b>', check: c => { const t = c.treeAt(c.remoteTip(URL('demo-web'), 'main')); return 'footer.html' in t; } },
    { t: 'Tu main local está actualizada (tiene footer.html) y estás en main', check: c => { const R = c.repo('/home/dev/demo-web'); return R && c.branch(R) === 'main' && 'footer.html' in c.headTree(R); } },
    { t: 'La rama local feature/footer fue borrada', check: c => { const R = c.repo('/home/dev/demo-web'); return R && !('feature/footer' in R.repo.branches); } }
  ]
}
];

/* ═══════════════ QUIZ ═══════════════ */
const QUIZ = [
  { q: '¿Cuál es la diferencia entre Git y GitHub?', o: ['Son lo mismo con distinto nombre', 'Git es el programa de control de versiones; GitHub es un servicio web donde alojas repositorios', 'GitHub es el programa y Git la página web', 'Git solo funciona con internet'], a: 1, e: 'Git corre en tu PC (sin internet). GitHub es un servicio en la nube para guardar y compartir repos.' },
  { q: '¿Qué hace git add?', o: ['Guarda el commit en GitHub', 'Mueve cambios al área de staging para el próximo commit', 'Crea una rama nueva', 'Descarga cambios del remoto'], a: 1, e: 'add prepara (staging). El commit es el paso que guarda.' },
  { q: 'Hiciste cambios y quieres saber qué archivos cambiaron. ¿Qué comando usas?', o: ['git log', 'git status', 'git init', 'git remote -v'], a: 1, e: 'git status es el comando que más usarás.' },
  { q: '¿Para qué sirve .gitignore?', o: ['Para borrar archivos del disco', 'Para que Git no siga ni suba ciertos archivos (claves, node_modules, logs)', 'Para ocultar commits', 'Para comprimir el repositorio'], a: 1, e: 'Lista patrones de archivos que Git ignora. Los secretos (.env) siempre van ahí.' },
  { q: 'Tu push fue rechazado con "fetch first". ¿Qué haces?', o: ['git push --force siempre', 'git pull para traer lo del remoto y luego git push', 'Borrar el repo y clonar de nuevo', 'git reset --hard'], a: 1, e: 'El remoto tiene commits que no tienes. Pull (integrar) y luego push. Evita --force en ramas compartidas.' },
  { q: '¿Qué diferencia hay entre git fetch y git pull?', o: ['Ninguna', 'fetch trae sin mezclar; pull = fetch + merge', 'pull solo funciona en main', 'fetch sube cambios'], a: 1, e: 'fetch es seguro: no toca tus archivos. pull los integra.' },
  { q: 'Ya hiciste push de un commit con un error. ¿Cuál es la forma segura de deshacerlo?', o: ['git reset --hard HEAD~1 y push --force', 'git revert HEAD y push', 'Borrar la carpeta .git', 'Esperar que nadie lo note'], a: 1, e: 'revert crea un commit nuevo que lo deshace y respeta la historia que otros ya bajaron.' },
  { q: 'En un conflicto de merge ves <<<<<<< ======= >>>>>>>. ¿Qué haces?', o: ['Nada, Git lo arregla solo', 'Editas el archivo dejando el texto correcto sin las marcas, luego add y commit', 'git push --force', 'Reinstalas Git'], a: 1, e: 'Tú decides el resultado final, quitas las marcas, add y commit.' },
  { q: '¿Qué hace git push -u origin main?', o: ['Borra origin', 'Sube main y recuerda origin/main para usar solo "git push" después', 'Descarga main', 'Crea la rama main'], a: 1, e: 'La -u (--set-upstream) vincula tu rama local con la remota.' },
  { q: 'Quieres cambiar de rama pero tienes trabajo a medias que no quieres commitear. ¿Qué usas?', o: ['git stash', 'git reset --hard', 'git init', 'rm -rf'], a: 0, e: 'stash lo guarda en un cajón; stash pop lo devuelve.' },
  { q: '¿Qué comando clona un repositorio existente?', o: ['git init URL', 'git clone URL', 'git copy URL', 'git remote add URL'], a: 1, e: 'clone descarga todo e incluye el remoto origin ya configurado.' },
  { q: '¿Qué hace git commit -m "mensaje" si no hiciste git add antes?', o: ['Commitea todo automáticamente', 'Nada: te dice que no hay nada preparado para commit', 'Borra tus archivos', 'Sube a GitHub'], a: 1, e: 'Solo se guarda lo que está en staging (o usa -a para archivos ya rastreados).' }
];

/* ═══════════════ CHULETA ═══════════════ */
const CHEAT = [
  { g: 'Configuración', items: [
    ['git config --global user.name "Nombre"', 'Tu nombre para los commits'],
    ['git config --global user.email "a@b.com"', 'Tu correo para los commits'],
    ['git config --list', 'Ver la configuración']] },
  { g: 'Crear / obtener repos', items: [
    ['git init', 'Crea un repo en la carpeta actual'],
    ['git clone URL', 'Descarga un repo de GitHub'],
    ['git remote add origin URL', 'Conecta tu repo con GitHub'],
    ['git remote -v', 'Ver remotos']] },
  { g: 'Día a día', items: [
    ['git status', 'Qué cambió y qué está preparado'],
    ['git add archivo', 'Prepara un archivo'],
    ['git add .', 'Prepara todo lo de la carpeta actual'],
    ['git commit -m "msg"', 'Guarda los cambios preparados'],
    ['git commit -am "msg"', 'Añade archivos ya rastreados y commitea'],
    ['git diff', 'Cambios sin preparar'],
    ['git diff --staged', 'Cambios preparados'],
    ['git log --oneline', 'Historial compacto'],
    ['git log --oneline --graph --all', 'Historial de todas las ramas']] },
  { g: 'Ramas', items: [
    ['git branch', 'Listar ramas'],
    ['git switch -c nombre', 'Crear y entrar a una rama'],
    ['git switch nombre', 'Cambiar de rama'],
    ['git merge nombre', 'Fusionar "nombre" en la rama actual'],
    ['git branch -d nombre', 'Borrar rama fusionada'],
    ['git merge --abort', 'Cancelar un merge con conflictos']] },
  { g: 'Remoto (GitHub)', items: [
    ['git push -u origin main', 'Primera subida de una rama'],
    ['git push', 'Subir commits nuevos'],
    ['git fetch', 'Traer novedades sin mezclar'],
    ['git pull', 'Traer y mezclar novedades'],
    ['git push origin --delete rama', 'Borrar una rama en GitHub'],
    ['git push origin v1.0', 'Subir una etiqueta']] },
  { g: 'Deshacer', items: [
    ['git restore --staged archivo', 'Sacar del staging'],
    ['git restore archivo', 'Descartar cambios del archivo (irreversible)'],
    ['git reset --soft HEAD~1', 'Deshacer commit, conservar cambios preparados'],
    ['git reset --hard HEAD~1', 'Deshacer commit y descartar cambios'],
    ['git revert HEAD', 'Commit nuevo que deshace el último (seguro tras push)'],
    ['git rm --cached archivo', 'Dejar de rastrear sin borrar del disco'],
    ['git stash / git stash pop', 'Guardar / recuperar trabajo a medias']] },
  { g: 'Etiquetas', items: [
    ['git tag -a v1.0 -m "texto"', 'Crear etiqueta anotada'],
    ['git tag', 'Listar etiquetas']] },
  { g: 'Terminal', items: [
    ['pwd', 'Dónde estoy'], ['ls -a', 'Listar (con ocultos)'], ['cd carpeta / cd ..', 'Entrar / subir'], ['mkdir nombre', 'Crear carpeta'], ['touch archivo', 'Crear archivo vacío'], ['cat archivo', 'Ver archivo'], ['echo "x" > archivo', 'Escribir en archivo']] }
];

root.GitLessons = { LESSONS, RETOS, QUIZ, CHEAT, mkCtx };
if (typeof module !== 'undefined') module.exports = root.GitLessons;
})(typeof window !== 'undefined' ? window : globalThis);
