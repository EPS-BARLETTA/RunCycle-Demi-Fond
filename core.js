
// utilitaires communs
const $ = (sel, root=document)=>root.querySelector(sel);
const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

export const base64url = {
  encode: (obj)=>{
    const json = typeof obj==='string'? obj : JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  },
  decode: (str)=>{
    const s = str.replace(/-/g,'+').replace(/_/g,'/'); const pad = s + '==='.slice((s.length+3)%4);
    const json = decodeURIComponent(escape(atob(pad)));
    try{ return JSON.parse(json) }catch{ return json }
  }
};

export async function sha256(text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export function nowISO(){ return new Date().toISOString(); }
export function fmtTime(sec){
  sec = Math.max(0, Math.floor(sec));
  const m = Math.floor(sec/60), s=sec%60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
export function clamp(n,min,max){ return Math.min(max, Math.max(min,n)); }
