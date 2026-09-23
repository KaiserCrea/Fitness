
(() => {
"use strict";
const DATA = window.FITNESS_DATA || {sessions:{},paramType:{},ath:{}};
const OCCURRENCE_SHEETS = window.FITNESS_OCCURRENCE_SHEETS || {};
const ATH_SHEETS = window.FITNESS_ATH_SHEETS || {};
const THUMBNAILS = window.FITNESS_THUMBNAILS || {};
const KEY = "fitness-reconstruit-v2";
const RESET_KEY = "fitness-v23-clean-reset";
const APP_REV = 44;
const BACKUP_DATE_KEY="fitness-last-verified-export-v2418";
const BACKUP_FILE_VERIFIED_KEY="fitness-file-verified-v24183";
const BACKUP_PENDING_KEY="fitness-pending-export-v24183";
const BACKUP_SNOOZE_KEY="fitness-backup-snooze-v2418";
const PERFORMANCE_CURVE_START="2026-09-21"; // Nouvelle courbe uniquement : G1A de la semaine du 21/09/2026. Les données historiques restent intactes.
let calendarAnchor=new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0");
let calendarSelectedDay=null;
let calendarView="month";
let annualReturnAnchor=null;
let activeFullscreenSheetClose=null;
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
// Never reset existing workout data merely because a legacy UI-reset marker is absent.
const needsCleanReset=false;
let savedUI=null;try{savedUI=JSON.parse(localStorage.getItem(UI_KEY)||"null")}catch{}
let savedScroll=null;try{savedScroll=JSON.parse(sessionStorage.getItem(SCROLL_KEY)||"null")}catch{}
let tab=!needsCleanReset&&["today","program","progress","history"].includes(savedUI?.tab)?savedUI.tab:"today"; // V24.25.8: restore the last validated main tab after reload.
let view={type:"root"};
let programMode=!needsCleanReset&&["sessions","groups","manage"].includes(savedUI?.programMode)?savedUI.programMode:(!needsCleanReset&&savedUI?.programMode==="exercises"?"groups":"sessions");
let programExerciseGroup=!needsCleanReset&&savedUI?.programExerciseGroup||"Tous";
let progressionPeriod=savedUI?.progressionPeriod||"1m";
let progressionGroup=savedUI?.progressionGroup||"Tous";
let progressionView=!needsCleanReset&&["overview","performance","measurements"].includes(savedUI?.progressionView)?savedUI.progressionView:"overview";
let measurementPeriod=!needsCleanReset&&savedUI?.measurementPeriod||"month";
let overviewPeriod=!needsCleanReset&&savedUI?.overviewPeriod||"week";
let periodAnchor=localISODate(); // V24.25: overview opens at the actual current period.
let historyPeriod=!needsCleanReset&&savedUI?.historyPeriod||"week";
let historyYear=new Date().getFullYear(); // V24.25: current year on full launch.
let historyAnchor=localISODate(); // V24.25: history opens at current period.
const tabScroll=Object.assign({today:0,program:0,progress:0,history:0},savedScroll||{});
tabScroll.today=0; // Never reopen Aujourd’hui halfway down after an app restart.
let navTransitionClass="";
let athleticProgressExpanded=false;
function rememberTabScroll(){
  if(view?.type==="root"&&tabs.includes(tab)){
    tabScroll[tab]=window.scrollY||0;
    try{sessionStorage.setItem(SCROLL_KEY,JSON.stringify(tabScroll));}catch{}
  }
}
function restoreTabScroll(name=tab){requestAnimationFrame(()=>window.scrollTo({top:tabScroll[name]||0,left:0,behavior:"auto"}));}
function persistUI(){
  try{localStorage.setItem(UI_KEY,JSON.stringify({tab,programMode,programExerciseGroup,progressionPeriod,progressionGroup,progressionView,measurementPeriod,overviewPeriod,periodAnchor,historyPeriod,historyYear,historyAnchor}));}catch{}
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
    installed:false,cycle:"A",nextG:1,weekKey:currentWeekKey(),completedG:[],complementAccessWeek:null,
    history:[],oldWeeks:[],refs:{},params:{},progressionSettings:{},sharedProgress:{},
    sessionOrder:{},programOverrides:{},customExercises:{},archivedExercises:[],ephemeralSessions:[],
    today:null,todayDismissed:null,lastComplement:{},nextAth:"A",nextFm:1,athParams:{},athPerformance:[],measurements:[],bodySettings:{heightCm:""},appRev:APP_REV
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
  if(raw && (raw.appRev||0)<APP_REV){
    const oldText=localStorage.getItem(KEY);
    // Keep the original V24.17 recovery copy; never overwrite it on subsequent releases.
    const backupKey="fitness-pre-migration-v2418-from-"+String(raw.appRev||0);
    try{
      const target=localStorage.getItem(backupKey)===null?backupKey:backupKey+"-latest";
      localStorage.setItem(target,oldText);
      if(localStorage.getItem(target)!==oldText)throw Error("Copie de sécurité non vérifiée");
    }catch(e){
      alert("Mise à jour interrompue : impossible de protéger vos données actuelles. Libérez de l’espace ou exportez-les avant de réessayer.");
      throw e;
    }
  }
  // Preserve all existing user data during upgrades, including older installations.
  const s=Object.assign(defaultState(),raw||{});
  s.history=(Array.isArray(s.history)?s.history:[]).filter(h=>h&&typeof h==="object").map((h,i)=>{
    const exercises=Array.isArray(h.exercises)?h.exercises:(h.exercises&&typeof h.exercises==="object"?Object.values(h.exercises):[]);
    const safeExercises=exercises.filter(e=>e&&typeof e==="object").map((e,j)=>Object.assign({},e,{id:e.id||e.name||`ancien-exercice-${i+1}-${j+1}`}));
    return Object.assign({},h,{id:h.id||`legacy-${i}-${String(h.date||"")}`,date:String(h.date||"").slice(0,10),exercises:safeExercises});
  });
  s.completedG=Array.isArray(s.completedG)?s.completedG:[];
  s.oldWeeks=(Array.isArray(s.oldWeeks)?s.oldWeeks:[]).filter(w=>w&&typeof w==="object");
  s.refs=s.refs||{}; s.params=s.params||{}; s.sharedProgress=s.sharedProgress||{}; s.sessionOrder=s.sessionOrder||{};
  s.programOverrides=s.programOverrides||{}; s.customExercises=s.customExercises||{};
  s.archivedExercises=Array.isArray(s.archivedExercises)?s.archivedExercises:[];
  s.ephemeralSessions=Array.isArray(s.ephemeralSessions)?s.ephemeralSessions.filter(x=>x&&Array.isArray(x.exerciseIds)):[];
  s.progressionSettings=s.progressionSettings||{}; s.lastComplement=s.lastComplement||{}; s.athParams=s.athParams||{}; s.athPerformance=Array.isArray(s.athPerformance)?s.athPerformance.filter(x=>x&&typeof x==="object"):[]; s.guideConfigs=s.guideConfigs||{};
  s.measurements=Array.isArray(s.measurements)?s.measurements.filter(x=>x&&typeof x==="object"):[]; s.bodySettings=s.bodySettings||{heightCm:""};
  if(!raw?.nextAth || !raw?.nextFm) inferRotations(s);
  // Preserve the previous reordering model by converting sessionOrder into complete overrides only when safe.
  Object.entries(s.sessionOrder).forEach(([session,ids])=>{
    if(!s.programOverrides[session] && Array.isArray(ids) && ids.length) s.programOverrides[session]=ids.slice();
  });
  // FM3 previously had two identical Leg Extension IDs. Fix only the known
  // untouched positions in a saved override; never guess after manual reordering.
  // V24.24: replace the retired FM1 Smith exercise in a saved FM1 order only.
  // Never touch workout history, other sessions, existing loads or a running session.
  const fm1=s.programOverrides['FULL MIX 1'];
  if(Array.isArray(fm1)&&fm1.includes('ex-developpe-incline-a-la-smith-machine')){
    const dumbbell='ex-developpe-incline-avec-halteres';
    s.programOverrides['FULL MIX 1']=fm1.includes(dumbbell)
      ?fm1.filter(id=>id!=='ex-developpe-incline-a-la-smith-machine')
      :fm1.map(id=>id==='ex-developpe-incline-a-la-smith-machine'?dumbbell:id);
  }
  const fm3=s.programOverrides['FULL MIX 3'];
  if(Array.isArray(fm3)&&fm3[1]==='ex-leg-extension'&&fm3[4]==='ex-leg-extension'&&!fm3.includes('ex-leg-curl-assis')){
    fm3[1]='ex-leg-curl-assis';
  }
  if((raw?.appRev||0)<5 && s.today?.startedAt && !s.today?.manualTimes){
    s.today.start="";s.today.end="";delete s.today.startedAt;
  }
  s.appRev=APP_REV;
  localStorage.setItem(KEY,JSON.stringify(s));
  return s;
}
let state=migrate();

function save(){ invalidateDerivedCaches(); localStorage.setItem(KEY,JSON.stringify(state)); }
function ensureWeek(){
  const wk=currentWeekKey();
  if(state.weekKey===wk) return;
  const steps=weeksBetween(state.weekKey||wk,wk) || 1;
  let idx=Math.max(0,cycles.indexOf(state.cycle));
  state.cycle=cycles[(idx+steps)%3];
  state.weekKey=wk; state.completedG=[]; state.nextG=1; state.today=null;state.complementAccessWeek=null;
  save();
}
function reconcileRecordedCycle(){
  if(!state.installed || state.weekKey!==currentWeekKey())return;
  const confirmed=new Set((state.history||[])
    .filter(h=>h.date>=state.weekKey&&h.date<localISODate(new Date(new Date(state.weekKey+'T12:00:00').getTime()+7*86400000)))
    .map(h=>String(h.session||''))
    .filter(code=>new RegExp('^G[123]'+state.cycle+'$').test(code))
    .map(code=>Number(code[1])));
  if(!confirmed.size)return;
  const merged=[...new Set([...(state.completedG||[]),...confirmed])].filter(n=>[1,2,3].includes(n)).sort((a,b)=>a-b);
  const next=Math.max(Number(state.nextG)||1,Math.min(3,Math.max(...confirmed)+1));
  const completedChanged=merged.join(',')!==state.completedG.join(',');
  const nextChanged=next!==state.nextG;
  const accessChanged=confirmed.has(3)&&state.complementAccessWeek!==state.weekKey;
  const staleDismissal=state.todayDismissed?.session&&confirmed.has(Number(state.todayDismissed.session[1]))&&state.todayDismissed.session.endsWith(state.cycle);
  if(!completedChanged&&!nextChanged&&!accessChanged&&!staleDismissal)return;
  state.completedG=merged;state.nextG=next;
  if(confirmed.has(3))state.complementAccessWeek=state.weekKey;
  if(staleDismissal)state.todayDismissed=null;
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

function activeSessionIds(cur){
  if(Array.isArray(cur?.exerciseIds))return cur.exerciseIds.slice();
  const ids=sessionIds(cur?.session);
  // A workout opened before the update retains its original Smith identity and
  // recorded values until it is saved. Future FM1 sessions use dumbbells.
  if(cur?.session==='FULL MIX 1'){
    const oldId='ex-developpe-incline-a-la-smith-machine';
    const keys=[...Object.keys(cur.values||{}),...Object.keys(cur.status||{}),...Object.keys(cur.setReps||{})];
    keys.forEach(key=>{
      const match=key.match(/^ex-developpe-incline-a-la-smith-machine@@(\d+)$/);
      if(match){const pos=Number(match[1])-1;if(pos>=0&&pos<ids.length&&ids[pos]==='ex-developpe-incline-avec-halteres')ids[pos]=oldId;}
    });
  }
  return ids;
}
function ephemeralById(id){return state.ephemeralSessions.find(x=>x.id===id);}
function ephemeralDisplayName(cur){return cur?.ephemeralName||ephemeralById(cur?.ephemeralId)?.name||"Séance éphémère";}
const EXERCISE_ALIAS_GROUPS=[
  ["Développé militaire debout à la barre","Développé militaire à la barre"],
  ["Oiseau avec haltères poitrine appuyée sur banc incliné","Élévation latérale couchée sur banc incliné avec haltère","Élévation latérale couchée sur banc incliné avec haltères"],
  ["Rowing barre","Rowing barre EZ"],
  ["Tirage horizontal prise large","Rowing poulie basse prise large vers le haut du torse"],
  ["Tirage vertical prise neutre","Tirage vertical prise neutre à la barre"],
  ["Extension triceps à la corde à la poulie haute","Extension triceps à la corde poulie haute","Extension triceps à la poulie"],
  ["Mollets assis à la machine","Mollets assis à la machine / Seated Calf Raise"],
  ["Crunch abdominal à la machine","Crunch abdominal","Crunch abdominale à la machine"],
  ["Relevé de jambes suspendu","Relevé de genoux suspendu à la barre fixe","Relevé de jambes","Relevé de jambes (suspension ou appui)"],
  ["Écarté unilatéral à la poulie basse","Presse unilatérale à la poulie basse, trajectoire ascendante"],
  ["Tirage vertical prise serrée en V","Tirage vertical prise serrée en V à la poulie haute"],
  ["Curl biceps à la poulie basse en position bayésienne","Curl biceps à la poulie basse en V"],
  ["Extension triceps au-dessus de la tête à la corde","Extension triceps poulie arrière"],
  ["Circuit abdos 8 min","Circuit abdos complet — 8 min"]
];
function exerciseNameKey(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
const RAW_EXERCISE_ENTRIES=Object.entries(DATA.sessions||{}).flatMap(([session,es])=>(es||[]).map((e,i)=>({session,e,i})));
const RAW_EXERCISE_BY_ID=new Map(RAW_EXERCISE_ENTRIES.map(x=>[x.e.id,x.e]));
const RAW_EXERCISE_BY_NAME=new Map(RAW_EXERCISE_ENTRIES.map(x=>[exerciseNameKey(x.e.name),x.e]));
function rawExerciseEntries(){return RAW_EXERCISE_ENTRIES;}
function aliasGroupForName(name){const k=exerciseNameKey(name);return EXERCISE_ALIAS_GROUPS.find(g=>g.some(n=>exerciseNameKey(n)===k));}
function canonicalId(id){
  const raw=RAW_EXERCISE_BY_ID.get(id)||state.customExercises?.[id]; if(!raw)return id;
  const group=aliasGroupForName(raw.name); if(!group)return id;
  for(const preferred of group){const hit=RAW_EXERCISE_BY_NAME.get(exerciseNameKey(preferred));if(hit)return hit.id;}
  return id;
}
function canonicalDisplayName(id){const raw=RAW_EXERCISE_BY_ID.get(id)||state.customExercises?.[id];const group=aliasGroupForName(raw?.name);return group?.[0]||raw?.name||id;}
// Only these FIVE equivalences were explicitly authorised for shared progression.
// Other historical/statistical aliases must not silently merge working loads.
const APPROVED_PROGRESSION_LINKS=[
  ['Écarté unilatéral à la poulie basse','Presse unilatérale à la poulie basse, trajectoire ascendante'],
  ['Tirage vertical prise serrée en V','Tirage vertical prise serrée en V à la poulie haute'],
  ['Curl biceps à la poulie basse en position bayésienne','Curl biceps à la poulie basse en V'],
  ['Extension triceps au-dessus de la tête à la corde','Extension triceps poulie arrière'],
  ['Circuit abdos 8 min','Circuit abdos complet — 8 min']
];
function progressionId(id){
  const name=(RAW_EXERCISE_BY_ID.get(id)||state.customExercises?.[id])?.name;
  const group=APPROVED_PROGRESSION_LINKS.find(g=>g.some(n=>exerciseNameKey(n)===exerciseNameKey(name)));
  if(!group)return id;
  for(const candidate of group){const hit=RAW_EXERCISE_BY_NAME.get(exerciseNameKey(candidate));if(hit)return hit.id;}
  return id;
}
function progressionKey(id){
  const equipment=String(state.progressionSettings?.[id]?.equipment||'').trim();
  return progressionId(id)+(equipment?'@@machine:'+equipment:'');
}
function sharedProgressFor(id){return state.sharedProgress?.[progressionKey(id)]||null;}
function setSharedProgress(id,values){
  state.sharedProgress=state.sharedProgress||{};
  const key=progressionKey(id),old=state.sharedProgress[key]||{};
  state.sharedProgress[key]={...old,...values};
}
function initializeSharedProgress(){
  if(state.sharedProgressInitialized)return;
  const groups=new Map();
  for(const entry of RAW_EXERCISE_ENTRIES){
    const id=entry.e.id,key=progressionKey(id);
    if(!groups.has(key))groups.set(key,new Set());groups.get(key).add(id);
  }
  for(const [key,idsSet] of groups){
    const ids=[...idsSet];if(ids.length<2||state.sharedProgress[key])continue;
    const last=[...(state.history||[])].reverse().flatMap(h=>[...(h.exercises||[])].reverse())
      .find(e=>ids.includes(e.id)&&e.status!=='Non réalisé');
    const ordered=last?[last.id,...ids.filter(id=>id!==last.id)]:ids;
    const candidate=ordered.map(id=>({id,charge:state.params[id]?.charge||state.refs[id]||'',repetitions:state.params[id]?.repetitions||''}))
      .find(v=>v.charge)||ordered.map(id=>({id,charge:'',repetitions:state.params[id]?.repetitions||''})).find(v=>v.repetitions);
    const charge=candidate?.charge||(last?.next&&isNumericWeight(last.next)?last.next:last?.actual&&isNumericWeight(last.actual)?last.actual:'');
    if(charge||candidate?.repetitions)state.sharedProgress[key]={charge,repetitions:candidate?.repetitions||''};
  }
  // Repair the already recorded Wood Chop 15/15/15/10 without rewriting its history:
  // the working target is 15, but the recorded workout remains an unsuccessful 4×15.
  const wood='ex-wood-chop-a-la-poulie';
  const lastWood=[...(state.history||[])].reverse().flatMap(h=>[...(h.exercises||[])].reverse()).find(e=>e.id===wood&&Array.isArray(e.setReps)&&e.setReps.length);
  if(lastWood){
    const p=state.params[wood]||{},old=repNumber(p.repetitions||'10'),best=Math.max(...lastWood.setReps);
    const bounds=repetitionBounds(wood,'FULL MIX 1');
    if(Number.isFinite(best)&&bounds&&best>old&&best<=bounds.max){
      state.params[wood]={...p,type:p.type||'strength',repetitions:String(best)};
      const charge=state.refs[wood]||p.charge||lastWood.next||lastWood.actual||'';
      if(charge)state.sharedProgress[progressionKey(wood)]={charge,repetitions:String(best)};
    }
  }
  state.sharedProgressInitialized=true;
  save();
}
function buildRegistry(){
  const reg={};
  Object.entries(DATA.sessions||{}).forEach(([session,es])=>es.forEach((e,i)=>{
    const cid=canonicalId(e.id); if(!reg[cid]) reg[cid]={id:cid,name:canonicalDisplayName(e.id),remark:e.remark||"",firstSession:session,firstNo:i+1};
  }));
  Object.entries(state.customExercises||{}).forEach(([id,e])=>{const cid=canonicalId(id);if(!reg[cid])reg[cid]=Object.assign({id:cid,firstSession:"",firstNo:1},e)});
  return reg;
}
let registryCache=null,occurrenceCache=new Map();
function invalidateDerivedCaches(){registryCache=null;occurrenceCache.clear();perfCache=null;performanceMarkupCache.clear();overviewMarkupCache.clear();}
function registry(){return registryCache||(registryCache=buildRegistry());}
const RETIRED_EXERCISES=Object.freeze({
  'ex-developpe-incline-a-la-smith-machine':{
    id:'ex-developpe-incline-a-la-smith-machine',name:'Développé incliné à la Smith Machine',
    firstSession:'FULL MIX 1',firstNo:1,
    sheet:'fiches/FM1/FM1_EX01_Developpe incline a la Smith Machine.png',
    thumbnail:'miniatures/FM1/01_developpe_incline_smith_machine.jpg'
  }
});
function exercise(id){const cid=canonicalId(id);return registry()[cid]||RETIRED_EXERCISES[cid]||{id:cid,name:canonicalDisplayName(id),remark:""};}
function occurrenceList(id){
  const cid=canonicalId(id);if(occurrenceCache.has(cid))return occurrenceCache.get(cid);
  const out=[];
  const sessions=new Set([...Object.keys(DATA.sessions||{}),...Object.keys(state.programOverrides||{})]);
  sessions.forEach(s=>sessionIds(s).forEach((eid,i)=>{if(canonicalId(eid)===cid)out.push({s,n:i+1,id:eid});}));
  occurrenceCache.set(cid,out);return out;
}
function sheetPathForOccurrence(session,no){return OCCURRENCE_SHEETS[`${session}|${no}`]||"";}
function canonicalSheetOccurrence(id){
  return Object.entries(DATA.sessions||{}).flatMap(([s,es])=>es.map((e,i)=>({s,e,n:i+1}))).find(x=>x.e.id===id && sheetPathForOccurrence(x.s,x.n));
}
function sheetFor(id,session,no){
  if(RETIRED_EXERCISES[id])return pathUrl(RETIRED_EXERCISES[id].sheet);
  // A position-specific file is valid only while the same canonical exercise still occupies its original position.
  // After drag/drop or transfer, fall back to the exercise's canonical sheet so identity never follows a slot number.
  const originalId=DATA.sessions?.[session]?.[Math.max(0,(+no||1)-1)]?.id;
  const contextual=sheetPathForOccurrence(session,no);
  if(contextual && originalId===id)return pathUrl(contextual);
  const originalOccurrence=canonicalSheetOccurrence(id);
  if(originalOccurrence)return pathUrl(sheetPathForOccurrence(originalOccurrence.s,originalOccurrence.n));
  const custom=state.customExercises?.[id]?.sheetPath;return custom?pathUrl(custom):"";
}
function thumbnailFor(id,session,no){
  if(RETIRED_EXERCISES[id])return pathUrl(RETIRED_EXERCISES[id].thumbnail);
  const direct=THUMBNAILS[`${session}|${no}`];
  if(direct&&DATA.sessions?.[session]?.[Math.max(0,(+no||1)-1)]?.id===id)return pathUrl(direct);
  const occurrence=occurrenceList(id).find(x=>THUMBNAILS[`${x.s}|${x.n}`]);
  return occurrence?pathUrl(THUMBNAILS[`${occurrence.s}|${occurrence.n}`]):"";
}
function thumbClass(img){return img?"official-thumb":"fallback-thumb";}
function groupForId(id){
  // The original G3A sheet is stored in /ABDOS/, but calf raises belong to Jambes.
  if(id==='ex-mollets-debout-a-la-machine'||exerciseNameKey(RAW_EXERCISE_BY_ID.get(id)?.name||'')==='mollets debout a la machine')return'Jambes';
  // "Leg Curl" works the hamstrings, not the biceps of the arms.
  if(/^leg curl\b/.test(exerciseNameKey(RAW_EXERCISE_BY_ID.get(id)?.name||'')))return'Jambes';
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
// Targets validated for the actual workout occurrences. A shared movement can
// have different programmed rep ranges without splitting its performance history.
// Resolve using the exercise's ORIGINAL position, not its current drag/drop slot.
const REP_TARGETS_BY_ORIGINAL_SLOT=Object.freeze({
  'G1A|1':'8–12','G1A|2':'12–15',
  'G1B|1':'10–15','G1B|7':'8–12',
  'G1C|3':'12–15','G1C|6':'10–15',
  'G2A|5':'10–15',
  'G2B|1':'8–12','G2B|2':'8–15','G2B|3':'8–12','G2B|5':'8–12',
  'G2C|4':'8–12','G2C|6':'12–15',
  'G3A|1':'8–12','G3A|3':'10–15','G3A|4':'10–15',
  'G3B|3':'15–20','G3C|3':'15–20',
  'FULL MIX 1|1':'8–12','FULL MIX 1|3':'8–12',
  'FULL MIX 1|7':'10–12','FULL MIX 1|8':'10–15','FULL MIX 1|9':'12–20',
  'FULL MIX 2|2':'10–15','FULL MIX 2|4':'10–15','FULL MIX 2|6':'10–15',
  'FULL MIX 3|2':'10–15','FULL MIX 3|6':'8–12',
  'FULL MIX 4|5':'10–15','FULL MIX 4|6':'10–15','FULL MIX 4|7':'8–12',
  'FULL MIX 4|8':'15–20','FULL MIX 4|9':'15–20'
});
function repetitionTargetFor(id,session){
  // Historical Smith workout already open during the update keeps its FM1 target.
  if(id==='ex-developpe-incline-a-la-smith-machine'&&session==='FULL MIX 1')return '10–15';
  if(session){
    const originalIndex=(DATA.sessions?.[session]||[]).findIndex(e=>e.id===id);
    if(originalIndex>=0){
      const target=REP_TARGETS_BY_ORIGINAL_SLOT[`${session}|${originalIndex+1}`];
      if(target)return target;
    }
  }
  // A generic progress card uses a stable reference from the first occurrence.
  const baseline=RAW_EXERCISE_ENTRIES.find(x=>canonicalId(x.e.id)===canonicalId(id)&&REP_TARGETS_BY_ORIGINAL_SLOT[`${x.session}|${x.i+1}`]);
  if(baseline)return REP_TARGETS_BY_ORIGINAL_SLOT[`${baseline.session}|${baseline.i+1}`];
  const raw=String(exercise(id)?.name||id||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g," ");
  const rules=[
    ["developpe couche machine convergente","8–10"],["developpe couche avec halteres","8–10"],["developpe incline smith","8–10"],["developpe incline avec halteres","8–10"],["developpe incline halteres","8–10"],["developpe epaules halteres","8–10"],
    ["developpe militaire debout","6–10"],["developpe militaire a la barre","6–10"],["developpe militaire barre","6–10"],["developpe militaire","6–10"],["squat libre","6–10"],["souleve de terre","5–8"],["rowing barre","6–10"],
    ["ecarte unilateral a la poulie basse","12–15"],["ecarte unilateral poulie basse","12–15"],["ecarte poulie basse assis","12–15"],["ecarte couche","12–15"],["ecarte incline","12–15"],["ecarte a la poulie basse vers le haut","12–15"],["ecarte poulie basse vers haut","12–15"],["pec deck","12–15"],["butterfly","12–15"],
    ["dips lestes","8–10"],["curl biceps a la barre ez","10–12"],["curl barre ez","10–12"],["curl biceps avec halteres","10–12"],["curl halteres","10–12"],["curl unilateral sur pupitre vertical","12–15"],["pupitre vertical","12–15"],
    ["crunch abdominal","15–20"],["abdominaux","15–20"],["tirage horizontal a la poulie avec double poignee","8–12"],["tirage horizontal double poignee","8–12"],["tirage bras tendus","12–15"],["rowing unilateral","8–10"],["tirage vertical prise serree","8–12"],["tirage vertical serre","8–12"],
    ["extension triceps a la poulie","10–15"],["barre au front","10–12"],["dips sur banc","12–15"],["releve de jambes","12–20"],["flexions laterales","15–20"],["tirage menton","10–12"],["elevation laterale unilateral","15–20"],["elevations laterales avec halteres","15–20"],["elevations laterales assis","15–20"],["elevation laterale couchee","15–20"],["elevation laterale poulie derriere","15–20"],["elevation laterale poulie","15–20"],
    ["hack squat","8–10"],["leg extension","12–15"],["leg curl allonge","10–15"],["leg curl assis","10–15"],["mollets debout","12–20"],["mollets assis","12–20"],["mollets smith","12–20"],
    ["spider curl","10–15"],["curl marteau","10–12"],["curl poulie basse v","12–15"],["tirage vertical neutre","8–12"],["tirage horizontal large","8–12"],["rowing assis machine","8–12"],["extension triceps corde","12–15"],["extension triceps au-dessus","10–15"],["extension triceps couche","10–12"],["crunch leste","10–15"],["flexion laterale lestee","12–15"],
    ["reverse pec deck","15–20"],["oiseau","15–20"],["leg press horizontale","8–12"],["leg press","8–12"],["chest press","8–12"],["curl incline","10–12"],["curl ez pronation","10–15"],["curl biceps a la machine","10–15"],["curl machine","10–15"],
    ["lat pulldown","8–12"],["rowing a la poulie basse","8–12"],["rowing poulie basse","8–12"],["extension triceps poulie arriere","12–15"],["extension triceps prise inversee","12–15"],["dips assis","8–12"],["elevation en y","15–20"],["elevation y","15–20"],["goblet squat","10–15"],["fentes marchees","10–15 / jambe"],["chaise romaine","12–20"],
    ["rowing poitrine appuyee","8–12"],["tractions","6–12"],["curl pupitre ez","10–12"],["magic triceps ez","10–12"],["magic triceps halteres","10–12"],["extension corde au-dessus","12–15"],["fentes bulgares","8–12 / jambe"],["extension lombaire","12–15"],["extension triceps unilaterale","12–15"],["pallof press","12–15 / côté"],["adduction hanche","15–20"],["abduction hanche","15–20"],["face pull","15–20"],["crunch poulie","12–20"],["releve genoux suspendu","12–20"],["wood chop","12–15 / côté"],
    ["biceps black jack","Protocole Black Jack"],["gainage","30–60 s"],["circuit abdos","8 min"]
  ];
  for(const [key,val] of rules)if(raw.includes(key))return val;
  return "";
}
function repetitionBounds(id,session){const t=repetitionTargetFor(id,session),m=t.match(/(\d+)\s*[–-]\s*(\d+)/);return m?{min:+m[1],max:+m[2]}:null;}
function repNumber(v){const m=String(v??"").match(/\d+/);return m?+m[0]:NaN;}
function defaultParams(id){
  const existing=state.params[id],shared=sharedProgressFor(id);
  if(existing&&Object.keys(existing).length){
    const p=clone(existing);
    if(p.type==='strength'&&shared){if(shared.charge!==undefined)p.charge=shared.charge;if(shared.repetitions)p.repetitions=shared.repetitions;}
    return p;
  }
  const t=paramType(id);
  if(t==="gainage") return {type:t,tours:"5",normal:"1 min",gauche:"30 s",droite:"30 s",repos:"15–20 s"};
  if(t==="circuit") return {type:t,duree:"8 min",tours:"1"};
  return {type:t,series:"4",repetitions:shared?.repetitions||"10",charge:shared?.charge??state.refs[id]??"",reposSeries:"60 s",reposExercices:"60 s"};
}
function referenceFor(id){
  const p=defaultParams(id), t=p.type;
  if(t==="gainage")return `${p.tours||"—"} tours · ${p.normal||"—"} + ${p.gauche||"—"} + ${p.droite||"—"}`;
  if(t==="circuit")return `${p.duree||"8 min"}${p.tours?` · ${p.tours} tour(s)`:""}`;
  return p.charge||state.refs[id]||latestFailedActualWeight(id)||"—";
}
function normalizeWeight(v){
  const raw=String(v??"").trim();if(!raw)return"";
  const pair=raw.replace(/\s/g,"").replace(/,/g,".").match(/^(\d+(?:\.\d+)?)[x×](\d+(?:\.\d+)?)(?:kg)?$/i);
  if(pair)return `${String(Number(pair[1])).replace(".",",")} × ${String(Number(pair[2])).replace(".",",")} kg`;
  const m=raw.replace(",",".").match(/-?\d+(?:\.\d+)?/);if(!m)return raw;
  const n=Number(m[0]);if(!Number.isFinite(n))return raw;
  return `${String(n).replace(".",",")} kg`;
}
function refWithUnit(v){const s=String(v||"—").trim();return s==="—"||s===""?"—":/[a-zA-Z]/.test(s)?s:normalizeWeight(s);}
function occKey(id,no){return `${id}@@${no}`;}
function occurrenceStatus(cur,id,no){return cur?.status?.[occKey(id,no)] ?? cur?.status?.[id] ?? "";}
function occurrenceValue(cur,id,no){return cur?.values?.[occKey(id,no)] ?? cur?.values?.[id] ?? referenceFor(id);}
function occurrenceNext(cur,id,no){return cur?.nextRefs?.[occKey(id,no)] ?? cur?.nextRefs?.[id] ?? "";}
function navState(){return {tab,view,programMode,programExerciseGroup,progressionPeriod,progressionGroup,progressionView,measurementPeriod,overviewPeriod,periodAnchor,historyPeriod,historyYear,historyAnchor};}
function applyNavState(st){
  if(!st)return; tab=tabs.includes(st.tab)?st.tab:tab; view=st.view||{type:"root"}; programMode=["sessions","groups","manage"].includes(st.programMode)?st.programMode:(st.programMode==="exercises"?"groups":programMode); programExerciseGroup=st.programExerciseGroup||programExerciseGroup;
  progressionPeriod=st.progressionPeriod||progressionPeriod; progressionGroup=st.progressionGroup||progressionGroup; progressionView=st.progressionView||progressionView; measurementPeriod=(st.measurementPeriod==="week"?"month":st.measurementPeriod)||measurementPeriod;
  overviewPeriod=st.overviewPeriod||overviewPeriod;periodAnchor=st.periodAnchor||periodAnchor;
  historyPeriod=st.historyPeriod||historyPeriod; historyYear=st.historyYear||historyYear;historyAnchor=st.historyAnchor||historyAnchor;
  persistUI();
}
function pushNav(v=null,newTab=null){
  if(newTab){
    rememberTabScroll();
    const from=tabs.indexOf(tab),to=tabs.indexOf(newTab);
    navTransitionClass=to>from?"slide-from-right":"slide-from-left";
    tab=newTab;view={type:"root"};
    // V24.5 : chaque rubrique principale retrouve son écran d’entrée attendu.
    if(newTab==="program"){programMode="sessions";programExerciseGroup="Tous";}
    if(newTab==="progress"){progressionView="overview";}
    // Évite qu’un geste tactile commencé dans l’ancien écran reste actif après navigation.
    tabSwipe=null;
  } else if(v){rememberTabScroll();view=v;}
  persistUI();
  history.pushState(navState(),""); render();
  if(newTab){restoreTabScroll(newTab);setTimeout(()=>{navTransitionClass="";},220);}
}
history.replaceState(navState(),"");
persistUI();
window.addEventListener("popstate",e=>{
  // Fullscreen fiches/measurement guide own one history entry: Android Back closes them first.
  if(activeFullscreenSheetClose){activeFullscreenSheetClose();return;}
  if(activeGuideClose){activeGuideClose();return;}
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
  if(title==="Aujourd’hui")return "./assets/hero-today-v20.jpg";
  if(title==="Programme")return "./assets/hero-program-v2412.jpg";
  if(title==="Progression")return "./assets/hero-progress-v20.jpg";
  if(title==="Historique")return "./assets/hero-history-v20.jpg";
  return "./assets/hero-program-official.jpg";
}
function header(title,subtitle="",extra="",cls=""){
  const asset=headerAsset(title);
  return `<header class="header premium-header ${cls}" style="--session-image:url('${asset}')">
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
  app.innerHTML=`<main class="app ${screenClass==="program-home-screen"?"app-program-home":screenClass==="today-waiting-screen"?"app-today-waiting":""}"><section class="screen ${screenClass} ${navTransitionClass}">${content}</section></main>`;
  nav();bindGlobalInView();
}
function openThumbnailPreview(src){
  if(!src)return;
  const ov=document.createElement("div");
  ov.className="thumb-preview-overlay";
  // V24.25.2: cadrage vertical réservé au curl EZ debout (image source inchangée).
  const ezPortrait = /(?:^|\/)05_curl_biceps_barre_EZ_debout_vertical_v24253\.png(?:[?#]|$)/.test(src);
  ov.innerHTML=`<div class="thumb-preview-card" role="dialog" aria-modal="true" aria-label="Agrandissement de la miniature"><button class="thumb-preview-close" aria-label="Fermer">×</button><img class="${ezPortrait?"thumb-preview-ez-portrait":""}" src="${esc(src)}" alt=""></div>`;
  overlayRoot.innerHTML="";overlayRoot.appendChild(ov);
  history.pushState(Object.assign(navState(),{overlay:"thumb-preview"}),"");
  ov.querySelector(".thumb-preview-close").onclick=()=>closeOverlay(true);
  ov.onclick=e=>{if(e.target===ov)closeOverlay(true);};
}
function bindGlobalInView(){
  $$('[data-cycle-menu]').forEach(b=>b.onclick=()=>openCycleModal());
  $$("img[data-fallback]").forEach(img=>img.onerror=()=>{img.onerror=null;img.classList.remove("fiche-thumb","official-thumb");img.classList.add("fallback-thumb");img.src="./assets/hero-program-official.jpg";});
  $$(".thumb img").forEach(img=>{
    const holder=img.closest(".thumb");
    if(holder)holder.classList.add("previewable-thumb");
    img.onclick=e=>{e.preventDefault();e.stopPropagation();openThumbnailPreview(img.currentSrc||img.src);};
  });
}
function render(){
  ensureWeek();
  reconcileRecordedCycle();
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

function waitingTodayHeader(date,session=""){
  return `<div class="today-waiting-gym" aria-hidden="true"></div>
    <div class="waiting-copy"><h1>Aujourd’hui</h1><div class="subtitle">${esc(date)}</div>
    ${session?`<div class="session-code">${esc(niceSession(session))}</div><div class="session-groups">${esc(groupLabel(session))}</div>`:""}</div>
    <button class="cycle-chip waiting-cycle-chip" data-cycle-menu aria-label="Réglages du cycle G, semaine ${state.cycle}"><b>Cycle G</b><span>Semaine ${state.cycle}</span></button>`;
}
function complementDateToISO(value){
  const raw=String(value||'').trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw;
  const fr=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return fr?`${fr[3]}-${String(fr[2]).padStart(2,'0')}-${String(fr[1]).padStart(2,'0')}`:'';
}
function fullMixLastLabel(value){
  const iso=complementDateToISO(value);
  if(!iso)return 'Dernière réalisation : '+String(value||'');
  const d=new Date(`${iso}T12:00:00`),today=new Date(`${localISODate()}T12:00:00`);
  const days=Math.max(0,Math.round((today-d)/86400000));
  if(days===0)return 'Réalisé aujourd’hui';
  if(days===1)return 'Réalisé hier';
  return `Réalisé il y a ${days} jours`;
}
function complementaryLastDate(session){
  const records=(state.history||[]).filter(h=>h.session===session&&/^\d{4}-\d{2}-\d{2}$/.test(String(h.date||'')));
  const latest=records.map(h=>h.date).sort().at(-1),fallback=state.lastComplement?.[session]||'';
  if(session.startsWith('FULL MIX')){const raw=latest||fallback;return raw?fullMixLastLabel(raw):'Jamais réalisée';}
  return latest?'Dernière réalisation : '+formatDate(latest):(fallback?'Dernière réalisation : '+fallback:'Jamais réalisée');
}
const COMPLEMENT_CATEGORIES={ath:{name:'Athlétique',sessions:['ATHLÉTIQUE A','ATHLÉTIQUE B']},fm:{name:'Full Mix',sessions:['FULL MIX 1','FULL MIX 2','FULL MIX 3','FULL MIX 4']}};
function complementarySelector(){
  return `<section class="today-complement-picker"><h2 class="section-title">Séances complémentaires</h2><div class="today-complement-compact">
    ${Object.entries(COMPLEMENT_CATEGORIES).map(([key,group])=>`<button type="button" class="today-complement-card" data-complement-category="${key}"><b>${esc(group.name)}</b><span>${group.sessions.length} séances · Choisir</span>${icon('chevron')}</button>`).join('')}
  </div></section>`;
}
function bindComplementarySelector(){
  $$('[data-complement-category]').forEach(button=>button.onclick=()=>{
    const group=COMPLEMENT_CATEGORIES[button.dataset.complementCategory];if(!group)return;
    openModal(`<h3>Choisir une séance ${esc(group.name)}</h3><div class="today-complement-modal-options">${group.sessions.map(session=>`<button type="button" class="today-complement-option" data-start-session="${esc(session)}"><b>${esc(niceSession(session))}</b><span>${esc(complementaryLastDate(session))}</span>${icon('chevron')}</button>`).join('')}</div><div class="modal-actions"><button type="button" class="btn ghost" data-close-modal>Retour</button></div>`,modal=>{
      $$('[data-start-session]',modal).forEach(choice=>choice.onclick=()=>{
        // Avoid discarding an unrelated workout draft; modal is available only on the waiting screen.
        if(state.today)return;
        initToday(choice.dataset.startSession);tabScroll.today=0;closeOverlay(true);render();window.scrollTo(0,0);
      });
    });
  });
}
function renderToday(){
  const rawDate=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const date=rawDate.charAt(0).toUpperCase()+rawDate.slice(1);
  const cur=state.today;
  if(!cur){
    const expected=sessionCode();
    const cancelled=state.todayDismissed?.date===localISODate()&&state.todayDismissed?.session===expected;
    const unlocked=state.completedG.includes(3);
    if(unlocked){
      shell(`${waitingTodayHeader(date)}
        ${complementarySelector()}`,'today-waiting-screen');
      bindComplementarySelector();return;
    }
    shell(`${waitingTodayHeader(date,expected)}
      <div class="card cancelled-session-card"><div><div class="section-title" style="margin:0">${cancelled?'Séance annulée':'Prêt à s’entraîner'}</div><div class="small muted">${cancelled?`${esc(niceSession(expected))} reste la prochaine séance prévue. Le cycle n’a pas avancé.`:'Ouvrez votre prochaine séance pour commencer.'}</div></div><button class="btn gold" id="resume-session">Ouvrir ${esc(niceSession(expected))}</button></div>`,'today-waiting-screen');
    $('#resume-session').onclick=()=>{initToday(expected);render();};
    return;
  }
  renderActiveToday(cur,date);
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
  const ids=activeSessionIds(cur),statuses=ids.map((id,i)=>occurrenceStatus(cur,id,i+1)),success=statuses.filter(x=>x==="Réussi").length,fail=statuses.filter(x=>x==="Échoué").length,skip=statuses.filter(x=>x==="Non réalisé").length;
  const todayHeroClass=cur.session.startsWith("G1")?"tall session-hero-g1":cur.session.startsWith("G2")?"tall session-hero-g2":"tall";
  shell(`${header("Aujourd’hui",date,`<div class="session-code">${esc(cur.ephemeral?ephemeralDisplayName(cur):niceSession(cur.session))}</div><div class="session-groups">${esc(cur.ephemeral?"Séance hors-cycle":groupLabel(cur.session))}</div>`,todayHeroClass)}
    <div class="today-meta today-meta-single"><div><div class="meta-label">Heure de début</div>${timeButton(cur.start,"edit-start")}</div></div>
    <div>${ids.map((id,i)=>todayExerciseCard(id,cur.session,i+1,cur)).join("")}</div>
    <button class="btn session-cancel-bottom" id="cancel-session">${icon("x")} Annuler la séance</button>
    <div class="card finish-card">
      <div class="finish-head"><div><div class="finish-title">${icon("flag")} Fin de séance</div><div class="tiny muted">Heure de fin</div>${timeButton(cur.end,"edit-end")}</div>
      <div class="finish-stat"><span>Durée totale</span><b>${durationClock(cur)}</b></div>
      <div><div class="tiny serif gold" style="text-align:center;margin-bottom:3px">Bilan</div><div class="bilan"><div><b>${success}</b><span>Réussis</span></div><div><b>${fail}</b><span>Échoués</span></div><div><b>${skip}</b><span>Non réalisés</span></div></div></div></div>
      <button class="btn gold block save-session-btn" id="save-session">${icon("save")} Enregistrer la séance</button>
    </div>`,"today-screen");
  $$('[data-circuit-guide]').forEach(b=>b.onclick=()=>openCircuitGuide(b.dataset.circuitGuide,b.dataset.session,+b.dataset.no));
  $$('[data-status]').forEach(b=>b.onclick=()=>setExerciseStatus(b.dataset.id,b.dataset.status,+b.dataset.no));
  $$('[data-sheet]').forEach(b=>b.onclick=()=>openSheet(b.dataset.sheet,b.dataset.session,+b.dataset.no));
  $("#edit-start").onclick=()=>editSessionTimes("start");$("#edit-end").onclick=()=>editSessionTimes("end");
  $("#save-session").onclick=saveCurrentSession;$("#cancel-session").onclick=cancelCurrentSession;
}
function isAbCircuit(id){return ['ex-circuit-abdos-8-min','ex-circuit-abdos-complet-8-min','ex-circuit-abdos-intensif-8-min'].includes(id);}
function todayExerciseCard(id,session,no,cur){
  const e=exercise(id),st=occurrenceStatus(cur,id,no),img=thumbnailFor(id,session,no),ref=occurrenceValue(cur,id,no);
  const firstPendingNo=activeSessionIds(cur).findIndex((x,i)=>!["Réussi","Échoué","Non réalisé"].includes(occurrenceStatus(cur,x,i+1)))+1;
  return `<div class="exercise-card ${firstPendingNo===no?"current":""}">
    <div class="thumb"><img class="${thumbClass(img)}" loading="lazy" decoding="async" data-fallback src="${img||"./assets/hero-today.jpg"}" alt=""></div>
    <div class="ex-info"><div class="ex-name"><span class="inline-no">${no}.</span> ${esc(e.name)}</div><div class="ex-sub">${esc(groupForId(id))}</div><div class="ex-ref">Charge / référence prévue <b>${esc(refWithUnit(ref))}</b></div>${actualSetsFor(id)?`<div class="tiny muted">Dernière fois : ${esc(actualSetsFor(id).sets.join(" / "))} · ${esc(refWithUnit(actualSetsFor(id).weight))}</div>`:""}${cur.setReps?.[occKey(id,no)]?`<div class="tiny gold">Aujourd’hui : ${esc(cur.setReps[occKey(id,no)].join(" / "))}</div>`:""}</div>
    <button class="backlink chev" data-sheet="${esc(id)}" data-session="${esc(session)}" data-no="${no}" aria-label="Voir la fiche">${icon("chevron")}</button>
    ${isAbCircuit(id)?`<div class="circuit-guide-entry"><button class="btn guide-entry" data-circuit-guide="${esc(id)}" data-session="${esc(session)}" data-no="${no}">${esc(guideEntryLabel('circuit:'+session+':'+no+':'+id))}</button></div>`:''}<div class="status-actions">
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
    // Cancelling a draft never unlocks complements or invalidates a recorded G session.
    const recorded=(state.history||[]).some(h=>h.session===cur.session&&h.date>=state.weekKey&&weekKeyFromDate(h.date)===state.weekKey);
    state.todayDismissed=cur.ephemeral||recorded?null:{date:localISODate(),session:cur.session};
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
  const cur=state.today;if(!cur)return;cur.status=cur.status||{};cur.values=cur.values||{};cur.nextRefs=cur.nextRefs||{};cur.reps=cur.reps||{};cur.nextReps=cur.nextReps||{};cur.setReps=cur.setReps||{};
  const key=occKey(id,no),current=occurrenceValue(cur,id,no);
  if(cur.status[key]===status){delete cur.status[key];delete cur.nextRefs[key];if(cur.setReps)delete cur.setReps[key];save();render();return;}
  // The failed-exercise form must not modify the workout until the user saves it.
  if(status==='Échoué'){openSetResultsModal(id,no,current,null,{markFailed:true});return;}
  if(!cur.values[key])cur.values[key]=current;
  cur.status[key]=status;
  // Remove the legacy canonical status only when this active session has already started using occurrence keys.
  if(Object.prototype.hasOwnProperty.call(cur.status,id))delete cur.status[id];
  if(status==="Réussi"){
    openNextRefModal(id,current,(next,doneReps,nextReps)=>{cur.nextRefs[key]=next;if(Number.isFinite(doneReps))cur.reps[key]=doneReps;if(Number.isFinite(nextReps))cur.nextReps[key]=nextReps;save();render();openSetResultsModal(id,no,current);},cur.session);
  }else{
    delete cur.nextRefs[key];
    save();render();
  }
}
function actualSetsFor(id){
 const equipment=state.progressionSettings[id]?.equipment||"";
 const matches=[];for(const h of state.history||[])for(const e of h.exercises||[])if(canonicalId(e.id)===canonicalId(id)&&String(e.equipment||"")===equipment&&Array.isArray(e.setReps)&&e.setReps.length)matches.push({date:h.date,sets:e.setReps,weight:e.actual,status:e.status});
 return matches.at(-1)||null;
}
function targetSuggestion(id,sets,weight,session){
 const bounds=repetitionBounds(id,session),p=defaultParams(id),setting=state.progressionSettings[id]||{},inc=Number(setting.increment)||2.5;
 const expected=Math.min(20,Math.max(1,parseInt(p.series)||4));
 if(!bounds||sets.length!==expected||sets.some(r=>!Number.isInteger(r)||r<0))return null;
 const goal=workingGoalFromSets(id,sets,session);
 const n=parseNumber(weight),simpleKg=/^\s*\d+(?:[,.]\d+)?\s*(kg)?\s*$/i.test(String(weight));
 if(sets.every(r=>r>=bounds.max)&&Number.isFinite(n)&&simpleKg){
   return {weight:normalizeWeight(String(Math.round((n+inc)*100)/100)),reps:bounds.min,description:`Toutes les séries ont atteint ${bounds.max} répétitions. Augmentation proposée de ${inc} kg et retour à ${bounds.min} répétitions.`};
 }
 // A failed last set must be completed before raising the target for every set.
 if(sets.some(r=>r<goal))return {weight,reps:goal,description:`Objectif actuel : ${expected} séries de ${goal}. Conserver la charge et compléter les séries inachevées.`};
 const next=Math.min(bounds.max,Math.max(goal,Math.min(...sets))+1);
 return {weight,reps:next,description:`Toutes les séries ont atteint ${goal}. Proposer ${next} répétitions à charge identique.`};
}
function workingGoalFromSets(id,sets,session){
 const bounds=repetitionBounds(id,session),currentGoal=repNumber(defaultParams(id).repetitions);
 if(!bounds)return Number.isFinite(currentGoal)?currentGoal:NaN;
 const observed=(Array.isArray(sets)?sets:[]).filter(Number.isFinite);
 const best=observed.length?Math.max(...observed):bounds.min;
 // 15/15/15/10 means a 4×15 target still to complete, never a 4×15 success.
 return Math.max(bounds.min,Math.min(bounds.max,Math.max(Number.isFinite(currentGoal)?currentGoal:bounds.min,best)));
}
function exerciseWithoutRequiredLoad(id){
  if(paramType(id)!=='strength')return true;
  const n=exerciseNameKey(exercise(id).name);
  return /(?:dips sur banc|tractions|pompes|gainage|circuit abdos|abdominaux|releve de genoux|releve de jambes|crunch abdominal(?! a la machine)|flexions laterales du buste)/.test(n);
}
function isNumericWeight(value){
  const text=String(value||'').trim().replace(/\s/g,'').replace(/,/g,'.');
  return /^(?:\d+(?:\.\d+)?(?:kg)?|\d+(?:\.\d+)?[x×]\d+(?:\.\d+)?(?:kg)?)$/i.test(text);
}
function latestExerciseWeight(id){
  const equip=state.progressionSettings?.[id]?.equipment||'';
  const history=[...(state.history||[])].reverse();
  for(const h of history)for(const e of [...(h.exercises||[])].reverse()){
    if(canonicalId(e.id)===canonicalId(id)&&String(e.equipment||'')===equip&&isNumericWeight(e.actual))return e.actual;
  }
  return '';
}
function latestFailedActualWeight(id){
  const equip=state.progressionSettings?.[id]?.equipment||'';
  for(const h of [...(state.history||[])].reverse())for(const e of [...(h.exercises||[])].reverse()){
    if(canonicalId(e.id)!==canonicalId(id)||String(e.equipment||'')!==equip)continue;
    return e.status==='Échoué'&&isNumericWeight(e.actual)?e.actual:'';
  }
  return '';
}
function openSetResultsModal(id,no,current,onDone,options={}){
 const cur=state.today,key=occKey(id,no),p=defaultParams(id),count=Math.min(20,Math.max(1,parseInt(p.series)||4)),previous=actualSetsFor(id),saved=cur.setReps?.[key]||[],base=repNumber(p.repetitions),bounds=repetitionBounds(id,cur.session);
 // AUCUNE exclusion par type d'exercice : toujours proposer le poids en échec.
 // La référence planifiée reste distincte de la charge de cette tentative.
 const last=isNumericWeight(current)?current:latestExerciseWeight(id);
 const weightEditor=(value='')=>`<div class="weight-entry"><input id="failed-weight" type="text" inputmode="text" autocomplete="off" autocapitalize="off" value="${esc(value)}" placeholder="Ex. : 40 ou 2×40"><button type="button" class="weight-times" aria-label="Insérer le signe multiplication" title="Insérer ×">×</button></div><div class="tiny muted">2×40 représente deux disques de 40 kg, sans supposer le poids de la barre.</div>`;
 const loadMarkup=options.markFailed?`<div class="field initial-failure-load"><label for="failed-weight">Charge réellement utilisée (kg) — modifiable</label>${weightEditor(last)}<label class="failure-bodyweight"><input type="checkbox" id="failed-no-load"> Sans charge / poids du corps</label><div class="tiny muted">Laissez le champ vide si aucune charge n'est connue ; la référence prévue ne sera pas modifiée automatiquement.</div></div>`:'';
 openModal(`<h3>Répétitions réellement réalisées</h3><p>${esc(exercise(id).name)} · ${esc(refWithUnit(last||current))}</p>${loadMarkup}${previous?`<p class="tiny muted">Dernière fois : ${esc(previous.sets.join(' / '))} (${esc(previous.weight)})</p>`:''}<div class="param-grid">${Array.from({length:count},(_,i)=>`<div class="field"><label>Série ${i+1}</label><input data-set-reps="${i}" inputmode="numeric" type="number" min="0" max="200" value="${saved[i]??(Number.isFinite(base)?base:'')}"></div>`).join('')}</div><p class="tiny muted">${bounds?`Plage cible : ${bounds.min}–${bounds.max}. `:''}Saisissez les répétitions réellement faites, y compris la série inachevée.</p><div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="save-set-results">Enregistrer</button></div>`,()=>{
   const noLoad=$('#failed-no-load'),weightInput=$('#failed-weight');
   if(noLoad&&weightInput)noLoad.onchange=()=>{weightInput.disabled=noLoad.checked;};
   const times=$('.weight-times');if(times&&weightInput)times.onclick=()=>{
     const a=weightInput.selectionStart??weightInput.value.length,b=weightInput.selectionEnd??a;
     weightInput.value=weightInput.value.slice(0,a)+'×'+weightInput.value.slice(b);
     weightInput.focus();weightInput.setSelectionRange(a+1,a+1);
   };
   $('#save-set-results').onclick=()=>{
     const inputs=$$('[data-set-reps]'),values=inputs.map(x=>Number(x.value));
     if(values.some((v,i)=>!Number.isInteger(v)||v<0||v>200||!inputs[i].value.trim())){alert('Saisissez chaque série (0 à 200).');return;}
     let actualWeight=current;
     if(options.markFailed){
       if(noLoad?.checked)actualWeight='Poids du corps';
       else if(weightInput){
         const entered=weightInput.value.trim();
         if(entered&&!isNumericWeight(entered)){alert('Charge invalide. Utilisez par exemple 40 ou 2×20, ou cochez « poids du corps ».');weightInput.focus();return;}
         actualWeight=entered?normalizeWeight(entered):current;
       }
     }
     if(options.markFailed){
       cur.status=cur.status||{};cur.status[key]='Échoué';delete cur.status[id];
       cur.values=cur.values||{};cur.values[key]=actualWeight;
     }
     cur.setReps=cur.setReps||{};cur.setReps[key]=values;cur.reps=cur.reps||{};cur.reps[key]=Math.min(...values);
     const suggestion=targetSuggestion(id,values,actualWeight,cur.session);
     cur.nextRefs=cur.nextRefs||{};if(options.markFailed){cur.nextRefs[key]=isNumericWeight(actualWeight)?actualWeight:current;}else if(!cur.nextRefs[key])cur.nextRefs[key]=actualWeight;
     cur.nextReps=cur.nextReps||{};
     // Even if the user declines a load increase, a partly achieved higher
     // target must no longer revert to the stale 4×10 from a technical sheet.
     if(options.markFailed||!Number.isFinite(repNumber(cur.nextReps[key])))cur.nextReps[key]=workingGoalFromSets(id,values,cur.session);
     save();closeOverlay(true);render();
     if(suggestion)openModal(`<h3>Progression proposée</h3><p>${esc(suggestion.description)}</p><p>Prochaine cible : <b>${esc(refWithUnit(suggestion.weight))} · ${suggestion.reps} répétitions</b></p><div class="modal-actions"><button class="btn ghost" id="suggest-ignore">Conserver ma référence</button><button class="btn gold" id="suggest-accept">Accepter la proposition</button></div>`,()=>{$('#suggest-ignore').onclick=()=>{closeOverlay(true);render();};$('#suggest-accept').onclick=()=>{cur.nextRefs[key]=suggestion.weight;cur.nextReps[key]=suggestion.reps;save();closeOverlay(true);render();};});
     if(onDone)onDone(values);
   };
 });
}
function openNextRefModal(id,current,done,session){
  const p=defaultParams(id),target=repetitionTargetFor(id,session),bounds=repetitionBounds(id,session); const label=p.type==="strength"?"Charge / référence prévue pour la prochaine occurrence":"Référence prévue pour la prochaine occurrence";
  const currentRep=repNumber(p.repetitions),suggested=Number.isFinite(currentRep)&&bounds?Math.min(bounds.max,currentRep):currentRep;
  openModal(`<h3>Exercice réussi</h3><p>${esc(exercise(id).name)}</p>${target?`<div class="rep-target-callout"><span>Répétitions cibles</span><b>${esc(target)}</b></div>`:""}${p.type==="strength"?`<div class="param-grid"><div class="field"><label>Répétitions réalisées</label><input id="done-reps" inputmode="numeric" value="${Number.isFinite(currentRep)?currentRep:""}"></div><div class="field"><label>Prochaine cible répétitions</label><input id="next-reps" inputmode="numeric" value="${Number.isFinite(suggested)?suggested:""}"></div></div>`:""}<div class="field" style="margin-top:6px"><label>${esc(label)}</label><input id="next-ref" value="${esc(p.type==="strength"?(state.refs[id]||p.charge||current):current)}"></div>
    <div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="confirm-next">Valider</button></div>`,()=>{
      $("#confirm-next").onclick=()=>{const raw=$("#next-ref").value.trim()||current;const v=p.type==="strength"?normalizeWeight(raw):raw;const doneReps=p.type==="strength"?repNumber($("#done-reps")?.value):NaN,nextReps=p.type==="strength"?repNumber($("#next-reps")?.value):NaN;if(p.type==="strength"&&v){state.refs[id]=v;state.params[id]=Object.assign({},defaultParams(id),{charge:v,repetitions:Number.isFinite(nextReps)?String(nextReps):p.repetitions});}closeOverlay(true);done(v,doneReps,nextReps);};
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
function athMetricDefinition(step){
  const name=String(step?.name||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if(/sled/.test(name))return [{key:"durationMin",label:"Durée (min)",step:"0.5"},{key:"loadKg",label:"Charge (kg)",step:"0.5"},{key:"passages",label:"Passages",step:"1"},{key:"distanceM",label:"Distance totale (m)",step:"1"}];
  if(/rameur/.test(name))return [{key:"durationMin",label:"Durée (min)",step:"0.5"},{key:"distanceM",label:"Distance (m)",step:"1"},{key:"pace",label:"Allure moyenne / 500 m",type:"text",placeholder:"ex. 2:08"}];
  if(/velo/.test(name))return [{key:"durationMin",label:"Durée (min)",step:"0.5"},{key:"distanceKm",label:"Distance (km)",step:"0.1"},{key:"resistance",label:"Résistance / niveau",step:"1"}];
  if(/tapis/.test(name))return [{key:"durationMin",label:"Durée (min)",step:"0.5"},{key:"distanceKm",label:"Distance (km)",step:"0.1"},{key:"speedKmh",label:"Vitesse moyenne (km/h)",step:"0.1"},{key:"inclinePct",label:"Inclinaison (%)",step:"0.5"}];
  if(/mobilite|etirement/.test(name))return [];
  return [];
}
function athPreviousMetric(session,index,key){
  const rows=(state.athPerformance||[]).filter(x=>x.session===session&&Number(x.index)===Number(index));
  return rows.at(-1)?.metrics?.[key]??"";
}
function athPerformanceForm(session){
  const steps=DATA.ath?.[session]||[];
  return `<div class="ath-performance-form">${steps.map((step,i)=>{const fields=athMetricDefinition(step);if(!fields.length)return `<div class="ath-performance-block ath-completed-only"><b>${i+1}. ${esc(step.name)}</b><span>Réalisé</span></div>`;return `<div class="ath-performance-block" data-ath-performance="${i}"><b>${i+1}. ${esc(step.name)}</b><div class="ath-performance-fields">${fields.map(f=>{const previous=athPreviousMetric(session,i,f.key),cfg=athStepConfig(session,i),prev=previous!==""?previous:(f.key==="durationMin"&&cfg?.durationSeconds?String(Math.round(cfg.durationSeconds/6)/10):"");return `<label>${esc(f.label)}<input data-ath-metric="${esc(f.key)}" type="${f.type||'number'}" ${f.type?'':`inputmode="decimal" step="${f.step||'0.1'}" min="0"`} value="${esc(prev)}" placeholder="${esc(f.placeholder||'')}"></label>`}).join("")}</div></div>`}).join("")}</div>`;
}
function requestAthPerformance(cur){
  openModal(`<h3>Résultats athlétiques</h3><p class="tiny muted">Renseignez les données disponibles. Les dernières valeurs sont proposées pour accélérer la saisie. Aucun effort ressenti n’est demandé.</p>${athPerformanceForm(cur.session)}<div class="modal-actions"><button class="btn ghost" id="ath-perf-skip">Enregistrer sans valeurs</button><button class="btn gold" id="ath-perf-save">Enregistrer les résultats</button></div>`,modal=>{
    const finish=()=>{cur.athPerformanceRecorded=true;save();closeOverlay(true);setTimeout(saveCurrentSession,0);};
    $('#ath-perf-skip',modal).onclick=finish;
    $('#ath-perf-save',modal).onclick=()=>{cur.athPerformance=cur.athPerformance||{};$$('[data-ath-performance]',modal).forEach(block=>{const metrics={};$$('[data-ath-metric]',block).forEach(input=>{const raw=input.value.trim();if(raw!=="")metrics[input.dataset.athMetric]=raw;});if(Object.keys(metrics).length)cur.athPerformance[block.dataset.athPerformance]=metrics;});finish();};
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
  if(cur.session.startsWith("ATHLÉTIQUE")&&!cur.athPerformanceRecorded){requestAthPerformance(cur);return;}
  if(!cur.session.startsWith("ATHLÉTIQUE")){
    const ids=activeSessionIds(cur);
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
  const ids=cur.session.startsWith("ATHLÉTIQUE")?[]:activeSessionIds(cur);
  const exRecords=ids.map((id,i)=>{const no=i+1,key=occKey(id,no),status=occurrenceStatus(cur,id,no),actual=occurrenceValue(cur,id,no),next=occurrenceNext(cur,id,no)||(status==='Échoué'?'':actual),reps=cur.reps?.[key]??repNumber(defaultParams(id).repetitions),nextReps=cur.nextReps?.[key]??reps,setReps=cur.setReps?.[key]||null,equipment=state.progressionSettings[id]?.equipment||"";return{id,name:exercise(id).name,status,actual,next,reps,nextReps,no,setReps,equipment};}).filter(e=>e.status!=="Non réalisé");
  const historyId="h"+Date.now();
  const athRecords=cur.session.startsWith("ATHLÉTIQUE")?Object.entries(cur.athPerformance||{}).map(([index,metrics])=>{const step=DATA.ath?.[cur.session]?.[Number(index)];return {session:cur.session,index:Number(index),name:step?.name||`Exercice ${Number(index)+1}`,date:localISODate(),historyId,metrics:Object.assign({},metrics)};}):[];
  state.history.push({id:historyId,date:localISODate(),session:cur.ephemeral?ephemeralDisplayName(cur):cur.session,ephemeral:!!cur.ephemeral,start:cur.start,end:cur.end,duration:mins,exercises:exRecords,athPerformance:athRecords});
  if(athRecords.length)state.athPerformance.push(...athRecords);
  // Commit ONLY recorded exercises; each occurrence keeps its four actual sets
  // in history while its next working charge/repetitions are shared by identity.
  exRecords.forEach(e=>{
    // A failed attempt with no planned charge must not create a phantom reference.
    if(!e.next||e.next==='—')return;
    const id=e.id,p=defaultParams(id);
    state.refs[id]=e.next;
    if(p.type==='strength'){
      p.charge=e.next;
      if(Number.isFinite(Number(e.nextReps))&&Number(e.nextReps)>0)p.repetitions=String(e.nextReps);
      state.params[id]=p;
      setSharedProgress(id,{charge:e.next,repetitions:p.repetitions});
    }
  });
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
  const todayHeroClass=cur.session.startsWith("G1")?"tall session-hero-g1":cur.session.startsWith("G2")?"tall session-hero-g2":"tall";
  shell(`${header("Aujourd’hui",date,`<div class="session-code">${niceSession(cur.session)}</div><div class="session-groups">${groupLabel(cur.session)}</div>`,todayHeroClass)}
    <div class="today-meta today-meta-single"><div><div class="meta-label">Heure de début</div>${timeButton(cur.start,"edit-start")}</div></div>
    <button class="card ath-sheet-preview" id="open-ath-sheet"><img data-fallback src="${img||"./assets/hero-today.jpg"}" alt=""><span>Ouvrir la fiche technique complète ${icon("chevron")}</span></button>
    <button class="btn gold block" id="ath-guide">${esc(guideEntryLabel("ath:"+cur.session))}</button>${athListMarkup(cur.session)}
    <div class="card finish-card"><div class="finish-head"><div><div class="finish-title">${icon("flag")} Fin de séance</div><div class="tiny muted">Heure de fin</div>${timeButton(cur.end,"edit-end")}</div><div class="finish-stat"><span>Durée totale</span><b>${durationClock(cur)}</b></div><div class="tiny muted" style="text-align:right">60 min + 15 min mobilité</div></div><button class="btn gold block save-session-btn" id="save-session">${icon("save")} Enregistrer la séance</button></div><button class="btn session-cancel-bottom" id="cancel-session">${icon("x")} Annuler la séance</button>`,"today-screen");
  $("#ath-guide").onclick=()=>openAthGuide(cur.session);$("#open-ath-sheet").onclick=()=>openAthSheet(cur.session);bindAthList(cur.session);$("#edit-start").onclick=()=>editSessionTimes("start");$("#edit-end").onclick=()=>editSessionTimes("end");$("#save-session").onclick=saveCurrentSession;$("#cancel-session").onclick=cancelCurrentSession;
}
// V24.19: workout settings have one source of truth for the form, the list and the guide.
function athDefaultInterval(step){
  const label=(step.fields||[]).find(f=>/\d+\s*s.*\d+\s*s/i.test(f))||'';
  const match=label.match(/(\d+)\s*s[^\d]+(\d+)\s*s/i);
  return match?{effort:+match[1],recovery:+match[2]}:null;
}
function athStepConfig(session,index){
  const step=DATA.ath?.[session]?.[index];if(!step)return null;
  const saved=state.athParams?.[session]?.[index]||{};
  const isRemaining=/temps restant/i.test(step.duration||'');
  // "Temps restant pour atteindre 60 min" is a dynamic remainder, not 60 minutes of extra work.
  const defaultDuration=isRemaining?null:athDurationSeconds(step.duration);
  const legacy=String(saved['Durée']||'').trim();
  const legacyDuration=legacy?(/^\d+(?:[,.]\d+)?$/.test(legacy)?Math.round(Number(legacy.replace(',','.'))*60):athDurationSeconds(legacy)):null;
  const durationSeconds=Number.isFinite(+saved.durationSeconds)&&+saved.durationSeconds>0?+saved.durationSeconds:(legacyDuration||defaultDuration||null);
  const interval=athDefaultInterval(step);
  const legacyIntervalLabel=(step.fields||[]).find(f=>/\d+\s*s.*\d+\s*s/i.test(f));
  const legacyInterval=legacyIntervalLabel?String(saved[legacyIntervalLabel]||'').match(/(\d+)\s*s?[^\d]+(\d+)\s*s?/i):null;
  return {step,saved,durationSeconds,isRemaining,interval,
    effortSeconds:interval?(Number(saved.effortSeconds)>0?Number(saved.effortSeconds):(legacyInterval?+legacyInterval[1]:interval.effort)):null,
    recoverySeconds:interval?(Number(saved.recoverySeconds)>0?Number(saved.recoverySeconds):(legacyInterval?+legacyInterval[2]:interval.recovery)):null};
}
function athStepDurationText(session,index){
  const c=athStepConfig(session,index);if(!c)return '';
  if(c.isRemaining&&!c.durationSeconds)return 'Temps restant pour atteindre 60 min';
  if(!c.durationSeconds)return c.step.duration;
  const mins=c.durationSeconds/60;
  return Number.isInteger(mins)?mins+' min':c.durationSeconds+' s';
}
function athStepSummary(session,index,step){
  const c=athStepConfig(session,index);if(!c)return '';
  const other=(step.fields||[]).filter(f=>f!=='Durée'&&!/\d+\s*s.*\d+\s*s/i.test(f)).map(f=>c.saved[f]?`${f} : ${c.saved[f]}`:f);
  if(c.interval)other.push(`Effort ${c.effortSeconds} s / récupération ${c.recoverySeconds} s`);
  return other.join(' · ');
}
function athSettingsMarkup(session,index){
  const c=athStepConfig(session,index);if(!c)return '';
  const duration=c.durationSeconds?String(c.durationSeconds/60):'';
  const optional=c.isRemaining||!athDurationSeconds(c.step.duration);
  const otherFields=(c.step.fields||[]).filter(f=>f!=='Durée'&&!/\d+\s*s.*\d+\s*s/i.test(f));
  return `<div class="ath-settings-fields" data-ath-editor="${index}">
    <div class="field"><label>Durée (minutes)${optional?' · facultatif':''}</label><input data-ath-duration type="number" inputmode="decimal" step="0.5" min="0.5" max="240" value="${esc(duration)}" placeholder="${c.isRemaining?'Automatique : reste à 60 min':optional?'Libre / passages':'Durée'}"></div>
    ${c.interval?`<div class="field"><label>Effort (secondes)</label><input data-ath-effort type="number" inputmode="numeric" min="5" max="3600" value="${c.effortSeconds}"></div><div class="field"><label>Récupération (secondes)</label><input data-ath-recovery type="number" inputmode="numeric" min="5" max="3600" value="${c.recoverySeconds}"></div>`:''}
    ${otherFields.map(f=>`<div class="field"><label>${esc(f)}${f==='Récupération'?' (secondes)':''}</label><input data-ath-field="${esc(f)}" ${f==='Passages'||f==='Récupération'?'type="number" inputmode="numeric" min="1" max="600"':'type="text"'} value="${esc(c.saved[f]||'')}" placeholder="${esc(f)}"></div>`).join('')}
  </div>`;
}
function readAthSettings(editor,session,index){
  const c=athStepConfig(session,index),durationInput=$('[data-ath-duration]',editor);
  const raw=durationInput.value.trim().replace(',','.');
  if(raw&&(!Number.isFinite(+raw)||+raw<.5||+raw>240)){alert('Durée : entre 0,5 et 240 minutes.');return null;}
  if(!raw&&!c.isRemaining&&athDurationSeconds(c.step.duration)){alert('Une durée est nécessaire pour cet exercice.');return null;}
  const result={...c.saved};delete result['Durée'];
  if(raw)result.durationSeconds=Math.round(Number(raw)*60);else delete result.durationSeconds;
  if(c.interval){
    for(const [field,attr] of [['effortSeconds','data-ath-effort'],['recoverySeconds','data-ath-recovery']]){
      const v=Number($('['+attr+']',editor).value);
      if(!Number.isInteger(v)||v<5||v>3600){alert('Effort et récupération : entre 5 et 3600 secondes.');return null;}
      result[field]=v;
    }
  }
  $$('[data-ath-field]',editor).forEach(field=>{result[field.dataset.athField]=field.value.trim();});
  const passages=result.Passages,recup=result['Récupération'];
  if((passages&&(!/^\d+$/.test(passages)||+passages<1||+passages>60))||(recup&&(!/^\d+$/.test(recup)||+recup>600))){alert('Passages : 1–60 ; récupération : 0–600 secondes.');return null;}
  return result;
}
function openAthStepSettings(session,index){
  if(pendingGuide()?.key==='ath:'+session){alert('Une séance guidée est en pause. Terminez-la avant de modifier ses paramètres.');return;}
  const step=DATA.ath?.[session]?.[index];if(!step)return;
  openModal(`<h3>${esc(index+1)}. ${esc(step.name)}</h3><p class="tiny muted">Les réglages seront enregistrés uniquement pour ${esc(niceSession(session))}.</p>${athSettingsMarkup(session,index)}<div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="save-ath-step">Enregistrer</button></div>`,modal=>{
    $('#save-ath-step',modal).onclick=()=>{const next=readAthSettings($('[data-ath-editor]',modal),session,index);if(!next)return;state.athParams[session]=state.athParams[session]||{};state.athParams[session][index]=next;save();closeOverlay(true);render();};
  });
}
function athListMarkup(session){
  return `<div class="card ath-edit-list">${(DATA.ath?.[session]||[]).map((step,i)=>`<button type="button" class="ath-edit-row" data-edit-ath="${i}" aria-label="Régler ${esc(step.name)}"><div class="ath-edit-row-heading"><b class="gold">${i+1}. ${esc(step.name)}</b><span>${esc(athStepDurationText(session,i))} ${icon('pencil')}</span></div><div class="tiny muted">${esc(athStepSummary(session,i,step))}</div></button>`).join('')}</div>`;
}
function bindAthList(session){$$('[data-edit-ath]').forEach(b=>b.onclick=()=>openAthStepSettings(session,Number(b.dataset.editAth)));}
function openAthSheet(session){
  const img=pathUrl(ATH_SHEETS[session]||""),steps=DATA.ath?.[session]||[];
  state.athParams[session]=state.athParams[session]||{};
  const overlay=document.createElement("div");overlay.className="sheet-overlay";overlay.innerHTML=`<div class="sheet">
    <div class="sheet-top"><div><div class="tiny gold">FICHE TECHNIQUE</div><b>${esc(niceSession(session))}</b></div><button class="btn" data-close-sheet>Fermer</button></div>
    <div class="sheet-canvas">${img?`<img data-fallback src="${img}" alt="${esc(niceSession(session))}">`:`<div class="empty" style="min-height:360px">Fiche ATH non associée.</div>`}</div>
    <div class="sheet-params"><h3>Paramètres de la séance</h3><p class="tiny muted">Les valeurs modifiées seront utilisées par le chronomètre et le coach vocal.</p>${steps.map((step,i)=>`<div class="ath-param-block"><div class="row-between"><b>${i+1}. ${esc(step.name)}</b><span class="tiny gold">${esc(athStepDurationText(session,i))}</span></div>${athSettingsMarkup(session,i)}</div>`).join('')}
      <button class="btn gold block" id="save-ath-params" style="margin-top:8px">Enregistrer</button></div>
  </div>`;
  overlayRoot.innerHTML="";overlayRoot.appendChild(overlay);history.pushState(Object.assign(navState(),{overlay:"ath-sheet"}),"");
  $("[data-close-sheet]",overlay).onclick=()=>closeOverlay(true);
  $("#save-ath-params",overlay).onclick=()=>{if(pendingGuide()?.key==='ath:'+session){alert('Terminez la séance guidée en pause avant de modifier les réglages.');return;}const next={...state.athParams[session]};for(const editor of $$('[data-ath-editor]',overlay)){const i=Number(editor.dataset.athEditor),value=readAthSettings(editor,session,i);if(!value)return;next[i]=value;}state.athParams[session]=next;save();closeOverlay(true);render();};
}

function renderProgram(){
  const groupIcon='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3H3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v3h-3"/></svg>';
  shell(`<header class="header program-header" style="--session-image:url('${headerAsset("Programme")}')">
    <div class="header__content"><h1>Programme</h1><div class="subtitle">Organisation des Séances</div></div>
    </header>
    <div class="tabs program-tabs program-tabs-under" aria-label="Rubriques du programme">${["sessions","groups","manage"].map((m,i)=>`<button data-pmode="${m}" aria-pressed="${programMode===m}" class="${programMode===m?"on":""}">${[icon("dumbbell"),groupIcon,icon("settings")][i]}<span>${["Séances","Groupes","Paramètres"][i]}</span></button>`).join("")}</div>
    ${programMode==="sessions"?programSessions():programMode==="groups"?programGroups():programManage()}`,programMode==="sessions"?"program-home-screen":"program-scroll-screen");
  $$('[data-pmode]').forEach(b=>b.onclick=()=>{const next=b.dataset.pmode;if(next==="groups"&&programMode!=="groups")programExerciseGroup="Tous";programMode=next;persistUI();history.pushState(navState(),"");render();});
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
  const s=`G${n}${state.cycle}`,groups=groupLabel(s).split(" / ").map(esc).join("<br>"),asset=n===1?'./assets/card-g1-maquette-finale-v24254.png':n===2?'./assets/card-g2-maquette-finale-v24254.png':'./assets/card-g3-portrait-valide-v24255.png';
  const positionMap={1:'right center',2:'right center',3:'right center'};return `<div class="program-card program-card-g${n}" data-session-card="${s}" style="--card-image:url('${asset}');--card-position:${positionMap[n]}"><span class="code">G${n}</span><span class="groups">${groups}</span>
    <span class="variant-row">${cycles.map(c=>`<button data-open-g="${`G${n}${c}`}" class="">${c}</button>`).join("")}</span></div>`;
}
function programCompCard(title,variants,next){
  const asset=title==="ATHLÉTIQUE"?"./assets/card-ath-official.jpg":"./assets/card-fm-official.jpg";
  const pos='right center';
  return `<div class="program-card comp-card" style="--card-image:url('${asset}');--card-position:${pos}"><span class="code">${esc(title)}</span><span class="groups">${title==="ATHLÉTIQUE"?"Cardio / Endurance<br>Condition physique":"Séances complètes<br>Ciblées"}</span>
    <span class="variant-row fm-row">${variants.map(v=>`<button data-open-comp="${title==="ATHLÉTIQUE"?`ATHLÉTIQUE ${v}`:`FULL MIX ${v}`}" class="">${v}</button>`).join("")}</span></div>`;
}
function programExercises(group){
  const reg=registry(),ids=Object.keys(reg).filter(id=>!state.archivedExercises.includes(id)&&groupForId(id)===group).sort((a,b)=>reg[a].name.localeCompare(reg[b].name,"fr"));
  return `<div class="group-detail-head"><button class="backlink" data-back-groups>${icon("arrowleft")} Retour aux groupes</button><h2 class="section-title">${esc(group)}</h2><span>${ids.length} exercice${ids.length>1?"s":""}</span></div>
    <section class="library-section"><div class="panel">${ids.map(id=>{
      const o=occurrenceList(id).find(x=>groupForId(id)===group)||occurrenceList(id)[0]||{s:reg[id].firstSession,n:reg[id].firstNo},img=thumbnailFor(id,o.s,o.n),count=occurrenceList(id).length;
      return `<div class="library-row" data-open-ex="${esc(id)}" data-s="${esc(o.s||"")}" data-n="${o.n||1}"><div class="thumb"><img class="${thumbClass(img)}" loading="lazy" decoding="async" data-fallback src="${img||"./assets/hero-program-official.jpg"}"></div><div class="library-copy"><div class="ex-name">${esc(reg[id].name)}</div><div class="ex-sub">${esc(group)}</div></div><div class="trend">${count} séance${count>1?"s":""}</div><div class="chev">${icon("chevron")}</div></div>`;
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
      <h3>Sauvegarde et restauration</h3><p class="tiny muted">Dernière sauvegarde : ${esc(lastBackupLabel())}</p><button class="btn block" id="backup" style="margin-top:6px">Exporter toutes mes données (JSON)</button>
      <label class="btn block" style="display:block;text-align:center;margin-top:6px">Vérifier le fichier JSON téléchargé<input id="verify-backup" type="file" accept=".json,application/json" hidden></label>
      <label class="btn block" style="display:block;text-align:center;margin-top:6px">Restaurer une sauvegarde<input id="restore" type="file" accept=".json,application/json" hidden></label>
      <button class="btn block" id="export" style="margin-top:6px">Exporter l’historique (CSV)</button>
    </div>
    <h2 class="section-title">Séances éphémères</h2>
    <div class="card ephemeral-card"><button class="btn gold block" id="add-ephemeral">${icon("plus")} Ajouter une séance éphémère</button>
      <div class="ephemeral-list">${state.ephemeralSessions.length?state.ephemeralSessions.map(x=>`<div class="ephemeral-row"><div><b>${esc(x.name||"Séance éphémère")}</b><span>${x.exerciseIds.length} exercice${x.exerciseIds.length>1?"s":""}</span></div><div class="ephemeral-actions"><button class="backlink" data-start-ephemeral="${esc(x.id)}">Démarrer</button><button class="backlink" data-edit-ephemeral="${esc(x.id)}">Modifier</button><button class="backlink" data-delete-ephemeral="${esc(x.id)}">Supprimer</button></div></div>`).join(""):`<div class="empty">Aucune séance éphémère enregistrée.</div>`}</div>
    </div>
    <h2 class="section-title">Exercices archivés</h2><div class="card">${state.archivedExercises.length?state.archivedExercises.map(id=>`<div class="history-row"><b>${esc(exercise(id).name)}</b><button class="backlink" data-unarchive="${esc(id)}" style="float:right">Restaurer</button></div>`).join(""):`<div class="empty">Aucun exercice archivé.</div>`}</div>`;
}
function openEphemeralEditor(editId=""){
  const existing=ephemeralById(editId),groups=["Pectoraux","Dos","Épaules","Biceps","Triceps","Jambes","Abdos"];
  const initialIds=existing?.exerciseIds||[];
  const selectedGroups=new Set(initialIds.map(groupForId));
  openModal(`<h3>${existing?"Modifier":"Créer"} une séance éphémère</h3><p>Choisissez les groupes musculaires à afficher.</p><div class="ephemeral-group-picks">${groups.map(g=>`<label class="ephemeral-pick"><input type="checkbox" value="${esc(g)}" ${selectedGroups.has(g)?"checked":""}><span>${esc(g)}</span></label>`).join("")}</div><div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="ephemeral-next">Choisir les exercices</button></div>`,ov=>{
    $("#ephemeral-next",ov).onclick=()=>{const chosen=$$(".ephemeral-pick input:checked",ov).map(x=>x.value);if(!chosen.length)return;closeOverlay(false);openEphemeralExercises(existing,chosen);};
  });
}
function openEphemeralExercises(existing,groups){
  const reg=registry(),initial=new Set(existing?.exerciseIds||[]),ids=Object.keys(reg).filter(id=>!state.archivedExercises.includes(id)&&groups.includes(groupForId(id))).sort((a,b)=>reg[a].name.localeCompare(reg[b].name,"fr"));
  openModal(`<h3>Exercices de la séance</h3><div class="field"><label>Nom de la séance (facultatif)</label><input id="ephemeral-name" value="${esc(existing?.name||"")}" placeholder="Ex. Bras, Rattrapage…"></div><p>Cochez les exercices. L’ordre affiché sera l’ordre de la séance.</p><div class="option-list">${ids.map(id=>`<div class="option-row ephemeral-ex-option"><label><b>${esc(exercise(id).name)}</b><span>${esc(groupForId(id))}</span></label><div class="ephemeral-order-tools"><input type="checkbox" value="${esc(id)}" ${initial.has(id)?"checked":""}><button type="button" class="backlink" data-move-up aria-label="Monter">↑</button><button type="button" class="backlink" data-move-down aria-label="Descendre">↓</button></div></div>`).join("")}</div><div class="modal-actions"><button class="btn ghost" id="ephemeral-back">Retour</button><button class="btn gold" id="ephemeral-save">Enregistrer</button></div>`,ov=>{
    // Preserve the exact order in which exercises are checked. Existing sessions keep their saved order.
    let selectedOrder=(existing?.exerciseIds||[]).filter(id=>initial.has(id));
    $$('.ephemeral-ex-option input',ov).forEach(input=>input.addEventListener('change',()=>{
      if(input.checked){if(!selectedOrder.includes(input.value))selectedOrder.push(input.value);}
      else selectedOrder=selectedOrder.filter(id=>id!==input.value);
    }));
    $$('[data-move-up]',ov).forEach(b=>b.onclick=()=>{const r=b.closest('.ephemeral-ex-option');if(r?.previousElementSibling)r.parentNode.insertBefore(r,r.previousElementSibling);const checked=$$('.ephemeral-ex-option input:checked',ov).map(x=>x.value);selectedOrder=checked;});
    $$('[data-move-down]',ov).forEach(b=>b.onclick=()=>{const r=b.closest('.ephemeral-ex-option'),n=r?.nextElementSibling;if(n)r.parentNode.insertBefore(n,r);const checked=$$('.ephemeral-ex-option input:checked',ov).map(x=>x.value);selectedOrder=checked;});
    $("#ephemeral-back",ov).onclick=()=>{closeOverlay(false);openEphemeralEditor(existing?.id||"");};
    $("#ephemeral-save",ov).onclick=()=>{const checked=new Set($$(".ephemeral-ex-option input:checked",ov).map(x=>x.value));const exerciseIds=selectedOrder.filter(id=>checked.has(id));if(!exerciseIds.length)return;const name=$("#ephemeral-name",ov).value.trim()||"Séance éphémère";if(existing){existing.name=name;existing.exerciseIds=exerciseIds;}else state.ephemeralSessions.push({id:"eph-"+Date.now(),name,exerciseIds});save();closeOverlay(true);render();};
  });
}
function startEphemeral(id){
  const x=ephemeralById(id);if(!x||!x.exerciseIds.length)return;
  const snapshot={};x.exerciseIds.forEach((eid,i)=>snapshot[occKey(eid,i+1)]=referenceFor(eid));
  state.today={session:"ÉPHÉMÈRE",ephemeral:true,ephemeralId:x.id,ephemeralName:x.name,exerciseIds:x.exerciseIds.slice(),start:"",end:"",manualTimes:true,status:{},values:snapshot,nextRefs:{}};
  state.todayDismissed=null;save();rememberTabScroll();tab="today";view={type:"root"};tabScroll.today=0;persistUI();history.replaceState(navState(),"");render();restoreTabScroll("today");
}
function deleteEphemeral(id){
  const x=ephemeralById(id);if(!x)return;
  openModal(`<h3>Supprimer la séance ?</h3><p>${esc(x.name)} sera retirée de Paramètres. Les séances déjà enregistrées dans l’historique resteront conservées.</p><div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="confirm-delete-ephemeral">Supprimer</button></div>`,ov=>{$("#confirm-delete-ephemeral",ov).onclick=()=>{state.ephemeralSessions=state.ephemeralSessions.filter(e=>e.id!==id);save();closeOverlay(true);render();};});
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
  $$('[data-group-open]').forEach(b=>b.onclick=()=>{programExerciseGroup=b.dataset.groupOpen;programMode="groups";persistUI();history.pushState(navState(),"");render();});
  $$('[data-back-groups]').forEach(b=>b.onclick=()=>{programExerciseGroup="Tous";persistUI();history.replaceState(navState(),"");render();});
  if($("#cycle-position"))$("#cycle-position").onclick=openCycleModal;
  if($("#backup"))$("#backup").onclick=backupJSON;
  if($("#verify-backup"))$("#verify-backup").onchange=verifyBackupFile;
  if($("#restore"))$("#restore").onchange=restoreJSON;
  if($("#export"))$("#export").onclick=exportCSV;
  if($("#add-ephemeral"))$("#add-ephemeral").onclick=()=>openEphemeralEditor();
  $$('[data-start-ephemeral]').forEach(b=>b.onclick=()=>startEphemeral(b.dataset.startEphemeral));
  $$('[data-edit-ephemeral]').forEach(b=>b.onclick=()=>openEphemeralEditor(b.dataset.editEphemeral));
  $$('[data-delete-ephemeral]').forEach(b=>b.onclick=()=>deleteEphemeral(b.dataset.deleteEphemeral));
  $$('[data-unarchive]').forEach(b=>b.onclick=()=>{state.archivedExercises=state.archivedExercises.filter(x=>x!==b.dataset.unarchive);save();render();});
}
function programDetailSubtitle(session){
  if(session==="FULL MIX 3")return "Dominante jambes";
  if(/^FULL MIX [124]$/.test(session))return "";
  return groupLabel(session);
}
function renderProgramDetail(session){
  if(session.startsWith("ATHLÉTIQUE")){renderAthProgram(session);return;}
  const ids=sessionIds(session),subtitle=programDetailSubtitle(session);
  const heroAsset=session.startsWith("G1")?"./assets/card-g1-maquette-finale-v24254.png":session.startsWith("G2")?"./assets/card-g2-maquette-finale-v24254.png":session.startsWith("G3")?"./assets/card-g3-official.jpg":"./assets/card-fm-official.jpg";
  const heroClass=session.startsWith("G1")?" session-hero-g1":session.startsWith("G2")?" session-hero-g2":session.startsWith("G3")?" session-hero-g3":"";
  shell(`<header class="session-header${heroClass}" style="--session-image:url('${heroAsset}')"><div class="session-header__content"><div class="backline"><button class="backlink" id="back-program">${icon("arrowleft")} Programme</button></div>
    <div class="session-title">${esc(niceSession(session))}</div>${subtitle?`<div class="session-group">${esc(subtitle)}</div>`:""}</div></header>
    <div class="panel session-list" id="session-list">${ids.map((id,i)=>sessionRow(id,session,i+1)).join("")}</div>
    <div class="session-bottom-actions"><button class="btn" id="edit-session">${icon("pencil")} Modifier</button><button class="btn gold add-exercise" id="add-exercise">＋ Ajouter un exercice</button></div>`);
  $("#back-program").onclick=()=>history.back();
  let editing=false;
  $("#edit-session").onclick=()=>{editing=!editing;$("#session-list").classList.toggle("editing",editing);$("#edit-session").textContent=editing?"✓ Terminer":"✎ Modifier";};
  $$("[data-session-row]").forEach(row=>row.onclick=e=>{if(!editing&&!e.target.closest(".handle")&&!e.target.closest(".row-menu"))openSheet(row.dataset.id,session,+row.dataset.no);});
  $$(".row-menu").forEach(b=>b.onclick=e=>{e.stopPropagation();openExerciseActionModal(session,b.closest("[data-session-row]").dataset.id);});
  $$('[data-program-circuit]').forEach(b=>b.onclick=e=>{e.stopPropagation();openCircuitGuide(b.dataset.programCircuit,session,+b.dataset.no);});
  enableSort($("#session-list"),session);
  $("#add-exercise").onclick=()=>openAddExerciseModal(session);
}
function programPrescription(id,session){
  const p=defaultParams(id),target=repetitionTargetFor(id,session);
  if(p.type==="gainage")return referenceFor(id);
  if(p.type==="circuit")return referenceFor(id);
  const load=refWithUnit(p.charge||state.refs[id]||latestFailedActualWeight(id)||"—"),series=parseInt(p.series)||4,reps=String(p.repetitions||target||"").trim();
  const repText=reps?`${series} × ${reps}`:`${series} séries`;
  return `${load} · ${repText}`;
}
function sessionRow(id,session,no){
  const e=exercise(id),img=thumbnailFor(id,session,no),prescription=programPrescription(id,session);
  return `<div class="session-row" data-session-row data-id="${esc(id)}" data-no="${no}">
    <div class="thumb"><img class="${thumbClass(img)}" loading="lazy" decoding="async" data-fallback src="${img||"./assets/hero-program-official.jpg"}"></div>
    <div class="session-copy"><div class="ex-name"><span class="inline-no">${no}.</span> ${esc(e.name)}</div><div class="ex-sub">${esc(groupForId(id))}</div><div class="program-prescription">${esc(prescription)}</div></div><div class="chev">${icon("chevron")}</div><div><button class="row-menu">${icon("more")}</button><span class="handle">${icon("grip")}</span></div>
    ${isAbCircuit(id)?`<button class="btn guide-program-btn" data-program-circuit="${esc(id)}" data-no="${no}">${esc(guideEntryLabel('circuit:'+session+':'+no+':'+id))}</button>`:''}</div>`;
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
  shell(`<header class="session-header" style="--session-image:url('./assets/card-ath-official.jpg')"><div class="session-header__content"><div class="backline"><button class="backlink" id="back-program">${icon("arrowleft")} Programme</button></div><div class="session-title">${esc(niceSession(session))}</div><div class="session-group">${esc(groupLabel(session))}</div></div></header>
    <button class="card ath-sheet-preview" id="open-ath-sheet"><img data-fallback src="${img||"./assets/hero-program-official.jpg"}" alt=""><span>Ouvrir la fiche technique complète ›</span></button>
    <button class="btn gold block guide-program-ath" id="program-ath-guide">${esc(guideEntryLabel('ath:'+session))}</button>
    ${athListMarkup(session)}`);
  $("#back-program").onclick=()=>history.back();
  $("#open-ath-sheet").onclick=()=>openAthSheet(session);
  $("#program-ath-guide").onclick=()=>openAthGuide(session);
  bindAthList(session);
}

let perfCache=null;
const performanceMarkupCache=new Map(),overviewMarkupCache=new Map();
function allPerf(){
  if(perfCache)return perfCache;
  const m={};(state.history||[]).forEach(h=>(h.exercises||[]).forEach(e=>{if(e.status==="Non réalisé")return;{const cid=canonicalId(e.id);(m[cid]||(m[cid]=[])).push({date:h.date,value:e.actual,next:e.next,reps:e.reps,setReps:Array.isArray(e.setReps)?e.setReps.slice():null,nextReps:e.nextReps,status:e.status,session:h.session,duration:h.duration});}}));return perfCache=m;
}
function periodStart(period){
  const d=new Date(); if(period==="1m")d.setMonth(d.getMonth()-1);else if(period==="3m")d.setMonth(d.getMonth()-3);else if(period==="6m")d.setMonth(d.getMonth()-6);else if(period==="1y")d.setFullYear(d.getFullYear()-1);else return null;return localISODate(d);
}
function trendFor(id,arr){
  if(!arr||arr.length<2)return{key:"none",label:"Données insuffisantes"};
  const a=arr[arr.length-2],b=arr[arr.length-1],oldLoad=loadForProgressComparison(a.value),newLoad=loadForProgressComparison(b.value),ra=repNumber(a.reps),rb=repNumber(b.reps);
  // A plate notation compares plate weight only against the same notation.
  // Never treat the leading 2 in "2×40" as a 2 kg machine load, or add an
  // unknown Smith-machine/bar weight to it.
  if(oldLoad&&newLoad&&oldLoad.kind===newLoad.kind){
    const wa=oldLoad.weight,wb=newLoad.weight;
    if(wb>wa)return{key:"up",label:"Progression nette"};
    // +1 repetition on just ONE set also counts, even if the minimum set stays at 10.
    if(wb===wa&&Array.isArray(a.setReps)&&Array.isArray(b.setReps)&&a.setReps.length===b.setReps.length&&a.setReps.length&&[...a.setReps,...b.setReps].every(Number.isFinite)){
      const oldTotal=a.setReps.reduce((sum,v)=>sum+v,0),newTotal=b.setReps.reduce((sum,v)=>sum+v,0);
      if(newTotal>oldTotal)return{key:"up",label:"Progression nette"};
      if(newTotal<oldTotal)return{key:"down",label:"Régression"};
    }
    if(wb===wa&&Number.isFinite(ra)&&Number.isFinite(rb)&&rb>ra)return{key:"up",label:"Progression nette"};
    if(wb<wa)return{key:"down",label:"Régression"};
    if(wb===wa&&Number.isFinite(ra)&&Number.isFinite(rb)&&rb<ra)return{key:"down",label:"Régression"};
  }
  let same=1;for(let i=arr.length-1;i>0;i--){if(normalizeRef(arr[i].value)===normalizeRef(arr[i-1].value)&&repNumber(arr[i].reps)===repNumber(arr[i-1].reps))same++;else break;}
  if(same>=6)return{key:"flat",label:"Stagnation"};if(same>=4)return{key:"slow",label:"Progression lente"};
  return{key:"none",label:"Données insuffisantes"};
}
function normalizeRef(v){return String(v??"").trim().toLowerCase();}
function loadForProgressComparison(raw){
 const text=String(raw??'').trim().replace(/\s/g,'').replace(/,/g,'.');
 const pair=text.match(/^(\d+(?:\.\d+)?)[x×](\d+(?:\.\d+)?)(?:kg)?$/i);
 if(pair)return{kind:'plates',weight:Number(pair[1])*Number(pair[2])};
 const single=text.match(/^(\d+(?:\.\d+)?)(?:kg)?$/i);
 return single?{kind:'kg',weight:Number(single[1])}:null;
}
function comparableProgressSeries(arr){
 const rows=(arr||[]).map(record=>({record,load:loadForProgressComparison(record.value)})).filter(x=>x.load);
 const kind=rows.at(-1)?.load.kind;
 // A new notation starts a new numeric comparison: a stated load in kilograms
 // is not directly interchangeable with disks-only weight on a Smith machine.
 return rows.filter(x=>x.load.kind===kind).map(x=>({record:x.record,weight:x.load.weight,kind}));
}
function parseNumber(v){const m=String(v??"").replace(",",".").match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):NaN;}
function progressHomeTabs(){
  return `<div class="progress-home-tabs">
    <button data-prog-view="overview" class="${progressionView==="overview"?"on":""}">${icon("chart")}<span>Vue d’ensemble</span></button>
    <button data-prog-view="performance" class="${progressionView==="performance"?"on":""}">${icon("trend")}<span>Performances</span></button>
    <button data-prog-view="measurements" class="${progressionView==="measurements"?"on":""}">${icon("list")}<span>Mesures</span></button>
  </div>`;
}
function weekKeyFromDate(date){
  const d=new Date(`${date||localISODate()}T12:00:00`);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);
  return localISODate(d);
}
// Charge + répétitions, sans assimiler la reprise au bas de la plage après
// augmentation de charge à une régression. Cette métrique est un indice de suivi,
// pas un volume d'entraînement ni une mesure physiologique.
function comparisonReps(record){
  const sets=record?.setReps;
  if(Array.isArray(sets)&&sets.length&&sets.every(n=>Number.isInteger(n)&&n>=0&&n<=200))
    return {value:sets.reduce((sum,n)=>sum+n,0),sets:sets.length,source:'actual'};
  const reps=repNumber(record?.reps);
  return Number.isFinite(reps)&&reps>0?{value:reps,sets:0,source:'minimum'}:null;
}
function progressionCurvePoints(rows){
  if(!rows?.length)return[];
  let index=100;
  return rows.map((row,i)=>{
    if(i){
      const previous=rows[i-1],oldLoad=previous.weight,newLoad=row.weight;
      if(oldLoad>0&&newLoad>0){
        // Une hausse/baisse de charge fait évoluer la courbe par la charge.
        // Après une hausse, la remise au bas de la plage de répétitions n'est donc pas une régression.
        if(newLoad!==oldLoad)index*=newLoad/oldLoad;
        else{
          // À charge identique, les répétitions réelles font évoluer la courbe.
          const a=comparisonReps(previous.record),b=comparisonReps(row.record);
          if(a&&b){
            let oldReps=a.value,newReps=b.value;
            if(a.sets!==b.sets){
              oldReps=a.sets?Math.min(...previous.record.setReps):a.value;
              newReps=b.sets?Math.min(...row.record.setReps):b.value;
            }
            if(oldReps>0)index*=newReps/oldReps;
          }
        }
      }
    }
    return {x:row.record.date,y:round1(index),load:row.weight,raw:row.record,r:graphRepsLabel(row.record),label:round1(row.weight)};
  });
}
function progressionChange(arr){
  const rows=comparableProgressSeries(arr);
  if(rows.length<2)return null;
  let multiplier=1,repDelta=0,comparisons=0;
  for(let i=1;i<rows.length;i++){
    const a=rows[i-1],b=rows[i],oldLoad=a.weight,newLoad=b.weight;
    if(oldLoad>0&&newLoad>0&&oldLoad!==newLoad){
      multiplier*=newLoad/oldLoad;comparisons++;
      // Rep targets reset on a load change: never count them as a rep loss.
      continue;
    }
    if(oldLoad!==newLoad)continue;
    const ra=comparisonReps(a.record),rb=comparisonReps(b.record);
    if(!ra||!rb)continue;
    // Actual sets are compared as totals only when the same number of sets was done.
    // If one result lacks set details, compare the per-set minimum instead.
    let previous=ra.value,current=rb.value;
    if(ra.sets!==rb.sets){
      previous=ra.sets?Math.min(...a.record.setReps):ra.value;
      current=rb.sets?Math.min(...b.record.setReps):rb.value;
    }
    if(previous<=0)continue;
    multiplier*=current/previous;repDelta+=current-previous;comparisons++;
  }
  if(!comparisons)return null;
  const delta=rows.at(-1).weight-rows[0].weight;
  return {percent:Math.round((multiplier-1)*100),loadDelta:round1(delta),repDelta,
    kind:rows.at(-1).kind,comparisons};
}
function progressionGlobalPercent(perf){
  const deltas=Object.values(perf).map(progressionChange).filter(Boolean).map(x=>x.percent);
  return deltas.length?Math.round(deltas.reduce((a,b)=>a+b,0)/deltas.length):null;
}
function selectedRange(period,anchor=periodAnchor){
  const d=new Date(`${anchor}T12:00:00`);let start,end;
  if(period==="week"){start=mondayOf(d);end=new Date(start);end.setDate(end.getDate()+7);}
  else if(period==="month"){start=new Date(d.getFullYear(),d.getMonth(),1);end=new Date(d.getFullYear(),d.getMonth()+1,1);}
  else{start=new Date(d.getFullYear(),0,1);end=new Date(d.getFullYear()+1,0,1);}
  return{start:localISODate(start),end:localISODate(end)};
}
function progressOverviewData(){
  const range=selectedRange(overviewPeriod),hist=(state.history||[]).filter(h=>h.date>=range.start&&h.date<range.end),perf={};
  Object.entries(allPerf()).forEach(([id,arr])=>perf[id]=arr.filter(x=>x.date>=range.start&&x.date<range.end));
  const sessions=hist.length;
  const exercises=hist.reduce((n,h)=>n+(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length,0);
  const minutes=hist.reduce((n,h)=>n+(Number(h.duration)||0),0);
  const global=progressionGlobalPercent(perf);
  const weeks=[];
  if(overviewPeriod==="week"){
    const monday=new Date(`${range.start}T12:00:00`);["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].forEach((label,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);const iso=localISODate(d);weeks.push({label,value:hist.filter(h=>h.date===iso).reduce((n,h)=>n+(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length,0)});});
  }else if(overviewPeriod==="month"){
    const cursor=new Date(`${range.start}T12:00:00`);let i=1;while(localISODate(cursor)<range.end){const wk=weekKeyFromDate(localISODate(cursor));weeks.push({label:`S${i++}`,value:hist.filter(h=>weekKeyFromDate(h.date)===wk).reduce((n,h)=>n+(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length,0)});cursor.setDate(cursor.getDate()+7);}
  }else{"J F M A M J J A S O N D".split(" ").forEach((label,i)=>weeks.push({label,value:hist.filter(h=>+h.date.slice(5,7)===i+1).reduce((n,h)=>n+(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length,0)}));}
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
function isoWeekInfo(value){
 const d=new Date(typeof value==='string'?value+'T12:00:00':value);
 const utc=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
 utc.setUTCDate(utc.getUTCDate()+4-(utc.getUTCDay()||7));
 const year=utc.getUTCFullYear();
 const first=new Date(Date.UTC(year,0,1));
 const week=Math.ceil((((utc-first)/86400000)+1)/7);
 return {year,week};
}
function isoWeekCount(year){return isoWeekInfo(new Date(year,11,28)).week;}
function trainingDurationSeries(period=overviewPeriod,anchor=periodAnchor){
  const range=selectedRange(period,anchor),entries=(state.history||[]).filter(h=>typeof h.date==='string');
  const durationOf=rows=>({value:rows.reduce((total,h)=>total+(Number(h.duration)>0?Number(h.duration):0),0),missing:rows.filter(h=>!(Number(h.duration)>0)).length});
  if(period==='week'){
    const end=new Date(range.start+'T12:00:00');
    return Array.from({length:6},(_,i)=>{const d=new Date(end);d.setDate(d.getDate()-(5-i)*7);const begin=localISODate(d);d.setDate(d.getDate()+7);const finish=localISODate(d);
      return {label:'S'+isoWeekInfo(begin).week,anchor:begin,...durationOf(entries.filter(h=>h.date>=begin&&h.date<finish))};});
  }
  if(period==='month'){
    const byWeek=new Map();const cursor=new Date(range.start+'T12:00:00');
    while(localISODate(cursor)<range.end){const key=weekKeyFromDate(localISODate(cursor));if(!byWeek.has(key))byWeek.set(key,[]);cursor.setDate(cursor.getDate()+1);}
    entries.filter(h=>h.date>=range.start&&h.date<range.end).forEach(h=>{const k=weekKeyFromDate(h.date);if(byWeek.has(k))byWeek.get(k).push(h);});
    return [...byWeek.values()].map((rows,i)=>({label:'S'+(i+1),...durationOf(rows)}));
  }
  return Array.from({length:12},(_,i)=>({label:['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'][i],...durationOf(entries.filter(h=>h.date>=range.start&&h.date<range.end&&Number(h.date.slice(5,7))===i+1))}));
}
function overviewDurationBars(series){
  const max=Math.max(60,...series.map(x=>x.value)),ceil=Math.ceil(max/60)*60;
  const show=mins=>{const m=Math.round(mins);return m>=60?Math.floor(m/60)+' h '+String(m%60).padStart(2,'0'):m+' min';};
  return `<div class="duration-bars" role="img" aria-label="Durées d’entraînement : ${esc(series.map(x=>x.label+', '+show(x.value)).join(' ; '))}">${series.map(x=>{const pct=x.value>0?Math.max(3,Math.round(x.value/ceil*100)):0;const title=x.label+' : '+show(x.value)+(x.missing?' · '+x.missing+' séance(s) sans durée renseignée':'');const weekAttrs=x.anchor?` data-overview-week="${esc(x.anchor)}" role="button" tabindex="0"`:"";return `<div class="duration-bar-col${x.anchor?' is-clickable':''}"${weekAttrs} title="${esc(title)}" aria-label="${esc(title)}"><b>${x.value?esc(show(x.value)):'0'}${x.missing?'<sup title="Séances sans durée renseignée">*</sup>':''}</b><div class="duration-bar-space"><i class="${x.value?'':'duration-zero'}" style="${x.value?'height:'+pct+'%':'height:4px'}"></i></div><span>${esc(x.label)}</span></div>`;}).join('')}</div>${series.some(x=>x.missing)?'<p class="duration-data-hint">* Certaines séances sans durée ne sont pas comptées comme zéro minute.</p>':''}`;
}
function overviewDonut(distribution,total){
  const palette=["#f2cf72","#d7ad50","#f0d596","#9e8655","#c9973d","#b9934b"];
  let cursor=0,stops=[];
  distribution.forEach((x,i)=>{const from=cursor,to=cursor+x.pct;stops.push(`${palette[i]} ${from}% ${to}%`);cursor=to;});
  if(cursor<100)stops.push(`#2b2924 ${cursor}% 100%`);
  return `<div class="overview-donut-wrap"><div class="overview-donut" style="background:conic-gradient(${stops.join(",")})"><div><b>${total}</b><span>exercices</span></div></div><div class="overview-legend">${distribution.map((x,i)=>`<div><span><i style="background:${palette[i]}"></i>${x.name}</span><b>${x.pct}%</b></div>`).join("")}</div></div>`;
}
function calendarDayDetails(day){
  if(!day)return '<div class="calendar-hint">Touchez une date pour consulter les séances de cette journée.</div>';
  const sessions=(state.history||[]).filter(h=>h.date===day).slice().sort((a,b)=>String(a.start||'').localeCompare(String(b.start||'')));
  return `<div class="calendar-detail-heading">Séances du ${esc(formatDate(day))}</div>${sessions.length?sessions.map(h=>`<button class="history-session-row" data-history-session="${esc(h.id)}"><div><b>${esc(niceSession(h.session||'Séance'))}</b><span>${esc(h.start||'')}${h.end?' → '+esc(h.end):''}</span></div><div><b>${Number(h.duration)>0?formatMinutes(h.duration):'Durée non renseignée'}</b><span>${(h.exercises||[]).filter(e=>e.status!=='Non réalisé').length} exercices</span></div><i>›</i></button>`).join(''):'<div class="calendar-hint">Aucune séance enregistrée ce jour.</div>'}`;
}
// The annual calendar is a read-only visualization of dated history, independent
// of the main Historique period filters and of the saved training records.
function annualTrainingCalendar(year){
  const recorded=new Set((state.history||[]).map(h=>String(h.date||"")));
  const months=Array.from({length:12},(_,m)=>{
    const first=new Date(year,m,1),days=new Date(year,m+1,0).getDate(),offset=(first.getDay()+6)%7;
    const label=first.toLocaleDateString("fr-FR",{month:"long"});
    const cells=Array.from({length:offset},()=>'<span class="annual-blank" aria-hidden="true"></span>').concat(
      Array.from({length:days},(_,i)=>{
        const date=`${year}-${String(m+1).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`;
        const trained=recorded.has(date);
        return `<span class="annual-day ${trained?"trained":""}" aria-label="${i+1}${trained?", séance réalisée":""}"><b>${i+1}</b>${trained?'<small aria-hidden="true">✓</small>':""}</span>`;
      })
    );
    return `<button type="button" class="annual-month" data-calendar-month="${m+1}" aria-label="Afficher ${esc(label)} ${year}"><span class="annual-month-name">${esc(label)}</span><span class="annual-month-grid">${['L','M','M','J','V','S','D'].map(d=>`<span class="annual-weekday">${d}</span>`).join('')}${cells.join('')}</span></button>`;
  });
  return `<button type="button" class="calendar-back-to-month" data-calendar-return-month aria-label="Revenir au calendrier mensuel">‹ Retour au mois</button><div class="calendar-month-bar calendar-year-bar"><button type="button" data-calendar-year-shift="-1" aria-label="Année précédente">‹</button><h3>${year}</h3><button type="button" data-calendar-year-shift="1" aria-label="Année suivante">›</button></div><div class="training-annual-grid">${months.join('')}</div>`;
}
function trainingCalendar(){
  const [year,month]=calendarAnchor.split('-').map(Number),first=new Date(year,month-1,1),count=new Date(year,month,0).getDate(),offset=(first.getDay()+6)%7,byDay={};
  (state.history||[]).forEach(h=>{if(h.date?.startsWith(calendarAnchor))byDay[h.date]=(byDay[h.date]||0)+1;});
  const monthCount=Object.values(byDay).reduce((n,v)=>n+v,0);
  const legacyCount=(state.oldWeeks||[]).reduce((n,w)=>n+(Number(w.count)||0),0);
  const totalCount=(state.history||[]).length+legacyCount;
  const isYear=calendarView==="year";
  const displayedCount=isYear?historyForYear(year).length:monthCount;
  const cells=Array.from({length:offset},(_,i)=>`<span class="calendar-blank" aria-hidden="true" data-blank="${i}"></span>`).concat(Array.from({length:count},(_,i)=>{
    const day=calendarAnchor+'-'+String(i+1).padStart(2,'0'),n=byDay[day]||0;
    return `<button type="button" data-calendar-day="${day}" class="training-day ${n?'trained':''} ${calendarSelectedDay===day?'selected':''}" aria-pressed="${calendarSelectedDay===day}" aria-label="${i+1} : ${n} séance${n>1?'s':''}"><b>${i+1}</b>${n?`<small aria-hidden="true">${n===1?'✓':n}</small>`:''}</button>`;
  }));
  return `<section class="card training-calendar" id="history-training-calendar"><h2>Calendrier d'entraînement</h2><div class="calendar-stats"><div><span>${isYear?'Cette année':'Ce mois-ci'}</span><b>${displayedCount}</b><small>Séances réalisées</small></div><div><span>Total</span><b>${totalCount}</b><small>Séances enregistrées</small></div></div>
    ${isYear?annualTrainingCalendar(year):`<div class="calendar-month-bar"><button type="button" data-calendar-shift="-1" aria-label="Mois précédent">‹</button><button type="button" class="calendar-month-title" data-calendar-open-year aria-label="Afficher le calendrier annuel ${year}">${esc(first.toLocaleDateString('fr-FR',{month:'long',year:'numeric'}))}</button><button type="button" data-calendar-shift="1" aria-label="Mois suivant">›</button></div>
    <div class="training-calendar-grid">${['L','M','M','J','V','S','D'].map(x=>`<span class="calendar-weekday">${x}</span>`).join('')}${cells.join('')}</div><div id="calendar-day-details" class="calendar-day-details" aria-live="polite">${calendarDayDetails(calendarSelectedDay)}</div>`}
    ${legacyCount?'<p class="calendar-archive-hint">Les anciennes séances archivées sans date précise sont incluses dans le total, mais ne peuvent pas être positionnées sur un jour.</p>':''}</section>`;
}
function bindTrainingCalendar(){
  const root=$('#history-training-calendar');if(!root)return;
  const refresh=()=>{root.outerHTML=trainingCalendar();bindTrainingCalendar();};
  const yearButton=$('[data-calendar-open-year]',root);
  if(yearButton)yearButton.onclick=()=>{annualReturnAnchor=calendarAnchor;calendarView='year';refresh();};
  const returnMonth=$('[data-calendar-return-month]',root);
  if(returnMonth)returnMonth.onclick=()=>{calendarAnchor=annualReturnAnchor||calendarAnchor;annualReturnAnchor=null;calendarSelectedDay=null;calendarView='month';refresh();};
  $$('[data-calendar-year-shift]',root).forEach(b=>b.onclick=()=>{
    const d=new Date(calendarAnchor+'-01T12:00:00');d.setFullYear(d.getFullYear()+Number(b.dataset.calendarYearShift));
    calendarAnchor=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');calendarSelectedDay=null;refresh();
  });
  $$('[data-calendar-month]',root).forEach(b=>b.onclick=()=>{
    calendarAnchor=calendarAnchor.slice(0,4)+'-'+String(b.dataset.calendarMonth).padStart(2,'0');
    calendarSelectedDay=null;calendarView='month';annualReturnAnchor=null;refresh();
  });
  $$('[data-calendar-shift]',root).forEach(b=>b.onclick=()=>{
    const d=new Date(calendarAnchor+'-01T12:00:00');d.setMonth(d.getMonth()+Number(b.dataset.calendarShift));
    calendarAnchor=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');calendarSelectedDay=null;refresh();
  });
  $$('[data-calendar-day]',root).forEach(b=>b.onclick=()=>{
    calendarSelectedDay=b.dataset.calendarDay;
    $$('[data-calendar-day]',root).forEach(day=>{const selected=day.dataset.calendarDay===calendarSelectedDay;day.classList.toggle('selected',selected);day.setAttribute('aria-pressed',String(selected));});
    $('#calendar-day-details',root).innerHTML=calendarDayDetails(calendarSelectedDay);
    $$('[data-history-session]',root).forEach(row=>row.onclick=()=>pushNav({type:'historyDetail',id:row.dataset.historySession}));
  });
  $$('[data-history-session]',root).forEach(row=>row.onclick=()=>pushNav({type:'historyDetail',id:row.dataset.historySession}));
}

function overviewIsCurrentWeek(){
  if(overviewPeriod!=="week")return false;
  const anchor=new Date(`${periodAnchor}T12:00:00`);
  return Number.isFinite(anchor.getTime())&&localISODate(mondayOf(anchor))===currentWeekKey();
}
function renderProgressOverview(){
  const cacheKey=overviewPeriod+"|"+periodAnchor+"|"+state.cycle+"|"+state.weekKey;
  if(overviewMarkupCache.has(cacheKey))return overviewMarkupCache.get(cacheKey);
  const d=progressOverviewData(),hours=Math.floor(d.minutes/60),mins=d.minutes%60;
  const html=`${progressHomeTabs()}
    <div class="tabs overview-period-tabs">${[["week","Semaine"],["month","Mois"],["year","Année"]].map(([p,l])=>`<button data-overview-period="${p}" class="${overviewPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    <button class="period-picker-button" id="overview-period-picker">${esc(periodLabel(overviewPeriod,periodAnchor))}</button>
    ${overviewPeriod==="week"&&!overviewIsCurrentWeek()?'<button class="today-period-btn" id="overview-today">Aujourd’hui</button>':''}
    <div class="overview-title-row"><h2>Résumé global</h2><div><span>Cycle actuel</span><b>Cycle G - Semaine ${state.cycle}</b></div></div>
    <div class="overview-metrics">
      <div class="overview-metric"><span class="overview-metric-icon">${icon("dumbbell")}</span><b>${d.sessions}</b><span>Séances<br>réalisées</span></div>
      <div class="overview-metric"><span class="overview-metric-icon">${icon("chart")}</span><b>${d.exercises}</b><span>Exercices<br>effectués</span></div>
      <div class="overview-metric"><span class="overview-metric-icon">${icon("clock")}</span><b>${hours}h ${String(mins).padStart(2,"0")}</b><span>Temps total</span></div>
      <div class="overview-metric"><span class="overview-metric-icon">${icon("trend")}</span><b>${d.global==null?'—':`${d.global>0?'+':''}${d.global}%`}</b><span>Progression<br>globale*</span></div>
    </div>
    <p class="tiny muted overview-progress-method">* Indice moyen : charge et répétitions comparables sur la période. Aucune valeur sans deux relevés exploitables.</p>
    <div class="overview-section-head duration-heading"><h2>Évolution du temps d’entraînement</h2><span>${overviewPeriod==="week"?(()=>{const w=isoWeekInfo(periodAnchor);return 'Semaine '+w.week+' / '+isoWeekCount(w.year);})():overviewPeriod==="month"?"Par semaine · mois sélectionné":"Par mois · année sélectionnée"}</span></div>
    <div class="overview-panel duration-panel">${overviewDurationBars(trainingDurationSeries())}</div>
    <div class="overview-section-head"><h2>Répartition par groupe musculaire</h2></div>
    <div class="overview-panel">${overviewDonut(d.distribution,d.exercises)}</div>`;
  overviewMarkupCache.set(cacheKey,html);return html;
}
function athMetricNumber(v){const n=Number(String(v??"").replace(",","."));return Number.isFinite(n)?n:null;}
function athMetricLabel(key){return ({durationMin:"Durée",loadKg:"Charge",passages:"Passages",distanceM:"Distance",distanceKm:"Distance",speedKmh:"Vitesse",inclinePct:"Inclinaison",resistance:"Résistance",pace:"Allure"})[key]||key;}
function athMetricDisplay(key,v){if(v==null||v==="")return "—";const unit=({durationMin:" min",loadKg:" kg",distanceM:" m",distanceKm:" km",speedKmh:" km/h",inclinePct:" %"})[key]||"";return `${String(v).replace('.',',')}${unit}`;}
function athleticProgressMarkup(){
  const rows=state.athPerformance||[];
  const groups=new Map();rows.forEach(r=>{const key=`${r.session}|${r.index}`;(groups.get(key)||groups.set(key,[]).get(key)).push(r);});
  const cards=[...groups.values()].map(arr=>{arr.sort((a,b)=>String(a.date).localeCompare(String(b.date)));const last=arr.at(-1),keys=Object.keys(last.metrics||{}),primary=keys.find(k=>["distanceM","distanceKm","loadKg","speedKmh","passages"].includes(k))||keys[0],numeric=primary?arr.map(x=>({date:x.date,value:athMetricNumber(x.metrics?.[primary])})).filter(x=>x.value!=null):[],best=numeric.length?Math.max(...numeric.map(x=>x.value)):null;return `<button class="ath-progress-card" data-ath-progress="${esc(last.session)}|${last.index}"><div><b>${esc(niceSession(last.session))} · ${esc(last.name)}</b><span>Dernière · ${formatDate(last.date)}</span></div><div class="ath-progress-values">${keys.slice(0,3).map(k=>`<span><small>${esc(athMetricLabel(k))}</small><b>${esc(athMetricDisplay(k,last.metrics[k]))}</b></span>`).join("")}</div>${best!=null?`<div class="tiny gold">Meilleure ${esc(athMetricLabel(primary).toLowerCase())} : ${esc(athMetricDisplay(primary,best))}</div>`:""}</button>`;});
  return `<section class="ath-progress-section${athleticProgressExpanded?' is-open':''}"><button type="button" class="ath-progress-toggle" id="ath-progress-toggle" aria-expanded="${athleticProgressExpanded?'true':'false'}"><span><b>Performances athlétiques</b><small>${groups.size} exercice${groups.size>1?'s':''} suivi${groups.size>1?'s':''}</small></span>${icon("chevron")}</button><div class="ath-progress-list">${cards.join("")||'<div class="card empty">Les performances Athlétique A/B apparaîtront ici après leur prochain enregistrement.</div>'}</div></section>`;
}
function openAthProgressDetail(key){
  const [session,indexRaw]=key.split('|'),index=Number(indexRaw),arr=(state.athPerformance||[]).filter(x=>x.session===session&&Number(x.index)===index).sort((a,b)=>String(a.date).localeCompare(String(b.date)));if(!arr.length)return;const last=arr.at(-1),keys=[...new Set(arr.flatMap(x=>Object.keys(x.metrics||{})))],primary=keys.find(k=>["distanceM","distanceKm","loadKg","speedKmh","passages"].includes(k))||keys[0],nums=arr.map(x=>({x:x.date,y:athMetricNumber(x.metrics?.[primary])})).filter(x=>x.y!=null);openModal(`<h3>${esc(last.name)}</h3><p class="tiny muted">${esc(niceSession(session))} · évolution objective enregistrée</p>${primary?`<div class="chart ath-mini-chart">${lineChart(nums)}</div><div class="tiny muted">Courbe : ${esc(athMetricLabel(primary))}</div>`:''}<div class="ath-detail-history">${arr.slice().reverse().map(x=>`<div class="ath-detail-row"><b>${formatDate(x.date)}</b><span>${keys.map(k=>`${esc(athMetricLabel(k))} : ${esc(athMetricDisplay(k,x.metrics?.[k]))}`).join(' · ')}</span></div>`).join('')}</div><button class="btn gold block" data-close-modal>Fermer</button>`);}
function renderProgressPerformance(){
  const cacheKey=progressionPeriod+"|"+progressionGroup+"|"+localISODate()+"|ath:"+(athleticProgressExpanded?"1":"0");
  if(performanceMarkupCache.has(cacheKey))return performanceMarkupCache.get(cacheKey);
  const perf=allPerf(),reg=registry();
  // Show historical Smith performances under their own retired name, without
  // reintroducing the old exercise to the active program or merging its loads.
  let ids=[...new Set([...Object.keys(reg),...Object.keys(perf).filter(id=>RETIRED_EXERCISES[id])])]
    .filter(id=>!state.archivedExercises.includes(id));
  if(progressionGroup!=="Tous")ids=ids.filter(id=>groupForId(id)===progressionGroup);
  const start=periodStart(progressionPeriod);if(start)ids=ids.filter(id=>(perf[id]||[]).some(x=>x.date>=start));
  const active=ids.filter(id=>(perf[id]||[]).length),progressing=active.filter(id=>["up","slow"].includes(trendFor(id,perf[id]).key)).length;
  const html=`${progressHomeTabs()}<div class="tabs">${[["1m","Semaines"],["3m","Mois"],["1y","Années"],["all","Tous"]].map(([p,l])=>`<button data-prog-period="${p}" class="${progressionPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    ${athleticProgressMarkup()}
    <div class="metrics"><div class="metric"><b>${active.length}</b><span>Exercices suivis</span></div><div class="metric"><b>${active.length?Math.round(progressing/active.length*100):0}%</b><span>En progression</span></div><div class="metric"><b>${averageIncrease(perf,active)}%</b><span>Augmentation moyenne</span></div></div>
    <div class="filter-row">${["Tous","Pectoraux","Dos","Épaules","Biceps","Triceps","Jambes","Abdos"].map(g=>`<button data-prog-group="${g}" class="${progressionGroup===g?"on":""}">${g}</button>`).join("")}</div>
    <div class="panel progress-list">${ids.map((id,i)=>progressRow(id,i+1,perf[id]||[])).join("")||`<div class="empty">Aucune donnée pour ce filtre.</div>`}</div>`;
  performanceMarkupCache.set(cacheKey,html);return html;
}
function renderProgressHistoryHome(){
  const recent=[...(state.history||[])].slice().reverse().slice(0,20);
  return `${progressHomeTabs()}<div class="overview-section-head"><h2>Historique des séances</h2><span>${recent.length} dernières</span></div><div class="panel progress-history-home">${recent.map(h=>`<div class="progress-history-row"><div><b>${esc(h.session||"Séance")}</b><span>${esc(h.date||"")}</span></div><div><b>${Number(h.duration)||0} min</b><span>${(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length} exercices</span></div></div>`).join("")||`<div class="empty">Aucune séance enregistrée.</div>`}</div>`;
}
function measurementRange(period){
  if(period==="all")return null;
  const d=new Date();let start;
  if(period==="month")start=new Date(d.getFullYear(),d.getMonth(),1);
  else start=new Date(d.getFullYear(),0,1);
  return localISODate(start);
}
function measurementRows(){return (state.measurements||[]).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));}
function measurementCalc(m){
  const weight=parseNumber(m.weight),bf=parseNumber(m.bodyFatPct),height=parseNumber(state.bodySettings?.heightCm);
  const fatMass=Number.isFinite(weight)&&Number.isFinite(bf)?weight*bf/100:NaN;
  const leanMass=Number.isFinite(weight)&&Number.isFinite(fatMass)?weight-fatMass:NaN;
  const bmi=Number.isFinite(weight)&&Number.isFinite(height)&&height>0?weight/((height/100)**2):NaN;
  return{weight,bf,fatMass,leanMass,bmi,muscle:parseNumber(m.muscleMassKg),waist:parseNumber(m.waistCm),chest:parseNumber(m.chestCm),shoulders:parseNumber(m.shouldersCm),hips:parseNumber(m.hipsCm),armL:parseNumber(m.armLeftCm),armR:parseNumber(m.armRightCm),thighL:parseNumber(m.thighLeftCm),thighR:parseNumber(m.thighRightCm),calfL:parseNumber(m.calfLeftCm),calfR:parseNumber(m.calfRightCm)};
}
function measurementDelta(cur,prev,key){if(!prev)return"—";const a=measurementCalc(cur)[key],b=measurementCalc(prev)[key];if(!Number.isFinite(a)||!Number.isFinite(b))return"—";const d=round1(a-b);return `${d>0?"+":""}${d}`;}
function smoothMeasureChart(rows,key="weight",unit="kg"){
  const vals=rows.map(m=>({m,v:measurementCalc(m)[key]})).filter(x=>Number.isFinite(x.v));
  if(!vals.length)return `<div class="empty">Ajoutez une première mesure pour afficher la courbe.</div>`;
  const W=330,H=185,p=28,ys=vals.map(x=>x.v),min=Math.min(...ys),max=Math.max(...ys),span=Math.max(1,max-min);
  const pts=vals.map((x,i)=>({x:p+i*((W-2*p)/Math.max(1,vals.length-1)),y:H-p-(x.v-min)/span*(H-2*p),v:x.v,date:x.m.date}));
  let path=`M ${pts[0].x} ${pts[0].y}`;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],mx=(a.x+b.x)/2;path+=` Q ${mx} ${a.y} ${mx} ${(a.y+b.y)/2} Q ${mx} ${b.y} ${b.x} ${b.y}`;}
  return `<svg class="measure-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><g class="chart-grid">${[0,1,2,3].map(i=>`<line x1="${p}" y1="${p+i*(H-2*p)/3}" x2="${W-p}" y2="${p+i*(H-2*p)/3}"/>`).join("")}</g><path class="measure-line" d="${path}"/>${pts.map(q=>`<circle class="chart-point measure-point" cx="${q.x}" cy="${q.y}" r="4.5"><title>${formatDate(q.date)} : ${round1(q.v)} ${unit}</title></circle><text class="chart-label" x="${q.x}" y="${q.y-9}" text-anchor="middle">${round1(q.v)}</text>`).join("")}</svg>`;
}
function renderMeasurements(){
  const all=measurementRows(),start=measurementRange(measurementPeriod),rows=start?all.filter(x=>String(x.date)>=start):all,last=all.at(-1),prev=all.at(-2),c=last?measurementCalc(last):null;
  const fmt=(v,s="")=>Number.isFinite(v)?`${round1(v)}${s}`:"—";
  return `${progressHomeTabs()}
    <div class="measure-head"><div><h2>Mesures corporelles</h2><span>${last?`Dernière mesure : ${formatDate(last.date)}`:"Aucune mesure enregistrée"}</span></div><button class="btn gold" id="add-measure">＋ Ajouter</button></div>
    <div class="measure-metrics">
      <div><span>Poids</span><b>${c?fmt(c.weight," kg"):"—"}</b><em>${last?measurementDelta(last,prev,"weight"):"—"} kg</em></div>
      <div><span>Masse grasse</span><b>${c?fmt(c.bf," %"):"—"}</b><em>${c?fmt(c.fatMass," kg"):"—"}</em></div>
      <div><span>Masse musculaire</span><b>${c?fmt(c.muscle," kg"):"—"}</b><em>${last?measurementDelta(last,prev,"muscle"):"—"} kg</em></div>
      <div><span>Tour de taille</span><b>${c?fmt(c.waist," cm"):"—"}</b><em>${last?measurementDelta(last,prev,"waist"):"—"} cm</em></div>
    </div>
    <div class="tabs measure-period-tabs">${[["month","Mois"],["year","Année"],["all","Tout"]].map(([p,l])=>`<button data-measure-period="${p}" class="${measurementPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    <div class="overview-section-head"><h2>Évolution du poids</h2><span>${measurementPeriod==="month"?"Ce mois":measurementPeriod==="year"?"Cette année":"Depuis la première mesure"}</span></div>
    <div class="overview-panel measure-chart">${smoothMeasureChart(rows,"weight")}</div>
    <div class="measure-calculated"><div><span>IMC</span><b>${c?fmt(c.bmi):"—"}</b></div><div><span>Masse grasse</span><b>${c?fmt(c.fatMass," kg"):"—"}</b></div><div><span>Masse maigre</span><b>${c?fmt(c.leanMass," kg"):"—"}</b></div></div>
    <details class="card body-measurements"><summary><span><b class="serif gold">Mensurations</b><small>Bras, cuisses, mollets, poitrine, épaules, taille, hanches</small></span><span class="body-measure-actions"><button type="button" class="body-measure-guide" id="body-measure-guide" aria-label="Ouvrir le guide des mensurations">Guide</button><span>Afficher</span></span></summary>${c?`<div class="body-measure-grid"><button data-body-chart="arm"><span>Bras</span><b>G ${fmt(c.armL," cm")} · D ${fmt(c.armR," cm")}</b></button><button data-body-chart="thigh"><span>Cuisses</span><b>G ${fmt(c.thighL," cm")} · D ${fmt(c.thighR," cm")}</b></button><button data-body-chart="calf"><span>Mollets</span><b>G ${fmt(c.calfL," cm")} · D ${fmt(c.calfR," cm")}</b></button><button data-body-chart="chest"><span>Poitrine</span><b>${fmt(c.chest," cm")}</b></button><button data-body-chart="shoulders"><span>Épaules</span><b>${fmt(c.shoulders," cm")}</b></button><button data-body-chart="hips"><span>Hanches</span><b>${fmt(c.hips," cm")}</b></button></div>`:`<div class="empty">Ajoutez une mesure pour renseigner vos mensurations.</div>`}</details>
    <div class="card measure-history"><div class="row-between"><b class="serif gold">Historique des mesures</b><button class="backlink" id="measure-height">Taille : ${esc(state.bodySettings?.heightCm||"—")} cm</button></div>${all.length?all.slice(-8).reverse().map(m=>`<button class="measure-row" data-edit-measure="${esc(m.id)}"><span>${formatDate(m.date)}</span><b>${esc(m.weight||"—")} kg</b><span>${esc(m.bodyFatPct||"—")} % MG</span><span>${esc(m.waistCm||"—")} cm</span></button>`).join(""):`<div class="empty">Aucune mesure enregistrée.</div>`}</div>`;
}
function openBodyMeasurementChart(kind){
  const map={arm:["Bras","armLeftCm","armRightCm"],thigh:["Cuisses","thighLeftCm","thighRightCm"],calf:["Mollets","calfLeftCm","calfRightCm"],chest:["Poitrine","chestCm"],shoulders:["Épaules","shouldersCm"],hips:["Hanches","hipsCm"]},cfg=map[kind];if(!cfg)return;
  const rows=measurementRows(),chart=key=>smoothMeasureChart(rows,key,"cm");
  const body=cfg.length===3?`<div class="body-chart-pair"><div><b>Gauche</b>${chart(cfg[1])}</div><div><b>Droite</b>${chart(cfg[2])}</div></div>`:chart(cfg[1]);
  openModal(`<h3>Évolution · ${cfg[0]}</h3><div class="overview-panel measure-chart">${body}</div><div class="modal-actions"><button class="btn gold" data-close-modal>Fermer</button></div>`);
}
function openMeasurementModal(id=""){
  const cur=id?(state.measurements||[]).find(x=>x.id===id):null,m=cur||{date:localISODate(),weight:"",bodyFatPct:"",muscleMassKg:"",waistCm:"",chestCm:"",shouldersCm:"",hipsCm:"",armLeftCm:"",armRightCm:"",thighLeftCm:"",thighRightCm:"",calfLeftCm:"",calfRightCm:""};
  openModal(`<h3>${cur?"Modifier":"Ajouter"} une mesure</h3><div class="field"><label>Date</label><input id="m-date" type="date" value="${esc(m.date)}"></div><div class="param-grid" style="margin-top:8px"><div class="field"><label>Poids (kg)</label><input id="m-weight" inputmode="decimal" value="${esc(m.weight)}"></div><div class="field"><label>Masse grasse (%)</label><input id="m-bf" inputmode="decimal" value="${esc(m.bodyFatPct)}"></div><div class="field"><label>Masse musculaire (kg)</label><input id="m-muscle" inputmode="decimal" value="${esc(m.muscleMassKg)}"></div><div class="field"><label>Tour de taille (cm)</label><input id="m-waist" inputmode="decimal" value="${esc(m.waistCm)}"></div></div><details class="modal-measure-details"><summary>Mensurations du corps <span>facultatif</span></summary><div class="param-grid"><div class="field"><label>Bras gauche (cm)</label><input id="m-arm-l" inputmode="decimal" value="${esc(m.armLeftCm)}"></div><div class="field"><label>Bras droit (cm)</label><input id="m-arm-r" inputmode="decimal" value="${esc(m.armRightCm)}"></div><div class="field"><label>Cuisse gauche (cm)</label><input id="m-thigh-l" inputmode="decimal" value="${esc(m.thighLeftCm)}"></div><div class="field"><label>Cuisse droite (cm)</label><input id="m-thigh-r" inputmode="decimal" value="${esc(m.thighRightCm)}"></div><div class="field"><label>Mollet gauche (cm)</label><input id="m-calf-l" inputmode="decimal" value="${esc(m.calfLeftCm)}"></div><div class="field"><label>Mollet droit (cm)</label><input id="m-calf-r" inputmode="decimal" value="${esc(m.calfRightCm)}"></div><div class="field"><label>Poitrine (cm)</label><input id="m-chest" inputmode="decimal" value="${esc(m.chestCm)}"></div><div class="field"><label>Épaules (cm)</label><input id="m-shoulders" inputmode="decimal" value="${esc(m.shouldersCm)}"></div><div class="field"><label>Hanches (cm)</label><input id="m-hips" inputmode="decimal" value="${esc(m.hipsCm)}"></div></div></details><div class="modal-actions">${cur?`<button class="btn ghost" id="delete-measure">Supprimer</button>`:`<button class="btn ghost" data-close-modal>Annuler</button>`}<button class="btn gold" id="save-measure">Enregistrer</button></div>`,()=>{
    $("#save-measure").onclick=()=>{const val=id=>$(id).value.trim(),next={id:cur?.id||`m-${Date.now()}`,date:$("#m-date").value||localISODate(),weight:val("#m-weight"),bodyFatPct:val("#m-bf"),muscleMassKg:val("#m-muscle"),waistCm:val("#m-waist"),armLeftCm:val("#m-arm-l"),armRightCm:val("#m-arm-r"),thighLeftCm:val("#m-thigh-l"),thighRightCm:val("#m-thigh-r"),calfLeftCm:val("#m-calf-l"),calfRightCm:val("#m-calf-r"),chestCm:val("#m-chest"),shouldersCm:val("#m-shoulders"),hipsCm:val("#m-hips")};if(cur)Object.assign(cur,next);else state.measurements.push(next);save();closeOverlay(true);render();};
    if(cur)$("#delete-measure").onclick=()=>{state.measurements=state.measurements.filter(x=>x.id!==cur.id);save();closeOverlay(true);render();};
  });
}
function openHeightModal(){openModal(`<h3>Taille</h3><p>Elle sert uniquement au calcul automatique de l’IMC.</p><div class="field"><label>Taille (cm)</label><input id="height-only" inputmode="decimal" value="${esc(state.bodySettings?.heightCm||"")}"></div><div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="save-height">Enregistrer</button></div>`,()=>{$("#save-height").onclick=()=>{state.bodySettings.heightCm=$("#height-only").value.trim();save();closeOverlay(true);render();};});}

function renderProgress(){
  if(progressionView==="history")progressionView="overview";
  const body=progressionView==="overview"?renderProgressOverview():progressionView==="measurements"?renderMeasurements():renderProgressPerformance();
  shell(`${header("Progression","Suivi des Performances","","compact")}${body}`,"progress-screen");
  $$('[data-prog-view]').forEach(b=>b.onclick=()=>{progressionView=b.dataset.progView;persistUI();history.pushState(navState(),"");render();});
  $$("[data-prog-period]").forEach(b=>b.onclick=()=>{progressionPeriod=b.dataset.progPeriod;persistUI();history.pushState(navState(),"");render();});
  $$('[data-overview-period]').forEach(b=>b.onclick=()=>{overviewPeriod=b.dataset.overviewPeriod;persistUI();history.pushState(navState(),"");render();});
  $$('[data-measure-period]').forEach(b=>b.onclick=()=>{measurementPeriod=b.dataset.measurePeriod;persistUI();history.replaceState(navState(),"");render();});
  if($("#add-measure"))$("#add-measure").onclick=()=>openMeasurementModal();
  $$('[data-edit-measure]').forEach(b=>b.onclick=()=>openMeasurementModal(b.dataset.editMeasure));
  if($("#measure-height"))$("#measure-height").onclick=openHeightModal;
  if($("#body-measure-guide"))$("#body-measure-guide").onclick=e=>{e.preventDefault();e.stopPropagation();openFullscreenSheet("./assets/guide/mensurations.jpg","Guide des mensurations");};
  $$('[data-body-chart]').forEach(b=>b.onclick=e=>{e.preventDefault();openBodyMeasurementChart(b.dataset.bodyChart);});
  $$('[data-ath-progress]').forEach(b=>b.onclick=()=>openAthProgressDetail(b.dataset.athProgress));
  if($("#ath-progress-toggle"))$("#ath-progress-toggle").onclick=()=>{
    athleticProgressExpanded=!athleticProgressExpanded;
    const section=$("#ath-progress-toggle").closest(".ath-progress-section");
    section?.classList.toggle("is-open",athleticProgressExpanded);
    $("#ath-progress-toggle").setAttribute("aria-expanded",athleticProgressExpanded?"true":"false");
    performanceMarkupCache.clear();
  };
  if($("#overview-period-picker"))$("#overview-period-picker").onclick=()=>openPeriodPicker("overview");
  if($("#overview-today"))$("#overview-today").onclick=()=>{periodAnchor=localISODate();persistUI();history.replaceState(navState(),"");render();};
  $$("[data-overview-week]").forEach(b=>{
    const selectWeek=()=>{periodAnchor=b.dataset.overviewWeek;persistUI();history.replaceState(navState(),"");render();};
    b.onclick=selectWeek;
    b.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();selectWeek();}};
  });
  $$("[data-prog-group]").forEach(b=>b.onclick=()=>{progressionGroup=b.dataset.progGroup;persistUI();history.replaceState(navState(),"");render();});
  $$("[data-progress-id]").forEach(r=>r.onclick=()=>pushNav({type:"progressDetail",id:r.dataset.progressId,sub:"evolution"}));
}
function averageIncrease(perf,ids){
  const vals=ids.map(id=>progressionChange(perf[id])?.percent).filter(Number.isFinite);
  return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
}
function progressRow(id,no,arr){
  const e=exercise(id),o=occurrenceList(id)[0]||{s:e.firstSession,n:e.firstNo},img=thumbnailFor(id,o.s,o.n),trend=trendFor(id,arr),last=arr.at(-1);
  return `<div class="progress-row" data-progress-id="${esc(id)}"><div class="num">${String(no).padStart(2,"0")}</div><div class="thumb"><img class="${thumbClass(img)}" loading="lazy" decoding="async" data-fallback src="${img||"./assets/hero-progress.jpg"}"></div>
    <div><div class="ex-name">${esc(e.name)}</div><div class="ex-sub">${esc(groupForId(id))}</div><b style="font-size:13px">${esc(last?refWithUnit(last.value):refWithUnit(referenceFor(id)))}</b>${last?`<div class="tiny muted">${Number.isFinite(repNumber(last.reps))?`${repNumber(last.reps)} reps · `:""}Dernière séance ${formatDate(last.date)}</div>`:""}</div>
    <div class="trend ${trend.key==="slow"?"slow":trend.key==="flat"?"flat":trend.key==="down"?"down":""}">${trend.key==="up"?"↗ ":trend.key==="down"?"↘ ":trend.key==="flat"?"→ ":""}${trend.label}</div></div>`;
}
function renderProgressDetail(id,sub="evolution"){
  const arr=allPerf()[id]||[],e=exercise(id),o=occurrenceList(id)[0]||{s:e.firstSession,n:e.firstNo};
  // L'historique complet reste disponible. Seule la nouvelle courbe repart de G1A du 21/09/2026.
  const filtered=filterPerf(arr,progressionPeriod);
  const curveRecords=arr.filter(x=>String(x.date||"")>=PERFORMANCE_CURVE_START);
  const curveComparison=comparableProgressSeries(curveRecords),curveAll=progressionCurvePoints(curveComparison);
  const curvePeriodStart=periodStart(progressionPeriod);
  const nums=curvePeriodStart?curveAll.filter(x=>x.x>=curvePeriodStart):curveAll;
  const curveFiltered=curvePeriodStart?curveRecords.filter(x=>x.date>=curvePeriodStart):curveRecords.slice();
  const change=progressionChange(curveFiltered),trend=trendFor(id,curveFiltered);
  const detailImg=sheetFor(id,o.s,o.n)||"./assets/hero-progress.jpg";
  shell(`<div class="detail-hero detail-sheet-hero" style="--detail-image:url('${detailImg}')"><button class="backlink" id="back-progress">${icon("arrowleft")} Progression</button><h1>${esc(e.name)}</h1><div class="small">${esc(groupForId(id))}</div><button class="star" data-open-detail-sheet="1">${icon("star")}</button></div>
    <div class="tabs">${["evolution","history","stats"].map((x,i)=>`<button data-detail-tab="${x}" class="${sub===x?"on":""}">${["Évolution","Historique","Statistiques"][i]}</button>`).join("")}</div>
    <div class="filter-row">${[["1m","1 mois"],["3m","3 mois"],["6m","6 mois"],["1y","1 an"],["all","Tous"]].map(([p,l])=>`<button data-detail-period="${p}" class="${progressionPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    ${sub==="evolution"?progressEvolutionContent(nums,change,trend,curveComparison.at(-1)?.kind):sub==="history"?progressHistoryContent(filtered):progressStatsContent(filtered)}
    <div class="card progress-settings-card"><div class="row-between"><b class="serif gold">Paramètres de progression</b><button class="backlink" id="edit-prog-settings">Modifier</button></div>${progressSettingsContent(id)}</div><div class="card"><div class="section-title">Records personnels</div>${personalRecordsContent(id)}</div>`,"progress-detail-screen");
  $("#back-progress").onclick=()=>history.back();
  $$("[data-detail-tab]").forEach(b=>b.onclick=()=>{view={type:"progressDetail",id,sub:b.dataset.detailTab};history.replaceState(navState(),"");render();});
  $$("[data-detail-period]").forEach(b=>b.onclick=()=>{progressionPeriod=b.dataset.detailPeriod;history.replaceState(navState(),"");render();});
  $("[data-open-detail-sheet]").onclick=()=>openSheet(id,o.s,o.n);
  $("#edit-prog-settings").onclick=()=>openProgressSettingsModal(id);
}
function filterPerf(arr,period){const st=periodStart(period);return st?arr.filter(x=>x.date>=st):arr.slice();}
function graphRepValue(record){
  const sets=Array.isArray(record?.setReps)?record.setReps.filter(Number.isFinite):[];
  if(sets.length)return Math.min(...sets);
  const reps=repNumber(record?.reps);
  return Number.isFinite(reps)?reps:null;
}
function graphRepsLabel(record){
  const sets=Array.isArray(record?.setReps)?record.setReps.filter(Number.isFinite):[];
  const reps=graphRepValue(record);
  if(reps==null)return '';
  return sets.length?`${sets.length}×${reps}`:`${reps} rep${reps>1?'s':''}`;
}
function currentLoadRepDelta(nums){
  if(nums.length<2)return null;
  const load=nums.at(-1).load??nums.at(-1).y;let first=nums.length-1;
  while(first>0&&(nums[first-1].load??nums[first-1].y)===load)first--;
  if(first===nums.length-1)return null;
  const a=graphRepValue(nums[first].raw),b=graphRepValue(nums.at(-1).raw);
  return Number.isFinite(a)&&Number.isFinite(b)?b-a:null;
}
function progressEvolutionContent(nums,change,trend,kind){
  const signed=n=>`${n>0?'+':''}${String(round1(n)).replace('.',',')}`;
  const firstLoad=nums[0]?.load??nums[0]?.y,lastLoad=nums.at(-1)?.load??nums.at(-1)?.y;
  const loadDelta=nums.length>1?round1(lastLoad-firstLoad):null;
  const loadLabel=loadDelta==null?'—':`${signed(loadDelta)}${kind==='plates'?' kg disques':' kg'}`;
  const repDelta=currentLoadRepDelta(nums);
  const repsLabel=repDelta==null?'—':`${signed(repDelta)} rép.`;
  return `<div class="chart">${lineChart(nums)}</div>${kind==='plates'?'<div class="tiny muted">Graphique : kg de disques uniquement, hors poids de la barre ou de la machine.</div>':''}<div class="tiny muted">La courbe combine la charge et les répétitions réalisées. À charge identique, davantage de répétitions fait progresser la courbe ; après une hausse de charge, le retour au bas de la plage de répétitions n’est pas compté comme une régression. Nouvelle base : G1A du 21/09/2026.</div><div class="metrics"><div class="metric"><b style="font-size:clamp(12px,3.2vw,20px)">${esc(loadLabel)}</b><span>Évolution charge</span></div><div class="metric"><b style="font-size:clamp(12px,3.2vw,20px)">${esc(repsLabel)}</b><span>Évolution répétitions</span></div><div class="metric"><b style="font-size:15px">${trend.label}</b><span>Tendance</span></div></div>${progressHistoryContent(nums.map(x=>x.raw).slice(-5))}`;
}
function progressHistoryContent(arr){
  return `<div class="card"><div class="section-title" style="margin:0 0 5px">Dernières séances</div>${arr.length?arr.slice().reverse().map(x=>`<div class="last-row"><span>${formatDate(x.date)}</span><b>${esc(refWithUnit(x.value))}</b><span>${esc(x.session)}</span><span>${esc(x.status)}</span></div>`).join(""):`<div class="empty">Pas encore de données.</div>`}</div>`;
}
function progressStatsContent(arr){
  const comparison=comparableProgressSeries(arr),vals=comparison.map(x=>x.weight),suffix=comparison.at(-1)?.kind==='plates'?' kg de disques (hors barre)':'';
  const best=vals.length?Math.max(...vals):null,avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  return `<div class="metrics"><div class="metric"><b>${arr.length}</b><span>Occurrences</span></div><div class="metric"><b>${best==null?"—":round1(best)}</b><span>Meilleure référence${suffix}</span></div><div class="metric"><b>${avg==null?"—":round1(avg)}</b><span>Moyenne${suffix}</span></div></div>`;
}
function lineChart(nums){
  if(nums.length<1)return`<div class="empty">Le graphique apparaîtra après les premières performances chiffrées.</div>`;
  const W=320,H=170,p=25,ys=nums.map(x=>x.y),min=Math.min(...ys),max=Math.max(...ys),span=Math.max(1,max-min);
  const pts=nums.map((x,i)=>({x:p+i*((W-2*p)/Math.max(1,nums.length-1)),y:H-p-(x.y-min)/span*(H-2*p),v:x.y,label:x.label??x.y,d:x.x,r:x.r||''}));
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><g class="chart-grid">${[0,1,2,3].map(i=>`<line x1="${p}" y1="${p+i*(H-2*p)/3}" x2="${W-p}" y2="${p+i*(H-2*p)/3}"/>`).join("")}</g>
    <polyline class="chart-line" points="${pts.map(q=>`${q.x},${q.y}`).join(" ")}"/>${pts.map(q=>`<circle class="chart-point" cx="${q.x}" cy="${q.y}" r="4"/><text class="chart-label" x="${q.x}" y="${q.y-8}" text-anchor="middle">${esc(round1(q.label))}</text>${q.r?`<text class="chart-rep-label" x="${q.x}" y="${q.y+14}" text-anchor="middle">${esc(q.r)}</text>`:''}`).join("")}</svg>`;
}
function comparableLoadKg(raw){
 // A dual-stack notation (e.g. "2 × 20 kg") must not be mistaken for a 2 kg lift.
 const m=String(raw??"").trim().replace(",",".").match(/^(\d+(?:\.\d+)?)\s*(?:kg)?$/i);
 return m?Number(m[1]):NaN;
}
function personalRecordsContent(id){
 const equipment=state.progressionSettings[id]?.equipment||"";
 const entries=(state.history||[]).flatMap(h=>(h.exercises||[])
   .filter(e=>canonicalId(e.id)===canonicalId(id)&&String(e.equipment||"")===equipment&&e.status==="Réussi")
   .map(e=>({date:h.date,weight:comparableLoadKg(e.actual),reps:Array.isArray(e.setReps)?Math.max(...e.setReps):repNumber(e.reps),sets:Array.isArray(e.setReps)?e.setReps:[]})));
 const valid=entries.filter(e=>Number.isFinite(e.weight)&&e.weight>0&&Number.isFinite(e.reps)&&e.reps>0);
 if(!valid.length)return '<div class="tiny muted">Les records apparaîtront après des performances réussies et comparables (même machine et charge en kg). Les progrès d’un objectif échoué restent visibles dans le suivi des séries.</div>';
 const heavy=valid.reduce((a,b)=>b.weight>a.weight?b:a);
 const reference=comparableLoadKg(referenceFor(id));
 const repWeight=Number.isFinite(reference)&&valid.some(e=>e.weight===reference)?reference:heavy.weight;
 const atWeight=valid.filter(e=>e.weight===repWeight),rep=atWeight.reduce((a,b)=>b.reps>a.reps?b:a);
 const volumes=valid.filter(e=>e.sets.length&&e.sets.every(r=>Number.isFinite(r)&&r>=0)).map(e=>({...e,volume:e.weight*e.sets.reduce((a,b)=>a+b,0)}));
 const volume=volumes.length?volumes.reduce((a,b)=>b.volume>a.volume?b:a):null;
 return `<div class="history-row">Charge maximale <b>${esc(refWithUnit(heavy.weight))} · ${esc(formatDate(heavy.date))}</b></div><div class="history-row">Répétitions à ${esc(refWithUnit(repWeight))} <b>${rep.reps} · ${esc(formatDate(rep.date))}</b></div><div class="history-row">Volume connu maximal <b>${volume?`${Math.round(volume.volume)} kg × reps · ${esc(formatDate(volume.date))}`:'Non disponible sans détail des séries'}</b></div>${equipment?`<div class="tiny muted">Machine : ${esc(equipment)}. Les séances sans machine identifiée ne sont pas mélangées.</div>`:''}`;
}

function progressSettingsContent(id){
  const p=Object.assign({type:"Charge + répétitions",objective:repetitionTargetFor(id)||"Libre"},state.progressionSettings[id]||{});
  return `<div class="history-row">Type de progression <span style="float:right">${esc(p.type)}</span></div><div class="history-row">Objectif actuel <span style="float:right">${esc(p.objective)}</span></div><div class="history-row">Incrément <span style="float:right">${esc(p.increment||2.5)} kg</span></div><div class="history-row">Équipement <span style="float:right">${esc(p.equipment||"Non précisé")}</span></div><div class="history-row">Référence prévue <span style="float:right">${esc(refWithUnit(referenceFor(id)))}</span></div>`;
}
function openProgressSettingsModal(id){
  const p=Object.assign({type:"Charge + répétitions",objective:repetitionTargetFor(id)||"Libre"},state.progressionSettings[id]||{});
  openModal(`<h3>Paramètres de progression</h3><div class="field"><label>Type</label><input id="ps-type" value="${esc(p.type)}"></div><div class="field" style="margin-top:6px"><label>Objectif</label><input id="ps-obj" value="${esc(p.objective)}"></div><div class="field"><label>Incrément de charge (kg)</label><input id="ps-increment" inputmode="decimal" type="number" min="0.1" step="any" value="${esc(p.increment||2.5)}"></div><div class="field"><label>Équipement / machine (facultatif)</label><input id="ps-equipment" value="${esc(p.equipment||"")}" placeholder="Ex. : machine convergente"></div><div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="ps-save">Enregistrer</button></div>`,()=>{
    $("#ps-save").onclick=()=>{state.progressionSettings[id]={type:$("#ps-type").value,objective:$("#ps-obj").value,increment:Math.max(.1,Number($("#ps-increment").value)||2.5),equipment:$("#ps-equipment").value.trim()};save();closeOverlay(true);render();};
  });
}

let historyVolumeMode="duration";
function historySessionRows(limit=5){
  const rows=[...(state.history||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,limit);
  return rows.map(h=>`<button class="history-session-row" data-history-session="${esc(h.id)}"><div><b>${esc(niceSession(h.session||"Séance"))}</b><span>${formatDate(h.date)}</span></div><div><b>${formatMinutes(+h.duration||0)}</b><span>${(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length} exercices</span></div><i>›</i></button>`).join("")||`<div class="empty">Aucune séance enregistrée.</div>`;
}
function openAllSessionHistory(){
  const rows=[...(state.history||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));let lastMonth="";
  const html=rows.map(h=>{const key=String(h.date).slice(0,7),d=new Date(`${key}-01T12:00:00`),head=key!==lastMonth?`<h4 class="session-month-title">${d.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}</h4>`:"";lastMonth=key;return `${head}<button class="history-session-row" data-history-session="${esc(h.id)}"><div><b>${esc(niceSession(h.session||"Séance"))}</b><span>${formatDate(h.date)}</span></div><div><b>${formatMinutes(+h.duration||0)}</b><span>${(h.exercises||[]).filter(e=>e.status!=="Non réalisé").length} exercices</span></div><i>›</i></button>`;}).join("")||`<div class="empty">Aucune séance enregistrée.</div>`;
  openModal(`<h3>Toutes les séances</h3><div class="all-session-history">${html}</div><div class="modal-actions"><button class="btn gold" data-close-modal>Fermer</button></div>`,()=>{$$("[data-history-session]").forEach(b=>b.onclick=()=>{const id=b.dataset.historySession;closeOverlay(true);pushNav({type:"historyDetail",id});});});
}
function historyIsCurrentPeriod(){
  if(historyPeriod==="all")return false;
  const today=new Date(),anchor=new Date(`${historyAnchor}T12:00:00`);
  if(!Number.isFinite(anchor.getTime()))return false;
  if(historyPeriod==="year")return historyYear===today.getFullYear();
  if(historyPeriod==="month")return anchor.getFullYear()===today.getFullYear()&&anchor.getMonth()===today.getMonth();
  return localISODate(mondayOf(anchor))===currentWeekKey();
}
function renderHistory(){
  const scoped=historyScope(historyPeriod,historyYear),hs=scoped.history,old=scoped.old;
  const total=hs.reduce((a,h)=>a+(+h.duration||0),0),count=hs.length+old.reduce((a,w)=>a+(+w.count||0),0);
  const weekDur=weeklyDurations(hs),weekCounts=weeklySessionCounts(hs,old),best=Math.max(...Object.values(weekDur),0),knownDurations=hs.map(h=>Number(h.duration)).filter(n=>Number.isFinite(n)&&n>0),avgSession=knownDurations.length?formatAverageSession(knownDurations):"—",attendance=attendancePct(historyYear,hs,old);
  shell(`${header("Historique","Suivi du parcours","","compact")}
    <div class="progress-home-tabs history-home-tabs">${[["week","Semaine"],["month","Mois"],["year","Année"],["all","Toutes"]].map(([p,l])=>`<button data-hperiod="${p}" class="${historyPeriod===p?"on":""}">${l}</button>`).join("")}</div>
    <div class="history-year"><button id="prev-year">‹</button><button class="history-period-title" id="history-period-picker">${esc(scoped.label)}</button><button id="next-year">›</button></div>${historyIsCurrentPeriod()?"":'<button class="today-period-btn" id="history-today">Aujourd’hui</button>'}
    <div class="history-grid">
      <div><b>${count}</b><span>Séances</span></div><div><b>${formatMinutes(total)}</b><span>Durée totale connue</span></div><div><b>${avgSession}</b><span>Durée moyenne / séance</span></div>
      <div><b>${attendance}%</b><span>Assiduité</span></div><div><b>${Object.values(weekCounts).filter(v=>v>=5).length}</b><span>Semaines ≥ 5 séances</span></div><div><b>${formatMinutes(best)}</b><span>Meilleure semaine</span></div>
    </div>
    ${trainingCalendar()}
    <div class="card"><div class="section-title" style="margin:0 0 4px">Résultats hebdomadaires</div>${weeklyResults()}</div>
    `,"history-screen");
  $$("[data-hperiod]").forEach(b=>b.onclick=()=>{historyPeriod=b.dataset.hperiod;persistUI();history.pushState(navState(),"");render();});
  $("#prev-year").onclick=()=>shiftHistory(-1);$("#next-year").onclick=()=>shiftHistory(1);
  $("#history-period-picker").onclick=()=>openPeriodPicker("history");
  if($("#history-today"))$("#history-today").onclick=()=>{historyAnchor=localISODate();historyYear=new Date().getFullYear();persistUI();history.replaceState(navState(),"");render();};
  bindTrainingCalendar();
}
function historyScope(period,year){
  const allH=state.history||[], allOld=state.oldWeeks||[];
  if(period==="all")return{history:allH.slice(),old:allOld.slice(),label:"Toutes les périodes"};
  const anchor=new Date(`${historyAnchor}T12:00:00`),selectedYear=period==="year"?year:anchor.getFullYear(),yh=historyForYear(selectedYear),yo=oldWeekEntries(selectedYear);
  if(period==="year")return{history:yh,old:yo,label:String(year)};
  const month=anchor.getMonth()+1, monthPrefix=`${selectedYear}-${String(month).padStart(2,"0")}`;
  if(period==="month")return{history:yh.filter(h=>String(h.date).startsWith(monthPrefix)),old:yo.filter(w=>String(w.week||w.date||"").startsWith(monthPrefix)),label:new Date(selectedYear,month-1,1).toLocaleDateString("fr-FR",{month:"long",year:"numeric"})};
  const target=localISODate(mondayOf(anchor));
  return{history:yh.filter(h=>localISODate(mondayOf(new Date(h.date+"T12:00:00")))===target),old:yo.filter(w=>String(w.week||w.date||"").slice(0,10)===target),label:`Semaine du ${formatDate(target)}`};
}
function shiftHistory(delta){
  if(historyPeriod==="all")return;const d=new Date(`${historyAnchor}T12:00:00`);
  if(historyPeriod==="week")d.setDate(d.getDate()+delta*7);else if(historyPeriod==="month")d.setMonth(d.getMonth()+delta);else d.setFullYear(d.getFullYear()+delta);
  historyAnchor=localISODate(d);historyYear=d.getFullYear();persistUI();history.replaceState(navState(),"");render();
}
// V24.25.6 : source ANNUELLE non filtrée. Les statistiques de l'en-tête
// et du calendrier continuent d'utiliser historyScope ; PAS ce bilan.
function weeklyResultsYear(){
  if(historyPeriod==="all")return new Date().getFullYear();
  if(historyPeriod==="year")return historyYear;
  const anchor=new Date(`${historyAnchor}T12:00:00`);
  return Number.isFinite(anchor.getTime())?anchor.getFullYear():new Date().getFullYear();
}
function annualWeeklyBuckets(year,now,historyEntries,legacyWeeks){
  const result=Array(8).fill(0),today=new Date(now);
  if(!Number.isInteger(year)||!Number.isFinite(today.getTime())||year>today.getFullYear())return result;
  const counts=new Map(),first=mondayOf(new Date(year,0,1)),last=mondayOf(year===today.getFullYear()?today:new Date(year,11,31));
  // Crée toutes les semaines écoulées de cette année, sans compter les futures.
  for(const day=new Date(first);day<=last;day.setDate(day.getDate()+7))counts.set(localISODate(day),0);
  // Part de TOUT l'historique et non des seules séances de la vue Semaine/Mois.
  (historyEntries||[]).forEach(h=>{
    const date=String(h?.date||"").slice(0,10);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number(date.slice(0,4))!==year)return;
    const week=weekKeyFromDate(date);
    if(counts.has(week))counts.set(week,counts.get(week)+1);
  });
  (legacyWeeks||[]).forEach(w=>{
    const date=String(w?.week||w?.date||"").slice(0,10),count=Number(w?.count);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number(date.slice(0,4))!==year||!Number.isFinite(count)||count<0)return;
    const week=weekKeyFromDate(date);
    if(counts.has(week))counts.set(week,counts.get(week)+count);
  });
  counts.forEach(count=>result[Math.min(7,Math.max(0,Math.floor(count)))]++);
  return result;
}
function weeklyResults(){
  const year=weeklyResultsYear();
  const buckets=annualWeeklyBuckets(year,new Date(),state.history,state.oldWeeks);
  buckets[0]=0; // Correctif ciblé : les semaines sans séance ne sont pas comptées dans 0/5.
  return `<div class="tiny muted" style="margin:0 0 12px">Bilan annuel ${year} · indépendant de Semaine / Mois · V24.25.6</div><div class="weekly-results">${buckets.map((n,i)=>`<div class="weekly-result ${i>=6?"over-goal":""}"><b>${i}/5</b><span>${n} semaine${n>1?"s":""}</span>${i===5?`<em>Objectif atteint</em>`:i===6?`<em>Objectif dépassé !</em>`:i===7?`<em>Exceptionnel !</em>`:""}</div>`).join("")}</div>`;
}
function historyForYear(y){return (state.history||[]).filter(h=>Number(String(h.date).slice(0,4))===+y);}
function oldWeekEntries(y){return (state.oldWeeks||[]).filter(w=>Number(String(w.week||w.date||"").slice(0,4))===+y);}
function weeklyDurations(hs){const m={};hs.forEach(h=>{const k=localISODate(mondayOf(new Date(h.date+"T12:00:00")));m[k]=(m[k]||0)+(+h.duration||0);});return m;}
function weeklySessionCounts(hs,old=[]){const m={};hs.forEach(h=>{const k=weekKeyFromDate(h.date);m[k]=(m[k]||0)+1;});old.forEach(w=>{const k=String(w.week||w.date||"").slice(0,10);m[k]=(m[k]||0)+(+w.count||0);});return m;}
function attendancePct(y,hs,old){
  const weeks={};
  hs.forEach(h=>{const k=localISODate(mondayOf(new Date(h.date+"T12:00:00")));weeks[k]=(weeks[k]||0)+1;});
  old.forEach(w=>{const k=w.week||w.date;weeks[k]=(weeks[k]||0)+(+w.count||0);});
  const keys=Object.keys(weeks);if(!keys.length)return 0;
  let got=0,target=0;keys.forEach(k=>{const oldItem=old.find(w=>(w.week||w.date)===k),t=oldItem?3:5;got+=Math.min(weeks[k],t);target+=t;});return Math.round(got/target*100);
}
function historyVolumeBuckets(hs,old){
  const anchor=new Date(`${historyAnchor}T12:00:00`),b=[];
  const add=(label,start,end)=>{const items=hs.filter(h=>h.date>=start&&h.date<end),duration=items.reduce((n,h)=>n+(+h.duration||0),0);let count=items.length;old.forEach(w=>{const d=String(w.week||w.date||"").slice(0,10);if(d>=start&&d<end)count+=+w.count||0;});b.push({label,duration,count,average:count?Math.round(duration/count):0});};
  if(historyPeriod==="week"){
    const st=mondayOf(anchor);["lun","mar","mer","jeu","ven","sam","dim"].forEach((label,i)=>{const a=new Date(st);a.setDate(a.getDate()+i);const z=new Date(a);z.setDate(z.getDate()+1);add(label,localISODate(a),localISODate(z));});
  }else if(historyPeriod==="month"){
    const first=new Date(anchor.getFullYear(),anchor.getMonth(),1),end=new Date(anchor.getFullYear(),anchor.getMonth()+1,1);let cur=mondayOf(first),i=1;while(cur<end){const nxt=new Date(cur);nxt.setDate(nxt.getDate()+7);add(`S${i++}`,localISODate(cur<first?first:cur),localISODate(nxt>end?end:nxt));cur=nxt;}
  }else if(historyPeriod==="year"){
    "J F M A M J J A S O N D".split(" ").forEach((label,i)=>add(label,localISODate(new Date(historyYear,i,1)),localISODate(new Date(historyYear,i+1,1))));
  }else{
    const years=[...new Set([...(state.history||[]).map(h=>+String(h.date).slice(0,4)),...(state.oldWeeks||[]).map(w=>+String(w.week||w.date||"").slice(0,4))].filter(Number.isFinite))].sort((a,b)=>a-b);
    (years.length?years:[new Date().getFullYear()]).forEach(y=>add(String(y),`${y}-01-01`,`${y+1}-01-01`));
  }return b;
}
function historyVolumeBars(hs,old,mode){
  const items=historyVolumeBuckets(hs,old),vals=items.map(x=>x[mode]||0),max=Math.max(1,...vals);
  const fmt=v=>mode==="count"?String(v):formatMinutes(v);
  return `<div class="history-volume-chart">${items.map((x,i)=>{const v=vals[i],pct=v?Math.max(7,Math.round(v/max*100)):0;return `<div class="history-volume-col"><span class="history-volume-value" style="bottom:calc(${pct}% + 4px)">${fmt(v)}</span><i style="height:${pct}%"></i><label>${esc(x.label)}</label></div>`}).join("")}</div>`;
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
    ${(h.exercises||[]).map((e,i)=>`<div class="history-row"><span class="gold">${String(i+1).padStart(2,"0")}</span> <b>${esc(e.name)}</b><span style="float:right">${esc(e.status)}</span><div class="tiny muted">${esc(refWithUnit(e.actual||"—"))}${Array.isArray(e.setReps)?` · séries : ${esc(e.setReps.join(" / "))}`:""}${e.next?` · prochaine : ${esc(refWithUnit(e.next))}`:""}</div></div>`).join("")||`<div class="empty">Cette séance ne contient pas de détail d’exercice exploitable.</div>`}</div>`);
  $("#back-hdetail").onclick=()=>history.back();
}

// Circuit preferences are indexed by SESSION + OCCURRENCE: changing G2C must not edit G1B.
function circuitKey(id,session,no){return 'circuit:'+session+':'+no+':'+id;}
function circuitSettings(id,session,no){
  const cfg=state.guideConfigs?.[circuitKey(id,session,no)]||{},base=defaultParams(id);
  return {key:circuitKey(id,session,no),cfg,params:{type:'circuit',duree:cfg.durationLabel||base.duree||'8 min',tours:String(cfg.toursLabel||base.tours||'1')},
    steps:Array.isArray(cfg.steps)&&cfg.steps.length&&cfg.steps.every(s=>s&&typeof s.name==='string')?clone(cfg.steps):circuitGuideSteps(id,session,no)};
}
function circuitSettingsMarkup(id,session,no){
  const {cfg,steps}=circuitSettings(id,session,no);
  return `<div class="circuit-tuning"><h3>Réglages par mouvement</h3><p class="tiny muted">Chaque valeur remplace l’objectif du circuit guidé. Les répétitions se valident manuellement.</p>
    ${steps.map((s,i)=>`<div class="circuit-tune-row"><label for="circuit-step-${i}">${i+1}. ${esc(s.name)} <span>${s.manual?'Répétitions':'Durée (secondes)'}</span></label><input id="circuit-step-${i}" data-circuit-value="${i}" type="number" inputmode="numeric" min="${s.manual?1:5}" max="${s.manual?500:3600}" value="${esc(s.manual?(s.repetitions||repNumber(s.target)||15):(s.seconds||45))}"></div>`).join('')}
    <div class="param-grid"><div class="field"><label>Repos entre tours (secondes)</label><input type="number" inputmode="numeric" min="0" max="600" data-circuit-round-rest value="${esc(cfg.roundRest??(id==='ex-circuit-abdos-intensif-8-min'?30:0))}"></div></div>
    <p class="tiny muted">Avec 1 tour, le circuit se répète jusqu’à la durée totale. Avec plusieurs tours, il se termine à la fin du nombre choisi.</p>
  </div>`;
}
function readCircuitSettings(overlay,id,session,no){
  const {key,cfg,steps}=circuitSettings(id,session,no);
  const rawDuration=$('[data-param="duree"]',overlay)?.value.trim().replace(',','.')||'';
  const durationMatch=rawDuration.match(/^(\d+(?:\.\d+)?)\s*(min(?:utes?)?|s(?:econdes?)?)?$/i);
  if(!durationMatch){alert('Durée totale : indiquez par exemple 8 min ou 480 s.');return null;}
  const targetSeconds=Math.round(Number(durationMatch[1])*(durationMatch[2]?.toLowerCase().startsWith('s')?1:60));
  const rounds=Number($('[data-param="tours"]',overlay)?.value);
  // The technical-sheet field was removed by request. Its existing timing is
  // retained and remains editable in the dedicated guided-workout controls.
  const rest=Number(cfg.rest??0),roundRest=Number($('[data-circuit-round-rest]',overlay)?.value);
  if(targetSeconds<30||targetSeconds>14400||!Number.isInteger(rounds)||rounds<1||rounds>30||![rest,roundRest].every(n=>Number.isInteger(n)&&n>=0&&n<=600)){
    alert('Durée : 30 s à 240 min ; tours : 1 à 30 ; repos : 0 à 600 s.');return null;
  }
  for(const input of $$('[data-circuit-value]',overlay)){
    const step=steps[Number(input.dataset.circuitValue)],value=Number(input.value);
    if(!Number.isInteger(value)||value<(step.manual?1:5)||value>(step.manual?500:3600)){
      alert('Vérifiez les répétitions (1–500) et les durées (5–3600 secondes).');return null;
    }
    const original=step.manual?(step.repetitions||repNumber(step.target)||15):(step.seconds||45);
    if(value===original)continue; // Do not replace an untouched range (e.g. 10 à 20) with its lower bound.
    if(step.manual){
      const suffix=/au total/i.test(step.target||'')?' au total':/par côté|de chaque côté/i.test(step.target||'')?' par côté':'';
      step.repetitions=value;step.target=value+' répétitions'+suffix;
    }else{
      const suffix=/côté droit/i.test(step.target||'')?' · côté droit':/côté gauche/i.test(step.target||'')?' · côté gauche':'';
      step.seconds=value;step.target=value+' secondes'+suffix;
    }
  }
  return {key,next:{...cfg,steps,rest,roundRest,rounds,loopToTarget:rounds===1,targetSeconds,durationLabel:rawDuration,toursLabel:String(rounds)}};
}
function openSheet(id,session,no){
  const e=exercise(id),img=sheetFor(id,session,no),p=isAbCircuit(id)?circuitSettings(id,session,no).params:defaultParams(id);
  const overlay=document.createElement("div");overlay.className="sheet-overlay";overlay.innerHTML=`<div class="sheet">
    <button class="sheet-close" data-close-sheet>Fermer</button>
    <div class="sheet-canvas fiche-visual">${img?`<img data-fallback src="${img}" alt="${esc(e.name)}">`:`<div class="empty" style="min-height:360px">Fiche technique non associée.</div>`}</div>
    <div class="sheet-params">${isAbCircuit(id)?`<button class="btn gold block sheet-guide-start" id="sheet-guide-start">${esc(guideEntryLabel(circuitKey(id,session,no)))}</button>`:''}<h3>Paramètres de l’exercice</h3>${repetitionTargetFor(id,session)?`<div class="rep-target-callout"><span>Répétitions cibles</span><b>${esc(repetitionTargetFor(id,session))}</b></div>`:""}<div class="param-grid">${paramInputs(p)}</div>${isAbCircuit(id)?circuitSettingsMarkup(id,session,no):''}<button class="btn gold block" id="save-params" style="margin-top:10px">Enregistrer</button></div>
  </div>`;
  overlayRoot.innerHTML="";overlayRoot.appendChild(overlay);history.pushState(Object.assign(navState(),{overlay:"sheet"}),"");
  $("[data-close-sheet]",overlay).onclick=()=>closeOverlay(true);
  const sheetCanvas=$(".fiche-visual",overlay);
  const sheetImg=$(".fiche-visual img",overlay);
  if(sheetImg){prepareSheetLayout(sheetImg,sheetCanvas);sheetCanvas.setAttribute("role","button");sheetCanvas.setAttribute("aria-label","Ouvrir l’image en plein écran");sheetCanvas.onclick=()=>openFullscreenSheet(sheetImg.src,e.name);}
  if(isAbCircuit(id))$("#sheet-guide-start",overlay).onclick=()=>openCircuitGuide(id,session,no);
  $("#save-params",overlay).onclick=()=>{
    if(isAbCircuit(id)){
      const result=readCircuitSettings(overlay,id,session,no);if(!result)return;
      if(pendingGuide()?.key===result.key){alert('Terminez le guidage en pause avant de changer les mouvements.');return;}
      state.guideConfigs=state.guideConfigs||{};state.guideConfigs[result.key]=result.next;
    }else{
      // Keep hidden legacy settings intact: removing a field from the form
      // must never delete unrelated saved values or guided-circuit timing.
      const next=clone(p);$$('[data-param]',overlay).forEach(i=>next[i.dataset.param]=p.type==='strength'&&i.dataset.param==='charge'?normalizeWeight(i.value):i.value.trim());state.params[id]=next;
      if(p.type==='strength'){
        if(next.charge)state.refs[id]=next.charge;else delete state.refs[id];
        setSharedProgress(id,{charge:next.charge,repetitions:next.repetitions});
      }
    }
    save();closeOverlay(true);render();
  };
}
function openFullscreenSheet(src,name){
  const ov=document.createElement("div");ov.className="fullscreen-sheet";
  ov.innerHTML=`<div class="fullscreen-toolbar"><span>${esc(name)}</span><button data-zoom-out aria-label="Réduire">−</button><button data-zoom-in aria-label="Agrandir">+</button><button data-zoom-close aria-label="Fermer">Fermer</button></div><div class="fullscreen-stage"><img src="${esc(src)}" alt="${esc(name)}" draggable="false"></div>`;
  document.body.appendChild(ov);
  // A dedicated history entry keeps Android Back inside Progression/Mensurations.
  history.pushState(Object.assign(navState(),{overlay:"fullscreen-sheet"}),"");
  const stage=$(".fullscreen-stage",ov),img=$("img",stage),points=new Map();
  let scale=1,tx=0,ty=0,gesture=null,lastTap=0,hadPinch=false;
  const close=()=>{ov.remove();document.removeEventListener('keydown',onKey);if(activeFullscreenSheetClose===close)activeFullscreenSheetClose=null;};
  activeFullscreenSheetClose=close;
  const requestClose=()=>{if(history.state?.overlay==='fullscreen-sheet')history.back();else close();};
  const onKey=e=>{if(e.key==='Escape'){e.preventDefault();requestClose();}};document.addEventListener('keydown',onKey);
  function apply(){
    const r=stage.getBoundingClientRect();
    const maxX=Math.max(0,(img.clientWidth*scale-r.width)/2),maxY=Math.max(0,(img.clientHeight*scale-r.height)/2);
    tx=Math.min(maxX,Math.max(-maxX,tx));ty=Math.min(maxY,Math.max(-maxY,ty));
    img.style.transform=`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(${scale})`;
  }
  function zoom(next,x,y){
    const r=stage.getBoundingClientRect(),newScale=Math.max(1,Math.min(5,next)),ratio=newScale/scale;
    tx=(tx-(x-r.left-r.width/2)) * ratio+(x-r.left-r.width/2);
    ty=(ty-(y-r.top-r.height/2)) * ratio+(y-r.top-r.height/2);
    scale=newScale;if(scale===1)tx=ty=0;apply();
  }
  $("[data-zoom-in]",ov).onclick=()=>{const r=stage.getBoundingClientRect();zoom(scale+.5,r.left+r.width/2,r.top+r.height/2);};
  $("[data-zoom-out]",ov).onclick=()=>{const r=stage.getBoundingClientRect();zoom(scale-.5,r.left+r.width/2,r.top+r.height/2);};
  $("[data-zoom-close]",ov).onclick=requestClose;
  stage.addEventListener('pointerdown',e=>{
    e.preventDefault();stage.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(points.size===1){gesture={type:'pan',x:e.clientX,y:e.clientY,tx,ty};hadPinch=false;}
    else if(points.size===2){const a=[...points.values()];gesture={type:'pinch',dist:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),scale};hadPinch=true;}
  },{passive:false});
  stage.addEventListener('pointermove',e=>{
    if(!points.has(e.pointerId))return;e.preventDefault();points.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(points.size>=2){const a=[...points.values()].slice(0,2),dist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
      if(gesture?.type!=='pinch')gesture={type:'pinch',dist,scale};
      zoom(gesture.scale*dist/Math.max(1,gesture.dist),(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2);
    }else if(scale>1&&gesture?.type==='pan'){
      tx=gesture.tx+e.clientX-gesture.x;ty=gesture.ty+e.clientY-gesture.y;apply();
    }
  },{passive:false});
  const end=e=>{
    if(!points.has(e.pointerId))return;
    const mayTap=points.size===1&&!hadPinch&&gesture?.type==='pan'&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<12;
    points.delete(e.pointerId);
    if(points.size===1){const a=[...points.values()][0];gesture={type:'pan',x:a.x,y:a.y,tx,ty};}
    else gesture=null;
    if(mayTap){const now=Date.now();if(now-lastTap<330){zoom(scale>1?1:2,e.clientX,e.clientY);lastTap=0;}else lastTap=now;}
  };
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  img.onload=apply;window.requestAnimationFrame(apply);
}

function bindSheetDoubleTapZoom(img,canvas){
  if(!img||!canvas)return;
  let scale=1,tx=0,ty=0,lastTap=0,panStart=null,pinchStart=null;
  const points=new Map();
  const clamp=()=>{const r=canvas.getBoundingClientRect(),w=img.clientWidth*scale,h=img.clientHeight*scale;tx=Math.min(0,Math.max(r.width-w,tx));ty=Math.min(0,Math.max(r.height-h,ty));};
  const apply=()=>{clamp();img.style.transformOrigin="0 0";img.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;canvas.classList.toggle("sheet-zoomed",scale>1.01);};
  const setScaleAt=(next,cx,cy)=>{const r=canvas.getBoundingClientRect(),x=cx-r.left,y=cy-r.top,old=scale;next=Math.max(1,Math.min(4,next));tx=x-(x-tx)*(next/old);ty=y-(y-ty)*(next/old);scale=next;if(scale<=1.01){scale=1;tx=ty=0;}apply();};
  img.addEventListener("dblclick",e=>{e.preventDefault();e.stopPropagation();setScaleAt(scale>1.01?1:2,e.clientX,e.clientY);});
  canvas.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse")return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture?.(e.pointerId);if(points.size===1&&scale>1.01)panStart={x:e.clientX,y:e.clientY,tx,ty};if(points.size===2){const a=[...points.values()],dx=a[1].x-a[0].x,dy=a[1].y-a[0].y;pinchStart={dist:Math.hypot(dx,dy),scale,midX:(a[0].x+a[1].x)/2,midY:(a[0].y+a[1].y)/2};panStart=null;}},{passive:false});
  canvas.addEventListener("pointermove",e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size>=2&&pinchStart){e.preventDefault();const a=[...points.values()].slice(0,2),dx=a[1].x-a[0].x,dy=a[1].y-a[0].y,dist=Math.max(1,Math.hypot(dx,dy)),mx=(a[0].x+a[1].x)/2,my=(a[0].y+a[1].y)/2;setScaleAt(pinchStart.scale*dist/pinchStart.dist,mx,my);}else if(points.size===1&&scale>1.01&&panStart){e.preventDefault();tx=panStart.tx+(e.clientX-panStart.x);ty=panStart.ty+(e.clientY-panStart.y);apply();}},{passive:false});
  const up=e=>{if(!points.has(e.pointerId))return;const wasSingle=points.size===1;points.delete(e.pointerId);if(points.size<2)pinchStart=null;if(points.size===1&&scale>1.01){const a=[...points.values()][0];panStart={x:a.x,y:a.y,tx,ty};}else panStart=null;if(wasSingle){const now=Date.now();if(now-lastTap<330){e.preventDefault();setScaleAt(scale>1.01?1:2,e.clientX,e.clientY);lastTap=0;}else lastTap=now;}};
  canvas.addEventListener("pointerup",up,{passive:false});canvas.addEventListener("pointercancel",up,{passive:false});
  // Android/WebView touch fallback: some devices do not deliver multi-touch pointer events reliably.
  let tStart=null,tPan=null,tLastTap=0;
  const touchPoint=t=>({x:t.clientX,y:t.clientY});
  canvas.addEventListener("touchstart",e=>{
    if(e.touches.length===2){e.preventDefault();const a=touchPoint(e.touches[0]),b=touchPoint(e.touches[1]);tStart={dist:Math.hypot(b.x-a.x,b.y-a.y),scale,midX:(a.x+b.x)/2,midY:(a.y+b.y)/2};tPan=null;}
    else if(e.touches.length===1&&scale>1.01){e.preventDefault();const a=touchPoint(e.touches[0]);tPan={x:a.x,y:a.y,tx,ty};}
  },{passive:false});
  canvas.addEventListener("touchmove",e=>{
    if(e.touches.length===2&&tStart){e.preventDefault();const a=touchPoint(e.touches[0]),b=touchPoint(e.touches[1]),dist=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;setScaleAt(tStart.scale*dist/tStart.dist,mx,my);}
    else if(e.touches.length===1&&scale>1.01&&tPan){e.preventDefault();const a=touchPoint(e.touches[0]);tx=tPan.tx+(a.x-tPan.x);ty=tPan.ty+(a.y-tPan.y);apply();}
  },{passive:false});
  canvas.addEventListener("touchend",e=>{
    if(e.touches.length===0){const now=Date.now(),c=e.changedTouches?.[0];if(c&&now-tLastTap<330){e.preventDefault();setScaleAt(scale>1.01?1:2,c.clientX,c.clientY);tLastTap=0;}else tLastTap=now;tStart=tPan=null;}
    else if(e.touches.length===1&&scale>1.01){const a=touchPoint(e.touches[0]);tPan={x:a.x,y:a.y,tx,ty};tStart=null;}
  },{passive:false});
}
function prepareSheetLayout(img,canvas){
  const apply=()=>{
    if(!img.naturalWidth||!img.naturalHeight)return;
    const path=decodeURIComponent(new URL(img.currentSrc||img.src,document.baseURI).pathname);
    const key=path.includes('/fiches/')?'fiches/'+path.split('/fiches/').pop():'';
    const layout=window.FITNESS_SHEET_LAYOUTS?.[key];
    const matches=layout&&layout.width===img.naturalWidth&&layout.height===img.naturalHeight;
    const cut=matches?layout.cutY:img.naturalHeight,left=matches?(layout.leftX||0):0;
    canvas.style.height='auto';canvas.style.aspectRatio=`${img.naturalWidth} / ${cut}`;
    canvas.classList.add('sheet-analyzed');canvas.classList.toggle('sheet-with-sidebar',left>0);
    const params=canvas.nextElementSibling;
    if(params){params.style.marginLeft=`${left/img.naturalWidth*100}%`;params.style.marginRight='0';}
    img.style.clipPath=left?`polygon(0 0,100% 0,100% ${cut/img.naturalHeight*100}%,${left/img.naturalWidth*100}% ${cut/img.naturalHeight*100}%,${left/img.naturalWidth*100}% ${layout.sidebarBottom/img.naturalHeight*100}%,0 ${layout.sidebarBottom/img.naturalHeight*100}%)`:'';
  };
  if(img.complete&&img.naturalWidth)apply();else img.addEventListener("load",apply,{once:true});
}
function paramInputs(p){
  const labels={series:"Séries",repetitions:"Répétitions",charge:"Charge / référence",reposSeries:"Repos entre séries",tours:"Tours",normal:"Gainage normal",gauche:"Latéral gauche",droite:"Latéral droit",repos:"Repos",duree:"Durée totale"};
  return Object.entries(p).filter(([k])=>k!=="type"&&k!=="reposExercices").map(([k,v])=>`<div class="field"><label>${esc(labels[k]||k)}</label><input data-param="${esc(k)}" value="${esc(v)}"></div>`).join("");
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
function periodLabel(period,anchor){
  const d=new Date(`${anchor}T12:00:00`);
  if(period==="week")return `Semaine du ${formatDate(localISODate(mondayOf(d)))}`;
  if(period==="month")return d.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
  return String(d.getFullYear());
}
function openOverviewMonthPicker(){
  let year=Number(periodAnchor.slice(0,4))||new Date().getFullYear();
  const monthNames=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  openModal('<h3>Choisir un mois</h3><div id="overview-month-picker-body"></div><div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button></div>',modal=>{
    const body=$('#overview-month-picker-body',modal);
    function draw(){
      body.innerHTML=`<div class="overview-month-year"><button type="button" data-overview-year="-1" aria-label="Année précédente">‹</button><b>${year}</b><button type="button" data-overview-year="1" aria-label="Année suivante">›</button></div><div class="overview-month-grid">${monthNames.map((name,i)=>{
        const key=year+'-'+String(i+1).padStart(2,'0');
        const count=(state.history||[]).filter(h=>String(h.date||'').startsWith(key)).length;
        const selected=periodAnchor.slice(0,7)===key;
        return `<button type="button" data-overview-month="${i+1}" class="overview-month-tile ${selected?'selected':''}" aria-label="Afficher ${name} ${year}"><b>${name}</b><span>${count?count+' séance'+(count>1?'s':''):'Aucune séance'}</span></button>`;
      }).join('')}</div>`;
      $$('[data-overview-year]',body).forEach(button=>button.onclick=()=>{year+=Number(button.dataset.overviewYear);draw();});
      $$('[data-overview-month]',body).forEach(button=>button.onclick=()=>{
        periodAnchor=year+'-'+String(button.dataset.overviewMonth).padStart(2,'0')+'-01';
        overviewPeriod='month';persistUI();closeOverlay(false);
        // Replace the modal history entry with this selected month. Android Back
        // can still return to the prior overview without reverting this selection.
        history.replaceState(navState(),'');render();
      });
    }
    draw();
  });
}
function openPeriodPicker(target){
  const period=target==="history"?historyPeriod:overviewPeriod;
  if(target==='overview'&&period==='month'){openOverviewMonthPicker();return;}
  const anchor=target==="history"?historyAnchor:periodAnchor;
  if(period==="all"){historyPeriod="year";historyYear=new Date().getFullYear();historyAnchor=localISODate();persistUI();render();return;}
  const d=new Date(`${anchor}T12:00:00`),type=period==="month"?"month":period==="year"?"number":"date";
  const value=period==="month"?anchor.slice(0,7):period==="year"?String(d.getFullYear()):anchor;
  openModal(`<h3>Choisir ${period==="week"?"une semaine":period==="month"?"un mois":"une année"}</h3><div class="field"><label>Période</label><input id="period-choice" type="${type}" ${type==="number"?'min="2000" max="2100"':''} value="${esc(value)}"></div><div class="modal-actions"><button class="btn ghost" data-close-modal>Annuler</button><button class="btn gold" id="period-confirm">Afficher</button></div>`,()=>{
    $("#period-confirm").onclick=()=>{const raw=$("#period-choice").value;if(!raw)return;let next=raw;if(type==="month")next=`${raw}-01`;if(type==="number")next=`${raw}-01-01`;if(target==="history"){historyAnchor=next;historyYear=+next.slice(0,4);}else periodAnchor=next;persistUI();closeOverlay(false);history.replaceState(navState(),"");render();};
  });
}
function formatDate(iso){if(!iso)return"—";const d=new Date(iso+"T12:00:00");return d.toLocaleDateString("fr-FR");}
function formatMinutes(min){min=Math.max(0,Math.round(+min||0));return `${Math.floor(min/60)} h ${String(min%60).padStart(2,"0")}`;}
function formatAverageSession(knownMinutes){
 const seconds=Math.round(knownMinutes.reduce((total,n)=>total+n,0)*60/knownMinutes.length);
 const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),sec=seconds%60;
 return `${h?`${h} h `:""}${String(m).padStart(h?2:1,"0")} min${sec?` ${String(sec).padStart(2,"0")} s`:""}`;
}
function round1(v){return Math.round(v*10)/10;}

// V24.18.5 — Guidance is exclusive to ATH A/B and the circuit exercises.
// Store only the paused in-progress guide separately from training history.
const GUIDE_DRAFT_KEY='fitness-guide-pause-v24185';
let activeGuideClose=null;
function pendingGuide(){
 try{const d=JSON.parse(localStorage.getItem(GUIDE_DRAFT_KEY)||'null');return d&&d.started&&!d.finished&&Array.isArray(d.steps)&&d.steps.length?d:null;}catch{return null;}
}
function guideEntryLabel(key){return pendingGuide()?.key===key?'Reprendre la séance guidée':'Démarrer la séance guidée';}
function refreshGuideEntrypoints(){
 $$('[data-circuit-guide]').forEach(b=>{b.textContent=guideEntryLabel('circuit:'+b.dataset.session+':'+b.dataset.no+':'+b.dataset.circuitGuide);});
 $$('[data-program-circuit]').forEach(b=>{b.textContent=guideEntryLabel('circuit:'+view.session+':'+b.dataset.no+':'+b.dataset.programCircuit);});
 if($('#program-ath-guide')&&view.session)$('#program-ath-guide').textContent=guideEntryLabel('ath:'+view.session);
 if($('#ath-guide')&&state.today)$('#ath-guide').textContent=guideEntryLabel('ath:'+state.today.session);
}
function voiceGuide(text,enabled,onDone,options={}){
 if(!enabled||!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){onDone?.();return false;}
 try{
   if(options.interrupt!==false)speechSynthesis.cancel();
   const utterance=new SpeechSynthesisUtterance(text);utterance.lang='fr-FR';utterance.rate=.93;
   let resolved=false;const finish=()=>{if(!resolved){resolved=true;onDone?.();}};
   utterance.onend=finish;utterance.onerror=finish;
   if(options.onStart)utterance.onstart=options.onStart;
   speechSynthesis.speak(utterance);return true;
 }catch(e){console.warn('Coach vocal indisponible',e);onDone?.();return false;}
}
function stopVoiceGuide(){try{if('speechSynthesis' in window)speechSynthesis.cancel();}catch{}}
const CIRCUIT_FULL=[
 {name:'Crunch classique',target:'10 à 20 répétitions',manual:true},
 {name:'Ciseaux',target:'20 à 40 secondes',seconds:30},
 {name:'Relevé de jambes',target:'10 à 20 répétitions',manual:true},
 {name:'Planche',target:'30 à 60 secondes',seconds:45},
 {name:'Toucher talons',target:'15 à 25 répétitions',manual:true},
 {name:'Crunch inversé',target:'10 à 15 répétitions',manual:true},
 {name:'Gainage latéral — côté droit',target:'30 à 45 secondes · côté droit',seconds:40,ficheNo:7},
 {name:'Gainage latéral — côté gauche',target:'30 à 45 secondes · côté gauche',seconds:40,ficheNo:7},
 {name:'Mountain climbers',target:'30 à 60 secondes',seconds:45,ficheNo:8}
];
const CIRCUIT_INTENSIVE=[
 {name:'V-ups',target:'15 répétitions',manual:true},
 {name:'Sit-ups explosifs',target:'15 répétitions',manual:true},
 {name:'Mountain climbers croisés',target:'30 répétitions au total',manual:true},
 {name:'Relevés de jambes tendues au sol',target:'15 répétitions',manual:true},
 {name:'Russian twists',target:'20 répétitions au total',manual:true}
];
function circuitGuideSteps(id,session,no){
 const intensive=id==='ex-circuit-abdos-intensif-8-min';
 const sheetSession=intensive?'FM2':(['G1B','G2C','G3A','G3B'].includes(session)?session:(id==='ex-circuit-abdos-8-min'?'G1B':'G3B'));
 const raw=(intensive?CIRCUIT_INTENSIVE:CIRCUIT_FULL).map(x=>({...x}));
 if(sheetSession==='G3A'){
   raw[5]={name:'Rouleau abdominal',target:'10 à 15 répétitions',manual:true};
 }
 return raw.map((x,i)=>({...x,ficheNo:x.ficheNo||i+1,preview:`assets/guide/${sheetSession}-${String(x.ficheNo||i+1).padStart(2,'0')}.jpg`}));
}
function openCircuitGuide(id,session,no){
 if(!['ex-circuit-abdos-8-min','ex-circuit-abdos-complet-8-min','ex-circuit-abdos-intensif-8-min'].includes(id))return;
 const intensive=id==='ex-circuit-abdos-intensif-8-min';
 const key='circuit:'+session+':'+no+':'+id;
 const cfg=state.guideConfigs?.[key]||{};
 const steps=circuitSettings(id,session,no).steps;
 const title=(intensive?'Circuit Abdos Intensif — 8 min':exercise(id).name).replace(/8\s*min/i,cfg.durationLabel||'8 min');
 const rounds=Number(cfg.rounds)||1;
 guideScreen(title,steps,{key,source:'circuit',editable:true,session,no,id,rest:cfg.rest??0,roundRest:cfg.roundRest??(intensive?30:0),rounds,loopToTarget:rounds===1,targetSeconds:cfg.targetSeconds||athDurationSeconds(cfg.durationLabel)||480,voice:cfg.voice!==false,fullSheet:sheetFor(id,session,no)});
}
function athDurationSeconds(value){
 const m=String(value||'').toLowerCase().match(/(\d+)\s*(min|minute|s|sec|seconde)/);
 return m?Number(m[1])*(m[2].startsWith('min')?60:1):null;
}
function openAthGuide(session){
 const key='ath:'+session,cfg=state.guideConfigs?.[key]||{},steps=[];
 for(const [itemIndex,item] of (DATA.ath?.[session]||[]).entries()){
   const c=athStepConfig(session,itemIndex),duration=c.durationSeconds;
   const properties=(item.fields||[]).filter(f=>f!=='Durée'&&!/\d+\s*s.*\d+\s*s/i.test(f)).filter(f=>c.saved[f]).map(f=>f+' : '+c.saved[f]);
   const details=properties.length?' · '+properties.join(' · '):'';
   const timeCue=session==='ATHLÉTIQUE A'?itemIndex<4:session==='ATHLÉTIQUE B'&&itemIndex<2;
   const cueProps=timeCue?{athTimeCue:true,athTimeBlock:itemIndex+1}:{};
   if(c.interval&&duration){
     let elapsed=0,n=1;
     while(elapsed<duration){
       const work=Math.min(c.effortSeconds,duration-elapsed);
       steps.push({name:item.name+' · effort '+n,target:work+' secondes'+details,seconds:work,ficheNo:itemIndex+1,intervalBlock:itemIndex+1,recovery:false,...cueProps});elapsed+=work;
       if(elapsed<duration){const rec=Math.min(c.recoverySeconds,duration-elapsed);steps.push({name:item.name+' · récupération '+n,target:rec+' secondes',seconds:rec,recovery:true,ficheNo:itemIndex+1,intervalBlock:itemIndex+1,...cueProps});elapsed+=rec;}
       n++;
     }
   }else if(c.isRemaining&&!c.durationSeconds){
     steps.push({name:item.name,target:'Temps restant pour atteindre 60 min'+details,remainingTo60:true,ficheNo:itemIndex+1,...cueProps});
   }else if(duration){steps.push({name:item.name,target:athStepDurationText(session,itemIndex)+details,seconds:duration,ficheNo:itemIndex+1,...cueProps});}
   else if(/sled push/i.test(item.name)&&Number.isInteger(Number(c.saved.Passages))&&Number(c.saved.Passages)>0&&Number(c.saved.Passages)<=60){
     const passages=Number(c.saved.Passages),recovery=Number(c.saved['Récupération'])||0;
     for(let p=1;p<=passages;p++){
       steps.push({name:item.name+' · passage '+p+'/'+passages,target:'Validez le passage'+details,manual:true,ficheNo:itemIndex+1,...cueProps});
       if(p<passages&&recovery>0)steps.push({name:item.name+' · récupération',target:recovery+' secondes',seconds:recovery,recovery:true,ficheNo:itemIndex+1,...cueProps});
     }
   }else{steps.push({name:item.name,target:item.duration+details,manual:true,ficheNo:itemIndex+1,...cueProps});}
 }
 if(!steps.length)return;
 guideScreen(niceSession(session),steps,{key,source:'ath',session,editable:false,rest:cfg.rest??0,roundRest:0,rounds:1,voice:cfg.voice!==false});
}
// Pure milestone decision: testable without Android speech or a live timer.
function athMinuteCue(step,model,phase,elapsedPrev,elapsedNow,previousRemaining,remaining,spoken){
  if(!step?.athTimeCue||model.source!=='ath'||
     !(phase==='work'||phase==='rest'&&step.recovery)||
     model.athCueBlock!==step.athTimeBlock)return '';
  const secs=Number(step.seconds);
  const timed=phase==='work'&&!step.manual&&Number.isFinite(secs)&&secs>0;
  let key='',text='';
  if(timed&&previousRemaining>60&&remaining<=60&&remaining>0){key='ath-rem-60';text="Plus qu'une minute";}
  else if(timed&&previousRemaining>300&&remaining<=300&&remaining>0){key='ath-rem-300';text='Plus que 5 minutes';}
  else{
    const milestone=Math.floor(elapsedNow/300);
    if(milestone>0&&elapsedPrev<milestone*300&&elapsedNow>=milestone*300&&
       (!timed||remaining>0)){
      key='ath-elapsed-'+milestone;text=milestone*5+' minutes écoulées';
    }
  }
  if(!key||spoken.has(key))return '';
  spoken.add(key);return text;
}
function guideScreen(title,providedSteps,options={}){
 if(activeGuideClose)activeGuideClose();
 const key=options.key||'';
 let draft=pendingGuide();
 if(draft&&draft.key!==key){
   if(!confirm('Une autre séance guidée est en pause. L’abandonner pour ouvrir celle-ci ?'))return;
   localStorage.removeItem(GUIDE_DRAFT_KEY);draft=null;
 }
 const isResume=!!draft&&draft.key===key;
 const model=isResume?draft:{key,title,steps:providedSteps.map(x=>({...x})),index:0,round:1,rounds:options.rounds||1,rest:options.rest??0,roundRest:options.roundRest??0,loopToTarget:!!options.loopToTarget,targetSeconds:options.targetSeconds||0,voice:options.voice!==false,source:options.source||'',phase:'ready',remaining:0,elapsed:0,manualElapsed:0,started:false,paused:false,finished:false};
 model.title=title;
 // Never replace an active draft's timing: only fresh guides read newly saved settings.
 if(model.source==='circuit'&&!isResume){model.rounds=options.rounds||1;model.loopToTarget=model.rounds===1;model.targetSeconds=options.targetSeconds||480;}
 // Preserve paused ATH B sessions created before continuous-interval metadata existed.
 if(isResume&&model.source==='ath'&&model.steps.length===providedSteps.length){model.steps=model.steps.map((step,i)=>({...providedSteps[i],...step,intervalBlock:providedSteps[i].intervalBlock,recovery:providedSteps[i].recovery,athTimeCue:providedSteps[i].athTimeCue,athTimeBlock:providedSteps[i].athTimeBlock}));}
 if(isResume)model.paused=true; // Closing the window never silently restarts the workout.
 if(isResume&&model.source==='ath'&&model.steps[model.index]?.athTimeCue&&model.athCueBlock==null){
   const active=model.steps[model.index];
   model.athCueBlock=active.athTimeBlock;
   const inStep=active.manual?model.manualElapsed:Math.max(0,(Number(active.seconds)||0)-model.remaining);
   model.athCueStartElapsed=Math.max(0,model.elapsed-inStep);
 }
 let ticker=null,lastTick=0,deadline=0,editing=false,savingTick=-1,prepToken=0,prepStarted=false,prepLength=3,previousCountdown=0,announcedCues=new Set();
 const ov=document.createElement('div');ov.className='v2418-guide';
 ov.innerHTML=`<div class="v2418-guide-card" role="dialog" aria-modal="true" aria-label="${esc(title)}">
   <div class="guide-heading"><div><div class="guide-eyebrow">SÉANCE GUIDÉE</div><h2>${esc(title)}</h2></div><button class="btn guide-close" id="guide-close">Fermer</button></div>
   <div class="guide-active" id="guide-active"><div class="guide-eyebrow" id="guide-step-counter"></div><h3 id="guide-step-name" aria-live="polite"></h3><div class="guide-target" id="guide-step-target"></div><img id="guide-step-visual" class="guide-visual" alt="Aperçu du mouvement indiqué sur la fiche" loading="eager"></div>
   <div class="guide-time"><div class="guide-eyebrow" id="guide-phase"></div><div id="guide-clock" class="v2418-guide-clock">00:00</div><div class="guide-elapsed"><span>Temps écoulé</span><strong id="guide-elapsed-value">00:00</strong><span id="guide-elapsed-goal"></span></div><div class="guide-next" id="guide-next"></div></div>
   <div class="guide-config" id="guide-config"><div class="param-grid"><div class="field"><label>Repos entre exercices (s)</label><input id="guide-rest" type="number" inputmode="numeric" min="0" max="600" value="${model.rest}"></div><div class="field"><label>Repos entre tours (s)</label><input id="guide-round-rest" type="number" inputmode="numeric" min="0" max="600" value="${model.roundRest}"></div>${model.source==='ath'?'<div class="field"><label>Tours</label><input id="guide-rounds" type="number" inputmode="numeric" min="1" max="30" value="1" disabled></div>':`<div class="guide-auto-rounds">${model.loopToTarget?'Tours automatiques · objectif '+Math.round(model.targetSeconds/60)+' min':model.rounds+' tours programmés'}</div>`}</div>
   ${model.source==='circuit'?`<p class="guide-loop-label">${model.loopToTarget?'Un nouveau tour commence si la durée cible n’est pas atteinte.':'Le guidage s’arrête après les '+model.rounds+' tours définis.'} Les paramètres des mouvements se règlent depuis leur fiche avant le démarrage.</p>`:''}
   <label class="guide-check"><input id="guide-voice" type="checkbox" ${model.voice?'checked':''}> Coach vocal français</label></div>
   <p id="guide-status" class="guide-status" role="status"></p>
   <details id="guide-details" class="guide-details"><summary>Voir le déroulement <span>${model.steps.length} mouvements</span></summary><div class="guide-list-heading"><h3>Déroulement</h3>${options.editable?'<button class="btn guide-edit-btn" id="guide-edit" type="button">Modifier</button>':''}</div><div id="guide-list" class="guide-list"></div></details>
   <div class="v2418-guide-actions" role="group" aria-label="Commandes de séance"><button type="button" class="btn gold" id="guide-start">${isResume?'Reprendre':'Démarrer'}</button><button type="button" class="btn" id="guide-done" disabled>Exercice suivant</button><button type="button" class="btn guide-abandon" id="guide-abandon">Terminer définitivement</button></div>
   <p class="tiny muted guide-footnote">Le démarrage est manuel. Les exercices en répétitions passent au suivant uniquement après validation. En fermant cette fenêtre, la séance reste en pause et peut être reprise. La voix peut être interrompue si Android verrouille l’écran.</p>
  </div>`;
 document.body.appendChild(ov);
 history.pushState(Object.assign(navState(),{overlay:'guided-workout'}),'');
 const el=id=>document.getElementById(id),start=el('guide-start'),done=el('guide-done'),list=el('guide-list');
 function persist(){if(model.started&&!model.finished)localStorage.setItem(GUIDE_DRAFT_KEY,JSON.stringify({...model,paused:true}));}
 function storeConfig(){
  state.guideConfigs=state.guideConfigs||{};
  state.guideConfigs[key]={...state.guideConfigs[key],steps:model.steps.map(s=>({...s})),rest:model.rest,roundRest:model.roundRest,rounds:model.rounds,loopToTarget:model.loopToTarget,targetSeconds:model.targetSeconds,voice:model.voice};save();
 }
 function stopTicker(){if(ticker)clearInterval(ticker);ticker=null;lastTick=0;}
 function close(goBack=false){
  if(!ov.isConnected)return;
  if(model.started&&!model.finished){freeze();persist();}
  stopTicker();stopVoiceGuide();ov.remove();document.removeEventListener('keydown',onKey);if(activeGuideClose===closeFromBack)activeGuideClose=null;refreshGuideEntrypoints();
  if(goBack&&history.state?.overlay==='guided-workout')history.back();
 }
 const closeFromBack=()=>close(false);activeGuideClose=closeFromBack;
 const onKey=e=>{if(e.key==='Escape')close(true);};document.addEventListener('keydown',onKey);
 el('guide-close').onclick=()=>close(true);
 function timeText(value){const n=Math.max(0,Math.floor(value||0));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
 function nextStep(){if(model.index+1<model.steps.length)return model.steps[model.index+1];if(model.loopToTarget&&model.elapsed<model.targetSeconds||model.round<model.rounds)return model.steps[0];return null;}
 function renderList(){
  list.innerHTML=model.steps.map((s,i)=>`<div class="guide-list-item ${i===model.index?'active':''} ${i<model.index?'past':''}" data-guide-row="${i}">
    <span class="guide-list-no">${i+1}</span><div class="guide-list-text">${editing?`<input class="guide-name-input" aria-label="Nom du mouvement ${i+1}" data-guide-name="${i}" value="${esc(s.name)}"><input aria-label="Objectif du mouvement ${i+1}" data-guide-target="${i}" value="${esc(s.target||'')}">${!s.manual?`<label class="tiny">Durée (s) <input aria-label="Durée ${i+1}" data-guide-seconds="${i}" type="number" min="5" max="3600" value="${s.seconds||45}"></label>`:''}`:`<b>${esc(s.name)}</b><small>${esc(s.target||'')}</small>`}</div>
    ${editing?`<div class="guide-move-actions"><button class="btn" data-guide-up="${i}" aria-label="Monter ${esc(s.name)}" ${i===0?'disabled':''}>↑</button><button class="btn" data-guide-down="${i}" aria-label="Descendre ${esc(s.name)}" ${i===model.steps.length-1?'disabled':''}>↓</button></div>`:(i===model.index?'<span class="guide-current-mark">EN COURS</span>':'')}
   </div>`).join('');
  if(editing){
   function updateRow(i){const s=model.steps[i];const name=$(`[data-guide-name="${i}"]`,list),target=$(`[data-guide-target="${i}"]`,list),seconds=$(`[data-guide-seconds="${i}"]`,list);if(name)s.name=name.value.slice(0,100);if(target)s.target=target.value.slice(0,90);if(seconds){const n=Number(seconds.value);if(Number.isInteger(n)&&n>=5&&n<=3600)s.seconds=n;}}
   $$('[data-guide-name],[data-guide-target],[data-guide-seconds]',list).forEach(input=>input.onchange=()=>{updateRow(Number(input.dataset.guideName??input.dataset.guideTarget??input.dataset.guideSeconds));renderActive();});
   $$('[data-guide-up],[data-guide-down]',list).forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.guideUp??btn.dataset.guideDown),next=btn.dataset.guideUp!==undefined?i-1:i+1;model.steps.forEach((s,j)=>updateRow(j));[model.steps[i],model.steps[next]]=[model.steps[next],model.steps[i]];renderList();renderActive();});
  }
 }
 function renderActive(){
  const step=model.steps[model.index];if(!step)return;
  el('guide-step-counter').textContent=`MOUVEMENT ${model.index+1}/${model.steps.length} · TOUR ${model.round}${model.loopToTarget?' · OBJECTIF '+timeText(model.targetSeconds):'/'+model.rounds}`;
  el('guide-step-name').textContent=step.name;
  el('guide-step-target').textContent=step.target|| (step.manual?'Validez à la fin des répétitions':'');
  const preview=el('guide-step-visual');if(step.preview){const src=pathUrl(step.preview);if(preview.dataset.current!==src){preview.src=src;preview.dataset.current=src;}preview.hidden=false;}else{preview.removeAttribute('src');preview.dataset.current='';preview.hidden=true;}
  const next=nextStep();el('guide-next').textContent=next?'À suivre : '+next.name+(next.target?' · '+next.target:''):'Dernier mouvement du circuit';
  el('guide-phase').textContent=model.finished?'SÉANCE TERMINÉE':model.paused?'EN PAUSE':model.phase==='intro'?'PRÉSENTATION':model.phase==='prep'?'COMPTE À REBOURS':model.phase==='go'?'DÉPART':model.phase==='rest'?'RÉCUPÉRATION':model.phase==='work'?(step.manual?'RÉPÉTITIONS · VALIDATION MANUELLE':'TRAVAIL'):'PRÊT';
  el('guide-clock').textContent=timeText(model.phase==='work'&&step.manual?model.manualElapsed:model.remaining);
  el('guide-elapsed-value').textContent=timeText(model.elapsed);
  el('guide-elapsed-goal').textContent=model.targetSeconds?'Objectif : '+timeText(model.targetSeconds):'';
  start.disabled=model.finished;start.textContent=!model.started?'Démarrer':model.paused?'Reprendre':'Pause';
  done.disabled=!model.started||model.paused||model.finished||!['work','rest'].includes(model.phase);
  done.textContent=model.phase==='rest'?'Passer le repos':'Exercice suivant';
  el('guide-config').hidden=model.started;
  if(el('guide-edit'))el('guide-edit').disabled=model.started;
  el('guide-status').textContent=model.finished?'Séance terminée. Vous pouvez fermer cette fenêtre.':model.loopToTarget&&model.elapsed>=model.targetSeconds?'Objectif atteint : terminez le mouvement en cours pour clôturer la séance.':'';
 }
 function isContinuousTransition(){
   const current=model.steps[model.index],next=model.steps[model.index+1];
   return !!(model.source==='ath'&&current?.intervalBlock&&next?.intervalBlock===current.intervalBlock&&current.recovery!==next.recovery);
 }
 function tick(){
   if(model.paused||model.finished)return;
   const now=Date.now(),delta=Math.max(0,(now-lastTick)/1000),elapsedBefore=model.elapsed;lastTick=now;
   // Presentation and countdown must NOT consume training time.
   if(['work','rest'].includes(model.phase))model.elapsed+=delta;
   if(model.phase==='work'&&model.steps[model.index].manual)model.manualElapsed+=delta;
   else model.remaining=Math.max(0,Math.ceil((deadline-now)/1000));
   const previousRemaining=previousCountdown;
   previousCountdown=model.remaining;
   if(model.voice&&model.remaining>0&&model.remaining!==previousRemaining){
     const step=model.steps[model.index];
     const isWorkCue=model.phase==='work'&&!step.manual&&(model.source==='circuit'||(model.source==='ath'&&step.intervalBlock));
     if(model.phase==='prep'){
       const remaining=model.remaining;
       if(remaining<prepLength&&remaining<=previousRemaining&&remaining>=1&&!announcedCues.has('prep'+remaining)){
         announcedCues.add('prep'+remaining);
         voiceGuide(({5:'Cinq',4:'Quatre',3:'Trois',2:'Deux',1:'Un'})[remaining],true,undefined,{interrupt:false});
       }
     }else if(isWorkCue){
       const remaining=model.remaining;
       const transitionToEffort=step.recovery&&isContinuousTransition();
       const cue=transitionToEffort?(remaining<=3?remaining:0):step.recovery?0:(remaining<=5?remaining:remaining<=10?10:remaining<=20?20:0);
       if(cue&&!announcedCues.has('work'+cue)){
         announcedCues.add('work'+cue);
         const text=cue>5?cue+' secondes':({5:'Cinq',4:'Quatre',3:'Trois',2:'Deux',1:'Un'})[cue];
         voiceGuide(text,true,undefined,{interrupt:false});
       }
     }
   }
   // Only ATH A exercises 1–4 and ATH B exercises 1–2 receive these cues.
   const cueStep=model.steps[model.index];
   if(model.voice&&cueStep?.athTimeCue){
     const start=model.athCueStartElapsed??model.elapsed;
     const text=athMinuteCue(cueStep,model,model.phase,
       Math.max(0,elapsedBefore-start),Math.max(0,model.elapsed-start),
       previousRemaining,model.remaining,announcedCues);
     if(text)voiceGuide(text,true,undefined,{interrupt:false});
   }
   if(Math.floor(model.elapsed)!==savingTick){savingTick=Math.floor(model.elapsed);persist();}
   renderActive();
   if(model.phase==='work'&&model.steps[model.index].manual)return;
   if(model.remaining>0)return;
   stopTicker();
   if(model.phase==='prep'){
     startWork({fromPrep:true});
   }else if(model.phase==='rest'){
     if(model.loopToTarget&&model.elapsed>=model.targetSeconds)finish();
     else if(model.afterRest==='round'){model.afterRest='';prepare();}
     else advance();
   }else if(model.phase==='work')completeStep();
 }
 function beginTicker(seconds){
   stopTicker();model.remaining=Math.max(0,seconds);deadline=Date.now()+model.remaining*1000;
   lastTick=Date.now();previousCountdown=model.remaining;model.paused=false;ticker=setInterval(tick,200);persist();renderActive();
 }
 function countdown(token){
   if(token!==prepToken||model.paused||model.finished)return;
   const seconds=model.source==='circuit'?5:3;
   model.phase='prep';model.remaining=seconds;
   prepLength=seconds;prepStarted=false;announcedCues=new Set();
   let fallback=null;
   const beginVisual=()=>{
     if(prepStarted||token!==prepToken||model.paused||model.finished)return;
     prepStarted=true;clearTimeout(fallback);beginTicker(seconds);
   };
   if(model.voice){
     // The first number starts the countdown; subsequent numbers follow the true clock.
     fallback=setTimeout(beginVisual,2500);
     if(!voiceGuide(seconds===5?'Cinq':'Trois',true,undefined,{onStart:beginVisual}))beginVisual();
   }else beginVisual();
   renderActive();
 }
 function prepare(){
   stopTicker();stopVoiceGuide();const token=++prepToken;
   model.phase='intro';model.remaining=3;model.countdownSpoken=false;
   renderList();renderActive();persist();
   let completed=false;
   const next=()=>{
     if(completed||token!==prepToken||model.paused||model.finished)return;
     completed=true;clearTimeout(fallback);countdown(token);
   };
   const fallback=setTimeout(next,14000);
   voiceGuide('Préparez-vous. '+model.steps[model.index].name+'. '+(model.steps[model.index].target||''),model.voice,next);
 }
 function startWork(options={}){
   if(model.finished||model.paused)return;
   const step=model.steps[model.index];
   if(model.source==='ath'&&step.athTimeCue&&model.athCueBlock!==step.athTimeBlock){
     model.athCueBlock=step.athTimeBlock;
     model.athCueStartElapsed=model.elapsed;
   }
   if(step.remainingTo60){step.seconds=Math.max(1,Math.round(3600-model.elapsed));step.target='Temps restant : '+timeText(step.seconds)+' pour atteindre 60 min';}
   const beginClock=()=>{
     if(model.finished||model.paused)return;
     model.phase='work';model.manualElapsed=0;model.countdownSpoken=false;
     if(model.source!=='ath'||!step.athTimeCue||model.athCueBlock!==step.athTimeBlock)announcedCues=new Set();
     if(step.manual){stopTicker();model.remaining=0;lastTick=Date.now();model.paused=false;ticker=setInterval(tick,200);persist();renderActive();}
     else beginTicker(step.seconds||45);
     renderList();
   };
   if(options.fromPrep&&model.voice){
     // Some Android voices wait before speaking: only the audible GO starts the work clock.
     model.phase='go';model.remaining=0;renderActive();
     const token=prepToken;let started=false;
     const go=()=>{
       if(started||token!==prepToken||model.finished||model.paused)return;
       started=true;clearTimeout(fallback);beginClock();
     };
     const fallback=setTimeout(go,2200);
     if(!voiceGuide('GO !',true,undefined,{onStart:go}))go();
     return;
   }
   beginClock();
   if(step.recovery)voiceGuide('Récupération, '+step.seconds+' secondes',model.voice,undefined,{interrupt:!options.continuous});
   else if(options.continuous)voiceGuide('GO ! Effort '+(step.seconds||45)+' secondes',model.voice,undefined,{interrupt:false});
 }
 function advance(){
  if(model.loopToTarget&&model.elapsed>=model.targetSeconds){finish();return;}
  if(model.index+1<model.steps.length){model.index++;prepare();return;}
  if((model.loopToTarget&&model.elapsed<model.targetSeconds)||(!model.loopToTarget&&model.round<model.rounds)){
   model.index=0;model.round++;if(model.roundRest){model.phase='rest';model.afterRest='round';voiceGuide('Tour terminé. Récupération',model.voice);beginTicker(model.roundRest);}else prepare();return;
  }
  finish();
 }
 function completeStep(){
  if(model.finished)return;
  if(isContinuousTransition()){
    // The global elapsed clock is continuous; only the phase countdown is reset.
    model.index++;startWork({continuous:true});return;
  }
  stopTicker();
  // The eight-minute objective ends AFTER the current movement, never mid-repetition.
  if(model.loopToTarget&&model.elapsed>=model.targetSeconds){voiceGuide('Stop',model.voice);finish();return;}
  // Round recovery is handled only at round boundaries, never after the final exercise.
  if(model.index===model.steps.length-1){voiceGuide('Stop',model.voice);advance();return;}
  if(model.rest){model.phase='rest';model.afterRest='next';voiceGuide('Stop. Récupération. Ensuite : '+model.steps[model.index+1].name,model.voice);beginTicker(model.rest);renderList();}
  else{advance();}
 }
 function finish(){
  stopTicker();model.finished=true;model.paused=false;model.phase='done';localStorage.removeItem(GUIDE_DRAFT_KEY);refreshGuideEntrypoints();renderActive();renderList();voiceGuide('Séance terminée',model.voice);
 }
 function freeze(){
  if(ticker){const now=Date.now();if(['work','rest'].includes(model.phase))model.elapsed+=Math.max(0,(now-lastTick)/1000);if(model.phase==='work'&&model.steps[model.index].manual)model.manualElapsed+=Math.max(0,Math.max(0,(now-lastTick)/1000));else model.remaining=Math.max(0,Math.ceil((deadline-now)/1000));stopTicker();}
  if(!model.finished){model.paused=true;++prepToken;stopVoiceGuide();renderActive();persist();}
 }
 function readSettings(){
  const rest=Number(el('guide-rest').value),roundRest=Number(el('guide-round-rest').value),rounds=model.source==='circuit'?model.rounds:Number(el('guide-rounds').value);
  if(![rest,roundRest].every(x=>Number.isInteger(x)&&x>=0&&x<=600)||!Number.isInteger(rounds)||rounds<1||rounds>30){alert('Réglages invalides : repos 0–600 secondes et tours 1–30.');return false;}
  model.rest=rest;model.roundRest=model.source==='ath'?0:roundRest;model.rounds=model.source==='ath'?1:rounds;model.voice=el('guide-voice').checked;
  if(model.source==='circuit')model.loopToTarget=model.rounds===1;
  if(editing)toggleEdit();storeConfig();return true;
 }
 function toggleEdit(){
  if(editing){model.steps.forEach((s,i)=>{const name=$(`[data-guide-name="${i}"]`,list),target=$(`[data-guide-target="${i}"]`,list),seconds=$(`[data-guide-seconds="${i}"]`,list);if(name&&name.value.trim())s.name=name.value.trim().slice(0,100);if(target)s.target=target.value.trim().slice(0,90);if(seconds){const n=Number(seconds.value);if(Number.isInteger(n)&&n>=5&&n<=3600)s.seconds=n;}});}
  editing=!editing;el('guide-edit').textContent=editing?'Terminer':'Modifier';renderList();renderActive();
 }
 if(el('guide-edit'))el('guide-edit').onclick=toggleEdit;
 start.onclick=()=>{
  if(model.finished)return;
  if(!model.started){if(!readSettings())return;model.started=true;model.paused=false;prepare();}
  else if(!model.paused){freeze();}
  else{model.paused=false;voiceGuide('Reprise. '+model.steps[model.index].name,model.voice);if(['ready','intro','prep','go'].includes(model.phase))prepare();else if(model.phase==='work'&&model.steps[model.index].manual){stopTicker();lastTick=Date.now();ticker=setInterval(tick,200);persist();renderActive();}else beginTicker(model.remaining);}
  renderActive();
 };
 done.onclick=()=>{if(model.paused||model.finished)return;if(model.phase==='rest'){stopTicker();if(model.afterRest==='round'){model.afterRest='';prepare();}else advance();}else if(model.phase==='work')completeStep();};
 el('guide-abandon').onclick=()=>{
  if(model.started&&!model.finished&&!confirm('Terminer définitivement ce guidage ? La progression du chronomètre ne pourra plus être reprise.'))return;
  model.finished=true;localStorage.removeItem(GUIDE_DRAFT_KEY);close(true);
 };
 if(isResume){el('guide-status').textContent='Séance conservée en pause. Appuyez sur Reprendre pour continuer.';}
 renderList();renderActive();
}

function lastBackupLabel(){
 const verified=localStorage.getItem(BACKUP_FILE_VERIFIED_KEY),legacy=localStorage.getItem(BACKUP_DATE_KEY);
 return verified?new Date(verified).toLocaleDateString("fr-FR")+" (fichier relu)":legacy?new Date(legacy).toLocaleDateString("fr-FR")+" (ancienne confirmation)":"Aucun fichier vérifié";
}
function backupChecksum(value){const text=JSON.stringify(value);let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16).padStart(8,'0');}
function backupPayload(){const b={format:"fitness-backup",version:2,createdAt:new Date().toISOString(),state:clone(state),ui:localStorage.getItem(UI_KEY),scroll:sessionStorage.getItem(SCROLL_KEY)};b.checksum=backupChecksum({state:b.state,ui:b.ui,scroll:b.scroll});return b;}
function validateBackup(b){
  if(!b||b.format!=="fitness-backup"||![1,2].includes(b.version)||!b.state||typeof b.state!=="object"||Array.isArray(b.state))throw Error("Format de sauvegarde invalide");
  const required=["history","measurements","ephemeralSessions","completedG"];
  if(required.some(k=>!Array.isArray(b.state[k])))throw Error("Données de sauvegarde incomplètes");
  if(b.state.history.some(h=>!h||typeof h!=="object"||!Array.isArray(h.exercises)))throw Error("Historique invalide");
  if(b.state.ephemeralSessions.some(x=>!x||!Array.isArray(x.exerciseIds)))throw Error("Séances éphémères invalides");
  for(const key of ["refs","params","progressionSettings","sessionOrder","programOverrides","customExercises"]){
    const v=b.state[key];if(v!==undefined&&(!v||typeof v!=="object"||Array.isArray(v)))throw Error("Paramètres de sauvegarde invalides : "+key);
  }
  if(Object.prototype.hasOwnProperty.call(b.state,"__proto__")||Object.prototype.hasOwnProperty.call(b.state,"constructor"))throw Error("Clés interdites dans le fichier");
  if(b.version===2&&b.checksum!==backupChecksum({state:b.state,ui:b.ui,scroll:b.scroll}))throw Error("Le fichier est endommagé ou a été modifié");
  if(b.ui!==null&&b.ui!==undefined){if(typeof b.ui!=="string")throw Error("Préférences invalides");const ui=JSON.parse(b.ui);if(!ui||typeof ui!=="object"||Array.isArray(ui))throw Error("Préférences invalides");}
  return b;
}
function backupJSON(){
  try{
    const payload=backupPayload(),text=JSON.stringify(payload),parsed=validateBackup(JSON.parse(text));
    if(JSON.stringify(parsed.state)!==JSON.stringify(state))throw Error("Vérification impossible");
    // Do not advance the annual reminder until the DOWNLOADED file has been read back.
    localStorage.setItem(BACKUP_PENDING_KEY,JSON.stringify({checksum:payload.checksum,createdAt:payload.createdAt}));
    download("fitness-sauvegarde-"+localISODate()+".json",text,"application/json");
    openBackupVerification();
  }catch(e){alert("Export impossible : "+e.message);}
}
function openBackupVerification(){
  openModal(`<h3>Vérifier la sauvegarde téléchargée</h3><p>Choisissez le fichier JSON que vous venez d’enregistrer. Le rappel annuel ne sera repoussé qu’après relecture de ce fichier.</p><label class="btn gold block" style="display:block;text-align:center">Choisir le fichier JSON<input id="verify-backup-modal" type="file" accept=".json,application/json" hidden></label><div class="modal-actions"><button class="btn ghost" data-close-modal>Vérifier plus tard</button></div>`,ov=>{$('#verify-backup-modal',ov).onchange=verifyBackupFile;});
}
function verifyBackupFile(e){
 const f=e.target.files?.[0];e.target.value="";if(!f)return;
 const reader=new FileReader();reader.onload=()=>{
  try{
   const b=validateBackup(JSON.parse(reader.result));
   const pending=JSON.parse(localStorage.getItem(BACKUP_PENDING_KEY)||"null");
   if(!pending||b.version!==2||pending.checksum!==b.checksum||pending.createdAt!==b.createdAt)throw Error("Ce fichier n’est pas celui du dernier export. Relancez un export et sélectionnez son fichier JSON.");
   if(JSON.stringify(b.state)!==JSON.stringify(state))throw Error("Les données ont changé depuis cet export. Réexportez vos données pour sauvegarder l’état actuel.");
   const now=new Date().toISOString();localStorage.setItem(BACKUP_FILE_VERIFIED_KEY,now);localStorage.setItem(BACKUP_DATE_KEY,now);
   localStorage.removeItem(BACKUP_PENDING_KEY);localStorage.removeItem(BACKUP_SNOOZE_KEY);
   if(overlayRoot.firstElementChild)closeOverlay(true);
   render();alert("Fichier JSON relu et vérifié. Prochain rappel dans un an. Conservez ce fichier hors du téléphone.");
  }catch(err){alert("Vérification refusée : "+err.message);}
 };reader.onerror=()=>alert("Impossible de relire le fichier.");reader.readAsText(f);
}
function exportCSV(){
  const rows=[["date","séance","début","fin","durée_min","exercice","valeur","statut","prochaine"]];
  (state.history||[]).forEach(h=>(h.exercises||[]).forEach(e=>rows.push([h.date,h.session,h.start,h.end,h.duration,e.name,e.actual,e.status,e.next])));
  download("fitness-export.csv",rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\n"),"text/csv");
}
function download(name,content,type){const a=document.createElement("a"),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function restoreJSON(e){
  const f=e.target.files?.[0];if(!f)return;e.target.value="";const r=new FileReader();r.onload=()=>{
    try{const incoming=validateBackup(JSON.parse(r.result));if(!confirm("Restaurer cette sauvegarde du "+new Date(incoming.createdAt).toLocaleDateString("fr-FR")+" ? Les données actuelles seront remplacées. Une copie locale sera conservée sur cet appareil."))return;
      const previous=localStorage.getItem(KEY),previousUI=localStorage.getItem(UI_KEY);
      if(previous===null)throw Error("Aucune donnée actuelle à protéger : restauration interrompue");
      // Fail closed if the device cannot store the recovery copy (e.g. storage quota).
      localStorage.setItem("fitness-before-restore-v2418",previous);
      if(localStorage.getItem("fitness-before-restore-v2418")!==previous)throw Error("Copie de sécurité non vérifiée");
      const next=Object.assign(defaultState(),incoming.state,{appRev:APP_REV});if(!Array.isArray(next.history)||!Array.isArray(next.measurements))throw Error("Données restaurées invalides");
      const serialized=JSON.stringify(next);
      try{
        localStorage.setItem(KEY,serialized);
        if(localStorage.getItem(KEY)!==serialized)throw Error("Écriture des données non vérifiée");
        if(typeof incoming.ui==="string")localStorage.setItem(UI_KEY,incoming.ui);
      }catch(writeError){
        try{
          localStorage.setItem(KEY,previous);
          if(previousUI===null)localStorage.removeItem(UI_KEY);else localStorage.setItem(UI_KEY,previousUI);
        }catch(rollbackError){throw Error("Restauration et retour arrière impossibles : conservez votre fichier JSON. "+rollbackError.message);}
        throw writeError;
      }
      state=next;alert("Sauvegarde restaurée. Une copie locale des données précédentes a été conservée.");location.reload();
    }catch(err){alert("Restauration refusée : "+err.message);}
  };r.onerror=()=>alert("Lecture du fichier impossible.");r.readAsText(f);
}
function showBackupReminder(){
  // No annual-export prompt in front of first-run setup or on an empty installation.
  if(!state.installed||(!(state.history||[]).length&&!(state.measurements||[]).length&&!(state.ephemeralSessions||[]).length))return;
  const last=localStorage.getItem(BACKUP_DATE_KEY),snooze=localStorage.getItem(BACKUP_SNOOZE_KEY),now=Date.now();
  if(snooze&&now-Number(snooze)<7*86400000)return;
  if(last){const due=new Date(last);due.setFullYear(due.getFullYear()+1);if(now<due.getTime())return;}
  if(document.querySelector(".backup-reminder"))return;const ov=document.createElement("div");ov.className="backup-reminder";ov.innerHTML=`<div class="card"><h3>Sauvegarde annuelle</h3><p>Il est temps d’exporter vos données pour les conserver hors de ce téléphone.</p><button class="btn gold block" id="reminder-export">Exporter mes données</button><button class="btn block" id="reminder-later">Me le rappeler plus tard</button></div>`;document.body.appendChild(ov);
  $("#reminder-export",ov).onclick=()=>{ov.remove();backupJSON();};$("#reminder-later",ov).onclick=()=>{localStorage.setItem(BACKUP_SNOOZE_KEY,String(Date.now()));ov.remove();};
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
initializeSharedProgress();
render();
if(view.type==="root")restoreTabScroll(tab);
showBackupReminder();
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js?v=242510",{updateViaCache:"none"}).catch(()=>{});
})();
