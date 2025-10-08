import { $, base64url, sha256 } from './core.js';

// Code prof par défaut = 'vauban'
export const PROF_HASH = 'a38681899afd9e39610fc210b20e310137176e83d5fd32954dff21b15876713c';

async function checkGate() {
  const code = $('#profCode').value.trim();
  if(!code) return alert('Entre le code prof.');
  const h = await sha256(code);
  if(h !== PROF_HASH){
    alert('Code incorrect.');
    return;
  }
  sessionStorage.setItem('profOK','1');
  $('#gate').classList.add('hidden');
  $('#builder').classList.remove('hidden');
}

$('#btnEnter').addEventListener('click', checkGate);
$('#profCode').addEventListener('keydown', (e)=>{ if(e.key==='Enter') checkGate(); });

// Modèles (6)
const templates = [
  {name:'10×30/30', type:'fractionne', reps:10, work:30, rest:30, note:'Maintenir l’allure cible'},
  {name:'8×45/30',  type:'fractionne', reps:8,  work:45, rest:30, note:'Relâchement bras'},
  {name:'6×1’/1’',  type:'fractionne', reps:6,  work:60, rest:60, note:'Respiration régulière'},
  {name:'4×2’/2’',  type:'fractionne', reps:4,  work:120,rest:120,note:'Gestion allure'},
  {name:'Mange plots 1:30', type:'mangeplots', reps:1, work:90, rest:0, window:90, note:'Compter les plots'},
  {name:'Mange plots 3:00', type:'mangeplots', reps:1, work:180,rest:0, window:180, note:'Compter les plots'}
];

function renderTemplates(){
  const box = $('#templates');
  box.innerHTML = '';
  templates.forEach((t)=>{
    const div = document.createElement('div');
    div.className='cardItem';
    div.innerHTML = `<b>${t.name}</b><br><span class="badge">${t.type}</span>`;
    div.addEventListener('click',()=>applyTemplate(t));
    box.appendChild(div);
  });
}
renderTemplates();

function applyTemplate(t){
  $('#type').value = t.type;
  $('#reps').value = t.reps ?? 6;
  $('#work').value = t.work ?? 30;
  $('#rest').value = t.rest ?? 30;
  $('#window').value = t.window ?? 90;
  $('#note').value = t.note ?? '';
}

function genCode(){
  const cfg = {
    v:1,
    type: $('#type').value,
    reps: parseInt($('#reps').value||'6',10),
    work: parseInt($('#work').value||'30',10),
    rest: parseInt($('#rest').value||'30',10),
    window: parseInt($('#window').value||'90',10),
    note: $('#note').value||'',
    issuedAt: new Date().toISOString()
  };
  const code = base64url.encode(cfg);
  try{ localStorage.setItem('lastSessionCode', code); }catch(e){}
  const link = `eleve.html?code=${code}`;
  $('#codeBox').textContent = code;
  $('#linkEleve').href = link;
  const qrNode = document.getElementById('qr');
  qrNode.innerHTML='';
  const absolute = location.origin + location.pathname.replace(/prof\.html$/,'') + link;
  new QRCode(qrNode,{text: absolute, width:196, height:196});
}

$('#btnGen').addEventListener('click', genCode);
$('#btnReset').addEventListener('click', ()=>document.location.reload());
$('#btnCopy').addEventListener('click', async ()=>{
  const t = $('#codeBox').textContent;
  if(!t) return;
  await navigator.clipboard.writeText(t);
  alert('Code copié.');
});
