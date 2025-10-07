
(function(){
  function loadScript(src, onload){
    var s=document.createElement('script'); s.src=src; s.onload=onload; document.head.appendChild(s);
  }
  if(typeof QRCode==='undefined'){
    // Try loading local min (if present), else CDN
    var local='/qr.min.js';
    fetch(local, {method:'HEAD'}).then(()=>loadScript(local, function(){})).catch(function(){
      loadScript('https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js', function(){});
    });
  }
})();
