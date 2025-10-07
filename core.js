
// Routing helpers
function go(id){
  document.querySelectorAll('main > section').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo(0,0);
}

// Code generation:
// Short code (presets): DDDX (3 digits + 1 letter)
function genShortCode(idx){
  const d1 = (idx*7 + 3) % 10, d2 = (idx*9 + 5) % 10, d3 = (idx*11 + 7) % 10;
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to avoid confusion
  const L = letters[idx % letters.length];
  return `${d1}${d2}${d3}${L}`;
}
// Extended code (custom sessions): base36 8 chars
function genExtendedCode(){
  return Math.random().toString(36).slice(2,10).toUpperCase();
}

// Preset library (fully defined, individualisable via VMA)
const PRESETS = {
  S1: { Titre:"Test 6' (estimation VMA)", Blocs:1, DureeBloc_min:6, Recup_min:0, Cible_%VMA:[], Notes:"Courir la plus grande distance en 6'." },
  S2: { Titre:"2×6' @ 90% VMA (r=3')", Blocs:2, DureeBloc_min:6, Recup_min:3, Cible_%VMA:[0.90,0.90], Notes:"Régularité, allure 90% VMA." },
  S3: { Titre:"3×4' aux allures 80/90/100% (r=2')", Blocs:3, DureeBloc_min:4, Recup_min:2, Cible_%VMA:[0.80,0.90,1.00], Notes:"Différencier les allures." },
  S4: { Titre:"4×3' projet @ 90–95% (r=2')", Blocs:4, DureeBloc_min:3, Recup_min:2, Cible_%VMA:[0.90,0.92,0.94,0.95], Notes:"Tenir le projet, finish propre." },
  S5: { Titre:"Éval 4×3' @ 95% (r=2')", Blocs:4, DureeBloc_min:3, Recup_min:2, Cible_%VMA:[0.95,0.95,0.95,0.95], Notes:"Objectif ±0,5 km/h." }
};

// Build a session object
function buildSession({Titre, DateStr, Blocs, DureeBloc_min, Recup_min, CiblePct, Piste_m, Notes}){
  return {
    v:1,
    SeanceID: (DateStr||new Date().toISOString().slice(0,10)) + "_" + Math.random().toString(36).slice(2,6).toUpperCase(),
    Titre: Titre||"Séance",
    Date: DateStr||new Date().toISOString().slice(0,10),
    Blocs: Number(Blocs||4),
    DureeBloc_min: Number(DureeBloc_min||3),
    Recup_min: Number(Recup_min||2),
    Cible_%VMA: Array.isArray(CiblePct)? CiblePct :
      String(CiblePct||"0.95").split(',').map(x=>Number(x.trim())).filter(x=>!Number.isNaN(x)),
    Piste_m: Number(Piste_m||400),
    Consignes: Notes||""
  };
}

// Session registry: store custom sessions by extended code in localStorage (so students can use the code on *the same device* or shared tablet)
function saveCustomSession(code, seance){
  const map = JSON.parse(localStorage.getItem('RC_custom_sessions')||'{}');
  map[code] = seance;
  localStorage.setItem('RC_custom_sessions', JSON.stringify(map));
}
function loadCustomSession(code){
  const map = JSON.parse(localStorage.getItem('RC_custom_sessions')||'{}');
  return map[code]||null;
}

// Lookup by code: short (presets) or extended (custom)
function resolveByCode(code, context){
  if(!code) return null;
  const up = code.trim().toUpperCase();
  // 1) Check hardcoded preset codes
  const pkey = presetForCode(up);
  if(pkey){
    const p = PRESETS[pkey];
    return {...p, Piste_m: context.Piste_m||400};
  }
  // 2) Extended custom code (local)
  const s = loadCustomSession(up);
  if(s) return s;
  return null;
}[A-Z]$/.test(code);
  if(isShort){
    // Map short code to preset index deterministically
    const keys = Object.keys(PRESETS);
    // Reverse: guess index from digits (rough)
    const L = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const idx = Math.max(0, L.indexOf(code[3]));
    const presetKey = keys[idx % keys.length];
    const p = PRESETS[presetKey];
    return {...p, Piste_m: context.Piste_m||400};
  } else {
    // Custom session stored locally by prof device (or shared tablet)
    const s = loadCustomSession(code);
    if(s) return s;
    return null;
  }
}

// Utilities for targets
function mPerMin(kmh){ return (kmh*1000)/60; }
function kmhFromMeters(total_m, total_min){ return (total_m/1000)/(total_min/60); }
function mean(arr){ return arr.reduce((a,b)=>a+b,0)/arr.length; }

// Export to global
window.RunCycleCore = {
  go, genShortCode, genExtendedCode, PRESETS, buildSession,
  saveCustomSession, resolveByCode,
  mPerMin, kmhFromMeters, mean
, codeForPreset, presetForCode, PRESET_CODES, codeForPreset, presetForCode, PRESET_CODES};

// --- Deterministic short codes for presets (3 digits + 1 letter) ---
const PRESET_CODES = {
  S1: "101A",
  S2: "202B",
  S3: "303C",
  S4: "404D",
  S5: "505E"
};
function codeForPreset(key){ return PRESET_CODES[key] || null; }
function presetForCode(code){
  const up = (code||'').trim().toUpperCase();
  const entry = Object.entries(PRESET_CODES).find(([,v])=>v===up);
  return entry? entry[0] : null;
}
