
function go(id){
  document.querySelectorAll('main > section').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo(0,0);
}
// Presets
const PRESETS = {
  S1: { Titre:"Test 6' (estimation VMA)", Blocs:1, DureeBloc_min:6, Recup_min:0, Cible_%VMA:[], Notes:"Courir la plus grande distance en 6'." },
  S2: { Titre:"2×6' @ 90% VMA (r=3')", Blocs:2, DureeBloc_min:6, Recup_min:3, Cible_%VMA:[0.90,0.90], Notes:"Régularité, allure 90% VMA." },
  S3: { Titre:"3×4' aux allures 80/90/100% (r=2')", Blocs:3, DureeBloc_min:4, Recup_min:2, Cible_%VMA:[0.80,0.90,1.00], Notes:"Différencier les allures." },
  S4: { Titre:"4×3' projet @ 90–95% (r=2')", Blocs:4, DureeBloc_min:3, Recup_min:2, Cible_%VMA:[0.90,0.92,0.94,0.95], Notes:"Tenir le projet, finish propre." },
  S5: { Titre:"Éval 4×3' @ 95% (r=2')", Blocs:4, DureeBloc_min:3, Recup_min:2, Cible_%VMA:[0.95,0.95,0.95,0.95], Notes:"Objectif ±0,5 km/h." }
};
const PRESET_CODES = { S1:"101A", S2:"202B", S3:"303C", S4:"404D", S5:"505E" };
function codeForPreset(k){ return PRESET_CODES[k]||null; }
function presetForCode(c){ const up=(c||'').toUpperCase(); const e=Object.entries(PRESET_CODES).find(([,v])=>v===up); return e?e[0]:null; }
function buildSession({Titre, DateStr, Blocs, DureeBloc_min, Recup_min, CiblePct, Piste_m, Notes}){
  return {
    v:1,
    SeanceID:(DateStr||new Date().toISOString().slice(0,10))+"_"+Math.random().toString(36).slice(2,6).toUpperCase(),
    Titre: Titre||"Séance",
    Date: DateStr||new Date().toISOString().slice(0,10),
    Blocs: Number(Blocs||4),
    DureeBloc_min: Number(DureeBloc_min||3),
    Recup_min: Number(Recup_min||2),
    Cible_%VMA: String(CiblePct||"0.95").split(',').map(x=>Number(x.trim())).filter(x=>!Number.isNaN(x)),
    Piste_m: Number(Piste_m||200),
    Consignes: Notes||""
  };
}
function saveCustomSession(code, s){ const map=JSON.parse(localStorage.getItem('RC_custom_sessions')||'{}'); map[code]=s; localStorage.setItem('RC_custom_sessions', JSON.stringify(map)); }
function loadCustomSession(code){ const map=JSON.parse(localStorage.getItem('RC_custom_sessions')||'{}'); return map[code]||null; }
function resolveByCode(code, context){
  if(!code) return null;
  const up=code.trim().toUpperCase();
  const pkey=presetForCode(up);
  if(pkey){ const p=PRESETS[pkey]; return {...p, Piste_m: Number(context.Piste_m||200)}; }
  const s=loadCustomSession(up); if(s) return s;
  return null;
}
function mPerMin(kmh){ return (kmh*1000)/60; }
function kmhFromMeters(m, min){ return (m/1000)/(min/60); }
function mean(a){ return a.reduce((x,y)=>x+y,0)/a.length; }
window.RunCycleCore = { go, PRESETS, PRESET_CODES, codeForPreset, presetForCode, buildSession, saveCustomSession, loadCustomSession, resolveByCode, mPerMin, kmhFromMeters, mean };
