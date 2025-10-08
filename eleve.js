import { $, base64url, fmtTime, nowISO } from './core.js';

const params = new URLSearchParams(location.search);
if(params.get('code')) $('#code').value = params.get('code');

let cfg=null;
let state={
  laps:0, // fractionné
  chrono:0, running:false, phase:'Repos', rep:0,
  // mange plots
  plots:0, chronoM:0, runningM:false, win:90
};

function load(){
  const code = $('#code').value.trim();
  if(!code) return alert('Code manquant');
  try{
    cfg = base64url.decode(code);
  }catch(e){ alert('Code invalide'); return; }
  if(!cfg || !cfg.type) { alert('Code invalide'); return; }

  $('#sess').classList.remove('hidden');
  $('#cfg').innerHTML = `<div class="cardItem">
    <b>Type</b> : ${cfg.type} · <b>Rép.</b> ${cfg.reps||1} · <b>Trav</b> ${cfg.work||0}s · <b>Récup</b> ${cfg.rest||0}s
    ${cfg.type==='mangeplots' ? ` · <b>Fenêtre</b> ${cfg.window}s` : ''}
    ${cfg.note ? `<br><i>${cfg.note}</i>` : ''}
  </div>`;

  if(cfg.type==='fractionne'){
    $('#uiFractionne').classList.remove('hidden');
    $('#uiMange').classList.add('hidden');
  }else{
    $('#uiMange').classList.remove('hidden');
    $('#uiFractionne').classList.add('hidden');
    $('#winSel').value = String(cfg.window||90);
    state.win = parseInt($('#winSel').value,10);
  }
}
$('#btnLoad').addEventListener('click', load);

// Fractionné
let timer=null;
function tickF(){
  state.chrono++;
  $('#chronoF').textContent = fmtTime(state.chrono);
  // phase logic
  const w = cfg.work||30, r = cfg.rest||30;
  const cycle = w + r;
  const t = state.chrono % cycle;
  const prevPhase = state.phase;
  state.phase = (t>0 && t<=w) ? 'Travail' : 'Repos';
  $('#phaseF').textContent = state.phase;
  if(prevPhase==='Repos' && state.phase==='Travail') state.rep++;
  $('#repF').textContent = state.rep + ' / ' + (cfg.reps||1);
  if(state.rep >= (cfg.reps||1) && t===0){
    pauseF(); alert('Séance terminée');
  }
}
function startF(){ if(!cfg) return; if(timer) return; state.running=true; timer=setInterval(tickF,1000); }
function pauseF(){ state.running=false; clearInterval(timer); timer=null; }
function resetF(){ pauseF(); state.chrono=0; state.rep=0; $('#chronoF').textContent='00:00'; $('#repF').textContent='0'; $('#phaseF').textContent='Repos'; state.laps=0; $('#lapsF').textContent='0'; }
function lapF(){ state.laps++; $('#lapsF').textContent=String(state.laps); }

$('#startF').addEventListener('click', startF);
$('#pauseF').addEventListener('click', pauseF);
$('#resetF').addEventListener('click', resetF);
$('#lapF').addEventListener('click', lapF);

// Mange plots
let timerM=null;
function tickM(){
  state.chronoM++;
  $('#chronoM').textContent = fmtTime(state.chronoM);
  if(state.chronoM>=state.win){ pauseM(); }
}
function startM(){ state.runningM=true; if(timerM) return; timerM=setInterval(tickM,1000); }
function pauseM(){ state.runningM=false; clearInterval(timerM); timerM=null; }
function resetM(){ pauseM(); state.chronoM=0; $('#chronoM').textContent='00:00'; state.plots=0; $('#plots').textContent='0'; $('#speedM').textContent='0.0 km/h'; }
$('#startM').addEventListener('click', startM);
$('#pauseM').addEventListener('click', pauseM);
$('#resetM').addEventListener('click', resetM);
$('#minusP').addEventListener('click', ()=>{ state.plots=Math.max(0,state.plots-1); $('#plots').textContent=String(state.plots); });
$('#plusP').addEventListener('click', ()=>{ state.plots++; $('#plots').textContent=String(state.plots); });
$('#winSel').addEventListener('change', (e)=>{ state.win=parseInt(e.target.value,10); resetM(); });

// Export QR
function generateExport(){
  if(!cfg) return alert('Charge d’abord la séance.');
  const piste = parseFloat($('#piste').value||'200');
  const nom1 = $('#nom1').value.trim();
  const nom2 = $('#nom2').value.trim();
  const classe = $('#classe').value.trim();

  let payload = {
    App:'RunCycle-Demi-Fond',
    Mode: cfg.type,
    SessionCode: base64url.encode(cfg),
    Eleve1: nom1 || null,
    Eleve2: nom2 || null,
    Classe: classe || null,
    Piste_m: piste,
    Horodatage: nowISO()
  };

  if(cfg.type==='fractionne'){
    const totalTime = state.chrono;
    const distance_m = Math.round(state.laps * piste);
    const speed = totalTime>0 ? (distance_m/1000)/(totalTime/3600) : 0;
    payload.Distance_m = distance_m;
    payload.Temps_s = totalTime;
    payload.Vitesse_kmh = Number(speed.toFixed(2));
    payload.Rep_effectuees = state.rep;
  }else{
    const window_s = state.win;
    const distance_m = state.plots * 12.5;
    const speed = (distance_m/1000)/(window_s/3600);
    payload.Plots = state.plots;
    payload.Fenetre_s = window_s;
    payload.Distance_m = Math.round(distance_m);
    payload.Temps_s = window_s;
    payload.Vitesse_kmh = Number(speed.toFixed(2));
  }

  $('#jsonOut').textContent = JSON.stringify(payload,null,2);
  const qrNode = document.getElementById('qr');
  qrNode.innerHTML='';
  new QRCode(qrNode,{text: JSON.stringify(payload), width:196, height:196});
}

$('#btnQR').addEventListener('click', generateExport);
$('#btnClear').addEventListener('click', ()=>{ $('#jsonOut').textContent=''; $('#qr').innerHTML=''; });
