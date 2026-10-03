/* GitFlow Lab — estilos */
:root{
  color-scheme: dark;
  --bg:#0a0e1a; --bg2:#0e1424; --panel:#121a2e; --panel2:#17213a; --line:#24304f; --line2:#2f3d63;
  --text:#e8edf9; --mut:#97a3c4; --dim:#6b789c;
  --acc:#ff7a45; --acc2:#35e0c2; --blue:#7cb0ff; --green:#4ade80; --red:#ff7676; --yellow:#fbbf24; --mag:#d68cff;
  --term:#070a14; --r:14px;
  --f-head:'Bricolage Grotesque','Inter',system-ui,sans-serif; --f-body:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif; --f-mono:'JetBrains Mono',ui-monospace,Consolas,'Courier New',monospace;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:radial-gradient(1200px 600px at 80% -10%,#1a2347 0%,transparent 60%),var(--bg);color:var(--text);font:15px/1.6 var(--f-body);-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;cursor:pointer}
code,kbd,pre{font-family:var(--f-mono)}
a{color:var(--blue)}
:focus-visible{outline:2px solid var(--acc2);outline-offset:2px}
::selection{background:#35e0c244}
*{scrollbar-width:thin;scrollbar-color:var(--line2) transparent}

/* ── cabecera ── */
.top{display:flex;align-items:center;gap:18px;height:62px;padding:0 18px;border-bottom:1px solid var(--line);background:#0a0e1aee;backdrop-filter:blur(8px);position:sticky;top:0;z-index:20}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text);flex:none}
.logo{width:34px;height:34px}
.brand-txt{display:flex;flex-direction:column;line-height:1.05}
.brand-txt b{font:800 19px var(--f-head);letter-spacing:-.3px}
.brand-txt em{font-style:normal;color:var(--acc)}
.brand-txt small{color:var(--mut);font-size:11px;letter-spacing:.3px;margin-top:2px}
.nav{display:flex;gap:4px;flex:1;overflow-x:auto;scrollbar-width:none}
.nav button{background:none;border:0;padding:8px 14px;border-radius:10px;color:var(--mut);font-weight:500;white-space:nowrap}
.nav button:hover{color:var(--text);background:var(--panel)}
.nav button.on{color:var(--text);background:var(--panel2);box-shadow:inset 0 -2px 0 var(--acc)}
.prog{display:flex;gap:8px;flex:none;font-size:12.5px;color:var(--mut)}
.prog span{background:var(--panel);border:1px solid var(--line);padding:4px 10px;border-radius:99px;white-space:nowrap}
.prog b{color:var(--acc2);font-weight:600}

/* ── layout ── */
.layout{display:grid;grid-template-columns:232px minmax(360px,1fr) minmax(440px,1.2fr);gap:14px;padding:14px;height:calc(100dvh - 62px)}
.layout>*{min-height:0}
.side,.lesson,.page{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);overflow:auto}
.side{padding:12px 10px}
.lesson{padding:0;display:flex;flex-direction:column}
.labpane{display:flex;flex-direction:column;gap:12px;min-height:0;container-type:inline-size}
.page{grid-column:1 / -1;padding:28px clamp(18px,4vw,48px)}
.layout.full .side,.layout.full .lesson,.layout.full .labpane{display:none}
.layout.nolist{grid-template-columns:minmax(360px,1fr) minmax(440px,1.2fr)}
.layout.nolist .side{display:none}
[hidden]{display:none!important}

/* ── índice lateral ── */
.side h4{margin:10px 8px 6px;font:600 11px var(--f-body);letter-spacing:1.2px;text-transform:uppercase;color:var(--dim)}
.side h4:first-child{margin-top:2px}
.side button{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;background:none;border:1px solid transparent;border-radius:10px;padding:8px 10px;color:var(--mut);font-size:13.5px;line-height:1.35}
.side button:hover{background:var(--panel2);color:var(--text)}
.side button.on{background:var(--panel2);border-color:var(--line2);color:var(--text)}
.side .num{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:600 11px var(--f-mono);background:var(--bg2);border:1px solid var(--line2);color:var(--mut);margin-top:1px}
.side .done .num{background:var(--green);border-color:var(--green);color:#06210f}
.side .done .num::before{content:"✓"}
.side .done .num span{display:none}

/* ── lección ── */
.lhead{padding:18px 22px 0}
.pill{display:inline-block;font:600 11px var(--f-body);letter-spacing:.8px;text-transform:uppercase;color:var(--acc);background:#ff7a4515;border:1px solid #ff7a4540;padding:3px 10px;border-radius:99px}
.lhead h2{font:800 26px/1.15 var(--f-head);letter-spacing:-.4px;margin:10px 0 6px}
.lhead p{margin:0 0 14px;color:var(--mut)}
.subtabs{display:flex;gap:2px;padding:0 14px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--panel);z-index:2}
.subtabs button{background:none;border:0;padding:10px 12px;color:var(--mut);font-weight:500;border-bottom:2px solid transparent;margin-bottom:-1px}
.subtabs button.on{color:var(--text);border-bottom-color:var(--acc)}
.subtabs .cnt{font:500 11px var(--f-mono);background:var(--bg2);border:1px solid var(--line2);border-radius:99px;padding:1px 7px;margin-left:6px;color:var(--acc2)}
.lcontent{padding:18px 22px 28px;overflow:auto;flex:1}
.lcontent p{margin:0 0 12px}
.lcontent h4{font:700 16px var(--f-head);margin:22px 0 8px;color:#fff}
.lcontent code{background:var(--bg2);border:1px solid var(--line);padding:1px 6px;border-radius:6px;font-size:.88em;color:#ffd2bf}
.lcontent .list{padding-left:20px;margin:0 0 12px}.lcontent .list li{margin:5px 0}
.tip,.warn{border-radius:12px;padding:12px 14px;margin:14px 0;font-size:14px;border:1px solid}
.tip{background:#35e0c20f;border-color:#35e0c240}
.warn{background:#fbbf2410;border-color:#fbbf2445}
.tip b{color:var(--acc2)}.warn b{color:var(--yellow)}
kbd{background:var(--bg2);border:1px solid var(--line2);border-bottom-width:2px;border-radius:5px;padding:0 6px;font-size:.85em}
.fake-code{color:var(--blue);font-family:var(--f-mono)}
.code,pre.code{background:var(--term);border:1px solid var(--line);border-radius:12px;padding:12px 14px;overflow:auto;font-size:13px;line-height:1.7;margin:12px 0}
.code .dim,.dim{color:var(--dim)}.code .m1{color:var(--red)}.code .m2{color:var(--yellow)}
.tbl{width:100%;border-collapse:collapse;margin:12px 0;font-size:14px}
.tbl th,.tbl td{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}
.tbl th{background:var(--panel2);font-weight:600}
.bad{color:var(--red);font-size:12.5px}
.cmdtable{display:grid;gap:8px}
.cmdrow{display:grid;grid-template-columns:minmax(150px,42%) 1fr;gap:12px;align-items:start;background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:9px 12px}
.cmdrow code{background:none;border:0;padding:0;color:var(--blue);font-size:13px;cursor:pointer;text-align:left;word-break:break-word}
.cmdrow code:hover{color:var(--acc2)}
.cmdrow span{font-size:13.5px;color:var(--mut)}
.btn{background:var(--acc);color:#1a0a02;border:0;border-radius:10px;padding:10px 18px;font-weight:600}
.btn:hover{filter:brightness(1.08)}
.btn.ghost{background:transparent;color:var(--text);border:1px solid var(--line2)}
.btn.ghost:hover{background:var(--panel2)}
.btn.sm{padding:6px 12px;font-size:13px;border-radius:8px}

/* flujo 4 zonas */
.flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:6px;align-items:center;margin:14px 0 6px}
.flow-box{border-radius:12px;padding:10px;border:1px solid var(--line2);background:var(--bg2);display:flex;flex-direction:column;gap:2px;min-height:78px;justify-content:center}
.flow-box b{font-size:12.5px;line-height:1.2}.flow-box span{font-size:11.5px;color:var(--mut);line-height:1.3}
.flow-box.wd{border-color:#ff767666}.flow-box.st{border-color:#fbbf2466}.flow-box.lr{border-color:#4ade8066}.flow-box.rr{border-color:#7cb0ff66}
.flow-arrow{display:flex;flex-direction:column;align-items:center;font-size:11px;color:var(--mut);gap:2px;text-align:center}
.flow-arrow code{font-size:10.5px!important;padding:1px 5px!important;white-space:nowrap}
.flow-back{text-align:center;font-size:12.5px;color:var(--mut);border-top:1px dashed var(--line2);padding-top:8px;margin-bottom:10px}
@media(max-width:1500px){.flow{grid-template-columns:1fr 1fr;}.flow-arrow{flex-direction:row;justify-content:center;grid-column:1/-1}}
.diagram svg{width:100%;max-width:560px;display:block;margin:10px auto}
.diagram .ln{stroke:var(--mut);stroke-width:2.5;fill:none}.diagram .ln.br{stroke:var(--acc2)}
.diagram .c{fill:var(--panel);stroke:var(--mut);stroke-width:2.5}.diagram .c.b{stroke:var(--acc2)}.diagram .c.m{fill:var(--acc);stroke:var(--acc)}
.diagram .t{fill:var(--mut);font:12px var(--f-mono)}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:12px 0}
.steps div{background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:10px;font-size:13px;line-height:1.7}
.steps b{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--acc);color:#1a0a02;font-size:12px;margin-right:6px}
.steps code{display:inline-block;margin:1px 0;font-size:11.5px!important}
/* maqueta de GitHub */
.mock{border:1px solid var(--line2);border-radius:12px;overflow:hidden;margin:12px 0;background:#0d1117;font-size:13px}
.mock-bar{display:flex;gap:6px;align-items:center;padding:8px 10px;background:#161b22;border-bottom:1px solid #30363d}
.mock-bar i{width:9px;height:9px;border-radius:50%;background:#30363d}.mock-bar span{margin-left:8px;color:#8b949e;font:12px var(--f-mono)}
.mock-body{padding:14px}.mock-h{font:600 16px var(--f-body);margin-bottom:10px}
.mock-row{margin-bottom:10px}.mock-row label{display:block;font-size:12px;color:#8b949e;margin-bottom:4px}
.mock-inp{border:1px solid #30363d;background:#0d1117;border-radius:6px;padding:6px 10px;color:#c9d1d9}
.mock-row.warn2 .mock-inp{border-color:#fbbf2480}
.mock-btn{display:inline-block;background:#238636;color:#fff;border-radius:6px;padding:6px 14px;font-weight:600;font-size:13px}

/* misión */
.mission h3{font:700 17px var(--f-head);margin:0 0 4px}
.brief{background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:16px}
.tasks{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.task{display:flex;gap:12px;background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;transition:border-color .2s,background .2s}
.task .chk{flex:none;width:22px;height:22px;border-radius:50%;border:2px solid var(--line2);margin-top:1px;display:grid;place-items:center;font-size:13px;color:transparent;transition:.2s}
.task.done{border-color:#4ade8055;background:#4ade800a}
.task.done .chk{background:var(--green);border-color:var(--green);color:#06210f}
.task.done .chk::before{content:"✓";font-weight:700}
.task.done .tt{color:var(--mut);text-decoration:line-through;text-decoration-color:#4ade8088}
.task.cur{border-color:var(--acc);box-shadow:0 0 0 3px #ff7a4518}
.task .tt{font-size:14.5px}
.task .tt b{color:#fff}
.task code{background:var(--panel);border:1px solid var(--line);padding:1px 6px;border-radius:6px;font-size:.86em;color:#ffd2bf}
.hint{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13px;color:var(--mut)}
.hint .chip,.chip{font:500 12.5px var(--f-mono);background:#7cb0ff14;border:1px dashed #7cb0ff77;color:var(--blue);border-radius:8px;padding:3px 9px;cursor:pointer;text-align:left}
.chip:hover{background:#7cb0ff28;color:#fff}
.chip::before{content:"⏎ ";opacity:.6}
.mission-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.win{margin-top:16px;border-radius:14px;border:1px solid #4ade8077;background:linear-gradient(135deg,#4ade8018,#35e0c212);padding:16px 18px;animation:rise .5s}
.win h4{margin:0 0 4px!important;color:var(--green)!important}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.hintbox{margin:10px 0;padding:10px 12px;border-left:3px solid var(--yellow);background:#fbbf2410;border-radius:0 10px 10px 0;font-size:13.5px}

/* ── terminal ── */
.term{flex:1;min-height:200px;display:flex;flex-direction:column;background:var(--term);border:1px solid var(--line2);border-radius:var(--r);overflow:hidden;box-shadow:0 12px 40px #00000066}
.term-head{display:flex;align-items:center;gap:12px;padding:9px 12px;background:#0d1326;border-bottom:1px solid var(--line)}
.dots{display:flex;gap:6px}.dots i{width:11px;height:11px;border-radius:50%;background:#ff5f57}.dots i:nth-child(2){background:#febc2e}.dots i:nth-child(3){background:#28c840}
.term-title{font:12px var(--f-mono);color:var(--mut);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sw{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mut);cursor:pointer;white-space:nowrap}
.sw input{accent-color:var(--acc2)}
.mini{background:var(--panel);border:1px solid var(--line2);border-radius:8px;padding:4px 10px;font-size:12px;color:var(--mut);white-space:nowrap}
.mini:hover{color:var(--text);background:var(--panel2)}
.term-body{flex:1;overflow:auto;padding:12px 14px;font:13.5px/1.55 var(--f-mono);cursor:text}
.l{white-space:pre-wrap;word-break:break-word;min-height:1.55em}
.c-g{color:var(--green)}.c-r{color:var(--red)}.c-y{color:var(--yellow)}.c-b{color:var(--blue);font-weight:700}.c-c{color:var(--acc2)}.c-m{color:var(--mag)}.c-dim{color:var(--dim)}
.l.explain{color:var(--acc2);opacity:.9;font-family:var(--f-body);font-size:12.5px;padding:2px 0 6px 12px;border-left:2px solid #35e0c255;margin:2px 0 6px}
.prompt-line{display:flex;align-items:center;gap:0;flex-wrap:nowrap}
.ps1{white-space:pre;flex:none}
.pu{color:var(--green)}.pp{color:var(--blue)}.pb{color:var(--yellow)}.pd{color:var(--mut)}
#tin{flex:1;min-width:40px;background:none;border:0;outline:0;color:var(--text);font:inherit;caret-color:var(--acc);padding:0}

/* ── zonas ── */
.zones{flex:none;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;height:clamp(190px,30vh,290px)}
.zone{background:var(--panel);border:1px solid var(--line);border-radius:12px;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.zone header{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:7px 10px;border-bottom:1px solid var(--line);font:600 11.5px var(--f-body);letter-spacing:.2px}
.zone header small{font-weight:500;color:var(--mut);font-size:10.5px}
.zone .zb{flex:1;overflow:auto;padding:6px 8px;font:12px/1.4 var(--f-mono)}
.zone.wd header{box-shadow:inset 0 2px 0 #ff7676}.zone.st header{box-shadow:inset 0 2px 0 var(--yellow)}.zone.lr header{box-shadow:inset 0 2px 0 var(--green)}.zone.rr header{box-shadow:inset 0 2px 0 var(--blue)}
.it{display:flex;gap:6px;align-items:baseline;padding:2px 0;overflow-wrap:anywhere}
.it .dot{flex:none;width:7px;height:7px;border-radius:50%;background:var(--dim);transform:translateY(-1px)}
.it.untracked .dot{background:var(--red)}.it.untracked{color:#ffb0b0}
.it.modified .dot{background:var(--yellow)}.it.modified{color:#ffe08a}
.it.staged .dot,.it.A .dot,.it.M .dot{background:var(--green)}.it.staged{color:#a9f0c3}
.it.deleted{color:#ff9a9a;text-decoration:line-through}.it.deleted .dot{background:var(--red)}
.it.ignored{color:var(--dim);text-decoration:line-through;text-decoration-color:#6b789c88}
.it.conflict{color:var(--mag)}.it.conflict .dot{background:var(--mag)}
.it.clean{color:var(--mut)}
.it .tg{font-size:10px;color:var(--dim);margin-left:auto;flex:none;padding-left:4px}
.it.new{animation:flash 1.1s}
@keyframes flash{0%{background:#35e0c244}100%{background:transparent}}
.cm{display:flex;flex-wrap:wrap;gap:3px 6px;align-items:baseline;padding:3px 0;border-bottom:1px dashed #24304f}
.cm .h{color:var(--yellow)}.cm .m{color:var(--text);font-family:var(--f-body);font-size:11.5px}
.cm .lb{font-size:9.5px;padding:0 5px;border-radius:99px;background:#35e0c218;border:1px solid #35e0c255;color:var(--acc2)}
.cm .lb.head{background:#ff7a4520;border-color:#ff7a4580;color:var(--acc)}
.cm .lb.rem{background:#7cb0ff18;border-color:#7cb0ff66;color:var(--blue)}
.cm.new{animation:flash 1.1s}
.empty{color:var(--dim);font:12px var(--f-body);padding:6px 2px;line-height:1.45}
.badge{font:600 10px var(--f-mono);padding:1px 6px;border-radius:99px;background:var(--bg2);border:1px solid var(--line2);color:var(--mut)}
.badge.warn{color:var(--yellow);border-color:#fbbf2466}.badge.ok{color:var(--green);border-color:#4ade8066}
.mergebar{background:#d68cff18;border:1px solid #d68cff66;color:var(--mag);border-radius:8px;padding:4px 8px;font:11.5px var(--f-body);margin-bottom:6px}

@container (max-width:720px){.zones{grid-template-columns:1fr 1fr;height:clamp(250px,44vh,400px)}}

/* ── editor tipo nano ── */
.modal{position:fixed;inset:0;background:#02040bcc;display:grid;place-items:center;z-index:50;padding:16px}
.nano{width:min(720px,100%);background:#0c1220;border:1px solid var(--line2);border-radius:14px;overflow:hidden;box-shadow:0 30px 80px #000a;display:flex;flex-direction:column;max-height:90dvh}
.nano-head{display:flex;justify-content:space-between;gap:12px;padding:9px 14px;background:#e8edf9;color:#0a0e1a;font:600 12.5px var(--f-mono);flex-wrap:wrap}
.nano-head kbd{background:#fff;border-color:#9aa5c4;color:#0a0e1a}
.nano textarea{flex:1;min-height:280px;resize:vertical;background:var(--term);color:var(--text);border:0;outline:0;padding:14px;font:14px/1.6 var(--f-mono);caret-color:var(--acc)}
.nano-foot{display:flex;gap:8px;padding:10px 14px;border-top:1px solid var(--line)}

/* ── páginas: chuleta y quiz ── */
.page h2{font:800 30px var(--f-head);letter-spacing:-.5px;margin:0 0 6px}
.page .lead{color:var(--mut);margin:0 0 20px;max-width:70ch}
.search{width:100%;max-width:440px;background:var(--bg2);border:1px solid var(--line2);color:var(--text);border-radius:10px;padding:10px 14px;font:inherit;margin-bottom:20px}
.cheat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px;align-items:start}
.card{background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.card h3{font:700 15px var(--f-head);margin:0 0 10px;color:var(--acc)}
.crow{display:grid;grid-template-columns:1fr;gap:1px;padding:7px 0;border-top:1px solid var(--line)}
.crow:first-of-type{border-top:0}
.crow button{background:none;border:0;text-align:left;padding:0;color:var(--blue);font:13px var(--f-mono);cursor:copy;word-break:break-word}
.crow button:hover{color:var(--acc2)}
.crow span{color:var(--mut);font-size:13px}
.quiz{max-width:720px}
.qbar{height:6px;background:var(--bg2);border-radius:99px;overflow:hidden;margin:6px 0 22px}
.qbar i{display:block;height:100%;background:linear-gradient(90deg,var(--acc),var(--acc2));transition:width .3s}
.qq{font:700 21px/1.3 var(--f-head);margin:0 0 16px}
.qopts{display:grid;gap:8px}
.qopt{background:var(--bg2);border:1px solid var(--line2);border-radius:12px;padding:12px 14px;text-align:left}
.qopt:hover:not(:disabled){border-color:var(--acc)}
.qopt.ok{border-color:var(--green);background:#4ade8014}.qopt.no{border-color:var(--red);background:#ff767614}
.qexp{margin-top:14px;padding:12px 14px;border-radius:12px;background:var(--bg2);border:1px solid var(--line);font-size:14px}
.score{font:800 56px var(--f-head);color:var(--acc2);margin:10px 0}
.lab-sc{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 18px}

/* ── toast ── */
.toast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,20px);background:#e8edf9;color:#0a0e1a;font-weight:600;padding:9px 16px;border-radius:99px;opacity:0;pointer-events:none;transition:.25s;z-index:60;font-size:13.5px}
.toast.on{opacity:1;transform:translate(-50%,0)}

/* ── segmentado móvil ── */
.seg{display:none}

/* ── responsive ── */
@media(max-width:1260px){
  .layout,.layout.nolist{grid-template-columns:minmax(320px,1fr) minmax(400px,1.15fr);grid-template-rows:auto 1fr}
  .side{grid-column:1/-1;display:flex;gap:6px;overflow-x:auto;overflow-y:hidden;padding:8px}
  .layout.nolist .side{display:none}
  .layout{height:calc(100dvh - 62px)}
  .side h4{display:none}
  .side button{width:auto;flex:none;align-items:center;white-space:nowrap}
  .zones{grid-template-columns:repeat(2,1fr);height:clamp(220px,34vh,320px)}
}
@media(max-width:860px){
  html,body{height:auto}
  .brand-txt small,.prog{display:none}
  .seg{display:flex;gap:6px;padding:8px 12px 0;position:sticky;top:62px;z-index:15;background:var(--bg)}
  .seg button{flex:1;padding:9px;border-radius:10px;border:1px solid var(--line2);background:var(--panel);color:var(--mut);font-weight:600}
  .seg button.on{background:var(--acc);border-color:var(--acc);color:#1a0a02}
  .layout,.layout.nolist{display:block;height:auto;padding:10px 12px 24px}
  .layout.full~* {}
  .side{display:flex;margin-bottom:10px}
  .lesson{min-height:60dvh;overflow:visible}
  .lcontent{overflow:visible}
  .labpane{display:none}
  .layout.pane-term .lesson{display:none}
  .layout.pane-term .labpane{display:flex}
  .term{height:62dvh;flex:none}
  .zones{height:auto;grid-template-columns:1fr 1fr;margin-top:12px}
  .zone{max-height:210px}
  .page{padding:20px 16px}
  .cmdrow{grid-template-columns:1fr}
  .term-head .sw span{display:none}
  .layout.full{display:block}
  .layout.full .page{display:block}
}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
