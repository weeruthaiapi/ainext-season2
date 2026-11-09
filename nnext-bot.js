/* =====================================================================
 * N'NEXT — AI NEXT Season 2 guide bot
 * Mini-bot ใส่ Visor ดำเงา + เส้นเลเซอร์ส้ม + หูฟัง LED วงแหวนส้ม (จาก Key Visual)
 *
 *   NNext.say(html, {mood:'happy', hold:6000})   พูด (bubble) + เปลี่ยนสีหน้าชั่วคราว
 *   NNext.mood('idle'|'scanning'|'happy'|'dj')   ตั้งสีหน้า "พื้นฐาน"
 *   NNext.busy('กำลังบันทึก…') / NNext.done()     โหมดสแกน + กันกดซ้ำ ระหว่างเรียก API
 *   NNext.setTips(arrayOrFn)                      ทิปที่วนเมื่อแตะน้องบอท
 * ===================================================================== */
(function () {
  var css = `
  .nn-dock{ position:fixed; right:max(12px, env(safe-area-inset-right)); bottom:max(12px, env(safe-area-inset-bottom)); z-index:80;
    display:flex; align-items:flex-end; gap:10px; pointer-events:none; max-width:calc(100vw - 24px); }
  .nn-bubble{ pointer-events:auto; max-width:min(300px, calc(100vw - 110px)); cursor:pointer;
    background:rgba(17,9,6,.93); border:1px solid rgba(255,165,70,.65); border-radius:18px 18px 4px 18px;
    padding:11px 14px 12px; color:#fff; font-size:13.5px; line-height:1.5; font-family:'IBM Plex Sans Thai',sans-serif;
    box-shadow:0 10px 30px rgba(0,0,0,.5), 0 0 16px rgba(255,122,0,.25);
    backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    transform-origin:100% 100%; transition:opacity .25s ease, transform .25s ease; margin-bottom:22px; }
  .nn-bubble.hide{ opacity:0; transform:translateY(8px) scale(.92); pointer-events:none; }
  .nn-bubble .nn-name{ display:flex; justify-content:space-between; gap:10px; font-family:'Chakra Petch',sans-serif; font-size:10.5px; font-weight:700;
    letter-spacing:.14em; color:#FFD166; text-transform:uppercase; margin-bottom:3px; }
  .nn-bubble .nn-name i{ font-style:normal; opacity:.6; letter-spacing:.04em; font-weight:600; }
  .nn-bubble b{ color:#FFD166; font-weight:600; }
  .nn-avatar{ pointer-events:auto; position:relative; width:76px; height:76px; flex-shrink:0; cursor:pointer;
    animation:nn-float 3.2s ease-in-out infinite; filter:drop-shadow(0 8px 16px rgba(0,0,0,.5)); }
  .nn-avatar:active{ transform:scale(.92); }
  .nn-avatar svg{ width:100%; height:100%; overflow:visible; }
  @keyframes nn-float{ 0%,100%{ transform:translateY(0) rotate(0); } 50%{ transform:translateY(-7px) rotate(2deg); } }
  .nn-avatar.happy{ animation:nn-hop .5s ease 2, nn-float 3.2s ease-in-out 1s infinite; }
  @keyframes nn-hop{ 0%,100%{ transform:translateY(0); } 40%{ transform:translateY(-14px) rotate(-4deg); } }
  .nn-avatar.dj{ animation:nn-bob .55s ease-in-out infinite; }
  @keyframes nn-bob{ 0%,100%{ transform:translateY(0) rotate(-3deg); } 50%{ transform:translateY(-4px) rotate(3deg); } }

  /* visor expressions */
  .nn-x{ opacity:0; transition:opacity .2s; }
  .nn-avatar.idle .nn-x-idle, .nn-avatar.dj .nn-x-idle, .nn-avatar.scanning .nn-x-scan, .nn-avatar.happy .nn-x-happy{ opacity:1; }
  .nn-x-idle rect{ animation:nn-pulse 1.8s ease-in-out infinite; }
  @keyframes nn-pulse{ 0%,100%{ opacity:.75; } 50%{ opacity:1; } }
  .nn-scan-dot{ transform-box:fill-box; transform-origin:center; animation:nn-sweep 1.1s ease-in-out infinite alternate; }
  @keyframes nn-sweep{ from{ transform:translateX(-28px); } to{ transform:translateX(28px); } }
  .nn-hp{ animation:nn-hp 1.8s ease-in-out infinite; }
  @keyframes nn-hp{ 0%,100%{ stroke-opacity:.65; } 50%{ stroke-opacity:1; } }
  .nn-avatar.dj .nn-hp, .nn-avatar.happy .nn-hp{ animation-duration:.55s; }

  /* dj notes */
  .nn-note{ position:absolute; font-size:16px; color:#FFD166; text-shadow:0 0 8px #FF7A00; pointer-events:none; opacity:0; }
  .nn-avatar.dj .nn-note{ animation:nn-note 2.2s ease-out infinite; }
  .nn-note.n1{ left:-4px; top:22px; } .nn-note.n2{ right:-6px; top:18px; animation-delay:.7s!important; } .nn-note.n3{ left:2px; top:30px; animation-delay:1.4s!important; }
  @keyframes nn-note{ 0%{ opacity:0; transform:translate(0,0) rotate(0); } 15%{ opacity:1; } 100%{ opacity:0; transform:translate(-14px,-46px) rotate(-18deg); } }
  .nn-note.n2{ animation-name:nn-note2!important; }
  @keyframes nn-note2{ 0%{ opacity:0; transform:translate(0,0); } 15%{ opacity:1; } 100%{ opacity:0; transform:translate(14px,-46px) rotate(18deg); } }

  .nn-block{ position:fixed; inset:0; z-index:79; background:rgba(17,9,6,.28); backdrop-filter:blur(2px); -webkit-backdrop-filter:blur(2px); display:none; }
  .nn-block.on{ display:block; }
  @media (prefers-reduced-motion:reduce){ .nn-avatar, .nn-note, .nn-scan-dot{ animation:none!important; } }
  `;

  var svg = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <defs>
      <linearGradient id="nnVisor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2216"/><stop offset=".45" stop-color="#0A0503"/><stop offset="1" stop-color="#1F0D07"/></linearGradient>
      <linearGradient id="nnLaser" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF5500" stop-opacity=".2"/><stop offset=".2" stop-color="#FF6D00"/><stop offset=".5" stop-color="#FFF3D1"/><stop offset=".8" stop-color="#FF6D00"/><stop offset="1" stop-color="#FF5500" stop-opacity=".2"/></linearGradient>
      <radialGradient id="nnFace" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFE2C6"/></radialGradient>
      <filter id="nnGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <!-- antenna -->
    <line x1="60" y1="22" x2="60" y2="12" stroke="#1A0E0A" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="10" r="4" fill="#FF7A00" filter="url(#nnGlow)"/>
    <!-- headband -->
    <path d="M 20 60 A 40 40 0 0 1 100 60" fill="none" stroke="#120905" stroke-width="7" stroke-linecap="round"/>
    <path d="M 26 52 A 36 36 0 0 1 94 52" fill="none" stroke="#FF7A00" stroke-width="1.4" stroke-opacity=".7"/>
    <!-- head -->
    <rect x="24" y="28" width="72" height="64" rx="30" fill="url(#nnFace)" stroke="#FF9E44" stroke-width="2"/>
    <!-- visor (glossy obsidian) -->
    <rect x="19" y="42" width="82" height="30" rx="15" fill="url(#nnVisor)" stroke="#FF851B" stroke-width="1.4"/>
    <path d="M 28 46 Q 60 40 92 46" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2" stroke-linecap="round"/>
    <!-- expressions -->
    <g class="nn-x nn-x-idle" filter="url(#nnGlow)"><rect x="25" y="55" width="70" height="4.6" rx="2.3" fill="url(#nnLaser)"/></g>
    <g class="nn-x nn-x-scan">
      <rect x="25" y="55.5" width="70" height="3" rx="1.5" fill="#FF5500" opacity=".35"/>
      <circle class="nn-scan-dot" cx="60" cy="57" r="4.6" fill="#FFF3D1" filter="url(#nnGlow)"/>
    </g>
    <g class="nn-x nn-x-happy" filter="url(#nnGlow)" fill="none" stroke="#FFE6B3" stroke-width="3.6" stroke-linecap="round">
      <path d="M 38 61 Q 45 50 52 61"/><path d="M 68 61 Q 75 50 82 61"/>
    </g>
    <!-- headphones with LED rings -->
    <rect x="7" y="47" width="19" height="32" rx="9.5" fill="#120905" stroke="#FF7A00" stroke-width="2"/>
    <circle class="nn-hp" cx="16.5" cy="63" r="6" fill="none" stroke="#FFB703" stroke-width="2.4" filter="url(#nnGlow)"/>
    <rect x="94" y="47" width="19" height="32" rx="9.5" fill="#120905" stroke="#FF7A00" stroke-width="2"/>
    <circle class="nn-hp" cx="103.5" cy="63" r="6" fill="none" stroke="#FFB703" stroke-width="2.4" filter="url(#nnGlow)"/>
    <!-- cheeks + smile -->
    <ellipse cx="38" cy="80" rx="5" ry="2.6" fill="#FF6B4A" opacity=".5"/>
    <ellipse cx="82" cy="80" rx="5" ry="2.6" fill="#FF6B4A" opacity=".5"/>
    <path d="M 53 80 Q 60 86.5 67 80" fill="none" stroke="#5A2210" stroke-width="2.6" stroke-linecap="round"/>
    <!-- collar (obsidian turtleneck) -->
    <path d="M 40 92 Q 60 100 80 92 L 78 104 Q 60 110 42 104 Z" fill="#110906" stroke="#FF7A00" stroke-width="1.2" stroke-opacity=".7"/>
  </svg>`;

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var block = document.createElement('div'); block.className = 'nn-block'; document.body.appendChild(block);
  var dock = document.createElement('div'); dock.className = 'nn-dock';
  dock.innerHTML = '<div class="nn-bubble hide" role="status" aria-live="polite"><div class="nn-name"><span>N\'NEXT · AI GUIDE</span><i>แตะน้องเพื่อดูทิป ▸</i></div><div class="nn-text"></div></div>'
    + '<div class="nn-avatar idle" title="แตะน้อง N\'NEXT" role="button" aria-label="N\'NEXT guide bot">' + svg
    + '<span class="nn-note n1">♪</span><span class="nn-note n2">♫</span><span class="nn-note n3">♪</span></div>';
  document.body.appendChild(dock);

  var bubble = dock.querySelector('.nn-bubble'), text = dock.querySelector('.nn-text'), avatar = dock.querySelector('.nn-avatar');
  var baseMood = 'idle', hideT = null, moodT = null, tips = [], tipIdx = -1, busyCount = 0;

  function applyMood(m) { avatar.className = 'nn-avatar ' + m; }
  function mood(m) { baseMood = m || 'idle'; if (!busyCount) applyMood(baseMood); }
  function say(html, opt) {
    opt = opt || {};
    text.innerHTML = html; bubble.classList.remove('hide');
    clearTimeout(hideT); clearTimeout(moodT);
    if (opt.mood && !busyCount) { applyMood(opt.mood); if (opt.mood !== baseMood) moodT = setTimeout(function () { if (!busyCount) applyMood(baseMood); }, opt.moodMs || 2600); }
    var hold = opt.hold == null ? 6500 : opt.hold;
    if (hold > 0) hideT = setTimeout(hide, hold);
  }
  function hide() { bubble.classList.add('hide'); }
  function busy(msg) { busyCount++; block.classList.add('on'); applyMood('scanning'); clearTimeout(moodT); say('<span style="opacity:.9">🔎 ' + (msg || 'กำลังประมวลผล…') + '</span>', { hold: 0 }); }
  function done(msg, m) { busyCount = Math.max(0, busyCount - 1); if (busyCount) return; block.classList.remove('on'); applyMood(baseMood); if (msg) say(msg, { mood: m || 'happy' }); else hide(); }
  function setTips(t) { tips = t; tipIdx = -1; }
  function nextTip() {
    var list = typeof tips === 'function' ? tips() : tips; if (!list || !list.length) return;
    tipIdx = (tipIdx + 1) % list.length; var t = list[tipIdx];
    say(typeof t === 'string' ? t : t.text, { mood: (t && t.mood) || 'happy', hold: 8000 });
  }
  avatar.addEventListener('click', function () { if (busyCount) return; if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) { } nextTip(); });
  bubble.addEventListener('click', hide);

  window.NNext = { say: say, hide: hide, mood: mood, busy: busy, done: done, setTips: setTips, nextTip: nextTip, el: dock };
})();
