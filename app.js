
(() => {
"use strict";
const DATA = window.FITNESS_DATA || {sessions:{},paramType:{},ath:{}};
const OCCURRENCE_SHEETS = window.FITNESS_OCCURRENCE_SHEETS || {};
const ATH_SHEETS = window.FITNESS_ATH_SHEETS || {};
const KEY = "fitness-reconstruit-v2";
const APP_REV = 4;
const cycles = ["A","B","C"];
const tabs = ["today","program","progress","history"];
const $=(q,r=document)=>r.querySelector(q);
const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const clone=x=>JSON.parse(JSON.stringify(x));
const app=$("#app"), overlayRoot=$("#overlay-root");

let tab="today";
let view={type:"root"};
let programMode="sessions";
let progressionPeriod="all";
let progressionGroup="Tous";
let historyPeriod="year";
let historyYear=new Date().getFullYear();

function localISODate(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function mondayOf(date=new Date()){
  const d=new Date(date); d.setHours(0,0,0,0); const k=(d.getDay()+6)%7; d.setDate(d.getDate()-k); return d;
}
function currentWeekKey(){ return localISODate(mondayOf()); }
function weeksBetween(a,b){
  const da=new Date(a+"T00:00:00"), db=new Date(b+"T00:00:00");
  return Math.max(0,Math.round((db-da)/604800000));
}
function defaultState(){
  return {
    installed:false,cycle:"A",nextG:1,weekKey:currentWeekKey(),completedG:[],
    history:[],oldWeeks:[],refs:{},params:{},progressionSettings:{},
    sessionOrder:{},programOverrides:{},customExercises:{},archivedExercises:[],
    today:null,lastComplement:{},nextAth:"A",nextFm:1,athParams:{},appRev:APP_REV
  };
}
function inferRotations(s){
  const hist=s.history||[];
  const lastAth=[...hist].reverse().find(h=>String(h.session||"").startsWith("ATHLÉTIQUE"));
  if(lastAth) s.nextAth=lastAth.session.endsWith("A")?"B":"A";
  const lastFm=[...hist].reverse().find(h=>String(h.session||"").startsWith("FULL MIX"));
  if(lastFm){ const n=Number(String(lastFm.session).match(/\d+/)?.[0]||1); s.nextFm=(n%4)+1; }
}
function migrate(){
  let raw=null; try{raw=JSON.parse(localStorage.getItem(KEY)||"null")}catch{}
  const s=Object.assign(defaultState(),raw||{});
  s.history=Array.isArray(s.history)?s.history:[];
  s.completedG=Array.isArray(s.completedG)?s.completedG:[];
  s.oldWeeks=Array.isArray(s.oldWeeks)?s.oldWeeks:[];
  s.refs=s.refs||{}; s.params=s.params||{}; s.sessionOrder=s.sessionOrder||{};
  s.programOverrides=s.programOverrides||{}; s.customExercises=s.customExercises||{};
  s.archivedExercises=Array.isArray(s.archivedExercises)?s.archivedExercises:[];
  s.progressionSettings=s.progressionSettings||{}; s.lastComplement=s.lastComplement||{}; s.athParams=s.athParams||{};
  if(!raw?.nextAth || !raw?.nextFm) inferRotations(s);
  // Preserve the previous reordering model by converting sessionOrder into complete overrides only when safe.
  Object.entries(s.sessionOrder).forEach(([session,ids])=>{
    if(!s.programOverrides[session] && Array.isArray(ids) && ids.length) s.programOverrides[session]=ids.slice();
  });
  s.appRev=APP_REV;
  localStorage.setItem(KEY,JSON.stringify(s));
  return s;
}
let state=migrate();

function save(){ localStorage.setItem(KEY,JSON.stringify(state)); }
function ensureWeek(){
  const wk=currentWeekKey();
  if(state.weekKey===wk) return;
  const steps=weeksBetween(state.weekKey||wk,wk) || 1;
  let idx=Math.max(0,cycles.indexOf(state.cycle));
  state.cycle=cycles[(idx+steps)%3];
  state.weekKey=wk; state.completedG=[]; state.nextG=1; state.today=null;
  save();
}
function pathUrl(p){return p?"./"+p.split("/").map(encodeURIComponent).join("/"):"";}
function sessionCode(){return `G${Math.min(3,Math.max(1,+state.nextG||1))}${state.cycle}`;}
function niceSession(s){return String(s||"").replace("ATHLÉTIQUE ","ATH ").replace("FULL MIX","Full Mix");}
function groupLabel(s){
  const raw=DATA.groupLabels?.[s]?.replaceAll(" + "," / ").replace(" — "," / ") ||
    (s?.startsWith("G1")?"Pectoraux / Biceps / Abdos":
     s?.startsWith("G2")?"Dos / Triceps / Abdos":
     s?.startsWith("G3")?"Épaules / Jambes / Abdos":
     s?.startsWith("ATH")?"Condition physique / Endurance":"Séance complète");
  return raw.replace(/PECTORAUX/gi,"Pectoraux").replace(/BICEPS/gi,"Biceps").replace(/ABDOS/gi,"Abdos")
    .replace(/TRICEPS/gi,"Triceps").replace(/DOS/gi,"Dos").replace(/ÉPAULES|EPAULES/gi,"Épaules")
    .replace(/JAMBES/gi,"Jambes").replace(/ADDUCTEURS/gi,"Adducteurs");
}
function baseIds(session){return (DATA.sessions?.[session]||[]).map(e=>e.id);}
function sessionIds(session){
  const ov=state.programOverrides[session];
  return Array.isArray(ov)?ov.slice():baseIds(session);
}
function buildRegistry(){
  const reg={};
  Object.entries(DATA.sessions||{}).forEach(([session,es])=>es.forEach((e,i)=>{
    if(!reg[e.id]) reg[e.id]={id:e.id,name:e.name,remark:e.remark||"",firstSession:session,firstNo:i+1};
  }));
  Object.entries(state.customExercises||{}).forEach(([id,e])=>reg[id]=Object.assign({id,firstSession:"",firstNo:1},e));
  return reg;
}
function registry(){return buildRegistry();}
function exercise(id){return registry()[id]||{id,name:id,remark:""};}
function occurrenceList(id){
  const out=[];
  const sessions=new Set([...Object.keys(DATA.sessions||{}),...Object.keys(state.programOverrides||{})]);
  sessions.forEach(s=>sessionIds(s).forEach((eid,i)=>{if(eid===id)out.push({s,n:i+1});}));
  return out;
}
function sheetPathForOccurrence(session,no){return OCCURRENCE_SHEETS[`${session}|${no}`]||"";}
function sheetFor(id,session,no){
  // Context-specific sheet first, then any known sheet for this canonical exercise.
  let p=sheetPathForOccurrence(session,no); if(p) return pathUrl(p);
  const originalOccurrence=Object.entries(DATA.sessions||{}).flatMap(([s,es])=>es.map((e,i)=>({s,e,n:i+1}))).find(x=>x.e.id===id && sheetPathForOccurrence(x.s,x.n));
  if(originalOccurrence) return pathUrl(sheetPathForOccurrence(originalOccurrence.s,originalOccurrence.n));
  const custom=state.customExercises?.[id]?.sheetPath; return custom?pathUrl(custom):"";
}
function groupForId(id){
  const occ=Object.entries(OCCURRENCE_SHEETS).find(([k])=>{
    const [s,n]=k.split("|"); return DATA.sessions?.[s]?.[+n-1]?.id===id;
  });
  const p=occ?.[1]||"";
  if(p.includes("A_PECTORAUX"))return"Pectoraux"; if(p.includes("B_BICEPS"))return"Biceps";
  if(p.includes("A_DOS"))return"Dos"; if(p.includes("B_TRICEPS"))return"Triceps";
  if(p.includes("A_EPAULES"))return"Épaules"; if(p.includes("B_JAMBES"))return"Jambes";
  if(p.includes("/ABDOS/"))return"Abdos";
  const n=exercise(id).name.toLowerCase();
  if(/abdo|crunch|gainage|pallof|wood chop|relevé de (jambes|genoux)/.test(n))return"Abdos";
  if(/curl|biceps/.test(n))return"Biceps"; if(/triceps|dips|barre au front/.test(n))return"Triceps";
  if(/rowing|tirage|traction|soulevé de terre|lat pulldown/.test(n))return"Dos";
  if(/squat|leg |mollet|fente|adduction|abduction/.test(n))return"Jambes";
  if(/élévation|oiseau|épaule|militaire|face pull/.test(n))return"Épaules";
  if(/développé|écarté|pec|chest|presse/.test(n))return"Pectoraux";
  return state.customExercises?.[id]?.group||"Autre";
}
function paramType(id){return DATA.paramType?.[id]||state.customExercises?.[id]?.paramType||"strength";}
function defaultParams(id){
  const existing=state.params[id]; if(existing&&Object.keys(existing).length)return clone(existing);
  const t=paramType(id);
  if(t==="gainage") return {type:t,tours:"5",normal:"1 min",gauche:"30 s",droite:"30 s",repos:"15–20 s"};
  if(t==="circuit") return {type:t,duree:"8 min",tours:"1"};
  return {type:t,series:"4",repetitions:"10",charge:state.refs[id]||"",increment:"2,5 kg",reposSeries:"60 s",reposExercices:"60 s"};
}
function referenceFor(id){
  const p=defaultParams(id), t=p.type;
  if(t==="gainage")return `${p.tours||"—"} tours · ${p.normal||"—"} + ${p.gauche||"—"} + ${p.droite||"—"}`;
  if(t==="circuit")return `${p.duree||"8 min"}${p.tours?` · ${p.tours} tour(s)`:""}`;
  return p.charge||state.refs[id]||"—";
}
function refWithUnit(v){const s=String(v||"—");return s==="—"||/[a-zA-Z]/.test(s)?s:`${s} kg`;}
function occKey(id,no){return `${id}@@${no}`;}
function occurrenceStatus(cur,id,no){return cur?.status?.[occKey(id,no)] ?? cur?.status?.[id] ?? "";}
function occurrenceValue(cur,id,no){return cur?.values?.[occKey(id,no)] ?? cur?.values?.[id] ?? referenceFor(id);}
function occurrenceNext(cur,id,no){return cur?.nextRefs?.[occKey(id,no)] ?? cur?.nextRefs?.[id] ?? "";}
function navState(){return {tab,view,programMode,progressionPeriod,progressionGroup,historyPeriod,historyYear};}
function applyNavState(st){
  if(!st)return; tab=st.tab||"today"; view=st.view||{type:"root"}; programMode=st.programMode||programMode;
  progressionPeriod=st.progressionPeriod||progressionPeriod; progressionGroup=st.progressionGroup||progressionGroup;
  historyPeriod=st.historyPeriod||historyPeriod; historyYear=st.historyYear||historyYear;
}
function pushNav(v=null,newTab=null){
  if(newTab){tab=newTab;view={type:"root"};} else if(v)view=v;
  history.pushState(navState(),""); render();
}
history.replaceState(navState(),"");
window.addEventListener("popstate",e=>{
  const activeOverlay=overlayRoot.firstElementChild;
  if(activeOverlay){overlayRoot.innerHTML=""; return;}
  applyNavState(e.state||{tab:"today",view:{type:"root"}}); render();
});

function nav(){
  $$(".bottom-nav button").forEach(b=>b.classList.toggle("on",b.dataset.tab===tab));
}
function header(title,subtitle="",extra="",cls=""){
  return `<header class="header ${cls}">
    <div class="header__content">
      <div class="header__row">
        <div><h1>${esc(title)}</h1>${subtitle?`<div class="subtitle">${esc(subtitle)}</div>`:""}${extra}</div>
        ${title==="Aujourd’hui"||title==="Programme"?`<button class="cycle-chip" data-cycle-menu><b>Cycle G</b><span>Semaine ${state.cycle}</span></button>`:""}
      </div>
    </div>
  </header>`;
}
function shell(content){app.innerHTML=`<main class="app"><section class="screen">${content}</section></main>`;nav();bindGlobalInView();}
function bindGlobalInView(){
  $$("[data-cycle-menu]").forEach(b=>b.onclick=()=>openCycleModal());
  $$("img[data-fallback]").forEach(img=>img.onerror=()=>{img.onerror=null;img.src="./assets/hero-final.jpg";});
}
function render(){
  ensureWeek();
  if(!state.installed){renderInstall();return;}
  if(view.type==="programDetail"){renderProgramDetail(view.session);return;}
  if(view.type==="progressDetail"){renderProgressDetail(view.id,view.sub||"evolution");return;}
  if(view.type==="historyMonth"){renderHistoryMonth(view.year,view.month);return;}
  if(view.type==="historyDetail"){renderHistoryDetail(view.id);return;}
  if(tab==="today")renderToday();
  else if(tab==="program")renderProgram();
  else if(tab==="progress")renderProgress();
  else renderHistory();
}
function renderInstall(){
  nav();
  app.innerHTML="";
  if($("#install-screen"))return;
  const el=document.createElement("div");el.id="install-screen";el.className="install";
  el.innerHTML=`<div class="install-box"><h1>Fitness</h1><p>Choisissez la semaine du cycle et la prochaine séance G à réaliser. Ce réglage pourra être modifié plus tard.</p>
    <div class="param-grid">
      <div class="field"><label>Semaine</label><select id="install-cycle">${cycles.map(c=>`<option>${c}</option>`).join("")}</select></div>
      <div class="field"><label>Prochaine séance</label><select id="install-g"><option value="1">G1</option><option value="2">G2</option><option value="3">G3</option></select></div>
    </div>
    <button class="btn gold block" id="install-go" style="margin-top:10px">Commencer</button></div>`;
  document.body.appendChild(el);
  $("#install-go",el).onclick=()=>{state.installed=true;state.cycle=$("#install-cycle",el).value;state.nextG=+$("#install-g",el).value;state.weekKey=currentWeekKey();save();el.remove();render();};
}

function renderToday(){
  const rawDate=new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const date=rawDate.charAt(0).toUpperCase()+rawDate.slice(1);
  const cur=state.today;
  if(!cur){
    const g3done=state.completedG.includes(3);
    if(g3done){
      const ath=`ATHLÉTIQUE ${state.nextAth}`,fm=`FULL MIX ${state.nextFm}`;
      shell(`${header("Aujourd’hui",date,"","tall")}
        <div class="card"><div class="row-between"><div><div class="small gold serif">Socle hebdomadaire terminé</div><div class="tiny muted">G1, G2 et G3 ont été enregistrées.</div></div><span class="cycle-chip"><b>Semaine ${state.cycle}</b><span>Complémentaires</span></span></div></div>
        <h2 class="section-title">Séances complémentaires</h2>
        <div class="complement-grid">
          ${complementChoiceCard(ath,"ATHLÉTIQUE",state.nextAth)}
          ${complementChoiceCard(fm,"FULL MIX",String(state.nextFm))}
        </div>`);
      $$("[data-start-session]").forEach(b=>b.onclick=()=>{initToday(b.dataset.startSession);render();});
      return;
    }
    const s=sessionCode();
    shell(`${header("Aujourd’hui",date,`<div class="session-code">${s}</div><div class="session-groups">${groupLabel(s)}</div>`,"tall")}
      <div class="card"><div class="row-between"><div><div class="small serif gold">Prochaine séance</div><div class="tiny muted">Le cycle principal suit G1 → G2 → G3.</div></div><button class="btn gold" id="start-main">Démarrer ${s}</button></div></div>`);
    $("#start-main").onclick=()=>{initToday(s);render();}; return;
  }
  renderActiveToday(cur,date);
}
function complementChoiceCard(session,title,variant){
  const last=state.lastComplement[session]||"—";
  return `<button class="program-card comp-card" data-start-session="${esc(session)}">
    <span class="code">${esc(title)}</span><span class="groups">${esc(groupLabel(session))}<br><span class="muted">Dernière réalisation : ${esc(last)}</span></span>
    <span class="variant-row"><span class="variant-chip on">${esc(variant)}</span></span>
  </button>`;
}
function initToday(session){
  const snapshot={}; sessionIds(session).forEach((id,i)=>snapshot[occKey(id,i+1)]=referenceFor(id));
  state.today={session,start:new Date().toTimeString().slice(0,5),startedAt:Date.now(),status:{},values:snapshot,nextRefs:{}};
  save();
}
function renderActiveToday(cur,date){
  if(cur.session.startsWith("ATHLÉTIQUE")){renderActiveAth(cur,date);return;}
  const ids=sessionIds(cur.session),statuses=ids.map((id,i)=>occurrenceStatus(cur,id,i+1)),success=statuses.filter(x=>x==="Réussi").length,fail=statuses.filter(x=>x==="Échoué").length,skip=statuses.filter(x=>x==="Non réalisé").length;
  shell(`${header("Aujourd’hui",date,`<div class="session-code">${niceSession(cur.session)}</div><div class="session-groups">${groupLabel(cur.session)}</div>`,"tall")}
    <div class="today-meta">
      <div><div class="meta-label">Heure de début</div><div class="meta-value">${esc(cur.start)} <button class="backlink" id="edit-start">✎</button></div></div>
      <div class="line"></div>
      <div style="text-align:center"><div class="meta-label">Durée en cours</div><div class="timer" id="timer">00:00:00</div></div>
    </div>
    <div>${ids.map((id,i)=>todayExerciseCard(id,cur.session,i+1,cur)).join("")}</div>
    <div class="card finish-card">
      <div class="finish-head"><div><div class="finish-title">⚑ Fin de séance</div><div class="tiny muted">Heure de fin</div><b id="end-time">${new Date().toTimeString().slice(0,5)}</b></div>
      <div class="finish-stat"><span>Durée totale</span><b id="total-dur">—</b></div>
      <div><div class="tiny serif gold" style="text-align:center;margin-bottom:3px">Bilan</div><div class="bilan"><div><b>${success}</b><span>Réussis</span></div><div><b>${fail}</b><span>Échoués</span></div><div><b>${skip}</b><span>Non réalisés</span></div></div></div></div>
      <button class="btn gold block" id="save-session" style="margin-top:8px">▣ Enregistrer la séance</button>
    </div>`);
  $$("[data-status]").forEach(b=>b.onclick=()=>setExerciseStatus(b.dataset.id,b.dataset.status,+b.dataset.no));
  $$("[data-sheet]").forEach(b=>b.onclick=()=>openSheet(b.dataset.sheet,b.dataset.session,+b.dataset.no));
  $("#edit-start").onclick=()=>editStartTime();
  $("#save-session").onclick=saveCurrentSession; tickTimer();
}
function todayExerciseCard(id,session,no,cur){
  const e=exercise(id),st=occurrenceStatus(cur,id,no),img=sheetFor(id,session,no),ref=occurrenceValue(cur,id,no);
  const firstPendingNo=sessionIds(session).findIndex((x,i)=>!["Réussi","Échoué","Non réalisé"].includes(occurrenceStatus(cur,x,i+1)))+1;
  return `<div class="exercise-card ${firstPendingNo===no?"current":""}">
    <div class="num">${String(no).padStart(2,"0")}</div>
    <div class="thumb"><img data-fallback src="${img||"./assets/hero-final.jpg"}" alt=""></div>
    <div class="ex-info"><div class="ex-name">${esc(e.name)}</div><div class="ex-sub">${esc(groupForId(id))}</div><div class="ex-ref">Charge / référence prévue <b>${esc(refWithUnit(ref))}</b></div></div>
    <button class="backlink chev" data-sheet="${esc(id)}" data-session="${esc(session)}" data-no="${no}">›</button>
    <div class="status-actions">
      ${["Réussi","Échoué","Non réalisé"].map(x=>`<button class="status-btn ${st===x?"sel":""}" data-status="${x}" data-id="${esc(id)}" data-no="${no}">${x==="Réussi"?"✓ ":x==="Échoué"?"× ":"⊘ "}${x}</button>`).join("")}
    </div>
  </div>`;
}
function setExerciseStatus(id,status,no){
  const cur=state.today;if(!cur)return;cur.status=cur.status||{};cur.values=cur.values||{};cur.nextRefs=cur.nextRefs||{};
  const key=occKey(id,no),current=occurrenceValue(cur,id,no);
  if(!cur.values[key])cur.values[key]=current;
  cur.status[key]=status;
  // Remove the legacy canonical status only when this active session has already started using occurrence keys.
  if(Object.prototype.hasOwnProperty.call(cur.status,id))delete cur.status[id];
  if(status==="Réussi"){
    openNextRefModal(id,current,next=>{cur.nextRefs[key]=next;save();render();});
  }else{
    if(status==="Échoué")cur.nextRefs[key]=current;
    else delete cur.nextRefs[key];
    save();render();
  }
}
function openNextRefModal(id,current,done){
  const p=defaultParams(id); const label=p.type==="strength"?"Charge / référence prévue pour la prochaine occurrence":"Référence prévue pour la prochaine occurrence";
  openModal(`<h3>Exercice réussi</h3><p>${esc(exercise(id).name)}</p><div class="field"><label>${esc(label)}</label><input id="next-ref" value="${esc(p.type==="strength"?(state.refs[id]||p.charge||current):current)}"></div>
    <div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="confirm-next">Valider</button></div>`,()=>{
      $("#confirm-next").onclick=()=>{const v=$("#next-ref").value.trim()||current;closeOverlay(true);done(v);};
    });
}
function editStartTime(){
  const cur=state.today;openModal(`<h3>Heure de début</h3><div class="field"><label>Heure</label><input type="time" id="start-edit" value="${esc(cur.start)}"></div>
    <div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="save-start">Enregistrer</button></div>`,()=>{
      $("#save-start").onclick=()=>{const nv=$("#start-edit").value;if(nv){const [h,m]=nv.split(":").map(Number),now=new Date(),d=new Date(now);d.setHours(h,m,0,0);if(d>now)d.setDate(d.getDate()-1);cur.start=nv;cur.startedAt=d.getTime();save();}closeOverlay(true);render();};
    });
}
function tickTimer(){
  const t=$("#timer"); if(!t||!state.today)return;
  const sec=Math.max(0,Math.floor((Date.now()-(state.today.startedAt||Date.now()))/1000));
  const h=String(Math.floor(sec/3600)).padStart(2,"0"),m=String(Math.floor(sec%3600/60)).padStart(2,"0"),s=String(sec%60).padStart(2,"0");
  t.textContent=`${h}:${m}:${s}`; const d=$("#total-dur");if(d)d.textContent=`${String(h).padStart(2,"0")}:${m}:${s}`;
  const e=$("#end-time");if(e)e.textContent=new Date().toTimeString().slice(0,5);
  setTimeout(tickTimer,1000);
}
function saveCurrentSession(){
  const cur=state.today;if(!cur)return;
  if(!cur.session.startsWith("ATHLÉTIQUE")){
    const ids=sessionIds(cur.session);
    const missing=ids.map((id,i)=>({id,no:i+1,key:occKey(id,i+1)})).filter(o=>!["Réussi","Échoué","Non réalisé"].includes(occurrenceStatus(cur,o.id,o.no)));
    if(missing.length){
      openModal(`<h3>Statuts à compléter</h3><p>${missing.length} exercice(s) n’ont pas encore de statut. Pour enregistrer une séance, chaque exercice doit être Réussi, Échoué ou Non réalisé.</p>
        <div class="modal-actions"><button class="btn ghost" data-close-modal>Revenir à la séance</button><button class="btn gold" id="mark-skipped">Marquer Non réalisé</button></div>`,()=>{
          $("#mark-skipped").onclick=()=>{missing.forEach(o=>cur.status[o.key]="Non réalisé");save();closeOverlay(true);setTimeout(saveCurrentSession,0);};
        });
      return;
    }
  }
  commitCurrentSession();
}
function commitCurrentSession(){
  const cur=state.today;if(!cur)return;
  const mins=Math.max(1,Math.round((Date.now()-(cur.startedAt||Date.now()))/60000));
  const ids=cur.session.startsWith("ATHLÉTIQUE")?[]:sessionIds(cur.session);
  const exRecords=ids.map((id,i)=>{const no=i+1,status=occurrenceStatus(cur,id,no),actual=occurrenceValue(cur,id,no),next=occurrenceNext(cur,id,no)||actual;return{id,name:exercise(id).name,status,actual,next,no};}).filter(e=>e.status!=="Non réalisé");
  state.history.push({id:"h"+Date.now(),date:localISODate(),session:cur.session,start:cur.start,end:new Date().toTimeString().slice(0,5),duration:mins,exercises:exRecords});
  ids.forEach((id,i)=>{const v=occurrenceNext(cur,id,i+1);if(!v)return;state.refs[id]=v;const p=defaultParams(id);if(p.type==="strength"){p.charge=v;state.params[id]=p;}});
  if(/^G[123][ABC]$/.test(cur.session)){
    const n=+cur.session[1]; if(!state.completedG.includes(n))state.completedG.push(n);
    state.nextG=Math.min(3,n+1);
  }else if(cur.session.startsWith("ATHLÉTIQUE")){
    state.lastComplement[cur.session]=new Date().toLocaleDateString("fr-FR");
    state.nextAth=cur.session.endsWith("A")?"B":"A";
  }else if(cur.session.startsWith("FULL MIX")){
    state.lastComplement[cur.session]=new Date().toLocaleDateString("fr-FR");
    const n=Number(cur.session.match(/\d+/)?.[0]||1);state.nextFm=(n%4)+1;
  }
  state.today=null;save();render();
}
function renderActiveAth(cur,date){
  const p=ATH_SHEETS[cur.session],img=p?pathUrl(p):"";
  shell(`${header("Aujourd’hui",date,`<div class="session-code">${niceSession(cur.session)}</div><div class="session-groups">${groupLabel(cur.session)}</div>`,"tall")}
    <div class="today-meta"><div><div class="meta-label">Heure de début</div><div class="meta-value">${esc(cur.start)}</div></div><div class="line"></div><div style="text-align:center"><div class="meta-label">Durée en cours</div><div class="timer" id="timer">00:00:00</div></div></div>
    <button class="card ath-sheet-preview" id="open-ath-sheet"><img data-fallback src="${img||"./assets/hero-final.jpg"}" alt=""><span>Ouvrir la fiche technique complète ›</span></button>
    <div class="card">${(DATA.ath?.[cur.session]||[]).map((x,i)=>`<div class="history-row"><b class="gold">${i+1}. ${esc(x.name)}</b><span style="float:right">${esc(x.duration)}</span><div class="tiny muted">${esc(athStepSummary(cur.session,i,x))}</div></div>`).join("")}</div>
    <div class="card finish-card"><div class="row-between"><div><div class="finish-title">⚑ Fin de séance</div><div class="tiny muted">60 min + 15 min de mobilité / étirements</div></div><div class="timer" id="total-dur">—</div></div><button class="btn gold block" id="save-session" style="margin-top:8px">▣ Enregistrer la séance</button></div>`);
  $("#open-ath-sheet").onclick=()=>openAthSheet(cur.session);
  $("#save-session").onclick=saveCurrentSession;tickTimer();
}
function athStepSummary(session,index,step){
  const values=state.athParams?.[session]?.[index]||{};
  const parts=(step.fields||[]).map(f=>values[f]?`${f}: ${values[f]}`:f);
  return parts.join(" · ");
}
function openAthSheet(session){
  const img=pathUrl(ATH_SHEETS[session]||""),steps=DATA.ath?.[session]||[];
  state.athParams[session]=state.athParams[session]||{};
  const overlay=document.createElement("div");overlay.className="sheet-overlay";overlay.innerHTML=`<div class="sheet">
    <div class="sheet-top"><div><div class="tiny gold">FICHE TECHNIQUE</div><b>${esc(niceSession(session))}</b></div><button class="btn" data-close-sheet>Fermer</button></div>
    <div class="sheet-canvas">${img?`<img data-fallback src="${img}" alt="${esc(niceSession(session))}">`:`<div class="empty" style="min-height:360px">Fiche ATH non associée.</div>`}</div>
    <div class="sheet-params"><h3>Paramètres de la séance</h3>${steps.map((step,i)=>`<div class="ath-param-block"><div class="row-between"><b>${i+1}. ${esc(step.name)}</b><span class="tiny gold">${esc(step.duration)}</span></div><div class="param-grid">${(step.fields||[]).map(field=>`<div class="field"><label>${esc(field)}</label><input data-ath-step="${i}" data-ath-field="${esc(field)}" value="${esc(state.athParams[session]?.[i]?.[field]||"")}" placeholder="${esc(field)}"></div>`).join("")}</div></div>`).join("")}
      <button class="btn gold block" id="save-ath-params" style="margin-top:8px">Enregistrer</button></div>
  </div>`;
  overlayRoot.innerHTML="";overlayRoot.appendChild(overlay);history.pushState(Object.assign(navState(),{overlay:"ath-sheet"}),"");
  $("[data-close-sheet]",overlay).onclick=()=>closeOverlay(true);
  $("#save-ath-params",overlay).onclick=()=>{const next={};$$("[data-ath-step]",overlay).forEach(input=>{const i=input.dataset.athStep;(next[i]||(next[i]={}))[input.dataset.athField]=input.value.trim();});state.athParams[session]=next;save();closeOverlay(true);render();};
}

function renderProgram(){
  shell(`${header("Programme","Organisation de vos séances","","compact")}
    <div class="tabs program-tabs">${["sessions","exercises","groups","manage"].map((m,i)=>`<button data-pmode="${m}" class="${programMode===m?"on":""}">${["Séances","Exercices","Groupes","Gestion"][i]}</button>`).join("")}</div>
    ${programMode==="sessions"?programSessions():programMode==="exercises"?programExercises():programMode==="groups"?programGroups():programManage()}`);
  $$("[data-pmode]").forEach(b=>b.onclick=()=>{programMode=b.dataset.pmode;history.replaceState(navState(),"");render();});
  bindProgramContent();
}
function programSessions(){
  return `<div class="row-between"><h2 class="section-title">Cycle principal G ⟳</h2><span class="tiny muted">Ordre du cycle : A → B → C</span></div>
    <div class="program-grid">${[1,2,3].map(n=>programGCard(n)).join("")}</div>
    <h2 class="section-title">Séances complémentaires</h2>
    <div class="complement-grid">${programCompCard("ATHLÉTIQUE",["A","B"],state.nextAth)}${programCompCard("FULL MIX",["1","2","3","4"],String(state.nextFm))}</div>
    <h2 class="section-title">Outils</h2>
    <div class="tools">
      <button class="tool" data-tool="exercises"><span class="ico">↔</span>Liste des exercices<br><span class="muted">Tous les mouvements</span></button>
      <button class="tool" data-tool="sheets"><span class="ico">▤</span>Fiches techniques<br><span class="muted">Images et conseils</span></button>
      <button class="tool" data-tool="manage"><span class="ico">⚙</span>Paramètres<br><span class="muted">Réglages généraux</span></button>
      <button class="tool" data-tool="progress"><span class="ico">▥</span>Statistiques<br><span class="muted">Suivi et progression</span></button>
    </div>
    <div class="card cycle-info"><div><span>Semaine actuelle</span><b>Semaine ${state.cycle}</b></div><div><span>Prochaine séance G</span><b>${state.completedG.includes(3)?"Terminée":sessionCode()}</b></div><div><span>Progression du cycle</span><div class="progress-track"><i style="width:${Math.min(100,(state.completedG.length/3)*100)}%"></i></div><b>${state.completedG.length} / 3</b></div></div>`;
}
function programGCard(n){
  const s=`G${n}${state.cycle}`, groups=groupLabel(s).split(" / ").map(esc).join("<br>"),first=sessionIds(s)[0],img=first?sheetFor(first,s,1):"";
  return `<div class="program-card" data-session-card="${s}" ${img?`style="--card-image:url('${img}')"`:""}><span class="code">G${n}</span><span class="groups">${groups}</span>
    <span class="variant-row">${cycles.map(c=>`<button data-open-g="${`G${n}${c}`}" class="${c===state.cycle?"on":""}">${c}</button>`).join("")}</span></div>`;
}
function programCompCard(title,variants,next){
  const session=title==="ATHLÉTIQUE"?`ATHLÉTIQUE ${next}`:`FULL MIX ${next}`, first=sessionIds(session)[0];
  const img=title==="ATHLÉTIQUE"?pathUrl(ATH_SHEETS[session]||""):(first?sheetFor(first,session,1):"");
  return `<div class="program-card comp-card" ${img?`style="--card-image:url('${img}')"`:""}><span class="code">${esc(title)}</span><span class="groups">${title==="ATHLÉTIQUE"?"Cardio / Endurance<br>Condition physique":"Séances complètes<br>Ciblées"}</span>
    <span class="variant-row fm-row">${variants.map(v=>`<button data-open-comp="${title==="ATHLÉTIQUE"?`ATHLÉTIQUE ${v}`:`FULL MIX ${v}`}" class="${v===next?"on":""}">${v}</button>`).join("")}</span></div>`;
}
function programExercises(){
  const reg=registry();const ids=Object.keys(reg).filter(id=>!state.archivedExercises.includes(id));
  return `<h2 class="section-title">Liste des exercices</h2><div class="card progress-list">${ids.map((id,i)=>{
    const o=occurrenceList(id)[0]||{s:reg[id].firstSession,n:reg[id].firstNo};const img=sheetFor(id,o.s,o.n);
    return `<div class="progress-row" data-open-ex="${esc(id)}" data-s="${esc(o.s||"")}" data-n="${o.n||1}"><div class="num">${String(i+1).padStart(2,"0")}</div><div class="thumb"><img data-fallback src="${img||"./assets/hero-final.jpg"}"></div><div><div class="ex-name">${esc(reg[id].name)}</div><div class="ex-sub">${esc(groupForId(id))}</div></div><div class="trend">${occurrenceList(id).length} séance(s)</div><div class="chev">›</div></div>`;
  }).join("")}</div>`;
}
function programGroups(){
  const groups=["Pectoraux","Dos","Épaules","Biceps","Triceps","Jambes","Abdos","Autre"];
  const reg=registry();
  return groups.map(g=>{const ids=Object.keys(reg).filter(id=>groupForId(id)===g&&!state.archivedExercises.includes(id));if(!ids.length)return"";
    return `<h2 class="section-title">${g}</h2><div class="card">${ids.map(id=>`<div class="history-row" data-open-ex="${esc(id)}" data-s="${esc(occurrenceList(id)[0]?.s||reg[id].firstSession||"")}" data-n="${occurrenceList(id)[0]?.n||reg[id].firstNo||1}"><b>${esc(reg[id].name)}</b><span class="gold" style="float:right">›</span></div>`).join("")}</div>`}).join("");
}
function programManage(){
  return `<h2 class="section-title">Gestion</h2>
    <div class="card">
      <button class="btn block" id="cycle-position">Repositionner le cycle G</button>
      <button class="btn block" id="backup" style="margin-top:6px">Sauvegarder toutes les données (JSON)</button>
      <label class="btn block" style="display:block;text-align:center;margin-top:6px">Restaurer une sauvegarde<input id="restore" type="file" accept=".json,application/json" hidden></label>
      <button class="btn block" id="export" style="margin-top:6px">Exporter l’historique (CSV)</button>
    </div>
    <h2 class="section-title">Exercices archivés</h2><div class="card">${state.archivedExercises.length?state.archivedExercises.map(id=>`<div class="history-row"><b>${esc(exercise(id).name)}</b><button class="backlink" data-unarchive="${esc(id)}" style="float:right">Restaurer</button></div>`).join(""):`<div class="empty">Aucun exercice archivé.</div>`}</div>`;
}
function bindProgramContent(){
  $$("[data-open-g],[data-open-comp]").forEach(b=>b.onclick=e=>{e.stopPropagation();pushNav({type:"programDetail",session:b.dataset.openG||b.dataset.openComp});});
  $$("[data-session-card]").forEach(b=>b.onclick=()=>pushNav({type:"programDetail",session:b.dataset.sessionCard}));
  $$("[data-open-ex]").forEach(b=>b.onclick=()=>openSheet(b.dataset.openEx,b.dataset.s,+b.dataset.n));
  $$("[data-tool]").forEach(b=>b.onclick=()=>{
    const t=b.dataset.tool;if(t==="progress"){pushNav(null,"progress");return;}
    programMode=t==="manage"?"manage":"exercises";history.replaceState(navState(),"");render();
  });
  if($("#cycle-position"))$("#cycle-position").onclick=openCycleModal;
  if($("#backup"))$("#backup").onclick=backupJSON;
  if($("#restore"))$("#restore").onchange=restoreJSON;
  if($("#export"))$("#export").onclick=exportCSV;
  $$("[data-unarchive]").forEach(b=>b.onclick=()=>{state.archivedExercises=state.archivedExercises.filter(x=>x!==b.dataset.unarchive);save();render();});
}
function renderProgramDetail(session){
  if(session.startsWith("ATHLÉTIQUE")){renderAthProgram(session);return;}
  const ids=sessionIds(session);
  shell(`<header class="session-header"><div class="session-header__content"><div class="backline"><button class="backlink" id="back-program">‹ Programme</button><button class="btn" id="edit-session">✎ Modifier</button></div>
    <div class="session-title">${esc(niceSession(session))}</div><div class="session-group">${esc(groupLabel(session))}</div></div></header>
    <div class="panel session-list" id="session-list">${ids.map((id,i)=>sessionRow(id,session,i+1)).join("")}</div>
    <button class="btn gold block add-exercise" id="add-exercise">＋ Ajouter un exercice</button>`);
  $("#back-program").onclick=()=>history.back();
  let editing=false;
  $("#edit-session").onclick=()=>{editing=!editing;$("#session-list").classList.toggle("editing",editing);$("#edit-session").textContent=editing?"✓ Terminer":"✎ Modifier";};
  $$("[data-session-row]").forEach(row=>row.onclick=e=>{if(!editing&&!e.target.closest(".handle")&&!e.target.closest(".row-menu"))openSheet(row.dataset.id,session,+row.dataset.no);});
  $$(".row-menu").forEach(b=>b.onclick=e=>{e.stopPropagation();openExerciseActionModal(session,b.closest("[data-session-row]").dataset.id);});
  enableSort($("#session-list"),session);
  $("#add-exercise").onclick=()=>openAddExerciseModal(session);
}
function sessionRow(id,session,no){
  const e=exercise(id),img=sheetFor(id,session,no);
  return `<div class="session-row" data-session-row data-id="${esc(id)}" data-no="${no}">
    <div class="num">${String(no).padStart(2,"0")}</div><div class="thumb"><img data-fallback src="${img||"./assets/hero-final.jpg"}"></div>
    <div><div class="ex-name">${esc(e.name)}</div><div class="ex-sub">${esc(groupForId(id))}</div></div><div class="chev">›</div><div><button class="row-menu">⋮</button><span class="handle">☷</span></div></div>`;
}
function enableSort(list,session){
  let drag=null;
  $$(".handle",list).forEach(h=>{
    h.addEventListener("pointerdown",e=>{if(!list.classList.contains("editing"))return;e.preventDefault();drag=h.closest("[data-session-row]");drag.classList.add("dragging");h.setPointerCapture?.(e.pointerId);});
    h.addEventListener("pointermove",e=>{if(!drag)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest("[data-session-row]");if(el&&el!==drag&&el.parentNode===list){const r=el.getBoundingClientRect();list.insertBefore(drag,e.clientY<r.top+r.height/2?el:el.nextSibling);}});
    h.addEventListener("pointerup",()=>{if(!drag)return;drag.classList.remove("dragging");state.programOverrides[session]=$$("[data-session-row]",list).map(x=>x.dataset.id);save();drag=null;renderProgramDetail(session);});
  });
}
function openAddExerciseModal(session){
  const reg=registry(),current=new Set(sessionIds(session));const ids=Object.keys(reg).filter(id=>!current.has(id)&&!state.archivedExercises.includes(id));
  openModal(`<h3>Ajouter un exercice</h3><p>Un exercice déjà utilisé garde la même identité, ses paramètres et son historique.</p>
    <div class="option-list">${ids.map(id=>`<div class="option-row"><div><b>${esc(reg[id].name)}</b><span>${esc(groupForId(id))} · ${occurrenceList(id).length} utilisation(s)</span></div><button class="btn" data-add-id="${esc(id)}">Ajouter</button></div>`).join("")}</div>
    <button class="btn gold block" id="create-new" style="margin-top:8px">Créer un nouvel exercice</button>`,()=>{
      $$("[data-add-id]").forEach(b=>b.onclick=()=>{const arr=sessionIds(session);arr.push(b.dataset.addId);state.programOverrides[session]=arr;save();closeOverlay(true);renderProgramDetail(session);});
      $("#create-new").onclick=()=>openCreateExerciseModal(session);
    });
}
function openCreateExerciseModal(session){
  if(history.state?.overlay) history.replaceState(navState(),"");
  overlayRoot.innerHTML="";
  openModal(`<h3>Nouvel exercice</h3><div class="field"><label>Nom</label><input id="new-name"></div><div class="field" style="margin-top:6px"><label>Groupe</label><select id="new-group">${["Pectoraux","Dos","Épaules","Biceps","Triceps","Jambes","Abdos","Autre"].map(g=>`<option>${g}</option>`).join("")}</select></div>
    <div class="field" style="margin-top:6px"><label>Type</label><select id="new-type"><option value="strength">Musculation</option><option value="gainage">Gainage</option><option value="circuit">Circuit</option></select></div>
    <div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="new-save">Créer</button></div>`,()=>{
      $("#new-save").onclick=()=>{const name=$("#new-name").value.trim();if(!name)return;const id="custom-"+Date.now();state.customExercises[id]={name,group:$("#new-group").value,paramType:$("#new-type").value,remark:""};const arr=sessionIds(session);arr.push(id);state.programOverrides[session]=arr;save();closeOverlay(true);renderProgramDetail(session);};
    });
}
function openExerciseActionModal(session,id){
  const targets=Object.keys(DATA.sessions||{}).filter(s=>s!==session);
  openModal(`<h3>${esc(exercise(id).name)}</h3><p>Déplacer ou retirer cet exercice ne supprime ni son identité, ni ses paramètres, ni son historique.</p>
    <div class="field"><label>Transférer vers</label><select id="transfer-target">${targets.map(s=>`<option value="${esc(s)}">${esc(niceSession(s))}</option>`).join("")}</select></div>
    <button class="btn block" id="transfer" style="margin-top:7px">Transférer</button><button class="btn block" id="remove" style="margin-top:6px">Retirer de cette séance</button><button class="btn block" id="archive" style="margin-top:6px">Archiver l’exercice</button>
    <button class="btn gold block" data-close-modal style="margin-top:8px">Fermer</button>`,()=>{
      $("#transfer").onclick=()=>{const target=$("#transfer-target").value;state.programOverrides[session]=sessionIds(session).filter(x=>x!==id);const t=sessionIds(target);if(!t.includes(id))t.push(id);state.programOverrides[target]=t;save();closeOverlay(true);renderProgramDetail(session);};
      $("#remove").onclick=()=>{state.programOverrides[session]=sessionIds(session).filter(x=>x!==id);save();closeOverlay(true);renderProgramDetail(session);};
      $("#archive").onclick=()=>{if(!state.archivedExercises.includes(id))state.archivedExercises.push(id);Object.keys(DATA.sessions||{}).forEach(s=>{if(sessionIds(s).includes(id))state.programOverrides[s]=sessionIds(s).filter(x=>x!==id)});save();closeOverlay(true);renderProgramDetail(session);};
    });
}
function renderAthProgram(session){
  const img=pathUrl(ATH_SHEETS[session]||"");
  shell(`<header class="session-header"><div class="session-header__content"><div class="backline"><button class="backlink" id="back-program">‹ Programme</button></div><div class="session-title">${esc(niceSession(session))}</div><div class="session-group">${esc(groupLabel(session))}</div></div></header>
    <button class="card ath-sheet-preview" id="open-ath-sheet"><img data-fallback src="${img||"./assets/hero-final.jpg"}" alt=""><span>Ouvrir la fiche technique complète ›</span></button>
    <div class="card">${(DATA.ath?.[session]||[]).map((x,i)=>`<div class="history-row"><b class="gold">${i+1}. ${esc(x.name)}</b><span style="float:right">${esc(x.duration)}</span><div class="tiny muted">${esc(athStepSummary(session,i,x))}</div></div>`).join("")}</div>`);
  $("#back-program").onclick=()=>history.back();
  $("#open-ath-sheet").onclick=()=>openAthSheet(session);
}

function allPerf(){
  const m={};(state.history||[]).forEach(h=>(h.exercises||[]).forEach(e=>{if(e.status==="Non réalisé")return;(m[e.id]||(m[e.id]=[])).push({date:h.date,value:e.actual,next:e.next,status:e.status,session:h.session,duration:h.duration});}));return m;
}
function periodStart(period){
  const d=new Date(); if(period==="1m")d.setMonth(d.getMonth()-1);else if(period==="3m")d.setMonth(d.getMonth()-3);else if(period==="6m")d.setMonth(d.getMonth()-6);else if(period==="1y")d.setFullYear(d.getFullYear()-1);else return null;return localISODate(d);
}
function trendFor(id,arr){
  if(!arr||arr.length<2)return{key:"none",label:"Données insuffisantes"};
  const nums=arr.map(x=>parseNumber(x.value)).filter(Number.isFinite);if(nums.length>=2&&nums.at(-1)<nums.at(-2))return{key:"down",label:"Régression"};
  let same=1;for(let i=arr.length-1;i>0;i--){if(normalizeRef(arr[i].value)===normalizeRef(arr[i-1].value))same++;else break;}
  if(same>=6)return{key:"flat",label:"Stagnation"};if(same>=4)return{key:"slow",label:"Progression lente"};
  if(nums.length>=2&&nums.at(-1)>nums[0])return{key:"up",label:"Progression nette"};
  return{key:"none",label:"Données insuffisantes"};
}
function normalizeRef(v){return String(v??"").trim().toLowerCase();}
function parseNumber(v){const m=String(v??"").replace(",",".").match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):NaN;}
function renderProgress(){
  const perf=allPerf(),reg=registry();let ids=Object.keys(reg).filter(id=>!state.archivedExercises.includes(id));
  if(progressionGroup!=="Tous")ids=ids.filter(id=>groupForId(id)===progressionGroup);
  const start=periodStart(progressionPeriod);if(start)ids=ids.filter(id=>(perf[id]||[]).some(x=>x.date>=start));
  const active=ids.filter(id=>(perf[id]||[]).length),progressing=active.filter(id=>["up","slow"].includes(trendFor(id,perf[id]).key)).length;
  shell(`${header("Progression","Suivi de vos performances","","compact")}
    <div class="tabs">${[["1m","Semaines"],["3m","Mois"],["1y","Années"],["all","Tous"]].map(([p,l])=>`<button data-prog-period="${p}" class="${progressionPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    <div class="metrics"><div class="metric"><b>${active.length}</b><span>Exercices suivis</span></div><div class="metric"><b>${active.length?Math.round(progressing/active.length*100):0}%</b><span>En progression</span></div><div class="metric"><b>${averageIncrease(perf,active)}%</b><span>Augmentation moyenne</span></div></div>
    <div class="filter-row">${["Tous","Pectoraux","Dos","Épaules","Biceps","Triceps","Jambes","Abdos"].map(g=>`<button data-prog-group="${g}" class="${progressionGroup===g?"on":""}">${g}</button>`).join("")}</div>
    <div class="panel progress-list">${ids.map((id,i)=>progressRow(id,i+1,perf[id]||[])).join("")||`<div class="empty">Aucune donnée pour ce filtre.</div>`}</div>`);
  $$("[data-prog-period]").forEach(b=>b.onclick=()=>{progressionPeriod=b.dataset.progPeriod;history.replaceState(navState(),"");render();});
  $$("[data-prog-group]").forEach(b=>b.onclick=()=>{progressionGroup=b.dataset.progGroup;history.replaceState(navState(),"");render();});
  $$("[data-progress-id]").forEach(r=>r.onclick=()=>pushNav({type:"progressDetail",id:r.dataset.progressId,sub:"evolution"}));
}
function averageIncrease(perf,ids){
  const vals=ids.map(id=>{const a=(perf[id]||[]).map(x=>parseNumber(x.value)).filter(Number.isFinite);return a.length>1&&a[0]!==0?(a.at(-1)-a[0])/a[0]*100:NaN;}).filter(Number.isFinite);
  return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
}
function progressRow(id,no,arr){
  const e=exercise(id),o=occurrenceList(id)[0]||{s:e.firstSession,n:e.firstNo},img=sheetFor(id,o.s,o.n),trend=trendFor(id,arr),last=arr.at(-1);
  return `<div class="progress-row" data-progress-id="${esc(id)}"><div class="num">${String(no).padStart(2,"0")}</div><div class="thumb"><img data-fallback src="${img||"./assets/hero-final.jpg"}"></div>
    <div><div class="ex-name">${esc(e.name)}</div><div class="ex-sub">${esc(groupForId(id))}</div><b style="font-size:13px">${esc(last?refWithUnit(last.value):refWithUnit(referenceFor(id)))}</b>${last?`<div class="tiny muted">Dernière séance ${formatDate(last.date)}</div>`:""}</div>
    <div class="trend ${trend.key==="slow"?"slow":trend.key==="flat"?"flat":trend.key==="down"?"down":""}">${trend.key==="up"?"↗ ":trend.key==="down"?"↘ ":trend.key==="flat"?"→ ":""}${trend.label}</div><div class="chev">›</div></div>`;
}
function renderProgressDetail(id,sub="evolution"){
  const arr=allPerf()[id]||[],e=exercise(id),o=occurrenceList(id)[0]||{s:e.firstSession,n:e.firstNo};
  const filtered=filterPerf(arr,progressionPeriod);const nums=filtered.map(x=>({x:x.date,y:parseNumber(x.value),raw:x})).filter(x=>Number.isFinite(x.y));
  const first=nums[0]?.y,last=nums.at(-1)?.y,delta=(Number.isFinite(first)&&Number.isFinite(last))?last-first:null,pct=(delta!=null&&first)?Math.round(delta/first*100):null,trend=trendFor(id,filtered);
  shell(`<div class="detail-hero"><button class="backlink" id="back-progress">‹ Progression</button><h1>${esc(e.name)}</h1><div class="small">${esc(groupForId(id))}</div><button class="star" data-open-detail-sheet="1">☆</button></div>
    <div class="tabs">${["evolution","history","stats"].map((x,i)=>`<button data-detail-tab="${x}" class="${sub===x?"on":""}">${["Évolution","Historique","Statistiques"][i]}</button>`).join("")}</div>
    <div class="filter-row">${[["1m","1 mois"],["3m","3 mois"],["6m","6 mois"],["1y","1 an"],["all","Tous"]].map(([p,l])=>`<button data-detail-period="${p}" class="${progressionPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    ${sub==="evolution"?progressEvolutionContent(nums,delta,pct,trend):sub==="history"?progressHistoryContent(filtered):progressStatsContent(filtered)}
    <div class="card"><div class="row-between"><b class="serif gold">Paramètres de progression</b><button class="backlink" id="edit-prog-settings">Modifier</button></div>${progressSettingsContent(id)}</div>`);
  $("#back-progress").onclick=()=>history.back();
  $$("[data-detail-tab]").forEach(b=>b.onclick=()=>{view={type:"progressDetail",id,sub:b.dataset.detailTab};history.replaceState(navState(),"");render();});
  $$("[data-detail-period]").forEach(b=>b.onclick=()=>{progressionPeriod=b.dataset.detailPeriod;history.replaceState(navState(),"");render();});
  $("[data-open-detail-sheet]").onclick=()=>openSheet(id,o.s,o.n);
  $("#edit-prog-settings").onclick=()=>openProgressSettingsModal(id);
}
function filterPerf(arr,period){const st=periodStart(period);return st?arr.filter(x=>x.date>=st):arr.slice();}
function progressEvolutionContent(nums,delta,pct,trend){
  return `<div class="chart">${lineChart(nums)}</div><div class="metrics"><div class="metric"><b>${delta==null?"—":`${delta>0?"+":""}${round1(delta)}`}</b><span>Évolution sur la période</span></div><div class="metric"><b>${pct==null?"—":`${pct>0?"+":""}${pct}%`}</b><span>Progression</span></div><div class="metric"><b style="font-size:15px">${trend.label}</b><span>Tendance</span></div></div>${progressHistoryContent(nums.map(x=>x.raw).slice(-5))}`;
}
function progressHistoryContent(arr){
  return `<div class="card"><div class="section-title" style="margin:0 0 5px">Dernières séances</div>${arr.length?arr.slice().reverse().map(x=>`<div class="last-row"><span>${formatDate(x.date)}</span><b>${esc(refWithUnit(x.value))}</b><span>${esc(x.session)}</span><span>${esc(x.status)}</span></div>`).join(""):`<div class="empty">Pas encore de données.</div>`}</div>`;
}
function progressStatsContent(arr){
  const vals=arr.map(x=>parseNumber(x.value)).filter(Number.isFinite);
  const best=vals.length?Math.max(...vals):null,avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  return `<div class="metrics"><div class="metric"><b>${arr.length}</b><span>Occurrences</span></div><div class="metric"><b>${best==null?"—":round1(best)}</b><span>Meilleure référence</span></div><div class="metric"><b>${avg==null?"—":round1(avg)}</b><span>Moyenne</span></div></div>`;
}
function lineChart(nums){
  if(nums.length<1)return`<div class="empty">Le graphique apparaîtra après les premières performances chiffrées.</div>`;
  const W=320,H=170,p=25,ys=nums.map(x=>x.y),min=Math.min(...ys),max=Math.max(...ys),span=Math.max(1,max-min);
  const pts=nums.map((x,i)=>({x:p+i*((W-2*p)/Math.max(1,nums.length-1)),y:H-p-(x.y-min)/span*(H-2*p),v:x.y,d:x.x}));
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><g class="chart-grid">${[0,1,2,3].map(i=>`<line x1="${p}" y1="${p+i*(H-2*p)/3}" x2="${W-p}" y2="${p+i*(H-2*p)/3}"/>`).join("")}</g>
    <polyline class="chart-line" points="${pts.map(q=>`${q.x},${q.y}`).join(" ")}"/>${pts.map(q=>`<circle class="chart-point" cx="${q.x}" cy="${q.y}" r="4"/><text class="chart-label" x="${q.x}" y="${q.y-8}" text-anchor="middle">${round1(q.v)}</text>`).join("")}</svg>`;
}
function progressSettingsContent(id){
  const p=Object.assign({type:"Charge + répétitions",increment:"+ 2,5 kg",objective:"4 × 10"},state.progressionSettings[id]||{});
  return `<div class="history-row">Type de progression <span style="float:right">${esc(p.type)}</span></div><div class="history-row">Incrément par défaut <span style="float:right">${esc(p.increment)}</span></div><div class="history-row">Objectif actuel <span style="float:right">${esc(p.objective)}</span></div><div class="history-row">Référence prévue <span style="float:right">${esc(refWithUnit(referenceFor(id)))}</span></div>`;
}
function openProgressSettingsModal(id){
  const p=Object.assign({type:"Charge + répétitions",increment:"+ 2,5 kg",objective:"4 × 10"},state.progressionSettings[id]||{});
  openModal(`<h3>Paramètres de progression</h3><div class="field"><label>Type</label><input id="ps-type" value="${esc(p.type)}"></div><div class="field" style="margin-top:6px"><label>Incrément</label><input id="ps-inc" value="${esc(p.increment)}"></div><div class="field" style="margin-top:6px"><label>Objectif</label><input id="ps-obj" value="${esc(p.objective)}"></div><div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="ps-save">Enregistrer</button></div>`,()=>{
    $("#ps-save").onclick=()=>{state.progressionSettings[id]={type:$("#ps-type").value,increment:$("#ps-inc").value,objective:$("#ps-obj").value};save();closeOverlay(true);render();};
  });
}

function renderHistory(){
  const scoped=historyScope(historyPeriod,historyYear),hs=scoped.history,old=scoped.old;
  const total=hs.reduce((a,h)=>a+(+h.duration||0),0),count=hs.length+old.reduce((a,w)=>a+(+w.count||0),0);
  const weekDur=weeklyDurations(hs),knownWeeks=Object.keys(weekDur),best=Math.max(historyPeriod==="year"&&historyYear===2025?500:0,...Object.values(weekDur),0),avgWeek=knownWeeks.length?Math.round(total/knownWeeks.length):0,attendance=attendancePct(historyYear,hs,old);
  shell(`${header("Historique","","","compact")}
    <div class="tabs">${[["week","Semaine"],["month","Mois"],["year","Année"],["all","Toutes"]].map(([p,l])=>`<button data-hperiod="${p}" class="${historyPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    <div class="history-year"><button id="prev-year">‹</button><b>${esc(scoped.label)}</b><button id="next-year">›</button></div>
    <div class="history-grid">
      <div><b>${count}</b><span>Séances</span></div><div><b>${formatMinutes(total)}</b><span>Durée totale connue</span></div><div><b>${formatMinutes(avgWeek)}</b><span>Moyenne / semaine</span></div>
      <div><b>${attendance}%</b><span>Assiduité</span></div><div><b>${Math.max(0,Object.values(weekDur).filter(v=>v>=300).length)}</b><span>Semaines ≥ 5 séances</span></div><div><b>${formatMinutes(best)}</b><span>Meilleure semaine</span></div>
    </div>
    <div class="card"><div class="section-title" style="margin:0 0 4px">Volume d’entraînement</div><div class="filter-row"><button class="on">Durée</button><button>Nombre de séances</button><button>Moyenne</button></div>${monthBars(hs)}</div>
    <div class="card"><div class="section-title" style="margin:0 0 4px">Répartition par groupe musculaire</div>${muscleDonut(hs)}<button class="btn block" id="month-detail">▣ Voir le détail par mois ›</button></div>`);
  $$("[data-hperiod]").forEach(b=>b.onclick=()=>{historyPeriod=b.dataset.hperiod;history.replaceState(navState(),"");render();});
  $("#prev-year").onclick=()=>{historyYear--;history.replaceState(navState(),"");render();};$("#next-year").onclick=()=>{historyYear++;history.replaceState(navState(),"");render();};
  $("#month-detail").onclick=()=>{const month=historyYear===new Date().getFullYear()?new Date().getMonth()+1:12;pushNav({type:"historyMonth",year:historyYear,month});};
}
function historyScope(period,year){
  const allH=state.history||[], allOld=state.oldWeeks||[];
  if(period==="all")return{history:allH.slice(),old:allOld.slice(),label:"Toutes"};
  const yh=historyForYear(year),yo=oldWeekEntries(year);
  if(period==="year")return{history:yh,old:yo,label:String(year)};
  const now=new Date(), month=(year===now.getFullYear()?now.getMonth()+1:12), monthPrefix=`${year}-${String(month).padStart(2,"0")}`;
  if(period==="month")return{history:yh.filter(h=>String(h.date).startsWith(monthPrefix)),old:yo.filter(w=>String(w.week||w.date||"").startsWith(monthPrefix)),label:new Date(year,month-1,1).toLocaleDateString("fr-FR",{month:"long",year:"numeric"})};
  const candidates=[...yh.map(h=>localISODate(mondayOf(new Date(h.date+"T12:00:00")))),...yo.map(w=>String(w.week||w.date||"").slice(0,10))].filter(Boolean).sort();
  const currentWk=year===now.getFullYear()?currentWeekKey():null, target=currentWk||candidates.at(-1)||`${year}-01-01`;
  return{history:yh.filter(h=>localISODate(mondayOf(new Date(h.date+"T12:00:00")))===target),old:yo.filter(w=>String(w.week||w.date||"").slice(0,10)===target),label:`Semaine du ${formatDate(target)}`};
}
function historyForYear(y){return (state.history||[]).filter(h=>Number(String(h.date).slice(0,4))===+y);}
function oldWeekEntries(y){return (state.oldWeeks||[]).filter(w=>Number(String(w.week||w.date||"").slice(0,4))===+y);}
function weeklyDurations(hs){const m={};hs.forEach(h=>{const k=localISODate(mondayOf(new Date(h.date+"T12:00:00")));m[k]=(m[k]||0)+(+h.duration||0);});return m;}
function attendancePct(y,hs,old){
  const weeks={};
  hs.forEach(h=>{const k=localISODate(mondayOf(new Date(h.date+"T12:00:00")));weeks[k]=(weeks[k]||0)+1;});
  old.forEach(w=>{const k=w.week||w.date;weeks[k]=(weeks[k]||0)+(+w.count||0);});
  const keys=Object.keys(weeks);if(!keys.length)return 0;
  let got=0,target=0;keys.forEach(k=>{const oldItem=old.find(w=>(w.week||w.date)===k),t=oldItem?3:5;got+=Math.min(weeks[k],t);target+=t;});return Math.round(got/target*100);
}
function monthBars(hs){
  const vals=Array(12).fill(0);hs.forEach(h=>{const m=Number(h.date.slice(5,7))-1;if(m>=0)vals[m]+=+h.duration||0;});const max=Math.max(1,...vals);
  return `<div class="bar-chart">${vals.map((v,i)=>`<div class="bar" style="height:${Math.max(1,v/max*100)}%"><label>${"JFMAMJJASOND"[i]}</label></div>`).join("")}</div>`;
}
function muscleDonut(hs){
  const counts={Pectoraux:0,Dos:0,Épaules:0,Biceps:0,Triceps:0,Jambes:0,Abdos:0};
  hs.forEach(h=>(h.exercises||[]).forEach(e=>{const g=groupForId(e.id);if(g in counts)counts[g]++;}));
  const total=Object.values(counts).reduce((a,b)=>a+b,0);
  return `<div class="donut-wrap"><div class="donut"></div><div class="legend">${Object.entries(counts).map(([g,v])=>`<div><span><i></i>${g}</span><b>${total?Math.round(v/total*100):0}%</b></div>`).join("")}</div></div>`;
}
function renderHistoryMonth(year,month){
  const hs=(state.history||[]).filter(h=>+h.date.slice(0,4)===+year&&+h.date.slice(5,7)===+month).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const label=new Date(year,month-1,1).toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
  shell(`${header("Historique",label,"","compact")}<button class="backlink" id="back-history">‹ Bilan annuel</button><div class="history-year"><button id="prev-month">‹</button><b>${esc(label)}</b><button id="next-month">›</button></div>
    <div class="card">${hs.length?hs.map(h=>`<div class="history-row" data-history-id="${esc(h.id)}"><b>${formatDate(h.date)} · ${esc(niceSession(h.session))}</b><span class="gold" style="float:right">${formatMinutes(+h.duration||0)} ›</span><div class="tiny muted">${esc(h.start||"")}${h.end?` → ${esc(h.end)}`:""}</div></div>`).join(""):`<div class="empty">Aucune séance détaillée enregistrée pour ce mois.</div>`}</div>`);
  $("#back-history").onclick=()=>history.back();
  $("#prev-month").onclick=()=>{let y=year,m=month-1;if(m<1){m=12;y--;}view={type:"historyMonth",year:y,month:m};history.replaceState(navState(),"");render();};
  $("#next-month").onclick=()=>{let y=year,m=month+1;if(m>12){m=1;y++;}view={type:"historyMonth",year:y,month:m};history.replaceState(navState(),"");render();};
  $$("[data-history-id]").forEach(r=>r.onclick=()=>pushNav({type:"historyDetail",id:r.dataset.historyId}));
}
function renderHistoryDetail(id){
  const h=(state.history||[]).find(x=>x.id===id);if(!h){history.back();return;}
  shell(`${header("Historique",`${formatDate(h.date)} · ${niceSession(h.session)}`,"","compact")}<button class="backlink" id="back-hdetail">‹ Retour</button>
    <div class="card"><div class="row-between"><div><div class="section-title" style="margin:0">${esc(niceSession(h.session))}</div><div class="tiny muted">${esc(h.start||"")}${h.end?` → ${esc(h.end)}`:""}</div></div><span class="cycle-chip"><b>${formatMinutes(+h.duration||0)}</b><span>Durée</span></span></div>
    ${(h.exercises||[]).map((e,i)=>`<div class="history-row"><span class="gold">${String(i+1).padStart(2,"0")}</span> <b>${esc(e.name)}</b><span style="float:right">${esc(e.status)}</span><div class="tiny muted">${esc(refWithUnit(e.actual||"—"))}${e.next?` · prochaine : ${esc(refWithUnit(e.next))}`:""}</div></div>`).join("")||`<div class="empty">Cette séance ne contient pas de détail d’exercice exploitable.</div>`}</div>`);
  $("#back-hdetail").onclick=()=>history.back();
}

function openSheet(id,session,no){
  const e=exercise(id),occ=occurrenceList(id),img=sheetFor(id,session,no),p=defaultParams(id);
  const overlay=document.createElement("div");overlay.className="sheet-overlay";overlay.innerHTML=`<div class="sheet">
    <div class="sheet-top"><div><div class="tiny gold">FICHE TECHNIQUE</div><b>${esc(e.name)}</b></div><button class="btn" data-close-sheet>Fermer</button></div>
    <div class="sheet-canvas">${img?`<img data-fallback src="${img}" alt="${esc(e.name)}">`:`<div class="empty" style="min-height:360px">Fiche technique non associée.</div>`}
      <div class="sheet-context"><div><label>Séance</label><select id="sheet-session">${(occ.length?occ:[{s:session,n:no}]).map(o=>`<option value="${esc(o.s)}" ${o.s===session?"selected":""}>${esc(niceSession(o.s))}</option>`).join("")}</select></div>
      <div><label>Exercice</label><input id="sheet-no" readonly value="${no||occ[0]?.n||1}"></div></div>
    </div>
    <div class="sheet-params"><h3>Paramètres de l’exercice</h3><div class="param-grid">${paramInputs(p)}</div><button class="btn gold block" id="save-params" style="margin-top:7px">Enregistrer</button></div>
  </div>`;
  overlayRoot.innerHTML="";overlayRoot.appendChild(overlay);history.pushState(Object.assign(navState(),{overlay:"sheet"}),"");
  $("[data-close-sheet]",overlay).onclick=()=>closeOverlay(true);
  $("#sheet-session",overlay).onchange=()=>{const o=occ.find(x=>x.s===$("#sheet-session",overlay).value);if(o)$("#sheet-no",overlay).value=o.n;};
  $("#save-params",overlay).onclick=()=>{const next={type:p.type};$$("[data-param]",overlay).forEach(i=>next[i.dataset.param]=i.value);state.params[id]=next;if(next.charge)state.refs[id]=next.charge;save();closeOverlay(true);render();};
}
function paramInputs(p){
  const labels={series:"Séries",repetitions:"Répétitions",charge:"Charge / référence",increment:"Incrément",reposSeries:"Repos entre séries",reposExercices:"Repos entre exercices",tours:"Tours",normal:"Gainage normal",gauche:"Latéral gauche",droite:"Latéral droit",repos:"Repos",duree:"Durée totale"};
  return Object.entries(p).filter(([k])=>k!=="type").map(([k,v])=>`<div class="field"><label>${esc(labels[k]||k)}</label><input data-param="${esc(k)}" value="${esc(v)}"></div>`).join("");
}
function openCycleModal(){
  openModal(`<h3>Position du cycle G</h3><p>Le cycle hebdomadaire suit A → B → C. Un G manqué n’est pas reporté à la semaine suivante.</p>
    <div class="param-grid"><div class="field"><label>Semaine</label><select id="cycle-edit">${cycles.map(c=>`<option ${c===state.cycle?"selected":""}>${c}</option>`).join("")}</select></div><div class="field"><label>Prochaine G</label><select id="g-edit">${[1,2,3].map(n=>`<option value="${n}" ${n===+state.nextG?"selected":""}>G${n}</option>`).join("")}</select></div></div>
    <div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="cycle-save">Enregistrer</button></div>`,()=>{
      $("#cycle-save").onclick=()=>{state.cycle=$("#cycle-edit").value;state.nextG=+$("#g-edit").value;state.completedG=Array.from({length:Math.max(0,state.nextG-1)},(_,i)=>i+1);state.weekKey=currentWeekKey();state.today=null;save();closeOverlay(true);render();};
    });
}
function openModal(html,onReady){
  const ov=document.createElement("div");ov.className="modal-overlay";ov.innerHTML=`<div class="modal">${html}</div>`;overlayRoot.innerHTML="";overlayRoot.appendChild(ov);
  history.pushState(Object.assign(navState(),{overlay:"modal"}),"");
  $$("[data-close-modal]",ov).forEach(b=>b.onclick=()=>closeOverlay(true));
  ov.onclick=e=>{if(e.target===ov)closeOverlay(true);};
  onReady?.(ov);
}
function closeOverlay(goBack){
  overlayRoot.innerHTML="";
  if(goBack && history.state?.overlay)history.back();
}
function formatDate(iso){if(!iso)return"—";const d=new Date(iso+"T12:00:00");return d.toLocaleDateString("fr-FR");}
function formatMinutes(min){min=Math.max(0,Math.round(+min||0));return `${Math.floor(min/60)} h ${String(min%60).padStart(2,"0")}`;}
function round1(v){return Math.round(v*10)/10;}

function backupJSON(){download("fitness-sauvegarde-v4.json",JSON.stringify(state,null,2),"application/json");}
function exportCSV(){
  const rows=[["date","séance","début","fin","durée_min","exercice","valeur","statut","prochaine"]];
  (state.history||[]).forEach(h=>(h.exercises||[]).forEach(e=>rows.push([h.date,h.session,h.start,h.end,h.duration,e.name,e.actual,e.status,e.next])));
  download("fitness-export.csv",rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\n"),"text/csv");
}
function download(name,content,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function restoreJSON(e){
  const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const incoming=JSON.parse(r.result);state=Object.assign(defaultState(),incoming,{appRev:APP_REV});save();alert("Sauvegarde restaurée.");render();}catch{alert("Sauvegarde invalide.");}};r.readAsText(f);
}

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-tab]");if(!b)return;const next=b.dataset.tab;if(!tabs.includes(next)||next===tab&&view.type==="root")return;pushNav(null,next);
});
render();
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();
