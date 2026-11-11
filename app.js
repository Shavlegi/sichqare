/* სიჩქარე v2 — ინტერნეტის სიჩქარის ტესტი.
   იზომება Cloudflare-ის უახლოესი სერვერის (speed.cloudflare.com) წინააღმდეგ.
   საჯარო endpoint-ები, გასაღები არ სჭირდება.
   v2: ისტორია, შეფასება, IP/პროვაიდერი, ცოცხალი გრაფიკი, ფერები,
   სწრაფი/სრული რეჟიმი, PWA. */
'use strict';

var DOWN_BASE = 'https://speed.cloudflare.com/__down';
var UP_URL = 'https://speed.cloudflare.com/__up';
var DOWNLOAD_CHUNK = 25000000; /* __down 100 MB-ზე 403-ს აბრუნებს */

var MODES = {
  quick: { downSec: 5, upSec: 5, downStreams: 2, upStreams: 2, hint: 'სწრაფი ტესტი დაახლოებით 40 MB ინტერნეტს მოიხმარს — ჯობია Wi-Fi-ზე გაუშვა.' },
  full: { downSec: 10, upSec: 10, downStreams: 4, upStreams: 3, hint: 'სრული ტესტი დაახლოებით 100 MB ინტერნეტს მოიხმარს — ჯობია Wi-Fi-ზე გაუშვა.' }
};
var mode = 'full';

var $ = function (id) { return document.getElementById(id); };
var bigSpeed = $('bigSpeed'), statusText = $('statusText'), verdictEl = $('verdict'),
    startBtn = $('startBtn'), resDown = $('resDown'), resUp = $('resUp'), resPing = $('resPing'),
    resDownMB = $('resDownMB'), resUpMB = $('resUpMB'), resJitter = $('resJitter'),
    serverInfo = $('serverInfo'), netInfo = $('netInfo'), shareBtn = $('shareBtn'),
    hintText = $('hintText'), graphCanvas = $('graph'),
    historySection = $('historySection'), historyList = $('historyList');

var running = false, stopFlag = false, aborters = [];
var lastResult = null, usedBytes = 0;
var net = { ip: null, asn: null, isp: null, city: null, country: null, server: null };
var graphSamples = []; /* {t, v, phase} — t წამებში ფაზის დაწყებიდან */

function fmt(n, d) { return n.toFixed(d === undefined ? 1 : d); }
function mbps(bytes, seconds) { return (bytes * 8) / seconds / 1e6; }
function mbs(bytes, seconds) { return bytes / seconds / 1e6; }
function setStatus(t) { statusText.textContent = t; }
function setBig(v) { bigSpeed.textContent = v; }

/* ---- შეფასება: რას ჰყოფნის სიჩქარე (2) ---- */
function verdictFor(down, ping) {
  var parts = [];
  if (down >= 100) parts.push('შესანიშნავი სიჩქარე — 4K ვიდეო, დიდი ფაილები, ყველაფერი თავისუფლად.');
  else if (down >= 50) parts.push('კარგი სიჩქარე — 4K ვიდეო და ვიდეოზარები უპრობლემოდ.');
  else if (down >= 25) parts.push('საშუალო სიჩქარე — Full HD ვიდეო კარგად იმუშავებს, 4K შეიძლება გაჭედოს.');
  else if (down >= 10) parts.push('ნელი სიჩქარე — YouTube 720p-ზე, დიდი ფაილები ნელა ჩაიტვირთება.');
  else parts.push('ძალიან ნელი — მხოლოდ მიმოწერა და მსუბუქი გვერდები.');
  if (ping != null) {
    if (ping <= 30) parts.push('Ping დაბალია — ონლაინ თამაშებისთვის კარგია.');
    else if (ping <= 80) parts.push('Ping საშუალოა — თამაშში მცირე დაყოვნება იგრძნობა.');
    else parts.push('Ping მაღალია — თამაშები და ვიდეოზარები გაჭედავს.');
  }
  return parts.join(' ');
}

/* ფერი შედეგის მიხედვით (5): >=50 მწვანე, >=10 ყვითელი, <10 წითელი */
function rateClass(v) { return v >= 50 ? 'good' : (v >= 10 ? 'mid' : 'bad'); }
function colorBig(v) {
  bigSpeed.classList.remove('good', 'mid', 'bad');
  if (v != null && isFinite(v)) bigSpeed.classList.add(rateClass(v));
}

/* ---- ცოცხალი გრაფიკი (4) ---- */
function drawGraph() {
  var ctx = graphCanvas.getContext('2d');
  var W = graphCanvas.width, H = graphCanvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = '#232323'; ctx.lineWidth = 1;
  for (var g = 1; g < 4; g++) {
    ctx.beginPath(); ctx.moveTo(0, H * g / 4); ctx.lineTo(W, H * g / 4); ctx.stroke();
  }
  if (!graphSamples.length) return;
  var maxV = 10;
  graphSamples.forEach(function (s) { if (s.v > maxV) maxV = s.v; });
  var maxT = 0;
  graphSamples.forEach(function (s) { if (s.t > maxT) maxT = s.t; });
  if (maxT < 1) maxT = 1;
  function line(phase, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
    var started = false;
    graphSamples.forEach(function (s) {
      if (s.phase !== phase) return;
      var x = (s.t / maxT) * (W - 8) + 4;
      var y = H - 6 - (s.v / maxV) * (H - 14);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  line('down', '#4d8dff');
  line('up', '#3ddc84');
}
function graphPush(t, v, phase) {
  graphSamples.push({ t: t, v: v, phase: phase });
  if (graphSamples.length > 400) graphSamples.shift();
  drawGraph();
}

/* ---- ისტორია, localStorage (1) ---- */
var HISTORY_KEY = 'sichqare-history-v1';
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (e) { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20))); } catch (e) {}
}
function renderHistory() {
  var h = loadHistory();
  historySection.hidden = !h.length;
  historyList.innerHTML = '';
  h.forEach(function (r) {
    var li = document.createElement('li');
    var d = new Date(r.t);
    var when = d.toLocaleDateString('ka-GE', { day: 'numeric', month: 'short' }) +
      ', ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    var vals = '↓ ' + fmt(r.down) + ' · ↑ ' + fmt(r.up) + ' · ' + fmt(r.ping, 0) + ' ms';
    var w = document.createElement('span'); w.className = 'when'; w.textContent = when;
    var v = document.createElement('span'); v.textContent = vals;
    li.appendChild(v); li.appendChild(w);
    historyList.appendChild(li);
  });
}
function addHistory(r) {
  var h = loadHistory();
  h.unshift({ t: Date.now(), down: r.down, up: r.up, ping: r.ping });
  saveHistory(h);
  renderHistory();
}
$('clearHistory').addEventListener('click', function () {
  saveHistory([]);
  renderHistory();
});

/* ---- ქსელის ინფო: IP / პროვაიდერი / ქალაქი (3) ---- */
function renderNet() {
  var parts = [];
  if (net.ip) parts.push('IP: ' + net.ip);
  if (net.isp) parts.push('პროვაიდერი: ' + net.isp);
  else if (net.asn) parts.push(net.asn);
  if (net.city) parts.push(net.city + (net.country ? ', ' + net.country : ''));
  netInfo.textContent = parts.join(' · ');
  if (net.server) serverInfo.textContent = 'სერვერი: ' + net.server;
}
function captureNet(res) {
  if (!res.headers) return;
  var g = function (a, b) { return res.headers.get(a) || (b ? res.headers.get(b) : null); };
  if (!net.ip) net.ip = g('cf-meta-ip');
  if (!net.asn) net.asn = g('cf-meta-asn');
  if (!net.city) net.city = g('cf-meta-city', 'city');
  if (!net.country) net.country = g('cf-meta-country', 'country');
  var colo = g('cf-meta-colo', 'colo');
  if (!net.server && (net.city || colo)) net.server = [net.city, net.country].filter(Boolean).join(', ') || colo;
  renderNet();
  if (net.ip && !net.isp) fetchIsp(net.ip);
}
function fetchIsp(ip) {
  var ctrl = new AbortController();
  var to = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 4000);
  fetch('https://ip-api.com/json/' + encodeURIComponent(ip) + '?fields=status,isp', { signal: ctrl.signal })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      clearTimeout(to);
      if (j && j.status === 'success' && j.isp) { net.isp = j.isp; renderNet(); }
    })
    .catch(function () { clearTimeout(to); });
}

/* ---- Ping ---- */
async function measurePing() {
  try { await fetch(DOWN_BASE + '?bytes=0', { cache: 'no-store' }); } catch (e) {}
  var samples = [];
  for (var i = 0; i < 5; i++) {
    if (stopFlag) break;
    var t0 = performance.now();
    await fetch(DOWN_BASE + '?bytes=0', { cache: 'no-store' });
    samples.push(performance.now() - t0);
  }
  if (!samples.length) throw new Error('ping failed');
  var ping = Math.min.apply(null, samples);
  var diffs = 0;
  for (var j = 1; j < samples.length; j++) diffs += Math.abs(samples[j] - samples[j - 1]);
  var jitter = samples.length > 1 ? diffs / (samples.length - 1) : 0;
  return { ping: ping, jitter: jitter };
}

/* ---- Download ---- */
async function downloadStream(url, signal, counter, deadline) {
  while (performance.now() < deadline && !stopFlag) {
    var res;
    try {
      res = await fetch(url, { cache: 'no-store', signal: signal });
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      throw err;
    }
    if (!res.ok) throw new Error('download failed: ' + res.status);
    captureNet(res);
    var reader = res.body.getReader();
    try {
      for (;;) {
        var r = await reader.read();
        if (r.done) break;
        counter.bytes += r.value.byteLength;
        if (performance.now() >= deadline) { try { await reader.cancel(); } catch (e) {} break; }
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      throw err;
    }
  }
}

async function measureDownload(onTick) {
  var cfg = MODES[mode];
  var counter = { bytes: 0 };
  var ctrl = new AbortController();
  aborters.push(ctrl);
  var start = performance.now();
  var deadline = start + cfg.downSec * 1000;
  var timer = setInterval(function () {
    var elapsed = (performance.now() - start) / 1000;
    if (elapsed > 0.3) {
      var v = mbps(counter.bytes, elapsed);
      onTick(v);
      graphPush(elapsed, v, 'down');
    }
  }, 200);
  var streams = [];
  for (var i = 0; i < cfg.downStreams; i++) {
    streams.push(downloadStream(DOWN_BASE + '?bytes=' + DOWNLOAD_CHUNK, ctrl.signal, counter, deadline));
  }
  var stopTimer = setTimeout(function () { ctrl.abort(); }, cfg.downSec * 1000 + 500);
  try {
    await Promise.all(streams);
  } finally {
    clearTimeout(stopTimer);
    clearInterval(timer);
  }
  var seconds = (performance.now() - start) / 1000;
  usedBytes += counter.bytes;
  return { speed: mbps(counter.bytes, seconds) };
}

/* ---- Upload (XHR progress) ---- */
var upBlob = null;
function getUpData() {
  if (upBlob) return upBlob;
  var buf = new Uint8Array(10 * 1024 * 1024);
  crypto.getRandomValues(buf);
  upBlob = new Blob([buf]);
  return upBlob;
}

function uploadStream(counter, ms) {
  return new Promise(function (resolve) {
    var done = false;
    var finish = function (ok) { if (!done) { done = true; resolve(ok); } };
    var xhr = new XMLHttpRequest();
    var last = 0;
    xhr.open('POST', UP_URL, true);
    xhr.upload.onprogress = function (e) {
      if (e.loaded > last) { counter.bytes += (e.loaded - last); last = e.loaded; }
    };
    xhr.onload = function () { finish(xhr.status >= 200 && xhr.status < 300); };
    xhr.onerror = function () { finish(false); };
    xhr.onabort = function () { finish(true); };
    try { xhr.send(getUpData()); } catch (e) { finish(false); return; }
    setTimeout(function () { try { xhr.abort(); } catch (e) {} finish(true); }, ms);
  });
}

async function measureUpload(onTick) {
  var cfg = MODES[mode];
  var counter = { bytes: 0 };
  var start = performance.now();
  var timer = setInterval(function () {
    var elapsed = (performance.now() - start) / 1000;
    if (elapsed > 0.3) {
      var v = mbps(counter.bytes, elapsed);
      onTick(v);
      graphPush(elapsed, v, 'up');
    }
  }, 200);
  var streams = [];
  for (var i = 0; i < cfg.upStreams; i++) {
    streams.push(uploadStream(counter, cfg.upSec * 1000));
  }
  await Promise.all(streams);
  clearInterval(timer);
  var seconds = (performance.now() - start) / 1000;
  usedBytes += counter.bytes;
  return { speed: mbps(counter.bytes, seconds) };
}

/* ---- რეჟიმის არჩევა (5) ---- */
function setMode(m) {
  mode = m;
  $('modeQuick').classList.toggle('active', m === 'quick');
  $('modeFull').classList.toggle('active', m === 'full');
  hintText.textContent = MODES[m].hint;
}
$('modeQuick').addEventListener('click', function () { if (!running) setMode('quick'); });
$('modeFull').addEventListener('click', function () { if (!running) setMode('full'); });

/* ---- მთავარი პროცესი ---- */
async function runTest() {
  if (running) return;
  running = true; stopFlag = false; aborters = []; usedBytes = 0; lastResult = null;
  graphSamples = []; drawGraph();
  colorBig(null);
  startBtn.textContent = 'გაჩერება';
  startBtn.classList.add('stop');
  shareBtn.hidden = true;
  verdictEl.textContent = '';
  resDown.textContent = '—'; resUp.textContent = '—'; resPing.textContent = '—';
  resDownMB.textContent = ''; resUpMB.textContent = ''; resJitter.textContent = '';
  try {
    setStatus('Ping იზომება…');
    var ping = await measurePing();
    if (stopFlag) throw new Error('stopped');
    resPing.textContent = fmt(ping.ping, 0);
    resJitter.textContent = 'Jitter ' + fmt(ping.jitter, 0) + ' ms';
    lastResult = { ping: ping.ping };

    setStatus('ჩამოტვირთვა იზომება…');
    var down = await measureDownload(function (v) { setBig(fmt(v)); colorBig(v); });
    if (stopFlag) throw new Error('stopped');
    resDown.textContent = fmt(down.speed);
    resDownMB.textContent = fmt(mbs(down.speed * 1e6 / 8, 1), 1) + ' MB/წმ';
    setBig(fmt(down.speed)); colorBig(down.speed);
    verdictEl.textContent = verdictFor(down.speed, ping.ping);
    lastResult.down = down.speed;

    setStatus('ატვირთვა იზომება…');
    var up = await measureUpload(function (v) { setBig(fmt(v)); });
    if (stopFlag) throw new Error('stopped');
    resUp.textContent = fmt(up.speed);
    resUpMB.textContent = fmt(mbs(up.speed * 1e6 / 8, 1), 1) + ' MB/წმ';
    setBig(fmt(down.speed)); colorBig(down.speed);
    lastResult.up = up.speed;

    setStatus('მზადაა · მოხმარებული მონაცემები: ~' + Math.round(usedBytes / 1e6) + ' MB');
    addHistory(lastResult);
    shareBtn.hidden = false;
  } catch (err) {
    if (err && err.message === 'stopped') {
      setStatus('ტესტი შეჩერებულია');
      setBig('—'); colorBig(null);
    } else {
      setStatus('ტესტი ვერ ჩატარდა — შეამოწმე ინტერნეტი და სცადე თავიდან.');
      setBig('—'); colorBig(null);
    }
  } finally {
    running = false;
    startBtn.textContent = 'თავიდან ტესტი';
    startBtn.classList.remove('stop');
  }
}

startBtn.addEventListener('click', function () {
  if (running) {
    stopFlag = true;
    aborters.forEach(function (c) { try { c.abort(); } catch (e) {} });
    return;
  }
  runTest();
});

shareBtn.addEventListener('click', function () {
  if (!lastResult) return;
  var text = 'ჩემი ინტერნეტი: ↓ ' + fmt(lastResult.down || 0) + ' Mbps, ↑ ' +
    fmt(lastResult.up || 0) + ' Mbps, Ping ' + fmt(lastResult.ping || 0, 0) +
    ' ms — გაზომილია სიჩქარე-თ';
  function done() { shareBtn.textContent = 'კოპირებულია ✓'; setTimeout(function () { shareBtn.textContent = 'შედეგის კოპირება'; }, 2000); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, done);
  } else {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); done();
  }
});

/* ---- PWA (6): service worker ---- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}

renderHistory();
drawGraph();
