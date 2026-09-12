
(() => {
"use strict";
const DATA = window.FITNESS_DATA || {sessions:{},paramType:{},ath:{}};
const OCCURRENCE_SHEETS = window.FITNESS_OCCURRENCE_SHEETS || {};
const ATH_SHEETS = window.FITNESS_ATH_SHEETS || {};
const KEY = "fitness-reconstruit-v2";
const APP_REV = 9;
const cycles = ["A","B","C"];
const tabs = ["today","program","progress","history"];
const $=(q,r=document)=>r.querySelector(q);
const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const clone=x=>JSON.parse(JSON.stringify(x));
function icon(name){
  const paths={
    dumbbell:'<path d="M6 7v10M3.5 9v6M18 7v10M20.5 9v6M6 12h12M1.5 10.5v3M22.5 10.5v3"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><rect x="8" y="14" width="3" height="3" rx=".5"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
    file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
    swap:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
    pencil:'<path d="M4 20l4.5-1 10-10-3.5-3.5-10 10zM13.8 6.7l3.5 3.5"/>',
    flag:'<path d="M5 21V4M5 5c4-3 7 3 12 0v9c-5 3-8-3-12 0"/>',
    save:'<path d="M5 3h12l3 3v15H4V3zM8 3v6h8V3M8 15h8v6H8z"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    arrowleft:'<path d="m15 18-6-6 6-6"/>',
    rotate:'<path d="M20 7v5h-5M20 12a8 8 0 1 0-2.3 5.7"/>',
    star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    more:'<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
    grip:'<path d="M8 7h8M8 12h8M8 17h8"/>',
    check:'<path d="m5 12 4 4 10-10"/>',
    x:'<path d="m7 7 10 10M17 7 7 17"/>',
    ban:'<circle cx="12" cy="12" r="8"/><path d="m7 7 10 10"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.list}</svg>`;
}
const app=$("#app"), overlayRoot=$("#overlay-root");

const UI_KEY="fitness-ui-v9";
const SCROLL_KEY="fitness-tab-scroll-v9";
let savedUI=null;try{savedUI=JSON.parse(localStorage.getItem(UI_KEY)||"null")}catch{}
let savedScroll=null;try{savedScroll=JSON.parse(sessionStorage.getItem(SCROLL_KEY)||"null")}catch{}
let tab=tabs.includes(savedUI?.tab)?savedUI.tab:"today";
let view={type:"root"};
let programMode=["sessions","groups","manage"].includes(savedUI?.programMode)?savedUI.programMode:(savedUI?.programMode==="exercises"?"groups":"sessions");
let programExerciseGroup=savedUI?.programExerciseGroup||"Tous";
let progressionPeriod=savedUI?.progressionPeriod||"all";
let progressionGroup=savedUI?.progressionGroup||"Tous";
let progressionView=savedUI?.progressionView||"overview";
let historyPeriod=savedUI?.historyPeriod||"year";
let historyYear=Number.isFinite(+savedUI?.historyYear)?+savedUI.historyYear:new Date().getFullYear();
const tabScroll=Object.assign({today:0,program:0,progress:0,history:0},savedScroll||{});
let navTransitionClass="";
function rememberTabScroll(){
  if(view?.type==="root"&&tabs.includes(tab)){
    tabScroll[tab]=window.scrollY||0;
    try{sessionStorage.setItem(SCROLL_KEY,JSON.stringify(tabScroll));}catch{}
  }
}
function restoreTabScroll(name=tab){requestAnimationFrame(()=>window.scrollTo({top:tabScroll[name]||0,left:0,behavior:"auto"}));}
function persistUI(){
  try{localStorage.setItem(UI_KEY,JSON.stringify({tab,programMode,programExerciseGroup,progressionPeriod,progressionGroup,progressionView,historyPeriod,historyYear}));}catch{}
}

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
    today:null,todayDismissed:null,lastComplement:{},nextAth:"A",nextFm:1,athParams:{},appRev:APP_REV
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
  s.history=(Array.isArray(s.history)?s.history:[]).filter(h=>h&&typeof h==="object").map((h,i)=>{
    const exercises=Array.isArray(h.exercises)?h.exercises:(h.exercises&&typeof h.exercises==="object"?Object.values(h.exercises):[]);
    const safeExercises=exercises.filter(e=>e&&typeof e==="object").map((e,j)=>Object.assign({},e,{id:e.id||e.name||`ancien-exercice-${i+1}-${j+1}`}));
    return Object.assign({},h,{id:h.id||`legacy-${i}-${String(h.date||"")}`,date:String(h.date||"").slice(0,10),exercises:safeExercises});
  });
  s.completedG=Array.isArray(s.completedG)?s.completedG:[];
  s.oldWeeks=(Array.isArray(s.oldWeeks)?s.oldWeeks:[]).filter(w=>w&&typeof w==="object");
  s.refs=s.refs||{}; s.params=s.params||{}; s.sessionOrder=s.sessionOrder||{};
  s.programOverrides=s.programOverrides||{}; s.customExercises=s.customExercises||{};
  s.archivedExercises=Array.isArray(s.archivedExercises)?s.archivedExercises:[];
  s.progressionSettings=s.progressionSettings||{}; s.lastComplement=s.lastComplement||{}; s.athParams=s.athParams||{};
  if(!raw?.nextAth || !raw?.nextFm) inferRotations(s);
  // Preserve the previous reordering model by converting sessionOrder into complete overrides only when safe.
  Object.entries(s.sessionOrder).forEach(([session,ids])=>{
    if(!s.programOverrides[session] && Array.isArray(ids) && ids.length) s.programOverrides[session]=ids.slice();
  });
  if((raw?.appRev||0)<5 && s.today?.startedAt && !s.today?.manualTimes){
    s.today.start="";s.today.end="";delete s.today.startedAt;
  }
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
    .replace(/TRICEPS/gi,"Triceps").replace(/\bDOS\b/gi,"Dos").replace(/ÉPAULES|EPAULES/gi,"Épaules")
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
function canonicalSheetOccurrence(id){
  return Object.entries(DATA.sessions||{}).flatMap(([s,es])=>es.map((e,i)=>({s,e,n:i+1}))).find(x=>x.e.id===id && sheetPathForOccurrence(x.s,x.n));
}
function sheetFor(id,session,no){
  // A position-specific file is valid only while the same canonical exercise still occupies its original position.
  // After drag/drop or transfer, fall back to the exercise's canonical sheet so identity never follows a slot number.
  const originalId=DATA.sessions?.[session]?.[Math.max(0,(+no||1)-1)]?.id;
  const contextual=sheetPathForOccurrence(session,no);
  if(contextual && originalId===id)return pathUrl(contextual);
  const originalOccurrence=canonicalSheetOccurrence(id);
  if(originalOccurrence)return pathUrl(sheetPathForOccurrence(originalOccurrence.s,originalOccurrence.n));
  const custom=state.customExercises?.[id]?.sheetPath;return custom?pathUrl(custom):"";
}
function thumbClass(img){return img?"fiche-thumb":"fallback-thumb";}
function groupForId(id){
  const occ=Object.entries(OCCURRENCE_SHEETS).find(([k])=>{
    const [s,n]=k.split("|"); return DATA.sessions?.[s]?.[+n-1]?.id===id;
  });
  const p=occ?.[1]||"";
  if(p.includes("A_PECTORAUX"))return"Pectoraux"; if(p.includes("B_BICEPS"))return"Biceps";
  if(p.includes("A_DOS"))return"Dos"; if(p.includes("B_TRICEPS"))return"Triceps";
  if(p.includes("A_EPAULES"))return"Épaules"; if(p.includes("B_JAMBES"))return"Jambes";
  if(p.includes("/ABDOS/"))return"Abdos";
  const n=String(exercise(id).name||id||"").toLowerCase();
  if(/abdo|crunch|gainage|pallof|wood chop|relevé de (jambes|genoux)/.test(n))return"Abdos";
  if(/curl|biceps/.test(n))return"Biceps"; if(/triceps|dips|barre au front/.test(n))return"Triceps";
  if(/rowing|tirage|traction|soulevé de terre|lat pulldown|lombaire/.test(n))return"Dos";
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
function normalizeWeight(v){
  const raw=String(v??"").trim();if(!raw)return"";
  const m=raw.replace(",",".").match(/-?\d+(?:\.\d+)?/);if(!m)return raw;
  const n=Number(m[0]);if(!Number.isFinite(n))return raw;
  return `${String(n).replace(".",",")} kg`;
}
function refWithUnit(v){const s=String(v||"—").trim();return s==="—"||s===""?"—":/[a-zA-Z]/.test(s)?s:normalizeWeight(s);}
function occKey(id,no){return `${id}@@${no}`;}
function occurrenceStatus(cur,id,no){return cur?.status?.[occKey(id,no)] ?? cur?.status?.[id] ?? "";}
function occurrenceValue(cur,id,no){return cur?.values?.[occKey(id,no)] ?? cur?.values?.[id] ?? referenceFor(id);}
function occurrenceNext(cur,id,no){return cur?.nextRefs?.[occKey(id,no)] ?? cur?.nextRefs?.[id] ?? "";}
function navState(){return {tab,view,programMode,programExerciseGroup,progressionPeriod,progressionGroup,progressionView,historyPeriod,historyYear};}
function applyNavState(st){
  if(!st)return; tab=tabs.includes(st.tab)?st.tab:tab; view=st.view||{type:"root"}; programMode=["sessions","groups","manage"].includes(st.programMode)?st.programMode:(st.programMode==="exercises"?"groups":programMode); programExerciseGroup=st.programExerciseGroup||programExerciseGroup;
  progressionPeriod=st.progressionPeriod||progressionPeriod; progressionGroup=st.progressionGroup||progressionGroup; progressionView=st.progressionView||progressionView;
  historyPeriod=st.historyPeriod||historyPeriod; historyYear=st.historyYear||historyYear;
  persistUI();
}
function pushNav(v=null,newTab=null){
  if(newTab){
    rememberTabScroll();
    const from=tabs.indexOf(tab),to=tabs.indexOf(newTab);
    navTransitionClass=to>from?"slide-from-right":"slide-from-left";
    tab=newTab;view={type:"root"};
  } else if(v){rememberTabScroll();view=v;}
  persistUI();
  history.pushState(navState(),""); render();
  if(newTab){restoreTabScroll(newTab);setTimeout(()=>{navTransitionClass="";},220);}
}
history.replaceState(navState(),"");
persistUI();
window.addEventListener("popstate",e=>{
  const activeOverlay=overlayRoot.firstElementChild;
  if(activeOverlay){overlayRoot.innerHTML=""; return;}
  rememberTabScroll();
  const prev=tab;applyNavState(e.state||{tab:"today",view:{type:"root"}});
  if(tab!==prev){navTransitionClass=tabs.indexOf(tab)>tabs.indexOf(prev)?"slide-from-right":"slide-from-left";}
  render();
  if(view?.type==="root")restoreTabScroll(tab);
  setTimeout(()=>{navTransitionClass="";},220);
});

function nav(){
  $$(".bottom-nav button").forEach(b=>{
    b.classList.toggle("on",b.dataset.tab===tab);
    b.onclick=e=>{e.preventDefault();const next=b.dataset.tab;if(tabs.includes(next)&&!(next===tab&&view.type==="root"))pushNav(null,next);};
  });
}
function headerAsset(title){
  if(title==="Aujourd’hui")return "./assets/hero-today-official.png";
  if(title==="Programme")return "./assets/hero-program-official.png";
  if(title==="Progression")return "./assets/hero-progress-official.png";
  if(title==="Historique")return "./assets/hero-history-official.png";
  return "./assets/hero-program-official.png";
}
function header(title,subtitle="",extra="",cls=""){
  const asset=headerAsset(title);
  return `<header class="header ${cls}" style="--session-image:url('${asset}')">
    <div class="header__content">
      <div class="header__row">
        <div><h1>${esc(title)}</h1>${subtitle?`<div class="subtitle">${esc(subtitle)}</div>`:""}${extra}</div>
        ${title==="Aujourd’hui"?`<button class="cycle-chip" data-cycle-menu><b>Cycle G</b><span>Semaine ${state.cycle}</span></button>`:""}
      </div>
    </div>
  </header>`;
}
function shell(content,screenClass=""){
  document.body.classList.toggle("lock-program-home",screenClass==="program-home-screen");
  app.innerHTML=`<main class="app ${screenClass==="program-home-screen"?"app-program-home":""}"><section class="screen ${screenClass} ${navTransitionClass}">${content}</section></main>`;
  nav();bindGlobalInView();
}
function bindGlobalInView(){
  $$('[data-cycle-menu]').forEach(b=>b.onclick=()=>openCycleModal());
  $$("img[data-fallback]").forEach(img=>img.onerror=()=>{img.onerror=null;img.classList.remove("fiche-thumb");img.classList.add("fallback-thumb");img.src="./assets/hero-program-official.png";});
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
  document.body.classList.remove("lock-program-home");
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
  let cur=state.today;
  if(!cur){
    const g3done=state.completedG.includes(3);
    if(g3done){
      const ath=`ATHLÉTIQUE ${state.nextAth}`,fm=`FULL MIX ${state.nextFm}`;
      shell(`${header("Aujourd’hui",date,"","tall")}
        <div class="card comp-choice"><div class="row-between"><div><div class="small gold serif">Socle hebdomadaire terminé</div><div class="tiny muted">Choisissez la séance complémentaire à ouvrir.</div></div><span class="cycle-chip"><b>Semaine ${state.cycle}</b><span>Complémentaires</span></span></div></div>
        <h2 class="section-title">Séances complémentaires</h2>
        <div class="complement-grid">${complementChoiceCard(ath,"ATHLÉTIQUE",state.nextAth)}${complementChoiceCard(fm,"FULL MIX",String(state.nextFm))}</div>`);
      $$('[data-start-session]').forEach(b=>b.onclick=()=>{initToday(b.dataset.startSession);render();});
      return;
    }
    const expected=sessionCode();
    if(state.todayDismissed?.date===localISODate()&&state.todayDismissed?.session===expected){
      shell(`${header("Aujourd’hui",date,`<div class="session-code">${niceSession(expected)}</div><div class="session-groups">${groupLabel(expected)}</div>`,"tall")}
        <div class="today-waiting-gym" aria-hidden="true"></div>
        <div class="card cancelled-session-card"><div><div class="section-title" style="margin:0">Séance annulée</div><div class="small muted">${esc(niceSession(expected))} reste la prochaine séance prévue. Elle n’a créé aucune performance et le cycle n’a pas avancé.</div></div><button class="btn gold" id="resume-session">Ouvrir ${esc(niceSession(expected))}</button></div>`,"today-waiting-screen");
      $("#resume-session").onclick=()=>{initToday(expected);render();};
      return;
    }
    initToday(expected);
    cur=state.today;
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
  state.today={session,start:"",end:"",manualTimes:true,status:{},values:snapshot,nextRefs:{}};
  state.todayDismissed=null;
  save();
}
function minutesBetweenTimes(start,end){
  if(!/^\d{2}:\d{2}$/.test(start||"")||!/^\d{2}:\d{2}$/.test(end||""))return null;
  const [sh,sm]=start.split(":").map(Number),[eh,em]=end.split(":").map(Number);
  let mins=(eh*60+em)-(sh*60+sm);if(mins<0)mins+=1440;return mins;
}
function durationClock(cur){
  const mins=minutesBetweenTimes(cur?.start,cur?.end);if(mins==null)return"--:--:--";
  return `${String(Math.floor(mins/60)).padStart(2,"0")}:${String(mins%60).padStart(2,"0")}:00`;
}
function timeButton(value,id){return `<button class="time-edit" id="${id}">${esc(value||"--:--")} ${icon("pencil")}</button>`;}
function renderActiveToday(cur,date){
  if(cur.session.startsWith("ATHLÉTIQUE")){renderActiveAth(cur,date);return;}
  const ids=sessionIds(cur.session),statuses=ids.map((id,i)=>occurrenceStatus(cur,id,i+1)),success=statuses.filter(x=>x==="Réussi").length,fail=statuses.filter(x=>x==="Échoué").length,skip=statuses.filter(x=>x==="Non réalisé").length;
  shell(`${header("Aujourd’hui",date,`<div class="session-code">${niceSession(cur.session)}</div><div class="session-groups">${groupLabel(cur.session)}</div>`,"tall")}
    <div class="today-meta">
      <div><div class="meta-label">Heure de début</div>${timeButton(cur.start,"edit-start")}</div><div class="line"></div>
      <div style="text-align:center"><div class="meta-label">Durée calculée</div><div class="timer">${durationClock(cur)}</div></div>
    </div>
    <div>${ids.map((id,i)=>todayExerciseCard(id,cur.session,i+1,cur)).join("")}</div>
    <button class="btn session-cancel-bottom" id="cancel-session">${icon("x")} Annuler la séance</button>
    <div class="card finish-card">
      <div class="finish-head"><div><div class="finish-title">${icon("flag")} Fin de séance</div><div class="tiny muted">Heure de fin</div>${timeButton(cur.end,"edit-end")}</div>
      <div class="finish-stat"><span>Durée totale</span><b>${durationClock(cur)}</b></div>
      <div><div class="tiny serif gold" style="text-align:center;margin-bottom:3px">Bilan</div><div class="bilan"><div><b>${success}</b><span>Réussis</span></div><div><b>${fail}</b><span>Échoués</span></div><div><b>${skip}</b><span>Non réalisés</span></div></div></div></div>
      <button class="btn gold block save-session-btn" id="save-session">${icon("save")} Enregistrer la séance</button>
    </div>`,"today-screen");
  $$('[data-status]').forEach(b=>b.onclick=()=>setExerciseStatus(b.dataset.id,b.dataset.status,+b.dataset.no));
  $$('[data-sheet]').forEach(b=>b.onclick=()=>openSheet(b.dataset.sheet,b.dataset.session,+b.dataset.no));
  $("#edit-start").onclick=()=>editSessionTimes("start");$("#edit-end").onclick=()=>editSessionTimes("end");
  $("#save-session").onclick=saveCurrentSession;$("#cancel-session").onclick=cancelCurrentSession;
}
function todayExerciseCard(id,session,no,cur){
  const e=exercise(id),st=occurrenceStatus(cur,id,no),img=sheetFor(id,session,no),ref=occurrenceValue(cur,id,no);
  const firstPendingNo=sessionIds(session).findIndex((x,i)=>!["Réussi","Échoué","Non réalisé"].includes(occurrenceStatus(cur,x,i+1)))+1;
  return `<div class="exercise-card ${firstPendingNo===no?"current":""}">
    <div class="thumb"><img class="${thumbClass(img)}" data-fallback src="${img||"./assets/hero-today.jpg"}" alt=""></div>
    <div class="ex-info"><div class="ex-name"><span class="inline-no">${no}.</span> ${esc(e.name)}</div><div class="ex-sub">${esc(groupForId(id))}</div><div class="ex-ref">Charge / référence prévue <b>${esc(refWithUnit(ref))}</b></div></div>
    <button class="backlink chev" data-sheet="${esc(id)}" data-session="${esc(session)}" data-no="${no}" aria-label="Voir la fiche">${icon("chevron")}</button>
    <div class="status-actions">
      ${[["Réussi","check"],["Échoué","x"],["Non réalisé","ban"]].map(([x,ic])=>`<button class="status-btn ${st===x?"sel":""}" data-status="${x}" data-id="${esc(id)}" data-no="${no}">${icon(ic)} ${x}</button>`).join("")}
    </div>
  </div>`;
}
function sessionHasDraftData(cur){
  if(!cur)return false;
  return !!(cur.start||cur.end||Object.keys(cur.status||{}).length||Object.keys(cur.nextRefs||{}).length);
}
function cancelCurrentSession(){
  const cur=state.today;if(!cur)return;
  const finish=()=>{
    state.todayDismissed={date:localISODate(),session:cur.session};
    state.today=null;
    save();
    rememberTabScroll();
    tab="today";view={type:"root"};overlayRoot.innerHTML="";
    tabScroll.today=0;persistUI();
    history.replaceState(navState(),"");
    render();restoreTabScroll("today");
  };
  if(!sessionHasDraftData(cur)){finish();return;}
  openModal(`<h3>Annuler la séance ?</h3><p>Les informations saisies pour cette séance seront supprimées. Le cycle, l’historique et les statistiques ne seront pas modifiés.</p><div class="modal-actions"><button class="btn ghost" data-close-modal>Continuer la séance</button><button class="btn gold" id="confirm-cancel-session">Annuler la séance</button></div>`,()=>{$("#confirm-cancel-session").onclick=finish;});
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
      $("#confirm-next").onclick=()=>{const raw=$("#next-ref").value.trim()||current;const v=p.type==="strength"?normalizeWeight(raw):raw;closeOverlay(true);done(v);};
    });
}
function normalizeTimeInput(value){
  const raw=String(value||"").trim().toLowerCase().replace(/\s+/g,"");
  const m=raw.match(/^(\d{1,2})(?:h|:)?(\d{2})$/);if(!m)return"";
  const h=+m[1],mins=+m[2];return h>=0&&h<24&&mins>=0&&mins<60?`${String(h).padStart(2,"0")}:${String(mins).padStart(2,"0")}`:"";
}
function timeInputValue(value){return String(value||"").replace(":","h");}
function nowTime(){const d=new Date();return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;}
function editSessionTimes(focus="start"){
  const cur=state.today;if(!cur)return;
  openModal(`<h3>Horaires de la séance</h3><p>Saisissez directement l’heure, par exemple 11h25 ou 11:25.</p>
    <div class="param-grid"><div class="field"><label>Heure de début</label><input type="text" inputmode="numeric" maxlength="5" placeholder="11h25" id="start-edit" value="${esc(timeInputValue(cur.start))}"></div><div class="field"><label>Heure de fin</label><input type="text" inputmode="numeric" maxlength="5" placeholder="12h40" id="end-edit" value="${esc(timeInputValue(cur.end))}"></div></div>
    <button class="btn block" id="time-now" style="margin-top:8px">Maintenant</button><div class="time-error" id="time-error"></div>
    <div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="save-times">Valider</button></div>`,()=>{
      setTimeout(()=>$(focus==="end"?"#end-edit":"#start-edit")?.focus(),30);
      $("#time-now").onclick=()=>{$(focus==="end"?"#end-edit":"#start-edit").value=timeInputValue(nowTime());};
      $("#save-times").onclick=()=>{const a=$("#start-edit").value.trim(),b=$("#end-edit").value.trim(),start=a?normalizeTimeInput(a):"",end=b?normalizeTimeInput(b):"";if(a&&!start||b&&!end){$("#time-error").textContent="Utilisez le format 11h25 ou 11:25.";return;}cur.start=start;cur.end=end;cur.manualTimes=true;save();closeOverlay(true);render();};
    });
}
function saveCurrentSession(){
  const cur=state.today;if(!cur)return;
  if(minutesBetweenTimes(cur.start,cur.end)==null){
    openModal(`<h3>Horaires à compléter</h3><p>Indiquez l'heure de début et l'heure de fin avant d'enregistrer la séance.</p>
      <div class="param-grid"><div class="field"><label>Heure de début</label><input type="text" inputmode="numeric" maxlength="5" placeholder="11h25" id="req-start" value="${esc(timeInputValue(cur.start))}"></div><div class="field"><label>Heure de fin</label><input type="text" inputmode="numeric" maxlength="5" placeholder="12h40" id="req-end" value="${esc(timeInputValue(cur.end))}"></div></div><div class="time-error" id="req-time-error"></div>
      <div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="req-save">Continuer</button></div>`,()=>{
        $("#req-save").onclick=()=>{const a=normalizeTimeInput($("#req-start").value),b=normalizeTimeInput($("#req-end").value);if(!a||!b){$("#req-time-error").textContent="Indiquez deux heures valides, par exemple 11h25 et 12h40.";return;}cur.start=a;cur.end=b;cur.manualTimes=true;save();closeOverlay(true);setTimeout(saveCurrentSession,0);};
      });
    return;
  }
  if(!cur.session.startsWith("ATHLÉTIQUE")){
    const ids=sessionIds(cur.session);
    const missing=ids.map((id,i)=>({id,no:i+1,key:occKey(id,i+1)})).filter(o=>!["Réussi","Échoué","Non réalisé"].includes(occurrenceStatus(cur,o.id,o.no)));
    if(missing.length){
      openModal(`<h3>Statuts à compléter</h3><p>${missing.length} exercice(s) n'ont pas encore de statut. Chaque exercice doit être Réussi, Échoué ou Non réalisé.</p>
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
  const mins=minutesBetweenTimes(cur.start,cur.end);if(mins==null)return;
  const ids=cur.session.startsWith("ATHLÉTIQUE")?[]:sessionIds(cur.session);
  const exRecords=ids.map((id,i)=>{const no=i+1,status=occurrenceStatus(cur,id,no),actual=occurrenceValue(cur,id,no),next=occurrenceNext(cur,id,no)||actual;return{id,name:exercise(id).name,status,actual,next,no};}).filter(e=>e.status!=="Non réalisé");
  state.history.push({id:"h"+Date.now(),date:localISODate(),session:cur.session,start:cur.start,end:cur.end,duration:mins,exercises:exRecords});
  ids.forEach((id,i)=>{const v=occurrenceNext(cur,id,i+1);if(!v)return;state.refs[id]=v;const p=defaultParams(id);if(p.type==="strength"){p.charge=v;state.params[id]=p;}});
  if(/^G[123][ABC]$/.test(cur.session)){
    const n=+cur.session[1]; if(!state.completedG.includes(n))state.completedG.push(n);state.nextG=Math.min(3,n+1);
  }else if(cur.session.startsWith("ATHLÉTIQUE")){
    state.lastComplement[cur.session]=new Date().toLocaleDateString("fr-FR");state.nextAth=cur.session.endsWith("A")?"B":"A";
  }else if(cur.session.startsWith("FULL MIX")){
    state.lastComplement[cur.session]=new Date().toLocaleDateString("fr-FR");const n=Number(cur.session.match(/\d+/)?.[0]||1);state.nextFm=(n%4)+1;
  }
  state.todayDismissed=null;state.today=null;save();render();
}
function renderActiveAth(cur,date){
  const p=ATH_SHEETS[cur.session],img=p?pathUrl(p):"";
  shell(`${header("Aujourd’hui",date,`<div class="session-code">${niceSession(cur.session)}</div><div class="session-groups">${groupLabel(cur.session)}</div><button class="header-cancel" id="cancel-session">${icon("x")} Annuler</button>`,"tall")}
    <div class="today-meta"><div><div class="meta-label">Heure de début</div>${timeButton(cur.start,"edit-start")}</div><div class="line"></div><div style="text-align:center"><div class="meta-label">Durée calculée</div><div class="timer">${durationClock(cur)}</div></div></div>
    <button class="card ath-sheet-preview" id="open-ath-sheet"><img data-fallback src="${img||"./assets/hero-today.jpg"}" alt=""><span>Ouvrir la fiche technique complète ${icon("chevron")}</span></button>
    <div class="card">${(DATA.ath?.[cur.session]||[]).map((x,i)=>`<div class="history-row"><b class="gold">${i+1}. ${esc(x.name)}</b><span style="float:right">${esc(x.duration)}</span><div class="tiny muted">${esc(athStepSummary(cur.session,i,x))}</div></div>`).join("")}</div>
    <div class="card finish-card"><div class="finish-head"><div><div class="finish-title">${icon("flag")} Fin de séance</div><div class="tiny muted">Heure de fin</div>${timeButton(cur.end,"edit-end")}</div><div class="finish-stat"><span>Durée totale</span><b>${durationClock(cur)}</b></div><div class="tiny muted" style="text-align:right">60 min + 15 min mobilité</div></div><button class="btn gold block save-session-btn" id="save-session">${icon("save")} Enregistrer la séance</button></div>`,"today-screen");
  $("#open-ath-sheet").onclick=()=>openAthSheet(cur.session);$("#edit-start").onclick=()=>editSessionTimes("start");$("#edit-end").onclick=()=>editSessionTimes("end");$("#save-session").onclick=saveCurrentSession;$("#cancel-session").onclick=cancelCurrentSession;
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
    <div class="tabs program-tabs">${["sessions","groups","manage"].map((m,i)=>`<button data-pmode="${m}" class="${programMode===m?"on":""}">${["Séances","Groupes","Paramètres"][i]}</button>`).join("")}</div>
    ${programMode==="sessions"?programSessions():programMode==="groups"?programGroups():programManage()}`,programMode==="sessions"?"program-home-screen":"program-scroll-screen");
  $$('[data-pmode]').forEach(b=>b.onclick=()=>{const next=b.dataset.pmode;if(next==="groups"&&programMode!=="groups")programExerciseGroup="Tous";programMode=next;persistUI();history.replaceState(navState(),"");render();});
  bindProgramContent();
}
function programSessions(){
  return `<div class="program-home"><div class="row-between"><h2 class="section-title">Cycle principal G ${icon("rotate")}</h2><span class="tiny muted">Ordre du cycle : A → B → C</span></div>
    <div class="program-grid">${[1,2,3].map(n=>programGCard(n)).join("")}</div>
    <h2 class="section-title">Séances complémentaires</h2>
    <div class="complement-grid">${programCompCard("ATHLÉTIQUE",["A","B"],state.nextAth)}${programCompCard("FULL MIX",["1","2","3","4"],String(state.nextFm))}</div>
    <div class="card cycle-info"><div><span>Semaine actuelle</span><b>Semaine ${state.cycle}</b></div><div><span>Prochaine séance G</span><b>${state.completedG.includes(3)?"Terminée":sessionCode()}</b></div><div><span>Progression du cycle</span><div class="progress-track"><i style="width:${Math.min(100,(state.completedG.length/3)*100)}%"></i></div><b>${state.completedG.length} / 3</b></div></div></div>`;
}
function programGCard(n){
  const s=`G${n}${state.cycle}`,groups=groupLabel(s).split(" / ").map(esc).join("<br>"),asset=`./assets/card-g${n}-official.png`;
  const positionMap={1:'right center',2:'right center',3:'right center'};return `<div class="program-card" data-session-card="${s}" style="--card-image:url('${asset}');--card-position:${positionMap[n]}"><span class="code">G${n}</span><span class="groups">${groups}</span>
    <span class="variant-row">${cycles.map(c=>`<button data-open-g="${`G${n}${c}`}" class="">${c}</button>`).join("")}</span></div>`;
}
function programCompCard(title,variants,next){
  const asset=title==="ATHLÉTIQUE"?"./assets/card-ath-official.png":"./assets/card-fm-official.png";
  const pos='right center';
  return `<div class="program-card comp-card" style="--card-image:url('${asset}');--card-position:${pos}"><span class="code">${esc(title)}</span><span class="groups">${title==="ATHLÉTIQUE"?"Cardio / Endurance<br>Condition physique":"Séances complètes<br>Ciblées"}</span>
    <span class="variant-row fm-row">${variants.map(v=>`<button data-open-comp="${title==="ATHLÉTIQUE"?`ATHLÉTIQUE ${v}`:`FULL MIX ${v}`}" class="">${v}</button>`).join("")}</span></div>`;
}
function programExercises(group){
  const reg=registry(),ids=Object.keys(reg).filter(id=>!state.archivedExercises.includes(id)&&groupForId(id)===group).sort((a,b)=>reg[a].name.localeCompare(reg[b].name,"fr"));
  return `<div class="group-detail-head"><button class="backlink" data-back-groups>${icon("arrowleft")} Retour aux groupes</button><h2 class="section-title">${esc(group)}</h2><span>${ids.length} exercice${ids.length>1?"s":""}</span></div>
    <section class="library-section"><div class="panel">${ids.map(id=>{
      const o=occurrenceList(id).find(x=>groupForId(id)===group)||occurrenceList(id)[0]||{s:reg[id].firstSession,n:reg[id].firstNo},img=sheetFor(id,o.s,o.n),count=occurrenceList(id).length;
      return `<div class="library-row" data-open-ex="${esc(id)}" data-s="${esc(o.s||"")}" data-n="${o.n||1}"><div class="thumb"><img class="${thumbClass(img)}" data-fallback src="${img||"./assets/hero-program-official.png"}"></div><div class="library-copy"><div class="ex-name">${esc(reg[id].name)}</div><div class="ex-sub">${esc(group)}</div></div><div class="trend">${count} séance${count>1?"s":""}</div><div class="chev">${icon("chevron")}</div></div>`;
    }).join("")||`<div class="empty">Aucun exercice dans ce groupe.</div>`}</div></section>`;
}
function programGroups(){
  const groups=["Pectoraux","Dos","Épaules","Biceps","Triceps","Jambes","Abdos"],reg=registry();
  if(programExerciseGroup!=="Tous")return programExercises(programExerciseGroup);
  return `<h2 class="section-title">Groupes musculaires</h2><div class="group-card-grid">${groups.map(g=>{const count=Object.keys(reg).filter(id=>groupForId(id)===g&&!state.archivedExercises.includes(id)).length;return `<button class="group-card" data-group-open="${esc(g)}"><b>${esc(g)}</b><span>${count} exercice${count>1?"s":""}</span></button>`;}).join("")}</div>`;
}
function programManage(){
  return `<h2 class="section-title">Paramètres</h2>
    <div class="card">
      <button class="btn block" id="cycle-position">Repositionner le cycle G</button>
      <button class="btn block" id="backup" style="margin-top:6px">Sauvegarder toutes les données (JSON)</button>
      <label class="btn block" style="display:block;text-align:center;margin-top:6px">Restaurer une sauvegarde<input id="restore" type="file" accept=".json,application/json" hidden></label>
      <button class="btn block" id="export" style="margin-top:6px">Exporter l’historique (CSV)</button>
    </div>
    <h2 class="section-title">Exercices archivés</h2><div class="card">${state.archivedExercises.length?state.archivedExercises.map(id=>`<div class="history-row"><b>${esc(exercise(id).name)}</b><button class="backlink" data-unarchive="${esc(id)}" style="float:right">Restaurer</button></div>`).join(""):`<div class="empty">Aucun exercice archivé.</div>`}</div>`;
}
let programVariantTimer=0;
function activateProgramVariant(btn){
  const session=btn?.dataset?.openG||btn?.dataset?.openComp;if(!session||programVariantTimer)return;
  // Android peut émettre un clic synthétique après pointerup. On laisse ce clic
  // se terminer sur l'ancienne carte avant d'afficher les lignes d'exercices.
  programVariantTimer=setTimeout(()=>{programVariantTimer=0;pushNav({type:"programDetail",session});},60);
}
function bindVariantScrub(){
  $$(".variant-row").forEach(row=>{
    const buttons=$$("button[data-open-g],button[data-open-comp]",row);if(!buttons.length)return;
    let active=false,hovered=null,pointerId=null;
    const clear=()=>{buttons.forEach(b=>b.classList.remove("preview"));hovered=null;};
    const update=(x,y)=>{clear();const el=document.elementFromPoint(x,y)?.closest("button[data-open-g],button[data-open-comp]");if(el&&row.contains(el)){hovered=el;el.classList.add("preview");}};
    row.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;active=true;pointerId=e.pointerId;row.setPointerCapture?.(pointerId);update(e.clientX,e.clientY);e.preventDefault();e.stopPropagation();});
    row.addEventListener("pointermove",e=>{if(active&&e.pointerId===pointerId){update(e.clientX,e.clientY);e.preventDefault();}});
    row.addEventListener("pointerup",e=>{if(!active||e.pointerId!==pointerId)return;update(e.clientX,e.clientY);const target=hovered;active=false;row.releasePointerCapture?.(pointerId);pointerId=null;clear();e.preventDefault();e.stopPropagation();if(target)activateProgramVariant(target);});
    row.addEventListener("pointercancel",()=>{active=false;pointerId=null;clear();});
    buttons.forEach(b=>b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activateProgramVariant(b);}}));
    row.addEventListener("click",e=>{if(e.target.closest("button[data-open-g],button[data-open-comp]")){e.preventDefault();e.stopPropagation();}},true);
  });
}
function bindProgramContent(){
  bindVariantScrub();
  $$('[data-session-card]').forEach(b=>b.onclick=e=>{if(e.target.closest('.variant-row'))return;pushNav({type:"programDetail",session:b.dataset.sessionCard});});
  $$('[data-open-ex]').forEach(b=>b.onclick=()=>openSheet(b.dataset.openEx,b.dataset.s,+b.dataset.n));
  $$('[data-group-open]').forEach(b=>b.onclick=()=>{programExerciseGroup=b.dataset.groupOpen;programMode="groups";persistUI();history.replaceState(navState(),"");render();});
  $$('[data-back-groups]').forEach(b=>b.onclick=()=>{programExerciseGroup="Tous";persistUI();history.replaceState(navState(),"");render();});
  if($("#cycle-position"))$("#cycle-position").onclick=openCycleModal;
  if($("#backup"))$("#backup").onclick=backupJSON;
  if($("#restore"))$("#restore").onchange=restoreJSON;
  if($("#export"))$("#export").onclick=exportCSV;
  $$('[data-unarchive]').forEach(b=>b.onclick=()=>{state.archivedExercises=state.archivedExercises.filter(x=>x!==b.dataset.unarchive);save();render();});
}
function renderProgramDetail(session){
  if(session.startsWith("ATHLÉTIQUE")){renderAthProgram(session);return;}
  const ids=sessionIds(session);
  const heroAsset=session.startsWith("G1")?"./assets/card-g1-official.png":session.startsWith("G2")?"./assets/card-g2-official.png":session.startsWith("G3")?"./assets/card-g3-official.png":"./assets/card-fm-official.png";
  shell(`<header class="session-header" style="--session-image:url('${heroAsset}')"><div class="session-header__content"><div class="backline"><button class="backlink" id="back-program">${icon("arrowleft")} Programme</button><button class="btn" id="edit-session">${icon("pencil")} Modifier</button></div>
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
    <div class="thumb"><img class="${thumbClass(img)}" data-fallback src="${img||"./assets/hero-program-official.png"}"></div>
    <div class="session-copy"><div class="ex-name"><span class="inline-no">${no}.</span> ${esc(e.name)}</div><div class="ex-sub">${esc(groupForId(id))}</div></div><div class="chev">${icon("chevron")}</div><div><button class="row-menu">${icon("more")}</button><span class="handle">${icon("grip")}</span></div></div>`;
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
  shell(`<header class="session-header" style="--session-image:url('./assets/card-ath-official.png')"><div class="session-header__content"><div class="backline"><button class="backlink" id="back-program">${icon("arrowleft")} Programme</button></div><div class="session-title">${esc(niceSession(session))}</div><div class="session-group">${esc(groupLabel(session))}</div></div></header>
    <button class="card ath-sheet-preview" id="open-ath-sheet"><img data-fallback src="${img||"./assets/hero-program-official.png"}" alt=""><span>Ouvrir la fiche technique complète ›</span></button>
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
function progressHomeTabs(){
  return `<div class="progress-home-tabs">
    <button data-prog-view="overview" class="${progressionView==="overview"?"on":""}">${icon("chart")}<span>Vue d’ensemble</span></button>
    <button data-prog-view="performance" class="${progressionView==="performance"?"on":""}">${icon("trend")}<span>Performances</span></button>
    <button data-prog-view="history" class="${progressionView==="history"?"on":""}">${icon("clock")}<span>Historique</span></button>
  </div>`;
}
function weekKeyFromDate(date){
  const d=new Date(`${date||localISODate()}T12:00:00`);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);
  return localISODate(d);
}
function progressionGlobalPercent(perf){
  const deltas=[];
  Object.values(perf).forEach(arr=>{
    const nums=(arr||[]).map(x=>parseNumber(x.value)).filter(Number.isFinite);
    if(nums.length<2||nums[0]===0)return;
    deltas.push((nums.at(-1)-nums[0])/Math.abs(nums[0])*100);
  });
  return deltas.length?Math.round(deltas.reduce((a,b)=>a+b,0)/deltas.length):0;
}
function progressOverviewData(){
  const hist=state.history||[],perf=allPerf();
  const sessions=hist.length;
  const exercises=hist.reduce((n,h)=>n+(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length,0);
  const minutes=hist.reduce((n,h)=>n+(Number(h.duration)||0),0);
  const global=progressionGlobalPercent(perf);
  const now=new Date(),weeks=[];
  for(let i=5;i>=0;i--){
    const d=new Date(now);d.setDate(d.getDate()-i*7);const wk=weekKeyFromDate(localISODate(d));
    const count=hist.filter(h=>weekKeyFromDate(h.date)===wk).reduce((n,h)=>n+(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length,0);
    weeks.push({label:`S${6-i}`,value:count});
  }
  const groups={Pectoraux:0,Dos:0,"Épaules":0,Bras:0,Jambes:0,Abdos:0};
  hist.forEach(h=>(h.exercises||[]).forEach(e=>{
    if(e.status==="Non réalisé")return;
    let g=groupForId(e.id);if(g==="Biceps"||g==="Triceps")g="Bras";if(g==="Mollets")g="Jambes";if(g==="Abdominaux")g="Abdos";
    if(groups[g]!==undefined)groups[g]++;
  }));
  const total=Object.values(groups).reduce((a,b)=>a+b,0)||1;
  const distribution=Object.entries(groups).map(([name,value])=>({name,value,pct:Math.round(value/total*100)}));
  return{sessions,exercises,minutes,global,weeks,distribution};
}
function overviewBars(weeks){
  const max=Math.max(1,...weeks.map(x=>x.value));
  return `<div class="overview-bars">${weeks.map(x=>`<div class="overview-bar-col"><div class="overview-bar-value">${x.value}</div><i style="height:${Math.max(4,Math.round(x.value/max*100))}%"></i><span>${x.label}</span></div>`).join("")}</div>`;
}
function overviewDonut(distribution,total){
  const palette=["#f2cf72","#d7ad50","#f0d596","#9e8655","#c9973d","#b9934b"];
  let cursor=0,stops=[];
  distribution.forEach((x,i)=>{const from=cursor,to=cursor+x.pct;stops.push(`${palette[i]} ${from}% ${to}%`);cursor=to;});
  if(cursor<100)stops.push(`#2b2924 ${cursor}% 100%`);
  return `<div class="overview-donut-wrap"><div class="overview-donut" style="background:conic-gradient(${stops.join(",")})"><div><b>${total}</b><span>exercices</span></div></div><div class="overview-legend">${distribution.map((x,i)=>`<div><span><i style="background:${palette[i]}"></i>${x.name}</span><b>${x.pct}%</b></div>`).join("")}</div></div>`;
}
function renderProgressOverview(){
  const d=progressOverviewData(),hours=Math.floor(d.minutes/60),mins=d.minutes%60;
  return `${progressHomeTabs()}
    <div class="overview-title-row"><h2>Résumé global</h2><div><span>Cycle actuel</span><b>Cycle G - Semaine ${state.cycle}</b></div></div>
    <div class="overview-metrics">
      <div class="overview-metric"><span class="overview-metric-icon">${icon("dumbbell")}</span><b>${d.sessions}</b><span>Séances<br>réalisées</span></div>
      <div class="overview-metric"><span class="overview-metric-icon">${icon("chart")}</span><b>${d.exercises}</b><span>Exercices<br>effectués</span></div>
      <div class="overview-metric"><span class="overview-metric-icon">${icon("clock")}</span><b>${hours}h ${String(mins).padStart(2,"0")}</b><span>Temps total</span></div>
      <div class="overview-metric"><span class="overview-metric-icon">${icon("trend")}</span><b>${d.global>0?"+":""}${d.global}%</b><span>Progression<br>globale</span></div>
    </div>
    <div class="overview-section-head"><h2>Évolution du volume</h2><span>6 dernières semaines</span></div>
    <div class="overview-panel">${overviewBars(d.weeks)}</div>
    <div class="overview-section-head"><h2>Répartition par groupe musculaire</h2></div>
    <div class="overview-panel">${overviewDonut(d.distribution,d.exercises)}</div>`;
}
function renderProgressPerformance(){
  const perf=allPerf(),reg=registry();let ids=Object.keys(reg).filter(id=>!state.archivedExercises.includes(id));
  if(progressionGroup!=="Tous")ids=ids.filter(id=>groupForId(id)===progressionGroup);
  const start=periodStart(progressionPeriod);if(start)ids=ids.filter(id=>(perf[id]||[]).some(x=>x.date>=start));
  const active=ids.filter(id=>(perf[id]||[]).length),progressing=active.filter(id=>["up","slow"].includes(trendFor(id,perf[id]).key)).length;
  return `${progressHomeTabs()}<div class="tabs">${[["1m","Semaines"],["3m","Mois"],["1y","Années"],["all","Tous"]].map(([p,l])=>`<button data-prog-period="${p}" class="${progressionPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    <div class="metrics"><div class="metric"><b>${active.length}</b><span>Exercices suivis</span></div><div class="metric"><b>${active.length?Math.round(progressing/active.length*100):0}%</b><span>En progression</span></div><div class="metric"><b>${averageIncrease(perf,active)}%</b><span>Augmentation moyenne</span></div></div>
    <div class="filter-row">${["Tous","Pectoraux","Dos","Épaules","Biceps","Triceps","Jambes","Abdos"].map(g=>`<button data-prog-group="${g}" class="${progressionGroup===g?"on":""}">${g}</button>`).join("")}</div>
    <div class="panel progress-list">${ids.map((id,i)=>progressRow(id,i+1,perf[id]||[])).join("")||`<div class="empty">Aucune donnée pour ce filtre.</div>`}</div>`;
}
function renderProgressHistoryHome(){
  const recent=[...(state.history||[])].slice().reverse().slice(0,20);
  return `${progressHomeTabs()}<div class="overview-section-head"><h2>Historique des séances</h2><span>${recent.length} dernières</span></div><div class="panel progress-history-home">${recent.map(h=>`<div class="progress-history-row"><div><b>${esc(h.session||"Séance")}</b><span>${esc(h.date||"")}</span></div><div><b>${Number(h.duration)||0} min</b><span>${(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length} exercices</span></div></div>`).join("")||`<div class="empty">Aucune séance enregistrée.</div>`}</div>`;
}
function renderProgress(){
  const body=progressionView==="overview"?renderProgressOverview():progressionView==="history"?renderProgressHistoryHome():renderProgressPerformance();
  shell(`${header("Progression","Suivi de vos performances","","compact")}${body}`,"progress-screen");
  $$('[data-prog-view]').forEach(b=>b.onclick=()=>{progressionView=b.dataset.progView;persistUI();history.replaceState(navState(),"");render();});
  $$("[data-prog-period]").forEach(b=>b.onclick=()=>{progressionPeriod=b.dataset.progPeriod;persistUI();history.replaceState(navState(),"");render();});
  $$("[data-prog-group]").forEach(b=>b.onclick=()=>{progressionGroup=b.dataset.progGroup;persistUI();history.replaceState(navState(),"");render();});
  $$("[data-progress-id]").forEach(r=>r.onclick=()=>pushNav({type:"progressDetail",id:r.dataset.progressId,sub:"evolution"}));
}
function averageIncrease(perf,ids){
  const vals=ids.map(id=>{const a=(perf[id]||[]).map(x=>parseNumber(x.value)).filter(Number.isFinite);return a.length>1&&a[0]!==0?(a.at(-1)-a[0])/a[0]*100:NaN;}).filter(Number.isFinite);
  return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
}
function progressRow(id,no,arr){
  const e=exercise(id),o=occurrenceList(id)[0]||{s:e.firstSession,n:e.firstNo},img=sheetFor(id,o.s,o.n),trend=trendFor(id,arr),last=arr.at(-1);
  return `<div class="progress-row" data-progress-id="${esc(id)}"><div class="num">${String(no).padStart(2,"0")}</div><div class="thumb"><img class="${thumbClass(img)}" data-fallback src="${img||"./assets/hero-progress.jpg"}"></div>
    <div><div class="ex-name">${esc(e.name)}</div><div class="ex-sub">${esc(groupForId(id))}</div><b style="font-size:13px">${esc(last?refWithUnit(last.value):refWithUnit(referenceFor(id)))}</b>${last?`<div class="tiny muted">Dernière séance ${formatDate(last.date)}</div>`:""}</div>
    <div class="trend ${trend.key==="slow"?"slow":trend.key==="flat"?"flat":trend.key==="down"?"down":""}">${trend.key==="up"?"↗ ":trend.key==="down"?"↘ ":trend.key==="flat"?"→ ":""}${trend.label}</div><div class="chev">›</div></div>`;
}
function renderProgressDetail(id,sub="evolution"){
  const arr=allPerf()[id]||[],e=exercise(id),o=occurrenceList(id)[0]||{s:e.firstSession,n:e.firstNo};
  const filtered=filterPerf(arr,progressionPeriod);const nums=filtered.map(x=>({x:x.date,y:parseNumber(x.value),raw:x})).filter(x=>Number.isFinite(x.y));
  const first=nums[0]?.y,last=nums.at(-1)?.y,delta=(Number.isFinite(first)&&Number.isFinite(last))?last-first:null,pct=(delta!=null&&first)?Math.round(delta/first*100):null,trend=trendFor(id,filtered);
  const detailImg=sheetFor(id,o.s,o.n)||"./assets/hero-progress.jpg";
  shell(`<div class="detail-hero detail-sheet-hero" style="--detail-image:url('${detailImg}')"><button class="backlink" id="back-progress">${icon("arrowleft")} Progression</button><h1>${esc(e.name)}</h1><div class="small">${esc(groupForId(id))}</div><button class="star" data-open-detail-sheet="1">${icon("star")}</button></div>
    <div class="tabs">${["evolution","history","stats"].map((x,i)=>`<button data-detail-tab="${x}" class="${sub===x?"on":""}">${["Évolution","Historique","Statistiques"][i]}</button>`).join("")}</div>
    <div class="filter-row">${[["1m","1 mois"],["3m","3 mois"],["6m","6 mois"],["1y","1 an"],["all","Tous"]].map(([p,l])=>`<button data-detail-period="${p}" class="${progressionPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    ${sub==="evolution"?progressEvolutionContent(nums,delta,pct,trend):sub==="history"?progressHistoryContent(filtered):progressStatsContent(filtered)}
    <div class="card progress-settings-card"><div class="row-between"><b class="serif gold">Paramètres de progression</b><button class="backlink" id="edit-prog-settings">Modifier</button></div>${progressSettingsContent(id)}</div>`,"progress-detail-screen");
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
    <div class="card"><div class="section-title" style="margin:0 0 4px">Répartition par groupe musculaire</div>${muscleDonut(hs)}<button class="btn block" id="month-detail">▣ Voir le détail par mois ›</button></div>`,"history-screen");
  $$("[data-hperiod]").forEach(b=>b.onclick=()=>{historyPeriod=b.dataset.hperiod;history.replaceState(navState(),"");render();});
  $("#prev-year").onclick=()=>{historyYear--;persistUI();history.replaceState(navState(),"");render();};$("#next-year").onclick=()=>{historyYear++;persistUI();history.replaceState(navState(),"");render();};
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
  const e=exercise(id),img=sheetFor(id,session,no),p=defaultParams(id);
  const overlay=document.createElement("div");overlay.className="sheet-overlay";overlay.innerHTML=`<div class="sheet">
    <button class="sheet-close" data-close-sheet>Fermer</button>
    <div class="sheet-canvas fiche-visual">${img?`<img data-fallback src="${img}" alt="${esc(e.name)}">`:`<div class="empty" style="min-height:360px">Fiche technique non associée.</div>`}</div>
    <div class="sheet-params"><h3>Paramètres de l’exercice</h3><div class="param-grid">${paramInputs(p)}</div><button class="btn gold block" id="save-params" style="margin-top:10px">Enregistrer</button></div>
  </div>`;
  overlayRoot.innerHTML="";overlayRoot.appendChild(overlay);history.pushState(Object.assign(navState(),{overlay:"sheet"}),"");
  $("[data-close-sheet]",overlay).onclick=()=>closeOverlay(true);
  const sheetImg=$(".fiche-visual img",overlay);if(sheetImg)prepareSheetLayout(sheetImg,$(".fiche-visual",overlay));
  $("#save-params",overlay).onclick=()=>{const next={type:p.type};$$("[data-param]",overlay).forEach(i=>next[i.dataset.param]=p.type==="strength"&&["charge","increment"].includes(i.dataset.param)?normalizeWeight(i.value):i.value.trim());state.params[id]=next;if(next.charge)state.refs[id]=next.charge;save();closeOverlay(true);render();};
}
function prepareSheetLayout(img,canvas){
  const apply=()=>{const ratio=detectSheetNotesRatio(img),setHeight=()=>{canvas.style.height=`${Math.round(canvas.clientWidth*img.naturalHeight/img.naturalWidth*ratio)}px`;};setHeight();canvas.classList.add("sheet-analyzed");window.addEventListener("resize",setHeight,{once:true});};
  if(img.complete&&img.naturalWidth)apply();else img.addEventListener("load",apply,{once:true});
}
function detectSheetNotesRatio(img){
  try{
    const w=320,h=Math.max(1,Math.round(img.naturalHeight*w/img.naturalWidth)),c=document.createElement("canvas");c.width=w;c.height=h;
    const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);const px=ctx.getImageData(0,0,w,h).data;
    const rows=[];for(let y=Math.floor(h*.72);y<Math.floor(h*.94);y++){
      let orange=0,bright=0;for(let x=3;x<w-3;x++){const i=(y*w+x)*4,r=px[i],g=px[i+1],b=px[i+2];if(r>120&&g>45&&g<190&&b<105&&r>g*1.15)orange++;if(r>115&&g>90&&b<90)bright++;}
      if(orange>w*.035||bright>w*.055)rows.push(y);
    }
    if(rows.length){const clusters=[];let a=rows[0],z=a;for(const y of rows.slice(1)){if(y-z>3){clusters.push([a,z]);a=y;}z=y;}clusters.push([a,z]);const candidates=clusters.filter(([a,z])=>a/h>.76&&a/h<.93&&(z-a)>=1);if(candidates.length)return Math.max(.76,Math.min(.93,(candidates.at(-1)[0]-3)/h));}
  }catch{}
  return .875;
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

function backupJSON(){download("fitness-sauvegarde-v9.json",JSON.stringify(state,null,2),"application/json");}
function exportCSV(){
  const rows=[["date","séance","début","fin","durée_min","exercice","valeur","statut","prochaine"]];
  (state.history||[]).forEach(h=>(h.exercises||[]).forEach(e=>rows.push([h.date,h.session,h.start,h.end,h.duration,e.name,e.actual,e.status,e.next])));
  download("fitness-export.csv",rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\n"),"text/csv");
}
function download(name,content,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function restoreJSON(e){
  const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const incoming=JSON.parse(r.result);state=Object.assign(defaultState(),incoming,{appRev:APP_REV});save();alert("Sauvegarde restaurée.");render();}catch{alert("Sauvegarde invalide.");}};r.readAsText(f);
}

let tabSwipe=null;
document.addEventListener("pointerdown",e=>{
  if(e.pointerType==="mouse"||view.type!=="root"||overlayRoot.firstElementChild)return;
  if(e.target.closest("input,select,textarea,.variant-row,.modal,.sheet,.chart,.handle,.program-tabs,.filter-row"))return;
  tabSwipe={id:e.pointerId,x:e.clientX,y:e.clientY};
},{passive:true});
document.addEventListener("pointerup",e=>{
  if(!tabSwipe||tabSwipe.id!==e.pointerId)return;
  const dx=e.clientX-tabSwipe.x,dy=e.clientY-tabSwipe.y;tabSwipe=null;
  if(Math.abs(dx)<64||Math.abs(dx)<Math.abs(dy)*1.25)return;
  const i=tabs.indexOf(tab),next=dx<0?tabs[i+1]:tabs[i-1];
  if(next)pushNav(null,next);
},{passive:true});
document.addEventListener("pointercancel",()=>{tabSwipe=null;},{passive:true});

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-tab]");if(!b||b.onclick)return;const next=b.dataset.tab;if(!tabs.includes(next)||next===tab&&view.type==="root")return;pushNav(null,next);
});
window.addEventListener("pagehide",()=>{rememberTabScroll();persistUI();});
window.addEventListener("beforeunload",()=>{rememberTabScroll();persistUI();});
render();
if(view.type==="root")restoreTabScroll(tab);
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();
