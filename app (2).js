// PREMIAZO Studio — app estática (GitHub Pages). Sin servidor: claves en localStorage de este navegador.
(() => {
'use strict';
const $ = id => document.getElementById(id);
const W = 1080, H = 1920, FPS = 30;
const LS = 'premiazo_v1_';
const DEF = {
  el:'', voiceEs:'9iaRiYAiGlZImkI1Ruyh', voiceEn:'TX3LPaxmHKxFdv7VOQHJ',
  gid:'', root:'PREMIAZO_Biblioteca_FINAL',
  map:'LUCKY 1V1', code:'2678-6238-9804', mapFull:'LUCKY 1V1 CHRISTMAS 🎄 TODAS LAS ARMAS',
  menuCuts:'26.1:0.9, 27.08:0.72, 29.3:1.2',
  facts: JSON.stringify(window.PZ_DEFAULT_FACTS, null, 1)
};
const S = Object.assign({}, DEF, load('settings', {}));
const st = { lib:[], basket:[], voice:null, music:null, sfx:null, words:[], tplIdx:0, out:null, outName:'', cover:null, token:null, tokenExp:0, folderIds:{} };
const cache = new Map(); // id -> {blob,url}

function load(k, d){ try{ const v = localStorage.getItem(LS+k); return v ? JSON.parse(v) : d; }catch(e){ return d; } }
function save(k, v){ try{ localStorage.setItem(LS+k, JSON.stringify(v)); }catch(e){} }
function toast(msg, ms=3500){ const t=$('toast'); t.textContent=msg; t.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>t.hidden=true, ms); }
const APP_VERSION='1.7';
function setStatus(){ const p=['v'+APP_VERSION]; p.push(S.el ? 'ElevenLabs ✓' : 'ElevenLabs ✗'); p.push(st.token ? 'Drive ✓' : 'Drive ✗'); $('status').textContent = p.join(' · '); }
function esc(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function today(){ return new Date().toISOString().slice(0,10); }
function facts(){ try{ return JSON.parse(S.facts); }catch(e){ return window.PZ_DEFAULT_FACTS; } }
function verified(id){ return facts().some(f => f.feature_id===id && f.verified===true); }
function skinOf(name){ const n = name.replace(/\.[^.]+$/,''); const p = n.split('__'); if(['REACCION','VOZ','EJEMPLO','PORTADA','NUESTRO','MAPA','BR','REF'].includes(p[0]) && p[1]) return p[1]; return p[0]; }
const isVideo = n => /\.(mp4|mov|webm|m4v)$/i.test(n), isAudio = n => /\.(mp3|m4a|wav|ogg)$/i.test(n), isImage = n => /\.(png|jpe?g|webp)$/i.test(n);

// ---------------- Tabs ----------------
$('tabs').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on', x===b));
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on', x.id==='tab-'+b.dataset.tab));
  if(b.dataset.tab==='publicar') fillCoverClips();
});

// ---------------- Ajustes ----------------
const setMap = {setEl:'el',setVoiceEs:'voiceEs',setVoiceEn:'voiceEn',setGid:'gid',setRoot:'root',setMap:'map',setCode:'code',setMapFull:'mapFull',setMenuCuts:'menuCuts',setFacts:'facts'};
for(const [id,k] of Object.entries(setMap)) $(id).value = S[k] || '';
$('btnSave').onclick = () => {
  for(const [id,k] of Object.entries(setMap)) S[k] = $(id).value.trim();
  try{ JSON.parse(S.facts); }catch(e){ $('saveNote').textContent='Los hechos no son JSON válido: revisa comas y comillas.'; $('saveNote').className='hint bad'; return; }
  if(!/^\d{4}-\d{4}-\d{4}$/.test(S.code)){ $('saveNote').textContent='El código debe tener el formato 0000-0000-0000.'; $('saveNote').className='hint bad'; return; }
  save('settings', S); $('saveNote').textContent='Guardado en este navegador.'; $('saveNote').className='hint ok'; setStatus();
};

// ---------------- ElevenLabs ----------------
async function el(path, body, accept){
  if(!S.el) throw new Error('Falta la clave de ElevenLabs (Ajustes).');
  const r = await fetch('https://api.elevenlabs.io'+path, { method: body ? 'POST':'GET', headers: Object.assign({'xi-api-key':S.el}, body?{'Content-Type':'application/json'}:{}, accept?{'Accept':accept}:{}), body: body?JSON.stringify(body):undefined });
  if(!r.ok){ let t=''; try{ t = await r.text(); }catch(e){} throw new Error('ElevenLabs '+r.status+': '+t.slice(0,200)); }
  return r;
}
$('btnTestEl').onclick = async () => {
  S.el = $('setEl').value.trim(); $('elTest').textContent='Probando…';
  try{ const r = await el('/v1/user'); const j = await r.json(); $('elTest').textContent='Conectado ✓ ('+(j.subscription && j.subscription.tier || 'ok')+')'; $('elTest').className='hint ok'; }
  catch(e){ $('elTest').textContent = (e.message.includes('Failed to fetch') ? 'El navegador no pudo conectar (¿bloqueo de red o CORS?). ' : '') + e.message; $('elTest').className='hint bad'; }
  setStatus();
};
// caché de voz en IndexedDB para no pagar dos veces la misma locución
function idb(){ return new Promise((res,rej)=>{ const o = indexedDB.open('premiazo',1); o.onupgradeneeded=()=>o.result.createObjectStore('kv'); o.onsuccess=()=>res(o.result); o.onerror=()=>rej(o.error); }); }
async function kvGet(k){ try{ const db=await idb(); return await new Promise(r=>{ const q=db.transaction('kv').objectStore('kv').get(k); q.onsuccess=()=>r(q.result); q.onerror=()=>r(null); }); }catch(e){ return null; } }
async function kvSet(k,v){ try{ const db=await idb(); db.transaction('kv','readwrite').objectStore('kv').put(v,k); }catch(e){} }
async function sha(s){ const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); }

async function ttsWithTimestamps(text, voiceId){
  const settings = {stability:0.38, similarity_boost:0.8, style:0.55, use_speaker_boost:true, speed:1.08};
  const key = 'tts_'+await sha(JSON.stringify([text,voiceId,'eleven_multilingual_v2',settings]));
  let j = await kvGet(key);
  if(!j){
    const r = await el('/v1/text-to-speech/'+encodeURIComponent(voiceId)+'/with-timestamps?output_format=mp3_44100_128', {text, model_id:'eleven_multilingual_v2', voice_settings:settings});
    j = await r.json(); await kvSet(key, j);
  }
  const al = j.normalized_alignment || j.alignment;
  const bin = Uint8Array.from(atob(j.audio_base64), c=>c.charCodeAt(0));
  return { blob:new Blob([bin],{type:'audio/mpeg'}), words: wordsFromAlignment(al) };
}
function wordsFromAlignment(al){
  const out=[]; let cur='', s=null, e=0;
  al.characters.forEach((ch,i)=>{
    if(/\s/.test(ch)){ if(cur){ out.push({w:cur,s,e}); cur=''; s=null; } return; }
    if(s===null) s = al.character_start_times_seconds[i];
    cur += ch; e = al.character_end_times_seconds[i];
  });
  if(cur) out.push({w:cur,s,e});
  return out;
}
async function elAudio(path, body, cacheKey){
  const key = cacheKey ? 'aud_'+await sha(cacheKey) : null;
  if(key){ const c = await kvGet(key); if(c) return c; }
  const r = await el(path, body, 'audio/mpeg'); const blob = await r.blob();
  if(key) await kvSet(key, blob);
  return blob;
}

// ---------------- Google Drive ----------------
let tokenClient = null;
function login(){
  return new Promise((res, rej) => {
    if(!S.gid) return rej(new Error('Falta el ID de cliente de Google (Ajustes).'));
    if(!window.google || !google.accounts || !google.accounts.oauth2) return rej(new Error('No se ha podido cargar el acceso de Google. Recarga la página.'));
    if(!tokenClient) tokenClient = google.accounts.oauth2.initTokenClient({client_id:S.gid, scope:'https://www.googleapis.com/auth/drive', callback:()=>{}});
    tokenClient.callback = r => { if(r.error) return rej(new Error(r.error)); st.token = r.access_token; st.tokenExp = Date.now()+ (r.expires_in-60)*1000; setStatus(); res(); };
    tokenClient.requestAccessToken({prompt: st.token ? '' : 'consent'});
  });
}
async function gfetch(url, opts={}){
  if(!st.token || Date.now()>st.tokenExp) await login();
  opts.headers = Object.assign({Authorization:'Bearer '+st.token}, opts.headers||{});
  const r = await fetch(url, opts);
  if(!r.ok) throw new Error('Drive '+r.status+': '+(await r.text()).slice(0,200));
  return r;
}
const DQ = 'https://www.googleapis.com/drive/v3/files';
async function dList(q){
  let files=[], page='';
  do{
    const r = await gfetch(DQ+'?q='+encodeURIComponent(q)+'&fields=nextPageToken,files(id,name,mimeType,size)&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true'+(page?'&pageToken='+page:''));
    const j = await r.json(); files = files.concat(j.files||[]); page = j.nextPageToken||'';
  } while(page);
  return files;
}
async function dFindFolder(name, parent){
  const q = "name='"+name.replace(/'/g,"\\'")+"' and mimeType='application/vnd.google-apps.folder' and trashed=false"+(parent?" and '"+parent+"' in parents":'');
  const f = await dList(q); return f[0] ? f[0].id : null;
}
async function dWalk(id, path){
  const kids = await dList("'"+id+"' in parents and trashed=false");
  for(const k of kids){
    if(k.mimeType==='application/vnd.google-apps.folder'){ st.folderIds[path? path+'/'+k.name : k.name] = k.id; await dWalk(k.id, path? path+'/'+k.name : k.name); }
    else st.lib.push({id:'d_'+k.id, did:k.id, name:k.name, folder:path||'(raíz)', size:+k.size||0, src:'drive'});
  }
}
async function dBlob(item){
  if(cache.has(item.id)) return cache.get(item.id);
  let blob;
  if(item.src==='local') blob = item.file;
  else blob = await (await gfetch(DQ+'/'+item.did+'?alt=media&supportsAllDrives=true')).blob();
  const v = {blob, url:URL.createObjectURL(blob)}; cache.set(item.id, v); return v;
}
async function dUpload(blob, name, folderPath){
  let parent = st.folderIds[folderPath];
  if(!parent){ const root = st.folderIds[''] || await dFindFolder(S.root); if(!root) throw new Error('No encuentro la carpeta '+S.root+' en tu Drive.'); parent = await dFindFolder(folderPath.split('/').pop(), root) || root; }
  return dUploadTo(blob, name, parent);
}
async function dUploadTo(blob, name, parent){
  const meta = {name, parents:[parent]};
  const init = await gfetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {method:'POST', headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':blob.type||'application/octet-stream'}, body:JSON.stringify(meta)});
  const loc = init.headers.get('Location');
  const r = await fetch(loc, {method:'PUT', headers:{'Content-Type':blob.type||'application/octet-stream'}, body:blob});
  if(!r.ok) throw new Error('Subida fallida '+r.status);
  return r.json();
}
$('btnLogin').onclick = async () => { S.gid = $('setGid').value.trim(); try{ await login(); $('gTest').textContent='Conectado ✓'; $('gTest').className='hint ok'; }catch(e){ $('gTest').textContent=e.message; $('gTest').className='hint bad'; } };
async function loadDrive(){
    $('libInfo').textContent='Leyendo tu Drive…';
    const root = await dFindFolder(S.root);
    if(!root) throw new Error('No encuentro la carpeta "'+S.root+'" en tu Drive.');
    st.lib = st.lib.filter(x=>x.src==='local'); st.folderIds = {'':root};
    await dWalk(root, '');
    renderLib(); toast('Biblioteca cargada: '+st.lib.length+' archivos.');
}
$('btnDriveLoad').onclick = async () => { const b=$('btnDriveLoad'); b.disabled=true; try{ await loadDrive(); }catch(e){ $('libInfo').textContent = e.message; } b.disabled=false; };
async function dEnsureFolder(name, parent){
  const f = await dFindFolder(name, parent); if(f) return f;
  const r = await gfetch(DQ+'?supportsAllDrives=true', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, mimeType:'application/vnd.google-apps.folder', parents:[parent]})});
  return (await r.json()).id;
}
$('localFiles').onchange = e => {
  for(const f of e.target.files) st.lib.push({id:'l_'+f.name+'_'+f.size, name:f.name, folder:'(ordenador)', size:f.size, src:'local', file:f});
  renderLib(); e.target.value='';
};

// ---------------- Biblioteca UI ----------------
function renderLib(){
  const q = $('libSearch').value.trim().toUpperCase(), fsel = $('libFolder').value;
  const folders = [...new Set(st.lib.map(x=>x.folder))].sort();
  $('libFolder').innerHTML = '<option value="">Todas las carpetas</option>' + folders.map(f=>'<option'+(f===fsel?' selected':'')+'>'+esc(f)+'</option>').join('');
  const items = st.lib.filter(x => (!q || x.name.toUpperCase().includes(q)) && (!fsel || x.folder===fsel));
  $('libInfo').textContent = st.lib.length ? items.length+' de '+st.lib.length+' archivos' : 'Biblioteca vacía.';
  $('libGrid').innerHTML = items.slice(0,400).map(x => '<div class="item"><div class="nm">'+esc(x.name)+'</div><div class="fd">'+esc(x.folder)+(x.size?' · '+(x.size/1048576).toFixed(1)+' MB':'')+'</div><div class="acts">'+(isVideo(x.name)?'<button class="ghost" data-v="'+esc(x.id)+'">Ver</button><button data-a="'+esc(x.id)+'">＋</button>':'')+'</div></div>').join('');
  const skins = [...new Set(st.lib.filter(x=>x.folder.startsWith('02_SKINS')||x.folder.startsWith('03_')).map(x=>skinOf(x.name)))].sort();
  $('skinlist').innerHTML = skins.map(s=>'<option value="'+esc(s)+'">').join('');
  const mus = st.lib.filter(x=>isAudio(x.name) && x.folder.startsWith('06_'));
  $('libMusic').innerHTML = '<option value="">— ninguna —</option>' + mus.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join('');
}
$('libSearch').oninput = renderLib; $('libFolder').onchange = renderLib;
let previewItem = null;
$('libGrid').addEventListener('click', async e => {
  const b = e.target.closest('button'); if(!b) return;
  const it = st.lib.find(x=>x.id===(b.dataset.v||b.dataset.a)); if(!it) return;
  if(b.dataset.a){ addToBasket(it); return; }
  b.disabled = true; try{ const c = await dBlob(it); previewItem = it; $('previewVideo').src = c.url; $('previewName').textContent = it.name; $('previewBox').hidden=false; $('previewVideo').play().catch(()=>{}); }catch(err){ toast(err.message); } b.disabled=false;
});
$('btnAddPreview').onclick = () => { if(previewItem) addToBasket(previewItem, +$('previewVideo').currentTime.toFixed(1)); };
function addToBasket(it, start=0){ st.basket.push({item:it, start, dur:0, frame:'auto'}); renderBasket(); toast('Añadido: '+it.name); if(!$('skin').value) $('skin').value = skinOf(it.name); }
function renderBasket(){
  $('basket').innerHTML = st.basket.map((b,i)=>'<li><span class="nm">'+(i===0?'🎣 ':i===st.basket.length-1&&i>0?'🏁 ':'')+esc(b.item.name)+'</span><input type="number" step="0.1" min="0" value="'+b.start+'" data-i="'+i+'" title="Segundo de inicio"><select data-f="'+i+'" title="Encuadre">'+[['auto','Auto'],['L','Izquierda'],['C','Centro'],['R','Derecha'],['full','Entero']].map(o=>'<option value="'+o[0]+'"'+(b.frame===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select><button class="ghost" data-up="'+i+'">↑</button><button class="ghost" data-del="'+i+'">✕</button></li>').join('') || '<li><span class="nm">Sin clips todavía</span></li>';
}
$('basket').addEventListener('input', e => { const i=e.target.dataset.i; if(i!==undefined) st.basket[i].start = +e.target.value||0; });
$('basket').addEventListener('change', e => { const f=e.target.dataset.f; if(f!==undefined) st.basket[f].frame = e.target.value; });
$('basket').addEventListener('click', e => {
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.del!==undefined) st.basket.splice(+b.dataset.del,1);
  if(b.dataset.up!==undefined && +b.dataset.up>0){ const i=+b.dataset.up; [st.basket[i-1],st.basket[i]]=[st.basket[i],st.basket[i-1]]; }
  renderBasket();
});

// Rellena el Short con clips de la skin: presentación (gancho), gameplay con la skin y taquilla (revelación)
const vids = () => st.lib.filter(x => isVideo(x.name));
const shuffle = a => a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
function skinClips(skin, nIntro=2, nGame=2, nReveal=1){
  const base = skin.split('_')[0];
  const mine = vids().filter(x => !/^(REACCION|EJEMPLO|REF|MAPA)__/.test(x.name) && (skinOf(x.name)===skin || skinOf(x.name).startsWith(base+'_Y_')));
  const pick = (re, n, not=[]) => shuffle(mine.filter(x=>re.test(x.folder+'/'+x.name) && !not.includes(x))).slice(0,n);
  const game = pick(/Gameplay_con_la_skin|__(gameplay|victoria|lobby)/i, nGame);
  let intro = pick(/__(estilo|pose|fantasma|gesto|girando|inicio|cuerpo)/i, nIntro, game);
  if(!intro.length) intro = pick(/./, nIntro, game);
  const reveal = pick(/__(taquilla|juntos|recompensa|mision|final)/i, nReveal, [...intro, ...game]);
  return {intro, game, reveal};
}
const skinsWith = re => [...new Set(vids().filter(x=>re.test(x.folder+'/'+x.name)).map(x=>skinOf(x.name)))];
// Clips para cada tipo de Short (devuelve la lista de clips y la skin usada)
function clipsFor(cat, skin){
  const B = it => ({item:it, start:0.5, dur:0, frame:'auto'});
  if(cat==='FREE_TOKEN'){
    const t = vids().filter(x=>/01_TOKEN\/Clips_del_juego/.test(x.folder));
    const order = [/animacion|aparece/, /mapa_|maquinas/, /mapa_|cofres/, /pantalla_reclamar/];
    const out=[]; order.forEach(re=>{ const c = shuffle(t.filter(x=>re.test(x.name) && !out.includes(x)))[0]; if(c) out.push(c); });
    return {skin:'TOKEN', clips:out.map(B)};
  }
  if(cat==='MAP_REWARD'){
    const canTok = verified('token_pirata_en_mapa'), canXp = verified('xp_en_mapa');
    const reward = canTok && canXp ? (Math.random()<0.5?'token':'xp') : (canTok?'token':'xp');
    // Nunca pantallas de recompensa de la skin aquí: solo gameplay con la skin o la máquina de nuestro mapa
    let intro = skinClips(skin,0,1,0).game;
    if(!intro.length){ const m = vids().find(x=>/^MAPA__gameplay_0[23]/.test(x.name)) || shuffle(vids().filter(x=>/^MAPA__gameplay/.test(x.name)))[0]; intro = m ? [m] : []; skin = ''; }
    let rev = null;
    if(reward==='token'){ const tk = vids().filter(x=>/01_TOKEN\/Clips_del_juego/.test(x.folder)); rev = tk.find(x=>/animacion_you_found_en_mapa/.test(x.name)) || shuffle(tk.filter(x=>/you_found|mapa_/.test(x.name)))[0]; }
    else rev = vids().find(x=>/^MAPA__gameplay_01/.test(x.name)) || shuffle(vids().filter(x=>/^MAPA__gameplay/.test(x.name)))[0];
    const clips = [...intro.map(B)]; if(rev) clips.push({item:rev, start: reward==='xp' && /gameplay_01/.test(rev.name) ? 5 : 0.3, dur:0, frame:'auto'});
    return {skin, clips, reward};
  }
  if(cat==='MACHINE_SKIN'){
    // 1) acercarse a la máquina / caja fuerte con el botón X  2) sale la skin  (luego el montaje añade menú+código y gameplay del mapa)
    const machs = vids().filter(x=>/^MAPA__(maquina|caja|registradora|boton)/i.test(x.name));
    let mach = shuffle(machs)[0], machStart = 0.3;
    if(!mach){ mach = vids().find(x=>/^MAPA__gameplay_01/.test(x.name)) || shuffle(vids().filter(x=>/^MAPA__gameplay/.test(x.name)))[0]; machStart = 3.5; }
    const mine = vids().filter(x => !/^(REACCION|EJEMPLO|REF|MAPA)__/.test(x.name) && skinOf(x.name)===skin);
    const sale = shuffle(mine.filter(x=>/Cuando_sale/i.test(x.folder) || /__(recompensa|sale|desbloque|restaurad|taquilla)/i.test(x.name)));
    const otras = shuffle(mine.filter(x=>!sale.includes(x) && /__(estilo|pose|girando|cuerpo|gameplay)/i.test(x.name)));
    const rev = [...sale, ...otras].slice(0,2);
    if(!mach || !rev.length) return {skin, clips:[]};
    return {skin, clips:[{item:mach, start:machStart, dur:0, frame:'auto'}, ...rev.map(B)]};
  }
  if(cat==='MAP_DISCOVERY'){
    const g = shuffle(vids().filter(x=>/^MAPA__gameplay/.test(x.name))).slice(0,3);
    return {skin:'', clips:g.map(B)};
  }
  if(cat==='STREAMER_REACTION'){
    const withR = skinsWith(/^03_REACCIONES\/Videos/);
    const rs = withR.includes(skin) ? skin : shuffle(withR)[0];
    const reac = vids().filter(x=>/^REACCION__/.test(x.name) && x.name.split('__')[1]===rs);
    const ini = reac.find(x=>/inicio|sale/.test(x.name)) || reac[0], fin = reac.find(x=>/final/.test(x.name) && x!==ini);
    const sc = skinClips(rs, 1, 1, 0);
    return {skin:rs, clips:[...sc.intro, ini, ...sc.game, fin].filter(Boolean).map(B)};
  }
  if(cat==='SKIN_BUNDLE' || cat==='TOP_COMPARISON'){
    let out = [];
    if(cat==='TOP_COMPARISON') out = shuffle(vids().filter(x=>/Comparaciones/.test(x.folder))).slice(0,1);
    const others = shuffle(skinsWith(/02_SKINS\/(Cuando_sale|Gameplay_con)/).filter(k=>!k.includes('_Y_'))).slice(0, 4-out.length);
    others.forEach(k=>{ const c = skinClips(k,1,0,0).intro[0]; if(c) out.push(c); });
    return {skin:'', clips:out.map(B)};
  }
  const sc = skinClips(skin); // FREE_SKIN y el resto
  return {skin, clips:[...sc.intro, ...sc.game, ...sc.reveal].map(B)};
}
$('btnAutoClips').onclick = () => {
  const skin = ($('skin').value||'').trim().toUpperCase().replace(/\s+/g,'_');
  if(!st.lib.length) return toast('Carga primero la Biblioteca.');
  const r = clipsFor($('cat').value, skin);
  if(!r.clips.length) return toast('No encuentro clips para esto en la biblioteca.');
  st.basket = r.clips; st.reward = r.reward || null; if(r.skin && r.skin!=='TOKEN') $('skin').value = r.skin; renderBasket(); makeScript(false);
  toast(r.clips.length+' clips añadidos.');
};

// ---------------- Categorías y guion ----------------
const CATS = window.PZ_CATS;
$('cat').innerHTML = Object.entries(CATS).map(([k,v])=>'<option value="'+k+'">'+esc(v.label)+'</option>').join('');
const hist = load('hist', []);
function checkCat(){ const used = hist.filter(h=>h.date===today() && h.lang===$('lang').value).map(h=>h.cat); $('catWarn').textContent = used.includes($('cat').value) ? '⚠️ Ya hiciste hoy un Short de esta categoría en este idioma.' : (used.length? 'Hoy ya: '+used.map(c=>CATS[c].label).join(', '):''); }
$('cat').onchange = checkCat; $('lang').onchange = checkCat; checkCat();
$('btnSugerir').onclick = () => {
  const usedToday = hist.filter(h=>h.date===today()).map(h=>h.skin);
  const prio = ['LOBO_MUERTE','GATO_CON_BOTAS','TRAVIS_SCOTT','RENEGADA','LUFFY','ALASTOR','CHARLIE','FREDDY_FNAF','CRASH','SILVER','SORA','KIRIKO','GOKU_BLACK','ACE'];
  const avail = new Set(st.lib.map(x=>skinOf(x.name)));
  const pick = prio.find(s => !usedToday.includes(s) && (avail.size===0 || avail.has(s))) || prio[0];
  $('skin').value = pick; $('libSearch').value = pick.split('_')[0]; renderLib(); toast('Sugerida: '+pick+'. Mira la Biblioteca para añadir sus clips.');
};
function fill(t){ const skin = ($('skin').value||'').replace(/_/g,' ').trim() || 'esta skin'; return t.replace(/\{SKIN\}/g, skin).replace(/\{CODE\}/g, S.code).replace(/\{MAP\}/g, S.map); }
function makeScript(next){
  const lang=$('lang').value, cat=$('cat').value;
  const all = (window.PZ_TEMPLATES[lang]||{})[cat]||[];
  const ok = all.filter(t => t.needs.every(verified) && (!t.reward || !st.reward || t.reward===st.reward));
  if(!ok.length){ $('factsNote').textContent='No hay plantilla con hechos comprobados para esta categoría. Revisa Ajustes → Hechos.'; $('factsNote').className='hint bad'; return; }
  if(next) st.tplIdx++;
  const t = ok[st.tplIdx % ok.length];
  $('hook').value = fill(t.hook); $('voiceText').value = fill(t.voice); $('screenTitle').value = fill(t.title); st.coverText = fill(t.cover); $('coverText').value = st.coverText; st.revealText = t.reveal ? fill(t.reveal) : ''; st.reveal2Text = t.reveal2 ? fill(t.reveal2).toUpperCase() : ''; st.midText = t.mid ? fill(t.mid) : '';
  $('factsNote').textContent = t.needs.length ? 'Usa hechos comprobados: '+t.needs.join(', ') : 'Sin afirmaciones de recompensa.'; $('factsNote').className='hint ok';
  st.voice=null; st.words=[]; $('voicePlayer').hidden=true;
}
$('btnGuion').onclick = () => makeScript(false); $('btnOtro').onclick = () => makeScript(true);

// ---------------- Audio ----------------
$('btnVoz').onclick = async () => {
  const b=$('btnVoz'); b.disabled=true; $('audioNote').textContent='Generando voz…'; $('audioNote').className='hint';
  try{
    const voice = $('lang').value==='en' ? S.voiceEn : S.voiceEs;
    const r = await ttsWithTimestamps($('voiceText').value.trim(), voice);
    st.voice = r.blob; st.words = r.words;
    $('voicePlayer').src = URL.createObjectURL(r.blob); $('voicePlayer').hidden=false;
    $('audioNote').textContent = 'Voz lista: '+r.words.length+' palabras, '+(r.words.length? r.words[r.words.length-1].e.toFixed(1):'0')+' s.'; $('audioNote').className='hint ok';
  }catch(e){ $('audioNote').textContent=e.message; $('audioNote').className='hint bad'; }
  b.disabled=false;
};
async function decode(ctx, blob){ return await ctx.decodeAudioData(await blob.arrayBuffer()); }
function fakeWords(text, start, dur){ // sin ElevenLabs: reparte las palabras a ritmo de lectura
  const ws = text.split(/\s+/).filter(Boolean); const step = Math.min(0.42, dur/Math.max(ws.length,1));
  return ws.map((w,i)=>({w, s:start+i*step, e:start+(i+1)*step}));
}

// ---------------- Montaje ----------------
const cv = $('cv'), cx = cv.getContext('2d');
const cxRef = { c: cx };
const small = document.createElement('canvas'); small.width=54; small.height=96; const sx = small.getContext('2d');
function loadVideo(url){ return new Promise((res,rej)=>{ const v=document.createElement('video'); v.muted=true; v.playsInline=true; v.preload='auto'; v.src=url; v.onloadeddata=()=>res(v); v.onerror=()=>rej(new Error('No se pudo leer un vídeo')); }); }
function seek(v,t){ return new Promise(r=>{ if(Math.abs(v.currentTime-t)<0.02) return r(); v.onseeked=()=>{v.onseeked=null;r();}; v.currentTime=t; }); }
function frameX(name, mode){
  if(mode==='L') return 0.27; if(mode==='C') return 0.5; if(mode==='R') return 0.66;
  const n = name.toLowerCase();
  if(/estilo|pose|fantasma|edit/.test(n)) return 0.25;       // «Editar estilo»: skin a la izquierda
  if(/taquilla|locker|juntos|mochila|pico|companero/.test(n)) return 0.6; // taquilla: skin a la derecha del centro
  if(/gameplay|victoria|lobby/.test(n)) return 0.45;          // tercera persona
  return 0.5;
}
function drawVideo(v, fx=0.45, full=false){
  const vw=v.videoWidth, vh=v.videoHeight; if(!vw) return;
  // fondo: el mismo clip, muy ampliado y desenfocado (barato: se pinta pequeño y se escala)
  sx.drawImage(v, 0, 0, 54, 96); cx.imageSmoothingEnabled=true; cx.drawImage(small, 0, 0, W, H); cx.fillStyle='rgba(0,0,0,.45)'; cx.fillRect(0,0,W,H);
  // panel 3:4 centrado (en horizontales se encuadra un poco a la izquierda, donde suele ir el personaje)
  const PW=1080, PH=1440, PY=240, ar=PW/PH; let sw, sh, sxx, syy;
  if(full && vw/vh > 1.2){ const dh = PW*vh/vw*1.25, dw = PW*1.25; cx.drawImage(v, (PW-dw)/2, PY+(PH-dh)/2, dw, dh); return; }
  if(vw/vh > ar){ sh=vh; sw=vh*ar; sxx=Math.max(0,Math.min(vw-sw, vw*fx-sw/2)); syy=0; }
  else { sw=vw; sh=vw/ar; sxx=0; syy=(vh-sh)/2; }
  cx.drawImage(v, sxx, syy, sw, sh, 0, PY, PW, PH);
}
function txt(t, x, y, size, fill, opts={}){
  const cx = cxRef.c;
  cx.save(); cx.font = size+'px "Luckiest Guy", Impact, sans-serif'; cx.textAlign='center'; cx.textBaseline='middle';
  let s=size; while(cx.measureText(t).width > (opts.maxW||1000) && s>30){ s-=4; cx.font = s+'px "Luckiest Guy", Impact, sans-serif'; }
  if(opts.rot) { cx.translate(x,y); cx.rotate(opts.rot); x=0; y=0; }
  cx.lineJoin='round'; cx.lineWidth = Math.max(8, s*0.16); cx.strokeStyle='rgba(0,0,0,.5)'; cx.strokeText(t, x, y+Math.round(s*0.07));
  cx.strokeStyle='#000'; cx.strokeText(t, x, y); cx.fillStyle=fill; cx.fillText(t, x, y); cx.restore();
}
function captionGroups(words){ // grupos de máx. 3 palabras, cortando en pausas > 0,2 s o puntuación fuerte
  const g=[]; let cur=[];
  words.forEach((w,i)=>{ cur.push(w); const next=words[i+1]; if(cur.length===3 || !next || next.s-w.e>0.2 || /[.!?¡¿,;:]$/.test(w.w)){ g.push(cur); cur=[]; } });
  return g;
}
function drawCaption(groups, t, accent){
  const g = groups.find(gr => t>=gr[0].s-0.05 && t<=gr[gr.length-1].e+0.15); if(!g) return;
  cx.save(); cx.font='96px "Luckiest Guy", Impact, sans-serif';
  const parts = g.map(w=>w.w.toUpperCase()); const sp = 34;
  let widths = parts.map(p=>cx.measureText(p).width); let total = widths.reduce((a,b)=>a+b,0)+sp*(parts.length-1);
  const scale = Math.min(1, 980/total); let x = 540 - total*scale/2; const y = 1560;
  parts.forEach((p,i)=>{ const w=g[i]; const on = t>=w.s && t<=w.e+0.05; const size = Math.round(96*scale); txt(p, x+widths[i]*scale/2, y + (on?-6:0), size, on?accent:'#ffffff', {maxW:9999}); x += (widths[i]+sp)*scale; });
  cx.restore();
}
function plan(total, menuItem, mapItems){
  const segs=[]; const b = st.basket; const closing = 2.2;
  let t = 0;
  const pre = b.length>1 ? b.slice(0,-1) : b.slice();           // gancho + desarrollo
  const last = b.length>1 ? b[b.length-1] : null;               // revelación
  const per = st.fmt ? Math.min(3.2, Math.max(1.2, st.fmt.cut)) : 2.2; const preDur = Math.min(10, Math.max(3, pre.length*per));
  pre.forEach(x=>{ const d = preDur/pre.length; segs.push({item:x.item, start:x.start, dur:d, frame:x.frame}); t+=d; });
  const cuts = S.menuCuts.split(',').map(s=>s.trim().split(':').map(Number)).filter(a=>a.length===2 && !isNaN(a[0]) && !isNaN(a[1]));
  if(menuItem && cuts.length){ cuts.forEach(([s,d])=>{ segs.push({item:menuItem, start:s, dur:d, menu:true}); t+=d; }); }
  const revDur = last ? 2.0 : 0;
  let left = total - t - revDur - closing;
  if(mapItems.length && left>0.5){ const n = Math.max(1, Math.min(mapItems.length, Math.round(left/(st.fmt? Math.max(1.2, st.fmt.cut) : 2.5)))); const seed = [...today()].reduce((a,c)=>a+c.charCodeAt(0),0);
    for(let i=0;i<n;i++){ const it = mapItems[(seed+i)%mapItems.length]; segs.push({item:it, start:2+((seed*7+i*13)%8), dur:left/n, map:true}); } t+=left; left=0; }
  if(last){ segs.push({item:last.item, start:last.start, dur:revDur+Math.max(0,left), frame:last.frame, reveal:true}); t+=revDur+Math.max(0,left); }
  const endItem = menuItem && cuts.length ? {item:menuItem, start:cuts[cuts.length-1][0], dur:closing, closing:true} : (segs.length ? Object.assign({}, segs[segs.length-1], {dur:closing, closing:true}) : null);
  if(endItem) segs.push(endItem);
  return segs;
}
// Formato «Máquina → sale skin»:
// buscar el código en el menú → gameplay del mapa → AL FINAL: máquina/caja fuerte con la X → sale la skin → cierre con código
const MACH_T = 2.0, SKIN_T = [2.6, 1.6];
function planMachine(total, menuItem, mapItems){
  const segs=[]; const b = st.basket; const closing = 2.2; let t = 0;
  const [mach, ...skins] = b;
  const cuts = S.menuCuts.split(',').map(s=>s.trim().split(':').map(Number)).filter(a=>a.length===2 && !isNaN(a[0]) && !isNaN(a[1]));
  if(menuItem && cuts.length){ cuts.forEach(([s,d])=>{ segs.push({item:menuItem, start:s, dur:d, menu:true}); t+=d; }); }
  const tail = (mach?MACH_T:0) + skins.reduce((a,x,i)=>a+(SKIN_T[i]||1.4),0);
  let left = total - t - tail - closing;
  if(left > 0.3 && mapItems.length){ const n = Math.max(1, Math.min(mapItems.length, Math.round(left/2.4))); const seed = [...today()].reduce((a,c)=>a+c.charCodeAt(0),0);
    for(let i=0;i<n;i++){ const it = mapItems[(seed+i)%mapItems.length]; segs.push({item:it, start:2+((seed*7+i*13)%8), dur:left/n, map:true}); } t+=left; left=0; }
  if(mach){ segs.push({item:mach.item, start:mach.start, dur:MACH_T + Math.max(0,left), frame:mach.frame, machine:true}); t+=MACH_T+Math.max(0,left); }
  skins.forEach((x,i)=>{ const d = SKIN_T[i] || 1.4; segs.push({item:x.item, start:x.start, dur:d, frame:x.frame, reveal:true}); t+=d; });
  const endItem = menuItem && cuts.length ? {item:menuItem, start:cuts[cuts.length-1][0], dur:closing, closing:true} : (segs.length ? Object.assign({}, segs[segs.length-1], {dur:closing, closing:true}) : null);
  if(endItem) segs.push(endItem);
  return segs;
}
// Botón X de Xbox (azul, con pulso) que aparece justo antes de que salga la skin
function drawXButton(k, pressed){
  const x=540, y=1150, r = 95*(pressed?0.85:(1+0.08*Math.sin(k*Math.PI*6)));
  cx.save();
  cx.globalAlpha = Math.min(1, k*4);
  cx.beginPath(); cx.arc(x, y, r+22+18*((k*3)%1), 0, Math.PI*2); cx.strokeStyle='rgba(255,255,255,'+(0.55*(1-((k*3)%1)))+')'; cx.lineWidth=10; cx.stroke();
  cx.beginPath(); cx.arc(x, y+8, r, 0, Math.PI*2); cx.fillStyle='rgba(0,0,0,.45)'; cx.fill();
  cx.beginPath(); cx.arc(x, y, r, 0, Math.PI*2); const g = cx.createRadialGradient(x-30,y-30,10,x,y,r); g.addColorStop(0,'#5aa8ff'); g.addColorStop(1,'#0b5fd1'); cx.fillStyle=g; cx.fill();
  cx.lineWidth=8; cx.strokeStyle='#ffffff'; cx.stroke();
  cx.font = Math.round(r*1.15)+'px "Luckiest Guy", Impact, sans-serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillStyle='#ffffff'; cx.fillText('X', x, y+Math.round(r*0.08));
  cx.restore();
}
const SR = 48000;
async function pickEncoder(hw='no-preference'){
  if(!(window.VideoEncoder && window.AudioEncoder && window.VideoFrame && window.Mp4Muxer)) return null;
  let vcfg=null;
  for(const codec of ['avc1.640028','avc1.4d0028','avc1.42e028','avc1.640032']){
    const c = {codec, width:W, height:H, bitrate:12e6, framerate:FPS, avc:{format:'avc'}, hardwareAcceleration:hw};
    try{ if((await VideoEncoder.isConfigSupported(c)).supported){ vcfg=c; break; } }catch(e){}
  }
  if(!vcfg) return null;
  for(const [codec,aMux] of [['mp4a.40.2','aac'],['opus','opus']]){
    const c = {codec, sampleRate:SR, numberOfChannels:2, bitrate:192000};
    try{ if((await AudioEncoder.isConfigSupported(c)).supported) return {vcfg, acfg:c, aMux}; }catch(e){}
  }
  return null;
}
// Prueba los modos de grabación en orden y recuerda el que funciona en este ordenador
const REC_MODES = ['wc', 'wc-sw', 'mr'];
async function render(){
  let modes = REC_MODES.slice(); const saved = load('recMode', null);
  if(saved && modes.includes(saved)) modes = [saved, ...modes.filter(m=>m!==saved)];
  let lastErr = null;
  for(const m of modes){
    try{
      const blob = await renderOnce(m);
      if(blob && blob.size > 100000){ save('recMode', m); return blob; }
      lastErr = new Error('el vídeo salió vacío ('+(blob?blob.size:0)+' bytes) en modo '+m);
    }catch(e){ lastErr = e; }
    toast('La grabación falló ('+lastErr.message+'). Reintento con otro modo…', 5000);
    st.outName=''; st.out=null;
  }
  throw new Error('No se pudo grabar el vídeo: '+(lastErr?lastErr.message:'error desconocido'));
}
async function renderOnce(mode){
  if(!st.basket.length) throw new Error('Añade al menos un clip al Short (pestaña Biblioteca).');
  if(!$('voiceText').value.trim()) makeScript(false);
  await document.fonts.load('96px "Luckiest Guy"');
  const prog = $('renderProg'); prog.textContent='Preparando clips…';
  const menuItem = $('useMenu').checked ? st.lib.find(x=>/MAPA__menu_buscar_codigo/i.test(x.name)) : null;
  const mapItems = $('useMap').checked ? st.lib.filter(x=>/^MAPA__gameplay/i.test(x.name)) : [];
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  let voiceBuf=null, words=st.words;
  if(st.voice){ voiceBuf = await decode(ctx, st.voice); }
  const voiceDur = voiceBuf ? voiceBuf.duration : 11;
  const isMach = $('cat').value==='MACHINE_SKIN';
  const nPre = Math.max(1, st.basket.length-1);
  const needed = isMach
    ? MACH_T + SKIN_T.slice(0, Math.max(0, st.basket.length-1)).reduce((a,b)=>a+b,0) + (menuItem?2.9:0) + (mapItems.length?5:0) + 2.2
    : Math.min(9, Math.max(3, nPre*2.2)) + (menuItem?2.9:0) + (mapItems.length?3:0) + (st.basket.length>1?2:0) + 2.2;
  const total = Math.round(Math.min(28, Math.max(15, voiceDur + 0.25 + 0.6 + 2.5, needed, st.fmt ? Math.min(28, st.fmt.dur) : 0))*100)/100;
  if(!voiceBuf) words = fakeWords($('voiceText').value, 2.1, total-2.1-2.6);
  else words = words.map(w=>({w:w.w, s:w.s+0.25, e:w.e+0.25}));
  const segs = isMach ? planMachine(total, menuItem, mapItems) : plan(total, menuItem, mapItems);
  // música y efectos
  const cat = CATS[$('cat').value];
  let musicBuf=null, sfxBuf=null;
  try{
    if($('libMusic').value){ const it = st.lib.find(x=>x.id===$('libMusic').value); musicBuf = await decode(ctx, (await dBlob(it)).blob); }
    else if($('useMusic').checked && S.el){ prog.textContent='Componiendo música (ElevenLabs)…'; musicBuf = await decode(ctx, await elAudio('/v1/music?output_format=mp3_44100_128', {prompt:cat.music+', short form video background, no vocals', music_length_ms:Math.ceil(total*1000)+1000, model_id:'music_v1'}, 'music|'+cat.music+'|'+Math.ceil(total))); }
    if($('useSfx').checked && S.el){ prog.textContent='Creando efecto de transición…'; sfxBuf = await decode(ctx, await elAudio('/v1/sound-generation', {text:'quick punchy whoosh transition for gaming video', duration_seconds:0.8, prompt_influence:0.6}, 'sfx|whoosh1')); }
  }catch(e){ toast('Audio extra no disponible: '+e.message, 6000); }
  // vídeos
  const vids = new Map();
  for(const s of segs){ if(!vids.has(s.item.id)){ prog.textContent='Descargando '+s.item.name+'…'; vids.set(s.item.id, await loadVideo((await dBlob(s.item)).url)); } }
  // grabación: preferimos WebCodecs + MP4 (H.264/AAC, se abre en Windows y en cualquier móvil);
  // si el navegador no puede, usamos MediaRecorder como antes.
  function scheduleAudio(ac, out, t0){
    const master = ac.createGain(); master.connect(out);
    master.gain.setValueAtTime(1, t0); master.gain.setValueAtTime(1, t0+total-1); master.gain.linearRampToValueAtTime(0, t0+total);
    if(voiceBuf){ const s=ac.createBufferSource(); s.buffer=voiceBuf; s.connect(master); s.start(t0+0.25); }
    if(musicBuf){ const s=ac.createBufferSource(); s.buffer=musicBuf; const g=ac.createGain(); g.gain.value = voiceBuf?0.16:0.45; if(voiceBuf){ g.gain.setValueAtTime(0.16,t0); g.gain.setValueAtTime(0.16,t0+total-2.3); g.gain.linearRampToValueAtTime(0.4,t0+total-2.0);} s.connect(g); g.connect(master); s.start(t0, 0, total); }
    let tt=0; segs.forEach((s,i)=>{ if(i>0 && sfxBuf && !s.menu){ const x=ac.createBufferSource(); x.buffer=sfxBuf; const g=ac.createGain(); g.gain.value=0.45; x.connect(g); g.connect(master); x.start(Math.max(0, t0+tt-0.15)); } tt+=s.dur; });
  }
  const enc = mode==='mr' ? null : await pickEncoder(mode==='wc-sw' ? 'prefer-software' : 'no-preference');
  if(mode!=='mr' && !enc) throw new Error('este navegador no tiene el codificador '+mode);
  let vCount=0, aCount=0;
  let rec=null, chunks=[], done=null, mime='', muxer=null, venc=null, encErr=null, mixPromise=null, t0, now;
  if(enc){
    muxer = new Mp4Muxer.Muxer({ target:new Mp4Muxer.ArrayBufferTarget(), video:{codec:'avc', width:W, height:H, frameRate:FPS}, audio:{codec:enc.aMux, numberOfChannels:2, sampleRate:SR}, fastStart:'in-memory', firstTimestampBehavior:'offset' });
    venc = new VideoEncoder({ output:(c,m)=>{ vCount++; muxer.addVideoChunk(c,m); }, error:e=>encErr=e });
    venc.configure(enc.vcfg);
    mixPromise = (async()=>{ const oc = new OfflineAudioContext(2, Math.ceil(SR*total), SR); scheduleAudio(oc, oc.destination, 0); return await oc.startRendering(); })();
    const p0 = performance.now()+50; t0 = 0; now = () => (performance.now()-p0)/1000;
    await new Promise(r=>setTimeout(r,50));
  } else {
    const dest = ctx.createMediaStreamDestination();
    const stream = cv.captureStream(FPS);
    dest.stream.getAudioTracks().forEach(tr=>stream.addTrack(tr));
    const types = ['video/mp4;codecs=avc1.640028,mp4a.40.2','video/mp4;codecs=avc1.4d002a,mp4a.40.2','video/mp4;codecs=avc1.42E01F,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm','video/mp4'];
    mime = types.find(t=>window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
    rec = new MediaRecorder(stream, {mimeType:mime, videoBitsPerSecond:14e6, audioBitsPerSecond:192e3});
    rec.ondataavailable = e=>{ if(e.data.size) chunks.push(e.data); };
    done = new Promise(r=>rec.onstop=r);
    t0 = ctx.currentTime + 0.15; scheduleAudio(ctx, dest, t0); now = () => ctx.currentTime - t0;
    await new Promise(r=>setTimeout(r, Math.max(0,(t0-ctx.currentTime)*1000-30)));
    rec.start(250);
  }
  let lastFi = -1, nFrames = 0;
  const pushFrame = t => { if(!venc) return; const fi = Math.round(t*FPS); if(fi<=lastFi || venc.encodeQueueSize>8) return; lastFi=fi;
    const vf = new VideoFrame(cv, {timestamp: Math.round(fi*1e6/FPS), duration: Math.round(1e6/FPS)}); venc.encode(vf, {keyFrame: nFrames%60===0}); vf.close(); nFrames++; };
  // bucle de dibujo en tiempo real
  const groups = captionGroups(words), accent = cat.accent;
  const hook = $('hook').value.trim().toUpperCase(), title = $('screenTitle').value.trim().toUpperCase();
  let idx=-1, segStart=0, flash=0; const starts=[]; { let a=0; segs.forEach(s=>{ starts.push(a); a+=s.dur; }); }
  await new Promise(resolve => {
    const frame = async () => {
      const t = now();
      if(t >= total){ resolve(); return; }
      let i = starts.findIndex((s,k)=> t>=s && (k===segs.length-1 || t<starts[k+1]));
      if(i<0) i=0;
      if(i!==idx){ const v=vids.get(segs[i].item.id); if(idx>=0){ const pv=vids.get(segs[idx].item.id); if(pv!==v) pv.pause(); }
        idx=i; segStart=starts[i]; try{ await seek(v, segs[i].start); v.play().catch(()=>{}); }catch(e){} if(isMach ? (segs[i].reveal && segs[i-1] && segs[i-1].machine) : (i>0 && i%2===1 && !segs[i].menu)) flash=1; }
      const v = vids.get(segs[idx].item.id);
      cx.fillStyle='#000'; cx.fillRect(0,0,W,H);
      const seg = segs[idx];
      drawVideo(v, frameX(seg.item.name, seg.frame), seg.frame==='full');
      if(seg.closing){ cx.fillStyle='rgba(0,0,0,.55)'; cx.fillRect(0,0,W,H); const k=Math.min(1,(t-segStart)/0.35); txt('CÓDIGO', 540, 760, 110, '#ffffff'); txt(S.code, 540, 900, Math.round(120+30*k), cat.accent==='#ffffff'?'#ffd400':cat.accent, {maxW:1020}); txt(S.map, 540, 1050, 90, '#ffffff'); }
      else {
        const revCat = $('cat').value==='MAP_REWARD' || isMach;
        if(seg.machine){ const left = segStart+seg.dur - t; if(left < 1.1){ drawXButton((1.1-left)/1.1, left < 0.22); } }
        if(seg.reveal && st.revealText && revCat){ const k=Math.min(1,(t-segStart)/0.3); txt(st.revealText, 540, 400, Math.round(120*(0.6+0.4*k)), accent, {maxW:1020, rot:-0.04}); if(st.reveal2Text && isMach){ const k2=Math.max(0,Math.min(1,(t-segStart-0.25)/0.3)); if(k2>0) txt(st.reveal2Text, 540, 540, Math.round(104*(0.6+0.4*k2)), '#ffffff', {maxW:1000, rot:-0.04}); } }
        else if(seg.menu && isMach && t >= 2.1){ txt('CÓDIGO', 540, 330, 96, '#ffffff', {rot:-0.03}); txt(S.code, 540, 450, 112, '#ffd400', {maxW:1020, rot:-0.03}); }
        else if(seg.map && st.midText && revCat){ txt(st.midText, 540, 400, 104, '#ffffff', {maxW:1000, rot:-0.03}); }
        if(t < 2.1){ const k=Math.min(1,t/0.25), sz=Math.round(110*(0.8+0.2*k)); const hw=hook.split(/\s+/);
          if(hook.length>16 && hw.length>2){ const h=Math.ceil(hw.length/2); txt(hw.slice(0,h).join(' '), 540, 330, sz, '#ffffff', {maxW:1000, rot:-0.03}); txt(hw.slice(h).join(' '), 540, 450, sz, accent, {maxW:1000, rot:-0.03}); }
          else txt(hook, 540, 380, sz, '#ffffff', {maxW:1000, rot:-0.03}); }
        else { txt(title, 540, 95, 92, '#ffffff'); txt(S.code, 540, 195, 76, '#ffd400'); }
        drawCaption(groups, t, accent);
      }
      if(flash>0){ cx.fillStyle='rgba(255,255,255,'+(flash*0.7)+')'; cx.fillRect(0,0,W,H); flash=Math.max(0,flash-0.25); }
      pushFrame(t);
      prog.textContent = 'Grabando… '+t.toFixed(1)+' / '+total+' s';
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  vids.forEach(v=>v.pause());
  let blob;
  if(enc){
    prog.textContent = 'Guardando el MP4…';
    const ab = await mixPromise;
    const aenc = new AudioEncoder({ output:(c,m)=>{ aCount++; muxer.addAudioChunk(c,m); }, error:e=>encErr=e });
    aenc.configure(enc.acfg);
    const L0 = ab.getChannelData(0), L1 = ab.numberOfChannels>1 ? ab.getChannelData(1) : L0, step = 4800;
    for(let off=0; off<ab.length; off+=step){ const n = Math.min(step, ab.length-off); const d = new Float32Array(n*2); d.set(L0.subarray(off,off+n),0); d.set(L1.subarray(off,off+n),n);
      const ad = new AudioData({format:'f32-planar', sampleRate:SR, numberOfFrames:n, numberOfChannels:2, timestamp:Math.round(off/SR*1e6), data:d}); aenc.encode(ad); ad.close(); }
    await venc.flush(); await aenc.flush(); venc.close(); aenc.close();
    if(encErr) throw new Error('Error al codificar el vídeo: '+encErr.message);
    if(!vCount) throw new Error('el codificador no devolvió imágenes ('+nFrames+' enviadas)');
    muxer.finalize();
    blob = new Blob([muxer.target.buffer], {type:'video/mp4'});
  } else {
    rec.stop(); await done;
    blob = new Blob(chunks, {type: mime.split(';')[0] || 'video/webm'});
  }
  ctx.close();
  if(blob.size < 100000) return blob;
  const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
  const name = today()+'_'+String(hist.filter(h=>h.date===today()).length+1).padStart(2,'0')+'_'+$('cat').value+'_'+(($('skin').value||({FREE_TOKEN:'TOKEN',SKIN_BUNDLE:'PACK',TOP_COMPARISON:'TOP'})[$('cat').value]||'MAPA').replace(/\W+/g,'_'))+'_'+$('lang').value.toUpperCase()+'.'+ext;
  st.out = blob; st.outName = name;
  $('outVideo').src = URL.createObjectURL(blob); $('outVideo').hidden=false; $('outActions').hidden=false; $('outVideo').scrollIntoView({behavior:'smooth', block:'center'});
  hist.push({date:today(), cat:$('cat').value, skin:$('skin').value, lang:$('lang').value, clips:st.basket.map(b=>b.item.name), dur:total}); save('hist', hist.slice(-500)); checkCat();
  prog.textContent = 'Listo: '+name+' ('+(blob.size/1048576).toFixed(1)+' MB · '+(enc?'H.264+'+enc.aMux.toUpperCase()+(mode==='wc-sw'?' (software)':''):'modo compatible')+(ext==='webm'?' · WebM: YouTube lo acepta':'')+')';
  return blob;
}
$('btnRender').onclick = async () => { const b=$('btnRender'); b.disabled=true; try{ await render(); }catch(e){ $('renderProg').textContent=e.message; toast(e.message, 6000); } b.disabled=false; };
function download(blob, name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();}, 120000); }
$('btnDl').onclick = () => st.out && download(st.out, st.outName);
$('btnDriveSave').onclick = async () => { if(!st.out) return; try{ toast('Subiendo a Drive…'); await dUpload(st.out, st.outName, '08_SHORTS_LISTOS'); toast('Guardado en 08_SHORTS_LISTOS ✓'); }catch(e){ toast(e.message, 6000); } };

// ---------------- Portada ----------------
function fillCoverClips(){ $('coverClip').innerHTML = st.basket.map((b,i)=>'<option value="'+i+'">'+esc(b.item.name)+'</option>').join('') || '<option value="">Añade clips al Short primero</option>'; if(!$('coverText').value) $('coverText').value = st.coverText || ''; }
async function makeCover(it, time, frame, text, catKey){
  await document.fonts.load('96px "Luckiest Guy"');
  const v = await loadVideo((await dBlob(it)).url); await seek(v, time);
  const c = $('cvCover'), g = c.getContext('2d'); const cat = CATS[catKey];
  const vw=v.videoWidth, vh=v.videoHeight, ar=W/H; let sw,sh,sxx,syy; if(vw/vh>ar){ sh=vh; sw=vh*ar; sxx=Math.max(0,Math.min(vw-sw, vw*frameX(it.name, frame)-sw/2)); syy=0; } else { sw=vw; sh=vw/ar; sxx=0; syy=(vh-sh)/2; }
  g.drawImage(v, sxx, syy, sw, sh, 0, 0, W, H);
  const grd = g.createRadialGradient(540,520,40,540,520,700); grd.addColorStop(0, cat.color+'cc'); grd.addColorStop(1, cat.color+'00'); g.fillStyle=grd; g.fillRect(0,0,W,H);
  const top = g.createLinearGradient(0,0,0,700); top.addColorStop(0,'rgba(0,0,0,.65)'); top.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=top; g.fillRect(0,0,W,700);
  const bot = g.createLinearGradient(0,1500,0,H); bot.addColorStop(0,'rgba(0,0,0,0)'); bot.addColorStop(1,'rgba(0,0,0,.75)'); g.fillStyle=bot; g.fillRect(0,1500,W,420);
  const words = (text||'').toUpperCase().split(/\s+/).filter(Boolean); const half = Math.ceil(words.length/2);
  const lines = words.length>2 ? [words.slice(0,half).join(' '), words.slice(half).join(' ')] : [words.join(' ')];
  const acc = cat.accent==='#ffffff'?'#ffd400':cat.accent;
  drawOn(g, () => { lines.forEach((l,k)=> txt(l, 540, 250+k*175, 170, k===lines.length-1? acc : '#ffffff', {maxW:1010, rot:-0.035})); txt(S.code, 540, 1800, 84, '#ffd400'); });
  return await new Promise(r=>c.toBlob(r, 'image/jpeg', 0.9));
}
$('btnCover').onclick = async () => {
  const i = $('coverClip').value; if(i==='') return toast('Añade clips al Short primero.');
  try{ st.cover = await makeCover(st.basket[+i].item, +$('coverTime').value||1, st.basket[+i].frame, $('coverText').value, $('cat').value); toast('Portada lista.'); }catch(e){ toast(e.message, 6000); }
};
function drawOn(g, fn){ const keep = cxRef.c; cxRef.c = g; try{ fn(); } finally { cxRef.c = keep; } }
$('btnCoverDl').onclick = () => st.cover ? download(st.cover, (st.outName||today()+'_portada').replace(/\.\w+$/,'')+'_PORTADA.jpg') : toast('Haz la portada primero.');
$('btnCoverDrive').onclick = async () => { if(!st.cover) return toast('Haz la portada primero.'); try{ await dUpload(st.cover, (st.outName||today()+'_portada').replace(/\.\w+$/,'')+'_PORTADA.jpg', '08_SHORTS_LISTOS'); toast('Portada guardada en Drive ✓'); }catch(e){ toast(e.message,6000); } };

// ---------------- Textos de publicación ----------------
function pubTexts(langs){
  const skin = ($('skin').value||'').replace(/_/g,' ').trim();
  const cat = $('cat').value;
  const musicCredit = $('libMusic').value && /MUSICA__/.test(($('libMusic').selectedOptions[0]||{}).text||'') ? '\n\nMusic: '+($('libMusic').selectedOptions[0].text.replace(/^MUSICA__/,'').replace(/\.\w+$/,'').replace(/_/g,' '))+' – Kevin MacLeod (incompetech.com), CC BY 4.0' : '';
  return langs.map(l => {
    const P = window.PZ_PUB[l];
    const baseLang = (l==='es') ? 'es' : 'en';
    const tpls = ((window.PZ_TEMPLATES[baseLang]||{})[cat]||[]).filter(t=>t.needs.every(verified) && (!t.reward || !st.reward || t.reward===st.reward));
    const tp = tpls[st.tplIdx % Math.max(1,tpls.length)] || {title:'', voice:''};
    let titleCore = fill(tp.title);
    if(window.PZ_TITLE_TR[l] && window.PZ_TITLE_TR[l][tp.title]) titleCore = fill(window.PZ_TITLE_TR[l][tp.title]);
    if(l==='es' && $('screenTitle').value && $('lang').value==='es') titleCore = $('screenTitle').value;
    let tc = titleCore.charAt(0)+titleCore.slice(1).toLowerCase(); if(skin) tc = tc.replace(new RegExp(skin.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'), skin.toUpperCase()); tc = tc.replace(/\bfortnite\b/gi,'Fortnite').replace(/\blucky 1v1\b/gi,'LUCKY 1V1');
    const title = (tc + (skin && !titleCore.toUpperCase().includes(skin.toUpperCase())? ' · '+skin : '') + ' 😱 #shorts').slice(0,100);
    const sum = (l===$('lang').value) ? $('voiceText').value : fill(tp.voice);
    const desc = sum + '\n\n🗺️ '+S.mapFull+'\n🔑 '+(l==='es'||l==='pt'?'Código':'Code')+': '+S.code+'\n'+P.how.replace('{CODE}',S.code)+'\n\n'+P.cta+'\n\n'+P.hash+musicCredit;
    const tags = P.tags.replace('{SKINTAG}', skin? skin.toLowerCase()+' fortnite' : 'fortnite skin').slice(0,500);
    const pin = (l==='es'?'🔑 Código del mapa: ':l==='pt'?'🔑 Código do mapa: ':l==='fr'?'🔑 Code de la map : ':'🔑 Map code: ')+S.code;
    return {l, name:P.name, title, desc, tags, pin};
  });
}
function textsToTxt(list){ return list.map(t=>'===== '+t.name+' =====\n\nTÍTULO:\n'+t.title+'\n\nDESCRIPCIÓN:\n'+t.desc+'\n\nETIQUETAS:\n'+t.tags+'\n\nCOMENTARIO FIJADO:\n'+t.pin+'\n').join('\n'); }
$('btnTextos').onclick = () => {
  const langs = [...document.querySelectorAll('.pubLang:checked')].map(x=>x.value);
  const f = (lab, val, rows) => '<div class="copyrow"><label>'+lab+(rows? '<textarea rows="'+rows+'">'+esc(val)+'</textarea>' : '<input value="'+esc(val)+'">')+'</label><button class="ghost cp">Copiar</button></div>';
  $('pubOut').innerHTML = pubTexts(langs).map(t => '<div class="pubblock"><h3>'+esc(t.name)+'</h3>'+f('Título ('+t.title.length+'/100)', t.title)+f('Descripción', t.desc, 7)+f('Etiquetas', t.tags)+f('Comentario fijado', t.pin)+'</div>').join('') + '<p class="hint">Idiomas: en YouTube Studio → Idiomas → Añadir idioma, pega el título y la descripción de cada uno. Revisa siempre que el título describe lo que se ve.</p>';
};
$('pubOut').addEventListener('click', async e => { const b=e.target.closest('.cp'); if(!b) return; const f=b.parentElement.querySelector('input,textarea'); try{ await navigator.clipboard.writeText(f.value); b.textContent='Copiado ✓'; setTimeout(()=>b.textContent='Copiar',1500); }catch(err){ f.select(); toast('Pulsa Ctrl+C para copiar.'); } });

// ---------------- Lote automático del día ----------------
const LOTE_ORDER = ['FREE_SKIN','MACHINE_SKIN','MAP_REWARD','FREE_TOKEN','STREAMER_REACTION','SKIN_BUNDLE','TOP_COMPARISON','MAP_DISCOVERY','PICKAXE_ITEM'];
async function skinPriority(){
  const it = st.lib.find(x=>x.name==='SKINS_PRIORIDAD.txt');
  let list = [];
  if(it){ try{ const t = await (await dBlob(it)).blob.text(); list = [...t.matchAll(/^\s*-\s*([A-Z0-9_]+)/gm)].map(m=>m[1]); }catch(e){} }
  if(!list.length) list = ['LOBO_MUERTE','GATO_CON_BOTAS','TRAVIS_SCOTT','RENEGADA','LUFFY','ALASTOR','CHARLIE','FREDDY_FNAF','CRASH','SILVER','SORA','KIRIKO','GOKU_BLACK','ACE'];
  const have = new Set(skinsWith(/^02_SKINS/));
  const rest = shuffle([...have].filter(k=>!list.includes(k) && !/^SKIN_\d|_Y_/.test(k) && !SIN_NOMBRE.test(k)));
  return [...list.filter(k=>have.has(k)), ...rest];
}
const SIN_NOMBRE = /^(SKIN_\d+|MUNECO_AMARILLO|CARA_AMARILLA|DORADA_OREJAS_GATO|DORADAS|STREAMER.*)$/;
function planLote(n, prio, mainSkin){
  const usedSkins = new Set(hist.filter(h=>h.date===today()).map(h=>h.skin)); const out = [];
  const nextSkin = () => { const k = prio.find(x=>!usedSkins.has(x)); return k || prio[0]; };
  for(const cat of LOTE_ORDER){
    if(out.length>=n) break;
    if(hist.some(h=>h.date===today() && h.cat===cat && h.lang===$('lang').value)) continue;
    let skin = '';
    if(cat==='FREE_SKIN') skin = mainSkin && !usedSkins.has(mainSkin) ? mainSkin : nextSkin();
    if(cat==='MAP_REWARD'){ const withG = skinsWith(/02_SKINS\/Gameplay_con_la_skin/); skin = [mainSkin, ...prio].find(k=>k && withG.includes(k) && !usedSkins.has(k) && !SIN_NOMBRE.test(k)) || ''; }
    else if(cat==='MACHINE_SKIN'){ const withS = skinsWith(/02_SKINS\/Cuando_sale|__(recompensa|sale|desbloque|restaurad)/i); skin = [mainSkin, ...prio].find(k=>k && withS.includes(k) && !usedSkins.has(k) && !SIN_NOMBRE.test(k)) || ''; if(!skin) continue; }
    else if(cat==='PICKAXE_ITEM'){ const p = shuffle(vids().filter(x=>/__pico/i.test(x.name) && /^02_SKINS/.test(x.folder)))[0]; if(!p) continue; skin = skinOf(p.name); }
    else if(cat==='STREAMER_REACTION'){ const withR = skinsWith(/^03_REACCIONES\/Videos/).filter(k=>!usedSkins.has(k) && !SIN_NOMBRE.test(k)); skin = prio.find(k=>withR.includes(k)) || shuffle(withR)[0]; if(!skin) continue; }
    const r = clipsFor(cat, skin);
    if(r.clips.length < (cat==='MAP_DISCOVERY'?2:2)) continue;
    if(r.skin && r.skin!=='TOKEN') usedSkins.add(r.skin);
    out.push({cat, skin: r.skin==='TOKEN' ? '' : (r.skin||''), basket:r.clips, reward:r.reward||null});
  }
  return out;
}
function loteLog(msg, cls){ const li=document.createElement('li'); li.textContent=msg; if(cls) li.className=cls; $('loteLog').appendChild(li); li.scrollIntoView({block:'nearest'}); return li; }
$('btnLote').onclick = async () => {
  const b=$('btnLote'); b.disabled=true; $('loteLog').innerHTML='';
  try{
    if(!st.lib.length || st.lib.some(x=>x.src==='drive')){ loteLog('Leyendo tu biblioteca de Drive (con lo último que hayas subido)…'); await new Promise(async (res,rej)=>{ try{ const root = await dFindFolder(S.root); if(!root) throw new Error('No encuentro la carpeta "'+S.root+'" en tu Drive.'); st.lib = st.lib.filter(x=>x.src==='local'); st.folderIds={'':root}; await dWalk(root,''); renderLib(); res(); }catch(e){ rej(e); } }); }
    const prio = await skinPriority();
    const main = ($('loteSkin').value||'').trim().toUpperCase().replace(/\s+/g,'_') || prio[0];
    const jobs = planLote(+$('loteN').value, prio, main);
    if(!jobs.length) throw new Error('Hoy ya están hechos todos los formatos posibles en este idioma.');
    loteLog('Plan: '+jobs.map(j=>CATS[j.cat].label+(j.skin?' ('+j.skin+')':'')).join(' · '));
    if(!S.el) loteLog('Sin clave de ElevenLabs: los Shorts saldrán sin voz.', 'bad');
    const done = [];
    for(const [k,j] of jobs.entries()){
      const li = loteLog((k+1)+'/'+jobs.length+' · '+CATS[j.cat].label+(j.skin?' · '+j.skin:'')+' — preparando…');
      try{
        $('cat').value = j.cat; $('skin').value = j.skin; st.basket = j.basket; st.reward = j.reward; renderBasket();
        $('libMusic').value = ''; st.tplIdx = Math.floor(Math.random()*5); makeScript(false);
        st.voice=null; st.words=[];
        if(S.el){ li.textContent = li.textContent.replace(/—.*$/,'— voz…'); const voice = $('lang').value==='en'?S.voiceEn:S.voiceEs; const r = await ttsWithTimestamps($('voiceText').value.trim(), voice); st.voice=r.blob; st.words=r.words; }
        li.textContent = li.textContent.replace(/—.*$/,'— montando (no cambies de pestaña)…');
        const blob = await render();
        const name = st.outName, baseName = name.replace(/\.\w+$/,'');
        li.textContent = li.textContent.replace(/—.*$/,'— portada y textos…');
        const ci = j.cat==='MAP_REWARD' ? j.basket.length-1 : j.basket.findIndex(x=>/02_SKINS|REACCION/.test(x.item.folder+x.item.name)); const cb = j.basket[Math.max(0,ci)];
        const cover = await makeCover(cb.item, 2, cb.frame, st.coverText || $('screenTitle').value, j.cat);
        const texts = textsToTxt(pubTexts(['es','en','pt','fr']));
        if($('loteDrive').checked){ li.textContent = li.textContent.replace(/—.*$/,'— subiendo a Drive…');
          await dUpload(blob, name, '08_SHORTS_LISTOS'); await dUpload(cover, baseName+'_PORTADA.jpg', '08_SHORTS_LISTOS'); await dUpload(new Blob([texts],{type:'text/plain'}), baseName+'_TEXTOS.txt', '08_SHORTS_LISTOS'); }
        li.textContent = (k+1)+'/'+jobs.length+' ✓ '+name; li.className='ok';
        [[blob,name,'vídeo'],[cover,baseName+'_PORTADA.jpg','portada'],[new Blob([texts],{type:'text/plain'}),baseName+'_TEXTOS.txt','textos']].forEach(([bl,nm,lab])=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(bl); a.download=nm; a.textContent=lab; li.appendChild(a); });
        const pv = document.createElement('video'); pv.src = URL.createObjectURL(blob); pv.controls = true; pv.className='lotevid'; li.appendChild(pv);
        done.push(name);
      }catch(e){ li.textContent = (k+1)+'/'+jobs.length+' ✗ '+CATS[j.cat].label+': '+e.message; li.className='bad'; }
    }
    loteLog('Terminado: '+done.length+' de '+jobs.length+' Shorts'+($('loteDrive').checked?' guardados en 08_SHORTS_LISTOS.':'.'), done.length?'ok':'bad');
  }catch(e){ loteLog(e.message, 'bad'); }
  b.disabled=false;
};

renderBasket(); setStatus();
window.PZ_DEBUG = { st, S, render, plan, planMachine, addToBasket, renderLib, planLote, skinPriority };
})();
